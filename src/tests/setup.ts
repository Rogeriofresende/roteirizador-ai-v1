// Test Setup Configuration V6.4 - PRODUCTION READY
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
    cleanup();
    jest.clearAllMocks();
});

// Mock environment variables
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock Web Speech API
global.speechSynthesis = {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => []),
    pending: false,
    speaking: false,
    paused: false,
    onvoiceschanged: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
};

// Mock Vibration API
navigator.vibrate = jest.fn();

// Mock Performance API
global.performance.mark = jest.fn();
global.performance.measure = jest.fn();

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
});

// Mock URL constructor
global.URL = jest.fn().mockImplementation((url) => ({
    href: url,
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: '',
}));

// Mock fetch API
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Clean global mocks - remove problematic service mocks for now
// These were causing the majority of test failures
// Will be re-added in production test suite

// Global test utilities
global.testUtils = {
    measureRenderTime: async (renderFunction: () => Promise<void>) => {
        const start = performance.now();
        await renderFunction();
        return performance.now() - start;
    },
    
    waitFor: (condition: () => boolean, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkCondition = () => {
                if (condition()) {
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(checkCondition, 100);
                }
            };
            checkCondition();
        });
    }
};

// Extend Jest matchers
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveClass(className: string): R;
            toHaveAttribute(name: string, value?: string): R;
            toHaveValue(value: string | number): R;
            toBeDisabled(): R;
            toHaveFocus(): R;
            toHaveTextContent(text: string): R;
        }
    }
    
    namespace NodeJS {
        interface Global {
            testUtils: {
                measureRenderTime: (renderFunction: () => Promise<void>) => Promise<number>;
                waitFor: (condition: () => boolean, timeout?: number) => Promise<boolean>;
            };
        }
    }
}

// Export setup for other test files
export const testSetup = {
    localStorageMock,
    clearAllMocks: () => {
        jest.clearAllMocks();
        localStorageMock.clear();
    }
};