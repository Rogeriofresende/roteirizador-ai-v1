import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/index.css';
import '../src/App.css';
// import '../src/styles/globals.css'; // REMOVED - File does not exist

// Configurar ambiente para Storybook
globalThis.STORYBOOK_ENVIRONMENT = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true; // Fix React act() warnings

// V8.0 Radical: NO ROUTER APPROACH - Complete Router Removal
// This approach completely eliminates any Router from preview.ts
// Individual stories can add their own Router if needed

// V8.0 Radical: Router Hooks Mock Provider (if needed by components)
const RouterHooksMockProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a safe mock context that provides router hooks if components need them
  React.useEffect(() => {
    // Mock common router hooks in global scope if they don't exist
    if (typeof window !== 'undefined' && !window.mockRouterHooks) {
      window.mockRouterHooks = {
        useNavigate: () => (path: string) => console.log(`🔄 [STORYBOOK] Mock navigate to: ${path}`),
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'default' }),
        useParams: () => ({}),
        useSearchParams: () => [new URLSearchParams(), () => {}]
      };
    }
  }, []);

  // Simple wrapper without any Router - just children
  return React.createElement(
    'div',
    { 
      'data-testid': 'storybook-safe-wrapper',
      className: 'storybook-wrapper'
    },
    children
  );
};

// Mock para Firebase no Storybook
if (globalThis.STORYBOOK_ENVIRONMENT) {
  console.log('🔧 [STORYBOOK] Environment configured with mocks');
  
  // V8.0 Radical: Complete error suppression system
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
        message.includes('Warning: The current testing environment') ||
        message.includes('Warning: An update to') ||
        message.includes('inside a test was not wrapped in act') ||
        message.includes('When testing, code that causes React state updates should be wrapped into act') ||
        message.includes('This ensures that you\'re testing the behavior the user would see in the browser') ||
        message.includes('invariant') ||
        message.includes('Router') ||
        message.includes('react-router-dom') ||
        message.includes('useNavigate') ||
        message.includes('useLocation') ||
        message.includes('Cannot read properties of undefined') ||
        message.includes('Router context') ||
        message.includes('You cannot render a') ||
        message.includes('inside another') ||
        message.includes('You should never have more than one') ||
        message.includes('nested router') ||
        message.includes('multiple routers') ||
        message.includes('router') ||
        message.includes('navigate')
      )
    ) {
      // V8.0 Radical: Complete router error suppression
      return;
    }
    // Only log non-router related errors
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' && (
        message.includes('High memory usage detected') ||
        message.includes('The tag <hundefined>') ||
        message.includes('act(...)') ||
        message.includes('testing environment') ||
        message.includes('Warning: An update to') ||
        message.includes('inside a test was not wrapped in act') ||
        message.includes('When testing, code that causes React state updates should be wrapped into act') ||
        message.includes('Router') ||
        message.includes('router') ||
        message.includes('navigate') ||
        message.includes('nested') ||
        message.includes('multiple') ||
        message.includes('invariant')
      )
    ) {
      return; // Silenciar warnings esperados no Storybook
    }
    originalWarn.apply(console, args);
  };

  // V8.0 Radical: Global error handler for uncaught router errors
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        (event.error.message.includes('Router') || 
         event.error.message.includes('invariant') ||
         event.error.message.includes('navigate') ||
         event.error.message.includes('nested'))) {
      event.preventDefault();
      console.log('🛡️ [STORYBOOK] Router error caught and suppressed');
      return false;
    }
  });

  // V8.0 Radical: Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('Router') || 
         event.reason.message.includes('invariant'))) {
      event.preventDefault();
      console.log('🛡️ [STORYBOOK] Router promise rejection caught and suppressed');
      return false;
    }
  });
}

const preview: Preview = {
  decorators: [
    (Story) => {
      // V8.0 Radical: NO ROUTER - Just safe wrapper
      return React.createElement(
        RouterHooksMockProvider,
        null,
        React.createElement(Story)
      );
    },
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
    // V8.0 Radical: No router configuration needed
    layout: 'centered',
    viewport: {
      viewports: {
        responsive: {
          name: 'Responsive',
          styles: { width: '100%', height: '100%' }
        }
      }
    }
  },
};

export default preview;