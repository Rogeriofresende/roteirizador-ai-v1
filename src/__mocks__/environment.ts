/**
 * Mock Environment Configuration for Tests
 * Substitui import.meta.env por valores mockados
 */

export const environment = {
  isDevelopment: false,
  isProduction: false,
  isTest: true,
  
  // API Keys - Com valores mock
  geminiApiKey: 'mock-gemini-key',
  clarityId: 'mock-clarity-id',
  
  // Firebase Configuration - Mock (configurado para funcionar)
  firebase: {
    apiKey: 'mock-firebase-key-configured',
    authDomain: 'mock-domain.firebaseapp.com',
    projectId: 'mock-project-configured',
    storageBucket: 'mock-bucket.appspot.com',
    messagingSenderId: 'mock-sender-id',
    appId: 'mock-app-id-configured'
  },
  
  // Error Monitoring - Mock
  errorMonitoring: {
    enabled: false,
    endpoint: '/api/errors',
    maxErrors: 20,
    timeWindow: 30000
  },
  
  // Analytics - Mock
  analytics: {
    enabled: false,
    clarityEnabled: false,
    clarityProjectId: 'mock-clarity-project',
    gaMeasurementId: 'mock-ga-id',
    trackingEnabled: false
  },
  
  // Tally Configuration - Mock
  tally: {
    enabled: false,
    feedbackFormId: 'mock-feedback-form',
    npsFormId: 'mock-nps-form',
    featuresFormId: 'mock-features-form',
    bugsFormId: 'mock-bugs-form'
  },
  
  // URLs - Mock
  apiUrl: 'http://localhost:3000/api',
  siteUrl: 'http://localhost:3000',
  
  // Feature Flags - Mock
  features: {
    pwaNEnabled: false,
    collaborationEnabled: false,
    voiceSynthesisEnabled: false,
    advancedAnalyticsEnabled: false,
    analyticsEnabled: false
  },
  
  // Versioning - Mock
  version: '6.4.0-test',
  buildTime: '2025-01-11T18:00:00.000Z',
  
  // Logging - Mock
  logging: {
    level: 'debug',
    consoleLogging: true
  }
};

// Export shortcut variables for convenience
export const isDevelopment = environment.isDevelopment;
export const isProduction = environment.isProduction;
export const isTest = environment.isTest;
export const config = environment;

// Mock validation functions
export const validateEnvironment = () => {
  return {
    isValid: true,
    warnings: [],
    errors: []
  };
};

// Mock helpers
export const isFeatureEnabled = (featureName: string): boolean => {
  return false; // Mock sempre false para testes
};

export const getApiUrl = (endpoint: string): string => {
  return `${environment.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isConfigured = (service: 'gemini' | 'firebase' | 'clarity'): boolean => {
  return true; // Mock sempre true para testes
};

export default environment; 