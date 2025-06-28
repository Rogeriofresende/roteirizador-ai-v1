/**
 * Design Tokens - RoteiroPro
 * Professional responsive design system foundation
 * Enhanced with dark mode support and UX utilities
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
    slow: '300ms',
    themeTransition: '300ms cubic-bezier(0.2, 0, 0, 1)'
  },
  
  // Enhanced dark mode colors
  darkMode: {
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
    },
    contrast: {
      high: '0.95',
      medium: '0.8',
      low: '0.6'
    }
  },
  
  // Accessibility improvements
  accessibility: {
    focusRing: '2px solid hsl(var(--ring))',
    minClickTarget: '44px',
    highContrast: '4.5:1' // WCAG AA standard
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
  dashboardGrid: 'grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  
  // Enhanced feedback layouts
  feedbackGrid: 'grid grid-cols-2 gap-2',
  
  // Rating system layout
  ratingGrid: 'flex gap-1 justify-center'
} as const;

// Touch-friendly button classes
export const touchButtonClasses = {
  small: `min-h-[${tokens.touchTargets.minimum}] px-3 py-2`,
  medium: `min-h-[${tokens.touchTargets.comfortable}] px-4 py-3`,
  large: `min-h-[${tokens.touchTargets.large}] px-6 py-4`
} as const;

// Dark mode utility classes
export const darkModeClasses = {
  // Theme-aware backgrounds
  card: 'bg-card text-card-foreground border-border',
  modal: 'bg-background text-foreground border-border shadow-xl',
  input: 'bg-muted border-border text-foreground placeholder:text-muted-foreground',
  
  // Theme-aware states
  hover: 'hover:bg-accent hover:text-accent-foreground',
  focus: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  active: 'active:bg-accent/90',
  
  // Enhanced feedback components
  feedback: {
    button: 'bg-white/90 dark:bg-card/90 backdrop-blur-sm border-border text-foreground hover:bg-accent hover:text-accent-foreground',
    modal: 'bg-background border-border text-foreground shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)]',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
  },
  
  // Platform selector enhancements
  platform: {
    unselected: 'bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary hover:border-border',
    selected: 'bg-primary text-primary-foreground border-primary shadow-md',
    disabled: 'bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed'
  }
} as const;

// Animation utility classes
export const animationClasses = {
  // Theme transitions
  themeTransition: `transition-all duration-[${tokens.animations.themeTransition}] ease-out`,
  
  // Component animations
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  
  // Interactive states
  hoverScale: 'hover:scale-[1.02] transition-transform duration-200',
  tapScale: 'active:scale-[0.98] transition-transform duration-100'
} as const;

// Utility functions for theme-aware styling
export const getThemeClass = (lightClass: string, darkClass: string) => 
  `${lightClass} dark:${darkClass}`;

export const getShadowClass = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => 
  `shadow-${size} dark:shadow-[${tokens.darkMode.shadows[size]}]`;

// Typography scale with dark mode support
export const typographyClasses = {
  heading: {
    h1: 'text-3xl font-bold tracking-tight text-foreground',
    h2: 'text-2xl font-semibold tracking-tight text-foreground',
    h3: 'text-xl font-semibold text-foreground',
    h4: 'text-lg font-medium text-foreground'
  },
  body: {
    large: 'text-base text-foreground',
    medium: 'text-sm text-foreground',
    small: 'text-xs text-muted-foreground'
  },
  interactive: {
    button: 'text-sm font-medium',
    link: 'text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline'
  }
} as const; 