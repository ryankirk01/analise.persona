import fs from 'node:fs';

const coreTarget='scripts/call-os-v2.fragment.html';
const soulTarget='scripts/call-soul-theater.fragment.html';
const snippetPath='scripts/call-copy-v4.snippet.txt';
const snippet=fs.readFileSync(snippetPath,'utf8').trim();

let core=fs.readFileSync(coreTarget,'utf8');
const start=core.indexOf('const makeVariants=(c,S,tone,intent,level)=>{');
const end=core.indexOf('\nconst humanScore=',start);
if(start<0||end<0) throw new Error('makeVariants não encontrado no Call OS source.');

const current=core.slice(start,end).trim();
if(current!==snippet){
  core=core.slice(0,start)+snippet+core.slice(end);
  fs.writeFileSync(coreTarget,core);
  console.log('Canonical primary copy applied to Call OS source.');
}else{
  console.log('Canonical primary copy already applied.');
}

let soul=fs.readFileSync(soulTarget,'utf8');
let changed=false;
const patch=(from,to)=>{
  if(soul.includes(to)) return;
  if(!soul.includes(from)) throw new Error(`Call Theater patch point not found: ${from.slice(0,80)}`);
  soul=soul.replace(from,to);
  changed=true;
};

patch(
  '00 · CALL THEATER</div><h2>Ouça a ligação antes de fazê-la.</h2>',
  '00 · CALL THEATER</div><h2>Faça o decisor enxergar o futuro antes de ouvir uma apresentação.</h2>'
);
patch(
  'Uma simulação de treinamento transforma roteiro em experiência. O navegador interpreta Ryan e prospect com voz sintetizada quando disponível, enquanto a página mostra explicitamente o propósito humano de cada fala.',
  'A copy principal da Babel deixa de ser apenas texto e vira uma experiência treinável: fala, reação, silêncio, intenção e próximo movimento. Você enxerga por que cada frase existe antes de usá-la em uma ligação real.'
);
patch(
  'Entre na conversa antes de entrar no telefone.',
  'Uma pergunta pode mudar o eixo inteiro da ligação.'
);
patch(
  'Não memorize palavras. Observe ritmo, permissão, silêncio, reação e significado. O objetivo do teatro é fazer você entender a estrutura até conseguir conduzi-la sem depender do texto.',
  'Treine a abordagem principal até compreender a engenharia humana por trás dela: abertura genuína, curiosidade sem pitch, projeção mental, auto-diagnóstico, significado e convite para uma conversa de 15 minutos.'
);

if(!soul.includes("COPY PRINCIPAL':`SCRIPT ${n}`")){
  const tabNeedle='>SCRIPT ${n}</button>';
  if(!soul.includes(tabNeedle)) throw new Error('Call Theater tab label point not found.');
  soul=soul.replace(tabNeedle,">${i===0?'COPY PRINCIPAL':`SCRIPT ${n}`}</button>");
  changed=true;
}

