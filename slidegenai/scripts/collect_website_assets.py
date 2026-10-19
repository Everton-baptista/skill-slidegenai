#!/usr/bin/env python3
"""Collect public page/CSS image candidates and optionally save selected original bytes.

Python 3.9+, standard library. Does not render, execute JavaScript, certify rights,
install fonts, upload assets or edit slides. Output must be a new working directory.
"""
import argparse
import base64
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from urllib.parse import unquote_to_bytes, urldefrag, urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

CSS_URL = re.compile(r'url\(\s*[\'\"]?([^\'\")]+)[\'\"]?\s*\)', re.I)
MAX_BYTES = 12 * 1024 * 1024


def web_url(url):
    parts = urlsplit(url)
    if parts.scheme not in ('https', 'http') or not parts.hostname or parts.username is not None or parts.password is not None:
        raise ValueError('Use an HTTP(S) URL without embedded credentials.')
    return urldefrag(url)[0]


class Reader(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.base = None
        self.images = []
        self.styles = []
        self.in_style = False
        self.css = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'base' and not self.base:
            self.base = a.get('href')
        if tag == 'link' and 'stylesheet' in (a.get('rel') or '').lower().split() and a.get('href'):
            self.styles.append(a['href'])
        hint = ' '.join(a.get(k, '') or '' for k in ('alt', 'title', 'class', 'id'))[:240]
        if tag in ('img', 'source', 'image'):
            for key in ('src', 'data-src', 'data-lazy-src', 'data-original', 'href', 'xlink:href'):
                if a.get(key):
                    self.images.append((a[key], hint))
            for key in ('srcset', 'data-srcset'):
                # Preserve data-URL commas; external responsive candidates split normally.
                value = a.get(key, '') or ''
                if not value.lstrip().startswith('data:'):
                    self.images.extend((part.strip().split()[0], hint) for part in value.split(',') if part.strip())
        if tag == 'meta' and (a.get('property') or a.get('name') or '').lower() in ('og:image', 'og:image:url', 'twitter:image') and a.get('content'):
            self.images.append((a['content'], 'social preview'))
        for target in CSS_URL.findall(a.get('style', '') or ''):
            self.images.append((target.strip(), hint + ' inline background'))
        if tag == 'style':
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False

    def handle_data(self, value):
        if self.in_style:
            self.css.append(value)


def image_type(data):
    if data.startswith(b'\x89PNG\r\n\x1a\n'): return 'png'
    if data.startswith(b'\xff\xd8\xff'): return 'jpg'
    if data.startswith((b'GIF87a', b'GIF89a')): return 'gif'
    if data.startswith(b'RIFF') and data[8:12] == b'WEBP': return 'webp'
    if re.search(br'<svg\b', data[:4096], re.I):
        try:
            if ET.fromstring(data).tag.split('}')[-1] == 'svg': return 'svg'
        except ET.ParseError:
            pass
    raise ValueError('Response is not a supported image signature (PNG/JPEG/GIF/WebP/SVG).')


def inline_image(url):
    header, value = url.split(',', 1)
    if not header.lower().startswith('data:image/') or len(value) > MAX_BYTES * 2:
        raise ValueError('Unsupported or oversized inline image.')
    data = base64.b64decode(value, validate=True) if ';base64' in header.lower() else unquote_to_bytes(value)
    if len(data) > MAX_BYTES: raise ValueError('Image exceeds the size limit.')
    image_type(data)
    return data


def make_fetch(hosts):
    def permitted(url):
        clean = web_url(url)
        if urlsplit(clean).hostname.lower() not in hosts:
            raise ValueError('Host is not allowed: ' + urlsplit(clean).hostname)
        return clean

    class Redirects(HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            permitted(newurl)
            return super().redirect_request(req, fp, code, msg, headers, newurl)

    opener = build_opener(Redirects())

    def fetch(url):
        clean = permitted(url)
        request = Request(clean, headers={'User-Agent': 'SlideGenAI-AssetCollector/1.0', 'Accept-Encoding': 'identity'})
        with opener.open(request, timeout=20) as response:
            final = permitted(response.geturl())
            data = response.read(MAX_BYTES + 1)
            if len(data) > MAX_BYTES: raise ValueError('Response exceeds the size limit.')
            return data, final, response.headers.get_content_type()
    return fetch


def priority(item):
    hint = (item['context'] + ' ' + (item['source_url'] or '')).casefold()
    if 'logo' in hint: return 100
    if any(word in hint for word in ('banner', 'hero', 'slide')): return 90
    if any(word in hint for word in ('equipe', 'team', 'escritorio', 'escritório', 'office')): return 70
    if any(word in hint for word in ('icon', 'favicon', 'social preview')): return 0
    return 40


def collect(url, output, download=False, max_assets=6, max_css=4, matches=(), allow_hosts=(), fetch=None):
    url = web_url(url)
    if not 1 <= max_assets <= 20 or not 0 <= max_css <= 8:
        raise ValueError('Use 1–20 assets and 0–8 stylesheets.')
    output = Path(output)
    if output.exists(): raise ValueError('Output directory already exists; choose a new one.')
    hosts = {urlsplit(url).hostname.lower()} | {h.lower() for h in allow_hosts}
    fetch = fetch or make_fetch(hosts)
    raw, page_url, content_type = fetch(url)
    if 'html' not in content_type: raise ValueError('Page response is not HTML.')
    output.mkdir(parents=True)
    (output / 'source').mkdir()
    (output / 'source/page.html').write_bytes(raw)
    parser = Reader();parser.feed(raw.decode('utf-8', errors='replace'))
    base = urljoin(page_url, parser.base) if parser.base else page_url
    candidates = list(parser.images)
    candidates += [(u.strip(), 'page style background') for u in CSS_URL.findall('\n'.join(parser.css))]
    styles = []
    seen_css = set()
    for href in parser.styles:
        css_url = urljoin(base, href)
        if css_url in seen_css: continue
        seen_css.add(css_url)
        if len(styles) >= max_css: break
        entry = {'url': css_url}
        try:
            if urlsplit(web_url(css_url)).hostname.lower() not in hosts:
                raise ValueError('Stylesheet host not allowed; add --allow-host explicitly if appropriate.')
            css, final, mime = fetch(css_url)
            if mime != 'text/css': raise ValueError('Stylesheet response is not text/css.')
            path = 'source/style-%02d.css' % (len(styles) + 1)
            (output / path).write_bytes(css)
            entry.update(status='saved', path=path, final_url=final)
            for target in CSS_URL.findall(css.decode('utf-8', errors='replace')):
                target = target.strip()
                if target.lower().startswith('data:image/') or urlsplit(urljoin(final, target)).path.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif')):
                    candidates.append((urljoin(final, target), 'stylesheet image'))
        except (OSError, ValueError) as exc:
            entry.update(status='unavailable', error=str(exc))
        styles.append(entry)
    records = [];payloads = {};seen = set()
    for target, hint in candidates:
        target = target.strip()
        if target.startswith('data:'):
            try: payload = inline_image(target)
            except (ValueError, TypeError): continue
            key = hashlib.sha256(payload).hexdigest()
            source_url = None;kind = 'inline-data'
        else:
            try: source_url = web_url(urljoin(base, target))
            except ValueError: continue
            key = source_url;kind = 'remote'
        if key in seen: continue
        seen.add(key)
        record = {'source_url': source_url, 'source_kind': kind, 'context': hint, 'source_page': page_url, 'retrieval': {'status': 'not-requested'}}
        if kind == 'inline-data': payloads[id(record)] = payload
        records.append(record)
    records.sort(key=priority, reverse=True)
    selected = 0
    for i, record in enumerate(records, 1):
        record['id'] = 'asset-%03d' % i
        hint = (record['context'] + ' ' + (record['source_url'] or '')).casefold()
        if not download or selected >= max_assets or (matches and not any(m.casefold() in hint for m in matches)): continue
        selected += 1
        try:
            if record['source_kind'] == 'inline-data':
                data = payloads[id(record)]
                final = None
            else:
                remote = record['source_url']
                if urlsplit(remote).hostname.lower() not in hosts:
                    raise ValueError('Image host not allowed; add --allow-host explicitly if appropriate.')
                data, final, mime = fetch(remote)
            ext = image_type(data)
            path = 'assets/' + record['id'] + '.' + ext
            (output / 'assets').mkdir(exist_ok=True)
            (output / path).write_bytes(data)
            record['retrieval'] = {'status': 'saved', 'path': path, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'final_url': final, 'visually_inspected': False, 'editor_imported': False}
        except (OSError, ValueError) as exc:
            record['retrieval'] = {'status': 'unavailable', 'error': str(exc)}
    result = {'version': 1, 'page_url': page_url, 'assets': records, 'stylesheets': styles, 'limits': ['No browser rendering, JavaScript execution, visual verification, asset-rights certification, editor import or slide creation performed. SVG files are original source, not sanitized. Font files and nested CSS imports are not downloaded.']}
    (output / 'asset-inventory.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('url')
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--download', action='store_true', help='Save selected original image bytes; otherwise discover only.')
    parser.add_argument('--match', action='append', default=[], help='Select candidates whose context/URL contains this text; repeat for alternatives.')
    parser.add_argument('--allow-host', action='append', default=[], help='Explicit additional host for stylesheet/image requests or redirects.')
    parser.add_argument('--max-assets', type=int, default=6)
    parser.add_argument('--max-css', type=int, default=4)
    args = parser.parse_args()
    try:
        result = collect(args.url, args.out, args.download, args.max_assets, args.max_css, args.match, args.allow_host)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    saved = sum(r['retrieval']['status'] == 'saved' for r in result['assets'])
    print(json.dumps({'candidates': len(result['assets']), 'saved': saved, 'inventory': str(args.out / 'asset-inventory.json'), 'editor_imported': False}, indent=2))
    return 1 if args.download and not saved else 0


if __name__ == '__main__':
    raise SystemExit(main())
