/**
 * 🔌 DI PROVIDER V8.0 - FRONTEND INTEGRATION
 * Conecta frontend ao sistema de Dependency Injection consolidado
 * Baseado em: ServiceBootstrap.ts + ServiceRegistry.ts
 * Metodologia: V8.0 Consolidation Strategy
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { serviceRegistry } from '../../services/registry/ServiceRegistry';
import { ServiceBootstrap, ServiceIdentifiers } from '../../services/bootstrap/ServiceBootstrap';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DIProvider');

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface DIContextValue {
  isInitialized: boolean;
  services: Record<string, any>;
  bootstrap: () => Promise<void>;
  getService: <T>(identifier: string) => T | null;
  getServiceHealth: (identifier: string) => ServiceHealthStatus;
  registryMetrics: RegistryMetrics;
}

interface ServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
  responseTime: number;
  errorCount: number;
}

interface RegistryMetrics {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  averageResponseTime: number;
}

const DIContext = createContext<DIContextValue | null>(null);

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
  const [registryMetrics, setRegistryMetrics] = useState<RegistryMetrics>({
    totalServices: 0,
    healthyServices: 0,
    degradedServices: 0,
    unhealthyServices: 0,
    averageResponseTime: 0
  });

  // =============================================================================
  // BOOTSTRAP FUNCTION
  // =============================================================================

  const bootstrap = async (): Promise<void> => {
    try {
      logger.info('🚀 Bootstrapping DI system...');
      const startTime = performance.now();

      // Initialize ServiceBootstrap
      await ServiceBootstrap.initialize();
      
      // Get all registered services
      const registeredServices = serviceRegistry.getAllServices();
      setServices(registeredServices);

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

  const getService = <T>(identifier: string): T | null => {
    try {
      return serviceRegistry.get<T>(identifier);
    } catch (error) {
      logger.warn(`⚠️ Service '${identifier}' not found:`, error);
      return null;
    }
  };

  const getServiceHealth = (identifier: string): ServiceHealthStatus => {
    return serviceRegistry.getHealthStatus(identifier) || {
      status: 'unhealthy',
      lastCheck: Date.now(),
      responseTime: 0,
      errorCount: 1
    };
  };

  const updateRegistryMetrics = (): void => {
    const allServices = serviceRegistry.getAllServices();
    const healthStatuses = Object.keys(allServices).map(id => getServiceHealth(id));
    
    const metrics: RegistryMetrics = {
      totalServices: Object.keys(allServices).length,
      healthyServices: healthStatuses.filter(h => h.status === 'healthy').length,
      degradedServices: healthStatuses.filter(h => h.status === 'degraded').length,
      unhealthyServices: healthStatuses.filter(h => h.status === 'unhealthy').length,
      averageResponseTime: healthStatuses.reduce((sum, h) => sum + h.responseTime, 0) / healthStatuses.length || 0
    };

    setRegistryMetrics(metrics);
  };

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (autoBootstrap && !isInitialized) {
      bootstrap().catch(error => {
        logger.error('Auto-bootstrap failed:', error);
      });
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

  const contextValue: DIContextValue = {
    isInitialized,
    services,
    bootstrap,
    getService,
    getServiceHealth,
    registryMetrics
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

export const useDI = (): DIContextValue => {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error('useDI must be used within DIProvider');
  }
  return context;
};

// =============================================================================
// SERVICE-SPECIFIC HOOKS
// =============================================================================

export const useService = <T>(identifier: string): T | null => {
  const { getService } = useDI();
  return getService<T>(identifier);
};

export const useAnalyticsService = () => {
  return useService(ServiceIdentifiers.Analytics.name);
};

export const useGeminiService = () => {
  return useService(ServiceIdentifiers.Gemini?.name || 'GeminiService');
};

export const useCacheService = () => {
  return useService(ServiceIdentifiers.Cache?.name || 'CacheService');
};

export const usePerformanceService = () => {
  return useService(ServiceIdentifiers.Performance?.name || 'PerformanceService');
};

// =============================================================================
// EXPORTS
// =============================================================================

export default DIProvider; 