'use strict';
(function(){
 const WIDTH=105,HEIGHT=68;
 const clamp=(n,max)=>Math.max(0,Math.min(max,n));
 function point(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Coordenadas inválidas.');return {x:clamp(x,WIDTH),y:clamp(y,HEIGHT)};}
 function fromClient(x,y,rect){if(!(rect.width>0&&rect.height>0))throw Error('Campo sem tamanho.');return point((x-rect.left)/rect.width*WIDTH,(y-rect.top)/rect.height*HEIGHT);}
 const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
 const format=n=>n.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' m';
 function createMeasure(){
  let a=null,b=null,phase='empty',second=false;
  return {
   get state(){return {a:a&&{...a},b:b&&{...b},phase,meters:a&&b?distance(a,b):0};},
   begin(p){second=phase==='waiting';if(!second)a=point(p.x,p.y);b=point(p.x,p.y);phase='drawing';},
   move(p){if(a)b=point(p.x,p.y);},
   finish(dragged){if(a)phase=second||dragged?'done':'waiting';},
   clear(){a=b=null;phase='empty';second=false;}
  };
 }
 function mount(pitch){
  const doc=pitch.ownerDocument,measure=createMeasure();let active=false,gesture=null,keyboard=point(WIDTH/2,HEIGHT/2);
  const toolbar=doc.createElement('div');toolbar.className='match-ruler-toolbar';toolbar.innerHTML='<div class="match-ruler-buttons"><button type="button" class="btn secondary" data-toggle aria-pressed="false">📏 RÉGUA</button><button type="button" class="btn ghost" data-clear disabled>LIMPAR MEDIDA</button><output data-result aria-live="polite">Distância em metros</output></div><p data-help>Ative a régua para medir a distância entre dois pontos do campo.</p>';
  pitch.parentElement.before(toolbar);
  const overlay=doc.createElement('div');overlay.className='match-ruler-overlay';overlay.hidden=true;overlay.tabIndex=0;overlay.setAttribute('role','group');overlay.setAttribute('aria-label','Régua do campo. Arraste ou toque em dois pontos. No teclado, use as setas e Enter. Escape sai da régua.');
  overlay.innerHTML='<svg viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true"><g data-measure visibility="hidden"><path data-shadow class="ruler-shadow"/><path data-line class="ruler-line"/><circle data-origin r="0.7" class="ruler-origin"/><path data-arrow class="ruler-arrow"/></g><circle data-cursor r="0.65" class="ruler-cursor" visibility="hidden"/></svg><span class="match-ruler-label" hidden></span>';
  pitch.append(overlay);
  const find=s=>overlay.querySelector(s),toggle=toolbar.querySelector('[data-toggle]'),clear=toolbar.querySelector('[data-clear]'),result=toolbar.querySelector('[data-result]'),help=toolbar.querySelector('[data-help]'),label=find('.match-ruler-label');
  function paint(announce=false){
   const s=measure.state;clear.disabled=!s.a;find('[data-measure]').setAttribute('visibility',s.a?'visible':'hidden');label.hidden=!s.a;
   if(s.a){const {a,b}=s,d=`M${a.x} ${a.y} L${b.x} ${b.y}`,angle=Math.atan2(b.y-a.y,b.x-a.x),size=Math.min(1.5,s.meters/2),left={x:b.x-size*Math.cos(angle-.5),y:b.y-size*Math.sin(angle-.5)},right={x:b.x-size*Math.cos(angle+.5),y:b.y-size*Math.sin(angle+.5)};
    find('[data-line]').setAttribute('d',d);find('[data-shadow]').setAttribute('d',d);find('[data-origin]').setAttribute('cx',a.x);find('[data-origin]').setAttribute('cy',a.y);find('[data-arrow]').setAttribute('d',`M${left.x} ${left.y} L${b.x} ${b.y} L${right.x} ${right.y}`);
    label.textContent=format(s.meters);label.style.left=clamp(b.x/WIDTH*100,88)+'%';label.style.top=Math.max(5,Math.min(88,b.y/HEIGHT*100))+'%';
   }
   if(announce)result.textContent=s.a?format(s.meters):'Distância em metros';
  }
  function release(){const current=gesture;gesture=null;if(current&&overlay.hasPointerCapture(current.id))overlay.releasePointerCapture(current.id);}
  function setActive(value){release();active=value;overlay.hidden=!active;toggle.setAttribute('aria-pressed',String(active));toggle.textContent=active?'📏 RÉGUA ATIVA — SAIR':'📏 RÉGUA';help.textContent=active?'Arraste para medir ou toque no início e no fim. Setas + Enter também medem. A régua não move peças.':'Ative a régua para medir a distância entre dois pontos do campo.';if(!active){measure.clear();paint(true);}else overlay.focus({preventScroll:true});}
  toggle.onclick=()=>setActive(!active);
  clear.onclick=()=>{release();measure.clear();paint(true);if(active)overlay.focus({preventScroll:true});};
  function eventPoint(e){return fromClient(e.clientX,e.clientY,pitch.getBoundingClientRect());}
  overlay.onpointerdown=e=>{if(!active||gesture||e.button!==0||e.isPrimary===false)return;e.preventDefault();e.stopPropagation();measure.begin(eventPoint(e));gesture={id:e.pointerId,x:e.clientX,y:e.clientY,dragged:false};overlay.setPointerCapture(e.pointerId);paint();};
  overlay.onpointermove=e=>{if(!active)return;if(gesture&&gesture.id===e.pointerId){e.preventDefault();gesture.dragged=gesture.dragged||Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>4;measure.move(eventPoint(e));paint();}else if(!gesture&&measure.state.phase==='waiting'&&e.pointerType==='mouse'){measure.move(eventPoint(e));paint();}};
  overlay.onpointerup=e=>{if(!gesture||gesture.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();measure.move(eventPoint(e));measure.finish(gesture.dragged);release();paint(true);};
  overlay.onpointercancel=e=>{if(gesture?.id===e.pointerId){release();measure.clear();paint(true);}};
  overlay.onlostpointercapture=()=>{if(gesture){gesture=null;measure.clear();paint(true);}};
  overlay.onclick=e=>{e.stopPropagation();e.preventDefault();};overlay.ondragstart=e=>e.preventDefault();
  overlay.onkeydown=e=>{if(!active)return;const deltas={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(deltas[e.key]){e.preventDefault();const [x,y]=deltas[e.key],step=e.shiftKey?5:1;keyboard=point(keyboard.x+x*step,keyboard.y+y*step);const cursor=find('[data-cursor]');cursor.setAttribute('visibility','visible');cursor.setAttribute('cx',keyboard.x);cursor.setAttribute('cy',keyboard.y);if(measure.state.phase==='waiting'){measure.move(keyboard);paint(true);}}else if(e.key==='Enter'||e.key===' '){e.preventDefault();measure.begin(keyboard);measure.finish(false);paint(true);}};
  const escape=e=>{if(e.key==='Escape'&&active){e.preventDefault();setActive(false);toggle.focus({preventScroll:true});}};doc.addEventListener('keydown',escape);
  return {destroy(){release();doc.removeEventListener('keydown',escape);toolbar.remove();overlay.remove();}};
 }
 const api={WIDTH,HEIGHT,point,fromClient,distance,format,createMeasure,mount};
 if(typeof module!=='undefined')module.exports=api;
 if(typeof window!=='undefined')window.GrupaoRuler=api;
})();
