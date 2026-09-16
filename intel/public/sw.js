const CACHE='intel-shell-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const r=event.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
  if(r.mode==='navigate')return; // Never cache authenticated/document navigation.
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const hit=await cache.match(r); if(hit)return hit;
    const res=await fetch(r); if(res.ok&&/^(image|font)\//.test(res.headers.get('Content-Type')||''))cache.put(r,res.clone()); return res;
  }));
});
self.addEventListener('push',event=>{
  let data={title:'INTEL',body:'There is a new INTEL update.',url:'/dashboard'};
  try{data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,data:{url:data.url},tag:data.tag||'intel-update'}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.openWindow(event.notification.data?.url||'/dashboard'));});
