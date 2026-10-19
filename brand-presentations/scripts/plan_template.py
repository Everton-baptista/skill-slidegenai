#!/usr/bin/env python3
"""Resolve any catalog style into shared construction guidance, not rendered slides."""
import argparse
from collections import Counter
from copy import deepcopy
import json
from pathlib import Path
from find_templates import select

REFERENCES = Path(__file__).resolve().parent.parent / 'references'

def load_resources():
    return tuple(json.loads((REFERENCES / f).read_text(encoding='utf-8')) for f in (
        'template-catalog.json', 'template-system.json', 'typography-pairings.json'))

def build_brief(row, system, pairings, mode='adaptation'):
    if mode not in ('adaptation', 'faithful'):
        raise ValueError('Unknown fidelity mode')
    if row['family'] not in system['families']:
        raise ValueError('Missing family recipe: ' + row['family'])
    recipe = deepcopy(system['families'][row['family']])
    override = next((p for p in pairings['pairings'] if p['source_id'] == row['id']), None)
    typography = {r: recipe.pop(r) for r in ('display', 'body', 'label')}
    if override:
        typography.update({r: override[r] for r in typography})
    return {
        'version': 1,
        'template': deepcopy(row),
        'fidelity_mode': mode,
        'construction': {
            'content_roles': list(system['content_roles']),
            'shared_rules': deepcopy(system['shared_rules']),
            'family_starting_point': recipe,
            'application': 'Select by content and source character; no fixed slide sequence or mandatory effect.'
        },
        'typography': {
            'suggested_families': typography,
            'suggestion_basis': 'named-style-example' if override else 'family-starting-point',
            'apply_suggestions': mode == 'adaptation',
            'availability': 'unverified-in-target-host',
            'fonts_bundled': False,
            'precedence': 'Explicit user choices and evidenced brand fonts override these inferred suggestions.'
        },
        'required_decisions': [
            'Inspect the specific source or permitted reference, beyond the family label.',
            'Resolve actual identity, fonts/weights, canvas, content and host capabilities.',
            'Measure layout regions for the actual narrative and review final rendered output.'
        ] + (['Obtain the original master or adequate reference; catalog metadata alone cannot reproduce it faithfully.'] if mode == 'faithful' else []),
        'validation': {
            'structural_scope': 'Shared planning contract',
            'rendered': False,
            'visual_quality': 'unverified',
            'host_compatibility': 'unverified'
        }
    }

def coverage(catalog, system, pairings):
    ids = [r['id'] for r in catalog['templates']]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate source IDs')
    briefs = [build_brief(r, system, pairings) for r in catalog['templates']]
    return {
        'catalog_entries': len(ids), 'resolved_entries': len(briefs),
        'families': dict(Counter(r['family'] for r in catalog['templates'])),
        'shared_content_roles': system['content_roles'],
        'meaning': 'All entries resolve to shared guidance. No slides are rendered or visually certified by this check.'
    }

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--id', help='Exact canonical source ID')
    group.add_argument('--name', help='Normalized source title, ID or visible preview label')
    group.add_argument('--coverage', action='store_true', help='Check structural planning coverage of the entire catalog')
    parser.add_argument('--mode', choices=('adaptation', 'faithful'), default='adaptation')
    args = parser.parse_args()
    catalog, system, pairings = load_resources()
    try:
        if args.coverage:
            result = coverage(catalog, system, pairings)
        else:
            rows = select(catalog, ident=args.id, name=args.name)
            if not rows:
                parser.error('No matching source template')
            if len(rows) != 1:
                parser.error('Ambiguous source name; use --id: ' + ', '.join(r['id'] for r in rows))
            result = build_brief(rows[0], system, pairings, args.mode)
    except ValueError as exc:
        parser.error(str(exc))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
