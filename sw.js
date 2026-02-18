const CACHE_NAME = 'pixel-calc-v5'; // <--- Change this number (v2, v3) to force update!
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Forces new SW to take over immediately
});

// 2. Activate Event (Clean up old caches)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Take control of all open tabs
});

// 3. Fetch Event (The "Network First" Strategy for HTML)
// We want index.html to always be fresh if possible.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // If online, return response AND cache it for later
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // If offline, return the cached version
        return caches.match(e.request);
      })
  );
});
