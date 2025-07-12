/**
 * 🧠 Banco de Ideias - Main Page Component
 * 
 * Complete idea generation system with personalization, cost management,
 * and analytics integration. Uses Design System components and custom hooks.
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Features: Idea Generation + Personalization + Budget Management + Analytics
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useIdeaGeneration } from '../hooks/useIdeaGeneration';
import { usePersonalization } from '../hooks/usePersonalization';
import { useBudgetManagement } from '../hooks/useBudgetManagement';

// Design System Components
import { Button } from '../design-system/components/Button';
import { Card } from '../design-system/components/Card';
import { Input } from '../design-system/components/Input';
import { Select } from '../design-system/components/form/Select';
import { Modal } from '../design-system/components/Modal';
import { Navigation } from '../design-system/components/Navigation';
import { FeatureHighlight } from '../design-system/components/migration/FeatureHighlight';
import { ProgressiveDisclosure } from '../design-system/components/migration/ProgressiveDisclosure';
import { CheckboxSimple as Checkbox } from '../design-system/components/form/CheckboxSimple';

// Lazy load heavy components
const IdeaAnalytics = lazy(() => import('../components/BancoIdeias/IdeaAnalytics'));
const PersonalizationDashboard = lazy(() => import('../components/BancoIdeias/PersonalizationDashboard'));

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface IdeaFormData {
  category: string;
  style: string;
  targetAudience: string;
  contentType: string;
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BancoDeIdeias: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || '';
  
  // Custom hooks integration
  const {
    generateIdea,
    processFeedback,
    currentIdea,
    loading: ideaLoading,
    error: ideaError,
    metadata: ideaMetadata,
    clearError: clearIdeaError
  } = useIdeaGeneration();
  
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
    dismissAlert
  } = useBudgetManagement(userId);
  
  // Local state
  const [formData, setFormData] = useState<IdeaFormData>({
    category: '',
    style: '',
    targetAudience: '',
    contentType: '',
    keywords: [],
    difficulty: 'intermediate'
  });
  
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  
  // Apply UI adaptations from personalization
  const adaptedClassNames = uiAdaptations?.classNames?.container || '';
  
  // ============================================================================
  // FORM OPTIONS (could be fetched from backend)
  // ============================================================================
  
  const categoryOptions = [
    { value: 'marketing', label: 'Marketing & Growth' },
    { value: 'content', label: 'Criação de Conteúdo' },
    { value: 'business', label: 'Estratégia de Negócios' },
    { value: 'productivity', label: 'Produtividade' },
    { value: 'education', label: 'Educação & Cursos' },
    { value: 'social', label: 'Redes Sociais' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'technology', label: 'Tecnologia & SaaS' }
  ];
  
  const styleOptions = [
    { value: 'practical', label: 'Prático e Direto' },
    { value: 'creative', label: 'Criativo e Inovador' },
    { value: 'analytical', label: 'Analítico e Dados' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'minimalist', label: 'Minimalista' },
    { value: 'detailed', label: 'Detalhado e Completo' }
  ];
  
  const audienceOptions = [
    { value: 'startups', label: 'Startups' },
    { value: 'enterprises', label: 'Grandes Empresas' },
    { value: 'creators', label: 'Criadores de Conteúdo' },
    { value: 'entrepreneurs', label: 'Empreendedores' },
    { value: 'marketers', label: 'Profissionais de Marketing' },
    { value: 'students', label: 'Estudantes' },
    { value: 'general', label: 'Público Geral' }
  ];
  
  const contentTypeOptions = [
    { value: 'video', label: 'Vídeos' },
    { value: 'article', label: 'Artigos' },
    { value: 'post', label: 'Posts Redes Sociais' },
    { value: 'presentation', label: 'Apresentações' },
    { value: 'campaign', label: 'Campanhas' },
    { value: 'course', label: 'Cursos' },
    { value: 'email', label: 'Email Marketing' }
  ];
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleFormChange = (field: keyof IdeaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track form interaction for personalization
    trackInteraction('form_interaction', {
      field,
      value,
      formData: { ...formData, [field]: value }
    });
  };
  
  const handleGenerateIdea = async () => {
    if (!userId) {
      alert('Você precisa estar logado para gerar ideias.');
      return;
    }
    
    // Check if user can generate idea
    const canGenerate = canGenerateIdea;
    if (!canGenerate.allowed) {
      if (canGenerate.suggestedAction === 'upgrade_tier') {
        setShowUpgradeModal(true);
      } else {
        alert(canGenerate.reason);
      }
      return;
    }
    
    // Track generation attempt
    await trackInteraction('idea_generation_attempt', formData);
    
    // Generate idea
    const result = await generateIdea({
      userId,
      ...formData
    });
    
    if (result && result.success) {
      // Track cost
      await trackIdeaCost(result.metadata.cost, {
        category: formData.category,
        personalizationApplied: result.metadata.personalizationApplied
      });
      
      // Track successful generation for personalization
      await trackInteraction('idea_generated', {
        ideaId: result.idea.id,
        category: result.idea.category,
        personalizationApplied: result.metadata.personalizationApplied
      });
    }
  };
  
  const handleIdeaFeedback = async (
    ideaId: string,
    interactionType: 'like' | 'dislike' | 'save' | 'share' | 'implement',
    rating?: number,
    feedback?: string
  ) => {
    const success = await processFeedback(userId, {
      ideaId,
      interactionType,
      rating,
      feedback
    });
    
    if (success) {
      // Track feedback for personalization
      await trackInteraction('idea_feedback', {
        ideaId,
        interactionType,
        rating,
        feedback
      });
    }
  };
  
  // Apply personalized form defaults on load
  useEffect(() => {
    if (recommendations?.personalizedContent) {
      const { suggestedCategories, adaptedDifficulty } = recommendations.personalizedContent;
      
      setFormData(prev => ({
        ...prev,
        category: suggestedCategories[0] || prev.category,
        difficulty: adaptedDifficulty as any || prev.difficulty
      }));
    }
  }, [recommendations]);
  
  // ============================================================================
  // RENDER NAVIGATION TABS
  // ============================================================================
  
  const navigationTabs = [
    { id: 'generator', label: 'Gerador de Ideias', icon: '🧠' },
    { id: 'history', label: 'Histórico', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'personalization', label: 'Personalização', icon: '🎯' }
  ];
  
  // ============================================================================
  // RENDER BUDGET STATUS
  // ============================================================================
  
  const renderBudgetStatus = () => {
    if (!costSummary) return null;
    
    const { budgetStatus, tierInfo } = costSummary;
    const statusColor = 
      budgetStatus.percentage >= 90 ? 'danger' :
      budgetStatus.percentage >= 75 ? 'warning' : 'success';
    
    return (
      <Card variant="outlined" className="budget-status-card">
        <div className="budget-header">
          <h3>Orçamento & Tier</h3>
          <span className={`tier-badge tier-${tierInfo.currentTier}`}>
            {tierInfo.currentTier.toUpperCase()}
          </span>
        </div>
        
        <div className="budget-progress">
          <div className="progress-bar">
            <div 
              className={`progress-fill progress-${statusColor}`}
              style={{ width: `${budgetStatus.percentage}%` }}
            />
          </div>
          <span className="budget-text">
            ${costSummary.dailyCost.toFixed(4)} / ${budgetStatus.dailyLimit}
          </span>
        </div>
        
        <div className="tier-limits">
          <p>Ideias hoje: {costSummary.tierInfo.limits.dailyIdeas} disponíveis</p>
        </div>
        
        {tierUpgradeInfo && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUpgradeModal(true)}
            className="upgrade-button"
          >
            Upgrade para {tierUpgradeInfo.suggested}
          </Button>
        )}
      </Card>
    );
  };
  
  // ============================================================================
  // RENDER IDEA GENERATOR FORM
  // ============================================================================
  
  const renderIdeaGenerator = () => (
    <div className="idea-generator-section">
      <div className="form-grid">
        <div className="form-row">
          <Select
            label="Categoria"
            value={formData.category}
            onValueChange={(value) => handleFormChange('category', value)}
            options={categoryOptions}
            placeholder="Selecione uma categoria"
            required
          />
          
          <Select
            label="Estilo"
            value={formData.style}
            onValueChange={(value) => handleFormChange('style', value)}
            options={styleOptions}
            placeholder="Escolha um estilo"
          />
        </div>
        
        <div className="form-row">
          <Select
            label="Público-alvo"
            value={formData.targetAudience}
            onValueChange={(value) => handleFormChange('targetAudience', value)}
            options={audienceOptions}
            placeholder="Defina seu público"
          />
          
          <Select
            label="Tipo de Conteúdo"
            value={formData.contentType}
            onValueChange={(value) => handleFormChange('contentType', value)}
            options={contentTypeOptions}
            placeholder="Tipo de conteúdo"
          />
        </div>
        
        <div className="form-row">
          <Input
            label="Palavras-chave (separadas por vírgula)"
            value={formData.keywords.join(', ')}
            onChange={(e) => handleFormChange('keywords', e.target.value.split(',').map(k => k.trim()))}
            placeholder="marketing digital, growth hacking, startups"
          />
          
          <Select
            label="Nível de Dificuldade"
            value={formData.difficulty}
            onValueChange={(value) => handleFormChange('difficulty', value)}
            options={[
              { value: 'beginner', label: 'Iniciante' },
              { value: 'intermediate', label: 'Intermediário' },
              { value: 'advanced', label: 'Avançado' }
            ]}
          />
        </div>
      </div>
      
      <div className="generation-controls">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateIdea}
          loading={ideaLoading}
          disabled={!formData.category || !canGenerateIdea.allowed}
          fullWidth
        >
          {ideaLoading ? 'Gerando Ideia...' : '🧠 Gerar Nova Ideia'}
        </Button>
        
        {!canGenerateIdea.allowed && (
          <p className="generation-warning">
            {canGenerateIdea.reason}
          </p>
        )}
      </div>
      
      {ideaError && (
        <Card variant="outlined" className="error-card">
          <p className="error-message">{ideaError}</p>
          <Button variant="ghost" size="sm" onClick={clearIdeaError}>
            Dismiss
          </Button>
        </Card>
      )}
    </div>
  );
  
  // ============================================================================
  // RENDER GENERATED IDEA
  // ============================================================================
  
  const renderGeneratedIdea = () => {
    if (!currentIdea) return null;
    
    return (
      <Card variant="elevated" className="generated-idea-card" isNewFeature>
        <div className="idea-header">
          <h2>{currentIdea.title}</h2>
          <div className="idea-meta">
            <span className="category-tag">{currentIdea.category}</span>
            <span className="audience-tag">{currentIdea.targetAudience}</span>
          </div>
        </div>
        
        <div className="idea-content">
          <div className="description">
            <h3>Descrição</h3>
            <p>{currentIdea.description}</p>
          </div>
          
          <div className="implementation">
            <h3>Como Implementar</h3>
            <div className="implementation-steps">
              {currentIdea.implementation.split('\n').map((step, index) => (
                <p key={index}>{step}</p>
              ))}
            </div>
          </div>
          
          <div className="tags">
            <h4>Tags</h4>
            <div className="tag-list">
              {currentIdea.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="idea-actions">
          <Button
            variant="ghost"
            startIcon="👍"
            onClick={() => handleIdeaFeedback(currentIdea.id, 'like')}
          >
            Curtir
          </Button>
          
          <Button
            variant="ghost"
            startIcon="💾"
            onClick={() => handleIdeaFeedback(currentIdea.id, 'save')}
          >
            Salvar
          </Button>
          
          <Button
            variant="ghost"
            startIcon="📤"
            onClick={() => handleIdeaFeedback(currentIdea.id, 'share')}
          >
            Compartilhar
          </Button>
          
          <Button
            variant="primary"
            startIcon="🚀"
            onClick={() => handleIdeaFeedback(currentIdea.id, 'implement')}
          >
            Implementar
          </Button>
        </div>
        
        {ideaMetadata && (
          <div className="idea-metadata">
            <div className="metadata-item">
              <span>Custo: ${ideaMetadata.cost.toFixed(4)}</span>
            </div>
            {ideaMetadata.personalizationApplied && (
              <div className="metadata-item">
                <span>✨ Personalizada para você</span>
              </div>
            )}
            <div className="metadata-item">
              <span>Tier: {ideaMetadata.tierInfo.current}</span>
            </div>
          </div>
        )}
      </Card>
    );
  };
  
  // ============================================================================
  // RENDER ALERTS
  // ============================================================================
  
  const renderAlerts = () => {
    if (alerts.length === 0) return null;
    
    return (
      <div className="alerts-container">
        {alerts.map((alert, index) => (
          <Card
            key={index}
            variant="outlined"
            className={`alert alert-${alert.level}`}
          >
            <div className="alert-content">
              <p>{alert.message}</p>
              {alert.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (alert.action === 'upgrade_tier') {
                      setShowUpgradeModal(true);
                    }
                    dismissAlert(index);
                  }}
                >
                  {alert.action === 'upgrade_tier' ? 'Fazer Upgrade' : 'OK'}
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(index)}
              className="alert-dismiss"
            >
              ✕
            </Button>
          </Card>
        ))}
      </div>
    );
  };
  
  // ============================================================================
  // RENDER LEARNING PROGRESS
  // ============================================================================
  
  const renderLearningProgress = () => {
    if (!learningProgress) return null;
    
    return (
      <FeatureHighlight
        variant="glow"
        message={`IA aprendendo suas preferências: ${learningProgress.completeness}% completo`}
        isVisible={learningProgress.stage === 'learning'}
        delay={1000}
        autoDismissAfter={5000}
      />
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={`banco-de-ideias ${adaptedClassNames}`}>
      {/* Navigation */}
      <Navigation
        variant="tab"
        items={navigationTabs}
        activeItem={activeTab}
        onItemClick={setActiveTab}
        className="banco-navigation"
      />
      
      {/* Alerts */}
      {renderAlerts()}
      
      {/* Learning Progress */}
      {renderLearningProgress()}
      
      {/* Main Content */}
      <div className="banco-content">
        {/* Sidebar - Budget & Status */}
        <aside className="banco-sidebar">
          {renderBudgetStatus()}
          
          <ProgressiveDisclosure
            title="Dicas de Personalização"
            triggerType="manual"
            variant="fade"
            className="personalization-tips"
          >
            <div className="tips-content">
              <p>🎯 A IA está aprendendo suas preferências</p>
              <p>📊 {learningProgress?.dataPoints || 0} interações registradas</p>
              <p>⭐ Qualidade: {learningProgress?.recommendationQuality || 'básica'}</p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPersonalization(true)}
              >
                Ver Dashboard de Personalização
              </Button>
            </div>
          </ProgressiveDisclosure>
        </aside>
        
        {/* Main Area */}
        <main className="banco-main">
          {activeTab === 'generator' && (
            <>
              {renderIdeaGenerator()}
              {renderGeneratedIdea()}
            </>
          )}
          
          {activeTab === 'analytics' && (
            <Suspense fallback={<div>Carregando analytics...</div>}>
              <IdeaAnalytics userId={userId} />
            </Suspense>
          )}
          
          {activeTab === 'personalization' && (
            <Suspense fallback={<div>Carregando personalização...</div>}>
              <PersonalizationDashboard userId={userId} />
            </Suspense>
          )}
        </main>
      </div>
      
      {/* Modals */}
      {showUpgradeModal && (
        <Modal
          variant="confirmation"
          title="Upgrade de Tier"
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          confirmationConfig={{
            type: 'info',
            message: tierUpgradeInfo ? 
              `Upgrade para ${tierUpgradeInfo.suggested}: ${tierUpgradeInfo.reasoning}` :
              'Faça upgrade para continuar gerando ideias.',
            confirmText: 'Fazer Upgrade',
            cancelText: 'Mais Tarde'
          }}
        />
      )}
    </div>
  );
};

export default BancoDeIdeias; 