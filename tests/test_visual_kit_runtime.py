"""Run actual dependency-free JavaScript behavior, including offline authoring."""
from pathlib import Path
import shutil
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]

class VisualKit(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Optional visual kit requires Node.js 20+')
    def test_runtime(self):
        result = subprocess.run(['node', '--test', 'tests/test_visual_kit.mjs'], cwd=ROOT,
                                capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

if __name__ == '__main__':
    unittest.main()
