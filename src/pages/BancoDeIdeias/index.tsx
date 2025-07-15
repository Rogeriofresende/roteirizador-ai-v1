/**
 * 🧠 BANCO DE IDEIAS - MAIN COMPONENT V8.0 BETA
 * Professional modular component integrating all V8.0 Beta components
 * Following V8.0 Unified Development methodology - Beta Phase Complete
 * 
 * ARCHITECTURE EVOLUTION:
 * - Alpha Phase: Basic modular structure (✅ Complete)
 * - Beta Phase: Professional UI components (✅ Complete)
 * - Charlie Phase: Testing & Quality (🔄 Next)
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Layout } from '../../design-system/components/Layout';
import { Lightbulb, Sparkles, Plus } from 'lucide-react';

// V8.0 Types and Constants
import { TabType, IdeaResponse } from './types';
import { NAVIGATION_TABS } from './constants';

// V8.0 Hooks
import { useBancoDeIdeiasState } from './hooks/useBancoDeIdeiasState';
import { useBancoDeIdeiasLogic } from './hooks/useBancoDeIdeiasLogic';

// V8.0 Shared Components
import { LoadingStates } from './components/shared/LoadingStates';
import ErrorBoundary from './components/shared/ErrorBoundary';

// V8.0 Professional Components - Beta Phase
const BancoIdeiasLayout = lazy(() => import('./components/BancoIdeiasLayout'));
const IdeaGenerationForm = lazy(() => import('./components/IdeaGenerationForm'));
const IdeaResultsDisplay = lazy(() => import('./components/IdeaResultsDisplay'));
const IdeaHistoryTab = lazy(() => import('./components/IdeaHistoryTab'));
const IdeaQuickActions = lazy(() => import('./components/IdeaQuickActions'));
const IdeaFilterSearch = lazy(() => import('./components/IdeaFilterSearch'));

// Legacy components (temporary - will be replaced in future phases)
import { TemplateSystem } from '../../components/TemplateSystem';
import { ExportImportSystem } from '../../components/ExportImportSystem';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import { PersonalizationPanel } from '../../components/PersonalizationPanel';
import { PerformanceDashboard } from '../../components/PerformanceDashboard';

// ============================================================================
// MAIN BANCO DE IDEIAS COMPONENT V8.0 BETA
// ============================================================================

export const BancoDeIdeias: React.FC = () => {
  
  // ============================================================================
  // V8.0 HOOKS INTEGRATION
  // ============================================================================
  
  const { state, actions } = useBancoDeIdeiasState();
  
  const logic = useBancoDeIdeiasLogic({
    onAlert: actions.addAlert,
    onIdeaGenerated: actions.setCurrentIdea,
    onGenerationStart: actions.startIdeaGeneration,
    onGenerationProgress: actions.updateGenerationProgress
  });
  
  // ============================================================================
  // BETA PHASE STATE
  // ============================================================================
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaResponse[]>([]);
  const [allIdeas, setAllIdeas] = useState<IdeaResponse[]>([]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleGenerateIdea = () => {
    logic.actions.handleGenerateIdea(state.formData);
  };
  
  const handleTemplateApply = (template: any) => {
    const newFormData = logic.actions.handleApplyTemplate(template);
    if (newFormData) {
      actions.setFormData(newFormData);
      actions.handleTabChange('generator');
    }
  };
  
  const handleQuickAdd = async (ideaData: Partial<IdeaResponse>) => {
    try {
      await logic.actions.handleQuickAddIdea({
        title: ideaData.title || '',
        description: ideaData.description,
        category: ideaData.category,
        tags: ideaData.keywords
      });
      
      // Add to local state for immediate UI update
      const newIdea = {
        ...ideaData,
        id: ideaData.id || `quick_${Date.now()}`,
        keywords: ideaData.keywords || [],
        savedAt: new Date().toISOString(),
        createdAt: ideaData.createdAt || new Date().toISOString(),
        targetAudience: ideaData.targetAudience || 'Startups',
        contentType: ideaData.contentType || 'Posts',
        difficulty: ideaData.difficulty || 'intermediate',
        implementation: ideaData.implementation || '',
        metadata: ideaData.metadata || { source: 'manual' }
      } as IdeaResponse;
      
      setAllIdeas(prev => [newIdea, ...prev]);
      
    } catch (error) {
      console.error('Erro ao adicionar ideia:', error);
    }
  };
  
  const handleQuickGenerate = async (formData: any) => {
    actions.setFormData(prev => ({ ...prev, ...formData }));
    handleGenerateIdea();
  };
  
  const handleIdeaSelect = (idea: IdeaResponse) => {
    actions.setCurrentIdea(idea);
    actions.handleTabChange('generator');
  };
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    // Initialize with current idea if available
    if (logic.currentIdea && !allIdeas.find(idea => idea.id === logic.currentIdea!.id)) {
      setAllIdeas(prev => [logic.currentIdea!, ...prev]);
    }
  }, [logic.currentIdea]);
  
  useEffect(() => {
    // UI adaptations from personalization
    if (logic.uiAdaptations?.layout) {
      document.body.setAttribute('data-layout', logic.uiAdaptations.layout);
    }
  }, [logic.uiAdaptations]);
  
  // ============================================================================
  // TAB CONTENT RENDERING - BETA PHASE
  // ============================================================================
  
  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'generator':
        return (
          <div className="space-y-8">
            <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
              <IdeaGenerationForm
                formData={state.formData}
                onFormChange={actions.handleFormChange}
                onGenerateIdea={handleGenerateIdea}
                isGenerating={state.isGenerating}
              />
            </Suspense>
            
            <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
              <IdeaResultsDisplay
                idea={state.currentIdea}
                onFeedback={logic.actions.handleIdeaFeedback}
                onShare={logic.actions.handleShareIdea}
                isGenerating={state.isGenerating}
              />
            </Suspense>
          </div>
        );
        
      case 'history':
        return (
          <div className="space-y-6">
            <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
              <IdeaFilterSearch
                ideas={allIdeas}
                onFilteredResults={setFilteredIdeas}
              />
            </Suspense>
            
            <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
              <IdeaHistoryTab
                ideas={filteredIdeas}
                loading={logic.loading.idea}
                onQuickAdd={() => actions.openModal('quickAdd')}
                onIdeaSelect={handleIdeaSelect}
                onRefresh={() => window.location.reload()}
              />
            </Suspense>
          </div>
        );
        
      case 'templates':
        return (
          <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
            <TemplateSystem
              onApplyTemplate={handleTemplateApply}
              currentFormData={state.formData}
            />
          </Suspense>
        );
        
      case 'export':
        return (
          <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
            <ExportImportSystem
              ideas={allIdeas}
              onImport={logic.actions.handleImportIdeas}
              onExport={logic.actions.handleExportIdeas}
            />
          </Suspense>
        );
        
      case 'analytics':
        return (
          <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
            <AnalyticsDashboard userId={logic.currentUser?.uid || ''} />
          </Suspense>
        );
        
      case 'personalization':
        return (
          <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
            <PersonalizationPanel userId={logic.currentUser?.uid || ''} />
          </Suspense>
        );
        
      case 'performance':
        return (
          <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
            <PerformanceDashboard
              userId={logic.currentUser?.uid || ''}
              reportingEndpoint="/api/performance"
            />
          </Suspense>
        );
        
      default:
        return (
          <Layout.Card variant="outlined" padding="lg" className="text-center">
            <Layout.Text variant="body" color="muted">
              Selecione uma aba para começar
            </Layout.Text>
          </Layout.Card>
        );
    }
  };
  
  // ============================================================================
  // SIDEBAR CONTENT
  // ============================================================================
  
  const renderSidebarContent = () => (
    <>
      {/* Budget Status */}
      {logic.costSummary && (
        <Layout.Card variant="outlined" padding="md">
          <Layout.Heading level={4} className="mb-3">
            Status do Plano
          </Layout.Heading>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Ideias hoje:</span>
              <span className="text-sm font-medium">
                {logic.costSummary.ideasToday || 0} / {logic.costSummary.dailyLimit || 15}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ 
                  width: `${((logic.costSummary.ideasToday || 0) / (logic.costSummary.dailyLimit || 15)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </Layout.Card>
      )}
      
      {/* Performance Stats */}
      {logic.overallScore && (
        <Layout.Card variant="outlined" padding="md">
          <Layout.Heading level={4} className="mb-3">
            Performance
          </Layout.Heading>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(logic.overallScore)}%
            </div>
            <div className="text-sm text-neutral-600">
              Score Geral
            </div>
          </div>
        </Layout.Card>
      )}
    </>
  );
  
  // ============================================================================
  // ALERTS RENDERING
  // ============================================================================
  
  const renderAlerts = () => {
    if (state.alerts.length === 0) return null;
    
    return (
      <div className="space-y-2 mb-6">
        {state.alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : alert.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>
    );
  };
  
  // ============================================================================
  // MAIN RENDER V8.0 BETA
  // ============================================================================
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingStates.FullPage message="Carregando Banco de Ideias..." />}>
        <BancoIdeiasLayout
          activeTab={state.activeTab}
          onTabChange={actions.handleTabChange}
          showMobileMenu={showMobileMenu}
          onMobileMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
          sidebarContent={renderSidebarContent()}
        >
          {/* Alerts */}
          {renderAlerts()}
          
          {/* Main Content */}
          {renderTabContent()}
        </BancoIdeiasLayout>
      </Suspense>
      
      {/* Quick Actions Floating Button */}
      <Suspense fallback={null}>
        <IdeaQuickActions
          onQuickAdd={handleQuickAdd}
          onQuickGenerate={handleQuickGenerate}
          onExport={() => logic.actions.handleExportIdeas(allIdeas)}
          onShare={() => logic.actions.handleShareIdea(state.currentIdea!)}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default BancoDeIdeias; 