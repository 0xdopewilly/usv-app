// Service Worker - Notifications enabled, caching disabled
console.log('✅ Service Worker - Push notifications enabled, cache disabled');

// Immediately skip waiting and activate
self.addEventListener('install', (event) => {
  console.log('✅ SW: Installing');
  self.skipWaiting();
});

// Clear all caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activating and clearing ALL caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('✅ SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ SW: All caches cleared, claiming clients');
      return self.clients.claim();
    })
  );
});

// DO NOT INTERCEPT FETCH REQUESTS - Let all requests go to network
self.addEventListener('fetch', (event) => {
  // Do nothing - let ALL requests go directly to network
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 SW: Push notification received');
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.warn('🔔 SW: Failed to parse push data as JSON, using text fallback', error);
    data = { body: event.data ? event.data.text() : 'You have a new notification' };
  }
  
  const title = data.title || 'USV Token';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: data,
    tag: data.tag || 'usv-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 SW: Notification clicked');
  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});