#!/usr/bin/env node
/** Bounded example adapter, not the skill's mandatory rendering engine. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
function option(name, fallback){const i=args.indexOf(name);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw new Error(`Missing ${name} value`);return args[i+1];}
if(args.includes('--help')){console.log('node build.mjs [--format all|html|pptx] [--out DIRECTORY] [--plan FILE]');process.exit(0);}
const format=option('--format','all'),out=path.resolve(option('--out',path.join(root,'generated')));
if(!['all','html','pptx'].includes(format))throw new Error('Unsupported format.');
const plan=JSON.parse(await fs.readFile(option('--plan',path.join(root,'deck-plan.json')),'utf8'));
if(plan.slides?.length!==8||plan.unit!=='px')throw new Error('This bounded example expects eight pixel-based slides.');
await fs.mkdir(out,{recursive:true});
for(const name of [format!=='pptx'?'preview.html':null,format!=='html'?'example.pptx':null].filter(Boolean)){
 try{await fs.access(path.join(out,name));throw new Error(`Output exists: ${name}. Use a new directory.`);}catch(error){if(error.code!=='ENOENT')throw error;}
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assetBytes=async e=>{const source=path.resolve(root,e.asset);if(!source.startsWith(root+path.sep))throw new Error('Asset escapes example root.');return fs.readFile(source);};
if(format!=='pptx'){
 const slides=[];
 for(const s of plan.slides){
  const els=[];
  for(const e of s.elements){
   const box=`position:absolute;left:${e.x}px;top:${e.y}px;width:${e.width}px;height:${e.height}px;box-sizing:border-box;`;
   if(e.kind==='text')els.push(`<div data-text="${esc(e.id)}" style="${box}font-size:${e.font_size}px;color:${e.color};font-weight:${e.bold?700:400};line-height:1.08;white-space:pre-wrap">${esc(e.text)}</div>`);
   else if(e.kind==='shape')els.push(`<div style="${box}background:${e.fill}"></div>`);
   else if(e.kind==='image')els.push(`<img alt="${esc(e.alt)}" src="data:image/png;base64,${(await assetBytes(e)).toString('base64')}" style="${box}object-fit:cover">`);
   else if(e.kind==='table')els.push(`<table style="${box}border-collapse:collapse;font-size:${e.font_size}px"><tbody>${e.values.map((row,i)=>`<tr>${row.map(cell=>`<${i?'td':'th'} style="padding:16px;text-align:left;border-bottom:1px solid #D9DFD5;background:${i?e.body_fill:e.header_fill};color:${i?e.color:'#FFFFFF'}">${esc(cell)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table>`);
   else if(e.kind==='chart'){
    const W=e.width,H=e.height,bottom=H-42,left=48,plotH=H-72;
    let svg=`<svg role="img" aria-label="Illustrative completion: 32, 48, 65 percent" viewBox="0 0 ${W} ${H}" style="${box}">`;
    for(let value=0;value<=100;value+=25){const y=bottom-value/100*plotH;svg+=`<line x1="${left}" x2="${W-12}" y1="${y}" y2="${y}" stroke="#D9DFD5"/><text x="0" y="${y+5}" font-size="17" fill="#52645E">${value}</text>`;}
    e.values.forEach((v,i)=>{const x=left+75+i*220,h=v/100*plotH;svg+=`<rect x="${x}" y="${bottom-h}" width="105" height="${h}" fill="${e.color}"/><text x="${x+50}" y="${bottom-h-12}" text-anchor="middle" font-size="23" fill="#173E38">${v}%</text><text x="${x+50}" y="${bottom+32}" text-anchor="middle" font-size="22" fill="#173E38">${esc(e.categories[i])}</text>`;});els.push(svg+'</svg>');
   }
  }
  slides.push(`<section class="slide" aria-label="Slide ${s.position}: ${esc(s.title)}" style="background:${s.background}">${els.join('')}</section>`);
 }
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Fieldwork: fictional slide preview</title><style>body{margin:0;padding:32px;background:#D9DFD5;font-family:Arial,Helvetica,sans-serif;color:#173E38}.slide{position:relative;width:1280px;height:720px;margin:0 auto 32px;overflow:hidden;box-shadow:0 6px 30px #0002}th,td{font-weight:400}th{font-weight:700}@media print{@page{size:13.333in 7.5in;margin:0}body{padding:0}.slide{margin:0;box-shadow:none;break-after:page}}</style>${slides.join('')}</html>`;
 await fs.writeFile(path.join(out,'preview.html'),html,{flag:'wx'});
}
if(format!=='html'){
 let PptxGenJS;
 try{PptxGenJS=(await import('pptxgenjs')).default;}catch{throw new Error('Optional PPTX adapter needs npm install in examples/portable-deck. HTML mode has no dependencies.');}
 const p=new PptxGenJS();p.defineLayout({name:'FIELDWORK',width:1280/96,height:720/96});p.layout='FIELDWORK';p.author='SlideGenAI Skill';p.subject='Fictional portable example';p.title=plan.title;p.lang='en-US';
 for(const s of plan.slides){
  const slide=p.addSlide();slide.background={color:s.background.slice(1)};slide.addNotes('Fictional identity. Chart data is illustrative. Editorial image generated with ImageGen; no real institution depicted.');
  for(const e of s.elements){
   const pos={x:e.x/96,y:e.y/96,w:e.width/96,h:e.height/96};
   if(e.kind==='text')slide.addText(e.text,{...pos,fontFace:'Arial',fontSize:e.font_size*.75,bold:!!e.bold,color:e.color.slice(1),margin:0,breakLine:false,vertAnchor:'top',lineSpacingMultiple:1.08});
   else if(e.kind==='shape')slide.addShape(p.ShapeType.rect,{...pos,line:{color:e.fill.slice(1),transparency:100},fill:{color:e.fill.slice(1)}});
   else if(e.kind==='image'){
    const bytes=await assetBytes(e),data=`image/png;base64,${bytes.toString('base64')}`;
    slide.addImage({data,...pos,sizing:{type:'cover',w:pos.w,h:pos.h},altText:e.alt});
   } else if(e.kind==='table'){
    const rows=e.values.map((row,i)=>row.map(text=>({text,options:{fill:i?e.body_fill.slice(1):e.header_fill.slice(1),color:i?e.color.slice(1):'FFFFFF',bold:i===0}})));
    slide.addTable(rows,{...pos,fontFace:'Arial',fontSize:e.font_size*.75,margin:12/96,border:{type:'solid',color:'D9DFD5',pt:1},rowH:e.height/e.values.length/96,colW:[3.2,4.4,4.4],autoPage:false});
   } else if(e.kind==='chart')slide.addChart(p.ChartType.bar,[{name:e.series_name,labels:e.categories,values:e.values}],{...pos,catAxisLabelFontFace:'Arial',catAxisLabelFontSize:16,valAxisLabelFontFace:'Arial',valAxisLabelFontSize:13,showLegend:false,showValue:true,dataLabelPosition:'outEnd',chartColors:[e.color.slice(1)],valAxisMinVal:0,valAxisMaxVal:100,valAxisMajorUnit:25,showCatName:false,showTitle:false,showBorder:false,catAxisLabelColor:'173E38',valGridLine:{color:'D9DFD5',width:1}});
  }
 }
 // Normalize only dangling slide-master declarations produced by some builds.
 // Never rewrite references that point to actual parts or input/source decks.
 const JSZip=(await import('jszip')).default;
 const zip=await JSZip.loadAsync(await p.write({outputType:'nodebuffer'}));
 const part=zip.file('[Content_Types].xml');
 const xml=await part.async('string');
 zip.file('[Content_Types].xml',xml.replace(/<Override\b[^>]*\/>/g, tag=>{
  const name=tag.match(/PartName="([^"]+)"/)?.[1];
  return name && /^\/ppt\/slideMasters\/slideMaster\d+\.xml$/.test(name) && !zip.file(name.slice(1)) ? '' : tag;
 }));
 // Single-level category data does not need a multi-level reference. Keep
 // the exact formula and cached values; this improves importer interoperability.
 for(const name of Object.keys(zip.files).filter(n=>/^ppt\/charts\/chart\d+\.xml$/.test(n))){
  let chart=await zip.file(name).async('string');
  chart=chart.replace(/<c:multiLvlStrRef>([\s\S]*?)<\/c:multiLvlStrRef>/g,(all,body)=>{
   if((body.match(/<c:lvl>/g)||[]).length!==1)return all;
   return '<c:strRef>'+body.replaceAll('c:multiLvlStrCache','c:strCache').replace(/<\/?c:lvl>/g,'')+'</c:strRef>';
  });
  zip.file(name,chart);
 }
 await fs.writeFile(path.join(out,'example.pptx'),await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),{flag:'wx'});
}
console.log(`Built ${format} in ${out}. Render the new PPTX before declaring it visually verified.`);
