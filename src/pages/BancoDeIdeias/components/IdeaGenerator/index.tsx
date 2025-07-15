/**
 * 🧠 BANCO DE IDEIAS - IDEA GENERATOR V8.0
 * Main idea generator component extracted from monolithic BancoDeIdeias.tsx
 * Following V8.0 Unified Development methodology
 */

import React, { Suspense } from 'react';
import { Layout } from '../../../../design-system/components/Layout';
import { Button } from '../../../../design-system/components/Button';
import { Select } from '../../../../design-system/components/form/Select';
import { Input } from '../../../../design-system/components/Input';
import { Lightbulb, Sparkles, Zap, Target } from 'lucide-react';

import { IdeaGeneratorProps } from '../../types';
import { 
  CATEGORY_OPTIONS, 
  TARGET_AUDIENCE_OPTIONS, 
  CONTENT_TYPE_OPTIONS,
  SUCCESS_MESSAGES 
} from '../../constants';
import { LoadingStates } from '../shared/LoadingStates';
import ErrorBoundary from '../shared/ErrorBoundary';
import IdeaCard from '../shared/IdeaCard';

// ============================================================================
// IDEA GENERATOR COMPONENT
// ============================================================================

const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({
  formData,
  onFormChange,
  onGenerateIdea,
  isGenerating,
  currentIdea,
  onIdeaFeedback
}) => {
  
  // ============================================================================
  // FORM RENDERING
  // ============================================================================
  
  const renderFormSection = () => (
    <Layout.Card variant="elevated" padding="lg" className="mb-6">
      <Layout.Heading level={3} className="mb-6 flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-primary-600" />
        Gerador de Ideias
      </Layout.Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Categoria
          </label>
          <Select
            value={formData.category}
            onChange={(value) => onFormChange('category', value)}
            options={CATEGORY_OPTIONS}
          />
        </div>
        
        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Público-Alvo
          </label>
          <Select
            value={formData.targetAudience}
            onChange={(value) => onFormChange('targetAudience', value)}
            options={TARGET_AUDIENCE_OPTIONS}
          />
        </div>
        
        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tipo de Conteúdo
          </label>
          <Select
            value={formData.contentType}
            onChange={(value) => onFormChange('contentType', value)}
            options={CONTENT_TYPE_OPTIONS}
          />
        </div>
        
        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dificuldade
          </label>
          <Select
            value={formData.difficulty}
            onChange={(value) => onFormChange('difficulty', value)}
            options={[
              { value: 'beginner', label: 'Iniciante' },
              { value: 'intermediate', label: 'Intermediário' },
              { value: 'advanced', label: 'Avançado' }
            ]}
          />
        </div>
      </div>
      
      {/* Keywords */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Palavras-chave (separadas por vírgula)
        </label>
        <Input
          value={formData.keywordsInput}
          onChange={(e) => onFormChange('keywordsInput', e.target.value)}
          placeholder="Ex: marketing digital, redes sociais, conversão"
          className="w-full"
        />
      </div>
      
      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={onGenerateIdea}
          disabled={isGenerating}
          size="lg"
          className="w-full md:w-auto px-8 py-3 flex items-center gap-3"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Ideia
              <Zap className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </Layout.Card>
  );
  
  // ============================================================================
  // IDEA PREVIEW SECTION
  // ============================================================================
  
  const renderIdeaPreview = () => {
    if (!currentIdea) return null;
    
    return (
      <Layout.Card variant="elevated" padding="lg">
        <Layout.Heading level={3} className="mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-600" />
          Ideia Gerada
        </Layout.Heading>
        
        <IdeaCard
          idea={currentIdea}
          onFeedback={onIdeaFeedback}
          variant="detailed"
          showActions={true}
        />
      </Layout.Card>
    );
  };
  
  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (isGenerating) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          {renderFormSection()}
          <LoadingStates.IdeaGeneration 
            progress={85} 
            message="Gerando sua ideia personalizada..."
          />
        </div>
      </ErrorBoundary>
    );
  }
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {renderFormSection()}
        {renderIdeaPreview()}
        
        {/* Help Section */}
        <Layout.Card variant="outlined" padding="md" className="bg-primary-50 border-primary-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <Layout.Heading level={4} className="text-primary-800 mb-2">
                Dicas para melhores resultados
              </Layout.Heading>
              <Layout.Text variant="bodySmall" className="text-primary-700">
                • Seja específico nas palavras-chave<br />
                • Escolha o público-alvo correto<br />
                • Experimente diferentes categorias<br />
                • Use o feedback para melhorar as próximas ideias
              </Layout.Text>
            </div>
          </div>
        </Layout.Card>
      </div>
    </ErrorBoundary>
  );
};

export default IdeaGenerator; 