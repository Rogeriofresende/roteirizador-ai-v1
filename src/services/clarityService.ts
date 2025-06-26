/**
 * Microsoft Clarity Service
 * Professionalized with environment configuration and structured logging
 */

import { config } from '../config/environment';
import { createLogger } from '../utils/logger';

const logger = createLogger('ClarityService');

interface ClarityConfig {
  projectId: string;
  enabled: boolean;
}

interface ClarityEvent {
  event: string;
  properties?: Record<string, any>;
}

class ClarityService {
  private isInitialized = false;
  private config: ClarityConfig;

  constructor() {
    this.config = {
      projectId: config.analytics.clarityProjectId || '',
      enabled: !!config.analytics.clarityProjectId
    };
  }

  async initialize(): Promise<boolean> {
    if (!this.config.enabled) {
      logger.info('Microsoft Clarity disabled in current environment');
      return false;
    }

    if (!this.config.projectId) {
      logger.warn('Microsoft Clarity project ID not configured');
      return false;
    }

    if (this.isInitialized) {
      logger.debug('Microsoft Clarity already initialized');
      return true;
    }

    try {
      // Load Clarity script
      await this.loadClarityScript();
      this.isInitialized = true;
      
      logger.info('Microsoft Clarity initialized successfully', {
        projectId: this.config.projectId,
        environment: config.environment
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize Microsoft Clarity', { error });
      return false;
    }
  }

  private loadClarityScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.clarity) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${this.config.projectId}`;
      
      script.onload = () => {
        logger.debug('Clarity script loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        const error = new Error('Failed to load Clarity script');
        logger.error('Clarity script load failed', { error });
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  // Event tracking methods
  trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.isInitialized || !this.config.enabled) {
      logger.debug('Clarity event not tracked - service not initialized', { event });
      return;
    }

    try {
      if (window.clarity) {
        window.clarity('event', event, properties);
        logger.debug('Clarity event tracked', { event, properties });
      }
    } catch (error) {
      logger.error('Failed to track Clarity event', { event, error });
    }
  }

  trackPageView(page: string): void {
    this.trackEvent('page_view', { page });
  }

  trackUserAction(action: string, context?: Record<string, any>): void {
    this.trackEvent('user_action', { action, ...context });
  }

  trackError(error: string, context?: Record<string, any>): void {
    this.trackEvent('error', { error, ...context });
  }

  trackConversionFunnel(step: string, data?: Record<string, any>): void {
    this.trackEvent('conversion_funnel', { step, ...data });
  }

  // User identification
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.isInitialized || !this.config.enabled) {
      logger.debug('Clarity identify not called - service not initialized');
      return;
    }

    try {
      if (window.clarity) {
        window.clarity('identify', userId, traits);
        logger.debug('User identified in Clarity', { userId });
      }
    } catch (error) {
      logger.error('Failed to identify user in Clarity', { userId, error });
    }
  }

  // Service status methods
  getStatus(): { initialized: boolean; enabled: boolean; projectId: string } {
    return {
      initialized: this.isInitialized,
      enabled: this.config.enabled,
      projectId: this.config.projectId
    };
  }

  isEnabled(): boolean {
    return this.config.enabled && this.isInitialized;
  }
}

// Global Clarity interface
declare global {
  interface Window {
    clarity?: (method: string, ...args: any[]) => void;
  }
}

// Export singleton instance
export const clarityService = new ClarityService(); 