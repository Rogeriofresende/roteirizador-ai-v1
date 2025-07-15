/**
 * V7.5 Enhanced - Storybook Performance Configuration
 * Optimizes build time, loading speed, and memory usage
 */

// Performance Gates Configuration
export const PERFORMANCE_GATES = {
  STORY_LOADING_TIME: 2000, // <2s ✅
  BUILD_TIME: 120000,       // <120s ✅
  BUNDLE_OVERHEAD: 512000,  // <500KB ✅
  HOT_RELOAD_SPEED: 1000,   // <1s ✅
} as const;

// Lazy Loading Configuration
export const LAZY_COMPILATION_CONFIG = {
  // Lazy compilation for faster development
  lazyCompilation: {
    entries: false,
    imports: true,
    test: /\.stories\.(js|jsx|ts|tsx|mdx)$/,
  },
  
  // Cache configuration
  cache: {
    type: 'filesystem' as const,
    cacheDirectory: '.storybook/cache',
    buildDependencies: {
      config: [__filename],
    },
  },
} as const;

// Webpack Optimization Configuration
export const WEBPACK_OPTIMIZATION_CONFIG = {
  splitChunks: {
    chunks: 'all' as const,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all' as const,
        priority: 20,
      },
      storybook: {
        test: /[\\/](@storybook|storybook)[\\/]/,
        name: 'storybook',
        chunks: 'all' as const,
        priority: 30,
      },
      designSystem: {
        test: /[\\/]src[\\/]design-system[\\/]/,
        name: 'design-system',
        chunks: 'all' as const,
        priority: 40,
      },
    },
  },
  
  // Memory optimization
  runtimeChunk: 'single',
  
  // Performance hints
  performance: {
    hints: 'warning' as const,
    maxEntrypointSize: PERFORMANCE_GATES.BUNDLE_OVERHEAD,
    maxAssetSize: PERFORMANCE_GATES.BUNDLE_OVERHEAD,
  },
} as const;

// Hot Module Replacement Configuration
export const HMR_CONFIG = {
  hot: true,
  liveReload: true,
  
  // Optimization for faster HMR
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 200,
    poll: false,
  },
  
  // Client configuration
  client: {
    overlay: {
      errors: true,
      warnings: false,
    },
    progress: true,
  },
} as const;

// Build Optimization Configuration
export const BUILD_OPTIMIZATION_CONFIG = {
  // Production optimizations
  minimize: true,
  
  // Tree shaking configuration
  usedExports: true,
  sideEffects: false,
  
  // Module concatenation
  concatenateModules: true,
  
  // Memory optimization
  moduleIds: 'deterministic' as const,
  chunkIds: 'deterministic' as const,
} as const;

// Performance Monitoring Configuration
export const PERFORMANCE_MONITORING = {
  // Performance marks for measurement
  marks: {
    STORY_START: 'story-load-start',
    STORY_END: 'story-load-end',
    BUILD_START: 'build-start',
    BUILD_END: 'build-end',
  },
  
  // Performance observers
  observers: {
    navigation: true,
    paint: true,
    resource: true,
  },
  
  // Thresholds for warnings
  thresholds: {
    storyLoadTime: PERFORMANCE_GATES.STORY_LOADING_TIME,
    buildTime: PERFORMANCE_GATES.BUILD_TIME,
    bundleSize: PERFORMANCE_GATES.BUNDLE_OVERHEAD,
  },
} as const;

// Memory Management Configuration
export const MEMORY_MANAGEMENT = {
  // Memory limits
  maxOldGenerationSizeMb: 4096,
  maxYoungGenerationSizeMb: 1024,
  
  // Garbage collection optimization
  gcOptions: {
    incremental: true,
    incrementalMarking: true,
  },
  
  // Memory monitoring
  monitoring: {
    enabled: true,
    interval: 30000, // 30 seconds
    threshold: 0.85, // 85% memory usage warning
  },
} as const;

// Export all configurations
export const STORYBOOK_PERFORMANCE_CONFIG = {
  PERFORMANCE_GATES,
  LAZY_COMPILATION_CONFIG,
  WEBPACK_OPTIMIZATION_CONFIG,
  HMR_CONFIG,
  BUILD_OPTIMIZATION_CONFIG,
  PERFORMANCE_MONITORING,
  MEMORY_MANAGEMENT,
} as const; 