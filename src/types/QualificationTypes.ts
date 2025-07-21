/**
 * 🎯 QUALIFICATION TYPES - V8.0 UNIFIED INTERFACE
 * Interface unificada para análise de qualificação
 * Metodologia V8.0 Unified Development
 */

// ============================================================================
// SOCIAL MEDIA TYPES
// ============================================================================

export interface SocialProfiles {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
}

export interface SocialMediaValidationStatus {
  isValid: boolean;
  isChecking: boolean;
  message?: string;
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface AnalysisInsight {
  type: 'opportunity' | 'strength' | 'improvement' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority?: number;
  actionable?: boolean;
  estimatedTimeToImplement?: string;
}

export interface ProfileAnalysis {
  niche: string;
  tone: string;
  audience: string;
  topics: string[];
  postFrequency: string;
  bestPerformingContent: string;
  contentCategories?: string[];
  brandVoice?: string;
  targetDemographics?: {
    ageRange: string;
    interests: string[];
    profession?: string;
  };
}

export interface AnalysisStatistics {
  postsAnalyzed: number;
  engagementAverage: string;
  topHashtags: string[];
  peakTimes: string[];
  avgCommentsPerPost?: number;
  avgLikesPerPost?: number;
  avgSharesPerPost?: number;
  followerGrowthRate?: string;
  contentMix?: {
    images: number;
    videos: number;
    carousels: number;
    stories: number;
  };
}

export interface AnalysisMetadata {
  analysisVersion: string;
  processingTime: number;
  dataSource: string[];
  analysisDate: string;
  modelUsed?: string;
  confidenceBreakdown?: {
    profileAccuracy: number;
    contentAnalysis: number;
    audienceInsights: number;
    recommendations: number;
  };
}

// ============================================================================
// UNIFIED ANALYSIS RESULT INTERFACE
// ============================================================================

export interface UnifiedAnalysisResult {
  // Core Analysis Data
  confidence: number;
  insights: AnalysisInsight[];
  profile: ProfileAnalysis;
  stats: AnalysisStatistics;
  
  // Metadata and Extensions
  metadata?: AnalysisMetadata;
  
  // Future Extensions
  competitorAnalysis?: {
    similarProfiles: string[];
    marketPosition: 'leader' | 'follower' | 'niche' | 'emerging';
    differentiators: string[];
  };
  
  contentRecommendations?: {
    suggestedTopics: string[];
    optimalPostTimes: string[];
    contentFormats: string[];
    hashtagStrategy: string[];
  };
  
  growthOpportunities?: {
    shortTerm: AnalysisInsight[];
    mediumTerm: AnalysisInsight[];
    longTerm: AnalysisInsight[];
  };
}

// ============================================================================
// FLOW CONTROL TYPES
// ============================================================================

export type QualificationFlowStep = 'input' | 'analysis' | 'insights' | 'completed';

export interface QualificationFlowState {
  currentStep: QualificationFlowStep;
  socialProfiles: SocialProfiles;
  analysisResult: UnifiedAnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  flowEvents: string[];
}

export interface QualificationCompletionData {
  profiles: SocialProfiles;
  analysis: UnifiedAnalysisResult;
  userDecision: 'proceed' | 'refine' | 'skip';
  completedAt: string;
  flowDuration?: number;
  userSatisfactionScore?: number;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface SocialMediaInputProps {
  onAnalyze?: (profiles: SocialProfiles) => void;
  onSkip?: () => void;
  loading?: boolean;
  validationErrors?: Record<string, string>;
  initialProfiles?: SocialProfiles;
}

export interface AIAnalysisLoadingProps {
  profiles?: string[];
  isAnalyzing?: boolean;
  error?: string | null;
  onComplete?: (result: UnifiedAnalysisResult) => void;
  onRetry?: () => void;
  estimatedTime?: number;
}

export interface AIInsightsDisplayProps {
  analysis: UnifiedAnalysisResult;
  onProceed?: () => void;
  onRefineAnalysis?: () => void;
  loading?: boolean;
}

export interface CompleteFlowProps {
  onComplete?: (data: QualificationCompletionData) => void;
  className?: string;
  initialStep?: QualificationFlowStep;
  skipSocialValidation?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AnalysisConfidenceLevel = 'low' | 'medium' | 'high' | 'very-high';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PerformanceMetrics {
  stepTimes: Record<string, number>;
  totalTime: number;
  apiCalls: number;
  memoryUsage?: number;
  userInteractions?: number;
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

export const isValidAnalysisResult = (result: any): result is UnifiedAnalysisResult => {
  return (
    result &&
    typeof result.confidence === 'number' &&
    Array.isArray(result.insights) &&
    result.profile &&
    result.stats &&
    typeof result.profile.niche === 'string' &&
    typeof result.stats.postsAnalyzed === 'number'
  );
};

export const getConfidenceLevel = (confidence: number): AnalysisConfidenceLevel => {
  if (confidence >= 90) return 'very-high';
  if (confidence >= 75) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
};

export const createEmptyAnalysisResult = (): UnifiedAnalysisResult => ({
  confidence: 0,
  insights: [],
  profile: {
    niche: 'Análise pendente',
    tone: 'A ser determinado',
    audience: 'A ser determinado',
    topics: [],
    postFrequency: 'A ser determinado',
    bestPerformingContent: 'A ser determinado'
  },
  stats: {
    postsAnalyzed: 0,
    engagementAverage: '0%',
    topHashtags: [],
    peakTimes: []
  }
});

// ============================================================================
// CONSTANTS
// ============================================================================

export const SUPPORTED_SOCIAL_PLATFORMS = [
  'instagram',
  'linkedin', 
  'twitter',
  'tiktok',
  'youtube',
  'facebook'
] as const;

export const ANALYSIS_INSIGHT_TYPES = [
  'opportunity',
  'strength', 
  'improvement',
  'warning'
] as const;

export const IMPACT_LEVELS = [
  'high',
  'medium',
  'low'
] as const;

export const QUALIFICATION_FLOW_STEPS = [
  'input',
  'analysis', 
  'insights',
  'completed'
] as const; 