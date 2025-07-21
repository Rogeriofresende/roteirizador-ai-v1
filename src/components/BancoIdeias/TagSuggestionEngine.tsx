/**
 * 🏷️ TAG SUGGESTION ENGINE V9.0
 * 
 * Componente inteligente que usa Gemini AI para sugerir tags relevantes
 * baseado no conteúdo da ideia de roteiro
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature Sistema de Tags Inteligentes
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Tags, Loader2, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SuggestedTag {
  id: string;
  name: string;
  category: 'genero' | 'tema' | 'personagem' | 'setting' | 'mood' | 'publico';
  confidence: number;
  reasoning: string;
}

export interface TagSuggestionResult {
  tags: SuggestedTag[];
  processing_time: number;
  confidence_score: number;
}

interface TagSuggestionEngineProps {
  ideaText: string;
  onTagsGenerated: (tags: SuggestedTag[]) => void;
  onTagSelect: (tag: SuggestedTag) => void;
  selectedTags: SuggestedTag[];
  isEnabled?: boolean;
  maxSuggestions?: number;
}

// ============================================================================
// TAG SUGGESTION ENGINE COMPONENT
// ============================================================================

export const TagSuggestionEngine: React.FC<TagSuggestionEngineProps> = ({
  ideaText,
  onTagsGenerated,
  onTagSelect,
  selectedTags,
  isEnabled = true,
  maxSuggestions = 8
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  
  // ============================================================================
  // GEMINI AI INTEGRATION
  // ============================================================================
  
  const generateTagSuggestions = useCallback(async (text: string): Promise<TagSuggestionResult> => {
    const startTime = Date.now();
    
    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Prompt otimizado para sugestão de tags
      const prompt = `
Analise a seguinte ideia de roteiro e sugira tags relevantes:

IDEIA: "${text}"

INSTRUÇÕES:
1. Analise o conteúdo e identifique elementos-chave
2. Sugira entre 6-8 tags mais relevantes
3. Categorize cada tag como: genero, tema, personagem, setting, mood, publico
4. Atribua um score de confiança (0.0-1.0) para cada tag
5. Forneça uma breve justificativa para cada tag

FORMATO DE RESPOSTA (JSON):
{
  "tags": [
    {
      "name": "nome_da_tag",
      "category": "categoria",
      "confidence": 0.9,
      "reasoning": "justificativa"
    }
  ]
}

APENAS RETORNE O JSON, SEM TEXTO ADICIONAL.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      // Parse da resposta JSON
      const parsedResponse = JSON.parse(text_response.replace(/```json\n?|\n?```/g, ''));
      
      // Processar tags com IDs únicos
      const processedTags: SuggestedTag[] = parsedResponse.tags.map((tag: any, index: number) => ({
        id: `tag-${Date.now()}-${index}`,
        name: tag.name,
        category: tag.category,
        confidence: tag.confidence,
        reasoning: tag.reasoning
      })).slice(0, maxSuggestions);

      const endTime = Date.now();
      const processing_time = endTime - startTime;
      
      return {
        tags: processedTags,
        processing_time,
        confidence_score: processedTags.reduce((sum, tag) => sum + tag.confidence, 0) / processedTags.length
      };
      
    } catch (error) {
      console.error('Erro ao gerar sugestões de tags:', error);
      throw new Error('Falha na análise de tags com IA');
    }
  }, [maxSuggestions]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleGenerateTags = useCallback(async () => {
    if (!ideaText.trim() || !isEnabled) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await generateTagSuggestions(ideaText);
      setSuggestedTags(result.tags);
      setProcessingTime(result.processing_time);
      onTagsGenerated(result.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsAnalyzing(false);
    }
  }, [ideaText, isEnabled, generateTagSuggestions, onTagsGenerated]);

  const handleTagClick = useCallback((tag: SuggestedTag) => {
    onTagSelect(tag);
  }, [onTagSelect]);

  const isTagSelected = useCallback((tag: SuggestedTag) => {
    return selectedTags.some(selected => selected.id === tag.id);
  }, [selectedTags]);

  // ============================================================================
  // AUTO-GENERATION EFFECT
  // ============================================================================
  
  useEffect(() => {
    // Auto-gerar tags quando o texto muda (com debounce)
    if (ideaText.trim().length > 50) {
      const debounceTimer = setTimeout(() => {
        handleGenerateTags();
      }, 1000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [ideaText, handleGenerateTags]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getCategoryColor = (category: SuggestedTag['category']) => {
    const colors = {
      genero: 'bg-purple-100 text-purple-800 border-purple-200',
      tema: 'bg-blue-100 text-blue-800 border-blue-200',
      personagem: 'bg-green-100 text-green-800 border-green-200',
      setting: 'bg-orange-100 text-orange-800 border-orange-200',
      mood: 'bg-pink-100 text-pink-800 border-pink-200',
      publico: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return '🔥';
    if (confidence >= 0.6) return '⭐';
    if (confidence >= 0.4) return '👍';
    return '🤔';
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (!isEnabled) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">Sugestões Inteligentes de Tags</h3>
          {processingTime > 0 && (
            <span className="text-xs text-gray-500">({processingTime}ms)</span>
          )}
        </div>
        
        <Button
          onClick={handleGenerateTags}
          disabled={isAnalyzing || !ideaText.trim()}
          size="sm"
          variant="outline"
          className="text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Tags className="w-4 h-4 mr-2" />
              Gerar Tags
            </>
          )}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Tags Grid */}
      {suggestedTags.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Clique nas tags para adicioná-las à sua ideia:
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 text-left
                  ${isTagSelected(tag) 
                    ? 'border-purple-400 bg-purple-100 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(tag.category)}`}
                  >
                    {tag.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{getConfidenceIcon(tag.confidence)}</span>
                    {isTagSelected(tag) && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                </div>
                
                <div className="font-medium text-gray-800 mb-1">
                  {tag.name}
                </div>
                
                <div className="text-xs text-gray-600 line-clamp-2">
                  {tag.reasoning}
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${tag.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(tag.confidence * 100)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && suggestedTags.length === 0 && ideaText.trim() && (
        <div className="text-center py-6 text-gray-500">
          <Tags className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Clique em "Gerar Tags" para receber sugestões inteligentes
          </p>
        </div>
      )}

      {/* Hint */}
      {!ideaText.trim() && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm">
            Digite sua ideia acima para receber sugestões automáticas de tags
          </p>
        </div>
      )}
    </Card>
  );
};

export default TagSuggestionEngine;