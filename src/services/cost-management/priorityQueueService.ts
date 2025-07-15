/**
 * Priority Queue Service - IA Alpha Task 2 Implementation
 * Intelligent request queuing system with cost awareness and tier prioritization
 * Manages API request flow based on user tiers, cost budgets, and system health
 * 
 * Features:
 * - Multi-tier priority queuing (Enterprise > Premium > Free)
 * - Cost-aware request processing
 * - Emergency queue management
 * - Load balancing and request optimization
 * - Real-time queue analytics
 * - Integration with Rate Limiting and Budget Control
 */

import { BudgetControlService } from './budgetControlService';
import { UsageTierService, UserTier } from '../risk-management/usageTierService';
import { EmergencyProtocolService } from '../risk-management/emergencyProtocolService';

// Queue Configuration Types
export interface QueueRequest {
  id: string;
  userId: string;
  type: 'idea_generation' | 'personalization' | 'referral' | 'analytics';
  priority: number; // 1-10, higher = more priority
  tier: UserTier;
  estimatedCost: number;
  estimatedDuration: number; // in milliseconds
  data: any;
  timestamp: Date;
  maxWaitTime: number; // maximum time to wait in queue
  retryCount: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
}

export interface QueueConfig {
  maxSize: number;
  maxWaitTime: number; // in milliseconds
  processingConcurrency: number;
  tierConcurrency: Record<UserTier, number>;
  priorityWeights: {
    tier: number;        // Weight for user tier
    cost: number;        // Weight for cost efficiency
    wait: number;        // Weight for wait time
    type: number;        // Weight for request type
  };
}

export interface QueueStats {
  totalRequests: number;
  activeRequests: number;
  queuedRequests: number;
  processedRequests: number;
  failedRequests: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  tierDistribution: Record<UserTier, number>;
  currentThroughput: number;
  queueHealth: 'healthy' | 'warning' | 'critical';
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  cost: number;
  duration: number;
  queueTime: number;
}

export class PriorityQueueService {
  private budgetControl: BudgetControlService;
  private usageTiers: UsageTierService;
  private emergencyProtocol: EmergencyProtocolService;
  
  // Queue storage
  private queues: Record<UserTier, QueueRequest[]> = {
    enterprise: [],
    premium: [],
    free: []
  };
  
  private processingRequests: Map<string, QueueRequest> = new Map();
  private completedRequests: Map<string, ProcessingResult> = new Map();
  
  // Queue configuration
  private config: QueueConfig = {
    maxSize: 1000,
    maxWaitTime: 300000, // 5 minutes
    processingConcurrency: 10,
    tierConcurrency: {
      enterprise: 5, // 50% of capacity
      premium: 3,    // 30% of capacity
      free: 2        // 20% of capacity
    },
    priorityWeights: {
      tier: 0.4,    // 40% weight for tier
      cost: 0.3,    // 30% weight for cost efficiency
      wait: 0.2,    // 20% weight for wait time
      type: 0.1     // 10% weight for request type
    }
  };

  // Request type priorities
  private typePriorities: Record<string, number> = {
    idea_generation: 8,  // High priority - core feature
    personalization: 6,  // Medium-high priority
    referral: 4,         // Medium priority
    analytics: 2         // Low priority - can be delayed
  };

  // Performance tracking
  private stats: QueueStats = {
    totalRequests: 0,
    activeRequests: 0,
    queuedRequests: 0,
    processedRequests: 0,
    failedRequests: 0,
    averageWaitTime: 0,
    averageProcessingTime: 0,
    tierDistribution: { enterprise: 0, premium: 0, free: 0 },
    currentThroughput: 0,
    queueHealth: 'healthy'
  };

  // Processing state
  private isProcessing = false;
  private lastProcessingTime = Date.now();
  
  private readonly STORAGE_KEY = 'roteirar_priority_queue';
  private readonly STATS_KEY = 'roteirar_queue_stats';

  constructor() {
    this.budgetControl = new BudgetControlService();
    this.usageTiers = new UsageTierService();
    this.emergencyProtocol = new EmergencyProtocolService();
    
    this.initializeQueueProcessing();
    this.loadPersistedData();
  }

  /**
   * Initialize queue processing system
   */
  private initializeQueueProcessing(): void {
    // Start queue processor
    this.startQueueProcessor();
    
    // Cleanup expired requests every minute
    setInterval(() => this.cleanupExpiredRequests(), 60000);
    
    // Update statistics every 30 seconds
    setInterval(() => this.updateStatistics(), 30000);
    
    // Persist data every 5 minutes
    setInterval(() => this.persistData(), 300000);
    
    // Health check every 2 minutes
    setInterval(() => this.performHealthCheck(), 120000);
  }

