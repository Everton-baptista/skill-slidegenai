"""Asset acquisition with injected HTTP fixtures; tests never access the network."""
import base64
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'slidegenai/scripts'))
from collect_website_assets import collect, image_type, inline_image, make_fetch, Reader, web_url

PNG = b'\x89PNG\r\n\x1a\nfixture'
SVG = b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>'
PAGE = 'https://brand.example/page/'
DATA = 'data:image/svg+xml;base64,' + base64.b64encode(SVG).decode()
HTML = ('<base href="/public/"><link rel="stylesheet" href="theme.css">'
        '<img class="logo" src="' + DATA + '">'
        '<img alt="Office" src="office.png"><img src="office.png">'
        '<picture><source srcset="small.jpg 400w, large.jpg 1200w"></picture>'
        '<div class="hero" style="background-image:url(hero.webp)"></div>'
        '<meta property="og:image" content="social.png">').encode()


class WebsiteAssets(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.output = Path(self.temp.name) / 'collection'
        self.calls = []
        self.responses = {PAGE: (HTML, PAGE, 'text/html'),
            'https://brand.example/public/theme.css': (b'.scene{background:url(../scene.png)} @font-face{src:url(face.woff2)}', 'https://brand.example/public/theme.css', 'text/css')}

    def fetch(self, url):
        self.calls.append(url)
        return self.responses.get(url, (PNG, url, 'image/png'))

    def test_discovery_resolves_base_css_and_responsive_urls_without_downloading(self):
        result = collect(PAGE, self.output, fetch=self.fetch)
        urls = [r['source_url'] for r in result['assets']]
        self.assertEqual(urls.count('https://brand.example/public/office.png'), 1)
        self.assertIn('https://brand.example/scene.png', urls)
        self.assertIn('https://brand.example/public/large.jpg', urls)
        self.assertFalse(any('woff2' in (u or '') for u in urls))
        self.assertEqual(len(self.calls), 2)
        self.assertFalse((self.output / 'assets').exists())
        self.assertTrue((self.output / 'source/page.html').exists())

    def test_download_preserves_original_inline_logo_bytes_and_hash_records(self):
        result = collect(PAGE, self.output, True, matches=['logo'], fetch=self.fetch)
        saved = [r for r in result['assets'] if r['retrieval']['status'] == 'saved']
        self.assertEqual(len(saved), 1)
        record = saved[0]['retrieval']
        self.assertEqual((self.output / record['path']).read_bytes(), SVG)
        self.assertEqual(record['bytes'], len(SVG))
        self.assertFalse(record['editor_imported'])
        self.assertFalse(record['visually_inspected'])
        self.assertEqual(len(self.calls), 2)

    def test_remote_extension_comes_from_bytes_not_misleading_url(self):
        result = collect(PAGE, self.output, True, matches=['hero.webp'], fetch=self.fetch)
        saved = next(r['retrieval'] for r in result['assets'] if r['retrieval']['status'] == 'saved')
        self.assertTrue(saved['path'].endswith('.png'))
        self.assertEqual((self.output / saved['path']).read_bytes(), PNG)

    def test_nonimage_response_records_failure_without_fake_asset(self):
        url = 'https://brand.example/public/office.png'
        self.responses[url] = (b'<html>Access denied</html>', url, 'text/html')
        result = collect(PAGE, self.output, True, matches=['office'], fetch=self.fetch)
        office = next(r for r in result['assets'] if r['source_url'] == url)
        self.assertEqual(office['retrieval']['status'], 'unavailable')
        self.assertFalse((self.output / 'assets').exists())
        self.assertTrue((self.output / 'asset-inventory.json').exists())
        with self.assertRaises(ValueError):image_type(b'<html><svg></svg></html>')

    def test_external_assets_require_explicit_host_before_fetch(self):
        self.responses[PAGE] = (b'<img src="https://cdn.example/photo.png">', PAGE, 'text/html')
        result = collect(PAGE, self.output, True, fetch=self.fetch)
        self.assertEqual(self.calls, [PAGE])
        self.assertEqual(result['assets'][0]['retrieval']['status'], 'unavailable')
        other = Path(self.temp.name) / 'allowed'
        result = collect(PAGE, other, True, allow_hosts=['cdn.example'], fetch=self.fetch)
        self.assertEqual(result['assets'][0]['retrieval']['status'], 'saved')

    def test_output_is_not_overwritten(self):
        self.output.mkdir();sentinel = self.output / 'keep.txt';sentinel.write_text('keep')
        with self.assertRaises(ValueError):collect(PAGE, self.output, fetch=self.fetch)
        self.assertEqual(self.calls, [])
        self.assertEqual(sentinel.read_text(), 'keep')

    def test_asset_and_stylesheet_limits_bound_requests(self):
        result = collect(PAGE, self.output, True, max_assets=1, max_css=0, fetch=self.fetch)
        self.assertEqual(self.calls, [PAGE])
        self.assertEqual(sum(r['retrieval']['status'] == 'saved' for r in result['assets']), 1)
        self.assertEqual(result['stylesheets'], [])

    def test_invalid_schemes_credentials_and_unlisted_hosts_are_rejected(self):
        for url in ['file:///etc/passwd', 'javascript:alert(1)', 'https://user:secret@brand.example/a']:
            with self.assertRaises(ValueError):web_url(url)
        with self.assertRaises(ValueError):make_fetch({'brand.example'})('https://unlisted.example/a')

    def test_inline_percent_encoded_svg_and_unsupported_payloads(self):
        self.assertEqual(image_type(inline_image('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3C/svg%3E')), 'svg')
        for value in ['data:text/html,<svg></svg>', 'data:image/png;base64,%%%']:
            with self.assertRaises(ValueError):inline_image(value)

    def test_inline_style_and_lazy_images_keep_source_context(self):
        reader = Reader();reader.feed('<img alt="team" data-src="team.jpg"><style>.hero{background:url(hero.png)}</style>')
        self.assertEqual(reader.images[0][0], 'team.jpg')
        self.assertIn('team', reader.images[0][1])
        self.assertIn('hero.png', ''.join(reader.css))


if __name__ == '__main__':
    unittest.main()
