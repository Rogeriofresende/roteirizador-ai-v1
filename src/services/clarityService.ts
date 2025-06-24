// Microsoft Clarity - Análise Comportamental de Usuários
// Heatmaps, gravações de sessão e análise de cliques

declare global {
  interface Window {
    clarity: (action: string, ...args: any[]) => void;
  }
}

interface ClarityConfig {
  projectId: string;
  enabled: boolean;
  debug: boolean;
}

export class ClarityService {
  private static config: ClarityConfig = {
    projectId: import.meta.env.VITE_CLARITY_PROJECT_ID || '',
    enabled: import.meta.env.PROD,
    debug: import.meta.env.DEV
  };
  
  private static isInitialized = false;
  private static isLoaded = false;

  /**
   * Inicializa o Microsoft Clarity
   */
  static initialize(): void {
    if (!this.config.projectId) {
      if (this.config.debug) {
        console.warn('🔍 Microsoft Clarity: Project ID não configurado');
      }
      return;
    }

    if (this.isInitialized) {
      if (this.config.debug) {
        console.warn('🔍 Microsoft Clarity: Já inicializado');
      }
      return;
    }

    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('🔍 Microsoft Clarity: Desabilitado no ambiente atual');
      }
      return;
    }

    this.loadClarityScript();
    this.isInitialized = true;

    if (this.config.debug) {
      console.log('🔍 Microsoft Clarity: Inicializado com sucesso');
    }
  }

  /**
   * Carrega o script do Microsoft Clarity
   */
  private static loadClarityScript(): void {
    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${this.config.projectId}");
      `;
      
      document.head.appendChild(script);
      
      // Aguardar carregamento
      const checkLoaded = setInterval(() => {
        if (typeof window.clarity === 'function') {
          this.isLoaded = true;
          this.setupCustomEvents();
          clearInterval(checkLoaded);
          
          if (this.config.debug) {
            console.log('🔍 Microsoft Clarity: Script carregado');
          }
        }
      }, 100);

      // Timeout de segurança
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!this.isLoaded && this.config.debug) {
          console.warn('🔍 Microsoft Clarity: Timeout no carregamento');
        }
      }, 10000);

    } catch (error) {
      console.error('🔍 Microsoft Clarity: Erro ao carregar script:', error);
    }
  }

  /**
   * Configura eventos personalizados
   */
  private static setupCustomEvents(): void {
    if (!this.isLoaded) return;

    try {
      // Identificar usuário (sem PII)
      this.identify();
      
      // Configurar eventos de página
      this.trackPageView();

      if (this.config.debug) {
        console.log('🔍 Microsoft Clarity: Eventos personalizados configurados');
      }
    } catch (error) {
      console.error('🔍 Microsoft Clarity: Erro ao configurar eventos:', error);
    }
  }

  /**
   * Rastreia eventos personalizados
   */
  static trackEvent(eventName: string, data?: Record<string, any>): void {
    if (!this.isLoaded || !window.clarity) {
      if (this.config.debug) {
        console.log('🔍 Microsoft Clarity: Event queued -', eventName, data);
      }
      return;
    }

    try {
      window.clarity('event', eventName, data || {});
      
      if (this.config.debug) {
        console.log('🔍 Microsoft Clarity: Event tracked -', eventName, data);
      }
    } catch (error) {
      console.error('🔍 Microsoft Clarity: Erro ao rastrear evento:', error);
    }
  }

  /**
   * Identifica usuário (anonimamente)
   */
  static identify(userId?: string): void {
    if (!this.isLoaded || !window.clarity) return;

    try {
      const anonymousId = userId ? `user_${btoa(userId).slice(0, 8)}` : 'anonymous';
      window.clarity('identify', anonymousId);
      
      if (this.config.debug) {
        console.log('🔍 Microsoft Clarity: User identified -', anonymousId);
      }
    } catch (error) {
      console.error('🔍 Microsoft Clarity: Erro ao identificar usuário:', error);
    }
  }

  /**
   * Rastreia visualização de página
   */
  static trackPageView(pageName?: string): void {
    if (!this.isLoaded) return;

    try {
      const page = pageName || window.location.pathname;
      this.trackEvent('page_view', {
        page: page,
        title: document.title,
        referrer: document.referrer || 'direct'
      });
    } catch (error) {
      console.error('🔍 Microsoft Clarity: Erro ao rastrear page view:', error);
    }
  }

  /**
   * Eventos específicos da aplicação
   */
  static trackScriptGeneration(data: {
    platform: string;
    duration: string;
    success: boolean;
    generationTime?: number;
  }): void {
    this.trackEvent('script_generated', {
      platform: data.platform,
      duration: data.duration,
      success: data.success,
      generation_time_ms: data.generationTime
    });
  }

  static trackAIRefinement(data: {
    type: string;
    accepted: boolean;
    confidence: number;
  }): void {
    this.trackEvent('ai_refinement_used', {
      refinement_type: data.type,
      user_accepted: data.accepted,
      ai_confidence: data.confidence
    });
  }

  static trackProjectSaved(data: {
    projectId: string;
    platform: string;
    wordCount: number;
  }): void {
    this.trackEvent('project_saved', {
      platform: data.platform,
      word_count: data.wordCount,
      is_new_project: !data.projectId.includes('existing')
    });
  }

  static trackExport(data: {
    format: string;
    platform: string;
    wordCount: number;
  }): void {
    this.trackEvent('export_completed', {
      export_format: data.format,
      content_platform: data.platform,
      content_length: data.wordCount
    });
  }

  static trackPWAInstall(): void {
    this.trackEvent('pwa_installed', {
      install_timestamp: Date.now(),
      user_agent: navigator.userAgent,
      platform: navigator.platform
    });
  }

  static trackFormInteraction(data: {
    formType: string;
    field: string;
    action: string;
  }): void {
    this.trackEvent('form_interaction', {
      form_type: data.formType,
      field_name: data.field,
      interaction_type: data.action
    });
  }

  static trackError(data: {
    errorType: string;
    errorMessage: string;
    context: string;
  }): void {
    this.trackEvent('error_occurred', {
      error_type: data.errorType,
      error_context: data.context,
      page: window.location.pathname
    });
  }

  /**
   * Utilitários
   */
  static getStatus(): {
    initialized: boolean;
    loaded: boolean;
    enabled: boolean;
    projectId: string;
  } {
    return {
      initialized: this.isInitialized,
      loaded: this.isLoaded,
      enabled: this.config.enabled,
      projectId: this.config.projectId ? '***' + this.config.projectId.slice(-4) : 'not_set'
    };
  }

  static setDebug(enabled: boolean): void {
    this.config.debug = enabled;
  }
} 