  /**
   * Add request to priority queue
   */
  public async enqueue(request: Omit<QueueRequest, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<{
    queued: boolean;
    queueId?: string;
    position?: number;
    estimatedWaitTime?: number;
    reason?: string;
  }> {
    // Check if queue is at capacity
    if (this.getTotalQueueSize() >= this.config.maxSize) {
      return {
        queued: false,
        reason: 'Queue at maximum capacity'
      };
    }

    // Check budget before queuing
    const budgetCheck = await this.budgetControl.canUserProceed(request.userId, request.estimatedCost);
    if (!budgetCheck.allowed) {
      return {
        queued: false,
        reason: budgetCheck.reason
      };
    }

    // Create full request object
    const queueRequest: QueueRequest = {
      ...request,
      id: this.generateRequestId(),
      timestamp: new Date(),
      status: 'queued',
      retryCount: 0,
      maxWaitTime: request.maxWaitTime || this.config.maxWaitTime
    };

    // Calculate priority score
    queueRequest.priority = this.calculatePriority(queueRequest);
    
    // Add to appropriate tier queue
    this.queues[request.tier].push(queueRequest);
    
    // Sort queue by priority
    this.queues[request.tier].sort((a, b) => b.priority - a.priority);
    
    // Update statistics
    this.stats.totalRequests++;
    this.stats.queuedRequests++;
    this.stats.tierDistribution[request.tier]++;
    
    // Get position and estimated wait time
    const position = this.getRequestPosition(queueRequest.id);
    const estimatedWaitTime = this.estimateWaitTime(queueRequest);
    
    console.log(`Request ${queueRequest.id} queued for user ${request.userId} (${request.tier}) - Position: ${position}, ETA: ${estimatedWaitTime}ms`);
    
    return {
      queued: true,
      queueId: queueRequest.id,
      position,
      estimatedWaitTime
    };
  }

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.processQueue();
  }

  /**
   * Process queue continuously
   */
  private async processQueue(): Promise<void> {
    while (this.isProcessing) {
      try {
        // Check if we can process more requests
        if (this.processingRequests.size >= this.config.processingConcurrency) {
          await this.sleep(1000); // Wait 1 second before checking again
          continue;
        }

        // Get next request to process
        const nextRequest = this.getNextRequest();
        if (!nextRequest) {
          await this.sleep(2000); // Wait 2 seconds if no requests
          continue;
        }

        // Process the request
        await this.processRequest(nextRequest);
        
      } catch (error) {
        console.error('Error in queue processor:', error);
        await this.sleep(5000); // Wait 5 seconds on error
      }
    }
  }

  /**
   * Get next request to process based on priorities
   */
  private getNextRequest(): QueueRequest | null {
    // Check each tier in priority order
    const tierOrder: UserTier[] = ['enterprise', 'premium', 'free'];
    
    for (const tier of tierOrder) {
      // Check if tier has capacity
      const tierProcessing = Array.from(this.processingRequests.values())
        .filter(req => req.tier === tier).length;
      
      if (tierProcessing >= this.config.tierConcurrency[tier]) {
        continue; // Tier at capacity
      }
      
      // Get highest priority request from tier
      const queue = this.queues[tier];
      if (queue.length > 0) {
        const request = queue.shift()!;
        this.stats.queuedRequests--;
        return request;
      }
    }
    
    return null;
  }

