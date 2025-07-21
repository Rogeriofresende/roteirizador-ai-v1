/**
 * ⚠️ LEGACY MONOLITHIC FILE - DEPRECATED IN V8.0 REFACTORING
 * 
 * 🧠 BANCO DE IDEIAS - V7.5 Enhanced Professional Interface (LEGACY)
 * Sistema completo de geração de ideias seguindo metodologia V7.5 Enhanced
 * 
 * MIGRATION STATUS: ✅ REFACTORED TO V8.0 MODULAR ARCHITECTURE
 * NEW LOCATION: src/pages/BancoDeIdeias/index.tsx
 * 
 * ORIGINAL SIZE: 1578 lines (⚠️ TOO LARGE)
 * NEW STRUCTURE: 10 modular files (~260 lines average)
 * 
 * Features: Idea Generation + Personalization + Budget Management + Analytics
 */

import React, { useState, useCallback, useEffect, useId } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIdeaGeneration } from '../hooks/useIdeaGeneration';
import { usePersonalization } from '../hooks/usePersonalization';
import { useBudgetManagement } from '../hooks/useBudgetManagement';
import useIdeaCache from '../hooks/useIdeaCache';
import { useUsage } from '../hooks/useUsage';
import usePerformanceMonitoring from '../hooks/usePerformanceMonitoring';
import CollaborationPanel from '../components/collaboration/CollaborationPanel';
import ShareModal from '../components/sharing/ShareModal';
import { useSharing } from '../hooks/useSharing';
import AISuggestionsPanel from '../components/ai/AISuggestionsPanel';
import SmartCategorizationWidget from '../components/ai/SmartCategorizationWidget';
import PersonalizedRecommendations from '../components/ai/PersonalizedRecommendations';

// V7.5 Enhanced Design System Imports
import { Layout } from '../design-system/components/Layout';
import { Button } from '../design-system/components/Button';
import { Card } from '../design-system/components/Card';
import { Input } from '../design-system/components/Input';
import { Select } from '../design-system/components/form/Select';
import { Modal } from '../design-system/components/Modal';

// V7.5 Enhanced Icons
import { 
  Lightbulb, 
  Sparkles, 
  Target,
  BarChart3,
  Settings,
  User,
  Zap,
  TrendingUp,
  Heart,
  Save,
  Share2,
  Rocket,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Clock,
  Users,
  Tag,
  Star,
  ArrowRight,
  Plus,
  FileText,
  Download,
  Activity
} from 'lucide-react';

// Legacy Components (maintained for compatibility)
import { FeatureHighlight } from '../design-system/components/migration/FeatureHighlight';
import { ProgressiveDisclosure } from '../design-system/components/migration/ProgressiveDisclosure';
import { CheckboxSimple as Checkbox } from '../design-system/components/form/CheckboxSimple';

// Loading States
import { LoadingState, IdeasListSkeleton } from '../components/LoadingStates';
// Export/Import System
import { ExportImportSystem } from '../components/ExportImportSystem';
// Template System
import { TemplateSystem } from '../components/TemplateSystem';

// Components
import { IdeaGenerationForm } from '../components/IdeaGenerationForm';
import { GeneratedIdeaCard } from '../components/GeneratedIdeaCard';
// import { IdeaHistoryTab } from '../components/IdeaHistoryTab'; // Comentado para resolver conflito de nome
// import { QuickAddModal } from '../components/QuickAddModal'; // Removido - usando definição local
import { PersonalizationPanel } from '../components/PersonalizationPanel';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { UpgradeModal } from '../components/UpgradeModal';
import { ImplementationModal } from '../components/ImplementationModal';
import { PerformanceDashboard } from '../components/PerformanceDashboard';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface IdeaFormData {
  category: string;
  style: string;
  targetAudience: string;
  contentType: string;
  keywords: string[];
  keywordsInput: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface IdeaResponse {
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
  metadata: {
    imported?: boolean;
    importedAt?: string;
  };
}

// ============================================================================
// P0.2 - IDEAS HISTORY TAB COMPONENT - TEMPORARILY COMMENTED FOR DEBUGGING
// ============================================================================

/* TEMPORARILY COMMENTED - DEBUGGING DUPLICATE DECLARATION ERROR
const IdeaHistoryTabInternal: React.FC<{ onQuickAdd: () => void }> = ({ onQuickAdd }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || '';
  const { getIdeasHistory, loading, error } = useIdeaGeneration();
  const [historyIdeas, setHistoryIdeas] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
*/

// Temporary simple component for debugging
const IdeaHistoryTabInternal: React.FC<{ onQuickAdd: () => void }> = ({ onQuickAdd }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Histórico de Ideias</h3>
      <p className="text-gray-600">Componente temporário para debugging...</p>
      <Button onClick={onQuickAdd} className="mt-4">
        Adicionar Ideia Rápida
      </Button>
    </div>
  );
};

