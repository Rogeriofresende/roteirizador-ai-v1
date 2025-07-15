/**
 * Idea Bank Service Foundation - Week 0 IA Alpha Days 4-5 Implementation
 * Core business service for idea generation with comprehensive cost management
 * Foundation for Week 1 Banco de Ideias implementation
 * 
 * Features:
 * - Cost-aware idea generation with tier management
 * - Personalization integration and learning system
 * - Analytics tracking and performance monitoring
 * - Integration with all cost management services
 * - Repository pattern for data persistence
 * - Clean architecture with dependency injection
 */

import { BaseService } from '../../architecture/ServiceArchitecture';
import { ServiceContainer } from '../../architecture/ServiceArchitecture';
import { Idea, User, UserPreferences } from '../../database/schema';

// Request/Response interfaces
export interface GenerateIdeaRequest {
  userId: string;
  category?: string;
  style?: string;
  targetAudience?: string;
  contentType?: string;
  keywords?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  personalizedContext?: {
    preferredCategories?: string[];
    preferredStyles?: string[];
    targetAudiences?: string[];
    recentInteractions?: any[];
  };
}

export interface GenerateIdeaResponse {
  success: boolean;
  idea?: Idea;
  metadata: {
    cost: number;
    tokensUsed: number;
    processingTime: number;
    source: 'ai' | 'cache' | 'fallback';
    serviceLevel: string;
    personalizationApplied: boolean;
    tierInfo: {
      current: string;
      remaining: number;
      resetTime: Date;
    };
  };
  recommendations?: string[];
  error?: string;
}

export interface IdeaFeedbackRequest {
  userId: string;
  ideaId: string;
  interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement';
  rating?: number; // 1-5 stars
  feedback?: string;
  implementationResults?: string;
}

export interface IdeaFeedbackResponse {
  success: boolean;
  updatedPreferences?: any;
  personalizationImpact: {
    learningLevelUpdated: boolean;
    confidenceScoreChange: number;
    newRecommendations: string[];
  };
  cost: number;
  error?: string;
}

export interface GetUserIdeasRequest {
  userId: string;
  filters?: {
    category?: string;
    status?: 'generated' | 'reviewed' | 'implemented' | 'archived';
    dateRange?: { start: Date; end: Date };
    rating?: { min: number; max: number };
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: 'createdAt' | 'rating' | 'engagementScore' | 'personalizedScore';
    order: 'asc' | 'desc';
  };
}

