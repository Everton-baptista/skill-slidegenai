#!/usr/bin/env python3
"""Check this example's native evidence objects; does not render a presentation."""
import argparse
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','c':'http://schemas.openxmlformats.org/drawingml/2006/chart'}


def check(path):
    errors=[]
    with zipfile.ZipFile(path) as archive:
        names=set(archive.namelist())
        slides=[n for n in names if re.fullmatch(r'ppt/slides/slide\d+.xml',n)]
        if len(slides)!=8: errors.append('Expected eight slides.')
        for item in ET.fromstring(archive.read('[Content_Types].xml')):
            if item.tag.endswith('Override') and item.attrib['PartName'].lstrip('/') not in names:
                errors.append('Dangling content-type declaration.')
        for n in slides:
            if not ET.fromstring(archive.read(n)).findall('.//a:t',NS): errors.append(f'Native text missing: {n}')
        table=ET.fromstring(archive.read('ppt/slides/slide5.xml')).find('.//a:tbl',NS)
        if table is None or len(table.findall('a:tr',NS))!=4: errors.append('Expected a four-row native table on slide 5.')
        chart=ET.fromstring(archive.read('ppt/charts/chart1.xml'))
        values=[x.text for x in chart.findall('.//c:val/c:numRef/c:numCache/c:pt/c:v',NS)]
        labels=[x.text for x in chart.findall('.//c:cat/c:strRef/c:strCache/c:pt/c:v',NS)]
        if values!=['32','48','65'] or labels!=['Week 1','Week 2','Week 3']: errors.append('Chart cached data differs from the illustrative example.')
        if not any(n.endswith('.xlsx') and 'embeddings/' in n for n in names):errors.append('Embedded editable workbook missing.')
    return errors


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pptx',type=Path)
    args=parser.parse_args()
    try:
        errors=check(args.pptx)
    except (OSError,ValueError,KeyError,ET.ParseError,zipfile.BadZipFile) as exc:
        print(f'ERROR: {exc}',file=sys.stderr);return 1
    if errors:
        for error in errors:print(f'ERROR: {error}',file=sys.stderr)
        return 1
    print(json.dumps({'passed':True,'sha256':hashlib.sha256(args.pptx.read_bytes()).hexdigest(),'boundary':'Structural native-object checks only; render and inspect separately.'}))
    return 0


if __name__=='__main__':sys.exit(main())
