/**
 * Smart Loading States - Versão Simplificada
 * Loading states simples e funcionais sem complexidade desnecessária
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartLoadingProps {
  isLoading: boolean;
  type?: 'generator' | 'navigation' | 'data' | 'ai' | 'generic';
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export const SmartLoadingStates: React.FC<SmartLoadingProps> = ({
  isLoading,
  type = 'generic',
  message,
  className = '',
  children
}) => {
  // Mensagens padrão por tipo
  const defaultMessages: Record<string, string> = {
    generator: '🤖 Gerando roteiro...',
    navigation: '📍 Carregando página...',
    data: '📊 Buscando dados...',
    ai: '🧠 Processando com IA...',
    generic: '⏳ Carregando...'
  };

  const displayMessage = message || defaultMessages[type] || defaultMessages.generic;

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
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="text-center space-y-4 p-6">
              {/* Loading spinner simples */}
              <motion.div
                className="w-12 h-12 mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full border-4 border-gray-200 border-t-primary rounded-full" />
              </motion.div>

              {/* Mensagem de loading */}
              <p className="text-gray-700 font-medium">{displayMessage}</p>
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

// Hook simplificado para gerenciamento de loading
export const useSmartLoading = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = React.useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T> => {
    startLoading();
    try {
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};
