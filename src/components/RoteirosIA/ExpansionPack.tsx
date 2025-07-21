/**
 * 🚀 ROTEIRAR AI EXPANSION PACK V9.0
 * 
 * Pack de expansão com templates avançados, colaboração e features premium
 * Implementa funcionalidades estendidas do sistema de roteiros IA
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback } from 'react';
import { 
  Star, 
  Users, 
  FileText, 
  Zap, 
  Crown, 
  Palette, 
  Mic, 
  Video,
  BookOpen,
  Brain,
  Sparkles,
  Lock
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ScriptConfig } from './ScriptGeneratorEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ExpansionFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'templates' | 'ai' | 'collaboration' | 'export' | 'analytics';
  premium: boolean;
  available: boolean;
}

interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Partial<ScriptConfig>;
  premium: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
}

interface ExpansionPackProps {
  isPremium?: boolean;
  onUpgrade?: () => void;
  onTemplateSelect?: (template: ScriptTemplate) => void;
  className?: string;
}

// ============================================================================
// EXPANSION FEATURES DATA
// ============================================================================

const EXPANSION_FEATURES: ExpansionFeature[] = [
  {
    id: 'ai-voice-analysis',
    name: 'Análise de Voz IA',
    description: 'Analisa tom, ritmo e emoção para otimizar diálogos automaticamente',
    icon: <Mic className="w-5 h-5" />,
    category: 'ai',
    premium: true,
    available: true
  },
  {
    id: 'collaborative-editing',
    name: 'Edição Colaborativa',
    description: 'Trabalhe em equipe com comentários, sugestões e revisões em tempo real',
    icon: <Users className="w-5 h-5" />,
    category: 'collaboration',
    premium: true,
    available: true
  },
  {
    id: 'advanced-templates',
    name: 'Templates Avançados',
    description: 'Biblioteca expandida com 50+ templates profissionais para diferentes nichos',
    icon: <FileText className="w-5 h-5" />,
    category: 'templates',
    premium: false,
    available: true
  },
  {
    id: 'style-transfer',
    name: 'Transferência de Estilo',
    description: 'Adapte o estilo de roteiristas famosos para seus próprios roteiros',
    icon: <Palette className="w-5 h-5" />,
    category: 'ai',
    premium: true,
    available: true
  },
  {
    id: 'video-storyboard',
    name: 'Storyboard Automático',
    description: 'Gera storyboards visuais automaticamente a partir do roteiro',
    icon: <Video className="w-5 h-5" />,
    category: 'ai',
    premium: true,
    available: false
  },
  {
    id: 'performance-analytics',
    name: 'Analytics Avançado',
    description: 'Métricas detalhadas de engajamento, tempo de atenção e eficácia',
    icon: <Brain className="w-5 h-5" />,
    category: 'analytics',
    premium: true,
    available: true
  }
];

const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'youtube-tutorial',
    name: 'Tutorial YouTube',
    description: 'Template otimizado para tutoriais educativos no YouTube',
    category: 'Educational',
    config: {
      genre: 'educational',
      audience: 'general',
      duration: 'medium',
      format: 'video',
      tone: 'casual'
    },
    premium: false,
    difficulty: 'beginner',
    estimatedTime: '15 min',
    features: ['Hook opening', 'Clear structure', 'Call-to-action']
  },
  {
    id: 'sales-presentation',
    name: 'Apresentação de Vendas',
    description: 'Roteiro persuasivo para pitches e apresentações comerciais',
    category: 'Business',
    config: {
      genre: 'educational',
      audience: 'adults',
      duration: 'medium',
      format: 'presentation',
      tone: 'formal'
    },
    premium: true,
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    features: ['Problem-solution framework', 'Social proof', 'Urgency tactics']
  },
  {
    id: 'podcast-interview',
    name: 'Entrevista Podcast',
    description: 'Estrutura para entrevistas envolventes com perguntas estratégicas',
    category: 'Interview',
    config: {
      genre: 'educational',
      audience: 'adults',
      duration: 'long',
      format: 'podcast',
      tone: 'casual'
    },
    premium: true,
    difficulty: 'advanced',
    estimatedTime: '40 min',
    features: ['Research framework', 'Follow-up questions', 'Emotional beats']
  },
  {
    id: 'social-media-series',
    name: 'Série Redes Sociais',
    description: 'Conteúdo seriado para Instagram, TikTok e outros formatos curtos',
    category: 'Social Media',
    config: {
      genre: 'comedy',
      audience: 'teens',
      duration: 'short',
      format: 'social-media',
      tone: 'humorous'
    },
    premium: false,
    difficulty: 'beginner',
    estimatedTime: '10 min',
    features: ['Viral potential', 'Platform optimization', 'Engagement hooks']
  },
  {
    id: 'documentary-narrative',
    name: 'Narrativa Documentário',
    description: 'Estrutura cinematográfica para documentários e histórias reais',
    category: 'Documentary',
    config: {
      genre: 'documentary',
      audience: 'adults',
      duration: 'long',
      format: 'video',
      tone: 'serious'
    },
    premium: true,
    difficulty: 'advanced',
    estimatedTime: '60 min',
    features: ['Character development', 'Conflict escalation', 'Resolution arc']
  },
  {
    id: 'comedy-sketch',
    name: 'Esquete de Comédia',
    description: 'Template para esquetes cômicos com timing e punchlines',
    category: 'Comedy',
    config: {
      genre: 'comedy',
      audience: 'general',
      duration: 'short',
      format: 'video',
      tone: 'humorous'
    },
    premium: false,
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    features: ['Setup-punchline structure', 'Character archetypes', 'Comic timing']
  }
];

// ============================================================================
// EXPANSION PACK COMPONENT
// ============================================================================

export const ExpansionPack: React.FC<ExpansionPackProps> = ({
  isPremium = false,
  onUpgrade,
  onTemplateSelect,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState<'features' | 'templates' | 'analytics'>('features');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleTemplateSelect = useCallback((template: ScriptTemplate) => {
    if (template.premium && !isPremium) {
      onUpgrade?.();
      return;
    }
    onTemplateSelect?.(template);
  }, [isPremium, onUpgrade, onTemplateSelect]);

  const handleFeatureUpgrade = useCallback(() => {
    onUpgrade?.();
  }, [onUpgrade]);

  // ============================================================================
  // RENDER METHODS
  // ============================================================================
  
  const renderFeaturesTab = () => {
    const categories = Array.from(new Set(EXPANSION_FEATURES.map(f => f.category)));
    
    return (
      <div className="space-y-6">
        {/* Feature Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Todas
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPANSION_FEATURES
            .filter(feature => selectedCategory === 'all' || feature.category === selectedCategory)
            .map(feature => (
              <Card key={feature.id} className={`p-4 ${feature.available ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      feature.category === 'ai' ? 'bg-purple-100' :
                      feature.category === 'collaboration' ? 'bg-blue-100' :
                      feature.category === 'templates' ? 'bg-green-100' :
                      feature.category === 'export' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{feature.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {feature.premium && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                        {!feature.available && (
                          <span className="text-xs text-gray-500">Em breve</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {feature.premium && !isPremium && feature.available && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                
                {feature.available && (
                  <Button
                    size="sm"
                    variant={feature.premium && !isPremium ? 'outline' : 'default'}
                    onClick={feature.premium && !isPremium ? handleFeatureUpgrade : undefined}
                    className="w-full"
                  >
                    {feature.premium && !isPremium ? 'Fazer Upgrade' : 'Ativar'}
                  </Button>
                )}
              </Card>
            ))}
        </div>
      </div>
    );
  };

  const renderTemplatesTab = () => {
    const categories = Array.from(new Set(SCRIPT_TEMPLATES.map(t => t.category)));
    
    return (
      <div className="space-y-6">
        {/* Template Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCRIPT_TEMPLATES
            .filter(template => selectedCategory === 'all' || template.category === selectedCategory)
            .map(template => (
              <Card key={template.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-800">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {template.difficulty}
                      </span>
                      {template.premium && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {template.premium && !isPremium && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Tempo estimado: {template.estimatedTime}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {template.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                    {template.features.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{template.features.length - 2} recursos
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant={template.premium && !isPremium ? 'outline' : 'default'}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full"
                >
                  {template.premium && !isPremium ? 'Fazer Upgrade' : 'Usar Template'}
                </Button>
              </Card>
            ))}
        </div>
      </div>
    );
  };

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Analytics IA Avançado</h3>
            <p className="text-sm text-gray-600">Insights profundos sobre performance dos seus roteiros</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-sm text-gray-600">Score de Engajamento</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">7.2min</div>
            <div className="text-sm text-gray-600">Tempo Médio de Atenção</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">Taxa de Conclusão</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Análise de Sentimento</span>
            <span className="text-sm font-medium text-green-600">Positivo (78%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Complexidade Linguística</span>
            <span className="text-sm font-medium text-blue-600">Intermediário</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Potencial Viral</span>
            <span className="text-sm font-medium text-purple-600">Alto (8.5/10)</span>
          </div>
        </div>

        {!isPremium && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Crown className="w-4 h-4" />
              <span className="font-medium">Recurso Premium</span>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Unlock analytics detalhado com insights de IA para otimizar seus roteiros.
            </p>
            <Button size="sm" onClick={handleFeatureUpgrade}>
              Fazer Upgrade
            </Button>
          </div>
        )}
      </Card>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Expansion Pack</h2>
            <p className="text-sm text-gray-600">
              Recursos avançados e templates profissionais
            </p>
          </div>
        </div>
        
        {!isPremium && (
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Premium
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'features' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('features')}
        >
          Recursos
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'templates' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'analytics' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'features' && renderFeaturesTab()}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </Card>
  );
};

export default ExpansionPack;