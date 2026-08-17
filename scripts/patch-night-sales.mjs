import fs from 'node:fs';
import zlib from 'node:zlib';

const chunkFiles=['v82-01.txt','v82-02.txt','v82-03.txt','v82-04.txt','v82-05.txt','v82-06.txt'];
const loader=fs.readFileSync('index.html','utf8');
const tailMatch=loader.match(/const tail='([^']+)'/);
if(!tailMatch) throw new Error('Tail base64 não encontrado no loader.');
const b64=chunkFiles.map(f=>fs.readFileSync(f,'utf8').trim()).join('')+tailMatch[1];
let html=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');

if(!html.includes('nightSalesToggle')){
const css=`
<style id="nightSalesStyles">
.night-sales-wrap{margin:18px 0 26px;border:1px solid rgba(239,209,118,.25);border-radius:18px;background:linear-gradient(145deg,rgba(16,23,28,.96),rgba(6,10,13,.98));overflow:hidden;box-shadow:0 22px 70px rgba(0,0,0,.22)}
.night-sales-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 20px;border:0;background:transparent;color:#f4f5f1;text-align:left;cursor:pointer;font:inherit}
.night-sales-trigger:hover{background:rgba(239,209,118,.035)}
.night-sales-trigger-main{display:flex;gap:13px;align-items:center}.night-sales-icon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:rgba(239,209,118,.09);border:1px solid rgba(239,209,118,.22);font-size:20px}
.night-sales-kicker{font-size:9px;letter-spacing:.16em;color:#efd176;text-transform:uppercase;font-weight:900}.night-sales-title{font-size:14px;font-weight:850;margin-top:3px}.night-sales-sub{font-size:10px;color:#86959e;margin-top:4px;line-height:1.5}.night-sales-chevron{font-size:16px;color:#efd176;transition:transform .25s ease}.night-sales-trigger[aria-expanded="true"] .night-sales-chevron{transform:rotate(180deg)}
.night-sales-panel{display:none;border-top:1px solid rgba(255,255,255,.07);padding:18px}.night-sales-panel.open{display:block;animation:nightReveal .3s ease}@keyframes nightReveal{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
.night-sales-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:15px}.night-sales-head h4{font-size:16px;margin:0 0 5px}.night-sales-head p{font-size:10px;color:#84929a;max-width:720px;line-height:1.6;margin:0}.night-sales-badge{white-space:nowrap;font-size:8px;letter-spacing:.12em;text-transform:uppercase;border:1px solid rgba(117,222,246,.2);color:#75def6;border-radius:999px;padding:7px 10px;background:rgba(117,222,246,.05)}
.night-sales-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.night-sales-card{border:1px solid rgba(255,255,255,.075);border-radius:14px;padding:14px;background:rgba(255,255,255,.018)}.night-sales-rank{font-size:8px;color:#efd176;letter-spacing:.13em;font-weight:900}.night-sales-company{font-size:13px;font-weight:850;margin:5px 0 4px}.night-sales-meta{font-size:9px;color:#75def6;margin-bottom:9px}.night-sales-reason{font-size:10px;color:#9aa5aa;line-height:1.55}.night-sales-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}.night-sales-tags span{font-size:7px;letter-spacing:.08em;text-transform:uppercase;padding:5px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.08);color:#aab4b8}.night-sales-action{margin-top:9px;font-size:9px;color:#e6e8e5}.night-sales-note{margin-top:13px;padding:10px 12px;border-radius:10px;background:rgba(239,209,118,.045);border-left:2px solid #efd176;font-size:9px;color:#909ca2;line-height:1.55}
@media(max-width:720px){.night-sales-grid{grid-template-columns:1fr}.night-sales-head{display:block}.night-sales-badge{display:inline-block;margin-top:10px}.night-sales-trigger{padding:15px}.night-sales-panel{padding:14px}}
</style>`;

const js=`
<script id="nightSalesModule">
(()=>{
 const boot=()=>{
  if(document.getElementById('nightSalesToggle'))return;
  const candidates=[...document.querySelectorAll('h1,h2,h3,h4,h5,div,p,span')].filter(el=>/04\\s*[·.-]\\s*INTELIGÊNCIA POR SETOR/i.test((el.textContent||'').trim())).sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
  const marker=candidates[0]; if(!marker)return;
  const wrap=document.createElement('div');wrap.className='night-sales-wrap';
  wrap.innerHTML=\`<button class="night-sales-trigger" id="nightSalesToggle" type="button" aria-expanded="false" aria-controls="nightSalesPanel"><span class="night-sales-trigger-main"><span class="night-sales-icon">☾</span><span><span class="night-sales-kicker">Modo noturno · ticket-alvo R$ 2.000/mês</span><span class="night-sales-title">Melhores empresas para ligar à noite</span><span class="night-sales-sub">Abra somente quando quiser priorizar empresas com operação noturna, decisor potencialmente acessível e maior valor econômico por lead.</span></span></span><span class="night-sales-chevron">⌄</span></button><div class="night-sales-panel" id="nightSalesPanel"><div class="night-sales-head"><div><h4>Radar de prospecção noturna</h4><p>Ranking comercial orientado por horário de operação, valor potencial de cliente, dependência de atendimento e aderência a uma mensalidade de R$ 2 mil. Prioridade não significa orçamento confirmado.</p></div><span class="night-sales-badge">janela recomendada · 18h30–20h30</span></div><div class="night-sales-grid">
  <article class="night-sales-card"><div class="night-sales-rank">01 · PRIORIDADE MUITO ALTA</div><div class="night-sales-company">Sorridents Clínicas Odontológicas · Bertioga</div><div class="night-sales-meta">opera até 20h em dias úteis</div><div class="night-sales-reason">Odontologia possui alto valor por paciente e forte dependência de atendimento, retorno, agenda e recuperação de leads. Um ganho pequeno de conversão pode justificar um contrato recorrente.</div><div class="night-sales-tags"><span>alto ticket</span><span>agenda</span><span>leads</span></div><div class="night-sales-action">Abordagem: reduzir perda de pacientes entre WhatsApp, recepção e follow-up.</div></article>
  <article class="night-sales-card"><div class="night-sales-rank">02 · PRIORIDADE MUITO ALTA</div><div class="night-sales-company">Camila Morais · Estética Avançada</div><div class="night-sales-meta">opera até 20h em dias úteis</div><div class="night-sales-reason">Estética avançada combina recorrência, procedimentos de maior margem, consultas via mensagem e necessidade constante de reativação. O período final do expediente tende a ser uma janela melhor para contato.</div><div class="night-sales-tags"><span>recorrência</span><span>WhatsApp</span><span>reativação</span></div><div class="night-sales-action">Abordagem: automatizar captação, confirmação e recuperação de clientes.</div></article>
  <article class="night-sales-card"><div class="night-sales-rank">03 · PRIORIDADE ALTA</div><div class="night-sales-company">Empório Espaço Gourmet · Riviera</div><div class="night-sales-meta">operação registrada até 22h</div><div class="night-sales-reason">Negócio premium em Riviera, com contexto de consumo de maior poder aquisitivo e operação prolongada. A tese de venda deve focar atendimento, pedidos, recorrência e relacionamento — não apenas marketing.</div><div class="night-sales-tags"><span>Riviera</span><span>premium</span><span>operação noturna</span></div><div class="night-sales-action">Abordagem: inteligência de atendimento e recorrência de clientes.</div></article>
  <article class="night-sales-card"><div class="night-sales-rank">04 · PRIORIDADE ALTA</div><div class="night-sales-company">João Macarrão · Maitinga</div><div class="night-sales-meta">terça a sábado · 18h–23h</div><div class="night-sales-reason">A operação é essencialmente noturna. Restaurantes com reservas, delivery, grupos e atendimento digital possuem fluxos repetitivos que podem ser organizados e automatizados.</div><div class="night-sales-tags"><span>18h–23h</span><span>reservas</span><span>delivery</span></div><div class="night-sales-action">Abordagem: atendimento, reservas e recuperação de pedidos perdidos.</div></article>
  <article class="night-sales-card"><div class="night-sales-rank">05 · PRIORIDADE ALTA</div><div class="night-sales-company">Woom Foods · Bertioga</div><div class="night-sales-meta">operação diária registrada até 22h</div><div class="night-sales-reason">Delivery e atendimento em horário prolongado tornam visíveis gargalos de resposta, pedidos e recompra. É um alvo interessante quando a oferta conecta automação diretamente a volume operacional.</div><div class="night-sales-tags"><span>delivery</span><span>recompra</span><span>até 22h</span></div><div class="night-sales-action">Abordagem: reduzir demora de resposta e aumentar recompra.</div></article>
  <article class="night-sales-card"><div class="night-sales-rank">06 · PRIORIDADE SELETIVA</div><div class="night-sales-company">Carmen Steffens · Shopping Riviera</div><div class="night-sales-meta">operação registrada até 21h</div><div class="night-sales-reason">Marca de varejo premium e funcionamento noturno. A oportunidade existe, mas a decisão pode depender de gestão de rede/franquia; por isso deve entrar depois dos negócios com decisor local mais provável.</div><div class="night-sales-tags"><span>premium</span><span>varejo</span><span>Riviera</span></div><div class="night-sales-action">Abordagem: relacionamento, carteira e recuperação de oportunidades.</div></article>
  </div><div class="night-sales-note"><b>Critério de uso:</b> ligue preferencialmente antes do pico operacional. Verifique horário e contato antes da chamada. O valor de R$ 2.000/mês é um objetivo comercial da oferta, não uma afirmação de que essas empresas possuem orçamento aprovado.</div></div>\`;
  marker.insertAdjacentElement('afterend',wrap);
  const btn=wrap.querySelector('#nightSalesToggle'),panel=wrap.querySelector('#nightSalesPanel');
  btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!open));panel.classList.toggle('open',!open)});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
</script>`;
html=html.replace('</head>',css+'</head>').replace('</body>',js+'</body>');
}

const out=zlib.gzipSync(Buffer.from(html,'utf8'),{level:9}).toString('base64');
if(out.length<=48000)throw new Error('Payload inesperadamente menor que 48k; loader exige seis blocos de 8000.');
for(let i=0;i<6;i++)fs.writeFileSync(chunkFiles[i],out.slice(i*8000,(i+1)*8000));
const tail=out.slice(48000);
let nextLoader=loader.replace(/const tail='[^']*'/,`const tail='${tail}'`).replace(/\?v=\d+/g,'?v=8301');
fs.writeFileSync('index.html',nextLoader);
console.log(`Night-sales module applied. HTML=${html.length} gzip-base64=${out.length} tail=${tail.length}`);
