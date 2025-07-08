// Test Setup Configuration V6.2
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

// Mock environment variables
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock Web Speech API
global.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    pending: false,
    speaking: false,
    paused: false,
};

// Mock Vibration API
navigator.vibrate = vi.fn();

// Mock Performance API
global.performance.mark = vi.fn();
global.performance.measure = vi.fn();

// Import global mocks
vi.mock('@/services/predictiveAnalytics', () => 
    import('./mocks/predictiveUX.mock')
);

vi.mock('@/services/multiAIService', () => 
    import('./mocks/multiAI.mock')
);

vi.mock('@/services/voiceService', () => 
    import('./mocks/voiceSynthesis.mock')
);

vi.mock('@/services/loadingService', () => 
    import('./mocks/smartLoading.mock')
);