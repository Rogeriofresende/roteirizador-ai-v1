/**
 * 🎨 Design Tokens - Comprehensive Design System Foundation
 * 
 * Migration-friendly design tokens for smooth user experience transition
 * Built for accessibility, scalability, and brand consistency
 * 
 * Part of: WEEK 0 - IA Beta Design System Foundation
 * Integration: Migration framework compatibility + Alpha cost awareness + Charlie monitoring
 */

// ============================================================================
// COLOR PALETTE - MIGRATION-FRIENDLY COLORS
// ============================================================================

export const colors = {
  // Primary Brand Colors - V7.0 Enhanced Modern Palette
  primary: {
    50: '#f0f9ff',   // Ultra light - subtle backgrounds
    100: '#e0f2fe',  // Light - hover states  
    200: '#bae6fd',  // Light - disabled states
    300: '#7dd3fc',  // Medium light - secondary actions
    400: '#38bdf8',  // Medium - interactive elements
    500: '#0ea5e9',  // Main brand - primary buttons (modern blue)
    600: '#0284c7',  // Dark - hover states
    700: '#0369a1',  // Darker - active states
    800: '#075985',  // Very dark - text on light
    900: '#0c4a6e'   // Darkest - emphasis
  },

  // Secondary Colors - V7.0 Enhanced Modern Palette
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9', 
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },

  // V7.0 Enhanced: Modern Accent Colors
  accent: {
    50: '#fdf4ff',   // Purple accent - creative elements
    100: '#fae8ff',
    200: '#f3e8ff',
    300: '#e9d5ff',
    400: '#d8b4fe',
    500: '#c084fc',  // Main accent - creative highlights
    600: '#a855f7',
    700: '#9333ea',
    800: '#7c3aed',
    900: '#6b21a8'
  },

  // V7.0 Enhanced: Warm Accent Colors  
  warm: {
    50: '#fefce8',   // Warm accent - positive actions
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',  // Main warm - success/positive
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12'
  },

  // Success Colors - Positive feedback
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },

  // Warning Colors - Attention needed
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  // Error Colors - Critical feedback
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // Neutral Colors - Backgrounds and text
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b'
  },

  // Migration-specific colors for smooth transitions
  migration: {
    familiar: '#3b82f6',    // Existing brand color - keep familiar
    enhanced: '#667eea',     // Enhanced version - gentle upgrade
    transition: '#764ba2',   // Gradient transition color
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
    highlight: 'rgba(59, 130, 246, 0.1)', // Feature highlights
    success: 'rgba(16, 185, 129, 0.1)'     // Success state backgrounds
  },

  // Cost tier specific colors (Alpha integration)
  costTier: {
    free: {
      primary: '#6b7280',
      background: '#f9fafb',
      border: '#e5e7eb'
    },
    premium: {
      primary: '#f59e0b',
      background: '#fffbeb',
      border: '#fcd34d'
    }
  },

  // Semantic colors for specific contexts
  semantic: {
    link: '#3b82f6',
    linkHover: '#2563eb',
    focus: '#3b82f6',
    disabled: '#d1d5db',
    placeholder: '#9ca3af',
    divider: '#e5e7eb',
    backdrop: 'rgba(0, 0, 0, 0.5)'
  },

  // Text colors for consistent typography
  text: {
    primary: '#1f2937',     // Dark gray for primary text
    secondary: '#6b7280',   // Medium gray for secondary text
    muted: '#9ca3af',       // Light gray for muted text
    accent: '#3b82f6',      // Blue for accent text
    success: '#10b981',     // Green for success text
    warning: '#f59e0b',     // Amber for warning text
    error: '#ef4444',       // Red for error text
    inverse: '#ffffff'      // White for dark backgrounds
  }
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - SCALABLE AND ACCESSIBLE
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(', '),
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      '"Roboto Mono"',
      '"Cascadia Code"',
      '"Source Code Pro"',
      'monospace'
    ].join(', '),
    heading: [
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif'
    ].join(', ')
  },

  // Font sizes - Modular scale
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px - base size
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem'     // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Text styles for specific components
  textStyles: {
    // Headings
    h1: {
      fontSize: '3rem',
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em'
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '-0.025em'
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: '600',
      lineHeight: '1.375'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.375'
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.5'
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.5'
    },

    // Body text
    body: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.625'
    },
    bodyLarge: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.625'
    },
    bodySmall: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5'
    },

    // UI elements
    button: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.25'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25'
    }
  }
} as const;

