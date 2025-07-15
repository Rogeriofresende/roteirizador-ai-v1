// Service Worker para Roteirar IA PWA
// Versão 1.0.0 - Sprint 3 Implementation

const CACHE_NAME = 'roteirar-ia-v1.0.0';
const OFFLINE_CACHE = 'roteirar-ia-offline-v1.0.0';
const RUNTIME_CACHE = 'roteirar-ia-runtime-v1.0.0';

// Assets essenciais para funcionar offline
const ESSENTIAL_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/pages/BancoDeIdeias.tsx',
  '/src/components/LoadingStates.tsx',
  '/src/hooks/useIdeaCache.ts',
  '/offline.html'
];

// Assets estáticos para cache
const STATIC_ASSETS = [
  '/favicon.svg',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network First: Para APIs e dados dinâmicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: Para recursos que podem ser atualizados
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Cache Only: Para recursos offline
  CACHE_ONLY: 'cache-only',
  // Network Only: Para recursos que sempre precisam ser atualizados
  NETWORK_ONLY: 'network-only'
};

// Configuração de rotas e estratégias
const ROUTE_STRATEGIES = {
  // Assets estáticos
  '/icons/': CACHE_STRATEGIES.CACHE_FIRST,
  '/assets/': CACHE_STRATEGIES.CACHE_FIRST,
  '/favicon.svg': CACHE_STRATEGIES.CACHE_FIRST,
  
  // APIs
  '/api/': CACHE_STRATEGIES.NETWORK_FIRST,
  '/api/ideas': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/api/performance': CACHE_STRATEGIES.NETWORK_ONLY,
  
  // Páginas
  '/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/banco-de-ideias': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  
  // Recursos externos
  'https://fonts.googleapis.com': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  'https://fonts.gstatic.com': CACHE_STRATEGIES.CACHE_FIRST
};

// Install event - Cache assets essenciais
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache assets essenciais
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching essential assets');
        return cache.addAll(ESSENTIAL_ASSETS);
      }),
      
      // Cache assets estáticos
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker: Installation completed');
      // Ativar imediatamente
      self.skipWaiting();
    })
  );
});

// Activate event - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remover caches antigos
          if (cacheName !== CACHE_NAME && 
              cacheName !== OFFLINE_CACHE && 
              cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation completed');
      // Controlar todas as abas imediatamente
      return self.clients.claim();
    })
  );
});

// Fetch event - Estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests que não são GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Determinar estratégia de cache
  const strategy = determineStrategy(url);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Message event - Comunicação com a aplicação
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_IDEA':
      cacheIdea(data.payload);
      break;
      
    case 'GET_CACHED_IDEAS':
      getCachedIdeas().then(ideas => {
        event.ports[0].postMessage({ ideas });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheType);
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ status });
      });
      break;
  }
});

// Determinar estratégia de cache baseada na URL
function determineStrategy(url) {
  // Verificar rotas configuradas
  for (const [route, strategy] of Object.entries(ROUTE_STRATEGIES)) {
    if (url.pathname.startsWith(route) || url.href.startsWith(route)) {
      return strategy;
    }
  }
  
  // Estratégia padrão baseada no tipo de recurso
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.svg') || url.pathname.endsWith('.ico')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  if (url.pathname.includes('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
}

// Manipular request baseado na estratégia
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return networkOnly(request);
      
    default:
      return networkFirst(request);
  }
}

// Cache First Strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache First failed:', error);
    return getOfflineResponse(request);
  }
}

// Network First Strategy
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Network First failed:', error);
    const cached = await cache.match(request);
    return cached || getOfflineResponse(request);
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  // Revalidar em background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.error('Revalidation failed:', error);
    return cached;
  });
  
  return cached || fetchPromise;
}

// Cache Only Strategy
async function cacheOnly(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || getOfflineResponse(request);
}

// Network Only Strategy
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network Only failed:', error);
    return getOfflineResponse(request);
  }
}

// Resposta offline
function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Página HTML offline
  if (request.destination === 'document') {
    return caches.match('/offline.html');
  }
  
  // Imagem offline
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // JSON offline
  if (request.headers.get('Accept')?.includes('application/json')) {
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'Funcionalidade disponível quando online',
        cached: true 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
  
  return new Response('Offline', { status: 503 });
}

// Cache de ideias para funcionalidade offline
async function cacheIdea(idea) {
  const cache = await caches.open(OFFLINE_CACHE);
  const stored = await cache.match('/offline-ideas');
  
  let ideas = [];
  if (stored) {
    ideas = await stored.json();
  }
  
  ideas.push({
    ...idea,
    cachedAt: Date.now(),
    offline: true
  });
  
  const response = new Response(JSON.stringify(ideas), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  return cache.put('/offline-ideas', response);
}

// Recuperar ideias em cache
async function getCachedIdeas() {
  const cache = await caches.open(OFFLINE_CACHE);
  const stored = await cache.match('/offline-ideas');
  
  if (stored) {
    return await stored.json();
  }
  
  return [];
}

// Limpar cache
async function clearCache(cacheType) {
  switch (cacheType) {
    case 'all':
      const cacheNames = await caches.keys();
      return Promise.all(cacheNames.map(name => caches.delete(name)));
      
    case 'runtime':
      return caches.delete(RUNTIME_CACHE);
      
    case 'offline':
      return caches.delete(OFFLINE_CACHE);
      
    default:
      return caches.delete(CACHE_NAME);
  }
}

// Status do cache
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = {
      name,
      size: keys.length,
      keys: keys.map(key => key.url)
    };
  }
  
  return status;
}

// Background sync para sincronizar dados offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-ideas') {
    event.waitUntil(syncOfflineIdeas());
  }
});

// Sincronizar ideias offline
async function syncOfflineIdeas() {
  try {
    const ideas = await getCachedIdeas();
    const offlineIdeas = ideas.filter(idea => idea.offline);
    
    for (const idea of offlineIdeas) {
      try {
        await fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(idea)
        });
      } catch (error) {
        console.error('Failed to sync idea:', error);
      }
    }
    
    // Remover ideias sincronizadas
    const syncedIdeas = ideas.filter(idea => !idea.offline);
    const cache = await caches.open(OFFLINE_CACHE);
    const response = new Response(JSON.stringify(syncedIdeas), {
      headers: { 'Content-Type': 'application/json' }
    });
    cache.put('/offline-ideas', response);
    
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

console.log('Service Worker: Loaded and ready!'); 