#!/usr/bin/env python3
"""Check a portable deck plan; does not render slides or measure real text."""
import argparse
import hashlib
import json
import math
import re
import sys
from pathlib import Path

from validate_brand import validate as validate_brand, local_asset


def number(value, positive=False):
    try:
        return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and (value > 0 if positive else value >= 0)
    except OverflowError:
        return False


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def contrast(fg, bg):
    def luminance(color):
        parts = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        linear = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in parts]
        return sum(x * factor for x, factor in zip(linear, (.2126, .7152, .0722)))
    light, dark = sorted((luminance(fg), luminance(bg)), reverse=True)
    return (light + .05) / (dark + .05)


def asset_path(name, root):
    return local_asset(name, root)


def validate(plan, root, brand=None, brand_hash=None, require_reviewed=False):
    errors, warnings = [], []
    if not isinstance(plan, dict):
        return ['Plan must be a JSON object.'], []
    if type(plan.get('version')) is not int or plan['version'] != 1:
        errors.append('version must be integer 1.')
    for key in ('title', 'language'):
        if not nonempty(plan.get(key)):
            errors.append(f'{key} must be a nonempty string.')
    expected = plan.get('expected_slides')
    if type(expected) is not int or expected <= 0:
        errors.append('expected_slides must be a positive integer.')
    size = plan.get('slide_size')
    if not isinstance(size, dict) or not all(number(size.get(k), True) for k in ('width', 'height')):
        errors.append('slide_size needs finite positive width/height.')
        size = None
    if plan.get('unit', 'px') not in ('px', 'pt'):
        errors.append('unit must be px or pt; omitted means px.')
    fingerprint = plan.get('brand_profile_sha256')
    if fingerprint is None:
        warnings.append('Brand profile is not yet linked by hash.')
    elif not isinstance(fingerprint, str) or not re.fullmatch(r'[0-9a-fA-F]{64}', fingerprint):
        errors.append('Invalid brand_profile_sha256.')
    elif brand_hash and fingerprint.lower() != brand_hash:
        errors.append('Plan belongs to a different brand profile version.')
    slides = plan.get('slides')
    if not isinstance(slides, list) or not slides:
        return errors + ['slides must be a nonempty array.'], warnings
    if len(slides) != expected:
        errors.append('Slide count differs from expected_slides.')
    review = plan.get('review')
    if not isinstance(review, dict) or type(review.get('rendered')) is not bool or not isinstance(review.get('inspected_slide_ids'), list) or not isinstance(review.get('issues'), list):
        errors.append('review needs rendered, inspected_slide_ids, and issues.')
        review = {'rendered': False, 'inspected_slide_ids': [], 'issues': []}
    inspected_raw = review['inspected_slide_ids']
    if any(not nonempty(sid) for sid in inspected_raw):
        errors.append('Inspected IDs must be nonempty strings.')
    inspected = {sid for sid in inspected_raw if nonempty(sid)}
    if len(inspected_raw) != len(inspected):
        errors.append('Invalid or duplicate review IDs.')
    if inspected and not review['rendered']:
        errors.append('Do not claim slide inspection without rendering.')
    ids, blocking, referenced_issues = set(), set(), []
    for issue in review['issues']:
        if not isinstance(issue, dict) or not nonempty(issue.get('slide_id')) or issue.get('severity') not in ('blocking', 'warning') or not nonempty(issue.get('message')):
            errors.append('Each issue needs valid slide_id, severity, and message.')
            continue
        referenced_issues.append(issue['slide_id'])
        if issue['severity'] == 'blocking':
            blocking.add(issue['slide_id'])
    known_logos = set()
    if brand:
        known_logos = {str(asset_path(logo.get('path'), root)) for logo in brand.get('logos', []) if isinstance(logo, dict) and asset_path(logo.get('path'), root) is not None}
    for position, slide in enumerate(slides, 1):
        label = f'Slide {position}'
        if not isinstance(slide, dict):
            errors.append(f'{label}: must be an object.')
            continue
        sid = slide.get('id')
        if not nonempty(sid) or sid in ids:
            errors.append(f'{label}: missing or duplicate id.')
        else:
            ids.add(sid)
        if type(slide.get('position')) is not int or slide['position'] != position:
            errors.append(f'{label}: position must follow global order starting at 1.')
        for key in ('layout', 'title'):
            if not nonempty(slide.get(key)):
                errors.append(f'{label}: {key} is required.')
        role = slide.get('role')
        if role not in ('cover', 'section', 'content', 'insight', 'data', 'closing'):
            errors.append(f'{label}: invalid role.')
        if role == 'cover' and position != 1:
            errors.append(f'{label}: opening cover is not first; consider a section cover.')
        if role == 'closing' and position != len(slides):
            errors.append(f'{label}: closing is not last; consider an insight.')
        if role == 'section' and not nonempty(slide.get('topic_id')):
            errors.append(f'{label}: section cover needs topic_id.')
        status = slide.get('status')
        if status not in ('planned', 'generated', 'verified'):
            errors.append(f'{label}: invalid status.')
        if status == 'verified' and (not review['rendered'] or not nonempty(sid) or sid not in inspected or sid in blocking):
            errors.append(f'{label}: verification claimed without valid inspection or with a pending blocker.')
        if require_reviewed and (status != 'verified' or not nonempty(sid) or sid not in inspected or sid in blocking):
            errors.append(f'{label}: final review is still pending.')
        if role == 'data':
            if slide.get('data_status') not in ('sourced', 'illustrative'):
                errors.append(f'{label}: specify data_status.')
            if slide.get('data_status') == 'sourced' and not nonempty(slide.get('citation')):
                errors.append(f'{label}: factual data needs citation.')
            if slide.get('data_status') == 'illustrative':
                warnings.append(f'{label}: check the illustrative-data label in the final file.')
        composition = slide.get('composition')
        if composition is not None:
            allowed = ('cover', 'topic-cover', 'editorial', 'full-image', 'statement', 'comparison', 'closing')
            if not isinstance(composition, dict) or composition.get('type') not in allowed:
                errors.append(f'{label}: invalid visual composition.')
            elif composition['type'] in ('editorial', 'full-image'):
                image = composition.get('image')
                if not isinstance(image, dict) or asset_path(image.get('asset'), root) is None:
                    errors.append(f'{label}: composition image must exist inside the working folder.')
            elif composition['type'] == 'comparison':
                panels = composition.get('panels')
                if not isinstance(panels, list) or len(panels) != 2 or any(not isinstance(p, dict) or not nonempty(p.get('title')) or not nonempty(p.get('body')) for p in panels):
                    errors.append(f'{label}: comparison needs two titled content panels.')
        elements = slide.get('elements')
        if not isinstance(elements, list) or (not elements and composition is None):
            errors.append(f'{label}: elements must be a nonempty array.')
            continue
        element_ids, texts = set(), []
        for index, el in enumerate(elements, 1):
            tag = f'{label}, element {index}'
            if not isinstance(el, dict):
                errors.append(f'{tag}: must be an object.')
                continue
            eid = el.get('id')
            if not nonempty(eid) or eid in element_ids:
                errors.append(f'{tag}: missing or duplicate id.')
            else:
                element_ids.add(eid)
            kind = el.get('kind')
            if kind not in ('text', 'image', 'logo', 'shape', 'chart', 'table'):
                errors.append(f'{tag}: invalid kind.')
            geometry_ok = all(number(el.get(k), k in ('width', 'height')) for k in ('x', 'y', 'width', 'height'))
            if not geometry_ok:
                errors.append(f'{tag}: geometry must be finite with positive dimensions and nonnegative position.')
            elif size and (el['x'] + el['width'] > size['width'] + .01 or el['y'] + el['height'] > size['height'] + .01):
                errors.append(f'{tag}: element exceeds the canvas.')
            if kind == 'text':
                if not nonempty(el.get('text')) or not number(el.get('font_size'), True):
                    errors.append(f'{tag}: missing or invalid text/font_size.')
                for color_key in ('color', 'background'):
                    if color_key in el and (not isinstance(el[color_key], str) or not re.fullmatch(r'#[0-9a-fA-F]{6}', el[color_key])):
                        errors.append(f'{tag}: {color_key} must use opaque #RRGGBB.')
                if all(isinstance(el.get(k), str) and re.fullmatch(r'#[0-9a-fA-F]{6}', el[k]) for k in ('color', 'background')):
                    ratio = contrast(el['color'], el['background'])
                    if ratio < 4.5:
                        warnings.append(f'{tag}: contrast {ratio:.2f}:1; review size/weight and rendered background.')
                else:
                    warnings.append(f'{tag}: contrast requires visual inspection.')
                if geometry_ok:
                    texts.append(el)
            if kind in ('image', 'logo'):
                asset = asset_path(el.get('asset'), root)
                if asset is None:
                    errors.append(f'{tag}: asset must exist inside the package.')
                elif kind == 'logo' and brand is not None and str(asset) not in known_logos:
                    errors.append(f'{tag}: logo is absent from the brand profile.')
        for i, first in enumerate(texts):
            for second in texts[i + 1:]:
                if min(first['x'] + first['width'], second['x'] + second['width']) > max(first['x'], second['x']) and min(first['y'] + first['height'], second['y'] + second['height']) > max(first['y'], second['y']):
                    warnings.append(f'{label}: text boxes {first["id"]} and {second["id"]} overlap; check intent.')
    if inspected - ids or any(sid not in ids for sid in referenced_issues):
        errors.append('Review references nonexistent slide IDs.')
    if require_reviewed and not review['rendered']:
        errors.append('Final delivery requires rendering and inspection.')
    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan', type=Path)
    parser.add_argument('--brand', type=Path)
    parser.add_argument('--design', type=Path)
    parser.add_argument('--require-reviewed', action='store_true')
    args = parser.parse_args()
    try:
        path = args.plan.resolve()
        plan = json.loads(path.read_text(encoding='utf-8'))
        brand, fingerprint = None, None
        if args.brand:
            brand_path = args.brand.resolve()
            if brand_path.parent != path.parent:
                raise ValueError('Keep plan and brand profile in the same package root.')
            raw = brand_path.read_bytes()
            brand = json.loads(raw)
            errors, _ = validate_brand(brand, path.parent)
            if errors:
                raise ValueError('Invalid brand profile: ' + '; '.join(errors))
            fingerprint = hashlib.sha256(raw).hexdigest()
        errors, warnings = validate(plan, path.parent, brand, fingerprint, args.require_reviewed)
        if args.design:
            from validate_design import validate as validate_design, validate_binding
            design_path = args.design.resolve()
            if design_path.parent != path.parent:
                raise ValueError('Keep design system and plan in the same package root.')
            design = json.loads(design_path.read_text(encoding='utf-8'))
            de, dw = validate_design(design, path.parent, brand)
            errors.extend(de)
            warnings.extend(dw)
            if not de:
                errors.extend(validate_binding(plan, design))
    except (OSError, ValueError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return 1
    for warning in warnings:
        print(f'WARNING: {warning}')
    for error in errors:
        print(f'ERROR: {error}', file=sys.stderr)
    if errors:
        return 1
    print('Plan is structurally valid. Inspect the rendered final file.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
