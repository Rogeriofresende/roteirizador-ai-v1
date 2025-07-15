/**
 * SMART CATEGORIZATION WIDGET - SPRINT 5
 * Intelligent categorization widget with machine learning
 * V7.5 Enhanced - IA Beta Implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import SmartCategorizationService, { CategoryPrediction } from '../../services/ai/SmartCategorizationService';

interface SmartCategorizationWidgetProps {
  content: string;
  onCategorySelect?: (category: string) => void;
  onFeedback?: (feedback: any) => void;
  className?: string;
  showConfidence?: boolean;
  maxSuggestions?: number;
  autoPredict?: boolean;
}

const SmartCategorizationWidget: React.FC<SmartCategorizationWidgetProps> = ({
  content,
  onCategorySelect,
  onFeedback,
  className = '',
  showConfidence = true,
  maxSuggestions = 5,
  autoPredict = true
}) => {
  const [service] = useState(() => new SmartCategorizationService());
  const [predictions, setPredictions] = useState<CategoryPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Get predictions for content
  const getPredictions = useCallback(async (inputContent: string) => {
    if (!inputContent || inputContent.length < 10) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await service.predictCategory(inputContent);
      setPredictions(results.slice(0, maxSuggestions));
    } catch (error) {
      console.error('Error getting category predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, [service, maxSuggestions]);

  // Auto-predict when content changes
  useEffect(() => {
    if (autoPredict && content.length >= 10) {
      const debounceTimer = setTimeout(() => {
        getPredictions(content);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [content, autoPredict, getPredictions]);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
    setShowFeedback(true);
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (isCorrect: boolean) => {
    if (!selectedCategory) return;

    const feedback = {
      contentId: `content_${Date.now()}`,
      predictedCategory: selectedCategory,
      actualCategory: selectedCategory,
      feedback: isCorrect ? 'correct' : 'incorrect',
      timestamp: new Date()
    };

    try {
      await service.processFeedback(feedback);
      onFeedback?.(feedback);
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Get category icon
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Educação': '📚',
      'Entretenimento': '🎭',
      'Tecnologia': '💻',
      'Estilo de Vida': '🌟',
      'Negócios': '💼',
      'Viagem': '✈️',
      'Saúde': '🏥',
      'Esportes': '⚽',
      'Culinária': '🍽️',
      'Arte': '🎨'
    };
    return icons[category] || '📂';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          🏷️ Categorização Inteligente
        </h4>
        {isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        )}
      </div>

      {/* Content Preview */}
      {content && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-1">Analisando conteúdo:</p>
          <p className="text-sm text-gray-800 line-clamp-3">
            {content.length > 150 ? `${content.substring(0, 150)}...` : content}
          </p>
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Categorias Sugeridas:
          </h5>
          
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === prediction.category
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCategorySelect(prediction.category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(prediction.category)}</span>
                  <span className="font-medium text-gray-800">
                    {prediction.category}
                  </span>
                </div>
                
                {showConfidence && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                )}
              </div>

              {/* Subcategories */}
              {prediction.subcategories.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {prediction.subcategories.slice(0, 3).map((subcategory, subIndex) => (
                      <span
                        key={subIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {subcategory}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <p className="text-xs text-gray-500 mt-2">
                {prediction.reasoning}
              </p>

              {/* Keyword matches */}
              {prediction.metadata.keywordMatches.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Palavras-chave encontradas:</p>
                  <div className="flex flex-wrap gap-1">
                    {prediction.metadata.keywordMatches.slice(0, 5).map((keyword, keyIndex) => (
                      <span
                        key={keyIndex}
                        className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No predictions state */}
      {!isLoading && predictions.length === 0 && content.length >= 10 && (
        <div className="text-center py-6 text-gray-500">
          <div className="text-3xl mb-2">🤖</div>
          <p className="text-sm">Não foi possível categorizar este conteúdo</p>
          <p className="text-xs">Tente adicionar mais detalhes ou contexto</p>
        </div>
      )}

      {/* Empty state */}
      {!content && (
        <div className="text-center py-6 text-gray-500">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm">Digite seu conteúdo para ver sugestões de categoria</p>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && !feedbackSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Feedback da Categorização</h3>
            <p className="text-gray-600 mb-4">
              A categoria <strong>{selectedCategory}</strong> está correta para este conteúdo?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleFeedbackSubmit(true)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                ✓ Sim, está correta
              </button>
              <button
                onClick={() => handleFeedbackSubmit(false)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                ✗ Não, está incorreta
              </button>
            </div>
            <button
              onClick={() => setShowFeedback(false)}
              className="w-full mt-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Feedback Success */}
      {feedbackSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">Obrigado pelo feedback!</h3>
            <p className="text-gray-600">
              Sua avaliação ajuda a melhorar a precisão da categorização.
            </p>
          </div>
        </div>
      )}

      {/* Manual Refresh */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => getPredictions(content)}
          disabled={isLoading || !content}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isLoading ? 'Analisando...' : 'Analisar Novamente'}
        </button>
        
        <span className="text-xs text-gray-500">
          Powered by ML • Precisão: ~85%
        </span>
      </div>
    </div>
  );
};

export default SmartCategorizationWidget; 