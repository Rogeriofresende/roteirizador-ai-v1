import { useEffect, useState } from 'react';

interface PWAAnalytics {
  installPromptShown: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  connectionStatus: 'online' | 'offline';
  installationSource: 'browser-prompt' | 'manual' | 'unknown';
  usageMetrics: {
    pageViews: number;
    timeSpent: number;
    offlineUsage: number;
  };
}

interface PWAMetrics {
  analytics: PWAAnalytics;
  trackInstallPrompt: () => void;
  trackInstallation: (source: 'browser-prompt' | 'manual') => void;
  trackPageView: (page: string) => void;
  trackOfflineUsage: () => void;
  trackError: (error: string, context: string) => void;
  exportAnalytics: () => string;
}

export const usePWAAnalytics = (): PWAMetrics => {
  const [analytics, setAnalytics] = useState<PWAAnalytics>(() => {
    const stored = localStorage.getItem('pwa-analytics');
    return stored ? JSON.parse(stored) : {
      installPromptShown: false,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isStandalone: window.navigator.standalone === true,
      connectionStatus: navigator.onLine ? 'online' : 'offline',
      installationSource: 'unknown',
      usageMetrics: {
        pageViews: 0,
        timeSpent: 0,
        offlineUsage: 0,
      },
    };
  });

  // Persistir analytics no localStorage
  useEffect(() => {
    localStorage.setItem('pwa-analytics', JSON.stringify(analytics));
  }, [analytics]);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setAnalytics(prev => ({ ...prev, connectionStatus: 'online' }));
    };

    const handleOffline = () => {
      setAnalytics(prev => ({ ...prev, connectionStatus: 'offline' }));
      trackOfflineUsage();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const trackInstallPrompt = () => {
    setAnalytics(prev => ({ ...prev, installPromptShown: true }));
    console.log('PWA Analytics: Install prompt shown');
  };

  const trackInstallation = (source: 'browser-prompt' | 'manual') => {
    setAnalytics(prev => ({
      ...prev,
      installationSource: source,
      isInstalled: true,
    }));
    console.log(`PWA Analytics: Installation tracked - Source: ${source}`);
  };

  const trackPageView = (page: string) => {
    setAnalytics(prev => ({
      ...prev,
      usageMetrics: {
        ...prev.usageMetrics,
        pageViews: prev.usageMetrics.pageViews + 1,
      },
    }));
    console.log(`PWA Analytics: Page view - ${page}`);
  };

  const trackOfflineUsage = () => {
    setAnalytics(prev => ({
      ...prev,
      usageMetrics: {
        ...prev.usageMetrics,
        offlineUsage: prev.usageMetrics.offlineUsage + 1,
      },
    }));
    console.log('PWA Analytics: Offline usage tracked');
  };

  const trackError = (error: string, context: string) => {
    console.error(`PWA Analytics: Error in ${context}:`, error);
  };

  const exportAnalytics = (): string => {
    const report = {
      timestamp: new Date().toISOString(),
      analytics,
      sessionInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        onLine: navigator.onLine,
      },
    };
    return JSON.stringify(report, null, 2);
  };

  return {
    analytics,
    trackInstallPrompt,
    trackInstallation,
    trackPageView,
    trackOfflineUsage,
    trackError,
    exportAnalytics,
  };
}; 