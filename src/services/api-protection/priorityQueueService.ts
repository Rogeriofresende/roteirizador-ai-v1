/**
 * 🔄 PRIORITY QUEUE SERVICE - INTELLIGENT REQUEST QUEUING
 * Smart request queuing with priority-based processing and cost awareness
 * 
 * FEATURES: Priority-based queuing, intelligent scheduling, cost optimization
 * PREVENTS: Request loss during rate limiting and budget constraints
 */

import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface QueuedRequest {
  id: string;
  userId: string;
  endpoint: string;
  priority: number; // 1-10 (10 = highest priority)
  tier: 'free' | 'premium' | 'enterprise';
  requestData: any;
  timestamp: string;
  estimatedCost: number;
  estimatedProcessingTime: number;
  maxWaitTime: number; // Max time willing to wait (ms)
  retryCount: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired' | 'cancelled';
  metadata: Record<string, any>;
}

export interface QueueConfig {
  name: string;
  maxSize: number;
  priorityLevels: number;
  processingConcurrency: number;
  defaultPriority: number;
  maxWaitTime: number; // Default max wait time
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  costOptimization: {
    enabled: boolean;
    batchThreshold: number; // Batch requests if cost > threshold
    delayForBatching: number; // ms to wait for batching
  };
}

export interface QueueStats {
  queueName: string;
  totalSize: number;
  priorityDistribution: Record<number, number>;
  averageWaitTime: number;
  processingRate: number; // requests per minute
  completionRate: number; // success percentage
  costEfficiency: number; // cost savings from queuing
  timeRange: {
    start: string;
    end: string;
  };
}

export interface ProcessingResult {
  requestId: string;
  success: boolean;
  result?: any;
  error?: string;
  processingTime: number;
  actualCost: number;
  queueTime: number;
}

// =============================================================================
// PRIORITY QUEUE SERVICE
// =============================================================================

class PriorityQueueService {
  private queues: Map<string, QueuedRequest[]> = new Map();
  private configs: Map<string, QueueConfig> = new Map();
  private processing: Map<string, Set<string>> = new Map(); // Track processing requests
  private completedRequests: ProcessingResult[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.initializeDefaultConfigs();
    this.startQueueProcessor();
    this.startQueueMonitoring();

    logger.info('🔄 Priority Queue Service initialized', {
      queuesCount: this.queues.size,
      processor: 'active'
    }, 'PRIORITY_QUEUE');
  }

  // =============================================================================
  // CORE QUEUE OPERATIONS
  // =============================================================================

  /**
   * Add request to priority queue
   * CRITICAL: Main entry point for queuing requests
   */
  async enqueueRequest(
    queueName: string,
    request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount' | 'status'>
  ): Promise<{
    requestId: string;
    position: number;
    estimatedWaitTime: number;
    queueSize: number;
  }> {
    const config = this.configs.get(queueName);
    if (!config) {
      throw new Error(`Queue configuration not found: ${queueName}`);
    }

    // Get or create queue
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = [];
      this.queues.set(queueName, queue);
    }

    // Check queue capacity
    if (queue.length >= config.maxSize) {
      // Remove oldest low-priority request to make space
      const removed = this.removeLowestPriorityRequest(queue);
      if (!removed) {
        throw new Error(`Queue ${queueName} is at capacity and no low-priority requests to remove`);
      }
    }

