/**
 * 📦 Container Component - Layout Foundation
 * 
 * Responsive container component with configurable breakpoints and spacing
 * Supports fluid and fixed layouts with nested container capabilities
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Advanced Components Task 2.4.2
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  HTMLAttributes 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { familiarElements } from '../../migration-patterns';

// ============================================================================
// CONTAINER TYPES & INTERFACES
// ============================================================================

export interface ContainerBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  padding?: string;
}

export interface ContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Container children */
  children: ReactNode;
  
  /** Container variant */
  variant?: 'fluid' | 'fixed' | 'constrained' | 'fullscreen';
  
  /** Container size */
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'full';
  
  /** Padding variant */
  padding?: 'none' | 'small' | 'medium' | 'large' | 'responsive';
  
  /** Margin variant */
  margin?: 'none' | 'small' | 'medium' | 'large' | 'auto';
  
  /** Center container horizontally */
  centered?: boolean;
  
  /** Container background */
  background?: 'none' | 'white' | 'neutral' | 'primary' | 'custom';
  
  /** Custom background color */
  customBackground?: string;
  
  /** Container border */
  border?: boolean;
  
  /** Container shadow */
  shadow?: 'none' | 'small' | 'medium' | 'large';
  
  /** Container overflow behavior */
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll';
  
  /** Container height */
  height?: 'auto' | 'full' | 'screen' | string | number;
  
  /** Custom breakpoints */
  breakpoints?: ContainerBreakpoint[];
  
  /** Enable responsive behavior */
  responsive?: boolean;
  
  /** Nested container (smaller max-width) */
  nested?: boolean;
  
  /** Container role for accessibility */
  role?: string;
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Container tag */
  as?: keyof JSX.IntrinsicElements;
}

// ============================================================================
// CONTAINER CONSTANTS
// ============================================================================

const DEFAULT_BREAKPOINTS: ContainerBreakpoint[] = [
  { name: 'sm', minWidth: 640, maxWidth: 640, padding: spacing[4] },
  { name: 'md', minWidth: 768, maxWidth: 768, padding: spacing[5] },
  { name: 'lg', minWidth: 1024, maxWidth: 1024, padding: spacing[6] },
  { name: 'xl', minWidth: 1280, maxWidth: 1280, padding: spacing[8] },
  { name: '2xl', minWidth: 1536, maxWidth: 1536, padding: spacing[10] }
];

const SIZE_CONFIG = {
  small: { maxWidth: '640px' },
  medium: { maxWidth: '768px' },
  large: { maxWidth: '1024px' },
  xlarge: { maxWidth: '1280px' },
  full: { maxWidth: '100%' }
};

// ============================================================================
// CONTAINER STYLES
// ============================================================================

