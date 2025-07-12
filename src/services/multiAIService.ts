/**
 * 🚀 WEEK 7 DAY 2 - ADVANCED MULTI-AI ORCHESTRATION SERVICE
 * Enterprise-grade AI provider management with intelligent selection and load balancing
 */

import { logger } from '../utils/logger';
import { geminiService } from './geminiService';
import { recordMetric } from './performance';
import { analyticsService } from './analyticsService';

// 🚀 WEEK 7: Advanced AI Provider Management
export interface AIProvider {
  id: string;
  name: string;
  type: 'text-generation' | 'code-generation' | 'analysis' | 'creative' | 'technical';
  endpoint?: string;
  weight: number; // Load balancing weight (1-100)
  priority: number; // Selection priority (1-10, higher = more preferred)
  healthScore: number; // Current health (0-100)
  avgResponseTime: number; // Moving average in ms
  successRate: number; // Success rate 0-1
  costPerToken: number; // Cost optimization
  maxTokens: number;
  features: string[];
  lastUsed: number;
  isAvailable: boolean;
}

export interface AIRequest {
  type: 'text-generation' | 'code-generation' | 'analysis' | 'creative' | 'technical';
  prompt: string;
  context?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  maxTokens?: number;
  temperature?: number;
  requiresStreaming?: boolean;
  cacheable?: boolean;
  timeout?: number;
}

export interface AIResponse {
  providerId: string;
  content: string;
  tokensUsed: number;
  responseTime: number;
  cached: boolean;
  confidence: number;
  cost: number;
  metadata: Record<string, any>;
}

// 🚀 WEEK 7: Provider Registry with Enhanced Capabilities
const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini-pro',
    name: 'Google Gemini Pro',
    type: 'text-generation',
    weight: 90,
    priority: 9,
    healthScore: 95,
    avgResponseTime: 1200,
    successRate: 0.98,
    costPerToken: 0.0001,
    maxTokens: 32768,
    features: ['streaming', 'function-calling', 'vision', 'multimodal'],
    lastUsed: Date.now(),
    isAvailable: true
  },
  {
    id: 'gemini-flash',
    name: 'Google Gemini Flash',
    type: 'text-generation', 
    weight: 85,
    priority: 8,
    healthScore: 92,
    avgResponseTime: 800,
    successRate: 0.96,
    costPerToken: 0.00005,
    maxTokens: 8192,
    features: ['streaming', 'fast-response', 'cost-effective'],
    lastUsed: Date.now() - 300000,
    isAvailable: true
  },
  {
    id: 'gemini-code',
    name: 'Google Gemini Code',
    type: 'code-generation',
    weight: 95,
    priority: 10,
    healthScore: 97,
    avgResponseTime: 1500,
    successRate: 0.99,
    costPerToken: 0.00015,
    maxTokens: 16384,
    features: ['code-completion', 'debugging', 'refactoring', 'documentation'],
    lastUsed: Date.now() - 600000,
    isAvailable: true
  }
];

// 🚀 WEEK 7: Response Cache with TTL and Compression
interface CacheEntry {
  key: string;
  response: AIResponse;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

class AdvancedMultiAIOrchestrator {
  private providers: Map<string, AIProvider> = new Map();
  private responseCache: Map<string, CacheEntry> = new Map();
  private loadBalancer: Map<string, number> = new Map(); // Current load per provider
  private circuitBreakers: Map<string, {
    failures: number;
    lastFailure: number;
    isOpen: boolean;
    resetTimeout: number;
  }> = new Map();

  // 🚀 WEEK 7: Performance tracking
  private performanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    providerFailures: new Map<string, number>(),
    avgResponseTime: 0,
    costSavings: 0
  };

  constructor() {
    this.initializeProviders();
    this.startHealthMonitoring();
    this.startCacheCleanup();
    
    logger.log('info', 'Advanced Multi-AI Orchestrator initialized', {
      providers: this.providers.size,
      cacheEnabled: true,
      loadBalancing: true,
      circuitBreakers: true
    }, 'MULTI_AI');
  }

