/**
 * Enhanced Gemini Service - Week 0 IA Alpha Implementation
 * AI service with comprehensive cost management integration
 * Integrates with all Pre-Week 0 cost management services for complete budget protection
 * 
 * Features:
 * - Cost-aware API calls with real-time budget tracking
 * - Integration with rate limiting and priority queue systems
 * - User tier management and usage analytics
 * - Emergency fallback and graceful degradation
 * - Comprehensive monitoring and analytics
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Import all cost management services from Pre-Week 0
import CostManagementService from '../risk-management/costManagementService';
import BudgetControlService from '../api-protection/budgetControlService';
import RateLimitingService from '../api-protection/rateLimitingService';
import PriorityQueueService from '../api-protection/priorityQueueService';
import FallbackService from '../cost-management/fallbackService';
import { UsageTierService, UserTier } from '../risk-management/usageTierService';

// Enhanced interfaces
export interface IdeaGenerationRequest {
  userId: string;
  category?: string;
  style?: string;
  targetAudience?: string;
  contentType?: string;
  keywords?: string[];
  previousIdeas?: string[];
  personalizedContext?: any;
}

export interface IdeaGenerationResponse {
  success: boolean;
  idea?: {
    title: string;
    description: string;
    category: string;
    targetAudience: string;
    implementation: string[];
    trending: boolean;
    confidence: number;
    personalizedScore: number;
  };
  metadata: {
    tokensUsed: number;
    cost: number;
    processingTime: number;
    source: 'ai' | 'cache' | 'fallback';
    queueTime?: number;
    serviceLevel: string;
  };
  error?: string;
  rateLimit?: {
    remaining: number;
    resetTime: Date;
    tierLimit: number;
  };
}

export interface PersonalizationRequest {
  userId: string;
  interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement';
  contentId: string;
  category: string;
  feedback?: string;
  context?: any;
}

export interface PersonalizationResponse {
  success: boolean;
  updatedPreferences?: {
    categories: Record<string, number>;
    styles: Record<string, number>;
    audiences: Record<string, number>;
    keywords: string[];
  };
  recommendations?: string[];
  cost: number;
  error?: string;
}

export interface ServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageResponseTime: number;
  cacheHitRate: number;
  currentServiceLevel: string;
  userTierDistribution: Record<UserTier, number>;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  // Cost management services integration
  private costManagement: CostManagementService;
  private budgetControl: BudgetControlService;
  private rateLimiting: RateLimitingService;
  private priorityQueue: PriorityQueueService;
  private fallbackService: FallbackService;
  private usageTiers: UsageTierService;
  
  // Service configuration
  private config = {
    model: 'gemini-1.5-flash',
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    costPerToken: 0.00075 / 1000, // $0.00075 per 1K tokens
    maxRetries: 3,
    retryDelay: 1000,
    cacheEnabled: true,
    fallbackEnabled: true
  };
  
  // Performance tracking
  private metrics: ServiceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalCost: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    currentServiceLevel: 'normal',
    userTierDistribution: { free: 0, premium: 0, enterprise: 0 }
  };

  constructor() {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.config.model });
    
    // Initialize cost management services
    this.costManagement = new CostManagementService();
    this.budgetControl = new BudgetControlService();
    this.rateLimiting = new RateLimitingService();
    this.priorityQueue = new PriorityQueueService();
    this.fallbackService = new FallbackService();
    this.usageTiers = new UsageTierService();
    
    console.log('Enhanced GeminiService initialized with comprehensive cost management');
  }

  /**
   * Generate creative ideas with full cost management integration
   */
  public async generateIdea(request: IdeaGenerationRequest): Promise<IdeaGenerationResponse> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    try {
      // Get user tier for cost and rate limiting
      const userTier = await this.usageTiers.getUserTier(request.userId);
      
      // Estimate cost before processing
      const estimatedTokens = this.estimateTokenUsage(request);
      const estimatedCost = estimatedTokens * this.config.costPerToken;
      
      // Use fallback service for comprehensive request handling
      const result = await this.fallbackService.handleRequest(
        request.userId,
        'idea_generation',
        request,
        () => this.processIdeaGeneration(request, estimatedTokens, estimatedCost)
      );
      
      const processingTime = Date.now() - startTime;
      
      if (result.success) {
        this.metrics.successfulRequests++;
        
        // Update user tier usage
        await this.usageTiers.recordUsage(request.userId, 'idea_generation', result.cost);
        
        // Track cost
        await this.costManagement.recordCost(request.userId, result.cost, estimatedTokens, 'idea_generation');
        
        return {
          success: true,
          idea: result.data,
          metadata: {
            tokensUsed: estimatedTokens,
            cost: result.cost,
            processingTime,
            source: result.source,
            queueTime: result.fallbackUsed ? 0 : undefined,
            serviceLevel: result.serviceLevel
          },
          rateLimit: await this.getRateLimitInfo(request.userId)
        };
      } else {
        this.metrics.failedRequests++;
        return {
          success: false,
          metadata: {
            tokensUsed: 0,
            cost: 0,
            processingTime,
            source: result.source,
            serviceLevel: result.serviceLevel
          },
          error: 'Idea generation failed',
          rateLimit: await this.getRateLimitInfo(request.userId)
        };
      }
      
    } catch (error) {
      this.metrics.failedRequests++;
      const processingTime = Date.now() - startTime;
      
      console.error('Error in generateIdea:', error);
      return {
        success: false,
        metadata: {
          tokensUsed: 0,
          cost: 0,
          processingTime,
          source: 'ai',
          serviceLevel: 'error'
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        rateLimit: await this.getRateLimitInfo(request.userId)
      };
    }
  }

  /**
   * Process actual idea generation with AI
   */
  private async processIdeaGeneration(
    request: IdeaGenerationRequest, 
    estimatedTokens: number, 
    estimatedCost: number
  ): Promise<any> {
    
    // Build personalized prompt
    const prompt = this.buildIdeaPrompt(request);
    
    // Generate content with cost tracking
    const response = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        topP: this.config.topP,
        topK: this.config.topK,
      },
    });

    const generatedText = response.response.text();
    
    // Parse and structure the response
    const idea = this.parseIdeaResponse(generatedText, request);
    
    return idea;
  }

  /**
   * Build personalized prompt for idea generation
   */
  private buildIdeaPrompt(request: IdeaGenerationRequest): string {
    const {
      category = 'general',
      style = 'engaging',
      targetAudience = 'general audience',
      contentType = 'social media post',
      keywords = [],
      previousIdeas = []
    } = request;

    let prompt = `Generate a creative and engaging ${contentType} idea for ${targetAudience}.

Requirements:
- Category: ${category}
- Style: ${style}
- Target Audience: ${targetAudience}`;

    if (keywords.length > 0) {
      prompt += `\n- Keywords to include: ${keywords.join(', ')}`;
    }

    if (previousIdeas.length > 0) {
      prompt += `\n- Avoid similarities to these previous ideas: ${previousIdeas.slice(-3).join('; ')}`;
    }

    prompt += `

Please provide:
1. A compelling title (max 60 characters)
2. Detailed description (100-200 words)
3. Step-by-step implementation guide (3-5 steps)
4. Why this would be trending/engaging
5. Confidence score (0-1) for success potential

Format your response as JSON with the following structure:
{
  "title": "Creative Title Here",
  "description": "Detailed description...",
  "category": "${category}",
  "targetAudience": "${targetAudience}",
  "implementation": ["Step 1", "Step 2", "Step 3"],
  "trending": true/false,
  "confidence": 0.85,
  "reasoning": "Why this idea would work..."
}`;

    return prompt;
  }

  /**
   * Parse AI response into structured idea
   */
  private parseIdeaResponse(response: string, request: IdeaGenerationRequest): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Add personalization score based on user context
        const personalizedScore = this.calculatePersonalizationScore(parsed, request);
        
        return {
          ...parsed,
          personalizedScore,
          generatedAt: new Date().toISOString(),
          userId: request.userId
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    
    // Fallback structured response
    return {
      title: "Creative Content Idea",
      description: response.substring(0, 200) + "...",
      category: request.category || 'general',
      targetAudience: request.targetAudience || 'general audience',
      implementation: [
        "Research your topic thoroughly",
        "Create engaging content",
        "Share with your audience",
        "Engage with responses"
      ],
      trending: true,
      confidence: 0.7,
      personalizedScore: 0.5,
      generatedAt: new Date().toISOString(),
      userId: request.userId
    };
  }

  /**
   * Calculate personalization score based on user context
   */
  private calculatePersonalizationScore(idea: any, request: IdeaGenerationRequest): number {
    let score = 0.5; // Base score
    
    // Increase score if matches user preferences
    if (request.personalizedContext) {
      const context = request.personalizedContext;
      
      // Category preference
      if (context.preferredCategories?.includes(idea.category)) {
        score += 0.2;
      }
      
      // Style preference
      if (context.preferredStyles?.includes(request.style)) {
        score += 0.15;
      }
      
      // Audience alignment
      if (context.targetAudiences?.includes(idea.targetAudience)) {
        score += 0.15;
      }
    }
    
    return Math.min(1.0, score);
  }

  /**
   * Update user personalization based on feedback
   */
  public async updatePersonalization(request: PersonalizationRequest): Promise<PersonalizationResponse> {
    try {
      const userTier = await this.usageTiers.getUserTier(request.userId);
      const estimatedCost = 0.001; // Small cost for personalization updates
      
      // Check budget
      const budgetCheck = await this.budgetControl.canUserProceed(request.userId, estimatedCost);
      if (!budgetCheck.allowed) {
        return {
          success: false,
          cost: 0,
          error: budgetCheck.reason
        };
      }
      
      // Process personalization update
      const result = await this.processPersonalizationUpdate(request);
      
      // Track cost and usage
      await this.costManagement.recordCost(request.userId, estimatedCost, 10, 'personalization');
      await this.usageTiers.recordUsage(request.userId, 'personalization', estimatedCost);
      
      return {
        success: true,
        updatedPreferences: result.preferences,
        recommendations: result.recommendations,
        cost: estimatedCost
      };
      
    } catch (error) {
      console.error('Error in updatePersonalization:', error);
      return {
        success: false,
        cost: 0,
        error: error instanceof Error ? error.message : 'Personalization update failed'
      };
    }
  }

  /**
   * Process personalization update
   */
  private async processPersonalizationUpdate(request: PersonalizationRequest): Promise<any> {
    // Get current user preferences
    const currentPreferences = await this.getUserPreferences(request.userId);
    
    // Update preferences based on interaction
    const weight = this.getInteractionWeight(request.interactionType);
    
    // Update category preference
    if (!currentPreferences.categories[request.category]) {
      currentPreferences.categories[request.category] = 0;
    }
    currentPreferences.categories[request.category] += weight;
    
    // Normalize scores
    const maxScore = Math.max(...Object.values(currentPreferences.categories));
    if (maxScore > 1) {
      Object.keys(currentPreferences.categories).forEach(key => {
        currentPreferences.categories[key] /= maxScore;
      });
    }
    
    // Save updated preferences
    await this.saveUserPreferences(request.userId, currentPreferences);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(currentPreferences);
    
    return {
      preferences: currentPreferences,
      recommendations
    };
  }

  /**
   * Get user rate limit information
   */
  private async getRateLimitInfo(userId: string): Promise<{
    remaining: number;
    resetTime: Date;
    tierLimit: number;
  }> {
    const userTier = await this.usageTiers.getUserTier(userId);
    const rateLimitStatus = await this.rateLimiting.checkRateLimit(userId, 'idea_generation');
    
    return {
      remaining: rateLimitStatus.remaining,
      resetTime: rateLimitStatus.resetTime,
      tierLimit: userTier.limits.ideasPerDay
    };
  }

  /**
   * Get current service metrics
   */
  public getServiceMetrics(): ServiceMetrics {
    // Update current service level from fallback service
    const fallbackStats = this.fallbackService.getFallbackStats();
    this.metrics.currentServiceLevel = fallbackStats.currentServiceLevel;
    this.metrics.cacheHitRate = fallbackStats.cacheHitRate;
    
    return { ...this.metrics };
  }

  /**
   * Get comprehensive service status
   */
  public async getServiceStatus(): Promise<{
    isHealthy: boolean;
    serviceLevel: string;
    costStatus: any;
    rateLimitStatus: any;
    queueStatus: any;
    fallbackStatus: any;
    metrics: ServiceMetrics;
  }> {
    const [costSummary, queueInfo, fallbackStats] = await Promise.all([
      this.costManagement.getGlobalCostSummary(),
      this.priorityQueue.getQueueInfo(),
      this.fallbackService.getSystemStatus()
    ]);
    
    const isHealthy = fallbackStats.serviceLevel === 'normal' && 
                     queueInfo.health === 'healthy' && 
                     costSummary.today < 1.67;
    
    return {
      isHealthy,
      serviceLevel: fallbackStats.serviceLevel,
      costStatus: costSummary,
      rateLimitStatus: await this.rateLimiting.getSystemStatus(),
      queueStatus: queueInfo,
      fallbackStatus: fallbackStats,
      metrics: this.getServiceMetrics()
    };
  }

  // Helper methods
  private estimateTokenUsage(request: IdeaGenerationRequest): number {
    const baseTokens = 500; // Base response size
    const promptTokens = JSON.stringify(request).length / 4; // Rough estimate
    return Math.ceil(baseTokens + promptTokens);
  }

  private getInteractionWeight(type: PersonalizationRequest['interactionType']): number {
    switch (type) {
      case 'like': return 0.1;
      case 'save': return 0.2;
      case 'share': return 0.3;
      case 'implement': return 0.5;
      case 'dislike': return -0.2;
      default: return 0.05;
    }
  }

  private async getUserPreferences(userId: string): Promise<any> {
    // This would integrate with user preferences storage
    // For now, return default structure
    return {
      categories: {},
      styles: {},
      audiences: {},
      keywords: []
    };
  }

  private async saveUserPreferences(userId: string, preferences: any): Promise<void> {
    // This would save to user preferences storage
    console.log(`Saving preferences for user ${userId}:`, preferences);
  }

  private generateRecommendations(preferences: any): string[] {
    const topCategories = Object.entries(preferences.categories)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category);
    
    return [
      `Focus more on ${topCategories[0]} content for better engagement`,
      `Experiment with trending topics in your preferred categories`,
      `Consider cross-category content combining ${topCategories[0]} and ${topCategories[1]}`
    ];
  }
}

export default GeminiService; 