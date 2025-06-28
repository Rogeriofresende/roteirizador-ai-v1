// PWA Manifest utilities with corrected URL generation
export const generateManifestData = () => {
  // Get current origin to build absolute URLs
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    "name": "Roteirar IA Pro",
    "short_name": "Roteirar",
    "description": "Gerador de Roteiros com Inteligência Artificial - Crie roteiros profissionais para YouTube, Instagram, TikTok e LinkedIn usando Google Gemini AI",
    "start_url": `${baseUrl}/`,
    "display": "standalone",
    "display_override": ["window-controls-overlay"],
    "theme_color": "#8B5CF6",
    "background_color": "#4338CA",
    "orientation": "portrait-primary",
    "scope": `${baseUrl}/`,
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
        "src": `${baseUrl}/icons/icon-512x512.png`,
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": `${baseUrl}/icons/icon-192x192.png`,
        "sizes": "192x192", 
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": `${baseUrl}/icons/icon-384x384.png`,
        "sizes": "384x384",
        "type": "image/png",
        "purpose": "any"
      }
    ],
    "shortcuts": [
      {
        "name": "Gerar Roteiro",
        "short_name": "Gerar", 
        "description": "Criar novo roteiro rapidamente",
        "url": `${baseUrl}/generator`,
        "icons": [
          {
            "src": `${baseUrl}/icons/shortcut-generate.png`,
            "sizes": "96x96",
            "type": "image/png"
          }
        ]
      }
    ]
  };
};

// Fallback manifest data for server-side or when window is undefined
export const staticManifestData = {
  "name": "Roteirar IA Pro",
  "short_name": "Roteirar",
  "description": "Gerador de Roteiros com Inteligência Artificial",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#8B5CF6",
  "background_color": "#4338CA",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
};

// Função para criar manifest blob URL com URLs corretas
export const createManifestBlob = (): string => {
  try {
    const manifestData = generateManifestData();
    
    // Log para debug
    console.log('PWA: Generated manifest with base URL:', manifestData.start_url);
    
    const blob = new Blob([JSON.stringify(manifestData, null, 2)], {
      type: 'application/manifest+json'
    });
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('PWA: Error creating manifest blob:', error);
    
    // Fallback to static data
    const blob = new Blob([JSON.stringify(staticManifestData, null, 2)], {
      type: 'application/manifest+json'
    });
    
    return URL.createObjectURL(blob);
  }
};

// Função para injetar manifest dinamicamente com validação
export const injectManifest = (): void => {
  try {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') {
      console.warn('PWA: Cannot inject manifest - not in browser environment');
      return;
    }

    // Remover manifest existente se houver
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
      console.log('PWA: Removed existing manifest');
    }

    // Criar novo link do manifest
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = createManifestBlob();
    
    // Adicionar atributos para debug
    manifestLink.setAttribute('data-injected', 'true');
    manifestLink.setAttribute('data-timestamp', new Date().toISOString());
    
    // Adicionar ao head
    document.head.appendChild(manifestLink);
    
    console.log('PWA: Manifest injected successfully', {
      href: manifestLink.href,
      timestamp: manifestLink.getAttribute('data-timestamp')
    });
  } catch (error) {
    console.error('PWA: Failed to inject manifest:', error);
  }
};

// Função para verificar se manifest estático funciona
export const checkStaticManifest = async (): Promise<boolean> => {
  try {
    const response = await fetch('/manifest.json');
    const isOk = response.ok;
    
    console.log('PWA: Static manifest check:', {
      status: response.status,
      ok: isOk,
      url: response.url
    });
    
    return isOk;
  } catch (error) {
    console.log('PWA: Static manifest not available:', error.message);
    return false;
  }
};

// Função para validar URLs do manifest
export const validateManifestUrls = (manifest: any): boolean => {
  try {
    // Verificar start_url
    if (manifest.start_url) {
      new URL(manifest.start_url, window.location.origin);
    }
    
    // Verificar scope
    if (manifest.scope) {
      new URL(manifest.scope, window.location.origin);
    }
    
    // Verificar shortcuts
    if (manifest.shortcuts) {
      manifest.shortcuts.forEach((shortcut: any) => {
        if (shortcut.url) {
          new URL(shortcut.url, window.location.origin);
        }
      });
    }
    
    console.log('PWA: Manifest URLs validation passed');
    return true;
  } catch (error) {
    console.error('PWA: Manifest URLs validation failed:', error);
    return false;
  }
};

// Inicializar manifest com estratégia inteligente
export const initializeManifest = async (): Promise<void> => {
  try {
    console.log('PWA: Initializing manifest...');
    
    // Tentar usar manifest estático primeiro
    const staticWorks = await checkStaticManifest();
    
    if (staticWorks) {
      console.log('PWA: Using static manifest from /manifest.json');
      return;
    }
    
    // Fallback para manifest dinâmico
    console.log('PWA: Using dynamic manifest to avoid 401 errors');
    
    // Verificar se o manifest gerado tem URLs válidas
    const manifestData = generateManifestData();
    const isValid = validateManifestUrls(manifestData);
    
    if (isValid) {
      injectManifest();
      console.log('PWA: Dynamic manifest initialized successfully');
    } else {
      console.error('PWA: Generated manifest has invalid URLs, using static fallback');
      // Injetar fallback
      const blob = new Blob([JSON.stringify(staticManifestData, null, 2)], {
        type: 'application/manifest+json'
      });
      
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = URL.createObjectURL(blob);
      document.head.appendChild(manifestLink);
    }
  } catch (error) {
    console.error('PWA: Failed to initialize manifest:', error);
  }
};

// Export do manifest data para compatibilidade
export const manifestData = staticManifestData;
