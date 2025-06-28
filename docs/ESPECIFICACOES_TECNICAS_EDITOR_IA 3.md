# ESPECIFICAÇÕES TÉCNICAS - EDITOR AVANÇADO COM IA

**Projeto:** Roteirar IA - Advanced AI Editor  
**Versão:** 1.0  
**Data:** Janeiro 2025  

## 🏗️ ARQUITETURA TÉCNICA

### Estrutura de Componentes

```
src/components/editor/
├── AdvancedEditor.tsx           # Editor principal
├── TextSelection.tsx            # Seleção de texto
├── SelectionToolbar.tsx         # Toolbar flutuante
├── ImprovementModal.tsx         # Modal de melhoria
├── SuggestionsList.tsx          # Lista de sugestões
├── SuggestionCard.tsx           # Card individual de sugestão
├── VersionHistory.tsx           # Histórico de versões
├── VersionComparison.tsx        # Comparação de versões
├── EditorToolbar.tsx            # Toolbar principal
├── TextStatistics.tsx           # Estatísticas do texto
└── EditorSettings.tsx           # Configurações do editor
```

### Novos Serviços

```
src/services/
├── aiEditorService.ts           # Integração com IA para edição
├── versionService.ts            # Controle de versões
├── selectionService.ts          # Gerenciamento de seleções
├── textAnalysisService.ts       # Análise de texto
├── suggestionService.ts         # Gerenciamento de sugestões
└── editorStateService.ts        # Estado do editor
```

## 🗄️ SCHEMA DO BANCO DE DADOS

### Script Version Schema
```typescript
interface ScriptVersion {
  id: string;
  scriptId: string;
  userId: string;
  version: number;
  content: string;
  
  // Metadados da versão
  title: string;
  description?: string;
  isAutoSave: boolean;
  isMajorVersion: boolean;
  
  // Mudanças
  changes: Array<{
    type: 'text_change' | 'ai_improvement' | 'manual_edit';
    startPosition: number;
    endPosition: number;
    originalText: string;
    newText: string;
    reasoning?: string;
    aiSuggestionId?: string;
  }>;
  
  // Timestamps
  createdAt: Timestamp;
  
  // Estatísticas
  wordCount: number;
  characterCount: number;
  readabilityScore?: number;
  
  // Comparação com versão anterior
  parentVersionId?: string;
  diffSummary?: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}
```

### AI Suggestion Schema
```typescript
interface AISuggestion {
  id: string;
  scriptId: string;
  userId: string;
  
  // Contexto da sugestão
  originalText: string;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
  userFeedback: string;
  
  // Sugestões geradas
  suggestions: Array<{
    id: string;
    text: string;
    reasoning: string;
    confidence: number;
    improvementType: ImprovementType;
    tags: string[];
  }>;
  
  // Metadados
  improvementType: ImprovementType;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  selectedSuggestionId?: string;
  
  // IA específico
  modelUsed: string;
  processingTime: number;
  tokens: {
    input: number;
    output: number;
  };
  
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}

type ImprovementType = 
  | 'clarity'        // Tornar mais claro
  | 'engagement'     // Mais envolvente
  | 'brevity'        // Mais conciso
  | 'call_to_action' // Adicionar CTA
  | 'tone'           // Ajustar tom
  | 'grammar'        // Correção gramatical
  | 'style'          // Estilo de escrita
  | 'custom';        // Melhoria customizada
```

### Text Selection Schema
```typescript
interface TextSelection {
  id: string;
  scriptId: string;
  userId: string;
  
  // Posição da seleção
  startPosition: number;
  endPosition: number;
  selectedText: string;
  
  // Contexto
  surroundingContext: string;
  paragraphContext: string;
  
  // Estado
  isActive: boolean;
  hasActiveImprovement: boolean;
  
  // Metadados
  createdAt: Timestamp;
  lastModifiedAt: Timestamp;
}
```

## 🎯 SISTEMA DE SELEÇÃO DE TEXTO

