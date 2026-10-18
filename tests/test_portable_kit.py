"""Portable system, retention, artifact, editing, and continuation regressions."""
import copy
import hashlib
import io
import json
import re
import shutil
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'brand-presentations/scripts'))
from validate_design import validate, validate_binding
from validate_deck import validate as deck_validate
from package_brand import package
EXAMPLE=ROOT/'examples/portable-deck'
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','c':'http://schemas.openxmlformats.org/drawingml/2006/chart'}


class DesignSystem(unittest.TestCase):
    def setUp(self):
        self.design=json.loads((EXAMPLE/'design-system.json').read_text())
        self.brand=json.loads((EXAMPLE/'brand-profile.json').read_text())
        self.plan=json.loads((EXAMPLE/'deck-plan.json').read_text())

    def test_complete_system_and_binding(self):
        self.assertEqual(validate(self.design,EXAMPLE,self.brand)[0],[])
        self.assertEqual(validate_binding(self.plan,self.design),[])

    def test_units_must_match(self):
        self.plan['unit']='pt'
        self.assertTrue(validate_binding(self.plan,self.design))

    def test_legacy_plan_defaults_to_pixels(self):
        del self.plan['unit']
        self.assertEqual(validate_binding(self.plan,self.design),[])
        self.assertEqual(deck_validate(self.plan,EXAMPLE)[0],[])

    def test_invalid_unit(self):
        self.plan['unit']='inches'
        self.assertTrue(deck_validate(self.plan,EXAMPLE)[0])

    def test_measure_and_version_types(self):
        for value in (True,float('nan'),-1,10**400):
            self.design['canvas']['width']=value
            self.assertTrue(validate(self.design,EXAMPLE,self.brand)[0])
        self.design['version']=True
        self.assertTrue(validate(self.design,EXAMPLE,self.brand)[0])

    def test_color_type_role_and_bounds(self):
        for mutate in (
            lambda d:d['colors'].update(ink='green'),
            lambda d:d['layouts'][0]['slots'][0].update(type_role='unknown'),
            lambda d:d['layouts'][0]['slots'][0].update(width=9000),
            lambda d:d['typography']['body'].update(size=0),
        ):
            design=copy.deepcopy(self.design);mutate(design)
            self.assertTrue(validate(design,EXAMPLE,self.brand)[0])

    def test_duplicate_layout_and_slots(self):
        self.design['layouts'].append(copy.deepcopy(self.design['layouts'][0]))
        self.assertTrue(validate(self.design,EXAMPLE,self.brand)[0])
        self.design['layouts'].pop()
        self.design['layouts'][0]['slots'].append(copy.deepcopy(self.design['layouts'][0]['slots'][0]))
        self.assertTrue(validate(self.design,EXAMPLE,self.brand)[0])

    def test_evidence_source_and_logo(self):
        self.design['decisions'][0]['evidence']['source_id']='missing'
        self.assertTrue(validate(self.design,EXAMPLE,self.brand)[0])
        self.design['logo']['asset']='../outside.svg'
        self.assertTrue(validate(self.design,EXAMPLE,self.brand)[0])

    def test_unknown_layout_and_slot_binding(self):
        self.plan['slides'][0]['layout']='unknown'
        self.assertTrue(validate_binding(self.plan,self.design))
        self.plan['slides'][0]['layout']='opening'
        self.plan['slides'][0]['elements'][0]['slot_id']='unknown'
        self.assertTrue(validate_binding(self.plan,self.design))

    def test_slot_kind_mismatch(self):
        self.plan['slides'][0]['elements'][0].update(slot_id='label',kind='image')
        self.assertTrue(validate_binding(self.plan,self.design))

    def test_batches_retain_global_positions(self):
        continued=copy.deepcopy(self.plan)
        continued['slides']=continued['slides'][:4]+continued['slides'][4:]
        self.assertEqual(deck_validate(continued,EXAMPLE)[0],[])
        continued['slides'][4]['position']=1
        self.assertTrue(deck_validate(continued,EXAMPLE)[0])

    def test_mid_batch_cover_rejected_without_discarding_copy(self):
        continued=copy.deepcopy(self.plan)
        continued['slides'][4]['role']='cover'
        self.assertTrue(deck_validate(continued,EXAMPLE)[0])
        continued['slides'][4]['role']='content'
        self.assertEqual(deck_validate(continued,EXAMPLE)[0],[])


