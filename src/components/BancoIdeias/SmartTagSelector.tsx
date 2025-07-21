/**
 * 🏷️ SMART TAG SELECTOR V9.0
 * 
 * Interface visual avançada para seleção e gerenciamento de tags
 * Combina sugestões IA com controle manual do usuário
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature Sistema de Tags Inteligentes
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback, useMemo } from 'react';
import { X, Plus, Search, Filter, Sparkles, Hash } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SuggestedTag } from './TagSuggestionEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TagCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CustomTag {
  id: string;
  name: string;
  category: string;
  isCustom: boolean;
}

interface SmartTagSelectorProps {
  selectedTags: SuggestedTag[];
  onTagAdd: (tag: SuggestedTag) => void;
  onTagRemove: (tagId: string) => void;
  onTagsChange: (tags: SuggestedTag[]) => void;
  suggestedTags?: SuggestedTag[];
  placeholder?: string;
  maxTags?: number;
  enableCustomTags?: boolean;
  enableFiltering?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TAG_CATEGORIES: TagCategory[] = [
  { id: 'genero', name: 'Gênero', color: 'purple', icon: '🎭' },
  { id: 'tema', name: 'Tema', color: 'blue', icon: '💡' },
  { id: 'personagem', name: 'Personagem', color: 'green', icon: '👥' },
  { id: 'setting', name: 'Cenário', color: 'orange', icon: '🏞️' },
  { id: 'mood', name: 'Clima', color: 'pink', icon: '🎨' },
  { id: 'publico', name: 'Público', color: 'yellow', icon: '🎯' }
];

const POPULAR_TAGS: CustomTag[] = [
  { id: 'drama-1', name: 'Drama', category: 'genero', isCustom: false },
  { id: 'comedia-1', name: 'Comédia', category: 'genero', isCustom: false },
  { id: 'acao-1', name: 'Ação', category: 'genero', isCustom: false },
  { id: 'romance-1', name: 'Romance', category: 'genero', isCustom: false },
  { id: 'familia-1', name: 'Família', category: 'tema', isCustom: false },
  { id: 'trabalho-1', name: 'Trabalho', category: 'tema', isCustom: false },
  { id: 'amizade-1', name: 'Amizade', category: 'tema', isCustom: false },
  { id: 'cidade-1', name: 'Cidade', category: 'setting', isCustom: false },
  { id: 'casa-1', name: 'Casa', category: 'setting', isCustom: false }
];

// ============================================================================
// SMART TAG SELECTOR COMPONENT
// ============================================================================

export const SmartTagSelector: React.FC<SmartTagSelectorProps> = ({
  selectedTags,
  onTagAdd,
  onTagRemove,
  onTagsChange,
  suggestedTags = [],
  placeholder = "Buscar ou criar tags...",
  maxTags = 10,
  enableCustomTags = true,
  enableFiltering = true
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreatingCustomTag, setIsCreatingCustomTag] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const canAddMoreTags = selectedTags.length < maxTags;
  
  const filteredSuggestions = useMemo(() => {
    let tags = [...suggestedTags, ...POPULAR_TAGS.map(tag => ({
      id: tag.id,
      name: tag.name,
      category: tag.category as SuggestedTag['category'],
      confidence: 0.8,
      reasoning: 'Tag popular'
    }))];

    // Filter by search query
    if (searchQuery.trim()) {
      tags = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      tags = tags.filter(tag => tag.category === selectedCategory);
    }

    // Exclude already selected tags
    tags = tags.filter(tag => 
      !selectedTags.some(selected => selected.name.toLowerCase() === tag.name.toLowerCase())
    );

    return tags.slice(0, 12); // Limit suggestions
  }, [suggestedTags, searchQuery, selectedCategory, selectedTags]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleTagSelect = useCallback((tag: SuggestedTag) => {
    if (canAddMoreTags) {
      onTagAdd(tag);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  }, [canAddMoreTags, onTagAdd]);

  const handleTagRemove = useCallback((tagId: string) => {
    onTagRemove(tagId);
  }, [onTagRemove]);

  const handleCreateCustomTag = useCallback(() => {
    if (!searchQuery.trim() || !enableCustomTags || !canAddMoreTags) return;

    const customTag: SuggestedTag = {
      id: `custom-${Date.now()}`,
      name: searchQuery.trim(),
      category: selectedCategory !== 'all' ? selectedCategory as SuggestedTag['category'] : 'tema',
      confidence: 1.0,
      reasoning: 'Tag personalizada criada pelo usuário'
    };

    onTagAdd(customTag);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsCreatingCustomTag(false);
  }, [searchQuery, enableCustomTags, canAddMoreTags, selectedCategory, onTagAdd]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    setIsCreatingCustomTag(
      value.length > 0 && 
      enableCustomTags && 
      !filteredSuggestions.some(tag => tag.name.toLowerCase() === value.toLowerCase())
    );
  }, [enableCustomTags, filteredSuggestions]);

  const getCategoryData = useCallback((categoryId: string) => {
    return TAG_CATEGORIES.find(cat => cat.id === categoryId) || TAG_CATEGORIES[0];
  }, []);

  const getCategoryClasses = useCallback((category: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    const categoryData = getCategoryData(category);
    return colors[categoryData.color as keyof typeof colors] || colors.blue;
  }, [getCategoryData]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderSelectedTags = () => (
    <div className="flex flex-wrap gap-2 mb-3">
      {selectedTags.map((tag) => {
        const categoryData = getCategoryData(tag.category);
        return (
          <div
            key={tag.id}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2
              ${getCategoryClasses(tag.category)}
              transition-all duration-200 hover:shadow-sm
            `}
          >
            <span className="text-sm">{categoryData.icon}</span>
            <span className="font-medium">{tag.name}</span>
            <button
              onClick={() => handleTagRemove(tag.id)}
              className="ml-1 p-0.5 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderCategoryFilter = () => (
    <div className="flex gap-2 mb-3 overflow-x-auto">
      <button
        onClick={() => setSelectedCategory('all')}
        className={`
          px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
          ${selectedCategory === 'all' 
            ? 'bg-gray-800 text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <Filter className="w-4 h-4 mr-1 inline" />
        Todas
      </button>
      {TAG_CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
            ${selectedCategory === category.id 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <span className="mr-1">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );

  const renderSuggestions = () => (
    <Card className="absolute z-10 w-full mt-1 p-4 bg-white border shadow-lg max-h-80 overflow-y-auto">
      {isCreatingCustomTag && enableCustomTags && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Criar tag personalizada: "{searchQuery}"
              </span>
            </div>
            <Button
              onClick={handleCreateCustomTag}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Criar
            </Button>
          </div>
        </div>
      )}

      {filteredSuggestions.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {filteredSuggestions.map((tag) => {
            const categoryData = getCategoryData(tag.category);
            return (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag)}
                className={`
                  p-3 rounded-lg border text-left transition-all duration-200
                  hover:shadow-sm hover:border-gray-300
                  ${getCategoryClasses(tag.category)}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{categoryData.icon}</span>
                  <span className="font-medium text-sm">{tag.name}</span>
                </div>
                <div className="text-xs opacity-75">
                  {Math.round(tag.confidence * 100)}% confiança
                </div>
              </button>
            );
          })}
        </div>
      ) : searchQuery.trim() && !isCreatingCustomTag ? (
        <div className="text-center py-4 text-gray-500">
          <Hash className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma tag encontrada para "{searchQuery}"</p>
        </div>
      ) : null}
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTags.length > 0 && renderSelectedTags()}

      {/* Category Filter */}
      {enableFiltering && renderCategoryFilter()}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
            className="pl-10 pr-4"
            disabled={!canAddMoreTags}
          />
          {suggestedTags.length > 0 && (
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && renderSuggestions()}
      </div>

      {/* Status Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>{selectedTags.length} / {maxTags} tags</span>
          {suggestedTags.length > 0 && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {suggestedTags.length} sugestões IA
            </span>
          )}
        </div>
        {!canAddMoreTags && (
          <span className="text-orange-600 font-medium">
            Limite de tags atingido
          </span>
        )}
      </div>
    </div>
  );
};

export default SmartTagSelector;