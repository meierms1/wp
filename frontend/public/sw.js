// Service worker with runtime caching strategies.
// Hashed JS/CSS: cache-first (immutable once deployed).
// Quiz data JSON: stale-while-revalidate (serve cached, refresh in background).
// HTML navigation: network-first (picks up deploys promptly).
// API calls are never intercepted.

const STATIC_CACHE = 'meier-static-v3';
const DATA_CACHE   = 'meier-data-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DATA_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Quiz-data JSON — stale-while-revalidate
  if (url.pathname.startsWith('/quiz-data/')) {
    e.respondWith(staleWhileRevalidate(DATA_CACHE, request));
    return;
  }

  // Hashed static assets (JS / CSS) — cache-first (immutable)
  if (/\.(js|css)$/.test(url.pathname)) {
    e.respondWith(cacheFirst(STATIC_CACHE, request));
    return;
  }

  // HTML navigation — network-first so deploys are picked up promptly
  if (request.mode === 'navigate') {
    e.respondWith(networkFirst(STATIC_CACHE, request));
  }
});

async function cacheFirst(cacheName, request) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(cacheName, request) {
  const cache      = await caches.open(cacheName);
  const cached     = await cache.match(request);
  const revalidate = fetch(request).then(r => {
    if (r.ok) cache.put(request, r.clone());
    return r;
  });
  return cached || revalidate;
}

async function networkFirst(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
