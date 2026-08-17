(()=>{
const D=window.BABEL_DIGITAL;
if(!D) throw new Error('BABEL_DIGITAL data not loaded');
const S=D.sectors,SRC=D.sources;
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const pct=v=>`<span class="bar"><i style="width:${Math.max(0,Math.min(100,v))}%"></i></span>`;
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);
const compact=v=>new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(v);
const avg=k=>Math.round(S.reduce((a,x)=>a+x[k],0)/S.length);
const groupLabels={agency:'AGÊNCIAS',growth:'GROWTH & MEDIA',commerce:'COMMERCE',software:'SOFTWARE & AI',revops:'REVENUE OPS',service:'SERVIÇOS DIGITAIS',vertical:'VERTICAL TECH',attention:'ATTENTION ECONOMY',infra:'INFRA & RISK'};
let activeSector=S[0],activeMode='market',capture=.05,investment=500000;

function renderHeroStats(){
 $('#sectorCount').textContent=S.length;
 $('#avgBabel').textContent=avg('babel');
 $('#avgAuto').textContent=avg('automation');
}

const views={
 owner:{label:'VISÃO DO EMPRESÁRIO DIGITAL',title:'Onde minha operação digital perde margem, velocidade e memória?',copy:'Procure pontos em que um evento já existe, mas a próxima ação ainda depende de alguém perceber, lembrar, interpretar e cobrar.',metric:'PRESSÃO OPERACIONAL',rank:'ops'},
 sales:{label:'VISÃO BABEL VENDAS',title:'Quem merece abordagem, argumento e prioridade agora?',copy:'Cruze potencial Babel, acesso ao decisor e dificuldade. O melhor alvo não é o maior mercado; é o melhor problema para provar valor.',metric:'PRIORIDADE COMERCIAL',rank:'attack'},
 investor:{label:'VISÃO DO INVESTIDOR',title:'Onde existe escala, recorrência e uma camada de inteligência acumulável?',copy:'Observe setores em que software, dados, eventos e operação se repetem em grande volume. Quanto maior a recorrência, mais a memória operacional vira ativo.',metric:'CAPITAL POTENCIAL',rank:'capital'}
};
function rankBy(kind){
 let rows=[...S];
 if(kind==='attack') rows.sort((a,b)=>(b.babel+b.access-b.difficulty)-(a.babel+a.access-a.difficulty));
 else rows.sort((a,b)=>b[kind]-a[kind]);
 return rows.slice(0,5);
}
function setView(key){
 const v=views[key];
 $$('.view-btn').forEach(b=>b.classList.toggle('on',b.dataset.view===key));
 $('#decisionView').innerHTML=`<div class="decision-eyebrow">${v.label}</div><h3>${v.title}</h3><p>${v.copy}</p><div class="decision-rank"><b>${v.metric}</b>${rankBy(v.rank).map((s,i)=>`<button data-sector-open="${s.id}"><i>${String(i+1).padStart(2,'0')}</i><span>${esc(s.name)}</span><strong>${v.rank==='capital'?s.capital:s.babel}</strong></button>`).join('')}</div>`;
 bindSectorOpen($('#decisionView'));
}
function quickDecision(type){
 const maps={tomorrow:['babel','Potencial imediato'],capital:['capital','Poder econômico'],access:['access','Acesso ao decisor'],auto:['automation','Superfície de automação'],annual:['annual','Potencial anual modelado']};
 let [k,label]=maps[type];
 let rows=[...S];
 if(k==='annual') rows.sort((a,b)=>(b.baseModel*b.contract)-(a.baseModel*a.contract)); else rows.sort((a,b)=>b[k]-a[k]);
 $('#quickAnswer').innerHTML=`<div class="quick-label">${label}</div>${rows.slice(0,6).map((s,i)=>`<button data-sector-open="${s.id}"><i>${i+1}</i><span>${esc(s.name)}</span><b>${k==='annual'?money(s.baseModel*s.contract*12):s[k]}</b></button>`).join('')}`;
 bindSectorOpen($('#quickAnswer'));
}

function initNetwork(){
 const c=$('#marketNetwork'),ctx=c.getContext('2d');let w=0,h=0,dpr=1,nodes=[],t=0;
 const groupOrder=[...new Set(S.map(x=>x.group))];
 const resize=()=>{const r=c.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);nodes=S.map((s,i)=>{const gi=groupOrder.indexOf(s.group),angle=(gi/groupOrder.length)*Math.PI*2+(i%5-.5)*.12,rad=Math.min(w,h)*(.23+.04*(i%3));return{s,x:w/2+Math.cos(angle)*rad,y:h/2+Math.sin(angle)*rad,phase:i*.83}})};resize();addEventListener('resize',resize,{passive:true});
 const val=s=>activeMode==='money'?s.capital:activeMode==='sales'?(100-s.difficulty+s.access)/2:activeMode==='connections'?s.ops:s.babel;
 const loop=()=>{t+=.008;ctx.clearRect(0,0,w,h);ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<nodes.length;i++){let a=nodes[i];for(let j=i+1;j<nodes.length;j++){let b=nodes[j];if(a.s.group!==b.s.group&&Math.abs(a.s.babel-b.s.babel)>3)continue;let dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist<Math.min(w,h)*.28){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(185,86,255,${.018+(1-dist/(Math.min(w,h)*.28))*.06})`;ctx.lineWidth=.6;ctx.stroke()}}}
 for(const n of nodes){const v=val(n.s),pulse=1+Math.sin(t*4+n.phase)*.12,r=2.8+(v/100)*4.2*pulse;ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.fillStyle=`rgba(205,112,255,${.25+v/150})`;ctx.shadowBlur=18;ctx.shadowColor='rgba(186,70,255,.7)';ctx.fill();ctx.shadowBlur=0}
 ctx.restore();requestAnimationFrame(loop)};loop();
 setInterval(()=>{const top=[...S].sort((a,b)=>val(b)-val(a))[Math.floor(Date.now()/3600)%5];$('#networkFocus').innerHTML=`<span>SETOR EM FOCO</span><b>${esc(top.name)}</b><i>${activeMode.toUpperCase()} · ${Math.round(val(top))}</i>`},2200);
}
function setNetworkMode(mode){activeMode=mode;$$('.network-mode').forEach(b=>b.classList.toggle('on',b.dataset.mode===mode));const copy={market:'A rede compara potencial, maturidade e pressão operacional.',money:'Capital potencial e recorrência aumentam peso visual.',sales:'Acesso ao decisor e menor fricção comercial sobem na rede.',connections:'Setores com mais eventos, handoffs e dependências se destacam.'};$('#networkSignal').textContent=copy[mode]}

function revenueSectorOptions(){$('#revSector').innerHTML=[...S].sort((a,b)=>b.babel-a.babel).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');$('#revSector').value=activeSector.id;renderRevenue()}
function renderRevenue(){const s=S.find(x=>x.id===$('#revSector').value)||activeSector;activeSector=s;const annual=s.baseModel*s.contract*12*capture;$('#revContract').textContent=money(s.contract)+'/mês';$('#revBase').textContent=compact(s.baseModel)+' contas';$('#revCapture').textContent=(capture<1?capture.toFixed(2):capture)+'%';$('#revResult').textContent=money(annual);$('#revExplain').textContent=`${compact(s.baseModel)} contas elegíveis modeladas × ${money(s.contract)}/mês × ${capture}% de captura × 12. Base elegível e contrato são hipóteses Babel; não são TAM oficial nem receita garantida.`;renderRevenueRanking()}
function renderRevenueRanking(){const rows=[...S].sort((a,b)=>(b.baseModel*b.contract)-(a.baseModel*a.contract)).slice(0,10);$('#revenueRanking').innerHTML=rows.map((s,i)=>`<button data-sector-open="${s.id}"><i>${String(i+1).padStart(2,'0')}</i><span><b>${esc(s.name)}</b><small>${esc(s.anchor)}</small></span><strong>${money(s.baseModel*s.contract*12)}</strong></button>`).join('');bindSectorOpen($('#revenueRanking'))}

function sectorTable(){const group=$('#sectorGroup').value,diff=$('#sectorDifficulty').value,q=$('#sectorSearch').value.toLowerCase().trim();let rows=S.filter(s=>(!group||s.group===group)&&(!q||`${s.name} ${s.anchor} ${s.pain} ${s.decision}`.toLowerCase().includes(q))&&(!diff||(diff==='easy'?s.difficulty<50:diff==='mid'?s.difficulty>=50&&s.difficulty<70:s.difficulty>=70)));rows.sort((a,b)=>b.babel-a.babel);$('#sectorRows').innerHTML=rows.map((s,i)=>`<tr data-sector-open="${s.id}"><td>${String(i+1).padStart(2,'0')}</td><td><b>${esc(s.name)}</b><small>${esc(groupLabels[s.group])}</small></td><td>${esc(s.anchor)}</td><td>${esc(SRC[s.source]?.label||'Heurística Babel')}</td><td><span class="priority ${s.priority.toLowerCase()}">${s.priority}</span></td><td>${money(s.contract)}</td><td>${compact(s.baseModel)}</td><td>${s.capital}${pct(s.capital)}</td><td>${100-s.difficulty}${pct(100-s.difficulty)}</td><td>${s.access}${pct(s.access)}</td><td>${s.ops}${pct(s.ops)}</td><td>${s.automation}${pct(s.automation)}</td><td>${s.maturity}${pct(s.maturity)}</td><td class="babel-cell">${s.babel}</td></tr>`).join('');bindSectorOpen($('#sectorRows'))}
function bindSectorOpen(root=document){$$('[data-sector-open]',root).forEach(el=>{el.onclick=()=>{const s=S.find(x=>x.id===el.dataset.sectorOpen);if(!s)return;activeSector=s;renderDetail();renderGold();$('#revSector')&&($('#revSector').value=s.id,renderRevenue());location.hash='detail'}})}

function renderDetail(){const s=activeSector,src=SRC[s.source];$('#detailSector').textContent=s.name;$('#detailScore').textContent=s.babel;$('#detailPriority').textContent=s.priority;$('#detailGrid').innerHTML=`
 <article><span>DECISÃO</span><h4>${s.priority==='ATAQUE'?'Atacar com prova rápida e processo específico.':s.priority==='ESTRATÉGICO'?'Venda consultiva com prova técnica e ROI.':'Qualificar antes de investir ciclo comercial.'}</h4><p>Use uma única fricção operacional como porta de entrada. Não tente explicar a Babel inteira.</p></article>
 <article><span>DECISOR</span><h4>${esc(s.decision)}</h4><p>Acesso modelado: ${s.access}/100. Quanto mais enterprise, mais importante mapear sponsor, usuário e área técnica.</p></article>
 <article><span>DOR FUNDAMENTAL</span><h4>${esc(s.pain)}</h4><p>Pressão operacional ${s.ops}/100 · automação ${s.automation}/100.</p></article>
 <article><span>PONTO DE OURO</span><h4>${esc(s.gold)}</h4><p>O valor aparece quando um sinal já existe, mas a ação certa ainda não acontece com contexto suficiente.</p></article>
 <article><span>ARGUMENTO</span><h4>${esc(s.opening)}</h4><p>Use como hipótese e escute a resposta. A pergunta vale mais que uma afirmação genérica.</p></article>
 <article><span>RISCO</span><h4>${esc(s.risk)}</h4><p>Dificuldade comercial ${s.difficulty}/100 · maturidade ${s.maturity}/100.</p></article>`;
 $('#detailEvidence').innerHTML=`<div><b>ÂNCORA DE MERCADO</b><span>${esc(s.anchor)}</span></div><div><b>BASE ELEGÍVEL MODELADA</b><span>${compact(s.baseModel)} contas</span></div><div><b>CONTRATO MENSAL MODELADO</b><span>${money(s.contract)}</span></div><div><b>FONTE / EVIDÊNCIA</b><span>${src?`<a href="${src.url}" target="_blank" rel="noopener">${esc(src.label)} ↗</a>`:'Heurística Babel'}</span></div>`;
}
const GOLD={
 agency:[['Aprovação parada','Cliente aprovou parcialmente ou não respondeu; produção perde sequência.'],['Briefing incompleto','Projeto começa sem dado crítico e vira retrabalho.'],['Conta sem próxima ação','Atendimento sabe que algo falta, mas ninguém possui o próximo passo.']],
 growth:[['Desvio sem ação','Métrica muda, dashboard mostra, mas ação demora.'],['Lead esfriando','Intenção existe e a cadência perde timing.'],['Relatório sem decisão','Dado chega, mas não produz tarefa operacional.']],
 commerce:[['Abandono com intenção','Sinal de compra existe e a recuperação não acontece no timing certo.'],['Suporte vira churn','Problema operacional não chega ao time com contexto econômico.'],['Recompra esquecida','Base possui histórico, mas próxima oferta depende de campanha manual.']],
 software:[['Product signal órfão','Uso, queda ou intenção existe e não chega a vendas/CS como ação.'],['Handoff silencioso','Marketing, Sales, CS e Produto possuem fragmentos diferentes do cliente.'],['Risco de churn tardio','Sinais aparecem antes, mas o processo reage depois.']],
 revops:[['Regra sem contexto','Automação fixa chega a uma exceção e para.'],['CRM atualizado, operação parada','Registro existe; ação ainda depende de pessoa.'],['Cadência sem inteligência','Sequência continua mesmo quando o contexto mudou.']],
 service:[['Projeto esperando alguém','Dependência existe, mas o sistema não cria urgência contextual.'],['Conhecimento preso no especialista','Processo repetível continua artesanal.'],['Escopo vira coordenação','Mudança e aprovação consomem a capacidade de quem deveria entregar.']],
 vertical:[['Documento pendente','A jornada para por dependência administrativa.'],['Atendimento fragmentado','Histórico e intenção se perdem entre canais.'],['Exceção sem dono','Evento importante surge e ninguém sabe quem deve agir.']],
 attention:[['Entrega em risco','Campanha, creator ou conteúdo depende de uma sequência manual.'],['Audiência sem ação','Sinal de comportamento não vira relacionamento ou receita.'],['Monetização fragmentada','Conteúdo, sponsor, venda e comunidade operam separados.']],
 infra:[['Alert fatigue','Volume de eventos impede priorização por impacto real.'],['Incidente sem contexto','Time técnico reage antes de entender consequência de negócio.'],['Mudança sem memória','Histórico e decisão ficam dispersos entre ferramentas.']]
};
function renderGold(){const s=activeSector,items=GOLD[s.group]||GOLD.service;$('#goldSector').textContent=s.name;$('#goldGrid').innerHTML=items.concat([['Momento de verdade',s.gold],['Sinal prioritário',s.signal],['Prova comercial',`Demonstrar uma ação real em ${s.name}, com antes/depois de tempo, erro ou receita.`]]).map((x,i)=>`<article><i>${String(i+1).padStart(2,'0')}</i><span>${esc(x[0])}</span><p>${esc(x[1])}</p></article>`).join('')}

function renderPulse(){const metrics=[['POTENCIAL BABEL','babel'],['CAPITAL','capital'],['ACESSO','access'],['PRESSÃO OPS','ops'],['AUTOMAÇÃO','automation'],['MATURIDADE','maturity']];$('#pulseMetrics').innerHTML=metrics.map(([l,k])=>`<article><b>${avg(k)}</b><span>${l}</span>${pct(avg(k))}</article>`).join('')}

const SIGNAL_LEVELS={100:{title:'100 operações conectadas',copy:'Casos reais, vocabulário de dores e primeiros padrões por nicho.',items:['motivos de perda','tempo de resposta','tipos de tarefa','objeções comerciais']},1000:{title:'1.000 operações conectadas',copy:'Benchmark setorial começa a ganhar densidade suficiente para comparação útil.',items:['conversão por setor','SLA operacional','gargalos recorrentes','faixas de demanda']},10000:{title:'10.000 operações conectadas',copy:'Sinais cruzados entre setores permitem enxergar deslocamentos de demanda, oferta e eficiência.',items:['demanda emergente','falta de oferta','sazonalidade antecipada','mudança de canal']},100000:{title:'100.000 operações conectadas',copy:'Hipótese de um sistema nervoso econômico digital: padrões agregados em escala, com governança e privacidade.',items:['índices próprios','comparação entre mercados','expansão geográfica','previsão de capacidade']}};
function signalLevel(n){const x=SIGNAL_LEVELS[n];$$('.scale-btn').forEach(b=>b.classList.toggle('on',+b.dataset.scale===n));$('#signalLevel').innerHTML=`<span>${x.title}</span><h3>${x.copy}</h3><div>${x.items.map(i=>`<i>${i}</i>`).join('')}</div><p>Visão de produto: esses sinais só podem ser apresentados como observados quando houver dados suficientes, permissão, anonimização, governança e metodologia.</p>`}

function renderCapital(){const multiple=+($('#capitalMultiple')?.value||5),dilution=.20,future=investment*multiple*(1-dilution);$('#capitalInvestment').textContent=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(investment);$('#capitalFuture').textContent=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(future);$('#capitalFormula').textContent=`Cenário ilustrativo: ${multiple}x no valor da empresa e 20% de diluição futura. Não estima probabilidade, liquidez nem retorno garantido.`}

function renderSources(){const used=[...new Set(S.map(x=>x.source))];$('#sourceList').innerHTML=used.map(k=>{const s=SRC[k];return `<a href="${s.url}" target="_blank" rel="noopener"><span>${esc(s.label)}</span><i>abrir fonte ↗</i></a>`}).join('')}

function bg(){const c=$('#void'),x=c.getContext('2d');let w,h,d=1,p=[];const resize=()=>{w=innerWidth;h=innerHeight;d=Math.min(devicePixelRatio||1,2);c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px';x.setTransform(d,0,0,d,0,0);p=Array.from({length:Math.min(95,Math.floor(w/14))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.13,vy:(Math.random()-.5)*.13,r:Math.random()*1.2+.25}))};resize();addEventListener('resize',resize,{passive:true});const loop=()=>{x.clearRect(0,0,w,h);for(const a of p){a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>w)a.vx*=-1;if(a.y<0||a.y>h)a.vy*=-1;x.beginPath();x.arc(a.x,a.y,a.r,0,Math.PI*2);x.fillStyle='rgba(205,115,255,.20)';x.fill()}requestAnimationFrame(loop)};loop()}

function bind(){
 $$('.view-btn').forEach(b=>b.onclick=()=>setView(b.dataset.view));
 $$('.quick-btn').forEach(b=>b.onclick=()=>quickDecision(b.dataset.quick));
 $$('.network-mode').forEach(b=>b.onclick=()=>setNetworkMode(b.dataset.mode));
 $('#revSector').onchange=renderRevenue;
 $$('.capture-btn').forEach(b=>b.onclick=()=>{capture=+b.dataset.capture;$$('.capture-btn').forEach(x=>x.classList.toggle('on',x===b));renderRevenue()});
 ['sectorSearch','sectorGroup','sectorDifficulty'].forEach(id=>$('#'+id).addEventListener(id==='sectorSearch'?'input':'change',sectorTable));
 $$('.scale-btn').forEach(b=>b.onclick=()=>signalLevel(+b.dataset.scale));
 $$('.investment-btn').forEach(b=>b.onclick=()=>{investment=+b.dataset.investment;$$('.investment-btn').forEach(x=>x.classList.toggle('on',x===b));renderCapital()});
 $('#capitalMultiple').onchange=renderCapital;
 const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('on')),{threshold:.07});$$('.reveal').forEach(el=>io.observe(el));
}
function init(){renderHeroStats();setView('owner');quickDecision('tomorrow');revenueSectorOptions();sectorTable();renderDetail();renderGold();renderPulse();signalLevel(1000);renderCapital();renderSources();bind();bg();initNetwork();document.documentElement.dataset.digitalWorldMounted='1';document.documentElement.dataset.digitalSectorCount=String(S.length);document.documentElement.dataset.digitalSectionCount=String($$('main > section').length)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
