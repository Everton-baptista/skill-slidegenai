#!/usr/bin/env python3
"""Find source styles by canonical ID, visible preview name, family or content."""
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import unicodedata

def normalized(value):
    value=unicodedata.normalize('NFKD',value.casefold())
    return ' '.join(re.findall(r'[^\W_]+',''.join(c for c in value if not unicodedata.combining(c))))

def names(row):return [row['id'],row['title'],*row.get('preview_labels',[])]

def select(catalog,ident=None,family=None,pattern=None,query=None,name=None):
    rows=catalog['templates']
    result=[]
    for r in rows:
        if ident is not None and r['id']!=ident:continue
        if family is not None and r['family']!=family:continue
        if pattern is not None and pattern not in r['suggested_patterns']:continue
        if name is not None and normalized(name) not in [normalized(n) for n in names(r)]:continue
        haystack=' '.join(names(r)+[r.get('source_category',''),r.get('source_description','')])
        if query is not None and normalized(query) not in normalized(haystack):continue
        result.append(r)
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--id');p.add_argument('--name',help='Exact normalized ID, source title or visible preview label; all matches retained.');p.add_argument('--family');p.add_argument('--pattern');p.add_argument('--query');a=p.parse_args()
    c=json.loads((Path(__file__).resolve().parent.parent/'references/template-catalog.json').read_text(encoding='utf-8'))
    if not any((a.id,a.name,a.family,a.pattern,a.query)):print(json.dumps({'families':dict(Counter(r['family'] for r in c['templates'])),'count':len(c['templates']),'status':'Source snapshot; not individually rendered.'},indent=2));return 0
    rows=select(c,a.id,a.family,a.pattern,a.query,a.name)
    if not rows:print('No matching source templates.');return 1
    print(json.dumps(rows if a.id or a.name else [{k:r[k] for k in ('id','title','family','suggested_patterns','status')} for r in rows],ensure_ascii=False,indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
