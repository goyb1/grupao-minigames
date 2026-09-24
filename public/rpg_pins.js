'use strict';
(function(){
 const HOLD_MS=2000,MOVE_TOLERANCE=8;
 function createHold({fire,schedule=setTimeout,unschedule=clearTimeout}){
  let current=null,timer=null;
  function cancel(){if(timer!==null)unschedule(timer);timer=null;current=null;}
  return {
   start(data){if(current){cancel();return false;}current={...data};timer=schedule(()=>{timer=null;if(current){const value=current;current=null;fire(value);}},HOLD_MS);return true;},
   move(id,x,y){if(current&&current.id===id&&Math.hypot(x-current.x,y-current.y)>MOVE_TOLERANCE)cancel();},
   end(id){if(current?.id===id)cancel();},cancel,
   get active(){return current!==null;}
  };
 }
 const icon='<svg viewBox="0 0 48 64" aria-hidden="true"><path fill="#e51c28" d="M24 1C11 1 1 11 1 24c0 15 23 39 23 39s23-24 23-39C47 11 37 1 24 1Z"/><path fill="#ff655b" d="M7 26C5 13 21 2 34 9c-15-4-25 6-27 17Z"/><path fill="#c91925" d="M24 63 15 51c14-10 24-24 31-34 5 17-10 37-22 46Z"/><circle cx="24" cy="23" r="10" fill="white"/></svg>';
 function mount(pitch,{send,enabled=()=>true}){
  const doc=pitch.ownerDocument,win=doc.defaultView;let destroyed=false,suppress=false,suppressTimer=null;
  const layer=doc.createElement('div');layer.className='match-pins';pitch.append(layer);
  const ring=doc.createElement('div');ring.className='match-pin-hold';ring.hidden=true;pitch.append(ring);
  const hint=doc.createElement('p');hint.className='match-pin-hint';hint.textContent='📍 Segure por 2 segundos no campo para marcar. Segure por 2 segundos sobre a marcação para remover. Todos veem as marcações.';pitch.parentElement.after(hint);
  const status=doc.createElement('span');status.setAttribute('role','status');hint.append(status);
  const available=()=>!destroyed&&enabled()&&!doc.hidden&&!pitch.querySelector('.match-ruler-overlay:not([hidden])');
  function hideRing(){ring.hidden=true;ring.classList.remove('holding');}
  function cancel(){hold.cancel();hideRing();}
  const hold=createHold({fire:async data=>{
   hideRing();if(!available())return;
   suppress=true;clearTimeout(suppressTimer);
   const payload=data.pinId?{op:'pin',action:'remove',pinId:data.pinId}:{op:'pin',action:'add',pinId:window.GrupaoId.uuid(),to:data.to};
   try{const ok=await send(payload);if(!destroyed)status.textContent=ok===false?' Não foi possível marcar. Tente novamente.':data.pinId?' Marcação removida.':' Local marcado.';}catch(e){if(!destroyed)status.textContent=' '+(e.message||'Não foi possível salvar a marcação.');}
  }});
  function down(e){
   if(hold.active){cancel();return;}
   if(e.button!==0||e.isPrimary===false||!available())return;
   const pin=e.target.closest('.match-map-pin');
   if(!pin&&e.target.closest('.match-piece,.match-ball,.match-ruler-overlay,button,input,select'))return;
   suppress=false;clearTimeout(suppressTimer);
   const rect=pitch.getBoundingClientRect(),to=window.GrupaoRuler.fromClient(e.clientX,e.clientY,rect);
   if(hold.start({id:e.pointerId,x:e.clientX,y:e.clientY,to,pinId:pin?.dataset.pinId})){
    ring.style.left=to.x/105*100+'%';ring.style.top=to.y/68*100+'%';ring.hidden=false;ring.classList.add('holding');
   }
  }
  function move(e){hold.move(e.pointerId,e.clientX,e.clientY);if(!hold.active)hideRing();}
  function up(e){hold.end(e.pointerId);hideRing();if(suppress){clearTimeout(suppressTimer);suppressTimer=setTimeout(()=>suppress=false,500);}}
  function click(e){if(suppress||e.target.closest('.match-map-pin')){e.preventDefault();e.stopImmediatePropagation();suppress=false;}}
  function menu(e){if(hold.active||suppress||e.target.closest('.match-map-pin'))e.preventDefault();}
  function leave(e){if(e.pointerType==='mouse')cancel();}
  function hide(){if(doc.hidden)cancel();}
  pitch.addEventListener('pointerdown',down);doc.addEventListener('pointermove',move);doc.addEventListener('pointerup',up);doc.addEventListener('pointercancel',cancel);pitch.addEventListener('pointerleave',leave);pitch.addEventListener('click',click,true);pitch.addEventListener('contextmenu',menu);doc.addEventListener('visibilitychange',hide);win.addEventListener('blur',cancel);pitch.parentElement.addEventListener('scroll',cancel);
  function draw(pins=[]){
   const ids=new Set(pins.map(p=>p.id));for(const el of [...layer.children])if(!ids.has(el.dataset.pinId))el.remove();
   for(const p of pins){let el=[...layer.children].find(el=>el.dataset.pinId===p.id);if(!el){el=doc.createElement('button');el.type='button';el.className='match-map-pin';el.dataset.pinId=p.id;el.innerHTML=icon;layer.append(el);}el.style.left=p.x/105*100+'%';el.style.top=p.y/68*100+'%';el.title=`Marcação de ${p.by}. Segure 2 segundos para remover.`;el.setAttribute('aria-label',el.title);}
  }
  return {draw,destroy(){destroyed=true;cancel();clearTimeout(suppressTimer);pitch.removeEventListener('pointerdown',down);doc.removeEventListener('pointermove',move);doc.removeEventListener('pointerup',up);doc.removeEventListener('pointercancel',cancel);pitch.removeEventListener('pointerleave',leave);pitch.removeEventListener('click',click,true);pitch.removeEventListener('contextmenu',menu);doc.removeEventListener('visibilitychange',hide);win.removeEventListener('blur',cancel);pitch.parentElement.removeEventListener('scroll',cancel);layer.remove();ring.remove();hint.remove();}};
 }
 const api={HOLD_MS,MOVE_TOLERANCE,createHold,mount};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.GrupaoPins=api;
})();
