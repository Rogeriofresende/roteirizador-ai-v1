/**
 * Services DI System - Main Export
 * Sistema de Dependency Injection V6.4 - IA Beta Implementation
 */

// Core DI system exports
export { container } from './container/DIContainer';
export { serviceRegistry } from './registry/ServiceRegistry';

// Bootstrap import with error handling
let serviceBootstrap: any;
let ServiceIdentifiers: any;

// Initialize with fallback
serviceBootstrap = {
  initialize: () => Promise.resolve({ success: false, registeredServices: 0, initializedServices: 0, errors: ['Bootstrap not available'] }),
  dispose: () => Promise.resolve(),
  getSystemStatus: () => Promise.resolve({ initialized: false, health: { overall: 'offline' }, stats: { registeredServices: 0, activeInstances: 0 } })
};
ServiceIdentifiers = {};

// Try to load the real implementation
(async () => {
  try {
    const bootstrap = await import('./bootstrap/ServiceBootstrap');
    serviceBootstrap = bootstrap.serviceBootstrap;
    ServiceIdentifiers = bootstrap.ServiceIdentifiers;
    console.log('✅ ServiceBootstrap loaded successfully');
  } catch (error) {
    console.error('❌ Failed to import ServiceBootstrap:', error);
  }
})();

export { serviceBootstrap, ServiceIdentifiers };

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