/**
 * V6.2 Enhanced Framework - useSmartLoading Hook
 * Hook para estados de loading inteligentes
 */

import { useState, useCallback } from 'react';
import { usePredictiveUX } from './usePredictiveUX';

interface LoadingStage {
  stage: string;
  progress: number;
  message: string;
}

type LoadingType = 'generator' | 'navigation' | 'data' | 'ai' | 'generic' | 'script_generation';

// V5.1: Hook avançado para gerenciamento de loading
export const useSmartLoading = (defaultType: LoadingType = 'generic') => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<LoadingType>(defaultType);
  const [stages, setStages] = useState<LoadingStage[]>([]);
  
  const { trackAction } = usePredictiveUX();

  const startLoading = useCallback((
    type: LoadingType | string = 'generic',
    customStages?: LoadingStage[]
  ) => {
    setIsLoading(true);
    setLoadingType(type as LoadingType);
    if (customStages) {
      setStages(customStages);
    }
    
    // V5.1: Track loading patterns
    trackAction('loading', `manual-start-${type}`, {
      hasStages: !!customStages
    });
  }, [trackAction]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setStages([]);
  }, []);

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    type: LoadingType = 'generic',
    customStages?: LoadingStage[]
  ): Promise<T> => {
    startLoading(type, customStages);
    try {
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingType,
    stages,
    startLoading,
    stopLoading,
    withLoading
  };
};

/**
 * Hook simplificado para usar no GeneratorPage
 */
export const useSimpleLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback((type?: string) => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading
  };
};

// Export padrão
export default useSmartLoading; 