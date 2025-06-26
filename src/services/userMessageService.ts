/**
 * 💬 USER MESSAGE SERVICE
 * Converts technical errors into user-friendly messages
 */

import { ErrorCategory, ErrorSeverity } from './errorTrackingService';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface UserMessage {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: ErrorSeverity;
  actions?: UserMessageAction[];
  autoClose?: boolean;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface UserMessageAction {
  label: string;
  action: 'retry' | 'refresh' | 'contact' | 'dismiss' | 'navigate' | 'download';
  variant?: 'primary' | 'secondary' | 'ghost';
  href?: string;
  onClick?: () => void;
}

export interface MessageTemplate {
  title: string;
  message: string;
  actions?: UserMessageAction[];
  autoClose?: boolean;
  duration?: number;
}

// =============================================================================
// ERROR MESSAGE TEMPLATES
// =============================================================================

const errorTemplates: Record<string, Record<string, MessageTemplate>> = {
  // NETWORK ERRORS
  network: {
    offline: {
      title: 'Sem conexão com a internet',
      message: 'Verifique sua conexão e tente novamente. Algumas funcionalidades podem estar limitadas.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Trabalhar Offline', action: 'dismiss', variant: 'secondary' },
      ],
    },
    timeout: {
      title: 'Tempo limite esgotado',
      message: 'A solicitação demorou mais que o esperado. Tente novamente em alguns instantes.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Cancelar', action: 'dismiss', variant: 'ghost' },
      ],
    },
    slow: {
      title: 'Conexão lenta detectada',
      message: 'Sua conexão está mais lenta que o normal. O carregamento pode demorar um pouco mais.',
      autoClose: true,
      duration: 5000,
    },
    failed: {
      title: 'Erro de conexão',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Atualizar Página', action: 'refresh', variant: 'secondary' },
      ],
    },
  },

  // API ERRORS
  api: {
    400: {
      title: 'Dados inválidos',
      message: 'Alguns dados não estão corretos. Verifique as informações e tente novamente.',
      actions: [
        { label: 'Corrigir', action: 'dismiss', variant: 'primary' },
      ],
    },
    401: {
      title: 'Sessão expirada',
      message: 'Sua sessão expirou. Faça login novamente para continuar.',
      actions: [
        { label: 'Fazer Login', action: 'navigate', variant: 'primary', href: '/login' },
        { label: 'Cancelar', action: 'dismiss', variant: 'ghost' },
      ],
    },
    403: {
      title: 'Acesso negado',
      message: 'Você não tem permissão para realizar esta ação.',
      actions: [
        { label: 'Entendi', action: 'dismiss', variant: 'primary' },
        { label: 'Contatar Suporte', action: 'contact', variant: 'secondary' },
      ],
    },
    404: {
      title: 'Não encontrado',
      message: 'O conteúdo que você procura não foi encontrado ou pode ter sido removido.',
      actions: [
        { label: 'Voltar ao Início', action: 'navigate', variant: 'primary', href: '/' },
        { label: 'Buscar Novamente', action: 'retry', variant: 'secondary' },
      ],
    },
    429: {
      title: 'Muitas tentativas',
      message: 'Você fez muitas solicitações rapidamente. Aguarde um momento antes de tentar novamente.',
      actions: [
        { label: 'Aguardar', action: 'dismiss', variant: 'primary' },
      ],
      autoClose: true,
      duration: 10000,
    },
    500: {
      title: 'Erro interno do servidor',
      message: 'Ocorreu um problema em nossos servidores. Nossa equipe foi notificada automaticamente.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Reportar Problema', action: 'contact', variant: 'secondary' },
      ],
    },
    502: {
      title: 'Serviço temporariamente indisponível',
      message: 'Nossos serviços estão temporariamente indisponíveis. Tente novamente em alguns minutos.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Verificar Status', action: 'navigate', variant: 'secondary', href: '/status' },
      ],
    },
    503: {
      title: 'Manutenção em andamento',
      message: 'Estamos realizando uma manutenção programada. O serviço voltará em breve.',
      actions: [
        { label: 'Verificar Status', action: 'navigate', variant: 'primary', href: '/status' },
      ],
    },
  },

  // VALIDATION ERRORS
  validation: {
    required: {
      title: 'Campos obrigatórios',
      message: 'Por favor, preencha todos os campos obrigatórios antes de continuar.',
      actions: [
        { label: 'Corrigir', action: 'dismiss', variant: 'primary' },
      ],
    },
    format: {
      title: 'Formato inválido',
      message: 'Alguns campos não estão no formato correto. Verifique e tente novamente.',
      actions: [
        { label: 'Corrigir', action: 'dismiss', variant: 'primary' },
      ],
    },
    length: {
      title: 'Tamanho inválido',
      message: 'Alguns campos estão muito longos ou muito curtos. Ajuste o conteúdo.',
      actions: [
        { label: 'Corrigir', action: 'dismiss', variant: 'primary' },
      ],
    },
    duplicate: {
      title: 'Dados duplicados',
      message: 'Os dados informados já existem. Use informações diferentes.',
      actions: [
        { label: 'Corrigir', action: 'dismiss', variant: 'primary' },
      ],
    },
  },

  // AUTHENTICATION ERRORS
  auth: {
    invalid_credentials: {
      title: 'Credenciais inválidas',
      message: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
      actions: [
        { label: 'Tentar Novamente', action: 'dismiss', variant: 'primary' },
        { label: 'Esqueci a Senha', action: 'navigate', variant: 'secondary', href: '/forgot-password' },
      ],
    },
    account_locked: {
      title: 'Conta bloqueada',
      message: 'Sua conta foi temporariamente bloqueada por segurança. Tente novamente em 15 minutos.',
      actions: [
        { label: 'Entendi', action: 'dismiss', variant: 'primary' },
        { label: 'Contatar Suporte', action: 'contact', variant: 'secondary' },
      ],
    },
    email_not_verified: {
      title: 'E-mail não verificado',
      message: 'Verifique seu e-mail e clique no link de confirmação antes de fazer login.',
      actions: [
        { label: 'Reenviar E-mail', action: 'retry', variant: 'primary' },
        { label: 'Alterar E-mail', action: 'navigate', variant: 'secondary', href: '/change-email' },
      ],
    },
  },

  // PERFORMANCE ISSUES
  performance: {
    slow_response: {
      title: 'Carregamento lento',
      message: 'A página está demorando mais que o usual para carregar. Sua conexão pode estar lenta.',
      autoClose: true,
      duration: 7000,
    },
    memory_high: {
      title: 'Alto uso de memória',
      message: 'A aplicação está usando muita memória. Considere fechar outras abas ou reiniciar o navegador.',
      actions: [
        { label: 'Atualizar Página', action: 'refresh', variant: 'primary' },
        { label: 'Ignorar', action: 'dismiss', variant: 'ghost' },
      ],
    },
  },

  // FEATURE SPECIFIC ERRORS
  gemini: {
    api_key_missing: {
      title: 'API Key não configurada',
      message: 'Configure sua API Key do Google Gemini nas configurações para usar a geração de scripts.',
      actions: [
        { label: 'Configurar Agora', action: 'navigate', variant: 'primary', href: '/settings' },
        { label: 'Mais Tarde', action: 'dismiss', variant: 'secondary' },
      ],
    },
    api_key_invalid: {
      title: 'API Key inválida',
      message: 'A API Key configurada não é válida. Verifique suas configurações.',
      actions: [
        { label: 'Configurar', action: 'navigate', variant: 'primary', href: '/settings' },
        { label: 'Testar Conexão', action: 'retry', variant: 'secondary' },
      ],
    },
    quota_exceeded: {
      title: 'Cota excedida',
      message: 'Você atingiu o limite de solicitações para a API do Gemini. Tente novamente mais tarde.',
      actions: [
        { label: 'Entendi', action: 'dismiss', variant: 'primary' },
        { label: 'Ver Limites', action: 'navigate', variant: 'secondary', href: '/usage' },
      ],
    },
    generation_failed: {
      title: 'Falha na geração',
      message: 'Não foi possível gerar o script. Tente novamente com uma descrição diferente.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Editar Descrição', action: 'dismiss', variant: 'secondary' },
      ],
    },
  },

  // FILE OPERATIONS
  file: {
    too_large: {
      title: 'Arquivo muito grande',
      message: 'O arquivo selecionado é muito grande. O tamanho máximo permitido é 10MB.',
      actions: [
        { label: 'Escolher Outro', action: 'dismiss', variant: 'primary' },
      ],
    },
    invalid_type: {
      title: 'Tipo de arquivo inválido',
      message: 'Este tipo de arquivo não é suportado. Use apenas imagens, documentos ou vídeos.',
      actions: [
        { label: 'Escolher Outro', action: 'dismiss', variant: 'primary' },
      ],
    },
    upload_failed: {
      title: 'Falha no upload',
      message: 'Não foi possível fazer upload do arquivo. Verifique sua conexão e tente novamente.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Cancelar', action: 'dismiss', variant: 'ghost' },
      ],
    },
  },

  // BROWSER COMPATIBILITY
  browser: {
    unsupported: {
      title: 'Navegador não suportado',
      message: 'Algumas funcionalidades podem não funcionar corretamente neste navegador. Recomendamos usar Chrome, Firefox ou Safari.',
      actions: [
        { label: 'Entendi', action: 'dismiss', variant: 'primary' },
        { label: 'Baixar Chrome', action: 'navigate', variant: 'secondary', href: 'https://chrome.google.com' },
      ],
    },
    javascript_disabled: {
      title: 'JavaScript desabilitado',
      message: 'Esta aplicação requer JavaScript para funcionar. Habilite JavaScript nas configurações do seu navegador.',
      actions: [
        { label: 'Recarregar', action: 'refresh', variant: 'primary' },
      ],
    },
  },
};

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

