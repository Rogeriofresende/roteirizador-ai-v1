/**
 * V5.1 Enhanced Framework - Smart Loading States
 * Intelligent loading states that adapt to user behavior and context
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';
import { performanceService } from '../../services/performance';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SmartLoadingStates');

interface SmartLoadingProps {
  isLoading: boolean;
  type?: 'generator' | 'navigation' | 'data' | 'ai' | 'generic';
  context?: string;
  expectedDuration?: number;
  onTimeout?: () => void;
  children?: React.ReactNode;
  className?: string;
}

interface LoadingMetrics {
  startTime: number;
  expectedDuration: number;
  actualDuration?: number;
  userAbandonments: number;
  successfulLoads: number;
  averageDuration: number;
}

const loadingMetrics = new Map<string, LoadingMetrics>();

export const SmartLoadingStates: React.FC<SmartLoadingProps> = ({
  isLoading,
  type = 'generic',
  context = 'default',
  expectedDuration,
  onTimeout,
  children,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState('');

  const { trackAction, getMostLikelyNext } = usePredictiveUX();
  const metricKey = `${type}_${context}`;

  // Smart messages based on type and duration
  const getSmartMessages = useCallback(() => {
    const messageMap: Record<string, string[]> = {
      generator: [
        '🤖 Inicializando IA...',
        '🧠 Processando sua solicitação...',
        '✨ Gerando roteiro personalizado...',
        '🎯 Finalizando detalhes...',
        '🚀 Quase pronto!'
      ],
      navigation: [
        '📍 Carregando página...',
        '🔄 Preparando conteúdo...',
        '✅ Finalizando...'
      ],
      data: [
        '📊 Buscando dados...',
        '🔄 Processando informações...',
        '✅ Concluído!'
      ],
      ai: [
        '🧠 Conectando com IA...',
        '⚡ Processando com inteligência...',
        '🎨 Criando resultado...',
        '✨ Polindo detalhes...'
      ],
      generic: [
        '⏳ Carregando...',
        '🔄 Processando...',
        '✅ Finalizando...'
      ]
    };

    return messageMap[type] || messageMap.generic;
  }, [type]);

  // Calculate adaptive duration based on historical data
  const getAdaptiveDuration = useCallback(() => {
    const metrics = loadingMetrics.get(metricKey);
    if (metrics && metrics.averageDuration > 0) {
      return metrics.averageDuration * 1.1; // Add 10% buffer
    }
    
    // Default durations by type
    const defaults: Record<string, number> = {
      generator: 8000,
      navigation: 2000,
      data: 3000,
      ai: 6000,
      generic: 3000
    };
    
    return expectedDuration || defaults[type] || 3000;
  }, [type, context, expectedDuration, metricKey]);

  // Update loading progress
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setStage(0);
      setIsSlowLoading(false);
      return;
    }

    const startTime = Date.now();
    const duration = getAdaptiveDuration();
    const messages = getSmartMessages();
    
    // Track loading start
    trackAction('loading_start', metricKey, { 
      type, 
      context, 
      expectedDuration: duration 
    });

    // Initialize metrics if not exists
    if (!loadingMetrics.has(metricKey)) {
      loadingMetrics.set(metricKey, {
        startTime,
        expectedDuration: duration,
        userAbandonments: 0,
        successfulLoads: 0,
        averageDuration: duration
      });
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 95); // Never show 100% until actually done
      const currentStage = Math.min(Math.floor((elapsed / duration) * messages.length), messages.length - 1);
      
      setProgress(progressPercent);
      setStage(currentStage);
      setAdaptiveMessage(messages[currentStage]);

      // Show detailed feedback for longer operations
      if (elapsed > 5000) {
        setShowDetailedFeedback(true);
      }

      // Mark as slow loading if taking longer than expected
      if (elapsed > duration) {
        setIsSlowLoading(true);
      }

      // Timeout handling
      if (elapsed > duration * 2 && onTimeout) {
        onTimeout();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      
      // Record metrics on cleanup
      const metrics = loadingMetrics.get(metricKey);
      if (metrics) {
        const duration = Date.now() - startTime;
        metrics.actualDuration = duration;
        
        if (isLoading) {
          // Still loading when cleanup = abandonment
          metrics.userAbandonments++;
          trackAction('loading_abandon', metricKey, { duration });
        } else {
          // Successfully completed
          metrics.successfulLoads++;
          metrics.averageDuration = ((metrics.averageDuration * (metrics.successfulLoads - 1)) + duration) / metrics.successfulLoads;
          trackAction('loading_complete', metricKey, { duration });
        }
        
        performanceService.recordMetric(`loading_${type}`, duration, 'ms', 'loading');
      }
    };
  }, [isLoading, type, context, getAdaptiveDuration, getSmartMessages, trackAction, metricKey, onTimeout]);

  // Handle loading completion
  useEffect(() => {
    if (!isLoading && progress > 0) {
      // Quick completion animation
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setShowDetailedFeedback(false);
        setIsSlowLoading(false);
      }, 500);
    }
  }, [isLoading, progress]);

  // Predictive preloading suggestions
  const getPredictiveHints = useCallback(() => {
    const prediction = getMostLikelyNext();
    if (prediction && prediction.confidence > 0.7) {
      return `Dica: Próxima ação prevista - ${prediction.action}`;
    }
    return null;
  }, [getMostLikelyNext]);

  if (!isLoading && progress === 0) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="text-center space-y-4 max-w-sm mx-auto p-6">
              {/* Main loading animation */}
              <div className="relative">
                <motion.div
                  className="w-16 h-16 mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full" />
                </motion.div>
                
                {/* Progress ring overlay */}
                <svg
                  className="absolute inset-0 w-16 h-16 mx-auto transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-primary"
                    strokeDasharray={`${progress * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Adaptive message */}
              <motion.div
                key={adaptiveMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-foreground font-medium">{adaptiveMessage}</p>
                
                {showDetailedFeedback && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p>{Math.round(progress)}% concluído</p>
                  </div>
                )}
              </motion.div>

              {/* Slow loading feedback */}
              {isSlowLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3"
                >
                  <p>⏳ Esta operação está demorando mais que o esperado...</p>
                  <p className="text-xs mt-1">Estamos otimizando para a próxima vez!</p>
                </motion.div>
              )}

              {/* Predictive hints */}
              {showDetailedFeedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                  className="text-xs text-muted-foreground"
                >
                  {getPredictiveHints()}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Children with potential blur when loading */}
      <div className={isLoading ? 'pointer-events-none filter blur-sm' : ''}>
        {children}
      </div>
    </div>
  );
};

// Hook for smart loading management
export const useSmartLoading = (type: SmartLoadingProps['type'] = 'generic') => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState<string>('default');

  const startLoading = useCallback((context: string = 'default') => {
    setLoadingContext(context);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    context: string = 'default'
  ): Promise<T> => {
    startLoading(context);
    try {
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingContext,
    startLoading,
    stopLoading,
    withLoading,
    LoadingWrapper: ({ children, ...props }: Omit<SmartLoadingProps, 'isLoading' | 'type'>) => (
      <SmartLoadingStates
        isLoading={isLoading}
        type={type}
        context={loadingContext}
        {...props}
      >
        {children}
      </SmartLoadingStates>
    )
  };
};

// Export metrics for debugging
export const getLoadingMetrics = () => {
  return Array.from(loadingMetrics.entries()).map(([key, metrics]) => ({
    key,
    ...metrics,
    successRate: metrics.successfulLoads / (metrics.successfulLoads + metrics.userAbandonments) || 0
  }));
};
