/**
 * V6.2 Enhanced Framework - Smart Loading Service
 * Estados de loading inteligentes e contextuais
 */

import { createLogger } from '../utils/logger';
import { analyticsService } from './analyticsService';

const logger = createLogger('smartLoadingService');

export interface LoadingContext {
  type: 'data-fetch' | 'ai-generation' | 'file-upload' | 'navigation' | 'processing' | 'auth';
  estimatedDuration?: number;
  progress?: number;
  message?: string;
  subMessage?: string;
  showCancel?: boolean;
  priority?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

interface LoadingState {
  id: string;
  context: LoadingContext;
  startTime: number;
  actualDuration?: number;
  status: 'active' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

interface LoadingPattern {
  contextType: LoadingContext['type'];
  avgDuration: number;
  successRate: number;
  lastUpdated: number;
  samples: number;
}

export class SmartLoadingService {
  private static activeLoadings = new Map<string, LoadingState>();
  private static loadingPatterns = new Map<string, LoadingPattern>();
  private static listeners = new Map<string, (state: LoadingState) => void>();
  private static globalListeners = new Set<(states: LoadingState[]) => void>();

  /**
   * Mensagens contextuais inteligentes
   */
  private static contextualMessages: Record<LoadingContext['type'], {
    initial: string[];
    progress: string[];
    extended: string[];
    tips: string[];
  }> = {
    'data-fetch': {
      initial: [
        'Carregando dados...',
        'Buscando informações...',
        'Preparando conteúdo...'
      ],
      progress: [
        'Quase lá...',
        'Processando informações...',
        'Organizando dados...'
      ],
      extended: [
        'Isso está levando mais tempo que o esperado...',
        'Ainda trabalhando nisso...',
        'Por favor, aguarde mais um momento...'
      ],
      tips: [
        '💡 Dica: Você pode navegar em outras abas enquanto isso',
        '💡 Dica: Seus dados estão sendo processados com segurança',
        '💡 Dica: A velocidade pode variar com base na sua conexão'
      ]
    },
    'ai-generation': {
      initial: [
        'IA pensando...',
        'Gerando resposta inteligente...',
        'Analisando sua solicitação...'
      ],
      progress: [
        'Criando conteúdo personalizado...',
        'Refinando resposta...',
        'Quase pronto...'
      ],
      extended: [
        'A IA está trabalhando em algo especial...',
        'Gerando uma resposta mais completa...',
        'Isso merece um pouco mais de atenção...'
      ],
      tips: [
        '🤖 A IA está considerando múltiplas perspectivas',
        '🤖 Quanto mais complexo o pedido, melhor a resposta',
        '🤖 Você pode cancelar e tentar uma abordagem diferente'
      ]
    },
    'file-upload': {
      initial: [
        'Enviando arquivo...',
        'Iniciando upload...',
        'Preparando transferência...'
      ],
      progress: [
        'Upload em progresso...',
        'Transferindo dados...',
        '{progress}% concluído...'
      ],
      extended: [
        'Arquivos grandes podem demorar um pouco...',
        'Mantendo conexão estável...',
        'Não feche esta aba...'
      ],
      tips: [
        '📤 Uploads são retomados automaticamente se houver interrupção',
        '📤 Seus arquivos são criptografados durante a transferência',
        '📤 Você pode continuar trabalhando em outras tarefas'
      ]
    },
    'navigation': {
      initial: [
        'Navegando...',
        'Carregando página...',
        'Preparando interface...'
      ],
      progress: [
        'Montando componentes...',
        'Carregando recursos...',
        'Quase lá...'
      ],
      extended: [
        'Carregando recursos adicionais...',
        'Otimizando experiência...',
        'Preparando tudo para você...'
      ],
      tips: [
        '🚀 Páginas visitadas recentemente carregam mais rápido',
        '🚀 Estamos pré-carregando recursos para melhor performance',
        '🚀 Seu progresso foi salvo automaticamente'
      ]
    },
    'processing': {
      initial: [
        'Processando...',
        'Trabalhando nisso...',
        'Executando operação...'
      ],
      progress: [
        'Processamento em andamento...',
        'Analisando dados...',
        'Finalizando processo...'
      ],
      extended: [
        'Processamento complexo em execução...',
        'Isso pode levar alguns momentos...',
        'Otimizando resultados...'
      ],
      tips: [
        '⚡ Operações são otimizadas para máxima eficiência',
        '⚡ Você será notificado quando concluir',
        '⚡ Processamento seguro e confiável'
      ]
    },
    'auth': {
      initial: [
        'Autenticando...',
        'Verificando credenciais...',
        'Conectando...'
      ],
      progress: [
        'Validando acesso...',
        'Preparando sessão...',
        'Quase pronto...'
      ],
      extended: [
        'Estabelecendo conexão segura...',
        'Verificando permissões...',
        'Finalizando autenticação...'
      ],
      tips: [
        '🔐 Sua conexão é segura e criptografada',
        '🔐 Autenticação em dois fatores aumenta sua segurança',
        '🔐 Suas credenciais nunca são armazenadas em texto simples'
      ]
    }
  };

