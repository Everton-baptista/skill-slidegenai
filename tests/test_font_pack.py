"""Offline font integrity, installation staging, and licensed ZIP retention."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
import zipfile

ROOT=Path(__file__).resolve().parents[1]
SCRIPTS=ROOT/'brand-presentations/scripts'
sys.path.insert(0,str(SCRIPTS))
from validate_fonts import validate, DEFAULT_ROOT
from install_fonts import stage
from package_brand import package

class FontPack(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)/'fonts';self.root.mkdir()
        m=json.loads((DEFAULT_ROOT/'manifest.json').read_text())
        f=next(f for f in m['families']if f['family']=='Inter')
        self.manifest=deepcopy(m);self.manifest.update(families=[f],application_families=['Inter'],system_font_alternatives={})
        shutil.copytree(DEFAULT_ROOT/f['directory'],self.root/f['directory'])
        self.write_manifest()
        css=(DEFAULT_ROOT/'fonts.css').read_text()
        (self.root/'fonts.css').write_text('\n'.join(line for line in css.splitlines()if "font-family: 'Inter'"in line)+'\n')
    def write_manifest(self):
        (self.root/'manifest.json').write_text(json.dumps(self.manifest))
    def test_complete_bundle_covers_app_and_pairings(self):
        report=validate(DEFAULT_ROOT)
        self.assertEqual((report['families'],report['font_files'],report['application_families']),(30,120,24))
        pairs=json.loads((ROOT/'brand-presentations/references/typography-pairings.json').read_text())
        names={f['family']for f in json.loads((DEFAULT_ROOT/'manifest.json').read_text())['families']}
        for p in pairs['pairings']:
            self.assertTrue({p['display'],p['body'],p['label']}<=names)
    def test_tampered_binary_is_rejected(self):
        p=self.root/self.manifest['families'][0]['files'][0]['path'];p.write_bytes(p.read_bytes()+b'changed')
        with self.assertRaises(ValueError):validate(self.root)
    def test_license_is_required_and_checked(self):
        p=self.root/self.manifest['families'][0]['license_file'];p.write_text('not a license')
        with self.assertRaises(ValueError):validate(self.root)
    def test_external_paths_are_rejected(self):
        self.manifest['families'][0]['files'][0]['path']='../outside.ttf';self.write_manifest()
        with self.assertRaises(ValueError):validate(self.root)
    def test_extra_binary_and_external_css_are_rejected(self):
        extra=self.root/'extra.ttf';extra.write_bytes(b'bad')
        with self.assertRaises(ValueError):validate(self.root)
        extra.unlink();(self.root/'fonts.css').write_text('@import url("https://example.com/font.css");')
        with self.assertRaises(ValueError):validate(self.root)
    def test_staging_is_dry_run_and_repeatable(self):
        dest=Path(self.temp.name)/'installed'
        self.assertFalse(stage(self.root,dest)['copied']);self.assertFalse(dest.exists())
        self.assertTrue(stage(self.root,dest,['Inter'],True)['copied'])
        self.assertEqual(len(list(dest.glob('*.ttf'))),2)
        self.assertTrue(stage(self.root,dest,['Inter'],True)['copied'])
    def test_staging_refuses_overwrite_before_copying(self):
        dest=Path(self.temp.name)/'installed';dest.mkdir()
        target=dest/Path(self.manifest['families'][0]['files'][1]['path']).name;target.write_bytes(b'user-file')
        with self.assertRaises(ValueError):stage(self.root,dest,install=True)
        self.assertEqual(list(dest.iterdir()),[target]);self.assertEqual(target.read_bytes(),b'user-file')
    def test_packager_retains_font_binaries_licenses_css_manifest(self):
        brand=Path(self.temp.name)/'brand';brand.mkdir()
        (brand/'SKILL.md').write_text('---\nname: aula-test\ndescription: Test fictional educational identity.\n---\nUse brand-profile.json.\n')
        shutil.copy2(ROOT/'examples/portable-deck/brand-profile.json',brand/'brand-profile.json')
        # The fictional profile references only its local logo and provenance.
        profile=json.loads((brand/'brand-profile.json').read_text());profile['logos']=[]
        (brand/'brand-profile.json').write_text(json.dumps(profile))
        shutil.copytree(self.root,brand/'assets/fonts')
        shutil.copy2(ROOT/'brand-presentations/LICENSE',brand/'LICENSE')
        shutil.copy2(ROOT/'brand-presentations/NOTICE.md',brand/'NOTICE.md')
        out=Path(self.temp.name)/'brand.zip';package(brand,out)
        with zipfile.ZipFile(out)as z:
            names=z.namelist()
            self.assertTrue(any(n.endswith('/LICENSE')for n in names))
            self.assertTrue(any(n.endswith('/NOTICE.md')for n in names))
            self.assertTrue(all('\\'not in n for n in names))
            for record in self.manifest['families'][0]['files']:
                self.assertTrue(any(n.endswith('assets/fonts/'+record['path'])for n in names))
            self.assertTrue(any(n.endswith('/OFL.txt')for n in names))
            self.assertTrue(any(n.endswith('assets/fonts/manifest.json')for n in names))
    def test_neutral_educational_entries_resolve(self):
        from find_templates import select
        c=json.loads((ROOT/'brand-presentations/references/template-catalog.json').read_text())
        for ident,title in [('aula','Aula'),('aula-moderno','Aula Moderno'),('aula-institucional','Aula Institucional')]:
            self.assertEqual(select(c,ident=ident)[0]['title'],title)

if __name__=='__main__':unittest.main()
