/**
 * V6.2 Enhanced Framework - useSmartLoading Hook
 * Hook para estados de loading inteligentes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SmartLoadingService, LoadingContext } from '../services/smartLoadingService';
import { createLogger } from '../utils/logger';

const logger = createLogger('useSmartLoading');

interface SmartLoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  subMessage?: string;
  canCancel: boolean;
  type?: LoadingContext['type'];
}

interface UseSmartLoadingOptions {
  autoFinish?: boolean;
  estimatedDuration?: number;
  onCancel?: () => void;
  showGlobalIndicator?: boolean;
}

export const useSmartLoading = (
  type: LoadingContext['type'],
  options: UseSmartLoadingOptions = {}
) => {
  const [state, setState] = useState<SmartLoadingState>({
    isLoading: false,
    canCancel: false
  });

  const loadingIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Listener para atualizações do loading
  useEffect(() => {
    if (loadingIdRef.current) {
      SmartLoadingService.addListener(loadingIdRef.current, (loadingState) => {
        setState({
          isLoading: loadingState.status === 'active',
          progress: loadingState.context.progress,
          message: loadingState.context.message,
          subMessage: loadingState.context.subMessage,
          canCancel: loadingState.context.showCancel || false,
          type: loadingState.context.type
        });
      });
    }

    return () => {
      if (loadingIdRef.current) {
        SmartLoadingService.removeListener(loadingIdRef.current);
      }
    };
  }, [loadingIdRef.current]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (loadingIdRef.current) {
        SmartLoadingService.finishLoading(loadingIdRef.current);
        loadingIdRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // Iniciar loading
  const startLoading = useCallback((context?: Partial<LoadingContext>) => {
    // Finalizar loading anterior se existir
    if (loadingIdRef.current) {
      SmartLoadingService.finishLoading(loadingIdRef.current);
    }

    const loadingContext: LoadingContext = {
      type,
      estimatedDuration: options.estimatedDuration,
      showCancel: !!options.onCancel,
      ...context
    };

    loadingIdRef.current = SmartLoadingService.startLoading(loadingContext);

    setState({
      isLoading: true,
      canCancel: loadingContext.showCancel || false,
      message: loadingContext.message,
      type
    });

    logger.debug('Loading iniciado', { id: loadingIdRef.current, type });

    // Auto-finish se configurado
    if (options.autoFinish && loadingContext.estimatedDuration) {
      setTimeout(() => {
        if (loadingIdRef.current) {
          finishLoading();
        }
      }, loadingContext.estimatedDuration);
    }
  }, [type, options]);

  // Atualizar progresso
  const updateProgress = useCallback((progress: number, message?: string) => {
    if (!loadingIdRef.current) return;

    SmartLoadingService.updateProgress(loadingIdRef.current, progress, message);
  }, []);

  // Finalizar loading
  const finishLoading = useCallback((success: boolean = true, error?: string) => {
    if (!loadingIdRef.current) return;

    SmartLoadingService.finishLoading(loadingIdRef.current, success, error);
    loadingIdRef.current = null;

    setState({
      isLoading: false,
      canCancel: false,
      progress: undefined,
      message: undefined,
      subMessage: undefined
    });

    logger.debug('Loading finalizado', { success, error });
  }, []);

  // Cancelar loading
  const cancelLoading = useCallback(() => {
    if (!loadingIdRef.current) return;

    SmartLoadingService.cancelLoading(loadingIdRef.current);
    loadingIdRef.current = null;

    setState({
      isLoading: false,
      canCancel: false,
      progress: undefined,
      message: undefined,
      subMessage: undefined
    });

    if (options.onCancel) {
      options.onCancel();
    }

    logger.debug('Loading cancelado');
  }, [options.onCancel]);

  // Executar operação async com loading
  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    context?: Partial<LoadingContext>
  ): Promise<T | null> => {
    startLoading(context);

    try {
      const result = await operation();
      finishLoading(true);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      finishLoading(false, errorMessage);
      logger.error('Erro durante operação com loading', error);
      throw error;
    }
  }, [startLoading, finishLoading]);

  // Executar operação com progresso
  const withProgress = useCallback(async <T,>(
    operation: (updateProgress: (progress: number, message?: string) => void) => Promise<T>,
    context?: Partial<LoadingContext>
  ): Promise<T | null> => {
    startLoading(context);

    try {
      const result = await operation(updateProgress);
      finishLoading(true);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      finishLoading(false, errorMessage);
      logger.error('Erro durante operação com progresso', error);
      throw error;
    }
  }, [startLoading, updateProgress, finishLoading]);

  return {
    // Estado
    isLoading: state.isLoading,
    progress: state.progress,
    message: state.message,
    subMessage: state.subMessage,
    canCancel: state.canCancel,
    type: state.type,

    // Ações
    startLoading,
    updateProgress,
    finishLoading,
    cancelLoading,

    // Helpers
    withLoading,
    withProgress,

    // Utilidades
    isActive: state.isLoading,
    hasProgress: state.progress !== undefined,
    progressPercent: state.progress || 0
  };
};

/**
 * Hook para monitorar todos os loadings globais
 */
export const useGlobalLoadings = () => {
  const [loadings, setLoadings] = useState<ReturnType<typeof SmartLoadingService.getActiveLoadings>>([]);
  const [stats, setStats] = useState<ReturnType<typeof SmartLoadingService.getLoadingStats>>({
    patterns: [],
    currentActive: 0,
    avgDuration: 0,
    successRate: 0
  });

  useEffect(() => {
    // Listener para mudanças nos loadings
    const cleanup = SmartLoadingService.addGlobalListener((states) => {
      setLoadings(states);
    });

    // Atualizar estatísticas periodicamente
    const statsInterval = setInterval(() => {
      setStats(SmartLoadingService.getLoadingStats());
    }, 5000);

    return () => {
      cleanup();
      clearInterval(statsInterval);
    };
  }, []);

  return {
    // Lista de loadings ativos
    loadings,
    
    // Estatísticas
    stats,
    
    // Helpers
    hasActiveLoadings: loadings.length > 0,
    activeCount: loadings.length,
    
    // Verificar tipo específico
    hasLoadingOfType: (type: LoadingContext['type']) => 
      loadings.some(l => l.context.type === type),
    
    // Obter loading principal (maior prioridade)
    primaryLoading: loadings[0] || null,
    
    // Verificar se há loadings críticos
    hasCriticalLoading: loadings.some(l => l.context.priority === 'high')
  };
};

/**
 * Hook para criar loading fake/simulado
 */
export const useFakeLoading = (
  type: LoadingContext['type'],
  duration: number = 3000
) => {
  const loading = useSmartLoading(type, { autoFinish: true, estimatedDuration: duration });

  const simulateProgress = useCallback(() => {
    loading.startLoading();
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        clearInterval(interval);
        loading.finishLoading();
      } else {
        loading.updateProgress(Math.min(progress, 95));
      }
    }, duration / 5);

    return () => clearInterval(interval);
  }, [loading, duration]);

  return {
    ...loading,
    simulate: simulateProgress
  };
}; 