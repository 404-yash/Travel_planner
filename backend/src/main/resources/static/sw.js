const CACHE_NAME = 'journey-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Stale-while-revalidate for assets
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then(networkRes => {
            if (networkRes.status === 200) cache.put(req, networkRes.clone());
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network first with cache fallback for navigation and trip queries
  if (req.mode === 'navigate' || url.pathname.startsWith('/trip') || url.pathname.startsWith('/api/bookings/')) {
    event.respondWith(
      fetch(req)
        .then(networkRes => {
          if (networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          if (req.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response(JSON.stringify({ error: 'Offline mode active' }), {
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
  }
});
