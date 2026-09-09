'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const express=require('express');
const {createRpg,attributes,styles,photo}=require('../rpg');
const {normalize}=require('../questions');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
async function boot(dir){const app=express();const rpg=createRpg({app,express,db:null,normalize,dataDir:dir,auth:(req,res,next)=>{if(!req.headers['x-user'])return res.sendStatus(401);req.user={nick:req.headers['x-user']};next();}});app.use(express.json({limit:'30kb'}));await rpg.init();const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});return{server,url:'http://127.0.0.1:'+server.address().port};}
test('saves, fichas, permissões, foto e retomada após reinicialização',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'grupao-rpg-'));let running=await boot(dir);
 const call=async(user,url,method='GET',body)=>{const r=await fetch(running.url+'/api/rpg'+url,{method,headers:{'x-user':user,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};};
 try{
 const created=await call('mestre','/campaigns','POST',{name:'Treino do Grupão'});assert.equal(created.status,200);const id=created.data.id,base='/campaigns/'+id;
 assert.equal((await call('visitante',base)).status,403);
 const joined=await call('jogador','/join','POST',{code:id});assert.equal(joined.status,200);
 const rolled=[Array(11).fill(8)];
 const body={name:'Atleta',nationality:'Brasil',age:18,height:175,position:'Atacante',style:'Matador',ego:'Rival',selected:0,base:Object.fromEntries(attributes(false).map((a,i)=>[a,rolled[0][i]])),growth:{},level:99,approved:true,photo:png};
 let result=await call('jogador',base+'/sheets/jogador','PUT',body);assert.equal(result.status,200);let sheet=result.data.members.jogador.sheet;assert.equal(sheet.level,1);assert.equal(sheet.approved,false);assert.equal(sheet.photo,png);assert.equal(sheet.stats.Finalização.bonus,2);
 assert.equal((await call('jogador',base+'/sheets/mestre','PUT',body)).status,403);
 assert.equal((await call('jogador',base,'PATCH',{name:'Mudança',notes:''})).status,403);
 assert.equal((await call('jogador',base+'/sheets/jogador','PUT',{...body,base:{...body.base,Carisma:30}})).status,400);
 assert.equal((await call('jogador',base+'/sheets/jogador','PUT',{...body,photo:'data:image/png;base64,AAAA'})).status,400);
 result=await call('mestre',base+'/sheets/jogador','PUT',{...sheet,approved:true});assert.equal(result.status,200);
 assert.equal((await call('jogador',base+'/sheets/jogador','PUT',body)).status,403);
 result=await call('mestre',base+'/sheets/jogador','PUT',{...sheet,level:2,growth:{Finalização:1,Frieza:1},approved:true});assert.equal(result.status,200);
 await new Promise(resolve=>running.server.close(resolve));running=await boot(dir);
 const resumed=(await call('jogador',base)).data;assert.equal(resumed.members.jogador.sheet.photo,png);assert.equal(resumed.members.jogador.sheet.level,2);assert.equal(resumed.owner,'mestre');assert.equal((await call('mestre','/campaigns')).data.campaigns.length,1);
 }finally{await new Promise(resolve=>running.server.close(resolve));fs.rmSync(dir,{recursive:true,force:true});}
});
test('catálogo e validação de PNG',()=>{assert.equal(Object.values(styles).reduce((n,s)=>n+Object.keys(s).length,0),23);assert.equal(attributes(false).length,11);assert.equal(attributes(true).length,11);assert.equal(photo(png),png);assert.throws(()=>photo(png.slice(0,-8)));assert.throws(()=>photo('data:image/svg+xml;base64,AAAA'));});

test('mestre cria múltiplas fichas extras, com acesso protegido e persistência',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'grupao-extras-'));let running=await boot(dir);
 const call=async(user,url,method='GET',body)=>{const r=await fetch(running.url+'/api/rpg'+url,{method,headers:{'x-user':user,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return{status:r.status,data:await r.json()};};
 try{
 const initial=(await call('mestre','/campaigns','POST',{name:'7 contra 7'})).data;
 const base='/campaigns/'+initial.id;
 await call('amigo','/join','POST',{code:initial.id});
 assert.equal((await call('amigo',base+'/extras','POST',{name:'Não autorizado'})).status,403);
 assert.equal((await call('intruso',base+'/extras','POST',{name:'Não autorizado'})).status,403);
 let c;
 for(let i=0;i<11;i++){const r=await call('mestre',base+'/extras','POST',{name:'Extra '+i});assert.equal(r.status,200);c=r.data;}
 assert.equal(Object.keys(c.extras).length,11);assert.equal(Object.keys(c.members).length,2);
 const ids=Object.keys(c.extras),id=ids[0],m=c.extras[id];
 const body={name:'Goleiro extra',nationality:'Brasil',age:20,height:180,position:'Goleiro',style:'Muralha',ego:'Rival',selected:0,base:Object.fromEntries(attributes(true).map((a,i)=>[a,8])),growth:{},level:1,approved:true,photo:png};
 assert.equal((await call('amigo',base+'/sheets/'+encodeURIComponent(id),'PUT',body)).status,403);
 assert.equal((await call('mestre',base+'/sheets/'+encodeURIComponent(id),'PUT',body)).status,200);
 const visible=(await call('amigo',base)).data;
 assert.equal(visible.extras[id].sheet.name,'Goleiro extra');assert.equal(visible.extras[id].rolls,undefined);
 assert.equal(visible.extras[ids[1]].sheet,null);
 await new Promise(resolve=>running.server.close(resolve));running=await boot(dir);
 c=(await call('mestre',base)).data;assert.equal(Object.keys(c.extras).length,11);assert.equal(c.extras[id].sheet.photo,png);assert.deepEqual(c.extras[id].rolls,m.rolls);
 }finally{await new Promise(resolve=>running.server.close(resolve));fs.rmSync(dir,{recursive:true,force:true});}
});

test('atributos manuais até 12 e evolução final até 30',()=>{
 const {validateSheet}=require('../rpg');
 const b={name:'Teste',nationality:'Brasil',age:20,height:180,position:'Atacante',style:'Matador',ego:'Rival',base:Object.fromEntries(attributes(false).map(a=>[a,12])),growth:{Finalização:18},level:10};
 const sheet=validateSheet(b,{sheet:null},true);
 assert.equal(sheet.stats.Finalização.value,30);assert.equal(sheet.stats.Finalização.modifier,13);
 assert.throws(()=>validateSheet({...b,growth:{Finalização:19},level:11},{sheet:null},true),/ultrapassar 30/);
 for(const n of [0,13,1.5])assert.throws(()=>validateSheet({...b,base:{...b.base,Passe:n}},{sheet:null},true));
 const player=validateSheet({...b,growth:{Finalização:16}},{sheet:null},false);assert.equal(player.growth.Finalização,0);assert.equal(player.level,1);
 const legacy=validateSheet({...b,growth:{},level:1},{rolls:[[1,2]],sheet:null},true);assert.equal(legacy.base.Passe,12);
});

 test('estilo altera o modificador, mantendo o atributo',()=>{const {validateSheet}=require('../rpg');const b={name:'Teste',nationality:'Brasil',age:18,height:175,position:'Atacante',style:'Matador',ego:'Rival',base:Object.fromEntries(attributes(false).map(a=>[a,12])),growth:{},level:1};const s=validateSheet(b,{sheet:null},true);assert.equal(s.stats.Finalização.value,12);assert.equal(s.stats.Finalização.modifier,4);assert.equal(s.stats.Defesa.value,12);assert.equal(s.stats.Defesa.modifier,1);});
