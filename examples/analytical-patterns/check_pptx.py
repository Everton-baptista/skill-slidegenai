#!/usr/bin/env python3
"""Check this bounded fictional fixture's native objects, chart caches and workbooks."""
import argparse
import io
import json
import math
from pathlib import Path
import posixpath
import re
from xml.etree import ElementTree as E
import zipfile
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','c':'http://schemas.openxmlformats.org/drawingml/2006/chart','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
ROOT=Path(__file__).resolve().parent

def rels(z,part):
    n=posixpath.join(posixpath.dirname(part),'_rels',posixpath.basename(part)+'.rels')
    return {r.attrib['Id']:posixpath.normpath(posixpath.join(posixpath.dirname(part),r.attrib['Target'])).lstrip('/') for r in E.fromstring(z.read(n)) if r.attrib.get('TargetMode')!='External'}

def cached(ser,field,numeric=True):
    el=ser.find('c:'+field,NS)
    if el is None:return []
    points=el.findall('.//c:pt',NS);points.sort(key=lambda p:int(p.attrib['idx']))
    values=[p.find('c:v',NS).text for p in points]
    return [float(x) for x in values] if numeric else values

def equal(a,b):return len(a)==len(b) and all(math.isclose(x,y,rel_tol=1e-9,abs_tol=1e-9) for x,y in zip(a,b))

def workbook_range(z,chart,part,ser,field):
    ext=chart.find('c:externalData',NS)
    assert ext is not None,'Chart has no editable source workbook.'
    target=rels(z,part)[ext.attrib['{'+NS['r']+'}id']]
    formula=ser.find('.//c:'+field+'//c:f',NS)
    assert formula is not None,'Source range formula missing.'
    match=re.fullmatch(r"(?:'([^']+)'|([^!]+))!\$?([A-Z]+)\$?(\d+):\$?([A-Z]+)\$?(\d+)",formula.text)
    assert match and match[3]==match[5],'Expected a single-column data range.'
    with zipfile.ZipFile(io.BytesIO(z.read(target))) as book:
        wb=E.fromstring(book.read('xl/workbook.xml'));names={s.attrib['name']:s.attrib['{'+NS['r']+'}id'] for s in wb.findall('s:sheets/s:sheet',NS)}
        sheet=rels(book,'xl/workbook.xml')[names[match[1] or match[2]]]
        cells={c.attrib['r']:c for c in E.fromstring(book.read(sheet)).findall('.//s:c',NS)}
        return [float(cells[match[3]+str(i)].find('s:v',NS).text) for i in range(int(match[4]),int(match[6])+1)]

def check(path,require_attached=False):
    model=json.loads((ROOT/'../../slidegenai/references/visual-model-example.json').read_text(encoding='utf-8'));layout=json.loads((ROOT/'layout.json').read_text(encoding='utf-8'))
    with zipfile.ZipFile(path) as z:
        slides=[n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)];assert len(slides)==10,'Expected ten slides.'
        count=0;connectors=0;free_lines=0;attached=0
        for i,spec in enumerate(layout['slides'],1):
            part=f'ppt/slides/slide{i}.xml';slide=E.fromstring(z.read(part));texts=[x.text or '' for x in slide.findall('.//a:t',NS)]
            assert 'Fictional example' in texts,'Missing fictional-data disclosure.'
            if spec['kind']=='chart':
                c=next(c for c in model['charts'] if c['id']==spec['visual_id']);refs=slide.findall('.//c:chart',NS);assert len(refs)==1,'Native chart missing.'
                target=rels(z,part)[refs[0].attrib['{'+NS['r']+'}id']];chart=E.fromstring(z.read(target));series=chart.findall('.//c:ser',NS);assert len(series)==len(c['series']),'Series count drift.'
                for actual,expected in zip(series,c['series']):
                    field='yVal' if c['type']=='scatter' else 'val';values=[p['y'] for p in expected['points']] if c['type']=='scatter' else expected['values']
                    if c['type']=='stacked-share':values=[v/100 for v in values]
                    assert equal(cached(actual,field),values),'Chart cache differs from the source.'
                    assert equal(workbook_range(z,chart,target,actual,field),values),'Workbook differs from the source.'
                    if c['type']=='scatter':
                        xs=[p['x'] for p in expected['points']];assert equal(cached(actual,'xVal'),xs),'Scatter x values drift.';assert equal(workbook_range(z,chart,target,actual,'xVal'),xs),'Scatter x workbook drift.'
                    else:assert cached(actual,'cat',False)==c['categories'],'Category order drift.'
                count+=1
            if spec['kind']=='diagram':
                d=next(d for d in model['diagrams'] if d['id']==spec['visual_id'])
                for n in d['nodes']:assert n['label'] in texts,'Node label missing: '+n['id']
                for e in d['edges']:assert e['label'] in texts,'Relationship label missing.'
                conn=slide.findall('.//p:cxnSp',NS);connectors+=len(conn);attached+=sum(c.find('.//a:stCxn',NS) is not None and c.find('.//a:endCxn',NS) is not None for c in conn)
                lines=[o for o in slide.findall('.//p:sp',NS) if (o.find('p:spPr/a:prstGeom',NS) is not None and o.find('p:spPr/a:prstGeom',NS).get('prst')=='line')]
                free_lines+=len(lines)
                assert len(conn)+len(lines)>=len(d['edges']),'Editable relationship segment loss.'
            if spec['kind']=='table':
                tables=slide.findall('.//a:tbl',NS);assert len(tables)==1,'Native comparison table missing.'
                got=[[ ''.join(t.itertext()) for t in row.findall('a:tc/a:txBody/a:p/a:r/a:t',NS)] for row in tables[0].findall('a:tr',NS)]
                assert got==spec['table']['values'],'Table content drift.'
        if require_attached:assert attached==connectors and attached>=14,'Expected attached native connectors for every logical edge.'
    return dict(slides=10,charts=count,tables=1,connector_segments=connectors,free_line_segments=free_lines,attached_segments=attached)

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('pptx',type=Path);p.add_argument('--require-attached',action='store_true');a=p.parse_args();print(json.dumps(check(a.pptx,a.require_attached)))
