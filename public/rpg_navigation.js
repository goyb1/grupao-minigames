'use strict';
window.GrupaoRpgCanLeave=root=>root.dataset.rpgDirty!=='true'||confirm('Há alterações não salvas. Sair desta tela e descartá-las?');
window.GrupaoRpgNav=(root,active,campaign)=>{
 root.dataset.rpgDirty='false';
 if(!root.dataset.rpgTracked){root.dataset.rpgTracked='true';root.addEventListener('input',e=>{if(e.target.closest('form'))root.dataset.rpgDirty='true';});}
 const nav=document.createElement('nav');nav.className='rpg-navigation';nav.setAttribute('aria-label','Navegação do RPG');
 nav.innerHTML=[['overview','Visão geral'],['sheets','Fichas'],['friendly','Amistosos'],['career','Carreira']].map(([id,label])=>`<button type="button" data-rpg-route="${id}" ${active===id?'aria-current="page"':''}>${label}</button>`).join('');
 root.querySelector('.topbar').after(nav);
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(window.GrupaoRpgCanLeave(root))window.openRpgSection(b.dataset.rpgRoute,campaign.id);});
};
