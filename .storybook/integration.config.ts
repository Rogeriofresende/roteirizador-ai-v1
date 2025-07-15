/**
 * 🎯 INTEGRATION CONFIG V8.0
 * Aproveita infraestrutura robusta existente + Smart Integration
 * Metodologia V8.0 Unified Development
 */

import type { StorybookConfig } from '@storybook/react-vite';

// ============================================================================
// LEVERAGE EXISTING ROBUST INFRASTRUCTURE
// ============================================================================

export const INTEGRATION_CONFIG = {
  // Aproveitar sistema de performance já robusto
  performance: {
    useExistingGates: true, // .storybook/performance.config.ts
    useExistingOptimization: true, // lazy compilation, caching
    useExistingMonitoring: true // performance monitoring
  },
  
  // Aproveitar sistema de TypeScript já robusto  
  typescript: {
    useExistingConfig: true, // .storybook/typescript.config.ts
    useExistingValidation: true, // 100% type coverage
    useExistingDocgen: true // react-docgen-typescript
  },
  
  // Aproveitar sistema de qualidade já robusto
  quality: {
    useExistingA11y: true, // accessibility.guidelines.md
    useExistingVisualRegression: true, // visual-regression.config.ts
    useExistingProductionReadiness: true // production-readiness.config.ts
  },

  // Smart integration layer
  smartIntegration: {
    autoDetectServices: ['geminiService', 'analyticsService'],
    autoDetectHooks: ['useBancoDeIdeiasState'],
    autoDetectProviders: ['AuthProvider'],
    fallbackStrategy: 'intelligent-mocks',
    realDataWhenAvailable: true
  }
} as const;

// ============================================================================
// ENHANCED STORIES CONFIGURATION
// ============================================================================

export const ENHANCED_STORIES_CONFIG = {
  // Stories existentes + funcionais
  patterns: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/pages/BancoDeIdeias/components/Qualification/*.stories.tsx', // Nossos wireframes
  ],
  
  // Integração com infraestrutura existente
  addons: [
    // Addons já configurados e funcionando
    '@storybook/addon-essentials',
    '@storybook/addon-interactions', 
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    '@storybook/addon-measure',
    '@storybook/addon-storysource',
  ],
  
  // Decorators com smart providers
  decorators: [
    // Usar nosso provider inteligente
    '../src/shared/storybook-integration/SmartProviders.tsx'
  ]
} as const;

// ============================================================================
// REAL DATA INTEGRATION
// ============================================================================

export const REAL_DATA_CONFIG = {
  // Services reais com fallback inteligente
  services: {
    gemini: {
      useReal: true,
      fallback: 'smart-mock',
      trackUsage: true
    },
    analytics: {
      useReal: true, // Coletar dados reais de uso do Storybook
      prefix: 'storybook_',
      trackInteractions: true
    }
  },
  
  // Estado real
  state: {
    useBancoDeIdeiasState: {
      useReal: true,
      persistBetweenStories: false,
      resetOnNavigation: true
    }
  },
  
  // Dados de teste inteligentes
  testData: {
    generateFromRealSchemas: true,
    useRealisticContent: true,
    respectValidationRules: true
  }
} as const;

// ============================================================================
// AUTO-SYNC VALIDATION  
// ============================================================================

export const AUTO_SYNC_CONFIG = {
  // Aproveitar sistema de validação já robusto
  validation: {
    useExistingTypeChecks: true,
    useExistingPerformanceGates: true,
    useExistingA11yChecks: true,
    addIntegrationChecks: [
      'service-parity',
      'component-parity', 
      'type-parity',
      'data-consistency'
    ]
  },
  
  // Auto-fix aproveitando automação existente
  autoFix: {
    useExistingAutomation: true, // production-readiness.config.ts
    addStorybookSpecific: [
      'update-stories-from-components',
      'sync-mock-data-with-real-schemas',
      'validate-provider-integration'
    ]
  }
} as const;

// ============================================================================
// PROGRESSIVE ENHANCEMENT STRATEGY
// ============================================================================

export const PROGRESSIVE_ENHANCEMENT = {
  // Fase 1: Aproveitar existente (IMEDIATO)
  phase1: {
    leverageExistingInfrastructure: true,
    addSmartProviders: true,
    enableRealServices: true,
    duration: '1h'
  },
  
  // Fase 2: Enhance stories (2h)
  phase2: {
    addFunctionalStories: true,
    enableRealDataFlow: true,
    addInteractionTesting: true,
    duration: '2h'
  },
  
  // Fase 3: Full integration (1h)
  phase3: {
    enableFullFlowTesting: true,
    addPerformanceMonitoring: true,
    enableContinuousValidation: true,
    duration: '1h'
  }
} as const;

// ============================================================================
// FINAL CONFIGURATION
// ============================================================================

export const STORYBOOK_INTEGRATION_CONFIG: Partial<StorybookConfig> = {
  // Extend existing main.ts configuration
  stories: ENHANCED_STORIES_CONFIG.patterns,
  
  // Keep all existing addons + smart enhancements
  addons: [
    ...ENHANCED_STORIES_CONFIG.addons
  ],
  
  // Enhance existing viteFinal with integration features
  viteFinal: async (config, { configType }) => {
    // Keep all existing optimizations from main.ts
    
    // Add integration-specific optimizations
    config.define = {
      ...config.define,
      'globalThis.STORYBOOK_INTEGRATION_MODE': '"smart"',
      'globalThis.USE_REAL_SERVICES': 'true',
      'globalThis.TRACK_STORYBOOK_USAGE': 'true'
    };
    
    return config;
  }
} as const;

export default STORYBOOK_INTEGRATION_CONFIG;
