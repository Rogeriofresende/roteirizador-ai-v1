/**
 * ⚡ RATE LIMITING SERVICE - INTELLIGENT API PROTECTION
 * Smart rate limiting with user tier integration and cost awareness
 * 
 * PREVENTS: API abuse, cost spikes, system overload
 * FEATURES: Dynamic limits, priority queuing, burst handling, cost-aware throttling
 */

import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface RateLimit {
  userId: string;
  tier: 'free' | 'premium' | 'enterprise';
  endpoint: string;
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  currentRequests: number; // Current requests in window
  windowStart: number; // Window start timestamp
  burstAllowed: boolean; // Allow burst requests
  burstLimit: number; // Burst limit
  priority: number; // User priority (1-10)
  costWeight: number; // Cost weighting factor
}

export interface RateLimitConfig {
  endpoint: string;
  tiers: {
    free: RateLimitTier;
    premium: RateLimitTier;
    enterprise: RateLimitTier;
  };
  globalLimits: {
    perSecond: number;
    perMinute: number;
    perHour: number;
  };
  burstConfig: {
    enabled: boolean;
    multiplier: number; // Burst limit = base limit * multiplier
    cooldownMs: number; // Cooldown after burst
  };
  costAwareness: {
    enabled: boolean;
    slowdownThreshold: number; // Cost threshold to start slowing down
    maxSlowdownFactor: number; // Maximum slowdown multiplier
  };
}

export interface RateLimitTier {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  priority: number;
  burstEnabled: boolean;
  concurrentRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // Seconds to wait
  limit: number; // Current limit
  remaining: number; // Remaining requests
  resetTime: number; // When window resets
  priority: number; // Request priority
  queuePosition?: number; // Position in queue if rate limited
  estimatedWaitTime?: number; // Estimated wait time in ms
}

export interface RateLimitViolation {
  id: string;
  userId: string;
  endpoint: string;
  timestamp: string;
  violationType: 'limit_exceeded' | 'burst_violated' | 'cost_throttled' | 'global_limit';
  requestsAttempted: number;
  limitValue: number;
  action: 'throttled' | 'queued' | 'blocked';
  severity: 'low' | 'medium' | 'high';
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  queuedRequests: number;
  averageResponseTime: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    violations: number;
  }>;
  tierDistribution: Record<string, {
    requests: number;
    violations: number;
    averageWaitTime: number;
  }>;
  timeRange: {
    start: string;
    end: string;
  };
}

// =============================================================================
// RATE LIMITING SERVICE
// =============================================================================

