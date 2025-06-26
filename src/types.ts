export interface FormData {
  platform: string;
  format: string;
  videoGoal: string;
  targetAudience: string;
  toneOfVoice: string;
  videoTopic: string;
  duration: string;
  details: string;
  otherGoal: string;
  customAudience: string;
  customTone: string;
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

// **TIPOS PARA FASE 3 - FUNCIONALIDADES AVANÇADAS**

// **EDITOR VISUAL WYSIWYG**
export interface VisualElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'transition' | 'effect';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    border?: string;
    borderRadius?: number;
    opacity?: number;
    animation?: string;
  };
  timing: {
    startTime: number; // segundos
    endTime: number;   // segundos
    duration: number;  // segundos
  };
  metadata: {
    layer: number;
    locked: boolean;
    visible: boolean;
    tags: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VisualScript {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  elements: VisualElement[];
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    duration: number; // segundos totais
  };
  settings: {
    fps: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    format: '16:9' | '9:16' | '1:1' | '4:3';
    resolution: '720p' | '1080p' | '4k';
  };
  version: number;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// **SÍNTESE DE VOZ**
export interface VoiceSynthesis {
  id: string;
  projectId: string;
  userId: string;
  text: string;
  voice: {
    name: string;
    lang: string;
    gender: 'male' | 'female' | 'neutral';
    accent: string;
  };
  settings: {
    rate: number;    // 0.1 - 10
    pitch: number;   // 0 - 2  
    volume: number;  // 0 - 1
    emphasis: 'strong' | 'moderate' | 'none';
    pause: {
      sentence: number; // milissegundos
      paragraph: number;
    };
  };
  audioUrl?: string;
  duration?: number; // segundos
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Timestamp;
  processedAt?: Timestamp;
}

export interface VoiceProfile {
  id: string;
  name: string;
  displayName: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  description: string;
  sampleUrl?: string;
  isAvailable: boolean;
  isPremium: boolean;
  provider: 'browser' | 'elevenlabs' | 'azure' | 'aws';
}

// **COLABORAÇÃO EM TEMPO REAL**
export interface CollaborationSession {
  id: string;
  projectId: string;
  hostUserId: string;
  participants: CollaborationParticipant[];
  status: 'active' | 'paused' | 'ended';
  settings: {
    allowEdit: boolean;
    allowComment: boolean;
    allowVoiceChat: boolean;
    maxParticipants: number;
  };
  startedAt: Timestamp;
  endedAt?: Timestamp;
  duration?: number; // segundos
}

export interface CollaborationParticipant {
  userId: string;
  displayName: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  status: 'online' | 'away' | 'offline';
  cursor?: {
    x: number;
    y: number;
    selection?: {
      start: number;
      end: number;
    };
  };
  joinedAt: Timestamp;
  lastActive: Timestamp;
}

export interface RealtimeEdit {
  id: string;
  sessionId: string;
  userId: string;
  operation: 'insert' | 'delete' | 'replace' | 'format';
  position: number;
  content: string;
  timestamp: Timestamp;
  applied: boolean;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  position: {
    start: number;
    end: number;
    selectedText: string;
  };
  thread: CommentReply[];
  status: 'open' | 'resolved' | 'deleted';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
}

export interface CommentReply {
  id: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// **ANALYTICS AVANÇADO**
export interface AdvancedAnalytics {
  userId: string;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  productivity: {
    totalProjectsCreated: number;
    totalWordsWritten: number;
    totalEditingSessions: number;
    averageSessionDuration: number;
    peakProductivityHours: number[];
    productivityTrend: number; // % change from previous period
    efficiency: {
      wordsPerMinute: number;
      editsPerMinute: number;
      aiAssistanceRatio: number;
    };
  };
  collaboration: {
    sessionsHosted: number;
    sessionsParticipated: number;
    commentsGiven: number;
    commentsReceived: number;
    sharesSent: number;
    sharesReceived: number;
  };
  aiUsage: {
    totalRequests: number;
    successfulSuggestions: number;
    acceptanceRate: number;
    favoriteTypes: Record<string, number>;
    tokensConsumed: number;
    costEstimate: number;
    qualityImprovement: number;
  };
  contentQuality: {
    averageReadabilityScore: number;
    averageEngagementScore: number;
    averageSentiment: number;
    topKeywords: Record<string, number>;
    improvementTrend: number;
  };
  platformPerformance: {
    [platform: string]: {
      scriptsCreated: number;
      averageViews: number;
      averageEngagement: number;
      successRate: number;
    };
  };
}

export interface ProductivityInsight {
  id: string;
  userId: string;
  type: 'tip' | 'achievement' | 'goal' | 'warning';
  title: string;
  description: string;
  data: any;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Timestamp;
}

// **INTEGRAÇÕES COM PLATAFORMAS**
export interface PlatformIntegration {
  id: string;
  userId: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook';
  credentials: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Timestamp;
    scope: string[];
  };
  profile: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    followers: number;
    verified: boolean;
  };
  settings: {
    autoPublish: boolean;
    defaultPrivacy: 'public' | 'private' | 'unlisted';
    defaultTags: string[];
    defaultDescription: string;
  };
  isActive: boolean;
  lastSync: Timestamp;
  createdAt: Timestamp;
}

