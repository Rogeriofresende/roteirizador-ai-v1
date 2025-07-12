/**
 * 🌐 UNIFIED HTTP SERVICE V6.4
 * Week 2 Consolidation: Unified HTTP client for all API communications
 * Consolidates: networkService.ts + HTTP functionality from multiple services
 */

import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { trackNetworkError, trackApiError } from './errorTrackingService';
import { createErrorMessage } from './userMessages';
import { IAPIService, APIRequest, APIResponse, APIError, APIConfig } from './interfaces/IAPIService';

// =============================================================================
// UNIFIED HTTP SERVICE
// =============================================================================

export class UnifiedHttpService implements IAPIService {
  private cache: Map<string, { data: unknown; timestamp: number; expiry: number }> = new Map();
  private requestStats = {
    total: 0,
    successful: 0,
    failed: 0,
    totalResponseTime: 0,
    retries: 0,
    cacheHits: 0,
  };

  private isOnline = navigator.onLine;
  private requestQueue: Array<() => Promise<any>> = [];
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetries = 3;
  private defaultRetryDelay = 1000; // 1 second

  constructor() {
    this.setupEventListeners();
    this.setupPeriodicCleanup();
    
    logger.info('Unified HTTP Service initialized', {
      isOnline: this.isOnline,
      environment: config.environment,
    });
  }

  // =============================================================================
  // IAPIService IMPLEMENTATION
  // =============================================================================

  async initialize(): Promise<boolean> {
    try {
      await this.testConnectivity();
      logger.info('Unified HTTP Service initialized successfully');
      return true;
    } catch (error: unknown) {
      logger.error('Failed to initialize Unified HTTP Service', { error });
      return false;
    }
  }

  async dispose(): Promise<void> {
    this.clearCache();
    this.requestQueue = [];
    logger.info('Unified HTTP Service disposed');
  }

  async getHealth() {
    const isHealthy = await this.testConnectivity();
    return {
      status: isHealthy ? 'healthy' : 'offline' as const,
      lastCheck: new Date(),
      details: {
        isOnline: this.isOnline,
        stats: this.getStats(),
        cacheSize: this.cache.size
      }
    };
  }

  getServiceName(): string {
    return 'UnifiedHttpService';
  }