  /**
   * 🚀 WEEK 7: Intelligent AI request processing with provider selection
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();
    this.performanceMetrics.totalRequests++;

    try {
      // Check cache first
      if (request.cacheable !== false) {
        const cached = this.getCachedResponse(request);
        if (cached) {
          this.performanceMetrics.cacheHits++;
          recordMetric('ai_cache_hit', 1, 'count', 'ai_optimization');
          
          logger.log('debug', 'AI response served from cache', {
            cacheKey: this.generateCacheKey(request),
            savedTime: cached.response.responseTime,
            hit: cached.hits
          }, 'MULTI_AI');
          
          return {
            ...cached.response,
            cached: true,
            responseTime: performance.now() - startTime
          };
        }
        this.performanceMetrics.cacheMisses++;
      }

      // Select optimal provider
      const selectedProvider = await this.selectOptimalProvider(request);
      if (!selectedProvider) {
        throw new Error('No available AI providers for this request type');
      }

      // Execute request with selected provider
      const response = await this.executeWithProvider(selectedProvider, request);
      
      // Update provider metrics
      this.updateProviderMetrics(selectedProvider.id, true, response.responseTime);
      
      // Cache response if applicable
      if (request.cacheable !== false && response.confidence > 0.8) {
        this.cacheResponse(request, response);
      }

      // Track analytics
      analyticsService.trackEvent('ai_request_completed', {
        providerId: selectedProvider.id,
        requestType: request.type,
        responseTime: response.responseTime,
        tokensUsed: response.tokensUsed,
        cached: false
      });

      recordMetric('ai_request_success', 1, 'count', 'ai_performance');
      recordMetric('ai_response_time', response.responseTime, 'ms', 'ai_performance');

      return response;

    } catch (error) {
      logger.log('error', 'AI request failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        request: { type: request.type, priority: request.priority }
      }, 'MULTI_AI');

      recordMetric('ai_request_failure', 1, 'count', 'ai_performance');
      throw error;
    }
  }

  /**
   * 🚀 WEEK 7: Intelligent provider selection algorithm
   */
  private async selectOptimalProvider(request: AIRequest): Promise<AIProvider | null> {
    const candidates = Array.from(this.providers.values())
      .filter(p => p.isAvailable && p.type === request.type)
      .filter(p => !this.isCircuitBreakerOpen(p.id))
      .filter(p => p.maxTokens >= (request.maxTokens || 1000));

    if (candidates.length === 0) {
      return null;
    }

    // 🚀 WEEK 7: Advanced selection criteria
    const scored = candidates.map(provider => {
      let score = 0;

      // Health score (40% weight)
      score += provider.healthScore * 0.4;

      // Response time (25% weight) - inverse scoring
      const timeScore = Math.max(0, 100 - (provider.avgResponseTime / 50));
      score += timeScore * 0.25;

      // Success rate (20% weight)
      score += provider.successRate * 100 * 0.2;

      // Priority (10% weight)
      score += provider.priority * 10 * 0.1;

      // Load balancing (5% weight) - prefer less loaded providers
      const currentLoad = this.loadBalancer.get(provider.id) || 0;
      const loadScore = Math.max(0, 100 - currentLoad);
      score += loadScore * 0.05;

      // Request priority adjustment
      if (request.priority === 'critical') {
        score += provider.priority * 5; // Boost high-priority providers
      }

      // Cost consideration for non-critical requests
      if (request.priority === 'low') {
        const costScore = Math.max(0, 100 - (provider.costPerToken * 10000));
        score += costScore * 0.1;
      }

      return { provider, score };
    });

    // Sort by score and select the best
    scored.sort((a, b) => b.score - a.score);
    
    const selected = scored[0].provider;
    
    logger.log('debug', 'Provider selected', {
      providerId: selected.id,
      score: scored[0].score,
      alternatives: scored.slice(1, 3).map(s => ({ id: s.provider.id, score: s.score }))
    }, 'MULTI_AI');

    return selected;
  }

