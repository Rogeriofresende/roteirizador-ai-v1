/**
 * V6.2 Enhanced Framework - Direct Access Service
 * Acesso direto e rápido a funcionalidades em 5 segundos
 */

import { PredictiveUXService } from './predictiveUXService';
import { createLogger } from '../utils/logger';

const logger = createLogger('directAccessService');

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  category: 'creation' | 'navigation' | 'editing' | 'tools' | 'settings';
  handler: () => void | Promise<void>;
  priority: number;
  lastUsed?: Date;
  usageCount: number;
}

export interface AccessPattern {
  userId: string;
  actionSequence: string[];
  frequency: number;
  avgTimeToComplete: number;
  successRate: number;
  lastAccessed: Date;
}

export interface ShortcutMap {
  [key: string]: {
    action: QuickAction;
    description: string;
    enabled: boolean;
  };
}

export class DirectAccessService {
  private static quickActions = new Map<string, QuickAction>();
  private static shortcuts = new Map<string, ShortcutMap>();
  private static accessPatterns = new Map<string, AccessPattern[]>();
  private static searchIndex = new Map<string, string[]>();
  private static commandPalette: QuickAction[] = [];

  /**
   * Ações rápidas padrão
   */
  private static defaultQuickActions: QuickAction[] = [
    {
      id: 'new_script',
      label: 'Novo Roteiro',
      icon: '📝',
      shortcut: 'cmd+n',
      category: 'creation',
      handler: () => window.location.href = '/generator',
      priority: 10,
      usageCount: 0
    },
    {
      id: 'quick_generate',
      label: 'Geração Rápida',
      icon: '⚡',
      shortcut: 'cmd+g',
      category: 'creation',
      handler: () => window.dispatchEvent(new CustomEvent('quickGenerate')),
      priority: 9,
      usageCount: 0
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      shortcut: 'cmd+d',
      category: 'navigation',
      handler: () => window.location.href = '/dashboard',
      priority: 8,
      usageCount: 0
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: '🔍',
      shortcut: 'cmd+k',
      category: 'tools',
      handler: () => window.dispatchEvent(new CustomEvent('openSearch')),
      priority: 10,
      usageCount: 0
    },
    {
      id: 'ai_selector',
      label: 'Escolher IA',
      icon: '🤖',
      shortcut: 'cmd+shift+a',
      category: 'tools',
      handler: () => window.dispatchEvent(new CustomEvent('openAISelector')),
      priority: 7,
      usageCount: 0
    },
    {
      id: 'voice_toggle',
      label: 'Ativar Voz',
      icon: '🎙️',
      shortcut: 'cmd+v',
      category: 'tools',
      handler: () => window.dispatchEvent(new CustomEvent('toggleVoice')),
      priority: 6,
      usageCount: 0
    },
    {
      id: 'recent_projects',
      label: 'Projetos Recentes',
      icon: '📁',
      shortcut: 'cmd+r',
      category: 'navigation',
      handler: () => window.dispatchEvent(new CustomEvent('openRecentProjects')),
      priority: 7,
      usageCount: 0
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: '📋',
      shortcut: 'cmd+t',
      category: 'creation',
      handler: () => window.dispatchEvent(new CustomEvent('openTemplates')),
      priority: 8,
      usageCount: 0
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: '⚙️',
      shortcut: 'cmd+,',
      category: 'settings',
      handler: () => window.location.href = '/settings',
      priority: 5,
      usageCount: 0
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: '❓',
      shortcut: 'cmd+/',
      category: 'tools',
      handler: () => window.dispatchEvent(new CustomEvent('openHelp')),
      priority: 4,
      usageCount: 0
    }
  ];

  /**
   * Inicializa o serviço de acesso direto
   */
  static async initialize(userId: string): Promise<void> {
    try {
      // Carregar ações padrão
      this.loadDefaultActions();

      // Carregar padrões de acesso do usuário
      await this.loadUserPatterns(userId);

      // Configurar atalhos de teclado
      this.setupKeyboardShortcuts();

      // Construir índice de busca
      this.buildSearchIndex();

      // Inicializar paleta de comandos
      this.initializeCommandPalette(userId);

      logger.info('Direct Access inicializado', { userId });

    } catch (error) {
      logger.error('Erro ao inicializar Direct Access', error);
      throw error;
    }
  }

  /**
   * Obtém ações rápidas personalizadas para o usuário
   */
  static async getPersonalizedQuickActions(
    userId: string,
    limit: number = 10
  ): Promise<QuickAction[]> {
    try {
      // Obter sugestões do PredictiveUX
      const predictions = await PredictiveUXService.getSmartSuggestions(
        userId,
        'quick-action',
        5
      );

      // Combinar com ações mais usadas
      const allActions = Array.from(this.quickActions.values());
      const sortedActions = allActions.sort((a, b) => {
        // Priorizar por uso recente e frequência
        const scoreA = this.calculateActionScore(a, predictions);
        const scoreB = this.calculateActionScore(b, predictions);
        return scoreB - scoreA;
      });

      return sortedActions.slice(0, limit);

    } catch (error) {
      logger.error('Erro ao obter ações personalizadas', error);
      return this.getDefaultQuickActions(limit);
    }
  }

