#!/usr/bin/env python3
"""Validate and package the complete generic skill; never overwrite an archive."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import zipfile
import tempfile
from check_installation import check

DEFAULT_ROOT = Path(__file__).resolve().parent.parent
ROOT_FILES = {'SKILL.md', 'LICENSE', 'NOTICE.md', 'VERSION', 'DISTRIBUTION.json'}
EXTENSIONS = {'references': {'.md', '.json'}, 'agents': {'.yaml', '.yml'},
              'scripts': {'.py'}, 'assets': {'.ttf', '.txt', '.md', '.json', '.css', '.html'}}

def inventory(root):
    root = Path(root)
    if root.is_symlink() or not root.is_dir():
        raise ValueError('Source must be a real skill directory')
    files = []
    for path in sorted(root.rglob('*')):
        rel = path.relative_to(root)
        if path.is_symlink():
            raise ValueError('Symlinks are not distributable: ' + str(rel))
        if '__pycache__' in rel.parts or rel.name == '.DS_Store':
            continue
        if any(part.startswith('.') or
               re.search(r'(^|[-_.])(credentials?|secrets?|passwords?|api[-_]?keys?)([-_.]|$)', part, re.I)
               for part in rel.parts):
            raise ValueError('Private or generated entry: ' + str(rel))
        if len(rel.parts) == 1 and path.is_file():
            allowed = rel.name in ROOT_FILES
        else:
            allowed = rel.parts[0] in EXTENSIONS and (path.is_dir() or path.suffix.lower() in EXTENSIONS[rel.parts[0]])
        # Executable visual resources are allowed only in this maintained kit.
        kit = ('assets', 'visual-kit')
        if tuple(rel.parts[:2]) == kit:
            if path.is_dir():
                allowed = len(rel.parts) == 2
            else:
                allowed = len(rel.parts) == 3 and rel.name in {
                    'build.mjs', 'core.mjs', 'html.mjs', 'pptx.mjs',
                    'inspect.js', 'player.js', 'visual.css', 'package.json', 'package-lock.json'}
        if not allowed or not (path.is_dir() or path.is_file()):
            raise ValueError('Unexpected entry: ' + str(rel))
        if path.is_file():
            files.append(path)
    return files

def prepare_claude_profile(source, destination):
    """Retain original normal 400/700 faces and expressive sample requirements."""
    for path in inventory(source):
        dest = destination / path.relative_to(source)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(path.read_bytes())
    font_root = destination / 'assets/fonts'
    manifest_path = font_root / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    original_manifest = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
    choices = json.loads((destination / 'references/expressive-fonts.json').read_text(encoding='utf-8'))['choices']
    retained, omitted, renamed = set(), [], {}
    for family in manifest['families']:
        records = family['files']
        requirements = [('normal', 400), ('normal', 700)]
        requirements += [(c['sample_style'], c['sample_weight']) for c in choices if c['family'] == family['family']]
        selected = set()
        for style, weight in requirements:
            candidates = [f for f in records if f['style'] == style and f['weight_range'][0] <= weight <= f['weight_range'][1]]
            if candidates:
                selected.add(candidates[0]['path'])
        if not selected:
            selected.add(records[0]['path'])
        for record in records:
            if record['path'] not in selected:
                omitted.append(record['path'])
                (font_root / record['path']).unlink()
        family['files'] = [f for f in records if f['path'] in selected]
        for index, record in enumerate(family['files'], 1):
            original = record['path']
            portable = family['directory'] + '/' + family['directory'] + '-face-' + str(index).zfill(2) + '.ttf'
            (font_root / original).rename(font_root / portable)
            record['source_path'] = original
            record['path'] = portable
            renamed[original] = portable
        retained.update(selected)
    manifest['distribution_profile'] = 'claude-ai'
    manifest['complete_manifest_sha256'] = original_manifest
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    css_path = font_root / 'fonts.css'
    lines = css_path.read_text(encoding='utf-8').splitlines()
    css = '\n'.join(line for line in lines if 'url(' not in line or
                    any("url('./" + path + "')" in line for path in retained))
    for original, portable in renamed.items():
        css = css.replace("url('./" + original + "')", "url('./" + portable + "')")
    css_path.write_text(css + '\n', encoding='utf-8')
    distribution = {'profile': 'claude-ai', 'font_families': len(manifest['families']),
                    'font_files': len(retained), 'omitted_font_files': sorted(omitted),
                    'complete_manifest_sha256': original_manifest,
                    'font_binaries_modified': False, 'font_path_mapping': renamed,
                    'note': 'All families and original licenses retained; filenames normalized for upload, with original paths mapped. Some faces/weights require the complete repository. Resolve actual selected faces before authoring.'}
    (destination / 'DISTRIBUTION.json').write_text(json.dumps(distribution, indent=2) + '\n', encoding='utf-8')
    size = sum(p.stat().st_size for p in inventory(destination))
    if size > 29_000_000:
        raise ValueError('Claude.ai profile exceeds the conservative 29 MB uncompressed budget')
    return distribution


def package(root, output, profile='full'):
    if profile not in ('full', 'claude-ai'):
        raise ValueError('Unknown distribution profile')
    if profile == 'claude-ai':
        source = Path(root).absolute()
        inventory(source)
        check(source)
        if Path(output).resolve().is_relative_to(source.resolve()):
            raise ValueError('Output must be outside the installable folder')
        if Path(output).exists() or Path(output).is_symlink():
            raise FileExistsError('Refusing to overwrite: ' + str(output))
        with tempfile.TemporaryDirectory() as temp:
            staged = Path(temp) / 'slidegenai'
            distribution = prepare_claude_profile(source, staged)
            result = package(staged, output)
            result['distribution'] = distribution
            return result

    root, output = Path(root).absolute(), Path(output)
    files = inventory(root)
    if output.resolve().is_relative_to(root.resolve()):
        raise ValueError('Output must be outside the installable folder')
    if output.exists() or output.is_symlink():
        raise FileExistsError('Refusing to overwrite: ' + str(output))
    report = check(root)
    output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation closes the existence-check race. Sources must be trusted
    # and unchanged during packaging; this is not a concurrent mutation sandbox.
    with output.open('xb') as stream:
        try:
            with zipfile.ZipFile(stream, 'w', zipfile.ZIP_DEFLATED) as archive:
                for path in files:
                    archive.write(path, 'slidegenai/' + path.relative_to(root).as_posix())
        except BaseException:
            stream.close()
            output.unlink()
            raise
    return {'output': str(output), 'files': len(files), 'bytes': output.stat().st_size,
            'uncompressed_bytes': sum(p.stat().st_size for p in files),
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'installation': report}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=DEFAULT_ROOT)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--profile', choices=('full', 'claude-ai'), default='full')
    args = parser.parse_args()
    try:
        print(json.dumps(package(args.root, args.output, args.profile), indent=2))
    except (ValueError, KeyError, TypeError, OSError, SyntaxError) as exc:
        parser.error(str(exc))

if __name__ == '__main__':
    main()
