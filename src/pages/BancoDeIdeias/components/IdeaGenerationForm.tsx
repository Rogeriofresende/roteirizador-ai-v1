/**
 * 🧠 BANCO DE IDEIAS - FORMULÁRIO PROFISSIONAL V8.0
 * Professional idea generation form with wizard steps and optimized UX
 * Following V8.0 Unified Development methodology - Frontend Phase
 */

import React, { useState, useEffect } from 'react';
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
  TrendingUp
} from 'lucide-react';

import { IdeaFormData, FormChangeHandler } from '../types';
import { 
  CATEGORY_OPTIONS, 
  STYLE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS, 
  CONTENT_TYPE_OPTIONS 
} from '../constants';

// ============================================================================
// FORM PROPS
// ============================================================================

interface IdeaGenerationFormProps {
  formData: IdeaFormData;
  onFormChange: FormChangeHandler;
  onGenerateIdea: () => void;
  isGenerating: boolean;
  className?: string;
}

// ============================================================================
// FORM STEPS
// ============================================================================

const FORM_STEPS = [
  {
    id: 1,
    title: 'Categoria & Estilo',
    description: 'Defina o foco do seu conteúdo',
    icon: Target
  },
  {
    id: 2,
    title: 'Público & Formato',
    description: 'Escolha audiência e tipo de conteúdo',
    icon: TrendingUp
  },
  {
    id: 3,
    title: 'Palavras-chave',
    description: 'Adicione termos relevantes',
    icon: Hash
  }
];

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export const IdeaGenerationForm: React.FC<IdeaGenerationFormProps> = ({
  formData,
  onFormChange,
  onGenerateIdea,
  isGenerating,
  className = ''
}) => {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // ============================================================================
  // STEP VALIDATION
  // ============================================================================
  
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.category && formData.style);
      case 2:
        return !!(formData.targetAudience && formData.contentType);
      case 3:
        return formData.keywords.length > 0 || formData.keywordsInput.trim().length > 0;
      default:
        return false;
    }
  };
  
  useEffect(() => {
    const completed = FORM_STEPS
      .map(step => step.id)
      .filter(stepId => validateStep(stepId));
    setCompletedSteps(completed);
  }, [formData]);
  
  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================
  
  const handleNextStep = () => {
    if (currentStep < FORM_STEPS.length && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };
  
  // ============================================================================
  // KEYWORDS PROCESSING
  // ============================================================================
  
  const handleKeywordsChange = (value: string) => {
    onFormChange('keywordsInput', value);
    
    // Auto-convert to keywords array
    const keywords = value
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
    
    onFormChange('keywords', keywords);
  };
  
  // ============================================================================
  // STEP PROGRESS INDICATOR
  // ============================================================================
  
  const renderStepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {FORM_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const IconComponent = step.icon;
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(step.id)}
                className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                  ${isActive 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-400'
                  }
                  hover:scale-105 cursor-pointer
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <IconComponent className="w-6 h-6" />
                )}
              </button>
              
              {index < FORM_STEPS.length - 1 && (
                <div className={`
                  w-16 h-1 mx-4
                  ${completedSteps.includes(step.id) ? 'bg-green-300' : 'bg-neutral-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">
          {FORM_STEPS[currentStep - 1].title}
        </h3>
        <p className="text-sm text-neutral-600">
          {FORM_STEPS[currentStep - 1].description}
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedSteps.length / FORM_STEPS.length) * 100}%` }}
        />
      </div>
      
      <div className="mt-2 text-center text-sm text-neutral-500">
        Passo {currentStep} de {FORM_STEPS.length} • {completedSteps.length} de {FORM_STEPS.length} concluídos
      </div>
    </div>
  );
  
  // ============================================================================
  // STEP 1: CATEGORY & STYLE
  // ============================================================================
  
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
            Defina o tom e abordagem do conteúdo
          </p>
        </div>
      </div>
      
      {/* Smart Suggestions */}
      {formData.category && (
        <Layout.Card variant="outlined" padding="md" className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Sugestões Inteligentes
              </h4>
              <p className="text-sm text-blue-700">
                {formData.category === 'Marketing & Growth' && 
                  'Foque em métricas, ROI e crescimento sustentável para seu público.'}
                {formData.category === 'Tecnologia' && 
                  'Explore tendências tech, ferramentas e soluções inovadoras.'}
                {formData.category === 'Educação' && 
                  'Priorize clareza, didática e aplicação prática do conhecimento.'}
                {formData.category === 'Entretenimento' && 
                  'Busque engajamento, storytelling e conexão emocional.'}
                {formData.category === 'Negócios' && 
                  'Enfatize estratégia, liderança e resultados mensuráveis.'}
                {formData.category === 'Lifestyle' && 
                  'Combine inspiração pessoal com dicas práticas e autênticas.'}
              </p>
            </div>
          </div>
        </Layout.Card>
      )}
    </div>
  );
  
  // ============================================================================
  // STEP 2: AUDIENCE & CONTENT TYPE
  // ============================================================================
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            <TrendingUp className="w-4 h-4 inline mr-2" />
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
            Quem é o público principal do conteúdo?
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            <Lightbulb className="w-4 h-4 inline mr-2" />
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
            Em que formato será o conteúdo?
          </p>
        </div>
      </div>
      
      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Nível de Complexidade
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'beginner', label: 'Iniciante', desc: 'Conceitos básicos' },
            { value: 'intermediate', label: 'Intermediário', desc: 'Aplicação prática' },
            { value: 'advanced', label: 'Avançado', desc: 'Estratégias complexas' }
          ].map((level) => (
            <button
              key={level.value}
              onClick={() => onFormChange('difficulty', level.value as any)}
              className={`
                p-4 border-2 rounded-lg text-left transition-all
                ${formData.difficulty === level.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
                }
              `}
            >
              <div className="font-medium text-sm">{level.label}</div>
              <div className="text-xs text-neutral-600 mt-1">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  // ============================================================================
  // STEP 3: KEYWORDS
  // ============================================================================
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          <Hash className="w-4 h-4 inline mr-2" />
          Palavras-chave Relevantes
        </label>
        <Input
          value={formData.keywordsInput}
          onChange={(e) => handleKeywordsChange(e.target.value)}
          placeholder="Ex: marketing digital, redes sociais, conversão, startups..."
          className="w-full"
          rows={3}
        />
        <p className="mt-2 text-xs text-neutral-500">
          Digite palavras-chave separadas por vírgula. Isso ajudará a gerar ideias mais precisas.
        </p>
      </div>
      
      {/* Keywords Preview */}
      {formData.keywords.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Palavras-chave Identificadas ({formData.keywords.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Final Summary */}
      <Layout.Card variant="outlined" padding="md" className="bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
        <h4 className="text-sm font-medium text-primary-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Resumo da Configuração
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Categoria:</span>
            <span className="font-medium">{formData.category || 'Não selecionada'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Estilo:</span>
            <span className="font-medium">{formData.style || 'Não selecionado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Público:</span>
            <span className="font-medium">{formData.targetAudience || 'Não selecionado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Formato:</span>
            <span className="font-medium">{formData.contentType || 'Não selecionado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Palavras-chave:</span>
            <span className="font-medium">{formData.keywords.length} termos</span>
          </div>
        </div>
      </Layout.Card>
    </div>
  );
  
  // ============================================================================
  // NAVIGATION CONTROLS
  // ============================================================================
  
  const renderNavigation = () => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === FORM_STEPS.length;
    const canProceed = validateStep(currentStep);
    const allStepsCompleted = completedSteps.length === FORM_STEPS.length;
    
    return (
      <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
        <Button
          variant="ghost"
          onClick={handlePrevStep}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        
        <div className="flex gap-3">
          {!isLastStep ? (
            <Button
              onClick={handleNextStep}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onGenerateIdea}
              disabled={isGenerating || !allStepsCompleted}
              size="lg"
              className="flex items-center gap-2 px-8"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Gerar Ideia
                  <Sparkles className="w-5 h-5" />
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
    <Layout.Card variant="elevated" padding="lg" className={`max-w-4xl mx-auto ${className}`}>
      {renderStepProgress()}
      
      <div className="min-h-[400px]">
        {renderCurrentStep()}
      </div>
      
      {renderNavigation()}
    </Layout.Card>
  );
};

export default IdeaGenerationForm; 