/**
 * 🔧 PWA Detection Utilities
 * Utilitários para detecção real de status PWA
 */

/**
 * Detecta se o app está rodando como PWA instalado
 */
export const isPWAInstalled = (): boolean => {
  // Método 1: Verifica display-mode CSS
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Método 2: Verifica navigator.standalone (iOS Safari)
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Método 3: Verifica se foi iniciado via PWA (Android Chrome)
  if (window.location.search.includes('utm_source=pwa')) {
    return true;
  }
  
  // Método 4: Verifica propriedades específicas do PWA
  if (document.referrer.includes('android-app://')) {
    return true;
  }
  
  return false;
};

/**
 * Detecta se PWA pode ser instalado
 */
export const isPWAInstallable = (): boolean => {
  // Verifica se há um prompt de instalação disponível
  return !!(window as any).deferredInstallPrompt || 
         // Verifica se beforeinstallprompt foi disparado
         'onbeforeinstallprompt' in window;
};

/**
 * Detecta capacidades PWA específicas
 */
export const getPWACapabilities = () => {
  return {
    isInstalled: isPWAInstalled(),
    isInstallable: isPWAInstallable(),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    isWebApp: (window.navigator as any).standalone === true,
    supportsNotifications: 'Notification' in window,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsPushManager: 'PushManager' in window,
  };
};

export default {
  isPWAInstalled,
  isPWAInstallable,
  getPWACapabilities,
};
