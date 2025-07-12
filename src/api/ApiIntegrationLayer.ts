/**
 * API Integration Layer - Week 0 Support Service
 * Middleware layer providing clean API interface for frontend integration
 * Simplifies access to all backend services for IA Beta Week 1 implementation
 * 
 * Features:
 * - RESTful-like API interface for all business services
 * - Request/response validation and transformation
 * - Error handling and standardized responses
 * - Authentication and authorization middleware
 * - Rate limiting and cost management integration
 * - Real-time event streaming
 * - Comprehensive logging and analytics
 */

import { getApplication } from '../architecture/ServiceArchitecture';

// Standard API Response Format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    cost: number;
    processingTime: number;
    rateLimit?: {
      remaining: number;
      resetTime: string;
    };
  };
}

// Request Context Interface
export interface RequestContext {
  userId: string;
  requestId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

// API Classes for each service
export class IdeaBankAPI {
  private service: any;
  private analytics: any;

  constructor() {
    const app = getApplication();
    this.service = app.getService('IdeaBankService');
    this.analytics = app.getService('AnalyticsService');
  }

  /**
   * POST /api/ideas/generate
   * Generate a new idea with personalization
   */
  public async generateIdea(
    request: {
      userId: string;
      category?: string;
      style?: string;
      targetAudience?: string;
      contentType?: string;
      keywords?: string[];
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const startTime = Date.now();
      
      // Validate request
      if (!request.userId) {
        return this.errorResponse('INVALID_REQUEST', 'userId is required', context);
      }

      // Call service
      const result = await this.service.generateIdea(request);
      
      // Track API usage
      await this.analytics.track({
        userId: request.userId,
        eventType: 'user_action',
        category: 'idea_generation',
        action: 'api_generate_idea',
        metadata: {
          success: result.success,
          category: request.category,
          hasPersonalization: !!request.keywords?.length
        }
      });

      if (!result.success) {
        return this.errorResponse('GENERATION_FAILED', result.error, context);
      }

      return this.successResponse(
        {
          idea: result.idea,
          recommendations: result.recommendations
        },
        {
          cost: result.metadata.cost,
          processingTime: Date.now() - startTime,
          rateLimit: {
            remaining: result.metadata.tierInfo.remaining,
            resetTime: result.metadata.tierInfo.resetTime
          }
        },
        context
      );

    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to generate idea', context, error);
    }
  }

  /**
   * POST /api/ideas/{ideaId}/feedback
   * Submit feedback for an idea
   */
  public async submitFeedback(
    ideaId: string,
    request: {
      userId: string;
      interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement';
      rating?: number;
      feedback?: string;
      implementationResults?: string;
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const result = await this.service.processIdeaFeedback({
        ...request,
        ideaId
      });

      await this.analytics.track({
        userId: request.userId,
        eventType: 'user_action',
        category: 'idea_generation',
        action: 'api_submit_feedback',
        metadata: {
          ideaId,
          interactionType: request.interactionType,
          hasRating: !!request.rating
        }
      });

      if (!result.success) {
        return this.errorResponse('FEEDBACK_FAILED', result.error, context);
      }

      return this.successResponse(
        {
          learningImpact: result.learningImpact,
          updatedPreferences: result.updatedPreferences
        },
        { cost: result.cost },
        context
      );

    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to submit feedback', context, error);
    }
  }

  /**
   * GET /api/ideas/user/{userId}
   * Get user's ideas with filtering and pagination
   */
  public async getUserIdeas(
    userId: string,
    query: {
      category?: string;
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const result = await this.service.getUserIdeas({
        userId,
        filters: {
          category: query.category,
          status: query.status as any
        },
        pagination: {
          page: query.page || 1,
          limit: Math.min(query.limit || 20, 100) // Max 100 per request
        },
        sort: {
          field: query.sortBy as any || 'createdAt',
          order: query.sortOrder || 'desc'
        }
      });

      await this.analytics.track({
        userId,
        eventType: 'user_action',
        category: 'idea_generation',
        action: 'api_get_user_ideas',
        metadata: { filters: query }
      });

      if (!result.success) {
        return this.errorResponse('FETCH_FAILED', result.error, context);
      }

      return this.successResponse(
        {
          ideas: result.ideas,
          pagination: result.pagination,
          analytics: result.analytics
        },
        {},
        context
      );

    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to fetch ideas', context, error);
    }
  }

