// Tally.so - Formulários e Pesquisas de Feedback

declare global {
  interface Window {
    Tally: {
      openPopup: (formId: string, options?: any) => void;
      closePopup: (formId: string) => void;
    };
  }
}

export class TallyService {
  private static config = {
    enabled: import.meta.env.PROD,
    debug: import.meta.env.DEV,
    scriptLoaded: false
  };

  private static forms = {
    feedback: import.meta.env.VITE_TALLY_FORM_FEEDBACK || '',
    nps: import.meta.env.VITE_TALLY_FORM_NPS || '',
    features: import.meta.env.VITE_TALLY_FORM_FEATURES || '',
    bugs: import.meta.env.VITE_TALLY_FORM_BUGS || ''
  };

  static initialize(): void {
    if (!this.config.enabled) {
      console.log('📝 Tally.so: Disabled in current environment');
      return;
    }

    this.loadTallyScript();
    console.log('📝 Tally.so: Initialized successfully');
  }

  private static loadTallyScript(): void {
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    script.onload = () => {
      this.config.scriptLoaded = true;
      console.log('📝 Tally.so: Script loaded successfully');
    };
    document.head.appendChild(script);
  }

  static showFeedbackForm(formType: keyof typeof TallyService.forms, trigger?: string): void {
    const formId = this.forms[formType];
    
    if (!formId) {
      console.warn(`📝 Tally.so: Form ID not configured for ${formType}`);
      return;
    }

    if (!window.Tally) {
      console.warn('📝 Tally.so: Script not loaded yet');
      return;
    }

    try {
      window.Tally.openPopup(formId, {
        layout: 'modal',
        width: 600,
        autoClose: 0
      });

      this.trackFormEvent(formType, 'shown', trigger);
    } catch (error) {
      console.error('📝 Tally.so: Error showing form:', error);
    }
  }

  static showGeneralFeedback(): void {
    this.showFeedbackForm('feedback', 'manual');
  }

  static showNPSSurvey(): void {
    this.showFeedbackForm('nps', 'manual');
  }

  static showBugReport(): void {
    this.showFeedbackForm('bugs', 'manual');
  }

  private static trackFormEvent(formType: string, event: string, trigger?: string): void {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'tally_form_interaction', {
        form_type: formType,
        event_type: event,
        trigger: trigger || 'unknown'
      });
    }

    if (typeof window.clarity === 'function') {
      window.clarity('event', 'tally_form_interaction', {
        form_type: formType,
        event_type: event,
        trigger: trigger || 'unknown'
      });
    }
  }

  static getStatus() {
    return {
      enabled: this.config.enabled,
      scriptLoaded: this.config.scriptLoaded,
      formsConfigured: this.forms
    };
  }
}
