import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Bookmark, 
  History, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Clock,
  Star,
  MoreVertical
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
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';

import type { FilterOptions } from '../../types/enhanced';
import { FilterPersistenceService, SavedFilter } from '../../services/filterPersistenceService';
import { createLogger } from '../../utils/logger';

const logger = createLogger('FilterPresets');

interface FilterPresetsProps {
  currentFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  userId: string;
}

export const FilterPresets: React.FC<FilterPresetsProps> = ({
  currentFilters,
  onApplyFilters,
  userId
}) => {
  const [presets, setPresets] = useState<SavedFilter[]>([]);
  const [filterHistory, setFilterHistory] = useState<Array<{
    filters: FilterOptions;
    timestamp: string;
    description: string;
  }>>([]);
  const [preferences, setPreferences] = useState(FilterPersistenceService.loadFilterPreferences());
  const [isLoading, setIsLoading] = useState(false);

  // Estados para modais
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState<SavedFilter | null>(null);

  // Estados para formulários
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    loadPresets();
    loadFilterHistory();
  }, [userId, loadPresets]);

  // Auto-salvar filtros quando habilitado
  useEffect(() => {
    if (preferences.autoSave) {
      FilterPersistenceService.saveCurrentFilters(currentFilters);
    }
  }, [currentFilters, preferences.autoSave]);

  const loadPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      const userPresets = await FilterPersistenceService.loadFilterPresets(userId);
      setPresets(userPresets);
    } catch (error: unknown) {
      logger.error('Erro ao carregar presets', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadFilterHistory = () => {
    const history = FilterPersistenceService.getFilterHistory();
    setFilterHistory(history);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;

    try {
      setIsLoading(true);
      
      if (editingPreset) {
        await FilterPersistenceService.updateFilterPreset(editingPreset.id, {
          name: presetName,
          description: presetDescription,
          filters: currentFilters
        });
      } else {
        await FilterPersistenceService.saveFilterPreset(
          userId,
          presetName,
          currentFilters,
          presetDescription
        );
      }

      await loadPresets();
      setShowSaveDialog(false);
      setEditingPreset(null);
      setPresetName('');
      setPresetDescription('');
    } catch (error: unknown) {
      logger.error('Erro ao salvar preset', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      setIsLoading(true);
      await FilterPersistenceService.deleteFilterPreset(presetId);
      await loadPresets();
    } catch (error: unknown) {
      logger.error('Erro ao deletar preset', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = async (preset: SavedFilter) => {
    try {
      await FilterPersistenceService.incrementPresetUsage(preset.id);
      onApplyFilters(preset.filters);
      await loadPresets(); // Recarregar para atualizar contadores
    } catch (error: unknown) {
      logger.error('Erro ao aplicar preset', error);
    }
  };

  const handleApplyFromHistory = (filters: FilterOptions) => {
    onApplyFilters(filters);
    setShowHistoryDialog(false);
  };

  const handleEditPreset = (preset: SavedFilter) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setPresetDescription(preset.description || '');
    setShowSaveDialog(true);
  };

  const handleSavePreferences = () => {
    FilterPersistenceService.saveFilterPreferences(preferences);
    setShowPreferencesDialog(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 30) {
      return `${diffDays}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Presets Salvos */}
      {presets.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Bookmark size={14} className="mr-1" />
              Presets ({presets.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
            {presets.map((preset) => (
              <div key={preset.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleApplyPreset(preset)}
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  {preset.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {preset.description}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {preset.usageCount} uso{preset.usageCount !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(preset.updatedAt.toISOString())}
                    </span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEditPreset(preset)}>
                      <Edit3 size={12} className="mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeletePreset(preset.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={12} className="mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Salvar Preset Atual */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save size={14} className="mr-1" />
            Salvar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? 'Editar Preset' : 'Salvar Filtros Como Preset'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Preset</label>
              <Input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Ex: Conteúdo Instagram Recente"
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
              <Textarea
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Descreva quando usar este preset..."
                maxLength={200}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSaveDialog(false);
                  setEditingPreset(null);
                  setPresetName('');
                  setPresetDescription('');
                }}
              >
                <X size={14} className="mr-1" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePreset}
                disabled={!presetName.trim() || isLoading}
              >
                <Check size={14} className="mr-1" />
                {editingPreset ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Histórico de Filtros */}
      {preferences.showFilterHistory && filterHistory.length > 0 && (
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <History size={14} className="mr-1" />
              Histórico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Histórico de Filtros</DialogTitle>
            </DialogHeader>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filterHistory.map((item, _index) => (
                <div
                  key={`${item.timestamp}-${index}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleApplyFromHistory(item.filters)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.description}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Aplicar
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Preferências */}
      <Dialog open={showPreferencesDialog} onOpenChange={setShowPreferencesDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings size={14} className="mr-1" />
            Preferências
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preferências de Filtros</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Salvar automaticamente</div>
                <div className="text-sm text-gray-500">
                  Salva filtros automaticamente no navegador
                </div>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, autoSave: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Lembrar estado expandido</div>
                <div className="text-sm text-gray-500">
                  Mantém filtros expandidos ao recarregar
                </div>
              </div>
              <Switch
                checked={preferences.rememberExpanded}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, rememberExpanded: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Mostrar histórico</div>
                <div className="text-sm text-gray-500">
                  Exibe botão do histórico de filtros
                </div>
              </div>
              <Switch
                checked={preferences.showFilterHistory}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, showFilterHistory: checked }))
                }
              />
            </div>

            <div className="border-t pt-4">
              <div className="font-medium mb-2">Ordenação padrão</div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={preferences.defaultSort.sortBy}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    defaultSort: { ...prev.defaultSort, sortBy: e.target.value }
                  }))}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="date">Data</option>
                  <option value="title">Título</option>
                  <option value="platform">Plataforma</option>
                  <option value="wordCount">Palavras</option>
                </select>
                
                <select
                  value={preferences.defaultSort.sortOrder}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    defaultSort: { ...prev.defaultSort, sortOrder: e.target.value as 'asc' | 'desc' }
                  }))}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowPreferencesDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSavePreferences}>
                <Check size={14} className="mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Indicador de carregamento */}
      {isLoading && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600"></div>
          Processando...
        </div>
      )}
    </div>
  );
}; 