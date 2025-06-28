import { createLogger } from '../utils/logger';
import { performanceService } from './performance';

const logger = createLogger('AIAnalyticsService');

export interface UserBehaviorPattern {
  userId: string;
  actionType: 'navigate' | 'create' | 'edit' | 'search' | 'share';
  context: string;
  timestamp: Date;
  sessionId: string;
  metadata: Record<string, any>;
}

export interface PredictiveInsight {
  id: string;
  type: 'performance' | 'usage' | 'recommendation' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionable: boolean;
  suggestedAction?: string;
  confidence: number; // 0-1
  evidence: string[];
  created: Date;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: Record<string, any>;
  userCount: number;
  avgSessionDuration: number;
  topActions: string[];
  conversionRate: number;
}

class AIAnalyticsService {
  private behaviorBuffer: UserBehaviorPattern[] = [];
  private insights: PredictiveInsight[] = [];
  private segments: UserSegment[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    logger.info('Initializing AI Analytics Service...');
    
    try {
      // Initialize pattern recognition
      await this.loadHistoricalData();
      await this.generateInitialSegments();
      await this.runInitialAnalysis();
      
      // Start real-time processing
      this.startRealTimeProcessing();
      
      this.initialized = true;
      logger.info('AI Analytics Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Analytics Service', { error });
      throw error;
    }
  }

  /**
   * Track user behavior for pattern analysis
   */
  trackBehavior(behavior: Omit<UserBehaviorPattern, 'timestamp' | 'sessionId'>): void {
    const sessionId = this.getCurrentSessionId();
    const pattern: UserBehaviorPattern = {
      ...behavior,
      timestamp: new Date(),
      sessionId
    };

    this.behaviorBuffer.push(pattern);
    logger.debug('Behavior tracked', { 
      actionType: pattern.actionType, 
      context: pattern.context,
      bufferSize: this.behaviorBuffer.length 
    });

    // Process in batches for performance
    if (this.behaviorBuffer.length >= 50) {
      this.processBehaviorBatch();
    }
  }

  /**
   * Get AI-generated insights for dashboard
   */
  async getInsights(userId?: string): Promise<PredictiveInsight[]> {
    logger.debug('Generating AI insights', { userId, totalInsights: this.insights.length });
    
    try {
      // Generate fresh insights based on recent data
      await this.generateNewInsights(userId);
      
      // Filter and sort insights
      let relevantInsights = this.insights;
      
      if (userId) {
        relevantInsights = this.insights.filter(insight => 
          insight.evidence.some(evidence => evidence.includes(userId))
        );
      }

      // Sort by priority and confidence
      relevantInsights.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.confidence - a.confidence;
      });

