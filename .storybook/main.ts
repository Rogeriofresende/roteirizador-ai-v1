import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@": path.resolve(__dirname, "../src"),
      },
    };
    
    // V7.5 Fix Storybook Manager Communication Issues  
    config.define = {
      ...config.define,
      // Prevent multiple event source registration
      'process.env.STORYBOOK_MANAGER_DEBUG': 'false',
      // Fix React act() warnings in Storybook
      'globalThis.IS_REACT_ACT_ENVIRONMENT': 'true',
      'process.env.NODE_ENV': '"development"',
      // Fix cross-frame communication
      'globalThis.FEATURES': JSON.stringify({
        storyStoreV7: true,
        buildStoriesJson: false,
        argTypeTargetsV7: true,
        warnOnLegacyHierarchySeparator: false,
      }),
    };
    
    // Optimize build to prevent communication conflicts
    if (config.build) {
      config.build.rollupOptions = {
        ...config.build.rollupOptions,
        external: [],
        output: {
          ...config.build.rollupOptions?.output,
          manualChunks: undefined,
        },
      };
    }
    
    return config;
  },
};

export default config;