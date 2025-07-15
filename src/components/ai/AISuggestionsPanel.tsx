/**
 * AI SUGGESTIONS PANEL - SPRINT 5
 * Intelligent suggestions panel component
 * V7.5 Enhanced - IA Beta Implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAISuggestions } from '../../hooks/useAISuggestions';
import { AISuggestion, UserContext } from '../../services/ai/AISuggestionsService';

interface AISuggestionsPanelProps {
  userId: string;
  currentInput?: string;
  selectedType?: AISuggestion['type'];
  onSuggestionSelect?: (suggestion: AISuggestion) => void;
  onSuggestionApply?: (suggestion: AISuggestion) => void;
  className?: string;
  enableRealtime?: boolean;
  maxSuggestions?: number;
}

const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  userId,
  currentInput = '',
  selectedType = 'content',
  onSuggestionSelect,
  onSuggestionApply,
  className = '',
  enableRealtime = true,
  maxSuggestions = 5
}) => {
  const {
    suggestions,
    isLoading,
    error,
    getSuggestionsByType,
    getContentSuggestions,
    getTitleSuggestions,
    getCategorySuggestions,
    getImprovementSuggestions,
    getNextActionSuggestions,
    getRealTimeSuggestions,
    formatSuggestion,
    createUserContext,
    getSuggestionStats,
    markSuggestionAsUsed
  } = useAISuggestions({ 
    autoLoad: true, 
    enableRealtime, 
    debounceMs: 300 
  });

  const [activeTab, setActiveTab] = useState<AISuggestion['type']>(selectedType);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Create user context
  const userContext = createUserContext(
    userId,
    [], // Recent ideas would be fetched from user's history
    [], // Preferred categories would be loaded from user preferences
    ['youtube', 'instagram', 'tiktok'] // Default platforms
  );

  // Load suggestions based on active tab
  const loadSuggestions = useCallback(async () => {
    switch (activeTab) {
      case 'content':
        await getContentSuggestions(userContext, currentInput, maxSuggestions);
        break;
      case 'title':
        await getTitleSuggestions(userContext, currentInput, maxSuggestions);
        break;
      case 'category':
        await getCategorySuggestions(userContext, currentInput, maxSuggestions);
        break;
      case 'improvement':
        await getImprovementSuggestions(userContext, currentInput, maxSuggestions);
        break;
      case 'next_action':
        await getNextActionSuggestions(userContext, maxSuggestions);
        break;
    }
  }, [activeTab, currentInput, maxSuggestions, userContext, getContentSuggestions, getTitleSuggestions, getCategorySuggestions, getImprovementSuggestions, getNextActionSuggestions]);

  // Handle real-time suggestions
  useEffect(() => {
    if (enableRealtime && currentInput.length >= 3) {
      getRealTimeSuggestions(userContext, currentInput, activeTab);
    }
  }, [currentInput, activeTab, enableRealtime, userContext, getRealTimeSuggestions]);

  // Load suggestions when tab changes
  useEffect(() => {
    loadSuggestions();
  }, [activeTab, loadSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    setExpandedSuggestion(
      expandedSuggestion === suggestion.id ? null : suggestion.id
    );
    onSuggestionSelect?.(suggestion);
  };

  // Handle suggestion application
  const handleSuggestionApply = (suggestion: AISuggestion) => {
    setAppliedSuggestions(prev => new Set(prev).add(suggestion.id));
    markSuggestionAsUsed(suggestion.id);
    onSuggestionApply?.(suggestion);
  };

  // Get tab suggestions
  const tabSuggestions = getSuggestionsByType(activeTab);

  // Tab configuration
  const tabs = [
    { id: 'content', label: 'Conteúdo', icon: '💡' },
    { id: 'title', label: 'Títulos', icon: '📝' },
    { id: 'category', label: 'Categorias', icon: '🏷️' },
    { id: 'improvement', label: 'Melhorias', icon: '⚡' },
    { id: 'next_action', label: 'Ações', icon: '🎯' }
  ];

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get suggestion stats
  const stats = getSuggestionStats();

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            🧠 Sugestões de IA
          </h3>
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
            <span className="text-sm text-gray-500">
              {stats.total} sugestões
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Alta Confiança</span>
            <span className="text-lg font-semibold text-green-600">
              {stats.highConfidence}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Média Confiança</span>
            <span className="text-lg font-semibold text-yellow-600">
              {stats.mediumConfidence}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Confiança Média</span>
            <span className="text-lg font-semibold text-blue-600">
              {Math.round(stats.averageConfidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AISuggestion['type'])}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : tabSuggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🤖</div>
            <p>Nenhuma sugestão disponível para este tipo</p>
            <p className="text-sm">Tente inserir mais conteúdo ou mude de categoria</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tabSuggestions.slice(0, maxSuggestions).map((suggestion) => {
              const formatted = formatSuggestion(suggestion);
              const isExpanded = expandedSuggestion === suggestion.id;
              const isApplied = appliedSuggestions.has(suggestion.id);

              return (
                <div
                  key={suggestion.id}
                  className={`border border-gray-200 rounded-lg p-3 transition-all hover:shadow-md cursor-pointer ${
                    isApplied ? 'bg-green-50 border-green-200' : 'bg-white'
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{formatted.icon}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {formatted.formattedConfidence}
                        </span>
                        {isApplied && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Aplicado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium mb-1">
                        {suggestion.content}
                      </p>
                      <p className="text-sm text-gray-600">
                        {suggestion.reasoning}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuggestionApply(suggestion);
                        }}
                        disabled={isApplied}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          isApplied
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isApplied ? 'Aplicado' : 'Aplicar'}
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Fonte:</span>
                          <p className="text-gray-600">{suggestion.source}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Relevância:</span>
                          <p className="text-gray-600">
                            {Math.round(suggestion.metadata.relevanceScore * 100)}%
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Originalidade:</span>
                          <p className="text-gray-600">
                            {Math.round(suggestion.metadata.originalityScore * 100)}%
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Engajamento:</span>
                          <p className="text-gray-600">
                            {Math.round(suggestion.metadata.engagementPotential * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Powered by AI • Última atualização: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={loadSuggestions}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionsPanel; 