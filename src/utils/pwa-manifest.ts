// Manifest PWA inline como fallback
export const manifestData = {
  "name": "Roteirar IA Pro",
  "short_name": "Roteirar",
  "description": "Gerador de Roteiros com Inteligência Artificial - Crie roteiros profissionais para YouTube, Instagram, TikTok e LinkedIn usando Google Gemini AI",
  "start_url": "./",
  "display": "standalone",
  "display_override": ["window-controls-overlay"],
  "theme_color": "#8B5CF6",
  "background_color": "#4338CA",
  "orientation": "portrait-primary",
  "scope": "./",
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
      "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9IiM4QjVDRjYiIHJ4PSI3NSIvPjx0ZXh0IHg9IjI1NiIgeT0iMjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0NCIgZmlsbD0id2hpdGUiPvCfjoU8L3RleHQ+PC9zdmc+",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE5MiIgaGVpZ2h0PSIxOTIiIGZpbGw9IiM4QjVDRjYiIHJ4PSIyOCIvPjx0ZXh0IHg9Ijk2IiB5PSIxMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iNTQiIGZpbGw9IndoaXRlIj7wn46FPC90ZXh0Pjwvc3ZnPg==",
      "sizes": "192x192", 
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
            "name": "Gerar Roteiro",
      "short_name": "Gerar", 
      "description": "Criar novo roteiro rapidamente",
      "url": "./?action=generate",
      "icons": [
        {
          "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIGZpbGw9IiMzQjgyRjYiIHJ4PSIxNCIvPjx0ZXh0IHg9IjQ4IiB5PSI1OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIyOCIgZmlsbD0id2hpdGUiPuKcqDwvdGV4dD48L3N2Zz4=",
          "sizes": "96x96"
        }
      ]
    }
  ]
};

// Função para criar manifest blob URL
export const createManifestBlob = (): string => {
  const blob = new Blob([JSON.stringify(manifestData)], {
    type: 'application/manifest+json'
  });
  return URL.createObjectURL(blob);
};

// Função para injetar manifest dinamicamente
export const injectManifest = (): void => {
  // Remover manifest existente se houver
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    existingManifest.remove();
  }

  // Criar novo link do manifest
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = createManifestBlob();
  
  // Adicionar ao head
  document.head.appendChild(manifestLink);
  
  console.log('PWA: Manifest injected dynamically');
};

// Função para verificar se manifest estático funciona
export const checkStaticManifest = async (): Promise<boolean> => {
  try {
    const response = await fetch('/manifest.json');
    return response.ok;
  } catch {
    return false;
  }
};

// Inicializar manifest (sempre dinâmico para evitar erro 401)
export const initializeManifest = async (): Promise<void> => {
  console.log('PWA: Using dynamic manifest to avoid 401 errors');
  injectManifest();
}; 