/**
 * 🔄 PAGE LOADING SPINNER
 * Professional loading component for lazy-loaded pages
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, Package, FileText, AlertTriangle } from 'lucide-react';
import { Card } from './Card';
import { performanceService } from '../../services/performance';
import { logger } from '../../utils/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface PageLoadingSpinnerProps {
  message?: string;
  timeout?: number;
  showProgress?: boolean;
  variant?: 'minimal' | 'detailed' | 'branded';
}

interface LoadingStage {
  name: string;
  icon: React.ReactNode;
  duration: number;
  completed: boolean;
}

// =============================================================================
// PAGE LOADING SPINNER COMPONENT
// =============================================================================

export const PageLoadingSpinner: React.FC<PageLoadingSpinnerProps> = ({
  message = 'Carregando...',
  timeout = 10000,
  showProgress = true,
  variant = 'detailed'
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [startTime] = useState(performance.now());
  const [timedOut, setTimedOut] = useState(false);

  // Loading stages simulation
  const stages: LoadingStage[] = [
    { name: 'Inicializando...', icon: <Zap className="w-4 h-4" />, duration: 200, completed: false },
    { name: 'Carregando recursos...', icon: <Package className="w-4 h-4" />, duration: 800, completed: false },
    { name: 'Preparando interface...', icon: <FileText className="w-4 h-4" />, duration: 500, completed: false },
  ];

  // Track loading performance
  useEffect(() => {
    performanceService.recordMetric('page_loading_started', performance.now() - startTime, 'ms', 'loading');
    logger.debug('Page loading started', { message, variant }, 'PAGE_LOADING');

    return () => {
      const loadTime = performance.now() - startTime;
      performanceService.recordMetric('page_loading_duration', loadTime, 'ms', 'loading');
      logger.debug('Page loading completed', { 
        duration: `${loadTime.toFixed(2)}ms`,
        timedOut 
      }, 'PAGE_LOADING');
    };
  }, [startTime, message, variant, timedOut]);

  // Progress simulation
  useEffect(() => {
    if (!showProgress || variant === 'minimal') return;

    let currentProgress = 0;
    let stageIndex = 0;
    
    const interval = setInterval(() => {
      if (stageIndex < stages.length) {
        const stage = stages[stageIndex];
        currentProgress += (100 / stages.length) / (stage.duration / 50);
        
        if (currentProgress >= ((stageIndex + 1) / stages.length) * 100) {
          setCurrentStage(stageIndex + 1);
          stageIndex++;
        }
        
        setProgress(Math.min(currentProgress, 95)); // Never reach 100% in simulation
      }
    }, 50);

    return () => clearInterval(interval);
  }, [showProgress, variant, stages]);

  // Timeout handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
      logger.warn('Page loading timeout', { 
        timeout, 
        message,
        loadTime: performance.now() - startTime 
      }, 'PAGE_LOADING');
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, message, startTime]);

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // Branded variant
  if (variant === 'branded') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo/Brand */}
          <div className="mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotateY: [0, 180, 360]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl font-bold text-primary mb-2"
            >
              🎬
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">RoteiroPro</h1>
            <p className="text-muted-foreground">Gerando experiências incríveis</p>
          </div>

          {/* Loading indicator */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-muted border-t-primary rounded-full mx-auto mb-4"
          />
          
          <p className="text-sm text-muted-foreground">{message}</p>
        </motion.div>
      </div>
    );
  }

  // Detailed variant (default)
  return (
    <div className="flex items-center justify-center min-h-screen bg-background/50 backdrop-blur-sm">
      <Card className="p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Main loading animation */}
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-muted border-t-primary rounded-full mx-auto"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-primary" />
            </motion.div>
          </div>

          {/* Message */}
          <h3 className="text-lg font-semibold mb-2">{message}</h3>
          
          {/* Progress bar */}
          {showProgress && (
            <div className="mb-4">
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <motion.div 
                  className="bg-primary h-2 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};