patch(
  "title:'QUESTIONAMENTO DE FUTURO',human:'A pessoa não é empurrada para uma dor. Ela escolhe o futuro que mais deseja.'",
  "title:'COPY PRINCIPAL · QUESTIONAMENTO DE FUTURO',human:'A conversa começa sem pitch, cria curiosidade com um questionamento simples e faz o decisor construir mentalmente um futuro para a própria empresa antes de a Babel explicar qualquer solução.'"
);
patch(
  "['ENTRADA NEUTRA','Chegar sem cheiro de apresentação.','A pessoa ainda está decidindo se precisa se defender.','Tom de voz e disponibilidade.','Não finja intimidade. Seja simples e verdadeiro.']",
  "['ENTRADA GENUÍNA','Encontrar um executivo sem abrir com apresentação comercial.','A pergunta é simples e funcional: confirmar se você chegou à pessoa certa.','Naturalidade, disponibilidade e ausência de defesa imediata.','Não esconda quem você é quando perguntarem. A força está em não começar com pitch.']"
);
patch(
  "['PERMISSÃO','Transformar uma ligação inesperada em um pequeno espaço concedido.','“Simples questionamento” parece menor que “apresentação comercial”.','Se a pessoa disser “pode falar”, você ganhou atenção, não a venda.','Permissão é empréstimo de atenção. Use pouco.']",
  "['CURIOSIDADE','Usar “simples questionamento” para criar uma lacuna de curiosidade sem despejar proposta.','A formulação reduz o peso percebido da conversa e aumenta a expectativa sobre o que vem depois.','“Pode falar”, silêncio atento, mudança de tom ou pergunta de continuação.','Curiosidade abre espaço; não use esse espaço para enrolar. Vá direto ao questionamento.']"
);
patch(
  "['PROJEÇÃO','Fazer o decisor construir uma cena com a própria empresa.','A resposta nasce de dentro da operação dele, não da sua apresentação.','Depois da pergunta, procure a primeira dor que ele menciona sem ajuda.','Pergunte e cale-se. A imaginação precisa de espaço.']",
  "['PROJEÇÃO MENTAL','Fazer o decisor imaginar a própria empresa operando de forma automática e pensando por conta própria.','A pergunta cria uma simulação mental concreta e força a busca por uma primeira prioridade real.','Pausa, reflexão, mudança de tom e a primeira dor que ele escolhe espontaneamente.','Não sugira a resposta. Quanto menos você completar a cena, mais a resposta pertence ao cliente.']"
);
patch(
  "['SIGNIFICADO','Conectar a resposta à Babel sem apagar o que a pessoa acabou de dizer.','Ela precisa sentir que foi ouvida antes de ouvir a solução.','Repita mentalmente a palavra-chave que ela usou.','A melhor ponte começa na resposta do outro.']",
  "['SIGNIFICADO','Apresentar a Babel em uma frase curta e ligar a proposta às duas dores centrais: tempo e dinheiro.','Depois que o decisor imaginou o futuro, a Babel entra como ponte entre a cena desejada e uma operação mais consciente.','Se a pessoa conecta a ideia ao problema que acabou de citar ou pede como isso funcionaria.','Explique o propósito sem transformar o momento em apresentação longa.']"
);
patch(
  "['ESCOLHA','Converter interesse em um próximo passo pequeno.','Hoje ou amanhã reduz esforço de agenda, sem retirar a liberdade de dizer não.','Procure disponibilidade, não submissão.','Facilite a decisão; nunca force consentimento.']",
  "['PRÓXIMO PASSO','Converter a reflexão em uma reunião curta, específica e fácil de encaixar.','“No máximo 15 minutos” reduz o custo percebido; “hoje ou amanhã” simplifica a decisão de agenda.','Disponibilidade real, objeção logística ou pedido de outro horário.','Dê duas opções sem fingir que a reunião já foi aceita. O decisor continua livre para recusar.']"
);

patch(
  "why:'Começar sem tentar provar valor. Primeiro encontre a pessoa certa e preserve naturalidade.'",
  "why:'Abrir com uma pergunta genuína para localizar o executivo, sem começar com pitch ou tentativa de provar valor.'"
);
patch(
  "why:'Apresentação curta + um único questionamento cria um contrato de atenção pequeno.'",
  "why:'“Simples questionamento” cria curiosidade e uma tensão leve: a pessoa quer descobrir qual é a pergunta antes de decidir se continua.'"
);
patch(
  "why:'A pergunta precisa fazer a pessoa pensar na própria empresa, não pensar na Babel.'",
  "why:'A pergunta projeta um cenário futuro e faz o decisor procurar sozinho qual problema a empresa deveria resolver primeiro.'"
);
patch(
  "why:'Agora Babel ganha significado porque existe contexto anterior.'",
  "why:'A Babel entra somente depois da reflexão e é conectada às duas dores de maior valor percebido: falta de tempo e perda de dinheiro.'"
);
patch(
  "why:'Você não tenta fechar toda a transformação por telefone. Fecha apenas o próximo passo.'",
  "why:'A ligação termina com uma decisão pequena: reservar no máximo 15 minutos. Hoje ou amanhã reduz a fricção de agenda sem retirar a escolha do decisor.'"
);

if(changed){
  fs.writeFileSync(soulTarget,soul);
  console.log('Call Theater repositioned around the canonical primary copy.');
}else{
  console.log('Call Theater already centered on the canonical primary copy.');
}
