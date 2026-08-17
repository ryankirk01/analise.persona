import fs from 'node:fs';
import zlib from 'node:zlib';

const chunkFiles=['v82-01.txt','v82-02.txt','v82-03.txt','v82-04.txt','v82-05.txt','v82-06.txt'];
const loader=fs.readFileSync('index.html','utf8');
const tailMatch=loader.match(/const tail='([^']+)'/);
if(!tailMatch) throw new Error('Tail base64 não encontrado no loader.');

const b64=chunkFiles.map(f=>fs.readFileSync(f,'utf8').trim()).join('')+tailMatch[1];
let html=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');

// Remove experiments anteriores e qualquer versão prévia do Call OS / Revolution Layer.
html=html
  .replace(/<style id="nightSalesStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="nightSalesModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallOSStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallOSModule">[\s\S]*?<\/script>/g,'')
  .replace(/<style id="babelCallRevolutionStyles">[\s\S]*?<\/style>/g,'')
  .replace(/<script id="babelCallRevolutionModule">[\s\S]*?<\/script>/g,'');

const core=fs.readFileSync('scripts/call-os-v2.fragment.html','utf8');
const revolution=fs.readFileSync('scripts/call-os-revolution.fragment.html','utf8');
if(!core.includes('babelCallOSModule')||!core.includes('babelCallOSStyles')) throw new Error('Fragmento Call OS inválido.');
if(!revolution.includes('babelCallRevolutionModule')||!revolution.includes('babelCallRevolutionStyles')) throw new Error('Revolution Layer inválida.');

const fragment=core+'\n'+revolution;
html=html.replace('</body>',fragment+'\n</body>');

const out=zlib.gzipSync(Buffer.from(html,'utf8'),{level:9}).toString('base64');
if(out.length<=48000) throw new Error('Payload inesperadamente menor que 48k; loader exige seis blocos de 8000.');

for(let i=0;i<6;i++) fs.writeFileSync(chunkFiles[i],out.slice(i*8000,(i+1)*8000));
const tail=out.slice(48000);
const nextLoader=loader
  .replace(/const tail='[^']*'/,`const tail='${tail}'`)
  .replace(/\?v=\d+/g,'?v=8701');
fs.writeFileSync('index.html',nextLoader);

console.log(`Call Intelligence OS applied. HTML=${html.length} gzip-base64=${out.length} tail=${tail.length}`);
