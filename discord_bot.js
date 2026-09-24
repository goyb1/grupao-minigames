'use strict';
const crypto=require('crypto');
const CATEGORIES={football:'Futebol',clash:'Clash Royale',games:'Quiz gamer'};
const COMMANDS=[
 {name:'site',description:'Abra o site do Grupão Minigames.',type:1},
 {name:'novidades',description:'Veja a última atualização publicada do Grupão.',type:1},
 {name:'ranking',description:'Veja os dez melhores recordes de um minigame.',type:1,options:[{name:'jogo',description:'Escolha o minigame (padrão: futebol).',type:3,required:false,choices:Object.entries(CATEGORIES).map(([value,name])=>({name,value}))}]}
];
const message=(content,privateReply=false)=>({content,allowed_mentions:{parse:[]},...(privateReply?{flags:64}:{})});
function config(env){
 const applicationId=String(env.DISCORD_APPLICATION_ID||'').trim(),guildId=String(env.DISCORD_GUILD_ID||'').trim(),key=String(env.DISCORD_PUBLIC_KEY||'').trim();
 const id=v=>/^\d{10,25}$/.test(v);let publicKey=null;
 if(/^[a-f0-9]{64}$/i.test(key))try{publicKey=crypto.createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(key,'hex')]),format:'der',type:'spki'});}catch{}
 const site=require('./discord_updates').configuration(env).site;
 const token=String(env.DISCORD_BOT_TOKEN||'').trim();
 return {applicationId,guildId,publicKey,site,token,configured:!!publicKey&&id(applicationId)&&id(guildId)&&!!site};
}
function validSignature(req,key,now=Date.now()){
 const signature=req.get('X-Signature-Ed25519')||'',timestamp=req.get('X-Signature-Timestamp')||'';
 if(!key||!Buffer.isBuffer(req.body)||!/^[a-f0-9]{128}$/i.test(signature)||!/^\d{10,12}$/.test(timestamp)||Math.abs(now-Number(timestamp)*1000)>300000)return false;
 try{return crypto.verify(null,Buffer.concat([Buffer.from(timestamp),req.body]),key,Buffer.from(signature,'hex'));}catch{return false;}
}
function boundedPut(map,key,value,max=1000){if(map.size>=max&&!map.has(key))map.delete(map.keys().next().value);map.set(key,value);}
function safeNick(value){return String(value||'Jogador').replace(/[\r\n\x00-\x1f]/g,' ').slice(0,40).replace(/([\\`*_~|<>])/g,'\\$1');}
function createReaders({db,getUsers,updates}){
 return {
  latest:()=>updates.latestSent(),
  async ranking(category){
   if(!Object.hasOwn(CATEGORIES,category))throw Error('Categoria inválida.');
   if(db){const col={football:'record',clash:'clash_record',games:'games_quiz_record'}[category];return (await db.query({text:`SELECT nick,${col} AS record,wins FROM users WHERE disabled=FALSE ORDER BY ${col} DESC,wins DESC,nick ASC LIMIT 10`,query_timeout:4000})).rows;}
   const prop={football:'record',clash:'clashRecord',games:'gamesQuizRecord'}[category];return Object.values(getUsers()).filter(u=>!u.disabled).map(u=>({nick:u.nick,record:u[prop]||0,wins:u.wins||0})).sort((a,b)=>b.record-a.record||b.wins-a.wins||a.nick.localeCompare(b.nick)).slice(0,10);
  }
 };
}
function createBot({env=process.env,readers,fetchImpl=fetch,now=Date.now,workTimeoutMs=5000}){
 const c=config(env),seen=new Map(),users=new Map(),cache=new Map();let registering=false,nextRegistration=0,groupWindow=0,groupCount=0;
 const health={lastInteractionAt:null,lastResponseAt:null,lastDeliveryError:null,lastRegisteredAt:null};
 function info(){return {configured:c.configured,canRegister:c.configured&&!!c.token,checks:{applicationId:/^\d{10,25}$/.test(c.applicationId),guildId:/^\d{10,25}$/.test(c.guildId),publicKey:!!c.publicKey,botToken:!!c.token,site:!!c.site},endpoint:c.site?new URL('/api/discord/interactions',c.site).href:null,installUrl:c.configured?'https://discord.com/oauth2/authorize?'+new URLSearchParams({client_id:c.applicationId,scope:'bot applications.commands',permissions:'19456',guild_id:c.guildId,disable_guild_select:'true'}):null,commands:COMMANDS.map(x=>'/'+x.name),...health};}
 async function cached(key,fn){const existing=cache.get(key);if(existing&&existing.expires>now())return existing.promise;let timer;const item={expires:now()+15000};item.promise=Promise.race([Promise.resolve().then(fn),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),workTimeoutMs);})]).catch(e=>{if(cache.get(key)===item)cache.delete(key);throw e;}).finally(()=>clearTimeout(timer));cache.set(key,item);return item.promise;}
 async function content(name,category){
  try{
   if(name==='novidades'){
    const r=await cached('news',()=>readers.latest());if(!r)return message('Ainda não há atualização confirmada. Acompanhe o Grupão em '+c.site);
    return {allowed_mentions:{parse:[]},embeds:[{title:('📣 Grupão — v'+r.version).slice(0,256),description:String(r.title||'Atualização do Grupão').slice(0,120),url:c.site,color:0x39d5ed,fields:[...(r.news?[{name:'Novidades',value:String(r.news).slice(0,1000)}]:[]),...(r.fixes?[{name:'Correções',value:String(r.fixes).slice(0,1000)}]:[])],footer:{text:'Última publicação confirmada • '+c.site}}]};
   }
   const rows=await cached('rank:'+category,()=>readers.ranking(category));
   return {allowed_mentions:{parse:[]},embeds:[{title:'🏆 Top 10 — '+CATEGORIES[category],description:rows.length?rows.slice(0,10).map((r,i)=>`${i+1}. **${safeNick(r.nick)}** — ${Math.max(0,Number(r.record)||0)} rodadas`).join('\n'):'Ainda não há jogadores no ranking.',color:0x39d5ed,url:c.site,footer:{text:'Recorde de rodadas • desempate por vitórias • atualização em até 15 s'}}]};
  }catch{return message('Não consegui consultar os dados agora. Tente novamente em alguns instantes.');}
 }
 async function complete(body,category){
  const data=await content(body.data.name,category);
  try{const r=await fetchImpl(`https://discord.com/api/v10/webhooks/${c.applicationId}/${encodeURIComponent(body.token)}/messages/@original`,{method:'PATCH',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();health.lastResponseAt=new Date(now()).toISOString();health.lastDeliveryError=null;}
  catch{health.lastDeliveryError='Falha ao entregar uma resposta. Tente o comando novamente no Discord.';}
 }
 function handle(req,res){
  res.set('Cache-Control','no-store');
  if(!c.configured)return res.status(503).json({error:'Bot não configurado.'});
  if(!validSignature(req,c.publicKey,now()))return res.status(401).json({error:'Assinatura inválida.'});
  let b;try{b=JSON.parse(req.body.toString('utf8'));}catch{return res.status(400).json({error:'JSON inválido.'});}
  if(b?.type===1)return res.json({type:1});
  if(!b||b.type!==2||b.application_id!==c.applicationId)return res.status(400).json({error:'Interação inválida.'});
  if(b.guild_id!==c.guildId)return res.json({type:4,data:message('Este bot está disponível apenas no servidor do Grupão configurado.',true)});
  const nickId=b.member?.user?.id;
  if(!/^\d{10,25}$/.test(b.id||'')||!/^\d{10,25}$/.test(nickId||'')||typeof b.token!=='string'||!/^[!-~]{10,2048}$/.test(b.token))return res.status(400).json({error:'Interação incompleta.'});
  const previous=seen.get(b.id);if(previous&&previous.expires>now())return res.json(previous.response);
  const reply=response=>{boundedPut(seen,b.id,{expires:now()+300000,response});res.json(response);};
  if(now()-groupWindow>10000){groupWindow=now();groupCount=0;}
  if((users.get(nickId)||0)>now()||++groupCount>30)return reply({type:4,data:message('Aguarde alguns segundos antes de usar outro comando.',true)});
  boundedPut(users,nickId,now()+2000,500);
  const name=b.data?.name,opts=b.data?.options||[];
  if(!COMMANDS.some(x=>x.name===name)||b.data.type!==1||!Array.isArray(opts))return reply({type:4,data:message('Comando desconhecido. Atualize os comandos no painel do site.',true)});
  const category=opts[0]?.value||'football';
  if((name!=='ranking'&&opts.length)||(name==='ranking'&&(opts.length>1||(opts.length&&(opts[0].name!=='jogo'||opts[0].type!==3||!Object.hasOwn(CATEGORIES,category))))))return reply({type:4,data:message('Escolha futebol, Clash Royale ou quiz gamer na opção jogo.',true)});
  health.lastInteractionAt=new Date(now()).toISOString();
  if(name==='site'){health.lastResponseAt=health.lastInteractionAt;return reply({type:4,data:message('⚽ **Grupão Minigames**\nJogue com seus amigos: '+c.site)});}
  // Acknowledge immediately; database work happens after the HTTP response.
  reply({type:5});void complete(b,category).catch(()=>{health.lastDeliveryError='Não foi possível concluir a resposta.';});
 }
 async function register(){
  const error=(text,status=400)=>{throw Object.assign(Error(text),{status});};
  if(!c.configured||!c.token)error('Configure as variáveis do bot e reinicie antes de registrar os comandos.');
  if(registering||nextRegistration>now())error('Aguarde antes de registrar novamente.',429);
  registering=true;nextRegistration=now()+10000;const done=[];
  async function request(url,body){
   let response;try{response=await fetchImpl(url,{method:body?'POST':'GET',redirect:'error',headers:{Authorization:'Bot '+c.token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)});}catch{error('Falha de conexão com o Discord. Você pode registrar novamente; comandos existentes serão atualizados.',503);}
   if(!response.ok){if(response.status===429){let delay=60;try{const r=await response.json();delay=Math.max(1,Math.min(86400,Number(r.retry_after)||60));}catch{}nextRegistration=now()+delay*1000;error('Discord limitou as requisições. Aguarde '+Math.ceil(delay)+' segundos antes de tentar novamente.',429);}error('Discord recusou o registro. Confira o token, o ID da aplicação e se o bot foi instalado no servidor.',400);}
   try{return await response.json();}catch{error('Resposta inesperada do Discord. Tente registrar novamente.',503);}
  }
  try{const app=await request('https://discord.com/api/v10/oauth2/applications/@me');if(app.id!==c.applicationId)error('O token pertence a outra aplicação. Confira DISCORD_APPLICATION_ID e DISCORD_BOT_TOKEN.');for(const command of COMMANDS){await request(`https://discord.com/api/v10/applications/${c.applicationId}/guilds/${c.guildId}/commands`,command);done.push(command.name);}health.lastRegisteredAt=new Date(now()).toISOString();return {ok:true,commands:done};}finally{registering=false;}
 }
 return {info,handle,register};
}
function mountInteractions({app,express,...options}){const bot=createBot(options);app.post('/api/discord/interactions',express.raw({type:'application/json',limit:'64kb',inflate:false}),bot.handle);return bot;}
function mountBotAdmin({app,auth,admin,bot}){
 app.get('/api/admin/discord-bot',auth,admin,(req,res)=>{res.set('Cache-Control','no-store');res.json(bot.info());});
 app.post('/api/admin/discord-bot/register',auth,admin,async(req,res)=>{res.set('Cache-Control','no-store');if(req.body?.confirm!==true)return res.status(400).json({error:'Confirme o registro dos comandos.'});try{res.json(await bot.register());}catch(e){res.status(e.status||503).json({error:e.status?e.message:'Não foi possível registrar os comandos.'});}});
}
module.exports={COMMANDS,CATEGORIES,config,validSignature,createReaders,createBot,mountInteractions,mountBotAdmin};
