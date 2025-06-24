export interface FormData {
  platform: string;
  format: string;
  goal: string;
  audience: string;
  tone: string;
  subject: string;
  duration: number;
  details: string;
  otherGoal: string;
  otherAudience: string;
  otherTone: string;
  otherFormat: string;
  customPlatform?: string;
  customFormat?: string;
  hook?: string;
  callToAction?: string;
  keyPoints?: string;
  additionalNotes?: string;
}

export interface SavedScript {
  id: string;
  title: string;
  script: string;
  scriptContent: string;
  createdAt: any; // Using `any` for Firebase ServerTimestamp
  formData: FormData;
  userId: string;
}

// === NOVOS TIPOS PARA DASHBOARD APRIMORADO ===

export interface EnhancedProject {
  id: string;
  userId: string;
  title: string;
  content: string;
  formData: FormData;
  
  // Novas funcionalidades
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  status: 'draft' | 'completed' | 'published';
  
  // Timestamps aprimorados
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
  lastEditedAt?: any; // Firebase Timestamp
  
  // Métricas
  version: number;
  wordCount: number;
  viewCount: number;
  editCount: number;
  
  // Compartilhamento
  isShared: boolean;
  shareLink?: string;
  shareExpiresAt?: any; // Firebase Timestamp
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  category: 'platform' | 'tone' | 'audience' | 'status' | 'custom';
  usageCount: number;
  createdAt: any; // Firebase Timestamp
  isSystemTag: boolean;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  parentId?: string; // Para hierarquia
  color: string;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
  projectCount: number;
  isDefault: boolean;
}

