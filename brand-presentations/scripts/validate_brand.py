#!/usr/bin/env python3
"""Validate a portable brand profile without external packages or network access."""
import argparse
import json
import re
import sys
from pathlib import Path


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def local_asset(name, root):
    """Resolve an existing file within root; malformed paths fail closed."""
    try:
        if not nonempty(name) or '\x00' in name or Path(name).is_absolute():
            return None
        root = root.resolve()
        target = (root / name).resolve()
        return target if target.is_relative_to(root) and target.is_file() else None
    except (OSError, ValueError, RuntimeError):
        return None


def validate(profile, root):
    errors, warnings = [], []
    if not isinstance(profile, dict):
        return ['Profile must be a JSON object.'], []
    if type(profile.get('version')) is not int or profile['version'] != 1:
        errors.append('version must be integer 1.')
    if not nonempty(profile.get('brand_name')):
        errors.append('brand_name must be nonempty.')
    for key in ('sources', 'palette', 'typography', 'logos', 'rules', 'gaps'):
        if not isinstance(profile.get(key), list):
            errors.append(f'{key} must be an array.')
    if errors:
        return errors, warnings
    source_ids = set()
    kinds = ('website', 'brand-guide', 'presentation', 'pdf', 'image', 'local-file')
    for source in profile['sources']:
        if not isinstance(source, dict):
            errors.append('Each source must be an object.')
            continue
        sid = source.get('id')
        if not nonempty(sid) or sid in source_ids:
            errors.append('Source IDs must be unique nonempty strings.')
        else:
            source_ids.add(sid)
        if not nonempty(source.get('location')):
            errors.append('Each source needs a location.')
        if source.get('kind') not in kinds:
            errors.append(f'Source {sid}: invalid kind.')
    if not source_ids:
        errors.append('Include at least one reference source.')

    def evidence(item, label):
        ev = item.get('evidence')
        if not isinstance(ev, dict):
            errors.append(f'{label}: missing evidence.')
            return
        status, sid = ev.get('status'), ev.get('source_id')
        if status not in ('observed', 'inferred', 'user-approved'):
            errors.append(f'{label}: invalid evidence status.')
        if not (status == 'user-approved' and sid is None):
            if not isinstance(sid, str) or sid not in source_ids:
                errors.append(f'{label}: unknown source_id.')
        if not nonempty(ev.get('detail')):
            errors.append(f'{label}: evidence detail is required.')

    for group in ('palette', 'typography', 'logos', 'rules'):
        for index, item in enumerate(profile[group]):
            label = f'{group}[{index}]'
            if not isinstance(item, dict):
                errors.append(f'{label}: must be an object.')
                continue
            evidence(item, label)
            if group in ('palette', 'typography') and not nonempty(item.get('role')):
                errors.append(f'{label}: role is required.')
            if group == 'palette':
                if not isinstance(item.get('hex'), str) or not re.fullmatch(r'#[0-9a-fA-F]{6}', item['hex']):
                    errors.append(f'{label}: use #RRGGBB.')
            if group == 'typography':
                family = item.get('family')
                if 'family' not in item or (family is not None and not nonempty(family)):
                    errors.append(f'{label}: family must be a nonempty string or null.')
                if not isinstance(item.get('fallback'), list) or not item['fallback'] or any(not nonempty(x) for x in item['fallback']):
                    errors.append(f'{label}: include a nonempty fallback string array.')
                if family is None:
                    warnings.append(f'{label}: exact font family is unknown.')
            if group == 'rules' and not nonempty(item.get('rule')):
                errors.append(f'{label}: rule is required.')
            if group == 'logos':
                if not nonempty(item.get('variant')):
                    errors.append(f'{label}: variant is required.')
                if not isinstance(item.get('backgrounds'), list) or not item['backgrounds'] or any(not nonempty(x) for x in item['backgrounds']):
                    errors.append(f'{label}: describe suitable backgrounds.')
                name = item.get('path')
                target = local_asset(name, root)
                if target is None:
                    errors.append(f'{label}: logo must be an existing relative file inside the package.')
                elif target.suffix.lower() == '.svg':
                    try:
                        svg = target.read_text(encoding='utf-8')
                        if re.search(r'(?:href|xlink:href)\s*=\s*[\"\'](?!data:|#)', svg, re.I):
                            warnings.append(f'{label}: SVG references another resource; check packaging and rendering.')
                        if re.search(r'<\s*script\b|\bon\w+\s*=|javascript:|<!ENTITY|<!DOCTYPE', svg, re.I):
                            errors.append(f'{label}: SVG contains active content or declarations; inspect and supply a safe asset.')
                    except (OSError, UnicodeError) as exc:
                        errors.append(f'{label}: cannot read SVG: {exc}')
    imagery = profile.get('imagery')
    if not isinstance(imagery, dict) or not nonempty(imagery.get('direction')):
        errors.append('imagery requires a nonempty direction.')
    else:
        evidence(imagery, 'imagery')
        if 'avoid' in imagery and (not isinstance(imagery['avoid'], list) or any(not isinstance(x, str) for x in imagery['avoid'])):
            errors.append('imagery.avoid must be a string array.')
    if any(not nonempty(x) for x in profile['gaps']):
        errors.append('gaps must contain only nonempty strings.')
    for key, message in (('logos', 'No logo included; document the gap.'), ('palette', 'No palette identified; identity is incomplete.'), ('typography', 'No typography identified.')):
        if not profile[key]:
            warnings.append(message)
    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('profile', type=Path, help='Path to brand-profile.json')
    args = parser.parse_args()
    try:
        path = args.profile.resolve()
        errors, warnings = validate(json.loads(path.read_text(encoding='utf-8')), path.parent)
    except (OSError, ValueError, RuntimeError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return 1
    for warning in warnings:
        print(f'WARNING: {warning}')
    for error in errors:
        print(f'ERROR: {error}', file=sys.stderr)
    if errors:
        return 1
    print('Profile is structurally valid. Visual inspection remains necessary.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
