/**
 * 📱 PWA HOOK
 * Week 7 Day 5: React hook for PWA features and installation management
 */

import { useEffect, useState, useCallback } from 'react';
import { PWAInstallManager } from '../services/pwaInstallManager';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface UsePWAReturn {
  isInstalled: boolean;
  canInstall: boolean;
  isStandalone: boolean;
  capabilities: any;
  metrics: any;
  installReadinessScore: number;
  promptInstall: () => Promise<boolean>;
  showInstallInstructions: () => void;
  isSupported: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function usePWA(): UsePWAReturn {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [capabilities, setCapabilities] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [installReadinessScore, setInstallReadinessScore] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // ✅ PERFORMANCE OPTIMIZATION: Stable updatePWAState with useCallback
  const updatePWAState = useCallback(() => {
    try {
      setIsInstalled(PWAInstallManager.isInstalled());
      setCanInstall(PWAInstallManager.canInstall());
      setCapabilities(PWAInstallManager.getCapabilities());
      setMetrics(PWAInstallManager.getMetrics());
      setInstallReadinessScore(PWAInstallManager.getInstallReadinessScore());
      
      const caps = PWAInstallManager.getCapabilities();
      setIsStandalone(caps.isStandalone);
    } catch (error) {
      logger.error('Failed to update PWA state', { error }, 'PWA');
    }
  }, []); // ✅ FIXED: Empty dependency array to prevent loops

  // Initialize PWA manager
  useEffect(() => {
    const initializePWA = async () => {
      try {
        const success = await PWAInstallManager.initialize();
        if (success) {
          updatePWAState();
          setIsSupported(true);
          
          logger.info('PWA hook initialized', {}, 'PWA');
        }
      } catch (error) {
        logger.error('Failed to initialize PWA', { error }, 'PWA');
      }
    };

    initializePWA();

    // Cleanup on unmount
    return () => {
      PWAInstallManager.cleanup();
    };
  }, []); // ✅ FIXED: Empty dependency array

  // ✅ OPTIMIZATION: Separate effect for event listeners to prevent cleanup issues
  useEffect(() => {
    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // App installation detection
    const handleAppInstalled = () => {
      updatePWAState();
    };
    
    // Before install prompt detection
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      updatePWAState();
    };

    // Service worker update detection
    const handleServiceWorkerUpdate = () => {
      setUpdateAvailable(true);
    };

    // Display mode changes
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      updatePWAState();
    };

    // Add all event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);
    }
    
    standaloneQuery.addEventListener('change', handleDisplayModeChange);

    // ✅ PERFORMANCE FIX: Reduce polling frequency to prevent performance issues
    const updateInterval = setInterval(updatePWAState, 60000); // Every 60 seconds instead of 30

    // ✅ IMPROVED CLEANUP: Comprehensive cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
      }
      
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
      clearInterval(updateInterval);
    };
  }, [updatePWAState]); // ✅ STABLE: updatePWAState is now stable

  // Prompt installation
  const promptInstall = useCallback(async (): Promise<boolean> => {
    try {
      const result = await PWAInstallManager.forceShowInstallPrompt();
      updatePWAState();
      return result;
    } catch (error) {
      logger.error('Failed to prompt install', { error }, 'PWA');
      return false;
    }
  }, [updatePWAState]);

  // Show install instructions
  const showInstallInstructions = useCallback(() => {
    PWAInstallManager.showInstallInstructions();
  }, []);

  return {
    isInstalled,
    canInstall,
    isStandalone,
    capabilities,
    metrics,
    installReadinessScore,
    promptInstall,
    showInstallInstructions,
    isSupported,
    isOnline,
    updateAvailable
  };
}

/**
 * Hook for PWA install button
 */
export function usePWAInstallButton() {
  const { canInstall, promptInstall, installReadinessScore } = usePWA();
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastPromptResult, setLastPromptResult] = useState<boolean | null>(null);

  const handleInstallClick = useCallback(async () => {
    if (!canInstall) return;
    
    setIsLoading(true);
    try {
      const result = await promptInstall();
      setLastPromptResult(result);
    } finally {
      setIsLoading(false);
    }
  }, [canInstall, promptInstall]);

  return {
    canInstall,
    isLoading,
    lastPromptResult,
    installReadinessScore,
    handleInstallClick
  };
}

/**
 * Hook for offline detection and handling
 */
export function useOfflineDetection() {
  const { isOnline } = usePWA();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Coming back online
      setWasOffline(false);
      
      logger.info('Connection restored', {}, 'PWA');
      
      // Trigger any background sync or data refresh
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_WHEN_ONLINE'
        });
      }
    }
  }, [isOnline, wasOffline]);

  return {
    isOnline,
    wasOffline,
    isOffline: !isOnline
  };
} 