"""First-use resource checks survive copying only the installable skill folder."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'slidegenai/scripts'))
from check_installation import check

class Installation(unittest.TestCase):
    def test_resource_check_runs_from_an_independent_installed_copy(self):
        with tempfile.TemporaryDirectory()as temp:
            dest=Path(temp)/'slidegenai'
            shutil.copytree(ROOT/'slidegenai',dest,ignore=shutil.ignore_patterns('__pycache__'))
            result=subprocess.run([sys.executable,'-B',str(dest/'scripts/check_installation.py')],cwd=temp,capture_output=True,text=True,encoding='utf-8')
            self.assertEqual(result.returncode,0,result.stderr)
            report=json.loads(result.stdout)
            self.assertEqual(report['catalog_entries_resolved'],177)
            self.assertEqual(report['fonts']['font_files'],140)
            self.assertTrue((dest/'LICENSE').is_file())
            self.assertTrue((dest/'NOTICE.md').is_file())
            self.assertFalse((dest/'scripts/__pycache__').exists())
    def test_missing_referenced_resource_is_reported(self):
        with tempfile.TemporaryDirectory()as temp:
            dest=Path(temp)/'slidegenai'
            shutil.copytree(ROOT/'slidegenai',dest,ignore=shutil.ignore_patterns('__pycache__'))
            (dest/'references/font-pack.md').unlink()
            with self.assertRaisesRegex(ValueError,'Missing or external local resource'):
                check(dest)
    def test_missing_license_is_reported(self):
        with tempfile.TemporaryDirectory()as temp:
            dest=Path(temp)
            (dest/'SKILL.md').write_text('---\nname: slidegenai\n---\n',encoding='utf-8')
            with self.assertRaisesRegex(ValueError,'LICENSE'):
                check(dest)

if __name__=='__main__':unittest.main()
