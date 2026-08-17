import fs from 'node:fs';

const ensureCoreMarker=()=>{
  const path='scripts/call-os-v2.fragment.html';
  let source=fs.readFileSync(path,'utf8');
  if(source.includes('callCoreMounted')){
    console.log(`${path}: core runtime marker already applied.`);
    return;
  }
  const needle='document.body.appendChild(os);';
  if(!source.includes(needle)) throw new Error('Core append marker not found.');
  source=source.replace(needle,`${needle}document.documentElement.dataset.callCoreMounted='1';`);
  fs.writeFileSync(path,source);
  console.log(`${path}: core runtime marker applied.`);
};

const replaceBoot=(path,newBoot,marker)=>{
  let source=fs.readFileSync(path,'utf8');
  const start=source.lastIndexOf('const boot=()=>');
  const end=source.indexOf("if(document.readyState==='loading')",start);
  if(start<0||end<0) throw new Error(`Boot block not found in ${path}`);
  const current=source.slice(start,end);
  if(current.includes(marker)){
    console.log(`${path}: diagnostic resilient mount already applied.`);
    return;
  }
  source=source.slice(0,start)+newBoot+'\n'+source.slice(end);
  fs.writeFileSync(path,source);
  console.log(`${path}: diagnostic resilient mount applied.`);
};

ensureCoreMarker();

replaceBoot('scripts/call-os-revolution.fragment.html',`const boot=()=>{
 const initialize=()=>{
  try{
   const ok=enhance();
   if(ok){
    document.documentElement.dataset.callRevolutionMounted='1';
    delete document.documentElement.dataset.callRevolutionError;
   }
   return ok;
  }catch(err){
   document.documentElement.dataset.callRevolutionError=String(err?.message||err).slice(0,180);
   console.error('BABEL CALL REVOLUTION RUNTIME ERROR',err);
   return false;
  }
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
};`,'callRevolutionError');

replaceBoot('scripts/call-soul-theater.fragment.html',`const boot=()=>{
 const initialize=()=>{
  try{
   const ready=$('#callRevAutopilotSection')&&$('#callScripts');
   if(!ready)return false;
   mountTheater();humanSection();annotateScripts();
   if(!$('#callTheaterStage')||!$('#callHumanCodeSection')||!$('.call-soul-guide'))return false;
   document.documentElement.dataset.callTheaterMounted='1';
   delete document.documentElement.dataset.callTheaterError;
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
  }catch(err){
   document.documentElement.dataset.callTheaterError=String(err?.message||err).slice(0,180);
   console.error('BABEL CALL THEATER RUNTIME ERROR',err);
   return false;
  }
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
};`,'callTheaterError');
