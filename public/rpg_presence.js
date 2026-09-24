'use strict';
(()=>{
 let campaign=null,connection=null,participants=[],status='Conectando…',timer=null,revision=0;
 const box=document.createElement('details');box.className='rpg-presence';box.hidden=true;
 box.innerHTML='<summary>Participantes</summary><p></p><ul></ul>';
 const style=document.createElement('style');style.textContent='.rpg-presence{position:fixed;right:12px;bottom:12px;z-index:90;background:#102332;color:#e9f4fa;border:1px solid #355365;border-radius:12px;padding:10px 14px;max-width:min(320px,calc(100vw - 24px));box-shadow:0 4px 18px #0006}.rpg-presence[hidden]{display:none!important}.rpg-presence summary{cursor:pointer;font-weight:bold}.rpg-presence p{font-size:12px;margin:8px 0}.rpg-presence ul{list-style:none;padding:0;margin:0;max-height:28vh;overflow:auto}.rpg-presence li{font-size:13px;margin:8px 0;overflow-wrap:anywhere}';document.head.append(style);document.body.append(box);
 function visible(){return campaign&&['rpg','match'].includes(currentView);}
 function render(){box.hidden=!visible();const online=participants.filter(p=>p.status!=='lost').length;box.querySelector('summary').textContent='Participantes · '+(status==='Conectado'?online+' online':'reconectando');box.querySelector('p').textContent=status==='Conectado'?'Presença neste save • abas em segundo plano também contam.':status;
  const ul=box.querySelector('ul');ul.replaceChildren();const all=new Map(Object.entries(campaign?.members||{}).map(([id,p])=>[id,{id,nick:p.nick,status:'offline'}]));for(const p of participants)all.set(p.id,p);
  for(const p of all.values()){const li=document.createElement('li');li.textContent=p.nick+' — '+(status!=='Conectado'?'Estado indisponível':({field:'🟢 No campo',save:'🟢 No save',lost:'🟠 Conexão perdida',offline:'⚪ Fora do save'}[p.status]||'Fora do save'));ul.append(li);}
 }
 function send(){clearTimeout(timer);if(!visible()||!connection?.connected)return;const version=++revision;connection.timeout(6000).emit('rpg:presence:set',{campaign:campaign.id,where:currentView==='match'?'field':'save'},(err,result)=>{if(version!==revision||!visible())return;if(err||!result?.ok){status=result?.error||'Presença indisponível. Tentando reconectar…';render();timer=setTimeout(send,10000);}});}
 function bind(s){if(connection===s)return;connection=s;s.on('connect',()=>{status='Conectando…';render();send();});s.on('disconnect',()=>{revision++;status='Conexão perdida. Reconectando…';render();});s.on('rpg:presence',data=>{if(!visible()||data.campaign!==campaign.id)return;participants=data.participants;status='Conectado';render();});}
 function mount(host){(host||document.body).append(box);}
 function leave(){mount();revision++;clearTimeout(timer);if(connection?.connected)connection.emit('rpg:presence:leave');campaign=null;participants=[];box.hidden=true;}
 window.GrupaoPresence={bind,leave,mount,enter(c){const changed=campaign?.id!==c.id;campaign=c;if(changed){participants=[];status='Conectando…';}connect();bind(socket);render();send();},view(name){if(!['rpg','match'].includes(name)){leave();return;}render();clearTimeout(timer);timer=setTimeout(send,100);}};

})();
