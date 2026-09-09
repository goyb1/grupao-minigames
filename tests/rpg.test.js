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
 const rolled=(await call('jogador',base+'/roll','POST',{})).data.members.jogador.rolls;
 assert.deepEqual((await call('jogador',base+'/roll','POST',{})).data.members.jogador.rolls,rolled);
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
