/**
 * 🎯 ROTEIRAR IA CONTEXT CONFIGURATION
 * 
 * Configuração de contexto específica para Roteirar IA
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Alpha - Requirements Analyst + Backend
 * @created 2025-07-19T12:00:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import { ProcessingContext } from '../types/naturalLanguageTypes';

// 🎯 ROTEIRAR IA SPECIFIC CONTEXT
export const ROTEIRAR_CONTEXT: ProcessingContext = {
  project: 'Roteirar IA',
  framework: 'React',
  designSystem: 'Tailwind',
  team: 'Roteirar Development Team',
  preferences: {
    codeStyle: {
      language: 'TypeScript',
      framework: 'React',
      linting: 'ESLint',
      formatting: 'Prettier',
      conventions: ['Conventional Commits', 'Clean Architecture', 'Feature-based Organization']
    },
    testingApproach: {
      strategy: 'tdd',
      coverage: 85,
      tools: ['Jest', 'Playwright', 'Cypress'],
      automation: true
    },
    architecture: {
      patterns: ['Clean Architecture', 'Component Composition', 'Multi-IA Coordination'],
      principles: ['SOLID', 'DRY', 'Performance First', 'Mobile First'],
      scalability: 'enterprise',
      performance: 'optimized'
    },
    documentation: {
      style: 'comprehensive',
      formats: ['Markdown', 'JSDoc', 'Storybook'],
      automation: true,
      maintenance: 'automated'
    }
  }
};

// 🎨 ROTEIRAR-SPECIFIC FEATURE CONTEXTS
export const ROTEIRAR_FEATURE_CONTEXTS = {
  'banco-de-ideias': {
    ...ROTEIRAR_CONTEXT,
    preferences: {
      ...ROTEIRAR_CONTEXT.preferences,
      architecture: {
        ...ROTEIRAR_CONTEXT.preferences.architecture,
        patterns: ['CRUD Operations', 'Real-time Updates', 'Search & Filter', 'Tag System']
      }
    }
  },
  'geracao-roteiros': {
    ...ROTEIRAR_CONTEXT,
    preferences: {
      ...ROTEIRAR_CONTEXT.preferences,
      architecture: {
        ...ROTEIRAR_CONTEXT.preferences.architecture,
        patterns: ['AI Integration', 'Stream Processing', 'Template Engine', 'Export System']
      }
    }
  },
  'timeline-editor': {
    ...ROTEIRAR_CONTEXT,
    preferences: {
      ...ROTEIRAR_CONTEXT.preferences,
      architecture: {
        ...ROTEIRAR_CONTEXT.preferences.architecture,
        patterns: ['Drag & Drop', 'Real-time Collaboration', 'Version Control', 'Visual Editor']
      }
    }
  },
  'pwa-features': {
    ...ROTEIRAR_CONTEXT,
    preferences: {
      ...ROTEIRAR_CONTEXT.preferences,
      architecture: {
        ...ROTEIRAR_CONTEXT.preferences.architecture,
        patterns: ['Service Worker', 'Offline Support', 'Push Notifications', 'App Shell']
      }
    }
  }
};

// 🤖 MULTI-IA COORDINATION CONFIG
export const ROTEIRAR_MULTI_IA_CONFIG = {
  coordination: {
    version: 'V9.0_AGENTIC',
    agents: {
      alpha: {
        role: 'Requirements Analyst + Backend',
        specialization: ['Natural Language Processing', 'Backend Architecture', 'API Design'],
        effort: 100,
        timeline: 'Throughout project'
      },
      beta: {
        role: 'Solution Architect + Frontend',
        specialization: ['React Components', 'UX Design', 'PWA Features'],
        effort: 46,
        timeline: 'Frontend phases'
      },
      charlie: {
        role: 'Implementation Planner + Testing',
        specialization: ['Testing Strategy', 'CI/CD', 'Quality Assurance'],
        effort: 52,
        timeline: 'Testing & deployment'
      },
      delta: {
        role: 'Quality Assurance + Performance',
        specialization: ['Performance Optimization', 'Security', 'Compliance'],
        effort: 30,
        timeline: 'Continuous'
      }
    }
  },
  workflow: {
    phases: [
      'Natural Language Specification',
      'Agentic Planning',
      'Context-Aware Development',
      'Smart Testing',
      'Automated Deployment'
    ],
    qualityGates: [
      'NL Spec Validation (95%+)',
      'Agent Coordination Check',
      'Context Compliance',
      'Performance Benchmark',
      'Security Audit'
    ]
  }
};

// 🚀 PWA-SPECIFIC CONFIGURATION
export const ROTEIRAR_PWA_CONFIG = {
  serviceWorker: {
    strategy: 'Cache First',
    offlineSupport: true,
    backgroundSync: true
  },
  manifest: {
    name: 'Roteirar IA',
    shortName: 'Roteirar',
    theme: 'Professional',
    orientation: 'portrait'
  },
  performance: {
    bundleSize: '<250KB',
    loadTime: '<2s',
    interactivity: '<1s'
  }
};

// 📊 PERFORMANCE BENCHMARKS
export const ROTEIRAR_PERFORMANCE_TARGETS = {
  build: {
    time: '<2s',
    bundleSize: '<250KB',
    chunks: 'optimized'
  },
  runtime: {
    firstContentfulPaint: '<1.5s',
    largestContentfulPaint: '<2.5s',
    cumulativeLayoutShift: '<0.1'
  },
  testing: {
    coverage: '>85%',
    execution: '<30s',
    parallelization: true
  }
};

export default ROTEIRAR_CONTEXT;