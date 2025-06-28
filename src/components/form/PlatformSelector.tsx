import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { PLATFORM_OPTIONS } from '../../constants';
import { darkModeClasses, animationClasses } from '../../design-system/tokens';
import { PlatformLogo } from '../ui/PlatformLogos';
import { usePredictiveUX } from '../../hooks/usePredictiveUX';

type Platform = 'YouTube' | 'Instagram' | 'TikTok' | '';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  disabled?: boolean;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  selectedPlatform, 
  onPlatformChange, 
  disabled 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  // Phase 6: Enhanced state with loading simulation
  const [layoutState, setLayoutState] = useState({
    width: 0,
    scrollWidth: 0,
    hasOverflow: false,
    isLoading: false,
    loadingProgress: 0
  });
  
  // Phase 6: Predictive UX integration
  const { getSmartSuggestions } = usePredictiveUX({
    enablePreloading: true,
    enableSmartSuggestions: true,
  });
  
  // Memoized platform options to prevent re-computation
  const memoizedPlatformOptions = useMemo(() => PLATFORM_OPTIONS, []);
  
  // Phase 6: Smart suggestions based on user patterns  
  const smartSuggestions = useMemo(() => {
    return getSmartSuggestions('platform-selector').slice(0, 2);
  }, [getSmartSuggestions]);

  // Optimized update size function with useCallback
  const updateSize = useCallback(() => {
    if (!containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const scrollWidth = containerRef.current.scrollWidth;
    const hasOverflow = scrollWidth > width;
    
    // Only update if there's a meaningful change to prevent unnecessary re-renders
    setLayoutState(prev => {
      if (prev.width === width && prev.scrollWidth === scrollWidth && prev.hasOverflow === hasOverflow) {
        return prev;
      }
      
      return { ...prev, width, scrollWidth, hasOverflow };
    });
    
    // Debug overflow in development (throttled logging)
    if (process.env.NODE_ENV === 'development' && hasOverflow) {
      console.warn('🚨 PlatformSelector: Layout overflow detected!', {
        platformCount: memoizedPlatformOptions.length,
        containerWidth: width,
        scrollWidth: scrollWidth,
        overflow: scrollWidth - width
      });
    }
  }, [memoizedPlatformOptions.length]);
  
  // Enhanced overflow detection with proper cleanup
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    // Initial size check
    updateSize();
    
    // Create and setup resize observer with proper error handling
    try {
      resizeObserverRef.current = new ResizeObserver(() => {
        // Use requestAnimationFrame to batch updates
        requestAnimationFrame(updateSize);
      });
      
      resizeObserverRef.current.observe(element);
    } catch (error) {
      console.warn('ResizeObserver not supported, falling back to window resize');
    }
    
    // Window resize fallback
    const handleWindowResize = () => {
      requestAnimationFrame(updateSize);
    };
    
    window.addEventListener('resize', handleWindowResize, { passive: true });
    
    // Enhanced cleanup function
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [updateSize]);
  
  // Optimized platform change handler with useCallback
  const handlePlatformChange = useCallback((platform: Platform) => {
    if (!disabled) {
      onPlatformChange(platform);
    }
  }, [onPlatformChange, disabled]);
  
  // Memoized adaptive grid classes to prevent re-computation
  const adaptiveGridClasses = useMemo(() => {
    const baseClasses = "grid gap-3 w-full";
    
    // If overflow detected, use smaller grid
    if (layoutState.hasOverflow) {
      return `${baseClasses} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`;
    }
    
    // Standard responsive grid - improved to prevent overflow
    return `${baseClasses} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-${Math.min(memoizedPlatformOptions.length, 6)}`;
  }, [layoutState.hasOverflow, memoizedPlatformOptions.length]);
  
  // Memoized button classes function
  const getEnhancedButtonClasses = useCallback((option: { label: string; value: string }) => {
    const isSelected = selectedPlatform === option.label;
    
    const baseClasses = `
      relative border-2 rounded-xl font-medium text-center
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-3 focus:ring-offset-2
      min-h-[56px] flex flex-col items-center justify-center p-3
      ${animationClasses.themeTransition}
      group overflow-hidden
    `;
    
    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed border-border bg-muted text-muted-foreground`;
    }
    
    if (isSelected) {
      return `${baseClasses} 
        border-primary bg-primary/10 text-primary
        shadow-lg shadow-primary/20
        scale-[1.02] 
        ring-2 ring-primary/20 ring-offset-background
        dark:bg-primary/20 dark:border-primary
      `;
    }
    
    return `${baseClasses}
      ${darkModeClasses.card} border-border
      hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]
      hover:shadow-md hover:shadow-primary/10
      active:scale-[0.98]
      dark:hover:bg-primary/10 dark:hover:border-primary/30
    `;
  }, [selectedPlatform, disabled]);
  
  // Memoized text classes function
  const getTextClasses = useCallback((option: { label: string; value: string }) => {
    const isSelected = selectedPlatform === option.label;
    
    if (layoutState.hasOverflow) {
      return `text-xs mt-1 transition-colors duration-300 ${
        isSelected ? 'font-semibold' : 'font-medium'
      }`;
    }
    
    return `text-sm mt-2 transition-colors duration-300 ${
      isSelected ? 'font-semibold' : 'font-medium'
    }`;
  }, [selectedPlatform, layoutState.hasOverflow]);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-foreground mb-3">
        Plataforma <span className="text-destructive">*</span>
      </label>
      
      {/* Enhanced responsive grid with logos */}
      <div 
        ref={containerRef}
        className={adaptiveGridClasses}
        style={{
          maxWidth: '100%',
          overflow: 'hidden'
        }}
        role="group"
        aria-label="Seleção de plataforma"
      >
        {memoizedPlatformOptions.map((option) => {
          const isSelected = selectedPlatform === option.label;
          const platformValue = option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePlatformChange(option.label as Platform)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={getEnhancedButtonClasses(option)}
              style={{
                minWidth: 0,
                maxWidth: '100%'
              }}
            >
              {/* Platform Logo */}
              <div className="flex items-center justify-center mb-1">
                <PlatformLogo 
                  platform={platformValue}
                  selected={isSelected}
                  size={layoutState.hasOverflow ? 'sm' : 'md'}
                />
              </div>
              
              {/* Platform Name */}
              <span className={`truncate ${getTextClasses(option)}`}>
                {option.label}
              </span>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </button>
          );
        })}
      </div>
      
      {/* Development feedback */}
      {process.env.NODE_ENV === 'development' && layoutState.hasOverflow && (
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-200">
          ⚠️ Layout overflow detected - grid automatically adjusted
          <span className="text-muted-foreground ml-2">
            ({layoutState.scrollWidth}px → {layoutState.width}px)
          </span>
        </div>
      )}
      
      {/* Success indicator */}
      {process.env.NODE_ENV === 'development' && !layoutState.hasOverflow && layoutState.width > 0 && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400 opacity-75">
          ✅ Responsive layout working ({layoutState.width}px) • Logos loaded
        </div>
      )}
      
      {/* Selection feedback */}
      {selectedPlatform && (
        <div className="mt-3 text-xs text-muted-foreground">
          📱 Platform selected: <span className="font-medium text-foreground">{selectedPlatform}</span>
        </div>
      )}

      {/* Smart suggestions indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && smartSuggestions.length > 0 && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 opacity-75">
          🧠 Smart suggestions active: {smartSuggestions.length} patterns detected
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;
