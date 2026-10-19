#!/usr/bin/env python3
"""Validate measured design systems and their optional deck bindings, offline."""
import argparse
import json
import math
import re
import sys
from pathlib import Path
from validate_brand import local_asset, nonempty, validate as validate_brand


def measure(value, positive=False):
    try:
        return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and (value > 0 if positive else value >= 0)
    except OverflowError:
        return False


def validate(design, root, brand=None):
    errors, warnings = [], []
    if not isinstance(design, dict):
        return ['Design system must be an object.'], []
    if type(design.get('version')) is not int or design['version'] != 1:
        errors.append('Design version must be integer 1.')
    canvas = design.get('canvas')
    if not isinstance(canvas, dict) or not all(measure(canvas.get(k), True) for k in ('width', 'height')) or canvas.get('unit') not in ('px', 'pt'):
        errors.append('canvas needs positive finite width/height and px/pt unit.')
        canvas = None
    colors, types, spacing = (design.get(k) for k in ('colors', 'typography', 'spacing'))
    for name, group in (('colors', colors), ('typography', types), ('spacing', spacing)):
        if not isinstance(group, dict) or (name != 'spacing' and not group) or any(not nonempty(k) for k in group):
            errors.append(f'{name} must be an object with named entries.')
    if not isinstance(colors, dict): colors = {}
    if not isinstance(types, dict): types = {}
    if not isinstance(spacing, dict): spacing = {}
    for name, value in colors.items():
        if not isinstance(value, str) or not re.fullmatch(r'#[0-9a-fA-F]{6}', value):
            errors.append(f'colors.{name}: use #RRGGBB.')
    for name, value in types.items():
        if not isinstance(value, dict) or not nonempty(value.get('family')) or not measure(value.get('size'), True) or not measure(value.get('line_height'), True) or ('bold' in value and type(value['bold']) is not bool):
            errors.append(f'typography.{name}: invalid family, size, line_height, or bold.')
    for name, value in spacing.items():
        if not measure(value): errors.append(f'spacing.{name}: invalid measure.')
    logo = design.get('logo')
    if not isinstance(logo, dict) or not measure(logo.get('clear_space')) or not isinstance(logo.get('backgrounds'), list) or not logo['backgrounds']:
        errors.append('logo needs clear_space and nonempty backgrounds.')
    else:
        for name in logo['backgrounds']:
            if not isinstance(name, str) or name not in colors: errors.append('Unknown logo background role.')
        if 'asset' not in logo: errors.append('logo.asset is required; null means unavailable.')
        elif logo['asset'] is None: warnings.append('Design system has no logo asset.')
        else:
            asset = local_asset(logo['asset'], root)
            if asset is None: errors.append('logo.asset must exist inside the package.')
            elif brand is not None and not any(local_asset(x.get('path'), root) == asset for x in brand.get('logos', []) if isinstance(x, dict)):
                errors.append('Design logo is absent from brand profile.')
    layouts = design.get('layouts')
    if not isinstance(layouts, list) or not layouts:
        errors.append('layouts must be a nonempty array.')
        layouts = []
    ids = set()
    for layout in layouts:
        if not isinstance(layout, dict):
            errors.append('Each layout must be an object.'); continue
        lid = layout.get('id')
        if not nonempty(lid) or lid in ids: errors.append('Layout IDs must be unique nonempty strings.')
        else: ids.add(lid)
        slots = layout.get('slots')
        if not isinstance(slots, list) or not slots:
            errors.append(f'Layout {lid}: nonempty slots required.'); continue
        slot_ids = set()
        for slot in slots:
            if not isinstance(slot, dict):
                errors.append(f'Layout {lid}: slot must be an object.'); continue
            sid = slot.get('id')
            if not nonempty(sid) or sid in slot_ids: errors.append(f'Layout {lid}: invalid/duplicate slot ID.')
            else: slot_ids.add(sid)
            kind = slot.get('kind')
            if kind not in ('text', 'image', 'logo', 'shape', 'chart', 'table'): errors.append(f'Layout {lid}: invalid slot kind.')
            geo = all(measure(slot.get(k), k in ('width', 'height')) for k in ('x', 'y', 'width', 'height'))
            if not geo: errors.append(f'Layout {lid}: invalid slot geometry.')
            elif canvas and (slot['x'] + slot['width'] > canvas['width'] + .01 or slot['y'] + slot['height'] > canvas['height'] + .01): errors.append(f'Layout {lid}: slot exceeds canvas.')
            if kind == 'text' and (not isinstance(slot.get('type_role'), str) or slot['type_role'] not in types): errors.append(f'Layout {lid}: unknown type_role.')
            for key in ('color_role', 'background_role'):
                if key in slot and (not isinstance(slot[key], str) or slot[key] not in colors): errors.append(f'Layout {lid}: unknown {key}.')
    decisions = design.get('decisions')
    if not isinstance(decisions, list) or not decisions:
        errors.append('decisions must be a nonempty evidence-backed array.')
    else:
        source_ids = {x['id'] for x in brand.get('sources', []) if isinstance(x, dict) and nonempty(x.get('id'))} if brand else None
        for item in decisions:
            ev = item.get('evidence') if isinstance(item, dict) else None
            if not isinstance(item, dict) or not nonempty(item.get('rule')) or not isinstance(ev, dict):
                errors.append('Each design decision needs rule and evidence.'); continue
            if ev.get('status') not in ('observed', 'inferred', 'user-approved') or not nonempty(ev.get('detail')):
                errors.append('Invalid design decision evidence.')
            sid = ev.get('source_id')
            if not (ev.get('status') == 'user-approved' and sid is None):
                if not nonempty(sid) or (source_ids is not None and sid not in source_ids): errors.append('Unknown design evidence source_id.')
        if brand is None: warnings.append('Evidence source IDs need validation with --brand.')
    return errors, warnings


