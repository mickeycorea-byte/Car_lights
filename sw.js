// Car Lights service worker: "lights still ON" reminders (Android Chrome needs a SW for notifications)
// and an offline copy of the page. Network first, so the phone always gets the newest page when online.
const VERSION = 'car-lights-v7-2026-10-31';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r.url, {cache: 'no-store'}).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(VERSION).then(ca => ca.put(r, c)); }
    return res;
  }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('./'))));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
