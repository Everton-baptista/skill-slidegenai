#!/usr/bin/env python3
"""Read the bundled style snapshot without loading the entire catalog into context."""
import argparse
from collections import Counter
import json
from pathlib import Path

def select(catalog,ident=None,family=None,pattern=None,query=None):
    rows=catalog['templates']
    return [r for r in rows if (ident is None or r['id']==ident) and (family is None or r['family']==family) and (pattern is None or pattern in r['suggested_patterns']) and (query is None or query.casefold() in (' '.join(str(r.get(k,'')) for k in ('id','title','source_category','source_description'))).casefold())]

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--id');p.add_argument('--family');p.add_argument('--pattern');p.add_argument('--query');a=p.parse_args()
    c=json.loads((Path(__file__).resolve().parent.parent/'references/template-catalog.json').read_text(encoding='utf-8'))
    if not any((a.id,a.family,a.pattern,a.query)):print(json.dumps({'families':dict(Counter(r['family'] for r in c['templates'])),'count':len(c['templates']),'status':'Source snapshot; not individually rendered.'},indent=2));return 0
    rows=select(c,a.id,a.family,a.pattern,a.query)
    if not rows:print('No matching source templates.');return 1
    print(json.dumps(rows if a.id else [{k:r[k] for k in ('id','title','family','suggested_patterns','status')} for r in rows],ensure_ascii=False,indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
