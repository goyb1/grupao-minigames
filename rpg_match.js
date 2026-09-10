'use strict';
const crypto=require('crypto');
const HALF=15*60*1000;
const FORMATIONS={
 '2-3-1':[[5,34],[22,20],[22,48],[36,12],[36,34],[36,56],[49,34]],
 '3-2-1':[[5,34],[22,12],[22,34],[22,56],[38,22],[38,46],[49,34]],
 '2-2-2':[[5,34],[22,20],[22,48],[36,20],[36,48],[49,22],[49,46]]
};
function fail(msg,status=400){const e=new Error(msg);e.status=status;throw e;}
function number(v,min,max){if(!Number.isFinite(v)||v<min||v>max)fail(`Use um número entre ${min} e ${max}.`);return v;}
function text(v,max=180){if(typeof v!=='string'||!v.trim()||v.length>max)fail('Escreva uma descrição válida.');return v.trim();}
function point(v){return {x:number(v?.x,0,105),y:number(v?.y,0,68)};}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const third=p=>Math.min(2,Math.floor(p.x/35));
function lineDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return dist(p,{x:a.x+t*dx,y:a.y+t*dy});}
function log(m,message,extra={}){m.log.push({id:crypto.randomUUID(),at:Date.now(),message,...extra});m.log=m.log.slice(-200);}
function get(m,id){if(!Object.hasOwn(m.players,id))fail('Jogador não escalado.');return m.players[id];}
function control(c,m,k,id){const p=get(m,id);if(k!==c.owner&&p.controller!==k)fail('Você não controla este personagem.',403);if(p.red)fail('Este jogador foi expulso.');return p;}
function master(c,k){if(c.owner!==k)fail('Apenas o mestre pode fazer isso.',403);}
function snapshot(m){const {undo,log,...state}=m;return structuredClone(state);}
function checkpoint(m){m.undo=snapshot(m);}
function elapsed(m,now=Date.now()){return Math.min(HALF,m.elapsed+(m.running?Math.max(0,now-m.anchor):0));}
function clock(m,now=Date.now()){m.elapsed=elapsed(m,now);m.anchor=now;if(m.elapsed>=HALF&&m.status==='playing'&&!m.pending){m.running=false;m.status=m.half===1?'interval':'finished';log(m,m.half===1?'Fim do primeiro tempo. Intervalo.':'Fim da partida.');}}
function pause(m){clock(m);m.running=false;}
function kickoff(m,team){for(const p of Object.values(m.players)){p.x=p.home.x;p.y=p.home.y;}const p=Object.values(m.players).find(p=>p.team===team&&!p.red&&p.position!=='Goleiro');m.ball={holder:p?.id||null,x:52.5,y:34};if(p){p.x=team===0?51:54;p.y=34;m.ball.x=p.x;m.ball.y=p.y;}m.reception=null;m.rebound=null;}
function hold(m,id){const p=get(m,id);m.ball={holder:id,x:p.x,y:p.y};m.reception=null;m.rebound=null;}
function ground(m,p){m.ball={holder:null,...point(p)};m.reception=null;m.rebound=null;}
function step(p,to,d){const length=dist(p,to),f=length?Math.min(1,Math.max(0,d)/length):0;p.x+=f*(to.x-p.x);p.y+=f*(to.y-p.y);}
function goalPoint(m,p){const right=(p.team===0)===(m.half===1);return {x:right?105:0,y:34};}
function inside(m,p){const g=goalPoint(m,p);return Math.abs(g.x-p.x)<=16.5&&p.y>=14&&p.y<=54;}
function createMatch(c,input,currentSheet){
 if(c.match&&c.match.status!=='finished')fail('Já existe uma partida neste save. Continue a atual.');
 if(!Array.isArray(input.teams)||input.teams.length!==2)fail('Escolha dois times.');
 const entries={...c.members,...c.extras},seen=new Set(),players={};
 const teams=input.teams.map((t,team)=>{if(!Array.isArray(t.ids)||t.ids.length!==7||!Object.hasOwn(FORMATIONS,t.formation))fail('Cada time precisa de sete fichas e uma formação.');
 const sheets=t.ids.map(id=>{if(typeof id!=='string'||seen.has(id)||!Object.hasOwn(entries,id)||!entries[id].sheet?.approved)fail('Escale 14 fichas aprovadas diferentes.');seen.add(id);return {id,s:currentSheet(entries[id].sheet)};});
 if(sheets.filter(x=>x.s.position==='Goleiro').length!==1)fail('Cada time precisa de exatamente um goleiro.');sheets.sort((a,b)=>Number(b.s.position==='Goleiro')-Number(a.s.position==='Goleiro'));
 sheets.forEach(({id,s},i)=>{const [fx,fy]=FORMATIONS[t.formation][i],x=team===0?fx:105-fx,y=fy;players[id]={id,name:s.name,position:s.position,style:s.style,controller:id.startsWith('npc:')?c.owner:id,team,x,y,home:{x,y},mods:Object.fromEntries(Object.entries(s.stats).map(([a,v])=>[a,v.modifier])),goals:0,assists:0,saves:0,yellow:0,red:false};});
 if(!/^#[0-9a-f]{6}$/i.test(t.color))fail('Escolha uma cor válida.');return {name:text(t.name,40),color:t.color,formation:t.formation};});
 if(c.match){c.matchHistory=c.matchHistory||[];c.matchHistory.push({teams:c.match.teams,score:c.match.score,date:new Date().toISOString(),players:Object.values(c.match.players).map(p=>({name:p.name,goals:p.goals,assists:p.assists,saves:p.saves}))});c.matchHistory=c.matchHistory.slice(-20);}
 const m={id:crypto.randomUUID(),rev:1,status:'setup',half:1,elapsed:0,anchor:Date.now(),running:false,teams,players,score:[0,0],ball:null,pending:null,reception:null,rebound:null,lastPass:null,log:[],undo:null};kickoff(m,0);log(m,'Escalação pronta. O mestre pode posicionar as peças e iniciar.');c.match=m;
}
function makeTest(p,attr,adv=0,bonus=0,reasons=[]){if(!Object.hasOwn(p.mods,attr))fail(`${p.name} não possui ${attr}.`);return {player:p.id,attribute:attr,modifier:p.mods[attr],bonus,advantage:adv,reasons,roll:null};}
function inRange(m,p,r=3){return Object.values(m.players).filter(q=>!q.red&&q.team!==p.team&&dist(p,q)<=r);}
function beginTests(m,a){
 const p=get(m,a.actor),r=a.reactor?get(m,a.reactor):null;let tests=[];
 const gap=a.to?Math.abs(third(p)-third(a.to)):0;
 if(a.kind==='walk'){if(r&&a.response!=='follow')tests=[makeTest(p,'Ritmo'),makeTest(r,'Físico')];}
 if(a.kind==='run')tests=[makeTest(p,'Ritmo',0,p.mods.Ritmo,['Corrida: modificador de Ritmo em dobro']),...(r?[makeTest(r,a.response==='block'?'Físico':'Ritmo',0,a.response==='block'?0:r.mods.Ritmo)]:[])];
 if(a.kind==='pass'){
 const adv=-(gap+(a.first?1:0));if(gap||a.first||r)tests.push(makeTest(p,'Passe',adv,0,[...(gap?[`Distância: ${gap} desvantagem(ns)`]:[]),...(a.first?['Passe de primeira: desvantagem']:[])]));
 if(r)tests.push(makeTest(r,a.response==='out'?'Saída':'Interceptação'));
 }
 if(a.kind==='dribble')tests=[makeTest(p,'Drible',inRange(m,p).length>=2?-1:0),makeTest(r,'Defesa')];
 if(a.kind==='tackle')tests=[makeTest(p,'Defesa',a.slide?-1:0,0,a.slide?['Carrinho: desvantagem']:[]),makeTest(r,a.response==='protect'?'Domínio':'Drible')];
 if(a.kind==='control')tests=[makeTest(p,'Domínio'),...(r?[makeTest(r,'Defesa')]:[])];
 if(a.kind==='collect')tests=[makeTest(p,'Ritmo',0,p.mods.Ritmo),...(r?[makeTest(r,'Ritmo',0,r.mods.Ritmo)]:[])];
 if(a.kind==='shoot'){
 const close=inside(m,p),goal=goalPoint(m,p),rangeGap=Math.abs(third(p)-third(goal)),first=a.mode==='first',acro=a.mode==='acrobatic',header=a.mode==='header',rebound=m.rebound===p.id;
 let adv=-(close?0:1)-rangeGap-(first||acro?1:0);if(rebound)adv=1;
 let bonus=close&&inRange(m,p,10).every(q=>q.position==='Goleiro')?3:0;
 const why=[...(close?[]:['Chute de longe: desvantagem']),...(rangeGap?[`Distância entre terços: ${rangeGap}`]:[]),...(first||acro?['Finalização de primeira/acrobática: desvantagem']:[]),...(rebound?['Rebote: vantagem, sem penalidade de primeira']:[]),...(bonus?['Cara a cara: +3']:[])];
 if(r&&r.style==='Muralha')bonus=0;
 tests=[makeTest(p,header?'Físico':'Finalização',adv,bonus,why)];
 if(r){const attr=a.response==='block'?'Interceptação':a.response==='out'?'Saída':(rebound||first||acro)?'Reação':header||close?'Reflexo':'Posicionamento';tests.push(makeTest(r,attr));}
 }
 a.tests=tests;a.phase='roll';pause(m);
 if(!tests.length)resolve(m);
}
function settle(m,message){log(m,message);m.pending=null;if(m.elapsed>=HALF){m.running=false;m.status=m.half===1?'interval':'finished';log(m,m.status==='interval'?'Intervalo.':'Fim da partida.');}else{m.running=m.status==='playing';m.anchor=Date.now();}}
// Um 1 natural falha. 20 natural vence salvo diferença de pelo menos seis a favor do outro.
function wins(a,b,tie=true){if(a.natural===1)return false;if(b?.natural===1)return true;if(!b)return a.total>=10;if(a.natural===20&&b.natural!==20&&b.total-a.total<6)return true;if(b.natural===20&&a.natural!==20&&a.total-b.total<6)return false;return tie?a.total>=b.total:a.total>b.total;}
function resolve(m){
 const a=m.pending,p=get(m,a.actor),r=a.reactor?get(m,a.reactor):null,A=a.tests[0]?.roll,B=a.tests[1]?.roll;
 if(a.tests.some(t=>!t.roll))return;
 let ok=!A||wins(A,B,a.kind!=='tackle');
 if(a.kind==='walk'||a.kind==='run'){
 const distance=a.kind==='walk'?Math.min(5,dist(p,a.to)):A.natural===1?0:Math.max(0,A.total);
 const from={x:p.x,y:p.y};step(p,a.to,distance);if(r){if(a.response==='block'&&!wins(A,B,false)){p.x=from.x;p.y=from.y;}else if(a.response==='follow')step(r,p,a.kind==='walk'?5:Math.max(0,B.natural===1?0:B.total));}
 if(m.ball.holder===p.id){m.ball.x=p.x;m.ball.y=p.y;}settle(m,`${p.name} avançou ${dist(from,p).toFixed(1)} m.`);return;
 }
 if(a.kind==='pass'){
 const from={x:p.x,y:p.y};if(ok){const target=get(m,a.target);if(a.space){ground(m,a.to);m.lastPass={from:p.id,to:target.id};settle(m,`${p.name} lançou para o espaço. Disputem a bola com Buscar bola.`);}else{hold(m,target.id);m.lastPass={from:p.id,to:target.id};m.reception={player:target.id,needsControl:third(from)!==third(target)||inRange(m,target).length>0,high:a.high,passTotal:A?.total||10};settle(m,`${p.name} passou para ${target.name}. ${m.reception.needsControl?'Escolha domínio ou uma ação de primeira.':''}`);}}else{if(r&&B.natural!==1)hold(m,r.id);else ground(m,a.to);m.lastPass=null;settle(m,r?`${r.name} cortou o passe de ${p.name}.`:`O passe de ${p.name} ficou solto.`);}return;
 }
 if(a.kind==='dribble'){if(ok){step(p,a.to,5);hold(m,p.id);settle(m,`${p.name} superou ${r.name}.`);}else{hold(m,r.id);m.lastPass=null;settle(m,`${r.name} desarmou ${p.name}.`);}return;}
 if(a.kind==='tackle'){if(ok){hold(m,p.id);m.lastPass=null;settle(m,`${p.name} tomou a bola de ${r.name}.`);}else{hold(m,r.id);const margin=B.total-A.total;if(margin>=10){m.status='paused';if(margin>=15){p.yellow++;p.red=p.yellow>=2;}settle(m,`Falta de ${p.name}${margin>=15?' e cartão amarelo':''}. Mestre: decida vantagem e reposição.`);}else settle(m,`${r.name} manteve a posse.`);}return;}
 if(a.kind==='control'){if(ok){hold(m,p.id);settle(m,`${p.name} dominou a bola.`);}else{if(r&&B.natural!==1)hold(m,r.id);else ground(m,p);m.lastPass=null;settle(m,`${p.name} perdeu o domínio.`);}return;}
 if(a.kind==='collect'){const winner=r?(wins(A,B)?p:r):p;const roll=winner===p?A:B;if(roll.natural!==1&&Math.max(0,roll.total)>=dist(winner,m.ball)){step(winner,m.ball,Math.max(0,roll.total));hold(m,winner.id);settle(m,`${winner.name} alcançou a bola.`);}else{step(winner,m.ball,roll.natural===1?0:Math.max(0,roll.total));settle(m,`${winner.name} correu em direção à bola, que continua livre.`);}return;}
 if(a.kind==='shoot'){
 if(r&&a.response==='block'&&ok){const keeper=Object.values(m.players).find(q=>q.team!==p.team&&q.position==='Goleiro'&&!q.red);if(keeper){a.reactor=keeper.id;a.response='stay';const attr=(m.rebound===p.id||['first','acrobatic'].includes(a.mode))?'Reação':a.mode==='header'||inside(m,p)?'Reflexo':'Posicionamento';a.tests=[a.tests[0],makeTest(keeper,attr)];log(m,`${p.name} superou o bloqueio. Agora o goleiro faz a defesa.`);return;}}
 if(ok){m.score[p.team]++;p.goals++;if(m.lastPass?.to===p.id&&m.lastPass.from!==p.id)get(m,m.lastPass.from).assists++;const from={x:p.x,y:p.y},to=goalPoint(m,p);m.lastTrajectory={from,to,id:a.id};m.lastPass=null;kickoff(m,1-p.team);m.status='paused';settle(m,`GOL de ${p.name}! ${m.teams[0].name} ${m.score[0]} × ${m.score[1]} ${m.teams[1].name}. Saída para o adversário; mestre pode retomar.`);}else if(r&&B?.natural!==1){if(r.position==='Goleiro'){r.saves++;if(B.total-A.total>0&&B.total-A.total<=3){hold(m,p.id);m.rebound=p.id;settle(m,`${r.name} defendeu e deu rebote! ${p.name} pode finalizar.`);}else{hold(m,r.id);m.lastPass=null;settle(m,`${r.name} segurou a bola.`);}}else{hold(m,r.id);m.lastPass=null;settle(m,`${r.name} bloqueou a finalização.`);}}else{ground(m,goalPoint(m,p));m.status='paused';settle(m,`${p.name} errou a finalização. Mestre: posicione a reposição.`);}return;
 }
}
function declare(c,m,k,input){
 if(m.status!=='playing'||m.pending)fail('Aguarde o lance atual ou peça ao mestre para retomar.');
 const p=control(c,m,k,input.actor),kind=input.kind;
 if(!['walk','run','pass','dribble','shoot','tackle','control','collect'].includes(kind))fail('Ação inválida.');
 const a={id:crypto.randomUUID(),actor:p.id,kind,phase:'reaction',reactor:null,response:null,tests:[],declaredAt:Date.now(),to:input.to?point(input.to):null};
 if(['pass','dribble','shoot','control'].includes(kind)&&m.ball.holder!==p.id)fail('Este jogador não está com a bola.');
 if(m.reception?.player===p.id&&m.reception.needsControl&&['walk','run','dribble'].includes(kind))fail('Domine a bola antes de conduzir.');
 if(['walk','run','dribble'].includes(kind)&&!a.to)fail('Escolha o destino no campo.');
 if(kind==='pass'){const target=get(m,input.target);if(target.team!==p.team||target.id===p.id||target.red)fail('Escolha um companheiro disponível.');a.target=target.id;a.space=!!input.space;a.to=a.space?point(input.to):{x:target.x,y:target.y};a.high=!!input.high;a.first=m.reception?.player===p.id;}
 if(kind==='dribble'){const target=get(m,input.target);if(target.team===p.team||target.red||dist(p,target)>3||target.position==='Goleiro')fail('Escolha um marcador de linha a até 3 metros.');a.reactor=target.id;a.response='defend';}
 if(kind==='tackle'){const target=get(m,m.ball.holder);if(target.team===p.team||dist(p,target)>3||target.red||p.position==='Goleiro')fail('Desarme exige adversário com a bola a até 3 metros e Defesa na ficha.');a.reactor=target.id;a.response='dribble';a.slide=!!input.slide;}
 if(kind==='collect'&&m.ball.holder)fail('A bola não está livre.');
 if(kind==='control'&&!Object.hasOwn(p.mods,'Domínio'))fail('Goleiros não têm Domínio: faça um passe ou reposição.');
 if(kind==='shoot'){a.mode=['normal','first','header','acrobatic'].includes(input.mode)?input.mode:'normal';if(m.reception?.player===p.id&&m.reception.needsControl&&a.mode==='normal')fail('Escolha chute de primeira ou domine antes.');if(['first','header','acrobatic'].includes(a.mode)&&m.reception?.player!==p.id&&!m.rebound)fail('Esta finalização exige um passe recebido.');if(['header','acrobatic'].includes(a.mode)&&!m.reception?.high)fail('É necessário um passe alto.');if(a.mode==='acrobatic'&&m.reception.passTotal<15)fail('O passe alto precisa de resultado 15 ou mais.');a.to=goalPoint(m,p);a.reactor=Object.values(m.players).find(q=>q.team!==p.team&&q.position==='Goleiro'&&!q.red)?.id||null;a.response='stay';}
 checkpoint(m);m.pending=a;log(m,`${p.name} declarou ${({walk:'andar',run:'correr',pass:'passe',dribble:'drible',shoot:'finalização',tackle:'desarme',control:'domínio',collect:'buscar bola'})[kind]}. Aguardando reação.`);
 if(a.to)m.lastTrajectory={from:{x:p.x,y:p.y},to:a.to,id:a.id};
}
function react(c,m,k,input){const a=m.pending;if(m.status!=='playing'||!a||a.id!==input.actionId||a.phase!=='reaction')fail('Este lance já mudou.',409);const p=get(m,a.actor),r=control(c,m,k,input.actor);if(r.team===p.team)fail('A reação deve ser do adversário.');
 const response=input.response;
 if(a.kind==='tackle'){if(r.id!==a.reactor)fail('Apenas o portador da bola reage ao desarme.');if(response==='protect'&&r.style!=='Pivô'&&m.reception?.player!==r.id)fail('Domínio fora da recepção é exclusivo do Pivô.');if(!['protect','dribble'].includes(response))fail('Escolha proteger ou driblar.');}
 else if(a.kind==='shoot'){if(response==='block'){if(r.position==='Goleiro'||lineDistance(r,p,a.to)>3)fail('O bloqueador precisa estar na linha do chute.');}else if(!['stay','out'].includes(response)||r.position!=='Goleiro')fail('Escolha a reação do goleiro ou bloquear com um defensor.');if(response==='out'&&dist(p,r)>20)fail('O goleiro está longe demais para disputar diretamente com o atacante.');}
 else if(a.kind==='pass'){if(lineDistance(r,p,a.to)>5)fail('O jogador está distante da trajetória do passe.');if(response==='out'&&r.position!=='Goleiro'||response!=='out'&&response!=='intercept')fail('Reação inválida.');}
 else if(a.kind==='dribble'){if(r.id!==a.reactor)fail('Apenas o marcador escolhido disputa o drible.');}
 else if(a.kind==='control'){if(dist(r,p)>3)fail('O defensor precisa estar a até 3 metros.');}
 else if(['run','walk'].includes(a.kind)){if(response==='block'){if(m.ball.holder===p.id||lineDistance(r,p,a.to)>3)fail('Bloqueio é contra corrida sem bola, na trajetória.');}else if(response!=='follow'||dist(r,p)>8)fail('Acompanhar corrida exige distância inicial de até 8 metros.');}
 else if(a.kind==='collect'){if(dist(r,m.ball)>40)fail('Jogador longe demais para disputar.');}else fail('Reação inválida.');
 a.reactor=r.id;a.response=response;log(m,`${r.name} reagiu ao lance.`);beginTests(m,a);
}
function command(c,k,input,currentSheet){
 if(!Object.hasOwn(c.members,k))fail('Você não participa deste save.',403);
 if(input.op==='create'){master(c,k);createMatch(c,input,currentSheet);return;}
 const m=c.match;if(!m||m.id!==input.matchId)fail('A partida mudou. Atualize a tela.',409);
 clock(m);
 if(!['roll','react','advance'].includes(input.op)&&input.rev!==m.rev)fail('Outra ação alterou o campo. Confira a atualização e tente novamente.',409);
 if(input.op==='declare')declare(c,m,k,input);
 else if(input.op==='react')react(c,m,k,input);
 else if(input.op==='advance'){
 const a=m.pending;if(m.status!=='playing'||!a||a.id!==input.actionId||a.phase!=='reaction')fail('O lance já mudou.',409);
 control(c,m,k,a.actor);if(k!==c.owner&&Date.now()-a.declaredAt<5000)fail('Aguarde os cinco segundos de reação.');beginTests(m,a);
 }
 else if(input.op==='roll'){
 const a=m.pending;if(m.status!=='playing'||!a||a.id!==input.actionId||a.phase!=='roll')fail('A rolagem não está disponível.',409);
 const t=a.tests.find(t=>t.player===input.actor&&!t.roll);if(!t)fail('Esta rolagem já foi feita.',409);control(c,m,k,t.player);
 const count=1+Math.abs(t.advantage);let dice;if(input.dice!==undefined){master(c,k);if(!Array.isArray(input.dice)||input.dice.length!==count||input.dice.some(x=>!Number.isInteger(x)||x<1||x>20))fail(`Informe ${count} dado(s), de 1 a 20.`);dice=input.dice;}else dice=Array.from({length:count},()=>crypto.randomInt(1,21));
 const natural=t.advantage<0?Math.min(...dice):Math.max(...dice);t.roll={dice,natural,total:natural+t.modifier+t.bonus,manual:input.dice!==undefined};log(m,`${get(m,t.player).name}: ${t.attribute} — dados ${dice.join(', ')}; escolhido ${natural} + modificador ${t.modifier} + ajuste ${t.bonus} = ${t.roll.total}${t.roll.manual?' (manual, registrado pelo mestre)':''}.`,{roll:t.roll});resolve(m);
 }
 else {master(c,k);
 if(input.op==='pause'){if(m.status!=='playing')fail('A partida não está em andamento.');pause(m);m.status='paused';log(m,'Mestre pausou a partida.');}
 else if(input.op==='resume'){if(!['setup','paused'].includes(m.status))fail('A partida não pode ser retomada agora.');m.status='playing';m.restarted=false;m.anchor=Date.now();m.running=m.pending?.phase!=='roll';log(m,'Mestre iniciou ou retomou a partida.');}
 else if(input.op==='half'){if(m.status!=='interval')fail('O primeiro tempo ainda não acabou.');m.half=2;m.elapsed=0;m.running=false;m.status='paused';for(const p of Object.values(m.players)){p.home.x=105-p.home.x;}kickoff(m,1);log(m,'Segundo tempo preparado. Os times trocaram de lado.');}
 else if(input.op==='finish'){pause(m);m.status='finished';m.pending=null;log(m,'Mestre encerrou a partida.');}
 else if(input.op==='undo'){if(!m.undo)fail('Não há lance para desfazer.');const before=m.undo,logs=m.log,rev=m.rev;Object.assign(m,before);m.log=logs;m.rev=rev;m.undo=null;m.status='paused';m.running=false;m.pending=null;log(m,'Mestre desfez o último lance. Partida pausada.');}
 else if(input.op==='adjust'){
 const a=m.pending;if(!a||a.phase!=='roll'||a.tests.some(t=>t.roll))fail('Ajustes precisam ser feitos antes das rolagens.');const t=a.tests.find(t=>t.player===input.actor);if(!t)fail('Teste não encontrado.');const bonus=number(input.bonus,-30,30),adv=number(input.advantage,-5,5);if(!Number.isInteger(bonus)||!Number.isInteger(adv))fail('Use números inteiros.');const reason=text(input.reason);t.bonus+=bonus;t.advantage=Math.max(-5,Math.min(5,t.advantage+adv));t.reasons.push(reason);log(m,`Ajuste do mestre para ${get(m,t.player).name}: ${bonus>=0?'+':''}${bonus}, saldo de vantagem ${adv}. ${reason}`);
 }
 else if(input.op==='note'){log(m,`Mestre: ${text(input.reason,500)}`);}
 else if(input.op==='position'){if(!['setup','paused'].includes(m.status)||m.pending)fail('Posicione antes do início ou com a partida pausada e sem lance pendente.');const p=get(m,input.actor);const to=point(input.to);if(m.status!=='setup')text(input.reason);checkpoint(m);Object.assign(p,to);if(m.status==='setup')p.home=to;if(m.ball.holder===p.id)Object.assign(m.ball,to);log(m,`${p.name} reposicionado pelo mestre${input.reason?': '+text(input.reason):''}.`);}
 else if(input.op==='correction'){
 if(m.status!=='paused'||m.pending)fail('Pause a partida e conclua ou desfaça o lance antes de corrigir.');const reason=text(input.reason);checkpoint(m);
 if(input.field==='possession'){const p=get(m,input.actor);if(p.red)fail('Jogador expulso.');hold(m,p.id);m.lastPass=null;}
 else if(input.field==='score'){m.score=input.score?.map(x=>{number(x,0,99);if(!Number.isInteger(x))fail('Placar inválido.');return x;});if(!m.score||m.score.length!==2)fail('Informe os dois placares.');}
 else if(input.field==='time'){m.elapsed=number(input.seconds,0,900)*1000;m.anchor=Date.now();}
 else if(input.field==='yellow'||input.field==='red'){const p=get(m,input.actor);if(input.field==='yellow'){p.yellow++;p.red=p.yellow>=2;}else p.red=true;if(p.red&&m.ball.holder===p.id)ground(m,p);}
 else if(input.field==='foul'){hold(m,get(m,input.actor).id);m.lastPass=null;}
 else fail('Correção inválida.');log(m,`Mestre ajustou ${input.field}: ${reason}`);
 }else fail('Comando inválido.');
 }
 m.rev++;clock(m);
}
function publicMatch(c){if(!c.match)return null;const m=structuredClone(c.match);delete m.undo;m.canUndo=!!c.match.undo;clock(m);m.serverNow=Date.now();m.elapsed=elapsed(m);m.anchor=m.serverNow;return m;}
module.exports={command,publicMatch,FORMATIONS,wins,clock,HALF};
