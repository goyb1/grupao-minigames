const express=require('express'),http=require('http'),path=require('path'),fs=require('fs'),crypto=require('crypto');
const {Server}=require('socket.io');
const {QUESTIONS,normalize}=require('./questions');
const app=express(),server=http.createServer(app),io=new Server(server);
const PORT=process.env.PORT||3000,DATA_DIR=process.env.DATA_DIR||path.join(__dirname,'data'),DATA_FILE=path.join(DATA_DIR,'users.json');
const TOTAL_ROUNDS=200,ROUND_SECONDS=60,rooms=new Map(),sessions=new Map();
app.use(express.json({limit:'20kb'}));app.use(express.static(path.join(__dirname,'public')));

function loadUsers(){try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))}catch{return {}}}let users=loadUsers();
function saveUsers(){fs.mkdirSync(DATA_DIR,{recursive:true});const t=DATA_FILE+'.tmp';fs.writeFileSync(t,JSON.stringify(users,null,2));fs.renameSync(t,DATA_FILE)}
function hash(password,salt=crypto.randomBytes(16).toString('hex')){return{salt,hash:crypto.scryptSync(password,salt,64).toString('hex')}}
function equal(a,b){const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function newSession(nick){const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{nick,expires:Date.now()+2592e6});return token}
function byToken(token=''){const s=sessions.get(token);return s&&s.expires>Date.now()?users[normalize(s.nick)]:null}
function viewUser(u){return{nick:u.nick,avatar:u.avatar||'⚽',record:u.record||0,wins:u.wins||0,games:u.games||0}}
function auth(req,res,next){req.user=byToken(String(req.headers.authorization||'').replace(/^Bearer\s+/i,''));if(!req.user)return res.status(401).json({ok:false,error:'Faça login novamente.'});next()}
app.post('/api/register',(req,res)=>{const nick=String(req.body.nick||'').trim().slice(0,18),password=String(req.body.password||''),key=normalize(nick);if(!/^[\p{L}\p{N}_ .-]{3,18}$/u.test(nick))return res.status(400).json({ok:false,error:'Use um nickname de 3 a 18 caracteres.'});if(password.length<6||password.length>72)return res.status(400).json({ok:false,error:'A senha deve ter entre 6 e 72 caracteres.'});if(users[key])return res.status(409).json({ok:false,error:'Esse nickname já existe.'});users[key]={nick,...hash(password),avatar:'⚽',record:0,wins:0,games:0,createdAt:Date.now()};saveUsers();res.json({ok:true,token:newSession(nick),user:viewUser(users[key])})});
app.post('/api/login',(req,res)=>{const u=users[normalize(req.body.nick||'')];if(!u||!equal(hash(String(req.body.password||''),u.salt).hash,u.hash))return res.status(401).json({ok:false,error:'Nickname ou senha incorretos.'});res.json({ok:true,token:newSession(u.nick),user:viewUser(u)})});
app.get('/api/me',auth,(req,res)=>res.json({ok:true,user:viewUser(req.user)}));
app.post('/api/logout',auth,(req,res)=>{sessions.delete(String(req.headers.authorization||'').replace(/^Bearer\s+/i,''));res.json({ok:true})});

