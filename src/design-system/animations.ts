/**
 * 🎭 Animation & Motion Design Library
 * 
 * Migration-friendly animations for smooth user experience transitions
 * Built for accessibility, performance, and user comfort
 * 
 * Part of: WEEK 0 - IA Beta Design System Foundation
 * Integration: Migration framework compatibility + Performance monitoring (Charlie)
 */

import React from 'react';
import { transitions } from './tokens';

// ============================================================================
// CORE ANIMATION SYSTEM
// ============================================================================

/**
 * Animation preferences detection and respect for user settings
 */
export const getReducedMotionPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Base animation configuration with accessibility awareness
 */
export const createAnimation = (
  config: {
    duration?: string;
    easing?: string;
    delay?: string;
    fillMode?: string;
  },
  respectReducedMotion: boolean = true
) => {
  const reducedMotion = respectReducedMotion && getReducedMotionPreference();
  
  return {
    animationDuration: reducedMotion ? '0ms' : (config.duration || transitions.duration.normal),
    animationTimingFunction: config.easing || transitions.easing.easeOut,
    animationDelay: config.delay || '0ms',
    animationFillMode: config.fillMode || 'both'
  };
};

// ============================================================================
// MIGRATION-SPECIFIC ANIMATIONS
// ============================================================================

/**
 * Smooth migration entrance animations for new features
 */
export const migrationAnimations = {
  // Gentle introduction of new elements
  fadeInUp: {
    keyframes: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    animation: 'fadeInUp 400ms ease-out forwards'
  },

  // Highlighting new features without being intrusive
  highlightFeature: {
    keyframes: `
      @keyframes highlightFeature {
        0% {
          background-color: transparent;
          transform: scale(1);
        }
        50% {
          background-color: rgba(59, 130, 246, 0.1);
          transform: scale(1.02);
        }
        100% {
          background-color: transparent;
          transform: scale(1);
        }
      }
    `,
    animation: 'highlightFeature 1500ms ease-in-out'
  },

  // Smooth color transitions for brand updates
  colorMigration: {
    keyframes: `
      @keyframes colorMigration {
        from {
          background-color: var(--migration-from);
        }
        to {
          background-color: var(--migration-to);
        }
      }
    `,
    animation: 'colorMigration 800ms ease-in-out forwards'
  },

  // Progressive disclosure animation
  progressiveReveal: {
    keyframes: `
      @keyframes progressiveReveal {
        from {
          max-height: 0;
          opacity: 0;
          padding-top: 0;
          padding-bottom: 0;
        }
        to {
          max-height: 500px;
          opacity: 1;
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
      }
    `,
    animation: 'progressiveReveal 500ms ease-out forwards'
  }
};

// ============================================================================
// ANIMATION PRESETS & UTILITIES
// ============================================================================

/**
 * Pre-configured animation presets for common use cases
 */
export const animationPresets = {
  // Quick micro-interactions
  micro: {
    duration: transitions.duration.fast,
    easing: transitions.easing.easeOut
  },

  // Standard UI animations
  standard: {
    duration: transitions.duration.normal,
    easing: transitions.easing.easeInOut
  },

  // Dramatic feature introductions
  dramatic: {
    duration: transitions.duration.slow,
    easing: transitions.easing.bounce
  },

  // Smooth migrations
  migration: {
    duration: '500ms',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
};

/**
 * Accessibility-focused animation utilities
 */
export const accessibilityUtils = {
  // CSS for respecting reduced motion preference
  reducedMotionCSS: `
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `,

  // Focus indicator animation
  focusIndicator: {
    keyframes: `
      @keyframes focusIndicator {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
        }
        100% {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      }
    `,
    animation: 'focusIndicator 200ms ease-out forwards'
  }
};

/**
 * React hook for managing animations with accessibility
 */
export const useAnimation = () => {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const animate = React.useCallback((animationConfig: any) => {
    if (reducedMotion) {
      return { ...animationConfig, animation: 'none' };
    }
    return animationConfig;
  }, [reducedMotion]);

  return { animate, reducedMotion };
};

// ============================================================================
// EXPORT ALL ANIMATIONS
// ============================================================================

export const animations = {
  migration: migrationAnimations,
  presets: animationPresets,
  accessibility: accessibilityUtils,
  utils: {
    createAnimation,
    getReducedMotionPreference,
    useAnimation
  }
};

export default animations; 