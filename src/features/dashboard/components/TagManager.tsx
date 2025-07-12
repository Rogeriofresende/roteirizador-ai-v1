import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Tags, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  MoreVertical,
  Palette,
  TrendingUp,
  Archive,
  Copy,
  Star,
  Hash,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { Checkbox } from '../ui/Checkbox';

import type { Tag, CreateTagData, TagUsageStats } from '../../types/enhanced';
import { tagService } from '../../services/tagService';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TagManager');

interface TagManagerProps {
  userId: string;
  onTagsChange?: (tags: Tag[]) => void;
  showAnalytics?: boolean;
  allowBulkOperations?: boolean;
}

export const TagManager: React.FC<TagManagerProps> = ({
  userId,
  onTagsChange,
  showAnalytics = true,
  allowBulkOperations = true
}) => {
  // Estados principais
  const [tags, setTags] = useState<Tag[]>([]);
  const [usageStats, setUsageStats] = useState<TagUsageStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de interface
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'date'>('usage');
  const [filterBy, setFilterBy] = useState<'all' | 'system' | 'user'>('all');

  // Estados de modais
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Estados de formulário
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [newTagDescription, setNewTagDescription] = useState('');

  // Cores predefinidas para tags
  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
    '#EC4899', '#6B7280', '#14B8A6', '#A855F7'
  ];

  // Carregar dados iniciais
  const loadTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userTags = await tagService.getUserTags(userId);
      setTags(userTags);
      onTagsChange?.(userTags);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tags';
      setError(errorMessage);
      logger.error('Erro ao carregar tags', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, onTagsChange]);

  const loadUsageStats = useCallback(async () => {
    try {
      const stats = await tagService.getTagUsageStats(userId);
      setUsageStats(stats);
    } catch (err) {
      logger.error('Erro ao carregar estatísticas de tags', err);
    }
  }, [userId]);

  // Carregar dados iniciais
  useEffect(() => {
    loadTags();
    if (showAnalytics) {
      loadUsageStats();
    }
  }, [userId, showAnalytics, loadTags, loadUsageStats]);

  // Filtrar e ordenar tags
  const filteredAndSortedTags = useMemo(() => {
    const filtered = tags.filter(tag => {
      // Filtro de busca
      const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tag.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      // Filtro por tipo
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'system' && tag.isSystem) ||
                           (filterBy === 'user' && !tag.isSystem);

      return matchesSearch && matchesFilter;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'date':
          return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [tags, searchQuery, filterBy, sortBy]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setIsLoading(true);
      
      const tagData: CreateTagData = {
        name: newTagName.trim(),
        color: newTagColor,
        description: newTagDescription.trim() || undefined,
        isSystem: false
      };

      await tagService.createTag(userId, tagData);
      await loadTags();
      
      // Reset form
      setNewTagName('');
      setNewTagColor('#3B82F6');
      setNewTagDescription('');
      setShowCreateDialog(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar tag';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTag = async (tagId: string, updates: Partial<Tag>) => {
    try {
      setIsLoading(true);
      await tagService.updateTag(tagId, updates);
      await loadTags();
      setEditingTag(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar tag';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      setIsLoading(true);
      await tagService.deleteTag(tagId);
      await loadTags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir tag';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTags.size === 0) return;
    
    const count = selectedTags.size;
    if (!confirm(`Tem certeza que deseja excluir ${count} tag${count > 1 ? 's' : ''}?`)) return;

    try {
      setIsLoading(true);
      
      for (const tagId of selectedTags) {
        await tagService.deleteTag(tagId);
      }
      
      await loadTags();
      setSelectedTags(new Set());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir tags';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagSelect = (tagId: string) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tagId)) {
      newSelected.delete(tagId);
    } else {
      newSelected.add(tagId);
    }
    setSelectedTags(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTags.size === filteredAndSortedTags.length) {
      setSelectedTags(new Set());
    } else {
      setSelectedTags(new Set(filteredAndSortedTags.map(tag => tag.id)));
    }
  };

  const handleCreateDefaultTags = async () => {
    try {
      setIsLoading(true);
      await tagService.createDefaultTags(userId);
      await loadTags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar tags padrão';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Nunca usado';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Tags size={24} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gerenciar Tags</h2>
              <p className="text-sm text-gray-600">
                {filteredAndSortedTags.length} de {tags.length} tags
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showAnalytics && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalyticsDialog(true)}
              >
                <TrendingUp size={16} className="mr-1" />
                Analytics
              </Button>
            )}

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  Nova Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Tag</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome da Tag</label>
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Ex: Marketing Digital"
                      maxLength={30}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cor</label>
                    <div className="flex gap-2 mb-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newTagColor === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                    </div>
                    <Input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-20 h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                    <Textarea
                      value={newTagDescription}
                      onChange={(e) => setNewTagDescription(e.target.value)}
                      placeholder="Descreva quando usar esta tag..."
                      rows={3}
                      maxLength={200}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim() || isLoading}
                    >
                      <Check size={16} className="mr-1" />
                      Criar Tag
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas</option>
              <option value="user">Minhas Tags</option>
              <option value="system">Tags do Sistema</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="usage">Mais Usadas</option>
              <option value="name">Nome</option>
              <option value="date">Recentes</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'Lista' : 'Grade'}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {allowBulkOperations && selectedTags.size > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedTags.size} tag{selectedTags.size > 1 ? 's' : ''} selecionada{selectedTags.size > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTags(new Set())}
                >
                  Limpar Seleção
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} className="mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tags Grid/List */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando tags...</span>
          </div>
        ) : filteredAndSortedTags.length === 0 ? (
          <div className="text-center py-12">
            <Tags size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Nenhuma tag encontrada' : 'Nenhuma tag criada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Tente ajustar sua busca ou filtros.'
                : 'Crie sua primeira tag ou importe tags padrão.'
              }
            </p>
            {!searchQuery && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCreateDefaultTags}
                >
                  <Star size={16} className="mr-1" />
                  Criar Tags Padrão
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus size={16} className="mr-1" />
                  Criar Tag
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            {allowBulkOperations && (
              <div className="mb-4 flex items-center gap-2">
                <Checkbox
                  checked={selectedTags.size === filteredAndSortedTags.length}
                  indeterminate={selectedTags.size > 0 && selectedTags.size < filteredAndSortedTags.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Selecionar todas ({filteredAndSortedTags.length})
                </span>
              </div>
            )}

            {/* Tags Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
            }>
              {filteredAndSortedTags.map((tag) => (
                <div
                  key={tag.id}
                  className={`relative border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                    selectedTags.has(tag.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                  }`}
                >
                  {/* Selection Checkbox */}
                  {allowBulkOperations && (
                    <Checkbox
                      checked={selectedTags.has(tag.id)}
                      onCheckedChange={() => handleTagSelect(tag.id)}
                      className="absolute top-3 left-3"
                    />
                  )}

                  {/* Tag Content */}
                  <div className={allowBulkOperations ? 'ml-8' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium text-gray-900">{tag.name}</span>
                        {tag.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => setEditingTag(tag)}
                          >
                            <Edit3 size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy size={14} className="mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600"
                            disabled={tag.isSystem}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {tag.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {tag.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{tag.usageCount} uso{tag.usageCount !== 1 ? 's' : ''}</span>
                      <span>Última: {formatDate(tag.lastUsedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Analytics de Tags</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Usage Stats */}
              <div>
                <h3 className="font-medium mb-3">Tags Mais Usadas</h3>
                <div className="space-y-2">
                  {usageStats.slice(0, 10).map((stat) => (
                    <div key={stat.tagId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-gray-400" />
                        <span className="font-medium">{stat.tagName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {stat.usageCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Tag Modal */}
      {editingTag && (
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tag</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Tag</label>
                <Input
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                  maxLength={30}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
                <div className="flex gap-2 mb-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingTag.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingTag({...editingTag, color})}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={editingTag.color}
                  onChange={(e) => setEditingTag({...editingTag, color: e.target.value})}
                  className="w-20 h-10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea
                  value={editingTag.description || ''}
                  onChange={(e) => setEditingTag({...editingTag, description: e.target.value})}
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingTag(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleUpdateTag(editingTag.id, {
                    name: editingTag.name,
                    color: editingTag.color,
                    description: editingTag.description
                  })}
                  disabled={isLoading}
                >
                  <Check size={16} className="mr-1" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}; 
export default TagManager; 