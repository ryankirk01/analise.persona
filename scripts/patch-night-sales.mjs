import fs from 'node:fs';
import zlib from 'node:zlib';

const chunkFiles=['v82-01.txt','v82-02.txt','v82-03.txt','v82-04.txt','v82-05.txt','v82-06.txt'];
const loader=fs.readFileSync('index.html','utf8');
const tailMatch=loader.match(/const tail='([^']+)'/);
if(!tailMatch) throw new Error('Tail base64 não encontrado no loader.');

const buildVersion=String(process.env.GITHUB_SHA||Date.now().toString(36)).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,10);
const b64=chunkFiles.map(f=>fs.readFileSync(f,'utf8').trim()).join('')+tailMatch[1];
let html=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');

html=html
  .replace(/<style id="nightSalesStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="nightSalesModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallOSStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallOSModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallRevolutionStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallRevolutionModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallSoulStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallSoulModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallThesisStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallThesisModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallFocusStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallFocusModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallEgoStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallEgoModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallRadarDeepStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallRadarDeepModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelBuildStampStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelBuildStampModule">[\s\S]*?<\/script>/g,'')
  .replace(/<script id="babelCallRuntimeGuard">[\s\S]*?<\/script>/g,'');

const core=fs.readFileSync('scripts/call-os-v2.fragment.html','utf8');
const revolution=fs.readFileSync('scripts/call-os-revolution.fragment.html','utf8');
const soul=fs.readFileSync('scripts/call-soul-theater.fragment.html','utf8');
const thesis=fs.readFileSync('scripts/call-thesis-os.fragment.html','utf8');
const focus=fs.readFileSync('scripts/call-focus-os.fragment.html','utf8');
const ego=fs.readFileSync('scripts/call-ego-revolution.fragment.html','utf8');
const radarDeep=fs.readFileSync('scripts/call-radar-deep.fragment.html','utf8');
if(!core.includes('babelCallOSModule')||!core.includes('babelCallOSStyles')) throw new Error('Fragmento Call OS inválido.');
if(!revolution.includes('babelCallRevolutionModule')||!revolution.includes('babelCallRevolutionStyles')) throw new Error('Revolution Layer inválida.');
if(!soul.includes('babelCallSoulModule')||!soul.includes('babelCallSoulStyles')) throw new Error('Human Intelligence / Call Theater Layer inválida.');
if(!thesis.includes('babelCallThesisModule')||!thesis.includes('babelCallThesisStyles')) throw new Error('Thesis-first Layer inválida.');
if(!focus.includes('babelCallFocusModule')||!focus.includes('babelCallFocusStyles')) throw new Error('Focus OS Layer inválida.');
if(!ego.includes('babelCallEgoModule')||!ego.includes('babelCallEgoStyles')) throw new Error('Ego Revolution Layer inválida.');
if(!radarDeep.includes('babelCallRadarDeepModule')||!radarDeep.includes('babelCallRadarDeepStyles')) throw new Error('Deep Call Radar Layer inválida.');

const runtimeGuard=`<script id="babelCallRuntimeGuard">(()=>{document.documentElement.dataset.callRuntimeGuard='1';window.addEventListener('error',e=>{const msg=String(e.message||e.error?.message||'browser error').slice(0,180);document.documentElement.dataset.callGlobalError=msg;document.documentElement.dataset.callGlobalErrorSource=String(e.filename||'inline').slice(-80);document.documentElement.dataset.callGlobalErrorLine=String(e.lineno||0)});window.addEventListener('unhandledrejection',e=>{document.documentElement.dataset.callUnhandledRejection=String(e.reason?.message||e.reason||'rejection').slice(0,180)})})();</script>`;

const stamp=`<style id="babelBuildStampStyles">#babelBuildStamp{display:inline-flex;align-items:center;gap:6px;margin-left:8px;padding:5px 8px;border:1px solid rgba(88,241,159,.14);border-radius:999px;background:rgba(88,241,159,.04);color:#739181;font:800 7px/1 Inter,system-ui;letter-spacing:.1em;text-transform:uppercase}#babelBuildStamp b{color:#baffd4}</style><script id="babelBuildStampModule">(()=>{const add=()=>{if(document.getElementById('babelBuildStamp'))return true;const host=document.querySelector('.call-brand,.call-top-title,.call-state');if(!host)return false;const el=document.createElement('span');el.id='babelBuildStamp';el.innerHTML='<b>EGO FOCUS</b> · BUILD ${buildVersion}';host.appendChild(el);return true};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{let n=0;const t=setInterval(()=>{if(add()||++n>80)clearInterval(t)},100)},{once:true});else{let n=0;const t=setInterval(()=>{if(add()||++n>80)clearInterval(t)},100)}})();</script>`;

const fragment=runtimeGuard+'\n'+core+'\n'+revolution+'\n'+soul+'\n'+thesis+'\n'+focus+'\n'+ego+'\n'+radarDeep+'\n'+stamp;
html=html.replace('</body>',fragment+'\n</body>');

const out=zlib.gzipSync(Buffer.from(html,'utf8'),{level:9}).toString('base64');
if(out.length<=48000) throw new Error('Payload inesperadamente menor que 48k; loader exige seis blocos de 8000.');

for(let i=0;i<6;i++) fs.writeFileSync(chunkFiles[i],out.slice(i*8000,(i+1)*8000));
const tail=out.slice(48000);
const nextLoader=loader
  .replace(/const tail='[^']*'/,`const tail='${tail}'`)
  .replace(/\?v=[A-Za-z0-9_-]+/g,`?v=${buildVersion}`);
fs.writeFileSync('index.html',nextLoader);

console.log(`Call Ego Focus + Deep Radar applied. build=${buildVersion} HTML=${html.length} gzip-base64=${out.length} tail=${tail.length}`);