const getContainerStyles = (
  variant: ContainerProps['variant'] = 'fixed',
  size: ContainerProps['size'] = 'large',
  padding: ContainerProps['padding'] = 'medium',
  margin: ContainerProps['margin'] = 'auto',
  centered: boolean = true,
  background: ContainerProps['background'] = 'none',
  customBackground: string | undefined,
  border: boolean = false,
  shadow: ContainerProps['shadow'] = 'none',
  overflow: ContainerProps['overflow'] = 'visible',
  height: ContainerProps['height'] = 'auto',
  nested: boolean = false,
  migrationMode: ContainerProps['migrationMode'] = 'enhanced',
  costTier: ContainerProps['costTier'] = 'free'
): React.CSSProperties => {
  
  // Base styles
  const baseStyles: React.CSSProperties = {
    width: '100%',
    position: 'relative',
    fontFamily: typography.fontFamily.sans
  };
  
  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    fluid: {
      maxWidth: '100%',
      width: '100%'
    },
    fixed: {
      maxWidth: SIZE_CONFIG[size].maxWidth,
      width: '100%'
    },
    constrained: {
      maxWidth: nested ? '90%' : SIZE_CONFIG[size].maxWidth,
      width: '100%'
    },
    fullscreen: {
      maxWidth: '100vw',
      width: '100vw',
      minHeight: '100vh'
    }
  };
  
  // Padding styles
  const paddingStyles: Record<string, React.CSSProperties> = {
    none: { padding: 0 },
    small: { padding: spacing[2] },
    medium: { padding: spacing[4] },
    large: { padding: spacing[6] },
    responsive: {
      padding: spacing[4],
      '@media (min-width: 768px)': { padding: spacing[6] },
      '@media (min-width: 1024px)': { padding: spacing[8] }
    }
  };
  
  // Margin styles
  const marginStyles: Record<string, React.CSSProperties> = {
    none: { margin: 0 },
    small: { margin: spacing[2] },
    medium: { margin: spacing[4] },
    large: { margin: spacing[6] },
    auto: { margin: centered ? '0 auto' : 0 }
  };
  
  // Background styles
  const backgroundStyles: Record<string, React.CSSProperties> = {
    none: { backgroundColor: 'transparent' },
    white: { backgroundColor: 'white' },
    neutral: { backgroundColor: colors.neutral[50] },
    primary: { 
      backgroundColor: costTier === 'premium' ? 
        colors.costTier.premium.background : 
        colors.primary[50] 
    },
    custom: { backgroundColor: customBackground || 'transparent' }
  };
  
  // Shadow styles
  const shadowStyles: Record<string, React.CSSProperties> = {
    none: { boxShadow: 'none' },
    small: { boxShadow: shadows.sm },
    medium: { boxShadow: shadows.md },
    large: { boxShadow: shadows.lg }
  };
  
  // Height styles
  const getHeightStyle = (): React.CSSProperties => {
    if (typeof height === 'string') {
      switch (height) {
        case 'auto':
          return { height: 'auto' };
        case 'full':
          return { height: '100%' };
        case 'screen':
          return { height: '100vh' };
        default:
          return { height };
      }
    }
    if (typeof height === 'number') {
      return { height: `${height}px` };
    }
    return { height: 'auto' };
  };
  
  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...marginStyles[margin],
    ...backgroundStyles[background],
    ...shadowStyles[shadow],
    ...getHeightStyle(),
    border: border ? `1px solid ${colors.neutral[200]}` : 'none',
    borderRadius: border && migrationMode === 'enhanced' ? borderRadius.lg : 0,
    overflow,
    transition: transitions.common.all
  };
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({
    children,
    variant = 'fixed',
    size = 'large',
    padding = 'medium',
    margin = 'auto',
    centered = true,
    background = 'none',
    customBackground,
    border = false,
    shadow = 'none',
    overflow = 'visible',
    height = 'auto',
    breakpoints = DEFAULT_BREAKPOINTS,
    responsive = true,
    nested = false,
    role,
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    as: Component = 'div',
    className = '',
    style,
    ...props
  }, ref) => {
    
    // Get computed styles
    const containerStyles = getContainerStyles(
      variant,
      size,
      padding,
      margin,
      centered,
      background,
      customBackground,
      border,
      shadow,
      overflow,
      height,
      nested,
      migrationMode,
      costTier
    );
    
    // Generate responsive CSS
    const getResponsiveCSS = () => {
      if (!responsive) return '';
      
      return breakpoints.map(bp => `
        @media (min-width: ${bp.minWidth}px) {
          .responsive-container-${trackingId || 'default'} {
            max-width: ${bp.maxWidth || bp.minWidth}px;
            padding: ${bp.padding || containerStyles.padding};
          }
        }
      `).join('\n');
    };
    
    // Analytics tracking
    React.useEffect(() => {
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'Container',
          action: 'container_rendered',
          variant,
          size,
          padding,
          background,
          migrationMode,
          costTier,
          trackingId,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
    }, [variant, size, padding, background, migrationMode, costTier, trackingId]);
    
    return (
      <>
        {/* Responsive CSS */}
        {responsive && (
          <style jsx>{getResponsiveCSS()}</style>
        )}
        
        <Component
          ref={ref}
          className={`
            design-system-container 
            ${responsive ? `responsive-container-${trackingId || 'default'}` : ''}
            ${className}
          `}
          style={{
            ...containerStyles,
            ...style
          }}
          role={role}
          data-variant={variant}
          data-size={size}
          data-padding={padding}
          data-background={background}
          data-migration-mode={migrationMode}
          data-cost-tier={costTier}
          data-tracking-id={trackingId}
          data-nested={nested}
          {...props}
        >
          {children}
        </Component>
      </>
    );
  }
);

Container.displayName = 'Container';

// ============================================================================
// CONTAINER VARIANTS
// ============================================================================

export const FluidContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'variant'>>(
  (props, ref) => <Container ref={ref} variant="fluid" {...props} />
);

export const FixedContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'variant'>>(
  (props, ref) => <Container ref={ref} variant="fixed" {...props} />
);

export const ConstrainedContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'variant'>>(
  (props, ref) => <Container ref={ref} variant="constrained" {...props} />
);

export const FullscreenContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'variant'>>(
  (props, ref) => <Container ref={ref} variant="fullscreen" {...props} />
);

// ============================================================================
// CONTAINER UTILITIES
// ============================================================================

