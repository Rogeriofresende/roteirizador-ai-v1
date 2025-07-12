/**
 * Service Architecture - Week 0 IA Alpha Implementation
 * Clean Architecture pattern with comprehensive service organization
 * Integrates cost management, dependency injection, and scalable patterns
 * 
 * Architecture Layers:
 * - Domain Layer: Business logic and entities
 * - Application Layer: Use cases and orchestration
 * - Infrastructure Layer: External services and data access
 * - Presentation Layer: UI and API interfaces
 */

// Core Interfaces and Contracts
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter: any): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export interface IService {
  initialize(): Promise<void>;
  healthCheck(): Promise<boolean>;
  getMetrics(): any;
}

export interface ICostAware {
  estimateCost(operation: string, data: any): Promise<number>;
  recordCost(cost: number, metadata: any): Promise<void>;
  checkBudget(userId: string, estimatedCost: number): Promise<boolean>;
}

// Dependency Injection Container
export class ServiceContainer {
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();
  
  // Register service factory
  register<T>(name: string, factory: () => T, singleton: boolean = true): void {
    if (singleton) {
      this.singletons.set(name, factory);
    } else {
      this.services.set(name, factory);
    }
  }
  
  // Resolve service instance
  resolve<T>(name: string): T {
    if (this.singletons.has(name)) {
      const factory = this.singletons.get(name);
      const instance = factory();
      // Replace factory with instance for singleton behavior
      this.singletons.set(name, () => instance);
      return instance;
    }
    
    if (this.services.has(name)) {
      const factory = this.services.get(name);
      return factory();
    }
    
    throw new Error(`Service ${name} not registered`);
  }
  
  // Check if service is registered
  has(name: string): boolean {
    return this.singletons.has(name) || this.services.has(name);
  }
}

// Base Service Class with Cost Management Integration
export abstract class BaseService implements IService, ICostAware {
  protected container: ServiceContainer;
  protected costManagement: any;
  protected initialized: boolean = false;
  
  constructor(container: ServiceContainer) {
    this.container = container;
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize cost management if available
    if (this.container.has('CostManagementService')) {
      this.costManagement = this.container.resolve('CostManagementService');
    }
    
    await this.onInitialize();
    this.initialized = true;
  }
  
  protected abstract onInitialize(): Promise<void>;
  
  abstract healthCheck(): Promise<boolean>;
  abstract getMetrics(): any;
  
  // Cost management integration
  async estimateCost(operation: string, data: any): Promise<number> {
    if (!this.costManagement) return 0;
    return this.costManagement.estimateCost(operation, data);
  }
  
  async recordCost(cost: number, metadata: any): Promise<void> {
    if (!this.costManagement) return;
    await this.costManagement.recordCost(metadata.userId, cost, metadata.tokens, metadata.operation);
  }
  
  async checkBudget(userId: string, estimatedCost: number): Promise<boolean> {
    if (!this.costManagement) return true;
    
    const budgetControl = this.container.resolve('BudgetControlService');
    const result = await budgetControl.canUserProceed(userId, estimatedCost);
    return result.allowed;
  }
}

// Use Case Base Class
export abstract class BaseUseCase<TRequest, TResponse> implements IUseCase<TRequest, TResponse> {
  protected container: ServiceContainer;
  
  constructor(container: ServiceContainer) {
    this.container = container;
  }
  
  abstract execute(request: TRequest): Promise<TResponse>;
  
  // Helper method to resolve services
  protected getService<T>(name: string): T {
    return this.container.resolve<T>(name);
  }
}

// Service Registration
export interface ServiceRegistration {
  name: string;
  factory: () => any;
  singleton: boolean;
  dependencies: string[];
}

