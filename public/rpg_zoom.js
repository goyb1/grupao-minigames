'use strict';
(() => {
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function createCamera(){let width=1,height=1,scale=1,x=0,y=0;
  function bounds(){x=clamp(x,width*(1-scale),0);y=clamp(y,height*(1-scale),0);}
  return {get state(){return {width,height,scale,x,y};},resize(w,h){const rx=x/width,ry=y/height;width=Math.max(1,w);height=Math.max(1,h);x=rx*width;y=ry*height;bounds();},pan(dx,dy){x+=dx;y+=dy;bounds();},zoom(value,cx=width/2,cy=height/2){const next=clamp(value,1,3),ratio=next/scale;x=cx-(cx-x)*ratio;y=cy-(cy-y)*ratio;scale=next;bounds();},reset(){scale=1;x=y=0;}};
 }
 function mount(pitch){
  const viewport=pitch.parentElement,doc=pitch.ownerDocument,win=doc.defaultView,camera=createCamera(),points=new Map();let navigating=false,baseline=null;
  const toolbar=doc.createElement('div');toolbar.className='match-zoom-toolbar';toolbar.innerHTML='<div class="match-ruler-buttons"><button type="button" class="btn secondary" data-nav aria-pressed="false">✋ NAVEGAR</button><button type="button" class="btn ghost" data-minus aria-label="Afastar campo">−</button><output aria-live="polite">100%</output><button type="button" class="btn ghost" data-plus aria-label="Aproximar campo">+</button><button type="button" class="btn ghost" data-fit>ENQUADRAR CAMPO</button></div><p>Use + e − para aproximar. Ative Navegar para arrastar a visão, usar a roda do mouse ou pinça com dois dedos. Desative para mover peças, medir e marcar.</p>';viewport.before(toolbar);
  const nav=toolbar.querySelector('[data-nav]'),minus=toolbar.querySelector('[data-minus]'),plus=toolbar.querySelector('[data-plus]'),output=toolbar.querySelector('output');
  viewport.classList.add('match-camera');viewport.tabIndex=0;viewport.setAttribute('aria-label','Visão do campo. No modo Navegar, use setas para deslocar e mais ou menos para zoom.');
  const host=viewport.closest('.match-main'),fullButton=doc.createElement('button');fullButton.type='button';fullButton.className='btn secondary';fullButton.textContent='TELA CHEIA';toolbar.querySelector('.match-ruler-buttons').append(fullButton);let fallback=false,oldOverflow='';
  function fullState(){const active=doc.fullscreenElement===host||fallback;host.classList.toggle('match-fullscreen',active);fullButton.textContent=active?'SAIR DA TELA CHEIA':'TELA CHEIA';fullButton.setAttribute('aria-pressed',String(active));resize();}
  function leaveFallback(){if(fallback){fallback=false;doc.body.style.overflow=oldOverflow;}fullState();}
  fullButton.onclick=async()=>{if(fallback){leaveFallback();return;}if(doc.fullscreenElement===host){await doc.exitFullscreen();return;}try{if(!host.requestFullscreen)throw Error('unsupported');await host.requestFullscreen();}catch{oldOverflow=doc.body.style.overflow;fallback=true;doc.body.style.overflow='hidden';}fullState();};
  const escapeFull=e=>{if(e.key==='Escape'&&fallback)leaveFallback();};doc.addEventListener('fullscreenchange',fullState);doc.addEventListener('keydown',escapeFull);
  function paint(){const s=camera.state;pitch.style.transform=`translate(${s.x}px,${s.y}px) scale(${s.scale})`;output.textContent=Math.round(s.scale*100)+'%';minus.disabled=s.scale<=1;plus.disabled=s.scale>=3;}
  function resize(){const full=host.classList.contains('match-fullscreen'),available=Math.max(100,host.clientHeight-toolbar.offsetHeight-(host.querySelector('.match-ruler-toolbar')?.offsetHeight||0)-(host.querySelector('.match-pin-hint')?.offsetHeight||0)-140);const width=Math.max(1,full?Math.min(host.clientWidth-48,available*105/68):viewport.clientWidth-48),height=width*68/105;camera.resize(width,height);pitch.style.width=width+'px';pitch.style.height=height+'px';viewport.style.height=(height+64)+'px';paint();}
  function resetPointers(){for(const id of points.keys())if(viewport.hasPointerCapture(id))viewport.releasePointerCapture(id);points.clear();baseline=null;}
  function setMode(on){resetPointers();navigating=on;viewport.classList.toggle('is-navigating',on);nav.setAttribute('aria-pressed',String(on));nav.textContent=on?'✋ NAVEGANDO — SAIR':'✋ NAVEGAR';}
  nav.onclick=()=>setMode(!navigating);minus.onclick=()=>{camera.zoom(camera.state.scale/1.25);paint();};plus.onclick=()=>{camera.zoom(camera.state.scale*1.25);paint();};toolbar.querySelector('[data-fit]').onclick=()=>{resetPointers();camera.reset();paint();};
  function geometry(){const p=[...points.values()];return p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2,d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}:p.length?{...p[0],d:0}:null;}
  function stop(e){e.preventDefault();e.stopImmediatePropagation();}
  function down(e){if(!navigating||e.button!==0)return;stop(e);points.set(e.pointerId,{x:e.clientX,y:e.clientY});viewport.setPointerCapture(e.pointerId);baseline=geometry();}
  function move(e){if(!navigating||!points.has(e.pointerId))return;stop(e);points.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=geometry(),rect=viewport.getBoundingClientRect();if(baseline){if(next.d>0&&baseline.d>0)camera.zoom(camera.state.scale*next.d/baseline.d,baseline.x-rect.left-24,baseline.y-rect.top-24);camera.pan(next.x-baseline.x,next.y-baseline.y);}baseline=next;paint();}
  function up(e){if(!points.has(e.pointerId))return;stop(e);points.delete(e.pointerId);if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);baseline=geometry();}
  function block(e){if(navigating)stop(e);}
  function wheel(e){if(!navigating)return;stop(e);const r=viewport.getBoundingClientRect();camera.zoom(camera.state.scale*Math.exp(-clamp(e.deltaY,-100,100)*.003),e.clientX-r.left-24,e.clientY-r.top-24);paint();}
  function keyboard(e){if(e.target!==viewport)return;if(e.key==='Escape'){setMode(false);return;}if(!navigating)return;const arrows={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};if(arrows[e.key]){stop(e);camera.pan(...arrows[e.key]);}else if(['+','=','-'].includes(e.key)){stop(e);camera.zoom(camera.state.scale*(e.key==='-'?.8:1.25));}else if(e.key==='Home'){stop(e);camera.reset();}paint();}
  const listeners=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['click',block],['dblclick',block],['dragstart',block],['contextmenu',block],['wheel',wheel],['keydown',keyboard]];
  for(const [name,fn] of listeners)viewport.addEventListener(name,fn,{capture:true,passive:false});
  win.addEventListener('blur',resetPointers);const observer=new ResizeObserver(resize);observer.observe(viewport);resize();
  return {destroy(){doc.removeEventListener('fullscreenchange',fullState);doc.removeEventListener('keydown',escapeFull);if(fallback){fallback=false;doc.body.style.overflow=oldOverflow;}if(doc.fullscreenElement===host)doc.exitFullscreen().catch(()=>{});host.classList.remove('match-fullscreen');resetPointers();observer.disconnect();win.removeEventListener('blur',resetPointers);for(const [name,fn] of listeners)viewport.removeEventListener(name,fn,true);toolbar.remove();viewport.classList.remove('match-camera','is-navigating');viewport.style.height='';viewport.removeAttribute('tabindex');pitch.style.transform='';pitch.style.width='';pitch.style.height='';}};
 }
 const api={createCamera,mount};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.GrupaoZoom=api;
})();
