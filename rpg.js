'use strict';
const crypto = require('crypto');
const matchGame = require('./rpg_match');
const fs = require('fs');
const path = require('path');
const common = ['Carisma','Físico','Frieza','Ritmo','Passe','Finalização','Bola Parada'];
const attributes = goalkeeper => [...common, ...(goalkeeper ? ['Reflexo','Reação','Saída','Posicionamento'] : ['Defesa','Domínio','Drible','Interceptação'])];
const styles = {
 'Goleiro': {'Líbero':['Saída','Passe','Ritmo','Físico','Finalização'],'Pegador de Pênalti':['Frieza','Reflexo','Carisma','Saída','Físico'],'Muralha':['Reflexo','Físico','Reação','Ritmo','Saída'],'Sentinela':['Posicionamento','Bola Parada','Frieza','Saída','Reação'],'Felino':['Reação','Ritmo','Reflexo','Posicionamento','Frieza']},
 'Zagueiro': {'Construtor':['Defesa','Passe','Interceptação','Ritmo','Drible'],'Xerife':['Defesa','Físico','Carisma','Ritmo','Passe'],'Caçador':['Defesa','Ritmo','Interceptação','Frieza','Finalização']},
 'Lateral': {'Defensivo':['Interceptação','Defesa','Ritmo','Finalização','Drible'],'Ofensivo':['Ritmo','Passe','Drible','Defesa','Interceptação'],'Invertido':['Passe','Interceptação','Ritmo','Finalização','Físico']},
 'Volante': {'Armador':['Passe','Defesa','Frieza','Ritmo','Finalização'],'Batedor':['Físico','Defesa','Interceptação','Drible','Passe'],'Box-to-Box':['Ritmo','Defesa','Finalização','Drible','Passe']},
 'Meio-campo': {'Camisa 10':['Passe','Bola Parada','Drible','Defesa','Físico'],'Tiki-Taka':['Passe','Interceptação','Ritmo','Finalização','Físico'],'Motorzinho':['Ritmo','Defesa','Passe','Finalização','Frieza']},
 'Ponta': {'Driblador':['Drible','Ritmo','Frieza','Finalização','Passe'],'Invertido':['Ritmo','Finalização','Drible','Físico','Passe'],'Agudo':['Ritmo','Passe','Drible','Finalização','Frieza']},
 'Atacante': {'Falso 9':['Passe','Finalização','Ritmo','Defesa','Físico'],'Pivô':['Domínio','Finalização','Físico','Defesa','Ritmo'],'Matador':['Frieza','Finalização','Físico','Defesa','Drible']}
};
const egos=['Protagonista','Rival','Subestimado','Sobrevivente','Destruidor'];
const fail = (message,status=400) => {const e=new Error(message);e.status=status;throw e;};
function clean(value,max,required=false){const s=typeof value==='string'?value.trim():'';if(s.length>max||required&&!s)fail('Preencha os campos respeitando o limite de caracteres.');return s;}
function photo(value){
 if(!value)return '';
 if(typeof value!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(value))fail('Envie uma imagem PNG.');
 const b=Buffer.from(value.split(',')[1],'base64');
 if(b.length>1024*1024||b.length<45||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||b.toString('ascii',12,16)!=='IHDR'||b.readUInt32BE(8)!==13)fail('PNG inválido ou maior que 1 MB.');
 const w=b.readUInt32BE(16),h=b.readUInt32BE(20);if(!w||!h||w>2048||h>2048)fail('A imagem deve ter até 2048 × 2048 pixels.');
 let offset=8,ended=false;while(offset+12<=b.length){const len=b.readUInt32BE(offset);if(offset+12+len>b.length)fail('PNG incompleto.');const type=b.toString('ascii',offset+4,offset+8);offset+=12+len;if(type==='IEND'){ended=len===0&&offset===b.length;break;}}if(!ended)fail('PNG incompleto.');
 return 'data:image/png;base64,'+b.toString('base64');
}
function validateSheet(input,member,master){
 const cardColor=input.cardColor??member.sheet?.cardColor??'#46e4ff';if(typeof cardColor!=='string'||!/^#[0-9a-f]{6}$/i.test(cardColor))fail('Escolha uma cor válida para o cartão.');
 const position=clean(input.position,30,true),style=clean(input.style,40,true);
 if(!Object.hasOwn(styles,position)||!Object.hasOwn(styles[position],style))fail('Escolha uma posição e um estilo válidos.');
 const names=attributes(position==='Goleiro'),base={},growth={};
 for(const a of names){const n=input.base?.[a],g=input.growth?.[a]??0;if(!Number.isInteger(n)||n<1||n>12||!Number.isInteger(g)||g<0||g>30)fail('Atributos inválidos.');base[a]=n;growth[a]=master?g:(member.sheet?.growth?.[a]||0);}
 const age=Number(input.age),height=Number(input.height),level=master?Number(input.level||1):(member.sheet?.level||1);
 if(!Number.isInteger(age)||age<15||age>20||!Number.isFinite(height)||height<100||height>250||!Number.isInteger(level)||level<1||level>100)fail('Confira idade, altura e nível.');
 if(Object.values(growth).reduce((a,b)=>a+b,0)>2*(level-1))fail('Cada nível após o primeiro permite dois pontos de evolução.');
 if(!egos.includes(input.ego))fail('Escolha um Ego.');
 const bonuses={};styles[position][style].forEach((a,i)=>bonuses[a]=(bonuses[a]||0)+[2,2,1,-1,-1][i]);
 const stats=Object.fromEntries(names.map(a=>{const raw=base[a]+growth[a];if(raw>30)fail(`O atributo ${a} não pode ultrapassar 30, somando o valor inicial e a evolução.`);const value=Math.max(1,raw);return[a,{base:base[a],bonus:bonuses[a]||0,growth:growth[a],value,modifier:Math.floor((value-8)/2)+(bonuses[a]||0)}];}));
 return {name:clean(input.name,60,true),age,height,nationality:clean(input.nationality,60,true),position,style,ego:input.ego,base,growth,level,stats,talents:clean(input.talents,1500),weapon:clean(input.weapon,1500),notes:clean(input.notes,3000),cardColor,photo:photo(input.photo),approved:master?!!input.approved:false};
}
// Recalcula também fichas antigas sem alterar seus valores iniciais ou evolução.
function currentSheet(sheet){
 if(!sheet)return null;
 const bonus={};(styles[sheet.position]?.[sheet.style]||[]).forEach((a,i)=>bonus[a]=(bonus[a]||0)+[2,2,1,-1,-1][i]);
 const stats=Object.fromEntries(attributes(sheet.position==='Goleiro').map(a=>{const base=sheet.base[a],growth=sheet.growth?.[a]||0,value=base+growth;return[a,{base,growth,bonus:bonus[a]||0,value,modifier:Math.floor((value-8)/2)+(bonus[a]||0)}];}));
 return {...sheet,stats};
}
function createRpg({app,express,db,auth,normalize,dataDir}){
 const file=path.join(dataDir,'rpg-campaigns.json');let local={};let queue=Promise.resolve();
 async function init(){
  if(db){await db.query('CREATE TABLE IF NOT EXISTS rpg_campaigns (id TEXT PRIMARY KEY, data JSONB NOT NULL)');await db.query(`UPDATE rpg_campaigns SET data=jsonb_set(jsonb_set(jsonb_set(data,'{match,status}','"paused"'::jsonb),'{match,running}','false'::jsonb),'{match,restarted}','true'::jsonb) WHERE data->'match'->>'status'='playing'`);}
  else{try{local=JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}let changed=false;for(const c of Object.values(local)){if(c.match?.status==='playing'){c.match.status='paused';c.match.running=false;c.match.restarted=true;changed=true;}}if(changed)persist(local);}
 }
 async function read(id){return db?(await db.query('SELECT data FROM rpg_campaigns WHERE id=$1',[id])).rows[0]?.data:structuredClone(local[id]);}
 async function mutate(id,fn){
  if(db){const client=await db.connect();try{await client.query('BEGIN');const r=await client.query('SELECT data FROM rpg_campaigns WHERE id=$1 FOR UPDATE',[id]);if(!r.rows[0])fail('Save não encontrado.',404);const c=r.rows[0].data;await fn(c);c.updatedAt=new Date().toISOString();await client.query('UPDATE rpg_campaigns SET data=$2 WHERE id=$1',[id,c]);await client.query('COMMIT');return c;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
  const task=queue.then(async()=>{const c=structuredClone(local[id]);if(!c)fail('Save não encontrado.',404);await fn(c);c.updatedAt=new Date().toISOString();const next={...local,[id]:c};persist(next);local=next;return c;});queue=task.catch(()=>{});return task;
 }
 function persist(next){fs.mkdirSync(dataDir,{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(next));fs.renameSync(file+'.tmp',file);}
 function key(req){return normalize(req.user.nick);}
 function member(c,k){if(!c||!Object.hasOwn(c.members,k))fail('Você não participa deste save.',403);return c.members[k];}
 function view(c,k){member(c,k);return {...c,match:matchGame.publicMatch(c),extras:Object.fromEntries(Object.entries(c.extras||{}).map(([id,m])=>[id,{...m,sheet:currentSheet(m.sheet),rolls:c.owner===k?m.rolls:undefined}])),members:Object.fromEntries(Object.entries(c.members).map(([id,m])=>[id,{...m,sheet:currentSheet(m.sheet),rolls:id===k||c.owner===k?m.rolls:undefined}]))};}
 const router=express.Router();router.use(auth);router.use(express.json({limit:'1500kb'}));
 const route=fn=>async(req,res)=>{try{res.json(await fn(req));}catch(e){if(!e.status)console.error('RPG:',e);res.status(e.status||503).json({ok:false,error:e.status?e.message:'Não foi possível salvar agora. Tente novamente.'});}};
 router.get('/catalog',route(async()=>({styles,egos,common,line:attributes(false),goalkeeper:attributes(true)})));
 router.get('/campaigns',route(async req=>{const all=db?(await db.query('SELECT data FROM rpg_campaigns WHERE data->\'members\' ? $1',[key(req)])).rows.map(r=>r.data):Object.values(local);return {campaigns:all.filter(c=>Object.hasOwn(c.members,key(req))).map(c=>({id:c.id,name:c.name,owner:c.owner,updatedAt:c.updatedAt,count:Object.keys(c.members).length})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))};}));
 router.post('/campaigns',route(async req=>{const k=key(req),c={id:crypto.randomBytes(8).toString('hex').toUpperCase(),name:clean(req.body.name,80,true),owner:k,notes:'',updatedAt:new Date().toISOString(),members:{[k]:{nick:req.user.nick,sheet:null,rolls:null}}};if(db)await db.query('INSERT INTO rpg_campaigns(id,data) VALUES($1,$2)',[c.id,c]);else{const task=queue.then(()=>{const next={...local,[c.id]:c};persist(next);local=next;});queue=task.catch(()=>{});await task;}return view(c,k);}));
 router.post('/join',route(async req=>{const id=clean(req.body.code,16,true).toUpperCase(),k=key(req);const c=await mutate(id,c=>{if(Object.hasOwn(c.members,k))return;if(Object.keys(c.members).length>=30)fail('Este save chegou a 30 participantes.');c.members[k]={nick:req.user.nick,sheet:null,rolls:null};});return view(c,k);}));
 router.get('/campaigns/:id',route(async req=>{const c=await read(req.params.id);if(!c)fail('Save não encontrado.',404);return view(c,key(req));}));
 router.get('/campaigns/:id/match',route(async req=>{if(db){const r=await db.query("SELECT data->'match' AS match, (data->'members' ? $2) AS allowed FROM rpg_campaigns WHERE id=$1",[req.params.id,key(req)]);if(!r.rows[0])fail('Save não encontrado.',404);if(!r.rows[0].allowed)fail('Você não participa deste save.',403);return {match:matchGame.publicMatch({match:r.rows[0].match})};}const c=local[req.params.id];if(!c)fail('Save não encontrado.',404);member(c,key(req));return {match:matchGame.publicMatch(c)};}));
 router.post('/campaigns/:id/match',route(async req=>{const c=await mutate(req.params.id,c=>matchGame.command(c,key(req),req.body||{},currentSheet));return {match:matchGame.publicMatch(c)};}));
 router.post('/campaigns/:id/extras',route(async req=>{const k=key(req);const c=await mutate(req.params.id,c=>{member(c,k);if(c.owner!==k)fail('Somente o mestre pode criar fichas extras.',403);c.extras=c.extras||{};if(Object.keys(c.extras).length>=30)fail('Limite de 30 fichas extras por save.');const id='npc:'+crypto.randomUUID();c.extras[id]={nick:clean(req.body.name,60,true),sheet:null,rolls:null};});return view(c,k);}));
 router.put('/campaigns/:id/sheets/:who',route(async req=>{const k=key(req),target=req.params.who;const c=await mutate(req.params.id,c=>{member(c,k);const extra=target.startsWith('npc:'),master=c.owner===k;if(extra&&!master)fail('Somente o mestre pode editar fichas extras.',403);if(extra&&!Object.hasOwn(c.extras||{},target))fail('Ficha extra não encontrada.',404);const m=extra?c.extras[target]:member(c,target);if(!master&&target!==k)fail('Você só pode editar sua ficha.',403);if(!master&&m.sheet?.approved)fail('Peça ao mestre para liberar a edição da ficha.',403);m.sheet=validateSheet(req.body,m,master);});return view(c,k);}));
 router.patch('/campaigns/:id',route(async req=>{const k=key(req);const c=await mutate(req.params.id,c=>{if(c.owner!==k)fail('Somente o mestre pode editar o save.',403);c.name=clean(req.body.name,80,true);c.notes=clean(req.body.notes,10000);});return view(c,k);}));
 app.use('/api/rpg',router);
 return {init};
}
module.exports={createRpg,validateSheet,photo,styles,attributes};