// Application Configuration
export interface ApplicationConfig {
  environment: 'development' | 'staging' | 'production';
  costManagement: {
    enabled: boolean;
    budgetLimits: {
      daily: number;
      monthly: number;
      emergency: number;
    };
    alertThresholds: number[];
  };
  rateLimiting: {
    enabled: boolean;
    tierLimits: {
      free: { ideasPerDay: number };
      premium: { ideasPerDay: number };
      enterprise: { ideasPerDay: number };
    };
  };
  personalization: {
    enabled: boolean;
    learningLevels: string[];
    confidenceThreshold: number;
  };
  referral: {
    enabled: boolean;
    tiers: string[];
    rewards: any;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    healthCheckInterval: number;
  };
}

// Service Factory for Auto-Registration
export class ServiceFactory {
  private container: ServiceContainer;
  private config: ApplicationConfig;
  
  constructor(config: ApplicationConfig) {
    this.container = new ServiceContainer();
    this.config = config;
    this.registerCoreServices();
  }
  
  private registerCoreServices(): void {
    // Register configuration
    this.container.register('ApplicationConfig', () => this.config, true);
    
    // Register cost management services
    if (this.config.costManagement.enabled) {
      this.registerCostManagementServices();
    }
    
    // Register AI services
    this.registerAIServices();
    
    // Register business services
    this.registerBusinessServices();
    
    // Register infrastructure services
    this.registerInfrastructureServices();
  }
  
  private registerCostManagementServices(): void {
    // Import cost management services dynamically
    this.container.register('CostManagementService', () => {
      const CostManagementService = require('../cost-management/costManagementService').default;
      return new CostManagementService();
    }, true);
    
    this.container.register('BudgetControlService', () => {
      const BudgetControlService = require('../cost-management/budgetControlService').default;
      return new BudgetControlService();
    }, true);
    
    this.container.register('RateLimitingService', () => {
      const RateLimitingService = require('../cost-management/rateLimitingService').default;
      return new RateLimitingService();
    }, true);
    
    this.container.register('PriorityQueueService', () => {
      const PriorityQueueService = require('../cost-management/priorityQueueService').default;
      return new PriorityQueueService();
    }, true);
    
    this.container.register('FallbackService', () => {
      const FallbackService = require('../cost-management/fallbackService').default;
      return new FallbackService();
    }, true);
    
    this.container.register('UsageTierService', () => {
      const { UsageTierService } = require('../cost-management/usageTierService');
      return new UsageTierService();
    }, true);
  }
  
  private registerAIServices(): void {
    this.container.register('GeminiService', () => {
      const GeminiService = require('../ai/GeminiService').default;
      return new GeminiService();
    }, true);
    
    // Future: Additional AI services
    // this.container.register('PersonalizationAIService', () => {...}, true);
    // this.container.register('ContentAnalysisService', () => {...}, true);
  }
  
  private registerBusinessServices(): void {
    // Week 0 Days 4-5 - Business Services Implementation
    this.container.register('IdeaBankService', () => {
      const IdeaBankService = require('../services/business/IdeaBankService').default;
      return new IdeaBankService(this.container);
    }, true);
    
    this.container.register('PersonalizationService', () => {
      const PersonalizationService = require('../services/business/PersonalizationService').default;
      return new PersonalizationService(this.container);
    }, true);
    
    // Week 0 Days 6-7 - ReferralService Architecture Foundation
    this.container.register('ReferralService', () => {
      const ReferralService = require('../services/business/ReferralService').default;
      return new ReferralService(this.container);
    }, true);
  }
  
  private registerInfrastructureServices(): void {
    // Week 0 Days 4-5 - Repository Pattern Implementations
    this.container.register('UserRepository', () => {
      const UserRepository = require('../repositories/UserRepository').default;
      return new UserRepository();
    }, true);
    
    this.container.register('IdeaRepository', () => {
      const IdeaRepository = require('../repositories/IdeaRepository').default;
      return new IdeaRepository();
    }, true);
    
    this.container.register('PreferencesRepository', () => {
      const PreferencesRepository = require('../repositories/PreferencesRepository').default;
      return new PreferencesRepository();
    }, true);
    
    // Week 0 Days 6-7 - Analytics Service Implementation
    this.container.register('AnalyticsService', () => {
      const AnalyticsService = require('../services/analytics/AnalyticsService').default;
      return new AnalyticsService(this.container);
    }, true);
    
    // Week 0 Support Services - NotificationService
    this.container.register('NotificationService', () => {
      const NotificationService = require('../services/infrastructure/NotificationService').default;
      return new NotificationService(this.container);
    }, true);
    
    this.container.register('MonitoringService', () => {
      // const MonitoringService = require('../monitoring/MonitoringService').default;
      // return new MonitoringService(this.container);
      return null; // Placeholder for future implementation
    }, true);
  }
  
