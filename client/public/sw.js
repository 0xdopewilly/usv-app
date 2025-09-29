const CACHE_NAME = 'usv-token-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Core app pages
  '/auth',
  '/home',
  '/wallet',
  '/scan',
  '/nfts',
  '/settings',
  // Icons
  '/icon-192.png',
  '/icon-512.png',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // BYPASS cache entirely for API requests and non-GET requests - let them go directly to server
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    // Let API calls and POST/PUT/DELETE requests go directly to network
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // If both network and cache fail, show offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  try {
    // Get pending transactions from IndexedDB or localStorage
    const pendingTransactions = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
    
    for (const transaction of pendingTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
          // Remove successful transaction from pending list
          const updatedPending = pendingTransactions.filter(t => t.id !== transaction.id);
          localStorage.setItem('pendingTransactions', JSON.stringify(updatedPending));
        }
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have new activity in your USV Token account',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data.url = data.url || '/';
  }

  event.waitUntil(
    self.registration.showNotification('USV Token', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Handle background fetch for large downloads
self.addEventListener('backgroundfetch', (event) => {
  if (event.tag === 'nft-metadata') {
    event.waitUntil(
      (async () => {
        try {
          const cache = await caches.open('nft-metadata');
          const records = await event.registration.matchAll();
          
          for (const record of records) {
            const response = await record.responseReady;
            if (response && response.ok) {
              await cache.put(record.request, response.clone());
            }
          }
        } catch (error) {
          console.error('Background fetch failed:', error);
        }
      })()
    );
  }
});

// Periodic background sync (for browsers that support it)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

async function syncUserData() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('cachedUserData', JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Failed to sync user data:', error);
  }
}
