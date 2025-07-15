/**
 * 📱 PWA HOOK
 * Week 7 Day 5: React hook for PWA features and installation management
 */

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  canInstall: boolean;
  installPromptEvent: BeforeInstallPromptEvent | null;
  swRegistration: ServiceWorkerRegistration | null;
  swUpdateAvailable: boolean;
}

interface PWAActions {
  showInstallPrompt: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  unregisterServiceWorker: () => Promise<void>;
  clearCache: (cacheType?: string) => Promise<void>;
  getCacheStatus: () => Promise<any>;
  cacheIdea: (idea: any) => Promise<void>;
  getCachedIdeas: () => Promise<any[]>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  registerBackgroundSync: (tag: string) => Promise<void>;
}

export const usePWA = (): PWAStatus & PWAActions => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  // Verificar se app está instalado
  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkIfInstalled();
    
    // Listener para mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkIfInstalled);
    
    return () => mediaQuery.removeEventListener('change', checkIfInstalled);
  }, []);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Gerenciar install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Registrar e gerenciar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          setSwRegistration(registration);
          
          // Verificar se há atualização disponível
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });

      // Listener para mensagens do Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_UPDATED') {
          // Cache foi atualizado
          console.log('Cache updated:', event.data.payload);
        }
      });
    }
  }, []);

  // Mostrar prompt de instalação
  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    if (!installPromptEvent) return false;

    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      
      if (outcome === 'accepted') {
        setCanInstall(false);
        setInstallPromptEvent(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }, [installPromptEvent]);

  // Atualizar Service Worker
  const updateServiceWorker = useCallback(async (): Promise<void> => {
    if (!swRegistration) return;

    try {
      await swRegistration.update();
      
      if (swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
      
      setSwUpdateAvailable(false);
    } catch (error) {
      console.error('Error updating service worker:', error);
    }
  }, [swRegistration]);

  // Desregistrar Service Worker
  const unregisterServiceWorker = useCallback(async (): Promise<void> => {
    if (!swRegistration) return;

    try {
      await swRegistration.unregister();
      setSwRegistration(null);
    } catch (error) {
      console.error('Error unregistering service worker:', error);
    }
  }, [swRegistration]);

  // Limpar cache
  const clearCache = useCallback(async (cacheType?: string): Promise<void> => {
    if (!swRegistration) return;

    try {
      const channel = new MessageChannel();
      swRegistration.active?.postMessage({
        type: 'CLEAR_CACHE',
        cacheType: cacheType || 'all'
      }, [channel.port2]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [swRegistration]);

  // Obter status do cache
  const getCacheStatus = useCallback(async (): Promise<any> => {
    if (!swRegistration) return null;

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.status);
      };
      
      swRegistration.active?.postMessage({
        type: 'GET_CACHE_STATUS'
      }, [channel.port2]);
    });
  }, [swRegistration]);

  // Cachear ideia
  const cacheIdea = useCallback(async (idea: any): Promise<void> => {
    if (!swRegistration) return;

    try {
      swRegistration.active?.postMessage({
        type: 'CACHE_IDEA',
        payload: idea
      });
    } catch (error) {
      console.error('Error caching idea:', error);
    }
  }, [swRegistration]);

  // Obter ideias em cache
  const getCachedIdeas = useCallback(async (): Promise<any[]> => {
    if (!swRegistration) return [];

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.ideas || []);
      };
      
      swRegistration.active?.postMessage({
        type: 'GET_CACHED_IDEAS'
      }, [channel.port2]);
    });
  }, [swRegistration]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  // Mostrar notificação
  const showNotification = useCallback(async (title: string, options?: NotificationOptions): Promise<void> => {
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    if (swRegistration) {
      // Usar Service Worker para notificações
      swRegistration.showNotification(title, {
        icon: '/icons/android-chrome-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      });
    } else {
      // Fallback para notificação direta
      new Notification(title, {
        icon: '/icons/android-chrome-192x192.png',
        ...options
      });
    }
  }, [swRegistration, requestNotificationPermission]);

  // Registrar background sync
  const registerBackgroundSync = useCallback(async (tag: string): Promise<void> => {
    if (!swRegistration) return;

    try {
      await swRegistration.sync.register(tag);
    } catch (error) {
      console.error('Error registering background sync:', error);
    }
  }, [swRegistration]);

  // Utilitários adicionais
  const isPWASupported = useCallback((): boolean => {
    return 'serviceWorker' in navigator && 'caches' in window;
  }, []);

  const isIOSDevice = useCallback((): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  const isAndroidDevice = useCallback((): boolean => {
    return /Android/.test(navigator.userAgent);
  }, []);

  const getInstallInstructions = useCallback((): string => {
    if (isIOSDevice()) {
      return 'Para instalar: Toque no botão de compartilhamento e selecione "Adicionar à Tela Inicial"';
    }
    if (isAndroidDevice()) {
      return 'Para instalar: Toque no menu do navegador e selecione "Instalar app"';
    }
    return 'Para instalar: Procure pelo ícone de instalação na barra de endereços';
  }, [isIOSDevice, isAndroidDevice]);

  return {
    // Status
    isInstalled,
    isStandalone,
    isOnline,
    canInstall,
    installPromptEvent,
    swRegistration,
    swUpdateAvailable,

    // Actions
    showInstallPrompt,
    updateServiceWorker,
    unregisterServiceWorker,
    clearCache,
    getCacheStatus,
    cacheIdea,
    getCachedIdeas,
    requestNotificationPermission,
    showNotification,
    registerBackgroundSync,

    // Utilities
    isPWASupported,
    isIOSDevice,
    isAndroidDevice,
    getInstallInstructions
  };
};

export default usePWA; 