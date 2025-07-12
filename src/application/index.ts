// Application Layer - Clean Architecture V6.4
// Central export for the entire application layer

// DTOs (Data Transfer Objects)
export * from './dto';

// Use Cases
export * from './usecases';

// Application Services
export * from './services';

// Interfaces
export * from './interfaces';

// Application Layer Configuration
export interface ApplicationLayerConfig {
  useCache: boolean;
  cacheConfig: {
    defaultTTL: number;
    scriptsCacheTTL: number;
    templatesCacheTTL: number;
  };
  collaborationConfig: {
    maxParticipants: number;
    sessionTimeout: number;
    heartbeatInterval: number;
  };
  analyticsConfig: {
    enableTracking: boolean;
    batchSize: number;
    flushInterval: number;
  };
  validationConfig: {
    strictMode: boolean;
    throwOnValidationError: boolean;
  };
}

// Default configuration
export const defaultApplicationConfig: ApplicationLayerConfig = {
  useCache: true,
  cacheConfig: {
    defaultTTL: 3600, // 1 hour
    scriptsCacheTTL: 1800, // 30 minutes
    templatesCacheTTL: 3600, // 1 hour
  },
  collaborationConfig: {
    maxParticipants: 10,
    sessionTimeout: 3600000, // 1 hour in ms
    heartbeatInterval: 30000, // 30 seconds
  },
  analyticsConfig: {
    enableTracking: true,
    batchSize: 100,
    flushInterval: 60000, // 1 minute
  },
  validationConfig: {
    strictMode: true,
    throwOnValidationError: false,
  },
}; 