export const ContainerUtils = {
  // Get container breakpoint
  getCurrentBreakpoint: (breakpoints: ContainerBreakpoint[] = DEFAULT_BREAKPOINTS): ContainerBreakpoint | null => {
    if (typeof window === 'undefined') return null;
    
    const width = window.innerWidth;
    return breakpoints
      .slice()
      .reverse()
      .find(bp => width >= bp.minWidth) || null;
  },
  
  // Check if container should be centered
  shouldCenter: (variant: ContainerProps['variant'], centered: boolean): boolean => {
    return centered && variant !== 'fluid' && variant !== 'fullscreen';
  },
  
  // Get responsive padding
  getResponsivePadding: (
    padding: ContainerProps['padding'],
    breakpoint: ContainerBreakpoint | null
  ): string => {
    if (padding === 'responsive' && breakpoint?.padding) {
      return breakpoint.padding;
    }
    
    const paddingMap = {
      none: '0',
      small: spacing[2],
      medium: spacing[4],
      large: spacing[6],
      responsive: spacing[4]
    };
    
    return paddingMap[padding || 'medium'];
  },
  
  // Calculate nested container max-width
  getNestedMaxWidth: (parentWidth: string, nesting: number = 1): string => {
    const baseWidth = parseFloat(parentWidth);
    const reduction = nesting * 0.1; // 10% reduction per nesting level
    return `${baseWidth * (1 - reduction)}px`;
  }
};

// ============================================================================
// CONTAINER HOOKS
// ============================================================================

export const useContainer = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<ContainerBreakpoint | null>(null);
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const bp = ContainerUtils.getCurrentBreakpoint();
      setCurrentBreakpoint(bp);
    };
    
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        setContainerSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };
    
    updateBreakpoint();
    updateSize();
    
    window.addEventListener('resize', updateBreakpoint);
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint);
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  return {
    currentBreakpoint,
    containerSize,
    isMobile: currentBreakpoint?.name === 'sm' || !currentBreakpoint,
    isTablet: currentBreakpoint?.name === 'md',
    isDesktop: currentBreakpoint && ['lg', 'xl', '2xl'].includes(currentBreakpoint.name)
  };
};

export const useResponsiveContainer = (breakpoints: ContainerBreakpoint[] = DEFAULT_BREAKPOINTS) => {
  const [activeBreakpoint, setActiveBreakpoint] = React.useState<ContainerBreakpoint | null>(null);
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      const bp = ContainerUtils.getCurrentBreakpoint(breakpoints);
      setActiveBreakpoint(bp);
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoints]);
  
  const getResponsiveValue = <T>(values: Record<string, T>, fallback: T): T => {
    if (!activeBreakpoint) return fallback;
    return values[activeBreakpoint.name] || fallback;
  };
  
  return {
    activeBreakpoint,
    getResponsiveValue,
    isBreakpoint: (name: string) => activeBreakpoint?.name === name,
    isAtLeast: (name: string) => {
      if (!activeBreakpoint) return false;
      const targetBp = breakpoints.find(bp => bp.name === name);
      if (!targetBp) return false;
      return activeBreakpoint.minWidth >= targetBp.minWidth;
    }
  };
};

// ============================================================================
// CONTAINER COMPOSITION HELPERS
// ============================================================================

export const ContainerComposition = {
  // Create a section with container
  Section: ({ title, children, ...containerProps }: ContainerProps & { title?: string }) => (
    <section>
      {title && (
        <Container padding="medium" size="large">
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing[6],
            color: colors.neutral[900]
          }}>
            {title}
          </h2>
        </Container>
      )}
      <Container {...containerProps}>
        {children}
      </Container>
    </section>
  ),
  
  // Create a hero section
  Hero: ({ children, ...containerProps }: ContainerProps) => (
    <Container
      variant="fullscreen"
      padding="large"
      background="primary"
      height="screen"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      {...containerProps}
    >
      {children}
    </Container>
  ),
  
  // Create a content wrapper
  Content: ({ children, ...containerProps }: ContainerProps) => (
    <Container
      variant="constrained"
      size="large"
      padding="responsive"
      margin="auto"
      {...containerProps}
    >
      {children}
    </Container>
  ),
  
  // Create a sidebar layout
  SidebarLayout: ({ 
    sidebar, 
    children, 
    sidebarWidth = '250px',
    ...containerProps 
  }: ContainerProps & { 
    sidebar: ReactNode; 
    sidebarWidth?: string; 
  }) => (
    <Container variant="fluid" padding="none" {...containerProps}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ 
          width: sidebarWidth, 
          flexShrink: 0,
          backgroundColor: colors.neutral[50],
          borderRight: `1px solid ${colors.neutral[200]}`
        }}>
          {sidebar}
        </aside>
        <main style={{ flex: 1, padding: spacing[6] }}>
          {children}
        </main>
      </div>
    </Container>
  )
};

// ============================================================================
// EXPORT ALL CONTAINER COMPONENTS
// ============================================================================

export default Container;

export {
  FluidContainer,
  FixedContainer,
  ConstrainedContainer,
  FullscreenContainer,
  ContainerUtils,
  ContainerComposition,
  DEFAULT_BREAKPOINTS,
  SIZE_CONFIG,
  type ContainerProps,
  type ContainerBreakpoint
}; 