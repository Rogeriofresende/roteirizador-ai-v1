/**
 * 🎨 CONTEXT-AWARE TEMPLATES - ROTEIRAR IA
 * 
 * Templates inteligentes baseados em contexto para componentes React
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Beta - Solution Architect + Frontend
 * @created 2025-07-19T13:00:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import { ProcessingContext } from '../types/naturalLanguageTypes';

// 🎯 TEMPLATE CONTEXT TYPES
export interface TemplateContext {
  type: 'component' | 'page' | 'feature' | 'service';
  category: 'banco-de-ideias' | 'geracao-roteiros' | 'timeline-editor' | 'pwa-features';
  device: 'mobile' | 'tablet' | 'desktop' | 'all';
  framework: 'react' | 'vue' | 'angular';
  styling: 'tailwind' | 'material-ui' | 'styled-components';
  complexity: 'simple' | 'medium' | 'complex';
  features: string[];
}

// 🎨 COMPONENT TEMPLATE INTERFACE
export interface ComponentTemplate {
  name: string;
  description: string;
  context: TemplateContext;
  template: string;
  props: Record<string, any>;
  dependencies: string[];
  tests: string;
  storybook: string;
}

// 🏗️ ROTEIRAR IA CONTEXT-AWARE TEMPLATES
export const ROTEIRAR_TEMPLATES: Record<string, ComponentTemplate> = {
  
  // 💡 BANCO DE IDEIAS TEMPLATES
  'banco-ideias-card': {
    name: 'IdeaCard',
    description: 'Card responsivo para exibir ideia de roteiro com tags inteligentes',
    context: {
      type: 'component',
      category: 'banco-de-ideias',
      device: 'all',
      framework: 'react',
      styling: 'tailwind',
      complexity: 'medium',
      features: ['tags', 'search', 'responsive', 'interactions']
    },
    template: `/**
 * 💡 IDEA CARD COMPONENT
 * 
 * Card responsivo para exibir ideias do Banco de Ideias
 * Context-aware para diferentes devices e interações
 * 
 * @generated V9.0_CONTEXT_AWARE_TEMPLATE
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Idea, Tag } from '../types/bancoIdeias';

interface IdeaCardProps {
  idea: Idea;
  onTagClick?: (tag: Tag) => void;
  onIdeaEdit?: (idea: Idea) => void;
  onIdeaDelete?: (ideaId: string) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onTagClick,
  onIdeaEdit,
  onIdeaDelete,
  compact = false,
  showActions = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={\`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                 \${compact ? 'p-4' : 'p-6'} \${className}\`}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className={\`font-semibold text-gray-900 
                       \${compact ? 'text-sm' : 'text-lg'}\`}>
          {idea.title}
        </h3>
        {showActions && (
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onIdeaEdit?.(idea)}
              className="text-gray-400 hover:text-blue-600"
            >
              ✏️
            </button>
            <button 
              onClick={() => onIdeaDelete?.(idea.id)}
              className="text-gray-400 hover:text-red-600"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className={\`text-gray-600 mb-4 
                    \${compact ? 'text-sm line-clamp-2' : 'text-base'}\`}>
        {isExpanded || compact ? idea.description : \`\${idea.description.slice(0, 150)}...\`}
        {!compact && idea.description.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 ml-2"
          >
            {isExpanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {idea.tags.slice(0, compact ? 3 : 6).map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagClick?.(tag)}
            className={\`px-3 py-1 rounded-full text-xs font-medium
                       bg-blue-100 text-blue-800 hover:bg-blue-200
                       transition-colors duration-150\`}
          >
            {tag.name}
          </button>
        ))}
        {idea.tags.length > (compact ? 3 : 6) && (
          <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
            +{idea.tags.length - (compact ? 3 : 6)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {new Date(idea.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center space-x-4">
          <span>⭐ {idea.rating}/5</span>
          <span>💡 {idea.category}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default IdeaCard;`,
    props: {
      idea: 'Idea',
      onTagClick: '(tag: Tag) => void',
      onIdeaEdit: '(idea: Idea) => void',
      onIdeaDelete: '(ideaId: string) => void',
      compact: 'boolean',
      showActions: 'boolean'
    },
    dependencies: ['framer-motion', 'tailwindcss'],
    tests: `import { render, screen, fireEvent } from '@testing-library/react';
import { IdeaCard } from './IdeaCard';
import { mockIdea } from '../mocks/bancoIdeias';

describe('IdeaCard', () => {
  it('renders idea information correctly', () => {
    render(<IdeaCard idea={mockIdea} />);
    
    expect(screen.getByText(mockIdea.title)).toBeInTheDocument();
    expect(screen.getByText(mockIdea.description)).toBeInTheDocument();
  });

  it('handles tag clicks', () => {
    const onTagClick = jest.fn();
    render(<IdeaCard idea={mockIdea} onTagClick={onTagClick} />);
    
    fireEvent.click(screen.getByText(mockIdea.tags[0].name));
    expect(onTagClick).toHaveBeenCalledWith(mockIdea.tags[0]);
  });

  it('renders in compact mode', () => {
    render(<IdeaCard idea={mockIdea} compact />);
    
    expect(screen.getByText(mockIdea.title)).toHaveClass('text-sm');
  });
});`,
    storybook: `export default {
  title: 'BancoIdeias/IdeaCard',
  component: IdeaCard,
  parameters: { layout: 'padded' }
};

export const Default = () => (
  <IdeaCard idea={mockIdea} />
);

export const Compact = () => (
  <IdeaCard idea={mockIdea} compact />
);

export const WithoutActions = () => (
  <IdeaCard idea={mockIdea} showActions={false} />
);`
  },

  // 🎬 GERAÇÃO DE ROTEIROS TEMPLATES
  'roteiro-generator-form': {
    name: 'RoteiroGeneratorForm',
    description: 'Formulário inteligente para geração de roteiros com IA',
    context: {
      type: 'component',
      category: 'geracao-roteiros',
      device: 'all',
      framework: 'react',
      styling: 'tailwind',
      complexity: 'complex',
      features: ['ai-integration', 'form-validation', 'real-time-preview', 'export']
    },
    template: `/**
 * 🎬 ROTEIRO GENERATOR FORM
 * 
 * Formulário context-aware para geração de roteiros com IA
 * Adaptável para diferentes devices e complexidades
 * 
 * @generated V9.0_CONTEXT_AWARE_TEMPLATE
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { roteirarAgenticEngine } from '../agents/roteirarAgents';

interface RoteiroGeneratorFormProps {
  onGenerate?: (roteiro: any) => void;
  initialData?: Partial<RoteiroParams>;
  mode?: 'simple' | 'advanced' | 'professional';
  className?: string;
}

interface RoteiroParams {
  genero: string;
  tema: string;
  personagens: string[];
  ambientacao: string;
  duracao: number;
  estilo: string;
  elementos: string[];
}

export const RoteiroGeneratorForm: React.FC<RoteiroGeneratorFormProps> = ({
  onGenerate,
  initialData,
  mode = 'simple',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [preview, setPreview] = useState<string>('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RoteiroParams>({
    defaultValues: initialData
  });

  const watchedFields = watch();

  // Real-time preview update
  useEffect(() => {
    if (mode === 'professional') {
      updatePreview();
    }
  }, [watchedFields]);

  const updatePreview = async () => {
    // Generate preview based on current form data
    setPreview(\`Roteiro: \${watchedFields.tema || 'Sem título'}
Gênero: \${watchedFields.genero || 'Não definido'}
Ambientação: \${watchedFields.ambientacao || 'Não definida'}\`);
  };

  const onSubmit = async (data: RoteiroParams) => {
    setIsGenerating(true);
    try {
      // Use agentic engine for roteiro generation
      const roteiro = await roteirarAgenticEngine.generateRoteiro(data);
      onGenerate?.(roteiro);
    } catch (error) {
      console.error('Erro na geração:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={\`bg-white rounded-lg shadow-lg \${className}\`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step Progress (Advanced/Professional modes) */}
        {mode !== 'simple' && (
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={\`flex items-center 
                \${step <= currentStep ? 'text-blue-600' : 'text-gray-400'}\`}>
                <div className={\`w-8 h-8 rounded-full border-2 flex items-center justify-center
                  \${step <= currentStep ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}\`}>
                  {step}
                </div>
                {step < 4 && <div className="flex-1 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select 
                    {...register('genero', { required: 'Gênero é obrigatório' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar gênero</option>
                    <option value="drama">Drama</option>
                    <option value="comedia">Comédia</option>
                    <option value="suspense">Suspense</option>
                    <option value="terror">Terror</option>
                    <option value="romance">Romance</option>
                    <option value="acao">Ação</option>
                  </select>
                  {errors.genero && (
                    <p className="text-red-500 text-sm mt-1">{errors.genero.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    {...register('duracao', { 
                      required: 'Duração é obrigatória',
                      min: { value: 1, message: 'Duração deve ser maior que 0' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="90"
                  />
                  {errors.duracao && (
                    <p className="text-red-500 text-sm mt-1">{errors.duracao.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema Principal
                </label>
                <input
                  type="text"
                  {...register('tema', { required: 'Tema é obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Superação pessoal, vingança, amor impossível..."
                />
                {errors.tema && (
                  <p className="text-red-500 text-sm mt-1">{errors.tema.message}</p>
                )}
              </div>

              {mode !== 'simple' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Próximo
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Additional steps for advanced/professional modes would go here */}
          
        </AnimatePresence>

        {/* Preview Panel (Professional mode) */}
        {mode === 'professional' && preview && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">{preview}</pre>
          </div>
        )}

        {/* Submit Button */}
        {(mode === 'simple' || currentStep === 4) && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {isGenerating ? 'Gerando...' : 'Gerar Roteiro'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RoteiroGeneratorForm;`,
    props: {
      onGenerate: '(roteiro: any) => void',
      initialData: 'Partial<RoteiroParams>',
      mode: "'simple' | 'advanced' | 'professional'",
    },
    dependencies: ['react-hook-form', 'framer-motion', 'tailwindcss'],
    tests: `// Tests would be implemented here`,
    storybook: `// Storybook stories would be implemented here`
  },

  // ⏰ TIMELINE EDITOR TEMPLATES  
  'timeline-editor': {
    name: 'TimelineEditor',
    description: 'Editor de timeline drag-and-drop para roteiros',
    context: {
      type: 'component',
      category: 'timeline-editor',
      device: 'desktop',
      framework: 'react',
      styling: 'tailwind',
      complexity: 'complex',
      features: ['drag-drop', 'real-time-collaboration', 'zoom', 'layers']
    },
    template: `// Timeline Editor template would be implemented here`,
    props: {},
    dependencies: ['react-dnd', 'framer-motion', 'tailwindcss'],
    tests: `// Tests would be implemented here`,
    storybook: `// Storybook stories would be implemented here`
  }
};

// 🎯 TEMPLATE GENERATOR ENGINE
export class ContextAwareTemplateEngine {
  
  // 🚀 GENERATE COMPONENT FROM CONTEXT
  generateComponent(
    templateId: string,
    customContext?: Partial<TemplateContext>,
    customProps?: Record<string, any>
  ): ComponentTemplate | null {
    const baseTemplate = ROTEIRAR_TEMPLATES[templateId];
    if (!baseTemplate) return null;

    // Merge custom context
    const mergedContext = { ...baseTemplate.context, ...customContext };
    
    // Adapt template based on context
    const adaptedTemplate = this.adaptTemplateToContext(baseTemplate, mergedContext);
    
    return {
      ...adaptedTemplate,
      context: mergedContext,
      props: { ...adaptedTemplate.props, ...customProps }
    };
  }

  // 🎨 ADAPT TEMPLATE TO CONTEXT
  private adaptTemplateToContext(
    template: ComponentTemplate,
    context: TemplateContext
  ): ComponentTemplate {
    let adaptedTemplate = { ...template };

    // Device-specific adaptations
    if (context.device === 'mobile') {
      adaptedTemplate = this.adaptForMobile(adaptedTemplate);
    } else if (context.device === 'tablet') {
      adaptedTemplate = this.adaptForTablet(adaptedTemplate);
    }

    // Complexity-specific adaptations
    if (context.complexity === 'simple') {
      adaptedTemplate = this.simplifyTemplate(adaptedTemplate);
    } else if (context.complexity === 'complex') {
      adaptedTemplate = this.enhanceTemplate(adaptedTemplate);
    }

    // Framework-specific adaptations
    if (context.framework !== 'react') {
      adaptedTemplate = this.adaptFramework(adaptedTemplate, context.framework);
    }

    return adaptedTemplate;
  }

  // 📱 MOBILE ADAPTATIONS
  private adaptForMobile(template: ComponentTemplate): ComponentTemplate {
    // Add mobile-specific optimizations
    return {
      ...template,
      template: template.template.replace(/md:grid-cols-2/g, 'grid-cols-1'),
      dependencies: [...template.dependencies, 'react-swipeable']
    };
  }

  // 📟 TABLET ADAPTATIONS  
  private adaptForTablet(template: ComponentTemplate): ComponentTemplate {
    return {
      ...template,
      template: template.template.replace(/md:grid-cols-2/g, 'md:grid-cols-1 lg:grid-cols-2')
    };
  }

  // 🔧 SIMPLIFY FOR SIMPLE COMPLEXITY
  private simplifyTemplate(template: ComponentTemplate): ComponentTemplate {
    return {
      ...template,
      template: template.template
        .replace(/framer-motion/g, '') // Remove animations
        .replace(/motion\./g, '') // Remove motion components
    };
  }

  // ⚡ ENHANCE FOR COMPLEX FEATURES
  private enhanceTemplate(template: ComponentTemplate): ComponentTemplate {
    return {
      ...template,
      dependencies: [...template.dependencies, 'react-virtual', 'use-debounce']
    };
  }

  // 🔄 FRAMEWORK ADAPTATIONS
  private adaptFramework(
    template: ComponentTemplate, 
    framework: string
  ): ComponentTemplate {
    // Framework-specific adaptations would be implemented here
    return template;
  }

  // 📋 LIST AVAILABLE TEMPLATES
  listTemplates(category?: string): ComponentTemplate[] {
    const templates = Object.values(ROTEIRAR_TEMPLATES);
    
    if (category) {
      return templates.filter(t => t.context.category === category);
    }
    
    return templates;
  }

  // 🔍 SEARCH TEMPLATES
  searchTemplates(query: string): ComponentTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    
    return Object.values(ROTEIRAR_TEMPLATES).filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.context.features.some(feature => 
        feature.toLowerCase().includes(lowercaseQuery)
      )
    );
  }
}

// 🚀 EXPORT SINGLETON INSTANCE
export const contextAwareTemplateEngine = new ContextAwareTemplateEngine();

export default contextAwareTemplateEngine;