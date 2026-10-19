#!/usr/bin/env python3
"""Stage verified font files in an explicit directory; dry run unless --install is given."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
from validate_fonts import DEFAULT_ROOT, local_file, validate

def stage(root, destination, families=None, install=False):
    root, destination = Path(root), Path(destination).expanduser()
    validate(root)
    manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
    selected = [f for f in manifest['families'] if not families or f['family'] in families]
    if families and set(families) - {f['family'] for f in selected}:
        raise ValueError('Unknown font family')
    jobs, target_names = [], set()
    if destination.is_symlink():
        raise ValueError('Destination must not contain symlinks')
    for family in selected:
        for record in family['files']:
            source = local_file(root, record['path'])
            target = destination / source.name
            if source.name.casefold() in target_names:
                raise ValueError('Conflicting font filenames')
            target_names.add(source.name.casefold())
            if target.is_symlink():
                raise ValueError('Refusing a symlink target: ' + str(target))
            if target.exists() and (not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest() != record['sha256']):
                raise ValueError('Refusing to overwrite a different existing file: ' + str(target))
            jobs.append((source, target))
    # Preflight every file before making any copies. Preserve existing identical files.
    if install:
        destination.mkdir(parents=True, exist_ok=True)
        for source, target in jobs:
            if not target.exists():
                shutil.copy2(source, target)
    return {'families': len(selected), 'font_files': len(jobs), 'destination': str(destination), 'copied': install, 'note': 'Copying files does not certify OS registration, application refresh or font embedding. Keep the original font pack and license files for redistribution.'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=DEFAULT_ROOT)
    parser.add_argument('--dest', type=Path, required=True)
    parser.add_argument('--family', action='append')
    parser.add_argument('--install', action='store_true')
    args = parser.parse_args()
    try:
        print(json.dumps(stage(args.root, args.dest, args.family, args.install), indent=2))
    except (ValueError, KeyError, TypeError, OSError) as exc:
        parser.error(str(exc))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
