#!/usr/bin/env python3
"""Validate optional chart/diagram source models; does not render or prove truth."""
import argparse
from datetime import date
import json
import math
from pathlib import Path
import sys

CHART_TYPES={'bar','grouped-bar','stacked-bar','stacked-share','line','area','pie','donut','radar','polar-area','scatter','bubble','gauge','waterfall'}
DIAGRAM_TYPES={'decision-flow','swimlane','architecture','hierarchy','roadmap','matrix'}

def number(x):
    try:return isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x)
    except OverflowError:return False

def name(x):return isinstance(x,str) and bool(x.strip())

def source(x):
    return isinstance(x,dict) and ((x.get('status')=='sourced' and name(x.get('citation'))) or (x.get('status')=='illustrative' and name(x.get('label'))))

def labels(xs):return isinstance(xs,list) and bool(xs) and all(name(x) for x in xs) and len(set(xs))==len(xs)

def validate(model):
    errors=[]
    if not isinstance(model,dict) or type(model.get('version')) is not int or model['version']!=1:return ['Model version must be integer 1.']
    ids=set()
    for group in ('charts','diagrams'):
        items=model.get(group,[])
        if not isinstance(items,list):errors.append(f'{group} must be an array.');continue
        for index,item in enumerate(items):
            tag=f'{group}[{index}]'
            if not isinstance(item,dict):errors.append(f'{tag}: object required.');continue
            ident=item.get('id')
            if not name(ident) or ident in ids:errors.append(f'{tag}: unique nonempty id required.')
            else:ids.add(ident)
            if not source(item.get('source')):errors.append(f'{tag}: sourced citation or explicit illustrative label required.')
            typ=item.get('type')
            if group=='charts':errors.extend(chart(item,tag,typ))
            else:errors.extend(diagram(item,tag,typ))
    if not ids:errors.append('At least one chart or diagram is required.')
    return errors

def chart(c,tag,typ):
    errors=[]
    def fail(s):errors.append(f'{tag}: {s}')
    if not isinstance(typ,str) or typ not in CHART_TYPES:return [f'{tag}: unsupported chart type.']
    if not name(c.get('unit')):fail('unit is required.')
    if typ=='waterfall':
        changes=c.get('changes');start=c.get('opening');end=c.get('closing')
        if not number(start) or not number(end) or not isinstance(changes,list) or not changes or any(not isinstance(v,dict) or not name(v.get('name')) or not number(v.get('value')) for v in changes):fail('waterfall needs finite opening, named signed changes and closing.')
        else:
            try:
                if not math.isclose(start+sum(x['value'] for x in changes),end,rel_tol=1e-9,abs_tol=1e-9):fail('waterfall does not reconcile.')
            except OverflowError:fail('waterfall total is not finite.')
        return errors
    if typ=='gauge':
        lo,hi,val=c.get('minimum'),c.get('maximum'),c.get('value')
        if not all(number(v) for v in (lo,hi,val)) or not lo<hi or not lo<=val<=hi:fail('gauge needs ordered finite bounds and an in-range value.')
        return errors
    series=c.get('series')
    if not isinstance(series,list) or not series:return errors+[f'{tag}: nonempty series required.']
    series_names=[s.get('name') if isinstance(s,dict) else None for s in series]
    if not labels(series_names):fail('series names must be nonempty and unique.')
    if typ in ('scatter','bubble'):
        if not name(c.get('x_unit')) or not name(c.get('y_unit')):fail('scatter/bubble needs separate x/y units.')
        for s in series:
            points=s.get('points') if isinstance(s,dict) else None
            if not isinstance(points,list) or not points:fail('nonempty points required.');continue
            for p in points:
                if not isinstance(p,dict) or not number(p.get('x')) or not number(p.get('y')):fail('each point needs finite x/y.')
                elif typ=='bubble' and (not number(p.get('size')) or p['size']<=0):fail('bubble size must be positive and finite.')
        return errors
    cats=c.get('categories')
    if not labels(cats):fail('categories must be nonempty unique labels.');return errors
    arrays=[]
    for s in series:
        values=s.get('values') if isinstance(s,dict) else None
        if not isinstance(values,list) or len(values)!=len(cats):fail('series/category lengths must agree.');continue
        valid=True
        for value in values:
            if value is None and c.get('missing_policy')=='gap':continue
            if not number(value):fail('values must be finite numbers; null requires missing_policy gap.');valid=False
        if valid:arrays.append(values)
    if typ in ('bar','grouped-bar','stacked-bar','stacked-share') and c.get('baseline')!=0:fail('magnitude bars need an explicit zero baseline.')
    if typ in ('pie','donut','polar-area'):
        if len(series)!=1:fail('part-to-whole/polar example expects one series.')
        flat=[x for a in arrays for x in a]
        if any(x is None or x<0 for x in flat) or not flat or not any(x is not None and x>0 for x in flat):fail('parts need nonnegative complete values and a positive whole.')
    if typ=='stacked-share':
        if c.get('unit')!='%':fail('stacked-share uses percentage values with unit %.')
        if len(arrays)==len(series):
            for col in zip(*arrays):
                if any(x is None or x<0 or x>100 for x in col) or not math.isclose(sum(col),100,abs_tol=1e-6):fail('each stacked-share category must sum to 100.')
    if typ=='radar':
        lo,hi=c.get('minimum'),c.get('maximum')
        if not number(lo) or not number(hi) or not lo<hi:fail('radar needs explicit common finite scale bounds.')
        elif any(x is None or not lo<=x<=hi for a in arrays for x in a):fail('radar values must fit the declared common scale.')
    return errors