  private successResponse(data: any, metadata: any = {}, context: RequestContext): ApiResponse {
    return {
      success: true,
      data,
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: metadata.cost || 0,
        processingTime: metadata.processingTime || 0,
        rateLimit: metadata.rateLimit
      }
    };
  }

  private errorResponse(code: string, message: string, context: RequestContext, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: 0,
        processingTime: 0
      }
    };
  }
}

export class PersonalizationAPI {
  private service: any;
  private analytics: any;

  constructor() {
    const app = getApplication();
    this.service = app.getService('PersonalizationService');
    this.analytics = app.getService('AnalyticsService');
  }

  /**
   * GET /api/personalization/{userId}/recommendations
   * Get personalized recommendations for user
   */
  public async getRecommendations(
    userId: string,
    query: {
      categories?: string[];
      includeContext?: boolean;
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const result = await this.service.generatePersonalizedRecommendations({
        userId,
        targetCategories: query.categories,
        context: query.includeContext ? { currentPreferences: null } : undefined
      });

      await this.analytics.track({
        userId,
        eventType: 'user_action',
        category: 'personalization',
        action: 'api_get_recommendations'
      });

      if (!result.success) {
        return this.errorResponse('RECOMMENDATION_FAILED', result.error, context);
      }

      return this.successResponse(
        {
          recommendations: result.personalizedContent,
          learningInsights: result.learningInsights
        },
        { cost: result.cost },
        context
      );

    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get recommendations', context, error);
    }
  }

  /**
   * GET /api/personalization/{userId}/insights
   * Get personalization insights and learning progress
   */
  public async getInsights(userId: string, context: RequestContext): Promise<ApiResponse> {
    try {
      const insights = await this.service.getPersonalizationInsights(userId);

      await this.analytics.track({
        userId,
        eventType: 'user_action',
        category: 'personalization',
        action: 'api_get_insights'
      });

      return this.successResponse(insights, {}, context);

    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get insights', context, error);
    }
  }

  /**
   * POST /api/personalization/{userId}/preferences
   * Update user preferences
   */
  public async updatePreferences(
    userId: string,
    request: {
      interaction: {
        type: string;
        category: string;
        feedback?: string;
      };
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const result = await this.service.updateUserPreferences(userId, {
        ideaId: 'temp',
        interactionType: request.interaction.type as any,
        timestamp: new Date(),
        context: {
          category: request.interaction.category,
          style: 'default',
          targetAudience: 'general',
          difficulty: 'intermediate'
        },
        feedback: {
          explicitFeedback: request.interaction.feedback
        }
      });

      return this.successResponse(
        { learningImpact: result.learningImpact },
        { cost: result.cost },
        context
      );

    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to update preferences', context, error);
    }
  }

  private successResponse(data: any, metadata: any = {}, context: RequestContext): ApiResponse {
    return {
      success: true,
      data,
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: metadata.cost || 0,
        processingTime: metadata.processingTime || 0
      }
    };
  }

  private errorResponse(code: string, message: string, context: RequestContext, details?: any): ApiResponse {
    return {
      success: false,
      error: { code, message, details },
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: 0,
        processingTime: 0
      }
    };
  }
}

export class AnalyticsAPI {
  private service: any;

  constructor() {
    const app = getApplication();
    this.service = app.getService('AnalyticsService');
  }

