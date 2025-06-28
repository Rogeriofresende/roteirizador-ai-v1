module.exports = {
  // Ambiente de testes
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  
  // Diretórios de módulos
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Extensões de arquivos
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transformações
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js)',
  ],
  
  // Ignorar transformações
  transformIgnorePatterns: [
    'node_modules/(?!(react-router|react-router-dom)/)',
  ],
  
  // Mapeamento de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss|stylus)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': 'jest-transform-stub',
  },
  
  // Cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  
  // Threshold de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Configuração ts-jest
  preset: 'ts-jest/presets/default-esm',
  
  // Configuração ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  
  // Limpar mocks automaticamente
  clearMocks: true,
  
  // Restaurar mocks automaticamente
  restoreMocks: true,
}; 