/**
 * 🧪 JEST CONFIGURATION - UNIFIED
 * Configuração simplificada apenas com ts-jest (sem babel-jest)
 */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  
  // TypeScript only com ts-jest
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: './tsconfig.test.json'
    }],
  },
  
  // UNIT TESTS apenas (Jest) - E2E separado para Playwright
  testMatch: [
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
    // EXCLUIR: tests/e2e/ (reservado para Playwright)
  ],
  
  // IGNORAR diretórios problemáticos
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/node_modules_old/',
    '<rootDir>/node_modules_broken_*/',
    '<rootDir>/.archive/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/playwright-report/',
    '<rootDir>/tests/e2e/',
  ],
  
  transformIgnorePatterns: [
    'node_modules/(?!(react-router|react-router-dom)/)',
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss|stylus)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': 'jest-transform-stub',
  },
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
};
