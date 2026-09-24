'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
function configuration(env){
 let webhook=null,site=null;
 try{const u=new URL(env.DISCORD_UPDATES_WEBHOOK_URL);if(u.protocol==='https:'&&u.hostname==='discord.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/api(?:\/v10)?\/webhooks\/\d{10,25}\/[A-Za-z0-9_-]{20,200}$/.test(u.pathname)){u.search='?wait=true';webhook=u.href;}}catch{}
 try{const u=new URL(env.PUBLIC_SITE_URL||'https://grupao.alwaysdata.net');if(u.protocol==='https:'&&!u.username&&!u.password)site=u.href;}catch{}
 return {webhook,site,configured:!!webhook&&!!site};
}
function preview(input,site){
 const version=typeof input?.version==='string'?input.version.trim().replace(/^v/i,'').toLowerCase():'';
 if(version.length>40||!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(version))fail('Informe a versão, por exemplo 4.8.15.');
 const text=(key,max)=>{const v=input?.[key]??'';if(typeof v!=='string'||v.length>max)fail('Texto inválido ou acima do limite.');return v.trim();};
 const title=text('title',120),news=text('news',1000),fixes=text('fixes',1000);
 if(!title||(!news&&!fixes))fail('Preencha o título e pelo menos novidades ou correções.');
 if(!site)fail('Configure PUBLIC_SITE_URL com o endereço HTTPS do site.');
 const announcement={version,title,news,fixes,site};
 const payload={username:'Grupão Minigames',allowed_mentions:{parse:[]},embeds:[{title:`⚽ Grupão Minigames — v${version}`,description:title,color:0x39d5ed,url:site,fields:[...(news?[{name:'Novidades',value:news}]:[]),...(fixes?[{name:'Correções',value:fixes}]:[]),{name:'Jogue com o Grupão',value:site}],footer:{text:'Atualização publicada pelo administrador'}}]};
 const hash=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 return {announcement,payload,hash};
}
function createStore({db,dataDir}){
 const file=path.join(dataDir,'discord-updates.json');let ready;
 async function init(){if(db){if(!ready)ready=db.query('CREATE TABLE IF NOT EXISTS discord_updates (version TEXT PRIMARY KEY, data JSONB NOT NULL)').catch(e=>{ready=null;throw e;});await ready;}}
 function read(){try{const d=JSON.parse(fs.readFileSync(file,'utf8'));if(!d||Array.isArray(d)||typeof d!=='object')throw Error();return d;}catch(e){if(e.code==='ENOENT')return {};throw Error('Registro de anúncios indisponível.');}}
 function write(data){fs.mkdirSync(dataDir,{recursive:true});const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data));fs.renameSync(tmp,file);}
 return {
  async list(){await init();return db?(await db.query('SELECT data FROM discord_updates ORDER BY data->>\'updatedAt\' DESC LIMIT 30')).rows.map(r=>r.data):Object.values(read()).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,30);},
  async reserve(record){await init();if(db){const r=await db.query("INSERT INTO discord_updates(version,data) VALUES($1,$2::jsonb) ON CONFLICT(version) DO UPDATE SET data=EXCLUDED.data WHERE discord_updates.data->>'status'='failed' AND COALESCE((discord_updates.data->>'retryAt')::bigint,0)<=$3 RETURNING data",[record.version,JSON.stringify(record),Date.now()]);return !!r.rowCount;}
   const all=read(),old=all[record.version];if(old&&(old.status!=='failed'||old.retryAt>Date.now()))return false;all[record.version]=record;write(all);return true;},
  async finish(record){await init();if(db){const r=await db.query("UPDATE discord_updates SET data=$2::jsonb WHERE version=$1 AND data->>'attempt'=$3",[record.version,JSON.stringify(record),record.attempt]);if(!r.rowCount)throw Error('Registro alterado.');return;}const all=read();if(all[record.version]?.attempt!==record.attempt)throw Error('Registro alterado.');all[record.version]=record;write(all);},
  async resolve(version,attempt,status){await init();const now=new Date().toISOString();if(db){const r=await db.query("UPDATE discord_updates SET data=data || $3::jsonb WHERE version=$1 AND data->>'attempt'=$2 AND data->>'status' IN ('pending','uncertain') AND (data->>'startedAt')::bigint<$4 RETURNING data",[version,attempt,JSON.stringify({status,updatedAt:now,note:'Conferido manualmente pelo administrador.'}),Date.now()-120000]);return !!r.rowCount;}
   const all=read(),r=all[version];if(!r||r.attempt!==attempt||!['pending','uncertain'].includes(r.status)||r.startedAt>=Date.now()-120000)return false;Object.assign(r,{status,updatedAt:now,note:'Conferido manualmente pelo administrador.'});write(all);return true;}
 };
}
function createUpdates({db,dataDir,env=process.env,fetchImpl=fetch,store=createStore({db,dataDir})}){
 const config=configuration(env);
 return {
  async info(){return {configured:config.configured,version:require('./package.json').version,site:config.site,history:await store.list()};},
  preview(input){return preview(input,config.site);},
  async publish(input){
   if(!config.configured)fail('Configure o webhook na hospedagem antes de publicar.');
   const p=preview(input,config.site);if(input.confirm!==true||input.previewHash!==p.hash)fail('Revise a prévia antes de publicar.');
   const record={...p.announcement,attempt:crypto.randomUUID(),status:'pending',startedAt:Date.now(),updatedAt:new Date().toISOString()};
   if(!await store.reserve(record))fail('Esta versão já foi enviada, está em conferência ou aguarda nova tentativa. Consulte o histórico.',409);
   // Reserve durably BEFORE the request. Ambiguous failures never auto-resend.
   try{
    const r=await fetchImpl(config.webhook,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify(p.payload),signal:AbortSignal.timeout(15000)});
    if(r.ok){const message=await r.json();if(!/^\d+$/.test(message?.id||''))throw Error();record.status='sent';record.messageId=message.id;record.note='Mensagem confirmada pelo Discord.';}
    else if([400,401,403,404,429].includes(r.status)){record.status='failed';record.note=r.status===429?'Discord limitou os envios. Aguarde e tente novamente.':'Discord recusou o envio. Confira o webhook e o canal.';if(r.status===429){let seconds=60;try{const body=await r.json();if(Number.isFinite(Number(body.retry_after)))seconds=Math.max(1,Math.min(86400,Number(body.retry_after)));}catch{}record.retryAt=Date.now()+seconds*1000;}}
    else throw Error();
   }catch{record.status='uncertain';record.note='Não foi possível confirmar o envio. Confira o canal antes de liberar outra tentativa.';}
   record.updatedAt=new Date().toISOString();await store.finish(record);return {record};
  },
  async resolve(input){if(input?.confirm!==true||!['sent','failed'].includes(input.status)||typeof input.version!=='string'||typeof input.attempt!=='string')fail('Confirmação inválida.');if(!await store.resolve(input.version,input.attempt,input.status))fail('Aguarde dois minutos após a tentativa e atualize o histórico antes de conferir.',409);return {ok:true};}
 };
}
function mountUpdates({app,auth,admin,...options}){
 const service=createUpdates(options);
 const route=fn=>async(req,res)=>{res.set('Cache-Control','no-store');try{res.json(await fn(req));}catch(e){res.status(e.status||503).json({error:e.status?e.message:'Não foi possível acessar o registro de anúncios. Atualize o histórico antes de tentar novamente.'});}};
 app.get('/api/admin/discord-updates',auth,admin,route(()=>service.info()));
 app.post('/api/admin/discord-updates/preview',auth,admin,route(req=>service.preview(req.body)));
 app.post('/api/admin/discord-updates/publish',auth,admin,route(req=>service.publish(req.body)));
 app.post('/api/admin/discord-updates/resolve',auth,admin,route(req=>service.resolve(req.body)));
 return service;
}
module.exports={configuration,preview,createStore,createUpdates,mountUpdates};
