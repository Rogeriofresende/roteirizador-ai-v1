import '@testing-library/jest-dom';

// Enhanced error handling for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Suppress specific React warnings in tests that are expected
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: componentWillReceiveProps'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
global.testUtils = {
  // Async helper for testing loading states
  waitForLoadingToFinish: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  },
  
  // Mock localStorage with quota simulation
  mockLocalStorageWithQuota: (maxItems = 5) => {
    let itemCount = 0;
    return {
      getItem: jest.fn((key) => {
        return localStorage.getItem(key);
      }),
      setItem: jest.fn((key, value) => {
        if (itemCount >= maxItems) {
          throw new Error('QuotaExceededError');
        }
        itemCount++;
        return localStorage.setItem(key, value);
      }),
      removeItem: jest.fn((key) => {
        itemCount = Math.max(0, itemCount - 1);
        return localStorage.removeItem(key);
      }),
      clear: jest.fn(() => {
        itemCount = 0;
        return localStorage.clear();
      })
    };
  },
  
  // Performance testing helper
  measureRenderTime: async (renderFn) => {
    const start = performance.now();
    await renderFn();
    const end = performance.now();
    return end - start;
  }
};

// Enhanced cleanup
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset any global state
  if (global.testCleanup) {
    global.testCleanup.forEach(cleanup => cleanup());
    global.testCleanup = [];
  }
});

// Type declarations for global utilities
declare global {
  var testUtils: {
    waitForLoadingToFinish: () => Promise<void>;
    mockLocalStorageWithQuota: (maxItems?: number) => any;
    measureRenderTime: (renderFn: () => Promise<void>) => Promise<number>;
  };
  var testCleanup: (() => void)[];
}

// Extend Jest matchers type
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
    }
  }
} 