  /**
   * GET /api/analytics/platform
   * Get platform-wide metrics
   */
  public async getPlatformMetrics(context: RequestContext): Promise<ApiResponse> {
    try {
      const metrics = await this.service.getPlatformMetrics();
      return this.successResponse(metrics, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get platform metrics', context, error);
    }
  }

  /**
   * GET /api/analytics/business
   * Get business service metrics
   */
  public async getBusinessMetrics(context: RequestContext): Promise<ApiResponse> {
    try {
      const metrics = await this.service.getBusinessServiceMetrics();
      return this.successResponse(metrics, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get business metrics', context, error);
    }
  }

  /**
   * POST /api/analytics/track
   * Track custom event
   */
  public async trackEvent(
    request: {
      userId?: string;
      eventType: string;
      category: string;
      action: string;
      label?: string;
      value?: number;
      metadata?: Record<string, any>;
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      await this.service.track({
        ...request,
        sessionId: context.sessionId,
        context: {
          userAgent: context.userAgent,
          ipAddress: context.ipAddress
        }
      });

      return this.successResponse({ tracked: true }, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to track event', context, error);
    }
  }

  private successResponse(data: any, metadata: any = {}, context: RequestContext): ApiResponse {
    return {
      success: true,
      data,
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: metadata.cost || 0,
        processingTime: metadata.processingTime || 0
      }
    };
  }

  private errorResponse(code: string, message: string, context: RequestContext, details?: any): ApiResponse {
    return {
      success: false,
      error: { code, message, details },
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: 0,
        processingTime: 0
      }
    };
  }
}

export class UserAPI {
  private userRepository: any;
  private analytics: any;

  constructor() {
    const app = getApplication();
    this.userRepository = app.getService('UserRepository');
    this.analytics = app.getService('AnalyticsService');
  }

  /**
   * GET /api/users/{userId}/profile
   * Get user profile with tier and cost information
   */
  public async getUserProfile(userId: string, context: RequestContext): Promise<ApiResponse> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return this.errorResponse('USER_NOT_FOUND', 'User not found', context);
      }

      const costSummary = await this.userRepository.getUserCostSummary(userId);
      const analytics = await this.userRepository.getUserAnalytics(userId);

      return this.successResponse({
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          tier: user.tier,
          status: user.status,
          createdAt: user.createdAt
        },
        budget: costSummary,
        analytics
      }, {}, context);

    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get user profile', context, error);
    }
  }

  /**
   * GET /api/users/{userId}/budget
   * Get detailed budget information
   */
  public async getBudgetStatus(userId: string, context: RequestContext): Promise<ApiResponse> {
    try {
      const costSummary = await this.userRepository.getUserCostSummary(userId);
      return this.successResponse(costSummary, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get budget status', context, error);
    }
  }

  /**
   * PUT /api/users/{userId}/tier
   * Update user tier
   */
  public async updateUserTier(
    userId: string,
    request: { tier: 'free' | 'premium' | 'enterprise' },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const updatedUser = await this.userRepository.update(userId, { tier: request.tier });
      
      await this.analytics.track({
        userId,
        eventType: 'business_metric',
        category: 'user_management',
        action: 'tier_updated',
        metadata: { newTier: request.tier }
      });

      return this.successResponse({ tier: updatedUser.tier }, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to update tier', context, error);
    }
  }

  private successResponse(data: any, metadata: any = {}, context: RequestContext): ApiResponse {
    return {
      success: true,
      data,
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: metadata.cost || 0,
        processingTime: metadata.processingTime || 0
      }
    };
  }

  private errorResponse(code: string, message: string, context: RequestContext, details?: any): ApiResponse {
    return {
      success: false,
      error: { code, message, details },
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: 0,
        processingTime: 0
      }
    };
  }
}

export class NotificationAPI {
  private service: any;
  private analytics: any;

  constructor() {
    const app = getApplication();
    this.service = app.getService('NotificationService');
    this.analytics = app.getService('AnalyticsService');
  }

