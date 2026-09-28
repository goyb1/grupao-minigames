'use strict';
// One queue per save, shared by both fields. Acquire a connection only when ready.
// Creation/season changes still use the full campaign transaction in rpg.js.
function createMatchStore(db){
 const queues=new Map();
 function enqueue(id,fn){
  const previous=queues.get(id)||Promise.resolve();
  const task=previous.catch(()=>{}).then(fn);queues.set(id,task);
  const clean=()=>{if(queues.get(id)===task)queues.delete(id);};task.then(clean,clean);return task;
 }
 return {run(id,fn,scope='friendly'){
  if(!['friendly','career'].includes(scope))throw Error('Invalid match scope');
  const career=scope==='career',field=career?"data->'career'->'match'":"data->'match'",location=career?'{career,match}':'{match}';
  return enqueue(id,async()=>{
   const client=await db.connect();
   try{
    await client.query('BEGIN');
    const r=await client.query(`SELECT data->>'owner' AS owner,
     (SELECT jsonb_object_agg(m.key,jsonb_build_object('nick',m.value->'nick')) FROM jsonb_each(data->'members') AS m) AS members,
     ${field} AS match${career?", data->'career'->'active' AS active":''}
     FROM rpg_campaigns WHERE id=$1 FOR UPDATE`,[id]);
    if(!r.rows[0])throw Object.assign(Error('Save não encontrado.'),{status:404});
    const c=r.rows[0];await fn(c);
    // Preserve every unrelated campaign field in PostgreSQL. Never acknowledge before COMMIT.
    await client.query(`UPDATE rpg_campaigns SET data=jsonb_set(jsonb_set(data,'${location}',$2::jsonb),'{updatedAt}',to_jsonb($3::text)) WHERE id=$1`,[id,JSON.stringify(c.match),new Date().toISOString()]);
    await client.query('COMMIT');return c;
   }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  });
 }};
}
module.exports={createMatchStore};
