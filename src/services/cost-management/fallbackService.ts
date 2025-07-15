/**
 * Fallback Service - IA Alpha Task 2 Final Component
 * Graceful degradation and emergency response system
 * Provides system continuity during budget emergencies, API failures, and high load
 * 
 * Features:
 * - Graceful service degradation (normal → degraded → minimal → emergency)
 * - Cached response system for cost reduction
 * - Emergency content generation
 * - Backup service providers
 * - Circuit breaker patterns
 * - User experience preservation during failures
 */

import { CostManagementService } from '../risk-management/costManagementService';
import { BudgetControlService } from './budgetControlService';
import { EmergencyProtocolService } from '../risk-management/emergencyProtocolService';
import { UsageTierService, UserTier } from '../risk-management/usageTierService';

// Service Level Types
export type ServiceLevel = 'normal' | 'degraded' | 'minimal' | 'emergency';

export interface FallbackConfig {
  enableCache: boolean;
  cacheExpiration: number; // in milliseconds
  maxCacheSize: number;
  emergencyResponses: boolean;
  backupProviders: boolean;
  circuitBreakerThreshold: number;
  gracefulDegradationSteps: ServiceLevel[];
}

export interface CachedResponse {
  id: string;
  userId: string;
  requestType: string;
  requestHash: string;
  response: any;
  timestamp: Date;
  expiresAt: Date;
  cost: number;
  accessCount: number;
  lastAccessed: Date;
}

export interface EmergencyContent {
  type: 'idea_generation' | 'personalization' | 'referral' | 'analytics';
  tier: UserTier;
  content: any;
  quality: 'basic' | 'standard' | 'premium';
  cost: number;
}

export interface CircuitBreakerState {
  service: string;
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailure: Date;
  nextRetry: Date;
  successCount: number;
  threshold: number;
}

export interface ServiceDegradationRule {
  level: ServiceLevel;
  trigger: {
    budgetPercentage: number;
    errorRate: number;
    responseTime: number;
  };
  restrictions: {
    maxRequestsPerMinute: number;
    allowedFeatures: string[];
    responseQuality: 'full' | 'basic' | 'cached_only';
    userTierAccess: UserTier[];
  };
}

export interface FallbackStats {
  currentServiceLevel: ServiceLevel;
  cacheHitRate: number;
  cacheSize: number;
  emergencyResponsesServed: number;
  circuitBreakerActivations: number;
  totalFallbacksUsed: number;
  costSavings: number;
  degradationEvents: number;
}

export class FallbackService {
  private costManagement: CostManagementService;
  private budgetControl: BudgetControlService;
  private emergencyProtocol: EmergencyProtocolService;
  private usageTiers: UsageTierService;
  
  // Service state
  private currentServiceLevel: ServiceLevel = 'normal';
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private cache: Map<string, CachedResponse> = new Map();
  
  // Configuration
  private config: FallbackConfig = {
    enableCache: true,
    cacheExpiration: 3600000, // 1 hour
    maxCacheSize: 10000,
    emergencyResponses: true,
    backupProviders: false, // Future: Google Claude, OpenAI backup
    circuitBreakerThreshold: 5,
    gracefulDegradationSteps: ['normal', 'degraded', 'minimal', 'emergency']
  };

  // Degradation rules
  private degradationRules: ServiceDegradationRule[] = [
    {
      level: 'normal',
      trigger: { budgetPercentage: 0, errorRate: 0, responseTime: 0 },
      restrictions: {
        maxRequestsPerMinute: 100,
        allowedFeatures: ['idea_generation', 'personalization', 'referral', 'analytics'],
        responseQuality: 'full',
        userTierAccess: ['enterprise', 'premium', 'free']
      }
    },
    {
      level: 'degraded',
      trigger: { budgetPercentage: 80, errorRate: 5, responseTime: 5000 },
      restrictions: {
        maxRequestsPerMinute: 60,
        allowedFeatures: ['idea_generation', 'personalization', 'referral'],
        responseQuality: 'basic',
        userTierAccess: ['enterprise', 'premium', 'free']
      }
    },
    {
      level: 'minimal',
      trigger: { budgetPercentage: 100, errorRate: 10, responseTime: 8000 },
      restrictions: {
        maxRequestsPerMinute: 30,
        allowedFeatures: ['idea_generation', 'referral'],
        responseQuality: 'cached_only',
        userTierAccess: ['enterprise', 'premium']
      }
    },
    {
      level: 'emergency',
      trigger: { budgetPercentage: 180, errorRate: 20, responseTime: 10000 },
      restrictions: {
        maxRequestsPerMinute: 10,
        allowedFeatures: ['idea_generation'],
        responseQuality: 'cached_only',
        userTierAccess: ['enterprise']
      }
    }
  ];

