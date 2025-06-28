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
  private initializationAttempts = 0;
  private maxRetries = 3;

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
      // Load Clarity script with enhanced error handling
      await this.loadClarityScriptWithRetry();
      this.isInitialized = true;
      
      logger.info('Microsoft Clarity initialized successfully', {
        projectId: this.config.projectId,
        environment: config.environment,
        attempts: this.initializationAttempts
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize Microsoft Clarity after retries', { 
        error, 
        attempts: this.initializationAttempts,
        maxRetries: this.maxRetries 
      });
      return false;
    }
  }

  private async loadClarityScriptWithRetry(): Promise<void> {
    while (this.initializationAttempts < this.maxRetries) {
      this.initializationAttempts++;
      
      try {
        await this.loadClarityScript();
        return; // Success, exit retry loop
      } catch (error) {
        logger.warn(`Clarity initialization attempt ${this.initializationAttempts} failed`, { 
          error,
          willRetry: this.initializationAttempts < this.maxRetries 
        });
        
        if (this.initializationAttempts >= this.maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * this.initializationAttempts));
      }
    }
  }

  private loadClarityScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded and functional
      if (window.clarity && typeof window.clarity === 'function') {
        logger.debug('Clarity already loaded and functional');
        resolve();
        return;
      }

      // Remove any existing clarity script to avoid conflicts
      const existingScript = document.querySelector(`script[src*="clarity.ms/tag/${this.config.projectId}"]`);
      if (existingScript) {
        existingScript.remove();
        logger.debug('Removed existing Clarity script');
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${this.config.projectId}`;
      script.setAttribute('data-clarity-attempt', this.initializationAttempts.toString());
      
      // Enhanced error handling with timeout
      const timeoutId = setTimeout(() => {
        const error = new Error('Clarity script load timeout');
        logger.error('Clarity script load timeout', { 
          projectId: this.config.projectId,
          attempt: this.initializationAttempts 
        });
        script.remove();
        resolve(); // Don't reject to avoid breaking the app
      }, 10000); // 10 second timeout

      script.onload = () => {
        clearTimeout(timeoutId);
        
        // Wait for Clarity to be fully initialized with retry logic
        this.waitForClarityInitialization()
          .then(() => {
            logger.debug('Clarity script loaded and initialized successfully', {
              attempt: this.initializationAttempts
            });
            resolve();
          })
          .catch((error) => {
            logger.warn('Clarity initialization check failed', { error });
            resolve(); // Don't reject to avoid breaking the app
          });
      };
      
      script.onerror = (event) => {
        clearTimeout(timeoutId);
        const error = new Error('Failed to load Clarity script');
        logger.error('Clarity script load failed', { 
          error,
          projectId: this.config.projectId,
          url: script.src,
          attempt: this.initializationAttempts,
          event
        });
        script.remove();
        resolve(); // Don't reject to avoid breaking the app
      };

      try {
        document.head.appendChild(script);
        logger.debug('Clarity script injection started', { 
          projectId: this.config.projectId,
          attempt: this.initializationAttempts,
          src: script.src
        });
      } catch (error) {
        clearTimeout(timeoutId);
        logger.error('Failed to inject Clarity script', { error });
        resolve(); // Don't break the app
      }
    });
  }

  private waitForClarityInitialization(): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 20;
      let attempts = 0;
      
      const checkClarity = () => {
        attempts++;
        
        try {
          // More thorough check for Clarity availability
          if (window.clarity && 
              typeof window.clarity === 'function' &&
              typeof window.clarity.consent !== 'undefined') {
            
            logger.debug('Clarity fully initialized and functional', { 
              attempts,
              clarityMethods: Object.keys(window.clarity || {})
            });
            resolve();
            return;
          }
        } catch (error) {
          logger.debug('Clarity check failed', { error, attempts });
        }
        
        if (attempts < maxAttempts) {
          logger.debug(`Clarity initialization check ${attempts}/${maxAttempts}`);
          setTimeout(checkClarity, 200);
        } else {
          logger.warn('Clarity initialization timeout', { 
            attempts,
            clarityExists: !!window.clarity,
            clarityType: typeof window.clarity
          });
          resolve(); // Don't reject to avoid breaking the app
        }
      };
      
      // Start checking after a short delay
      setTimeout(checkClarity, 100);
    });
  }

  // Event tracking methods with enhanced error handling
  trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.isInitialized || !this.config.enabled) {
      logger.debug('Clarity event not tracked - service not initialized', { event });
      return;
    }

    try {
      if (window.clarity && typeof window.clarity === 'function') {
        window.clarity('event', event, properties);
        logger.debug('Clarity event tracked successfully', { event, properties });
      } else {
        logger.warn('Clarity not available for event tracking', { 
          event,
          clarityExists: !!window.clarity,
          clarityType: typeof window.clarity
        });
      }
    } catch (error) {
      logger.error('Failed to track Clarity event', { 
        event, 
        error: error.message,
        stack: error.stack
      });
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

  // User identification with enhanced error handling
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.isInitialized || !this.config.enabled) {
      logger.debug('Clarity identify not called - service not initialized');
      return;
    }

    try {
      if (window.clarity && typeof window.clarity === 'function') {
        window.clarity('identify', userId, traits);
        logger.debug('User identified in Clarity successfully', { userId });
      } else {
        logger.warn('Clarity not available for user identification', { 
          userId,
          clarityExists: !!window.clarity,
          clarityType: typeof window.clarity
        });
      }
    } catch (error) {
      logger.error('Failed to identify user in Clarity', { 
        userId, 
        error: error.message,
        stack: error.stack
      });
    }
  }

  // Service status methods
  getStatus(): { 
    initialized: boolean; 
    enabled: boolean; 
    projectId: string;
    attempts: number;
    clarityAvailable: boolean;
  } {
    return {
      initialized: this.isInitialized,
      enabled: this.config.enabled,
      projectId: this.config.projectId,
      attempts: this.initializationAttempts,
      clarityAvailable: !!(window.clarity && typeof window.clarity === 'function')
    };
  }

  isEnabled(): boolean {
    return this.config.enabled && this.isInitialized;
  }

  // Method to reinitialize if needed
  async reinitialize(): Promise<boolean> {
    logger.info('Reinitializing Microsoft Clarity');
    this.isInitialized = false;
    this.initializationAttempts = 0;
    return this.initialize();
  }
}

// Global Clarity interface with enhanced typing
declare global {
  interface Window {
    clarity?: {
      (method: string, ...args: any[]): void;
      consent?: boolean;
      [key: string]: any;
    };
  }
}

// Export singleton instance
export const clarityService = new ClarityService(); 