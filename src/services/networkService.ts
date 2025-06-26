/**
 * 🌐 NETWORK SERVICE
 * Professional network error handling with retry logic, fallback, and monitoring
 */

import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { trackNetworkError, trackApiError } from './errorTrackingService';
import { createErrorMessage } from './userMessages';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface NetworkRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  offline?: boolean;
}

export interface NetworkResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: NetworkRequestConfig;
  cached?: boolean;
  retryCount?: number;
}

export interface NetworkError extends Error {
  config?: NetworkRequestConfig;
  status?: number;
  statusText?: string;
  response?: any;
  retryCount?: number;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isOfflineError?: boolean;
}

export interface RequestCache {
  [key: string]: {
    data: any;
    timestamp: number;
    expires: number;
  };
}

export interface NetworkStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  retryRate: number;
  cacheHitRate: number;
  isOnline: boolean;
  connectionType: string;
  lastUpdated: string;
}

// =============================================================================
// NETWORK SERVICE
// =============================================================================

class NetworkService {
  private cache: RequestCache = {};
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
    
    logger.info('Network service initialized', {
      isOnline: this.isOnline,
      environment: config.environment,
    }, 'NETWORK_SERVICE');
  }

  /**
   * Make a network request with comprehensive error handling
   */
  async request<T = any>(requestConfig: NetworkRequestConfig): Promise<NetworkResponse<T>> {
    const startTime = Date.now();
    const config = this.normalizeConfig(requestConfig);
    
    this.requestStats.total++;

    try {
      // Check cache first
      if (config.cache && config.method === 'GET') {
        const cached = this.getFromCache(config.url);
        if (cached) {
          this.requestStats.cacheHits++;
          logger.debug('Cache hit for request', { url: config.url }, 'NETWORK_SERVICE');
          
          return {
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            cached: true,
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
      }, 'NETWORK_SERVICE');

      return response;

    } catch (error) {
      this.requestStats.failed++;
      
      const networkError = this.normalizeError(error, config);
      
      // Track the error
      trackNetworkError(networkError, {
        url: config.url,
        method: config.method,
        retryCount: networkError.retryCount || 0,
        responseTime: Date.now() - startTime,
      });

      // Log the error
      logger.error('Network request failed', {
        url: config.url,
        method: config.method,
        error: networkError.message,
        status: networkError.status,
        retryCount: networkError.retryCount,
        responseTime: Date.now() - startTime,
      }, 'NETWORK_SERVICE');

      throw networkError;
    }
  }

  /**
   * Convenience methods for different HTTP methods
   */
  async get<T = any>(url: string, config?: Partial<NetworkRequestConfig>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<NetworkRequestConfig>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body: data });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<NetworkRequestConfig>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body: data });
  }

  async delete<T = any>(url: string, config?: Partial<NetworkRequestConfig>): Promise<NetworkResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  /**
   * Queue request for when connection is restored
   */
  queueRequest<T = any>(requestConfig: NetworkRequestConfig): Promise<NetworkResponse<T>> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          const response = await this.request<T>(requestConfig);
          resolve(response);
        } catch (error) {
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
        }, 'NETWORK_SERVICE');
      }
    });
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.cache = {};
    logger.info('Network cache cleared', {}, 'NETWORK_SERVICE');
  }

  /**
   * Get network statistics
   */
  getStats(): NetworkStats {
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

  private normalizeConfig(config: NetworkRequestConfig): Required<NetworkRequestConfig> {
    return {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
      timeout: this.defaultTimeout,
      retries: this.defaultRetries,
      retryDelay: this.defaultRetryDelay,
      cache: false,
      offline: false,
      ...config,
    };
  }

  private async makeRequestWithRetry<T>(config: Required<NetworkRequestConfig>): Promise<NetworkResponse<T>> {
    let lastError: NetworkError;
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
          }, 'NETWORK_SERVICE');
        }

        const response = await this.makeRequest<T>(config);
        
        if (retryCount > 0) {
          logger.info('Request succeeded after retries', {
            url: config.url,
            retryCount,
          }, 'NETWORK_SERVICE');
        }

        return { ...response, retryCount };

      } catch (error) {
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

  private async makeRequest<T>(config: Required<NetworkRequestConfig>): Promise<NetworkResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
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

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
        config,
      };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw this.createNetworkError('Request timeout', config, false, true);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw this.createNetworkError('Network error', config, true);
      }

      throw error;
    }
  }

  private createNetworkError(
    message: string,
    config: NetworkRequestConfig,
    isOffline = false,
    isTimeout = false
  ): NetworkError {
    const error = new Error(message) as NetworkError;
    error.name = 'NetworkError';
    error.config = config;
    error.isNetworkError = true;
    error.isOfflineError = isOffline;
    error.isTimeoutError = isTimeout;
    return error;
  }

  private createHttpError(
    response: Response,
    config: NetworkRequestConfig,
    data?: any
  ): NetworkError {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as NetworkError;
    error.name = 'HttpError';
    error.config = config;
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = data;
    error.isNetworkError = false;
    return error;
  }

  private normalizeError(error: any, config: NetworkRequestConfig): NetworkError {
    if (error.isNetworkError !== undefined) {
      return error;
    }

    const networkError = new Error(error.message || 'Unknown network error') as NetworkError;
    networkError.name = error.name || 'NetworkError';
    networkError.config = config;
    networkError.isNetworkError = true;
    
    return networkError;
  }

  private shouldNotRetry(error: NetworkError): boolean {
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
    const cached = this.cache[url];
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      delete this.cache[url];
      return null;
    }

    return cached;
  }

  private setCache(url: string, data: any, ttl = 300000): void { // 5 minutes default
    this.cache[url] = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
    };
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
    const connection = (navigator as any).connection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Connection restored', {}, 'NETWORK_SERVICE');
      this.processQueuedRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.warn('Connection lost', {}, 'NETWORK_SERVICE');
    });

    // Connection change detection
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        logger.info('Connection type changed', {
          type: this.getConnectionType(),
          isOnline: this.isOnline,
        }, 'NETWORK_SERVICE');
      });
    }
  }

  private setupPeriodicCleanup(): void {
    // Clean cache every 10 minutes
    setInterval(() => {
      this.cleanupCache();
    }, 600000);
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    Object.keys(this.cache).forEach(url => {
      if (this.cache[url].expires < now) {
        delete this.cache[url];
        cleaned++;
      }
    });

    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', {
        itemsCleaned: cleaned,
        remainingItems: Object.keys(this.cache).length,
      }, 'NETWORK_SERVICE');
    }
  }

  private async processQueuedRequests(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    logger.info('Processing queued requests', {
      queueLength: this.requestQueue.length,
    }, 'NETWORK_SERVICE');

    const requests = [...this.requestQueue];
    this.requestQueue = [];

    // Process requests in parallel with concurrency limit
    const concurrencyLimit = 3;
    for (let i = 0; i < requests.length; i += concurrencyLimit) {
      const batch = requests.slice(i, i + concurrencyLimit);
      await Promise.allSettled(batch.map(request => request()));
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const networkService = new NetworkService();

// Helper functions
export const request = <T = any>(config: NetworkRequestConfig) => networkService.request<T>(config);
export const get = <T = any>(url: string, config?: Partial<NetworkRequestConfig>) => networkService.get<T>(url, config);
export const post = <T = any>(url: string, data?: any, config?: Partial<NetworkRequestConfig>) => networkService.post<T>(url, data, config);
export const put = <T = any>(url: string, data?: any, config?: Partial<NetworkRequestConfig>) => networkService.put<T>(url, data, config);
export const del = <T = any>(url: string, config?: Partial<NetworkRequestConfig>) => networkService.delete<T>(url, config);

export default networkService; 