// Infrastructure Layer - Adapters and Repositories Index
// Centralized exports for Clean Architecture infrastructure layer

// Base Repository
export { FirestoreRepository, checkFirestoreHealth } from './FirestoreRepository';
export type { RepositoryConfig, QueryOptions } from './FirestoreRepository';

// External Service Adapters
export { GeminiAdapter } from './GeminiAdapter';
export type { 
  GeminiConfig, 
  GenerationRequest, 
  GenerationResponse, 
  ConnectionTestResult 
} from './GeminiAdapter';

export { FirebaseAuthAdapter } from './FirebaseAuthAdapter';
export type { 
  AuthConfig, 
  UserProfile, 
  SignInCredentials, 
  SignUpData, 
  AuthState, 
  AuthStateListener 
} from './FirebaseAuthAdapter';

// Configuration Management
export { EnvironmentConfig, getEnvironmentConfig, resetEnvironmentConfig } from '../config/EnvironmentConfig';
export type {
  DatabaseConfig,
  AIServiceConfig,
  MonitoringConfig,
  AppConfig,
  EnvironmentConfiguration,
  ValidationResult
} from '../config/EnvironmentConfig';

// Specific Repositories
export { UserRepository } from './UserRepository';
export type { 
  User, 
  UserProfile as UserEntity,
  UserFilters, 
  UserStats 
} from './UserRepository';

export { ScriptRepository } from './ScriptRepository';
export type {
  Script,
  ScriptFilters,
  ScriptStats
} from './ScriptRepository';

export { TemplateRepository } from './TemplateRepository';
export type {
  Template,
  TemplateFilters,
  TemplateStats
} from './TemplateRepository';

export { ProjectRepository } from './ProjectRepository';
export type {
  Project,
  ProjectFilters,
  ProjectStats
} from './ProjectRepository';

export { CollaborationRepository } from './CollaborationRepository';
export type {
  CollaborationSession,
  CollaborationFilters,
  CollaborationStats
} from './CollaborationRepository';

// Infrastructure Health Check
export interface InfrastructureHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    firestore: { status: 'healthy' | 'unhealthy'; message: string };
    gemini: { status: 'healthy' | 'unhealthy'; configured: boolean; responseTime?: number; error?: string };
    auth: { status: 'healthy' | 'unhealthy'; isInitialized: boolean; currentUser: boolean; error?: string };
    config: { status: 'healthy' | 'unhealthy'; isValid: boolean; errors: string[]; warnings: string[] };
  };
  timestamp: Date;
}

/**
 * Check overall infrastructure health
 */
export async function checkInfrastructureHealth(): Promise<InfrastructureHealth> {
  const timestamp = new Date();
  
  try {
    // Check Firestore health
    const firestoreHealth = await checkFirestoreHealth();
    
    // Check configuration
    const envConfig = getEnvironmentConfig();
    const configValidation = envConfig.validate();
    
    // Create minimal adapter instances for health checks
    let geminiHealth = { status: 'unhealthy' as const, configured: false, error: 'Not configured' };
    let authHealth = { status: 'unhealthy' as const, isInitialized: false, currentUser: false, error: 'Not configured' };
    
    // Check Gemini if configured
    if (envConfig.isServiceConfigured('aiService')) {
      try {
        const geminiAdapter = new GeminiAdapter(envConfig.getAIServiceConfig());
        const geminiStatus = await geminiAdapter.getHealth();
        geminiHealth = {
          status: geminiStatus.status,
          configured: geminiStatus.configured,
          responseTime: geminiStatus.responseTime,
          error: geminiStatus.error
        };
      } catch (error) {
        geminiHealth.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    
    // Check Auth if configured
    if (envConfig.isServiceConfigured('auth')) {
      try {
        const authAdapter = new FirebaseAuthAdapter(envConfig.getAuthConfig());
        const authStatus = await authAdapter.getHealth();
        authHealth = {
          status: authStatus.status,
          isInitialized: authStatus.isInitialized,
          currentUser: authStatus.currentUser,
          error: authStatus.error
        };
      } catch (error) {
        authHealth.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    
    // Determine overall status
    const services = {
      firestore: firestoreHealth,
      gemini: geminiHealth,
      auth: authHealth,
      config: {
        status: configValidation.isValid ? 'healthy' as const : 'unhealthy' as const,
        isValid: configValidation.isValid,
        errors: configValidation.errors,
        warnings: configValidation.warnings
      }
    };
    
    // Overall status logic
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    const healthyServices = Object.values(services).filter(s => s.status === 'healthy').length;
    const totalServices = Object.keys(services).length;
    
    if (healthyServices === 0) {
      overallStatus = 'unhealthy';
    } else if (healthyServices < totalServices) {
      overallStatus = 'degraded';
    }
    
    return {
      status: overallStatus,
      services,
      timestamp
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      services: {
        firestore: { status: 'unhealthy', message: 'Error during health check' },
        gemini: { status: 'unhealthy', configured: false, error: 'Error during health check' },
        auth: { status: 'unhealthy', isInitialized: false, currentUser: false, error: 'Error during health check' },
        config: { status: 'unhealthy', isValid: false, errors: ['Error during health check'], warnings: [] }
      },
      timestamp
    };
  }
}

// Infrastructure Bootstrap (for dependency injection integration)
export interface InfrastructureBootstrap {
  userRepository: UserRepository;
  scriptRepository: ScriptRepository;
  templateRepository: TemplateRepository;
  projectRepository: ProjectRepository;
  collaborationRepository: CollaborationRepository;
  geminiAdapter: GeminiAdapter;
  authAdapter: FirebaseAuthAdapter;
  environmentConfig: EnvironmentConfig;
}

/**
 * Bootstrap infrastructure layer with dependency injection
 */
export function bootstrapInfrastructure(): InfrastructureBootstrap {
  const environmentConfig = getEnvironmentConfig();
  const adapterConfigs = environmentConfig.createAdapterConfigs();
  
  return {
    userRepository: new UserRepository(),
    scriptRepository: new ScriptRepository(),
    templateRepository: new TemplateRepository(),
    projectRepository: new ProjectRepository(),
    collaborationRepository: new CollaborationRepository(),
    geminiAdapter: new GeminiAdapter(adapterConfigs.gemini),
    authAdapter: new FirebaseAuthAdapter(adapterConfigs.firebaseAuth),
    environmentConfig
  };
} 