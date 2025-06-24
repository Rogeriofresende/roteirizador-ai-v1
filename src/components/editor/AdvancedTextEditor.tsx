import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AIRefinementModal } from './AIRefinementModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { ComparisonModal } from './ComparisonModal';
import { AIEditorService } from '../../services/aiEditorService';
import { VersioningService } from '../../services/versioningService';
import type { 
  TextSelection, 
  AISuggestion, 
  ScriptVersion,
  EditorUIState,
  EditorConfig,
  EditorCallbacks
} from '../../types';

interface AdvancedTextEditorProps {
  projectId: string;
  userId: string;
  initialContent: string;
  config?: Partial<EditorConfig>;
  callbacks?: Partial<EditorCallbacks>;
  onContentChange?: (content: string) => void;
  onSelectionChange?: (selection: TextSelection | null) => void;
}

export const AdvancedTextEditor: React.FC<AdvancedTextEditorProps> = ({
  projectId,
  userId,
  initialContent,
  config = {},
  callbacks = {},
  onContentChange,
  onSelectionChange
}) => {
  // **ESTADOS PRINCIPAIS**
  const [content, setContent] = useState(initialContent);
  const [uiState, setUIState] = useState<EditorUIState>({
    currentSelection: null,
    activeModal: null,
    showSuggestions: false,
    showVersionHistory: false,
    comparisonMode: false,
    highlightedChanges: [],
    pendingAIRequests: [],
    isProcessing: false,
    lastSaved: null,
    hasUnsavedChanges: false
  });

  // **ESTADOS DE FUNCIONALIDADES**
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ScriptVersion | null>(null);
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(config.preferences?.autoSave ?? true);

  // **REFS**
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout>();
  const autoSaveRef = useRef<(() => void) | null>(null);

  // **CONFIGURAÇÕES**
  const editorConfig = {
    preferences: {
      autoSave: true,
      autoSaveInterval: 30,
      aiSuggestionsEnabled: true,
      showVersionHistory: true,
      highlightChanges: true,
      comparisonMode: 'side-by-side' as const,
      aiProvider: 'gemini' as const,
      sugestionTypes: ['improve', 'clarity', 'engagement', 'grammar'] as const
    },
    theme: {
      fontSize: 16,
      lineHeight: 1.6,
      wordWrap: true,
      showLineNumbers: false,
      highlightCurrentLine: true
    },
    ...config
  };

  // **INICIALIZAÇÃO**
  useEffect(() => {
    loadVersions();
    if (autoSaveEnabled) {
      enableAutoSave();
    }

    return () => {
      if (autoSaveRef.current) {
        autoSaveRef.current();
      }
    };
  }, [projectId, autoSaveEnabled]);

  // **CARREGAMENTO DE DADOS**
  const loadVersions = async () => {
    try {
      const [projectVersions, current] = await Promise.all([
        VersioningService.getProjectVersions(projectId, 20),
        VersioningService.getCurrentVersion(projectId)
      ]);
      
      setVersions(projectVersions);
      setCurrentVersion(current);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    }
  };

  // **AUTO-SAVE**
  const enableAutoSave = useCallback(() => {
    if (autoSaveRef.current) {
      autoSaveRef.current();
    }

    VersioningService.enableAutoSave(
      projectId,
      userId,
      () => content
    ).then(stopAutoSave => {
      autoSaveRef.current = stopAutoSave;
    });
  }, [projectId, userId, content]);

  // **SELEÇÃO DE TEXTO**
  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      // Sem seleção
      setUIState(prev => ({ ...prev, currentSelection: null }));
      onSelectionChange?.(null);
      return;
    }

    const selectedText = content.substring(start, end);
    const context = AIEditorService.extractContext(content, {
      id: '',
      startIndex: start,
      endIndex: end,
      selectedText,
      context: '',
      timestamp: new Date() as any,
      userId
    });

    const selection: TextSelection = {
      id: `selection_${Date.now()}`,
      startIndex: start,
      endIndex: end,
      selectedText,
      context,
      timestamp: new Date() as any,
      userId
    };

    setUIState(prev => ({ ...prev, currentSelection: selection }));
    onSelectionChange?.(selection);
    callbacks.onTextSelect?.(selection);

    // Buscar sugestões contextuais após um delay
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = setTimeout(() => {
      if (editorConfig.preferences.aiSuggestionsEnabled && selectedText.length > 10) {
        getContextualSuggestions(selection);
      }
    }, 1000);

  }, [content, userId, callbacks, onSelectionChange, editorConfig.preferences.aiSuggestionsEnabled]);

  // **SUGESTÕES CONTEXTUAIS**
  const getContextualSuggestions = async (selection: TextSelection) => {
    try {
      setUIState(prev => ({ ...prev, isProcessing: true }));

      const contextualSuggestions = await AIEditorService.getContextualSuggestions(
        selection,
        content,
        {
          platform: 'YouTube', // Seria dinâmico baseado no projeto
          audience: 'geral',
          tone: 'casual'
        }
      );

      setUIState(prev => ({ 
        ...prev, 
        isProcessing: false,
        showSuggestions: contextualSuggestions.length > 0
      }));

    } catch (error) {
      console.error('Erro ao obter sugestões contextuais:', error);
      setUIState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // **REFINAMENTO COM IA**
  const requestAIRefinement = async (refinementType: string, instructions = '') => {
    if (!uiState.currentSelection) return;

    try {
      setUIState(prev => ({ 
        ...prev, 
        isProcessing: true,
        pendingAIRequests: [...prev.pendingAIRequests, refinementType]
      }));

      const request = {
        id: `request_${Date.now()}`,
        projectId,
        userId,
        originalText: content,
        selectedText: uiState.currentSelection.selectedText,
        selectionStart: uiState.currentSelection.startIndex,
        selectionEnd: uiState.currentSelection.endIndex,
        refinementType: refinementType as any,
        userInstructions: instructions,
        context: {
          platform: 'YouTube',
          audience: 'geral',
          tone: 'casual',
          duration: 300
        },
        timestamp: new Date() as any,
        status: 'pending' as const
      };

      const aiSuggestions = await AIEditorService.refineText(request);
      setSuggestions(prev => [...prev, ...aiSuggestions]);

      setUIState(prev => ({ 
        ...prev, 
        isProcessing: false,
        pendingAIRequests: prev.pendingAIRequests.filter(r => r !== refinementType),
        showSuggestions: true
      }));

      callbacks.onAIRequest?.(request);

    } catch (error) {
      console.error('Erro no refinamento de IA:', error);
      setUIState(prev => ({ 
        ...prev, 
        isProcessing: false,
        pendingAIRequests: prev.pendingAIRequests.filter(r => r !== refinementType)
      }));
    }
  };

  // **APLICAR SUGESTÃO**
  const applySuggestion = async (suggestion: AISuggestion) => {
    if (!uiState.currentSelection) return;

    try {
      const newContent = 
        content.substring(0, uiState.currentSelection.startIndex) +
        suggestion.suggestedText +
        content.substring(uiState.currentSelection.endIndex);

      setContent(newContent);
      setUIState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: true,
        currentSelection: null
      }));

      onContentChange?.(newContent);
      callbacks.onSuggestionAccept?.(suggestion);

      // Remover sugestão da lista
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

    } catch (error) {
      console.error('Erro ao aplicar sugestão:', error);
    }
  };

  // **SALVAR VERSÃO**
  const saveVersion = async (comment = '') => {
    try {
      setUIState(prev => ({ ...prev, isProcessing: true }));

      const version = await VersioningService.createVersion(
        projectId,
        userId,
        content,
        comment,
        false,
        suggestions.map(s => s.id)
      );

      setCurrentVersion(version);
      setVersions(prev => [version, ...prev]);
      setUIState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: false,
        lastSaved: new Date() as any,
        isProcessing: false
      }));

      callbacks.onVersionSave?.(version);

    } catch (error) {
      console.error('Erro ao salvar versão:', error);
      setUIState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // **MUDANÇAS NO CONTEÚDO**
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setUIState(prev => ({ ...prev, hasUnsavedChanges: true }));
    onContentChange?.(newContent);
  };

  // **ATALHOS DO TECLADO**
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S para salvar
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveVersion('Salvamento manual');
    }

    // Ctrl+Z para undo (seria implementado com histórico local)
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      // Implementar undo
    }

    // Ctrl+Shift+I para refinamento inteligente
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      if (uiState.currentSelection) {
        requestAIRefinement('improve');
      }
    }
  };

  return (
    <div className="advanced-text-editor">
      {/* **TOOLBAR** */}
      <div className="editor-toolbar flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          {/* Botões de refinamento rápido */}
          {uiState.currentSelection && (
            <div className="flex items-center space-x-2 mr-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {uiState.currentSelection.selectedText.length} caracteres selecionados
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => requestAIRefinement('improve')}
                disabled={uiState.isProcessing}
                className="h-8"
              >
                <Icons.Sparkles className="w-4 h-4 mr-1" />
                Melhorar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => requestAIRefinement('clarity')}
                disabled={uiState.isProcessing}
                className="h-8"
              >
                <Icons.Eye className="w-4 h-4 mr-1" />
                Clareza
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => requestAIRefinement('engagement')}
                disabled={uiState.isProcessing}
                className="h-8"
              >
                <Icons.Heart className="w-4 h-4 mr-1" />
                Engajamento
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setUIState(prev => ({ ...prev, activeModal: 'refinement' }))}
                className="h-8"
              >
                <Icons.Settings className="w-4 h-4 mr-1" />
                Avançado
              </Button>
            </div>
          )}

          {/* Indicadores de status */}
          {uiState.isProcessing && (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Processando IA...
              </span>
            </div>
          )}

          {uiState.hasUnsavedChanges && (
            <Badge variant="warning" className="text-xs">
              <Icons.AlertCircle className="w-3 h-3 mr-1" />
              Não salvo
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Estatísticas */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mr-4">
            {content.split(/\s+/).filter(Boolean).length} palavras
          </div>

          {/* Controles de versão */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUIState(prev => ({ ...prev, activeModal: 'history' }))}
          >
            <Icons.History className="w-4 h-4 mr-1" />
            Histórico
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setUIState(prev => ({ ...prev, activeModal: 'comparison' }))}
            disabled={versions.length < 2}
          >
            <Icons.GitCompare className="w-4 h-4 mr-1" />
            Comparar
          </Button>

          <Button
            size="sm"
            onClick={() => saveVersion('Salvamento manual')}
            disabled={uiState.isProcessing || !uiState.hasUnsavedChanges}
          >
            <Icons.Save className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>
      </div>

      {/* **ÁREA DE EDIÇÃO** */}
      <div className="editor-content flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onSelect={handleTextSelection}
          onKeyDown={handleKeyDown}
          className={`
            w-full h-full min-h-[500px] p-6 border-none outline-none resize-none
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            font-mono leading-relaxed
          `}
          style={{
            fontSize: `${editorConfig.theme.fontSize}px`,
            lineHeight: editorConfig.theme.lineHeight
          }}
          placeholder="Comece a escrever seu roteiro aqui... Selecione texto para ver sugestões de IA."
        />

        {/* **PAINEL DE SUGESTÕES** */}
        {uiState.showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-4 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Sugestões de IA
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setUIState(prev => ({ ...prev, showSuggestions: false }))}
              >
                <Icons.X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {suggestions.slice(0, 3).map((suggestion) => (
                <div key={suggestion.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {suggestion.suggestedText}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(suggestion.confidence * 100)}% confiança
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion(suggestion)}
                        className="h-7 text-xs"
                      >
                        Aplicar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                          callbacks.onSuggestionReject?.(suggestion);
                        }}
                        className="h-7 text-xs"
                      >
                        <Icons.X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {suggestion.explanation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {suggestion.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* **MODAIS** */}
      {uiState.activeModal === 'refinement' && uiState.currentSelection && (
        <AIRefinementModal
          isOpen={true}
          onClose={() => setUIState(prev => ({ ...prev, activeModal: null }))}
          selection={uiState.currentSelection}
          onRefine={(type, instructions) => {
            requestAIRefinement(type, instructions);
            setUIState(prev => ({ ...prev, activeModal: null }));
          }}
        />
      )}

      {uiState.activeModal === 'history' && (
        <VersionHistoryModal
          isOpen={true}
          onClose={() => setUIState(prev => ({ ...prev, activeModal: null }))}
          projectId={projectId}
          versions={versions}
          currentVersion={currentVersion}
          onRestore={(version) => {
            setContent(version.content);
            setUIState(prev => ({ ...prev, activeModal: null, hasUnsavedChanges: true }));
            callbacks.onVersionRestore?.(version);
          }}
          onCompare={(v1, v2) => {
            setUIState(prev => ({ ...prev, activeModal: 'comparison' }));
            callbacks.onCompare?.(v1, v2);
          }}
        />
      )}

      {uiState.activeModal === 'comparison' && (
        <ComparisonModal
          isOpen={true}
          onClose={() => setUIState(prev => ({ ...prev, activeModal: null }))}
          projectId={projectId}
          versions={versions}
          onSelectVersions={(v1, v2) => {
            callbacks.onCompare?.(v1, v2);
          }}
        />
      )}
    </div>
  );
}; 