### Selection Service
```typescript
export class SelectionService {
  private static activeSelection: TextSelection | null = null;
  private static selectionCallbacks: Array<(selection: TextSelection | null) => void> = [];

  static setSelection(
    element: HTMLElement,
    startPos: number,
    endPos: number,
    scriptId: string,
    userId: string
  ): TextSelection {
    const selectedText = element.textContent?.substring(startPos, endPos) || '';
    const fullText = element.textContent || '';
    
    // Calcular contexto
    const contextStart = Math.max(0, startPos - 100);
    const contextEnd = Math.min(fullText.length, endPos + 100);
    const surroundingContext = fullText.substring(contextStart, contextEnd);
    
    // Encontrar contexto do parágrafo
    const beforeText = fullText.substring(0, startPos);
    const afterText = fullText.substring(endPos);
    const paragraphStart = beforeText.lastIndexOf('\n') + 1;
    const paragraphEnd = afterText.indexOf('\n');
    const paragraphContext = fullText.substring(
      paragraphStart,
      paragraphEnd === -1 ? fullText.length : endPos + paragraphEnd
    );

    const selection: TextSelection = {
      id: crypto.randomUUID(),
      scriptId,
      userId,
      startPosition: startPos,
      endPosition: endPos,
      selectedText,
      surroundingContext,
      paragraphContext,
      isActive: true,
      hasActiveImprovement: false,
      createdAt: Timestamp.now(),
      lastModifiedAt: Timestamp.now()
    };

    this.activeSelection = selection;
    this.notifySelectionChange(selection);
    
    return selection;
  }

  static clearSelection(): void {
    this.activeSelection = null;
    this.notifySelectionChange(null);
  }

  static getActiveSelection(): TextSelection | null {
    return this.activeSelection;
  }

  static onSelectionChange(callback: (selection: TextSelection | null) => void): () => void {
    this.selectionCallbacks.push(callback);
    
    // Retorna função para remover o callback
    return () => {
      const index = this.selectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.selectionCallbacks.splice(index, 1);
      }
    };
  }

  private static notifySelectionChange(selection: TextSelection | null): void {
    this.selectionCallbacks.forEach(callback => callback(selection));
  }

  static highlightSelection(element: HTMLElement, selection: TextSelection): void {
    // Implementação para destacar visualmente a seleção
    const range = document.createRange();
    const textNode = this.getTextNodeAtPosition(element, selection.startPosition);
    
    if (textNode) {
      range.setStart(textNode.node, textNode.offset);
      range.setEnd(textNode.node, textNode.offset + selection.selectedText.length);
      
      // Adicionar classe de destaque
      const span = document.createElement('span');
      span.className = 'selected-text-highlight';
      span.setAttribute('data-selection-id', selection.id);
      
      try {
        range.surroundContents(span);
      } catch (e) {
        // Fallback se a seleção cruza elementos
        console.warn('Não foi possível destacar a seleção:', e);
      }
    }
  }

  private static getTextNodeAtPosition(
    element: HTMLElement, 
    position: number
  ): { node: Text; offset: number } | null {
    let currentPos = 0;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node: Text | null = walker.nextNode() as Text;
    
    while (node) {
      const nodeLength = node.textContent?.length || 0;
      
      if (currentPos + nodeLength >= position) {
        return {
          node,
          offset: position - currentPos
        };
      }
      
      currentPos += nodeLength;
      node = walker.nextNode() as Text;
    }

    return null;
  }
}
```

## 🤖 INTEGRAÇÃO COM IA (GEMINI)

### AI Editor Service
```typescript
export class AIEditorService {
  static async generateImprovement(
    selectedText: string,
    userFeedback: string,
    improvementType: string,
    fullContext: string
  ): Promise<any> {
    // Implementação da integração com Gemini
    const prompt = this.buildImprovementPrompt(
      selectedText,
      userFeedback,
      improvementType,
      fullContext
    );

    const result = await this.callGeminiAPI(prompt);
    return this.parseGeminiResponse(result.response);
  }
}
```

## 📝 COMPONENTE PRINCIPAL DO EDITOR

