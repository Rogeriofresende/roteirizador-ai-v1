/**
 * V6.2 Enhanced Framework - useDirectAccess Hook
 * Hook para acesso direto rápido a funcionalidades
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DirectAccessService, QuickAction } from '../services/directAccessService';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('useDirectAccess');

interface DirectAccessState {
  isInitialized: boolean;
  quickActions: QuickAction[];
  searchResults: QuickAction[];
  isSearching: boolean;
  commandPaletteOpen: boolean;
  mostUsedActions: QuickAction[];
  stats: {
    avgAccessTime: number;
    totalActions: number;
    successRate: number;
  } | null;
}

interface UseDirectAccessOptions {
  autoInitialize?: boolean;
  maxQuickActions?: number;
  enableKeyboardShortcuts?: boolean;
  onActionExecuted?: (action: QuickAction) => void;
}

export const useDirectAccess = (options: UseDirectAccessOptions = {}) => {
  const { user } = useAuth();
  const [state, setState] = useState<DirectAccessState>({
    isInitialized: false,
    quickActions: [],
    searchResults: [],
    isSearching: false,
    commandPaletteOpen: false,
    mostUsedActions: [],
    stats: null
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar serviço
  useEffect(() => {
    if (user?.uid && options.autoInitialize !== false) {
      initialize();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      if (options.enableKeyboardShortcuts !== false) {
        DirectAccessService.cleanup();
      }
    };
  }, [user?.uid]);

  // Configurar listeners de eventos customizados
  useEffect(() => {
    const handleOpenSearch = () => openCommandPalette();
    const handleQuickGenerate = () => executeActionById('quick_generate');
    const handleOpenAISelector = () => executeActionById('ai_selector');
    const handleToggleVoice = () => executeActionById('voice_toggle');
    const handleOpenRecentProjects = () => executeActionById('recent_projects');
    const handleOpenTemplates = () => executeActionById('templates');
    const handleOpenHelp = () => executeActionById('help');

    window.addEventListener('openSearch', handleOpenSearch);
    window.addEventListener('quickGenerate', handleQuickGenerate);
    window.addEventListener('openAISelector', handleOpenAISelector);
    window.addEventListener('toggleVoice', handleToggleVoice);
    window.addEventListener('openRecentProjects', handleOpenRecentProjects);
    window.addEventListener('openTemplates', handleOpenTemplates);
    window.addEventListener('openHelp', handleOpenHelp);

    return () => {
      window.removeEventListener('openSearch', handleOpenSearch);
      window.removeEventListener('quickGenerate', handleQuickGenerate);
      window.removeEventListener('openAISelector', handleOpenAISelector);
      window.removeEventListener('toggleVoice', handleToggleVoice);
      window.removeEventListener('openRecentProjects', handleOpenRecentProjects);
      window.removeEventListener('openTemplates', handleOpenTemplates);
      window.removeEventListener('openHelp', handleOpenHelp);
    };
  }, []);

  // Inicializar Direct Access
  const initialize = useCallback(async () => {
    if (!user?.uid) return;

    try {
      await DirectAccessService.initialize(user.uid);
      
      // Carregar ações personalizadas
      const quickActions = await DirectAccessService.getPersonalizedQuickActions(
        user.uid,
        options.maxQuickActions || 10
      );

      // Carregar estatísticas
      const stats = await DirectAccessService.getUsageStats(user.uid);

      setState(prev => ({
        ...prev,
        isInitialized: true,
        quickActions,
        mostUsedActions: stats.mostUsedActions,
        stats: {
          avgAccessTime: stats.avgAccessTime,
          totalActions: stats.totalActions,
          successRate: stats.successRate
        }
      }));

      logger.info('Direct Access inicializado', {
        actionsCount: quickActions.length,
        shortcuts: options.enableKeyboardShortcuts !== false
      });

    } catch (error) {
      logger.error('Erro ao inicializar Direct Access', error);
    }
  }, [user?.uid, options.maxQuickActions, options.enableKeyboardShortcuts]);

  // Executar ação rápida
  const executeAction = useCallback(async (action: QuickAction) => {
    if (!user?.uid) return;

    try {
      await DirectAccessService.executeQuickAction(action.id, user.uid);

      // Callback opcional
      if (options.onActionExecuted) {
        options.onActionExecuted(action);
      }

      // Atualizar lista se necessário
      if (action.usageCount === 0) {
        await refreshQuickActions();
      }

      logger.info('Ação executada', { actionId: action.id });

    } catch (error) {
      logger.error('Erro ao executar ação', error);
    }
  }, [user?.uid, options.onActionExecuted]);

  // Executar ação por ID
  const executeActionById = useCallback(async (actionId: string) => {
    const action = state.quickActions.find(a => a.id === actionId) ||
                  state.searchResults.find(a => a.id === actionId);
    
    if (action) {
      await executeAction(action);
    }
  }, [state.quickActions, state.searchResults, executeAction]);

  // Buscar ações
  const searchActions = useCallback((query: string) => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setState(prev => ({ ...prev, searchResults: [], isSearching: false }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true }));

    // Debounce a busca
    searchTimeoutRef.current = setTimeout(() => {
      const results = DirectAccessService.searchActions(query);
      
      setState(prev => ({
        ...prev,
        searchResults: results,
        isSearching: false
      }));
    }, 200);
  }, []);

  // Abrir paleta de comandos
  const openCommandPalette = useCallback(() => {
    setState(prev => ({ ...prev, commandPaletteOpen: true }));
    
    // Focar no input de busca (será implementado no componente)
    setTimeout(() => {
      const searchInput = document.querySelector('#command-palette-search') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }, []);

  // Fechar paleta de comandos
  const closeCommandPalette = useCallback(() => {
    setState(prev => ({
      ...prev,
      commandPaletteOpen: false,
      searchResults: []
    }));
  }, []);

  // Atualizar ações rápidas
  const refreshQuickActions = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const quickActions = await DirectAccessService.getPersonalizedQuickActions(
        user.uid,
        options.maxQuickActions || 10
      );

      setState(prev => ({ ...prev, quickActions }));

    } catch (error) {
      logger.error('Erro ao atualizar ações', error);
    }
  }, [user?.uid, options.maxQuickActions]);

  // Registrar nova ação customizada
  const registerCustomAction = useCallback((action: QuickAction) => {
    DirectAccessService.registerQuickAction(action);
    
    // Atualizar lista
    setState(prev => ({
      ...prev,
      quickActions: [...prev.quickActions, action].sort((a, b) => b.priority - a.priority)
    }));

    logger.info('Ação customizada registrada', { actionId: action.id });
  }, []);

  // Remover ação
  const unregisterAction = useCallback((actionId: string) => {
    DirectAccessService.unregisterQuickAction(actionId);
    
    setState(prev => ({
      ...prev,
      quickActions: prev.quickActions.filter(a => a.id !== actionId)
    }));

    logger.info('Ação removida', { actionId });
  }, []);

  // Atualizar atalho
  const updateShortcut = useCallback((actionId: string, newShortcut: string | null) => {
    DirectAccessService.updateShortcut(actionId, newShortcut);
    
    // Atualizar estado local
    setState(prev => ({
      ...prev,
      quickActions: prev.quickActions.map(a =>
        a.id === actionId ? { ...a, shortcut: newShortcut || undefined } : a
      )
    }));

    logger.info('Atalho atualizado', { actionId, newShortcut });
  }, []);

  // Obter atalhos de teclado
  const getKeyboardShortcuts = useCallback(() => {
    return DirectAccessService.getKeyboardShortcuts();
  }, []);

  // Obter ações da paleta de comandos
  const getCommandPaletteActions = useCallback((filter?: string) => {
    return DirectAccessService.getCommandPalette(filter);
  }, []);

  return {
    // Estado
    isInitialized: state.isInitialized,
    quickActions: state.quickActions,
    searchResults: state.searchResults,
    isSearching: state.isSearching,
    commandPaletteOpen: state.commandPaletteOpen,
    mostUsedActions: state.mostUsedActions,
    stats: state.stats,

    // Ações principais
    executeAction,
    executeActionById,
    searchActions,
    openCommandPalette,
    closeCommandPalette,
    refreshQuickActions,

    // Gerenciamento de ações
    registerCustomAction,
    unregisterAction,
    updateShortcut,

    // Utilidades
    getKeyboardShortcuts,
    getCommandPaletteActions,

    // Helpers
    hasQuickActions: state.quickActions.length > 0,
    avgAccessTimeFormatted: state.stats 
      ? `${(state.stats.avgAccessTime / 1000).toFixed(1)}s`
      : null,
    
    // Métricas de performance
    isUnder5Seconds: state.stats 
      ? state.stats.avgAccessTime < 5000
      : true,
    
    // Ações mais comuns por categoria
    getActionsByCategory: (category: QuickAction['category']) =>
      state.quickActions.filter(a => a.category === category)
  };
}; 