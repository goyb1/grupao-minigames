'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{attachPresence}=require('../rpg_presence');
function fixture(options={}){
 let connect;const service=attachPresence({on:(event,fn)=>connect=fn},{authorize:async(id,nick)=>id==='SAVE'&&nick!=='intruso',identity:s=>s.user,normalize:s=>s.toLowerCase(),graceMs:15,...options});
 function socket(nick){const handlers={},events=[];const s={data:{},connected:true,user:{nick},on:(e,f)=>handlers[e]=f,emit:(e,d)=>events.push([e,d])};connect(s);return {s,events,set:async(where='save',campaign='SAVE')=>{let result;await handlers['rpg:presence:set']({campaign,where},r=>result=r);return result;},leave:()=>handlers['rpg:presence:leave'](),disconnect:()=>{s.connected=false;handlers.disconnect();}};}
 return {service,socket};
}
test('presença reúne abas, privilegia campo e distingue saída de desconexão',async()=>{
 const {service,socket}=fixture(),a=socket('Ana'),b=socket('Ana'),m=socket('Mestre');
 try{await a.set();await b.set('field');await m.set();assert.equal(service.list('SAVE').length,2);assert.equal(service.list('SAVE')[0].status,'field');b.leave();assert.equal(service.list('SAVE')[0].status,'save');a.disconnect();assert.equal(service.list('SAVE')[0].status,'lost');const reconnect=socket('Ana');await reconnect.set();await new Promise(r=>setTimeout(r,25));assert.equal(service.list('SAVE')[0].status,'save');reconnect.leave();assert.equal(service.list('SAVE').length,1);m.disconnect();await new Promise(r=>setTimeout(r,25));assert.deepEqual(service.list('SAVE'),[]);}finally{service.close();}
});
test('presença impede intrusos, identidade falsa, payload inválido e campanha alheia',async()=>{
 const {service,socket}=fixture(),a=socket('Ana'),intruder=socket('intruso');try{await a.set();assert.equal((await intruder.set()).ok,false);assert.equal(intruder.events.length,0);assert.equal((await a.set('field','OUTRO')).ok,false);assert.deepEqual(service.list('SAVE'),[]);assert.equal((await a.set('invalid')).ok,false);assert.equal((await a.set('save',{})).ok,false);a.s.user=null;assert.equal((await a.set()).ok,false);}finally{service.close();}
});
test('saída durante validação assíncrona não ressuscita presença',async()=>{
 let resolve;const {service,socket}=fixture({authorize:()=>new Promise(r=>resolve=r)}),a=socket('Ana');try{const pending=a.set();a.leave();resolve(true);await pending;assert.deepEqual(service.list('SAVE'),[]);}finally{service.close();}
});
test('eventos não reenviam presença inalterada aos demais e limitam abuso',async()=>{
 const {service,socket}=fixture(),a=socket('Ana'),b=socket('Bia');try{await a.set();await b.set();const count=b.events.length;await a.set();assert.equal(b.events.length,count);for(let i=0;i<30;i++)await a.set();assert.equal((await a.set()).ok,false);}finally{service.close();}
});