### Advanced Editor Component
```typescript
interface AdvancedEditorProps {
  initialContent: string;
  scriptId: string;
  onSave: (content: string, version?: ScriptVersion) => void;
  onAutoSave?: (content: string) => void;
  readOnly?: boolean;
  showVersionHistory?: boolean;
}

const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
  initialContent,
  scriptId,
  onSave,
  onAutoSave,
  readOnly = false,
  showVersionHistory = true
}) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [activeSelection, setActiveSelection] = useState<TextSelection | null>(null);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (!onAutoSave) return;

    const autoSaveTimeout = setTimeout(() => {
      onAutoSave(content);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimeout);
  }, [content, onAutoSave]);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (readOnly) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setActiveSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (selectedText.length < 3) {
      setActiveSelection(null);
      return;
    }

    // Clear previous timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Set timeout to create selection after 500ms
    selectionTimeoutRef.current = setTimeout(() => {
      if (editorRef.current && currentUser) {
        const startPos = range.startOffset;
        const endPos = range.endOffset;

        const textSelection = SelectionService.setSelection(
          editorRef.current,
          startPos,
          endPos,
          scriptId,
          currentUser.uid
        );

        setActiveSelection(textSelection);
      }
    }, 500);
  }, [scriptId, currentUser?.uid, readOnly]);

  // Handle improvement request
  const handleImprovementRequest = () => {
    if (activeSelection) {
      setShowImprovementModal(true);
    }
  };

  // Handle suggestion application
  const handleApplySuggestion = async (suggestion: any) => {
    if (!activeSelection) return;

    const newContent = content.substring(0, activeSelection.startPosition) +
                      suggestion.text +
                      content.substring(activeSelection.endPosition);

    setContent(newContent);
    setActiveSelection(null);
    setShowImprovementModal(false);

    // Create new version
    await VersionService.createVersion(scriptId, newContent, {
      type: 'ai_improvement',
      changes: [{
        type: 'ai_improvement',
        startPosition: activeSelection.startPosition,
        endPosition: activeSelection.endPosition,
        originalText: activeSelection.selectedText,
        newText: suggestion.text,
        reasoning: suggestion.reasoning,
        aiSuggestionId: suggestion.id
      }]
    });
  };

  return (
    <div className="advanced-editor-container">
      {/* Toolbar */}
      <EditorToolbar
        onSave={() => onSave(content)}
        onUndo={() => {/* Implementar undo */}}
        onRedo={() => {/* Implementar redo */}}
        showVersionHistory={showVersionHistory}
        onToggleVersionHistory={() => {/* Toggle version history */}}
      />

      {/* Main Editor */}
      <div className="editor-main">
        <div className="editor-content">
          <div
            ref={editorRef}
            className="editor-textarea"
            contentEditable={!readOnly}
            onInput={(e) => setContent(e.currentTarget.textContent || '')}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Selection Toolbar */}
          {activeSelection && (
            <SelectionToolbar
              selection={activeSelection}
              onImprove={handleImprovementRequest}
              onClear={() => setActiveSelection(null)}
            />
          )}
        </div>

        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className="version-history-sidebar">
            <VersionHistory
              versions={versions}
              currentVersion={currentVersion}
              onVersionSelect={setCurrentVersion}
            />
          </div>
        )}
      </div>

      {/* Statistics */}
      <TextStatistics content={content} />

      {/* Improvement Modal */}
      {showImprovementModal && activeSelection && (
        <ImprovementModal
          selection={activeSelection}
          isOpen={showImprovementModal}
          onClose={() => setShowImprovementModal(false)}
          onApplySuggestion={handleApplySuggestion}
        />
      )}
    </div>
  );
};
```

## 🎛️ MODAL DE MELHORIA

