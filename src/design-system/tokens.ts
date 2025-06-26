/**
 * Design Tokens - RoteiroPro
 * Professional responsive design system foundation
 */

export const tokens = {
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  breakpoints: {
    mobile: '320px',
    tablet: '768px', 
    desktop: '1024px',
    wide: '1440px'
  },
  
  containers: {
    mobile: '100%',
    tablet: '750px',
    desktop: '1200px', 
    wide: '1400px'
  },
  
  gridCols: {
    mobile: 2,
    tablet: 3,
    desktop: 6,
    wide: 8
  },
  
  touchTargets: {
    minimum: '44px', // Apple/Google standard
    comfortable: '48px',
    large: '56px'
  },
  
  animations: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms'
  }
} as const;

// Type-safe breakpoint utilities
export type Breakpoint = keyof typeof tokens.breakpoints;
export type SpacingToken = keyof typeof tokens.spacing;

// Responsive grid utilities
export const responsiveGridClasses = {
  // Platform selector pattern (usado no fix)
  platformGrid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2',
  
  // Button groups
  buttonGroup: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2',
  
  // Card layouts
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  
  // Form layouts  
  formGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  
  // Dashboard layouts
  dashboardGrid: 'grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6'
} as const;

// Touch-friendly button classes
export const touchButtonClasses = {
  small: `min-h-[${tokens.touchTargets.minimum}] px-3 py-2`,
  medium: `min-h-[${tokens.touchTargets.comfortable}] px-4 py-3`,
  large: `min-h-[${tokens.touchTargets.large}] px-6 py-4`
} as const; 