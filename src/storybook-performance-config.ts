/**
 * 🚀 STORYBOOK PERFORMANCE CONFIGURATION
 * Otimizações de performance para melhorar a experiência do Storybook
 */

import type { Preview } from '@storybook/react';

// Configuração de performance para stories
const performanceConfig: Preview = {
  parameters: {
    // Otimizar viewports
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '360px', height: '640px' },
        },
        tablet: {
          name: 'Tablet', 
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' },
        },
      },
    },
    
    // Otimizar actions
    actions: {
      disable: false,
      argTypesRegex: '^on[A-Z].*',
    },
    
    // Otimizar controls
    controls: {
      expanded: false,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    
    // Otimizar docs
    docs: {
      source: {
        language: 'tsx',
        type: 'dynamic',
      },
    },
    
    // Otimizar backgrounds
    backgrounds: {
      disable: false,
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#333333' },
      ],
    },
  },
  
  // Global decorators otimizados
  decorators: [
    (Story) => {
      // Performance monitoring para stories
      if (process.env.NODE_ENV === 'development') {
        const startTime = performance.now();
        
        // Cleanup function para evitar memory leaks
        const cleanup = () => {
          const renderTime = performance.now() - startTime;
          if (renderTime > 100) {
            console.warn(`⚠️ Slow story render: ${renderTime.toFixed(2)}ms`);
          }
        };
        
        // Cleanup após render
        setTimeout(cleanup, 0);
      }
      
      return Story();
    },
  ],
};

export default performanceConfig; 