/**
 * 🏗️ Service Initializer - Banco de Ideias Integration
 * 
 * Conecta os serviços implementados com o container de dependências
 * Garante que todos os serviços do Banco de Ideias sejam registrados corretamente
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: ServiceContainer + IdeaBankService + PersonalizationService
 */

import { ServiceContainer } from './ServiceArchitecture';
import { IdeaBankService } from '../services/business/IdeaBankService';
import { geminiService } from '../services/geminiService';
import { analyticsService } from '../services/analyticsService';

// ============================================================================
// SERVICE INITIALIZER CLASS
// ============================================================================

export class ServiceInitializer {
  private container: ServiceContainer;
  
  constructor(container: ServiceContainer) {
    this.container = container;
  }

  /**
   * Initialize all services for Banco de Ideias
   */
  async initializeBancoDeIdeiasServices(): Promise<void> {
    console.log('🚀 Initializing Banco de Ideias services...');
    
    // Register GeminiService
    this.container.register('GeminiService', () => geminiService, true);
    
    // Register AnalyticsService
    this.container.register('AnalyticsService', () => analyticsService, true);
    
    // Register PersonalizationService with mock for now
    this.container.register('PersonalizationService', () => ({
      getPersonalizationInsights: async (userId: string) => ({
        success: true,
        insights: {
          progress: {
            dataPoints: Math.floor(Math.random() * 100),
            accuracy: Math.random() * 0.5 + 0.5, // 50-100%
            completeness: Math.random() * 0.4 + 0.6, // 60-100%
            learningStage: ['initial', 'learning', 'optimized'][Math.floor(Math.random() * 3)]
          },
          preferences: {
            categories: ['Marketing & Growth', 'Content Creation'],
            styles: ['Practical', 'Creative'],
            targetAudiences: ['Startups', 'Content Creators'],
            contentTypes: ['Videos', 'Posts'],
            difficulty: 'intermediate',
            themes: {
              preferred: ['Growth', 'Engagement'],
              disliked: ['Complex', 'Technical']
            },
            learningStyle: 'interactive',
            sessionPreferences: {
              ideaFrequency: 3,
              feedbackFrequency: 2,
              notificationLevel: 'moderate'
            }
          },
          recommendations: {
            categories: ['Marketing & Growth', 'Social Media'],
            nextSuggestions: [
              'Explore video content for better engagement',
              'Try Instagram Stories for quick content',
              'Consider collaborative posts with other creators'
            ],
            improvementAreas: ['SEO optimization', 'Call-to-action placement']
          },
          patterns: {
            bestPerformingContent: ['How-to guides', 'Behind-the-scenes'],
            engagementTimes: ['14:00', '16:00', '20:00'],
            preferredJourney: 'visual-first'
          }
        }
      }),
      generatePersonalizedRecommendations: async (params: any) => ({
        success: true,
        recommendations: {
          personalizedContent: {
            suggestedCategories: ['Marketing & Growth', 'Content Creation'],
            adaptedDifficulty: 'intermediate',
            contextualKeywords: ['engagement', 'growth', 'viral', 'authentic']
          },
          uiAdaptations: {
            layout: 'visual',
            interactionStyle: 'guided',
            informationDensity: 'medium'
          },
          nextActions: {
            suggested: ['Generate video idea', 'Create Instagram story', 'Plan series'],
            priority: 'medium'
          }
        }
      }),
      updateUserPreferences: async (userId: string, interaction: any) => ({
        success: true,
        message: 'Preferences updated successfully',
        updatedPreferences: interaction
      }),
      runPersonalizationABTest: async (userId: string, config: any) => ({
        success: true,
        testConfig: {
          testId: `test-${Date.now()}`,
          assignedStrategy: config.strategies[0]?.name || 'default',
          duration: config.duration || 14,
          metrics: config.metrics || ['engagement_rate']
        }
      }),
      healthCheck: async () => true
    }), true);

    // Register Budget Management Service with mock
    this.container.register('BudgetControlService', () => ({
      canUserProceed: async (userId: string, estimatedCost: number) => ({
        allowed: true,
        remaining: Math.floor(Math.random() * 10) + 1,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }),
      getUserBudgetStatus: async (userId: string) => ({
        budgetStatus: {
          status: 'within_limit',
          percentage: Math.random() * 70 + 10 // 10-80%
        },
        dailyCost: Math.random() * 0.5,
        estimatedCost: Math.random() * 0.1 + 0.05,
        tierInfo: {
          currentTier: 'free',
          limits: {
            dailyIdeas: 15,
            monthlyCost: 50
          }
        }
      }),
      healthCheck: async () => true
    }), true);

    // Register User Repository with mock
    this.container.register('UserRepository', () => ({
      findById: async (id: string) => null,
      findMany: async (filter: any) => [],
      create: async (entity: any) => entity,
      update: async (id: string, updates: any) => ({ id, ...updates }),
      delete: async (id: string) => true
    }), true);

    // Register Idea Repository with mock
    this.container.register('IdeaRepository', () => ({
      findById: async (id: string) => null,
      findMany: async (filter: any) => [],
      create: async (entity: any) => entity,
      update: async (id: string, updates: any) => ({ id, ...updates }),
      delete: async (id: string) => true
    }), true);

    // Register Preferences Repository with mock  
    this.container.register('PreferencesRepository', () => ({
      findByUserId: async (userId: string) => null,
      create: async (entity: any) => entity,
      update: async (userId: string, updates: any) => ({ userId, ...updates })
    }), true);

    // Register Rate Limiting Service with mock
    this.container.register('RateLimitingService', () => ({
      checkRateLimit: async (userId: string, operation: string) => ({
        allowed: true,
        remaining: Math.floor(Math.random() * 10) + 1,
        resetTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        window: '1h'
      }),
      healthCheck: async () => true
    }), true);

    // Register Usage Tier Service with mock
    this.container.register('UsageTierService', () => ({
      getUserTier: async (userId: string) => ({
        tier: 'free',
        features: ['basic_ideas', 'limited_analytics'],
        limits: {
          dailyIdeas: 15,
          monthlyIdeas: 300,
          advancedFeatures: false
        }
      }),
      healthCheck: async () => true
    }), true);

    // Register Fallback Service with mock
    this.container.register('FallbackService', () => ({
      getFallbackIdea: async (request: any) => ({
        success: true,
        idea: {
          id: `fallback-${Date.now()}`,
          title: 'Ideia de Fallback',
          description: 'Esta é uma ideia gerada pelo sistema de fallback quando o serviço principal não está disponível.',
          category: request.category || 'General',
          targetAudience: request.targetAudience || 'General',
          implementation: 'Implementação básica de fallback',
          tags: ['fallback', 'backup']
        }
      }),
      healthCheck: async () => true
    }), true);

    // Register the main IdeaBankService
    this.container.register('IdeaBankService', () => new IdeaBankService(this.container), true);

    console.log('✅ All Banco de Ideias services registered successfully');
  }

