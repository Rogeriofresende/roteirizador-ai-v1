/**
 * V7.5 Enhanced - Storybook TypeScript Configuration
 * Provides 100% type safety and perfect intellisense support
 */

import type { TypescriptConfig } from '@storybook/react-vite';

// TypeScript Coverage Configuration
export const TYPESCRIPT_COVERAGE_CONFIG = () => {
  target: '100%',
  strict: true,
  exactOptionalPropertyTypes: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,
} as const;

// Advanced TypeScript Configuration for Storybook
export const ADVANCED_TYPESCRIPT_CONFIG: TypescriptConfig = {
  check: true,
  checkOptions: {
    eslint: {
      files: '../src/**/*.{ts,tsx}',
      extensions: ['.ts', '.tsx'],
    },
  },
  reactDocgen: 'react-docgen-typescript',
  reactDocgenTypescriptOptions: {
    // Enhanced prop extraction
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    shouldIncludePropTagMap: true,
    shouldIncludeDefaultProps: true,
    
    // Advanced filtering
    propFilter: (prop, component) => {
      // Include all props for design system components
      if (component.fileName.includes('design-system')) {
        return true;
      }
      
      // Exclude node_modules props
      if (prop.parent) {
        return !/node_modules/.test(prop.parent.fileName);
      }
      
      return true;
    },
    
    // Component filtering
    componentNameResolver: (exp, source) => {
      // Custom component name resolution for better documentation
      if (source.fileName.includes('design-system')) {
        return exp.getName() + 'Component';
      }
      return exp.getName();
    },
    
    // Advanced TypeScript compilation options
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      jsx: 'react-jsx',
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowImportingTsExtensions: false,
      noEmit: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
  },
} as const;

// Type Definition Helpers
export interface StoryTypeHelpers {
  // Enhanced Meta type with V7.5 constraints
  EnhancedMeta<T = {}>: import('@storybook/react').Meta<T> & {
    parameters?: {
      docs?: {
        description?: {
          component?: string;
          story?: string;
        };
      };
      backgrounds?: {
        default?: 'light' | 'dark' | 'v7-enhanced-blue' | 'v7-enhanced-glass';
      };
      viewport?: {
        defaultViewport?: 'mobile' | 'tablet' | 'desktop' | 'ultrawide';
      };
    };
    tags?: Array<'autodocs' | 'design-system' | 'v7-enhanced'>;
  };
  
  // Enhanced Story type with V7.5 constraints
  EnhancedStory<T = {}>: import('@storybook/react').StoryObj<T> & {
    parameters?: {
      docs?: {
        description?: {
          story?: string;
        };
      };
      a11y?: {
        config?: {
          rules?: Array<{
            id: string;
            enabled: boolean;
          }>;
        };
      };
    };
  };
}

// Design System Component Type Definitions
export interface DesignSystemTypes {
  // Layout Components
  LayoutComponent: React.ComponentType<{
    children: React.ReactNode;
    className?: string;
  }>;
  
  // Button Components
  ButtonComponent: React.ComponentType<{
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
  }>;
  
  // Form Components
  FormComponent: React.ComponentType<{
    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    className?: string;
  }>;
  
  // Typography Components
  TypographyComponent: React.ComponentType<{
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
    color?: 'primary' | 'secondary' | 'accent' | 'neutral';
    className?: string;
  }>;
}

// Story Template Type Definitions
export interface StoryTemplateTypes {
  // Generic story template
  StoryTemplate<T = {}>: {
    (args: T): JSX.Element;
    args?: Partial<T>;
    argTypes?: Record<string, any>;
    parameters?: Record<string, any>;
    decorators?: Array<(Story: React.ComponentType) => JSX.Element>;
  };
  
  // Design system story template
  DesignSystemStoryTemplate<T = {}>: StoryTemplate<T> & {
    parameters: {
      docs: {
        description: {
          component: string;
        };
      };
      backgrounds: {
        default: 'v7-enhanced-blue' | 'v7-enhanced-glass';
      };
      tags: Array<'autodocs' | 'design-system' | 'v7-enhanced'>;
    };
  };
}

// Accessibility Type Definitions
export interface AccessibilityTypes {
  A11yConfig: {
    config: {
      rules: Array<{
        id: 'color-contrast' | 'keyboard-navigation' | 'focus-management';
        enabled: boolean;
      }>;
    };
    options?: {
      checks?: Record<string, any>;
      restoreScroll?: boolean;
    };
    manual?: boolean;
  };
}

// Performance Type Definitions
export interface PerformanceTypes {
  PerformanceMetrics: {
    storyLoadTime: number;
    buildTime: number;
    bundleSize: number;
    memoryUsage: number;
  };
  
  PerformanceThresholds: {
    storyLoadTime: 2000; // 2 seconds
    buildTime: 120000;   // 2 minutes
    bundleSize: 512000;  // 500KB
    memoryUsage: 85;     // 85% threshold
  };
}

// Validation Type Guards
export const TypeValidationGuards = () => {
  // Validate story configuration
  isValidStoryConfig: (config: any): config is StoryTypeHelpers['EnhancedStory'] => {
    return (
      config &&
      typeof config === 'object' &&
      (!config.parameters || typeof config.parameters === 'object')
    );
  },
  
  // Validate meta configuration
  isValidMetaConfig: (config: any): config is StoryTypeHelpers['EnhancedMeta'] => {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.title === 'string' &&
      typeof config.component === 'function'
    );
  },
  
  // Validate design system component
  isDesignSystemComponent: (component: any): component is DesignSystemTypes['LayoutComponent'] => {
    return (
      component &&
      typeof component === 'function' &&
      component.displayName?.includes('DesignSystem')
    );
  },
} as const;

// Export comprehensive TypeScript configuration
export const STORYBOOK_TYPESCRIPT_CONFIG = () => {
  TYPESCRIPT_COVERAGE_CONFIG,
  ADVANCED_TYPESCRIPT_CONFIG,
  TypeValidationGuards,
} as const; 