class Packaging(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.base=Path(self.temp.name);self.root=self.base/'fieldwork-presentations';self.root.mkdir()
        for name in ('brand-profile.json','design-system.json'):
            shutil.copyfile(EXAMPLE/name,self.root/name)
        shutil.copytree(EXAMPLE/'assets',self.root/'assets')
        (self.root/'references').mkdir()
        (self.root/'SKILL.md').write_text('---\nname: fieldwork-presentations\ndescription: Apply the fictional Fieldwork identity.\n---\nRead [profile](brand-profile.json) and [system](design-system.json).\n')

    def pack(self):return package(self.root,self.base/'out.zip')

    def test_design_tokens_filename_is_not_a_secret(self):
        (self.root/'references/design-tokens.json').write_text('{}')
        self.pack()

    def test_missing_markdown_link(self):
        with (self.root/'SKILL.md').open('a') as f:f.write('[missing](references/missing.md)')
        with self.assertRaises(ValueError):self.pack()

    def test_markdown_escape(self):
        (self.base/'outside.md').write_text('Not distributable')
        with (self.root/'SKILL.md').open('a') as f:f.write('[outside](../outside.md)')
        with self.assertRaises(ValueError):self.pack()

    def test_missing_helper_dependency(self):
        (self.root/'scripts').mkdir()
        (self.root/'scripts/helper.py').write_text('from validate_brand import validate\n')
        with self.assertRaises(ValueError):self.pack()

    def test_authorized_retained_pptx_and_preview(self):
        sources=self.root/'assets/references';sources.mkdir()
        shutil.copyfile(EXAMPLE/'example.pptx',sources/'reference.pptx')
        shutil.copyfile(EXAMPLE/'previews/slide-01.png',sources/'preview.png')
        entries=[{'path':'assets/references/'+name,'purpose':'Fictional reference for fidelity','distribution_authorized':True} for name in ('reference.pptx','preview.png')]
        (self.root/'references/retained-sources.json').write_text(json.dumps({'files':entries}))
        self.pack()
        unpack=self.base/'unpacked'
        with zipfile.ZipFile(self.base/'out.zip') as z:z.extractall(unpack)
        self.assertEqual(validate(json.loads((unpack/self.root.name/'design-system.json').read_text()),unpack/self.root.name,json.loads((unpack/self.root.name/'brand-profile.json').read_text()))[0],[])

    def test_retained_source_requires_authorization(self):
        shutil.copyfile(EXAMPLE/'example.pdf',self.root/'assets/reference.pdf')
        with self.assertRaises(ValueError):self.pack()
        (self.root/'references/retained-sources.json').write_text(json.dumps({'files':[{'path':'assets/reference.pdf','purpose':'reference','distribution_authorized':False}]}))
        with self.assertRaises(ValueError):self.pack()

    def test_missing_retained_file(self):
        (self.root/'references/retained-sources.json').write_text(json.dumps({'files':[{'path':'assets/no.pdf','purpose':'reference','distribution_authorized':True}]}))
        with self.assertRaises(ValueError):self.pack()

    def test_real_credential_filename_still_rejected(self):
        (self.root/'references/access-token.json').write_text('{}')
        with self.assertRaises(ValueError):self.pack()


class Artifact(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.zip=zipfile.ZipFile(EXAMPLE/'example.pptx')
        cls.parts=set(cls.zip.namelist())
    @classmethod
    def tearDownClass(cls):cls.zip.close()

    def test_eight_slides_and_no_dangling_overrides(self):
        self.assertEqual(len([n for n in self.parts if re.fullmatch(r'ppt/slides/slide\d+.xml',n)]),8)
        ct=ET.fromstring(self.zip.read('[Content_Types].xml'))
        for entry in ct:
            if entry.tag.endswith('Override'):self.assertIn(entry.attrib['PartName'].lstrip('/'),self.parts)

    def test_native_table_and_chart_values(self):
        slide=ET.fromstring(self.zip.read('ppt/slides/slide5.xml'))
        table=slide.find('.//a:tbl',NS);self.assertIsNotNone(table)
        self.assertEqual(len(table.findall('a:tr',NS)),4)
        chart=ET.fromstring(self.zip.read('ppt/charts/chart1.xml'))
        values=[x.text for x in chart.findall('.//c:val/c:numRef/c:numCache/c:pt/c:v',NS)]
        self.assertEqual(values,['32','48','65'])
        labels=[x.text for x in chart.findall('.//c:cat/c:strRef/c:strCache/c:pt/c:v',NS)]
        self.assertEqual(labels,['Week 1','Week 2','Week 3'])
        self.assertTrue(any(n.endswith('.xlsx') and 'embeddings/' in n for n in self.parts))

    def test_text_is_not_a_full_slide_image(self):
        for n in range(1,9):
            slide=ET.fromstring(self.zip.read(f'ppt/slides/slide{n}.xml'))
            self.assertTrue(slide.findall('.//a:t',NS))

    def test_focused_edit_preserves_unaffected_native_parts(self):
        # A scoped OOXML text-edit regression; not a native editor certification.
        name='ppt/slides/slide1.xml';original=self.zip.read(name)
        updated=original.replace(b'Learning',b'Teaching',1)
        self.assertNotEqual(original,updated)
        output=io.BytesIO()
        with zipfile.ZipFile(output,'w') as edited:
            for part in self.zip.infolist():edited.writestr(copy.copy(part),updated if part.filename==name else self.zip.read(part.filename))
        with zipfile.ZipFile(output) as edited:
            for part in self.parts:
                if part!=name:self.assertEqual(edited.read(part),self.zip.read(part))
            self.assertIn(b'Teaching',edited.read(name))

    def test_review_hash_and_previews(self):
        record=json.loads((EXAMPLE/'review.json').read_text())
        self.assertEqual(record['pptx_sha256'],hashlib.sha256((EXAMPLE/'example.pptx').read_bytes()).hexdigest())
        self.assertEqual(record['inspected_slides'],list(range(1,9)))
        for n in range(1,9):self.assertTrue((EXAMPLE/f'previews/slide-{n:02d}.png').read_bytes().startswith(b'\x89PNG'))


if __name__=='__main__':unittest.main()
