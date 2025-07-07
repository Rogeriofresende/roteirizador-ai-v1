/**
 * 📱 PWA OPTIMIZATION SERVICE
 * Advanced Progressive Web App optimization with offline capabilities
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { cacheService } from './cacheService';

// =============================================================================
// TYPES & INTERFACES  
// =============================================================================

interface PWAMetrics {
  isOnline: boolean;
  installationEligible: boolean;
  isInstalled: boolean;
  backgroundSyncPending: number;
  cacheHitRate: number;
  offlineRequests: number;
  dataUsage: number;
  networkSpeed: string;
}

interface NetworkInfo {
  online: boolean;
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// =============================================================================
// NETWORK MANAGER
// =============================================================================

class NetworkManager {
  private networkInfo: NetworkInfo = {
    online: navigator.onLine,
    type: 'unknown',
    effectiveType: 'unknown', 
    downlink: 0,
    rtt: 0,
    saveData: false
  };

  private callbacks: Array<(info: NetworkInfo) => void> = [];

  initialize(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.updateNetworkInfo(connection);
        connection.addEventListener('change', () => this.updateNetworkInfo(connection));
      }
    }

    logger.info('Network manager initialized', this.networkInfo, 'PWA');
  }

  private handleOnline(): void {
    this.networkInfo.online = true;
    this.notifyCallbacks();
    logger.info('Network connection restored', {}, 'PWA');
  }

  private handleOffline(): void {
    this.networkInfo.online = false;
    this.notifyCallbacks();
    logger.warn('Network connection lost', {}, 'PWA');
  }

  private updateNetworkInfo(connection: any): void {
    this.networkInfo = {
      ...this.networkInfo,
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
    this.notifyCallbacks();
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.networkInfo));
  }

  onNetworkChange(callback: (info: NetworkInfo) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  getNetworkInfo(): NetworkInfo {
    return { ...this.networkInfo };
  }

  isSlowConnection(): boolean {
    return this.networkInfo.effectiveType === '2g' || 
           this.networkInfo.effectiveType === 'slow-2g' ||
           this.networkInfo.downlink < 1;
  }

  isDataSaver(): boolean {
    return this.networkInfo.saveData;
  }
}

// =============================================================================
// OFFLINE STORAGE MANAGER
// =============================================================================

class OfflineStorageManager {
  private maxStorageSize = 50 * 1024 * 1024; // 50MB
  private currentUsage = 0;

  async initialize(): Promise<void> {
    await this.calculateStorageUsage();
    
    logger.info('Offline storage manager initialized', {
      usage: `${(this.currentUsage / 1024 / 1024).toFixed(2)}MB`,
      maxSize: `${(this.maxStorageSize / 1024 / 1024).toFixed(2)}MB`
    }, 'PWA');
  }

  async storeOfflineData(key: string, data: any): Promise<boolean> {
    try {
      const serialized = JSON.stringify(data);
      const dataSize = new Blob([serialized]).size;

      if (this.currentUsage + dataSize > this.maxStorageSize) {
        await this.cleanupOldData();
        
        if (this.currentUsage + dataSize > this.maxStorageSize) {
          logger.warn('Insufficient offline storage space', {
            required: `${(dataSize / 1024 / 1024).toFixed(2)}MB`,
            available: `${((this.maxStorageSize - this.currentUsage) / 1024 / 1024).toFixed(2)}MB`
          }, 'PWA');
          return false;
        }
      }

      await cacheService.set(key, data, {
        strategy: ['indexedDB'],
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
        priority: 'high'
      });

      this.currentUsage += dataSize;
      return true;
    } catch (error: unknown) {
      logger.error('Failed to store offline data', { key, error }, 'PWA');
      return false;
    }
  }

  async getOfflineData<T>(key: string): Promise<T | null> {
    try {
      return await cacheService.get<T>(key);
    } catch (error: unknown) {
      logger.error('Failed to retrieve offline data', { key, error }, 'PWA');
      return null;
    }
  }

  private async calculateStorageUsage(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        this.currentUsage = estimate.usage || 0;
      } catch (error: unknown) {
        logger.warn('Failed to estimate storage usage', { error }, 'PWA');
      }
    }
  }

  private async cleanupOldData(): Promise<void> {
    logger.info('Cleaning up old offline data', {}, 'PWA');
    await this.calculateStorageUsage();
  }

  getStorageInfo() {
    return {
      usage: this.currentUsage,
      maxSize: this.maxStorageSize,
      usagePercentage: (this.currentUsage / this.maxStorageSize) * 100
    };
  }
}

// =============================================================================
// MAIN PWA OPTIMIZATION SERVICE
// =============================================================================

export class PWAOptimizationService {
  private networkManager = new NetworkManager();
  private offlineStorage = new OfflineStorageManager();
  
  private metrics: PWAMetrics = {
    isOnline: navigator.onLine,
    installationEligible: false,
    isInstalled: false,
    backgroundSyncPending: 0,
    cacheHitRate: 0,
    offlineRequests: 0,
    dataUsage: 0,
    networkSpeed: 'unknown'
  };

  async initialize(): Promise<boolean> {
    try {
      this.networkManager.initialize();
      await this.offlineStorage.initialize();

      this.networkManager.onNetworkChange((networkInfo) => {
        this.updateNetworkMetrics(networkInfo);
      });

      this.checkInstallationStatus();

      logger.info('PWA Optimization Service initialized', {}, 'PWA');
      return true;
    } catch (error: unknown) {
      logger.error('Failed to initialize PWA Optimization Service', { error }, 'PWA');
      return false;
    }
  }

  async handleOfflineRequest(
    key: string, 
    fetchFunction: () => Promise<any>
  ): Promise<any> {
    if (this.networkManager.getNetworkInfo().online) {
      try {
        const data = await fetchFunction();
        await this.offlineStorage.storeOfflineData(key, data);
        return data;
      } catch (error: unknown) {
        logger.warn('Online request failed, falling back to offline', { key, error }, 'PWA');
      }
    }

    const offlineData = await this.offlineStorage.getOfflineData(key);
    if (offlineData) {
      this.metrics.offlineRequests++;
      return offlineData;
    }

    throw new Error(`No offline data available for: ${key}`);
  }

  getMetrics(): PWAMetrics {
    const networkInfo = this.networkManager.getNetworkInfo();
    const storageInfo = this.offlineStorage.getStorageInfo();
    
    return {
      ...this.metrics,
      isOnline: networkInfo.online,
      dataUsage: storageInfo.usage,
      networkSpeed: networkInfo.effectiveType
    };
  }

  shouldOptimizeForSlowConnection(): boolean {
    return this.networkManager.isSlowConnection() || this.networkManager.isDataSaver();
  }

  async preloadCriticalResources(resources: Array<{ url: string; priority: 'high' | 'medium' | 'low' }>): Promise<void> {
    if (this.shouldOptimizeForSlowConnection()) {
      resources = resources.filter(r => r.priority === 'high');
    }

    const startTime = performance.now();
    
    try {
      await Promise.all(
        resources.map(async (resource) => {
          try {
            const response = await fetch(resource.url);
            if (response.ok) {
              await cacheService.set(`preload_${resource.url}`, await response.text(), {
                strategy: ['memory', 'localStorage'],
                ttl: 24 * 60 * 60 * 1000 // 24 hours
              });
            }
          } catch (error: unknown) {
            logger.warn('Failed to preload resource', { url: resource.url, error }, 'PWA');
          }
        })
      );

      const duration = performance.now() - startTime;
      performanceService.recordMetric('pwa_preload', duration, 'ms', 'pwa', {
        resourceCount: resources.length
      });

    } catch (error: unknown) {
      logger.error('Critical resource preloading failed', { error }, 'PWA');
    }
  }

  private updateNetworkMetrics(networkInfo: NetworkInfo): void {
    this.metrics.isOnline = networkInfo.online;
    this.metrics.networkSpeed = networkInfo.effectiveType;
  }

  private checkInstallationStatus(): void {
    this.metrics.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.metrics.installationEligible = true;
      logger.info('PWA installation prompt available', {}, 'PWA');
    });
  }
}

// =============================================================================
// PWA UTILITIES
// =============================================================================

export const checkPWASupport = () => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
    installPrompt: 'beforeinstallprompt' in window
  };
};

export const getDeviceCapabilities = () => {
  return {
    memory: (navigator as any).deviceMemory || 'unknown',
    cores: navigator.hardwareConcurrency || 'unknown',
    connection: (navigator as any).connection?.effectiveType || 'unknown',
    battery: 'getBattery' in navigator
  };
};

// =============================================================================
// GLOBAL SERVICE INSTANCE
// =============================================================================

export const pwaOptimizationService = new PWAOptimizationService();

pwaOptimizationService.initialize().catch(error => {
  logger.error('Failed to initialize PWA optimization service', { error }, 'PWA');
});

export default pwaOptimizationService;
