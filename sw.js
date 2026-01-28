const CACHE_NAME = 'kiosk-v7-final';

self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // HTML: Network First (Critical for updates)
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Assets: Stale-While-Revalidate (Fast load)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(resp => {
        caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
        return resp;
      });
      return cached || fetched;
    })
  );
});
