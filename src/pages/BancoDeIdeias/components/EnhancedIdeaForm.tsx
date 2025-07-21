/**
 * 🚀 ENHANCED IDEA FORM V9.0
 * 
 * Formulário melhorado do Banco de Ideias com Sistema de Tags Inteligentes
 * Integra o sistema V9.0 ao formulário existente V8.0
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature Sistema de Tags Inteligentes
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from '../../../design-system/components/Layout';
import { Button } from '../../../design-system/components/Button';
import { Select } from '../../../design-system/components/form/Select';
import { Input } from '../../../design-system/components/Input';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Lightbulb,
  Target,
  Hash,
  Zap,
  Brain,
  TrendingUp,
  Tags
} from 'lucide-react';

// V9.0 Components
import SmartTaggingSystem from '../../../components/BancoIdeias/SmartTaggingSystem';
import { SuggestedTag } from '../../../components/BancoIdeias/TagSuggestionEngine';

// V8.0 Legacy imports
import { IdeaFormData, FormChangeHandler } from '../types';
import { 
  CATEGORY_OPTIONS, 
  STYLE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS, 
  CONTENT_TYPE_OPTIONS 
} from '../constants';

// ============================================================================
// ENHANCED FORM PROPS
// ============================================================================

interface EnhancedIdeaFormProps {
  formData: IdeaFormData & { smartTags?: SuggestedTag[] };
  onFormChange: FormChangeHandler;
  onGenerateIdea: () => void;
  isGenerating: boolean;
  className?: string;
}

// ============================================================================
// ENHANCED FORM STEPS
// ============================================================================

const ENHANCED_FORM_STEPS = [
  {
    id: 1,
    title: 'Categoria & Estilo',
    description: 'Defina o foco e tom do conteúdo',
    icon: Target,
    fields: ['category', 'style']
  },
  {
    id: 2,
    title: 'Público & Formato',
    description: 'Escolha audiência e tipo de conteúdo',
    icon: Brain,
    fields: ['targetAudience', 'contentType']
  },
  {
    id: 3,
    title: 'Tags Inteligentes',
    description: 'Sistema V9.0 de categorização avançada',
    icon: Sparkles,
    fields: ['smartTags', 'context']
  }
];

// ============================================================================
// ENHANCED IDEA GENERATION FORM COMPONENT
// ============================================================================

export const EnhancedIdeaForm: React.FC<EnhancedIdeaFormProps> = ({
  formData,
  onFormChange,
  onGenerateIdea,
  isGenerating,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [currentStep, setCurrentStep] = useState(1);
  const [smartTags, setSmartTags] = useState<SuggestedTag[]>(formData.smartTags || []);
  const [ideaContext, setIdeaContext] = useState('');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const completedSteps = ENHANCED_FORM_STEPS.filter(step => 
    step.fields.every(field => {
      if (field === 'smartTags') return smartTags.length > 0;
      if (field === 'context') return ideaContext.trim().length > 0;
      return Boolean(formData[field as keyof IdeaFormData]);
    })
  );

  const isFormComplete = completedSteps.length === ENHANCED_FORM_STEPS.length;
  const canGenerateIdea = isFormComplete && smartTags.length > 0;

  // Gerar contexto dinâmico para IA baseado no formulário
  const generatedContext = React.useMemo(() => {
    const parts = [];
    
    if (formData.category) parts.push(`Categoria: ${formData.category}`);
    if (formData.style) parts.push(`Estilo: ${formData.style}`);
    if (formData.targetAudience) parts.push(`Público: ${formData.targetAudience}`);
    if (formData.contentType) parts.push(`Formato: ${formData.contentType}`);
    if (ideaContext.trim()) parts.push(`Contexto: ${ideaContext.trim()}`);
    
    return parts.join('. ');
  }, [formData, ideaContext]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleSmartTagsChange = useCallback((tags: SuggestedTag[]) => {
    setSmartTags(tags);
    
    // Convert tags to legacy keywords format for compatibility
    const keywords = tags.map(tag => tag.name);
    onFormChange('keywords', keywords);
    onFormChange('keywordsInput', keywords.join(', '));
  }, [onFormChange]);

  const handleStepNavigation = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStep < ENHANCED_FORM_STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleGenerateIdea = useCallback(() => {
    if (canGenerateIdea) {
      // Add smart tags data to the form before generation
      onFormChange('smartTags', smartTags);
      onFormChange('context', generatedContext);
      onGenerateIdea();
    }
  }, [canGenerateIdea, smartTags, generatedContext, onFormChange, onGenerateIdea]);

  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  const validateStep = useCallback((step: number) => {
    const stepData = ENHANCED_FORM_STEPS[step - 1];
    return stepData.fields.every(field => {
      if (field === 'smartTags') return smartTags.length > 0;
      if (field === 'context') return true; // Context is optional
      return Boolean(formData[field as keyof IdeaFormData]);
    });
  }, [formData, smartTags]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderStepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {ENHANCED_FORM_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                ${isCurrent 
                  ? 'border-primary-500 bg-primary-500 text-white' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-neutral-300 bg-white text-neutral-400'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              
              {index < ENHANCED_FORM_STEPS.length - 1 && (
                <div className={`
                  w-20 h-0.5 mx-2 transition-all duration-200
                  ${isCompleted ? 'bg-green-500' : 'bg-neutral-300'}
                `} />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-800">
          {ENHANCED_FORM_STEPS[currentStep - 1].title}
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          {ENHANCED_FORM_STEPS[currentStep - 1].description}
        </p>
      </div>
      
      <div className="mt-4 w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedSteps.length / ENHANCED_FORM_STEPS.length) * 100}%` }}
        />
      </div>
      
      <div className="mt-2 text-center text-sm text-neutral-500">
        Passo {currentStep} de {ENHANCED_FORM_STEPS.length} • {completedSteps.length} de {ENHANCED_FORM_STEPS.length} concluídos
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            <Target className="w-4 h-4 inline mr-2" />
            Categoria Principal
          </label>
          <Select
            value={formData.category}
            onChange={(value) => onFormChange('category', value)}
            options={CATEGORY_OPTIONS}
            placeholder="Selecione uma categoria..."
            className="w-full"
          />
          <p className="mt-2 text-xs text-neutral-500">
            Escolha a área de foco do seu conteúdo
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Estilo de Conteúdo
          </label>
          <Select
            value={formData.style}
            onChange={(value) => onFormChange('style', value)}
            options={STYLE_OPTIONS}
            placeholder="Selecione um estilo..."
            className="w-full"
          />
          <p className="mt-2 text-xs text-neutral-500">
            Define o tom e abordagem do conteúdo
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            <Brain className="w-4 h-4 inline mr-2" />
            Público-Alvo
          </label>
          <Select
            value={formData.targetAudience}
            onChange={(value) => onFormChange('targetAudience', value)}
            options={TARGET_AUDIENCE_OPTIONS}
            placeholder="Selecione o público..."
            className="w-full"
          />
          <p className="mt-2 text-xs text-neutral-500">
            Quem é o público principal do conteúdo
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            <Zap className="w-4 h-4 inline mr-2" />
            Tipo de Conteúdo
          </label>
          <Select
            value={formData.contentType}
            onChange={(value) => onFormChange('contentType', value)}
            options={CONTENT_TYPE_OPTIONS}
            placeholder="Selecione o formato..."
            className="w-full"
          />
          <p className="mt-2 text-xs text-neutral-500">
            Formato final do conteúdo
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Context Input */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          <Lightbulb className="w-4 h-4 inline mr-2" />
          Contexto Adicional (Opcional)
        </label>
        <textarea
          value={ideaContext}
          onChange={(e) => setIdeaContext(e.target.value)}
          placeholder="Descreva brevemente o que você tem em mente... Ex: quero algo sobre produtividade para freelancers que trabalham remotamente"
          className="w-full p-3 border border-neutral-300 rounded-lg resize-none"
          rows={3}
        />
        <p className="mt-2 text-xs text-neutral-500">
          Forneça contexto adicional para melhorar as sugestões de IA
        </p>
      </div>

      {/* Smart Tagging System V9.0 */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          <Tags className="w-4 h-4 inline mr-2" />
          Sistema de Tags Inteligentes V9.0
        </label>
        
        <SmartTaggingSystem
          ideaText={generatedContext}
          selectedTags={smartTags}
          onTagsChange={handleSmartTagsChange}
          mode="compact"
          showAnalytics={false}
          maxTags={8}
          className="border border-neutral-200 rounded-lg"
        />
        
        <p className="mt-2 text-xs text-neutral-500">
          Tags ajudam a categorizar e encontrar suas ideias mais facilmente
        </p>
      </div>

      {/* Enhanced Summary */}
      <Layout.Card variant="outlined" padding="md" className="bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
        <h4 className="text-sm font-medium text-primary-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Configuração V9.0 Completa
        </h4>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Categoria:</span>
                <span className="font-medium">{formData.category || 'Não selecionada'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Estilo:</span>
                <span className="font-medium">{formData.style || 'Não selecionado'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Público:</span>
                <span className="font-medium">{formData.targetAudience || 'Não selecionado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Formato:</span>
                <span className="font-medium">{formData.contentType || 'Não selecionado'}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Tags Inteligentes:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{smartTags.length} tags</span>
                <Sparkles className="w-3 h-3 text-purple-500" />
              </div>
            </div>
            {smartTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {smartTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout.Card>
    </div>
  );

  const renderNavigation = () => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === ENHANCED_FORM_STEPS.length;
    const canProceed = validateStep(currentStep);

    return (
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
        <Button
          variant="outline"
          onClick={() => handleStepNavigation('prev')}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-3">
          {!isLastStep ? (
            <Button
              variant="primary"
              onClick={() => handleStepNavigation('next')}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerateIdea}
              disabled={!canGenerateIdea || isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
            >
              {isGenerating ? (
                <>
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                  Gerando Ideias V9.0...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Ideias V9.0
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <Layout.Card variant="elevated" className={`p-8 ${className}`}>
      {renderStepProgress()}
      {renderCurrentStep()}
      {renderNavigation()}
    </Layout.Card>
  );
};

export default EnhancedIdeaForm;