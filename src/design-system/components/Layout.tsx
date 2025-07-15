import React from 'react';
import { cn } from '../../lib/utils';
import { theme } from '../tokens';

// ============================================================================
// LAYOUT COMPONENTS - DESIGN SYSTEM APPLICATION
// ============================================================================

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'centered' | 'dashboard' | 'generator';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  className,
  variant = 'default'
}) => {
  const layoutStyles = {
    default: 'min-h-screen bg-neutral-50',
    centered: 'min-h-screen bg-neutral-50 flex items-center justify-center',
    dashboard: 'min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100',
    generator: 'min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50'
  };

  return (
    <div className={cn(layoutStyles[variant], className)}>
      {title && (
        <header className="bg-white border-b border-neutral-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 
                className="text-4xl font-bold text-neutral-900 tracking-tight"
                style={{
                  fontSize: theme.typography.textStyles.h1.fontSize,
                  fontWeight: theme.typography.textStyles.h1.fontWeight,
                  lineHeight: theme.typography.textStyles.h1.lineHeight,
                  letterSpacing: theme.typography.textStyles.h1.letterSpacing
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p 
                  className="mt-4 text-neutral-600"
                  style={{
                    fontSize: theme.typography.textStyles.bodyLarge.fontSize,
                    lineHeight: theme.typography.textStyles.bodyLarge.lineHeight
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

// ============================================================================
// SECTION LAYOUTS - CONSISTENT SPACING
// ============================================================================

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
  background?: 'white' | 'neutral' | 'primary' | 'accent';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  spacing = 'normal',
  background = 'white'
}) => {
  const spacingStyles = {
    tight: 'py-8',
    normal: 'py-12',
    loose: 'py-20'
  };

  const backgroundStyles = {
    white: 'bg-white',
    neutral: 'bg-neutral-50',
    primary: 'bg-primary-50',
    accent: 'bg-accent-50'
  };

  return (
    <section className={cn(
      backgroundStyles[background],
      spacingStyles[spacing],
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

// ============================================================================
// GRID LAYOUTS - RESPONSIVE DESIGN
// ============================================================================

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  className
}) => {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={cn(
      'grid',
      colStyles[cols],
      gapStyles[gap],
      className
    )}>
      {children}
    </div>
  );
};

// ============================================================================
// CARD LAYOUTS - CONSISTENT ELEVATION
// ============================================================================

interface CardLayoutProps {
  children: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardLayout: React.FC<CardLayoutProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className
}) => {
  const variantStyles = {
    flat: 'bg-white border border-neutral-200',
    elevated: 'bg-white shadow-md border border-neutral-100',
    interactive: 'bg-white shadow-md border border-neutral-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1'
  };

  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={cn(
        'rounded-lg',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      style={{
        borderRadius: theme.borderRadius.lg,
        boxShadow: variant === 'elevated' ? theme.shadows.md : 
                  variant === 'interactive' ? theme.shadows.lg : 'none'
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// TYPOGRAPHY COMPONENTS - DESIGN SYSTEM TYPOGRAPHY
// ============================================================================

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'accent';
}

export const Heading: React.FC<HeadingProps> = ({
  level,
  children,
  className,
  color = 'default'
}) => {
  // 🛡️ CRITICAL FIX: Validate level prop to prevent hundefined
  const validatedLevel = (typeof level === 'number' && level >= 1 && level <= 6) ? level : 3;
  const Tag = `h${validatedLevel}` as keyof JSX.IntrinsicElements;
  
  // 🛡️ DEFENSIVE PROGRAMMING - Robust fallback system
  const defaultTextStyles = {
    h1: { fontSize: '3rem', fontWeight: '700', lineHeight: '1.25', letterSpacing: '-0.025em' },
    h2: { fontSize: '2.25rem', fontWeight: '600', lineHeight: '1.25', letterSpacing: '-0.025em' },
    h3: { fontSize: '1.875rem', fontWeight: '600', lineHeight: '1.375', letterSpacing: 'normal' },
    h4: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.375', letterSpacing: 'normal' },
    h5: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.5', letterSpacing: 'normal' },
    h6: { fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.5', letterSpacing: 'normal' }
  };
  
  const styleKey = `h${validatedLevel}` as keyof typeof defaultTextStyles;
  
  // Multi-layer fallback for maximum stability
  const textStyle = 
    (theme?.typography?.textStyles?.[styleKey as keyof typeof theme.typography.textStyles]) ||
    defaultTextStyles[styleKey] ||
    defaultTextStyles.h3; // Ultimate fallback

  const colorStyles = {
    default: 'text-neutral-900',
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    accent: 'text-accent-600'
  };

  return (
    <Tag 
      className={cn(colorStyles[color], className)}
      style={{
        fontSize: textStyle?.fontSize || '1rem',
        fontWeight: textStyle?.fontWeight || '400',
        lineHeight: textStyle?.lineHeight || '1.5',
        letterSpacing: textStyle?.letterSpacing || 'normal'
      }}
    >
      {children}
    </Tag>
  );
};

interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label';
  color?: 'default' | 'muted' | 'primary' | 'error' | 'success';
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'default',
  className
}) => {
  // Safe access to textStyles with fallback
  const textStyle = theme.typography?.textStyles?.[variant] || theme.typography?.textStyles?.body || {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.625'
  };

  const colorStyles = {
    default: 'text-neutral-900',
    muted: 'text-neutral-600',
    primary: 'text-primary-600',
    error: 'text-error-600',
    success: 'text-success-600'
  };

  return (
    <p 
      className={cn(colorStyles[color], className)}
      style={{
        fontSize: textStyle.fontSize,
        fontWeight: textStyle.fontWeight,
        lineHeight: textStyle.lineHeight
      }}
    >
      {children}
    </p>
  );
};

// ============================================================================
// SPACER COMPONENT - CONSISTENT SPACING
// ============================================================================

interface SpacerProps {
  size?: keyof typeof theme.spacing;
  className?: string;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 8, className }) => {
  return (
    <div 
      className={className}
      style={{
        height: theme.spacing[size]
      }}
    />
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export const Layout = {
  Page: PageLayout,
  Section,
  Grid,
  Card: CardLayout,
  Heading,
  Text,
  Spacer
}; 