export interface ProjectFilters {
  search?: string;
  tags?: string[];
  folders?: string[];
  platforms?: string[];
  status?: Array<'draft' | 'completed' | 'published'>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  duration?: {
    min: number;
    max: number;
  };
  isFavorite?: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'duration' | 'wordCount';
  sortOrder: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface UserStats {
  totalProjects: number;
  recentProjects: number;
  totalWords: number;
  totalDuration: number;
  platformStats: Record<string, number>;
  tagStats: Record<string, number>;
  folderStats: Record<string, number>;
  timelineData: Array<{
    date: string;
    projects: number;
    words: number;
  }>;
}

// === TIPOS PARA EDITOR AVANÇADO ===

export interface TextSelection {
  id: string;
  scriptId: string;
  userId: string;
  startPosition: number;
  endPosition: number;
  selectedText: string;
  surroundingContext: string;
  paragraphContext: string;
  isActive: boolean;
  hasActiveImprovement: boolean;
  createdAt: any; // Firebase Timestamp
  lastModifiedAt: any; // Firebase Timestamp
}

export interface AISuggestion {
  id: string;
  text: string;
  reasoning: string;
  confidence: number;
  improvementType: ImprovementType;
  tags: string[];
}

export interface AIImprovement {
  id: string;
  scriptId: string;
  userId: string;
  originalText: string;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
  userFeedback: string;
  suggestions: AISuggestion[];
  improvementType: ImprovementType;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  selectedSuggestionId?: string;
  modelUsed: string;
  processingTime: number;
  tokens: {
    input: number;
    output: number;
  };
  createdAt: any; // Firebase Timestamp
  resolvedAt?: any; // Firebase Timestamp
}

export type ImprovementType = 
  | 'clarity'        // Tornar mais claro
  | 'engagement'     // Mais envolvente
  | 'brevity'        // Mais conciso
  | 'call_to_action' // Adicionar CTA
  | 'tone'           // Ajustar tom
  | 'grammar'        // Correção gramatical
  | 'style'          // Estilo de escrita
  | 'custom';        // Melhoria customizada

export interface ScriptVersion {
  id: string;
  scriptId: string;
  userId: string;
  version: number;
  content: string;
  title: string;
  description?: string;
  isAutoSave: boolean;
  isMajorVersion: boolean;
  changes: Array<{
    type: 'text_change' | 'ai_improvement' | 'manual_edit';
    startPosition: number;
    endPosition: number;
    originalText: string;
    newText: string;
    reasoning?: string;
    aiSuggestionId?: string;
  }>;
  createdAt: any; // Firebase Timestamp
  wordCount: number;
  characterCount: number;
  readabilityScore?: number;
  parentVersionId?: string;
  diffSummary?: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

// **TIPOS PARA EDITOR AVANÇADO - FASE 2**

export interface TextSelection {
  id: string;
  startIndex: number;
  endIndex: number;
  selectedText: string;
  context: string; // Texto ao redor para contexto
  timestamp: Timestamp;
  userId: string;
}

export interface AIRefinementRequest {
  id: string;
  projectId: string;
  userId: string;
  originalText: string;
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
  refinementType: 'improve' | 'rewrite' | 'tone' | 'grammar' | 'style' | 'clarity' | 'engagement';
  userInstructions: string;
  context: {
    platform: string;
    audience: string;
    tone: string;
    duration: number;
  };
  timestamp: Timestamp;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AISuggestion {
  id: string;
  requestId: string;
  originalText: string;
  suggestedText: string;
  explanation: string;
  confidence: number; // 0-1
  improvements: {
    clarity: number;
    engagement: number;
    grammar: number;
    tone: number;
    relevance: number;
  };
  reasoning: string;
  alternatives: string[]; // Outras opções
  timestamp: Timestamp;
  geminiModel: string;
  tokensUsed: number;
}

export interface ScriptVersion {
  id: string;
  projectId: string;
  userId: string;
  versionNumber: number;
  content: string;
  changes: VersionChange[];
  metadata: {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    sentiment: number; // -1 to 1
    keywordDensity: Record<string, number>;
  };
  aiSuggestions: string[]; // IDs das sugestões aplicadas
  comment: string;
  isAutoSave: boolean;
  timestamp: Timestamp;
  stats: {
    improvementsApplied: number;
    aiSuggestionsUsed: number;
    manualEdits: number;
  };
}

export interface VersionChange {
  id: string;
  type: 'addition' | 'deletion' | 'modification' | 'ai_suggestion';
  startIndex: number;
  endIndex: number;
  oldText: string;
  newText: string;
  reasoning?: string;
  aiSuggestionId?: string;
  timestamp: Timestamp;
}

export interface AIImprovement {
  id: string;
  projectId: string;
  versionId: string;
  type: 'grammar' | 'style' | 'clarity' | 'engagement' | 'tone' | 'structure';
  originalSegment: string;
  improvedSegment: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  explanation: string;
  accepted: boolean;
  timestamp: Timestamp;
  metrics: {
    readabilityImprovement: number;
    engagementScore: number;
    clarityScore: number;
  };
}

export interface EditorSession {
  id: string;
  projectId: string;
  userId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;
  actions: EditorAction[];
  aiInteractions: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  manualEdits: number;
  wordsAdded: number;
  wordsRemoved: number;
  finalWordCount: number;
}

export interface EditorAction {
  id: string;
  type: 'selection' | 'ai_request' | 'suggestion_accepted' | 'suggestion_rejected' | 'manual_edit' | 'version_save';
  timestamp: Timestamp;
  data: any;
  duration?: number;
}

export interface ComparisonData {
  id: string;
  projectId: string;
  version1: ScriptVersion;
  version2: ScriptVersion;
  diff: DiffResult[];
  metrics: {
    totalChanges: number;
    addedWords: number;
    removedWords: number;
    modifiedWords: number;
    improvementScore: number;
  };
  timestamp: Timestamp;
}

export interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  content: string;
  startIndex: number;
  endIndex: number;
  confidence?: number;
  aiGenerated?: boolean;
}

// Configurações do Editor
export interface EditorConfig {
  userId: string;
  preferences: {
    autoSave: boolean;
    autoSaveInterval: number; // segundos
    aiSuggestionsEnabled: boolean;
    showVersionHistory: boolean;
    highlightChanges: boolean;
    comparisonMode: 'side-by-side' | 'inline' | 'overlay';
    aiProvider: 'gemini' | 'openai' | 'claude';
    sugestionTypes: AIRefinementRequest['refinementType'][];
  };
  shortcuts: Record<string, string>;
  theme: {
    fontSize: number;
    lineHeight: number;
    wordWrap: boolean;
    showLineNumbers: boolean;
    highlightCurrentLine: boolean;
  };
}

// Analytics do Editor
export interface EditorAnalytics {
  userId: string;
  totalSessions: number;
  totalEditingTime: number; // segundos
  averageSessionDuration: number;
  aiInteractions: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  acceptanceRate: number;
  favoriteImprovementTypes: Record<string, number>;
  productivityMetrics: {
    wordsPerMinute: number;
    editsPerSession: number;
    aiAssistanceRatio: number;
  };
  qualityMetrics: {
    averageImprovementScore: number;
    clarityImprovement: number;
    engagementImprovement: number;
  };
  timeStats: {
    peakProductivityHours: number[];
    mostActiveDay: string;
    longestSession: number;
  };
}

// Estados da UI do Editor
export interface EditorUIState {
  currentSelection: TextSelection | null;
  activeModal: 'refinement' | 'comparison' | 'history' | null;
  showSuggestions: boolean;
  showVersionHistory: boolean;
  comparisonMode: boolean;
  highlightedChanges: string[];
  pendingAIRequests: string[];
  isProcessing: boolean;
  lastSaved: Timestamp | null;
  hasUnsavedChanges: boolean;
}

// Notificações do Editor
export interface EditorNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    callback: () => void;
  };
  duration: number;
  timestamp: Timestamp;
}