  // Get configured container
  getContainer(): ServiceContainer {
    return this.container;
  }
  
  // Initialize all services
  async initializeServices(): Promise<void> {
    const initializationOrder = [
      'CostManagementService',
      'BudgetControlService', 
      'RateLimitingService',
      'PriorityQueueService',
      'FallbackService',
      'UsageTierService',
      'GeminiService',
      'UserRepository',
      'IdeaRepository', 
      'PreferencesRepository',
      'AnalyticsService',
      'NotificationService',
      'PersonalizationService',
      'IdeaBankService',
      'ReferralService'
    ];
    
    for (const serviceName of initializationOrder) {
      if (this.container.has(serviceName)) {
        const service = this.container.resolve(serviceName);
        if (service && typeof service.initialize === 'function') {
          await service.initialize();
          console.log(`✅ Service initialized: ${serviceName}`);
        }
      }
    }
  }
  
  // Health check all services
  async healthCheckServices(): Promise<{ [key: string]: boolean }> {
    const services = [
      'CostManagementService',
      'BudgetControlService',
      'RateLimitingService', 
      'PriorityQueueService',
      'FallbackService',
      'GeminiService',
      'AnalyticsService',
      'NotificationService',
      'PersonalizationService',
      'IdeaBankService',
      'ReferralService'
    ];
    
    const results: { [key: string]: boolean } = {};
    
    for (const serviceName of services) {
      if (this.container.has(serviceName)) {
        try {
          const service = this.container.resolve(serviceName);
          if (service && typeof service.healthCheck === 'function') {
            results[serviceName] = await service.healthCheck();
          } else {
            results[serviceName] = true; // Assume healthy if no health check
          }
        } catch (error) {
          console.error(`Health check failed for ${serviceName}:`, error);
          results[serviceName] = false;
        }
      }
    }
    
    return results;
  }
  
  private async collectMetrics(): Promise<void> {
    // Collect metrics from all services
    const services = [
      'CostManagementService',
      'GeminiService',
      'FallbackService',
      'AnalyticsService',
      'NotificationService',
      'PersonalizationService',
      'IdeaBankService',
      'ReferralService'
    ];
    
    for (const serviceName of services) {
      if (this.container.has(serviceName)) {
        try {
          const service = this.container.resolve(serviceName);
          if (service && typeof service.getMetrics === 'function') {
            const metrics = service.getMetrics();
            // Store metrics (would integrate with analytics service)
            console.log(`📊 Metrics for ${serviceName}:`, metrics);
          }
        } catch (error) {
          console.error(`Error collecting metrics for ${serviceName}:`, error);
        }
      }
    }
  }
}

// Application Orchestrator
export class Application {
  private serviceFactory: ServiceFactory;
  private container: ServiceContainer;
  private config: ApplicationConfig;
  private initialized: boolean = false;
  
  constructor(config: ApplicationConfig) {
    this.config = config;
    this.serviceFactory = new ServiceFactory(config);
    this.container = this.serviceFactory.getContainer();
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Application with Enhanced Service Architecture...');
    
    // Initialize all services
    await this.serviceFactory.initializeServices();
    
    // Start monitoring if enabled
    if (this.config.monitoring.enabled) {
      this.startMonitoring();
    }
    
    this.initialized = true;
    console.log('✅ Application initialized successfully');
  }
  