  /**
   * 🚀 WEEK 7: Execute request with specific provider
   */
  private async executeWithProvider(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();
    
    // Update load balancer
    const currentLoad = this.loadBalancer.get(provider.id) || 0;
    this.loadBalancer.set(provider.id, currentLoad + 1);

    try {
      let content: string;
      let tokensUsed = 0;

      // Route to appropriate service based on provider
      if (provider.id.startsWith('gemini')) {
        const result = await geminiService.generateText(request.prompt, {
          maxTokens: request.maxTokens,
          temperature: request.temperature
        });
        content = result.text;
        tokensUsed = result.tokensUsed || content.length / 4; // Estimate if not provided
      } else {
        throw new Error(`Provider ${provider.id} not implemented`);
      }

      const responseTime = performance.now() - startTime;

      return {
        providerId: provider.id,
        content,
        tokensUsed,
        responseTime,
        cached: false,
        confidence: this.calculateConfidence(content, responseTime, provider),
        cost: tokensUsed * provider.costPerToken,
        metadata: {
          provider: provider.name,
          model: provider.id,
          requestType: request.type,
          priority: request.priority
        }
      };

    } finally {
      // Decrease load
      const currentLoad = this.loadBalancer.get(provider.id) || 1;
      this.loadBalancer.set(provider.id, Math.max(0, currentLoad - 1));
    }
  }

  /**
   * 🚀 WEEK 7: Response confidence calculation
   */
  private calculateConfidence(content: string, responseTime: number, provider: AIProvider): number {
    let confidence = 0.8; // Base confidence

    // Content quality indicators
    if (content.length > 100) confidence += 0.1;
    if (content.includes('\n') && content.length > 200) confidence += 0.05;
    
    // Provider reliability
    confidence += (provider.successRate - 0.8) * 0.5;
    
    // Response time factor
    if (responseTime < provider.avgResponseTime * 0.8) confidence += 0.05;
    if (responseTime > provider.avgResponseTime * 1.5) confidence -= 0.1;

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * 🚀 WEEK 7: Cache management
   */
  private generateCacheKey(request: AIRequest): string {
    const key = {
      type: request.type,
      prompt: request.prompt.substring(0, 1000), // Limit key size
      maxTokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7
    };
    return btoa(JSON.stringify(key)).replace(/[+/=]/g, '');
  }

  private getCachedResponse(request: AIRequest): CacheEntry | null {
    const key = this.generateCacheKey(request);
    const entry = this.responseCache.get(key);
    
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.responseCache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry;
  }

  private cacheResponse(request: AIRequest, response: AIResponse): void {
    const key = this.generateCacheKey(request);
    const size = JSON.stringify(response).length;
    
    // Don't cache if too large
    if (size > 100000) return; // 100KB limit

    const ttl = this.calculateCacheTTL(request, response);
    
    this.responseCache.set(key, {
      key,
      response,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size
    });

    // Prevent cache from growing too large
    if (this.responseCache.size > 1000) {
      this.evictOldestCacheEntries();
    }
  }

  private calculateCacheTTL(request: AIRequest, response: AIResponse): number {
    let ttl = 60000; // Base 1 minute

    // Longer TTL for high confidence responses
    if (response.confidence > 0.9) ttl *= 5;
    if (response.confidence > 0.95) ttl *= 2;

    // Shorter TTL for time-sensitive content
    if (request.type === 'analysis') ttl /= 2;
    
    // Longer TTL for creative content
    if (request.type === 'creative') ttl *= 3;

    return ttl;
  }

  /**
   * 🚀 WEEK 7: Circuit breaker pattern
   */
  private isCircuitBreakerOpen(providerId: string): boolean {
    const breaker = this.circuitBreakers.get(providerId);
    if (!breaker) return false;

    if (breaker.isOpen) {
      // Check if reset timeout has passed
      if (Date.now() - breaker.lastFailure > breaker.resetTimeout) {
        breaker.isOpen = false;
        breaker.failures = 0;
        logger.log('info', 'Circuit breaker reset', { providerId }, 'MULTI_AI');
      }
    }

    return breaker.isOpen;
  }

  private updateProviderMetrics(providerId: string, success: boolean, responseTime: number): void {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    // Update response time (moving average)
    provider.avgResponseTime = (provider.avgResponseTime * 0.8) + (responseTime * 0.2);

    // Update success rate
    const newSuccess = success ? 1 : 0;
    provider.successRate = (provider.successRate * 0.9) + (newSuccess * 0.1);

    if (success) {
      // Reset circuit breaker on success
      const breaker = this.circuitBreakers.get(providerId);
      if (breaker) {
        breaker.failures = 0;
        breaker.isOpen = false;
      }
    } else {
      // Handle failure
      this.handleProviderFailure(providerId);
    }

    provider.lastUsed = Date.now();
  }

  private handleProviderFailure(providerId: string): void {
    let breaker = this.circuitBreakers.get(providerId);
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, isOpen: false, resetTimeout: 30000 };
      this.circuitBreakers.set(providerId, breaker);
    }