### Improvement Modal Component
```typescript
interface ImprovementModalProps {
  selection: TextSelection;
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestion: (suggestion: any) => void;
}

const ImprovementModal: React.FC<ImprovementModalProps> = ({
  selection,
  isOpen,
  onClose,
  onApplySuggestion
}) => {
  const [userFeedback, setUserFeedback] = useState('');
  const [improvementType, setImprovementType] = useState<ImprovementType>('clarity');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSuggestions = async () => {
    if (!userFeedback.trim()) {
      toast.error('Por favor, descreva o que você gostaria de melhorar');
      return;
    }

    setIsGenerating(true);
    
    try {
      const fullContext = ""; // Get full context from parent
      
      const aiSuggestion = await AIEditorService.generateImprovement(
        selection.selectedText,
        userFeedback,
        improvementType,
        fullContext
      );

      setSuggestions(aiSuggestion.suggestions);
    } catch (error) {
      toast.error('Erro ao gerar sugestões. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🤖 Melhorar Trecho com IA</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Text */}
          <div>
            <Label className="text-sm font-medium">Trecho selecionado:</Label>
            <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400 mt-2">
              <p className="text-sm">{selection.selectedText}</p>
            </div>
          </div>

          {/* Improvement Type */}
          <div>
            <Label className="text-sm font-medium">Tipo de melhoria:</Label>
            <Select value={improvementType} onValueChange={setImprovementType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clarity">Tornar mais claro</SelectItem>
                <SelectItem value="engagement">Mais envolvente</SelectItem>
                <SelectItem value="brevity">Mais conciso</SelectItem>
                <SelectItem value="call_to_action">Adicionar call-to-action</SelectItem>
                <SelectItem value="tone">Ajustar tom</SelectItem>
                <SelectItem value="grammar">Correção gramatical</SelectItem>
                <SelectItem value="style">Melhorar estilo</SelectItem>
                <SelectItem value="custom">Melhoria customizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Feedback */}
          <div>
            <Label className="text-sm font-medium">
              Descreva o que você gostaria de melhorar:
            </Label>
            <Textarea
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
              placeholder="Ex: Tornar mais didático, Adicionar call to action, Simplificar linguagem..."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateSuggestions}
            disabled={isGenerating || !userFeedback.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando sugestões...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Sugestões
              </>
            )}
          </Button>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Sugestões geradas:</Label>
              <SuggestionsList
                suggestions={suggestions}
                onApply={onApplySuggestion}
                originalText={selection.selectedText}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## 📊 CONTROLE DE VERSÕES

### Version Service
```typescript
export class VersionService {
  static async createVersion(
    scriptId: string,
    content: string,
    metadata: {
      type: 'manual_save' | 'auto_save' | 'ai_improvement';
      title?: string;
      description?: string;
      changes?: any[];
    }
  ): Promise<ScriptVersion> {
    try {
      // Get current version number
      const currentVersions = await this.getVersions(scriptId);
      const nextVersion = currentVersions.length + 1;

      // Calculate statistics
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const characterCount = content.length;

      // Create version
      const version: Omit<ScriptVersion, 'id'> = {
        scriptId,
        userId: '', // Get from context
        version: nextVersion,
        content,
        title: metadata.title || `Versão ${nextVersion}`,
        description: metadata.description,
        isAutoSave: metadata.type === 'auto_save',
        isMajorVersion: metadata.type !== 'auto_save',
        changes: metadata.changes || [],
        createdAt: Timestamp.now(),
        wordCount,
        characterCount,
        parentVersionId: currentVersions[0]?.id
      };

      // Calculate diff with previous version
      if (currentVersions.length > 0) {
        version.diffSummary = this.calculateDiff(
          currentVersions[0].content,
          content
        );
      }

      const docRef = await addDoc(collection(db, 'scriptVersions'), version);
      
      return {
        id: docRef.id,
        ...version
      } as ScriptVersion;
    } catch (error) {
      console.error('Erro ao criar versão:', error);
      throw error;
    }
  }

  static async getVersions(scriptId: string): Promise<ScriptVersion[]> {
    try {
      const q = query(
        collection(db, 'scriptVersions'),
        where('scriptId', '==', scriptId),
        orderBy('version', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScriptVersion[];
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
      return [];
    }
  }

  private static calculateDiff(oldContent: string, newContent: string): {
    additions: number;
    deletions: number;
    modifications: number;
  } {
    // Implementação simplificada - em produção usar biblioteca como diff-match-patch
    const oldWords = oldContent.split(/\s+/);
    const newWords = newContent.split(/\s+/);

    return {
      additions: Math.max(0, newWords.length - oldWords.length),
      deletions: Math.max(0, oldWords.length - newWords.length),
      modifications: Math.abs(oldWords.length - newWords.length)
    };
  }
}
```

## 🎨 COMPONENTES DE UI ESPECÍFICOS

### Selection Toolbar
```typescript
interface SelectionToolbarProps {
  selection: TextSelection;
  onImprove: () => void;
  onClear: () => void;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selection,
  onImprove,
  onClear
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Calculate position based on selection
    const rect = window.getSelection()?.getRangeAt(0)?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 50
      });
    }
  }, [selection]);

  return (
    <div
      className="selection-toolbar"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}
    >
      <div className="bg-white border rounded-lg shadow-lg p-2 flex items-center gap-2">
        <Button
          size="sm"
          onClick={onImprove}
          className="flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          Melhorar com IA
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
```

### Text Statistics
```typescript
interface TextStatisticsProps {
  content: string;
}

const TextStatistics: React.FC<TextStatisticsProps> = ({ content }) => {
  const stats = useMemo(() => {
    const words = content.split(/\s+/).filter(Boolean).length;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean).length;
    
    // Estimativa de tempo de leitura (palavras por minuto)
    const readingTime = Math.ceil(words / 200);
    
    return {
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
      readingTime
    };
  }, [content]);

  return (
    <div className="text-statistics bg-gray-50 p-3 border-t">
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span>{stats.words} palavras</span>
        <span>{stats.characters} caracteres</span>
        <span>{stats.paragraphs} parágrafos</span>
        <span>~{stats.readingTime} min leitura</span>
      </div>
    </div>
  );
};
```

---

*Esta especificação técnica serve como guia completo para a implementação do editor avançado com IA e deve ser seguida rigorosamente durante o desenvolvimento.* 