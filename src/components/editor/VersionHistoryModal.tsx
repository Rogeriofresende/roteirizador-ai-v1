import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ScriptVersion } from '../../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  versions: ScriptVersion[];
  currentVersion: ScriptVersion | null;
  onRestore: (version: ScriptVersion) => void;
  onCompare: (version1: string, version2: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  versions,
  currentVersion,
  onRestore,
  onCompare
}) => {
  // **ESTADOS**
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'manual' | 'auto'>('all');

  // **FILTRAR VERSÕES**
  const filteredVersions = versions.filter(version => {
    if (filterType === 'manual') return !version.isAutoSave;
    if (filterType === 'auto') return version.isAutoSave;
    return true;
  });

  // **SELEÇÃO DE VERSÕES**
  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId]; // Manter apenas 2 selecionados
      }
      return [...prev, versionId];
    });
  };

  // **RESTAURAR VERSÃO**
  const handleRestore = (version: ScriptVersion) => {
    setIsLoading(true);
    onRestore(version);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  // **COMPARAR VERSÕES**
  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare(selectedVersions[0], selectedVersions[1]);
    }
  };

  // **EXPANDIR/COLAPSAR VERSÃO**
  const toggleExpanded = (versionId: string) => {
    setExpandedVersion(prev => prev === versionId ? null : versionId);
  };

  // **CALCULAR DIFERENÇAS**
  const calculateDifferences = (version: ScriptVersion): string => {
    const changes = version.changes.length;
    const additions = version.changes.filter(c => c.type === 'addition').length;
    const deletions = version.changes.filter(c => c.type === 'deletion').length;
    const modifications = version.changes.filter(c => c.type === 'modification').length;

    if (changes === 0) return 'Primeira versão';
    
    const parts = [];
    if (additions > 0) parts.push(`+${additions}`);
    if (deletions > 0) parts.push(`-${deletions}`);
    if (modifications > 0) parts.push(`±${modifications}`);
    
    return parts.join(' ') || 'Sem mudanças';
  };

  // **FORMATAÇÃO DE DATA**
  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd 'de' MMM 'às' HH:mm", { locale: ptBR });
  };

  // **RESET AO ABRIR**
  useEffect(() => {
    if (isOpen) {
      setSelectedVersions([]);
      setExpandedVersion(null);
      setFilterType('all');
    }
  }, [isOpen]);

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-5xl"
      title="Histórico de Versões"
    >
      <div className="space-y-4">
        {/* **CONTROLES** */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Filtros */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filtrar:</span>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Todas' },
                  { key: 'manual', label: 'Manuais' },
                  { key: 'auto', label: 'Auto-save' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key as any)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      filterType === filter.key
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredVersions.length} versão(ões)
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {selectedVersions.length === 2 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCompare}
              >
                <Icons.GitCompare className="w-4 h-4 mr-1" />
                Comparar Selecionadas
              </Button>
            )}
            
            {selectedVersions.length === 1 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Selecione mais uma versão para comparar
              </span>
            )}
          </div>
        </div>

        {/* **LISTA DE VERSÕES** */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredVersions.map((version, index) => {
            const isSelected = selectedVersions.includes(version.id);
            const isCurrent = currentVersion?.id === version.id;
            const isExpanded = expandedVersion === version.id;

            return (
              <div
                key={version.id}
                className={`
                  border rounded-lg transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }
                  ${isCurrent ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
                `}
              >
                <div className="p-4">
                  {/* **CABEÇALHO DA VERSÃO** */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Checkbox de seleção */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleVersionSelect(version.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />

                      {/* Informações básicas */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            Versão {version.versionNumber}
                          </h3>
                          
                          {/* Badges */}
                          {isCurrent && (
                            <Badge variant="success" className="text-xs">
                              <Icons.CheckCircle className="w-3 h-3 mr-1" />
                              Atual
                            </Badge>
                          )}
                          
                          {version.isAutoSave && (
                            <Badge variant="secondary" className="text-xs">
                              <Icons.Clock className="w-3 h-3 mr-1" />
                              Auto-save
                            </Badge>
                          )}
                          
                          {version.aiSuggestions.length > 0 && (
                            <Badge variant="info" className="text-xs">
                              <Icons.Sparkles className="w-3 h-3 mr-1" />
                              IA ({version.aiSuggestions.length})
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(version.timestamp)}
                          {version.comment && ` • ${version.comment}`}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      {/* Estatísticas rápidas */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        <div>{version.metadata.wordCount} palavras</div>
                        <div>{calculateDifferences(version)}</div>
                      </div>

                      {/* Botões de ação */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpanded(version.id)}
                      >
                        <Icons.ChevronDown 
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </Button>

                      {!isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(version)}
                          disabled={isLoading}
                        >
                          <Icons.RotateCcw className="w-4 h-4 mr-1" />
                          Restaurar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* **DETALHES EXPANDIDOS** */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      {/* Estatísticas detalhadas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {version.metadata.wordCount}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Palavras</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {version.metadata.characterCount}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Caracteres</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {version.metadata.readingTime}min
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Leitura</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {Math.round((version.metadata.sentiment + 1) * 50)}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Sentimento</div>
                        </div>
                      </div>

                      {/* Preview do conteúdo */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Preview do Conteúdo
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                          {version.content.length > 200 
                            ? `${version.content.substring(0, 200)}...`
                            : version.content
                          }
                        </div>
                      </div>

                      {/* Mudanças */}
                      {version.changes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Mudanças ({version.changes.length})
                          </h4>
                          <div className="space-y-1">
                            {version.changes.slice(0, 3).map((change) => (
                              <div key={change.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  change.type === 'addition' ? 'bg-green-400' :
                                  change.type === 'deletion' ? 'bg-red-400' :
                                  change.type === 'modification' ? 'bg-yellow-400' :
                                  'bg-blue-400'
                                }`} />
                                <span className="capitalize">{change.type}</span>
                                <span>•</span>
                                <span>{change.newText?.substring(0, 50) || change.oldText?.substring(0, 50)}...</span>
                              </div>
                            ))}
                            {version.changes.length > 3 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{version.changes.length - 3} mais mudanças
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sugestões de IA aplicadas */}
                      {version.aiSuggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Sugestões de IA Aplicadas ({version.aiSuggestions.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {version.aiSuggestions.map((suggestionId, index) => (
                              <Badge key={suggestionId} variant="info" className="text-xs">
                                Sugestão {index + 1}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* **EMPTY STATE** */}
        {filteredVersions.length === 0 && (
          <div className="text-center py-12">
            <Icons.History className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma versão encontrada
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filterType === 'all' 
                ? 'Este projeto ainda não possui versões salvas.'
                : `Nenhuma versão ${filterType === 'manual' ? 'manual' : 'automática'} encontrada.`
              }
            </p>
          </div>
        )}

        {/* **RODAPÉ** */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Adição</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>Remoção</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>Modificação</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>IA</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            
            {selectedVersions.length === 2 && (
              <Button onClick={handleCompare}>
                <Icons.GitCompare className="w-4 h-4 mr-2" />
                Comparar Versões
              </Button>
            )}
          </div>
        </div>

        {/* **LOADING OVERLAY** */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Restaurando versão...
              </span>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}; 