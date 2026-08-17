import fs from 'node:fs';
import zlib from 'node:zlib';

const chunks=['v82-01.txt','v82-02.txt','v82-03.txt','v82-04.txt','v82-05.txt','v82-06.txt'];
const loader=fs.readFileSync('index.html','utf8');
const tail=loader.match(/const tail='([^']+)'/)?.[1];
if(!tail) throw new Error('Tail base64 not found');
let html=zlib.gunzipSync(Buffer.from(chunks.map(f=>fs.readFileSync(f,'utf8').trim()).join('')+tail,'base64')).toString('utf8');

// Remove secondary product layers so this audit describes only the original market page.
const blockIds=[
  'nightSalesStyles','nightSalesModule','babelCallOSStyles','babelCallOSModule','babelCallRevolutionStyles','babelCallRevolutionModule',
  'babelCallSoulStyles','babelCallSoulModule','babelCallThesisStyles','babelCallThesisModule','babelCallFocusStyles','babelCallFocusModule',
  'babelCallEgoStyles','babelCallEgoModule','babelCallRadarDeepStyles','babelCallRadarDeepModule','babelDigitalPortalStyles','babelBuildStampStyles','babelBuildStampModule','babelCallRuntimeGuard'
];
for(const id of blockIds){
  html=html.replace(new RegExp(`<style id="${id}">[\\s\\S]*?<\\/style>`,'g'),'');
  html=html.replace(new RegExp(`<script id="${id}">[\\s\\S]*?<\\/script>`,'g'),'');
}
html=html.replace(/<a id="babelDigitalPortal"[\s\S]*?<\/a>/g,'');

const clean=s=>String(s||'')
  .replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&nbsp;/g,' ')
  .replace(/&amp;/g,'&')
  .replace(/&quot;/g,'"')
  .replace(/&#39;|&#039;/g,"'")
  .replace(/\s+/g,' ')
  .trim();

const tags={};
for(const tag of ['h1','h2','h3','h4','h5','button','a']){
  tags[tag]=[...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`,'gi'))].map(m=>clean(m[1])).filter(Boolean);
}

const sections=[...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)].map((m,i)=>{
  const attrs=m[1];
  const id=attrs.match(/\bid=["']([^"']+)/i)?.[1]||null;
  const cls=attrs.match(/\bclass=["']([^"']+)/i)?.[1]||null;
  const body=m[2];
  const headings=[...body.matchAll(/<h([1-5])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(x=>clean(x[2])).filter(Boolean);
  const labels=[...clean(body).matchAll(/\b(?:0?\d|[12]\d|3\d)\s*[·.\-—:]\s*[^|]{2,80}/g)].map(x=>x[0].trim()).slice(0,12);
  return {index:i+1,id,classes:cls,headings,labels,textPreview:clean(body).slice(0,900)};
});

const classCounts={};
for(const m of html.matchAll(/\bclass=["']([^"']+)["']/gi)) for(const c of m[1].split(/\s+/).filter(Boolean)) classCounts[c]=(classCounts[c]||0)+1;
const topClasses=Object.entries(classCounts).sort((a,b)=>b[1]-a[1]).slice(0,120).map(([name,count])=>({name,count}));

const ids=[...new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]))];
const text=clean(html);
const terms=['capital','potencial','dificuldade','decisor','persona','dor','gold','oportunidade','evidência','fonte','setor','ranking','mapa','métrica','ticket','venda','babel','necessidade','urgência','automação','operacional','prioridade'];
const termCounts=Object.fromEntries(terms.map(term=>[term,(text.match(new RegExp(term,'gi'))||[]).length]));

const numbered=[...new Set((text.match(/\b(?:0?\d|[12]\d|3\d)\s*[·.\-—:]\s*[^|]{2,100}/g)||[]).map(x=>x.trim()))].slice(0,160);

const report={
  generatedAt:new Date().toISOString(),
  source:'decompressed primary market page with Call OS and Digital portal layers removed',
  htmlLength:html.length,
  title:clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),
  headingCounts:Object.fromEntries(Object.entries(tags).map(([k,v])=>[k,v.length])),
  headings:tags,
  sectionCount:sections.length,
  sections,
  ids,
  topClasses,
  termCounts,
  numberedLabels:numbered
};
fs.writeFileSync('PRIMARY-MARKET-AUDIT.json',JSON.stringify(report,null,2));
console.log(`PRIMARY AUDIT OK sections=${report.sectionCount} h2=${tags.h2.length} h3=${tags.h3.length} classes=${topClasses.length}`);
