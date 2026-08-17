import fs from 'node:fs';

const patchCore=()=>{
  const path='scripts/call-os-v2.fragment.html';
  let source=fs.readFileSync(path,'utf8');

  source=source
    .replace(/document\.documentElement\.dataset\.callCoreMounted='1';/g,'')
    .replace(/setTimeout\(\(\)=>document\.dispatchEvent\(new CustomEvent\('babel-call-core-ready'\)\),0\);/g,'');

  const needle='objections();generate();renderHistory();};';
  if(!source.includes(needle)) throw new Error('Core completion point not found.');
  source=source.replace(needle,`objections();generate();renderHistory();\n document.documentElement.dataset.callCoreMounted='1';\n setTimeout(()=>document.dispatchEvent(new CustomEvent('babel-call-core-ready')),0);\n};`);
  fs.writeFileSync(path,source);
  console.log(`${path}: CORE READY event wired.`);
};

const namespaceSelectors=(source,prefix)=>{
  const declaration=/const \$=\(s,r=document\)=>r\.querySelector\(s\),\$\$=\(s,r=document\)=>\[\.\.\.r\.querySelectorAll\(s\)\];/;
  if(declaration.test(source)){
    source=source.replace(declaration,`const ${prefix}Q=(s,r=document)=>r.querySelector(s),${prefix}QQ=(s,r=document)=>[...r.querySelectorAll(s)];`);
  }
  source=source.replace(/\$\$\(/g,`${prefix}QQ(`).replace(/\$\(/g,`${prefix}Q(`);
  return source;
};

const patchLayer=(path,{scriptMarker,newTail,selectorPrefix})=>{
  let source=fs.readFileSync(path,'utf8');
  source=namespaceSelectors(source,selectorPrefix);

  if(!source.includes(scriptMarker)){
    const open='(()=>{';
    const at=source.indexOf(open);
    if(at<0) throw new Error(`IIFE opening not found in ${path}`);
    source=source.slice(0,at+open.length)+`\ndocument.documentElement.dataset.${scriptMarker}='1';`+source.slice(at+open.length);
  }

  const bootStart=source.lastIndexOf('const boot=()=>');
  const iifeEnd=source.lastIndexOf('})();');
  if(bootStart<0||iifeEnd<0||iifeEnd<=bootStart) throw new Error(`Boot/tail not found in ${path}`);
  source=source.slice(0,bootStart)+newTail+'\n'+source.slice(iifeEnd);
  fs.writeFileSync(path,source);
  console.log(`${path}: namespaced selectors + deterministic readiness chain wired.`);
};

patchCore();

patchLayer('scripts/call-os-revolution.fragment.html',{
  scriptMarker:'callRevolutionScriptExecuted',
  selectorPrefix:'rev',
  newTail:`const boot=()=>{
 if(document.documentElement.dataset.callRevolutionMounted==='1')return true;
 try{
  if(!revQ('.call-page'))return false;
  if(revQ('#callRevAutopilotSection'))revQQ('.call-revolution-section').forEach(el=>el.remove());
  const ok=enhance();
  if(!ok)return false;
  document.documentElement.dataset.callRevolutionMounted='1';
  delete document.documentElement.dataset.callRevolutionError;
  setTimeout(()=>document.dispatchEvent(new CustomEvent('babel-call-revolution-ready')),0);
  return true;
 }catch(err){
  document.documentElement.dataset.callRevolutionError=String(err?.message||err).slice(0,180);
  console.error('BABEL CALL REVOLUTION RUNTIME ERROR',err);
  return false;
 }
};
const onCoreReady=()=>boot();
document.addEventListener('babel-call-core-ready',onCoreReady);
if(revQ('.call-page'))queueMicrotask(onCoreReady);
window.addEventListener('load',onCoreReady,{once:true});`
});

patchLayer('scripts/call-soul-theater.fragment.html',{
  scriptMarker:'callTheaterScriptExecuted',
  selectorPrefix:'soul',
  newTail:`const boot=()=>{
 if(document.documentElement.dataset.callTheaterMounted==='1')return true;
 try{
  const ready=soulQ('#callRevAutopilotSection')&&soulQ('#callScripts');
  if(!ready)return false;
  mountTheater();
  humanSection();
  annotateScripts();
  if(!soulQ('#callTheaterStage')||!soulQ('#callHumanCodeSection')||!soulQ('.call-soul-guide'))return false;
  document.documentElement.dataset.callTheaterMounted='1';
  delete document.documentElement.dataset.callTheaterError;
  const root=soulQ('#callScripts');
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
   ['callCompany','callPerson','callSector','callTone','callIntent','callIntensity'].forEach(id=>soulQ('#'+id)?.addEventListener('change',()=>setTimeout(()=>{
    annotateScripts();theater.dialogue=buildDialogue(theater.script);theater.turn=0;renderTheater();
   },70)));
   soulQ('#callGenerate')?.addEventListener('click',()=>setTimeout(annotateScripts,90));
  }
  return true;
 }catch(err){
  document.documentElement.dataset.callTheaterError=String(err?.message||err).slice(0,180);
  console.error('BABEL CALL THEATER RUNTIME ERROR',err);
  return false;
 }
};
const onRevolutionReady=()=>boot();
document.addEventListener('babel-call-revolution-ready',onRevolutionReady);
if(soulQ('#callRevAutopilotSection'))queueMicrotask(onRevolutionReady);
window.addEventListener('load',onRevolutionReady,{once:true});`
});
