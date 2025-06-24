import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag as TagIcon, 
  Save, 
  X, 
  Search,
  Hash,
  Palette,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Dialog } from '../ui/Dialog';
import { Select } from '../ui/Select';
import { Separator } from '../ui/Separator';
import { TagService } from '../../services/tagService';
import { useAuth } from '../../contexts/AuthContext';
import type { Tag } from '../../types';
import { cn } from '../../lib/utils';

interface TagManagerProps {
  onTagSelect?: (tags: string[]) => void;
  selectedTags?: string[];
  showStats?: boolean;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  className?: string;
}

const TagManager: React.FC<TagManagerProps> = ({
  onTagSelect,
  selectedTags = [],
  showStats = true,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'date'>('usage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#3B82F6',
    category: 'custom' as Tag['category']
  });

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F59E0B'
  ];

  const categoryLabels: Record<Tag['category'], string> = {
    'platform': 'Plataforma',
    'tone': 'Tom',
    'audience': 'Público',
    'status': 'Status',
    'custom': 'Personalizada'
  };

  useEffect(() => {
    loadTags();
  }, [currentUser]);

  const loadTags = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userTags = await TagService.getUserTags(currentUser.uid);
      setTags(userTags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!currentUser || !newTag.name.trim()) return;

    try {
      const validation = TagService.validateTagData(newTag);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
      }

      await TagService.createTag(currentUser.uid, newTag);
      await loadTags();
      
      setNewTag({
        name: '',
        color: '#3B82F6',
        category: 'custom'
      });
      setShowCreateDialog(false);
    } catch (error: any) {
      alert(error.message || 'Erro ao criar tag');
    }
  };

  const handleEditTag = async () => {
    if (!editingTag) return;

    try {
      const validation = TagService.validateTagData(editingTag);
      if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
      }

      await TagService.updateTag(editingTag.id, editingTag);
      await loadTags();
      setEditingTag(null);
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar tag');
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    if (!window.confirm(`Tem certeza que deseja excluir a tag "${tag.name}"?`)) {
      return;
    }

    try {
      await TagService.deleteTag(tag.id);
      await loadTags();
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir tag');
    }
  };

  const handleTagToggle = (tagName: string) => {
    if (!onTagSelect) return;

    const newSelection = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    
    onTagSelect(newSelection);
  };

  const filteredAndSortedTags = tags
    .filter(tag => {
      if (searchTerm && !tag.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'all' && tag.category !== selectedCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'date':
          comparison = a.createdAt.seconds - b.createdAt.seconds;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getTagStats = () => {
    const totalTags = tags.length;
    const byCategory = tags.reduce((acc, tag) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsed = tags
      .filter(tag => tag.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3);

    return { totalTags, byCategory, mostUsed };
  };

  const stats = getTagStats();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Gerenciar Tags
          </h3>
          <p className="text-sm text-muted-foreground">
            Organize seus projetos com tags personalizadas
          </p>
        </div>
        
        {allowCreate && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tag
          </Button>
        )}
      </div>

      {/* Estatísticas (se habilitadas) */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total de Tags</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mais Utilizada</span>
            </div>
            <div className="text-lg font-semibold">
              {stats.mostUsed[0] ? (
                <Badge 
                  style={{ backgroundColor: stats.mostUsed[0].color + '20', color: stats.mostUsed[0].color }}
                  className="border-0"
                >
                  {stats.mostUsed[0].name} ({stats.mostUsed[0].usageCount})
                </Badge>
              ) : (
                <span className="text-muted-foreground">Nenhuma</span>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Por Categoria</span>
            </div>
            <div className="space-y-1">
              {Object.entries(stats.byCategory).slice(0, 2).map(([category, count]) => (
                <div key={category} className="text-xs flex justify-between">
                  <span>{categoryLabels[category as Tag['category']]}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'name' | 'usage' | 'date')}
          >
            <option value="usage">Mais usadas</option>
            <option value="name">Nome</option>
            <option value="date">Data de criação</option>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* Lista de Tags */}
      <Card className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Carregando tags...</p>
          </div>
        ) : filteredAndSortedTags.length === 0 ? (
          <div className="text-center py-8">
            <TagIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nenhuma tag encontrada com os filtros aplicados'
                : 'Nenhuma tag criada ainda'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedTags.map(tag => (
              <div 
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {onTagSelect ? (
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name)}
                      className="rounded"
                    />
                  ) : (
                    <div 
                      className="w-4 h-4 rounded-full border-2" 
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      style={{ 
                        backgroundColor: tag.color + '20', 
                        color: tag.color,
                        borderColor: tag.color 
                      }}
                      className="font-medium"
                    >
                      {tag.name}
                    </Badge>
                    
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[tag.category]}
                    </Badge>
                    
                    {tag.usageCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {tag.usageCount} usos
                      </Badge>
                    )}
                    
                    {tag.isSystemTag && (
                      <Badge variant="outline" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {allowEdit && !tag.isSystemTag && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTag({ ...tag })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {allowDelete && !tag.isSystemTag && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTag(tag)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dialog de Criação */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Criar Nova Tag</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Tag</label>
                  <Input
                    placeholder="Ex: Marketing, Tutorial, Viral..."
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <Select
                    value={newTag.category}
                    onValueChange={(value) => setNewTag({ ...newTag, category: value as Tag['category'] })}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          newTag.color === color ? "border-gray-900 scale-110" : "border-gray-300"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTag({ ...newTag, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTag} disabled={!newTag.name.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Tag
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Dialog>
      )}

      {/* Dialog de Edição */}
      {editingTag && (
        <Dialog open={true} onOpenChange={() => setEditingTag(null)}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Editar Tag</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Tag</label>
                  <Input
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <Select
                    value={editingTag.category}
                    onValueChange={(value) => setEditingTag({ ...editingTag, category: value as Tag['category'] })}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          editingTag.color === color ? "border-gray-900 scale-110" : "border-gray-300"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingTag({ ...editingTag, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingTag(null)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleEditTag} disabled={!editingTag.name.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default TagManager; 