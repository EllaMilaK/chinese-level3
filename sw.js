// Service Worker for 中文三册 · Chinese Book 3
// Cache-first strategy for offline use
const CACHE_NAME = 'zhongwen-3-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './lesson1.html',
  './lesson2.html',
  './lesson3.html',
  './lesson4.html',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin or CDN assets
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses for future offline use
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If offline and not cached, return a simple offline message for HTML
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return new Response('<h1>离线模式 Offline</h1><p>请先连接网络加载课程。</p>', {
            headers: {'Content-Type': 'text/html; charset=utf-8'}
          });
        }
      });
    })
  );
});
