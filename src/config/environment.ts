/**
 * 🔧 ENVIRONMENT CONFIGURATION
 * Configuração centralizada e validação de variáveis de ambiente
 */

export interface EnvironmentConfig {
  // Core
  environment: 'development' | 'staging' | 'production';
  version: string;
  baseUrl: string;
  
  // API Keys
  geminiApiKey?: string;
  
  // Firebase
  firebase: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  
  // Analytics
  analytics: {
    clarityProjectId?: string;
    ga4MeasurementId?: string;
    enabled: boolean;
  };
  
  // Feedback
  tally: {
    feedbackFormId?: string;
    npsFormId?: string;
    featuresFormId?: string;
    bugsFormId?: string;
  };
  
  // Debug
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Detecta o ambiente atual
 */
export const detectEnvironment = (): EnvironmentConfig['environment'] => {
  // Verifica Vercel environment
  if (import.meta.env.VERCEL_ENV === 'production') return 'production';
  if (import.meta.env.VERCEL_ENV === 'preview') return 'staging';
  
  // Verifica variável personalizada
  const envVar = import.meta.env.VITE_APP_ENV;
  if (envVar === 'production' || envVar === 'staging' || envVar === 'development') {
    return envVar;
  }
  
  // Fallback para development
  return import.meta.env.DEV ? 'development' : 'production';
};

/**
 * Valida se é ambiente de desenvolvimento
 */
export const isDevelopment = (): boolean => {
  return detectEnvironment() === 'development';
};

/**
 * Valida se é ambiente de produção
 */
export const isProduction = (): boolean => {
  return detectEnvironment() === 'production';
};

/**
 * Valida se é ambiente de staging
 */
export const isStaging = (): boolean => {
  return detectEnvironment() === 'staging';
};

/**
 * Valida variáveis de ambiente obrigatórias
 */
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const env = import.meta.env;
  
  // Validações críticas para produção
  if (isProduction()) {
    if (!env.VITE_GOOGLE_GEMINI_API_KEY) {
      errors.push('VITE_GOOGLE_GEMINI_API_KEY é obrigatória em produção');
    }
  }
  
  // Validações para todas as environments
  if (env.VITE_GOOGLE_GEMINI_API_KEY && env.VITE_GOOGLE_GEMINI_API_KEY.length < 10) {
    errors.push('VITE_GOOGLE_GEMINI_API_KEY parece inválida (muito curta)');
  }
  
  // Validação Firebase (se configurado)
  const hasFirebaseConfig = env.VITE_FIREBASE_API_KEY || env.VITE_FIREBASE_PROJECT_ID;
  if (hasFirebaseConfig) {
    const requiredFirebaseVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN', 
      'VITE_FIREBASE_PROJECT_ID'
    ];
    
    for (const varName of requiredFirebaseVars) {
      if (!env[varName]) {
        errors.push(`${varName} é obrigatória quando Firebase está configurado`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Configuração consolidada do ambiente
 */
export const config: EnvironmentConfig = {
  environment: detectEnvironment(),
  version: import.meta.env.VITE_APP_VERSION || '2.1.3',
  baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5174',
  
  geminiApiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
  
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  
  analytics: {
    clarityProjectId: import.meta.env.VITE_CLARITY_PROJECT_ID,
    ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID,
    enabled: !!(import.meta.env.VITE_CLARITY_PROJECT_ID || import.meta.env.VITE_GA4_MEASUREMENT_ID),
  },
  
  tally: {
    feedbackFormId: import.meta.env.VITE_TALLY_FORM_FEEDBACK,
    npsFormId: import.meta.env.VITE_TALLY_FORM_NPS,
    featuresFormId: import.meta.env.VITE_TALLY_FORM_FEATURES,
    bugsFormId: import.meta.env.VITE_TALLY_FORM_BUGS,
  },
  
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' && isDevelopment(),
  logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || 'info',
};

/**
 * Log da configuração (apenas em development)
 */
if (isDevelopment()) {
  console.log('🔧 Environment Configuration:', {
    environment: config.environment,
    version: config.version,
    debugMode: config.debugMode,
    hasGeminiKey: !!config.geminiApiKey,
    hasFirebase: !!config.firebase.apiKey,
    hasAnalytics: !!config.analytics.clarityProjectId || !!config.analytics.ga4MeasurementId,
  });
  
  // Validar environment
  const validation = validateEnvironment();
  if (!validation.valid) {
    console.warn('⚠️ Environment validation warnings:', validation.errors);
  }
}

export default config; 