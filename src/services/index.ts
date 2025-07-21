/**
 * Services DI System - Main Export
 * V8.0 CONSOLIDATED SYSTEM - Migrado para ServiceBootstrapV8
 */

// V8.0 Core DI system exports - CONSOLIDATED
export { container } from './container/DIContainer';
export { serviceRegistry } from './registry/ServiceRegistry';

// V8.0 BOOTSTRAP MIGRATION: Usar ServiceBootstrapV8 consolidado
let serviceBootstrap: any;
let ServiceIdentifiers: any;
let isBootstrapLoaded = false;

// V8.0 Initialize with ServiceBootstrapV8 (no more fallback needed)
async function initializeBootstrap() {
  try {
    // V8.0: Usar ServiceBootstrapV8 consolidado ao invés do legado
    const bootstrap = await import('./bootstrap/ServiceBootstrapV8');
    if (bootstrap && bootstrap.serviceBootstrapV8) {
      serviceBootstrap = bootstrap.serviceBootstrapV8;
      ServiceIdentifiers = bootstrap.ServiceIdentifiers || {};
      isBootstrapLoaded = true;
      console.log('✅ ServiceBootstrapV8 loaded successfully - Consolidated DI System');
    }
  } catch (error) {
    console.error('❌ ServiceBootstrapV8 failed to load:', error);
    // V8.0: Keep minimal fallback but prefer V8 system
    serviceBootstrap = {
      initialize: () => Promise.resolve({ 
        success: false,
        registeredServices: 0, 
        initializedServices: 0, 
        errors: ['ServiceBootstrapV8 failed to load'] 
      }),
      dispose: () => Promise.resolve(),
      getSystemStatus: () => Promise.resolve({ 
        initialized: false,
        health: { overall: 'offline' },
        stats: { registeredServices: 0, activeInstances: 0 } 
      })
    };
  }
}

// Initialize on module load
initializeBootstrap();

// V8.0 CONSOLIDATED EXPORTS
export { serviceBootstrap, ServiceIdentifiers, isBootstrapLoaded };

// Interface exports
export * from './interfaces';

// Abstract base classes
export { BaseService } from './abstracts/BaseService';

// Mock services for testing
export { MockAnalyticsService } from './mocks/MockAnalyticsService';

// Type-safe service accessors
import { serviceRegistry } from './registry/ServiceRegistry';

/**
 * Type-safe service accessors
 * Provides easy access to registered services with full type safety
 */
export const Services = {
  /**
   * Get Analytics Service
   */
  async getAnalytics() {
    return serviceRegistry.get(ServiceIdentifiers.Analytics);
  },

  /**
   * Get Storage Service
   */
  async getStorage() {
    return serviceRegistry.get(ServiceIdentifiers.Storage);
  },

  /**
   * Get Gemini Service
   */
  async getGemini() {
    return serviceRegistry.get(ServiceIdentifiers.Gemini);
  },

  /**
   * Get Performance Service
   */
  async getPerformance() {
    return serviceRegistry.get(ServiceIdentifiers.Performance);
  },

  /**
   * Get Template Service
   */
  async getTemplate() {
    return serviceRegistry.get(ServiceIdentifiers.Template);
  },

  /**
   * Get all services health status
   */
  async getSystemHealth() {
    return serviceRegistry.getSystemHealth();
  },

  /**
   * Get service statistics
   */
  getStats() {
    return serviceRegistry.getStats();
  }
} as const;

/**
 * Initialize the entire DI system
 * Call this once during application startup
 */
export async function initializeServiceSystem() {
  return serviceBootstrap.initialize();
}

/**
 * Dispose the entire DI system
 * Call this during application shutdown
 */
export async function disposeServiceSystem() {
  return serviceBootstrap.dispose();
}

/**
 * Get current system status
 */
export async function getSystemStatus() {
  return serviceBootstrap.getSystemStatus();
}

/**
 * Utility function to check if services are ready
 */
export async function areServicesReady(): Promise<boolean> {
  try {
    const status = await serviceBootstrap.getSystemStatus();
    return status.initialized && status.health.overall === 'healthy';
  } catch {
    return false;
  }
}

// Legacy service exports for backward compatibility
// These should gradually be replaced with DI-based access
export { geminiService } from './geminiService';
export { cacheService } from './cacheService'; 
export { performanceService } from './performance';
export { analyticsService } from './analyticsService'; 