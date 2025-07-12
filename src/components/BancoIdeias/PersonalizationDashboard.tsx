/**
 * 🎯 PersonalizationDashboard Component - AI Learning & Preferences Management
 * 
 * Interactive dashboard for managing AI personalization, viewing learning progress,
 * and configuring user preferences for the Banco de Ideias system.
 * 
 * Part of: WEEK 1 - Banco de Ideias Implementation
 * Integration: PersonalizationService + AnalyticsService + A/B Testing
 */

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';

// Design System Components
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/form/Select';
import { CheckboxSimple as Checkbox } from '../../design-system/components/form/CheckboxSimple';
import { ProgressiveDisclosure } from '../../design-system/components/migration/ProgressiveDisclosure';
import { FeatureHighlight } from '../../design-system/components/migration/FeatureHighlight';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PreferenceSettings {
  categories: string[];
  styles: string[];
  targetAudiences: string[];
  contentTypes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: 'visual' | 'textual' | 'interactive';
  notificationLevel: 'minimal' | 'moderate' | 'detailed';
}

interface LearningVisualization {
  categories: { name: string; accuracy: number; dataPoints: number }[];
  patterns: { pattern: string; confidence: number; examples: string[] }[];
  improvements: { area: string; suggestion: string; impact: 'low' | 'medium' | 'high' }[];
}

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface PersonalizationDashboardProps {
  userId: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PersonalizationDashboard: React.FC<PersonalizationDashboardProps> = ({ userId }) => {
  const {
    insights,
    recommendations,
    abTestConfig,
    learningProgress,
    loadInsights,
    updatePreferences,
    setupABTest,
    trackInteraction
  } = usePersonalization(userId);
  
  const [preferences, setPreferences] = useState<PreferenceSettings>({
    categories: [],
    styles: [],
    targetAudiences: [],
    contentTypes: [],
    difficulty: 'intermediate',
    learningStyle: 'interactive',
    notificationLevel: 'moderate'
  });
  
  const [activeSection, setActiveSection] = useState('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // ============================================================================
  // FORM OPTIONS
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
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handlePreferenceChange = (field: keyof PreferenceSettings, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSavePreferences = async () => {
    setSaving(true);
    
    try {
      const success = await updatePreferences({
        type: 'manual_preference_update',
        data: preferences,
        timestamp: new Date().toISOString()
      });
      
      if (success) {
        await trackInteraction('preferences_saved', preferences);
        alert('Preferências salvas com sucesso!');
      } else {
        alert('Erro ao salvar preferências. Tente novamente.');
      }
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Erro ao salvar preferências.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSetupABTest = async () => {
    const strategies = [
      { name: 'basic_personalization', config: { level: 'basic' } },
      { name: 'advanced_personalization', config: { level: 'contextual' } }
    ];
    
    const testConfig = await setupABTest(strategies);
    
    if (testConfig) {
      await trackInteraction('ab_test_started', {
        testId: testConfig.testId,
        strategy: testConfig.assignedStrategy
      });
      
      alert(`Teste A/B iniciado! Estratégia: ${testConfig.assignedStrategy}`);
    }
  };
  
  // Load preferences from insights
  useEffect(() => {
    if (insights?.preferences) {
      setPreferences({
        categories: insights.preferences.categories || [],
        styles: insights.preferences.styles || [],
        targetAudiences: insights.preferences.targetAudiences || [],
        contentTypes: insights.preferences.contentTypes || [],
        difficulty: insights.preferences.difficulty || 'intermediate',
        learningStyle: insights.preferences.learningStyle || 'interactive',
        notificationLevel: insights.preferences.sessionPreferences?.notificationLevel || 'moderate'
      });
    }
  }, [insights]);
  
  // ============================================================================
  // RENDER METHODS
  // ============================================================================
  
  const renderLearningProgress = () => {
    if (!learningProgress) return null;
    
    return (
      <Card variant="elevated" className="learning-progress-card">
        <div className="card-header">
          <h3>Progresso da IA</h3>
          <span className={`learning-badge ${learningProgress.stage}`}>
            {learningProgress.stage === 'optimized' ? '🎯 Otimizada' :
             learningProgress.stage === 'learning' ? '📚 Aprendendo' : '🔰 Inicial'}
          </span>
        </div>
        
        <div className="progress-metrics">
          <div className="metric-item">
            <h4>Precisão das Recomendações</h4>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${learningProgress.accuracy}%` }}
              />
              <span className="progress-text">{learningProgress.accuracy}%</span>
            </div>
          </div>
          
          <div className="metric-item">
            <h4>Completude do Perfil</h4>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${learningProgress.completeness}%` }}
              />
              <span className="progress-text">{learningProgress.completeness}%</span>
            </div>
          </div>
          
          <div className="metric-item">
            <h4>Pontos de Dados Coletados</h4>
            <div className="data-points">
              <span className="data-count">{learningProgress.dataPoints}</span>
              <span className="data-label">interações registradas</span>
            </div>
          </div>
        </div>
        
        <div className="learning-status">
          <p>
            <strong>Qualidade:</strong> {learningProgress.recommendationQuality}
          </p>
          <p>
            <strong>Status:</strong> {learningProgress.isReady ? 
              '✅ Pronto para recomendações personalizadas' : 
              '⏳ Coletando mais dados para melhorar'
            }
          </p>
        </div>
      </Card>
    );
  };
  
  const renderPreferencesSettings = () => (
    <Card variant="elevated" className="preferences-settings">
      <div className="card-header">
        <h3>Configurar Preferências</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Avançadas
        </Button>
      </div>
      
      <div className="preferences-form">
        {/* Basic Preferences */}
        <div className="form-section">
          <h4>Preferências Básicas</h4>
          
          <div className="form-row">
            <div className="form-field">
              <label>Categorias Favoritas</label>
              <div className="checkbox-group">
                {categoryOptions.map(option => (
                  <Checkbox
                    key={option.value}
                    checked={preferences.categories.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handlePreferenceChange('categories', [...preferences.categories, option.value]);
                      } else {
                        handlePreferenceChange('categories', preferences.categories.filter(c => c !== option.value));
                      }
                    }}
                    label={option.label}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <Select
              label="Nível de Dificuldade Preferido"
              value={preferences.difficulty}
              onValueChange={(value) => handlePreferenceChange('difficulty', value)}
              options={[
                { value: 'beginner', label: 'Iniciante' },
                { value: 'intermediate', label: 'Intermediário' },
                { value: 'advanced', label: 'Avançado' }
              ]}
            />
            
            <Select
              label="Estilo de Aprendizagem"
              value={preferences.learningStyle}
              onValueChange={(value) => handlePreferenceChange('learningStyle', value)}
              options={[
                { value: 'visual', label: 'Visual' },
                { value: 'textual', label: 'Textual' },
                { value: 'interactive', label: 'Interativo' }
              ]}
            />
          </div>
        </div>
        
        {/* Advanced Preferences */}
        <ProgressiveDisclosure
          title="Configurações Avançadas"
          isExpanded={showAdvanced}
          triggerType="manual"
          variant="slide"
        >
          <div className="form-section advanced">
            <div className="form-row">
              <div className="form-field">
                <label>Estilos Preferidos</label>
                <div className="checkbox-group">
                  {styleOptions.map(option => (
                    <Checkbox
                      key={option.value}
                      checked={preferences.styles.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handlePreferenceChange('styles', [...preferences.styles, option.value]);
                        } else {
                          handlePreferenceChange('styles', preferences.styles.filter(s => s !== option.value));
                        }
                      }}
                      label={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <Select
                label="Nível de Notificações"
                value={preferences.notificationLevel}
                onValueChange={(value) => handlePreferenceChange('notificationLevel', value)}
                options={[
                  { value: 'minimal', label: 'Mínimo' },
                  { value: 'moderate', label: 'Moderado' },
                  { value: 'detailed', label: 'Detalhado' }
                ]}
              />
            </div>
          </div>
        </ProgressiveDisclosure>
        
        <div className="form-actions">
          <Button
            variant="primary"
            onClick={handleSavePreferences}
            loading={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={loadInsights}
          >
            Restaurar Original
          </Button>
        </div>
      </div>
    </Card>
  );
  
  const renderInsightsAnalysis = () => {
    if (!insights) return null;
    
    return (
      <Card variant="elevated" className="insights-analysis">
        <div className="card-header">
          <h3>Análise de Padrões</h3>
        </div>
        
        <div className="insights-content">
          <div className="patterns-section">
            <h4>Padrões Identificados</h4>
            {insights.patterns?.bestPerformingContent?.length > 0 && (
              <div className="pattern-item">
                <h5>Conteúdo com Melhor Performance</h5>
                <ul>
                  {insights.patterns.bestPerformingContent.map((content, index) => (
                    <li key={index}>{content}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {insights.patterns?.engagementTimes?.length > 0 && (
              <div className="pattern-item">
                <h5>Horários de Maior Engajamento</h5>
                <ul>
                  {insights.patterns.engagementTimes.map((time, index) => (
                    <li key={index}>{time}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="recommendations-section">
            <h4>Recomendações da IA</h4>
            {insights.recommendations?.nextSuggestions?.map((suggestion, index) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span className="recommendation-text">{suggestion}</span>
              </div>
            ))}
            
            {insights.recommendations?.improvementAreas?.length > 0 && (
              <div className="improvement-areas">
                <h5>Áreas para Melhoria</h5>
                {insights.recommendations.improvementAreas.map((area, index) => (
                  <div key={index} className="improvement-item">
                    <span className="improvement-icon">🎯</span>
                    <span className="improvement-text">{area}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  const renderABTestingSection = () => (
    <Card variant="elevated" className="ab-testing-section">
      <div className="card-header">
        <h3>Testes A/B de Personalização</h3>
        {abTestConfig && (
          <span className="test-status active">
            Teste Ativo: {abTestConfig.assignedStrategy}
          </span>
        )}
      </div>
      
      <div className="ab-test-content">
        {abTestConfig ? (
          <div className="active-test">
            <h4>Teste em Andamento</h4>
            <div className="test-details">
              <p><strong>ID do Teste:</strong> {abTestConfig.testId}</p>
              <p><strong>Estratégia:</strong> {abTestConfig.assignedStrategy}</p>
              <p><strong>Variante:</strong> {abTestConfig.testVariant}</p>
              <p><strong>Métricas:</strong> {abTestConfig.metrics.join(', ')}</p>
              <p><strong>Duração:</strong> {abTestConfig.duration} dias</p>
            </div>
          </div>
        ) : (
          <div className="test-setup">
            <h4>Otimização Experimental</h4>
            <p>
              Participe de testes A/B para ajudar a melhorar o sistema de personalização.
              Testamos diferentes estratégias de IA para encontrar a melhor experiência.
            </p>
            
            <FeatureHighlight
              variant="pulse"
              message="Novo! Teste estratégias avançadas de personalização"
              isVisible={!abTestConfig}
            />
            
            <Button
              variant="primary"
              onClick={handleSetupABTest}
              startIcon="🧪"
            >
              Participar de Teste A/B
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
  
  const renderNavigationTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Visão Geral', icon: '📊' },
      { id: 'preferences', label: 'Preferências', icon: '⚙️' },
      { id: 'insights', label: 'Insights', icon: '🔍' },
      { id: 'testing', label: 'A/B Testing', icon: '🧪' }
    ];
    
    return (
      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeSection === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSection(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="personalization-dashboard">
      {/* Navigation Tabs */}
      {renderNavigationTabs()}
      
      {/* Content Sections */}
      <div className="dashboard-content">
        {activeSection === 'overview' && (
          <div className="overview-section">
            {renderLearningProgress()}
            {recommendations && (
              <Card variant="elevated" className="current-recommendations">
                <h3>Recomendações Atuais</h3>
                <div className="recommendations-grid">
                  {recommendations.personalizedContent?.suggestedCategories?.map((category, index) => (
                    <div key={index} className="recommendation-tag">
                      {category}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
        
        {activeSection === 'preferences' && renderPreferencesSettings()}
        {activeSection === 'insights' && renderInsightsAnalysis()}
        {activeSection === 'testing' && renderABTestingSection()}
      </div>
    </div>
  );
};

export default PersonalizationDashboard; 