/**
 * Tally.so Service
 * Professionalized with environment configuration and structured logging
 */

import { config } from '../config/environment';
import { createLogger } from '../utils/logger';

const logger = createLogger('TallyService');

interface TallyConfig {
  enabled: boolean;
  formIds: {
    feedback?: string;
    nps?: string;
    features?: string;
    bugs?: string;
  };
}

type FormType = 'feedback' | 'nps' | 'features' | 'bugs';

class TallyService {
  private isInitialized = false;
  private config: TallyConfig;

  constructor() {
    this.config = {
      enabled: !!(config.tally.feedbackFormId || config.tally.npsFormId || config.tally.featuresFormId || config.tally.bugsFormId),
      formIds: {
        feedback: config.tally.feedbackFormId,
        nps: config.tally.npsFormId,
        features: config.tally.featuresFormId,
        bugs: config.tally.bugsFormId
      }
    };
  }

  async initialize(): Promise<boolean> {
    if (!this.config.enabled) {
      logger.info('Tally.so disabled in current environment');
      return false;
    }

    if (!this.hasAnyFormConfigured()) {
      logger.warn('No Tally.so form IDs configured');
      return false;
    }

    try {
      await this.loadTallyScript();
      this.isInitialized = true;
      
      logger.info('Tally.so initialized successfully', {
        environment: config.environment,
        formsConfigured: Object.keys(this.config.formIds).length
      });
      
      return true;
    } catch (error: unknown) {
      logger.error('Failed to initialize Tally.so', { error });
      return false;
    }
  }

  private hasAnyFormConfigured(): boolean {
    return Object.values(this.config.formIds).some(id => !!id);
  }

  private loadTallyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Tally) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://tally.so/widgets/embed.js';
      
      script.onload = () => {
        logger.debug('Tally script loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        const error = new Error('Failed to load Tally script');
        logger.error('Tally script load failed', { error });
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  // Form display methods
  openForm(formType: FormType, options?: { width?: number; height?: number }): boolean {
    if (!this.isInitialized || !this.config.enabled) {
      logger.warn('Tally form not opened - service not initialized', { formType });
      return false;
    }

    const formId = this.config.formIds[formType];
    if (!formId) {
      logger.warn('Form ID not configured', { formType });
      return false;
    }

    try {
      if (window.Tally) {
        window.Tally.openPopup(formId, {
          width: options?.width || 600,
          height: options?.height || 500,
          ...options
        });
        
        logger.info('Tally form opened', { formType, formId });
        return true;
      }
      
      return false;
    } catch (error: unknown) {
      logger.error('Failed to open Tally form', { formType, formId, error });
      return false;
    }
  }

  // Convenience methods for specific forms
  openFeedbackForm(): boolean {
    return this.openForm('feedback');
  }

  openNPSForm(): boolean {
    return this.openForm('nps');
  }

  openFeaturesForm(): boolean {
    return this.openForm('features');
  }

  openBugReportForm(): boolean {
    return this.openForm('bugs');
  }

  // Service status methods
  getStatus(): { 
    initialized: boolean; 
    enabled: boolean; 
    formsConfigured: Record<FormType, boolean> 
  } {
    return {
      initialized: this.isInitialized,
      enabled: this.config.enabled,
      formsConfigured: {
        feedback: !!this.config.formIds.feedback,
        nps: !!this.config.formIds.nps,
        features: !!this.config.formIds.features,
        bugs: !!this.config.formIds.bugs,
      }
    };
  }

  isEnabled(): boolean {
    return this.config.enabled && this.isInitialized;
  }

  getFormUrl(formType: FormType): string | null {
    const formId = this.config.formIds[formType];
    return formId ? `https://tally.so/r/${formId}` : null;
  }
}

// Global Tally interface
declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: any) => void;
      closePopup: () => void;
    };
  }
}

// Export singleton instance
export const tallyService = new TallyService();
