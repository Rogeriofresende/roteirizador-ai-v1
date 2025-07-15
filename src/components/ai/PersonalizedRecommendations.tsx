/**
 * PERSONALIZED RECOMMENDATIONS - SPRINT 5
 * AI-powered personalized recommendations component
 * V7.5 Enhanced - IA Beta Implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import PersonalizedRecommendationService, { Recommendation } from '../../services/ai/PersonalizedRecommendationService';

interface PersonalizedRecommendationsProps {
  userId: string;
  type?: Recommendation['type'];
  limit?: number;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  className?: string;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  userId,
  type,
  limit = 8,
  onRecommendationClick,
  className = ''
}) => {
  const [service] = useState(() => new PersonalizedRecommendationService());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Recommendation['type'] | 'all'>('all');

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await service.getRecommendations(
        userId,
        type || (activeFilter === 'all' ? undefined : activeFilter),
        limit
      );
      setRecommendations(results);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError('Erro ao carregar recomendações');
    } finally {
      setIsLoading(false);
    }
  }, [service, userId, type, activeFilter, limit]);

  // Load recommendations on mount and when filters change
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Handle recommendation click
  const handleRecommendationClick = (recommendation: Recommendation) => {
    onRecommendationClick?.(recommendation);
  };

  // Get recommendation icon
  const getRecommendationIcon = (type: Recommendation['type']): string => {
    const icons = {
      'content': '💡',
      'template': '📋',
      'action': '🎯',
      'feature': '⚡',
      'collaboration': '🤝'
    };
    return icons[type] || '💫';
  };

  // Get priority color
  const getPriorityColor = (priority: Recommendation['priority']): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Filter recommendations
  const filteredRecommendations = activeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === activeFilter);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'Todas', icon: '🌟' },
    { value: 'content', label: 'Conteúdo', icon: '💡' },
    { value: 'template', label: 'Templates', icon: '📋' },
    { value: 'action', label: 'Ações', icon: '🎯' },
    { value: 'feature', label: 'Recursos', icon: '⚡' },
    { value: 'collaboration', label: 'Colaboração', icon: '🤝' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            🎯 Recomendações Personalizadas
          </h3>
          <button
            onClick={loadRecommendations}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeFilter === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🤖</div>
            <p>Nenhuma recomendação disponível</p>
            <p className="text-sm">Tente usar mais o sistema para obter recomendações personalizadas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
                onClick={() => handleRecommendationClick(recommendation)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{getRecommendationIcon(recommendation.type)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 line-clamp-1">
                        {recommendation.title}
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {recommendation.type}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {recommendation.description}
                </p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <span>⏱️</span>
                    <span>{recommendation.metadata.timeToComplete}min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>📊</span>
                    <span>Valor: {recommendation.metadata.estimatedValue}/10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🎯</span>
                    <span className={getDifficultyColor(recommendation.metadata.difficulty)}>
                      {recommendation.metadata.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{Math.round(recommendation.confidence * 100)}%</span>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="bg-gray-50 rounded-md p-2 mb-3">
                  <p className="text-xs text-gray-600">
                    <strong>Por que recomendamos:</strong> {recommendation.reasoning}
                  </p>
                </div>

                {/* Based On */}
                <div className="flex flex-wrap gap-1">
                  {recommendation.metadata.basedOn.map((basis, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {basis.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {filteredRecommendations.length} recomendações encontradas
          </span>
          <span>
            Powered by AI • Atualizado: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations; 