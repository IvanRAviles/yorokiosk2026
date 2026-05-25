const CACHE_NAME = 'restaurant-kiosk-template-v3';
const PRECACHE_ASSETS = [
  "./index.html",
  "./menu.html",
  "./ajustes.html",
  "./assets/css/styles.css",
  "./assets/logo-mark.png",
  "./js/supabase.js",
  "./js/pwa.js",
  "./manifest.webmanifest"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key === CACHE_NAME ? null : caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Never cache Supabase API or realtime traffic.
  if (url.hostname.includes('supabase.co')) return;

  // Network-first for pages so updates appear quickly.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  // Same-origin static assets: stale while revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => cached);

        return cached || fetched;
      })
    );
  }
});