  async request<T>(requestConfig: APIRequest): Promise<APIResponse<T>> {
    const startTime = Date.now();
    const config = this.normalizeConfig(requestConfig);
    
    this.requestStats.total++;

    try {
      // Check cache first
      if (config.cache && config.method === 'GET') {
        const cached = this.getFromCache(config.url);
        if (cached) {
          this.requestStats.cacheHits++;
          logger.debug('Cache hit for request', { url: config.url });
          
          return {
            data: cached.data as T,
            status: 200,
            statusText: 'OK',
            headers: {},
            success: true
          };
        }
      }

      // If offline and request doesn't support offline mode
      if (!this.isOnline && !config.offline) {
        throw this.createNetworkError('No internet connection', config, true);
      }

      // Make the actual request
      const response = await this.makeRequestWithRetry<T>(config);
      
      // Cache successful GET requests
      if (config.cache && config.method === 'GET' && response.status >= 200 && response.status < 300) {
        this.setCache(config.url, response.data);
      }

      // Update stats
      this.requestStats.successful++;
      this.requestStats.totalResponseTime += Date.now() - startTime;

      logger.debug('Request successful', {
        url: config.url,
        method: config.method,
        status: response.status,
        responseTime: Date.now() - startTime,
      });

      return response;

    } catch (error: unknown) {
      this.requestStats.failed++;
      
      const networkError = this.normalizeError(error, config);
      
      // Track the error
      trackNetworkError(networkError, {
        url: config.url,
        method: config.method,
        retryCount: networkError.retryCount || 0,
        responseTime: Date.now() - startTime,
      });

      logger.error('Network request failed', {
        url: config.url,
        method: config.method,
        error: networkError.message,
        status: networkError.status,
        retryCount: networkError.retryCount,
        responseTime: Date.now() - startTime,
      });

      throw networkError;
    }
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ url, method: 'GET', headers });
  }

  async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ url, method: 'POST', data, headers });
  }

  async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ url, method: 'PUT', data, headers });
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', headers });
  }

  onRequest(handler: (request: APIRequest) => void): void {
    // Implementation for request interceptor
    this.requestInterceptor = handler;
  }

  onResponse<T>(handler: (response: APIResponse<T>) => void): void {
    // Implementation for response interceptor
    this.responseInterceptor = handler;
  }

  onError(handler: (error: APIError) => void): void {
    // Implementation for error interceptor
    this.errorInterceptor = handler;
  }

  // =============================================================================
  // UNIFIED HTTP METHODS
  // =============================================================================

  /**
   * Queue request for when connection is restored
   */
  queueRequest<T = any>(requestConfig: APIRequest): Promise<APIResponse<T>> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          const response = await this.request<T>(requestConfig);
          resolve(response);
        } catch (error: unknown) {
          reject(error);
        }
      };

      if (this.isOnline) {
        executeRequest();
      } else {
        this.requestQueue.push(executeRequest);
        logger.info('Request queued for when online', {
          url: requestConfig.url,
          method: requestConfig.method,
        });
      }
    });
  }

  /**
   * Batch multiple requests
   */
  async batchRequests<T>(requests: APIRequest[]): Promise<APIResponse<T>[]> {
    const results = await Promise.allSettled(
      requests.map(req => this.request<T>(req))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        logger.error(`Batch request ${index} failed`, { error: result.reason });
        throw result.reason;
      }
    });
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.cache = new Map();
    logger.info('HTTP cache cleared');
  }

  /**
   * Get network statistics
   */
  getStats() {
    const { total, successful, failed, totalResponseTime, retries, cacheHits } = this.requestStats;
    
    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      averageResponseTime: successful > 0 ? totalResponseTime / successful : 0,
      errorRate: total > 0 ? (failed / total) * 100 : 0,
      retryRate: total > 0 ? (retries / total) * 100 : 0,
      cacheHitRate: total > 0 ? (cacheHits / total) * 100 : 0,
      isOnline: this.isOnline,
      connectionType: this.getConnectionType(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Test network connectivity
   */
  async testConnectivity(): Promise<boolean> {
    try {
      await this.request({
        url: '/api/health',
        method: 'GET',
        timeout: 5000,
        retries: 1,
        cache: false,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get connection quality estimation
   */
  async estimateConnectionQuality(): Promise<'excellent' | 'good' | 'fair' | 'poor' | 'offline'> {
    if (!this.isOnline) return 'offline';

    try {
      const startTime = Date.now();
      await this.request({
        url: '/api/ping',
        method: 'GET',
        timeout: 10000,
        retries: 1,
        cache: false,
      });
      const responseTime = Date.now() - startTime;

      if (responseTime < 100) return 'excellent';
      if (responseTime < 300) return 'good';
      if (responseTime < 1000) return 'fair';
      return 'poor';
    } catch {
      return 'poor';
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private requestInterceptor?: (request: APIRequest) => void;
  private responseInterceptor?: <T>(response: APIResponse<T>) => void;
  private errorInterceptor?: (error: APIError) => void;

  private normalizeConfig(config: APIRequest): Required<APIRequest> {
    return {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      data: undefined,
      timeout: this.defaultTimeout,
      retries: this.defaultRetries,
      retryDelay: this.defaultRetryDelay,
      cache: false,
      offline: false,
      ...config,
    } as Required<APIRequest>;
  }

  private async makeRequestWithRetry<T>(config: Required<APIRequest>): Promise<APIResponse<T>> {
    let lastError: any;
    let retryCount = 0;

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        if (attempt > 0) {
          retryCount++;
          this.requestStats.retries++;
          await this.delay(config.retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
          
          logger.info('Retrying request', {
            url: config.url,
            attempt: attempt + 1,
            maxRetries: config.retries + 1,
          });
        }

        const response = await this.makeRequest<T>(config);
        
        if (retryCount > 0) {
          logger.info('Request succeeded after retries', {
            url: config.url,
            retryCount,
          });
        }

        return { ...response, retryCount };

      } catch (error: unknown) {
        lastError = this.normalizeError(error, config);
        lastError.retryCount = retryCount;

        // Don't retry certain errors
        if (this.shouldNotRetry(lastError)) {
          break;
        }
      }
    }

    throw lastError!;
  }

  private async makeRequest<T>(config: Required<APIRequest>): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      // Call request interceptor
      if (this.requestInterceptor) {
        this.requestInterceptor(config);
      }

      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        trackApiError(config.method, config.url, response.status, errorData);

        throw this.createHttpError(response, config, errorData);
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as any;
      }

      const apiResponse: APIResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
        success: true
      };

      // Call response interceptor
      if (this.responseInterceptor) {
        this.responseInterceptor(apiResponse);
      }

      return apiResponse;

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw this.createNetworkError('Request timeout', config, false, true);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw this.createNetworkError('Network error', config, true);
      }

      // Call error interceptor
      if (this.errorInterceptor && error instanceof Error) {
        this.errorInterceptor(error as APIError);
      }

      throw error;
    }
  }

  private createNetworkError(
    message: string,
    config: APIRequest,
    isOffline = false,
    isTimeout = false
  ): APIError {
    const error = new Error(message) as APIError;
    error.name = 'NetworkError';
    error.config = config;
    error.isNetworkError = true;
    error.isOfflineError = isOffline;
    error.isTimeoutError = isTimeout;
    return error;
  }

  private createHttpError(
    response: Response,
    config: APIRequest,
    data?: any
  ): APIError {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as APIError;
    error.name = 'HttpError';
    error.config = config;
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = data;
    error.isNetworkError = false;
    return error;
  }

  private normalizeError(error: unknown, config: APIRequest): APIError {
    if ((error as any).isNetworkError !== undefined) {
      return error as APIError;
    }

    const networkError = new Error((error as Error).message || 'Unknown network error') as APIError;
    networkError.name = (error as Error).name || 'NetworkError';
    networkError.config = config;
    networkError.isNetworkError = true;
    
    return networkError;
  }

  private shouldNotRetry(error: APIError): boolean {
    // Don't retry for client errors (4xx)
    if (error.status && error.status >= 400 && error.status < 500) {
      return true;
    }

    // Don't retry for specific network errors
    if (error.isOfflineError && !navigator.onLine) {
      return true;
    }

    return false;
  }

  private getFromCache(url: string): any {
    const cached = this.cache.get(url);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(url);
      return null;
    }

    return cached;
  }

  private setCache(url: string, data: any, ttl = 300000): void { // 5 minutes default
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    });
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const parsed: Record<string, string> = {};
    headers.forEach((value, key) => {
      parsed[key] = value;
    });
    return parsed;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Connection restored');
      this.processQueuedRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.warn('Connection lost');
    });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.testConnectivity();
      }
    });
  }

  private setupPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Clean every 5 minutes
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  private async processQueuedRequests(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    logger.info(`Processing ${this.requestQueue.length} queued requests`);

    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of requests) {
      try {
        await request();
      } catch (error: unknown) {
        logger.error('Failed to process queued request', { error });
      }
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Global service instance
export const unifiedHttpService = new UnifiedHttpService();

// Convenience exports for backward compatibility
export const httpService = unifiedHttpService;
export const networkService = unifiedHttpService; // Alias for existing usage

// Convenience functions
export const request = <T = any>(config: APIRequest) => unifiedHttpService.request<T>(config);
export const get = <T = any>(url: string, headers?: Record<string, string>) => unifiedHttpService.get<T>(url, headers);
export const post = <T = any>(url: string, data?: any, headers?: Record<string, string>) => unifiedHttpService.post<T>(url, data, headers);
export const put = <T = any>(url: string, data?: any, headers?: Record<string, string>) => unifiedHttpService.put<T>(url, data, headers);
export const del = <T = any>(url: string, headers?: Record<string, string>) => unifiedHttpService.delete<T>(url, headers); 