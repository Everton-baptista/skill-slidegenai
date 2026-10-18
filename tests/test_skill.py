"""Regression tests for portable contracts; no model calls or rendering claims."""
import copy
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / 'brand-presentations' / 'scripts'
sys.path.insert(0, str(SCRIPTS))
from validate_brand import validate as brand_validate
from validate_deck import validate as deck_validate, contrast
from package_brand import package


class Contracts(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.brand = json.loads((ROOT / 'examples/demo-brand/brand-profile.json').read_text(encoding='utf-8'))
        self.plan = json.loads((ROOT / 'examples/demo-brand/deck-plan.json').read_text(encoding='utf-8'))
        (self.root / 'assets').mkdir()
        (self.root / 'assets/demo-mark.svg').write_bytes((ROOT / 'examples/demo-brand/assets/demo-mark.svg').read_bytes())
        self.fingerprint = self.plan['brand_profile_sha256']

    def b(self):
        return brand_validate(self.brand, self.root)

    def d(self, final=False):
        return deck_validate(self.plan, self.root, self.brand, self.fingerprint, final)

    def test_valid_example(self):
        self.assertEqual(self.b()[0], [])
        self.assertTrue(self.b()[1])  # Unknown font is intentionally disclosed.
        self.assertEqual(self.d()[0], [])

    def test_profile_hash_matches_exact_fixture(self):
        self.assertEqual(hashlib.sha256((ROOT / 'examples/demo-brand/brand-profile.json').read_bytes()).hexdigest(), self.fingerprint)

    def test_invalid_profile_roots_and_versions(self):
        for value in ([], None, 'invalid'):
            self.assertTrue(brand_validate(value, self.root)[0])
        for value in (True, 2, '1'):
            self.brand['version'] = value
            self.assertTrue(self.b()[0])

    def test_invalid_profile_arrays(self):
        for key in ('sources', 'palette', 'typography', 'logos', 'rules', 'gaps'):
            saved = self.brand[key]
            self.brand[key] = {}
            self.assertTrue(self.b()[0], key)
            self.brand[key] = saved

    def test_duplicate_source(self):
        self.brand['sources'].append(copy.deepcopy(self.brand['sources'][0]))
        self.assertTrue(self.b()[0])

    def test_unknown_evidence_source(self):
        self.brand['palette'][0]['evidence']['source_id'] = 'missing'
        self.assertTrue(self.b()[0])

    def test_user_approved_null_source(self):
        self.brand['palette'][0]['evidence'].update(status='user-approved', source_id=None)
        self.assertEqual(self.b()[0], [])

    def test_invalid_evidence_types(self):
        for value in ([], {}, None, True):
            self.brand['imagery']['evidence']['status'] = value
            self.assertTrue(self.b()[0])

    def test_invalid_color(self):
        self.brand['palette'][0]['hex'] = 'red'
        self.assertTrue(self.b()[0])

    def test_invalid_fallback(self):
        self.brand['typography'][0]['fallback'] = []
        self.assertTrue(self.b()[0])

    def test_missing_logo(self):
        self.brand['logos'][0]['path'] = 'missing.png'
        self.assertTrue(self.b()[0])

    def test_escaping_and_malformed_paths(self):
        for value in ('../outside.png', str(self.root / 'assets/demo-mark.svg'), 'bad\x00path', []):
            self.brand['logos'][0]['path'] = value
            self.assertTrue(self.b()[0])
            self.plan['slides'][0]['elements'][1]['asset'] = value
            self.assertTrue(self.d()[0])

    def test_symlink_outside(self):
        outside = self.root.parent / (self.root.name + '-outside.svg')
        outside.write_text('<svg/>')
        self.addCleanup(lambda: outside.unlink(missing_ok=True))
        try:
            (self.root / 'assets/link.svg').symlink_to(outside)
        except OSError:
            self.skipTest('Symlink creation not permitted on this platform')
        self.brand['logos'][0]['path'] = 'assets/link.svg'
        self.assertTrue(self.b()[0])

    def test_svg_external_dependency_warning(self):
        (self.root / 'assets/demo-mark.svg').write_text('<svg><image href="other.png"/></svg>')
        self.assertTrue(any('resource' in w for w in self.b()[1]))

    def test_svg_active_content_rejected(self):
        (self.root / 'assets/demo-mark.svg').write_text('<svg><script>alert(1)</script></svg>')
        self.assertTrue(self.b()[0])

    def test_deck_roots_and_versions(self):
        for value in ([], None, 'invalid'):
            self.assertTrue(deck_validate(value, self.root)[0])
        self.plan['version'] = True
        self.assertTrue(self.d()[0])

    def test_count_and_position(self):
        self.plan['expected_slides'] = 2
        self.assertTrue(self.d()[0])
        self.plan['expected_slides'] = 1
        self.plan['slides'][0]['position'] = 0
        self.assertTrue(self.d()[0])

    def test_duplicate_slide_and_element_ids(self):
        self.plan['slides'].append(copy.deepcopy(self.plan['slides'][0]))
        self.plan['expected_slides'] = 2
        self.plan['slides'][1].update(position=2, role='content')
        self.assertTrue(any('id' in e for e in self.d()[0]))
        self.plan['slides'] = self.plan['slides'][:1]
        self.plan['expected_slides'] = 1
        self.plan['slides'][0]['elements'][1]['id'] = 'heading'
        self.assertTrue(self.d()[0])

    def test_bad_ids_do_not_crash(self):
        self.plan['slides'][0].update(id=[], status='verified')
        self.assertTrue(self.d(final=True)[0])
        self.plan['slides'][0]['elements'][0]['id'] = {}
        self.assertTrue(self.d()[0])

    def test_invalid_geometry(self):
        for value in (float('nan'), float('inf'), 10**400, -1, True, '64'):
            self.plan['slides'][0]['elements'][0]['x'] = value
            self.assertTrue(self.d()[0])

    def test_zero_coordinate_is_valid(self):
        self.plan['slides'][0]['elements'][0]['x'] = 0
        self.assertEqual(self.d()[0], [])

    def test_outside_canvas(self):
        self.plan['slides'][0]['elements'][0]['width'] = 5000
        self.assertTrue(self.d()[0])

    def test_section_needs_topic(self):
        self.plan['slides'][0]['role'] = 'section'
        self.assertTrue(self.d()[0])

    def test_data_citation(self):
        self.plan['slides'][0].update(role='data', data_status='sourced')
        self.assertTrue(self.d()[0])
        self.plan['slides'][0]['citation'] = 'User-supplied report, page 4'
        self.assertEqual(self.d()[0], [])

    def test_illustrative_data_warns(self):
        self.plan['slides'][0].update(role='data', data_status='illustrative')
        self.assertTrue(any('illustrative' in w for w in self.d()[1]))

    def test_brand_hash_drift(self):
        self.plan['brand_profile_sha256'] = '0' * 64
        self.assertTrue(self.d()[0])

    def test_contrast_reference_values(self):
        self.assertAlmostEqual(contrast('#000000', '#FFFFFF'), 21)
        self.assertAlmostEqual(contrast('#FFFFFF', '#FFFFFF'), 1)
        self.plan['slides'][0]['elements'][0]['color'] = '#FFFFFF'
        self.assertTrue(any('contrast' in w for w in self.d()[1]))

    def test_text_overlap_warns(self):
        el = copy.deepcopy(self.plan['slides'][0]['elements'][0])
        el['id'] = 'overlap'
        self.plan['slides'][0]['elements'].append(el)
        self.assertTrue(any('overlap' in w for w in self.d()[1]))

    def test_unknown_logo_rejected(self):
        self.brand['logos'] = []
        self.assertTrue(self.d()[0])

    def test_review_claim_requires_evidence_record(self):
        self.plan['slides'][0]['status'] = 'verified'
        self.assertTrue(self.d()[0])
        self.plan['review'].update(rendered=True, inspected_slide_ids=['s01'])
        self.assertEqual(self.d(final=True)[0], [])

    def test_review_blocker(self):
        self.plan['slides'][0]['status'] = 'verified'
        self.plan['review'].update(rendered=True, inspected_slide_ids=['s01'], issues=[{'slide_id':'s01','severity':'blocking','message':'Clipped heading'}])
        self.assertTrue(self.d(final=True)[0])

    def test_review_unknown_slide(self):
        self.plan['review'].update(rendered=True, inspected_slide_ids=['unknown'])
        self.assertTrue(self.d()[0])

    def test_draft_not_final(self):
        self.assertTrue(self.d(final=True)[0])

    def make_package(self):
        (self.root / 'brand-profile.json').write_text(json.dumps(self.brand))
        (self.root / 'SKILL.md').write_text('---\nname: demo-presentations\ndescription: Use a fictional demo identity.\n---\nRead brand-profile.json.\n')
        return self.root.parent / (self.root.name + '.zip')

    def test_package_roundtrip_and_no_overwrite(self):
        output = self.make_package()
        self.addCleanup(lambda: output.unlink(missing_ok=True))
        count, _ = package(self.root, output)
        self.assertEqual(count, 3)
        with zipfile.ZipFile(output) as archive:
            self.assertEqual(len(archive.namelist()), 3)
            self.assertTrue(all(name.startswith(self.root.name + '/') for name in archive.namelist()))
        with self.assertRaises(FileExistsError):
            package(self.root, output)

    def test_package_refuses_unsafe_files(self):
        output = self.make_package()
        for name in ('.env', 'credentials.json', 'assets/private-key.png', 'unexpected.txt'):
            path = self.root / name
            path.write_text('fixture only')
            with self.assertRaises(ValueError, msg=name):
                package(self.root, output)
            path.unlink()

    def test_package_refuses_symlinks(self):
        output = self.make_package()
        try:
            (self.root / 'assets/link.svg').symlink_to(self.root / 'assets/demo-mark.svg')
        except OSError:
            self.skipTest('Symlink creation not permitted on this platform')
        with self.assertRaises(ValueError):
            package(self.root, output)

    def test_package_refuses_internal_output(self):
        self.make_package()
        with self.assertRaises(ValueError):
            package(self.root, self.root / 'archive.zip')

    def test_package_requires_brand_manifest(self):
        output = self.make_package()
        (self.root / 'SKILL.md').write_text('No manifest')
        with self.assertRaises(ValueError):
            package(self.root, output)

    def test_cli_malformed_json_fails_cleanly(self):
        bad = self.root / 'bad.json'
        bad.write_text('{')
        for script in ('validate_brand.py', 'validate_deck.py'):
            result = subprocess.run([sys.executable, '-B', str(SCRIPTS / script), str(bad)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertIn('ERROR:', result.stderr)
            self.assertNotIn('Traceback', result.stderr)


class Distribution(unittest.TestCase):
    def test_local_markdown_links(self):
        for path in ROOT.rglob('*.md'):
            for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
                if '://' in target or target.startswith('#'):
                    continue
                target = target.split('#')[0]
                self.assertTrue((path.parent / target).exists(), f'{path}: {target}')

    def test_manifest_and_metadata(self):
        manifest = (ROOT / 'brand-presentations/SKILL.md').read_text(encoding='utf-8')
        self.assertTrue(manifest.startswith('---\nname: brand-presentations\n'))
        self.assertIn('description:', manifest)
        self.assertIn('$brand-presentations', (ROOT / 'brand-presentations/agents/openai.yaml').read_text(encoding='utf-8'))
        self.assertLess(len(manifest.splitlines()), 500)

    def test_distribution_has_no_symlinks_or_credentials(self):
        for path in ROOT.rglob('*'):
            self.assertFalse(path.is_symlink(), str(path))
            self.assertNotEqual(path.name, '.env')
            if path.is_file() and path.suffix in ('.md', '.py', '.json', '.yaml', '.yml'):
                content = path.read_text(encoding='utf-8')
                self.assertFalse(re.search(r'sk-proj-[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', content), str(path))


if __name__ == '__main__':
    unittest.main()
