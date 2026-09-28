'use strict';
fetch('/api/runtime').then(r=>r.json()).then(data=>{if(!data.testMode)return;const banner=document.createElement('aside');banner.className='test-environment';banner.textContent='v'+data.version+' • AMBIENTE DE TESTE LOCAL • Dados separados do site real • Login: goyb / teste123';document.body.prepend(banner);}).catch(()=>{});