  /**
   * Inicia um novo estado de loading
   */
  static startLoading(context: LoadingContext): string {
    const id = `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Estimar duração baseado em padrões históricos
    const pattern = this.loadingPatterns.get(context.type);
    const estimatedDuration = context.estimatedDuration || pattern?.avgDuration || 2000;

    const state: LoadingState = {
      id,
      context: {
        ...context,
        estimatedDuration,
        message: context.message || this.getInitialMessage(context.type),
        priority: context.priority || 'medium'
      },
      startTime: Date.now(),
      status: 'active'
    };

    this.activeLoadings.set(id, state);
    this.notifyListeners(id, state);
    this.notifyGlobalListeners();

    // Agendar atualizações de mensagem
    this.scheduleMessageUpdates(id);

    // Analytics
    analyticsService.trackEvent('smart_loading_start', {
      type: context.type,
      estimatedDuration,
      hasCustomMessage: !!context.message
    });

    logger.debug('Loading iniciado', { id, context });

    return id;
  }

  /**
   * Atualiza o progresso de um loading
   */
  static updateProgress(loadingId: string, progress: number, message?: string): void {
    const state = this.activeLoadings.get(loadingId);
    if (!state || state.status !== 'active') return;

    state.context.progress = Math.min(100, Math.max(0, progress));
    
    if (message) {
      state.context.message = message;
    } else {
      state.context.message = this.getProgressMessage(state.context.type, progress);
    }

    this.activeLoadings.set(loadingId, state);
    this.notifyListeners(loadingId, state);
    this.notifyGlobalListeners();
  }

  /**
   * Finaliza um loading
   */
  static finishLoading(loadingId: string, success: boolean = true, error?: string): void {
    const state = this.activeLoadings.get(loadingId);
    if (!state) return;

    const actualDuration = Date.now() - state.startTime;
    
    state.actualDuration = actualDuration;
    state.status = success ? 'completed' : 'error';
    state.error = error;

    // Atualizar padrões de duração
    this.updateLoadingPattern(state.context.type, actualDuration, success);

    // Remover após um delay para permitir animações
    setTimeout(() => {
      this.activeLoadings.delete(loadingId);
      this.notifyGlobalListeners();
    }, 500);

    this.notifyListeners(loadingId, state);

    // Analytics
    analyticsService.trackEvent('smart_loading_finish', {
      type: state.context.type,
      duration: actualDuration,
      estimatedDuration: state.context.estimatedDuration,
      accuracy: state.context.estimatedDuration 
        ? Math.abs(1 - (actualDuration / state.context.estimatedDuration))
        : null,
      success
    });

    logger.debug('Loading finalizado', { 
      id: loadingId, 
      duration: actualDuration,
      success 
    });
  }

  /**
   * Cancela um loading
   */
  static cancelLoading(loadingId: string): void {
    const state = this.activeLoadings.get(loadingId);
    if (!state || state.status !== 'active') return;

    state.status = 'cancelled';
    state.actualDuration = Date.now() - state.startTime;

    setTimeout(() => {
      this.activeLoadings.delete(loadingId);
      this.notifyGlobalListeners();
    }, 500);

    this.notifyListeners(loadingId, state);

    logger.debug('Loading cancelado', { id: loadingId });
  }

  /**
   * Registra listener para um loading específico
   */
  static addListener(loadingId: string, listener: (state: LoadingState) => void): void {
    this.listeners.set(loadingId, listener);
    
    // Notificar estado atual se existir
    const state = this.activeLoadings.get(loadingId);
    if (state) {
      listener(state);
    }
  }

  /**
   * Remove listener
   */
  static removeListener(loadingId: string): void {
    this.listeners.delete(loadingId);
  }

  /**
   * Registra listener global
   */
  static addGlobalListener(listener: (states: LoadingState[]) => void): () => void {
    this.globalListeners.add(listener);
    
    // Notificar estado atual
    listener(Array.from(this.activeLoadings.values()));

    // Retornar função de cleanup
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  /**
   * Obtém todos os loadings ativos
   */
  static getActiveLoadings(): LoadingState[] {
    return Array.from(this.activeLoadings.values())
      .filter(state => state.status === 'active')
      .sort((a, b) => {
        // Priorizar por priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.context.priority || 'medium'];
        const bPriority = priorityOrder[b.context.priority || 'medium'];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Depois por tempo de início
        return a.startTime - b.startTime;
      });
  }

  /**
   * Verifica se há loading ativo de um tipo específico
   */
  static hasActiveLoading(type?: LoadingContext['type']): boolean {
    if (!type) {
      return this.activeLoadings.size > 0;
    }

    return Array.from(this.activeLoadings.values()).some(
      state => state.status === 'active' && state.context.type === type
    );
  }

  /**
   * Agenda atualizações de mensagem baseadas no tempo
   */
  private static scheduleMessageUpdates(loadingId: string): void {
    const checkpoints = [
      { time: 3000, type: 'progress' },
      { time: 8000, type: 'extended' },
      { time: 15000, type: 'tip' }
    ];

    checkpoints.forEach(checkpoint => {
      setTimeout(() => {
        const state = this.activeLoadings.get(loadingId);
        if (!state || state.status !== 'active') return;

        if (checkpoint.type === 'tip') {
          state.context.subMessage = this.getRandomTip(state.context.type);
        } else {
          state.context.message = this.getMessageForCheckpoint(
            state.context.type,
            checkpoint.type
          );
        }

        this.activeLoadings.set(loadingId, state);
        this.notifyListeners(loadingId, state);
        this.notifyGlobalListeners();
      }, checkpoint.time);
    });
  }

  /**
   * Obtém mensagem inicial
   */
  private static getInitialMessage(type: LoadingContext['type']): string {
    const messages = this.contextualMessages[type]?.initial || ['Carregando...'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Obtém mensagem de progresso
   */
  private static getProgressMessage(type: LoadingContext['type'], progress: number): string {
    const messages = this.contextualMessages[type]?.progress || ['Processando...'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    return message.replace('{progress}', progress.toString());
  }

  /**
   * Obtém mensagem para checkpoint
   */
  private static getMessageForCheckpoint(
    type: LoadingContext['type'],
    checkpoint: string
  ): string {
    const messageSet = checkpoint === 'progress' 
      ? this.contextualMessages[type]?.progress
      : this.contextualMessages[type]?.extended;
    
    const messages = messageSet || ['Aguarde...'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Obtém dica aleatória
   */
  private static getRandomTip(type: LoadingContext['type']): string {
    const tips = this.contextualMessages[type]?.tips || [];
    return tips[Math.floor(Math.random() * tips.length)] || '';
  }

  /**
   * Atualiza padrões de loading
   */
  private static updateLoadingPattern(
    type: LoadingContext['type'],
    duration: number,
    success: boolean
  ): void {
    const pattern = this.loadingPatterns.get(type) || {
      contextType: type,
      avgDuration: duration,
      successRate: success ? 1 : 0,
      lastUpdated: Date.now(),
      samples: 0
    };

    // Média móvel exponencial
    const alpha = 0.2;
    pattern.avgDuration = pattern.avgDuration * (1 - alpha) + duration * alpha;
    pattern.successRate = pattern.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;
    pattern.samples++;
    pattern.lastUpdated = Date.now();

    this.loadingPatterns.set(type, pattern);
  }

  /**
   * Notifica listeners
   */
  private static notifyListeners(loadingId: string, state: LoadingState): void {
    const listener = this.listeners.get(loadingId);
    if (listener) {
      listener(state);
    }
  }

  /**
   * Notifica listeners globais
   */
  private static notifyGlobalListeners(): void {
    const states = this.getActiveLoadings();
    this.globalListeners.forEach(listener => {
      listener(states);
    });
  }

  /**
   * Obtém estatísticas de loading
   */
  static getLoadingStats(): {
    patterns: LoadingPattern[];
    currentActive: number;
    avgDuration: number;
    successRate: number;
  } {
    const patterns = Array.from(this.loadingPatterns.values());
    const avgDuration = patterns.reduce((sum, p) => sum + p.avgDuration, 0) / patterns.length || 0;
    const successRate = patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length || 0;

    return {
      patterns,
      currentActive: this.getActiveLoadings().length,
      avgDuration,
      successRate
    };
  }

  /**
   * Limpa dados antigos
   */
  static cleanup(): void {
    // Limpar loadings inativos
    this.activeLoadings.forEach((state, id) => {
      if (state.status !== 'active' && Date.now() - state.startTime > 60000) {
        this.activeLoadings.delete(id);
        this.listeners.delete(id);
      }
    });

    logger.debug('Limpeza executada', { 
      remaining: this.activeLoadings.size 
    });
  }
} 