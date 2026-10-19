"""The shared planner covers non-demo styles without treating hints as restrictions."""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'brand-presentations/scripts'))
from plan_template import build_brief, coverage, load_resources

class AllTemplateConstruction(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog, cls.system, cls.pairings = load_resources()

    def test_every_catalog_entry_resolves_with_the_shared_repertoire(self):
        self.assertEqual(len(self.catalog['templates']), 177)
        for row in self.catalog['templates']:
            with self.subTest(style=row['id']):
                brief = build_brief(row, self.system, self.pairings)
                self.assertEqual(brief['template'], row)
                self.assertEqual(brief['construction']['content_roles'], self.system['content_roles'])
                self.assertEqual(brief['construction']['shared_rules'], self.system['shared_rules'])
                self.assertFalse(brief['validation']['rendered'])
                self.assertFalse(brief['typography']['fonts_bundled'])
                self.assertEqual(set(brief['typography']['suggested_families']), {'display','body','label'})

    def test_non_demo_uses_family_starting_point_without_renaming_the_style(self):
        row = next(r for r in self.catalog['templates'] if r['id'] == 'watercolor')
        brief = build_brief(row, self.system, self.pairings)
        self.assertEqual(brief['typography']['suggestion_basis'], 'family-starting-point')
        self.assertEqual(brief['template']['source_description'], row['source_description'])
        self.assertEqual(brief['template']['id'], 'watercolor')
        self.assertIn('data', brief['construction']['content_roles'])

    def test_faithful_mode_never_applies_inferred_font_suggestions(self):
        for row in self.catalog['templates']:
            with self.subTest(style=row['id']):
                brief = build_brief(row, self.system, self.pairings, 'faithful')
                self.assertFalse(brief['typography']['apply_suggestions'])
                self.assertEqual(len(brief['required_decisions']), 4)

    def test_source_gaps_are_preserved_without_certification(self):
        for row in self.catalog['templates']:
            if not row['source_rule_present']:
                brief = build_brief(row, self.system, self.pairings)
                self.assertFalse(brief['template']['source_rule_present'])
                self.assertEqual(brief['validation']['host_compatibility'], 'unverified')

    def test_brief_changes_do_not_mutate_source_or_shared_resources(self):
        row = self.catalog['templates'][0]
        originals = deepcopy((row, self.system, self.pairings))
        brief = build_brief(row, self.system, self.pairings)
        brief['template']['suggested_patterns'].append('test-only')
        brief['construction']['shared_rules']['typography'] = 'test-only'
        self.assertEqual((row, self.system, self.pairings), originals)

    def test_new_family_requires_an_explicit_starting_recipe(self):
        row = dict(self.catalog['templates'][0], family='unknown-family')
        with self.assertRaises(ValueError):
            build_brief(row, self.system, self.pairings)

    def test_coverage_reports_planning_not_rendered_decks(self):
        result = coverage(self.catalog, self.system, self.pairings)
        self.assertEqual(result['resolved_entries'], 177)
        self.assertEqual(set(result['families']), set(self.system['families']))

    def test_cli_returns_other_styles_and_rejects_unknown_ids(self):
        script = ROOT / 'brand-presentations/scripts/plan_template.py'
        result = subprocess.run([sys.executable, str(script), '--id', 'swiss'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)['template']['id'], 'swiss')
        result = subprocess.run([sys.executable, str(script), '--id', 'not-a-template'], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout, '')

if __name__ == '__main__':
    unittest.main()