const successTemplates: Record<string, MessageTemplate> = {
  script_generated: {
    title: 'Script gerado com sucesso!',
    message: 'Seu script foi criado e está pronto para uso.',
    autoClose: true,
    duration: 4000,
  },
  script_saved: {
    title: 'Script salvo!',
    message: 'Suas alterações foram salvas automaticamente.',
    autoClose: true,
    duration: 3000,
  },
  settings_updated: {
    title: 'Configurações atualizadas',
    message: 'Suas preferências foram salvas com sucesso.',
    autoClose: true,
    duration: 3000,
  },
  export_completed: {
    title: 'Download iniciado',
    message: 'Seu arquivo foi gerado e o download começará em instantes.',
    autoClose: true,
    duration: 4000,
  },
  feedback_sent: {
    title: 'Feedback enviado!',
    message: 'Obrigado pelo seu feedback. Nossa equipe irá analisá-lo em breve.',
    autoClose: true,
    duration: 5000,
  },
};

// =============================================================================
// USER MESSAGE SERVICE
// =============================================================================

class UserMessageService {
  private messageIdCounter = 0;

  /**
   * Create user-friendly message from error
   */
  createErrorMessage(
    error: Error | string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context?: Record<string, any>
  ): UserMessage {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const template = this.findTemplate(category, errorMessage, context);
    
    const message: UserMessage = {
      id: this.generateMessageId(),
      title: template.title,
      message: this.personalizeMessage(template.message, context),
      type: 'error',
      severity,
      actions: template.actions,
      autoClose: template.autoClose,
      duration: template.duration,
      metadata: {
        originalError: errorMessage,
        category,
        context,
      },
    };

    logger.info('User-friendly error message created', {
      messageId: message.id,
      originalError: errorMessage,
      category,
      severity,
      title: message.title,
    }, 'USER_MESSAGE');

    return message;
  }