// ============================================================================
// SPACING SYSTEM - CONSISTENT LAYOUT
// ============================================================================

export const spacing = {
  // Base spacing unit (4px)
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  7: '1.75rem',  // 28px
  8: '2rem',     // 32px
  9: '2.25rem',  // 36px
  10: '2.5rem',  // 40px
  11: '2.75rem', // 44px
  12: '3rem',    // 48px
  14: '3.5rem',  // 56px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  28: '7rem',    // 112px
  32: '8rem',    // 128px
  36: '9rem',    // 144px
  40: '10rem',   // 160px
  44: '11rem',   // 176px
  48: '12rem',   // 192px
  52: '13rem',   // 208px
  56: '14rem',   // 224px
  60: '15rem',   // 240px
  64: '16rem',   // 256px
  72: '18rem',   // 288px
  80: '20rem',   // 320px
  96: '24rem'    // 384px
} as const;

// ============================================================================
// SHADOWS - DEPTH AND ELEVATION
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // V7.0 Enhanced: Glass-morphism effects
  glass: {
    subtle: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
    medium: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.05)',
    strong: '0 16px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.07)'
  },

  // V7.0 Enhanced: Colored shadows for brand depth
  colored: {
    primary: '0 8px 25px -8px rgba(14, 165, 233, 0.3)',
    accent: '0 8px 25px -8px rgba(192, 132, 252, 0.25)',
    warm: '0 8px 25px -8px rgba(234, 179, 8, 0.25)',
    success: '0 8px 25px -8px rgba(16, 185, 129, 0.25)'
  },

  // V7.0 Enhanced: Interactive shadows
  interactive: {
    hover: '0 12px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)',
    active: '0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.08)',
    focus: '0 0 0 3px rgba(14, 165, 233, 0.12), 0 8px 25px -8px rgba(14, 165, 233, 0.3)'
  },

  // Focus shadows
  focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  focusError: '0 0 0 3px rgba(239, 68, 68, 0.1)',
  focusSuccess: '0 0 0 3px rgba(16, 185, 129, 0.1)',

  // Migration-specific shadows
  migration: {
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    enhanced: '0 4px 12px 0 rgba(59, 130, 246, 0.15)',
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }
} as const;

// ============================================================================
// BORDER RADIUS - ROUNDED CORNERS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'    // Fully rounded
} as const;

// ============================================================================
// Z-INDEX - STACKING ORDER
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const;

// ============================================================================
// BREAKPOINTS - RESPONSIVE DESIGN
// ============================================================================

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// ============================================================================
// TRANSITIONS - SMOOTH ANIMATIONS
// ============================================================================

export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms'
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Common transition combinations
  common: {
    colors: 'color 150ms ease-in-out, background-color 150ms ease-in-out, border-color 150ms ease-in-out',
    transform: 'transform 150ms ease-in-out',
    opacity: 'opacity 150ms ease-in-out',
    all: 'all 150ms ease-in-out'
  },

  // Migration-specific transitions
  migration: {
    fadeIn: 'opacity 300ms ease-out',
    slideIn: 'transform 300ms ease-out, opacity 300ms ease-out',
    scaleIn: 'transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 200ms ease-out',
    colorChange: 'background-color 500ms ease-in-out, color 500ms ease-in-out'
  }
} as const;

// ============================================================================
// COMPONENT VARIANTS - REUSABLE STYLES
// ============================================================================

