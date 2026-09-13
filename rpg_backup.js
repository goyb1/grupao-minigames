'use strict';
const crypto=require('crypto'),matchGame=require('./rpg_match');
const FORMAT='grupao-bluelocker-backup',VERSION=1,MAX_BYTES=90*1024*1024;
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function fail(message,status=400){const e=new Error(message);e.status=status;throw e;}
function object(v){if(!v||typeof v!=='object'||Array.isArray(v))fail('Estrutura inválida no backup.');return v;}
function text(v,max=200,empty=false){if(typeof v!=='string'||v.length>max||(!empty&&!v.trim()))fail('Texto inválido no backup.');return v;}
function number(v,min=0,max=Number.MAX_SAFE_INTEGER){if(!Number.isFinite(v)||v<min||v>max)fail('Número inválido no backup.');return v;}
function integer(v,min=0,max=1e12){number(v,min,max);if(!Number.isInteger(v))fail('Número inteiro inválido no backup.');return v;}
function bool(v){if(typeof v!=='boolean')fail('Valor lógico inválido no backup.');return v;}
function list(v,max){if(!Array.isArray(v)||v.length>max)fail('Lista inválida ou acima do limite no backup.');return v;}
function point(v){object(v);return {x:number(v.x,0,105),y:number(v.y,0,68)};}
function color(v){if(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v))fail('Cor inválida no backup.');return v;}
function safeTree(v,depth=0){if(depth>24)fail('Backup com estrutura profunda demais.');if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))fail('Chave inválida no backup.');safeTree(x,depth+1);}}
function createBackupTools({validateSheet,normalize,attributes,styles}){
 function sheet(v){if(v==null)return null;object(v);object(v.base);return validateSheet(v,{},true);}
 function team(v){object(v);if(!Object.hasOwn(matchGame.FORMATIONS,v.formation))fail('Formação inválida no backup.');return {name:text(v.name,40),color:color(v.color),formation:v.formation};}
 function game(v,entries,withUndo=true){
  if(v==null)return null;object(v);const teams=list(v.teams,2).map(team);if(teams.length!==2)fail('A partida precisa de dois times.');
  const source=object(v.players);if(Object.keys(source).length!==14)fail('A partida precisa de 14 personagens.');
  const players=Object.fromEntries(Object.entries(source).map(([id,p])=>{object(p);if(!Object.hasOwn(entries,id)||p.id!==id)fail('Personagem da partida não encontrado no backup.');if(!Object.hasOwn(styles,p.position)||!Object.hasOwn(styles[p.position],p.style))fail('Posição ou estilo inválido na partida.');object(p.mods);const mods=Object.fromEntries(attributes(p.position==='Goleiro').map(a=>[a,number(p.mods[a],-1e6,1e6)]));return [id,{id,name:text(p.name,60),position:p.position,style:p.style,controller:text(p.controller,80),team:integer(p.team,0,1),...point(p),home:point(p.home),mods,goals:integer(p.goals),assists:integer(p.assists),saves:integer(p.saves),yellow:integer(p.yellow),red:bool(p.red),moveRev:integer(p.moveRev||0)}];}));
  const ref=(id,optional=false)=>{if(optional&&id==null)return null;if(typeof id!=='string'||!Object.hasOwn(players,id))fail('Referência de personagem inválida na partida.');return id;};
  for(let t=0;t<2;t++){const ps=Object.values(players).filter(p=>p.team===t);if(ps.length!==7||ps.filter(p=>p.position==='Goleiro').length!==1)fail('Escalação inválida na partida.');}
  if(!['setup','playing','paused','interval','finished'].includes(v.status))fail('Estado da partida inválido.');
  object(v.ball);const score=list(v.score,2).map(x=>integer(x));if(score.length!==2)fail('Placar inválido.');
  let pending=null;if(v.pending){const a=object(v.pending);if(!['walk','run','pass','dribble','shoot','tackle','control','collect'].includes(a.kind)||!['reaction','roll'].includes(a.phase))fail('Lance pendente inválido.');
   pending={...a,id:text(a.id,80),actor:ref(a.actor),reactor:ref(a.reactor,true),declaredAt:number(a.declaredAt),to:a.to?point(a.to):null,tests:list(a.tests,2).map(t=>{object(t);ref(t.player);if(!Object.hasOwn(players[t.player].mods,t.attribute))fail('Atributo inválido no lance.');number(t.modifier,-1e6,1e6);number(t.bonus,-1e6,1e6);integer(t.advantage,-5,5);list(t.reasons,100).forEach(r=>text(r,1000));if(t.roll){object(t.roll);list(t.roll.dice,6).forEach(n=>integer(n,1,20));if(t.roll.dice.length!==1+Math.abs(t.advantage))fail('Quantidade de dados inválida.');integer(t.roll.natural,1,20);number(t.roll.total,-1e9,1e9);bool(t.roll.manual);}return structuredClone(t);})};
   if(a.target!=null)ref(a.target);if(a.response!=null&&!['stay','out','block','intercept','follow','dribble','protect','defend','collect'].includes(a.response))fail('Reação inválida.');
  }
  let reception=null;if(v.reception){const r=object(v.reception);reception={player:ref(r.player),needsControl:bool(r.needsControl),high:bool(r.high),passTotal:number(r.passTotal,-1e9,1e9)};}
  let lastPass=null;if(v.lastPass){object(v.lastPass);lastPass={from:ref(v.lastPass.from),to:ref(v.lastPass.to)};}
  const log=list(v.log||[],200).map(l=>{object(l);text(l.id,80);number(l.at);text(l.message,4000);if(JSON.stringify(l).length>20000)fail('Registro de histórico muito grande.');return structuredClone(l);});
  const m={id:text(v.id,80),rev:integer(v.rev,1),freeMode:!!v.freeMode,status:v.status,half:integer(v.half,1,2),elapsed:number(v.elapsed,0,matchGame.HALF),anchor:number(v.anchor),running:bool(v.running),teams,players,score,ball:{holder:ref(v.ball.holder,true),...point(v.ball),moveRev:integer(v.ball.moveRev||0)},pending,reception,rebound:ref(v.rebound,true),lastPass,log,undo:null,restarted:!!v.restarted};
  if(v.lastTrajectory){object(v.lastTrajectory);m.lastTrajectory={from:point(v.lastTrajectory.from),to:point(v.lastTrajectory.to),id:text(v.lastTrajectory.id,80)};}
  m.pins=list(v.pins||[],50).map(p=>({id:text(p.id,80),...point(p),by:text(p.by,80)}));if(new Set(m.pins.map(p=>p.id)).size!==m.pins.length)fail('Marcações duplicadas.');
  for(const name of ['diceRequests','removedPins'])m[name]=list(v[name]||[],200).map(id=>text(id,80));
  if(withUndo&&v.undo){m.undo=game({...v.undo,log:[],undo:null},entries,false);delete m.undo.log;delete m.undo.undo;delete m.undo.diceRequests;delete m.undo.pins;delete m.undo.removedPins;}
  return m;
 }
 function campaign(v,owner){
  object(v);if(v.owner!==owner)fail('Restaure usando a conta do mestre que criou o backup.',403);
  const members=object(v.members),extras=object(v.extras||{});if(!Object.hasOwn(members,owner)||Object.keys(members).length>30||Object.keys(extras).length>30)fail('Participantes ou NPCs inválidos no backup.');
  const result={id:text(v.id,80),name:text(v.name,80),owner,notes:text(v.notes||'',10000,true),updatedAt:text(v.updatedAt,80),members:{},extras:{}};
  for(const [id,m] of Object.entries(members)){object(m);if(normalize(text(m.nick,80))!==id||id.startsWith('npc:'))fail('Nickname de participante inválido.');result.members[id]={nick:m.nick,sheet:sheet(m.sheet),rolls:m.rolls??null};}
  for(const [id,m] of Object.entries(extras)){object(m);if(!/^npc:[a-zA-Z0-9_-]{1,80}$/.test(id))fail('Identificador de NPC inválido.');result.extras[id]={nick:text(m.nick,60),sheet:sheet(m.sheet),rolls:m.rolls??null};}
  const entries={...result.members,...result.extras};
  const ts=object(v.savedTeams||{});if(Object.keys(ts).length>30)fail('Times salvos acima do limite.');result.savedTeams=Object.fromEntries(Object.entries(ts).map(([id,t])=>{object(t);if(t.id!==id)fail('Identificador de time inválido.');const ids=list(t.ids,7);if(ids.length!==7||new Set(ids).size!==7||ids.some(id=>!Object.hasOwn(entries,id)))fail('Referências inválidas em time salvo.');return [id,{id,...team(t),ids:[...ids],rev:integer(t.rev,1)}];}));
  result.npcBatches=list(v.npcBatches||[],100).map(id=>text(id,80));
  result.match=game(v.match,entries);
  for(const m of [result.match,result.match?.undo])if(m)for(const p of Object.values(m.players))p.controller=p.id.startsWith('npc:')?owner:p.id;
  result.matchHistory=list(v.matchHistory||[],20).map(h=>{object(h);const teams=list(h.teams,2).map(team),score=list(h.score,2).map(n=>integer(n));if(teams.length!==2||score.length!==2)fail('Resumo de partida inválido.');return {teams,score,date:text(h.date,80),players:list(h.players,14).map(p=>({name:text(p.name,60),goals:integer(p.goals),assists:integer(p.assists),saves:integer(p.saves)}))};});
  return result;
 }
 function pack(source,owner){
  const c=campaign(source,owner),now=Date.now();if(c.match){matchGame.clock(c.match,now);c.match.elapsed=Math.min(matchGame.HALF,c.match.elapsed);c.match.running=false;if(c.match.status==='playing')c.match.status='paused';c.match.anchor=now;}
  return {format:FORMAT,version:VERSION,exportedAt:new Date(now).toISOString(),campaign:c,checksum:hash(c)};
 }
 function parse(file,owner){
  object(file);if(file.format!==FORMAT||file.version!==VERSION)fail('Arquivo incompatível. Escolha um backup completo do Grupão.');if(Buffer.byteLength(JSON.stringify(file))>MAX_BYTES)fail('Backup acima de 90 MB.');safeTree(file);
  if(typeof file.checksum!=='string'||hash(file.campaign)!==file.checksum)fail('O backup está incompleto ou foi alterado. Exporte uma nova cópia.');
  text(file.exportedAt,80);if(!Number.isFinite(Date.parse(file.exportedAt)))fail('Data do backup inválida.');return {campaign:campaign(file.campaign,owner),exportedAt:file.exportedAt,checksum:file.checksum};
 }
 function summary(parsed){const c=parsed.campaign,all=[...Object.values(c.members),...Object.values(c.extras)];return {name:c.name,exportedAt:parsed.exportedAt,checksum:parsed.checksum,participants:Object.keys(c.members).length,npcs:Object.keys(c.extras).length,sheets:all.filter(m=>m.sheet).length,photos:all.filter(m=>m.sheet?.photo).length,teams:Object.keys(c.savedTeams).length,history:c.matchHistory.length,hasMatch:!!c.match,score:c.match?.score||null,pins:c.match?.pins.length||0};}
 function restore(parsed,owner,name,requestId){
  if(typeof requestId!=='string'||! /^[a-zA-Z0-9-]{16,80}$/.test(requestId))fail('Identificador de restauração inválido.');
  const requestHash=hash({owner,requestId}),c=structuredClone(parsed.campaign);c.id=crypto.createHash('sha256').update('grupao-restore:'+requestHash).digest('hex').slice(0,16).toUpperCase();c.name=text(name,80).trim();c.updatedAt=new Date().toISOString();c.restoreInfo={requestHash,checksum:parsed.checksum,originalId:parsed.campaign.id};
  if(c.match){c.match.id=crypto.randomUUID();c.match.rev++;c.match.running=false;c.match.anchor=Date.now();c.match.restarted=true;if(c.match.status==='playing')c.match.status='paused';if(c.match.undo)c.match.undo.id=c.match.id;}
  return c;
 }
 return {pack,parse,summary,restore};
}
module.exports={createBackupTools,FORMAT,VERSION,MAX_BYTES,hash};
