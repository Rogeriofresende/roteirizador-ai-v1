/**
 * 📱 ENHANCED SERVICE WORKER
 * Week 7 Day 5: Advanced PWA service worker with intelligent caching and background sync
 */

// =============================================================================
// SERVICE WORKER CONFIGURATION
// =============================================================================

const CACHE_NAME = 'roteirar-ia-v7.5';
const STATIC_CACHE = 'roteirar-static-v7.5';
const DYNAMIC_CACHE = 'roteirar-dynamic-v7.5';
const API_CACHE = 'roteirar-api-v7.5';

// Cache strategies by content type
const CACHE_STRATEGIES = {
  static: ['/', '/index.html', '/manifest.json', '/robots.txt'],
  assets: ['/assets/', '/icons/', '/images/'],
  api: ['/api/', 'https://api.gemini.com/', 'https://api.openai.com/'],
  dynamic: ['pages', 'components', 'services']
};

// Network-first resources (always need fresh data)
const NETWORK_FIRST = [
  '/api/auth/',
  '/api/projects/',
  '/api/analytics/',
  'https://api.gemini.com/v1/',
  'https://api.openai.com/v1/'
];

// Cache-first resources (can be stale)
const CACHE_FIRST = [
  '/assets/',
  '/icons/',
  '/static/',
  '.woff2',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp'
];

// =============================================================================
// INSTALLATION & ACTIVATION
// =============================================================================

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing service worker v7.5');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CACHE_STRATEGIES.static);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating service worker v7.5');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// =============================================================================
// FETCH HANDLING WITH INTELLIGENT STRATEGIES
// =============================================================================

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine caching strategy
  if (isNetworkFirst(request.url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isCacheFirst(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    event.respondWith(networkFallingBackToCacheStrategy(request));
  }
});

// =============================================================================
// CACHING STRATEGIES
// =============================================================================

async function networkFirstStrategy(request: Request): Promise<Response> {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return getOfflineFallback(request);
  }
}

async function cacheFirstStrategy(request: Request): Promise<Response> {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

async function staleWhileRevalidateStrategy(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Start fetching fresh data in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors for stale-while-revalidate
    return null;
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  try {
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    // Network failed and no cache
  }
  
  return getOfflineFallback(request);
}

async function networkFallingBackToCacheStrategy(request: Request): Promise<Response> {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return getOfflineFallback(request);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isNetworkFirst(url: string): boolean {
  return NETWORK_FIRST.some(pattern => url.includes(pattern));
}

function isCacheFirst(url: string): boolean {
  return CACHE_FIRST.some(pattern => url.includes(pattern));
}

function isAPIRequest(url: string): boolean {
  return url.includes('/api/') || 
         url.includes('api.gemini.com') || 
         url.includes('api.openai.com');
}

async function getOfflineFallback(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // For HTML pages, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
  }
  
  // For API requests, return offline data if available
  if (isAPIRequest(request.url)) {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'Você está offline. Alguns recursos podem não estar disponíveis.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  // Generic offline response
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// =============================================================================
// BACKGROUND SYNC
// =============================================================================

self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-analytics') {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === 'background-projects') {
    event.waitUntil(syncProjects());
  } else if (event.tag === 'background-user-data') {
    event.waitUntil(syncUserData());
  }
});

async function syncAnalytics(): Promise<void> {
  try {
    const pendingAnalytics = await getStoredAnalytics();
    
    for (const analytics of pendingAnalytics) {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analytics)
        });
        
        // Remove from storage after successful sync
        await removeStoredAnalytics(analytics.id);
      } catch (error) {
        console.log('[SW] Failed to sync analytics:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Background analytics sync failed:', error);
  }
}

async function syncProjects(): Promise<void> {
  try {
    const pendingProjects = await getStoredProjects();
    
    for (const project of pendingProjects) {
      try {
        const response = await fetch('/api/projects', {
          method: project.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project.data)
        });
        
        if (response.ok) {
          await removeStoredProject(project.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync project:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Background projects sync failed:', error);
  }
}

async function syncUserData(): Promise<void> {
  try {
    const pendingUserData = await getStoredUserData();
    
    for (const userData of pendingUserData) {
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        await removeStoredUserData(userData.id);
      } catch (error) {
        console.log('[SW] Failed to sync user data:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Background user data sync failed:', error);
  }
}

// =============================================================================
// INDEXEDDB HELPERS
// =============================================================================

async function getStoredAnalytics(): Promise<any[]> {
  // Implementation would use IndexedDB to get pending analytics
  return [];
}

async function removeStoredAnalytics(id: string): Promise<void> {
  // Implementation would remove analytics from IndexedDB
}

async function getStoredProjects(): Promise<any[]> {
  // Implementation would use IndexedDB to get pending projects
  return [];
}

async function removeStoredProject(id: string): Promise<void> {
  // Implementation would remove project from IndexedDB
}

async function getStoredUserData(): Promise<any[]> {
  // Implementation would use IndexedDB to get pending user data
  return [];
}

async function removeStoredUserData(id: string): Promise<void> {
  // Implementation would remove user data from IndexedDB
}

// =============================================================================
// PUSH NOTIFICATIONS
// =============================================================================

self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }
  
  const options = {
    body: 'Você tem novidades no Roteirar IA!',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver agora',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/close.png'
      }
    ]
  };
  
  try {
    const data = event.data.json();
    options.body = data.message || options.body;
    
    if (data.title) {
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    }
  } catch (error) {
    event.waitUntil(
      self.registration.showNotification('Roteirar IA', options)
    );
  }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// =============================================================================
// MESSAGE HANDLING
// =============================================================================

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'UPDATE_CACHE_STRATEGY') {
    updateCacheStrategy(event.data.strategy);
  } else if (event.data && event.data.type === 'CACHE_ANALYTICS') {
    cacheAnalyticsData(event.data.data);
  } else if (event.data && event.data.type === 'CACHE_PROJECT') {
    cacheProjectData(event.data.data);
  }
});

function updateCacheStrategy(strategy: string): void {
  console.log('[SW] Updating cache strategy to:', strategy);
  // Implementation would update caching behavior based on strategy
}

function cacheAnalyticsData(data: any): void {
  // Implementation would store analytics data for background sync
}

function cacheProjectData(data: any): void {
  // Implementation would store project data for background sync
} 