def diagram(d,tag,typ):
    errors=[]
    def fail(s):errors.append(f'{tag}: {s}')
    if not isinstance(typ,str) or typ not in DIAGRAM_TYPES:return [f'{tag}: unsupported diagram type.']
    nodes=d.get('nodes');edges=d.get('edges',[])
    if not isinstance(nodes,list) or not nodes:return [f'{tag}: nonempty nodes required.']
    if not isinstance(edges,list):return [f'{tag}: edges must be an array.']
    byid={}
    for n in nodes:
        if not isinstance(n,dict) or not name(n.get('id')) or not name(n.get('label')):fail('node needs id and label.');continue
        if n['id'] in byid:fail('duplicate node id.')
        byid[n['id']]=n
    out={k:[] for k in byid};incoming={k:0 for k in byid}
    for e in edges:
        if not isinstance(e,dict) or not name(e.get('from')) or not name(e.get('to')) or e['from'] not in byid or e['to'] not in byid:fail('edge endpoints must name existing nodes.');continue
        if not name(e.get('label')):fail('edge needs its relationship or branch label.')
        if type(e.get('directed')) is not bool:fail('edge directed must be boolean.')
        if typ in ('decision-flow','hierarchy') and e.get('directed') is not True:fail('flow/hierarchy relationships must be directed.')
        out[e['from']].append(e);incoming[e['to']]+=1
    pending=dict(incoming);ready=[k for k,v in pending.items() if v==0];processed=0
    while ready:
        k=ready.pop();processed+=1
        for e in out[k]:
            pending[e['to']]-=1
            if pending[e['to']]==0:ready.append(e['to'])
    cyclic=processed!=len(byid)
    if typ=='hierarchy' and (cyclic or any(n>1 for n in incoming.values())):fail('hierarchy must be acyclic with at most one parent per node.')
    if typ=='decision-flow':
        starts=[k for k,n in byid.items() if n.get('role')=='start'];ends=[k for k,n in byid.items() if n.get('role')=='end']
        if len(starts)!=1 or not ends:fail('decision-flow needs exactly one start and at least one end.')
        if cyclic and d.get('allow_cycles') is not True:fail('rework loops need explicit allow_cycles true.')
        if any(out[k] for k in ends):fail('end nodes cannot have outgoing edges.')
        for k,n in byid.items():
            if n.get('role')=='decision' and (len(out[k])<2 or not labels([e.get('label') for e in out[k]])):fail('decision needs at least two distinctly labeled branches.')
        if starts:
            seen=set();todo=[starts[0]]
            while todo:
                k=todo.pop()
                if k in seen:continue
                seen.add(k);todo.extend(e['to'] for e in out[k])
            if seen!=set(byid):fail('flow contains nodes unreachable from start.')
    if typ=='swimlane':
        lanes=d.get('lanes')
        if not labels(lanes) or any(n.get('lane') not in lanes for n in byid.values()):fail('each node needs a declared lane.')
    if typ=='roadmap':
        for n in byid.values():
            try:
                start=date.fromisoformat(n['start']);end=date.fromisoformat(n['end'])
                if start>end:fail('roadmap starts after its end.')
            except (KeyError,TypeError,ValueError):fail('roadmap nodes need ISO start/end dates.')
    if typ=='matrix':
        rows,cols=d.get('rows'),d.get('columns')
        if not labels(rows) or not labels(cols):fail('matrix needs named row/column axes.')
        else:
            for n in byid.values():
                if type(n.get('row')) is not int or type(n.get('column')) is not int or not 0<=n['row']<len(rows) or not 0<=n['column']<len(cols):fail('matrix cell indices exceed its named axes.')
    return errors

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('model',type=Path);args=parser.parse_args()
    try:errors=validate(json.loads(args.model.read_text(encoding='utf-8')))
    except (OSError,ValueError,RecursionError) as exc:print(f'ERROR: {exc}',file=sys.stderr);return 1
    for e in errors:print('ERROR: '+e,file=sys.stderr)
    if errors:return 1
    print('Visual source model is structurally valid. Render and inspect the exported artifact.');return 0
if __name__=='__main__':sys.exit(main())