  /**
   * Create success message
   */
  createSuccessMessage(
    key: string,
    context?: Record<string, any>
  ): UserMessage {
    const template = successTemplates[key] || {
      title: 'Operação realizada com sucesso',
      message: 'A operação foi concluída.',
      autoClose: true,
      duration: 3000,
    };

    return {
      id: this.generateMessageId(),
      title: template.title,
      message: this.personalizeMessage(template.message, context),
      type: 'success',
      severity: 'low',
      actions: template.actions,
      autoClose: template.autoClose,
      duration: template.duration,
      metadata: { key, context },
    };
  }

  /**
   * Create warning message
   */
  createWarningMessage(
    title: string,
    message: string,
    actions?: UserMessageAction[]
  ): UserMessage {
    return {
      id: this.generateMessageId(),
      title,
      message,
      type: 'warning',
      severity: 'medium',
      actions,
      autoClose: false,
    };
  }

  /**
   * Create info message
   */
  createInfoMessage(
    title: string,
    message: string,
    autoClose = true,
    duration = 5000
  ): UserMessage {
    return {
      id: this.generateMessageId(),
      title,
      message,
      type: 'info',
      severity: 'low',
      autoClose,
      duration,
    };
  }

  /**
   * Get message for API error status
   */
  getApiErrorMessage(status: number, context?: Record<string, any>): UserMessage {
    const statusKey = status.toString();
    const template = errorTemplates.api[statusKey] || errorTemplates.api['500'];
    
    return this.createErrorMessage(
      `HTTP ${status}`,
      'api',
      this.getApiErrorSeverity(status),
      context
    );
  }

  /**
   * Get message for network error
   */
  getNetworkErrorMessage(type: string, context?: Record<string, any>): UserMessage {
    return this.createErrorMessage(
      `Network error: ${type}`,
      'network',
      'high',
      { ...context, networkType: type }
    );
  }

  /**
   * Get message for validation errors
   */
  getValidationErrorMessage(errors: string[], context?: Record<string, any>): UserMessage {
    const errorType = this.categorizeValidationError(errors);
    
    return this.createErrorMessage(
      errors.join(', '),
      'validation',
      'low',
      { ...context, validationType: errorType }
    );
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }

