# 👨‍💻 PWA Development Guide - Roteirar IA Pro

**Guia Técnico para Desenvolvimento Progressive Web App**

## 🎯 Objetivos

Este guia fornece instruções técnicas detalhadas para implementar e manter as funcionalidades PWA do Roteirar IA Pro.

## 🏗️ Arquitetura PWA

### Componentes Principais
```
📦 PWA Architecture
├── 📄 Web App Manifest (public/manifest.json)
├── ⚡ Service Worker (public/sw.js)
├── 🎯 PWA Hook (src/hooks/usePWA.ts)
├── 🎨 Icons & Assets (public/icons/)
├── 🔧 PWA Utils (src/utils/pwa.ts)
└── 📱 Install Component (src/components/PWAInstall.tsx)
```

### Fluxo de Funcionamento
```
1. User Access → 2. SW Register → 3. Manifest Load → 4. Install Prompt
     ↓              ↓               ↓                ↓
5. App Install ← 6. Cache Assets ← 7. Offline Ready ← 8. Native Experience
```

## 📄 Web App Manifest

### Estrutura Completa
```json
{
  "name": "Roteirar IA Pro",
  "short_name": "Roteirar",
  "description": "Gerador de Roteiros com Inteligência Artificial",
  "start_url": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay"],
  "theme_color": "#8B5CF6",
  "background_color": "#4338CA",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "pt-BR",
  "dir": "ltr",
  "categories": ["productivity", "entertainment", "business"],
  "iarc_rating_id": "",
  "edge_side_panel": {},
  "launch_handler": {
    "client_mode": "navigate-existing"
  },
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop interface"
    },
    {
      "src": "screenshots/mobile-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile interface"
    }
  ],
  "shortcuts": [
    {
      "name": "Gerar Roteiro",
      "short_name": "Gerar",
      "description": "Criar novo roteiro rapidamente",
      "url": "/?action=generate",
      "icons": [
        {
          "src": "icons/shortcut-generate.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

### Validação do Manifest
```typescript
// src/utils/pwa.ts
export const validateManifest = async (): Promise<boolean> => {
  try {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    
    // Validações obrigatórias
    const required = ['name', 'icons', 'start_url', 'display'];
    return required.every(field => manifest[field]);
  } catch (error) {
    console.error('Manifest validation failed:', error);
    return false;
  }
};
```

## ⚡ Service Worker

### Implementação Completa
```javascript
// public/sw.js
const CACHE_NAME = 'roteirar-ia-v2.0.0';
const API_CACHE = 'roteirar-api-v1.0.0';

// Assets para cache obrigatório
const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints para cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/status'
];

// Install Event
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
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
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
  );
});

// Fetch Event - Cache Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API calls - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Gemini AI calls - Network Only
  if (url.hostname.includes('generativeai')) {
    event.respondWith(networkOnly(request));
    return;
  }
  
  // Static assets - Cache First
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // HTML pages - Stale While Revalidate
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default - Network First
  event.respondWith(networkFirst(request));
});

// Cache Strategies
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, returning offline page');
    return caches.match('/offline.html');
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline.html');
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Offline - Conecte-se à internet para gerar roteiros'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || networkPromise;
}

// Background Sync (futuro)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sincronizar dados quando volta online
  console.log('SW: Background sync triggered');
}

// Push Notifications (futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova funcionalidade disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Roteirar IA Pro', options)
  );
});
```

### Registro do Service Worker
```typescript
// src/utils/pwa.ts
export const registerServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('PWA: Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('PWA: Service worker registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('PWA: Service worker registration failed:', error);
      return false;
    }
  }
  
  console.warn('PWA: Service workers not supported');
  return false;
};
```

## 🎯 React Hook para PWA

### Hook Personalizado
```typescript
// src/hooks/usePWA.ts
import { useState, useEffect } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  isSupported: boolean;
}

interface PWAActions {
  install: () => Promise<boolean>;
  update: () => Promise<void>;
  showInstallPrompt: () => void;
}

export const usePWA = (): PWAState & PWAActions => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    hasUpdate: false,
    isSupported: 'serviceWorker' in navigator
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    setState(prev => ({ ...prev, isInstalled: isStandalone }));
    
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, isInstallable: true }));
    };
    
    // Listen for successful install
    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }));
      setDeferredPrompt(null);
    };
    
    // Listen for online/offline
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));
    
    // Listen for SW updates
    const handleSWUpdate = () => setState(prev => ({ ...prev, hasUpdate: true }));
    
    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-update-available', handleSWUpdate);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);
  
  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: Install accepted');
        return true;
      } else {
        console.log('PWA: Install dismissed');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  };
  
  const update = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };
  
  const showInstallPrompt = () => {
    // Custom install prompt logic
    console.log('PWA: Showing custom install prompt');
  };
  
  return {
    ...state,
    install,
    update,
    showInstallPrompt
  };
};
```

## 📱 Componente de Instalação

### PWA Install Component
```typescript
// src/components/PWAInstall.tsx
import React from 'react';
import { usePWA } from '../hooks/usePWA';