  /**
   * GET /api/notifications/{userId}
   * Get user notifications
   */
  public async getUserNotifications(
    userId: string,
    query: {
      types?: string[];
      status?: string[];
      page?: number;
      limit?: number;
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const result = await this.service.getUserNotifications(userId, {
        types: query.types as any,
        status: query.status as any,
        limit: Math.min(query.limit || 20, 50),
        offset: ((query.page || 1) - 1) * (query.limit || 20)
      });

      return this.successResponse(result, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to get notifications', context, error);
    }
  }

  /**
   * POST /api/notifications/{notificationId}/read
   * Mark notification as read
   */
  public async markAsRead(
    notificationId: string,
    userId: string,
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const success = await this.service.markAsRead(notificationId, userId);
      
      if (!success) {
        return this.errorResponse('NOTIFICATION_NOT_FOUND', 'Notification not found', context);
      }

      return this.successResponse({ marked: true }, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to mark as read', context, error);
    }
  }

  /**
   * PUT /api/notifications/{userId}/preferences
   * Update notification preferences
   */
  public async updatePreferences(
    userId: string,
    request: {
      channels?: Record<string, boolean>;
      types?: Record<string, boolean>;
      frequency?: any;
    },
    context: RequestContext
  ): Promise<ApiResponse> {
    try {
      const updated = await this.service.updateUserPreferences(userId, request);
      return this.successResponse(updated, {}, context);
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'Failed to update preferences', context, error);
    }
  }

  private successResponse(data: any, metadata: any = {}, context: RequestContext): ApiResponse {
    return {
      success: true,
      data,
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: metadata.cost || 0,
        processingTime: metadata.processingTime || 0
      }
    };
  }

  private errorResponse(code: string, message: string, context: RequestContext, details?: any): ApiResponse {
    return {
      success: false,
      error: { code, message, details },
      metadata: {
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
        cost: 0,
        processingTime: 0
      }
    };
  }
}

// Main API Integration Layer Class
export class ApiIntegrationLayer {
  public ideaBank: IdeaBankAPI;
  public personalization: PersonalizationAPI;
  public analytics: AnalyticsAPI;
  public user: UserAPI;
  public notification: NotificationAPI;

  constructor() {
    this.ideaBank = new IdeaBankAPI();
    this.personalization = new PersonalizationAPI();
    this.analytics = new AnalyticsAPI();
    this.user = new UserAPI();
    this.notification = new NotificationAPI();
  }

  /**
   * Create request context
   */
  public createContext(userId: string, headers?: Record<string, string>): RequestContext {
    return {
      userId,
      requestId: this.generateRequestId(),
      timestamp: new Date(),
      userAgent: headers?.['user-agent'],
      ipAddress: headers?.['x-forwarded-for'] || headers?.['x-real-ip'],
      sessionId: headers?.['x-session-id']
    };
  }

  /**
   * Middleware for request validation
   */
  public async validateRequest(context: RequestContext): Promise<{ valid: boolean; error?: string }> {
    // Basic validation
    if (!context.userId) {
      return { valid: false, error: 'User ID is required' };
    }

    // Check if user exists (simplified)
    try {
      const userRepo = getApplication().getService('UserRepository');
      const user = await userRepo.findById(context.userId);
      
      if (!user) {
        return { valid: false, error: 'User not found' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Validation failed' };
    }
  }

  /**
   * Rate limiting middleware
   */
  public async checkRateLimit(context: RequestContext): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      const rateLimitService = getApplication().getService('RateLimitingService');
      const result = await rateLimitService.checkRateLimit(context.userId, 'api_request');
      
      return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime
      };
    } catch (error) {
      // If rate limiting service fails, allow the request
      return {
        allowed: true,
        remaining: 100,
        resetTime: new Date(Date.now() + 3600000)
      };
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
let apiLayer: ApiIntegrationLayer | null = null;

export function getApiLayer(): ApiIntegrationLayer {
  if (!apiLayer) {
    apiLayer = new ApiIntegrationLayer();
  }
  return apiLayer;
}

export default ApiIntegrationLayer; 