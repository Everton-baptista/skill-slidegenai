#!/usr/bin/env python3
"""Verify the bundled font inventory, licenses and hashes offline (not font rendering)."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re

DEFAULT_ROOT = Path(__file__).resolve().parent.parent / 'assets/fonts'

def local_file(root, relative):
    if not isinstance(relative, str) or '\\' in relative:
        raise ValueError('Invalid local font path')
    path = PurePosixPath(relative)
    if path.is_absolute() or '..' in path.parts or not path.parts:
        raise ValueError('Unsafe local font path: ' + relative)
    candidate = root.joinpath(*path.parts)
    if root.is_symlink() or any(root.joinpath(*path.parts[:i]).is_symlink() for i in range(1, len(path.parts) + 1)):
        raise ValueError('Symlink in font path: ' + relative)
    if not candidate.is_file() or not candidate.resolve().is_relative_to(root.resolve()):
        raise ValueError('Missing or unsafe font file: ' + relative)
    return candidate

def validate(root):
    root = Path(root)
    manifest = json.loads(local_file(root, 'manifest.json').read_text(encoding='utf-8'))
    if manifest.get('version') != 1 or not isinstance(manifest.get('families'), list) or not manifest['families']:
        raise ValueError('Invalid font manifest')
    names, declared = set(), set()
    for family in manifest['families']:
        name = family['family']
        if not name or name in names:
            raise ValueError('Duplicate or empty font family')
        names.add(name)
        license_path = local_file(root, family['license_file'])
        license_bytes = license_path.read_bytes()
        if family['license'] != 'OFL-1.1' or b'SIL OPEN FONT LICENSE' not in license_bytes.upper():
            raise ValueError('Unsupported or missing license for ' + name)
        if hashlib.sha256(license_bytes).hexdigest() != family['license_sha256']:
            raise ValueError('License hash mismatch for ' + name)
        if not family['files']:
            raise ValueError('No font files for ' + name)
        for record in family['files']:
            rel = record['path']
            if rel in declared:
                raise ValueError('Duplicate font file: ' + rel)
            declared.add(rel)
            path = local_file(root, rel)
            data = path.read_bytes()
            if path.suffix.lower() != '.ttf' or data[:4] not in (b'\x00\x01\x00\x00', b'OTTO'):
                raise ValueError('Invalid font signature: ' + rel)
            if len(data) != record['bytes'] or hashlib.sha256(data).hexdigest() != record['sha256']:
                raise ValueError('Font integrity mismatch: ' + rel)
    actual = {str(p.relative_to(root)) for p in root.rglob('*.ttf')}
    if actual != declared:
        raise ValueError('Unmanifested or missing font binaries')
    if not set(manifest['application_families']).issubset(names):
        raise ValueError('Application font coverage incomplete')
    if not set(manifest['system_font_alternatives'].values()).issubset(names):
        raise ValueError('Open alternative missing from package')
    css = local_file(root, 'fonts.css').read_text(encoding='utf-8')
    if '@import' in css or re.search(r'https?://', css):
        raise ValueError('Font CSS must be local and offline')
    css_paths = {p.removeprefix('./') for p in re.findall(r"url\(['\"]([^'\"]+)['\"]\)", css)}
    if css_paths != declared:
        raise ValueError('CSS and font inventory disagree')
    return {'families': len(names), 'font_files': len(declared), 'application_families': len(manifest['application_families']), 'bytes': sum(r['bytes'] for f in manifest['families'] for r in f['files']), 'status': 'Integrity and license files verified offline; host rendering remains separate.'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', nargs='?', type=Path, default=DEFAULT_ROOT)
    args = parser.parse_args()
    try:
        print(json.dumps(validate(args.root), indent=2))
    except (ValueError, KeyError, TypeError, OSError) as exc:
        parser.error(str(exc))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