export interface ContentPublication {
  id: string;
  projectId: string;
  userId: string;
  platform: string;
  platformPostId?: string;
  title: string;
  description: string;
  tags: string[];
  privacy: 'public' | 'private' | 'unlisted';
  scheduledFor?: Timestamp;
  publishedAt?: Timestamp;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'deleted';
  analytics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    clickThroughRate: number;
    engagementRate: number;
    lastUpdated: Timestamp;
  };
  errorMessage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// **SISTEMA DE TEMPLATES**
export interface ScriptTemplate {
  id: string;
  title: string;
  description: string;
  category: 'educational' | 'entertainment' | 'marketing' | 'news' | 'tutorial' | 'review' | 'story';
  platform: string[];
  duration: {
    min: number; // segundos
    max: number; // segundos
  };
  structure: TemplateSection[];
  placeholders: TemplatePlaceholder[];
  examples: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  usage: number;
  rating: number;
  author: {
    id: string;
    name: string;
    verified: boolean;
  };
  isPremium: boolean;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number; // segundos
  isRequired: boolean;
  suggestions: string[];
}

export interface TemplatePlaceholder {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'image' | 'video';
  defaultValue?: any;
  options?: string[];
  validation?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// **PWA AVANÇADO**
export interface OfflineData {
  id: string;
  type: 'project' | 'template' | 'analytics' | 'settings';
  data: any;
  lastModified: Timestamp;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  syncAttempts: number;
  maxSize: number; // bytes
}

export interface SyncOperation {
  id: string;
  userId: string;
  type: 'upload' | 'download' | 'conflict_resolution';
  dataType: 'project' | 'template' | 'analytics' | 'settings';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: Timestamp;
  completedAt?: Timestamp;
  errorMessage?: string;
  retryCount: number;
}

export interface NotificationPermission {
  userId: string;
  permissions: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  preferences: {
    collaborationUpdates: boolean;
    aiSuggestions: boolean;
    publicationStatus: boolean;
    analyticsReports: boolean;
    systemUpdates: boolean;
  };
  devices: {
    id: string;
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    lastActive: Timestamp;
    pushSubscription?: any;
  }[];
}

// **SISTEMA DE GAMIFICAÇÃO**
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'productivity' | 'quality' | 'collaboration' | 'consistency' | 'innovation';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirements: {
    type: string;
    target: number;
    period?: 'day' | 'week' | 'month' | 'year' | 'all_time';
  };
  isHidden: boolean;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Timestamp;
  progress: number; // 0-100
  isNotified: boolean;
}

export interface UserLevel {
  userId: string;
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  perks: string[];
  unlockedFeatures: string[];
}

// **EXPORT/IMPORT AVANÇADO**
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'json' | 'xml' | 'srt' | 'vtt';
  includeMetadata: boolean;
  includeComments: boolean;
  includeVersionHistory: boolean;
  includeAnalytics: boolean;
  templateId?: string;
  customization: {
    font: string;
    fontSize: number;
    lineSpacing: number;
    pageMargins: number;
    includeHeader: boolean;
    includeFooter: boolean;
    watermark?: string;
  };
}

export interface ImportOptions {
  format: 'txt' | 'docx' | 'pdf' | 'md' | 'html' | 'json' | 'xml' | 'srt' | 'vtt';
  preserveFormatting: boolean;
  autoDetectStructure: boolean;
  createTemplate: boolean;
  templateCategory?: string;
  aiEnhancement: boolean;
  targetPlatform?: string;
}

// **INTELIGÊNCIA ARTIFICIAL AVANÇADA**
export interface AIWorkflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  steps: AIWorkflowStep[];
  triggers: {
    type: 'manual' | 'automatic' | 'scheduled';
    condition?: string;
    schedule?: string; // cron expression
  };
  isActive: boolean;
  executionCount: number;
  successRate: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AIWorkflowStep {
  id: string;
  type: 'analyze' | 'generate' | 'refine' | 'translate' | 'summarize' | 'enhance' | 'validate';
  config: any;
  order: number;
  isOptional: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  personality: {
    tone: string;
    style: string;
    vocabulary: 'simple' | 'moderate' | 'advanced';
    formality: 'casual' | 'semi-formal' | 'formal';
  };
  expertise: string[];
  platforms: string[];
  examples: string[];
  isPublic: boolean;
  usage: number;
  rating: number;
  createdBy: string;
  createdAt: Timestamp;
}

// **CONFIGURAÇÕES AVANÇADAS DA APLICAÇÃO**
export interface AppConfiguration {
  version: string;
  features: {
    visualEditor: boolean;
    voiceSynthesis: boolean;
    collaboration: boolean;
    platformIntegrations: boolean;
    advancedAnalytics: boolean;
    templates: boolean;
    aiWorkflows: boolean;
    gamification: boolean;
  };
  limits: {
    maxProjectsPerUser: number;
    maxCollaboratorsPerProject: number;
    maxVoiceSynthesisPerDay: number;
    maxAIRequestsPerDay: number;
    maxStoragePerUser: number; // bytes
  };
  billing: {
    plans: Plan[];
    currentPlan: string;
    usage: PlanUsage;
  };
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: Record<string, number>;
  isPopular: boolean;
  isEnterprise: boolean;
}

export interface PlanUsage {
  projects: number;
  aiRequests: number;
  voiceSynthesis: number;
  storage: number;
  collaborators: number;
  exports: number;
  resetDate: Timestamp;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectFieldOptions = string[] | SelectOption[];