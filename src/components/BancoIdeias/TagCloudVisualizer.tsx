/**
 * ☁️ TAG CLOUD VISUALIZER V9.0
 * 
 * Visualização interativa de nuvem de tags com analytics
 * Mostra popularidade, tendências e métricas de uso
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature Sistema de Tags Inteligentes  
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useMemo, useCallback } from 'react';
import { TrendingUp, Hash, Filter, BarChart3, Calendar, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SuggestedTag } from './TagSuggestionEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TagMetrics {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
  trending: 'up' | 'down' | 'stable';
  lastUsed: Date;
  associatedIdeas: number;
}

export interface TagCloudVisualizerProps {
  tags: TagMetrics[];
  onTagClick?: (tag: TagMetrics) => void;
  onTagFilter?: (category: string) => void;
  viewMode?: 'cloud' | 'list' | 'chart';
  showMetrics?: boolean;
  maxTags?: number;
  interactive?: boolean;
  className?: string;
}

interface ViewModeConfig {
  id: 'cloud' | 'list' | 'chart';
  name: string;
  icon: React.ReactNode;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VIEW_MODES: ViewModeConfig[] = [
  { 
    id: 'cloud', 
    name: 'Nuvem', 
    icon: <Hash className="w-4 h-4" />,
    description: 'Visualização em nuvem de tags'
  },
  { 
    id: 'list', 
    name: 'Lista', 
    icon: <Filter className="w-4 h-4" />,
    description: 'Lista detalhada com métricas'
  },
  { 
    id: 'chart', 
    name: 'Gráfico', 
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Visualização em barras'
  }
];

const CATEGORY_COLORS = {
  genero: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  tema: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  personagem: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  setting: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  mood: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  publico: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
};

// ============================================================================
// TAG CLOUD VISUALIZER COMPONENT
// ============================================================================

export const TagCloudVisualizer: React.FC<TagCloudVisualizerProps> = ({
  tags,
  onTagClick,
  onTagFilter,
  viewMode = 'cloud',
  showMetrics = true,
  maxTags = 50,
  interactive = true,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [currentViewMode, setCurrentViewMode] = useState<'cloud' | 'list' | 'chart'>(viewMode);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'trending' | 'recent'>('count');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const processedTags = useMemo(() => {
    let filtered = [...tags];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tag => tag.category === selectedCategory);
    }

    // Sort tags
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'trending':
          if (a.trending === 'up' && b.trending !== 'up') return -1;
          if (b.trending === 'up' && a.trending !== 'up') return 1;
          return b.count - a.count;
        case 'recent':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        case 'count':
        default:
          return b.count - a.count;
      }
    });

    return filtered.slice(0, maxTags);
  }, [tags, selectedCategory, sortBy, maxTags]);

  const categories = useMemo(() => {
    const cats = [...new Set(tags.map(tag => tag.category))];
    return cats.map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: tags.filter(tag => tag.category === cat).length
    }));
  }, [tags]);

  const totalIdeas = useMemo(() => {
    return tags.reduce((sum, tag) => sum + tag.associatedIdeas, 0);
  }, [tags]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleTagClick = useCallback((tag: TagMetrics) => {
    if (interactive && onTagClick) {
      onTagClick(tag);
    }
  }, [interactive, onTagClick]);

  const handleCategoryFilter = useCallback((category: string) => {
    setSelectedCategory(category);
    if (onTagFilter) {
      onTagFilter(category);
    }
  }, [onTagFilter]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getTagSize = useCallback((tag: TagMetrics) => {
    const maxCount = Math.max(...tags.map(t => t.count));
    const minSize = 12;
    const maxSize = 32;
    const ratio = tag.count / maxCount;
    return minSize + (maxSize - minSize) * ratio;
  }, [tags]);

  const getCategoryStyle = useCallback((category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 
           { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }, []);

  const getTrendingIcon = useCallback((trending: TagMetrics['trending']) => {
    switch (trending) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  }, []);

  const formatDate = useCallback((date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  }, []);

  // ============================================================================
  // RENDER METHODS
  // ============================================================================
  
  const renderCloudView = () => (
    <div className="flex flex-wrap gap-3 justify-center items-center p-6 min-h-[300px]">
      {processedTags.map((tag) => {
        const size = getTagSize(tag);
        const style = getCategoryStyle(tag.category);
        
        return (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag)}
            disabled={!interactive}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
              ${style.bg} ${style.text} ${style.border}
              ${interactive ? 'hover:shadow-md hover:scale-105 cursor-pointer' : ''}
              ${!interactive ? 'cursor-default' : ''}
            `}
            style={{ fontSize: `${size * 0.8}px` }}
          >
            <span className="font-medium">{tag.name}</span>
            <span className="text-xs opacity-75">({tag.count})</span>
            {tag.trending === 'up' && <TrendingUp className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {processedTags.map((tag) => {
        const style = getCategoryStyle(tag.category);
        
        return (
          <div
            key={tag.id}
            onClick={() => handleTagClick(tag)}
            className={`
              p-4 rounded-lg border transition-all duration-200
              ${interactive ? 'hover:shadow-sm cursor-pointer' : 'cursor-default'}
              bg-white border-gray-200
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={`${style.bg} ${style.text} ${style.border}`}>
                  {tag.category}
                </Badge>
                <span className="font-medium text-gray-900">{tag.name}</span>
                {getTrendingIcon(tag.trending)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  <span>{tag.count} usos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(tag.lastUsed)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{tag.associatedIdeas} ideias</span>
                </div>
              </div>
            </div>
            
            {showMetrics && (
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${tag.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {tag.percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderChartView = () => (
    <div className="space-y-3">
      {processedTags.slice(0, 15).map((tag) => {
        const style = getCategoryStyle(tag.category);
        const maxCount = Math.max(...processedTags.map(t => t.count));
        const width = (tag.count / maxCount) * 100;
        
        return (
          <div
            key={tag.id}
            onClick={() => handleTagClick(tag)}
            className={`
              p-3 rounded-lg transition-all duration-200
              ${interactive ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge size="xs" className={`${style.bg} ${style.text} ${style.border}`}>
                  {tag.category}
                </Badge>
                <span className="font-medium text-gray-900">{tag.name}</span>
                {getTrendingIcon(tag.trending)}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {tag.count}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${style.bg.replace('100', '500')}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">
                {tag.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderControls = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      {/* View Mode Selector */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCurrentViewMode(mode.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${currentViewMode === mode.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            title={mode.description}
          >
            {mode.icon}
            {mode.name}
          </button>
        ))}
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-3">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        {/* Sort Options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="count">Mais usadas</option>
          <option value="name">Nome A-Z</option>
          <option value="trending">Tendência</option>
          <option value="recent">Mais recentes</option>
        </select>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-600">Total de Tags</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{tags.length}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-600">Ideias Tagueadas</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{totalIdeas}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-600">Em Alta</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {tags.filter(t => t.trending === 'up').length}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-600">Categorias</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {showMetrics && renderMetrics()}
      {renderControls()}
      
      <Card className="p-6">
        {currentViewMode === 'cloud' && renderCloudView()}
        {currentViewMode === 'list' && renderListView()}
        {currentViewMode === 'chart' && renderChartView()}
        
        {processedTags.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Hash className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhuma tag encontrada</p>
            <p className="text-sm">
              {selectedCategory !== 'all' 
                ? 'Tente mudar o filtro de categoria' 
                : 'Adicione tags às suas ideias para vê-las aqui'
              }
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TagCloudVisualizer;