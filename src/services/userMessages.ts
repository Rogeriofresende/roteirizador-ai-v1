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
  metadata?: Record<string, unknown>;
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
    404: {
      title: 'Não encontrado',
      message: 'O conteúdo que você procura não foi encontrado ou pode ter sido removido.',
      actions: [
        { label: 'Voltar ao Início', action: 'navigate', variant: 'primary', href: '/' },
        { label: 'Buscar Novamente', action: 'retry', variant: 'secondary' },
      ],
    },
    500: {
      title: 'Erro interno do servidor',
      message: 'Ocorreu um problema em nossos servidores. Nossa equipe foi notificada automaticamente.',
      actions: [
        { label: 'Tentar Novamente', action: 'retry', variant: 'primary' },
        { label: 'Reportar Problema', action: 'contact', variant: 'secondary' },
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
  },

  // GEMINI API ERRORS
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
      ],
      autoClose: true,
      duration: 10000,
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
    context?: Record<string, unknown>
  ): UserMessage {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const template = this.findTemplate(category, errorMessage, context);
    
    const message: UserMessage = {
      id: this.generateMessageId(),
      title: template.title,
      message: template.message,
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
    context?: Record<string, unknown>
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
      message: template.message,
      type: 'success',
      severity: 'low',
      actions: template.actions,
      autoClose: template.autoClose,
      duration: template.duration,
      metadata: { key, context },
    };
  }

  /**
   * Get message for API error status
   */
  getApiErrorMessage(status: number, context?: Record<string, unknown>): UserMessage {
    const statusKey = status.toString();
    const template = errorTemplates.api[statusKey] || errorTemplates.api['500'];
    
    return this.createErrorMessage(
      `HTTP ${status}`,
      'api',
      this.getApiErrorSeverity(status),
      context
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
    context?: Record<string, unknown>
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
    context: Record<string, unknown> = {},
    templates: Record<string, MessageTemplate>
  ): string {
    const message = errorMessage.toLowerCase();
    
    // Network specific matching
    if (templates === errorTemplates.network) {
      if (!navigator.onLine) return 'offline';
      if (message.includes('timeout')) return 'timeout';
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
    }

    // Gemini specific matching
    if (templates === errorTemplates.gemini) {
      if (message.includes('api key') && message.includes('missing')) return 'api_key_missing';
      if (message.includes('api key') && message.includes('invalid')) return 'api_key_invalid';
      if (message.includes('quota') || message.includes('limit')) return 'quota_exceeded';
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

  private getApiErrorSeverity(status: number): ErrorSeverity {
    if (status >= 500) return 'high';
    if (status >= 400) return 'medium';
    return 'low';
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const userMessageService = new UserMessageService();

// Helper functions
export const createErrorMessage = (error: Error | string, category: ErrorCategory, severity: ErrorSeverity, context?: Record<string, unknown>) =>
  userMessageService.createErrorMessage(error, category, severity, context);

export const createSuccessMessage = (key: string, context?: Record<string, unknown>) =>
  userMessageService.createSuccessMessage(key, context);

export default userMessageService; 