export interface GetUserIdeasResponse {
  success: boolean;
  ideas: Idea[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  analytics: {
    totalGenerated: number;
    averageRating: number;
    implementationRate: number;
    topCategories: Array<{ category: string; count: number }>;
  };
  error?: string;
}

export interface IdeaBankMetrics {
  userMetrics: {
    activeUsers: number;
    ideasGenerated: number;
    averageRating: number;
    implementationRate: number;
    personalizationEffectiveness: number;
  };
  costMetrics: {
    totalCost: number;
    costPerIdea: number;
    costEfficiency: number;
    budgetUtilization: number;
  };
  performanceMetrics: {
    averageResponseTime: number;
    cacheHitRate: number;
    fallbackUsage: number;
    errorRate: number;
  };
  tierMetrics: {
    free: { users: number; ideas: number; cost: number };
    premium: { users: number; ideas: number; cost: number };
    enterprise: { users: number; ideas: number; cost: number };
  };
}

export interface SaveIdeaRequest {
  userId: string;
  idea: {
    id: string;
    title: string;
    description: string;
    category: string;
    targetAudience: string;
    implementation: string;
    tags: string[];
  };
  metadata?: {
    source: string;
    cost: number;
    tokensUsed: number;
  };
}

export interface SaveIdeaResponse {
  success: boolean;
  savedIdea?: Idea;
  error?: string;
}

export interface QuickAddIdeaRequest {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface QuickAddIdeaResponse {
  success: boolean;
  idea?: Idea;
  error?: string;
}

export interface SearchIdeasRequest {
  userId: string;
  searchTerm: string;
  filters?: {
    category?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchIdeasResponse {
  success: boolean;
  ideas: Idea[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export class IdeaBankService extends BaseService {
  private geminiService: any;
  private personalizationService: any;
  private userRepository: any;
  private ideaRepository: any;
  private preferencesRepository: any;
  private rateLimitingService: any;
  private usageTierService: any;
  private budgetControlService: any;
  private fallbackService: any;
  
  // Service metrics
  private metrics: IdeaBankMetrics = {
    userMetrics: {
      activeUsers: 0,
      ideasGenerated: 0,
      averageRating: 0,
      implementationRate: 0,
      personalizationEffectiveness: 0
    },
    costMetrics: {
      totalCost: 0,
      costPerIdea: 0,
      costEfficiency: 0,
      budgetUtilization: 0
    },
    performanceMetrics: {
      averageResponseTime: 0,
      cacheHitRate: 0,
      fallbackUsage: 0,
      errorRate: 0
    },
    tierMetrics: {
      free: { users: 0, ideas: 0, cost: 0 },
      premium: { users: 0, ideas: 0, cost: 0 },
      enterprise: { users: 0, ideas: 0, cost: 0 }
    }
  };

  constructor(container: ServiceContainer) {
    super(container);
  }

  protected async onInitialize(): Promise<void> {
    // Initialize dependencies
    this.geminiService = this.container.resolve('GeminiService');
    
    // Cost management services
    this.rateLimitingService = this.container.resolve('RateLimitingService');
    this.usageTierService = this.container.resolve('UsageTierService');
    this.budgetControlService = this.container.resolve('BudgetControlService');
    this.fallbackService = this.container.resolve('FallbackService');
    
    // Repository services (placeholders for now)
    try {
      this.userRepository = this.container.resolve('UserRepository');
      this.ideaRepository = this.container.resolve('IdeaRepository');
      this.preferencesRepository = this.container.resolve('PreferencesRepository');
    } catch (error) {
      console.warn('Repository services not available yet - using mock implementations');
      this.initializeMockRepositories();
    }
    
    // Personalization service (placeholder for Week 1)
    try {
      this.personalizationService = this.container.resolve('PersonalizationService');
    } catch (error) {
      console.warn('PersonalizationService not available yet - using basic implementation');
      this.initializeMockPersonalization();
    }
    
    console.log('✅ IdeaBankService initialized with cost management integration');
  }

  /**
   * Generate a new idea with comprehensive cost and tier management
   */
  public async generateIdea(request: GenerateIdeaRequest): Promise<GenerateIdeaResponse> {
    const startTime = Date.now();
    
    try {
      // Check user tier and rate limits
      const userTier = await this.usageTierService.getUserTier(request.userId);
      const rateLimitCheck = await this.rateLimitingService.checkRateLimit(request.userId, 'idea_generation');
      
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          metadata: {
            cost: 0,
            tokensUsed: 0,
            processingTime: Date.now() - startTime,
            source: 'cache',
            serviceLevel: 'rate_limited',
            personalizationApplied: false,
            tierInfo: {
              current: userTier.tier,
              remaining: rateLimitCheck.remaining,
              resetTime: rateLimitCheck.resetTime
            }
          },
          error: `Rate limit exceeded. ${rateLimitCheck.remaining} requests remaining. Reset at ${rateLimitCheck.resetTime.toLocaleTimeString()}`
        };
      }

      // Get user preferences for personalization
      const userPreferences = await this.getUserPreferences(request.userId);
      const personalizedRequest = await this.applyPersonalization(request, userPreferences);

      // Generate idea using GeminiService
      const ideaResult = await this.geminiService.generateIdea({
        userId: request.userId,
        category: personalizedRequest.category,
        style: personalizedRequest.style,
        targetAudience: personalizedRequest.targetAudience,
        contentType: personalizedRequest.contentType,
        keywords: personalizedRequest.keywords,
        personalizedContext: personalizedRequest.personalizedContext
      });

      // ✅ CORREÇÃO: Verificar se a ideia foi gerada com sucesso
      if (!ideaResult || !ideaResult.content) {
        return {
          success: false,
          metadata: {
            cost: 0,
            tokensUsed: 0,
            processingTime: Date.now() - startTime,
            source: 'ai',
            serviceLevel: 'error',
            personalizationApplied: false,
            tierInfo: {
              current: userTier.tier,
              remaining: rateLimitCheck.remaining,
              resetTime: rateLimitCheck.resetTime
            }
          },
          error: 'Falha na geração da ideia'
        };
      }

      // ✅ CORREÇÃO: Processar o conteúdo da ideia gerada
      const parsedContent = this.parseIdeaContent(ideaResult.content);
      
      // Create and save idea entity
      const idea: Idea = {
        id: this.generateId(),
        userId: request.userId,
        title: parsedContent.title || `Ideia de ${ideaResult.metadata.contentType}`,
        description: parsedContent.description || ideaResult.content,
        category: ideaResult.metadata.category,
        targetAudience: ideaResult.metadata.targetAudience,
        implementation: parsedContent.implementation || parsedContent.execution || 'Ver descrição completa',
        aiMetadata: {
          model: 'gemini-1.5-flash',
          tokensUsed: 100, // Estimativa
          cost: 0.01, // Estimativa
          confidence: 0.8, // Estimativa
          personalizedScore: 0.7, // Estimativa
          trending: false,
          prompt: 'Prompt de geração de ideia',
          processingTime: Date.now() - startTime
        },
        userFeedback: {
          implemented: false
        },
        analytics: {
          views: 0,
          saves: 0,
          shares: 0,
          implementations: 0,
          engagementScore: 0,
          viralScore: 0
        },
        status: 'generated',
        tags: this.extractTags(ideaResult.metadata),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save idea to repository
      const savedIdea = await this.saveIdeaToRepository(idea);

      // Update metrics
      await this.updateMetrics('idea_generated', {
        userId: request.userId,
        tier: userTier.tier,
        cost: ideaResult.metadata.cost,
        processingTime: Date.now() - startTime
      });

      // Generate recommendations based on user preferences
      const recommendations = await this.generateRecommendations(request.userId, savedIdea);

      return {
        success: true,
        idea: savedIdea,
        metadata: {
          cost: 0.01, // Estimativa - será calculado pela API
          tokensUsed: 100, // Estimativa - será calculado pela API
          processingTime: Date.now() - startTime,
          source: 'ai',
          serviceLevel: 'premium',
          personalizationApplied: !!personalizedRequest.personalizedContext,
          tierInfo: {
            current: userTier.tier,
            remaining: rateLimitCheck.remaining - 1,
            resetTime: rateLimitCheck.resetTime
          }
        },
        recommendations
      };

    } catch (error) {
      console.error('Error in generateIdea:', error);
      
      // Update error metrics
      await this.updateMetrics('error', {
        userId: request.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        metadata: {
          cost: 0,
          tokensUsed: 0,
          processingTime: Date.now() - startTime,
          source: 'ai',
          serviceLevel: 'error',
          personalizationApplied: false,
          tierInfo: {
            current: 'unknown',
            remaining: 0,
            resetTime: new Date()
          }
        },
        error: error instanceof Error ? error.message : 'Failed to generate idea'
      };
    }
  }

  /**
   * Process user feedback and update personalization
   */
  public async processIdeaFeedback(request: IdeaFeedbackRequest): Promise<IdeaFeedbackResponse> {
    try {
      // Check budget for personalization update
      const personalizationCost = 0.001;
      const budgetCheck = await this.checkBudget(request.userId, personalizationCost);
      
      if (!budgetCheck) {
        return {
          success: false,
          personalizationImpact: {
            learningLevelUpdated: false,
            confidenceScoreChange: 0,
            newRecommendations: []
          },
          cost: 0,
          error: 'Budget limit reached for personalization updates'
        };
      }

      // Get current idea
      const idea = await this.getIdeaById(request.ideaId);
      if (!idea || idea.userId !== request.userId) {
        return {
          success: false,
          personalizationImpact: {
            learningLevelUpdated: false,
            confidenceScoreChange: 0,
            newRecommendations: []
          },
          cost: 0,
          error: 'Idea not found or access denied'
        };
      }

      // Update idea with feedback
      const updatedIdea = {
        ...idea,
        userFeedback: {
          ...idea.userFeedback,
          rating: request.rating,
          feedback: request.feedback,
          implemented: request.interactionType === 'implement',
          implementationDate: request.interactionType === 'implement' ? new Date() : idea.userFeedback.implementationDate,
          results: request.implementationResults || idea.userFeedback.results
        },
        analytics: {
          ...idea.analytics,
          saves: idea.analytics.saves + (request.interactionType === 'save' ? 1 : 0),
          shares: idea.analytics.shares + (request.interactionType === 'share' ? 1 : 0),
          implementations: idea.analytics.implementations + (request.interactionType === 'implement' ? 1 : 0)
        },
        updatedAt: new Date()
      };

      // Save updated idea
      await this.saveIdeaToRepository(updatedIdea);

      // Update personalization using GeminiService
      const personalizationResult = await this.geminiService.updatePersonalization({
        userId: request.userId,
        interactionType: request.interactionType,
        contentId: request.ideaId,
        category: idea.category,
        feedback: request.feedback
      });

      // Update user preferences
      const currentPreferences = await this.getUserPreferences(request.userId);
      const updatedPreferences = await this.updateUserPreferences(
        request.userId,
        currentPreferences,
        request.interactionType,
        idea
      );

      // Calculate personalization impact
      const personalizationImpact = this.calculatePersonalizationImpact(
        currentPreferences,
        updatedPreferences,
        request.interactionType
      );

      // Record cost
      await this.recordCost(personalizationCost, {
        userId: request.userId,
        operation: 'personalization_update',
        tokens: 10
      });

      // Update metrics
      await this.updateMetrics('feedback_processed', {
        userId: request.userId,
        interactionType: request.interactionType,
        cost: personalizationCost
      });

      return {
        success: true,
        updatedPreferences,
        personalizationImpact,
        cost: personalizationCost
      };

    } catch (error) {
      console.error('Error in processIdeaFeedback:', error);
      return {
        success: false,
        personalizationImpact: {
          learningLevelUpdated: false,
          confidenceScoreChange: 0,
          newRecommendations: []
        },
        cost: 0,
        error: error instanceof Error ? error.message : 'Failed to process feedback'
      };
    }
  }

  /**
   * Get user's ideas with filtering and pagination
   */
  public async getUserIdeas(request: GetUserIdeasRequest): Promise<GetUserIdeasResponse> {
    try {
      // Get ideas from repository (mock implementation for now)
      const ideas = await this.getIdeasByUser(request.userId, request.filters, request.pagination, request.sort);
      
      // Calculate analytics
      const analytics = await this.calculateUserAnalytics(request.userId, ideas);

      return {
        success: true,
        ideas: ideas.data,
        pagination: ideas.pagination,
        analytics
      };

    } catch (error) {
      console.error('Error in getUserIdeas:', error);
      return {
        success: false,
        ideas: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false
        },
        analytics: {
          totalGenerated: 0,
          averageRating: 0,
          implementationRate: 0,
          topCategories: []
        },
        error: error instanceof Error ? error.message : 'Failed to get user ideas'
      };
    }
  }

  /**
   * Get comprehensive service metrics
   */
  public getMetrics(): IdeaBankMetrics {
    return { ...this.metrics };
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Check dependencies
      const geminiHealthy = this.geminiService && await this.geminiService.getServiceStatus();
      const costServicesHealthy = this.rateLimitingService && this.budgetControlService;
      
      return !!(geminiHealthy && costServicesHealthy);
    } catch (error) {
      console.error('IdeaBankService health check failed:', error);
      return false;
    }
  }

  // Private helper methods
  private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    // Mock implementation - would use repository
    return {
      id: `pref_${userId}`,
      userId,
      categories: {},
      styles: {},
      audiences: {},
      keywords: [],
      interactions: {
        likes: [],
        dislikes: [],
        saves: [],
        shares: [],
        implementations: []
      },
      settings: {
        personalizedRecommendations: true,
        trendingContent: true,
        categoryDiversity: 0.7,
        difficulty: 'intermediate',
        contentLength: 'medium'
      },
      learning: {
        level: 'basic',
        confidenceScore: 0.5,
        lastLearningUpdate: new Date(),
        dataPoints: 0
      },
      updatedAt: new Date()
    };
  }

  private async applyPersonalization(request: GenerateIdeaRequest, preferences: UserPreferences | null): Promise<GenerateIdeaRequest> {
    if (!preferences || !preferences.settings.personalizedRecommendations) {
      return request;
    }

    // Apply personalization based on user preferences
    const personalizedRequest = { ...request };

    // Use preferred categories if none specified
    if (!personalizedRequest.category && Object.keys(preferences.categories).length > 0) {
      const topCategory = Object.entries(preferences.categories)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      personalizedRequest.category = topCategory[0];
    }

    // Add personalized context
    personalizedRequest.personalizedContext = {
      preferredCategories: Object.keys(preferences.categories),
      preferredStyles: Object.keys(preferences.styles),
      targetAudiences: Object.keys(preferences.audiences),
      recentInteractions: preferences.interactions.likes.slice(-5)
    };

    return personalizedRequest;
  }

  private async saveIdeaToRepository(idea: Idea): Promise<Idea> {
    // Mock implementation - would use repository
    console.log('Saving idea:', idea.id);
    return idea;
  }

  private async getIdeaById(ideaId: string): Promise<Idea | null> {
    // Mock implementation - would use repository
    console.log('Getting idea by ID:', ideaId);
    
    // ✅ CORREÇÃO: Validar se ideaId existe
    if (!ideaId) {
      console.warn('getIdeaById called with undefined or empty ideaId');
      return null;
    }
    
    return null;
  }

  private async getIdeasByUser(userId: string, filters?: any, pagination?: any, sort?: any): Promise<any> {
    // Mock implementation - would use repository
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  private async updateUserPreferences(userId: string, current: UserPreferences | null, interaction: string, idea: Idea): Promise<any> {
    // Mock implementation - would implement learning algorithm
    return current;
  }

  private async generateRecommendations(userId: string, idea: Idea): Promise<string[]> {
    // Mock implementation - would generate personalized recommendations
    return [
      `Try exploring more ${idea.category} content`,
      `Your ${idea.targetAudience} audience might enjoy similar ideas`,
      `Consider implementing this idea to boost engagement`
    ];
  }

  private async calculateUserAnalytics(userId: string, ideas: any[]): Promise<any> {
    // Mock implementation - would calculate real analytics
    return {
      totalGenerated: 0,
      averageRating: 0,
      implementationRate: 0,
      topCategories: []
    };
  }

  private calculatePersonalizationImpact(current: any, updated: any, interaction: string): any {
    // Mock implementation - would calculate learning impact
    return {
      learningLevelUpdated: false,
      confidenceScoreChange: 0,
      newRecommendations: []
    };
  }

  private async updateMetrics(event: string, data: any): Promise<void> {
    // Update service metrics based on events
    switch (event) {
      case 'idea_generated':
        this.metrics.userMetrics.ideasGenerated++;
        this.metrics.costMetrics.totalCost += data.cost;
        this.metrics.tierMetrics[data.tier].ideas++;
        this.metrics.tierMetrics[data.tier].cost += data.cost;
        break;
      case 'feedback_processed':
        // Update feedback metrics
        break;
      case 'error':
        this.metrics.performanceMetrics.errorRate++;
        break;
    }
  }

  private extractTags(metadata: any): string[] {
    // Extract relevant tags from idea metadata
    const tags = [];
    if (metadata?.category) tags.push(metadata.category);
    if (metadata?.targetAudience) tags.push(metadata.targetAudience);
    if (metadata?.contentType) tags.push(metadata.contentType);
    if (metadata?.style) tags.push(metadata.style);
    if (metadata?.trending) tags.push('trending');
    return tags;
  }

  // ✅ NOVA FUNÇÃO: Processar conteúdo markdown da ideia
  private parseIdeaContent(content: string): {
    title?: string;
    description?: string;
    implementation?: string;
    execution?: string;
    elements?: string;
    callToAction?: string;
  } {
    const parsed = {
      title: '',
      description: '',
      implementation: '',
      execution: '',
      elements: '',
      callToAction: ''
    };

    // Dividir o conteúdo por linhas
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Identificar seções por markers
      if (trimmedLine.startsWith('**Título:**')) {
        if (currentSection) {
          parsed[currentSection as keyof typeof parsed] = currentContent.trim();
        }
        currentSection = 'title';
        currentContent = trimmedLine.replace('**Título:**', '').trim();
      } else if (trimmedLine.startsWith('**Descrição:**')) {
        if (currentSection) {
          parsed[currentSection as keyof typeof parsed] = currentContent.trim();
        }
        currentSection = 'description';
        currentContent = trimmedLine.replace('**Descrição:**', '').trim();
      } else if (trimmedLine.startsWith('**Execução:**')) {
        if (currentSection) {
          parsed[currentSection as keyof typeof parsed] = currentContent.trim();
        }
        currentSection = 'execution';
        currentContent = trimmedLine.replace('**Execução:**', '').trim();
      } else if (trimmedLine.startsWith('**Elementos-chave:**')) {
        if (currentSection) {
          parsed[currentSection as keyof typeof parsed] = currentContent.trim();
        }
        currentSection = 'elements';
        currentContent = trimmedLine.replace('**Elementos-chave:**', '').trim();
      } else if (trimmedLine.startsWith('**Call-to-action:**')) {
        if (currentSection) {
          parsed[currentSection as keyof typeof parsed] = currentContent.trim();
        }
        currentSection = 'callToAction';
        currentContent = trimmedLine.replace('**Call-to-action:**', '').trim();
      } else if (trimmedLine.length > 0) {
        // Adicionar conteúdo à seção atual
        if (currentContent) {
          currentContent += '\n' + trimmedLine;
        } else {
          currentContent = trimmedLine;
        }
      }
    }

    // Processar última seção
    if (currentSection) {
      parsed[currentSection as keyof typeof parsed] = currentContent.trim();
    }

    // Se não encontrou estrutura, usar o conteúdo completo como descrição
    if (!parsed.title && !parsed.description) {
      parsed.description = content;
    }

    return {
      title: parsed.title,
      description: parsed.description,
      implementation: parsed.execution,
      execution: parsed.execution,
      elements: parsed.elements,
      callToAction: parsed.callToAction
    };
  }

  private generateId(): string {
    return `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMockRepositories(): void {
    // Initialize mock repositories for development
    this.userRepository = {
      findById: async (id: string) => null,
      create: async (user: any) => user,
      update: async (id: string, updates: any) => null
    };
    
    this.ideaRepository = {
      findById: async (id: string) => null,
      findByUserId: async (userId: string) => [],
      create: async (idea: any) => idea,
      update: async (id: string, updates: any) => null
    };
    
    this.preferencesRepository = {
      findByUserId: async (userId: string) => null,
      create: async (prefs: any) => prefs,
      update: async (userId: string, updates: any) => null
    };
  }

  private initializeMockPersonalization(): void {
    // Initialize mock personalization for development
    this.personalizationService = {
      updatePreferences: async (userId: string, interaction: any) => ({}),
      getRecommendations: async (userId: string) => ([]),
      calculatePersonalizationScore: async (user: any, content: any) => 0.5
    };
  }

  /**
   * P0.1 - Save idea to user's bank for later access
   */
  public async saveIdea(request: SaveIdeaRequest): Promise<SaveIdeaResponse> {
    try {
      const existingIdea = await this.ideaRepository.findById(request.idea.id);
      
      if (existingIdea) {
        // Update existing idea
        const updatedIdea = await this.ideaRepository.update(request.idea.id, {
          ...existingIdea,
          status: 'saved',
          savedAt: new Date(),
          metadata: {
            ...existingIdea.metadata,
            ...request.metadata
          }
        });
        
        return {
          success: true,
          savedIdea: updatedIdea
        };
      } else {
        // Create new saved idea
        const savedIdea: Idea = {
          ...request.idea,
          userId: request.userId,
          status: 'saved',
          createdAt: new Date(),
          savedAt: new Date(),
          aiMetadata: {
            model: 'gemini-1.5-flash',
            tokensUsed: request.metadata?.tokensUsed || 0,
            cost: request.metadata?.cost || 0,
            confidence: 0.8,
            personalizedScore: 0.7,
            trending: false,
            personalizedElements: [],
            tierUsed: 'basic'
          },
          engagementMetrics: {
            views: 0,
            likes: 0,
            shares: 0,
            implementations: 0,
            userRating: 0,
            avgRating: 0,
            lastViewed: new Date(),
            timeToImplement: 0,
            engagementScore: 0
          },
          tags: request.idea.tags || []
        };
        
        const created = await this.ideaRepository.create(savedIdea);
        
        // Track save event
        await this.analyticsService.trackEvent('idea_saved', {
          userId: request.userId,
          ideaId: created.id,
          category: created.category,
          source: request.metadata?.source || 'manual'
        });
        
        return {
          success: true,
          savedIdea: created
        };
      }
    } catch (error) {
      console.error('Error saving idea:', error);
      return {
        success: false,
        error: 'Erro ao salvar ideia'
      };
    }
  }

  /**
   * P0.2 - Get user's saved ideas history with pagination
   */
  public async getUserIdeasHistory(request: GetUserIdeasRequest): Promise<GetUserIdeasResponse> {
    try {
      const { userId, filters, pagination, sort } = request;
      
      const historyFilters = {
        userId,
        status: 'saved',
        ...filters
      };
      
      const ideas = await this.ideaRepository.findByUserId(userId, {
        filters: historyFilters,
        pagination: pagination || { page: 1, limit: 20 },
        sort: sort || { field: 'savedAt', order: 'desc' }
      });
      
      const total = await this.ideaRepository.countByUserId(userId, historyFilters);
      
      return {
        success: true,
        ideas,
        pagination: {
          total,
          page: pagination?.page || 1,
          limit: pagination?.limit || 20,
          totalPages: Math.ceil(total / (pagination?.limit || 20))
        }
      };
    } catch (error) {
      console.error('Error getting user ideas history:', error);
      return {
        success: false,
        ideas: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        },
        error: 'Erro ao carregar histórico de ideias'
      };
    }
  }

  /**
   * P0.3 - Quick add idea functionality
   */
  public async quickAddIdea(request: QuickAddIdeaRequest): Promise<QuickAddIdeaResponse> {
    try {
      const idea: Idea = {
        id: this.generateId(),
        userId: request.userId,
        title: request.title,
        description: request.description || '',
        category: request.category || 'geral',
        targetAudience: 'geral',
        implementation: 'Desenvolvida pelo usuário',
        status: 'manual',
        createdAt: new Date(),
        aiMetadata: {
          model: 'user-input',
          tokensUsed: 0,
          cost: 0,
          confidence: 1.0,
          personalizedScore: 1.0,
          trending: false,
          personalizedElements: [],
          tierUsed: 'manual'
        },
        engagementMetrics: {
          views: 0,
          likes: 0,
          shares: 0,
          implementations: 0,
          userRating: 0,
          avgRating: 0,
          lastViewed: new Date(),
          timeToImplement: 0,
          engagementScore: 0
        },
        tags: request.tags || []
      };
      
      const created = await this.ideaRepository.create(idea);
      
      // Track quick add event
      await this.analyticsService.trackEvent('idea_quick_added', {
        userId: request.userId,
        ideaId: created.id,
        category: created.category,
        hasDescription: !!request.description,
        tagsCount: request.tags?.length || 0
      });
      
      return {
        success: true,
        idea: created
      };
    } catch (error) {
      console.error('Error quick adding idea:', error);
      return {
        success: false,
        error: 'Erro ao adicionar ideia rapidamente'
      };
    }
  }

  /**
   * P0.4 - Search ideas with filters
   */
  public async searchIdeas(request: SearchIdeasRequest): Promise<SearchIdeasResponse> {
    try {
      const { userId, searchTerm, filters, pagination } = request;
      
      const searchFilters = {
        userId,
        searchTerm,
        ...filters
      };
      
      const ideas = await this.ideaRepository.search(searchFilters, {
        pagination: pagination || { page: 1, limit: 20 },
        sort: { field: 'createdAt', order: 'desc' }
      });
      
      const total = await this.ideaRepository.countSearch(searchFilters);
      
      // Track search event
      await this.analyticsService.trackEvent('ideas_searched', {
        userId,
        searchTerm,
        filtersUsed: Object.keys(filters || {}).length,
        resultsCount: ideas.length
      });
      
      return {
        success: true,
        ideas,
        total,
        pagination: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20,
          totalPages: Math.ceil(total / (pagination?.limit || 20))
        }
      };
    } catch (error) {
      console.error('Error searching ideas:', error);
      return {
        success: false,
        ideas: [],
        total: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0
        },
        error: 'Erro ao buscar ideias'
      };
    }
  }

}

export default IdeaBankService; 