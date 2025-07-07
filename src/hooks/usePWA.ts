import { useState, useEffect } from 'react';
import { initializeManifest } from '../utils/pwa-manifest';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  isSupported: boolean;
  installPromptEvent: any;
}

interface PWAActions {
  install: () => Promise<boolean>;
  update: () => Promise<void>;
  showInstallPrompt: () => void;
  dismissUpdate: () => void;
}

export const usePWA = (): PWAState & PWAActions => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    hasUpdate: false,
    isSupported: 'serviceWorker' in navigator,
    installPromptEvent: null
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    console.log('PWA Hook: Initializing...');
    
    // Verificar se está rodando como PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setState(prev => ({ 
      ...prev, 
      isInstalled: isStandalone 
    }));
    
    console.log('PWA Hook: Is installed?', isStandalone);
    
    // Event Handlers
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Hook: Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ 
        ...prev, 
        isInstallable: true,
        installPromptEvent: e
      }));
    };
    
    const handleAppInstalled = () => {
      console.log('PWA Hook: App installed successfully');
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        isInstallable: false 
      }));
      setDeferredPrompt(null);
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_installed', {
          event_category: 'PWA',
          event_label: 'App Installed'
        });
      }
    };
    
    const handleOnline = () => {
      console.log('PWA Hook: Connection restored');
      setState(prev => ({ ...prev, isOffline: false }));
    };
    
    const handleOffline = () => {
      console.log('PWA Hook: Connection lost');
      setState(prev => ({ ...prev, isOffline: true }));
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_offline', {
          event_category: 'PWA',
          event_label: 'Offline Usage'
        });
      }
    };
    
    const handleSWUpdate = () => {
      console.log('PWA Hook: Service worker update available');
      setState(prev => ({ ...prev, hasUpdate: true }));
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isInstalled) {
        // Analytics tracking para launch
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_launched', {
            event_category: 'PWA',
            event_label: 'App Launched'
          });
        }
      }
    };
    
    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sw-update-available', handleSWUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initialize manifest (static or dynamic)
    initializeManifest();
    
    // Register service worker se suportado
    if (state.isSupported) {
      registerServiceWorker();
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleSWUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  const registerServiceWorker = async () => {
    try {
      console.log('PWA Hook: Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('PWA Hook: Service worker registered:', registration);
      
      // Verificar por updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              console.log('PWA Hook: New version available');
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          });
        }
      });
      
      // Verificar update na ativação
      if (registration.waiting) {
        window.dispatchEvent(new CustomEvent('sw-update-available'));
      }
      
      return registration;
    } catch (error: unknown) {
      console.error('PWA Hook: Service worker registration failed:', error);
      return null;
    }
  };
  
  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('PWA Hook: No install prompt available');
      return false;
    }
    
    try {
      console.log('PWA Hook: Triggering install prompt...');
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA Hook: Install prompt result:', outcome);
      
      if (outcome === 'accepted') {
        console.log('PWA Hook: Install accepted by user');
        return true;
      } else {
        console.log('PWA Hook: Install dismissed by user');
        return false;
      }
    } catch (error: unknown) {
      console.error('PWA Hook: Install failed:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
      setState(prev => ({ ...prev, isInstallable: false }));
    }
  };
  
  const update = async (): Promise<void> => {
    try {
      console.log('PWA Hook: Updating service worker...');
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration?.waiting) {
          // Enviar mensagem para skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Aguardar um pouco e recarregar
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          // Forçar update
          registration?.update();
          window.location.reload();
        }
      }
    } catch (error: unknown) {
      console.error('PWA Hook: Update failed:', error);
    }
  };
  
  const showInstallPrompt = () => {
    console.log('PWA Hook: Showing custom install prompt');
    
    // Aqui podemos implementar um prompt customizado
    // Por exemplo, mostrar um modal explicando os benefícios
    
    if (deferredPrompt) {
      install();
    } else {
      // Mostrar instruções manuais baseadas no browser/device
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        instructions = 'No Safari: toque no ícone de compartilhar e selecione "Adicionar à Tela de Início"';
      } else if (userAgent.includes('android')) {
        instructions = 'No Chrome: toque nos 3 pontos do menu e selecione "Instalar app"';
      } else {
        instructions = 'No navegador: procure pelo ícone de instalação na barra de endereço';
      }
      
      console.log('PWA Hook: Manual install instructions:', instructions);
      alert(`Para instalar o app:\n\n${instructions}`);
    }
  };
  
  const dismissUpdate = () => {
    console.log('PWA Hook: Update dismissed');
    setState(prev => ({ ...prev, hasUpdate: false }));
  };
  
  // Verificar se pode fazer cache de roteiros offline (futuro)
  const canCacheScripts = (): boolean => {
    return 'caches' in window && 'serviceWorker' in navigator;
  };
  
  // Salvar roteiro no cache local (futuro)
  const cacheScript = async (script: any): Promise<boolean> => {
    try {
      if (!canCacheScripts()) return false;
      
      const cache = await caches.open('roteirar-scripts-v1');
      const response = new Response(JSON.stringify(script), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      await cache.put(`/script/${script.id}`, response);
      console.log('PWA Hook: Script cached:', script.id);
      return true;
    } catch (error: unknown) {
      console.error('PWA Hook: Failed to cache script:', error);
      return false;
    }
  };
  
  // Recuperar roteiros do cache (futuro)
  const getCachedScripts = async (): Promise<any[]> => {
    try {
      if (!canCacheScripts()) return [];
      
      const cache = await caches.open('roteirar-scripts-v1');
      const keys = await cache.keys();
      
      const scripts = await Promise.all(
        keys.map(async (key) => {
          const response = await cache.match(key);
          return response ? await response.json() : null;
        })
      );
      
      return scripts.filter(Boolean);
    } catch (error: unknown) {
      console.error('PWA Hook: Failed to get cached scripts:', error);
      return [];
    }
  };
  
  return {
    ...state,
    install,
    update,
    showInstallPrompt,
    dismissUpdate
  };
}; 