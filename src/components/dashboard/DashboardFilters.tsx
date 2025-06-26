// DashboardFilters Component - Advanced filtering system
// Professional-grade filtering with persistence and advanced options

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Filter, Search, X, ChevronDown, Clock, Star, Folder } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';

import { 
  FilterOptions, 
  PlatformType, 
  FormatType, 
  ProjectStatus,
  SortOption,
  Tag,
  Folder as FolderType
} from '../../types/enhanced';

import { tagService } from '../../services/tagService';
import { createLogger } from '../../utils/logger';

const logger = createLogger('DashboardFilters');

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalProjects: number;
  filteredCount: number;
  isLoading?: boolean;
  userTags?: Tag[];
  userFolders?: FolderType[];
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  totalProjects,
  filteredCount,
  isLoading = false,
  userTags = [],
  userFolders = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');

  // Platform options
  const platformOptions: { value: PlatformType; label: string; icon: string }[] = [
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' }
  ];

  // Format options  
  const formatOptions: { value: FormatType; label: string }[] = [
    { value: 'short', label: 'Short (até 60s)' },
    { value: 'reel', label: 'Reel (até 90s)' },
    { value: 'story', label: 'Story (até 15s)' },
    { value: 'post', label: 'Post' },
    { value: 'video', label: 'Vídeo Longo' },
    { value: 'carousel', label: 'Carrossel' }
  ];

  // Status options
  const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Rascunho', color: 'yellow' },
    { value: 'completed', label: 'Concluído', color: 'green' },
    { value: 'published', label: 'Publicado', color: 'blue' }
  ];

  // Sort options
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date', label: 'Data de Criação' },
    { value: 'title', label: 'Título' },
    { value: 'platform', label: 'Plataforma' },
    { value: 'wordCount', label: 'Palavras' },
    { value: 'editCount', label: 'Edições' },
    { value: 'viewCount', label: 'Visualizações' }
  ];

  // Date range presets
  const dateRangeOptions = [
    { value: 'all', label: 'Todos os períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mês' },
    { value: 'quarter', label: 'Últimos 3 meses' },
    { value: 'year', label: 'Último ano' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.platforms?.length) count++;
    if (filters.formats?.length) count++;
    if (filters.status?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.folderId) count++;
    if (filters.isFavorite !== undefined) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  // Handle platform selection
  const handlePlatformToggle = (platform: PlatformType) => {
    const currentPlatforms = filters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    onFiltersChange({
      ...filters,
      platforms: newPlatforms.length > 0 ? newPlatforms : undefined
    });
  };

  // Handle format selection
  const handleFormatToggle = (format: FormatType) => {
    const currentFormats = filters.formats || [];
    const newFormats = currentFormats.includes(format)
      ? currentFormats.filter(f => f !== format)
      : [...currentFormats, format];
    
    onFiltersChange({
      ...filters,
      formats: newFormats.length > 0 ? newFormats : undefined
    });
  };

  // Handle status selection
  const handleStatusToggle = (status: ProjectStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  // Handle tag selection
  const handleTagToggle = (tagId: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    });
  };

  // Handle date range selection
  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    switch (range) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        end = now;
        break;
      case 'quarter':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        end = now;
        break;
      case 'year':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        end = now;
        break;
      case 'all':
      default:
        start = undefined;
        end = undefined;
        break;
    }

    onFiltersChange({
      ...filters,
      dateRange: start && end ? { start, end } : undefined
    });
  };

  // Handle sort change
  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  };

  // Handle sort order toggle
  const handleSortOrderToggle = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSelectedDateRange('all');
    setSearchQuery('');
  };

  // Clear specific filter
  const clearFilter = (filterType: string) => {
    const newFilters = { ...filters };
    
    switch (filterType) {
      case 'platforms':
        delete newFilters.platforms;
        break;
      case 'formats':
        delete newFilters.formats;
        break;
      case 'status':
        delete newFilters.status;
        break;
      case 'tags':
        delete newFilters.tags;
        break;
      case 'folder':
        delete newFilters.folderId;
        break;
      case 'favorites':
        delete newFilters.isFavorite;
        break;
      case 'dateRange':
        delete newFilters.dateRange;
        setSelectedDateRange('all');
        break;
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {isLoading ? 'Carregando...' : `${filteredCount} de ${totalProjects} projetos`}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600"
            >
              <ChevronDown 
                size={16} 
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({
              ...filters,
              isFavorite: filters.isFavorite ? undefined : true
            })}
            className={filters.isFavorite ? 'bg-yellow-50 text-yellow-700' : ''}
          >
            <Star size={14} className={filters.isFavorite ? 'fill-current' : ''} />
            Favoritos
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X size={14} />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por título, conteúdo ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataformas
            </label>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((platform) => (
                <Button
                  key={platform.value}
                  variant={filters.platforms?.includes(platform.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlatformToggle(platform.value)}
                  className="text-xs"
                >
                  <span className="mr-1">{platform.icon}</span>
                  {platform.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Formats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formatos
            </label>
            <div className="flex flex-wrap gap-2">
              {formatOptions.map((format) => (
                <Button
                  key={format.value}
                  variant={filters.formats?.includes(format.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFormatToggle(format.value)}
                  className="text-xs"
                >
                  {format.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status.value}
                  variant={filters.status?.includes(status.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusToggle(status.value)}
                  className="text-xs"
                >
                  <div className={`w-2 h-2 rounded-full mr-2 bg-${status.color}-400`} />
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {userTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {userTags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant={filters.tags?.includes(tag.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag.id)}
                    className="text-xs"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={14} className="inline mr-1" />
              Período
            </label>
            <Select value={selectedDateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordem
              </label>
              <Button
                variant="outline"
                onClick={handleSortOrderToggle}
                className="w-full justify-start"
              >
                {filters.sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.platforms && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => clearFilter('platforms')}
              >
                Plataformas ({filters.platforms.length})
                <X size={12} className="ml-1" />
              </Badge>
            )}
            
            {filters.formats && (
              <Badge 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => clearFilter('formats')}
              >
                Formatos ({filters.formats.length})
                <X size={12} className="ml-1" />
              </Badge>
            )}
            
            {filters.status && (
              <Badge 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => clearFilter('status')}
              >
                Status ({filters.status.length})
                <X size={12} className="ml-1" />
              </Badge>
            )}
            
            {filters.tags && (
              <Badge 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => clearFilter('tags')}
              >
                Tags ({filters.tags.length})
                <X size={12} className="ml-1" />
              </Badge>
            )}
            
            {filters.isFavorite && (
              <Badge 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => clearFilter('favorites')}
              >
                <Star size={12} className="mr-1 fill-current" />
                Favoritos
                <X size={12} className="ml-1" />
              </Badge>
            )}
            
            {filters.dateRange && (
              <Badge 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => clearFilter('dateRange')}
              >
                <Clock size={12} className="mr-1" />
                Período
                <X size={12} className="ml-1" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
