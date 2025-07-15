/**
 * 🧠 BANCO DE IDEIAS - CONSTANTS V8.0
 * Constants extracted from monolithic BancoDeIdeias.tsx
 * Following V8.0 Unified Development methodology
 */

import { IdeaCategory, ContentStyle, TargetAudience, ContentType, TabType } from '../types';

// ============================================================================
// FORM OPTIONS
// ============================================================================

export const CATEGORY_OPTIONS: { value: IdeaCategory; label: string }[] = [
  { value: 'Marketing & Growth', label: 'Marketing & Growth' },
  { value: 'Tecnologia', label: 'Tecnologia' },
  { value: 'Educação', label: 'Educação' },
  { value: 'Entretenimento', label: 'Entretenimento' },
  { value: 'Negócios', label: 'Negócios' },
  { value: 'Lifestyle', label: 'Lifestyle' }
];

export const STYLE_OPTIONS: { value: ContentStyle; label: string }[] = [
  { value: 'Startups', label: 'Startups' },
  { value: 'Profissional', label: 'Profissional' },
  { value: 'Casual', label: 'Casual' },
  { value: 'Educativo', label: 'Educativo' },
  { value: 'Humorístico', label: 'Humorístico' },
  { value: 'Inspirador', label: 'Inspirador' }
];

export const TARGET_AUDIENCE_OPTIONS: { value: TargetAudience; label: string }[] = [
  { value: 'Startups', label: 'Startups' },
  { value: 'Jovens', label: 'Jovens' },
  { value: 'Profissionais', label: 'Profissionais' },
  { value: 'Empreendedores', label: 'Empreendedores' },
  { value: 'Estudantes', label: 'Estudantes' },
  { value: 'Pais', label: 'Pais' }
];

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'Videos', label: 'Videos' },
  { value: 'Posts', label: 'Posts' },
  { value: 'Stories', label: 'Stories' },
  { value: 'Podcasts', label: 'Podcasts' },
  { value: 'Articles', label: 'Articles' },
  { value: 'Campaigns', label: 'Campaigns' }
];

// ============================================================================
// NAVIGATION TABS
// ============================================================================

export interface NavigationTab {
  id: TabType;
  label: string;
  icon: string; // Icon name from Lucide React
}

export const NAVIGATION_TABS: NavigationTab[] = [
  { id: 'generator', label: 'Gerador', icon: 'Sparkles' },
  { id: 'history', label: 'Histórico', icon: 'BarChart3' },
  { id: 'templates', label: 'Templates', icon: 'FileText' },
  { id: 'export', label: 'Exportar', icon: 'Download' },
  { id: 'performance', label: 'Performance', icon: 'Activity' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'personalization', label: 'Personalização', icon: 'User' },
];

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_FORM_DATA = {
  category: 'Marketing & Growth' as IdeaCategory,
  style: 'Startups' as ContentStyle,
  targetAudience: 'Startups' as TargetAudience,
  contentType: 'Videos' as ContentType,
  keywords: [] as string[],
  keywordsInput: '',
  difficulty: 'intermediate' as const
};

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  hasNext: false,
  hasPrev: false
};

// ============================================================================
// PERFORMANCE BUDGETS
// ============================================================================

export const PERFORMANCE_BUDGETS = {
  maxComponentSize: '30KB',
  maxComponentLines: 200,
  maxChunkSize: '250KB',
  maxTotalSize: '1MB',
  maxRenderTime: 100, // ms
  maxInteractionTime: 50, // ms
  maxBuildTime: 2000, // ms
  maxBundleConflicts: 0
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const LOADING_MESSAGES = [
  'Gerando ideia criativa...',
  'Analisando tendências...',
  'Processando preferências...',
  'Criando conteúdo personalizado...'
];

export const SUCCESS_MESSAGES = {
  IDEA_GENERATED: 'Ideia gerada com sucesso!',
  IDEA_SAVED: 'Ideia salva com sucesso no seu banco de ideias!',
  TEMPLATE_APPLIED: 'Template aplicado com sucesso!',
  IDEAS_EXPORTED: 'Ideias exportadas com sucesso!',
  IDEAS_IMPORTED: 'Ideias importadas com sucesso!'
};

export const ERROR_MESSAGES = {
  IDEA_GENERATION_FAILED: 'Erro ao gerar ideia. Tente novamente.',
  IDEA_SAVE_FAILED: 'Erro ao salvar ideia. Tente novamente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SYSTEM_ERROR: 'Erro do sistema. Tente novamente em alguns minutos.'
};

// ============================================================================
// DEBOUNCE TIMEOUTS
// ============================================================================

export const DEBOUNCE_TIMEOUTS = {
  SEARCH: 300, // ms
  FORM_VALIDATION: 500, // ms
  AUTO_SAVE: 1000, // ms
};

// ============================================================================
// CACHE SETTINGS
// ============================================================================

export const CACHE_SETTINGS = {
  IDEAS_TTL: 10 * 60 * 1000, // 10 minutes
  TEMPLATES_TTL: 60 * 60 * 1000, // 1 hour
  USER_PREFERENCES_TTL: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CACHE_SIZE: 50 // entries
}; 