  /**
   * Initialize all services
   */
  async initializeAllServices(): Promise<void> {
    await this.initializeBancoDeIdeiasServices();
    
    // Initialize services that need initialization
    const servicesToInitialize = [
      'IdeaBankService',
      'GeminiService',
      'AnalyticsService',
      'PersonalizationService'
    ];

    for (const serviceName of servicesToInitialize) {
      if (this.container.has(serviceName)) {
        try {
          const service = this.container.resolve(serviceName);
          if (service && typeof service.initialize === 'function') {
            await service.initialize();
            console.log(`✅ ${serviceName} initialized successfully`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to initialize ${serviceName}:`, error);
        }
      }
    }
  }

  /**
   * Health check all services
   */
  async healthCheckAllServices(): Promise<{ [key: string]: boolean }> {
    const services = [
      'IdeaBankService',
      'GeminiService', 
      'AnalyticsService',
      'PersonalizationService',
      'BudgetControlService',
      'RateLimitingService',
      'UsageTierService',
      'FallbackService'
    ];

    const results: { [key: string]: boolean } = {};

    for (const serviceName of services) {
      if (this.container.has(serviceName)) {
        try {
          const service = this.container.resolve(serviceName);
          if (service && typeof service.healthCheck === 'function') {
            results[serviceName] = await service.healthCheck();
          } else {
            results[serviceName] = true;
          }
        } catch (error) {
          console.error(`❌ Health check failed for ${serviceName}:`, error);
          results[serviceName] = false;
        }
      } else {
        results[serviceName] = false;
      }
    }

    return results;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize services for Banco de Ideias
 */
export async function initializeBancoDeIdeiasServices(container: ServiceContainer): Promise<void> {
  const initializer = new ServiceInitializer(container);
  await initializer.initializeAllServices();
}

/**
 * Health check all services
 */
export async function healthCheckServices(container: ServiceContainer): Promise<{ [key: string]: boolean }> {
  const initializer = new ServiceInitializer(container);
  return await initializer.healthCheckAllServices();
}

export default ServiceInitializer; 