const CACHE='monaco-v2';
const ASSETS=['index.html','servicios.html','citas.html','equipo.html','contacto.html','cuenta.html','css/styles.css','js/data.js','js/shared.js','js/home.js','js/servicios.js','js/citas.js','js/equipo.js','js/contacto.js','js/cuenta.js','icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// red primero, caché como respaldo offline
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
// Base para Web Push (fase backend real)
self.addEventListener('push',e=>{const d=e.data?e.data.json():{title:'Monaco',body:''};e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'icon.svg'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('cuenta.html#avisos'))});
