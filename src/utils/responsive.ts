/**
 * Responsive Utilities - Professional Grade
 * Breakpoint detection, layout management, and responsive helpers
 */

import { useState, useEffect } from 'react';
import { tokens } from '../design-system/tokens';

// Breakpoint detection hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<keyof typeof tokens.breakpoints>('mobile');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= parseInt(tokens.breakpoints.wide)) setBreakpoint('wide');
      else if (width >= parseInt(tokens.breakpoints.desktop)) setBreakpoint('desktop');
      else if (width >= parseInt(tokens.breakpoints.tablet)) setBreakpoint('tablet');
      else setBreakpoint('mobile');
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
};

// Screen size utilities
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return screenSize;
};

// Layout overflow detection
export const useOverflowDetection = (containerRef: React.RefObject<HTMLElement>) => {
  const [hasOverflow, setHasOverflow] = useState(false);
  
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth } = containerRef.current;
        setHasOverflow(scrollWidth > clientWidth);
      }
    };
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, [containerRef]);
  
  return hasOverflow;
};

// Responsive class generator
export const getResponsiveClasses = (config: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  wide?: string;
}) => {
  const classes = [];
  
  if (config.mobile) classes.push(config.mobile);
  if (config.tablet) classes.push(`md:${config.tablet}`);
  if (config.desktop) classes.push(`lg:${config.desktop}`);
  if (config.wide) classes.push(`xl:${config.wide}`);
  
  return classes.join(' ');
};

// Grid column calculator for responsive layouts
export const getResponsiveGridCols = (itemCount: number, maxCols: number = 6) => {
  if (itemCount <= 2) return 'grid-cols-1 sm:grid-cols-2';
  if (itemCount <= 3) return 'grid-cols-2 md:grid-cols-3';
  if (itemCount <= 4) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  if (itemCount <= 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
  return `grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(maxCols, 6)}`;
};

// Touch target validator
export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const minSize = parseInt(tokens.touchTargets.minimum);
  return rect.width >= minSize && rect.height >= minSize;
};

// Container query utility (for future CSS container queries)
export const getContainerClasses = (size: 'sm' | 'md' | 'lg' | 'xl' = 'lg') => {
  const containerMap = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  };
  
  return `${containerMap[size]} mx-auto px-4 sm:px-6 lg:px-8`;
};

// Debugging utilities for development
export const debugResponsive = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Responsive Debug Info:', {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      breakpoint: window.innerWidth >= 1440 ? 'wide' : 
                  window.innerWidth >= 1024 ? 'desktop' :
                  window.innerWidth >= 768 ? 'tablet' : 'mobile',
      userAgent: navigator.userAgent
    });
  }
}; 