'use strict';
const crypto=require('crypto');
const LIMIT=10,MAX_BYTES=16*1024*1024;
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
function fail(text,status=409){throw Object.assign(Error(text),{status});}
function check(items){if(!Array.isArray(items)||items.length>LIMIT||Buffer.byteLength(JSON.stringify(items))>MAX_BYTES)fail('A lixeira comporta até 10 fichas e 16 MB por save. Exclua um item definitivamente para liberar espaço.');}
function list(c){return (c.sheetTrash||[]).map(e=>({id:e.id,target:e.target,name:e.member.sheet?.name||e.member.nick,nick:e.member.nick,npc:e.target.startsWith('npc:'),deletedAt:e.deletedAt,expectedHash:hash(e)}));}
function archive(c,target,member){const items=c.sheetTrash||[];const entry={id:crypto.randomUUID(),target,deletedAt:new Date().toISOString(),member:structuredClone({nick:member.nick,sheet:member.sheet??null,rolls:member.rolls??null})};check([...items,entry]);c.sheetTrash=[...items,entry];}
function take(c,id,expectedHash,restore){const items=c.sheetTrash||[],index=items.findIndex(e=>e.id===id);if(index<0)fail('Item não encontrado na lixeira. Atualize a lista.');const e=items[index];if(hash(e)!==expectedHash)fail('O item mudou. Atualize a lixeira.');
 if(restore){
  if(c.match?.players?.[e.target])fail('Esta identidade está na partida atual. Prepare outra partida antes de restaurar.');
  if(e.target.startsWith('npc:')){c.extras??={};if(Object.hasOwn(c.extras,e.target))fail('Já existe um NPC com essa identidade.');if(Object.keys(c.extras).length>=30)fail('O save já possui 30 NPCs. Libere uma vaga antes de restaurar.');c.extras[e.target]=structuredClone(e.member);}
  else{const m=c.members[e.target];if(!m)fail('O participante original não está neste save.');if(m.sheet!=null||m.rolls!=null)fail('O participante já possui uma ficha ou dados iniciais. A restauração não substitui esses dados.');m.sheet=structuredClone(e.member.sheet);m.rolls=structuredClone(e.member.rolls);delete m.lastSheetImport;}
 }
 items.splice(index,1);c.sheetTrash=items;
}
module.exports={LIMIT,MAX_BYTES,check,list,archive,take};
