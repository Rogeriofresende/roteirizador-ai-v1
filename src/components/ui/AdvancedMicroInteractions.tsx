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
 * Advanced Micro-interactions Component - Phase 6 Feature
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
  const { trackAction, predictions } = usePredictiveUX({ enableSmartSuggestions: predictiveHover });

  // Check if this element is predicted to be interacted with
  useEffect(() => {
    if (trackId && predictions.includes(trackId)) {
      setShowPredictiveHint(true);
      const timer = setTimeout(() => setShowPredictiveHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [trackId, predictions]);

  // Enhanced hover handler with predictive tracking
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    
    if (trackId) {
      trackAction({
        type: 'hover',
        target: trackId,
        timestamp: Date.now(),
        context: { elementType: type },
      });
    }
  }, [trackId, trackAction, type]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  // Enhanced click handler with visual feedback
  const handleClick = useCallback(async () => {
    if (!enhancedFeedback) {
      onClick?.();
      return;
    }

    setIsPressed(true);
    setIsLoading(true);

    if (trackId) {
      trackAction({
        type: 'click',
        target: trackId,
        timestamp: Date.now(),
        context: { elementType: type },
      });
    }

    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    try {
      await onClick?.();
    } finally {
      // Minimum animation duration for smooth UX
      setTimeout(() => {
        setIsPressed(false);
        setIsLoading(false);
      }, 150);
    }
  }, [enhancedFeedback, onClick, trackId, trackAction, type]);

  // Dynamic styles based on type and state
  const getInteractionStyles = () => {
    const baseStyles = 'transition-all duration-200 ease-out relative overflow-hidden';
    
    const stateStyles = {
      hover: isHovered ? 'transform scale-105' : '',
      pressed: isPressed ? 'transform scale-95' : '',
      loading: isLoading ? 'opacity-80' : '',
      predictive: showPredictiveHint ? 'ring-2 ring-blue-400/50 ring-offset-2' : '',
    };

    const typeStyles = {
      button: 'rounded-lg shadow-md hover:shadow-lg active:shadow-sm',
      card: 'rounded-xl shadow-sm hover:shadow-md active:shadow-xs',
      input: 'rounded-md focus-within:ring-2 focus-within:ring-primary/20',
      navigation: 'rounded-lg hover:bg-accent/50',
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
    >
      {/* Ripple effect overlay */}
      {enhancedFeedback && isPressed && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-current opacity-10 rounded-inherit animate-ping" />
        </div>
      )}

      {/* Predictive hint overlay */}
      {showPredictiveHint && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-inherit">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {children}
    </div>
  );
};

// Enhanced Button wrapper
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
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    {...props}
  >
    {children}
  </AdvancedMicroInteractions>
);

// Enhanced Card wrapper
export const PredictiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'data-track-id'?: string;
}> = ({ children, className = '', ...props }) => (
  <AdvancedMicroInteractions
    type="card"
    className={`border bg-card text-card-foreground ${className}`}
    {...props}
  >
    {children}
  </AdvancedMicroInteractions>
);
