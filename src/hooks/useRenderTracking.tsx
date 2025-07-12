/**
 * Performance Monitoring Hook - Week 4.3 Critical Fixes
 * Tracks component re-renders and detects infinite loops
 */

import React, { useEffect, useRef } from 'react';

interface RenderTrackingOptions {
  componentName: string;
  warningThreshold?: number;
  timeThreshold?: number;
  enableLogging?: boolean;
}

export const useRenderTracking = (options: RenderTrackingOptions) => {
  const {
    componentName,
    warningThreshold = 10,
    timeThreshold = 100,
    enableLogging = process.env.NODE_ENV === 'development'
  } = options;

  const renderCount = useRef(0);
  const lastRender = useRef(Date.now());
  const renderTimes = useRef<number[]>([]);
  const warningLogged = useRef(false);

  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRender.current;
    
    renderTimes.current.push(timeSinceLastRender);
    if (renderTimes.current.length > 20) {
      renderTimes.current.shift(); // Keep last 20 render times
    }

    // ✅ CRITICAL: Detect infinite loop patterns
    if (renderCount.current > warningThreshold && timeSinceLastRender < timeThreshold) {
      const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      
      if (!warningLogged.current && enableLogging) {
        console.warn(`🚨 INFINITE LOOP DETECTED: ${componentName}`, {
          renderCount: renderCount.current,
          timeSinceLastRender,
          averageRenderTime,
          recentRenderTimes: renderTimes.current.slice(-5)
        });
        warningLogged.current = true;
      }
    }

    // ✅ PERFORMANCE: Log performance metrics
    if (enableLogging && renderCount.current % 5 === 0) {
      const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      console.log(`📊 ${componentName} Performance:`, {
        renderCount: renderCount.current,
        averageRenderTime,
        lastRenderTime: timeSinceLastRender
      });
    }

    lastRender.current = now;
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0,
    isPerformanceGood: renderCount.current < warningThreshold,
    resetTracking: () => {
      renderCount.current = 0;
      renderTimes.current = [];
      warningLogged.current = false;
    }
  };
};

// ✅ UTILITY: Component wrapper for easy tracking
export const withRenderTracking = <T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) => {
  // Return a wrapper function instead of JSX
  return (props: T) => {
    const tracking = useRenderTracking({ componentName });
    return <Component {...props} />;
  };
}; 