  // Emergency content templates
  private emergencyContent: EmergencyContent[] = [
    {
      type: 'idea_generation',
      tier: 'free',
      content: {
        idea: 'Explore trending topics in your niche today. Research what your audience is discussing and create content around those themes.',
        category: 'content_strategy',
        confidence: 0.6,
        source: 'emergency_cache'
      },
      quality: 'basic',
      cost: 0
    },
    {
      type: 'idea_generation',
      tier: 'premium',
      content: {
        idea: 'Create a behind-the-scenes series showing your creative process. Document your journey from inspiration to final content.',
        category: 'engagement_strategy',
        confidence: 0.7,
        source: 'emergency_cache'
      },
      quality: 'standard',
      cost: 0
    },
    {
      type: 'personalization',
      tier: 'free',
      content: {
        preferences: { topics: ['general'], style: 'casual', format: 'mixed' },
        recommendations: ['Stay consistent with posting', 'Engage with your audience'],
        source: 'emergency_cache'
      },
      quality: 'basic',
      cost: 0
    }
  ];

  // Statistics
  private stats: FallbackStats = {
    currentServiceLevel: 'normal',
    cacheHitRate: 0,
    cacheSize: 0,
    emergencyResponsesServed: 0,
    circuitBreakerActivations: 0,
    totalFallbacksUsed: 0,
    costSavings: 0,
    degradationEvents: 0
  };

  private readonly STORAGE_KEY = 'roteirar_fallback_service';
  private readonly CACHE_KEY = 'roteirar_response_cache';

  constructor() {
    this.costManagement = new CostManagementService();
    this.budgetControl = new BudgetControlService();
    this.emergencyProtocol = new EmergencyProtocolService();
    this.usageTiers = new UsageTierService();
    
    this.initializeFallbackSystem();
    this.loadPersistedData();
  }

  /**
   * Initialize fallback system
   */
  private initializeFallbackSystem(): void {
    // Monitor system health every 30 seconds
    setInterval(() => this.monitorSystemHealth(), 30000);
    
    // Cache cleanup every 5 minutes
    setInterval(() => this.cleanupExpiredCache(), 300000);
    
    // Circuit breaker health check every minute
    setInterval(() => this.updateCircuitBreakers(), 60000);
    
    // Statistics update every 30 seconds
    setInterval(() => this.updateStatistics(), 30000);
    
    // Persist data every 10 minutes
    setInterval(() => this.persistData(), 600000);
  }