class RateLimitingService {
  private rateLimits: Map<string, RateLimit> = new Map();
  private configurations: Map<string, RateLimitConfig> = new Map();
  private violations: RateLimitViolation[] = [];
  private requestQueue: Map<string, Array<{
    userId: string;
    endpoint: string;
    timestamp: number;
    priority: number;
    resolve: (result: RateLimitResult) => void;
  }>> = new Map();
  private processingQueue: boolean = false;
  private globalStats: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    lastSecond: number;
    lastMinute: number;
    lastHour: number;
  };

  constructor() {
    this.globalStats = {
      requestsPerSecond: 0,
      requestsPerMinute: 0,
      requestsPerHour: 0,
      lastSecond: Math.floor(Date.now() / 1000),
      lastMinute: Math.floor(Date.now() / 60000),
      lastHour: Math.floor(Date.now() / 3600000)
    };

    this.initializeDefaultConfigurations();
    this.loadPersistedData();
    this.startQueueProcessor();
    this.startStatsUpdater();

    logger.info('⚡ Rate Limiting Service initialized', {
      configurations: this.configurations.size,
      globalLimits: 'active'
    }, 'RATE_LIMITING');
  }

  // =============================================================================
  // CORE RATE LIMITING
  // =============================================================================

  /**
   * Check if request is allowed under rate limits
   * CRITICAL: Main entry point for rate limit checking
   */
  async checkRateLimit(
    userId: string,
    endpoint: string,
    metadata: {
      tier?: 'free' | 'premium' | 'enterprise';
      priority?: number;
      costWeight?: number;
      bypassQueue?: boolean;
    } = {}
  ): Promise<RateLimitResult> {
    // Get user tier from cost management if not provided
    let userTier = metadata.tier;
    if (!userTier) {
      userTier = await this.getUserTier(userId);
    }

    // Check global rate limits first
    const globalCheck = this.checkGlobalLimits();
    if (!globalCheck.allowed) {
      await this.recordViolation(userId, endpoint, 'global_limit', globalCheck);
      return globalCheck;
    }

    // Get or create rate limit for user/endpoint
    const rateLimitKey = `${userId}:${endpoint}`;
    let rateLimit = this.rateLimits.get(rateLimitKey);
    
    if (!rateLimit) {
      rateLimit = this.createRateLimit(userId, endpoint, userTier, metadata);
      this.rateLimits.set(rateLimitKey, rateLimit);
    }

    // Update rate limit with current request
    const result = this.evaluateRateLimit(rateLimit, metadata);

    // Handle cost-aware throttling
    if (result.allowed) {
      const costAwareResult = await this.applyCostAwareThrottling(result, userId, endpoint);
      if (!costAwareResult.allowed) {
        await this.recordViolation(userId, endpoint, 'cost_throttled', costAwareResult);
        return costAwareResult;
      }
    }

    // If not allowed and queueing is enabled, add to queue
    if (!result.allowed && !metadata.bypassQueue) {
      const queueResult = await this.addToQueue(userId, endpoint, metadata.priority || 1);
      return {
        ...result,
        queuePosition: queueResult.position,
        estimatedWaitTime: queueResult.estimatedWaitTime
      };
    }

    // Record violation if blocked
    if (!result.allowed) {
      await this.recordViolation(userId, endpoint, 'limit_exceeded', result);
    } else {
      // Update rate limit counters for successful request
      this.updateRateLimitCounters(rateLimit);
      this.updateGlobalStats();
    }

    return result;
  }

  /**
   * Evaluate rate limit for specific user/endpoint
   */
  private evaluateRateLimit(rateLimit: RateLimit, metadata: any): RateLimitResult {
    const now = Date.now();
    const config = this.configurations.get(rateLimit.endpoint);
    
    if (!config) {
      return {
        allowed: false,
        reason: 'No configuration found for endpoint',
        limit: 0,
        remaining: 0,
        resetTime: now,
        priority: rateLimit.priority
      };
    }

    const tierConfig = config.tiers[rateLimit.tier];

    // Check if we need to reset the window
    if (now - rateLimit.windowStart >= rateLimit.windowMs) {
      this.resetRateLimitWindow(rateLimit, tierConfig);
    }

    // Check different time windows
    const checks = this.performTimeWindowChecks(rateLimit, tierConfig, now);
    
    // If any check fails, return the most restrictive one
    const failedCheck = checks.find(check => !check.allowed);
    if (failedCheck) {
      return failedCheck;
    }

    // Check burst limits if applicable
    if (config.burstConfig.enabled && tierConfig.burstEnabled) {
      const burstCheck = this.checkBurstLimits(rateLimit, tierConfig, config.burstConfig);
      if (!burstCheck.allowed) {
        return burstCheck;
      }
    }

    // Check concurrent request limits
    const concurrentCheck = this.checkConcurrentLimits(rateLimit, tierConfig);
    if (!concurrentCheck.allowed) {
      return concurrentCheck;
    }

    // If all checks pass, allow the request
    return {
      allowed: true,
      limit: rateLimit.maxRequests,
      remaining: Math.max(0, rateLimit.maxRequests - rateLimit.currentRequests - 1),
      resetTime: rateLimit.windowStart + rateLimit.windowMs,
      priority: rateLimit.priority
    };
  }

  /**
   * Perform time window checks (second, minute, hour, day)
   */
  private performTimeWindowChecks(
    rateLimit: RateLimit, 
    tierConfig: RateLimitTier, 
    now: number
  ): RateLimitResult[] {
    const checks: RateLimitResult[] = [];

    // Per second check
    const secondWindow = Math.floor(now / 1000);
    const secondKey = `${rateLimit.userId}:${rateLimit.endpoint}:second:${secondWindow}`;
    const secondRequests = this.getWindowRequests(secondKey);
    
    checks.push({
      allowed: secondRequests < tierConfig.requestsPerSecond,
      reason: secondRequests >= tierConfig.requestsPerSecond ? 'Per-second limit exceeded' : undefined,
      limit: tierConfig.requestsPerSecond,
      remaining: Math.max(0, tierConfig.requestsPerSecond - secondRequests),
      resetTime: (secondWindow + 1) * 1000,
      priority: rateLimit.priority
    });

    // Per minute check
    const minuteWindow = Math.floor(now / 60000);
    const minuteKey = `${rateLimit.userId}:${rateLimit.endpoint}:minute:${minuteWindow}`;
    const minuteRequests = this.getWindowRequests(minuteKey);
    
    checks.push({
      allowed: minuteRequests < tierConfig.requestsPerMinute,
      reason: minuteRequests >= tierConfig.requestsPerMinute ? 'Per-minute limit exceeded' : undefined,
      limit: tierConfig.requestsPerMinute,
      remaining: Math.max(0, tierConfig.requestsPerMinute - minuteRequests),
      resetTime: (minuteWindow + 1) * 60000,
      priority: rateLimit.priority
    });

    // Per hour check
    const hourWindow = Math.floor(now / 3600000);
    const hourKey = `${rateLimit.userId}:${rateLimit.endpoint}:hour:${hourWindow}`;
    const hourRequests = this.getWindowRequests(hourKey);
    
    checks.push({
      allowed: hourRequests < tierConfig.requestsPerHour,
      reason: hourRequests >= tierConfig.requestsPerHour ? 'Per-hour limit exceeded' : undefined,
      limit: tierConfig.requestsPerHour,
      remaining: Math.max(0, tierConfig.requestsPerHour - hourRequests),
      resetTime: (hourWindow + 1) * 3600000,
      priority: rateLimit.priority
    });

    return checks;
  }

  /**
   * Check burst limits
   */
  private checkBurstLimits(
    rateLimit: RateLimit, 
    tierConfig: RateLimitTier, 
    burstConfig: any
  ): RateLimitResult {
    if (!rateLimit.burstAllowed) {
      return {
        allowed: false,
        reason: 'Burst limit exceeded, in cooldown period',
        limit: rateLimit.burstLimit,
        remaining: 0,
        resetTime: rateLimit.windowStart + burstConfig.cooldownMs,
        priority: rateLimit.priority
      };
    }

    const burstLimit = Math.floor(rateLimit.maxRequests * burstConfig.multiplier);
    
    if (rateLimit.currentRequests >= burstLimit) {
      rateLimit.burstAllowed = false; // Disable burst for cooldown period
      
      return {
        allowed: false,
        reason: 'Burst limit exceeded',
        limit: burstLimit,
        remaining: 0,
        resetTime: rateLimit.windowStart + burstConfig.cooldownMs,
        priority: rateLimit.priority
      };
    }

    return {
      allowed: true,
      limit: burstLimit,
      remaining: burstLimit - rateLimit.currentRequests,
      resetTime: rateLimit.windowStart + rateLimit.windowMs,
      priority: rateLimit.priority
    };
  }

  /**
   * Check concurrent request limits
   */
  private checkConcurrentLimits(
    rateLimit: RateLimit, 
    tierConfig: RateLimitTier
  ): RateLimitResult {
    const concurrentKey = `${rateLimit.userId}:${rateLimit.endpoint}:concurrent`;
    const currentConcurrent = this.getConcurrentRequests(concurrentKey);

    if (currentConcurrent >= tierConfig.concurrentRequests) {
      return {
        allowed: false,
        reason: `Concurrent request limit exceeded (${currentConcurrent}/${tierConfig.concurrentRequests})`,
        limit: tierConfig.concurrentRequests,
        remaining: 0,
        resetTime: Date.now() + 5000, // 5 second retry
        priority: rateLimit.priority
      };
    }

    return {
      allowed: true,
      limit: tierConfig.concurrentRequests,
      remaining: tierConfig.concurrentRequests - currentConcurrent,
      resetTime: Date.now() + 60000,
      priority: rateLimit.priority
    };
  }

  // =============================================================================
  // COST-AWARE THROTTLING
  // =============================================================================

  /**
   * Apply cost-aware throttling based on current budget usage
   */
  private async applyCostAwareThrottling(
    result: RateLimitResult,
    userId: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    try {
      // Get current cost status from cost management service
      const { costManagementService } = await import('../risk-management/costManagementService');
      const systemBudget = costManagementService.getSystemBudget();
      const userUsage = costManagementService.getUserUsage(userId);

      const config = this.configurations.get(endpoint);
      if (!config?.costAwareness.enabled) {
        return result; // Cost awareness disabled
      }

      // Calculate current cost utilization
      const dailyUtilization = systemBudget.currentDailyCost / systemBudget.dailyBudget;
      const userUtilization = userUsage.monthlyCost / (userUsage.userTier === 'free' ? 5 : 
                               userUsage.userTier === 'premium' ? 20 : 50);

      // Apply throttling if over threshold
      const maxUtilization = Math.max(dailyUtilization, userUtilization);
      
      if (maxUtilization > config.costAwareness.slowdownThreshold) {
        const slowdownFactor = Math.min(
          config.costAwareness.maxSlowdownFactor,
          1 + (maxUtilization - config.costAwareness.slowdownThreshold) * 2
        );

        // Reduce the remaining requests based on slowdown factor
        const adjustedRemaining = Math.floor(result.remaining / slowdownFactor);
        
        if (adjustedRemaining <= 0) {
          return {
            ...result,
            allowed: false,
            reason: `Cost-aware throttling active (${(maxUtilization * 100).toFixed(1)}% budget used)`,
            remaining: 0,
            retryAfter: Math.ceil(slowdownFactor * 60) // Wait time in seconds
          };
        }

        return {
          ...result,
          remaining: adjustedRemaining,
          retryAfter: Math.ceil(slowdownFactor * 5) // Mild delay
        };
      }

      return result;
    } catch (error) {
      logger.error('Failed to apply cost-aware throttling', error, 'RATE_LIMITING');
      return result; // Return original result on error
    }
  }

  // =============================================================================
  // GLOBAL LIMITS & QUEUE MANAGEMENT
  // =============================================================================

  /**
   * Check global system-wide rate limits
   */
  private checkGlobalLimits(): RateLimitResult {
    const now = Date.now();
    
    // Update global stats windows
    this.updateGlobalStatsWindows(now);

    // Check against configured global limits
    const globalConfig = Array.from(this.configurations.values())[0]?.globalLimits;
    if (!globalConfig) {
      return { allowed: true, limit: 0, remaining: 0, resetTime: now, priority: 1 };
    }

    // Check per-second global limit
    if (this.globalStats.requestsPerSecond >= globalConfig.perSecond) {
      return {
        allowed: false,
        reason: `Global per-second limit exceeded (${this.globalStats.requestsPerSecond}/${globalConfig.perSecond})`,
        limit: globalConfig.perSecond,
        remaining: 0,
        resetTime: (Math.floor(now / 1000) + 1) * 1000,
        priority: 1,
        retryAfter: 1
      };
    }

    // Check per-minute global limit
    if (this.globalStats.requestsPerMinute >= globalConfig.perMinute) {
      return {
        allowed: false,
        reason: `Global per-minute limit exceeded (${this.globalStats.requestsPerMinute}/${globalConfig.perMinute})`,
        limit: globalConfig.perMinute,
        remaining: 0,
        resetTime: (Math.floor(now / 60000) + 1) * 60000,
        priority: 1,
        retryAfter: 60
      };
    }

    // Check per-hour global limit
    if (this.globalStats.requestsPerHour >= globalConfig.perHour) {
      return {
        allowed: false,
        reason: `Global per-hour limit exceeded (${this.globalStats.requestsPerHour}/${globalConfig.perHour})`,
        limit: globalConfig.perHour,
        remaining: 0,
        resetTime: (Math.floor(now / 3600000) + 1) * 3600000,
        priority: 1,
        retryAfter: 3600
      };
    }

    return { allowed: true, limit: 0, remaining: 0, resetTime: now, priority: 1 };
  }

  /**
   * Add request to priority queue
   */
  private async addToQueue(
    userId: string,
    endpoint: string,
    priority: number
  ): Promise<{ position: number; estimatedWaitTime: number }> {
    return new Promise((resolve) => {
      const queueKey = endpoint;
      let queue = this.requestQueue.get(queueKey);
      
      if (!queue) {
        queue = [];
        this.requestQueue.set(queueKey, queue);
      }

      const queueItem = {
        userId,
        endpoint,
        timestamp: Date.now(),
        priority,
        resolve: (result: RateLimitResult) => {
          resolve({
            position: result.queuePosition || 0,
            estimatedWaitTime: result.estimatedWaitTime || 0
          });
        }
      };

      // Insert based on priority (higher priority first)
      let insertIndex = queue.length;
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].priority < priority) {
          insertIndex = i;
          break;
        }
      }

      queue.splice(insertIndex, 0, queueItem);

      // Start processing queue if not already running
      if (!this.processingQueue) {
        this.processRequestQueue();
      }

      // Return immediate position and estimated wait time
      const position = insertIndex + 1;
      const estimatedWaitTime = position * 1000; // 1 second per position estimate

      resolve({ position, estimatedWaitTime });
    });
  }

  /**
   * Process request queue
   */
  private async processRequestQueue(): Promise<void> {
    if (this.processingQueue) return;
    
    this.processingQueue = true;

    try {
      while (true) {
        let hasProcessedAny = false;

        // Process each endpoint queue
        for (const [endpoint, queue] of this.requestQueue.entries()) {
          if (queue.length === 0) continue;

          const nextRequest = queue[0];
          
          // Check if this request can now be processed
          const rateLimitResult = await this.checkRateLimit(
            nextRequest.userId,
            nextRequest.endpoint,
            { bypassQueue: true }
          );

          if (rateLimitResult.allowed) {
            // Remove from queue and resolve
            queue.shift();
            nextRequest.resolve({
              ...rateLimitResult,
              queuePosition: 0,
              estimatedWaitTime: 0
            });
            hasProcessedAny = true;
          }
        }

        // If no requests were processed, wait before trying again
        if (!hasProcessedAny) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check if all queues are empty
        const totalQueueSize = Array.from(this.requestQueue.values())
          .reduce((total, queue) => total + queue.length, 0);
        
        if (totalQueueSize === 0) {
          break;
        }
      }
    } catch (error) {
      logger.error('Error processing request queue', error, 'RATE_LIMITING');
    } finally {
      this.processingQueue = false;
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private createRateLimit(
    userId: string,
    endpoint: string,
    tier: 'free' | 'premium' | 'enterprise',
    metadata: any
  ): RateLimit {
    const config = this.configurations.get(endpoint);
    const tierConfig = config?.tiers[tier];
    
    if (!config || !tierConfig) {
      throw new Error(`No configuration found for endpoint ${endpoint} and tier ${tier}`);
    }

    return {
      userId,
      tier,
      endpoint,
      windowMs: 60000, // 1 minute window
      maxRequests: tierConfig.requestsPerMinute,
      currentRequests: 0,
      windowStart: Date.now(),
      burstAllowed: tierConfig.burstEnabled,
      burstLimit: Math.floor(tierConfig.requestsPerMinute * (config.burstConfig.multiplier || 1.5)),
      priority: metadata.priority || tierConfig.priority,
      costWeight: metadata.costWeight || 1.0
    };
  }

  private resetRateLimitWindow(rateLimit: RateLimit, tierConfig: RateLimitTier): void {
    rateLimit.windowStart = Date.now();
    rateLimit.currentRequests = 0;
    rateLimit.maxRequests = tierConfig.requestsPerMinute;
    
    // Reset burst allowance after cooldown
    if (!rateLimit.burstAllowed) {
      const config = this.configurations.get(rateLimit.endpoint);
      if (config && Date.now() - rateLimit.windowStart > config.burstConfig.cooldownMs) {
        rateLimit.burstAllowed = true;
      }
    }
  }

  private updateRateLimitCounters(rateLimit: RateLimit): void {
    rateLimit.currentRequests++;
    
    // Update window counters
    const now = Date.now();
    const secondWindow = Math.floor(now / 1000);
    const minuteWindow = Math.floor(now / 60000);
    const hourWindow = Math.floor(now / 3600000);

    this.incrementWindowCounter(`${rateLimit.userId}:${rateLimit.endpoint}:second:${secondWindow}`);
    this.incrementWindowCounter(`${rateLimit.userId}:${rateLimit.endpoint}:minute:${minuteWindow}`);
    this.incrementWindowCounter(`${rateLimit.userId}:${rateLimit.endpoint}:hour:${hourWindow}`);
    
    // Track concurrent requests
    const concurrentKey = `${rateLimit.userId}:${rateLimit.endpoint}:concurrent`;
    this.incrementConcurrentCounter(concurrentKey);
  }

  private updateGlobalStats(): void {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    const currentMinute = Math.floor(now / 60000);
    const currentHour = Math.floor(now / 3600000);

    // Reset counters if we've moved to a new window
    if (currentSecond !== this.globalStats.lastSecond) {
      this.globalStats.requestsPerSecond = 0;
      this.globalStats.lastSecond = currentSecond;
    }
    
    if (currentMinute !== this.globalStats.lastMinute) {
      this.globalStats.requestsPerMinute = 0;
      this.globalStats.lastMinute = currentMinute;
    }
    
    if (currentHour !== this.globalStats.lastHour) {
      this.globalStats.requestsPerHour = 0;
      this.globalStats.lastHour = currentHour;
    }

    // Increment counters
    this.globalStats.requestsPerSecond++;
    this.globalStats.requestsPerMinute++;
    this.globalStats.requestsPerHour++;
  }

  private updateGlobalStatsWindows(now: number): void {
    const currentSecond = Math.floor(now / 1000);
    const currentMinute = Math.floor(now / 60000);
    const currentHour = Math.floor(now / 3600000);

    if (currentSecond !== this.globalStats.lastSecond) {
      this.globalStats.requestsPerSecond = 0;
      this.globalStats.lastSecond = currentSecond;
    }
    
    if (currentMinute !== this.globalStats.lastMinute) {
      this.globalStats.requestsPerMinute = 0;
      this.globalStats.lastMinute = currentMinute;
    }
    
    if (currentHour !== this.globalStats.lastHour) {
      this.globalStats.requestsPerHour = 0;
      this.globalStats.lastHour = currentHour;
    }
  }

  private getWindowRequests(key: string): number {
    // In a real implementation, this would use Redis or similar
    // For now, use in-memory storage with expiration
    const stored = (this as any).windowCounters?.[key];
    if (!stored) return 0;
    
    // Check if expired (5 minute TTL)
    if (Date.now() - stored.timestamp > 300000) {
      delete (this as any).windowCounters[key];
      return 0;
    }
    
    return stored.count;
  }

  private incrementWindowCounter(key: string): void {
    if (!(this as any).windowCounters) {
      (this as any).windowCounters = {};
    }
    
    const existing = (this as any).windowCounters[key];
    (this as any).windowCounters[key] = {
      count: (existing?.count || 0) + 1,
      timestamp: Date.now()
    };
  }

  private getConcurrentRequests(key: string): number {
    // This would track active concurrent requests
    return (this as any).concurrentCounters?.[key] || 0;
  }

  private incrementConcurrentCounter(key: string): void {
    if (!(this as any).concurrentCounters) {
      (this as any).concurrentCounters = {};
    }
    
    (this as any).concurrentCounters[key] = ((this as any).concurrentCounters[key] || 0) + 1;
    
    // Auto-decrement after typical request duration (5 seconds)
    setTimeout(() => {
      if ((this as any).concurrentCounters[key] > 0) {
        (this as any).concurrentCounters[key]--;
      }
    }, 5000);
  }

  private async getUserTier(userId: string): Promise<'free' | 'premium' | 'enterprise'> {
    try {
      const { usageTierService } = await import('../risk-management/usageTierService');
      const tierStatus = usageTierService.getUserTierStatus(userId);
      return tierStatus.currentTier;
    } catch (error) {
      logger.error('Failed to get user tier, defaulting to free', error, 'RATE_LIMITING');
      return 'free';
    }
  }

  private async recordViolation(
    userId: string,
    endpoint: string,
    violationType: RateLimitViolation['violationType'],
    result: RateLimitResult
  ): Promise<void> {
    const violation: RateLimitViolation = {
      id: crypto.randomUUID(),
      userId,
      endpoint,
      timestamp: new Date().toISOString(),
      violationType,
      requestsAttempted: result.limit - result.remaining + 1,
      limitValue: result.limit,
      action: result.queuePosition ? 'queued' : 'blocked',
      severity: violationType === 'global_limit' ? 'high' : 
                violationType === 'cost_throttled' ? 'medium' : 'low'
    };

    this.violations.push(violation);
    
    // Keep only last 1000 violations
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }

    logger.warn('Rate limit violation recorded', {
      userId,
      endpoint,
      violationType,
      action: violation.action
    }, 'RATE_LIMIT_VIOLATION');

    // Persist violations
    try {
      localStorage.setItem('rateLimiting_violations', JSON.stringify(this.violations));
    } catch (error) {
      logger.error('Failed to persist rate limit violations', error, 'RATE_LIMITING');
    }
  }

  // =============================================================================
  // CONFIGURATION METHODS
  // =============================================================================

  private initializeDefaultConfigurations(): void {
    const defaultConfigs: Array<{ endpoint: string; config: RateLimitConfig }> = [
      {
        endpoint: 'idea_generation',
        config: {
          endpoint: 'idea_generation',
          tiers: {
            free: {
              requestsPerSecond: 0.5, // 1 request per 2 seconds
              requestsPerMinute: 5,
              requestsPerHour: 30,
              requestsPerDay: 150,
              priority: 1,
              burstEnabled: false,
              concurrentRequests: 1
            },
            premium: {
              requestsPerSecond: 1,
              requestsPerMinute: 15,
              requestsPerHour: 100,
              requestsPerDay: 450,
              priority: 5,
              burstEnabled: true,
              concurrentRequests: 2
            },
            enterprise: {
              requestsPerSecond: 2,
              requestsPerMinute: 50,
              requestsPerHour: 300,
              requestsPerDay: 1500,
              priority: 10,
              burstEnabled: true,
              concurrentRequests: 5
            }
          },
          globalLimits: {
            perSecond: 100,
            perMinute: 1000,
            perHour: 10000
          },
          burstConfig: {
            enabled: true,
            multiplier: 1.5,
            cooldownMs: 300000 // 5 minutes
          },
          costAwareness: {
            enabled: true,
            slowdownThreshold: 0.8, // 80% of budget
            maxSlowdownFactor: 3.0
          }
        }
      },
      {
        endpoint: 'analytics',
        config: {
          endpoint: 'analytics',
          tiers: {
            free: {
              requestsPerSecond: 1,
              requestsPerMinute: 10,
              requestsPerHour: 100,
              requestsPerDay: 500,
              priority: 1,
              burstEnabled: false,
              concurrentRequests: 2
            },
            premium: {
              requestsPerSecond: 2,
              requestsPerMinute: 30,
              requestsPerHour: 300,
              requestsPerDay: 1500,
              priority: 5,
              burstEnabled: true,
              concurrentRequests: 3
            },
            enterprise: {
              requestsPerSecond: 5,
              requestsPerMinute: 100,
              requestsPerHour: 1000,
              requestsPerDay: 5000,
              priority: 10,
              burstEnabled: true,
              concurrentRequests: 10
            }
          },
          globalLimits: {
            perSecond: 50,
            perMinute: 500,
            perHour: 5000
          },
          burstConfig: {
            enabled: true,
            multiplier: 2.0,
            cooldownMs: 180000 // 3 minutes
          },
          costAwareness: {
            enabled: false,
            slowdownThreshold: 0.9,
            maxSlowdownFactor: 2.0
          }
        }
      }
    ];

    defaultConfigs.forEach(({ endpoint, config }) => {
      this.configurations.set(endpoint, config);
    });
  }

  private async loadPersistedData(): Promise<void> {
    try {
      // Load violations
      const storedViolations = localStorage.getItem('rateLimiting_violations');
      if (storedViolations) {
        this.violations = JSON.parse(storedViolations);
      }
    } catch (error) {
      logger.error('Failed to load persisted rate limiting data', error, 'RATE_LIMITING');
    }
  }

  private startQueueProcessor(): void {
    // Process queue every 100ms for responsiveness
    setInterval(() => {
      if (!this.processingQueue) {
        this.processRequestQueue();
      }
    }, 100);
  }

  private startStatsUpdater(): void {
    // Clean up old window counters every minute
    setInterval(() => {
      this.cleanupOldCounters();
    }, 60000);
  }

  private cleanupOldCounters(): void {
    const now = Date.now();
    const fiveMinutesAgo = now - 300000;

    // Clean up window counters
    if ((this as any).windowCounters) {
      Object.keys((this as any).windowCounters).forEach(key => {
        if ((this as any).windowCounters[key].timestamp < fiveMinutesAgo) {
          delete (this as any).windowCounters[key];
        }
      });
    }

    // Clean up old rate limits
    for (const [key, rateLimit] of this.rateLimits.entries()) {
      if (now - rateLimit.windowStart > 3600000) { // 1 hour old
        this.rateLimits.delete(key);
      }
    }
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get rate limit status for user/endpoint
   */
  getRateLimitStatus(userId: string, endpoint: string): {
    currentRequests: number;
    maxRequests: number;
    remaining: number;
    resetTime: number;
    tier: string;
  } {
    const rateLimitKey = `${userId}:${endpoint}`;
    const rateLimit = this.rateLimits.get(rateLimitKey);
    
    if (!rateLimit) {
      return {
        currentRequests: 0,
        maxRequests: 0,
        remaining: 0,
        resetTime: Date.now(),
        tier: 'unknown'
      };
    }

    return {
      currentRequests: rateLimit.currentRequests,
      maxRequests: rateLimit.maxRequests,
      remaining: Math.max(0, rateLimit.maxRequests - rateLimit.currentRequests),
      resetTime: rateLimit.windowStart + rateLimit.windowMs,
      tier: rateLimit.tier
    };
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats(timeRange: { start: string; end: string }): RateLimitStats {
    const startTime = new Date(timeRange.start).getTime();
    const endTime = new Date(timeRange.end).getTime();

    const filteredViolations = this.violations.filter(v => {
      const violationTime = new Date(v.timestamp).getTime();
      return violationTime >= startTime && violationTime <= endTime;
    });

    // Calculate statistics
    const totalRequests = filteredViolations.length; // Simplified for demo
    const blockedRequests = filteredViolations.filter(v => v.action === 'blocked').length;
    const queuedRequests = filteredViolations.filter(v => v.action === 'queued').length;

    // Group by endpoint
    const endpointStats = new Map<string, { requests: number; violations: number }>();
    filteredViolations.forEach(v => {
      const existing = endpointStats.get(v.endpoint) || { requests: 0, violations: 0 };
      existing.violations++;
      endpointStats.set(v.endpoint, existing);
    });

    // Group by tier (would need additional tracking for full implementation)
    const tierDistribution = {
      free: { requests: 0, violations: 0, averageWaitTime: 0 },
      premium: { requests: 0, violations: 0, averageWaitTime: 0 },
      enterprise: { requests: 0, violations: 0, averageWaitTime: 0 }
    };

    return {
      totalRequests,
      blockedRequests,
      queuedRequests,
      averageResponseTime: 0, // Would calculate from actual response times
      topEndpoints: Array.from(endpointStats.entries()).map(([endpoint, stats]) => ({
        endpoint,
        requests: stats.requests,
        violations: stats.violations
      })),
      tierDistribution,
      timeRange
    };
  }

  /**
   * Update rate limit configuration
   */
  updateConfiguration(endpoint: string, config: Partial<RateLimitConfig>): void {
    const existing = this.configurations.get(endpoint);
    if (existing) {
      this.configurations.set(endpoint, { ...existing, ...config });
      logger.info('Rate limit configuration updated', { endpoint }, 'RATE_LIMITING');
    }
  }

  /**
   * Clear rate limits for user (admin function)
   */
  clearUserRateLimits(userId: string): void {
    for (const [key, rateLimit] of this.rateLimits.entries()) {
      if (rateLimit.userId === userId) {
        this.rateLimits.delete(key);
      }
    }
    
    logger.info('User rate limits cleared', { userId }, 'RATE_LIMITING');
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const rateLimitingService = new RateLimitingService();
export default RateLimitingService; 