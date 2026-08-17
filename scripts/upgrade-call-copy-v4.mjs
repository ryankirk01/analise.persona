import fs from 'node:fs';

const target='scripts/call-os-v2.fragment.html';
const snippetPath='scripts/call-copy-v4.snippet.txt';
let source=fs.readFileSync(target,'utf8');
const snippet=fs.readFileSync(snippetPath,'utf8').trim();

const start=source.indexOf('const makeVariants=(c,S,tone,intent,level)=>{');
const end=source.indexOf('\nconst humanScore=',start);
if(start<0||end<0) throw new Error('makeVariants não encontrado no Call OS source.');

const current=source.slice(start,end).trim();
if(current===snippet){
  console.log('Call Copy V4 already canonical.');
  process.exit(0);
}

source=source.slice(0,start)+snippet+source.slice(end);
fs.writeFileSync(target,source);
console.log('Call Copy V4 applied to canonical Call OS source.');
