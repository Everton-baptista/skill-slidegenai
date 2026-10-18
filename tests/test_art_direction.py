"""Test advisory behavior, not stylistic taste or a claim to detect AI design."""
import copy
import json
from pathlib import Path
import sys
import unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'brand-presentations/scripts'))
from review_composition import review


def intent(**kwargs):
    result={'purpose':'Compare the same measurement over time','focal_point':'The source-supported values','composition':'Aligned native evidence','density':'balanced','image_role':'evidence','organic':False,'rationale':'Consistent axes make comparison easier.'}
    result.update(kwargs)
    return result


class ArtDirection(unittest.TestCase):
    def setUp(self):
        self.plan={'slides':[{'layout':'evidence','elements':[]} for _ in range(3)]}

    def test_repeat_is_advisory_not_failure(self):
        errors,warnings=review(self.plan)
        self.assertEqual(errors,[]);self.assertTrue(warnings)

    def test_deliberate_comparison_is_preserved(self):
        for slide in self.plan['slides']:slide['visual_intent']=intent(repeat_intent='Same axes and composition support comparison.')
        self.assertEqual(review(self.plan),([],[]))

    def test_short_sequence_is_not_forced_to_vary(self):
        self.plan['slides']=self.plan['slides'][:2]
        self.assertEqual(review(self.plan),([],[]))

    def test_image_repetition_only_counts_photographs(self):
        for index,s in enumerate(self.plan['slides']):
            s['layout']=str(index);s['elements']=[{'kind':'logo','asset':'brand.svg'}]
        self.assertEqual(review(self.plan),([],[]))
        for s in self.plan['slides']:s['elements'].append({'kind':'image','asset':'photo.png'})
        self.assertTrue(review(self.plan)[1])

    def test_two_crops_on_one_slide_do_not_count_as_a_deck_pattern(self):
        self.plan['slides']=[{'layout':'crop-study','elements':[{'kind':'image','asset':'same.png'}]*3}]
        self.assertEqual(review(self.plan),([],[]))

    def test_distinct_layouts_are_not_an_automatic_beauty_score(self):
        for i,s in enumerate(self.plan['slides']):s['layout']=str(i)
        self.assertEqual(review(self.plan),([],[]))

    def test_missing_metadata_is_backward_compatible(self):
        old=json.loads((ROOT/'examples/demo-brand/deck-plan.json').read_text(encoding='utf-8'))
        self.assertEqual(review(old)[0],[])

    def test_optional_metadata_types(self):
        for value in ([],None,True):
            self.plan['slides'][0]['visual_intent']=value
            if value is not None:self.assertTrue(review(self.plan)[0])
        self.plan['slides'][0]['visual_intent']=intent(organic='yes')
        self.assertTrue(review(self.plan)[0])

    def test_density_notice_is_advisory(self):
        self.plan['slides'].append({'layout':'other','elements':[]})
        for s in self.plan['slides']:s['visual_intent']=intent()
        errors,warnings=review(self.plan)
        self.assertEqual(errors,[]);self.assertTrue(any('density' in w for w in warnings))

    def test_organic_requires_a_reason_if_recorded_in_direction(self):
        direction={'concept':'A field notebook about learning spaces','audience':'Design educators','register':'Observant and quiet','signature':['Offset captions'],'fixed':['Supplied logo and source data'],'flexible':['Image scale'],'avoid':['Unrelated decorative imagery'],'organic':{'use':True,'reason':'A human-scale observational subject supports gentle irregular cadence.'}}
        self.assertEqual(review({'slides':[{'layout':'editorial','elements':[]}]},{'art_direction':direction})[0],[])
        direction['organic']['reason']=''
        self.assertTrue(review(self.plan,{'art_direction':direction})[0])

    def test_reviewer_does_not_modify_the_plan(self):
        before=copy.deepcopy(self.plan);review(self.plan);self.assertEqual(self.plan,before)

    def test_study_choices_have_consistent_records(self):
        cases=json.loads((ROOT/'examples/art-direction-study/briefs.json').read_text(encoding='utf-8'))['cases']
        for case in cases:
            self.assertEqual(review({'slides':[case['slide_record']]},{'art_direction':case['art_direction']})[0],[])
        self.assertEqual([case['art_direction']['organic']['use'] for case in cases],[False,False,True])

    def test_invalid_plan_fails_cleanly(self):
        for value in (None,[],{'slides':[]}):self.assertTrue(review(value)[0])


if __name__=='__main__':unittest.main()
