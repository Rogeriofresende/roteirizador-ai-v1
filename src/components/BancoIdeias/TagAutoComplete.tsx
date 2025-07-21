/**
 * 🔍 TAG AUTOCOMPLETE V9.0
 * 
 * Campo de input com auto-complete inteligente para tags
 * Combina busca em tempo real com sugestões de IA
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature Sistema de Tags Inteligentes
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Hash, X, Plus, ArrowUp, ArrowDown, Enter } from 'lucide-react';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { SuggestedTag } from './TagSuggestionEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TagAutoCompleteProps {
  onTagSelect: (tag: SuggestedTag) => void;
  onCreateCustomTag?: (tagName: string, category: string) => void;
  existingTags?: SuggestedTag[];
  suggestedTags?: SuggestedTag[];
  placeholder?: string;
  disabled?: boolean;
  maxSuggestions?: number;
  enableCustomTags?: boolean;
  autoFocus?: boolean;
  className?: string;
}

interface TagOption extends SuggestedTag {
  isCustom?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const KEYBOARD_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab'
};

const COMMON_TAGS: SuggestedTag[] = [
  { id: 'drama', name: 'Drama', category: 'genero', confidence: 0.9, reasoning: 'Gênero popular' },
  { id: 'comedia', name: 'Comédia', category: 'genero', confidence: 0.9, reasoning: 'Gênero popular' },
  { id: 'romance', name: 'Romance', category: 'genero', confidence: 0.85, reasoning: 'Gênero popular' },
  { id: 'acao', name: 'Ação', category: 'genero', confidence: 0.85, reasoning: 'Gênero popular' },
  { id: 'familia', name: 'Família', category: 'tema', confidence: 0.8, reasoning: 'Tema universal' },
  { id: 'trabalho', name: 'Trabalho', category: 'tema', confidence: 0.8, reasoning: 'Tema universal' },
  { id: 'amizade', name: 'Amizade', category: 'tema', confidence: 0.8, reasoning: 'Tema universal' },
  { id: 'jovem', name: 'Jovem', category: 'publico', confidence: 0.75, reasoning: 'Público comum' },
  { id: 'adulto', name: 'Adulto', category: 'publico', confidence: 0.75, reasoning: 'Público comum' }
];

// ============================================================================
// TAG AUTOCOMPLETE COMPONENT
// ============================================================================

export const TagAutoComplete: React.FC<TagAutoCompleteProps> = ({
  onTagSelect,
  onCreateCustomTag,
  existingTags = [],
  suggestedTags = [],
  placeholder = "Digite para buscar tags...",
  disabled = false,
  maxSuggestions = 8,
  enableCustomTags = true,
  autoFocus = false,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredOptions, setFilteredOptions] = useState<TagOption[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================
  
  const filterTags = useCallback((query: string) => {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Combine all available tags
    const allTags = [
      ...suggestedTags,
      ...COMMON_TAGS,
      ...existingTags
    ];

    // Remove duplicates based on name
    const uniqueTags = allTags.filter((tag, index, self) =>
      index === self.findIndex(t => t.name.toLowerCase() === tag.name.toLowerCase())
    );

    // Filter by search term
    const filtered = uniqueTags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm)
    ).slice(0, maxSuggestions);

    // Sort by relevance (exact match first, then starts with, then contains)
    filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match
      if (aName === searchTerm) return -1;
      if (bName === searchTerm) return 1;
      
      // Starts with
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      // Confidence score
      return (b.confidence || 0) - (a.confidence || 0);
    });

    return filtered;
  }, [suggestedTags, existingTags, maxSuggestions]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    const filtered = filterTags(inputValue);
    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [inputValue, filterTags]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length > 0);
  }, []);

  const handleInputFocus = useCallback(() => {
    if (inputValue.length > 0) {
      setIsOpen(true);
    }
  }, [inputValue]);

  const handleInputBlur = useCallback(() => {
    // Delay to allow option click
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case KEYBOARD_KEYS.ARROW_UP:
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
        
      case KEYBOARD_KEYS.ENTER:
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleTagSelect(filteredOptions[highlightedIndex]);
        } else if (enableCustomTags && inputValue.trim()) {
          handleCreateCustom();
        }
        break;
        
      case KEYBOARD_KEYS.ESCAPE:
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, enableCustomTags, inputValue]);

  const handleTagSelect = useCallback((tag: TagOption) => {
    onTagSelect(tag);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [onTagSelect]);

  const handleCreateCustom = useCallback(() => {
    if (!enableCustomTags || !onCreateCustomTag || !inputValue.trim()) return;
    
    onCreateCustomTag(inputValue.trim(), 'tema');
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [enableCustomTags, onCreateCustomTag, inputValue]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getCategoryColor = useCallback((category: string) => {
    const colors = {
      genero: 'purple',
      tema: 'blue', 
      personagem: 'green',
      setting: 'orange',
      mood: 'pink',
      publico: 'yellow'
    };
    return colors[category as keyof typeof colors] || 'gray';
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    const icons = {
      genero: '🎭',
      tema: '💡',
      personagem: '👥',
      setting: '🏞️',
      mood: '🎨',
      publico: '🎯'
    };
    return icons[category as keyof typeof icons] || '🏷️';
  }, []);

  const shouldShowCreateOption = enableCustomTags && 
    inputValue.trim() && 
    !filteredOptions.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase());

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderOption = (tag: TagOption, index: number) => {
    const isHighlighted = index === highlightedIndex;
    const categoryColor = getCategoryColor(tag.category);
    const categoryIcon = getCategoryIcon(tag.category);

    return (
      <div
        key={tag.id}
        onClick={() => handleTagSelect(tag)}
        className={`
          px-3 py-2 cursor-pointer transition-colors duration-150
          flex items-center justify-between
          ${isHighlighted 
            ? 'bg-blue-50 border-l-2 border-blue-500' 
            : 'hover:bg-gray-50'
          }
        `}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm">{categoryIcon}</span>
          <span className="font-medium text-gray-900 truncate">
            {tag.name}
          </span>
          <Badge 
            variant="secondary" 
            size="xs"
            className={`bg-${categoryColor}-100 text-${categoryColor}-800 border-${categoryColor}-200`}
          >
            {tag.category}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {tag.confidence && (
            <span>{Math.round(tag.confidence * 100)}%</span>
          )}
          <Hash className="w-3 h-3" />
        </div>
      </div>
    );
  };

  const renderCreateOption = () => (
    <div
      onClick={handleCreateCustom}
      className={`
        px-3 py-2 cursor-pointer transition-colors duration-150
        flex items-center gap-2 border-t border-gray-100
        ${highlightedIndex === filteredOptions.length 
          ? 'bg-green-50 border-l-2 border-green-500' 
          : 'hover:bg-gray-50'
        }
      `}
      onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
    >
      <Plus className="w-4 h-4 text-green-600" />
      <span className="font-medium text-green-700">
        Criar tag: "{inputValue.trim()}"
      </span>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-4"
          autoComplete="off"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (filteredOptions.length > 0 || shouldShowCreateOption) && (
        <div
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredOptions.map((tag, index) => renderOption(tag, index))}
          
          {shouldShowCreateOption && renderCreateOption()}
          
          {filteredOptions.length === 0 && !shouldShowCreateOption && (
            <div className="px-3 py-4 text-center text-gray-500">
              <Hash className="w-5 h-5 mx-auto mb-1 opacity-50" />
              <p className="text-sm">Nenhuma tag encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 text-xs text-gray-400 z-10">
          <div className="bg-white px-2 py-1 rounded border shadow-sm">
            ↑↓ navegar • Enter selecionar • Esc fechar
          </div>
        </div>
      )}
    </div>
  );
};

export default TagAutoComplete;