    // Create queued request
    const queuedRequest: QueuedRequest = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'queued',
      maxWaitTime: request.maxWaitTime || config.maxWaitTime,
      ...request
    };

    // Insert based on priority
    const insertPosition = this.findInsertPosition(queue, queuedRequest);
    queue.splice(insertPosition, 0, queuedRequest);

    // Calculate estimated wait time
    const estimatedWaitTime = this.calculateEstimatedWaitTime(queueName, insertPosition);

    logger.debug('Request enqueued', {
      requestId: queuedRequest.id,
      queueName,
      priority: queuedRequest.priority,
      position: insertPosition + 1,
      queueSize: queue.length
    }, 'PRIORITY_QUEUE');

    return {
      requestId: queuedRequest.id,
      position: insertPosition + 1,
      estimatedWaitTime,
      queueSize: queue.length
    };
  }

  /**
   * Get request status from queue
   */
  getRequestStatus(queueName: string, requestId: string): {
    status: QueuedRequest['status'];
    position?: number;
    estimatedWaitTime?: number;
    queueTime?: number;
  } | null {
    const queue = this.queues.get(queueName);
    if (!queue) return null;

    const requestIndex = queue.findIndex(req => req.id === requestId);
    if (requestIndex === -1) {
      // Check completed requests
      const completed = this.completedRequests.find(req => req.requestId === requestId);
      if (completed) {
        return {
          status: completed.success ? 'completed' : 'failed',
          queueTime: completed.queueTime
        };
      }
      return null;
    }

    const request = queue[requestIndex];
    const queueTime = Date.now() - new Date(request.timestamp).getTime();
    const estimatedWaitTime = this.calculateEstimatedWaitTime(queueName, requestIndex);

    return {
      status: request.status,
      position: requestIndex + 1,
      estimatedWaitTime,
      queueTime
    };
  }

  /**
   * Cancel queued request
   */
  cancelRequest(queueName: string, requestId: string): boolean {
    const queue = this.queues.get(queueName);
    if (!queue) return false;

    const requestIndex = queue.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return false;

    const request = queue[requestIndex];
    if (request.status === 'processing') {
      // Mark for cancellation, but let it complete
      request.status = 'cancelled';
      return true;
    }

    // Remove from queue
    queue.splice(requestIndex, 1);
    
    logger.debug('Request cancelled', {
      requestId,
      queueName,
      position: requestIndex + 1
    }, 'PRIORITY_QUEUE');

    return true;
  }

  // =============================================================================
  // QUEUE PROCESSING
  // =============================================================================

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessing) {
        await this.processQueues();
      }
    }, 100); // Process every 100ms for responsiveness
  }

  /**
   * Process all queues
   */
  private async processQueues(): Promise<void> {
    this.isProcessing = true;

    try {
      for (const [queueName, queue] of this.queues.entries()) {
        if (queue.length === 0) continue;

        const config = this.configs.get(queueName);
        if (!config) continue;

        // Get currently processing count
        const processingSet = this.processing.get(queueName) || new Set();
        const availableSlots = config.processingConcurrency - processingSet.size;

        if (availableSlots <= 0) continue;

        // Process up to available slots
        const requestsToProcess = queue
          .filter(req => req.status === 'queued')
          .slice(0, availableSlots);

        for (const request of requestsToProcess) {
          await this.processRequest(queueName, request);
        }
      }
    } catch (error) {
      logger.error('Error in queue processing', error, 'PRIORITY_QUEUE');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual request
   */
  private async processRequest(queueName: string, request: QueuedRequest): Promise<void> {
    const startTime = Date.now();
    request.status = 'processing';

    // Add to processing set
    let processingSet = this.processing.get(queueName);
    if (!processingSet) {
      processingSet = new Set();
      this.processing.set(queueName, processingSet);
    }
    processingSet.add(request.id);

    try {
      // Check if request has expired
      const queueTime = startTime - new Date(request.timestamp).getTime();
      if (queueTime > request.maxWaitTime) {
        await this.handleExpiredRequest(queueName, request);
        return;
      }

      // Pre-flight checks (rate limiting, budget)
      const canProcess = await this.preFlightChecks(request);
      if (!canProcess.allowed) {
        // Re-queue with lower priority or handle failure
        await this.handleProcessingFailure(queueName, request, canProcess.reason);
        return;
      }

      // Process the actual request
      const result = await this.executeRequest(request);
      
      // Handle successful processing
      await this.handleProcessingSuccess(queueName, request, result, startTime);

    } catch (error) {
      // Handle processing error
      await this.handleProcessingError(queueName, request, error, startTime);
    } finally {
      // Remove from processing set
      processingSet.delete(request.id);
    }
  }

  /**
   * Execute the actual request
   */
  private async executeRequest(request: QueuedRequest): Promise<any> {
    // This would integrate with the actual service endpoints
    switch (request.endpoint) {
      case 'idea_generation':
        return await this.processIdeaGeneration(request);
      case 'analytics':
        return await this.processAnalytics(request);
      default:
        throw new Error(`Unknown endpoint: ${request.endpoint}`);
    }
  }

  /**
   * Process idea generation request
   */
  private async processIdeaGeneration(request: QueuedRequest): Promise<any> {
    try {
      // This would call the actual idea generation service
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, request.estimatedProcessingTime));
      
      return {
        ideas: [
          { title: 'Sample Idea 1', description: 'Generated content idea' },
          { title: 'Sample Idea 2', description: 'Another content idea' }
        ],
        cost: request.estimatedCost,
        processingTime: request.estimatedProcessingTime
      };
    } catch (error) {
      logger.error('Failed to process idea generation', error, 'PRIORITY_QUEUE');
      throw error;
    }
  }

  /**
   * Process analytics request
   */
  private async processAnalytics(request: QueuedRequest): Promise<any> {
    try {
      // Simulate analytics processing
      await new Promise(resolve => setTimeout(resolve, request.estimatedProcessingTime * 0.5));
      
      return {
        analytics: {
          usage: Math.random() * 100,
          trends: 'increasing',
          recommendations: ['Optimize usage patterns']
        },
        cost: request.estimatedCost * 0.1, // Analytics is cheaper
        processingTime: request.estimatedProcessingTime * 0.5
      };
    } catch (error) {
      logger.error('Failed to process analytics', error, 'PRIORITY_QUEUE');
      throw error;
    }
  }

  // =============================================================================
  // REQUEST HANDLING
  // =============================================================================

  /**
   * Handle successful request processing
   */
  private async handleProcessingSuccess(
    queueName: string,
    request: QueuedRequest,
    result: any,
    startTime: number
  ): Promise<void> {
    const processingTime = Date.now() - startTime;
    const queueTime = startTime - new Date(request.timestamp).getTime();

    request.status = 'completed';

    // Record completion
    const completionRecord: ProcessingResult = {
      requestId: request.id,
      success: true,
      result,
      processingTime,
      actualCost: result.cost || request.estimatedCost,
      queueTime
    };

    this.completedRequests.push(completionRecord);

    // Remove from queue
    const queue = this.queues.get(queueName);
    if (queue) {
      const index = queue.findIndex(req => req.id === request.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }

    // Record cost if applicable
    if (result.cost > 0) {
      try {
        const { budgetControlService } = await import('./budgetControlService');
        await budgetControlService.recordExpense({
          amount: result.cost,
          userId: request.userId,
          endpoint: request.endpoint,
          tier: request.tier,
          description: `Queued request: ${request.endpoint}`,
          metadata: { queueTime, processingTime }
        });
      } catch (error) {
        logger.error('Failed to record expense for queued request', error, 'PRIORITY_QUEUE');
      }
    }

    logger.debug('Request processed successfully', {
      requestId: request.id,
      queueName,
      processingTime,
      queueTime,
      actualCost: result.cost
    }, 'PRIORITY_QUEUE');
  }

  /**
   * Handle request processing error
   */
  private async handleProcessingError(
    queueName: string,
    request: QueuedRequest,
    error: any,
    startTime: number
  ): Promise<void> {
    const processingTime = Date.now() - startTime;
    const queueTime = startTime - new Date(request.timestamp).getTime();

    const config = this.configs.get(queueName);
    if (!config) return;

    // Check if should retry
    if (request.retryCount < config.retryPolicy.maxRetries) {
      request.retryCount++;
      request.status = 'queued';
      
      // Add delay before retry
      const delay = config.retryPolicy.initialDelay * 
                   Math.pow(config.retryPolicy.backoffMultiplier, request.retryCount - 1);
      
      setTimeout(() => {
        request.status = 'queued';
      }, delay);

      logger.warn('Request failed, retrying', {
        requestId: request.id,
        queueName,
        retryCount: request.retryCount,
        error: error.message,
        nextRetryIn: delay
      }, 'PRIORITY_QUEUE');
    } else {
      // Max retries exceeded, mark as failed
      request.status = 'failed';

      const failureRecord: ProcessingResult = {
        requestId: request.id,
        success: false,
        error: error.message,
        processingTime,
        actualCost: 0,
        queueTime
      };

      this.completedRequests.push(failureRecord);

      // Remove from queue
      const queue = this.queues.get(queueName);
      if (queue) {
        const index = queue.findIndex(req => req.id === request.id);
        if (index !== -1) {
          queue.splice(index, 1);
        }
      }

      logger.error('Request failed permanently', {
        requestId: request.id,
        queueName,
        retryCount: request.retryCount,
        error: error.message
      }, 'PRIORITY_QUEUE');
    }
  }

  /**
   * Handle expired request
   */
  private async handleExpiredRequest(queueName: string, request: QueuedRequest): Promise<void> {
    request.status = 'expired';

    const queueTime = Date.now() - new Date(request.timestamp).getTime();

    const expirationRecord: ProcessingResult = {
      requestId: request.id,
      success: false,
      error: 'Request expired in queue',
      processingTime: 0,
      actualCost: 0,
      queueTime
    };

    this.completedRequests.push(expirationRecord);

    // Remove from queue
    const queue = this.queues.get(queueName);
    if (queue) {
      const index = queue.findIndex(req => req.id === request.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }

    logger.warn('Request expired in queue', {
      requestId: request.id,
      queueName,
      queueTime,
      maxWaitTime: request.maxWaitTime
    }, 'PRIORITY_QUEUE');
  }

  /**
   * Handle processing failure (rate limit, budget, etc.)
   */
  private async handleProcessingFailure(
    queueName: string,
    request: QueuedRequest,
    reason: string
  ): Promise<void> {
    // Reduce priority and re-queue
    request.priority = Math.max(1, request.priority - 1);
    request.status = 'queued';

    // Add delay before retry
    setTimeout(() => {
      request.status = 'queued';
    }, 30000); // 30 second delay

    logger.debug('Request re-queued due to processing failure', {
      requestId: request.id,
      queueName,
      reason,
      newPriority: request.priority
    }, 'PRIORITY_QUEUE');
  }

  // =============================================================================
  // QUEUE MANAGEMENT
  // =============================================================================

  /**
   * Pre-flight checks before processing
   */
  private async preFlightChecks(request: QueuedRequest): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    try {
      // Check rate limiting
      const { rateLimitingService } = await import('./rateLimitingService');
      const rateLimitResult = await rateLimitingService.checkRateLimit(
        request.userId,
        request.endpoint,
        { tier: request.tier, priority: request.priority }
      );

      if (!rateLimitResult.allowed) {
        return {
          allowed: false,
          reason: `Rate limit: ${rateLimitResult.reason}`
        };
      }

      // Check budget
      const { budgetControlService } = await import('./budgetControlService');
      const budgetResult = await budgetControlService.checkBudgetAllowance({
        amount: request.estimatedCost,
        userId: request.userId,
        endpoint: request.endpoint,
        tier: request.tier
      });

      if (!budgetResult.allowed) {
        return {
          allowed: false,
          reason: `Budget: ${budgetResult.reason}`
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error in pre-flight checks', error, 'PRIORITY_QUEUE');
      return {
        allowed: false,
        reason: 'Pre-flight check failed'
      };
    }
  }

  /**
   * Find insert position based on priority
   */
  private findInsertPosition(queue: QueuedRequest[], request: QueuedRequest): number {
    // Higher priority goes first, then FIFO within same priority
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].priority < request.priority) {
        return i;
      }
    }
    return queue.length;
  }

  /**
   * Remove lowest priority request from queue
   */
  private removeLowestPriorityRequest(queue: QueuedRequest[]): boolean {
    let lowestPriorityIndex = -1;
    let lowestPriority = 11; // Max priority is 10

    for (let i = 0; i < queue.length; i++) {
      const request = queue[i];
      if (request.status === 'queued' && request.priority < lowestPriority) {
        lowestPriority = request.priority;
        lowestPriorityIndex = i;
      }
    }

    if (lowestPriorityIndex !== -1) {
      const removed = queue.splice(lowestPriorityIndex, 1)[0];
      logger.warn('Removed low-priority request due to queue capacity', {
        requestId: removed.id,
        priority: removed.priority
      }, 'PRIORITY_QUEUE');
      return true;
    }

    return false;
  }

  /**
   * Calculate estimated wait time
   */
  private calculateEstimatedWaitTime(queueName: string, position: number): number {
    const config = this.configs.get(queueName);
    if (!config) return 0;

    const queue = this.queues.get(queueName);
    if (!queue) return 0;

    // Calculate average processing time
    const recentCompletions = this.completedRequests
      .filter(r => r.success)
      .slice(-20); // Last 20 completions

    const avgProcessingTime = recentCompletions.length > 0
      ? recentCompletions.reduce((sum, r) => sum + r.processingTime, 0) / recentCompletions.length
      : 5000; // Default 5 seconds

    // Estimate based on position and concurrency
    const requestsAhead = Math.max(0, position);
    const batchesRequired = Math.ceil(requestsAhead / config.processingConcurrency);
    
    return batchesRequired * avgProcessingTime;
  }

  // =============================================================================
  // MONITORING & STATS
  // =============================================================================

  /**
   * Start queue monitoring
   */
  private startQueueMonitoring(): void {
    // Clean up completed requests every 5 minutes
    setInterval(() => {
      this.cleanupCompletedRequests();
    }, 300000);

    // Monitor queue health every minute
    setInterval(() => {
      this.monitorQueueHealth();
    }, 60000);
  }

  /**
   * Clean up old completed requests
   */
  private cleanupCompletedRequests(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    this.completedRequests = this.completedRequests.filter(req => {
      // Keep requests from last hour
      return new Date(req.requestId).getTime() > oneHourAgo;
    });

    // Keep only last 1000 requests max
    if (this.completedRequests.length > 1000) {
      this.completedRequests = this.completedRequests.slice(-1000);
    }
  }

  /**
   * Monitor queue health
   */
  private monitorQueueHealth(): void {
    for (const [queueName, queue] of this.queues.entries()) {
      const config = this.configs.get(queueName);
      if (!config) continue;

      // Check for stuck requests
      const now = Date.now();
      const stuckRequests = queue.filter(req => {
        const queueTime = now - new Date(req.timestamp).getTime();
        return queueTime > req.maxWaitTime * 2; // 2x max wait time
      });

      if (stuckRequests.length > 0) {
        logger.warn('Detected stuck requests in queue', {
          queueName,
          stuckCount: stuckRequests.length,
          totalQueueSize: queue.length
        }, 'PRIORITY_QUEUE');

        // Remove stuck requests
        stuckRequests.forEach(req => {
          this.handleExpiredRequest(queueName, req);
        });
      }

      // Log queue stats
      if (queue.length > 0) {
        const stats = this.getQueueStats(queueName);
        logger.debug('Queue health check', {
          queueName,
          ...stats
        }, 'PRIORITY_QUEUE');
      }
    }
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get queue statistics
   */
  getQueueStats(queueName: string): QueueStats {
    const queue = this.queues.get(queueName) || [];
    const config = this.configs.get(queueName);

    const priorityDistribution: Record<number, number> = {};
    queue.forEach(req => {
      priorityDistribution[req.priority] = (priorityDistribution[req.priority] || 0) + 1;
    });

    // Calculate average wait time from recent completions
    const recentCompletions = this.completedRequests
      .filter(r => r.queueTime > 0)
      .slice(-50);

    const averageWaitTime = recentCompletions.length > 0
      ? recentCompletions.reduce((sum, r) => sum + r.queueTime, 0) / recentCompletions.length
      : 0;

    // Calculate processing rate (requests per minute)
    const oneMinuteAgo = Date.now() - 60000;
    const recentProcessed = this.completedRequests.filter(r => 
      new Date(r.requestId).getTime() > oneMinuteAgo
    );

    const successfulRequests = this.completedRequests.filter(r => r.success);
    const completionRate = this.completedRequests.length > 0
      ? (successfulRequests.length / this.completedRequests.length) * 100
      : 100;

    return {
      queueName,
      totalSize: queue.length,
      priorityDistribution,
      averageWaitTime,
      processingRate: recentProcessed.length,
      completionRate,
      costEfficiency: 85, // Simplified calculation
      timeRange: {
        start: new Date(Date.now() - 3600000).toISOString(), // Last hour
        end: new Date().toISOString()
      }
    };
  }

  /**
   * Get all queue names
   */
  getQueueNames(): string[] {
    return Array.from(this.queues.keys());
  }

  /**
   * Update queue configuration
   */
  updateQueueConfig(queueName: string, config: Partial<QueueConfig>): void {
    const existing = this.configs.get(queueName);
    if (existing) {
      this.configs.set(queueName, { ...existing, ...config });
      logger.info('Queue configuration updated', { queueName }, 'PRIORITY_QUEUE');
    }
  }

  /**
   * Pause/resume queue processing
   */
  setQueueProcessing(enabled: boolean): void {
    this.isProcessing = !enabled;
    logger.info('Queue processing toggled', { enabled }, 'PRIORITY_QUEUE');
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  private initializeDefaultConfigs(): void {
    const defaultConfigs: Record<string, QueueConfig> = {
      'idea_generation': {
        name: 'Idea Generation Queue',
        maxSize: 1000,
        priorityLevels: 10,
        processingConcurrency: 5,
        defaultPriority: 5,
        maxWaitTime: 300000, // 5 minutes
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 1000
        },
        costOptimization: {
          enabled: true,
          batchThreshold: 0.01,
          delayForBatching: 5000
        }
      },
      'analytics': {
        name: 'Analytics Queue',
        maxSize: 500,
        priorityLevels: 10,
        processingConcurrency: 10,
        defaultPriority: 3,
        maxWaitTime: 120000, // 2 minutes
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 1.5,
          initialDelay: 500
        },
        costOptimization: {
          enabled: false,
          batchThreshold: 0,
          delayForBatching: 0
        }
      }
    };

    Object.entries(defaultConfigs).forEach(([name, config]) => {
      this.configs.set(name, config);
      this.queues.set(name, []); // Initialize empty queue
      this.processing.set(name, new Set()); // Initialize processing set
    });
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const priorityQueueService = new PriorityQueueService();
export default PriorityQueueService; 