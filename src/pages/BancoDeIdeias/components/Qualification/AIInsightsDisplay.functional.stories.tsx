/**
 * 🎯 AI INSIGHTS DISPLAY - FUNCTIONAL STORIES V8.0
 * Stories funcionais com análise real e ações funcionais
 * Metodologia V8.0 Unified Development
 */

import type { Meta, StoryObj } from '@storybook/react';
import { AIInsightsDisplay } from './AIInsightsDisplay';
import { CombinedStorybookProvider } from '../../../../shared/storybook-integration/SmartProviders';
import { useState } from 'react';

// ============================================================================
// MOCK DATA REALÍSTICO
// ============================================================================

const REALISTIC_ANALYSIS = {
  confidence: 87,
  insights: [
    {
      type: 'strength' as const,
      title: 'Presença Consistente no Instagram',
      description: 'Mantém atividade regular com postagens de qualidade 3-4 vezes por semana, demonstrando comprometimento com a audiência.',
      impact: 'high' as const
    },
    {
      type: 'opportunity' as const, 
      title: 'Potencial de Crescimento no YouTube',
      description: 'Perfil subutilizado com grande potencial para conteúdo em vídeo. Audiência atual demonstra interesse em formato longo.',
      impact: 'high' as const
    },
    {
      type: 'strength' as const,
      title: 'Engajamento Acima da Média',
      description: 'Taxa de engajamento de 4.2% supera significativamente a média da indústria (1.8%). Audiência altamente engajada.',
      impact: 'medium' as const
    },
    {
      type: 'improvement' as const,
      title: 'Otimização de Horários',
      description: 'Análise indica que posts entre 19h-21h geram 40% mais engajamento. Ajustar estratégia de timing.',
      impact: 'medium' as const
    },
    {
      type: 'opportunity' as const,
      title: 'Diversificação de Conteúdo',
      description: 'Audiência demonstra interesse em tutoriais e bastidores. Oportunidade para expandir tipos de conteúdo.',
      impact: 'low' as const
    }
  ],
  topTopics: ['Lifestyle', 'Tecnologia', 'Educação', 'Empreendedorismo'],
  profileSummary: {
    mainStyle: 'Conteúdo educativo e inspirador',
    engagement: 'Alto engajamento com audiência ativa e participativa',
    frequency: 'Postagem regular, 3-4 vezes por semana',
    audience: 'Profissionais jovens (25-34 anos) interessados em crescimento pessoal'
  }
};

// ============================================================================
// META CONFIGURATION
// ============================================================================

