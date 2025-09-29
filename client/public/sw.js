// COMPLETELY DISABLED SERVICE WORKER - ALL REQUESTS GO DIRECTLY TO NETWORK
console.log('🚫 Service Worker COMPLETELY DISABLED - All requests bypass cache');

// Immediately skip waiting and activate
self.addEventListener('install', (event) => {
  console.log('🚫 SW: Installing but doing NOTHING');
  self.skipWaiting();
});

// Clear all caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('🚫 SW: Activating and clearing ALL caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('🚫 SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('🚫 SW: All caches cleared, claiming clients');
      return self.clients.claim();
    })
  );
});

// DO NOT INTERCEPT ANY FETCH REQUESTS AT ALL
self.addEventListener('fetch', (event) => {
  console.log('🚫 SW: NOT intercepting request (letting it go to network):', event.request.url);
  // Do absolutely NOTHING - let ALL requests go directly to network
  // No event.respondWith() call means the request goes to network
});