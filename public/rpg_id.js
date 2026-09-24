'use strict';
(()=>{
 function uuid(source=globalThis.crypto){
  if(typeof source?.randomUUID==='function')return source.randomUUID();
  // getRandomValues remains available in browsers without secure-context randomUUID.
  if(typeof source?.getRandomValues!=='function')throw Error('Seu navegador não oferece geração segura de identificadores. Abra o site por HTTPS em um navegador atualizado.');
  const bytes=source.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
 }
 const api={uuid};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.GrupaoId=api;
})();
