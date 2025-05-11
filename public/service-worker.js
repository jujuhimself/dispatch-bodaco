
// Service worker for offline capabilities and performance optimization

const CACHE_NAME = 'boda-emergency-cache-v1';
const RUNTIME_CACHE = 'boda-runtime-cache';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/ambulance-icon.png',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old version of our cache
            return cacheName.startsWith('boda-') && cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Ensure the service worker takes control of all clients ASAP
  return self.clients.claim();
});

// Fetch event - respond with cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip Supabase API requests - they handle their own caching
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and refresh cache in background
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Update cache with new response if successful
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            console.log('[ServiceWorker] Fetch failed, returning cached response');
            return cachedResponse;
          });
          
        // Return cached response immediately
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache the response
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response stream so we can use one for the cache
          // and serve the other to the browser
          const responseToCache = response.clone();

          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
    })
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-data-sync') {
    event.waitUntil(syncEmergencyData());
  } else if (event.tag === 'responder-location-sync') {
    event.waitUntil(syncResponderLocations());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  // Extract notification data from the push event
  const data = event.data ? event.data.json() : {};
  
  // Show notification
  event.waitUntil(
    self.registration.showNotification(data.title || 'Emergency Alert', {
      body: data.body || 'New emergency notification',
      icon: '/ambulance-icon.png',
      badge: '/ambulance-icon.png',
      data: data.data || {},
      requireInteraction: true,
      actions: data.actions || [
        { action: 'view', title: 'View Details' },
        { action: 'respond', title: 'Respond' }
      ]
    })
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle notification action
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/emergency/' + event.notification.data.emergencyId)
    );
  } else if (event.action === 'respond') {
    event.waitUntil(
      clients.openWindow('/emergency/' + event.notification.data.emergencyId + '?action=respond')
    );
  } else {
    // If no specific action or the main notification was clicked
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Function to sync emergency data when back online
async function syncEmergencyData() {
  // Get all emergency data marked for syncing from IndexedDB
  const emergencyStore = await openIndexedDB('emergency-store');
  const pendingEmergencies = await getAllPendingItems(emergencyStore, 'emergency-sync');
  
  for (const emergency of pendingEmergencies) {
    try {
      // Try to send to server
      const response = await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergency)
      });
      
      if (response.ok) {
        // Remove from pending queue if successful
        await removeFromPendingItems(emergencyStore, 'emergency-sync', emergency.id);
      }
    } catch (error) {
      console.error('Failed to sync emergency data:', error);
      // Will be retried next time sync event fires
    }
  }
}

// Function to sync responder locations when back online
async function syncResponderLocations() {
  const locationStore = await openIndexedDB('location-store');
  const pendingLocations = await getAllPendingItems(locationStore, 'location-sync');
  
  for (const location of pendingLocations) {
    try {
      const response = await fetch('/api/responder/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      });
      
      if (response.ok) {
        await removeFromPendingItems(locationStore, 'location-sync', location.id);
      }
    } catch (error) {
      console.error('Failed to sync responder location:', error);
    }
  }
}

// Helper to open IndexedDB store
function openIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('boda-emergency-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if needed
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

// Helper to get pending items
function getAllPendingItems(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Helper to remove synced items
function removeFromPendingItems(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
