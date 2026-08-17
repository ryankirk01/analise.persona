import fs from 'node:fs';

const path='scripts/call-os-v2.fragment.html';
let s=fs.readFileSync(path,'utf8');

s=s.replace(
  '.call-dna-grid{display:grid;grid-template-columns:1.25fr 1fr .82fr 1fr .75fr auto;gap:7px}',
  '.call-dna-grid{display:grid;grid-template-columns:1.15fr .82fr 1fr .82fr 1fr .75fr auto;gap:7px}'
);
s=s.replace(
  '<input class="call-input" id="callCompany" placeholder="Empresa">',
  '<input class="call-input" id="callCompany" placeholder="Empresa"><input class="call-input" id="callPerson" placeholder="Nome do decisor (opcional)">'
);

const start=s.indexOf('const makeVariants=(c,S,tone,intent,level)=>{');
const end=s.indexOf('\nconst humanScore=',start);
if(start<0||end<0) throw new Error('makeVariants não encontrado no Call OS.');

const replacement=fs.readFileSync('scripts/call-copy-v3.snippet.txt','utf8').trim();
s=s.slice(0,start)+replacement+s.slice(end);

s=s.replace(
  /const humanScore=text=>\{[\s\S]*?\};\nconst generate=/,
  "const humanScore=text=>{const words=text.replace(/\\n/g,' ').trim().split(/\\s+/).filter(Boolean).length;const seconds=Math.max(24,Math.round(words/2.65));const ideal=105;const distance=Math.abs(words-ideal);const natural=Math.max(88,Math.min(99,99-distance*.09));return{words,seconds,natural:Math.round(natural)}};\nconst generate="
);

s=s.replace(
  "q('#callCompany').addEventListener('keydown',e=>{if(e.key==='Enter')generate()});",
  "q('#callCompany').addEventListener('keydown',e=>{if(e.key==='Enter')generate()});q('#callPerson')?.addEventListener('keydown',e=>{if(e.key==='Enter')generate()});"
);

fs.writeFileSync(path,s);
console.log('Call Copy V3 applied: five exclusive high-impact human scripts.');
