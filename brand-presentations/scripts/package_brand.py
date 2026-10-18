#!/usr/bin/env python3
"""Package an existing brand-specific skill; never fetch, install, or publish files."""
import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from validate_brand import validate

TOP_FILES = {'SKILL.md', 'brand-profile.json'}
EXTENSIONS = {
    'references': {'.md', '.json'},
    'agents': {'.yaml', '.yml'},
    'scripts': {'.py'},
    'assets': {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ttf', '.otf', '.woff', '.woff2'},
}


def collect(root):
    """Strict allowlist: unexpected files fail instead of silently entering a ZIP."""
    files = []
    if root.is_symlink():
        raise ValueError('Skill root must not be a symlink.')
    if not root.is_dir():
        raise ValueError('Skill directory does not exist.')
    for path in sorted(root.rglob('*')):
        rel = path.relative_to(root)
        if path.is_symlink():
            raise ValueError(f'Symlinks are not allowed: {rel}')
        if any(part.startswith('.') or part in ('__pycache__', 'node_modules') for part in rel.parts):
            raise ValueError(f'Hidden files or caches are not allowed: {rel}')
        if path.is_dir():
            if rel.parts[0] not in EXTENSIONS:
                raise ValueError(f'Unexpected directory: {rel}')
            continue
        allowed = str(rel) in TOP_FILES or (len(rel.parts) > 1 and path.suffix.lower() in EXTENSIONS.get(rel.parts[0], set()))
        if not allowed or re.search(r'(?:secret|credential|private[_-]?key|token)', path.stem, re.I):
            raise ValueError(f'Unexpected or credential-named file: {rel}')
        files.append(path)
    for required in TOP_FILES:
        if not (root / required).is_file():
            raise ValueError(f'Missing {required}. This helper packages brand-specific skills only.')
    skill = (root / 'SKILL.md').read_text(encoding='utf-8')
    match = re.match(r'\A---\n(.*?)\n---(?:\n|$)', skill, re.S)
    if not match or not re.search(r'^name:\s*[a-z0-9]+(?:-[a-z0-9]+)*\s*$', match[1], re.M) or not re.search(r'^description:\s*\S', match[1], re.M):
        raise ValueError('SKILL.md needs simple name and description front matter.')
    if 'brand-profile.json' not in skill:
        raise ValueError('SKILL.md must reference brand-profile.json.')
    profile = json.loads((root / 'brand-profile.json').read_text(encoding='utf-8'))
    errors, warnings = validate(profile, root)
    if errors:
        raise ValueError('; '.join(errors))
    return files, warnings


def package(root, output):
    if root.is_symlink():
        raise ValueError('Skill root must not be a symlink.')
    root, output = root.resolve(), output.absolute()
    if output.resolve().is_relative_to(root):
        raise ValueError('Output must be outside the skill directory.')
    files, warnings = collect(root)
    if not output.parent.is_dir():
        raise ValueError('Output parent directory must exist.')
    # Exclusive creation avoids overwriting an existing archive or following a symlink.
    with output.open('xb') as stream:
        try:
            with zipfile.ZipFile(stream, 'w', zipfile.ZIP_DEFLATED) as archive:
                for path in files:
                    archive.write(path, Path(root.name) / path.relative_to(root))
        except Exception:
            stream.close()
            output.unlink(missing_ok=True)
            raise
    return len(files), warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('skill', type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        count, warnings = package(args.skill, args.output)
    except (OSError, ValueError, RuntimeError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return 1
    for warning in warnings:
        print(f'WARNING: {warning}')
    print(f'Packaged {count} files: {args.output}')
    print('Review contents and usage rights before sharing; this is not a secret scanner or visual review.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
