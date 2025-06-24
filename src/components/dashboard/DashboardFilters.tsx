import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Clock, Tag, Folder, Star } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import type { ProjectFilters, Tag as TagType } from '../../types';
import { SearchService } from '../../services/searchService';
import { TagService } from '../../services/tagService';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  className?: string;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [filterSuggestions, setFilterSuggestions] = useState<{
    platforms: string[];
    tags: string[];
    folders: { id: string; name: string }[];
  }>({
    platforms: [],
    tags: [],
    folders: []
  });

  // Carregar dados para filtros
  useEffect(() => {
    const loadFilterData = async () => {
      if (!currentUser) return;

      try {
        const [tags, suggestions] = await Promise.all([
          TagService.getUserTags(currentUser.uid),
          SearchService.getFilterSuggestions(currentUser.uid)
        ]);

        setAvailableTags(tags);
        setFilterSuggestions(suggestions);
      } catch (error) {
        console.error('Erro ao carregar dados dos filtros:', error);
      }
    };

    loadFilterData();
  }, [currentUser]);

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined
    });
  };

  const handleSortChange = (field: string, value: string) => {
    if (field === 'sortBy') {
      onFiltersChange({
        ...filters,
        sortBy: value as ProjectFilters['sortBy']
      });
    } else if (field === 'sortOrder') {
      onFiltersChange({
        ...filters,
        sortOrder: value as 'asc' | 'desc'
      });
    }
  };

  const handleTagToggle = (tagName: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    });
  };

  const handlePlatformToggle = (platform: string) => {
    const currentPlatforms = filters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];

    onFiltersChange({
      ...filters,
      platforms: newPlatforms.length > 0 ? newPlatforms : undefined
    });
  };

  const handleStatusToggle = (status: 'draft' | 'completed' | 'published') => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];

    onFiltersChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined
    });
  };

  const handleFavoriteToggle = () => {
    onFiltersChange({
      ...filters,
      isFavorite: filters.isFavorite === true ? undefined : true
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.tags?.length) count++;
    if (filters.platforms?.length) count++;
    if (filters.status?.length) count++;
    if (filters.isFavorite) count++;
    if (filters.dateRange) count++;
    if (filters.duration) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`dashboard-filters ${className}`}>
      {/* Barra de busca principal */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar roteiros por título, conteúdo ou tags..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => handleSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleSortChange('sortBy', value)}
        >
          <option value="updatedAt">Modificação</option>
          <option value="createdAt">Criação</option>
          <option value="title">Título</option>
          <option value="wordCount">Palavras</option>
          <option value="duration">Duração</option>
        </Select>

        <Select
          value={filters.sortOrder}
          onValueChange={(value) => handleSortChange('sortOrder', value)}
        >
          <option value="desc">Mais recente</option>
          <option value="asc">Mais antigo</option>
        </Select>
      </div>

      {/* Filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          
          {filters.isFavorite && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Favoritos
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={handleFavoriteToggle}
              />
            </Badge>
          )}

          {filters.tags?.map(tag => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}

          {filters.platforms?.map(platform => (
            <Badge key={platform} variant="outline" className="flex items-center gap-1">
              {platform}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handlePlatformToggle(platform)}
              />
            </Badge>
          ))}

          {filters.status?.map(status => (
            <Badge key={status} variant="outline" className="flex items-center gap-1">
              {status === 'draft' ? 'Rascunho' : 
               status === 'completed' ? 'Concluído' : 'Publicado'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Filtros avançados */}
      {showAdvanced && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableTags.slice(0, 10).map(tag => (
                  <label key={tag.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.tags?.includes(tag.name) || false}
                      onChange={() => handleTagToggle(tag.name)}
                      className="rounded"
                    />
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                    <span className="text-xs text-muted-foreground">({tag.usageCount})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Plataformas */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Plataformas
              </label>
              <div className="space-y-2">
                {filterSuggestions.platforms.map(platform => (
                  <label key={platform} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.platforms?.includes(platform) || false}
                      onChange={() => handlePlatformToggle(platform)}
                      className="rounded"
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes('draft') || false}
                    onChange={() => handleStatusToggle('draft')}
                    className="rounded"
                  />
                  <span className="text-sm">Rascunho</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes('completed') || false}
                    onChange={() => handleStatusToggle('completed')}
                    className="rounded"
                  />
                  <span className="text-sm">Concluído</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes('published') || false}
                    onChange={() => handleStatusToggle('published')}
                    className="rounded"
                  />
                  <span className="text-sm">Publicado</span>
                </label>
              </div>
            </div>

            {/* Outros filtros */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isFavorite || false}
                  onChange={handleFavoriteToggle}
                  className="rounded"
                />
                <Star className="h-4 w-4" />
                <span className="text-sm">Apenas favoritos</span>
              </label>

              {/* Filtro de duração */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Duração (segundos)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.duration?.min || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      onFiltersChange({
                        ...filters,
                        duration: {
                          min: isNaN(value) ? 0 : value,
                          max: filters.duration?.max || 999
                        }
                      });
                    }}
                    className="w-20 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.duration?.max || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      onFiltersChange({
                        ...filters,
                        duration: {
                          min: filters.duration?.min || 0,
                          max: isNaN(value) ? 999 : value
                        }
                      });
                    }}
                    className="w-20 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters; 