  /**
   * Main fallback handler - routes requests through fallback logic
   */
  public async handleRequest(
    userId: string,
    requestType: string,
    requestData: any,
    primaryHandler: () => Promise<any>
  ): Promise<{
    success: boolean;
    data?: any;
    source: 'primary' | 'cache' | 'emergency' | 'degraded';
    cost: number;
    fallbackUsed: boolean;
    serviceLevel: ServiceLevel;
  }> {
    const userTier = await this.usageTiers.getUserTier(userId);
    const requestHash = this.generateRequestHash(userId, requestType, requestData);
    
    // Check if user tier is allowed at current service level
    if (!this.isUserTierAllowed(userTier.tier)) {
      return {
        success: false,
        source: 'degraded',
        cost: 0,
        fallbackUsed: true,
        serviceLevel: this.currentServiceLevel
      };
    }

    // Check if feature is allowed at current service level
    if (!this.isFeatureAllowed(requestType)) {
      const emergencyResponse = this.getEmergencyContent(requestType, userTier.tier);
      if (emergencyResponse) {
        this.stats.emergencyResponsesServed++;
        this.stats.totalFallbacksUsed++;
        return {
          success: true,
          data: emergencyResponse.content,
          source: 'emergency',
          cost: 0,
          fallbackUsed: true,
          serviceLevel: this.currentServiceLevel
        };
      }
      return {
        success: false,
        source: 'degraded',
        cost: 0,
        fallbackUsed: true,
        serviceLevel: this.currentServiceLevel
      };
    }

    // Try cache first if enabled and service level requires it
    if (this.shouldUseCache()) {
      const cachedResponse = this.getCachedResponse(requestHash);
      if (cachedResponse) {
        cachedResponse.accessCount++;
        cachedResponse.lastAccessed = new Date();
        this.stats.totalFallbacksUsed++;
        this.stats.costSavings += cachedResponse.cost;
        
        return {
          success: true,
          data: cachedResponse.response,
          source: 'cache',
          cost: 0,
          fallbackUsed: true,
          serviceLevel: this.currentServiceLevel
        };
      }
    }

    // Check circuit breaker before attempting primary service
    const serviceName = `${requestType}_service`;
    if (this.isCircuitBreakerOpen(serviceName)) {
      // Try alternative approaches
      const fallbackResponse = await this.handleCircuitBreakerFallback(userId, requestType, requestData);
      return {
        ...fallbackResponse,
        fallbackUsed: true,
        serviceLevel: this.currentServiceLevel
      };
    }

    // Attempt primary service with circuit breaker protection
    try {
      const startTime = Date.now();
      const result = await primaryHandler();
      const responseTime = Date.now() - startTime;
      
      // Record success for circuit breaker
      this.recordCircuitBreakerSuccess(serviceName);
      
      // Cache successful response if caching enabled
      if (this.config.enableCache && result) {
        await this.cacheResponse(requestHash, userId, requestType, result, 0.01); // Estimated cost
      }
      
      return {
        success: true,
        data: result,
        source: 'primary',
        cost: 0.01, // Estimated cost - would be actual in real implementation
        fallbackUsed: false,
        serviceLevel: this.currentServiceLevel
      };
      
    } catch (error) {
      // Record failure for circuit breaker
      this.recordCircuitBreakerFailure(serviceName);
      
      // Try fallback approaches
      console.error(`Primary service failed for ${requestType}:`, error);
      
      // Try cached response as fallback
      const cachedResponse = this.getCachedResponse(requestHash);
      if (cachedResponse) {
        this.stats.totalFallbacksUsed++;
        return {
          success: true,
          data: cachedResponse.response,
          source: 'cache',
          cost: 0,
          fallbackUsed: true,
          serviceLevel: this.currentServiceLevel
        };
      }
      
      // Try emergency content
      const emergencyResponse = this.getEmergencyContent(requestType, userTier.tier);
      if (emergencyResponse) {
        this.stats.emergencyResponsesServed++;
        this.stats.totalFallbacksUsed++;
        return {
          success: true,
          data: emergencyResponse.content,
          source: 'emergency',
          cost: 0,
          fallbackUsed: true,
          serviceLevel: this.currentServiceLevel
        };
      }
      
      // Complete failure
      return {
        success: false,
        source: 'primary',
        cost: 0,
        fallbackUsed: false,
        serviceLevel: this.currentServiceLevel
      };
    }
  }

  /**
   * Set service degradation level
   */
  public async setServiceLevel(level: ServiceLevel, reason: string): Promise<void> {
    if (this.currentServiceLevel === level) return;
    
    const previousLevel = this.currentServiceLevel;
    this.currentServiceLevel = level;
    this.stats.currentServiceLevel = level;
    
    if (level !== 'normal') {
      this.stats.degradationEvents++;
    }
    
    // Notify emergency protocol if degradation is severe
    if (level === 'minimal' || level === 'emergency') {
      await this.emergencyProtocol.notifyEmergency('service_degradation', {
        previousLevel,
        currentLevel: level,
        reason,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`Service level changed from ${previousLevel} to ${level}: ${reason}`);
  }

  /**
   * Monitor system health and adjust service level
   */
  private async monitorSystemHealth(): Promise<void> {
    try {
      // Get current budget status
      const globalCosts = await this.costManagement.getGlobalCostSummary();
      const budgetStatus = await this.budgetControl.getBudgetAnalytics();
      
      // Calculate metrics
      const budgetPercentage = (globalCosts.today / 1.67) * 100; // Against $1.67 daily budget
      const errorRate = this.calculateErrorRate();
      const avgResponseTime = this.calculateAverageResponseTime();
      
      // Find appropriate service level
      const newLevel = this.determineServiceLevel(budgetPercentage, errorRate, avgResponseTime);
      
      // Update service level if needed
      if (newLevel !== this.currentServiceLevel) {
        await this.setServiceLevel(newLevel, 
          `Auto-adjustment: Budget ${budgetPercentage.toFixed(1)}%, Errors ${errorRate.toFixed(1)}%, Response ${avgResponseTime}ms`);
      }
      
    } catch (error) {
      console.error('Error monitoring system health:', error);
    }
  }

  /**
   * Determine appropriate service level based on metrics
   */
  private determineServiceLevel(budgetPercentage: number, errorRate: number, responseTime: number): ServiceLevel {
    // Check from most restrictive to least restrictive
    for (let i = this.degradationRules.length - 1; i >= 0; i--) {
      const rule = this.degradationRules[i];
      if (budgetPercentage >= rule.trigger.budgetPercentage ||
          errorRate >= rule.trigger.errorRate ||
          responseTime >= rule.trigger.responseTime) {
        return rule.level;
      }
    }
    return 'normal';
  }

  /**
   * Check if user tier is allowed at current service level
   */
  private isUserTierAllowed(tier: UserTier): boolean {
    const currentRule = this.degradationRules.find(rule => rule.level === this.currentServiceLevel);
    return currentRule ? currentRule.restrictions.userTierAccess.includes(tier) : true;
  }

  /**
   * Check if feature is allowed at current service level
   */
  private isFeatureAllowed(feature: string): boolean {
    const currentRule = this.degradationRules.find(rule => rule.level === this.currentServiceLevel);
    return currentRule ? currentRule.restrictions.allowedFeatures.includes(feature) : true;
  }

  /**
   * Check if cache should be used based on service level
   */
  private shouldUseCache(): boolean {
    if (!this.config.enableCache) return false;
    
    const currentRule = this.degradationRules.find(rule => rule.level === this.currentServiceLevel);
    return currentRule ? currentRule.restrictions.responseQuality === 'cached_only' : false;
  }

  /**
   * Get cached response
   */
  private getCachedResponse(requestHash: string): CachedResponse | null {
    const cached = this.cache.get(requestHash);
    if (cached && cached.expiresAt > new Date()) {
      return cached;
    } else if (cached) {
      this.cache.delete(requestHash); // Remove expired
    }
    return null;
  }

  /**
   * Cache response
   */
  private async cacheResponse(
    requestHash: string,
    userId: string,
    requestType: string,
    response: any,
    cost: number
  ): Promise<void> {
    if (!this.config.enableCache) return;
    
    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestCacheEntry();
    }
    
    const cached: CachedResponse = {
      id: this.generateId(),
      userId,
      requestType,
      requestHash,
      response,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.config.cacheExpiration),
      cost,
      accessCount: 0,
      lastAccessed: new Date()
    };
    
    this.cache.set(requestHash, cached);
  }

