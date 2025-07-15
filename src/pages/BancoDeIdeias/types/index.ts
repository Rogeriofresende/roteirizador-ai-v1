/**
 * 🧠 BANCO DE IDEIAS - TYPES V8.0
 * Type definitions extracted from monolithic BancoDeIdeias.tsx
 * Following V8.0 Unified Development methodology
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface IdeaFormData {
  category: IdeaCategory;
  style: ContentStyle;
  targetAudience: TargetAudience;
  contentType: ContentType;
  keywords: string[];
  keywordsInput: string;
  difficulty: DifficultyLevel;
}

export interface IdeaResponse {
  id: string;
  title: string;
  description: string;
  implementation: string;
  category: string;
  targetAudience: string;
  contentType: string;
  keywords: string[];
  difficulty: string;
  savedAt: string;
  createdAt: string;
  metadata: IdeaMetadata;
}

export interface IdeaMetadata {
  imported?: boolean;
  importedAt?: string;
  source?: 'generated' | 'manual' | 'imported';
  cost?: number;
  tokensUsed?: number;
  processingTime?: number;
}

// ============================================================================
// ENUM TYPES
// ============================================================================

export type IdeaCategory = 
  | 'Marketing & Growth'
  | 'Tecnologia'
  | 'Educação'
  | 'Entretenimento'
  | 'Negócios'
  | 'Lifestyle';

export type ContentStyle = 
  | 'Startups'
  | 'Profissional'
  | 'Casual'
  | 'Educativo'
  | 'Humorístico'
  | 'Inspirador';

export type TargetAudience = 
  | 'Startups'
  | 'Jovens'
  | 'Profissionais'
  | 'Empreendedores'
  | 'Estudantes'
  | 'Pais';

export type ContentType = 
  | 'Videos'
  | 'Posts'
  | 'Stories'
  | 'Podcasts'
  | 'Articles'
  | 'Campaigns';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type TabType = 'generator' | 'history' | 'templates' | 'export' | 'performance' | 'analytics' | 'personalization' | 'ai';

export type AlertType = 'success' | 'error' | 'warning';

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type FormChangeHandler = <K extends keyof IdeaFormData>(
  field: K,
  value: IdeaFormData[K]
) => void;

export type IdeaFeedbackHandler = (
  ideaId: string,
  interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement',
  rating?: number,
  feedback?: string
) => Promise<void>;

export type TemplateApplyHandler = (template: IdeaTemplate) => void;

export type ExportHandler = (ideas: IdeaResponse[]) => Promise<void>;

export type ImportHandler = (ideas: IdeaResponse[]) => Promise<void>;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface IdeaGeneratorProps {
  formData: IdeaFormData;
  onFormChange: FormChangeHandler;
  onGenerateIdea: () => void;
  isGenerating: boolean;
  currentIdea: IdeaResponse | null;
  onIdeaFeedback: IdeaFeedbackHandler;
}

export interface IdeaHistoryProps {
  onQuickAdd: () => void;
  ideas: IdeaResponse[];
  loading: boolean;
  onIdeaSelect?: (idea: IdeaResponse) => void;
}

export interface IdeaTemplatesProps {
  onApplyTemplate: TemplateApplyHandler;
  currentFormData: IdeaFormData;
}

export interface IdeaExportProps {
  ideas: IdeaResponse[];
  onImport: ImportHandler;
  onExport: ExportHandler;
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface BancoDeIdeiasState {
  activeTab: TabType;
  formData: IdeaFormData;
  currentIdea: IdeaResponse | null;
  isGenerating: boolean;
  showModals: {
    upgrade: boolean;
    personalization: boolean;
    implementation: boolean;
    quickAdd: boolean;
    share: boolean;
    collaboration: boolean;
  };
  alerts: Array<{
    type: AlertType;
    message: string;
  }>;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface IdeaTemplate {
  id: string;
  name: string;
  description: string;
  formData: Partial<IdeaFormData>;
  category: string;
  previewImage?: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface IdeaFilters {
  category?: string;
  difficulty?: DifficultyLevel;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchTerm?: string;
}

export interface IdeaPagination {
  page: number;
  limit: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
} 