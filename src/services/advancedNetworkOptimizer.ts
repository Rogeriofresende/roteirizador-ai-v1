/**
 * 🌐 ADVANCED NETWORK OPTIMIZER
 * Week 7 Day 4: Advanced network optimization strategies with intelligent routing, compression, and caching
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { analyticsService } from './analyticsService';
import { BackgroundProcessingService } from './backgroundProcessingService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface NetworkRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: any;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeout: number;
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
    retryCondition: (error: any) => boolean;
  };
  cacheConfig: {
    enabled: boolean;
    ttl: number;
    strategy: 'memory' | 'indexedDB' | 'both';
  };
}

interface ConnectionInfo {
  type: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  effectiveType: string;
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

interface NetworkMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  compressionSavings: number;
  cacheHitRate: number;
  retryRate: number;
  timeoutRate: number;
  throughput: number; // requests per second
}

// =============================================================================
// CONNECTION QUALITY MANAGER
// =============================================================================

class ConnectionQualityManager {
  private connectionInfo: ConnectionInfo = {
    type: 'unknown',
    effectiveType: 'unknown',
    downlink: 10,
    rtt: 100,
    saveData: false
  };
  
  private qualityHistory: Array<{
    timestamp: number;
    quality: number; // 0-1 score
    latency: number;
    bandwidth: number;
  }> = [];
  
  private adaptiveSettings = {
    timeout: 30000,
    maxRetries: 3,
    compressionThreshold: 1024,
    batchSize: 5,
    preloadEnabled: true
  };

  initialize(): void {
    this.updateConnectionInfo();
    this.setupConnectionMonitoring();
    this.startQualityAssessment();
  }

  private updateConnectionInfo(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.connectionInfo = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false
      };
      
      this.updateAdaptiveSettings();
    }
  }

  private setupConnectionMonitoring(): void {
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        this.updateConnectionInfo();
        logger.info('Network connection changed', this.connectionInfo, 'NETWORK_OPTIMIZER');
      });
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      logger.info('Network connection restored', {}, 'NETWORK_OPTIMIZER');
    });

    window.addEventListener('offline', () => {
      logger.warn('Network connection lost', {}, 'NETWORK_OPTIMIZER');
    });
  }

  private startQualityAssessment(): void {
    // Assess network quality every 30 seconds
    setInterval(() => {
      this.assessNetworkQuality();
    }, 30000);
  }

  private async assessNetworkQuality(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Ping a lightweight endpoint
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const latency = performance.now() - startTime;
      const quality = this.calculateQualityScore(latency, response.ok);
      
      this.qualityHistory.push({
        timestamp: Date.now(),
        quality,
        latency,
        bandwidth: this.connectionInfo.downlink
      });
      
      // Keep only recent history
      if (this.qualityHistory.length > 100) {
        this.qualityHistory = this.qualityHistory.slice(-50);
      }
      
      // Update adaptive settings based on quality
      this.updateAdaptiveSettings();
      
    } catch (error) {
      logger.warn('Network quality assessment failed', { error }, 'NETWORK_OPTIMIZER');
    }
  }

  private calculateQualityScore(latency: number, success: boolean): number {
    if (!success) return 0;
    
    // Quality score based on latency (0-1 scale)
    let score = 1.0;
    
    if (latency > 2000) score = 0.1;
    else if (latency > 1000) score = 0.3;
    else if (latency > 500) score = 0.5;
    else if (latency > 200) score = 0.7;
    else if (latency > 100) score = 0.9;
    
    return score;
  }

  private updateAdaptiveSettings(): void {
    const avgQuality = this.getAverageQuality();
    const currentLatency = this.connectionInfo.rtt;
    
    // Adjust timeout based on connection quality
    if (this.connectionInfo.effectiveType === 'slow-2g') {
      this.adaptiveSettings.timeout = 60000; // 1 minute
      this.adaptiveSettings.maxRetries = 5;
      this.adaptiveSettings.batchSize = 2;
      this.adaptiveSettings.preloadEnabled = false;
    } else if (this.connectionInfo.effectiveType === '2g') {
      this.adaptiveSettings.timeout = 45000; // 45 seconds
      this.adaptiveSettings.maxRetries = 4;
      this.adaptiveSettings.batchSize = 3;
      this.adaptiveSettings.preloadEnabled = false;
    } else if (this.connectionInfo.effectiveType === '3g') {
      this.adaptiveSettings.timeout = 30000; // 30 seconds
      this.adaptiveSettings.maxRetries = 3;
      this.adaptiveSettings.batchSize = 4;
      this.adaptiveSettings.preloadEnabled = avgQuality > 0.6;
    } else {
      this.adaptiveSettings.timeout = 15000; // 15 seconds
      this.adaptiveSettings.maxRetries = 3;
      this.adaptiveSettings.batchSize = 6;
      this.adaptiveSettings.preloadEnabled = true;
    }
    
    // Adjust compression threshold
    if (this.connectionInfo.saveData || this.connectionInfo.downlink < 1) {
      this.adaptiveSettings.compressionThreshold = 512; // More aggressive compression
    } else {
      this.adaptiveSettings.compressionThreshold = 1024;
    }
  }

  private getAverageQuality(): number {
    if (this.qualityHistory.length === 0) return 0.5;
    
    const recentHistory = this.qualityHistory.slice(-10); // Last 10 assessments
    const totalQuality = recentHistory.reduce((sum, entry) => sum + entry.quality, 0);
    
    return totalQuality / recentHistory.length;
  }

  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo };
  }

  getAdaptiveSettings() {
    return { ...this.adaptiveSettings };
  }

  getQualityMetrics() {
    const avgQuality = this.getAverageQuality();
    const recentLatency = this.qualityHistory.slice(-5);
    const avgLatency = recentLatency.length > 0 
      ? recentLatency.reduce((sum, entry) => sum + entry.latency, 0) / recentLatency.length 
      : 0;
    
    return {
      averageQuality: avgQuality,
      averageLatency: avgLatency,
      currentDownlink: this.connectionInfo.downlink,
      currentRTT: this.connectionInfo.rtt,
      assessmentCount: this.qualityHistory.length
    };
  }
}

// =============================================================================
// REQUEST COMPRESSION MANAGER
// =============================================================================

class RequestCompressionManager {
  private compressionStats = {
    totalRequests: 0,
    compressedRequests: 0,
    originalSize: 0,
    compressedSize: 0,
    avgCompressionRatio: 0
  };

  async compressRequest(request: NetworkRequest): Promise<NetworkRequest> {
    this.compressionStats.totalRequests++;
    
    if (!request.body || typeof request.body !== 'object') {
      return request;
    }

    const originalData = JSON.stringify(request.body);
    const originalSize = new Blob([originalData]).size;
    this.compressionStats.originalSize += originalSize;

    // Check if compression is beneficial
    if (originalSize < 1024) { // Skip compression for small payloads
      return request;
    }

    try {
      const compressed = await this.compressData(originalData);
      const compressedSize = compressed.length;
      
      if (compressedSize < originalSize * 0.9) { // Only use if at least 10% savings
        this.compressionStats.compressedRequests++;
        this.compressionStats.compressedSize += compressedSize;
        this.compressionStats.avgCompressionRatio = 
          this.compressionStats.compressedSize / this.compressionStats.originalSize;

        return {
          ...request,
          body: compressed,
          headers: {
            ...request.headers,
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/octet-stream',
            'X-Original-Content-Type': request.headers['Content-Type'] || 'application/json'
          }
        };
      }
    } catch (error) {
      logger.warn('Request compression failed', { error }, 'NETWORK_OPTIMIZER');
    }

    return request;
  }

  private async compressData(data: string): Promise<ArrayBuffer> {
    // Use CompressionStream if available
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      const encoder = new TextEncoder();
      writer.write(encoder.encode(data));
      writer.close();

      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result.buffer;
    }

    // Fallback: Simple compression in background worker
    const taskId = await BackgroundProcessingService.processData(
      [{ type: 'compress', data }],
      { priority: 'high', timeout: 5000 }
    );

    const task = await BackgroundProcessingService.waitForTask(taskId, 10000);
    if (task.error) {
      throw new Error(task.error);
    }

    return task.result.compressed;
  }

  getCompressionStats() {
    return { ...this.compressionStats };
  }
}

// =============================================================================
// INTELLIGENT REQUEST ROUTER
// =============================================================================

class IntelligentRequestRouter {
  private endpointHealth = new Map<string, {
    successRate: number;
    avgResponseTime: number;
    lastCheck: number;
    failures: number;
    consecutive failures: number;
  }>();

  private routingRules = new Map<string, {
    primary: string;
    fallbacks: string[];
    healthThreshold: number;
  }>();

  registerEndpoint(pattern: string, primary: string, fallbacks: string[] = []): void {
    this.routingRules.set(pattern, {
      primary,
      fallbacks,
      healthThreshold: 0.8 // 80% success rate threshold
    });

    // Initialize health tracking
    [primary, ...fallbacks].forEach(endpoint => {
      if (!this.endpointHealth.has(endpoint)) {
        this.endpointHealth.set(endpoint, {
          successRate: 1.0,
          avgResponseTime: 0,
          lastCheck: Date.now(),
          failures: 0,
          consecutiveFailures: 0
        });
      }
    });
  }

  routeRequest(request: NetworkRequest): NetworkRequest {
    const route = this.findRoute(request.url);
    
    if (!route) {
      return request; // No routing rule found
    }

    const endpoint = this.selectBestEndpoint(route);
    
    if (endpoint && endpoint !== this.extractBaseUrl(request.url)) {
      const newUrl = request.url.replace(this.extractBaseUrl(request.url), endpoint);
      
      logger.debug('Request routed', {
        original: request.url,
        routed: newUrl,
        reason: 'health_optimization'
      }, 'NETWORK_OPTIMIZER');

      return {
        ...request,
        url: newUrl
      };
    }

    return request;
  }

  private findRoute(url: string): { primary: string; fallbacks: string[]; healthThreshold: number } | null {
    for (const [pattern, route] of this.routingRules.entries()) {
      if (url.includes(pattern)) {
        return route;
      }
    }
    return null;
  }

  private selectBestEndpoint(route: { primary: string; fallbacks: string[]; healthThreshold: number }): string {
    const allEndpoints = [route.primary, ...route.fallbacks];
    
    // Find healthy endpoints
    const healthyEndpoints = allEndpoints.filter(endpoint => {
      const health = this.endpointHealth.get(endpoint);
      return health && 
             health.successRate >= route.healthThreshold &&
             health.consecutiveFailures < 3;
    });

    if (healthyEndpoints.length === 0) {
      // All endpoints unhealthy, return primary
      return route.primary;
    }

    // Select endpoint with best performance
    let bestEndpoint = healthyEndpoints[0];
    let bestScore = this.calculateEndpointScore(bestEndpoint);

    for (let i = 1; i < healthyEndpoints.length; i++) {
      const score = this.calculateEndpointScore(healthyEndpoints[i]);
      if (score > bestScore) {
        bestScore = score;
        bestEndpoint = healthyEndpoints[i];
      }
    }

    return bestEndpoint;
  }

  private calculateEndpointScore(endpoint: string): number {
    const health = this.endpointHealth.get(endpoint);
    if (!health) return 0;

    // Score based on success rate (70%) and response time (30%)
    const successScore = health.successRate * 0.7;
    const timeScore = health.avgResponseTime > 0 
      ? Math.max(0, 1 - (health.avgResponseTime / 5000)) * 0.3 
      : 0.3;

    return successScore + timeScore;
  }

  updateEndpointHealth(url: string, success: boolean, responseTime: number): void {
    const endpoint = this.extractBaseUrl(url);
    const health = this.endpointHealth.get(endpoint);
    
    if (!health) return;

    // Update success rate (moving average)
    health.successRate = (health.successRate * 0.9) + ((success ? 1 : 0) * 0.1);
    
    // Update response time (moving average)
    if (success) {
      health.avgResponseTime = (health.avgResponseTime * 0.8) + (responseTime * 0.2);
      health.consecutiveFailures = 0;
    } else {
      health.failures++;
      health.consecutiveFailures++;
    }
    
    health.lastCheck = Date.now();
  }

  private extractBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return url.split('/')[0];
    }
  }

  getEndpointHealth(): Array<{ endpoint: string; health: any }> {
    return Array.from(this.endpointHealth.entries()).map(([endpoint, health]) => ({
      endpoint,
      health: { ...health }
    }));
  }
}

// =============================================================================
// MAIN ADVANCED NETWORK OPTIMIZER
// =============================================================================

export class AdvancedNetworkOptimizer {
  private static connectionManager = new ConnectionQualityManager();
  private static compressionManager = new RequestCompressionManager();
  private static requestRouter = new IntelligentRequestRouter();
  private static isInitialized = false;
  
  private static metrics: NetworkMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    p95ResponseTime: 0,
    compressionSavings: 0,
    cacheHitRate: 0,
    retryRate: 0,
    timeoutRate: 0,
    throughput: 0
  };
  
  private static responseTimes: number[] = [];
  private static throughputWindow: number[] = [];

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Initialize connection manager
      this.connectionManager.initialize();
      
      // Setup default routing rules
      this.setupDefaultRouting();
      
      // Start throughput calculation
      setInterval(() => {
        this.calculateThroughput();
      }, 1000);
      
      this.isInitialized = true;
      
      logger.info('Advanced Network Optimizer initialized', {
        connectionMonitoring: true,
        compression: true,
        intelligentRouting: true
      }, 'NETWORK_OPTIMIZER');

      return true;
    } catch (error) {
      logger.error('Failed to initialize Advanced Network Optimizer', { error }, 'NETWORK_OPTIMIZER');
      return false;
    }
  }

  /**
   * Optimize network request with all advanced features
   */
  static async optimizeRequest<T>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      headers?: Record<string, string>;
      body?: any;
      priority?: 'critical' | 'high' | 'medium' | 'low';
      timeout?: number;
      retries?: number;
      cache?: boolean;
      compression?: boolean;
    } = {}
  ): Promise<T> {
    this.ensureInitialized();
    
    const startTime = performance.now();
    this.metrics.totalRequests++;
    this.throughputWindow.push(Date.now());

    const adaptiveSettings = this.connectionManager.getAdaptiveSettings();
    
    // Create optimized request
    let request: NetworkRequest = {
      id: this.generateRequestId(),
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
      priority: options.priority || 'medium',
      timeout: options.timeout || adaptiveSettings.timeout,
      retryConfig: {
        maxRetries: options.retries || adaptiveSettings.maxRetries,
        backoffMs: 1000,
        retryCondition: (error) => this.shouldRetry(error)
      },
      cacheConfig: {
        enabled: options.cache !== false,
        ttl: 300000, // 5 minutes
        strategy: 'both'
      }
    };

    try {
      // Apply routing optimization
      request = this.requestRouter.routeRequest(request);
      
      // Apply compression if enabled
      if (options.compression !== false) {
        request = await this.compressionManager.compressRequest(request);
      }
      
      // Execute optimized request
      const result = await this.executeOptimizedRequest<T>(request);
      
      // Record success metrics
      const duration = performance.now() - startTime;
      this.recordSuccessMetrics(request.url, duration);
      
      return result;
    } catch (error) {
      // Record failure metrics
      const duration = performance.now() - startTime;
      this.recordFailureMetrics(request.url, duration, error);
      
      throw error;
    }
  }

  private static async executeOptimizedRequest<T>(request: NetworkRequest): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= request.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry with exponential backoff
          const delay = request.retryConfig.backoffMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          logger.info('Retrying optimized request', {
            url: request.url,
            attempt: attempt + 1,
            delay
          }, 'NETWORK_OPTIMIZER');
        }

        const response = await this.makeRequest<T>(request);
        return response;
      } catch (error) {
        lastError = error;
        
        if (!request.retryConfig.retryCondition(error)) {
          break; // Don't retry for certain errors
        }
        
        this.metrics.retryRate = 
          (this.metrics.retryRate * 0.9) + (attempt > 0 ? 0.1 : 0);
      }
    }
    
    throw lastError;
  }

  private static async makeRequest<T>(request: NetworkRequest): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), request.timeout);

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body ? (
          request.body instanceof ArrayBuffer ? request.body : JSON.stringify(request.body)
        ) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.metrics.timeoutRate = (this.metrics.timeoutRate * 0.9) + 0.1;
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  private static recordSuccessMetrics(url: string, duration: number): void {
    this.metrics.successfulRequests++;
    this.metrics.avgResponseTime = (this.metrics.avgResponseTime * 0.9) + (duration * 0.1);
    
    // Update response times for P95 calculation
    this.responseTimes.push(duration);
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-500);
    }
    
    // Calculate P95
    if (this.responseTimes.length > 0) {
      const sorted = [...this.responseTimes].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      this.metrics.p95ResponseTime = sorted[p95Index] || 0;
    }
    
    // Update endpoint health
    this.requestRouter.updateEndpointHealth(url, true, duration);
    
    performanceService.recordMetric('advanced_network_success', duration, 'ms', 'network_optimization');
  }

  private static recordFailureMetrics(url: string, duration: number, error: any): void {
    this.metrics.failedRequests++;
    
    // Update endpoint health
    this.requestRouter.updateEndpointHealth(url, false, duration);
    
    performanceService.recordMetric('advanced_network_error', duration, 'ms', 'network_optimization', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  private static shouldRetry(error: any): boolean {
    // Don't retry for client errors (4xx)
    if (error.message && error.message.includes('HTTP 4')) {
      return false;
    }
    
    // Don't retry if offline
    if (!navigator.onLine) {
      return false;
    }
    
    return true;
  }

  private static calculateThroughput(): void {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    this.throughputWindow = this.throughputWindow.filter(time => time > oneSecondAgo);
    this.metrics.throughput = this.throughputWindow.length;
  }

  private static setupDefaultRouting(): void {
    // Setup default routing rules for common endpoints
    this.requestRouter.registerEndpoint('/api/', 'https://api.example.com', [
      'https://api-backup.example.com',
      'https://api-fallback.example.com'
    ]);
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get comprehensive network optimization metrics
   */
  static getNetworkOptimizationMetrics(): {
    network: NetworkMetrics;
    connection: any;
    compression: any;
    routing: any;
  } {
    this.ensureInitialized();
    
    return {
      network: { ...this.metrics },
      connection: this.connectionManager.getQualityMetrics(),
      compression: this.compressionManager.getCompressionStats(),
      routing: this.requestRouter.getEndpointHealth()
    };
  }

  /**
   * Register custom routing rule
   */
  static registerRoute(pattern: string, primary: string, fallbacks: string[] = []): void {
    this.ensureInitialized();
    
    this.requestRouter.registerEndpoint(pattern, primary, fallbacks);
  }

  /**
   * Preload critical resources
   */
  static async preloadCriticalResources(urls: string[]): Promise<void> {
    this.ensureInitialized();
    
    const adaptiveSettings = this.connectionManager.getAdaptiveSettings();
    
    if (!adaptiveSettings.preloadEnabled) {
      logger.info('Preloading disabled due to connection quality', {}, 'NETWORK_OPTIMIZER');
      return;
    }

    const preloadPromises = urls.map(url =>
      this.optimizeRequest(url, {
        method: 'GET',
        priority: 'low',
        cache: true
      }).catch(error => {
        logger.warn('Resource preload failed', { url, error }, 'NETWORK_OPTIMIZER');
      })
    );

    await Promise.allSettled(preloadPromises);
    
    logger.info('Critical resources preloaded', {
      urlCount: urls.length
    }, 'NETWORK_OPTIMIZER');
  }

  private static ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Advanced Network Optimizer not initialized. Call initialize() first.');
    }
  }

  static cleanup(): void {
    this.isInitialized = false;
  }
} 