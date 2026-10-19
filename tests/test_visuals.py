"""Semantic evidence regressions, independent of a specific presentation engine."""
import copy
import json
from pathlib import Path
import sys
import unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'slidegenai/scripts'))
from validate_visuals import validate
SRC={'status':'illustrative','label':'Fictional example'}

def model(c):return {'version':1,'charts':[dict(id='c',type='bar',unit='units',source=SRC,baseline=0,categories=['A','B'],series=[{'name':'S','values':[0,3]}]) | c]}
def flow():return {'version':1,'diagrams':[{'id':'flow','type':'decision-flow','source':SRC,'nodes':[{'id':'a','label':'Start','role':'start'},{'id':'b','label':'Ready?','role':'decision'},{'id':'c','label':'Finish','role':'end'},{'id':'d','label':'Stop','role':'end'}],'edges':[{'from':'a','to':'b','label':'Review','directed':True},{'from':'b','to':'c','label':'Yes','directed':True},{'from':'b','to':'d','label':'No','directed':True}]}]}
class VisualModels(unittest.TestCase):
    def test_zero_is_real_data(self):self.assertEqual(validate(model({})),[])
    def test_bad_category_lengths(self):self.assertTrue(validate(model({'categories':['A']})))
    def test_nonfinite_and_boolean_values(self):
        for v in (True,float('nan'),float('inf'),10**400):self.assertTrue(validate(model({'series':[{'name':'S','values':[0,v]}]})))
    def test_missing_values_need_explicit_gap(self):
        c={'type':'line','series':[{'name':'S','values':[None,3]}]};self.assertTrue(validate(model(c)));c['missing_policy']='gap';self.assertEqual(validate(model(c)),[])
    def test_bar_baseline(self):self.assertTrue(validate(model({'baseline':2})))
    def test_stacked_share_reconciles_by_category(self):
        c={'type':'stacked-share','unit':'%','series':[{'name':'A','values':[40,60]},{'name':'B','values':[60,40]}]};self.assertEqual(validate(model(c)),[]);c['series'][1]['values'][0]=59;self.assertTrue(validate(model(c)))
    def test_negative_parts_fail_but_negative_bars_are_valid(self):
        c={'series':[{'name':'S','values':[-1,3]}]};self.assertEqual(validate(model(c)),[]);c['type']='pie';self.assertTrue(validate(model(c)))
    def test_scatter_requires_real_pairs(self):
        c={'type':'scatter','x_unit':'hours','y_unit':'units','series':[{'name':'S','points':[{'x':2,'y':6},{'x':3,'y':4}]}]};self.assertEqual(validate(model(c)),[]);del c['series'][0]['points'][0]['x'];self.assertTrue(validate(model(c)))
    def test_bubbles_have_positive_size(self):self.assertTrue(validate(model({'type':'bubble','x_unit':'x','y_unit':'y','series':[{'name':'S','points':[{'x':1,'y':2,'size':0}]}]})))
    def test_scales_and_waterfall(self):
        self.assertTrue(validate(model({'type':'gauge','minimum':0,'maximum':10,'value':11})))
        self.assertTrue(validate(model({'type':'radar'})))
        c={'type':'waterfall','opening':20,'changes':[{'name':'Loss','value':-3},{'name':'Gain','value':5}],'closing':22};self.assertEqual(validate(model(c)),[]);c['closing']=25;self.assertTrue(validate(model(c)))
    def test_source_declarations(self):
        for s in ({'status':'sourced'},{'status':'illustrative'},{'status':'invented','label':'No'}):self.assertTrue(validate(model({'source':s})))
    def test_flow_branches_and_endpoints(self):
        f=flow();self.assertEqual(validate(f),[]);f['diagrams'][0]['edges'][2]['to']='missing';self.assertTrue(validate(f))
    def test_decision_branch_labels_are_distinct(self):
        f=flow();f['diagrams'][0]['edges'][2]['label']='Yes';self.assertTrue(validate(f))
    def test_orphan_is_not_silently_dropped(self):
        f=flow();f['diagrams'][0]['nodes'].append({'id':'lost','label':'Orphan'});self.assertTrue(validate(f))
    def test_rework_loop_must_be_explicit(self):
        f=flow();d=f['diagrams'][0];d['nodes'][3]['role']='step';d['edges'].append({'from':'d','to':'b','label':'Retry','directed':True});self.assertTrue(validate(f));d['allow_cycles']=True;self.assertEqual(validate(f),[])
    def test_hierarchy_cannot_have_two_parents(self):
        f=flow();d=f['diagrams'][0];d['type']='hierarchy';d['edges'].append({'from':'a','to':'c','label':'Reports','directed':True});self.assertTrue(validate(f))
    def test_lane_membership(self):
        f=flow();d=f['diagrams'][0];d['type']='swimlane';d['lanes']=['Team'];self.assertTrue(validate(f));[n.update(lane='Team') for n in d['nodes']];self.assertEqual(validate(f),[])
    def test_roadmap_date_ranges(self):
        f=flow();d=f['diagrams'][0];d.update(type='roadmap',edges=[]);[n.update(start='2026-01-01',end='2026-01-31') for n in d['nodes']];self.assertEqual(validate(f),[]);d['nodes'][0]['end']='2025-01-01';self.assertTrue(validate(f))
    def test_matrix_axis_indices(self):
        f=flow();d=f['diagrams'][0];d.update(type='matrix',edges=[],rows=['Low','High'],columns=['Small','Large']);[n.update(row=0,column=1) for n in d['nodes']];self.assertEqual(validate(f),[]);d['nodes'][0]['row']=2;self.assertTrue(validate(f))
    def test_malformed_inputs_fail_without_exceptions(self):
        for x in (None,[],{},True,{'version':True},{'version':1,'charts':{}},model({'type':{}}),{'version':1,'diagrams':[dict(flow()['diagrams'][0],type=[])]}):self.assertTrue(validate(x))
        f=flow();f['diagrams'][0]['edges'][0]['from']=[];self.assertTrue(validate(f))
    def test_validator_does_not_mutate(self):
        f=flow();old=copy.deepcopy(f);validate(f);self.assertEqual(f,old)
class Catalog(unittest.TestCase):
    def test_snapshot_coverage_and_integrity(self):
        c=json.loads((ROOT/'slidegenai/references/template-catalog.json').read_text(encoding='utf-8'));rows=c['templates'];self.assertEqual(len(rows),177);self.assertEqual(len({x['id'] for x in rows}),177)
        self.assertEqual(sum(x['source_rule_present'] for x in rows),174);self.assertEqual(sum(x['declared_type'] for x in rows),176)
        for r in rows:
            self.assertTrue(r['title']);self.assertIn(r['family'],c['families']);self.assertTrue(r['suggested_patterns']);self.assertIn('not individually',r['status'])
        for f in c['source_files']:self.assertEqual(len(f['sha256']),64)
    def test_complete_index_has_every_catalog_id(self):
        c=json.loads((ROOT/'slidegenai/references/template-catalog.json').read_text(encoding='utf-8'));text=(ROOT/'slidegenai/references/template-catalog.md').read_text(encoding='utf-8')
        for r in c['templates']:self.assertIn('`'+r['id']+'`',text)
if __name__=='__main__':unittest.main()
