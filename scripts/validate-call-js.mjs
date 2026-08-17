import fs from 'node:fs';
import vm from 'node:vm';

const files=[
  'scripts/call-os-v2.fragment.html',
  'scripts/call-os-revolution.fragment.html',
  'scripts/call-soul-theater.fragment.html',
  'scripts/call-thesis-os.fragment.html',
  'scripts/call-focus-os.fragment.html'
];

let failed=false;
for(const file of files){
  const src=fs.readFileSync(file,'utf8');
  const scripts=[...src.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  if(!scripts.length){
    console.error(`JS CHECK FAIL ${file}: nenhum <script> encontrado`);
    failed=true;
    continue;
  }
  scripts.forEach((code,i)=>{
    try{
      new vm.Script(code,{filename:`${file}#script-${i+1}`});
      console.log(`JS CHECK OK ${file} script ${i+1}`);
    }catch(err){
      failed=true;
      console.error(`JS CHECK FAIL ${file} script ${i+1}`);
      console.error(err.stack||err.message||String(err));
    }
  });
}
if(failed)process.exit(1);
