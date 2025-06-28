import React, { useState, useEffect, useRef, useMemo } from 'react';

interface SmartLoadingProps {
  isLoading: boolean;
  progress?: number;
  stage?: string;
  estimatedTime?: number;
  type?: 'spinner' | 'progress' | 'skeleton' | 'adaptive';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showStage?: boolean;
  showTimeEstimate?: boolean;
  className?: string;
}

/**
 * Smart Loading Component - Phase 6 Feature
 * Provides intelligent loading states with progress prediction
 */
export const SmartLoading: React.FC<SmartLoadingProps> = ({
  isLoading,
  progress = 0,
  stage = 'Carregando...',
  estimatedTime,
  type = 'adaptive',
  size = 'md',
  showProgress = true,
  showStage = true,
  showTimeEstimate = true,
  className = '',
}) => {
  const [predictedProgress, setPredictedProgress] = useState(progress);
  const [remainingTime, setRemainingTime] = useState(estimatedTime || 0);
  const [loadingStages, setLoadingStages] = useState<string[]>([]);
  
  const startTimeRef = useRef<number>(Date.now());
  const progressHistoryRef = useRef<Array<{ progress: number; timestamp: number }>>([]);

  // Smart progress prediction based on history
  useEffect(() => {
    if (!isLoading) return;

    const currentTime = Date.now();
    const elapsed = currentTime - startTimeRef.current;
    
    // Add current progress to history
    progressHistoryRef.current.push({ progress, timestamp: currentTime });
    
    // Keep only last 10 data points
    if (progressHistoryRef.current.length > 10) {
      progressHistoryRef.current.shift();
    }

    // Calculate progress velocity and predict
    if (progressHistoryRef.current.length >= 2) {
      const recent = progressHistoryRef.current.slice(-3);
      const progressVelocity = recent.reduce((acc, curr, index) => {
        if (index === 0) return acc;
        const prev = recent[index - 1];
        const timeDiff = curr.timestamp - prev.timestamp;
        const progressDiff = curr.progress - prev.progress;
        return acc + (progressDiff / timeDiff) * 1000; // per second
      }, 0) / (recent.length - 1);

      // Predict remaining time
      const remainingProgress = 100 - progress;
      const predictedSeconds = progressVelocity > 0 ? remainingProgress / progressVelocity : 0;
      setRemainingTime(Math.max(0, predictedSeconds));

      // Smooth progress prediction
      const smoothProgress = Math.min(100, progress + (progressVelocity * 0.5));
      setPredictedProgress(smoothProgress);
    }
  }, [progress, isLoading]);

  // Reset on loading start
  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      progressHistoryRef.current = [];
      setLoadingStages([]);
    }
  }, [isLoading]);

  // Adaptive loading stages
  const currentStageInfo = useMemo(() => {
    const stages = [
      { threshold: 0, message: 'Iniciando...', icon: '🚀' },
      { threshold: 20, message: 'Carregando recursos...', icon: '📦' },
      { threshold: 50, message: 'Processando dados...', icon: '⚙️' },
      { threshold: 80, message: 'Finalizando...', icon: '✨' },
      { threshold: 95, message: 'Quase pronto!', icon: '🎯' },
    ];

    const currentStage = stages.reverse().find(s => predictedProgress >= s.threshold) || stages[0];
    return currentStage;
  }, [predictedProgress]);

  // Size configurations
  const sizeConfig = {
    sm: { spinner: 'w-4 h-4', text: 'text-xs', container: 'gap-2' },
    md: { spinner: 'w-6 h-6', text: 'text-sm', container: 'gap-3' },
    lg: { spinner: 'w-8 h-8', text: 'text-base', container: 'gap-4' },
  };

  const config = sizeConfig[size];

  if (!isLoading) return null;

  // Adaptive type selection based on progress availability
  const renderType = type === 'adaptive' 
    ? (progress > 0 ? 'progress' : 'spinner')
    : type;

  // Spinner variant
  if (renderType === 'spinner') {
    return (
      <div className={`flex items-center ${config.container} ${className}`}>
        <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${config.spinner}`} />
        {showStage && (
          <span className={`${config.text} text-muted-foreground animate-pulse`}>
            {currentStageInfo.icon} {stage}
          </span>
        )}
      </div>
    );
  }

  // Progress bar variant
  if (renderType === 'progress') {
    return (
      <div className={`space-y-2 ${className}`}>
        {showStage && (
          <div className="flex items-center justify-between">
            <span className={`${config.text} font-medium`}>
              {currentStageInfo.icon} {currentStageInfo.message}
            </span>
            {showTimeEstimate && remainingTime > 0 && (
              <span className={`${config.text} text-muted-foreground`}>
                ~{Math.ceil(remainingTime)}s
              </span>
            )}
          </div>
        )}
        
        {showProgress && (
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out relative"
                style={{ width: `${Math.min(100, predictedProgress)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Progress percentage */}
            <span className="absolute right-0 top-3 text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  // Skeleton variant
  if (renderType === 'skeleton') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="flex space-x-3">
          <div className="rounded-full bg-muted h-10 w-10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    );
  }

  return null;
};

// Enhanced loading hook for smart predictions
export const useSmartLoading = (initialProgress = 0) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [stage, setStage] = useState('');
  
  const startLoading = (initialStage = 'Iniciando...') => {
    setIsLoading(true);
    setProgress(0);
    setStage(initialStage);
  };

  const updateProgress = (newProgress: number, newStage?: string) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
    if (newStage) setStage(newStage);
  };

  const finishLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500);
  };

  return {
    isLoading,
    progress,
    stage,
    startLoading,
    updateProgress,
    finishLoading,
  };
};

// Shimmer animation for CSS
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.querySelector('#shimmer-keyframes')) {
  const style = document.createElement('style');
  style.id = 'shimmer-keyframes';
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}
