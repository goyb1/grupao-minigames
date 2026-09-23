'use strict';
const crypto=require('crypto');
// Includes clock-only transitions and restart state, even without a new command revision.
function token(m,now=Date.now()){
 if(!m||!m.id)return 'empty';
 const ended=m.status==='playing'&&!m.pending&&(m.elapsed+(m.running?Math.max(0,now-m.anchor):0)>=900000);
 return crypto.createHash('sha256').update(JSON.stringify([m.id,m.rev,m.status,m.half,m.elapsed,m.anchor,m.running,m.restarted,!!ended])).digest('hex');
}
module.exports={token};
