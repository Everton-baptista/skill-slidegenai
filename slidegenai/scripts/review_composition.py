#!/usr/bin/env python3
"""Surface declared composition patterns for human/model judgment, not aesthetic scoring."""
import argparse
from collections import Counter
import json
from pathlib import Path
import sys
from validate_brand import nonempty


def review(plan, design=None):
    errors, warnings = [], []
    if not isinstance(plan, dict) or not isinstance(plan.get('slides'), list) or not plan['slides']:
        return ['Plan needs a nonempty slides array.'], []
    direction = design.get('art_direction') if isinstance(design, dict) else None
    if direction is not None:
        if not isinstance(direction, dict):
            errors.append('art_direction must be an object.')
        else:
            for key in ('concept', 'audience', 'register'):
                if not nonempty(direction.get(key)): errors.append(f'art_direction.{key} needs a concrete description.')
            for key in ('signature', 'fixed', 'flexible', 'avoid'):
                if not isinstance(direction.get(key), list) or any(not nonempty(x) for x in direction[key]):
                    errors.append(f'art_direction.{key} must be a string array.')
            organic = direction.get('organic')
            if organic is not None and (not isinstance(organic, dict) or type(organic.get('use')) is not bool or not nonempty(organic.get('reason'))):
                errors.append('art_direction.organic needs boolean use and a reason.')
    run, previous, repeated, images, densities = [], None, [], {}, []
    for index, slide in enumerate(plan['slides'], 1):
        if not isinstance(slide, dict):
            errors.append(f'Slide {index} must be an object.'); continue
        intent = slide.get('visual_intent')
        intentional = False
        if intent is not None:
            if not isinstance(intent, dict):
                errors.append(f'Slide {index}: visual_intent must be an object.')
            else:
                for key in ('purpose', 'focal_point', 'composition', 'rationale'):
                    if not nonempty(intent.get(key)): errors.append(f'Slide {index}: describe {key}.')
                if intent.get('density') not in ('sparse', 'balanced', 'dense'):
                    errors.append(f'Slide {index}: invalid declared density.')
                else: densities.append(intent['density'])
                if intent.get('image_role') not in ('none', 'evidence', 'context', 'metaphor', 'texture'):
                    errors.append(f'Slide {index}: invalid image_role.')
                if type(intent.get('organic')) is not bool: errors.append(f'Slide {index}: organic must be boolean.')
                if 'repeat_intent' in intent and not nonempty(intent['repeat_intent']): errors.append(f'Slide {index}: repeat_intent must explain the repetition.')
                intentional = nonempty(intent.get('repeat_intent'))
        layout = slide.get('layout')
        if nonempty(layout) and layout == previous:
            run.append((index, intentional))
        else:
            if len(run) >= 3 and not all(flag for _, flag in run): repeated.append([n for n, _ in run])
            run = [(index, intentional)] if nonempty(layout) else []
            previous = layout if nonempty(layout) else None
        for el in slide.get('elements', []) if isinstance(slide.get('elements'), list) else []:
            if isinstance(el, dict) and el.get('kind') == 'image' and nonempty(el.get('asset')) and not intentional:
                # Count slides, not repeated crop layers on the same slide.
                images.setdefault(el['asset'], set()).add(index)
    if len(run) >= 3 and not all(flag for _, flag in run): repeated.append([n for n, _ in run])
    for positions in repeated:
        warnings.append(f'Slides {positions}: same declared layout in sequence; inspect rhythm. Keep it if comparison, evidence, or fidelity warrants it.')
    for asset, positions in images.items():
        if len(positions) >= 3:
            warnings.append(f'Image {asset!r} repeats on slides {sorted(positions)}; inspect whether it is a deliberate anchor/background or generic reuse.')
    if len(densities) >= 4 and len(densities) == len(plan['slides']) and len(Counter(densities)) == 1:
        warnings.append('Every slide declares the same density; inspect the overview for meaningful pace. Consistency may be correct for this content.')
    return errors, warnings


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan',type=Path)
    parser.add_argument('--design',type=Path)
    args=parser.parse_args()
    try:
        plan=json.loads(args.plan.read_text(encoding='utf-8'))
        design=json.loads(args.design.read_text(encoding='utf-8')) if args.design else None
        if args.design and not isinstance(design,dict):raise ValueError('Design must be an object.')
        errors,warnings=review(plan,design)
    except (OSError,ValueError) as exc:
        print(f'ERROR: {exc}',file=sys.stderr);return 1
    for error in errors:print(f'ERROR: {error}',file=sys.stderr)
    for warning in warnings:print(f'REVIEW: {warning}')
    if errors:return 1
    print('Advisory review complete. No beauty, originality, or AI-authorship determination was made.')
    return 0


if __name__=='__main__':sys.exit(main())
