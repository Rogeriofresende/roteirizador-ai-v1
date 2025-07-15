/**
 * 🧠 BANCO DE IDEIAS - MAIN COMPONENT V8.0
 * Modular component integrating all extracted components
 * Following V8.0 Unified Development methodology
 * 
 * BEFORE: 1578 lines monolithic component
 * AFTER: ~150 lines coordinator component + 32 modular files
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Layout } from '../../design-system/components/Layout';
import { Lightbulb, Sparkles, Plus } from 'lucide-react';

// V8.0 Types and Constants
import { TabType } from './types';
import { NAVIGATION_TABS } from './constants';

// V8.0 Hooks
import { useBancoDeIdeiasState } from './hooks/useBancoDeIdeiasState';
import { useBancoDeIdeiasLogic } from './hooks/useBancoDeIdeiasLogic';

// V8.0 Shared Components
import { LoadingStates } from './components/shared/LoadingStates';
import ErrorBoundary from './components/shared/ErrorBoundary';

// V8.0 Lazy Loading Implementation
const IdeaGenerator = lazy(() => import('./components/IdeaGenerator'));
const IdeaHistory = lazy(() => import('./components/IdeaHistory'));

// Legacy components (temporary - will be replaced in Phase 2)
import { TemplateSystem } from '../../components/TemplateSystem';
import { ExportImportSystem } from '../../components/ExportImportSystem';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import { PersonalizationPanel } from '../../components/PersonalizationPanel';
import { PerformanceDashboard } from '../../components/PerformanceDashboard';

// ============================================================================
// MAIN BANCO DE IDEIAS COMPONENT V8.0
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
  
  // ============================================================================
  // UI ADAPTATIONS (from personalization)
  // ============================================================================
  
  useEffect(() => {
    if (logic.uiAdaptations?.layout) {
      document.body.setAttribute('data-layout', logic.uiAdaptations.layout);
    }
  }, [logic.uiAdaptations]);
  
  // ============================================================================
  // NAVIGATION RENDERING
  // ============================================================================
  
  const renderNavigation = () => (
    <Layout.Card variant="outlined" padding="md" className="mb-6">
      <div className="flex flex-wrap gap-2">
        {NAVIGATION_TABS.map((tab) => {
          const isActive = state.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => actions.handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </Layout.Card>
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
  // TAB CONTENT RENDERING
  // ============================================================================
  
  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'generator':
        return (
          <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
            <IdeaGenerator
              formData={state.formData}
              onFormChange={actions.handleFormChange}
              onGenerateIdea={handleGenerateIdea}
              isGenerating={state.isGenerating}
              currentIdea={state.currentIdea}
              onIdeaFeedback={logic.actions.handleIdeaFeedback}
            />
          </Suspense>
        );
        
      case 'history':
        return (
          <Suspense fallback={<LoadingStates.ComponentSkeleton />}>
            <IdeaHistory
              onQuickAdd={() => actions.openModal('quickAdd')}
              ideas={logic.currentIdea ? [logic.currentIdea] : []} // Temporary - would come from actual history
              loading={logic.loading.idea}
              onIdeaSelect={(idea) => actions.setCurrentIdea(idea)}
            />
          </Suspense>
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
              ideas={logic.currentIdea ? [logic.currentIdea] : []}
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
  // MAIN RENDER V8.0
  // ============================================================================
  
  return (
    <ErrorBoundary>
      <Layout.Page variant="dashboard" padding="responsive">
        <Layout.Section spacing="comfortable" maxWidth="container">
          
          {/* V8.0 Enhanced Header */}
          <div className="text-center mb-8 relative">
            {/* Quick Add Button */}
            <button
              onClick={() => actions.openModal('quickAdd')}
              className="absolute top-0 right-0 flex items-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionar Ideia</span>
            </button>
            
            <Layout.Heading level={1} className="mb-4 flex items-center justify-center gap-3">
              <Lightbulb className="w-8 h-8 text-primary-600" />
              <span>Banco de Ideias</span>
              <Sparkles className="w-6 h-6 text-warm-500" />
            </Layout.Heading>
            <Layout.Text variant="subtitle" color="muted" className="max-w-2xl mx-auto">
              Sistema inteligente de geração de ideias - Arquitetura V8.0 Modular
            </Layout.Text>
          </div>
          
          {/* Alerts */}
          {renderAlerts()}
          
          {/* Navigation */}
          {renderNavigation()}
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {renderTabContent()}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
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
            </div>
          </div>
          
        </Layout.Section>
      </Layout.Page>
    </ErrorBoundary>
  );
};

export default BancoDeIdeias; 