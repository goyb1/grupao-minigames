'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),express=require('express');
const {createRpg,attributes}=require('../rpg');
async function context(fn){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rpg-teams-')),extras={};
 for(let n=0;n<14;n++){const keeper=n%7===0;extras['npc:'+n]={nick:'NPC '+n,sheet:{name:'NPC '+n,position:keeper?'Goleiro':'Atacante',style:keeper?'Líbero':'Matador',approved:true,base:Object.fromEntries(attributes(keeper).map(a=>[a,8])),growth:{}}};}
 const campaign={id:'C',name:'Campanha',owner:'mestre',notes:'Diário preservado',members:{mestre:{nick:'Mestre'},amigo:{nick:'Amigo'}},extras};fs.writeFileSync(path.join(dir,'rpg-campaigns.json'),JSON.stringify({C:campaign}));let server,url;
 async function boot(){const app=express(),r=createRpg({app,express,db:null,dataDir:dir,normalize:s=>s,auth:(req,res,next)=>{req.user={nick:req.headers['x-user']};next();}});await r.init();await new Promise(r=>{server=app.listen(0,'127.0.0.1',r);});url=`http://127.0.0.1:${server.address().port}/api/rpg/campaigns/C`;}
 async function req(method,suffix='',body,user='mestre'){const res=await fetch(url+suffix,{method,headers:{'x-user':user,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:res.status,data:await res.json()};}
 const team=(t=0)=>({name:'Time '+t,color:'#46e4ff',formation:'2-3-1',ids:Array.from({length:7},(_,n)=>'npc:'+(t*7+n)),rev:0});
 try{await boot();await fn({req,team,campaign,restart:async()=>{await new Promise(r=>server.close(r));await boot();}});}finally{if(server)await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}
}
test('times salvos: criar, repetir envio e reiniciar preservam escalação e fichas',()=>context(async({req,team,campaign,restart})=>{
 assert.deepEqual((await req('GET','/teams')).data.teams,{});
 const payload=team(),results=await Promise.all([req('PUT','/teams/aaaaaaaaaaaaaaaa',payload),req('PUT','/teams/aaaaaaaaaaaaaaaa',payload)]);assert.ok(results.every(r=>r.status===200));assert.equal(Object.keys(results[1].data.teams).length,1);
 const before=(await req('GET')).data;assert.equal(before.notes,campaign.notes);assert.equal(Object.keys(before.extras).length,14);await restart();const after=(await req('GET')).data;assert.deepEqual(after.savedTeams,before.savedTeams);assert.deepEqual(after.extras,before.extras);assert.equal(after.savedTeams.aaaaaaaaaaaaaaaa.ids.length,7);
}));
test('times salvos: permissões, fichas duplicadas, aprovação e goleiro são validados',()=>context(async({req,team})=>{
 assert.equal((await req('GET','/teams',null,'intruso')).status,403);
 assert.equal((await req('PUT','/teams/aaaaaaaaaaaaaaaa',team(),'amigo')).status,403);
 for(const payload of [{...team(),ids:Array(7).fill('npc:1')},{...team(),ids:team().ids.slice(1)},{...team(),ids:['npc:7',...team().ids.slice(0,6)]},{...team(),ids:['npc:99',...team().ids.slice(1)]},{...team(),color:'invalid'},{...team(),formation:'8-8-8'}])assert.equal((await req('PUT','/teams/aaaaaaaaaaaaaaaa',payload)).status,400);
 assert.deepEqual((await req('GET','/teams')).data.teams,{});
 assert.equal((await req('PUT','/teams/aaaaaaaaaaaaaaaa',team())).status,200);
 assert.equal((await req('DELETE','/teams/aaaaaaaaaaaaaaaa',{rev:1},'amigo')).status,403);
}));
test('times salvos: atualização concorrente e exclusão não apagam fichas ou partida',()=>context(async({req,team})=>{
 await req('PUT','/teams/aaaaaaaaaaaaaaaa',team());const before=(await req('GET')).data;
 const results=await Promise.all([req('PUT','/teams/aaaaaaaaaaaaaaaa',{...team(),name:'Novo A',rev:1}),req('PUT','/teams/aaaaaaaaaaaaaaaa',{...team(),name:'Novo B',rev:1})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 assert.equal((await req('DELETE','/teams/aaaaaaaaaaaaaaaa',{rev:1})).status,409);
 assert.equal((await req('DELETE','/teams/aaaaaaaaaaaaaaaa',{rev:2})).status,200);
 const after=(await req('GET')).data;assert.deepEqual(after.extras,before.extras);assert.deepEqual(after.members,before.members);assert.deepEqual(after.match,before.match);assert.deepEqual(after.savedTeams,{});
}));
test('times salvos: preparar partida reutiliza IDs e mantém mesa livre e conflito entre equipes',()=>context(async({req,team})=>{
 await req('PUT','/teams/aaaaaaaaaaaaaaaa',team());await req('PUT','/teams/bbbbbbbbbbbbbbbb',team(1));const saved=Object.values((await req('GET','/teams')).data.teams);
 assert.equal((await req('POST','/match',{op:'create',teams:[saved[0],saved[0]]})).status,400);
 const created=await req('POST','/match',{op:'create',teams:saved});assert.equal(created.status,200);assert.equal(created.data.match.freeMode,true);assert.equal(Object.keys(created.data.match.players).length,14);
 const before=created.data.match;await req('PUT','/teams/aaaaaaaaaaaaaaaa',{...team(),name:'Nome futuro',rev:1});assert.deepEqual((await req('GET','/match')).data.match.teams,before.teams);
}));
