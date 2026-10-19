"""Generic ZIP distribution must survive independent extraction, offline."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'slidegenai/scripts'))
from package_skill import package, inventory
from install_fonts import stage

class GenericPackage(unittest.TestCase):
    def test_complete_zip_installs_independently_with_exact_original_bytes(self):
        source = ROOT / 'slidegenai'
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            target = temp / 'dist/slidegenai.zip'
            report = package(source, target)
            self.assertEqual(report['installation']['skill_version'], (source / 'VERSION').read_text().strip())
            self.assertEqual(report['sha256'], hashlib.sha256(target.read_bytes()).hexdigest())
            with zipfile.ZipFile(target) as z:
                expected = {'slidegenai/' + p.relative_to(source).as_posix() for p in inventory(source)}
                self.assertEqual(set(z.namelist()), expected)
                self.assertIsNone(z.testzip())
                self.assertEqual(report['uncompressed_bytes'], sum(i.file_size for i in z.infolist()))
                z.extractall(temp / 'installed')
            installed = temp / 'installed/slidegenai'
            for p in inventory(source):
                self.assertEqual(p.read_bytes(), (installed / p.relative_to(source)).read_bytes())
            result = subprocess.run([sys.executable, '-B', str(installed / 'scripts/check_installation.py')],
                                    cwd=temp, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout)['fonts']['font_files'], 140)
            before = target.read_bytes()
            with self.assertRaises(FileExistsError):
                package(source, target)
            self.assertEqual(target.read_bytes(), before)

    def test_claude_profile_retains_families_licenses_and_valid_resources_under_limit(self):
        source = ROOT / 'slidegenai'
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / 'claude.zip'
            report = package(source, output, 'claude-ai')
            with zipfile.ZipFile(output) as z:
                self.assertLess(sum(i.file_size for i in z.infolist()), 29_000_000)
                z.extractall(Path(temp) / 'installed')
                manifest = json.loads(z.read('slidegenai/assets/fonts/manifest.json'))
                self.assertEqual(len(manifest['families']), 46)
                self.assertLess(report['installation']['fonts']['font_files'], 140)
                self.assertTrue(report['distribution']['omitted_font_files'])
                for family in manifest['families']:
                    for record in family['files']:
                        name = 'assets/fonts/' + record['path']
                        self.assertEqual(z.read('slidegenai/' + name), (source / 'assets/fonts' / record.get('source_path', record['path'])).read_bytes())
                        self.assertRegex(record['path'], r'^[a-z0-9/-]+\.ttf$')
                    license_name = 'assets/fonts/' + family['license_file']
                    self.assertEqual(z.read('slidegenai/' + license_name), (source / license_name).read_bytes())
            installed = Path(temp) / 'installed/slidegenai'
            result = subprocess.run([sys.executable, '-B', str(installed / 'scripts/check_installation.py')],
                                    cwd=temp, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout)['fonts']['families'], 46)
            if shutil.which('node'):
                built = subprocess.run(['node', str(installed / 'assets/visual-kit/build.mjs'),
                    '--plan', str(ROOT / 'examples/portable-deck/deck-plan.json'),
                    '--design', str(ROOT / 'examples/portable-deck/design-system.json'),
                    '--format', 'html', '--out', str(Path(temp) / 'offline-output')],
                    cwd=temp, capture_output=True, text=True, encoding='utf-8')
                self.assertEqual(built.returncode, 0, built.stderr)
                self.assertTrue((Path(temp) / 'offline-output/presentation.html').is_file())
            self.assertEqual(len(list((source / 'assets/fonts').rglob('*.ttf'))), 140)
            staged = Path(temp) / 'registered-font-files'
            stage(installed / 'assets/fonts', staged, install=True)
            self.assertEqual(len(list(staged.glob('*.ttf'))), report['installation']['fonts']['font_files'])

    def test_relative_source_path_is_supported_by_cli(self):
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / 'skill.zip'
            result = subprocess.run([sys.executable, '-B', 'slidegenai/scripts/package_skill.py',
                                     '--root', 'slidegenai', '--output', str(output)],
                                    cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(output.is_file())

    def test_generated_cache_is_excluded(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            cache = root / 'scripts/__pycache__'
            cache.mkdir(parents=True)
            (cache / 'x.pyc').write_bytes(b'bytecode')
            (root / '.DS_Store').write_bytes(b'metadata')
            self.assertEqual(inventory(root), [])

    def test_rejects_unsafe_and_unexpected_entries_without_writing_output(self):
        for entry in ('references/.env', 'scripts/private.pyc', 'references/api-key.json', 'app/source.py', 'references/run.exe', 'assets/visual-kit/surprise.mjs', 'assets/visual-kit/node_modules/library/index.js'):
            with self.subTest(entry=entry), tempfile.TemporaryDirectory() as temp:
                root = Path(temp) / 'skill'
                path = root / entry
                path.parent.mkdir(parents=True)
                path.write_text('private')
                with self.assertRaises(ValueError):
                    package(root, Path(temp) / 'output.zip')
                self.assertFalse((Path(temp) / 'output.zip').exists())

    def test_legitimate_token_filename_is_allowed(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'references').mkdir()
            file = root / 'references/design-tokens.json'
            file.write_text('{}')
            self.assertEqual(inventory(root), [file])

    def test_missing_reference_prevents_archive_creation(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / 'skill'
            shutil.copytree(ROOT / 'slidegenai', root, ignore=shutil.ignore_patterns('__pycache__'))
            (root / 'references/claude-ai.md').unlink()
            with self.assertRaisesRegex(ValueError, 'Missing or external local resource'):
                package(root, Path(temp) / 'output.zip')
            self.assertFalse((Path(temp) / 'output.zip').exists())

    def test_output_inside_skill_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'outside'):
            package(ROOT / 'slidegenai', ROOT / 'slidegenai/accidental.zip')

    @unittest.skipIf(sys.platform == 'win32', 'Windows symlinks may require developer privileges')
    def test_symlink_source_or_resource_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'linked').symlink_to(ROOT / 'slidegenai', target_is_directory=True)
            with self.assertRaises(ValueError):
                inventory(root / 'linked')
            (root / 'references').mkdir()
            (root / 'references/external.md').symlink_to(ROOT / 'README.md')
            with self.assertRaises(ValueError):
                inventory(root)

if __name__ == '__main__':
    unittest.main()
