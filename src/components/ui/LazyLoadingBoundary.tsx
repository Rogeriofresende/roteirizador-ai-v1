/**
 * 🎯 LAZY LOADING BOUNDARY
 * Professional boundary component for lazy-loaded components with performance tracking
 */

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { PageLoadingSpinner, PageSkeleton } from './PageLoadingSpinner';
import { performanceService } from '../../services/performance';
import { logger } from '../../utils/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface LazyLoadingBoundaryProps {
  children: React.ReactNode;
  name: string;
  fallback?: React.ReactNode;
  skeleton?: 'page' | 'dashboard' | 'form' | 'none';
  timeout?: number;
  retryCount?: number;
  showPerformanceHints?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  hasError: boolean;
  isRetrying: boolean;
  startTime: number;
  retryAttempts: number;
  isOnline: boolean;
}

// =============================================================================
// ERROR FALLBACK COMPONENT
// =============================================================================

const LazyLoadingErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
  componentName: string;
  isOnline: boolean;
  retryAttempts: number;
  maxRetries: number;
}> = ({ 
  error, 
  resetErrorBoundary, 
  componentName, 
  isOnline, 
  retryAttempts, 
  maxRetries 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    logger.info('Retrying lazy component load', {
      component: componentName,
      attempt: retryAttempts + 1,
      error: error.message
    }, 'LAZY_LOADING');
    
    resetErrorBoundary();
    setIsRetrying(false);
  };

  const getErrorMessage = () => {
    if (!isOnline) {
      return {
        title: 'Sem conexão',
        description: 'Verifique sua conexão com a internet e tente novamente.',
        icon: <WifiOff className="w-6 h-6 text-red-500" />
      };
    }
    
    if (error.message.includes('Loading chunk')) {
      return {
        title: 'Erro ao carregar componente',
        description: 'Houve um problema ao carregar esta seção. Isso pode ocorrer após atualizações.',
        icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />
      };
    }
    
    return {
      title: 'Erro inesperado',
      description: 'Ocorreu um erro ao carregar o componente. Tente recarregar a página.',
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />
    };
  };

  const errorInfo = getErrorMessage();
  const canRetry = retryAttempts < maxRetries;

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Error icon */}
          <div className="mb-4">
            {errorInfo.icon}
          </div>

          {/* Error message */}
          <h3 className="text-lg font-semibold mb-2">{errorInfo.title}</h3>
          <p className="text-muted-foreground mb-4">{errorInfo.description}</p>

          {/* Component details */}
          <div className="text-xs text-muted-foreground mb-6 p-3 bg-muted/50 rounded">
            <div>Componente: {componentName}</div>
            <div>Tentativas: {retryAttempts}/{maxRetries}</div>
            <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {canRetry && (
              <Button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Tentando novamente...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </>
                )}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Recarregar Página
            </Button>
          </div>

          {/* Performance hint */}
          <div className="mt-4 text-xs text-muted-foreground">
            💡 Este erro pode ocorrer após atualizações do sistema
          </div>
        </motion.div>
      </Card>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const LazyLoadingBoundary: React.FC<LazyLoadingBoundaryProps> = ({
  children,
  name,
  fallback,
  skeleton = 'page',
  timeout = 10000,
  retryCount = 3,
  showPerformanceHints = true
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    hasError: false,
    isRetrying: false,
    startTime: performance.now(),
    retryAttempts: 0,
    isOnline: navigator.onLine
  });

  // Track online status
  useEffect(() => {
    const handleOnline = () => setLoadingState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setLoadingState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Performance tracking
  useEffect(() => {
    performanceService.recordMetric(
      `lazy_component_start_${name}`,
      0,
      'ms',
      'loading',
      { component: name }
    );

    logger.debug('Lazy component loading started', { 
      component: name,
      timestamp: new Date().toISOString()
    }, 'LAZY_LOADING');

    return () => {
      const loadTime = performance.now() - loadingState.startTime;
      performanceService.recordMetric(
        `lazy_component_load_${name}`,
        loadTime,
        'ms',
        'loading',
        { 
          component: name,
          success: !loadingState.hasError,
          retryAttempts: loadingState.retryAttempts
        }
      );

      logger.debug('Lazy component loading completed', {
        component: name,
        duration: `${loadTime.toFixed(2)}ms`,
        success: !loadingState.hasError,
        retryAttempts: loadingState.retryAttempts
      }, 'LAZY_LOADING');
    };
  }, [name, loadingState.startTime, loadingState.hasError, loadingState.retryAttempts]);

  // Error boundary handler
  const handleError = (error: Error, errorInfo: any) => {
    setLoadingState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false
    }));

    logger.error('Lazy component loading failed', {
      component: name,
      error: error.message,
      stack: error.stack,
      retryAttempts: loadingState.retryAttempts
    }, 'LAZY_LOADING');

    // Track error in performance service
    performanceService.recordMetric(
      `lazy_component_error_${name}`,
      performance.now() - loadingState.startTime,
      'ms',
      'loading',
      {
        component: name,
        error: error.message,
        retryAttempts: loadingState.retryAttempts
      }
    );
  };

  // Reset error boundary
  const resetError = () => {
    setLoadingState(prev => ({
      ...prev,
      hasError: false,
      isLoading: true,
      isRetrying: true,
      startTime: performance.now(),
      retryAttempts: prev.retryAttempts + 1
    }));
  };

  // Custom fallback based on skeleton type
  const getFallback = () => {
    if (fallback) return fallback;

    if (skeleton === 'none') {
      return <PageLoadingSpinner variant="minimal" />;
    }

    return (
      <div>
        <PageSkeleton variant={skeleton} />
        {showPerformanceHints && (
          <div className="text-center mt-4">
            <div className="text-xs text-muted-foreground">
              ⚡ Carregando {name} otimizado
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <LazyLoadingErrorFallback
          {...props}
          componentName={name}
          isOnline={loadingState.isOnline}
          retryAttempts={loadingState.retryAttempts}
          maxRetries={retryCount}
        />
      )}
      onError={handleError}
      onReset={resetError}
      resetKeys={[name, loadingState.retryAttempts]}
    >
      <Suspense fallback={getFallback()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${name}-${loadingState.retryAttempts}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook para preload de componentes lazy
 */
export const useLazyPreload = () => {
  const preloadComponent = useCallback((importFn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    return importFn().catch(error => {
      logger.warn('Component preload failed', { error: error.message }, 'LAZY_LOADING');
    });
  }, []);

  return { preloadComponent };
};

/**
 * Hook para tracking de lazy loading performance
 */
export const useLazyLoadingMetrics = (componentName: string) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    isLoading: true,
    hasError: false
  });

  useEffect(() => {
    const startTime = performance.now();
    setMetrics(prev => ({ ...prev, isLoading: true }));

    return () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ 
        ...prev, 
        loadTime,
        isLoading: false 
      }));

      // Record metric
      performanceService.recordMetric(
        `component_load_${componentName}`,
        loadTime,
        'ms',
        'loading',
        { component: componentName }
      );
    };
  }, [componentName]);

  return metrics;
};

export default LazyLoadingBoundary; 