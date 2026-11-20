const V='altay-atolye-v4';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(x=>new Request(x,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('altay-atolye-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(r.mode==='navigate'&&u.origin===location.origin){
    // önce ağ (3 sn), olmazsa önbellek: güncelleme ilk açılışta gelir, internetsiz de açılır
    e.respondWith(Promise.race([fetch(u.origin+u.pathname,{cache:'no-cache'}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp))}return res}),new Promise((_,rej)=>setTimeout(rej,3000))]).catch(()=>caches.match('index.html').then(h=>h||caches.match('./'))));
    return;}
  if(u.origin===location.origin||u.host.endsWith('fonts.googleapis.com')||u.host.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(r,{ignoreSearch:u.origin===location.origin}).then(hit=>{
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
      return hit||net;}));}
});
