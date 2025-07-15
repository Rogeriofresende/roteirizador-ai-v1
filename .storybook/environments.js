/**
 * 🚀 CONFIGURAÇÕES DE AMBIENTE OTIMIZADAS
 * Baseado na pesquisa de problemas de performance do Storybook
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Configuração de desenvolvimento - Foco na velocidade
 */
export const developmentConfig = {
  // Desabilitar features pesadas
  docs: {
    autodocs: false,
    source: { type: 'code' },
  },
  
  // Usar docgen mais rápido
  typescript: {
    reactDocgen: 'react-docgen',
    check: false,
  },
  
  // Minimal addons para desenvolvimento
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  
  // Otimizações de build
  viteFinal: (config) => {
    // Desabilitar sourcemaps para velocidade
    config.build.sourcemap = false;
    
    // Reduzir chunks
    config.build.rollupOptions.output.manualChunks = undefined;
    
    // Otimizar HMR
    config.server = {
      ...config.server,
      hmr: {
        overlay: false,
        port: 6007,
      },
    };
    
    return config;
  },
};

/**
 * Configuração de produção - Foco na qualidade
 */
export const productionConfig = {
  // Habilitar todas as features
  docs: {
    autodocs: 'tag',
    source: { type: 'dynamic' },
  },
  
  // Usar docgen completo
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    check: true,
  },
  
  // Todos os addons
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    '@storybook/addon-measure',
    '@storybook/addon-storysource',
  ],
  
  // Otimizações de build para produção
  viteFinal: (config) => {
    // Habilitar sourcemaps para debug
    config.build.sourcemap = true;
    
    // Chunk splitting otimizado
    config.build.rollupOptions.output.manualChunks = {
      vendor: ['react', 'react-dom'],
      storybook: ['@storybook/react', '@storybook/addon-essentials'],
    };
    
    return config;
  },
};

/**
 * Configuração de teste - Foco na velocidade e confiabilidade
 */
export const testConfig = {
  // Mínimo necessário para testes
  docs: {
    autodocs: false,
    source: { type: 'code' },
  },
  
  // Sem type checking para velocidade
  typescript: {
    reactDocgen: false,
    check: false,
  },
  
  // Addons essenciais apenas
  addons: [
    '@storybook/addon-essentials',
  ],
  
  // Build otimizado para testes
  viteFinal: (config) => {
    // Sem sourcemaps para velocidade
    config.build.sourcemap = false;
    
    // Build mínimo
    config.build.rollupOptions.output.manualChunks = undefined;
    
    return config;
  },
};

/**
 * Obter configuração baseada no ambiente
 */
export function getEnvironmentConfig() {
  if (isDevelopment) {
    console.log('🚀 Usando configuração de desenvolvimento otimizada');
    return developmentConfig;
  }
  
  if (isTest) {
    console.log('🧪 Usando configuração de teste otimizada');
    return testConfig;
  }
  
  console.log('🏭 Usando configuração de produção completa');
  return productionConfig;
}

/**
 * Verificar se deve usar configuração rápida
 */
export function shouldUseFastConfig() {
  return process.env.STORYBOOK_FAST_MODE === 'true' || 
         process.env.SKIP_STORIES === 'true' ||
         isDevelopment;
}

/**
 * Filtrar stories baseado no ambiente
 */
export function getStoriesPattern() {
  const basePattern = '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)';
  
  if (process.env.SKIP_STORIES === 'true') {
    // Carregar apenas stories essenciais
    return [
      '../src/components/ui/Button.stories.tsx',
      '../src/design-system/components/Button.stories.tsx',
    ];
  }
  
  if (process.env.STORY_PATH) {
    // Carregar apenas stories específicas
    return [process.env.STORY_PATH];
  }
  
  return [basePattern];
} 