      return relevantInsights.slice(0, 10); // Top 10 insights
    } catch (error) {
      logger.error('Failed to generate insights', { error, userId });
      return [];
    }
  }

  /**
   * Get user segments with behavior patterns
   */
  getUserSegments(): UserSegment[] {
    logger.debug('Retrieving user segments', { segmentCount: this.segments.length });
    return this.segments;
  }

  /**
   * Predict next user action based on patterns
   */
  async predictNextAction(userId: string, currentContext: string): Promise<{
    action: string;
    confidence: number;
    reasoning: string;
  } | null> {
    logger.debug('Predicting next action', { userId, currentContext });
    
    try {
      const userBehaviors = this.behaviorBuffer.filter(b => b.userId === userId);
      if (userBehaviors.length < 3) {
        return null; // Need more data
      }

      // Simple pattern matching (in real implementation, use ML model)
      const patterns = this.analyzeUserPatterns(userBehaviors);
      const contextualPatterns = patterns.filter(p => p.context === currentContext);
      
      if (contextualPatterns.length === 0) {
        return null;
      }

      // Get most frequent next action
      const nextActions = contextualPatterns.map(p => p.nextAction).filter(Boolean);
      const actionFrequency = nextActions.reduce((acc, action) => {
        acc[action] = (acc[action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostFrequentAction = Object.entries(actionFrequency)
        .sort(([,a], [,b]) => b - a)[0];

      if (!mostFrequentAction) {
        return null;
      }

      const [action, frequency] = mostFrequentAction;
      const confidence = frequency / nextActions.length;

      return {
        action,
        confidence,
        reasoning: `Based on ${frequency} similar patterns in ${nextActions.length} previous sessions`
      };
    } catch (error) {
      logger.error('Failed to predict next action', { error, userId, currentContext });
      return null;
    }
  }

  /**
   * Get performance recommendations based on usage patterns
   */
  async getPerformanceRecommendations(): Promise<PredictiveInsight[]> {
    logger.debug('Generating performance recommendations');
    
    try {
      const performanceMetrics = await performanceService.getMetrics();
      const recommendations: PredictiveInsight[] = [];

      // Analyze performance bottlenecks
      if (performanceMetrics.avgLoadTime > 2000) {
        recommendations.push({
          id: `perf-${Date.now()}-1`,
          type: 'performance',
          priority: 'high',
          title: 'Slow Page Load Detected',
          description: `Average load time is ${performanceMetrics.avgLoadTime}ms, which is above optimal threshold`,
          actionable: true,
          suggestedAction: 'Enable code splitting and lazy loading for heavy components',
          confidence: 0.85,
          evidence: ['Performance metrics showing consistent slow loads'],
          created: new Date()
        });
      }

      // Analyze memory usage patterns
      if (performanceMetrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
        recommendations.push({
          id: `perf-${Date.now()}-2`,
          type: 'performance',
          priority: 'medium',
          title: 'High Memory Usage Detected',
          description: 'Application memory usage is higher than recommended',
          actionable: true,
          suggestedAction: 'Implement memory cleanup in useEffect hooks',
          confidence: 0.78,
          evidence: ['Memory monitoring showing consistent high usage'],
          created: new Date()
        });
      }

      this.insights.push(...recommendations);
      return recommendations;
    } catch (error) {
      logger.error('Failed to generate performance recommendations', { error });
      return [];
    }
  }

  /**
   * Smart caching suggestions based on usage patterns
   */
  getSmartCachingStrategy(userId: string): {
    preloadResources: string[];
    cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
    reasoning: string;
  } {
    logger.debug('Generating smart caching strategy', { userId });
    
    const userBehaviors = this.behaviorBuffer.filter(b => b.userId === userId);
    const frequentPaths = this.getFrequentPaths(userBehaviors);
    
    let strategy: 'aggressive' | 'moderate' | 'minimal' = 'moderate';
    let preloadResources: string[] = [];
    
    if (userBehaviors.length > 20) {
      strategy = 'aggressive';
      preloadResources = frequentPaths.slice(0, 5);
    } else if (userBehaviors.length > 10) {
      strategy = 'moderate';
      preloadResources = frequentPaths.slice(0, 3);
    } else {
      strategy = 'minimal';
      preloadResources = frequentPaths.slice(0, 1);
    }

    return {
      preloadResources,
      cacheStrategy: strategy,
      reasoning: `Based on ${userBehaviors.length} user behaviors, recommending ${strategy} caching`
    };
  }

  // Private methods
  private getCurrentSessionId(): string {
    const sessionKey = 'ai-analytics-session';
    let sessionId = sessionStorage.getItem(sessionKey);
    
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(sessionKey, sessionId);
    }
    
    return sessionId;
  }

  private async loadHistoricalData(): Promise<void> {
    // In real implementation, load from localStorage or API
    const storedData = localStorage.getItem('ai-analytics-behavior');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        this.behaviorBuffer = parsed.slice(-100); // Keep last 100 behaviors
        logger.debug('Historical data loaded', { behaviors: this.behaviorBuffer.length });
      } catch (error) {
        logger.warn('Failed to parse historical data', { error });
      }
    }
  }

  private async generateInitialSegments(): Promise<void> {
    // Generate basic user segments
    this.segments = [
      {
        id: 'power-users',
        name: 'Power Users',
        criteria: { sessionsPerWeek: '>5', avgSessionDuration: '>300' },
        userCount: 0,
        avgSessionDuration: 450,
        topActions: ['create', 'edit', 'share'],
        conversionRate: 0.85
      },
      {
        id: 'casual-users',
        name: 'Casual Users',
        criteria: { sessionsPerWeek: '1-3', avgSessionDuration: '60-180' },
        userCount: 0,
        avgSessionDuration: 120,
        topActions: ['navigate', 'search', 'create'],
        conversionRate: 0.45
      },
      {
        id: 'new-users',
        name: 'New Users',
        criteria: { accountAge: '<7days' },
        userCount: 0,
        avgSessionDuration: 90,
        topActions: ['navigate', 'search'],
        conversionRate: 0.25
      }
    ];
  }

  private async runInitialAnalysis(): Promise<void> {
    // Generate initial insights
    await this.generateNewInsights();
    await this.getPerformanceRecommendations();
  }

  private startRealTimeProcessing(): void {
    // Process behavior buffer every 30 seconds
    setInterval(() => {
      if (this.behaviorBuffer.length > 0) {
        this.processBehaviorBatch();
      }
    }, 30000);

    // Generate new insights every 5 minutes
    setInterval(() => {
      this.generateNewInsights();
    }, 300000);

    // Save to localStorage every minute
    setInterval(() => {
      this.saveToLocalStorage();
    }, 60000);
  }

  private processBehaviorBatch(): void {
    const batchSize = Math.min(50, this.behaviorBuffer.length);
    const batch = this.behaviorBuffer.splice(0, batchSize);
    
    logger.debug('Processing behavior batch', { 
      batchSize: batch.length,
      remainingBuffer: this.behaviorBuffer.length 
    });

    // Update segments based on new behaviors
    this.updateSegments(batch);
    
    // Trigger insights generation if significant patterns detected
    this.detectSignificantPatterns(batch);
  }

  private async generateNewInsights(userId?: string): Promise<void> {
    const newInsights: PredictiveInsight[] = [];

    // Analyze usage patterns
    const usageInsights = this.analyzeUsagePatterns(userId);
    newInsights.push(...usageInsights);

    // Analyze performance patterns
    const perfInsights = await this.analyzePerformancePatterns();
    newInsights.push(...perfInsights);

    // Add new insights
    this.insights.push(...newInsights);
    
    // Keep only recent insights (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.insights = this.insights.filter(insight => insight.created > weekAgo);

    logger.debug('Generated new insights', { 
      newCount: newInsights.length, 
      totalCount: this.insights.length 
    });
  }

  private analyzeUserPatterns(behaviors: UserBehaviorPattern[]): Array<{
    context: string;
    action: string;
    nextAction?: string;
    frequency: number;
  }> {
    const patterns: Record<string, any> = {};
    
    for (let i = 0; i < behaviors.length - 1; i++) {
      const current = behaviors[i];
      const next = behaviors[i + 1];
      
      const key = `${current.context}-${current.actionType}`;
      if (!patterns[key]) {
        patterns[key] = {
          context: current.context,
          action: current.actionType,
          nextActions: {},
          frequency: 0
        };
      }
      
      patterns[key].frequency++;
      patterns[key].nextActions[next.actionType] = 
        (patterns[key].nextActions[next.actionType] || 0) + 1;
    }

    return Object.values(patterns).map((pattern: any) => ({
      context: pattern.context,
      action: pattern.action,
      nextAction: Object.entries(pattern.nextActions)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0],
      frequency: pattern.frequency
    }));
  }

  private getFrequentPaths(behaviors: UserBehaviorPattern[]): string[] {
    const pathFrequency: Record<string, number> = {};
    
    behaviors.forEach(behavior => {
      if (behavior.actionType === 'navigate') {
        const path = behavior.context;
        pathFrequency[path] = (pathFrequency[path] || 0) + 1;
      }
    });

    return Object.entries(pathFrequency)
      .sort(([,a], [,b]) => b - a)
      .map(([path]) => path);
  }

  private updateSegments(behaviors: UserBehaviorPattern[]): void {
    // Update user counts in segments based on new behaviors
    const userIds = [...new Set(behaviors.map(b => b.userId))];
    
    this.segments.forEach(segment => {
      // Simple classification logic (in real implementation, use more sophisticated criteria)
      if (segment.id === 'power-users') {
        segment.userCount = userIds.filter(userId => {
          const userBehaviors = this.behaviorBuffer.filter(b => b.userId === userId);
          return userBehaviors.length > 20;
        }).length;
      }
    });
  }

  private detectSignificantPatterns(behaviors: UserBehaviorPattern[]): void {
    // Detect unusual patterns that warrant new insights
    const actionTypes = behaviors.map(b => b.actionType);
    const uniqueActions = new Set(actionTypes);
    
    if (uniqueActions.has('error') && actionTypes.filter(a => a === 'error').length > 5) {
      this.insights.push({
        id: `pattern-${Date.now()}`,
        type: 'usage',
        priority: 'high',
        title: 'High Error Rate Detected',
        description: 'Users are experiencing frequent errors in this session',
        actionable: true,
        suggestedAction: 'Review error logs and implement better error handling',
        confidence: 0.9,
        evidence: [`${actionTypes.filter(a => a === 'error').length} errors in recent batch`],
        created: new Date()
      });
    }
  }

  private analyzeUsagePatterns(userId?: string): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const behaviors = userId 
      ? this.behaviorBuffer.filter(b => b.userId === userId)
      : this.behaviorBuffer;

    if (behaviors.length === 0) return insights;

    // Analyze drop-off patterns
    const lastActions = behaviors.slice(-10);
    const searchActions = lastActions.filter(b => b.actionType === 'search');
    
    if (searchActions.length > 5 && searchActions.length / lastActions.length > 0.7) {
      insights.push({
        id: `usage-${Date.now()}-search`,
        type: 'usage',
        priority: 'medium',
        title: 'High Search Activity Detected',
        description: 'User is doing a lot of searching, may indicate content discovery issues',
        actionable: true,
        suggestedAction: 'Consider improving navigation or adding recommended content',
        confidence: 0.75,
        evidence: [`${searchActions.length} search actions in last 10 activities`],
        created: new Date()
      });
    }

    return insights;
  }

  private async analyzePerformancePatterns(): Promise<PredictiveInsight[]> {
    try {
      const metrics = await performanceService.getMetrics();
      return await this.getPerformanceRecommendations();
    } catch (error) {
      logger.error('Failed to analyze performance patterns', { error });
      return [];
    }
  }

  private saveToLocalStorage(): void {
    try {
      // Save recent behaviors only (last 100)
      const recentBehaviors = this.behaviorBuffer.slice(-100);
      localStorage.setItem('ai-analytics-behavior', JSON.stringify(recentBehaviors));
      
      // Save insights (last 50)
      const recentInsights = this.insights.slice(-50);
      localStorage.setItem('ai-analytics-insights', JSON.stringify(recentInsights));
      
      logger.debug('Data saved to localStorage', { 
        behaviors: recentBehaviors.length,
        insights: recentInsights.length 
      });
    } catch (error) {
      logger.warn('Failed to save to localStorage', { error });
    }
  }
}

// Export singleton instance
export const aiAnalyticsService = new AIAnalyticsService();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  aiAnalyticsService.initialize().catch(error => {
    console.warn('AI Analytics Service initialization failed:', error);
  });
} 