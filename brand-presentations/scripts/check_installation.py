#!/usr/bin/env python3
"""Check an installed skill's local resources offline; do not install or contact services."""
import argparse
import json
from pathlib import Path
import re
from urllib.parse import unquote
from plan_template import coverage
from validate_fonts import validate as validate_fonts

DEFAULT_ROOT = Path(__file__).resolve().parent.parent

def check(root):
    root = Path(root).resolve()
    for name in ('SKILL.md', 'LICENSE', 'NOTICE.md'):
        if not (root / name).is_file():
            raise ValueError('Missing installed resource: ' + name)
    manifest = (root / 'SKILL.md').read_text(encoding='utf-8')
    if not re.search(r'^name:\s*brand-presentations\s*$', manifest, re.M):
        raise ValueError('Unexpected installed skill name')
    links = 0
    for source in root.rglob('*.md'):
        text = source.read_text(encoding='utf-8')
        text = re.sub(r'```[^\n]*\n[\s\S]*?```', '', text)
        for target in re.findall(r'\]\(([^)]+)\)', text):
            target = target.strip().strip('<>')
            if target.startswith('#') or re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:', target):
                continue
            target = unquote(target.split('#', 1)[0])
            resolved = (source.parent / target).resolve()
            if not resolved.is_relative_to(root) or not resolved.is_file():
                raise ValueError('Missing or external local resource: ' + source.relative_to(root).as_posix() + ' -> ' + target)
            links += 1
    helpers = list((root / 'scripts').glob('*.py'))
    for helper in helpers:
        compile(helper.read_text(encoding='utf-8'), str(helper), 'exec')
    references = root / 'references'
    catalog, system, pairings = [json.loads((references / name).read_text(encoding='utf-8')) for name in ('template-catalog.json', 'template-system.json', 'typography-pairings.json')]
    templates = coverage(catalog, system, pairings)
    fonts = validate_fonts(root / 'assets/fonts')
    font_manifest = json.loads((root / 'assets/fonts/manifest.json').read_text(encoding='utf-8'))
    available = {family['family'] for family in font_manifest['families']}
    choices = list(system['families'].values()) + pairings['pairings']
    if any(choice[role] not in available for choice in choices for role in ('display', 'body', 'label')):
        raise ValueError('A suggested font family is missing from the bundle')
    return {'status': 'passed', 'local_markdown_links': links, 'python_helpers_compiled': len(helpers), 'catalog_entries_resolved': templates['resolved_entries'], 'fonts': fonts, 'limits': ['No OS font registration, external links, provider credentials, slide authoring, rendering or export were tested by this command.']}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', nargs='?', type=Path, default=DEFAULT_ROOT)
    args = parser.parse_args()
    try:
        print(json.dumps(check(args.root), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, SyntaxError) as exc:
        parser.error(str(exc))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
