/**
 * USE AI SUGGESTIONS HOOK - SPRINT 5
 * React hook for AI-powered suggestions
 * V7.5 Enhanced - IA Beta Implementation
 */

import { useState, useEffect, useCallback } from 'react';
import AISuggestionsService, { 
  AISuggestion, 
  UserContext, 
  SuggestionRequest 
} from '../services/ai/AISuggestionsService';

interface UseAISuggestionsOptions {
  autoLoad?: boolean;
  enableRealtime?: boolean;
  debounceMs?: number;
}

interface AISuggestionsState {
  suggestions: AISuggestion[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  totalSuggestions: number;
  suggestionsByType: Record<string, AISuggestion[]>;
}

export const useAISuggestions = (options: UseAISuggestionsOptions = {}) => {
  const {
    autoLoad = true,
    enableRealtime = true,
    debounceMs = 300
  } = options;

  // Service instance
  const [service] = useState(() => new AISuggestionsService());

  // State
  const [state, setState] = useState<AISuggestionsState>({
    suggestions: [],
    isLoading: false,
    error: null,
    lastUpdate: null,
    totalSuggestions: 0,
    suggestionsByType: {}
  });

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Get suggestions based on context
   */
  const getSuggestions = useCallback(async (request: SuggestionRequest): Promise<AISuggestion[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const suggestions = await service.getSuggestions(request);
      
      // Group suggestions by type
      const suggestionsByType: Record<string, AISuggestion[]> = {};
      suggestions.forEach(suggestion => {
        if (!suggestionsByType[suggestion.type]) {
          suggestionsByType[suggestion.type] = [];
        }
        suggestionsByType[suggestion.type].push(suggestion);
      });

      setState(prev => ({
        ...prev,
        suggestions,
        suggestionsByType,
        totalSuggestions: suggestions.length,
        isLoading: false,
        lastUpdate: new Date()
      }));

      return suggestions;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get suggestions'
      }));
      return [];
    }
  }, [service]);

  /**
   * Get content suggestions
   */
  const getContentSuggestions = useCallback(async (
    context: UserContext,
    currentInput?: string,
    limit?: number
  ): Promise<AISuggestion[]> => {
    return getSuggestions({
      context,
      currentInput,
      suggestionType: 'content',
      limit,
      minConfidence: 0.6
    });
  }, [getSuggestions]);

  /**
   * Get title suggestions
   */
  const getTitleSuggestions = useCallback(async (
    context: UserContext,
    content?: string,
    limit?: number
  ): Promise<AISuggestion[]> => {
    return getSuggestions({
      context,
      currentInput: content,
      suggestionType: 'title',
      limit,
      minConfidence: 0.7
    });
  }, [getSuggestions]);

  /**
   * Get category suggestions
   */
  const getCategorySuggestions = useCallback(async (
    context: UserContext,
    content?: string,
    limit?: number
  ): Promise<AISuggestion[]> => {
    return getSuggestions({
      context,
      currentInput: content,
      suggestionType: 'category',
      limit,
      minConfidence: 0.8
    });
  }, [getSuggestions]);

  /**
   * Get improvement suggestions
   */
  const getImprovementSuggestions = useCallback(async (
    context: UserContext,
    content?: string,
    limit?: number
  ): Promise<AISuggestion[]> => {
    return getSuggestions({
      context,
      currentInput: content,
      suggestionType: 'improvement',
      limit,
      minConfidence: 0.6
    });
  }, [getSuggestions]);

  /**
   * Get next action suggestions
   */
  const getNextActionSuggestions = useCallback(async (
    context: UserContext,
    limit?: number
  ): Promise<AISuggestion[]> => {
    return getSuggestions({
      context,
      suggestionType: 'next_action',
      limit,
      minConfidence: 0.7
    });
  }, [getSuggestions]);

  /**
   * Get suggestions with debounce
   */
  const getSuggestionsDebounced = useCallback((request: SuggestionRequest): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      getSuggestions(request);
    }, debounceMs);

    setDebounceTimer(timer);
  }, [getSuggestions, debounceMs, debounceTimer]);

  /**
   * Get real-time suggestions as user types
   */
  const getRealTimeSuggestions = useCallback((
    context: UserContext,
    input: string,
    type: AISuggestion['type'] = 'content'
  ): void => {
    if (!enableRealtime || input.length < 3) return;

    getSuggestionsDebounced({
      context,
      currentInput: input,
      suggestionType: type,
      limit: 5,
      minConfidence: 0.6
    });
  }, [enableRealtime, getSuggestionsDebounced]);

  /**
   * Filter suggestions by confidence
   */
  const filterByConfidence = useCallback((minConfidence: number): AISuggestion[] => {
    return state.suggestions.filter(suggestion => suggestion.confidence >= minConfidence);
  }, [state.suggestions]);

  /**
   * Get suggestions by type
   */
  const getSuggestionsByType = useCallback((type: AISuggestion['type']): AISuggestion[] => {
    return state.suggestionsByType[type] || [];
  }, [state.suggestionsByType]);

  /**
   * Get top suggestions
   */
  const getTopSuggestions = useCallback((limit: number = 5): AISuggestion[] => {
    return state.suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }, [state.suggestions]);

  /**
   * Clear suggestions
   */
  const clearSuggestions = useCallback((): void => {
    setState(prev => ({
      ...prev,
      suggestions: [],
      suggestionsByType: {},
      totalSuggestions: 0,
      lastUpdate: null
    }));
  }, []);

  /**
   * Mark suggestion as used
   */
  const markSuggestionAsUsed = useCallback((suggestionId: string): void => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, metadata: { ...suggestion.metadata, used: true } }
          : suggestion
      )
    }));
  }, []);

  /**
   * Get user context helper
   */
  const createUserContext = useCallback((
    userId: string,
    recentIdeas: string[] = [],
    preferredCategories: string[] = [],
    platforms: string[] = []
  ): UserContext => {
    return {
      userId,
      recentIdeas,
      preferredCategories,
      platforms,
      successfulContent: [], // Would be populated from user's successful content
      userBehavior: {
        sessionTime: Date.now() - (performance.now() || 0),
        actionsPerSession: 0, // Would be tracked
        preferredFeatures: [] // Would be populated from usage analytics
      }
    };
  }, []);

  /**
   * Get suggestion statistics
   */
  const getSuggestionStats = useCallback() => {
    const stats = {
      total: state.totalSuggestions,
      byType: {} as Record<string, number>,
      averageConfidence: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0
    };

    // Count by type
    Object.entries(state.suggestionsByType).forEach(([type, suggestions]) => {
      stats.byType[type] = suggestions.length;
    });

    // Calculate confidence distribution
    if (state.suggestions.length > 0) {
      const totalConfidence = state.suggestions.reduce((sum, s) => sum + s.confidence, 0);
      stats.averageConfidence = totalConfidence / state.suggestions.length;

      stats.highConfidence = state.suggestions.filter(s => s.confidence >= 0.8).length;
      stats.mediumConfidence = state.suggestions.filter(s => s.confidence >= 0.6 && s.confidence < 0.8).length;
      stats.lowConfidence = state.suggestions.filter(s => s.confidence < 0.6).length;
    }

    return stats;
  }, [state]);

  /**
   * Format suggestion for display
   */
  const formatSuggestion = useCallback((suggestion: AISuggestion) => {
    return {
      ...suggestion,
      formattedConfidence: `${Math.round(suggestion.confidence * 100)}%`,
      confidenceLevel: suggestion.confidence >= 0.8 ? 'high' : 
                      suggestion.confidence >= 0.6 ? 'medium' : 'low',
      icon: getSuggestionIcon(suggestion.type),
      color: getSuggestionColor(suggestion.type)
    };
  }, []);

  /**
   * Get suggestion icon
   */
  const getSuggestionIcon = (type: AISuggestion['type']): string => {
    switch (type) {
      case 'content': return '💡';
      case 'title': return '📝';
      case 'category': return '🏷️';
      case 'improvement': return '⚡';
      case 'next_action': return '🎯';
      default: return '💭';
    }
  };

  /**
   * Get suggestion color
   */
  const getSuggestionColor = (type: AISuggestion['type']): string => {
    switch (type) {
      case 'content': return 'blue';
      case 'title': return 'green';
      case 'category': return 'purple';
      case 'improvement': return 'orange';
      case 'next_action': return 'red';
      default: return 'gray';
    }
  };

  /**
   * Auto-load suggestions on mount
   */
  useEffect(() => {
    if (autoLoad) {
      const userId = localStorage.getItem('userId') || 'anonymous';
      const context = createUserContext(userId);
      
      getContentSuggestions(context, '', 5);
    }
  }, [autoLoad, createUserContext, getContentSuggestions]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    // State
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdate: state.lastUpdate,
    totalSuggestions: state.totalSuggestions,
    suggestionsByType: state.suggestionsByType,

    // Actions
    getSuggestions,
    getContentSuggestions,
    getTitleSuggestions,
    getCategorySuggestions,
    getImprovementSuggestions,
    getNextActionSuggestions,
    getRealTimeSuggestions,
    clearSuggestions,
    markSuggestionAsUsed,

    // Utilities
    filterByConfidence,
    getSuggestionsByType,
    getTopSuggestions,
    getSuggestionStats,
    formatSuggestion,
    createUserContext,

    // Service
    service
  };
};

export default useAISuggestions; 