export const PWAInstall: React.FC = () => {
  const { isInstallable, isInstalled, isOffline, hasUpdate, install, update } = usePWA();
  
  if (isInstalled && !hasUpdate && !isOffline) {
    return null; // Não mostrar nada se já instalado e tudo ok
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      right: '1rem',
      background: 'rgba(139, 92, 246, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      padding: '1rem',
      color: 'white',
      zIndex: 1000
    }}>
      {isOffline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span>⚠️</span>
          <span>Você está offline. Algumas funcionalidades podem não estar disponíveis.</span>
        </div>
      )}
      
      {hasUpdate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Nova versão disponível!</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Clique para atualizar e acessar as últimas funcionalidades.
            </div>
          </div>
          <button
            onClick={update}
            style={{
              background: 'white',
              color: '#8B5CF6',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Atualizar
          </button>
        </div>
      )}
      
      {isInstallable && !isInstalled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Instalar Roteirar IA</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Adicione à tela inicial para acesso rápido como um app nativo.
            </div>
          </div>
          <button
            onClick={install}
            style={{
              background: 'white',
              color: '#8B5CF6',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Instalar
          </button>
        </div>
      )}
    </div>
  );
};
```

## 🎨 Geração de Ícones

### Script de Geração
```javascript
// scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconSource = 'assets/icon-master.png'; // 1024x1024
const outputDir = 'public/icons';

// Criar diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Gerar ícones em todas as resoluções
sizes.forEach(async (size) => {
  try {
    await sharp(iconSource)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    
    console.log(`✅ Icon ${size}x${size} generated`);
  } catch (error) {
    console.error(`❌ Error generating ${size}x${size}:`, error);
  }
});

// Gerar Apple Touch Icon
sharp(iconSource)
  .resize(180, 180)
  .png()
  .toFile(path.join(outputDir, 'apple-touch-icon.png'))
  .then(() => console.log('✅ Apple Touch Icon generated'))
  .catch(error => console.error('❌ Apple Touch Icon error:', error));

// Gerar Favicon
sharp(iconSource)
  .resize(32, 32)
  .png()
  .toFile(path.join(outputDir, 'favicon-32x32.png'))
  .then(() => console.log('✅ Favicon generated'))
  .catch(error => console.error('❌ Favicon error:', error));
```

## 🧪 Testes PWA

### Testes Automatizados
```typescript
// src/tests/pwa.test.ts
describe('PWA Functionality', () => {
  test('Service Worker registers successfully', async () => {
    const registration = await registerServiceWorker();
    expect(registration).toBe(true);
  });
  
  test('Manifest is valid', async () => {
    const isValid = await validateManifest();
    expect(isValid).toBe(true);
  });
  
  test('Icons are available', async () => {
    const icons = [192, 512];
    for (const size of icons) {
      const response = await fetch(`/icons/icon-${size}x${size}.png`);
      expect(response.ok).toBe(true);
    }
  });
  
  test('Cache strategy works', async () => {
    // Test cache first strategy
    // Test network first strategy
    // Test offline fallback
  });
});
```

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lhci:
    name: Lighthouse
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install && npm run build
      - run: npm install -g @lhci/cli@0.12.x
      - run: lhci autorun
```

## 📊 Métricas e Analytics

### PWA Analytics
```typescript
// src/utils/analytics.ts
export const trackPWAEvents = () => {
  // Install event
  window.addEventListener('appinstalled', () => {
    gtag('event', 'pwa_installed', {
      event_category: 'PWA',
      event_label: 'App Installed'
    });
  });
  
  // Launch event
  if (window.matchMedia('(display-mode: standalone)').matches) {
    gtag('event', 'pwa_launched', {
      event_category: 'PWA',
      event_label: 'App Launched'
    });
  }
  
  // Offline usage
  window.addEventListener('offline', () => {
    gtag('event', 'pwa_offline', {
      event_category: 'PWA',
      event_label: 'Offline Usage'
    });
  });
};
```

## 🔧 Troubleshooting

### Debug Commands
```javascript
// Console commands para debug
console.log('PWA Debug Commands:');
console.log('1. navigator.serviceWorker.getRegistrations()');
console.log('2. caches.keys()');
console.log('3. window.matchMedia("(display-mode: standalone)").matches');

// Verificar se está rodando como PWA
const isPWA = window.matchMedia('(display-mode: standalone)').matches;
console.log('Is PWA:', isPWA);

// Verificar cache
caches.keys().then(keys => console.log('Cache keys:', keys));

// Force update SW
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg?.waiting) {
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
});
```

---

**Próximos Passos**:
1. ✅ Implementar manifest.json
2. ✅ Criar service worker
3. ✅ Adicionar PWA hook
4. 📋 Gerar ícones
5. 📋 Testar instalação
6. 📋 Deploy e monitoramento 