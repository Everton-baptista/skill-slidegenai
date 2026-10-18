"""Regression checks of actual chart/workbook/connector preservation, not visual scores."""
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET
import zipfile

ROOT=Path(__file__).resolve().parents[1]
EXAMPLE=ROOT/'examples/analytical-patterns'
SCRIPTS=ROOT/'brand-presentations/scripts'

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path);value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value);return value

checker=module('analytical_checker',EXAMPLE/'check_pptx.py')
visuals=module('visual_validator',SCRIPTS/'validate_visuals.py')
finder=module('template_finder',SCRIPTS/'find_templates.py')

def rewrite(data,part,transform):
    target=io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(data)) as old,zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as new:
        for info in old.infolist():
            value=old.read(info.filename)
            new.writestr(info,transform(value) if info.filename==part else value)
    return target.getvalue()

class AnalyticalArtifacts(unittest.TestCase):
    def altered_fails(self,change,pattern,strict=False):
        with tempfile.TemporaryDirectory() as temp:
            p=Path(temp)/'changed.pptx';p.write_bytes(change((EXAMPLE/'example.pptx').read_bytes()))
            with self.assertRaisesRegex(AssertionError,pattern):checker.check(p,strict)

    def test_native_artifact_matches_semantic_source(self):
        self.assertEqual(checker.check(EXAMPLE/'example.pptx',True),dict(slides=10,charts=4,tables=1,connector_segments=16,free_line_segments=0,attached_segments=16))

    def test_changed_chart_cache_is_detected(self):
        def change(data):
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                part=next(n for n in z.namelist() if n.endswith('/chart1.xml'))
            def corrupt(xml):
                tree=ET.fromstring(xml);tree.find('.//c:ser/c:val//c:pt/c:v',checker.NS).text='999';return ET.tostring(tree)
            return rewrite(data,part,corrupt)
        self.altered_fails(change,'Chart cache differs')

    def test_changed_workbook_with_unchanged_cache_is_detected(self):
        def change(data):
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                part=next(n for n in z.namelist() if n.endswith('/chart1.xml'));tree=ET.fromstring(z.read(part));ref=tree.find('c:externalData',checker.NS).get('{'+checker.NS['r']+'}id');book=checker.rels(z,part)[ref]
            def workbook(content):
                with zipfile.ZipFile(io.BytesIO(content)) as z:
                    wb=ET.fromstring(z.read('xl/workbook.xml'));ref=wb.find('s:sheets/s:sheet',checker.NS).get('{'+checker.NS['r']+'}id');sheet=checker.rels(z,'xl/workbook.xml')[ref]
                def corrupt(xml):
                    tree=ET.fromstring(xml);cell=next(c for c in tree.findall('.//s:c',checker.NS) if c.get('r')=='B2');cell.find('s:v',checker.NS).text='999';return ET.tostring(tree)
                return rewrite(content,sheet,corrupt)
            return rewrite(data,book,workbook)
        self.altered_fails(change,'Workbook differs')

    def test_partial_connector_attachment_loss_is_detected(self):
        def corrupt(xml):
            tree=ET.fromstring(xml);prop=tree.find('.//p:cxnSp/p:nvCxnSpPr/p:cNvCxnSpPr',checker.NS);prop.remove(prop.find('a:stCxn',checker.NS));return ET.tostring(tree)
        self.altered_fails(lambda data:rewrite(data,'ppt/slides/slide5.xml',corrupt),'attached native connectors',True)

    def test_complete_canonical_model_validates(self):
        source=json.loads((ROOT/'brand-presentations/references/visual-model-example.json').read_text());self.assertEqual(visuals.validate(source),[])
        layout=json.loads((EXAMPLE/'layout.json').read_text());self.assertEqual({s['visual_id'] for s in layout['slides'] if s['kind']=='chart'},{c['id'] for c in source['charts']});self.assertEqual({s['visual_id'] for s in layout['slides'] if s['kind']!='chart' and s['kind']!='table'},{d['id'] for d in source['diagrams']})

    def test_deep_valid_graph_does_not_use_recursive_cycle_walk(self):
        n=2500;d={'id':'large','type':'hierarchy','source':{'status':'illustrative','label':'Fictional example'},'nodes':[{'id':str(i),'label':str(i)} for i in range(n)],'edges':[{'from':str(i),'to':str(i+1),'label':'Reports','directed':True} for i in range(n-1)]}
        self.assertEqual(visuals.validate({'version':1,'diagrams':[d]}),[]);d['edges'].append({'from':str(n-1),'to':'0','label':'Cycle','directed':True});self.assertTrue(visuals.validate({'version':1,'diagrams':[d]}))

    def test_catalog_lookup_filters_without_dropping_metadata(self):
        catalog=json.loads((ROOT/'brand-presentations/references/template-catalog.json').read_text());row=catalog['templates'][0]
        self.assertEqual(finder.select(catalog,ident=row['id']),[row]);self.assertTrue(all(r['family']==row['family'] for r in finder.select(catalog,family=row['family'])));self.assertTrue(all(row['suggested_patterns'][0] in r['suggested_patterns'] for r in finder.select(catalog,pattern=row['suggested_patterns'][0])));self.assertEqual(finder.select(catalog,ident='nonexistent-template'),[])

if __name__=='__main__':unittest.main()
