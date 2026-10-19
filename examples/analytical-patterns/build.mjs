#!/usr/bin/env node
/** Optional bounded reproduction adapter; the skill itself is engine-independent. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
const root=path.dirname(fileURLToPath(import.meta.url));const args=process.argv.slice(2);
if(args.includes('--help')){console.log('node build.mjs --out NEW_DIRECTORY');process.exit(0);}
const i=args.indexOf('--out');if(i<0||!args[i+1]||args[i+1].startsWith('--'))throw new Error('Specify --out NEW_DIRECTORY.');
const out=path.resolve(args[i+1]);const dest=path.join(out,'example.pptx');
await fs.mkdir(out,{recursive:true});try{await fs.access(dest);throw new Error('Output exists; choose a new directory.');}catch(e){if(e.code!=='ENOENT')throw e;}
const layout=JSON.parse(await fs.readFile(path.join(root,'layout.json'),'utf8'));const model=JSON.parse(await fs.readFile(path.resolve(root,layout.source_model),'utf8'));
if(layout.slides.length!==10||layout.canvas.unit!=='px')throw new Error('This adapter is bounded to the ten-slide example.');
const p=new PptxGenJS();p.defineLayout({name:'ANALYTICAL',width:1280/96,height:720/96});p.layout='ANALYTICAL';p.author='SlideGenAI Skill';p.title='Editable analytical patterns';p.subject='Fictional source models';p.lang='en-US';
const W='#FFFFFF',I='#172B4D',B='#243A63',L='#DCE3EB',G='#53657D';const col=x=>x.replace('#','');const pos=b=>({x:b[0]/96,y:b[1]/96,w:b[2]/96,h:b[3]/96});
function txt(s,name,text,b,size=25,color=I,bold=false){s.addText(text,{...pos(b),objectName:name,fontFace:'Arial',fontSize:size*.75,color:col(color),bold,margin:0,breakLine:false,vertAnchor:'top',lineSpacingMultiple:1.08});}
function rect(s,name,b,fill,line=fill){s.addShape(p.ShapeType.rect,{...pos(b),objectName:name,fill:{color:col(fill)},line:{color:col(line),width:.75}});}
const port=(b,side)=>side==='left'?[b[0],b[1]+b[3]/2]:side==='right'?[b[0]+b[2],b[1]+b[3]/2]:side==='top'?[b[0]+b[2]/2,b[1]]:[b[0]+b[2]/2,b[1]+b[3]];
function route(a,b,from,to){const [x,y]=port(a,from),[u,v]=port(b,to);if(from===to&&['left','right'].includes(from)){const mid=from==='left'?Math.min(x,u)-60:Math.max(x,u)+35;return [[x,y],[mid,y],[mid,v],[u,v]];}if(['top','bottom'].includes(from)&&['top','bottom'].includes(to)){const mid=(y+v)/2;return [[x,y],[x,mid],[u,mid],[u,v]];}if(['left','right'].includes(from)&&['left','right'].includes(to)){const mid=(x+u)/2;return [[x,y],[mid,y],[mid,v],[u,v]];}return [[x,y],[u,y],[u,v]];}
for(const spec of layout.slides){const s=p.addSlide();s.background={color:col(spec.background)};const dark=spec.background!==W,ink=dark?W:I;s.addNotes('Fictional example. Data and relationships are illustrative. Optional PptxGenJS reproduction. Native line segments are editable but are not anchored to nodes; reroute after moving nodes. Source: slidegenai/references/visual-model-example.json.');
 for(const e of spec.elements)txt(s,e.id,e.text,[e.x,e.y,e.width,e.height],e.font_size,e.color,e.bold);
 if(spec.kind==='chart'){
  const c=model.charts.find(v=>v.id===spec.visual_id),b=spec.chart_box;let data=c.series.map(v=>({name:v.name,labels:c.categories,values:v.values}));let type=c.type==='grouped-bar'||c.type==='stacked-share'?'bar':c.type;
  if(c.type==='stacked-share')data=data.map(v=>({...v,values:v.values.map(n=>n/100)}));
  if(c.type==='scatter')data=[{name:c.x_unit,values:c.series[0].points.map(p=>p.x)},...c.series.map(v=>({name:v.name,values:v.points.map(p=>p.y)}))];
  const opts={...pos([b.x,b.y,b.width,b.height]),objectName:c.id,showTitle:false,showLegend:data.length>1&&c.type!=='scatter',legendPos:'b',legendFontFace:'Arial',legendFontSize:15,legendColor:col(ink),chartColors:spec.palette.map(col),chartArea:{fill:{color:col(spec.background)},border:{color:col(spec.background),pt:0}},plotArea:{fill:{color:col(spec.background)},border:{color:col(spec.background),pt:0}},catAxisLabelFontFace:'Arial',catAxisLabelFontSize:15,catAxisLabelColor:col(ink),valAxisLabelFontFace:'Arial',valAxisLabelFontSize:15,valAxisLabelColor:col(ink),valGridLine:{color:dark?'365172':col(L),width:.75},catAxisLineColor:col(L),valAxisMinVal:0,showValAxisTitle:c.type==='scatter'||c.type==='line',valAxisTitle:c.type==='scatter'?'Completed items':c.type==='line'?'Days':undefined,valAxisTitleColor:col(ink),valAxisTitleFontFace:'Arial',valAxisTitleFontSize:15,showValue:c.type==='grouped-bar'||c.type==='stacked-share',dataLabelPosition:c.type==='stacked-share'?'ctr':'outEnd',dataLabelColor:col(c.type==='stacked-share'?W:ink),valLabelFormatCode:c.type==='stacked-share'?'0%':'0',showCatName:false,lineDataSymbol:'circle',lineDataSymbolSize:6,lineSize:c.type==='scatter'?0:2.25,showMarker:true};
  if(c.type==='grouped-bar')Object.assign(opts,{barDir:'bar',catAxisOrientation:'minMax',catAxisLabelPos:'low',barGrouping:'clustered'});
  if(c.type==='stacked-share')Object.assign(opts,{barDir:'col',barGrouping:'stacked',barOverlapPct:100,valAxisMaxVal:1,valAxisMajorUnit:.25,valAxisLabelFormatCode:'0%'});
  if(c.type==='line')Object.assign(opts,{valAxisMaxVal:20,valAxisMajorUnit:5});
  if(c.type==='scatter')Object.assign(opts,{showCatName:false,showCatAxisTitle:true,catAxisTitle:'Training hours',catAxisTitleColor:col(ink),catAxisTitleFontSize:15,catAxisMinVal:0,catAxisMaxVal:14,valAxisMaxVal:50,valAxisMajorUnit:10});
  s.addChart(type,data,opts);
 }
 if(spec.kind==='diagram'){
  const d=model.diagrams.find(v=>v.id===spec.visual_id);
  if(spec.lanes)spec.lanes.forEach((l,j)=>{rect(s,'lane-'+j,l.box,j%2?'#EAF0F6':'#F5F7FA');txt(s,'lane-title-'+j,l.label,[l.box[0]+16,l.box[1]+28,180,50],24,B,true);});
  for(const n of d.nodes){const b=spec.nodes[n.id];s.addShape(n.role==='decision'?p.ShapeType.diamond:p.ShapeType.rect,{...pos(b),objectName:d.id+'-'+n.id,fill:{color:col(dark?B:'#F1F5FA')},line:{color:dark?'6781A1':'9FB1C9',width:1.1}});s.addText(n.label,{...pos(b),objectName:'label-'+n.id,fontFace:'Arial',fontSize:n.role==='decision'?15:18,color:col(ink),bold:n.role==='decision',align:'center',vertAnchor:'mid',margin:6});}
  d.edges.forEach((e,j)=>{const q=spec.routes[j],points=q.waypoints?[port(spec.nodes[e.from],q.fromSide),...q.waypoints,port(spec.nodes[e.to],q.toSide)]:route(spec.nodes[e.from],spec.nodes[e.to],q.fromSide,q.toSide);const segments=points.slice(1).map((b,i)=>[points[i],b]).filter(([a,b])=>a[0]!==b[0]||a[1]!==b[1]);segments.forEach(([a,b],k)=>s.addShape(p.ShapeType.line,{objectName:`${d.id}-edge-${j}-${k}`,x:Math.min(a[0],b[0])/96,y:Math.min(a[1],b[1])/96,w:Math.abs(a[0]-b[0])/96,h:Math.abs(a[1]-b[1])/96,flipH:b[0]<a[0],flipV:b[1]<a[1],line:{color:dark?'A9BED8':col(B),width:1.5,...(k===segments.length-1?{endArrowType:'triangle'}:{})}}));txt(s,'edge-label-'+j,e.label,q.label_box,q.label_font_size||18,dark?'#DAE5F0':G);});
 }
 if(spec.kind==='roadmap'){
  const d=model.diagrams.find(v=>v.id===spec.visual_id),start=Date.parse('2027-01-01'),end=Date.parse('2027-07-01'),total=end-start,b=spec.timeline;
  for(let j=0;j<6;j++){const x=b.x+(Date.UTC(2027,j,1)-start)/total*b.width;rect(s,'month-line-'+j,[x,b.y,1,b.height],L);txt(s,'month-'+j,spec.month_labels[j],[x+10,b.y-45,115,35],23,G);}
  d.nodes.forEach((n,j)=>{const x=b.x+(Date.parse(n.start)-start)/total*b.width,w=(Date.parse(n.end)+86400000-Date.parse(n.start))/total*b.width,y=b.y+20+j*90;txt(s,'phase-'+n.id,n.label,[64,y+8,210,45],30,B,true);rect(s,'duration-'+n.id,[x,y,w,55],spec.palette[j]);txt(s,'dates-'+n.id,n.start.slice(5)+' to '+n.end.slice(5),[x+8,y+13,w-16,30],18,W,true);});
 }
 if(spec.kind==='matrix'){
  const d=model.diagrams.find(v=>v.id===spec.visual_id),b=spec.matrix_box,w=b.width/3,h=b.height/3;
  d.rows.forEach((x,i)=>txt(s,'row-'+i,x,[64,b.y+i*h+29,220,55],24,B,true));d.columns.forEach((x,i)=>txt(s,'col-'+i,x,[b.x+i*w+8,b.y-45,w-16,38],23,G));
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)rect(s,`cell-${row}-${col}`,[b.x+col*w,b.y+row*h,w,h],row+col>=3?'#F1DED6':row+col>=2?'#F3EBDD':'#EAF0F6',W);
  for(const n of d.nodes)txt(s,'assessment-'+n.id,n.label,[b.x+n.column*w+18,b.y+n.row*h+30,w-36,h-40],25,I,true);
 }
 if(spec.kind==='table'){
  const q=spec.table;s.addTable(q.values.map((row,j)=>row.map(text=>({text,options:{fill:col(j?W:B),color:col(j?I:W),bold:j===0}}))),{...pos([q.x,q.y,q.width,q.height]),objectName:'comparison',colW:q.column_widths.map(v=>v/96),rowH:q.height/q.values.length/96,fontFace:'Arial',fontSize:18.75,border:{type:'solid',pt:.75,color:col(L)},margin:6,autoPage:false});
 }
}
const zip=await JSZip.loadAsync(await p.write({outputType:'nodebuffer'}));
const ct=await zip.file('[Content_Types].xml').async('string');zip.file('[Content_Types].xml',ct.replace(/<Override\b[^>]*\/>/g,tag=>{const n=tag.match(/PartName="([^"]+)"/)?.[1];return n&&/^\/ppt\/slideMasters\/slideMaster\d+\.xml$/.test(n)&&!zip.file(n.slice(1))?'':tag;}));
for(const n of Object.keys(zip.files).filter(n=>/^ppt\/charts\/chart\d+\.xml$/.test(n))){let x=await zip.file(n).async('string');x=x.replace(/<c:multiLvlStrRef>([\s\S]*?)<\/c:multiLvlStrRef>/g,(all,body)=>(body.match(/<c:lvl>/g)||[]).length!==1?all:'<c:strRef>'+body.replaceAll('c:multiLvlStrCache','c:strCache').replace(/<\/?c:lvl>/g,'')+'</c:strRef>');zip.file(n,x);}
await fs.writeFile(dest,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),{flag:'wx'});console.log('Built '+dest+'. Render this new output before declaring visual verification.');