  /**
   * Process individual request
   */
  private async processRequest(request: QueueRequest): Promise<void> {
    const startTime = Date.now();
    request.status = 'processing';
    this.processingRequests.set(request.id, request);
    this.stats.activeRequests++;
    
    try {
      // Final budget check before processing
      const budgetCheck = await this.budgetControl.canUserProceed(request.userId, request.estimatedCost);
      if (!budgetCheck.allowed) {
        throw new Error(`Budget exceeded: ${budgetCheck.reason}`);
      }

      // Simulate API processing based on request type
      const result = await this.executeRequest(request);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      const queueTime = startTime - request.timestamp.getTime();
      
      // Store result
      const processResult: ProcessingResult = {
        success: true,
        data: result,
        cost: request.estimatedCost, // In real implementation, get actual cost
        duration: processingTime,
        queueTime
      };
      
      this.completedRequests.set(request.id, processResult);
      request.status = 'completed';
      
      // Update statistics
      this.stats.processedRequests++;
      this.updateAverageProcessingTime(processingTime);
      this.updateAverageWaitTime(queueTime);
      
      console.log(`Request ${request.id} completed in ${processingTime}ms (queued for ${queueTime}ms)`);
      
    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      const queueTime = startTime - request.timestamp.getTime();
      
      request.status = 'failed';
      this.stats.failedRequests++;
      
      // Store error result
      const errorResult: ProcessingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0,
        duration: processingTime,
        queueTime
      };
      
      this.completedRequests.set(request.id, errorResult);
      
      // Check if we should retry
      if (request.retryCount < 3 && this.shouldRetry(error)) {
        request.retryCount++;
        request.status = 'queued';
        request.priority += 1; // Increase priority for retry
        this.queues[request.tier].push(request);
        this.queues[request.tier].sort((a, b) => b.priority - a.priority);
        this.stats.queuedRequests++;
        console.log(`Request ${request.id} retrying (attempt ${request.retryCount})`);
      }
      
      console.error(`Request ${request.id} failed:`, error);
    } finally {
      this.processingRequests.delete(request.id);
      this.stats.activeRequests--;
    }
  }

  /**
   * Execute the actual request
   */
  private async executeRequest(request: QueueRequest): Promise<any> {
    // Simulate different processing times and behaviors based on request type
    switch (request.type) {
      case 'idea_generation':
        await this.sleep(2000 + Math.random() * 3000); // 2-5 seconds
        return { idea: 'Generated creative idea', tokens: Math.floor(Math.random() * 1000) + 500 };
        
      case 'personalization':
        await this.sleep(1000 + Math.random() * 2000); // 1-3 seconds
        return { preferences: 'Updated user preferences', insights: ['insight1', 'insight2'] };
        
      case 'referral':
        await this.sleep(500 + Math.random() * 1000); // 0.5-1.5 seconds
        return { referralCode: 'REF123', points: Math.floor(Math.random() * 100) };
        
      case 'analytics':
        await this.sleep(3000 + Math.random() * 2000); // 3-5 seconds
        return { metrics: { views: 100, clicks: 25 }, reports: ['report1'] };
        
      default:
        await this.sleep(1000);
        return { status: 'processed' };
    }
  }

  /**
   * Calculate priority score for request
   */
  private calculatePriority(request: QueueRequest): number {
    const weights = this.config.priorityWeights;
    
    // Tier priority (enterprise=10, premium=6, free=2)
    const tierScore = request.tier === 'enterprise' ? 10 : 
                     request.tier === 'premium' ? 6 : 2;
    
    // Cost efficiency (lower cost = higher priority)
    const costScore = Math.max(1, 10 - (request.estimatedCost * 100));
    
    // Wait time (longer wait = higher priority)
    const waitTime = Date.now() - request.timestamp.getTime();
    const waitScore = Math.min(10, waitTime / (60 * 1000)); // 1 point per minute
    
    // Type priority
    const typeScore = this.typePriorities[request.type] || 5;
    
    // Calculate weighted score
    const priority = (
      tierScore * weights.tier +
      costScore * weights.cost +
      waitScore * weights.wait +
      typeScore * weights.type
    );
    
    return Math.round(priority * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get request position in queue
   */
  private getRequestPosition(requestId: string): number {
    let position = 1;
    
    for (const tier of ['enterprise', 'premium', 'free'] as UserTier[]) {
      const queue = this.queues[tier];
      const index = queue.findIndex(req => req.id === requestId);
      if (index !== -1) {
        return position + index;
      }
      position += queue.length;
    }
    
    return -1; // Not found
  }

  /**
   * Estimate wait time for request
   */
  private estimateWaitTime(request: QueueRequest): number {
    const position = this.getRequestPosition(request.id);
    if (position === -1) return 0;
    
    const avgProcessingTime = this.stats.averageProcessingTime || 3000;
    const concurrency = this.config.processingConcurrency;
    
    return Math.ceil(position / concurrency) * avgProcessingTime;
  }

  /**
   * Get request status
   */
  public async getRequestStatus(requestId: string): Promise<{
    status: QueueRequest['status'];
    position?: number;
    estimatedWaitTime?: number;
    result?: ProcessingResult;
  } | null> {
    // Check if completed
    const result = this.completedRequests.get(requestId);
    if (result) {
      return { status: 'completed', result };
    }
    
    // Check if processing
    const processing = this.processingRequests.get(requestId);
    if (processing) {
      return { status: 'processing' };
    }
    
    // Check if queued
    for (const tier of ['enterprise', 'premium', 'free'] as UserTier[]) {
      const queue = this.queues[tier];
      const request = queue.find(req => req.id === requestId);
      if (request) {
        const position = this.getRequestPosition(requestId);
        const estimatedWaitTime = this.estimateWaitTime(request);
        return { status: 'queued', position, estimatedWaitTime };
      }
    }
    
    return null; // Not found
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(): QueueStats {
    this.updateStatistics();
    return { ...this.stats };
  }

  /**
   * Get detailed queue information
   */
  public getQueueInfo(): {
    queues: Record<UserTier, number>;
    processing: number;
    completed: number;
    health: string;
    throughput: number;
  } {
    return {
      queues: {
        enterprise: this.queues.enterprise.length,
        premium: this.queues.premium.length,
        free: this.queues.free.length
      },
      processing: this.processingRequests.size,
      completed: this.completedRequests.size,
      health: this.stats.queueHealth,
      throughput: this.stats.currentThroughput
    };
  }

  /**
   * Emergency queue management
   */
  public async handleEmergencyMode(mode: 'circuit_breaker' | 'degraded' | 'minimal'): Promise<void> {
    switch (mode) {
      case 'circuit_breaker':
        // Clear all queues except enterprise
        this.queues.free = [];
        this.queues.premium = [];
        this.config.processingConcurrency = 2;
        break;
        
      case 'degraded':
        // Reduce capacity and prioritize essential requests
        this.config.processingConcurrency = 5;
        this.config.tierConcurrency.free = 1;
        break;
        
      case 'minimal':
        // Minimum operation mode
        this.config.processingConcurrency = 3;
        this.config.tierConcurrency.free = 0;
        this.config.tierConcurrency.premium = 1;
        break;
    }
    
    console.log(`Queue emergency mode activated: ${mode}`);
  }

  // Helper methods
  private getTotalQueueSize(): number {
    return this.queues.enterprise.length + this.queues.premium.length + this.queues.free.length;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(error: any): boolean {
    // Define retry logic based on error type
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return !message.includes('budget') && !message.includes('unauthorized');
    }
    return false;
  }

  private cleanupExpiredRequests(): void {
    const now = Date.now();
    
    for (const tier of ['enterprise', 'premium', 'free'] as UserTier[]) {
      this.queues[tier] = this.queues[tier].filter(req => {
        const expired = (now - req.timestamp.getTime()) > req.maxWaitTime;
        if (expired) {
          req.status = 'expired';
          this.stats.failedRequests++;
          this.stats.queuedRequests--;
        }
        return !expired;
      });
    }
    
    // Cleanup old completed requests (keep last 1000)
    if (this.completedRequests.size > 1000) {
      const entries = Array.from(this.completedRequests.entries());
      entries.sort((a, b) => b[1].duration - a[1].duration);
      this.completedRequests.clear();
      entries.slice(0, 1000).forEach(([id, result]) => {
        this.completedRequests.set(id, result);
      });
    }
  }

  private updateStatistics(): void {
    const totalQueued = this.getTotalQueueSize();
    this.stats.queuedRequests = totalQueued;
    this.stats.activeRequests = this.processingRequests.size;
    
    // Calculate throughput (requests per minute)
    const timeSinceLastUpdate = Date.now() - this.lastProcessingTime;
    if (timeSinceLastUpdate > 0) {
      this.stats.currentThroughput = (this.stats.processedRequests * 60000) / timeSinceLastUpdate;
    }
    
    // Determine queue health
    if (totalQueued > this.config.maxSize * 0.8) {
      this.stats.queueHealth = 'critical';
    } else if (totalQueued > this.config.maxSize * 0.6) {
      this.stats.queueHealth = 'warning';
    } else {
      this.stats.queueHealth = 'healthy';
    }
  }

  private updateAverageProcessingTime(duration: number): void {
    const total = this.stats.averageProcessingTime * (this.stats.processedRequests - 1) + duration;
    this.stats.averageProcessingTime = total / this.stats.processedRequests;
  }

  private updateAverageWaitTime(waitTime: number): void {
    const total = this.stats.averageWaitTime * (this.stats.processedRequests - 1) + waitTime;
    this.stats.averageWaitTime = total / this.stats.processedRequests;
  }

  private performHealthCheck(): void {
    const stats = this.getQueueStats();
    
    if (stats.queueHealth === 'critical') {
      this.emergencyProtocol.triggerEmergency('system_overload', {
        queueSize: this.getTotalQueueSize(),
        processingRequests: this.processingRequests.size,
        averageWaitTime: stats.averageWaitTime
      });
    }
  }

  private persistData(): void {
    const data = {
      queues: this.queues,
      stats: this.stats,
      config: this.config
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private loadPersistedData(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.queues = data.queues || this.queues;
        this.stats = { ...this.stats, ...data.stats };
        this.config = { ...this.config, ...data.config };
      } catch (error) {
        console.error('Error loading persisted queue data:', error);
      }
    }
  }
}

export default PriorityQueueService; 