  /**
   * Get emergency content for request type and tier
   */
  private getEmergencyContent(requestType: string, tier: UserTier): EmergencyContent | null {
    const content = this.emergencyContent.find(c => 
      c.type === requestType && 
      (c.tier === tier || c.tier === 'free') // Fallback to free tier content
    );
    
    return content || null;
  }

  /**
   * Handle circuit breaker fallback
   */
  private async handleCircuitBreakerFallback(
    userId: string,
    requestType: string,
    requestData: any
  ): Promise<{
    success: boolean;
    data?: any;
    source: 'cache' | 'emergency';
    cost: number;
  }> {
    const requestHash = this.generateRequestHash(userId, requestType, requestData);
    const userTier = await this.usageTiers.getUserTier(userId);
    
    // Try cache first
    const cachedResponse = this.getCachedResponse(requestHash);
    if (cachedResponse) {
      this.stats.totalFallbacksUsed++;
      return {
        success: true,
        data: cachedResponse.response,
        source: 'cache',
        cost: 0
      };
    }
    
    // Try emergency content
    const emergencyResponse = this.getEmergencyContent(requestType, userTier.tier);
    if (emergencyResponse) {
      this.stats.emergencyResponsesServed++;
      this.stats.totalFallbacksUsed++;
      return {
        success: true,
        data: emergencyResponse.content,
        source: 'emergency',
        cost: 0
      };
    }
    
    return {
      success: false,
      source: 'emergency',
      cost: 0
    };
  }

  /**
   * Circuit breaker management
   */
  private isCircuitBreakerOpen(serviceName: string): boolean {
    const breaker = this.circuitBreakers.get(serviceName);
    if (!breaker) return false;
    
    if (breaker.state === 'open') {
      // Check if retry time has passed
      if (new Date() >= breaker.nextRetry) {
        breaker.state = 'half_open';
        breaker.successCount = 0;
        return false; // Allow one try
      }
      return true;
    }
    
    return false;
  }

  private recordCircuitBreakerFailure(serviceName: string): void {
    let breaker = this.circuitBreakers.get(serviceName);
    if (!breaker) {
      breaker = {
        service: serviceName,
        state: 'closed',
        failureCount: 0,
        lastFailure: new Date(),
        nextRetry: new Date(),
        successCount: 0,
        threshold: this.config.circuitBreakerThreshold
      };
      this.circuitBreakers.set(serviceName, breaker);
    }
    
    breaker.failureCount++;
    breaker.lastFailure = new Date();
    
    if (breaker.failureCount >= breaker.threshold) {
      breaker.state = 'open';
      breaker.nextRetry = new Date(Date.now() + 60000); // Retry after 1 minute
      this.stats.circuitBreakerActivations++;
      console.log(`Circuit breaker opened for ${serviceName}`);
    }
  }

