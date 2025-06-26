/**
 * 🔍 ERROR TRACKING SERVICE
 * Professional error tracking with categorization, reporting, and analytics
 */

import { logger } from '../utils/logger';
import { config, isProduction, isDevelopment } from '../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 
  | 'ui' 
  | 'api' 
  | 'network' 
  | 'validation' 
  | 'auth' 
  | 'performance' 
  | 'security' 
  | 'integration' 
  | 'unknown';

export interface ErrorContext {
  // User Info
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  
  // App State
  route?: string;
  component?: string;
  action?: string;
  state?: Record<string, any>;
  
  // Technical Details
  timestamp?: string;
  environment?: string;
  version?: string;
  buildId?: string;
  
  // Network Info
  connectionType?: string;
  online?: boolean;
  
  // Custom Data
  [key: string]: any;
}

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  name?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  fingerprint: string;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  resolved: boolean;
  tags: string[];
}

export interface ErrorStats {
  totalErrors: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  topErrors: Array<{ fingerprint: string; count: number; message: string }>;
  errorRate: number;
  lastUpdated: string;
}

// =============================================================================
// ERROR TRACKING SERVICE
// =============================================================================

class ErrorTrackingService {
  private errors: Map<string, TrackedError> = new Map();
  private sessionId: string;
  private maxErrors = 1000; // Maximum stored errors
  private reportingQueue: TrackedError[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.setupPeriodicReporting();
    
    logger.info('Error tracking service initialized', {
      sessionId: this.sessionId,
      environment: config.environment,
    }, 'ERROR_TRACKING');
  }

  /**
   * Track a new error
   */
  trackError(
    error: Error | string,
    category: ErrorCategory = 'unknown',
    severity: ErrorSeverity = 'medium',
    context: ErrorContext = {}
  ): string {
    const errorObj = typeof error === 'string' 
      ? new Error(error) 
      : error;

    const enhancedContext = this.enhanceContext(context);
    const fingerprint = this.generateFingerprint(errorObj, category, enhancedContext);
    
    const existingError = this.errors.get(fingerprint);
    
    if (existingError) {
      // Update existing error
      existingError.count++;
      existingError.lastOccurrence = new Date().toISOString();
      existingError.context = { ...existingError.context, ...enhancedContext };
    } else {
      // Create new error entry
      const trackedError: TrackedError = {
        id: this.generateErrorId(),
        message: errorObj.message || 'Unknown error',
        stack: errorObj.stack,
        name: errorObj.name || 'Error',
        category,
        severity,
        context: enhancedContext,
        fingerprint,
        count: 1,
        firstOccurrence: new Date().toISOString(),
        lastOccurrence: new Date().toISOString(),
        resolved: false,
        tags: this.generateTags(errorObj, category, enhancedContext),
      };

      this.errors.set(fingerprint, trackedError);
      
      // Add to reporting queue
      this.queueForReporting(trackedError);
    }

    // Log the error
    this.logError(this.errors.get(fingerprint)!);
    
    // Cleanup if necessary
    this.cleanupOldErrors();
    
    return fingerprint;
  }

  /**
   * Track API errors
   */
  trackApiError(
    method: string,
    url: string,
    status: number,
    response?: any,
    context: ErrorContext = {}
  ): string {
    const errorMessage = `API Error: ${method} ${url} - Status ${status}`;
    const severity = this.getApiErrorSeverity(status);
    
    return this.trackError(
      new Error(errorMessage),
      'api',
      severity,
      {
        ...context,
        api: {
          method,
          url,
          status,
          response: typeof response === 'string' ? response : JSON.stringify(response),
        },
      }
    );
  }

  /**
   * Track network errors
   */
  trackNetworkError(
    error: Error,
    context: ErrorContext = {}
  ): string {
    return this.trackError(
      error,
      'network',
      'high',
      {
        ...context,
        network: {
          online: navigator.onLine,
          connectionType: this.getConnectionType(),
        },
      }
    );
  }