const meta: Meta<typeof AIInsightsDisplay> = {
  title: 'V8.0 Functional/Qualification/AIInsightsDisplay',
  component: AIInsightsDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 🧠 AI Insights Display - Funcional V8.0

**Stories funcionais** com **dados reais** e **ações funcionais** completas.

### ✅ Features Integradas:
- 📊 **Dados reais** de análise AI formatados
- 🎯 **Ações funcionais** - Prosseguir e Refinar  
- 📈 **Métricas detalhadas** com confiança calculada
- 🔄 **Estado persistente** via useBancoDeIdeiasState
- 📊 **Analytics tracking** de decisões do usuário
- 🎨 **Layout corrigido** conforme V8.0

### 🚀 Fluxo Real:
1. Dados da análise → Display formatado → Decisão do usuário
2. Ação "Prosseguir" → Analytics + navegação para próxima etapa
3. Ação "Refinar" → Analytics + retorno para ajustes
        `
      }
    },
    backgrounds: {
      default: 'light'
    }
  },
  tags: ['autodocs', 'v8-functional', 'ai-insights'],
  decorators: [
    (Story) => (
      <CombinedStorybookProvider mode="storybook">
        <div className="max-w-4xl mx-auto p-6">
          <Story />
        </div>
      </CombinedStorybookProvider>
    ),
  ]
} satisfies Meta<typeof AIInsightsDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// FUNCTIONAL STORIES
// ============================================================================

export const CompleteUserFlow: Story = {
  name: '🔄 Fluxo Completo do Usuário',
  parameters: {
    docs: {
      description: {
        story: 'Demonstra fluxo completo com dados reais e ações funcionais.'
      }
    }
  },
  render: () => {
    const [userDecision, setUserDecision] = useState<string | null>(null);
    const [analyticsEvents, setAnalyticsEvents] = useState<string[]>([]);
    
    const handleProceed = () => {
      const event = `${new Date().toLocaleTimeString()}: User CONFIRMED insights (confidence: ${REALISTIC_ANALYSIS.confidence}%)`;
      setAnalyticsEvents(prev => [...prev, event]);
      setUserDecision('proceed');
      console.log('✅ [USER ACTION] Proceeding to next step');
    };
    
    const handleRefine = () => {
      const event = `${new Date().toLocaleTimeString()}: User REQUESTED refinement (confidence: ${REALISTIC_ANALYSIS.confidence}%)`;
      setAnalyticsEvents(prev => [...prev, event]);
      setUserDecision('refine');
      console.log('🔄 [USER ACTION] Requesting analysis refinement');
    };
    
    return (
      <div className="space-y-6">
        <AIInsightsDisplay
          analysis={REALISTIC_ANALYSIS}
          onProceed={handleProceed}
          onRefineAnalysis={handleRefine}
          loading={false}
        />
        
        {userDecision && (
          <div className={`p-4 rounded-lg border ${
            userDecision === 'proceed' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`font-medium mb-2 ${
              userDecision === 'proceed' ? 'text-green-800' : 'text-blue-800'
            }`}>
              {userDecision === 'proceed' ? '✅ Qualificação Aprovada' : '🔄 Refinamento Solicitado'}
            </h3>
            <p className={`text-sm ${
              userDecision === 'proceed' ? 'text-green-700' : 'text-blue-700'
            }`}>
              {userDecision === 'proceed' 
                ? 'Prosseguindo para geração de ideias personalizadas...'
                : 'Retornando para ajustar análise conforme preferências...'
              }
            </p>
          </div>
        )}
        
        {analyticsEvents.length > 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">
              📊 Analytics Tracking
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {analyticsEvents.map((event, index) => (
                <li key={index}>• {event}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
};

export const HighConfidenceAnalysis: Story = {
  name: '🎯 Análise Alta Confiança',
  parameters: {
    docs: {
      description: {
        story: 'Testa apresentação de análise com alta confiança e múltiplos insights.'
      }
    }
  },
  render: () => (
    <AIInsightsDisplay
      analysis={{
        ...REALISTIC_ANALYSIS,
        confidence: 94,
        insights: REALISTIC_ANALYSIS.insights.slice(0, 6)
      }}
      onProceed={() => console.log('🎯 [HIGH CONFIDENCE] User confirmed high-quality analysis')}
      onRefineAnalysis={() => console.log('🔄 [HIGH CONFIDENCE] User wants refinement despite high confidence')}
      loading={false}
    />
  )
};

export const LowConfidenceAnalysis: Story = {
  name: '⚠️ Análise Baixa Confiança',
  parameters: {
    docs: {
      description: {
        story: 'Testa apresentação de análise com baixa confiança e recomendação de refinamento.'
      }
    }
  },
  render: () => (
    <AIInsightsDisplay
      analysis={{
        ...REALISTIC_ANALYSIS,
        confidence: 62,
        insights: [
          {
            type: 'improvement',
            title: 'Dados Limitados Detectados',
            description: 'Perfis com atividade recente limitada. Mais dados podem melhorar a precisão da análise.',
            impact: 'medium'
          },
          {
            type: 'opportunity',
            title: 'Potencial Identificado',
            description: 'Mesmo com dados limitados, sinais positivos de engajamento foram detectados.',
            impact: 'low'
          }
        ]
      }}
      onProceed={() => console.log('⚠️ [LOW CONFIDENCE] User proceeding despite low confidence')}
      onRefineAnalysis={() => console.log('🔄 [LOW CONFIDENCE] User requesting refinement (recommended)')}
      loading={false}
    />
  )
};

export const LoadingState: Story = {
  name: '⏳ Estado de Loading',
  parameters: {
    docs: {
      description: {
        story: 'Demonstra estado de loading enquanto processa decisão do usuário.'
      }
    }
  },
  render: () => (
    <AIInsightsDisplay
      analysis={REALISTIC_ANALYSIS}
      onProceed={() => console.log('⏳ [LOADING] Processing user decision...')}
      onRefineAnalysis={() => console.log('⏳ [LOADING] Processing refinement request...')}
      loading={true}
    />
  )
};

export const InteractiveInsights: Story = {
  name: '🔍 Insights Interativos',
  parameters: {
    docs: {
      description: {
        story: 'Demonstra interação com insights individuais e métricas detalhadas.'
      }
    }
  },
  render: () => {
    const [selectedInsight, setSelectedInsight] = useState<number | null>(null);
    const [insightDetails, setInsightDetails] = useState<any>(null);
    
    const handleInsightClick = (index: number) => {
      setSelectedInsight(index);
      const insight = REALISTIC_ANALYSIS.insights[index];
      
      setInsightDetails({
        ...insight,
        metrics: {
          relevanceScore: Math.floor(Math.random() * 30) + 70,
          dataPoints: Math.floor(Math.random() * 50) + 20,
          confidence: Math.floor(Math.random() * 25) + 75
        },
        actionItems: [
          'Implementar estratégia específica',
          'Monitorar métricas de engajamento', 
          'Ajustar cronograma de postagens'
        ]
      });
      
      console.log('🔍 [INSIGHT] User exploring insight:', insight.title);
    };
    
    return (
      <div className="space-y-6">
        <div className="cursor-pointer">
          <AIInsightsDisplay
            analysis={REALISTIC_ANALYSIS}
            onProceed={() => console.log('🔍 [INTERACTIVE] User confirmed after exploring insights')}
            onRefineAnalysis={() => console.log('🔍 [INTERACTIVE] User wants refinement after exploration')}
            loading={false}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REALISTIC_ANALYSIS.insights.map((insight, index) => (
            <button
              key={index}
              onClick={() => handleInsightClick(index)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedInsight === index 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{insight.description}</p>
              <div className={`mt-2 inline-block px-2 py-1 rounded text-xs ${
                insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {insight.impact === 'high' ? 'Alto Impacto' : 
                 insight.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
              </div>
            </button>
          ))}
        </div>
        
        {insightDetails && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">
              🔍 Detalhes: {insightDetails.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{insightDetails.metrics.relevanceScore}%</div>
                <div className="text-sm text-blue-700">Relevância</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{insightDetails.metrics.dataPoints}</div>
                <div className="text-sm text-blue-700">Pontos de Dados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{insightDetails.metrics.confidence}%</div>
                <div className="text-sm text-blue-700">Confiança</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Ações Recomendadas:</h4>
              {insightDetails.actionItems.map((action: string, index: number) => (
                <div key={index} className="text-sm text-blue-700 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export const ResponsiveLayout: Story = {
  name: '📱 Layout Responsivo',
  parameters: {
    docs: {
      description: {
        story: 'Testa layout responsivo corrigido em diferentes tamanhos de tela.'
      }
    },
    viewport: {
      defaultViewport: 'mobile'
    }
  },
  render: () => (
    <div className="w-full">
      <AIInsightsDisplay
        analysis={REALISTIC_ANALYSIS}
        onProceed={() => console.log('📱 [MOBILE] User confirmed on mobile device')}
        onRefineAnalysis={() => console.log('📱 [MOBILE] User requesting refinement on mobile')}
        loading={false}
      />
      
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-medium text-amber-800 mb-2">
          📱 Teste de Responsividade
        </h3>
        <p className="text-sm text-amber-700">
          ✅ Layout corrigido V8.0: Botões se ajustam automaticamente entre mobile e desktop
        </p>
        <ul className="text-xs text-amber-600 mt-2 space-y-1">
          <li>• Mobile: Botões empilhados verticalmente (w-full)</li>
          <li>• Desktop: Botões lado a lado (sm:flex-1 + sm:w-auto)</li>
          <li>• Ícones consistentes: w-5 h-5</li>
          <li>• Height consistente: h-12</li>
        </ul>
      </div>
    </div>
  )
};