  private startMonitoring(): void {
    // Health check interval
    setInterval(async () => {
      const healthResults = await this.serviceFactory.healthCheckServices();
      const unhealthyServices = Object.entries(healthResults)
        .filter(([_, healthy]) => !healthy)
        .map(([name]) => name);
      
      if (unhealthyServices.length > 0) {
        console.warn('⚠️ Unhealthy services detected:', unhealthyServices);
      }
    }, this.config.monitoring.healthCheckInterval);
    
    // Metrics collection interval
    setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, this.config.monitoring.metricsInterval);
  }
  
  private async collectMetrics(): Promise<void> {
    // Collect metrics from all services
    const services = [
      'CostManagementService',
      'GeminiService',
      'FallbackService',
      'AnalyticsService',
      'NotificationService',
      'PersonalizationService',
      'IdeaBankService',
      'ReferralService'
    ];
    
    for (const serviceName of services) {
      if (this.container.has(serviceName)) {
        try {
          const service = this.container.resolve(serviceName);
          if (service && typeof service.getMetrics === 'function') {
            const metrics = service.getMetrics();
            // Store metrics (would integrate with analytics service)
            console.log(`📊 Metrics for ${serviceName}:`, metrics);
          }
        } catch (error) {
          console.error(`Error collecting metrics for ${serviceName}:`, error);
        }
      }
    }
  }
  
  // Get service instance
  getService<T>(name: string): T {
    return this.container.resolve<T>(name);
  }
  
  // Application status
  async getStatus(): Promise<{
    initialized: boolean;
    healthy: boolean;
    services: { [key: string]: boolean };
    config: ApplicationConfig;
  }> {
    const healthResults = await this.serviceFactory.healthCheckServices();
    const healthy = Object.values(healthResults).every(h => h);
    
    return {
      initialized: this.initialized,
      healthy,
      services: healthResults,
      config: this.config
    };
  }
  
  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down application...');
    
    // Shutdown services in reverse order
    const shutdownOrder = [
      'GeminiService',
      'FallbackService',
      'PriorityQueueService',
      'RateLimitingService',
      'BudgetControlService',
      'CostManagementService'
    ];
    
    for (const serviceName of shutdownOrder) {
      if (this.container.has(serviceName)) {
        try {
          const service = this.container.resolve(serviceName);
          if (service && typeof service.shutdown === 'function') {
            await service.shutdown();
            console.log(`✅ Service shut down: ${serviceName}`);
          }
        } catch (error) {
          console.error(`Error shutting down ${serviceName}:`, error);
        }
      }
    }
    
    console.log('✅ Application shut down successfully');
  }
}

// Default Application Configuration
export const defaultConfig: ApplicationConfig = {
  environment: 'development',
  costManagement: {
    enabled: true,
    budgetLimits: {
      daily: 1.67,
      monthly: 50.00,
      emergency: 3.00
    },
    alertThresholds: [0.8, 1.0, 1.8]
  },
  rateLimiting: {
    enabled: true,
    tierLimits: {
      free: { ideasPerDay: 5 },
      premium: { ideasPerDay: 15 },
      enterprise: { ideasPerDay: 50 }
    }
  },
  personalization: {
    enabled: true,
    learningLevels: ['basic', 'behavioral', 'contextual'],
    confidenceThreshold: 0.7
  },
  referral: {
    enabled: true,
    tiers: ['helper', 'advocate', 'champion'],
    rewards: {
      helper: { points: 100, benefits: ['badge'] },
      advocate: { points: 500, benefits: ['badge', 'bonus_ideas'] },
      champion: { points: 1000, benefits: ['badge', 'bonus_ideas', 'premium_access'] }
    }
  },
  monitoring: {
    enabled: true,
    metricsInterval: 30000, // 30 seconds
    healthCheckInterval: 60000 // 1 minute
  }
};

// Export singleton application instance
let applicationInstance: Application | null = null;

export function getApplication(config?: ApplicationConfig): Application {
  if (!applicationInstance) {
    applicationInstance = new Application(config || defaultConfig);
  }
  return applicationInstance;
}

export function resetApplication(): void {
  applicationInstance = null;
}

export default {
  ServiceContainer,
  BaseService,
  BaseUseCase,
  ServiceFactory,
  Application,
  getApplication,
  resetApplication,
  defaultConfig
}; 