  private findTemplate(
    category: ErrorCategory,
    errorMessage: string,
    context?: Record<string, any>
  ): MessageTemplate {
    const categoryTemplates = errorTemplates[category];
    
    if (!categoryTemplates) {
      return this.getGenericErrorTemplate(category);
    }

    // Try to find specific template based on error message or context
    const key = this.matchErrorToTemplate(errorMessage, context, categoryTemplates);
    
    return categoryTemplates[key] || this.getGenericErrorTemplate(category);
  }

  private matchErrorToTemplate(
    errorMessage: string,
    context: Record<string, any> = {},
    templates: Record<string, MessageTemplate>
  ): string {
    const message = errorMessage.toLowerCase();
    
    // Network specific matching
    if (templates === errorTemplates.network) {
      if (!navigator.onLine) return 'offline';
      if (message.includes('timeout')) return 'timeout';
      if (message.includes('slow')) return 'slow';
      return 'failed';
    }

    // API specific matching
    if (templates === errorTemplates.api) {
      if (context.status) return context.status.toString();
    }

    // Validation specific matching
    if (templates === errorTemplates.validation) {
      if (message.includes('required')) return 'required';
      if (message.includes('format') || message.includes('invalid')) return 'format';
      if (message.includes('length') || message.includes('long') || message.includes('short')) return 'length';
      if (message.includes('duplicate') || message.includes('already exists')) return 'duplicate';
    }

    // Auth specific matching
    if (templates === errorTemplates.auth) {
      if (message.includes('invalid') || message.includes('incorrect')) return 'invalid_credentials';
      if (message.includes('locked') || message.includes('blocked')) return 'account_locked';
      if (message.includes('verify') || message.includes('confirmation')) return 'email_not_verified';
    }

    // Gemini specific matching
    if (templates === errorTemplates.gemini) {
      if (message.includes('api key') && message.includes('missing')) return 'api_key_missing';
      if (message.includes('api key') && message.includes('invalid')) return 'api_key_invalid';
      if (message.includes('quota') || message.includes('limit')) return 'quota_exceeded';
      if (message.includes('generation')) return 'generation_failed';
    }

    // Return first available template as fallback
    return Object.keys(templates)[0];
  }

  private getGenericErrorTemplate(category: ErrorCategory): MessageTemplate {
    const categoryTitles: Record<ErrorCategory, string> = {
      ui: 'Erro na interface',
      api: 'Erro de comunicação',
      network: 'Erro de conexão',
      validation: 'Dados inválidos',
      auth: 'Erro de autenticação',
      performance: 'Problema de performance',
      security: 'Problema de segurança',
      integration: 'Erro de integração',
      unknown: 'Erro inesperado',
    };

    return {
      title: categoryTitles[category],
      message: 'Ocorreu um problema inesperado. Tente novamente ou entre em contato com o suporte.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Contatar Suporte', action: 'contact', variant: 'secondary' },
      ],
    };
  }

  private personalizeMessage(message: string, context?: Record<string, any>): string {
    if (!context) return message;

    let personalizedMessage = message;

    // Replace placeholders with context values
    Object.entries(context).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (personalizedMessage.includes(placeholder)) {
        personalizedMessage = personalizedMessage.replace(placeholder, String(value));
      }
    });

    return personalizedMessage;
  }

  private getApiErrorSeverity(status: number): ErrorSeverity {
    if (status >= 500) return 'high';
    if (status >= 400) return 'medium';
    return 'low';
  }

  private categorizeValidationError(errors: string[]): string {
    const errorText = errors.join(' ').toLowerCase();
    
    if (errorText.includes('required') || errorText.includes('obrigatório')) return 'required';
    if (errorText.includes('format') || errorText.includes('formato')) return 'format';
    if (errorText.includes('length') || errorText.includes('tamanho')) return 'length';
    if (errorText.includes('duplicate') || errorText.includes('duplicado')) return 'duplicate';
    
    return 'format';
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const userMessageService = new UserMessageService();

// Helper functions
export const createErrorMessage = (error: Error | string, category: ErrorCategory, severity: ErrorSeverity, context?: Record<string, any>) =>
  userMessageService.createErrorMessage(error, category, severity, context);

export const createSuccessMessage = (key: string, context?: Record<string, any>) =>
  userMessageService.createSuccessMessage(key, context);

export const createWarningMessage = (title: string, message: string, actions?: UserMessageAction[]) =>
  userMessageService.createWarningMessage(title, message, actions);

export const createInfoMessage = (title: string, message: string, autoClose?: boolean, duration?: number) =>
  userMessageService.createInfoMessage(title, message, autoClose, duration);

export default userMessageService; 