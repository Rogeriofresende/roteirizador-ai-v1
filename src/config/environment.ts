/**
 * Environment Configuration V6.4
 * Sistema melhorado para reduzir warnings e false positives
 */

export const environment = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  isTest: import.meta.env.MODE === 'test',
  
  // API Keys - Com fallbacks seguros
  geminiApiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '',
  clarityId: import.meta.env.VITE_CLARITY_ID || '',
  
  // Firebase Configuration - Opcional em desenvolvimento
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  },
  
  // Error Monitoring - Melhorado
  errorMonitoring: {
    enabled: import.meta.env.VITE_ERROR_MONITORING_ENABLED === 'true' || import.meta.env.MODE === 'production',
    // ✅ REALISTIC: Use relative endpoint to avoid connection refused
  endpoint: import.meta.env.VITE_ERROR_MONITORING_ENDPOINT || '/api/errors',
    maxErrors: parseInt(import.meta.env.VITE_ERROR_MONITORING_MAX_ERRORS || '20'),
    timeWindow: parseInt(import.meta.env.VITE_ERROR_MONITORING_TIME_WINDOW || '30000')
  },
  
  // Analytics - Opcional
  analytics: {
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true' || import.meta.env.MODE === 'production',
    clarityEnabled: import.meta.env.VITE_CLARITY_ENABLED === 'true' && !!import.meta.env.VITE_CLARITY_ID,
    clarityProjectId: import.meta.env.VITE_CLARITY_PROJECT_ID || import.meta.env.VITE_CLARITY_ID || '',
    gaMeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || '',
    trackingEnabled: import.meta.env.VITE_TRACKING_ENABLED === 'true' || import.meta.env.MODE === 'production'
  },
  
  // Tally Configuration - MISSING SECTION ADDED
  tally: {
    enabled: import.meta.env.VITE_TALLY_ENABLED === 'true',
    feedbackFormId: import.meta.env.VITE_TALLY_FEEDBACK_FORM_ID || '',
    npsFormId: import.meta.env.VITE_TALLY_NPS_FORM_ID || '',
    featuresFormId: import.meta.env.VITE_TALLY_FEATURES_FORM_ID || '',
    bugsFormId: import.meta.env.VITE_TALLY_BUGS_FORM_ID || ''
  },
  
  // URLs
  // ✅ REALISTIC: Use frontend origin for API base or disable if no backend
  apiUrl: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : '/api'),
  siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
  
  // Feature Flags
  features: {
    pwaNEnabled: import.meta.env.VITE_PWA_ENABLED !== 'false',
    collaborationEnabled: import.meta.env.VITE_COLLABORATION_ENABLED === 'true',
    voiceSynthesisEnabled: import.meta.env.VITE_VOICE_SYNTHESIS_ENABLED === 'true',
    advancedAnalyticsEnabled: import.meta.env.VITE_ADVANCED_ANALYTICS_ENABLED === 'true',
    analyticsEnabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true' || import.meta.env.MODE === 'production'
  },
  
  // Versioning
  version: import.meta.env.VITE_APP_VERSION || '6.4.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  
  // Logging
  logging: {
    level: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    consoleLogging: import.meta.env.VITE_CONSOLE_LOGGING !== 'false'
  }
};

// Export shortcut variables for convenience
export const isDevelopment = environment.isDevelopment;
export const isProduction = environment.isProduction;
export const isTest = environment.isTest;
export const config = environment;

// Validation functions - Melhoradas para reduzir false positives
export const validateEnvironment = () => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Apenas avisar sobre keys obrigatórias em produção
  if (environment.isProduction) {
    if (!environment.geminiApiKey) {
      warnings.push('VITE_GOOGLE_GEMINI_API_KEY não configurada - funcionalidade principal limitada');
    }
    
    if (!environment.firebase.apiKey) {
      warnings.push('Firebase não configurado - autenticação desabilitada');
    }
  }
  
  // Validar configuração de erro apenas se habilitada
  if (environment.errorMonitoring.enabled) {
    if (!environment.errorMonitoring.endpoint) {
      warnings.push('Endpoint de monitoramento de erros não configurado');
    }
  }
  
  // Log apenas erros críticos em produção
  if (errors.length > 0) {
    console.error('🚨 Erros críticos de configuração:', errors);
  }
  
  // Log warnings apenas em desenvolvimento
  if (warnings.length > 0 && environment.isDevelopment) {
    console.warn('⚠️ Avisos de configuração:', warnings);
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
};

// Helpers
export const isFeatureEnabled = (featureName: keyof typeof environment.features): boolean => {
  return environment.features[featureName] === true;
};

export const getApiUrl = (endpoint: string): string => {
  return `${environment.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isConfigured = (service: 'gemini' | 'firebase' | 'clarity'): boolean => {
  switch (service) {
    case 'gemini':
      return !!environment.geminiApiKey;
    case 'firebase':
      return !!environment.firebase.apiKey && !!environment.firebase.projectId;
    case 'clarity':
      return !!environment.clarityId;
    default:
      return false;
  }
};

// Initialize validation
if (environment.isDevelopment) {
  validateEnvironment();
}

export default environment; 