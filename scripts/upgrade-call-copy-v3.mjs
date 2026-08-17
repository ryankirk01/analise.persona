import fs from 'node:fs';

const path='scripts/call-os-v2.fragment.html';
let s=fs.readFileSync(path,'utf8');

// Optional decision-maker name: makes scripts sound like a real conversation, not a template.
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

const replacement=String.raw`const makeVariants=(c,S,tone,intent,level)=>{
const person=q('#callPerson')?.value.trim()||'';
const now=new Date().getHours();
const greeting=now<12?'Bom dia':now<18?'Boa tarde':'Boa noite';
const nameBeat=person?`Olá, ${person}.`:'Perfeito.';
const formal=person?person:'senhor';
const company=c==='a empresa'?'a empresa':c;
const intensityLine=level===3?'A ideia é simples: a empresa para de esperar comando e começa a agir no momento em que a operação exige.':level===1?'A ideia é tirar da equipe aquilo que o sistema já pode perceber e executar sozinho.':'A ideia é fazer a operação perceber o que precisa acontecer e executar a próxima ação sem depender de alguém lembrar.';
const close=intent==='Conseguir reunião'?`Eu consigo te mostrar isso em no máximo 15 minutos. Para você funciona melhor hoje ou amanhã?`:`Eu queria te mostrar isso aplicado à ${company} em no máximo 15 minutos. É melhor para você hoje ou amanhã?`;
return[
{
 name:'01 · QUESTIONAMENTO DE FUTURO',
 why:'Curiosidade genuína → projeção mental → tempo e dinheiro → escolha hoje/amanhã',
 text:`${greeting}, tudo bem? Eu falo com um dos executivos da ${company}?\n\n${nameBeat} Me chamo Ryan Kirk, sou um dos representantes da Babel. Eu só queria te fazer um simples questionamento.\n\nSe você visse a ${company} trabalhando de forma automática e pensando por conta própria, qual seria a primeira coisa que você gostaria que ela resolvesse?\n\nPerfeito. É justamente aí que a Babel entra. A gente dá consciência operacional para a empresa perceber o que precisa acontecer e agir sem depender de alguém mandar cada passo. No fim, o nosso propósito é muito simples: devolver tempo e dinheiro para quem está no comando.\n\n${close}`
},
{
 name:'02 · A EMPRESA ACORDA SABENDO',
 why:'Cria uma cena mental impossível de responder sem imaginar a própria operação',
 text:`${greeting}, tudo bem? Eu consigo falar com alguém que realmente conheça a operação da ${company}?\n\n${nameBeat} Aqui é o Ryan Kirk, da Babel. Eu vou te fazer um questionamento um pouco fora do padrão.\n\nSe amanhã a ${company} acordasse sabendo exatamente o que precisa fazer, sem ninguém lembrar ela de cada próxima tarefa, qual problema você mandaria ela resolver primeiro?\n\nÉ isso que a Babel está construindo. ${intensityLine} Menos tempo gasto comandando rotina e menos dinheiro escapando porque uma ação ficou para depois.\n\n${close}`
},
{
 name:'03 · O PONTO CEGO',
 why:'Faz o decisor identificar sozinho onde a operação perde velocidade e dinheiro',
 text:`${greeting}. Eu falo com quem responde pela operação da ${company}?\n\n${nameBeat} Meu nome é Ryan Kirk, sou da Babel. Não quero te fazer uma apresentação; eu queria só validar uma coisa com você.\n\nHoje, qual parte da ${company} mais depende de alguém perceber que alguma coisa precisa acontecer e ir lá fazer?\n\nEu pergunto porque esse é exatamente o ponto que a Babel elimina. O sistema passa a identificar a próxima ação e executar sozinho. A empresa deixa de depender de memória, cobrança e acompanhamento manual para continuar andando.\n\nSe eu desenhar esse ponto da ${company} para você, são 15 minutos. Você prefere ver isso hoje ou amanhã?`
},
{
 name:'04 · 30 DIAS SEM COMANDAR',
 why:'Contraste forte: revela dependência operacional antes de apresentar a solução',
 text:`${greeting}, tudo bem? Eu queria falar com um dos responsáveis pela ${company}.\n\n${nameBeat} Ryan Kirk, da Babel. Posso te fazer um questionamento bem direto?\n\nSe você passasse 30 dias sem precisar lembrar ninguém do que fazer, cobrar nenhuma próxima ação e conferir nenhuma rotina, o que teria que mudar primeiro dentro da ${company} para isso ser possível?\n\nEsse é o trabalho da Babel. A gente transforma o que hoje depende de comando em uma operação que acompanha, pensa o próximo passo e age. O ganho não é ter mais uma ferramenta; é o dono recuperar tempo e a empresa parar de perder dinheiro por atraso operacional.\n\nEu te mostro por onde começar em 15 minutos. Hoje ou amanhã fica melhor?`
},
{
 name:'05 · CONSCIÊNCIA OPERACIONAL',
 why:'Posicionamento de categoria: não vende automação comum; vende uma empresa capaz de perceber e agir',
 text:`${greeting}, tudo bem? Eu falo com um dos executivos da ${company}?\n\n${nameBeat} Me chamo Ryan Kirk, represento a Babel. Eu queria te deixar com um único questionamento.\n\nSe a sua empresa conseguisse perceber um problema antes de você, decidir a próxima ação e resolver aquilo sem esperar uma ordem, em qual setor isso teria mais valor hoje?\n\nÉ isso que nós chamamos de consciência operacional. A Babel conecta a operação para que a empresa deixe de ser apenas um conjunto de sistemas e comece a agir como uma estrutura inteligente. O objetivo é simples: fazer sobrar mais tempo e proteger mais dinheiro.\n\n${close}`
}
]};`;

s=s.slice(0,start)+replacement+s.slice(end);

// Reframe the quality metric around speakability, not literary sophistication.
s=s.replace(
  /const humanScore=text=>\{[\s\S]*?\};\nconst generate=/,
  `const humanScore=text=>{const words=text.replace(/\\n/g,' ').trim().split(/\\s+/).filter(Boolean).length;const seconds=Math.max(24,Math.round(words/2.65));const ideal=105;const distance=Math.abs(words-ideal);const natural=Math.max(88,Math.min(99,99-distance*.09));return{words,seconds,natural:Math.round(natural)}};\nconst generate=`
);

// Make the person field regenerate scripts naturally when filled.
s=s.replace(
  "q('#callCompany').addEventListener('keydown',e=>{if(e.key==='Enter')generate()});",
  "q('#callCompany').addEventListener('keydown',e=>{if(e.key==='Enter')generate()});q('#callPerson')?.addEventListener('keydown',e=>{if(e.key==='Enter')generate()});"
);

fs.writeFileSync(path,s);
console.log('Call Copy V3 applied: five exclusive high-impact human scripts.');
