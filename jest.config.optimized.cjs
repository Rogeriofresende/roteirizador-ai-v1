/**
 * 🧪 JEST CONFIGURATION - OPTIMIZED FOR PERFORMANCE
 * Advanced configuration with performance optimizations
 */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  
  // TypeScript optimization
  preset: 'ts-jest/presets/default-esm',
  
  // Performance optimizations
  maxWorkers: '50%',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/'
  ],
  
  // Coverage optimization
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/tests/**/*',
    '!src/__tests-disabled__/**/*'
  ],
  
  // Cache optimization
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Module resolution optimization
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Test execution optimization
  bail: 1,
  verbose: false,
  silent: false,
  
  // Transform optimization
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
};