def validate_binding(plan, design):
    errors = []
    if not isinstance(plan, dict): return ['Plan must be an object.']
    canvas = design['canvas']
    if plan.get('unit', 'px') != canvas['unit'] or plan.get('slide_size') != {k: canvas[k] for k in ('width', 'height')}:
        errors.append('Plan and design canvas dimensions/unit differ; convert explicitly.')
    layouts = {x['id']: {s['id']: s for s in x['slots']} for x in design['layouts']}
    for slide in plan.get('slides', []) if isinstance(plan.get('slides'), list) else []:
        if not isinstance(slide, dict): continue
        lid = slide.get('layout')
        if not isinstance(lid, str) or lid not in layouts:
            errors.append('Slide references an unknown design layout.'); continue
        for element in slide.get('elements', []) if isinstance(slide.get('elements'), list) else []:
            if not isinstance(element, dict) or 'slot_id' not in element: continue
            sid = element['slot_id']
            if not isinstance(sid, str) or sid not in layouts[lid] or layouts[lid][sid]['kind'] != element.get('kind'):
                errors.append('Element slot_id is missing from layout or has a different kind.')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('design', type=Path)
    parser.add_argument('--brand', type=Path)
    args = parser.parse_args()
    try:
        path = args.design.resolve()
        brand = None
        if args.brand:
            bpath = args.brand.resolve()
            if bpath.parent != path.parent: raise ValueError('Keep design and brand in the same package root.')
            brand = json.loads(bpath.read_text(encoding='utf-8'))
            be, _ = validate_brand(brand, path.parent)
            if be: raise ValueError('; '.join(be))
        errors, warnings = validate(json.loads(path.read_text(encoding='utf-8')), path.parent, brand)
    except (OSError, ValueError, RuntimeError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr); return 1
    for w in warnings: print(f'WARNING: {w}')
    for e in errors: print(f'ERROR: {e}', file=sys.stderr)
    if errors: return 1
    print('Design system is structurally valid; render to verify fit.'); return 0


if __name__ == '__main__': sys.exit(main())
