"""Visible preview labels resolve without inventing template IDs or fuzzy matches."""
import json
from pathlib import Path
import sys
import unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'slidegenai/scripts'))
from find_templates import normalized,select
class VisibleNames(unittest.TestCase):
 def setUp(self):self.catalog=json.loads((ROOT/'slidegenai/references/template-catalog.json').read_text())
 def test_preview_labels_map_to_real_ids(self):
  for name,ident in [('Acid Rave','acid-graphix'),('NOVA','fashion-editorial'),('Ultimate Luxury','premium-travel'),('Neo Tokyo','urban-vivid'),('MOVE','kinetic'),('Neo Tech','default')]:self.assertEqual([r['id'] for r in select(self.catalog,name=name)],[ident])
 def test_punctuation_case_and_accent_normalization(self):
  self.assertEqual(normalized('NÉO—TECH'),normalized('neo tech'));self.assertEqual([r['id'] for r in select(self.catalog,name='  NEO—TECH  ')],['default'])
 def test_id_remains_exact(self):self.assertEqual(select(self.catalog,ident='neo-tech'),[])
 def test_unknown_names_are_not_guessed(self):
  for name in ('batth','syber punk','kinect'):self.assertEqual(select(self.catalog,name=name),[])
 def test_categories_are_groups_not_aliases(self):
  rows=select(self.catalog,query='Corporate & Education');self.assertEqual(len(rows),3);self.assertEqual(select(self.catalog,name='Corporate & Education'),[])
 def test_query_reads_visible_labels(self):self.assertEqual([r['id'] for r in select(self.catalog,query='neo tokyo')],['urban-vivid'])
 def test_ambiguous_visible_names_preserve_all_matches(self):
  a=dict(self.catalog['templates'][0],preview_labels=['Shared label']);b=dict(self.catalog['templates'][1],preview_labels=['Shared label']);self.assertEqual(select({'templates':[a,b]},name='shared-label'),[a,b])
if __name__=='__main__':unittest.main()