// Callbacks e Eventos
export interface EditorCallbacks {
  onTextSelect: (selection: TextSelection) => void;
  onAIRequest: (request: AIRefinementRequest) => void;
  onSuggestionAccept: (suggestion: AISuggestion) => void;
  onSuggestionReject: (suggestion: AISuggestion) => void;
  onVersionSave: (version: ScriptVersion) => void;
  onVersionRestore: (version: ScriptVersion) => void;
  onCompare: (version1: string, version2: string) => void;
  onExport: (format: 'pdf' | 'docx' | 'txt' | 'md') => void;
}

// **TIPOS PARA INTEGRAÇÃO COM GEMINI - FASE 2**

export interface GeminiConfig {
  apiKey: string;
  model: 'gemini-pro' | 'gemini-pro-vision';
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  safetySettings: GeminiSafetySettings[];
}

export interface GeminiSafetySettings {
  category: string;
  threshold: string;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: GeminiSafetySettings[];
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
  safetyRatings: GeminiSafetyRating[];
  citationMetadata?: any;
}

export interface GeminiSafetyRating {
  category: string;
  probability: string;
  blocked?: boolean;
}

// **UTILITÁRIOS E HELPERS - FASE 2**

export interface SelectionRange {
  start: number;
  end: number;
  text: string;
}

export interface EditorTheme {
  background: string;
  foreground: string;
  selection: string;
  lineNumber: string;
  cursor: string;
  highlight: string;
  suggestion: string;
  comparison: {
    added: string;
    removed: string;
    modified: string;
  };
}

export interface KeyboardShortcut {
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
}

// **VALIDAÇÃO E CONSTRAINTS**

export interface ValidationRule {
  type: 'length' | 'words' | 'sentences' | 'pattern' | 'custom';
  constraint: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ContentConstraints {
  minWords: number;
  maxWords: number;
  minCharacters: number;
  maxCharacters: number;
  requiredKeywords: string[];
  forbiddenWords: string[];
  toneConstraints: string[];
  platformSpecific: Record<string, any>;
}