function shuffle(a){a=[...a];for(let i=a.length-1;i;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function deck(){const groups=new Map();QUESTIONS.forEach(q=>{const k=normalize(q.answer);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(q)});return shuffle([...groups.values()]).slice(0,TOTAL_ROUNDS).map(v=>v[crypto.randomInt(v.length)])}
function code(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c;do{c=Array.from({length:5},()=>chars[crypto.randomInt(chars.length)]).join('')}while(rooms.has(c));return c}
function active(r){return[...r.players.values()].filter(p=>p.connected)}
function roomView(r){return{code:r.code,hostId:r.hostId,state:r.state,currentHint:r.currentHint,hintNumber:r.hintIndex+1,totalHints:r.question?.hints.length||5,roundNumber:Math.min(r.roundIndex+1,TOTAL_ROUNDS),totalRounds:TOTAL_ROUNDS,deadline:r.deadline,endReason:r.endReason,answer:r.answer,players:[...r.players.values()].map(p=>({id:p.id,nick:p.nick,avatar:p.avatar,ready:p.ready,gaveUp:p.gaveUp,connected:p.connected,correct:p.correct}))}}
function broadcast(r){io.to(r.code).emit('room:update',roomView(r))}
function reset(r){r.players.forEach(p=>{p.ready=false;p.gaveUp=false;p.guess='';p.correct=false})}
function stopTimer(r){if(r.timer)clearTimeout(r.timer);r.timer=null}
function timer(r){stopTimer(r);r.deadline=Date.now()+ROUND_SECONDS*1000;r.timer=setTimeout(()=>finish(r,'timeout'),ROUND_SECONDS*1000)}
function startRound(r){if(!rooms.has(r.code))return;if(r.roundIndex>=TOTAL_ROUNDS)return finish(r,'victory');r.question=r.deck[r.roundIndex];r.hintIndex=0;r.currentHint=r.question.hints[0];r.answer='';r.state='playing';reset(r);timer(r);broadcast(r)}
function records(r,win){for(const p of r.players.values()){const u=users[normalize(p.nick)];if(!u)continue;u.games=(u.games||0)+1;u.record=Math.max(u.record||0,Math.min(r.roundIndex,TOTAL_ROUNDS));if(win)u.wins=(u.wins||0)+1}saveUsers()}
function finish(r,reason){if(!r||!rooms.has(r.code)||['victory','defeat'].includes(r.state))return;stopTimer(r);r.state=reason==='victory'?'victory':'defeat';r.endReason=reason;r.answer=r.question?.answer||'';records(r,reason==='victory');broadcast(r)}
function evaluate(r){const ps=active(r);if(!ps.length||!ps.every(p=>p.ready))return;if(ps.every(p=>p.gaveUp))return finish(r,'gave-up');const correct=ps.filter(p=>!p.gaveUp&&r.question.aliases.includes(normalize(p.guess)));if(correct.length){correct.forEach(p=>p.correct=true);stopTimer(r);r.answer=r.question.answer;r.state='round-result';broadcast(r);setTimeout(()=>{if(rooms.has(r.code)&&r.state==='round-result'){r.roundIndex++;startRound(r)}},2200);return}r.hintIndex++;if(r.hintIndex>=r.question.hints.length)return finish(r,'wrong');r.currentHint=r.question.hints[r.hintIndex];reset(r);broadcast(r)}

io.use((socket,next)=>{const u=byToken(socket.handshake.auth?.token);if(!u)return next(new Error('unauthorized'));socket.data.user=u;next()});
io.on('connection',socket=>{
 const u=socket.data.user;
 socket.on('room:create',({avatar,reconnectToken}={},cb)=>{const c=code(),token=reconnectToken||crypto.randomBytes(24).toString('hex'),p={id:socket.id,token,nick:u.nick,avatar:String(avatar||u.avatar||'⚽').slice(0,4),ready:false,gaveUp:false,guess:'',correct:false,connected:true},r={code:c,hostId:socket.id,players:new Map([[socket.id,p]]),state:'lobby',deck:[],roundIndex:0,hintIndex:0,deadline:0,timer:null,endReason:'',answer:''};rooms.set(c,r);socket.join(c);socket.data.roomCode=c;socket.data.playerToken=token;cb?.({ok:true,code:c,playerId:socket.id,reconnectToken:token});broadcast(r)});
 socket.on('room:join',({code:c,avatar,reconnectToken}={},cb)=>{const r=rooms.get(String(c||'').toUpperCase());if(!r)return cb?.({ok:false,error:'Sala não encontrada.'});let p=[...r.players.values()].find(x=>x.token===reconnectToken&&normalize(x.nick)===normalize(u.nick));if(p){const oldId=p.id,wasHost=r.hostId===oldId;r.players.delete(oldId);p.id=socket.id;p.connected=true;r.players.set(socket.id,p);if(wasHost)r.hostId=socket.id}else{if(r.state!=='lobby')return cb?.({ok:false,error:'A partida já começou. Só jogadores desconectados podem voltar.'});if(r.players.size>=10)return cb?.({ok:false,error:'A sala está cheia.'});if([...r.players.values()].some(x=>normalize(x.nick)===normalize(u.nick)))return cb?.({ok:false,error:'Sua conta já está nessa sala.'});const token=reconnectToken||crypto.randomBytes(24).toString('hex');p={id:socket.id,token,nick:u.nick,avatar:String(avatar||u.avatar||'⚽').slice(0,4),ready:false,gaveUp:false,guess:'',correct:false,connected:true};r.players.set(socket.id,p)}socket.join(r.code);socket.data.roomCode=r.code;socket.data.playerToken=p.token;cb?.({ok:true,code:r.code,playerId:socket.id,reconnectToken:p.token});broadcast(r)});
 socket.on('game:start',cb=>{const r=rooms.get(socket.data.roomCode);if(!r)return;if(r.hostId!==socket.id)return cb?.({ok:false,error:'Apenas o dono pode começar.'});if(active(r).length<2)return cb?.({ok:false,error:'É preciso pelo menos 2 jogadores.'});r.deck=deck();r.roundIndex=0;r.endReason='';startRound(r);cb?.({ok:true})});
 socket.on('guess:ready',({guess}={},cb)=>{const r=rooms.get(socket.data.roomCode),p=r?.players.get(socket.id);if(!r||r.state!=='playing'||!p)return;guess=String(guess||'').trim().slice(0,60);if(!guess)return cb?.({ok:false,error:'Digite um palpite.'});p.guess=guess;p.ready=true;p.gaveUp=false;cb?.({ok:true});broadcast(r);evaluate(r)});
 socket.on('guess:cancel',()=>{const r=rooms.get(socket.data.roomCode),p=r?.players.get(socket.id);if(r?.state==='playing'&&p){p.ready=false;p.gaveUp=false;p.guess='';broadcast(r)}});
 socket.on('guess:giveup',cb=>{const r=rooms.get(socket.data.roomCode),p=r?.players.get(socket.id);if(!r||r.state!=='playing'||!p)return;p.gaveUp=true;p.ready=true;p.guess='';cb?.({ok:true});broadcast(r);evaluate(r)});
 socket.on('game:restart',cb=>{const r=rooms.get(socket.data.roomCode);if(!r||r.hostId!==socket.id)return cb?.({ok:false,error:'Apenas o dono pode jogar novamente.'});r.state='lobby';r.roundIndex=0;r.deck=[];r.endReason='';reset(r);broadcast(r);cb?.({ok:true})});
 socket.on('room:leave',()=>socket.disconnect(true));
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.roomCode),p=r?.players.get(socket.id);if(!r||!p)return;p.connected=false;p.ready=false;if(r.hostId===socket.id){const next=active(r)[0];if(next)r.hostId=next.id}broadcast(r);setTimeout(()=>{if(!rooms.has(r.code)||p.connected)return;r.players.delete(p.id);if(!r.players.size){stopTimer(r);rooms.delete(r.code)}else broadcast(r)},120000)});
});
server.listen(PORT,()=>console.log(`Grupão Minigames em http://localhost:${PORT}`));