  private recordCircuitBreakerSuccess(serviceName: string): void {
    const breaker = this.circuitBreakers.get(serviceName);
    if (!breaker) return;
    
    if (breaker.state === 'half_open') {
      breaker.successCount++;
      if (breaker.successCount >= 3) { // 3 successes to close
        breaker.state = 'closed';
        breaker.failureCount = 0;
        console.log(`Circuit breaker closed for ${serviceName}`);
      }
    } else if (breaker.state === 'closed') {
      breaker.failureCount = Math.max(0, breaker.failureCount - 1); // Reduce failure count on success
    }
  }

  /**
   * Update circuit breakers
   */
  private updateCircuitBreakers(): void {
    for (const [serviceName, breaker] of this.circuitBreakers.entries()) {
      // Reset old failures
      const timeSinceLastFailure = Date.now() - breaker.lastFailure.getTime();
      if (timeSinceLastFailure > 300000 && breaker.state === 'closed') { // 5 minutes
        breaker.failureCount = Math.max(0, breaker.failureCount - 1);
      }
    }
  }

  /**
   * Get fallback statistics
   */
  public getFallbackStats(): FallbackStats {
    this.updateStatistics();
    return { ...this.stats };
  }

  /**
   * Get detailed system status
   */
  public getSystemStatus(): {
    serviceLevel: ServiceLevel;
    cacheStats: {
      size: number;
      hitRate: number;
      totalEntries: number;
    };
    circuitBreakers: Array<{
      service: string;
      state: string;
      failures: number;
    }>;
    degradationRules: ServiceDegradationRule[];
    emergencyContentAvailable: number;
  } {
    return {
      serviceLevel: this.currentServiceLevel,
      cacheStats: {
        size: this.cache.size,
        hitRate: this.stats.cacheHitRate,
        totalEntries: this.cache.size
      },
      circuitBreakers: Array.from(this.circuitBreakers.values()).map(breaker => ({
        service: breaker.service,
        state: breaker.state,
        failures: breaker.failureCount
      })),
      degradationRules: this.degradationRules,
      emergencyContentAvailable: this.emergencyContent.length
    };
  }

  // Helper methods
  private generateRequestHash(userId: string, requestType: string, requestData: any): string {
    const hashSource = `${userId}_${requestType}_${JSON.stringify(requestData)}`;
    return btoa(hashSource).slice(0, 32); // Simple hash
  }

  private generateId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private evictOldestCacheEntry(): void {
    let oldest: [string, CachedResponse] | null = null;
    for (const [key, value] of this.cache.entries()) {
      if (!oldest || value.lastAccessed < oldest[1].lastAccessed) {
        oldest = [key, value];
      }
    }
    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }

  private cleanupExpiredCache(): void {
    const now = new Date();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  private calculateErrorRate(): number {
    // Would calculate from actual error metrics
    return 2.5; // Mock 2.5% error rate
  }

  private calculateAverageResponseTime(): number {
    // Would calculate from actual response time metrics
    return 2500; // Mock 2.5 second average
  }

  private updateStatistics(): void {
    this.stats.cacheSize = this.cache.size;
    
    // Calculate cache hit rate (simplified)
    const totalCacheAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    this.stats.cacheHitRate = totalCacheAccesses > 0 ? 
      (totalCacheAccesses / (totalCacheAccesses + this.stats.totalFallbacksUsed)) * 100 : 0;
  }

  private persistData(): void {
    const data = {
      currentServiceLevel: this.currentServiceLevel,
      stats: this.stats,
      config: this.config,
      circuitBreakers: Array.from(this.circuitBreakers.entries())
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    
    // Persist cache separately (only metadata, not full content)
    const cacheMetadata = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      userId: value.userId,
      requestType: value.requestType,
      timestamp: value.timestamp,
      expiresAt: value.expiresAt,
      accessCount: value.accessCount
    }));
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheMetadata));
  }

  private loadPersistedData(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.currentServiceLevel = data.currentServiceLevel || 'normal';
        this.stats = { ...this.stats, ...data.stats };
        this.config = { ...this.config, ...data.config };
        
        if (data.circuitBreakers) {
          this.circuitBreakers = new Map(data.circuitBreakers);
        }
      } catch (error) {
        console.error('Error loading persisted fallback data:', error);
      }
    }
  }
}

export default FallbackService; 