// ============================================================================
// P0.3 - QUICK ADD MODAL COMPONENT
// ============================================================================

const QuickAddModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; category?: string; tags?: string[] }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'geral',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    
    // Reset form
    setFormData({ title: '', description: '', category: 'geral', tags: '' });
    onClose();
  };

  return (
    <Modal
      variant="default"
      title="➕ Adicionar Ideia Rápida"
      open={isOpen}
      onClose={onClose}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Título da Ideia *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Série de posts sobre produtividade"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detalhe sua ideia..."
            className="w-full p-3 border border-neutral-300 rounded-lg resize-y min-h-[80px]"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Categoria
          </label>
          <Select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="geral">Geral</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tags (separadas por vírgula)
          </label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="produtividade, dicas, tutorial"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Ideia
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT - V7.5 ENHANCED
// ============================================================================

export const BancoDeIdeias: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || '';
  
  // Enhanced hooks integration
  const {
    currentIdea,
    isGeneratingIdea,
    generateIdea,
    saveIdea,
    getUserIdeasHistory,
    quickAddIdea,
    searchIdeas,
    loading: ideaLoading,
    error: ideaError,
    metadata: ideaMetadata,
    clearError: clearIdeaError,
    // P0 New Features
    getIdeasHistory
  } = useIdeaGeneration();
  
  // V8.0 Fix: Generate unique IDs to prevent duplicate form field IDs
  const formIdPrefix = useId();
  const categoryId = `${formIdPrefix}-category`;
  const styleId = `${formIdPrefix}-style`;
  const targetAudienceId = `${formIdPrefix}-targetAudience`;
  const contentTypeId = `${formIdPrefix}-contentType`;
  const keywordsId = `${formIdPrefix}-keywords`;
  const difficultyId = `${formIdPrefix}-difficulty`;

  // Enhanced personalization
  const {
    recommendations,
    learningProgress,
    uiAdaptations,
    trackInteraction,
    loading: personalizationLoading
  } = usePersonalization(userId);
  
  const {
    costSummary,
    canGenerateIdea,
    alerts,
    tierUpgradeInfo,
    trackIdeaCost,
    loading: budgetLoading
  } = useBudgetManagement(userId);
  
  const {
    ideas: cachedIdeas,
    saveIdeaToCache,
    loadIdeasFromCache,
    clearCache
  } = useIdeaCache();

  const {
    usageData,
    trackUsage
  } = useUsage(userId);

  // Performance monitoring integration
  const {
    webVitals,
    performanceReport,
    overallScore,
    isLoading: performanceLoading,
    lastUpdateTime,
    clearMetrics: clearPerformanceMetrics,
    generateReport,
    refreshMetrics,
    getMetricByName,
    getPerformanceAlerts,
    getPerformanceRecommendations
  } = usePerformanceMonitoring({
    userId,
    reportingEndpoint: '/api/performance',
    reportingInterval: 15000,
    enabled: true
  });

  // Enhanced tab navigation with performance tab
  const navigationTabs = [
    { id: 'generator', label: 'Gerador', icon: Sparkles },
    { id: 'history', label: 'Histórico', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'export', label: 'Exportar', icon: Download },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'personalization', label: 'Personalização', icon: User },
  ];

  // Enhanced tab type with performance option
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'templates' | 'export' | 'performance' | 'analytics' | 'personalization' | 'ai'>('generator');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [isEditingIdea, setIsEditingIdea] = useState(false);
  const [editedIdea, setEditedIdea] = useState<any>(null);
  const [showImplementationModal, setShowImplementationModal] = useState(false);
  // P0.3 - Quick Add Modal state
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  // P0.1 - Alerts state for feedback (renamed to avoid conflict with useBudgetManagement)
  const [localAlerts, setLocalAlerts] = useState<Array<{ type: 'success' | 'error' | 'warning'; message: string }>>([]);
  // V7.5 Loading states
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareItem, setShareItem] = useState<any>(null);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [selectedIdeaForShare, setSelectedIdeaForShare] = useState<any>(null);
  
  // Sharing hook
  const { quickShare, isSharing } = useSharing();

  // Enhanced form data with cache integration
  const [formData, setFormData] = useState<IdeaFormData>({
    category: 'Marketing & Growth',
    style: 'Startups',
    targetAudience: 'Startups',
    contentType: 'Videos',
    keywords: [],
    keywordsInput: '',
    difficulty: 'intermediate'
  });

  // P0.2 - History state enhanced with cache
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyIdeas, setHistoryIdeas] = useState<IdeaResponse[]>([]);

  // Cache integration
  const {
    getCachedOrFetch,
    preloadCache,
    clearCache: clearIdeaCache,
    cacheStats
  } = useIdeaCache();

  // Enhanced idea generation with progress tracking
  const handleGenerateIdea = useCallback(async () => {
    if (!canGenerateIdea || generatingIdea) return;

    setGeneratingIdea(true);
    setGenerationProgress(0);
    
    // Track performance start
    const startTime = performance.now();
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const cacheKey = {
        formData,
        userId,
        timestamp: Date.now()
      };

      const newIdea = await getCachedOrFetch(
        cacheKey,
        () => generateIdea(formData),
        5 * 60 * 1000 // 5 minutes cache
      );

      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (newIdea) {
        setCurrentIdea(newIdea);
        
        // Track performance metrics
        const endTime = performance.now();
        const generationTime = endTime - startTime;
        
        await trackUsage('idea_generated', { 
          category: formData.category,
          cached: Boolean(cacheStats.hits > 0),
          generationTime,
          performanceScore: overallScore
        });
      }
      
    } catch (error) {
      console.error('Erro ao gerar ideia:', error);
      setLocalAlerts([{
        type: 'error',
        message: 'Erro ao gerar ideia. Tente novamente.'
      }]);
    } finally {
      setGeneratingIdea(false);
      setGenerationProgress(0);
    }
  }, [formData, userId, canGenerateIdea, generatingIdea, generateIdea, getCachedOrFetch, trackUsage, cacheStats, overallScore]);

  // Apply template to form
  const handleApplyTemplate = useCallback((template: any) => {
    setFormData(prev => ({
      ...prev,
      ...template.formData
    }));
    
    setLocalAlerts([{
      type: 'success',
      message: `Template "${template.name}" aplicado com sucesso!`
    }]);
    
    setTimeout(() => setLocalAlerts([]), 3000);
    setActiveTab('generator');
  }, []);

  // Enhanced export/import handlers
  const handleExportIdeas = useCallback(async (ideas: IdeaResponse[]) => {
    await trackUsage('ideas_exported', { count: ideas.length });
    setLocalAlerts([{
      type: 'success',
      message: `${ideas.length} ideias exportadas com sucesso!`
    }]);
    setTimeout(() => setLocalAlerts([]), 3000);
  }, [trackUsage]);

  const handleImportIdeas = useCallback(async (ideas: IdeaResponse[]) => {
    try {
      // Process imported ideas
      for (const idea of ideas) {
        await saveIdea({
          idea,
          userId,
          metadata: { imported: true, importedAt: new Date().toISOString() }
        });
      }
      
      // Refresh history
      setHistoryIdeas(prev => [...prev, ...ideas]);
      await trackUsage('ideas_imported', { count: ideas.length });
      
    } catch (error) {
      console.error('Erro ao importar ideias:', error);
      throw error;
    }
  }, [saveIdea, userId, trackUsage]);

  // Apply UI adaptations from personalization (maintained)
  useEffect(() => {
    if (uiAdaptations?.layout) {
      document.body.setAttribute('data-layout', uiAdaptations.layout);
    }
  }, [uiAdaptations]);

  // Form handling (maintained logic)
  const handleFormChange = (field: keyof IdeaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const processKeywords = (keywordsText: string): string[] => {
    return keywordsText
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
  };

  const handleIdeaFeedback = async (
    ideaId: string,
    interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement',
    rating?: number,
    feedback?: string
  ) => {
    try {
      // P0.1 - Save Idea: Usar o novo método saveIdea para salvar ideias
      if (interactionType === 'save' && currentIdea) {
        const saved = await saveIdea(currentIdea);
        if (saved) {
          console.log('✅ Ideia salva com sucesso!');
          // Mostrar feedback visual de sucesso
          setLocalAlerts([{
            type: 'success',
            message: 'Ideia salva com sucesso no seu banco de ideias!'
          }]);
          
          // Limpar alert após 3 segundos
          setTimeout(() => setLocalAlerts([]), 3000);
        } else {
          console.error('❌ Erro ao salvar ideia');
          setLocalAlerts([{
            type: 'error',
            message: 'Erro ao salvar ideia. Tente novamente.'
          }]);
        }
      } else {
        // Para outras interações, usar o método original
        await processFeedback(userId, {
          ideaId,
          interactionType,
          rating,
          feedback
        });
      }
      
      await trackInteraction('idea_feedback', {
        ideaId,
        type: interactionType,
        rating,
        hasTextFeedback: !!feedback
      });
    } catch (error) {
      console.error('Erro ao processar feedback:', error);
      setLocalAlerts([{
        type: 'error',
        message: 'Erro ao processar ação. Tente novamente.'
      }]);
    }
  };

  const handleEditIdea = () => {
    setEditedIdea({ ...currentIdea });
    setIsEditingIdea(true);
  };

  const handleSaveEditedIdea = async () => {
    try {
      // ✅ CORREÇÃO: Usar parâmetros corretos para processFeedback
      await processFeedback(userId, {
        ideaId: currentIdea.id,
        interactionType: 'save',
        rating: undefined,
        feedback: JSON.stringify(editedIdea)
      });
      setIsEditingIdea(false);
      setEditedIdea(null);
    } catch (error) {
      console.error('Erro ao salvar ideia editada:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingIdea(false);
    setEditedIdea(null);
  };

  const handleImplementIdea = async (ideaId: string) => {
    try {
      await handleIdeaFeedback(ideaId, 'implement');
      setShowImplementationModal(true);
      await trackInteraction('implementation_started', {
        ideaId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao processar implementação:', error);
    }
  };

  const handleCloseImplementationModal = () => {
    setShowImplementationModal(false);
  };

  // P0.3 - Quick Add Modal handlers
  const handleOpenQuickAdd = () => {
    setShowQuickAddModal(true);
  };

  const handleCloseQuickAdd = () => {
    setShowQuickAddModal(false);
  };

  const handleQuickAddSubmit = async (data: { title: string; description?: string; category?: string; tags?: string[] }) => {
    try {
      const addedIdea = await quickAddIdea({
        ...data,
        userId
      });
      
      if (addedIdea) {
        setLocalAlerts([{
          type: 'success',
          message: 'Ideia adicionada com sucesso!'
        }]);
        
        // Se estiver na tab history, recarregar
        if (activeTab === 'history') {
          // O componente IdeaHistoryTab vai recarregar automaticamente
        }
        
        // Limpar alert após 3 segundos
        setTimeout(() => setLocalAlerts([]), 3000);
      }
    } catch (error) {
      console.error('Erro ao adicionar ideia:', error);
      setLocalAlerts([{
        type: 'error',
        message: 'Erro ao adicionar ideia. Tente novamente.'
      }]);
    }
  };

  // Performance alerts integration
  useEffect(() => {
    const performanceAlerts = getPerformanceAlerts();
    if (performanceAlerts.length > 0) {
      const criticalAlerts = performanceAlerts.filter(alert => alert.severity === 'high');
      if (criticalAlerts.length > 0) {
        setLocalAlerts(prev => [...prev, {
          type: 'warning',
          message: `Performance crítica: ${criticalAlerts.length} problemas detectados`
        }]);
      }
    }
  }, [getPerformanceAlerts]);

  // Handle idea sharing
  const handleShareIdea = (idea: any) => {
    setSelectedIdeaForShare(idea);
    setShowShareModal(true);
  };

  // Handle collaboration toggle
  const handleToggleCollaboration = () => {
    setShowCollaborationPanel(!showCollaborationPanel);
  };

  // Quick share handler
  const handleQuickShare = async (idea: any, platform: string) => {
    const result = await quickShare(
      'idea',
      idea.title || 'Ideia sem título',
      idea.content,
      platform as any
    );
    
    if (result.success) {
      toast.success('Ideia compartilhada com sucesso!');
    } else {
      toast.error('Erro ao compartilhar ideia');
    }
  };

  // ============================================================================
  // RENDER COMPONENTS - V7.5 ENHANCED
  // ============================================================================

  const renderBudgetStatus = () => (
    <Layout.Card variant="outlined" padding="md" className="mb-6">
      <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary-600" />
        Status do Orçamento
      </Layout.Heading>
      
      {costSummary && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Layout.Text variant="bodySmall" color="muted">
              Ideias hoje:
            </Layout.Text>
            <Layout.Text variant="body" className="font-medium">
              {costSummary.ideasToday || 0} / {costSummary.dailyLimit || 15}
            </Layout.Text>
          </div>
          
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((costSummary.ideasToday || 0) / (costSummary.dailyLimit || 15)) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <Layout.Text variant="bodySmall" color="muted">
              Custo estimado:
            </Layout.Text>
            <Layout.Text variant="body" className="font-medium">
              R$ {(costSummary.estimatedCost || 0).toFixed(2)}
            </Layout.Text>
          </div>
          
          {!canGenerateIdea && (
            <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <Layout.Text variant="bodySmall" color="warning" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Limite diário atingido. Faça upgrade para continuar.
              </Layout.Text>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setShowUpgradeModal(true)}
              >
                Ver Planos
              </Button>
            </div>
          )}
        </div>
      )}
    </Layout.Card>
  );

  const renderIdeaGenerator = () => (
    <Layout.Card variant="elevated" padding="lg" className="mb-6">
      <Layout.Heading level={3} className="mb-6 flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-primary-600" />
        Gerador de Ideias
      </Layout.Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Categoria
          </label>
          <Select
            value={formData.category}
            onChange={(value) => handleFormChange('category', value)}
            options={[
              { value: 'Marketing & Growth', label: 'Marketing & Growth' },
              { value: 'Tecnologia', label: 'Tecnologia' },
              { value: 'Educação', label: 'Educação' },
              { value: 'Entretenimento', label: 'Entretenimento' },
              { value: 'Negócios', label: 'Negócios' },
              { value: 'Lifestyle', label: 'Lifestyle' }
            ]}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Público-Alvo
          </label>
          <Select
            value={formData.targetAudience}
            onChange={(value) => handleFormChange('targetAudience', value)}
            options={[
              { value: 'Startups', label: 'Startups' },
              { value: 'Jovens', label: 'Jovens' },
              { value: 'Profissionais', label: 'Profissionais' },
              { value: 'Empreendedores', label: 'Empreendedores' },
              { value: 'Estudantes', label: 'Estudantes' },
              { value: 'Pais', label: 'Pais' }
            ]}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tipo de Conteúdo
          </label>
          <Select
            value={formData.contentType}
            onChange={(value) => handleFormChange('contentType', value)}
            options={[
              { value: 'Videos', label: 'Vídeos' },
              { value: 'Posts', label: 'Posts' },
              { value: 'Stories', label: 'Stories' },
              { value: 'Reels', label: 'Reels' },
              { value: 'Threads', label: 'Threads' },
              { value: 'Carrosséis', label: 'Carrosséis' }
            ]}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dificuldade
          </label>
          <Select
            value={formData.difficulty}
            onChange={(value) => handleFormChange('difficulty', value)}
            options={[
              { value: 'beginner', label: 'Iniciante' },
              { value: 'intermediate', label: 'Intermediário' },
              { value: 'advanced', label: 'Avançado' }
            ]}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Palavras-chave (separadas por vírgula)
        </label>
        <Input
          value={formData.keywordsInput}
          onChange={(e) => handleFormChange('keywordsInput', e.target.value)}
          placeholder="ex: marketing digital, redes sociais, estratégia"
        />
      </div>
      
      <Button
        onClick={handleGenerateIdea}
        disabled={ideaLoading || !canGenerateIdea}
        className="w-full flex items-center justify-center gap-2"
      >
        {generatingIdea ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Gerando Ideia...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Gerar Nova Ideia</span>
          </>
        )}
      </Button>
    </Layout.Card>
  );

  const renderGeneratedIdea = () => {
    if (!currentIdea) {
      return (
        <Layout.Card variant="outlined" padding="lg" className="text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-neutral-600" />
          </div>
          <Layout.Heading level={4} className="mb-2">
            Nenhuma ideia gerada ainda
          </Layout.Heading>
          <Layout.Text variant="body" color="muted">
            Clique em "Gerar Nova Ideia" para começar!
          </Layout.Text>
        </Layout.Card>
      );
    }

    const ideaToShow = isEditingIdea ? editedIdea : currentIdea;

    return (
      <Layout.Card variant="elevated" padding="lg">
        <div className="mb-6">
          {isEditingIdea ? (
            <Input
              value={editedIdea?.title || ''}
              onChange={(e) => setEditedIdea(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título da ideia"
              className="text-xl font-semibold"
            />
          ) : (
            <Layout.Heading level={3} className="mb-3">
              {ideaToShow.title}
            </Layout.Heading>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              <Tag className="w-3 h-3 mr-1" />
              {ideaToShow.category}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
              <Users className="w-3 h-3 mr-1" />
              {ideaToShow.targetAudience}
            </span>
            {!isEditingIdea && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditIdea}
                className="h-6 px-2"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Layout.Heading level={4} className="mb-2">
              Descrição
            </Layout.Heading>
            {isEditingIdea ? (
              <textarea
                value={editedIdea?.description || ''}
                onChange={(e) => setEditedIdea(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-neutral-300 rounded-lg resize-y min-h-[80px]"
                placeholder="Descrição da ideia"
              />
            ) : (
              <Layout.Text variant="body">
                {ideaToShow.description}
              </Layout.Text>
            )}
          </div>
          
          <div>
            <Layout.Heading level={4} className="mb-2">
              Como Implementar
            </Layout.Heading>
            {isEditingIdea ? (
              <textarea
                value={editedIdea?.implementation || ''}
                onChange={(e) => setEditedIdea(prev => ({ ...prev, implementation: e.target.value }))}
                className="w-full p-3 border border-neutral-300 rounded-lg resize-y min-h-[120px]"
                placeholder="Passos para implementação"
              />
            ) : (
              <div className="space-y-2">
                {ideaToShow.implementation.split('\n').map((step, index) => (
                  <Layout.Text key={index} variant="body" className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </span>
                    {step}
                  </Layout.Text>
                ))}
              </div>
            )}
          </div>
        </div>

        {isEditingIdea ? (
          <div className="flex gap-3">
            <Button
              onClick={handleSaveEditedIdea}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleIdeaFeedback(currentIdea.id, 'like')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Curtir
            </Button>
            
            <Button
              onClick={() => handleIdeaFeedback(currentIdea.id, 'save')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </Button>
            
            <Button
              onClick={() => handleIdeaFeedback(currentIdea.id, 'share')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            
            <Button
              onClick={() => handleImplementIdea(currentIdea.id)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600"
            >
              <Rocket className="w-4 h-4" />
              Implementar
            </Button>
          </div>
        )}
      </Layout.Card>
    );
  };

  const renderAlerts = () => {
    if (!localAlerts || localAlerts.length === 0) return null;

    return (
      <div className="mb-6 space-y-3">
        {localAlerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              alert.type === 'warning' ? 'bg-warning-50 border-warning-200' :
              alert.type === 'success' ? 'bg-success-50 border-success-200' :
              'bg-error-50 border-error-200'
            }`}
          >
            <Layout.Text 
              variant="body" 
              color={alert.type}
              className="flex items-center gap-2"
            >
              {alert.type === 'warning' && <AlertCircle className="w-4 h-4" />}
              {alert.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {alert.type === 'error' && <X className="w-4 h-4" />}
              {alert.message}
            </Layout.Text>
          </div>
        ))}
      </div>
    );
  };

  const renderLearningProgress = () => {
    if (!learningProgress) return null;

    return (
      <Layout.Card variant="outlined" padding="md" className="mb-6">
        <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Progresso de Personalização
        </Layout.Heading>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Layout.Text variant="bodySmall" color="muted">
              Interações registradas:
            </Layout.Text>
            <Layout.Text variant="body" className="font-medium">
              {learningProgress.dataPoints || 0}
            </Layout.Text>
          </div>
          
          <div className="flex justify-between items-center">
            <Layout.Text variant="bodySmall" color="muted">
              Qualidade das recomendações:
            </Layout.Text>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              learningProgress.recommendationQuality === 'alta' ? 'bg-success-100 text-success-800' :
              learningProgress.recommendationQuality === 'média' ? 'bg-warning-100 text-warning-800' :
              'bg-neutral-100 text-neutral-800'
            }`}>
              <Star className="w-3 h-3 mr-1" />
              {learningProgress.recommendationQuality || 'básica'}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPersonalization(true)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Ver Dashboard de Personalização
          </Button>
        </div>
      </Layout.Card>
    );
  };

  // ============================================================================
  // MAIN RENDER - V7.5 ENHANCED
  // ============================================================================

  return (
    <Layout.Page variant="dashboard" padding="responsive">
      <Layout.Section spacing="comfortable" maxWidth="container">
        
        {/* V7.5 Enhanced Header */}
        <div className="text-center mb-8 relative">
          {/* P0.3 - Quick Add Button (Position 1) */}
          <Button
            onClick={handleOpenQuickAdd}
            variant="outline"
            size="sm"
            className="absolute top-0 right-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar Ideia</span>
          </Button>
          
          <Layout.Heading level={1} className="mb-4 flex items-center justify-center gap-3">
            <Lightbulb className="w-8 h-8 text-primary-600" />
            <span>Banco de Ideias</span>
            <Sparkles className="w-6 h-6 text-warm-500" />
          </Layout.Heading>
          <Layout.Text variant="subtitle" color="muted" className="max-w-2xl mx-auto">
            Sistema inteligente de geração de ideias com personalização e analytics
          </Layout.Text>
        </div>

        {/* V7.5 Enhanced Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg border border-neutral-200 p-1">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
            {/* P0.3 - Quick Add Button (Position 2) */}
            <button
              onClick={handleOpenQuickAdd}
              className="flex items-center gap-2 px-3 py-2 ml-2 text-primary-600 hover:bg-primary-50 rounded-md transition-all border border-primary-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Adicionar</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {renderAlerts()}

        {/* V7.5 Enhanced Main Content */}
        <Layout.Grid cols={1} gap="xl" className="max-w-6xl mx-auto">
          
          {activeTab === 'generator' && (
            <Layout.Grid cols={4} gap="lg" className="items-start">
              
              {/* Main Content - Generator */}
              <div className="col-span-3 space-y-6">
                {/* Form area with enhanced loading states */}
                <Layout.Card variant="outlined" padding="lg">
                  <form onSubmit={(e) => { e.preventDefault(); handleGenerateIdea(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Layout.Label htmlFor={categoryId} className="block mb-2">
                          Categoria
                        </Layout.Label>
                        <Layout.Select
                          id={categoryId}
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full"
                        >
                          <option value="Marketing & Growth">Marketing & Growth</option>
                          <option value="Educação & Tutoriais">Educação & Tutoriais</option>
                          <option value="Entretenimento & Viral">Entretenimento & Viral</option>
                          <option value="Negócios & Estratégia">Negócios & Estratégia</option>
                          <option value="Lifestyle & Bem-estar">Lifestyle & Bem-estar</option>
                          <option value="Tecnologia & Inovação">Tecnologia & Inovação</option>
                          <option value="Finanças & Investimentos">Finanças & Investimentos</option>
                          <option value="Saúde & Fitness">Saúde & Fitness</option>
                          <option value="Arte & Criatividade">Arte & Criatividade</option>
                          <option value="Viagens & Aventuras">Viagens & Aventuras</option>
                        </Layout.Select>
                      </div>

                      <div>
                        <Layout.Label htmlFor={styleId} className="block mb-2">
                          Estilo
                        </Layout.Label>
                        <Layout.Select
                          id={styleId}
                          value={formData.style}
                          onChange={(e) => setFormData({...formData, style: e.target.value})}
                          className="w-full"
                        >
                          <option value="Startups">Startups</option>
                          <option value="Educativo">Educativo</option>
                          <option value="Profissional">Profissional</option>
                          <option value="Casual">Casual</option>
                          <option value="Viral">Viral</option>
                        </Layout.Select>
                      </div>

                      <div>
                        <Layout.Label htmlFor={targetAudienceId} className="block mb-2">
                          Público-alvo
                        </Layout.Label>
                        <Layout.Select
                          id={targetAudienceId}
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                          className="w-full"
                        >
                          <option value="Startups">Startups</option>
                          <option value="Empreendedores">Empreendedores</option>
                          <option value="Criadores de conteúdo">Criadores de conteúdo</option>
                          <option value="Profissionais">Profissionais</option>
                          <option value="Estudantes">Estudantes</option>
                          <option value="Público geral">Público geral</option>
                        </Layout.Select>
                      </div>

                      <div>
                        <Layout.Label htmlFor={contentTypeId} className="block mb-2">
                          Tipo de Conteúdo
                        </Layout.Label>
                        <Layout.Select
                          id={contentTypeId}
                          value={formData.contentType}
                          onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                          className="w-full"
                        >
                          <option value="Videos">Vídeos</option>
                          <option value="Posts">Posts</option>
                          <option value="Artigos">Artigos</option>
                          <option value="Podcasts">Podcasts</option>
                          <option value="Infográficos">Infográficos</option>
                          <option value="Short Videos">Short Videos</option>
                          <option value="Webinars">Webinars</option>
                          <option value="E-books">E-books</option>
                          <option value="Cursos">Cursos</option>
                          <option value="Newsletters">Newsletters</option>
                        </Layout.Select>
                      </div>

                      <div className="md:col-span-2">
                        <Layout.Label htmlFor={keywordsId} className="block mb-2">
                          Palavras-chave (separadas por vírgula)
                        </Layout.Label>
                        <Layout.Input
                          id={keywordsId}
                          type="text"
                          value={formData.keywordsInput}
                          onChange={(e) => setFormData({...formData, keywordsInput: e.target.value})}
                          placeholder="Ex: marketing digital, redes sociais, conversão"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Layout.Label htmlFor={difficultyId} className="block mb-2">
                          Nível de Dificuldade
                        </Layout.Label>
                        <Layout.Select
                          id={difficultyId}
                          value={formData.difficulty}
                          onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                          className="w-full"
                        >
                          <option value="beginner">Iniciante</option>
                          <option value="intermediate">Intermediário</option>
                          <option value="advanced">Avançado</option>
                        </Layout.Select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={generatingIdea || !canGenerateIdea}
                        className="w-full md:w-auto"
                      >
                        {generatingIdea ? (
                          <div className="flex items-center gap-2">
                            <LoadingState 
                              type="generating" 
                              size="sm" 
                              showProgress={true}
                              progress={generationProgress}
                            />
                          </div>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Gerar Ideia
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Layout.Card>

                {/* Generated idea display */}
                {currentIdea && (
                  <Layout.Card variant="outlined" padding="lg" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Layout.Heading level={3} className="flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-primary-600" />
                        Ideia Gerada
                      </Layout.Heading>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIdeaFeedback(currentIdea.id, 'save', 5, 'Ideia salva pelo usuário')}
                        >
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowImplementationModal(true)}
                        >
                          Implementar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-primary-50 to-warm-50 p-6 rounded-lg">
                      <Layout.Heading level={4} className="mb-3">{currentIdea.title}</Layout.Heading>
                      <Layout.Text variant="body" className="mb-4">{currentIdea.description}</Layout.Text>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {currentIdea.tags?.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-sm text-neutral-600">
                        <span className="font-medium">Categoria:</span> {currentIdea.category} • 
                        <span className="font-medium ml-2">Público:</span> {currentIdea.targetAudience}
                      </div>
                    </div>
                  </Layout.Card>
                )}

                {/* Templates tab content */}
                {activeTab === 'templates' && (
                  <TemplateSystem
                    onApplyTemplate={handleApplyTemplate}
                    currentFormData={formData}
                  />
                )}

                {/* Export tab content */}
                {activeTab === 'export' && (
                  <ExportImportSystem
                    ideas={historyIdeas}
                    onImport={handleImportIdeas}
                    onExport={handleExportIdeas}
                  />
                )}

              </div>
              
              {/* Sidebar - Status & Progress */}
              <div className="col-span-1 space-y-6">
                {renderBudgetStatus()}
                {renderLearningProgress()}
                
                {/* Quick Stats */}
                <Layout.Card variant="outlined" padding="md">
                  <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    Estatísticas
                  </Layout.Heading>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Layout.Text variant="bodySmall" color="muted">
                        Ideias geradas:
                      </Layout.Text>
                      <Layout.Text variant="body" className="font-medium">
                        {costSummary?.ideasToday || 0}
                      </Layout.Text>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Layout.Text variant="bodySmall" color="muted">
                        Implementadas:
                      </Layout.Text>
                      <Layout.Text variant="body" className="font-medium">
                        {Math.floor((costSummary?.ideasToday || 0) * 0.3)}
                      </Layout.Text>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Layout.Text variant="bodySmall" color="muted">
                        Taxa de sucesso:
                      </Layout.Text>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        87%
                      </span>
                    </div>
                  </div>
                </Layout.Card>
              </div>
              
            </Layout.Grid>
          )}

          {activeTab === 'analytics' && (
            <Suspense fallback={
              <Layout.Card variant="outlined" padding="lg" className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <Layout.Text variant="body" color="muted">
                  Carregando analytics...
                </Layout.Text>
              </Layout.Card>
            }>
              <AnalyticsDashboard userId={userId} />
            </Suspense>
          )}
          
          {activeTab === 'personalization' && (
            <Suspense fallback={
              <Layout.Card variant="outlined" padding="lg" className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <Layout.Text variant="body" color="muted">
                  Carregando personalização...
                </Layout.Text>
              </Layout.Card>
            }>
              <PersonalizationPanel userId={userId} />
            </Suspense>
          )}

          {activeTab === 'history' && (
            <Suspense fallback={
              <Layout.Card variant="outlined" padding="lg" className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <Layout.Text variant="body" color="muted">
                  Carregando histórico...
                </Layout.Text>
              </Layout.Card>
            }>
              <IdeaHistoryTabInternal onQuickAdd={handleOpenQuickAdd} />
            </Suspense>
          )}

          {activeTab === 'templates' && (
            <Suspense fallback={
              <Layout.Card variant="outlined" padding="lg" className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <Layout.Text variant="body" color="muted">
                  Carregando templates...
                </Layout.Text>
              </Layout.Card>
            }>
              <TemplateSystem
                onApplyTemplate={handleApplyTemplate}
                onExport={handleExportIdeas}
                onImport={handleImportIdeas}
              />
            </Suspense>
          )}

          {activeTab === 'export' && (
            <Suspense fallback={
              <Layout.Card variant="outlined" padding="lg" className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <Layout.Text variant="body" color="muted">
                  Exportando ideias...
                </Layout.Text>
              </Layout.Card>
            }>
              <ExportImportSystem
                onExport={handleExportIdeas}
                onImport={handleImportIdeas}
              />
            </Suspense>
          )}

          {activeTab === 'performance' && (
            <Suspense fallback={
              <Layout.Card variant="outlined" padding="lg" className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <Layout.Text variant="body" color="muted">
                  Carregando métricas de performance...
                </Layout.Text>
              </Layout.Card>
            }>
              <PerformanceDashboard
                userId={userId}
                reportingEndpoint="/api/performance"
              />
            </Suspense>
          )}

        </Layout.Grid>

        {/* Implementation Modal - V7.5 Enhanced */}
        {showImplementationModal && currentIdea && (
          <ImplementationModal
            isOpen={showImplementationModal}
            onClose={handleCloseImplementationModal}
            idea={currentIdea}
            onFeedback={(ideaId, interactionType, rating, feedback) => handleIdeaFeedback(ideaId, interactionType, rating, feedback)}
          />
        )}

        {/* Upgrade Modal - Maintained */}
        {showUpgradeModal && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            tierUpgradeInfo={tierUpgradeInfo}
            onUpgrade={() => {
              setShowUpgradeModal(false);
              // Redirect to upgrade page or show a success message
            }}
          />
        )}

        {/* P0.3 - Quick Add Modal */}
        <QuickAddModal
          isOpen={showQuickAddModal}
          onClose={handleCloseQuickAdd}
          onSubmit={handleQuickAddSubmit}
        />

        {/* Export/Import System - V7.5 Enhanced */}
        {/* This component is now integrated into the main layout for V7.5 Enhanced */}

        {/* Collaboration Panel */}
        {showCollaborationPanel && (
          <CollaborationPanel
            initialIdea={currentIdea?.content || ''}
            onIdeaChange={(idea) => {
              if (currentIdea) {
                setCurrentIdea({ ...currentIdea, content: idea });
              }
            }}
            className="w-full"
          />
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedIdeaForShare(null);
          }}
          item={selectedIdeaForShare}
          quickShare={!selectedIdeaForShare}
          type="idea"
          title={selectedIdeaForShare?.title || 'Nova Ideia'}
          content={selectedIdeaForShare?.content || ''}
        />

      </Layout.Section>
    </Layout.Page>
  );
};

export default BancoDeIdeias; 