export const variants = {
  // Button variants
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      color: 'white',
      borderColor: colors.primary[500],
      '&:hover': {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600]
      },
      '&:focus': {
        boxShadow: shadows.focus
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
      borderColor: colors.primary[500],
      '&:hover': {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[600]
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      borderColor: 'transparent',
      '&:hover': {
        backgroundColor: colors.neutral[100]
      }
    }
  },

  // Input variants
  input: {
    default: {
      backgroundColor: 'white',
      borderColor: colors.neutral[300],
      color: colors.neutral[900],
      '&:focus': {
        borderColor: colors.primary[500],
        boxShadow: shadows.focus
      },
      '&:error': {
        borderColor: colors.error[500],
        boxShadow: shadows.focusError
      }
    }
  },

  // Card variants
  card: {
    default: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.sm,
      borderColor: colors.neutral[200]
    },
    elevated: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md
    },
    interactive: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.sm,
      transition: transitions.common.all,
      '&:hover': {
        boxShadow: shadows.md,
        transform: 'translateY(-1px)'
      }
    }
  }
} as const;

// ============================================================================
// GLASS EFFECT - GLASS-MORPHISM STYLES
// ============================================================================

export const glassEffect = {
  light: 'rgba(255, 255, 255, 0.1)',
  medium: 'rgba(255, 255, 255, 0.2)',
  strong: 'rgba(255, 255, 255, 0.3)',
  
  // Dark mode variants
  dark: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    strong: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Subtle variants with transparency
  subtle: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.15)',
  }
} as const;

// ============================================================================
// THEME COMPOSITION - COMPLETE DESIGN SYSTEM
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  zIndex,
  breakpoints,
  transitions,
  variants,
  glassEffect
} as const;

// ============================================================================
// TYPE DEFINITIONS FOR TYPESCRIPT
// ============================================================================

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof shadows;
export type BorderRadius = typeof borderRadius;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;
export type Transitions = typeof transitions;
export type Variants = typeof variants;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color value with fallback
 */
export const getColor = (colorPath: string, fallback: string = colors.neutral[500]): string => {
  try {
    return colorPath.split('.').reduce((obj: any, key) => obj[key], colors) || fallback;
  } catch {
    return fallback;
  }
};

/**
 * Get spacing value with fallback
 */
export const getSpacing = (spaceKey: keyof typeof spacing): string => {
  return spacing[spaceKey] || spacing[4];
};

/**
 * Generate responsive styles
 */
export const responsive = (styles: Record<keyof typeof breakpoints, any>) => {
  return Object.entries(styles).reduce((acc, [breakpoint, style]) => {
    const bp = breakpoints[breakpoint as keyof typeof breakpoints];
    if (bp === '0px') {
      return { ...acc, ...style };
    }
    return {
      ...acc,
      [`@media (min-width: ${bp})`]: style
    };
  }, {});
};

/**
 * Create consistent focus styles
 */
export const focusStyles = (color: string = colors.primary[500]) => ({
  outline: 'none',
  boxShadow: `0 0 0 3px ${color}20` // 20 is hex for 12.5% opacity
});

/**
 * Migration-friendly color transition
 */
export const migrationTransition = (from: string, to: string) => ({
  background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
  transition: transitions.migration.colorChange
});

// ============================================================================
// DARK MODE CLASSES - THEME VARIANTS
// ============================================================================

export const darkModeClasses = {
  background: 'bg-neutral-900',
  text: 'text-neutral-100',
  border: 'border-neutral-700',
  card: 'bg-neutral-800',
  input: 'bg-neutral-800 border-neutral-600',
  hover: 'hover:bg-neutral-700',
  button: {
    primary: 'bg-primary-600 hover:bg-primary-700',
    secondary: 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100',
    ghost: 'hover:bg-neutral-700 text-neutral-300'
  },
  feedback: {
    button: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
    modal: 'bg-neutral-800 border-neutral-700',
    success: 'bg-green-800 border-green-700'
  }
} as const;

// ============================================================================
// ANIMATION CLASSES - TRANSITION UTILITIES
// ============================================================================

export const animationClasses = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  slideIn: 'animate-slide-in',
  scaleIn: 'animate-scale-in',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  themeTransition: 'transition-all duration-300 ease-in-out',
  // Migration-specific animations
  migration: {
    highlight: 'animate-highlight-feature',
    newFeature: 'animate-new-feature-intro',
    colorTransition: 'animate-color-migration'
  }
} as const;

export default theme; 