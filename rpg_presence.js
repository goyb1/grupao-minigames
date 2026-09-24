'use strict';
// Ephemeral presence: no campaign writes and no polling queries.
function attachPresence(io,{authorize,identity,normalize,graceMs=120000}){
 const rooms=new Map();
 function list(id){return [...(rooms.get(id)?.values()||[])].map(p=>({id:p.id,nick:p.nick,status:p.sockets.size?([...p.sockets.values()].includes('field')?'field':'save'):'lost'}));}
 function publish(id){const data={campaign:id,participants:list(id)};for(const p of rooms.get(id)?.values()||[])for(const s of p.sockets.keys())s.emit('rpg:presence',data);}
 function remove(s,lost){const old=s.data.rpgPresence;if(!old)return;delete s.data.rpgPresence;const room=rooms.get(old.campaign),p=room?.get(old.id);if(!p)return;p.sockets.delete(s);if(!p.sockets.size){if(lost){p.timer=setTimeout(()=>{room.delete(p.id);if(!room.size)rooms.delete(old.campaign);else publish(old.campaign);},graceMs);p.timer.unref?.();}else{clearTimeout(p.timer);room.delete(p.id);if(!room.size)rooms.delete(old.campaign);}}publish(old.campaign);}
 io.on('connection',s=>{
  let generation=0,busy=false,windowStart=0,count=0;
  s.on('rpg:presence:set',async(payload,ack)=>{
   const reply=value=>{if(typeof ack==='function')ack(value);};
   if(Date.now()-windowStart>10000){windowStart=Date.now();count=0;}
   if(++count>30||busy)return reply({ok:false,error:'Aguarde para atualizar a presença.'});
   const id=payload?.campaign,where=payload?.where;
   if(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,32}$/.test(id)||!['save','field'].includes(where))return reply({ok:false,error:'Presença inválida.'});
   const ticket=++generation;busy=true;
   try{
    const user=identity(s);
    if(!user||!await authorize(id,user.nick)) {if(ticket===generation)remove(s,false);return reply({ok:false,error:'Sem acesso ao save.'});}
    if(ticket!==generation||!s.connected)return;
    const key=normalize(user.nick),before=JSON.stringify(list(id));
    if(s.data.rpgPresence?.campaign!==id)remove(s,false);
    if(!rooms.has(id))rooms.set(id,new Map());const room=rooms.get(id);
    let p=room.get(key);if(!p){p={id:key,nick:user.nick,sockets:new Map()};room.set(key,p);}
    clearTimeout(p.timer);p.sockets.set(s,where);s.data.rpgPresence={campaign:id,id:key};
    if(before!==JSON.stringify(list(id)))publish(id);else s.emit('rpg:presence',{campaign:id,participants:list(id)});
    reply({ok:true});
   }catch{reply({ok:false,error:'Não foi possível atualizar a presença.'});}
   finally{busy=false;}
  });
  s.on('rpg:presence:leave',()=>{generation++;remove(s,false);});
  s.on('disconnect',()=>{generation++;remove(s,true);});
 });
 return {list,close(){for(const room of rooms.values())for(const p of room.values())clearTimeout(p.timer);rooms.clear();}};
}
module.exports={attachPresence};