  /**
   * Track validation errors
   */
  trackValidationError(
    field: string,
    value: any,
    errors: string[],
    context: ErrorContext = {}
  ): string {
    const errorMessage = `Validation Error: ${field} - ${errors.join(', ')}`;
    
    return this.trackError(
      new Error(errorMessage),
      'validation',
      'low',
      {
        ...context,
        validation: {
          field,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          errors,
        },
      }
    );
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssue(
    metric: string,
    value: number,
    threshold: number,
    context: ErrorContext = {}
  ): string {
    const errorMessage = `Performance Issue: ${metric} (${value}) exceeded threshold (${threshold})`;
    
    return this.trackError(
      new Error(errorMessage),
      'performance',
      value > threshold * 2 ? 'high' : 'medium',
      {
        ...context,
        performance: {
          metric,
          value,
          threshold,
          ratio: value / threshold,
        },
      }
    );
  }

  /**
   * Mark an error as resolved
   */
  resolveError(fingerprint: string): boolean {
    const error = this.errors.get(fingerprint);
    if (error) {
      error.resolved = true;
      logger.info('Error marked as resolved', {
        fingerprint,
        message: error.message,
      }, 'ERROR_TRACKING');
      return true;
    }
    return false;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const errors = Array.from(this.errors.values());
    const totalErrors = errors.reduce((sum, error) => sum + error.count, 0);
    
    const byCategory: Record<ErrorCategory, number> = {
      ui: 0, api: 0, network: 0, validation: 0, auth: 0,
      performance: 0, security: 0, integration: 0, unknown: 0,
    };
    
    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0, medium: 0, high: 0, critical: 0,
    };

    errors.forEach(error => {
      byCategory[error.category] += error.count;
      bySeverity[error.severity] += error.count;
    });

    const topErrors = errors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(error => ({
        fingerprint: error.fingerprint,
        count: error.count,
        message: error.message,
      }));

    return {
      totalErrors,
      byCategory,
      bySeverity,
      topErrors,
      errorRate: this.calculateErrorRate(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get all tracked errors
   */
  getAllErrors(): TrackedError[] {
    return Array.from(this.errors.values())
      .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime());
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): TrackedError[] {
    return this.getAllErrors().filter(error => error.category === category);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors.clear();
    this.reportingQueue = [];
    logger.info('All errors cleared', {}, 'ERROR_TRACKING');
  }

  /**
   * Export errors for analysis
   */
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    const errors = this.getAllErrors();
    
    if (format === 'csv') {
      const headers = [
        'ID', 'Message', 'Category', 'Severity', 'Count',
        'First Occurrence', 'Last Occurrence', 'Resolved'
      ];
      
      const rows = errors.map(error => [
        error.id,
        error.message.replace(/"/g, '""'),
        error.category,
        error.severity,
        error.count,
        error.firstOccurrence,
        error.lastOccurrence,
        error.resolved
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(errors, null, 2);
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(error: Error, category: ErrorCategory, context: ErrorContext): string {
    const key = `${error.name}:${error.message}:${category}:${context.component || ''}:${context.route || ''}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  private enhanceContext(context: ErrorContext): ErrorContext {
    return {
      ...context,
      userId: context.userId || this.getUserId(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      route: context.route || window.location.pathname,
      timestamp: new Date().toISOString(),
      environment: config.environment,
      version: config.version,
      online: navigator.onLine,
      connectionType: this.getConnectionType(),
    };
  }

  private generateTags(error: Error, category: ErrorCategory, context: ErrorContext): string[] {
    const tags = [category];
    
    if (error.name !== 'Error') {
      tags.push(error.name.toLowerCase());
    }
    
    if (context.component) {
      tags.push(`component:${context.component}`);
    }
    
    if (context.route) {
      tags.push(`route:${context.route.replace('/', '')}`);
    }
    
    if (!navigator.onLine) {
      tags.push('offline');
    }
    
    return tags;
  }

  private logError(error: TrackedError): void {
    const logLevel = this.getLogLevel(error.severity);
    
    logger[logLevel](`${error.category.toUpperCase()} Error: ${error.message}`, {
      errorId: error.id,
      fingerprint: error.fingerprint,
      category: error.category,
      severity: error.severity,
      count: error.count,
      context: error.context,
      stack: error.stack,
    }, 'ERROR_TRACKING');
  }

  private getLogLevel(severity: ErrorSeverity): 'warn' | 'error' {
    return severity === 'low' ? 'warn' : 'error';
  }

  private getApiErrorSeverity(status: number): ErrorSeverity {
    if (status >= 500) return 'high';
    if (status >= 400) return 'medium';
    return 'low';
  }

  private getUserId(): string {
    try {
      return localStorage.getItem('userId') || 'anonymous';
    } catch {
      return 'unknown';
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  private calculateErrorRate(): number {
    // Simple error rate calculation (errors per minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    const recentErrors = Array.from(this.errors.values())
      .filter(error => new Date(error.lastOccurrence) > oneMinuteAgo)
      .reduce((sum, error) => sum + error.count, 0);
    
    return recentErrors;
  }

  private cleanupOldErrors(): void {
    if (this.errors.size <= this.maxErrors) return;
    
    const errors = Array.from(this.errors.entries())
      .sort((a, b) => new Date(a[1].lastOccurrence).getTime() - new Date(b[1].lastOccurrence).getTime());
    
    const toRemove = errors.slice(0, errors.length - this.maxErrors);
    toRemove.forEach(([fingerprint]) => this.errors.delete(fingerprint));
    
    logger.info('Old errors cleaned up', {
      removed: toRemove.length,
      remaining: this.errors.size,
    }, 'ERROR_TRACKING');
  }

  private queueForReporting(error: TrackedError): void {
    if (isProduction()) {
      this.reportingQueue.push(error);
    }
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Connection restored', {}, 'ERROR_TRACKING');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.warn('Connection lost', {}, 'ERROR_TRACKING');
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(
        new Error(event.message),
        'ui',
        'medium',
        {
          component: 'global',
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
        }
      );
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        'unknown',
        'high',
        {
          component: 'promise',
          reason: event.reason,
        }
      );
    });
  }

  private setupPeriodicReporting(): void {
    if (!isProduction()) return;

    setInterval(() => {
      if (this.reportingQueue.length > 0 && this.isOnline) {
        this.sendErrorsToExternalService();
      }
    }, 30000); // Report every 30 seconds
  }

  private async sendErrorsToExternalService(): Promise<void> {
    const errorsToSend = [...this.reportingQueue];
    this.reportingQueue = [];

    try {
      // Here you would integrate with external services like Sentry, LogRocket, etc.
      logger.info('Sending errors to external service', {
        count: errorsToSend.length,
        service: 'external_error_tracking',
      }, 'ERROR_TRACKING');

      // Simulated external service call
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorsToSend),
      // });

    } catch (error) {
      logger.error('Failed to send errors to external service', {
        error: error instanceof Error ? error.message : 'Unknown',
        queuedBack: errorsToSend.length,
      }, 'ERROR_TRACKING');
      
      // Re-queue errors for next attempt
      this.reportingQueue.unshift(...errorsToSend);
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const errorTrackingService = new ErrorTrackingService();

// Helper functions for common error tracking patterns
export const trackError = (error: Error | string, category?: ErrorCategory, severity?: ErrorSeverity, context?: ErrorContext) =>
  errorTrackingService.trackError(error, category, severity, context);

export const trackApiError = (method: string, url: string, status: number, response?: any, context?: ErrorContext) =>
  errorTrackingService.trackApiError(method, url, status, response, context);

export const trackValidationError = (field: string, value: any, errors: string[], context?: ErrorContext) =>
  errorTrackingService.trackValidationError(field, value, errors, context);

export const trackNetworkError = (error: Error, context?: ErrorContext) =>
  errorTrackingService.trackNetworkError(error, context);

export const trackPerformanceIssue = (metric: string, value: number, threshold: number, context?: ErrorContext) =>
  errorTrackingService.trackPerformanceIssue(metric, value, threshold, context);

export default errorTrackingService; 