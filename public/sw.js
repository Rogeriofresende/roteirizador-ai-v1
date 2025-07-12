// Service Worker para Roteirar IA Pro v2.0.0
const CACHE_NAME = 'roteirar-ia-v2.0.0';
const API_CACHE = 'roteirar-api-v1.0.0';

// Assets para cache obrigatório (Core files)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Arquivos que serão cached quando acessados
const CACHE_ON_ACCESS = [
  '/icons/',
  '/screenshots/',
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp'
];

// API endpoints para cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/status'
];

console.log('SW: Roteirar IA Pro Service Worker v2.0.0 loading...');

// Install Event - Cache recursos essenciais
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Install failed:', error);
      })
  );
});

// Activate Event - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Manter apenas o cache atual
              return cacheName !== CACHE_NAME && cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('SW: Claiming clients');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('SW: Activate failed:', error);
      })
  );
});

// Fetch Event - Estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Apenas interceptar requests GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Vite development assets in development mode
  if (url.hostname === 'localhost' && (
    url.pathname.includes('@vite/client') ||
    url.pathname.includes('@react-refresh') ||
    url.pathname.includes('node_modules/vite/') ||
    url.searchParams.has('t') || // Vite timestamp queries
    url.pathname.includes('.tsx') ||
    url.pathname.includes('.ts') ||
    url.pathname.includes('src/')
  )) {
    // Let Vite handle these requests directly
    return;
  }
  
  // API calls do próprio app - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // Chamadas para Gemini AI - Network Only (sempre online)
  if (url.hostname.includes('generativeai') || url.hostname.includes('googleapis')) {
    event.respondWith(networkOnly(request));
    return;
  }
  
  // Chamadas para CDNs externos - Cache First
  if (url.hostname !== self.location.hostname) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Assets estáticos (JS, CSS, imagens) - Cache First
  if (shouldCacheAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Páginas HTML - Stale While Revalidate
  if (request.destination === 'document' || url.pathname === '/') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default - Network First
  event.respondWith(networkFirst(request));
});

// Helper: Verificar se deve fazer cache do asset
function shouldCacheAsset(pathname) {
  return CACHE_ON_ACCESS.some(pattern => {
    if (pattern.startsWith('.')) {
      return pathname.endsWith(pattern);
    }
    return pathname.includes(pattern);
  });
}

// Strategy: Cache First (para assets estáticos)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('SW: Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('SW: Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('SW: Cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed for:', request.url, error);
    
    // Retornar fallback para imagens
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#8B5CF6"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    return await caches.match('/offline.html') || new Response('Offline');
  }
}

// Strategy: Network First (para APIs e conteúdo dinâmico)
async function networkFirst(request, cacheName = CACHE_NAME) {
  try {
    console.log('SW: Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('SW: Updated cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('SW: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Fallback para páginas
    if (request.destination === 'document') {
      return await caches.match('/') || new Response('Offline - Conecte-se à internet');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Strategy: Network Only (para Gemini AI)
async function networkOnly(request) {
  try {
    console.log('SW: Network only for:', request.url);
    return await fetch(request);
  } catch (error) {
    console.log('SW: Network only failed:', request.url, error);
    
    return new Response(JSON.stringify({
      error: 'Offline - Conecte-se à internet para gerar roteiros',
      status: 'offline',
      message: 'A geração de roteiros requer conexão com a internet'
    }), {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// Strategy: Stale While Revalidate (para páginas)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Buscar nova versão em background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        console.log('SW: Background update:', request.url);
      }
      return networkResponse;
    })
    .catch(() => {
      console.log('SW: Background update failed:', request.url);
      return cachedResponse;
    });
  
  // Retornar cache imediatamente se disponível, senão aguardar network
  return cachedResponse || networkPromise;
}

// Background Sync (para funcionalidade futura)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincronizar dados quando volta online
    console.log('SW: Performing background sync...');
    
    // Aqui poderiamos sincronizar roteiros salvos localmente
    // com servidor quando volta online
    
  } catch (error) {
    console.error('SW: Background sync failed:', error);
  }
}

// Push Notifications (para funcionalidade futura)
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova funcionalidade disponível no Roteirar IA!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: '/icons/icon-512x512.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: Math.random()
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-96x96.png'
      }
    ],
    requireInteraction: false,
    tag: 'roteirar-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification('Roteirar IA Pro', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message Handler (para comunicação com app)
self.addEventListener('message', (event) => {
  console.log('SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error Handler
self.addEventListener('error', (event) => {
  console.error('SW: Error occurred:', event.error);
});

// Unhandled Rejection Handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Unhandled promise rejection:', event.reason);
});

console.log('SW: Roteirar IA Pro Service Worker v2.0.0 loaded successfully!'); 