import type { Preview } from '@storybook/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '../src/index.css';
import '../src/App.css';
// import '../src/styles/globals.css'; // REMOVED - File does not exist

// Configurar ambiente para Storybook
globalThis.STORYBOOK_ENVIRONMENT = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true; // Fix React act() warnings

// Mock para Firebase no Storybook
if (globalThis.STORYBOOK_ENVIRONMENT) {
  console.log('🔧 [STORYBOOK] Environment configured with mocks');
  
  // Suprimir erros esperados e warnings de desenvolvimento
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' && (
        message.includes('Erro ao obter templates em destaque') ||
        message.includes('templates em destaque') ||
        message.includes('Firebase permissions') ||
        message.includes('quota exceeded') ||
        message.includes('The current testing environment is not configured to support act') ||
        message.includes('Warning: The current testing environment')
      )
    ) {
      // Converter para log info em vez de error para debugging específicos
      if (message.includes('act')) {
        return; // Silenciar completamente warnings de act() no Storybook
      }
      console.info('ℹ️ [STORYBOOK] Expected behavior:', message.split('\n')[0]);
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' && (
        message.includes('High memory usage detected') ||
        message.includes('The tag <hundefined>') ||
        message.includes('act(...)') ||
        message.includes('testing environment')
      )
    ) {
      return; // Silenciar warnings esperados no Storybook
    }
    originalWarn.apply(console, args);
  };
}

const preview: Preview = {
  decorators: [
    (Story) => React.createElement(
      MemoryRouter,
      { 
        future: { 
          v7_startTransition: true, 
          v7_relativeSplatPath: true 
        }
      },
      React.createElement(Story)
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
    actions: { 
      argTypesRegex: '^on[A-Z].*',
    },
  },
};

export default preview;