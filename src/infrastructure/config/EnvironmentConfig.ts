// Infrastructure Layer - Environment Configuration Management
// Centralized configuration management following Clean Architecture

import { createLogger } from '../../utils/logger';

const logger = createLogger('EnvironmentConfig');

export interface DatabaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AIServiceConfig {
  geminiApiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retries?: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  endpoint: string;
  maxErrors: number;
  timeWindow: number;
  clarityId?: string;
  clarityEnabled: boolean;
}

export interface AuthConfig {
  enablePersistence: boolean;
  enableLogging: boolean;
  sessionTimeout?: number;
}

export interface AppConfig {
  apiUrl: string;
  siteUrl: string;
  enableDevTools: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface EnvironmentConfiguration {
  environment: 'development' | 'production' | 'test';
  database: DatabaseConfig;
  aiService: AIServiceConfig;
  monitoring: MonitoringConfig;
  auth: AuthConfig;
  app: AppConfig;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingOptional: string[];
}

export class EnvironmentConfig {
  private config: EnvironmentConfiguration;
  private logger = createLogger('EnvironmentConfig');

  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): EnvironmentConfiguration {
    const environment = this.getEnvironment();

    return {
      environment,
      database: this.loadDatabaseConfig(),
      aiService: this.loadAIServiceConfig(),
      monitoring: this.loadMonitoringConfig(),
      auth: this.loadAuthConfig(),
      app: this.loadAppConfig()
    };
  }

  /**
   * Determine current environment
   */
  private getEnvironment(): 'development' | 'production' | 'test' {
    const mode = import.meta.env.MODE;
    switch (mode) {
      case 'production':
        return 'production';
      case 'test':
        return 'test';
      default:
        return 'development';
    }
  }

