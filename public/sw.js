const CACHE_NAME = 'rabt-pwa-v2';

// Critical static shell resources to precache immediately
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/login',
  '/register',
  '/settings'
];

// Service Worker Install — Precache critical application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Service Worker Activate — Clean up obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Service Worker Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Do not intercept non-GET requests or requests to Supabase API / remote backends
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass API / Supabase calls from service worker caching
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Strategy 1: Page Navigation (HTML documents) — Network First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const rootCache = await caches.match('/');
          if (rootCache) return rootCache;
          return new Response(
            '<!DOCTYPE html><html><head><title>RABT - Offline</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family:system-ui;text-align:center;padding:3rem 1rem;"><h1>Offline Mode Active</h1><p>RABT is running offline. Your memorization progress is safely stored locally.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // Strategy 2: Static Assets, Fonts, Scripts, Styles (Cache-First with Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Asynchronously update cache in background
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {/* Ignore background fetch failure */});

        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Cache valid basic & CORS responses (fonts, Next.js bundles, icons)
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Skip waiting message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
