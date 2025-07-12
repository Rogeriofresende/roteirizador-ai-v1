import { useState, useEffect, useCallback } from 'react';
import { initializeManifest } from '../utils/pwa-manifest';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isSupported: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  showPrompt: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  isOffline: boolean;
  hasUpdate: boolean;
}

interface PWAActions {
  install: () => Promise<boolean>;
  update: () => Promise<void>;
  showInstallPrompt: () => void;
  dismissUpdate: () => void;
  installApp: () => Promise<boolean>;
  dismissPrompt: () => void;
  showInstallPrompt: boolean;
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    isInstalled: false,
    canInstall: false,
    showPrompt: false,
    installPrompt: null,
    isOffline: !navigator.onLine,
    hasUpdate: false
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Mover registerServiceWorker para fora do useEffect
  const registerServiceWorker = useCallback(async () => {
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
  }, []);

  // Event Handlers definidos fora do useEffect
  const handleBeforeInstallPrompt = useCallback((e: BeforeInstallPromptEvent) => {
    console.log('PWA Hook: Install prompt available');
    e.preventDefault();
    setDeferredPrompt(e);
    setState(prev => ({ 
      ...prev, 
      canInstall: true, 
      installPrompt: e 
    }));
  }, []);
  
  const handleAppInstalled = useCallback((_e: Event) => {
    console.log('PWA Hook: App installed successfully');
    setState(prev => ({ 
      ...prev, 
      isInstalled: true, 
      canInstall: false, 
      installPrompt: null 
    }));
    setDeferredPrompt(null);
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_installed', {
        event_category: 'PWA',
        event_label: 'App Installed'
      });
    }
  }, []);
  
  const handleOnline = useCallback(() => {
    console.log('PWA Hook: Connection restored');
    setState(prev => ({ ...prev, isOffline: false }));
  }, []);
  
  const handleOffline = useCallback(() => {
    console.log('PWA Hook: Connection lost');
    setState(prev => ({ ...prev, isOffline: true }));
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_offline', {
        event_category: 'PWA',
        event_label: 'Offline Usage'
      });
    }
  }, []);
  
  const handleSWUpdate = useCallback(() => {
    console.log('PWA Hook: Service worker update available');
    setState(prev => ({ ...prev, hasUpdate: true }));
  }, []);
  
  const handleVisibilityChange = useCallback(() => {
    // Remove dependency on state to avoid infinite loop
    // Check if PWA is installed by checking display-mode
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');
                       
    if (!document.hidden && isInstalled) {
      // Analytics tracking para launch
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_launched', {
          event_category: 'PWA',
          event_label: 'App Launched'
        });
      }
    }
  }, []);
  
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
    if ('serviceWorker' in navigator) {
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
  }, [handleBeforeInstallPrompt, handleAppInstalled, handleOnline, handleOffline, handleSWUpdate, handleVisibilityChange, registerServiceWorker]);
  
  const install = useCallback(async (): Promise<boolean> => {
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
      setState(prev => ({ ...prev, canInstall: false }));
    }
  }, [deferredPrompt]);
  
  const update = useCallback(async (): Promise<void> => {
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
  }, []);
  
  const showInstallPrompt = useCallback(() => {
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
  }, [deferredPrompt, install]);
  
  const dismissUpdate = useCallback(() => {
    console.log('PWA Hook: Update dismissed');
    setState(prev => ({ ...prev, hasUpdate: false }));
  }, []);
  
  // Verificar se pode fazer cache de roteiros offline (futuro)
  const canCacheScripts = useCallback((): boolean => {
    return 'caches' in window && 'serviceWorker' in navigator;
  }, []);
  
  // Salvar roteiro no cache local (futuro)
  const cacheScript = useCallback(async (script: string): Promise<boolean> => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('script-cache-v1');
        const response = new Response(script, {
          headers: { 'Content-Type': 'text/plain' }
        });
        await cache.put('current-script', response);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);
  
  // Recuperar roteiros do cache (futuro)
  const getCachedScripts = useCallback(async (): Promise<string[]> => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('script-cache-v1');
        const keys = await cache.keys();
        return keys.map(req => req.url);
      }
      return [];
    } catch {
      return [];
    }
  }, []);
  
  return {
    ...state,
    install,
    update,
    showInstallPrompt,
    dismissUpdate,
    canCacheScripts,
    cacheScript,
    getCachedScripts
  };
}; 