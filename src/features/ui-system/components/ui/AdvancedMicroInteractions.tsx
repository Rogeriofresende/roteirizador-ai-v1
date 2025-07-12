import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'button' | 'card' | 'input' | 'navigation';
  enhancedFeedback?: boolean;
  predictiveHover?: boolean;
  className?: string;
  onClick?: () => void;
  'data-track-id'?: string;
}

/**
 * V5.1 Enhanced Framework - Advanced Micro-interactions Component
 * Provides premium visual feedback and predictive hover states
 */
export const AdvancedMicroInteractions: React.FC<MicroInteractionProps> = ({
  children,
  type = 'button',
  enhancedFeedback = true,
  predictiveHover = true,
  className = '',
  onClick,
  'data-track-id': trackId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictiveHint, setShowPredictiveHint] = useState(false);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const { trackAction, isPredictedAction, getMostLikelyNext } = usePredictiveUX();

  // V5.1: Enhanced predictive behavior
  useEffect(() => {
    if (trackId && predictiveHover) {
      const prediction = getMostLikelyNext();
      if (prediction && prediction.action.includes(trackId) && prediction.confidence > 0.7) {
        setShowPredictiveHint(true);
        const timer = setTimeout(() => setShowPredictiveHint(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [trackId, predictiveHover, getMostLikelyNext]);

  // Enhanced hover handler with predictive tracking
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    
    if (trackId) {
      trackAction('hover', trackId, { elementType: type });
    }
  }, [trackId, trackAction, type]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  // V5.1: Enhanced click handler with smart feedback
  const handleClick = useCallback(async () => {
    if (!enhancedFeedback) {
      onClick?.();
      return;
    }

    setIsPressed(true);
    setIsLoading(true);

    if (trackId) {
      const wasPredicted = isPredictedAction('click', trackId);
      trackAction('click', trackId, { 
        elementType: type,
        wasPredicted,
        predictionAccuracy: wasPredicted ? 'correct' : 'unexpected'
      });
    }

    // V5.1: Smart haptic feedback based on importance
    if ('vibrate' in navigator) {
      const vibrationPattern = type === 'button' ? [10] : [5];
      navigator.vibrate(vibrationPattern);
    }

    try {
      await onClick?.();
    } finally {
      // V5.1: Adaptive animation duration based on predicted action
      const animationDuration = showPredictiveHint ? 100 : 150;
      setTimeout(() => {
        setIsPressed(false);
        setIsLoading(false);
      }, animationDuration);
    }
  }, [enhancedFeedback, onClick, trackId, trackAction, type, isPredictedAction, showPredictiveHint]);

  // V5.1: Enhanced dynamic styles with predictive states
  const getInteractionStyles = () => {
    const baseStyles = 'transition-all duration-200 ease-out relative overflow-hidden';
    
    const stateStyles = {
      hover: isHovered ? 'transform scale-105 brightness-110' : '',
      pressed: isPressed ? 'transform scale-95' : '',
      loading: isLoading ? 'opacity-80 cursor-wait' : '',
      predictive: showPredictiveHint ? 'ring-2 ring-blue-400/60 ring-offset-2 shadow-lg shadow-blue-400/20' : '',
    };

    const typeStyles = {
      button: 'rounded-lg shadow-md hover:shadow-lg active:shadow-sm cursor-pointer',
      card: 'rounded-xl shadow-sm hover:shadow-md active:shadow-xs cursor-pointer',
      input: 'rounded-md focus-within:ring-2 focus-within:ring-primary/20',
      navigation: 'rounded-lg hover:bg-accent/50 cursor-pointer',
    };

    return [
      baseStyles,
      typeStyles[type],
      stateStyles.hover,
      stateStyles.pressed,
      stateStyles.loading,
      stateStyles.predictive,
      className,
    ].filter(Boolean).join(' ');
  };

  return (
    <div
      ref={elementRef}
      className={getInteractionStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-track-id={trackId}
      role={type === 'button' ? 'button' : undefined}
      tabIndex={type === 'button' ? 0 : undefined}
    >
      {/* V5.1: Enhanced ripple effect overlay */}
      {enhancedFeedback && isPressed && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-current opacity-10 rounded-inherit animate-ping" />
          <div className="absolute inset-0 bg-gradient-radial from-current/20 to-transparent rounded-inherit animate-pulse" />
        </div>
      )}

      {/* V5.1: Enhanced predictive hint overlay */}
      {showPredictiveHint && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-blue-300 rounded-full animate-ping absolute top-0 right-0" />
        </div>
      )}

      {/* V5.1: Enhanced loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-inherit">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {children}
    </div>
  );
};

// V5.1 Enhanced Button wrapper
export const PredictiveButton: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  'data-track-id'?: string;
}> = ({ children, className = '', disabled, ...props }) => (
  <AdvancedMicroInteractions
    type="button"
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
    enhancedFeedback={!disabled}
    {...props}
  >
    {children}
  </AdvancedMicroInteractions>
);

// V5.1 Enhanced Card wrapper
export const PredictiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'data-track-id'?: string;
}> = ({ children, className = '', ...props }) => (
  <AdvancedMicroInteractions
    type="card"
    className={`border bg-card text-card-foreground hover:border-accent-foreground/20 ${className}`}
    {...props}
  >
    {children}
  </AdvancedMicroInteractions>
);

// V5.1: New Navigation wrapper for predictive navigation
export const PredictiveNavigation: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'data-track-id'?: string;
}> = ({ children, className = '', ...props }) => (
  <AdvancedMicroInteractions
    type="navigation"
    className={`transition-colors duration-200 ${className}`}
    predictiveHover={true}
    {...props}
  >
    {children}
  </AdvancedMicroInteractions>
);