    breaker.failures++;
    breaker.lastFailure = Date.now();

    // Open circuit breaker after 3 failures
    if (breaker.failures >= 3) {
      breaker.isOpen = true;
      breaker.resetTimeout = Math.min(300000, 30000 * Math.pow(2, breaker.failures - 3)); // Exponential backoff
      
      logger.log('warn', 'Circuit breaker opened', {
        providerId,
        failures: breaker.failures,
        resetTimeout: breaker.resetTimeout
      }, 'MULTI_AI');
    }

    // Update failure metrics
    const currentFailures = this.performanceMetrics.providerFailures.get(providerId) || 0;
    this.performanceMetrics.providerFailures.set(providerId, currentFailures + 1);
  }

  /**
   * 🚀 WEEK 7: Monitoring and maintenance
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  private async performHealthChecks(): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        const startTime = performance.now();
        
        // Simple health check request
        await this.executeWithProvider(provider, {
          type: provider.type,
          prompt: 'Health check',
          priority: 'low',
          maxTokens: 10,
          cacheable: false
        });

        const responseTime = performance.now() - startTime;
        
        // Update health score based on response
        if (responseTime < provider.avgResponseTime * 1.2) {
          provider.healthScore = Math.min(100, provider.healthScore + 2);
        } else {
          provider.healthScore = Math.max(0, provider.healthScore - 5);
        }

        provider.isAvailable = true;

    } catch (error) {
        provider.healthScore = Math.max(0, provider.healthScore - 10);
        if (provider.healthScore < 20) {
          provider.isAvailable = false;
        }
        
        logger.log('warn', 'Provider health check failed', {
          providerId: provider.id,
          healthScore: provider.healthScore,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'MULTI_AI');
      }
    }
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Every 5 minutes
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.responseCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.responseCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.log('debug', 'Cache cleanup completed', {
        entriesRemoved: cleanedCount,
        cacheSize: this.responseCache.size
      }, 'MULTI_AI');
    }
  }

  private evictOldestCacheEntries(): void {
    const entries = Array.from(this.responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.responseCache.delete(entries[i][0]);
    }
  }

  private initializeProviders(): void {
    AI_PROVIDERS.forEach(provider => {
      this.providers.set(provider.id, { ...provider });
      this.loadBalancer.set(provider.id, 0);
    });
  }

  /**
   * 🚀 WEEK 7: Analytics and reporting
   */
  getPerformanceMetrics() {
    const cacheHitRate = this.performanceMetrics.totalRequests > 0 
      ? this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests 
      : 0;

    return {
      ...this.performanceMetrics,
      cacheHitRate,
      activeProviders: Array.from(this.providers.values()).filter(p => p.isAvailable).length,
      totalProviders: this.providers.size,
      cacheSize: this.responseCache.size,
      circuitBreakersOpen: Array.from(this.circuitBreakers.values()).filter(b => b.isOpen).length
    };
  }

  getProviderStatus() {
    return Array.from(this.providers.values()).map(provider => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      isAvailable: provider.isAvailable,
      healthScore: provider.healthScore,
      avgResponseTime: provider.avgResponseTime,
      successRate: provider.successRate,
      currentLoad: this.loadBalancer.get(provider.id) || 0,
      circuitBreakerOpen: this.isCircuitBreakerOpen(provider.id),
      lastUsed: provider.lastUsed
    }));
  }
}

// 🚀 WEEK 7: Export enhanced orchestrator
export const multiAIOrchestrator = new AdvancedMultiAIOrchestrator();

// Backward compatibility wrapper
export const multiAIService = {
  async generateText(prompt: string, options: any = {}) {
    return await multiAIOrchestrator.processRequest({
      type: 'text-generation',
      prompt,
      priority: options.priority || 'medium',
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      cacheable: options.cacheable
    });
  },

  async generateCode(prompt: string, options: any = {}) {
    return await multiAIOrchestrator.processRequest({
      type: 'code-generation', 
      prompt,
      priority: options.priority || 'medium',
      maxTokens: options.maxTokens,
      temperature: options.temperature || 0.3,
      cacheable: options.cacheable
    });
  },

  getMetrics() {
    return multiAIOrchestrator.getPerformanceMetrics();
  },

  getProviders() {
    return multiAIOrchestrator.getProviderStatus();
  }
}; 