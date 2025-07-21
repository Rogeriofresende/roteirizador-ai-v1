/**
 * 🔌 DI PROVIDER V8.0 - FRONTEND INTEGRATION
 * Conecta frontend ao sistema de Dependency Injection consolidado
 * V8.0 CONSOLIDATION: Usando ServiceBootstrapV8 (844 linhas consolidadas)
 * Metodologia: V8.0 Unified Development + Frontend Integration
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { serviceBootstrapV8, ServiceIdentifiersV8 } from '../../services/bootstrap/ServiceBootstrapV8';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DIProviderV8');

// =============================================================================
// V8.0 UNIFIED INTERFACES
// =============================================================================

interface DIContextValueV8 {
  isInitialized: boolean;
  services: Record<string, any>;
  bootstrap: () => Promise<void>;
  getService: <T>(identifier: string) => T | null;
  getSystemHealth: () => Promise<SystemHealthV8>;
  registryMetrics: RegistryMetricsV8;
  performanceScore: number;
  bootstrapTime: number;
}

interface SystemHealthV8 {
  overall: 'healthy' | 'degraded' | 'offline';
  services: Array<{
    name: string;
    status: string;
    health: any;
    metrics: any;
  }>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    offline: number;
  };
  telemetry: any;
}

interface RegistryMetricsV8 {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  offlineServices: number;
  averageResponseTime: number;
  performanceScore: number;
  totalBootstrapTime: number;
}

const DIContext = createContext<DIContextValueV8 | null>(null);

// =============================================================================
// DI PROVIDER COMPONENT
// =============================================================================

interface DIProviderProps {
  children: ReactNode;
  autoBootstrap?: boolean;
}

export const DIProvider: React.FC<DIProviderProps> = ({ 
  children, 
  autoBootstrap = true 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [services, setServices] = useState<Record<string, any>>({});
  const [registryMetrics, setRegistryMetrics] = useState<RegistryMetricsV8>({
    totalServices: 0,
    healthyServices: 0,
    degradedServices: 0,
    offlineServices: 0,
    averageResponseTime: 0,
    performanceScore: 0,
    totalBootstrapTime: 0
  });

  // =============================================================================
  // BOOTSTRAP FUNCTION
  // =============================================================================

  const bootstrap = async (): Promise<void> => {
    try {
      logger.info('🚀 Bootstrapping DI system...');
      const startTime = performance.now();

      // Initialize ServiceBootstrapV8
      await serviceBootstrapV8.initialize();
      
      // Get all registered services
      const serviceStats = serviceBootstrapV8.getStats();
      setServices(serviceStats.instances || {});

      // Update metrics
      updateRegistryMetrics();

      setIsInitialized(true);
      
      const endTime = performance.now();
      logger.info(`✅ DI system bootstrapped in ${(endTime - startTime).toFixed(2)}ms`);
      
    } catch (error) {
      logger.error('❌ Failed to bootstrap DI system:', error);
      throw error;
    }
  };

  // =============================================================================
  // SERVICE ACCESS FUNCTIONS
  // =============================================================================

  const getService = <T extends unknown>(identifier: string): T | null => {
    try {
      return serviceBootstrapV8.get<T>(identifier);
    } catch (error) {
      logger.warn(`⚠️ Service '${identifier}' not found:`, error);
      return null;
    }
  };

  const getSystemHealth = async (): Promise<SystemHealthV8> => {
    return serviceBootstrapV8.getSystemHealth();
  };

  const updateRegistryMetrics = (): void => {
    try {
      const serviceStats = serviceBootstrapV8.getStats();
      const allServices = serviceStats.instances || [];
      
      // Map array instances to health status
      const healthStatuses = allServices.map(instance => ({
        name: instance.key,
        status: instance.health || 'unknown',
        health: instance.health || 'unknown',
        metrics: { responseTime: instance.initTime || 0 }
      }));
      
      const metrics: RegistryMetricsV8 = {
        totalServices: allServices.length,
        healthyServices: healthStatuses.filter(s => s.status === 'healthy').length,
        degradedServices: healthStatuses.filter(s => s.status === 'degraded').length,
        offlineServices: healthStatuses.filter(s => s.status === 'offline').length,
        averageResponseTime: healthStatuses.reduce((sum, s) => sum + (s.metrics.responseTime || 0), 0) / healthStatuses.length || 0,
        performanceScore: serviceBootstrapV8.getPerformanceScore(),
        totalBootstrapTime: serviceBootstrapV8.getTotalBootstrapTime()
      };

      setRegistryMetrics(metrics);
    } catch (error) {
      console.warn('Error updating registry metrics:', error);
      // Set safe defaults
      setRegistryMetrics({
        totalServices: 0,
        healthyServices: 0,
        degradedServices: 0,
        offlineServices: 0,
        averageResponseTime: 0,
        performanceScore: 0,
        totalBootstrapTime: 0
      });
    }
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    // V8.0 Fix: Disable auto-bootstrap in Storybook environment
    const isStorybook = globalThis.STORYBOOK_ENVIRONMENT === true;
    
    if (autoBootstrap && !isInitialized && !isStorybook) {
      bootstrap().catch(error => {
        logger.error('Auto-bootstrap failed:', error);
      });
    } else if (isStorybook) {
      // For Storybook, just set initialized without full bootstrap
      logger.info('🎭 [STORYBOOK] Skipping DI bootstrap, using mocks');
      setIsInitialized(true);
    }
  }, [autoBootstrap, isInitialized]);

  // Update metrics every 30 seconds
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(updateRegistryMetrics, 30000);
    return () => clearInterval(interval);
  }, [isInitialized]);

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: DIContextValueV8 = {
    isInitialized,
    services,
    bootstrap,
    getService,
    getSystemHealth,
    registryMetrics,
    performanceScore: serviceBootstrapV8.getPerformanceScore(),
    bootstrapTime: serviceBootstrapV8.getTotalBootstrapTime()
  };

  return (
    <DIContext.Provider value={contextValue}>
      {children}
    </DIContext.Provider>
  );
};

// =============================================================================
// CUSTOM HOOK
// =============================================================================

export const useDI = (): DIContextValueV8 => {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error('useDI must be used within DIProvider');
  }
  return context;
};

// =============================================================================
// SERVICE-SPECIFIC HOOKS
// =============================================================================

export const useService = <T extends unknown>(identifier: string): T | null => {
  const { getService } = useDI();
  return getService<T>(identifier);
};

export const useAnalyticsService = () => {
  return useService(ServiceIdentifiersV8.Analytics.name);
};

export const useGeminiService = () => {
  return useService(ServiceIdentifiersV8.Gemini?.name || 'GeminiService');
};

export const useCacheService = () => {
  return useService(ServiceIdentifiersV8.Cache?.name || 'CacheService');
};

export const usePerformanceService = () => {
  return useService(ServiceIdentifiersV8.Performance?.name || 'PerformanceService');
};

// =============================================================================
// EXPORTS
// =============================================================================

export default DIProvider; 