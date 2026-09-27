'use strict';
// Queue before acquiring a database connection: one busy save must not occupy the pool.
function createMatchStore(db){
 const queues=new Map();
 function enqueue(id,fn){const previous=queues.get(id)||Promise.resolve();const task=previous.catch(()=>{}).then(fn);queues.set(id,task);const clean=()=>{if(queues.get(id)===task)queues.delete(id);};task.then(clean,clean);return task;}
 return {run(id,fn){return enqueue(id,async()=>{
  const client=await db.connect();
  try{
   await client.query('BEGIN');
   const r=await client.query("SELECT data->>'owner' AS owner, (SELECT jsonb_object_agg(m.key,jsonb_build_object('nick',m.value->'nick')) FROM jsonb_each(data->'members') AS m) AS members, data->'match' AS match FROM rpg_campaigns WHERE id=$1 FOR UPDATE",[id]);
   if(!r.rows[0])throw Object.assign(Error('Save não encontrado.'),{status:404});
   const c=r.rows[0];fn(c);
   await client.query("UPDATE rpg_campaigns SET data=jsonb_set(jsonb_set(data,'{match}',$2::jsonb),'{updatedAt}',to_jsonb($3::text)) WHERE id=$1",[id,JSON.stringify(c.match),new Date().toISOString()]);
   await client.query('COMMIT');return c;
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
 });}};
}
module.exports={createMatchStore};
