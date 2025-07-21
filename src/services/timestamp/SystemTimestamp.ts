/**
 * SystemTimestamp.ts - V8.1 Core Timestamp Service
 * 
 * Unified timestamp source baseado em Date.now() - horário do computador
 * Solução definitiva para "datas que sempre se perdem" - user-reported issue
 * 
 * Created: 15 Janeiro 2025 - V8.1 Implementation
 * IA ALPHA - Backend Timestamp Architect (Corrected for Test Compatibility)
 */

export interface TimestampConfig {
  timezone?: string;
  format?: 'iso' | 'unix' | 'relative';
  precision?: 'seconds' | 'milliseconds';
  locale?: string;
}

export interface TimestampResult {
  timestamp: number;
  iso: string;
  formatted: string;
  timezone: string;
  precision: number;
  source: 'computer-time';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  corrected?: TimestampResult;
}

/**
 * SystemTimestamp - Core timestamp service
 * Eliminates manual date input issues through computer-time base
 * CORRECTED: APIs now match test expectations
 */
export class SystemTimestamp {
  private static instance: SystemTimestamp;
  private readonly performanceThreshold = 1; // <1ms generation target
  private readonly fallbackTimezone = 'UTC';
  
  private constructor() {}

  public static getInstance(): SystemTimestamp {
    if (!SystemTimestamp.instance) {
      SystemTimestamp.instance = new SystemTimestamp();
    }
    return SystemTimestamp.instance;
  }

  /**
   * Get current timestamp from computer time - primary method
   * Performance target: <1ms generation
   * CORRECTED: Returns number directly (not TimestampResult object)
   */
  public getTimestamp(config?: TimestampConfig): number {
    const startTime = performance.now();
    
    try {
      // Computer time as single source of truth
      const now = Date.now();
      
      // Performance validation
      const duration = performance.now() - startTime;
      if (duration > this.performanceThreshold) {
        console.warn(`SystemTimestamp: Performance threshold exceeded: ${duration.toFixed(3)}ms`);
      }

      return now;
      
    } catch (error) {
      // Defensive programming - fallback to basic timestamp
      console.error('SystemTimestamp: Error generating timestamp, using fallback', error);
      return Date.now();
    }
  }

  /**
   * Format timestamp for different display needs
   * CORRECTED: Accepts number timestamp and returns ISO 8601 string
   */
  public formatTimestamp(timestamp: number, timezone?: string): string {
    try {
      if (!this.validateTimestamp(timestamp)) {
        return 'Invalid Date';
      }
      
      const date = new Date(timestamp);
      
      // Return ISO 8601 format as expected by tests
      return date.toISOString();
      
    } catch (error) {
      console.error('SystemTimestamp: Error formatting timestamp', error);
      return 'Invalid Date';
    }
  }

  /**
   * Validate timestamp integrity and consistency
   * CORRECTED: Returns boolean directly (not ValidationResult object)
   */
  public validateTimestamp(timestamp: any): boolean {
    try {
      // Type validation
      if (typeof timestamp !== 'number' && typeof timestamp !== 'string') {
        return false;
      }
      
      // Convert to number for validation
      const numTimestamp = typeof timestamp === 'string' ? 
        parseInt(timestamp, 10) : timestamp;
      
      // Basic validation
      if (isNaN(numTimestamp) || numTimestamp < 0) {
        return false;
      }
      
      // Date range validation (reasonable range)
      const year2000 = new Date('2000-01-01').getTime();
      const year2100 = new Date('2100-01-01').getTime();
      
      if (numTimestamp < year2000 || numTimestamp > year2100) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('SystemTimestamp: Error validating timestamp', error);
      return false;
    }
  }

  /**
   * Get full timestamp result with detailed information
   * This method provides the complex result for internal use
   */
  public getFullTimestampResult(config: TimestampConfig = {}): TimestampResult {
    const startTime = performance.now();
    
    try {
      // Computer time as single source of truth
      const now = Date.now();
      const date = new Date(now);
      
      // Timezone handling with fallback
      const timezone = config.timezone || this.detectTimezone() || this.fallbackTimezone;
      
      // ISO 8601 standardization
      const iso = date.toISOString();
      
      // Format based on configuration
      const formatted = this.formatForLocale(date, config);
      
      // Precision optimization
      const precision = config.precision === 'seconds' ? 
        Math.floor(now / 1000) * 1000 : now;
      
      const result: TimestampResult = {
        timestamp: precision,
        iso,
        formatted,
        timezone,
        precision: performance.now() - startTime,
        source: 'computer-time'
      };

      return result;
      
    } catch (error) {
      // Defensive programming - fallback to basic timestamp
      console.error('SystemTimestamp: Error generating full timestamp result, using fallback', error);
      return this.generateFallbackTimestamp();
    }
  }

  /**
   * Format timestamp for locale-specific display
   */
  private formatForLocale(date: Date, config: TimestampConfig = {}): string {
    const { format = 'iso', locale = 'pt-BR' } = config;
    
    try {
      switch (format) {
        case 'unix':
          return Math.floor(date.getTime() / 1000).toString();
          
        case 'relative':
          return this.getRelativeTime(date);
          
        case 'iso':
        default:
          return date.toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
          });
      }
    } catch (error) {
      console.error('SystemTimestamp: Error formatting for locale', error);
      return date.toISOString();
    }
  }

  /**
   * Detect user's timezone automatically
   */
  private detectTimezone(): string | null {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.warn('SystemTimestamp: Could not detect timezone', error);
      return null;
    }
  }

  /**
   * Generate relative time string (e.g., "há 2 minutos")
   */
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return diffSeconds <= 5 ? 'agora' : `há ${diffSeconds} segundo${diffSeconds > 1 ? 's' : ''}`;
    }
  }

  /**
   * Fallback timestamp generation for error scenarios
   */
  private generateFallbackTimestamp(): TimestampResult {
    const now = Date.now();
    return {
      timestamp: now,
      iso: new Date(now).toISOString(),
      formatted: new Date(now).toLocaleString('pt-BR'),
      timezone: this.fallbackTimezone,
      precision: 0,
      source: 'computer-time'
    };
  }

  /**
   * Performance benchmark for optimization
   */
  public benchmarkPerformance(iterations: number = 1000): {
    averageMs: number;
    medianMs: number;
    maxMs: number;
    minMs: number;
    withinThreshold: number;
  } {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      this.getTimestamp();
      const end = performance.now();
      times.push(end - start);
    }
    
    times.sort((a, b) => a - b);
    
    const averageMs = times.reduce((sum, time) => sum + time, 0) / times.length;
    const medianMs = times[Math.floor(times.length / 2)];
    const maxMs = times[times.length - 1];
    const minMs = times[0];
    const withinThreshold = times.filter(time => time <= this.performanceThreshold).length;
    
    return {
      averageMs: Number(averageMs.toFixed(3)),
      medianMs: Number(medianMs.toFixed(3)),
      maxMs: Number(maxMs.toFixed(3)),
      minMs: Number(minMs.toFixed(3)),
      withinThreshold: (withinThreshold / iterations) * 100
    };
  }
}

// Export singleton instance
export const systemTimestamp = SystemTimestamp.getInstance(); 