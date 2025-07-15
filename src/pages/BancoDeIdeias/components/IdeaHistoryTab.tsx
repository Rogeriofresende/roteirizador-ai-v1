/**
 * 🧠 BANCO DE IDEIAS - HISTORY TAB V8.0
 * Advanced history component with filters, search and pagination
 * Following V8.0 Unified Development methodology - Frontend Phase
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Layout } from '../../../design-system/components/Layout';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Select } from '../../../design-system/components/form/Select';
import { 
  Search, 
  Filter, 
  Plus, 
  BarChart3,
  Calendar,
  Star,
  TrendingUp,
  Download,
  Grid,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  Clock,
  Target,
  Eye,
  Heart,
  Share2
} from 'lucide-react';

import { IdeaResponse, IdeaFilters, IdeaPagination } from '../types';
import { CATEGORY_OPTIONS } from '../constants';
import IdeaCard from '../components/shared/IdeaCard';
import { LoadingStates } from '../components/shared/LoadingStates';

// ============================================================================
// HISTORY TAB PROPS
// ============================================================================

interface IdeaHistoryTabProps {
  ideas: IdeaResponse[];
  loading?: boolean;
  onQuickAdd: () => void;
  onIdeaSelect?: (idea: IdeaResponse) => void;
  onRefresh?: () => void;
  className?: string;
}

// ============================================================================
// SORT OPTIONS
// ============================================================================

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'oldest', label: 'Mais Antigas' },
  { value: 'title', label: 'Título A-Z' },
  { value: 'category', label: 'Categoria' },
  { value: 'rating', label: 'Avaliação' }
];

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
} as const;

type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

// ============================================================================
// MAIN HISTORY COMPONENT
// ============================================================================

export const IdeaHistoryTab: React.FC<IdeaHistoryTabProps> = ({
  ideas,
  loading = false,
  onQuickAdd,
  onIdeaSelect,
  onRefresh,
  className = ''
}) => {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [filters, setFilters] = useState<IdeaFilters>({
    searchTerm: '',
    category: '',
    dateRange: undefined,
    tags: []
  });
  
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.GRID);
  const [showFilters, setShowFilters] = useState(false);
  
  const [pagination, setPagination] = useState<IdeaPagination>({
    page: 1,
    limit: 12,
    total: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // ============================================================================
  // FILTERED AND SORTED IDEAS
  // ============================================================================
  
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = [...ideas];
    
    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm) ||
        idea.description.toLowerCase().includes(searchTerm) ||
        idea.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(idea => idea.category === filters.category);
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(idea => {
        const ideaDate = new Date(idea.createdAt);
        return ideaDate >= filters.dateRange!.start && ideaDate <= filters.dateRange!.end;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'rating':
          const ratingA = a.metadata?.score || 0;
          const ratingB = b.metadata?.score || 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [ideas, filters, sortBy]);
  
  // ============================================================================
  // PAGINATION LOGIC
  // ============================================================================
  
  const paginatedIdeas = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredAndSortedIdeas.slice(startIndex, endIndex);
  }, [filteredAndSortedIdeas, pagination.page, pagination.limit]);
  
  useEffect(() => {
    const total = filteredAndSortedIdeas.length;
    const hasNext = pagination.page * pagination.limit < total;
    const hasPrev = pagination.page > 1;
    
    setPagination(prev => ({
      ...prev,
      total,
      hasNext,
      hasPrev
    }));
  }, [filteredAndSortedIdeas.length, pagination.page, pagination.limit]);
  
  // ============================================================================
  // FILTER HANDLERS
  // ============================================================================
  
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      dateRange: undefined,
      tags: []
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // ============================================================================
  // STATISTICS
  // ============================================================================
  
  const statistics = useMemo(() => {
    const total = ideas.length;
    const categories = [...new Set(ideas.map(idea => idea.category))];
    const avgRating = ideas.reduce((sum, idea) => sum + (idea.metadata?.score || 0), 0) / total;
    const recent = ideas.filter(idea => {
      const ideaDate = new Date(idea.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return ideaDate >= weekAgo;
    }).length;
    
    return { total, categories: categories.length, avgRating, recent };
  }, [ideas]);
  
  // ============================================================================
  // HEADER COMPONENT
  // ============================================================================
  
  const renderHeader = () => (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div>
          <Layout.Heading level={3} className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            Histórico de Ideias
            <span className="text-sm font-normal bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
              {filteredAndSortedIdeas.length}
            </span>
          </Layout.Heading>
          
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {statistics.total} total
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {statistics.avgRating.toFixed(1)} média
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {statistics.recent} esta semana
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          
          <Button
            onClick={onQuickAdd}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>
    </div>
  );
  
  // ============================================================================
  // FILTERS PANEL
  // ============================================================================
  
  const renderFilters = () => (
    <Layout.Card variant="outlined" padding="md" className="mb-6 bg-neutral-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Título, descrição ou palavras-chave..."
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Categoria
          </label>
          <Select
            value={filters.category}
            onChange={handleCategoryFilter}
            options={[
              { value: '', label: 'Todas as categorias' },
              ...CATEGORY_OPTIONS
            ]}
            placeholder="Selecione..."
          />
        </div>
        
        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Ordenar por
          </label>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
          />
        </div>
        
        {/* Actions */}
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex-1"
          >
            Limpar
          </Button>
          
          <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode(VIEW_MODES.GRID)}
              className={`p-2 ${viewMode === VIEW_MODES.GRID ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.LIST)}
              className={`p-2 ${viewMode === VIEW_MODES.LIST ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout.Card>
  );
  
  // ============================================================================
  // IDEAS GRID/LIST
  // ============================================================================
  
  const renderIdeasGrid = () => {
    if (loading) {
      return <LoadingStates.IdeasListSkeleton />;
    }
    
    if (paginatedIdeas.length === 0) {
      return (
        <Layout.Card variant="outlined" padding="lg" className="text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-neutral-400" />
          </div>
          
          <Layout.Heading level={4} className="text-neutral-700 mb-2">
            {filters.searchTerm || filters.category ? 'Nenhuma ideia encontrada' : 'Nenhuma ideia ainda'}
          </Layout.Heading>
          
          <Layout.Text variant="body" color="muted" className="mb-4">
            {filters.searchTerm || filters.category 
              ? 'Tente ajustar os filtros ou fazer uma nova busca.'
              : 'Comece gerando sua primeira ideia ou adicione uma manualmente.'
            }
          </Layout.Text>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {(filters.searchTerm || filters.category) && (
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
            <Button onClick={onQuickAdd} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Ideia
            </Button>
          </div>
        </Layout.Card>
      );
    }
    
    return (
      <div className={
        viewMode === VIEW_MODES.GRID 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {paginatedIdeas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onSelect={onIdeaSelect}
            variant={viewMode === VIEW_MODES.LIST ? 'compact' : 'default'}
            showActions={true}
          />
        ))}
      </div>
    );
  };
  
  // ============================================================================
  // PAGINATION
  // ============================================================================
  
  const renderPagination = () => {
    if (pagination.total <= pagination.limit) return null;
    
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    return (
      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-neutral-600">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} ideias
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={!pagination.hasPrev}
          >
            Anterior
          </Button>
          
          <span className="px-3 py-2 text-sm text-neutral-600">
            {pagination.page} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={!pagination.hasNext}
          >
            Próxima
          </Button>
        </div>
      </div>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {renderHeader()}
      
      {showFilters && renderFilters()}
      
      {renderIdeasGrid()}
      
      {renderPagination()}
    </div>
  );
};

export default IdeaHistoryTab; 