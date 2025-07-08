/**
 * Smart Loading States V5.1 - Premium Edition
 * Loading states inteligentes com predição e adaptação ao contexto
 * Sistema que aprende e melhora com o tempo
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';

interface LoadingStage {
  stage: string;
  progress: number;
  message: string;
}

interface SmartLoadingProps {
  isLoading: boolean;
  type?: 'generator' | 'navigation' | 'data' | 'ai' | 'generic';
  message?: string;
  className?: string;
  children?: React.ReactNode;
  // V5.1: Novas props premium
  showProgress?: boolean;
  predictDuration?: boolean;
  trackPerformance?: boolean;
  contextualMessages?: boolean;
  stages?: LoadingStage[];
}

// V5.1: Histórico de performance por tipo
const performanceHistory = new Map<string, number[]>();

export const SmartLoadingStates: React.FC<SmartLoadingProps> = ({
  isLoading,
  type = 'generic',
  message,
  className = '',
  children,
  showProgress = true,
  predictDuration = true,
  trackPerformance = true,
  contextualMessages = true,
  stages = []
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [predictedTime, setPredictedTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStage, setCurrentStage] = useState<LoadingStage | null>(null);
  
  const startTime = useRef<number>(0);
  const progressInterval = useRef<NodeJS.Timeout>();
  
  const { trackAction, getSmartSuggestions } = usePredictiveUX();

  // V5.1: Mensagens contextuais inteligentes
  const contextualMessageMap: Record<string, string[]> = {
    generator: [
      '🤖 Analisando suas preferências...',
      '✨ Criando roteiro personalizado...',
      '📝 Otimizando conteúdo...',
      '🎯 Finalizando detalhes...'
    ],
    navigation: [
      '📍 Preparando navegação...',
      '🚀 Carregando recursos...',
      '🎨 Renderizando interface...',
      '✅ Quase pronto...'
    ],
    data: [
      '📊 Conectando ao servidor...',
      '🔍 Buscando informações...',
      '📈 Processando dados...',
      '💾 Organizando resultados...'
    ],
    ai: [
      '🧠 Iniciando modelo de IA...',
      '🤔 Analisando contexto...',
      '💡 Gerando insights...',
      '✨ Refinando resposta...'
    ],
    generic: [
      '⏳ Processando solicitação...',
      '🔄 Trabalhando nisso...',
      '📦 Preparando conteúdo...',
      '🎉 Quase lá...'
    ]
  };

  // V5.1: Calcular tempo previsto baseado em histórico
  useEffect(() => {
    if (isLoading && predictDuration && type) {
      const history = performanceHistory.get(type) || [];
      if (history.length > 0) {
        const avgTime = history.reduce((a, b) => a + b, 0) / history.length;
        setPredictedTime(Math.round(avgTime / 1000)); // Convert to seconds
      }
    }
  }, [isLoading, predictDuration, type]);

  // V5.1: Gerenciar loading lifecycle
  useEffect(() => {
    if (isLoading) {
      startTime.current = Date.now();
      setCurrentProgress(0);
      setElapsedTime(0);
      
      // Track loading start
      if (trackPerformance) {
        trackAction('loading', `start-${type}`, { 
          predictedDuration: predictedTime,
          hasStages: stages.length > 0 
        });
      }

      // Progress simulation
      let progress = 0;
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime.current;
        setElapsedTime(Math.round(elapsed / 1000));

        // V5.1: Progress calculation with stages
        if (stages.length > 0) {
          const stageProgress = Math.min((elapsed / 1000) * 25, 100);
          const currentStageIndex = Math.floor(stageProgress / (100 / stages.length));
          if (currentStageIndex < stages.length) {
            setCurrentStage(stages[currentStageIndex]);
            progress = stages[currentStageIndex].progress;
          }
        } else {
          // Smooth progress without stages
          progress = Math.min(progress + (predictedTime ? 100 / (predictedTime * 10) : 5), 95);
        }
        
        setCurrentProgress(progress);
      }, 100);

    } else if (startTime.current > 0) {
      // Loading finished
      const duration = Date.now() - startTime.current;
      
      // V5.1: Track performance
      if (trackPerformance && type) {
        const history = performanceHistory.get(type) || [];
        history.push(duration);
        if (history.length > 10) history.shift(); // Keep last 10
        performanceHistory.set(type, history);
        
        trackAction('loading', `end-${type}`, {
          duration,
          predictedDuration: predictedTime,
          accuracy: predictedTime ? Math.abs(1 - (duration / 1000) / predictedTime) : null
        });
      }

      // Complete progress
      setCurrentProgress(100);
      setTimeout(() => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }, 300);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isLoading, type, trackPerformance, trackAction, predictedTime, stages]);

  // V5.1: Determinar mensagem contextual
  const displayMessage = useMemo(() => {
    if (message) return message;
    
    if (currentStage) {
      return currentStage.message;
    }
    
    if (contextualMessages && contextualMessageMap[type]) {
      const messages = contextualMessageMap[type];
      const index = Math.min(
        Math.floor((currentProgress / 100) * messages.length),
        messages.length - 1
      );
      return messages[index];
    }
    
    return contextualMessageMap.generic[0];
  }, [message, currentStage, contextualMessages, type, currentProgress]);

  if (!isLoading) {
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
            className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-50"
          >
            <div className="text-center space-y-4 p-6 max-w-md w-full">
              {/* V5.1: Enhanced loading spinner */}
              <motion.div
                className="w-16 h-16 mx-auto relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-4 border-gray-200 border-t-primary rounded-full" />
                {showProgress && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {Math.round(currentProgress)}%
                    </span>
                  </div>
                )}
              </motion.div>

              {/* V5.1: Contextual loading message */}
              <motion.p
                key={displayMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-700 font-medium"
              >
                {displayMessage}
              </motion.p>

              {/* V5.1: Progress bar */}
              {showProgress && (
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/80"
                    style={{ width: '0%' }}
                    animate={{ width: `${currentProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {/* V5.1: Time prediction */}
              {predictDuration && (
                <div className="text-xs text-gray-500 space-y-1">
                  {predictedTime && (
                    <p>Tempo estimado: {predictedTime}s</p>
                  )}
                  <p>Tempo decorrido: {elapsedTime}s</p>
                </div>
              )}

              {/* V5.1: Stage indicator */}
              {currentStage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full"
                >
                  {currentStage.stage}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Children com blur quando loading */}
      <div className={isLoading ? 'pointer-events-none filter blur-sm' : ''}>
        {children}
      </div>
    </div>
  );
};

// V5.1: Hook avançado para gerenciamento de loading
export const useSmartLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<SmartLoadingProps['type']>('generic');
  const [stages, setStages] = useState<LoadingStage[]>([]);
  
  const { trackAction } = usePredictiveUX();

  const startLoading = React.useCallback((
    type: SmartLoadingProps['type'] = 'generic',
    customStages?: LoadingStage[]
  ) => {
    setIsLoading(true);
    setLoadingType(type);
    if (customStages) {
      setStages(customStages);
    }
    
    // V5.1: Track loading patterns
    trackAction('loading', `manual-start-${type}`, {
      hasStages: !!customStages
    });
  }, [trackAction]);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setStages([]);
  }, []);

  const withLoading = React.useCallback(async <T,>(
    operation: () => Promise<T>,
    type: SmartLoadingProps['type'] = 'generic',
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
