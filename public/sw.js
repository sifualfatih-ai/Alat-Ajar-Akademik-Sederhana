const CACHE_NAME = 'siasat-guru-v1-cache';
const DYNAMIC_CACHE = 'siasat-guru-v1-dynamic';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalasi & Pre-cache statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Paksa aktivasi langsung
});

// Bersihkan cache usang
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategi Stale-While-Revalidate untuk request network & asset
self.addEventListener('fetch', (event) => {
  // Lewati resource dari API (proxy Apps Script / AI)
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Caching ulang hasil network
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Fallback jika offline
      });

      // Kembalikan segera jika ada di cache (Stale), tetapi diam-diam update di background (Revalidate)
      return cachedResponse || fetchPromise;
    })
  );
});
