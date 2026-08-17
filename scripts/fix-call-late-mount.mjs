import fs from 'node:fs';

const replaceBoot=(path,newBoot)=>{
  let source=fs.readFileSync(path,'utf8');
  const start=source.lastIndexOf('const boot=()=>');
  const end=source.indexOf("if(document.readyState==='loading')",start);
  if(start<0||end<0) throw new Error(`Boot block not found in ${path}`);
  const current=source.slice(start,end);
  if(current.includes('MutationObserver')&&current.includes('document.documentElement')){
    console.log(`${path}: resilient mount already applied.`);
    return;
  }
  source=source.slice(0,start)+newBoot+'\n'+source.slice(end);
  fs.writeFileSync(path,source);
  console.log(`${path}: resilient late mount applied.`);
};

replaceBoot('scripts/call-os-revolution.fragment.html',`const boot=()=>{
 if(enhance())return;
 let scheduled=false;
 const observer=new MutationObserver(()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
   scheduled=false;
   if(enhance())observer.disconnect();
  });
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
};`);

replaceBoot('scripts/call-soul-theater.fragment.html',`const boot=()=>{
 const initialize=()=>{
  const ready=$('#callRevAutopilotSection')&&$('#callScripts');
  if(!ready)return false;
  mountTheater();humanSection();annotateScripts();
  const root=$('#callScripts');
  if(root&&!root.dataset.soulObserved){
   root.dataset.soulObserved='1';
   const scriptsObserver=new MutationObserver(()=>{
    clearTimeout(root._soulTimer);
    root._soulTimer=setTimeout(annotateScripts,35);
   });
   scriptsObserver.observe(root,{childList:true,subtree:true});
  }
  if(!document.documentElement.dataset.soulControlsBound){
   document.documentElement.dataset.soulControlsBound='1';
   ['callCompany','callPerson','callSector','callTone','callIntent','callIntensity'].forEach(id=>$('#'+id)?.addEventListener('change',()=>setTimeout(()=>{
    annotateScripts();theater.dialogue=buildDialogue(theater.script);theater.turn=0;renderTheater();
   },70)));
   $('#callGenerate')?.addEventListener('click',()=>setTimeout(annotateScripts,90));
  }
  return true;
 };
 if(initialize())return;
 let scheduled=false;
 const observer=new MutationObserver(()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
   scheduled=false;
   if(initialize())observer.disconnect();
  });
 });
 observer.observe(document.documentElement,{childList:true,subtree:true});
};`);
