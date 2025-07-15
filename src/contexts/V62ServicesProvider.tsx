/**
 * V6.2 Enhanced Framework - Services Provider
 * Provider React para integração dos services V6.2
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { initializeV62Services, checkServicesHealth } from '../services/initializeServices';
import { ServiceConfig, ServiceStatus, V62Context } from '../types/v62-services';
import { createLogger } from '../utils/logger';

const logger = createLogger('V62ServicesProvider');

// Context
const V62ServicesContext = createContext<V62Context | null>(null);

// Provider Props
interface V62ServicesProviderProps {
  children: React.ReactNode;
  config?: ServiceConfig;
}

// Default config
const defaultConfig: ServiceConfig = {
  enablePredictiveUX: true,
  enableMultiAI: true,
  enableVoiceSynthesis: true,
  enableSmartLoading: true,
  enableDirectAccess: true,
  enableMicroInteractions: true,
  enablePerformanceMonitoring: true,
  enableIntelligenceDashboard: true,
  microInteractionsIntensity: 'normal',
  performanceThresholds: {
    fps: 50,
    memory: 200 * 1024 * 1024, // 200MB
    latency: 1000 // 1s
  }
};

export const V62ServicesProvider: React.FC<V62ServicesProviderProps> = ({ 
  children, 
  config = defaultConfig 
}) => {
  const { currentUser } = useAuth();
  const [servicesStatus, setServicesStatus] = useState<V62Context['services']>({
    predictiveUX: false,
    multiAI: false,
    voiceSynthesis: false,
    smartLoading: false,
    directAccess: false,
    microInteractions: false,
    performanceMonitoring: false,
    intelligenceDashboard: false
  });
  const [initializationStatus, setInitializationStatus] = useState<ServiceStatus>(ServiceStatus.INITIALIZING);
  const [performance, setPerformance] = useState({
    fps: 60,
    latency: 0,
    errorRate: 0
  });

  // Inicializar services
  useEffect(() => {
    const initServices = async () => {
      try {
        logger.info('Iniciando services V6.2...');
        
        const result = await initializeV62Services();
        
        if (result.success) {
          // Atualizar status baseado no resultado
          const newStatus = { ...servicesStatus };
          
          result.results.forEach(r => {
            switch (r.service) {
              case 'PredictiveUX':
                newStatus.predictiveUX = r.success && (config.enablePredictiveUX ?? true);
                break;
              case 'MultiAI':
                newStatus.multiAI = r.success && (config.enableMultiAI ?? true);
                break;
              case 'VoiceSynthesis':
                newStatus.voiceSynthesis = r.success && (config.enableVoiceSynthesis ?? true);
                break;
              case 'SmartLoading':
                newStatus.smartLoading = r.success && (config.enableSmartLoading ?? true);
                break;
              case 'DirectAccess':
                newStatus.directAccess = r.success && (config.enableDirectAccess ?? true);
                break;
              case 'AdvancedMicroInteractions':
                newStatus.microInteractions = r.success && (config.enableMicroInteractions ?? true);
                break;
              case 'EnhancedPerformance':
                newStatus.performanceMonitoring = r.success && (config.enablePerformanceMonitoring ?? true);
                break;
              case 'IntelligenceDashboard':
                newStatus.intelligenceDashboard = r.success && (config.enableIntelligenceDashboard ?? true);
                break;
            }
          });
          
          setServicesStatus(newStatus);
          setInitializationStatus(ServiceStatus.READY);
          
          logger.info('Services V6.2 inicializados com sucesso', newStatus);
        } else {
          setInitializationStatus(ServiceStatus.DEGRADED);
          logger.warn('Services V6.2 inicializados com problemas');
        }
      } catch (error) {
        setInitializationStatus(ServiceStatus.ERROR);
        logger.error('Erro ao inicializar services V6.2', error);
      }
    };

    initServices();
  }, [config]);

  // Monitorar performance (se habilitado)
  useEffect(() => {
    if (!servicesStatus.performanceMonitoring) return;

    const updatePerformance = () => {
      try {
        // Importar dinamicamente para evitar erro se o service não estiver pronto
        import('../services/enhancedPerformanceService').then(({ EnhancedPerformanceService }) => {
          const metrics = EnhancedPerformanceService.getCurrentMetrics();
          if (metrics) {
            setPerformance({
              fps: metrics.fps,
              latency: metrics.networkLatency,
              errorRate: metrics.errorRate
            });
          }
        });
      } catch (error) {
        logger.debug('Performance monitoring não disponível', error);
      }
    };

    const interval = setInterval(updatePerformance, 5000); // A cada 5s
    updatePerformance(); // Primeira chamada

    return () => clearInterval(interval);
  }, [servicesStatus.performanceMonitoring]);

  // Personalizar services para o usuário logado
  useEffect(() => {
    if (currentUser?.uid && servicesStatus.directAccess) {
      import('../services/directAccessService').then(({ DirectAccessService }) => {
        DirectAccessService.initializeForUser(currentUser.uid).catch(error => {
          logger.error('Erro ao personalizar DirectAccess', error);
        });
      });
    }

    if (currentUser?.uid && servicesStatus.predictiveUX) {
      import('../services/predictiveUXService').then(({ PredictiveUXService }) => {
        // O service já se auto-inicializa com o userId
        logger.info('PredictiveUX personalizado para usuário', { userId: currentUser.uid });
      });
    }
  }, [currentUser?.uid, servicesStatus]);

  // Verificar saúde dos services
  const checkHealth = useCallback(() => {
    const health = checkServicesHealth();
    logger.debug('Health check dos services', health);
    return health;
  }, []);

  // Context value
  const contextValue: V62Context = {
    services: servicesStatus,
    user: currentUser ? {
      id: currentUser.uid,
      preferences: currentUser.preferences || {},
      subscription: currentUser.subscription || 'free'
    } : null,
    config: { ...defaultConfig, ...config },
    performance
  };

  // Renderizar loading enquanto inicializa
  if (initializationStatus === ServiceStatus.INITIALIZING) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando services avançados...</p>
        </div>
      </div>
    );
  }

  // Renderizar aviso se houver erro (mas continuar)
  if (initializationStatus === ServiceStatus.ERROR || initializationStatus === ServiceStatus.DEGRADED) {
    logger.warn('Services em modo degradado, algumas funcionalidades podem não estar disponíveis');
  }

  return (
    <V62ServicesContext.Provider value={contextValue}>
      {children}
    </V62ServicesContext.Provider>
  );
};

// Hook para usar o context
export const useV62Services = () => {
  const context = useContext(V62ServicesContext);
  
  if (!context) {
    throw new Error('useV62Services deve ser usado dentro de V62ServicesProvider');
  }
  
  return context;
};

// Hook para verificar se um service específico está disponível
export const useServiceAvailable = (service: keyof V62Context['services']) => {
  const { services } = useV62Services();
  return services[service];
};

// Hook para obter performance metrics
export const useV62Performance = () => {
  const { performance } = useV62Services();
  return performance;
}; 