  /**
   * Load database configuration
   */
  private loadDatabaseConfig(): DatabaseConfig {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  /**
   * Load AI service configuration
   */
  private loadAIServiceConfig(): AIServiceConfig {
    return {
      geminiApiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '',
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash-latest',
      temperature: parseFloat(import.meta.env.VITE_GEMINI_TEMPERATURE || '0.8'),
      maxTokens: parseInt(import.meta.env.VITE_GEMINI_MAX_TOKENS || '2048'),
      timeout: parseInt(import.meta.env.VITE_GEMINI_TIMEOUT || '30000'),
      retries: parseInt(import.meta.env.VITE_GEMINI_RETRIES || '3')
    };
  }

  /**
   * Load monitoring configuration
   */
  private loadMonitoringConfig(): MonitoringConfig {
    return {
      enabled: import.meta.env.VITE_ERROR_MONITORING_ENABLED === 'true' || this.config?.environment === 'production',
      // ✅ REALISTIC: Use frontend-only error tracking or disable
    endpoint: import.meta.env.VITE_ERROR_MONITORING_ENDPOINT || '/api/errors',
      maxErrors: parseInt(import.meta.env.VITE_ERROR_MONITORING_MAX_ERRORS || '20'),
      timeWindow: parseInt(import.meta.env.VITE_ERROR_MONITORING_TIME_WINDOW || '30000'),
      clarityId: import.meta.env.VITE_CLARITY_ID || '',
      clarityEnabled: import.meta.env.VITE_CLARITY_ENABLED === 'true' && !!import.meta.env.VITE_CLARITY_ID
    };
  }

  /**
   * Load auth configuration
   */
  private loadAuthConfig(): AuthConfig {
    return {
      enablePersistence: import.meta.env.VITE_AUTH_ENABLE_PERSISTENCE !== 'false',
      enableLogging: this.config?.environment === 'development',
      sessionTimeout: parseInt(import.meta.env.VITE_AUTH_SESSION_TIMEOUT || '86400000') // 24 hours
    };
  }

  /**
   * Load app configuration
   */
  private loadAppConfig(): AppConfig {
    return {
      // ✅ REALISTIC: Use current frontend origin or disable if no backend
    apiUrl: import.meta.env.VITE_API_URL || window.location.origin + '/api',
      siteUrl: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
      enableDevTools: this.config?.environment === 'development',
      logLevel: (import.meta.env.VITE_LOG_LEVEL as any) || 'info'
    };
  }

  /**
   * Validate configuration
   */
  private validateConfiguration(): ValidationResult {
    const result = this.validate();

    if (result.errors.length > 0) {
      this.logger.error('Configuration errors:', result.errors);
    }

    if (result.warnings.length > 0 && this.config.environment === 'development') {
      this.logger.warn('Configuration warnings:', result.warnings);
    }

    return result;
  }

  /**
   * Get complete configuration
   */
  getConfig(): EnvironmentConfiguration {
    return { ...this.config };
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): DatabaseConfig {
    return { ...this.config.database };
  }

  /**
   * Get AI service configuration
   */
  getAIServiceConfig(): AIServiceConfig {
    return { ...this.config.aiService };
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig(): MonitoringConfig {
    return { ...this.config.monitoring };
  }

  /**
   * Get auth configuration
   */
  getAuthConfig(): AuthConfig {
    return { ...this.config.auth };
  }

  /**
   * Get app configuration
   */
  getAppConfig(): AppConfig {
    return { ...this.config.app };
  }

  /**
   * Get current environment
   */
  getEnvironment(): 'development' | 'production' | 'test' {
    return this.config.environment;
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.config.environment === 'test';
  }

  /**
   * Check if service is configured
   */
  isServiceConfigured(service: 'database' | 'aiService' | 'monitoring' | 'auth'): boolean {
    switch (service) {
      case 'database':
        return !!(this.config.database.apiKey && this.config.database.projectId);
      case 'aiService':
        return !!this.config.aiService.geminiApiKey;
      case 'monitoring':
        return this.config.monitoring.enabled && !!this.config.monitoring.endpoint;
      case 'auth':
        return this.isServiceConfigured('database'); // Auth depends on database
      default:
        return false;
    }
  }

  /**
   * Validate configuration
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingRequired: string[] = [];
    const missingOptional: string[] = [];

    // Required for production
    if (this.config.environment === 'production') {
      if (!this.config.aiService.geminiApiKey) {
        errors.push('VITE_GOOGLE_GEMINI_API_KEY is required in production');
        missingRequired.push('VITE_GOOGLE_GEMINI_API_KEY');
      }

      if (!this.config.database.apiKey) {
        errors.push('VITE_FIREBASE_API_KEY is required in production');
        missingRequired.push('VITE_FIREBASE_API_KEY');
      }

      if (!this.config.database.projectId) {
        errors.push('VITE_FIREBASE_PROJECT_ID is required in production');
        missingRequired.push('VITE_FIREBASE_PROJECT_ID');
      }
    }

    // Warnings for development
    if (this.config.environment === 'development') {
      if (!this.config.aiService.geminiApiKey) {
        warnings.push('VITE_GOOGLE_GEMINI_API_KEY not configured - AI features limited');
        missingOptional.push('VITE_GOOGLE_GEMINI_API_KEY');
      }

      if (!this.config.database.apiKey) {
        warnings.push('Firebase not configured - authentication disabled');
        missingOptional.push('VITE_FIREBASE_API_KEY');
      }

      if (!this.config.monitoring.clarityId) {
        warnings.push('Microsoft Clarity not configured - analytics disabled');
        missingOptional.push('VITE_CLARITY_ID');
      }
    }

    // Validate configuration values
    if (this.config.aiService.temperature < 0 || this.config.aiService.temperature > 2) {
      warnings.push('VITE_GEMINI_TEMPERATURE should be between 0 and 2');
    }

    if (this.config.aiService.maxTokens < 1 || this.config.aiService.maxTokens > 8192) {
      warnings.push('VITE_GEMINI_MAX_TOKENS should be between 1 and 8192');
    }

    if (this.config.monitoring.enabled && !this.config.monitoring.endpoint) {
      errors.push('Monitoring enabled but endpoint not configured');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingRequired,
      missingOptional
    };
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigSummary(): {
    environment: string;
    services: {
      database: boolean;
      aiService: boolean;
      monitoring: boolean;
      auth: boolean;
    };
    validation: ValidationResult;
  } {
    return {
      environment: this.config.environment,
      services: {
        database: this.isServiceConfigured('database'),
        aiService: this.isServiceConfigured('aiService'),
        monitoring: this.isServiceConfigured('monitoring'),
        auth: this.isServiceConfigured('auth')
      },
      validation: this.validate()
    };
  }

  /**
   * Update configuration at runtime (for development/testing)
   */
  updateConfig(updates: Partial<EnvironmentConfiguration>): void {
    this.config = {
      ...this.config,
      ...updates
    };

    this.validateConfiguration();
    this.logger.info('Configuration updated');
  }

  /**
   * Create adapter configurations
   */
  createAdapterConfigs(): {
    gemini: { apiKey: string; model: string; temperature: number; maxTokens: number; timeout: number; retries: number };
    firebaseAuth: { enableLogging: boolean; enablePersistence: boolean };
    firestore: { enableLogging: boolean; enableCache: boolean };
  } {
    return {
      gemini: {
        apiKey: this.config.aiService.geminiApiKey,
        model: this.config.aiService.model!,
        temperature: this.config.aiService.temperature!,
        maxTokens: this.config.aiService.maxTokens!,
        timeout: this.config.aiService.timeout!,
        retries: this.config.aiService.retries!
      },
      firebaseAuth: {
        enableLogging: this.config.auth.enableLogging,
        enablePersistence: this.config.auth.enablePersistence
      },
      firestore: {
        enableLogging: this.config.environment === 'development',
        enableCache: this.config.environment === 'production'
      }
    };
  }
}

// Singleton instance
let environmentConfig: EnvironmentConfig | null = null;

/**
 * Get singleton environment configuration instance
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (!environmentConfig) {
    environmentConfig = new EnvironmentConfig();
  }
  return environmentConfig;
}

/**
 * Reset configuration (for testing)
 */
export function resetEnvironmentConfig(): void {
  environmentConfig = null;
} 