  /**
   * Executa uma ação rápida
   */
  static async executeQuickAction(
    actionId: string,
    userId: string
  ): Promise<void> {
    const action = this.quickActions.get(actionId);
    if (!action) {
      throw new Error(`Ação não encontrada: ${actionId}`);
    }

    const startTime = Date.now();

    try {
      // Executar handler
      await action.handler();

      // Atualizar estatísticas
      action.usageCount++;
      action.lastUsed = new Date();
      this.quickActions.set(actionId, action);

      // Registrar padrão de acesso
      await this.recordAccessPattern(userId, actionId, Date.now() - startTime);

      logger.info('Ação executada', {
        actionId,
        duration: Date.now() - startTime
      });

    } catch (error) {
      logger.error('Erro ao executar ação', { actionId, error });
      throw error;
    }
  }

  /**
   * Busca ações por texto
   */
  static searchActions(query: string): QuickAction[] {
    const normalizedQuery = query.toLowerCase();
    const results: Array<{ action: QuickAction; score: number }> = [];

    // Buscar no índice
    this.searchIndex.forEach((keywords, actionId) => {
      const action = this.quickActions.get(actionId);
      if (!action) return;

      let score = 0;

      // Verificar label
      if (action.label.toLowerCase().includes(normalizedQuery)) {
        score += 10;
      }

      // Verificar keywords
      keywords.forEach(keyword => {
        if (keyword.includes(normalizedQuery)) {
          score += 5;
        }
      });

      // Verificar categoria
      if (action.category.includes(normalizedQuery)) {
        score += 3;
      }

      if (score > 0) {
        results.push({ action, score });
      }
    });

    // Ordenar por score e retornar
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.action);
  }

  /**
   * Obtém paleta de comandos
   */
  static getCommandPalette(filter?: string): QuickAction[] {
    if (!filter) {
      return this.commandPalette;
    }

    return this.searchActions(filter);
  }

  /**
   * Registra nova ação rápida
   */
  static registerQuickAction(action: QuickAction): void {
    this.quickActions.set(action.id, action);
    
    // Atualizar índice de busca
    this.updateSearchIndex(action);
    
    // Adicionar à paleta se prioritário
    if (action.priority >= 5) {
      this.commandPalette.push(action);
      this.commandPalette.sort((a, b) => b.priority - a.priority);
    }

    logger.debug('Ação registrada', { actionId: action.id });
  }

  /**
   * Remove ação rápida
   */
  static unregisterQuickAction(actionId: string): void {
    this.quickActions.delete(actionId);
    this.searchIndex.delete(actionId);
    this.commandPalette = this.commandPalette.filter(a => a.id !== actionId);

    logger.debug('Ação removida', { actionId });
  }

  /**
   * Obtém atalhos de teclado
   */
  static getKeyboardShortcuts(): ShortcutMap {
    const shortcuts: ShortcutMap = {};

    this.quickActions.forEach(action => {
      if (action.shortcut) {
        shortcuts[action.shortcut] = {
          action,
          description: action.label,
          enabled: true
        };
      }
    });

    return shortcuts;
  }

  /**
   * Atualiza atalho de teclado
   */
  static updateShortcut(
    actionId: string,
    newShortcut: string | null
  ): void {
    const action = this.quickActions.get(actionId);
    if (!action) return;

    // Remover atalho antigo se existir
    if (action.shortcut) {
      this.shortcuts.delete(action.shortcut);
    }

    // Definir novo atalho
    action.shortcut = newShortcut || undefined;
    this.quickActions.set(actionId, action);

    // Registrar novo atalho
    if (newShortcut) {
      this.setupSingleShortcut(newShortcut, action);
    }

    logger.debug('Atalho atualizado', { actionId, newShortcut });
  }

  /**
   * Obtém estatísticas de uso
   */
  static async getUsageStats(userId: string): Promise<{
    mostUsedActions: QuickAction[];
    avgAccessTime: number;
    totalActions: number;
    successRate: number;
  }> {
    const patterns = this.accessPatterns.get(userId) || [];
    const actions = Array.from(this.quickActions.values());

    // Ações mais usadas
    const mostUsedActions = actions
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    // Tempo médio de acesso
    const avgAccessTime = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.avgTimeToComplete, 0) / patterns.length
      : 0;

    // Total de ações
    const totalActions = actions.reduce((sum, a) => sum + a.usageCount, 0);

    // Taxa de sucesso
    const successRate = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length
      : 1;

    return {
      mostUsedActions,
      avgAccessTime,
      totalActions,
      successRate
    };
  }

  /**
   * Métodos privados
   */
  private static loadDefaultActions(): void {
    this.defaultQuickActions.forEach(action => {
      this.quickActions.set(action.id, { ...action });
    });
  }

  private static async loadUserPatterns(userId: string): Promise<void> {
    // Em produção, carregar do Firebase
    // Por enquanto, usar padrões simulados
    const mockPatterns: AccessPattern[] = [
      {
        userId,
        actionSequence: ['new_script', 'quick_generate'],
        frequency: 10,
        avgTimeToComplete: 3500,
        successRate: 0.95,
        lastAccessed: new Date()
      }
    ];

    this.accessPatterns.set(userId, mockPatterns);
  }

  private static setupKeyboardShortcuts(): void {
    // Limpar listeners anteriores
    document.removeEventListener('keydown', this.handleKeyPress);

    // Adicionar novo listener
    document.addEventListener('keydown', this.handleKeyPress.bind(this));

    logger.debug('Atalhos de teclado configurados');
  }

  private static handleKeyPress(event: KeyboardEvent): void {
    // Construir string do atalho
    let shortcut = '';
    
    if (event.metaKey || event.ctrlKey) shortcut += 'cmd+';
    if (event.shiftKey) shortcut += 'shift+';
    if (event.altKey) shortcut += 'alt+';
    
    shortcut += event.key.toLowerCase();

    // Procurar ação correspondente
    let actionFound: QuickAction | null = null;
    
    this.quickActions.forEach(action => {
      if (action.shortcut === shortcut) {
        actionFound = action;
      }
    });

    if (actionFound) {
      event.preventDefault();
      actionFound.handler();
      
      // Atualizar uso
      actionFound.usageCount++;
      actionFound.lastUsed = new Date();
      this.quickActions.set(actionFound.id, actionFound);
    }
  }

  private static setupSingleShortcut(shortcut: string, action: QuickAction): void {
    // Registrar no mapa de atalhos
    const shortcutMap = this.shortcuts.get(shortcut) || {} as ShortcutMap;
    shortcutMap[shortcut] = {
      action,
      description: action.label,
      enabled: true
    };
    this.shortcuts.set(shortcut, shortcutMap);
  }

  private static buildSearchIndex(): void {
    this.quickActions.forEach((action, actionId) => {
      const keywords: string[] = [
        action.label.toLowerCase(),
        action.category,
        action.icon
      ];

      // Adicionar palavras do label
      action.label.split(' ').forEach(word => {
        keywords.push(word.toLowerCase());
      });

      this.searchIndex.set(actionId, keywords);
    });
  }

  private static updateSearchIndex(action: QuickAction): void {
    const keywords: string[] = [
      action.label.toLowerCase(),
      action.category,
      action.icon
    ];

    action.label.split(' ').forEach(word => {
      keywords.push(word.toLowerCase());
    });

    this.searchIndex.set(action.id, keywords);
  }

  private static initializeCommandPalette(userId: string): void {
    // Adicionar todas as ações com prioridade >= 5
    this.commandPalette = Array.from(this.quickActions.values())
      .filter(a => a.priority >= 5)
      .sort((a, b) => b.priority - a.priority);
  }

  private static calculateActionScore(
    action: QuickAction,
    predictions: any[]
  ): number {
    let score = action.priority * 10;

    // Boost por uso recente
    if (action.lastUsed) {
      const hoursSinceUse = (Date.now() - action.lastUsed.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUse < 1) score += 50;
      else if (hoursSinceUse < 24) score += 20;
      else if (hoursSinceUse < 168) score += 10;
    }

    // Boost por frequência de uso
    score += action.usageCount * 2;

    // Boost por predição
    predictions.forEach(pred => {
      if (pred.action === action.id) {
        score += pred.confidence * 100;
      }
    });

    return score;
  }

  private static getDefaultQuickActions(limit: number): QuickAction[] {
    return Array.from(this.quickActions.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  private static async recordAccessPattern(
    userId: string,
    actionId: string,
    duration: number
  ): Promise<void> {
    const patterns = this.accessPatterns.get(userId) || [];
    
    // Procurar padrão existente
    let pattern = patterns.find(p => 
      p.actionSequence[p.actionSequence.length - 1] === actionId
    );

    if (pattern) {
      // Atualizar padrão existente
      pattern.frequency++;
      pattern.avgTimeToComplete = 
        (pattern.avgTimeToComplete * (pattern.frequency - 1) + duration) / pattern.frequency;
      pattern.lastAccessed = new Date();
    } else {
      // Criar novo padrão
      pattern = {
        userId,
        actionSequence: [actionId],
        frequency: 1,
        avgTimeToComplete: duration,
        successRate: 1.0,
        lastAccessed: new Date()
      };
      patterns.push(pattern);
    }

    this.accessPatterns.set(userId, patterns);

    // Em produção, salvar no Firebase
    logger.debug('Padrão de acesso registrado', { actionId, duration });
  }

  /**
   * Limpa recursos
   */
  static cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyPress);
    this.quickActions.clear();
    this.shortcuts.clear();
    this.accessPatterns.clear();
    this.searchIndex.clear();
    this.commandPalette = [];

    logger.info('Direct Access cleanup executado');
  }
} 