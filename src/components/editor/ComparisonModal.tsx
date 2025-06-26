import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Tabs } from '../ui/Tabs';
import { VersioningService } from '../../services/versioningService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ScriptVersion, ComparisonData, DiffResult } from '../../types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  versions: ScriptVersion[];
  onSelectVersions: (version1: string, version2: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  projectId,
  versions,
  onSelectVersions
}) => {
  // **ESTADOS**
  const [selectedVersion1, setSelectedVersion1] = useState<string>('');
  const [selectedVersion2, setSelectedVersion2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>('side-by-side');
  const [showMetrics, setShowMetrics] = useState(true);

  // **VERSÕES ORDENADAS**
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  // **COMPARAR VERSÕES**
  const handleCompare = async () => {
    if (!selectedVersion1 || !selectedVersion2) return;

    setIsLoading(true);
    try {
      const comparison = await VersioningService.compareVersions(
        selectedVersion1,
        selectedVersion2
      );
      setComparisonData(comparison);
      onSelectVersions(selectedVersion1, selectedVersion2);
    } catch (error) {
      console.error('Erro ao comparar versões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // **AUTO-SELECIONAR VERSÕES**
  useEffect(() => {
    if (versions.length >= 2 && !selectedVersion1 && !selectedVersion2) {
      // Selecionar automaticamente as duas versões mais recentes
      setSelectedVersion1(sortedVersions[0]?.id || '');
      setSelectedVersion2(sortedVersions[1]?.id || '');
    }
  }, [versions, sortedVersions]);

  // **AUTO-COMPARAR QUANDO VERSÕES MUDAM**
  useEffect(() => {
    if (selectedVersion1 && selectedVersion2 && selectedVersion1 !== selectedVersion2) {
      handleCompare();
    }
  }, [selectedVersion1, selectedVersion2]);

  // **FORMATAÇÃO DE DATA**
  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  // **RENDERIZAR DIFF INLINE**
  const renderInlineDiff = (diff: DiffResult[]) => {
    return (
      <div className="space-y-2">
        {diff.map((change, index) => (
          <div key={`diff-${change.type}-${change.startIndex}-${index}`} className="flex">
            <div className="w-12 text-xs text-gray-500 dark:text-gray-400 mr-4 text-right">
              {index + 1}
            </div>
            <div 
              className={`flex-1 px-3 py-1 rounded ${
                change.type === 'added' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                change.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                change.type === 'modified' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                {change.type === 'added' && <span className="text-green-600 mr-2">+</span>}
                {change.type === 'removed' && <span className="text-red-600 mr-2">-</span>}
                {change.type === 'modified' && <span className="text-yellow-600 mr-2">±</span>}
                <span className="text-sm">{change.content}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // **RENDERIZAR SIDE BY SIDE**
  const renderSideBySide = () => {
    if (!comparisonData) return null;

    const { version1, version2, diff } = comparisonData;

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Versão 1 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Versão {version1.versionNumber} ({formatDate(version1.timestamp)})
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {version1.content}
            </pre>
          </div>
        </div>

        {/* Versão 2 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Versão {version2.versionNumber} ({formatDate(version2.timestamp)})
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {version2.content}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  // **CALCULAR ESTATÍSTICAS**
  const getVersionStats = (version: ScriptVersion) => ({
    palavras: version.metadata.wordCount,
    caracteres: version.metadata.characterCount,
    tempoLeitura: `${version.metadata.readingTime}min`,
    sentimento: `${Math.round((version.metadata.sentiment + 1) * 50)}%`,
    sugestoesIA: version.aiSuggestions.length
  });

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-7xl"
      title="Comparação de Versões"
    >
      <div className="space-y-6">
        {/* **SELEÇÃO DE VERSÕES** */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primeira Versão
            </label>
            <Select
              value={selectedVersion1}
              onValueChange={setSelectedVersion1}
              options={sortedVersions.map(version => ({
                value: version.id,
                label: `Versão ${version.versionNumber} - ${formatDate(version.timestamp)}`,
                description: version.comment || 'Sem comentário'
              }))}
              placeholder="Selecione a primeira versão"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Segunda Versão
            </label>
            <Select
              value={selectedVersion2}
              onValueChange={setSelectedVersion2}
              options={sortedVersions
                .filter(v => v.id !== selectedVersion1)
                .map(version => ({
                  value: version.id,
                  label: `Versão ${version.versionNumber} - ${formatDate(version.timestamp)}`,
                  description: version.comment || 'Sem comentário'
                }))}
              placeholder="Selecione a segunda versão"
            />
          </div>
        </div>

        {/* **CONTROLES DE VISUALIZAÇÃO** */}
        {comparisonData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Modo de visualização */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'side-by-side'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icons.Columns className="w-4 h-4 mr-1 inline" />
                  Lado a Lado
                </button>
                <button
                  onClick={() => setViewMode('inline')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'inline'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icons.List className="w-4 h-4 mr-1 inline" />
                  Unificado
                </button>
              </div>

              {/* Toggle métricas */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMetrics(!showMetrics)}
              >
                <Icons.BarChart className="w-4 h-4 mr-1" />
                {showMetrics ? 'Ocultar' : 'Mostrar'} Métricas
              </Button>
            </div>

            {/* Estatísticas rápidas */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>+{comparisonData.metrics.addedWords} palavras</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>-{comparisonData.metrics.removedWords} palavras</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>±{comparisonData.metrics.modifiedWords} modificadas</span>
              </div>
            </div>
          </div>
        )}

        {/* **LOADING** */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Comparando versões...
            </span>
          </div>
        )}

        {/* **CONTEÚDO DA COMPARAÇÃO** */}
        {comparisonData && !isLoading && (
          <Tabs
            value={showMetrics ? 'metrics' : 'content'}
            onValueChange={(value) => setShowMetrics(value === 'metrics')}
            tabs={[
              { id: 'content', label: 'Comparação', icon: Icons.GitCompare },
              { id: 'metrics', label: 'Métricas', icon: Icons.BarChart },
              { id: 'changes', label: 'Mudanças', icon: Icons.List }
            ]}
          >
            {/* **TAB COMPARAÇÃO** */}
            <div id="content">
              {viewMode === 'side-by-side' ? (
                renderSideBySide()
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {renderInlineDiff(comparisonData.diff)}
                </div>
              )}
            </div>

            {/* **TAB MÉTRICAS** */}
            <div id="metrics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estatísticas das versões */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Comparação de Estatísticas
                  </h3>
                  
                  <div className="space-y-3">
                    {Object.entries(getVersionStats(comparisonData.version1)).map(([key, value1]) => {
                      const value2 = getVersionStats(comparisonData.version2)[key as keyof ReturnType<typeof getVersionStats>];
                      const diff = typeof value1 === 'number' && typeof value2 === 'number' ? value2 - value1 : null;
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {value1} → {value2}
                            </span>
                            {diff !== null && (
                              <Badge
                                variant={diff > 0 ? 'success' : diff < 0 ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {diff > 0 ? '+' : ''}{diff}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Métricas de mudanças */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Análise de Mudanças
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {comparisonData.metrics.totalChanges}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total de Mudanças
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {comparisonData.metrics.improvementScore}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Score de Melhoria
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de mudanças */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Adições</span>
                      <span className="text-green-600">{comparisonData.metrics.addedWords}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(comparisonData.metrics.addedWords / Math.max(comparisonData.metrics.totalChanges, 1)) * 100}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Remoções</span>
                      <span className="text-red-600">{comparisonData.metrics.removedWords}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(comparisonData.metrics.removedWords / Math.max(comparisonData.metrics.totalChanges, 1)) * 100}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Modificações</span>
                      <span className="text-yellow-600">{comparisonData.metrics.modifiedWords}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${(comparisonData.metrics.modifiedWords / Math.max(comparisonData.metrics.totalChanges, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* **TAB MUDANÇAS** */}
            <div id="changes">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Lista Detalhada de Mudanças
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {comparisonData.diff.filter(d => d.type !== 'unchanged').length} mudanças encontradas
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {comparisonData.diff
                    .filter(change => change.type !== 'unchanged')
                    .map((change, index) => (
                      <div 
                        key={`change-${change.type}-${change.startIndex}-${change.endIndex}-${index}`}
                        className={`p-3 rounded-lg border-l-4 ${
                          change.type === 'added' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
                          change.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
                          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              change.type === 'added' ? 'success' :
                              change.type === 'removed' ? 'destructive' :
                              'warning'
                            }
                            className="text-xs"
                          >
                            {change.type === 'added' ? 'Adicionado' :
                             change.type === 'removed' ? 'Removido' :
                             'Modificado'}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Posição: {change.startIndex}-{change.endIndex}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {change.content}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Tabs>
        )}

        {/* **EMPTY STATE** */}
        {!comparisonData && !isLoading && (selectedVersion1 && selectedVersion2) && (
          <div className="text-center py-12">
            <Icons.GitCompare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Pronto para Comparar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Clique em "Comparar Versões" para ver as diferenças.
            </p>
            <Button onClick={handleCompare}>
              <Icons.GitCompare className="w-4 h-4 mr-2" />
              Comparar Versões
            </Button>
          </div>
        )}

        {/* **RODAPÉ** */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {comparisonData && (
              <span>
                Comparação realizada em {formatDate(comparisonData.timestamp)}
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            
            {selectedVersion1 && selectedVersion2 && selectedVersion1 !== selectedVersion2 && (
              <Button onClick={handleCompare} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Comparando...
                  </>
                ) : (
                  <>
                    <Icons.GitCompare className="w-4 h-4 mr-2" />
                    Atualizar Comparação
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}; 