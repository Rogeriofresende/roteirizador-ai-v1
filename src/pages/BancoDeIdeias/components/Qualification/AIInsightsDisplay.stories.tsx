import type { Meta, StoryObj } from '@storybook/react';
import { AIInsightsDisplay } from './AIInsightsDisplay';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof AIInsightsDisplay> = {
  title: 'Banco de Ideias V2/Qualification/AIInsightsDisplay',
  component: AIInsightsDisplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## ✨ AIInsightsDisplay Wireframe

**Terceira tela da qualificação** - Apresenta os resultados da análise de forma visual e convincente.

### ✨ Funcionalidades:
- **Perfil identificado** com confiança da IA
- **Estatísticas visuais** (posts analisados, engagement, etc.)
- **Temas principais** descobertos
- **Insights categorizados** (oportunidades, forças, melhorias)
- **Indicador de confiança** da análise
- **CTA claro** para prosseguir ou ajustar

### 🔄 Fluxo:
1. Recebe análise do AIAnalysisLoading
2. Apresenta insights de forma visual
3. Usuário confirma ou ajusta análise
4. Próximo: ConversationalChat

### 🎨 Design Features:
- **Cards organizados** por tipo de informação
- **Color coding** para tipos de insight
- **Interactive insights** (clicáveis para detalhes)
- **Confidence score** prominent
- **Stats cards** com números grandes
- **Badge system** para temas e hashtags

### 📊 Tipos de Insight:
- **Oportunidades** (amarelo) - Gaps identificados
- **Forças** (verde) - O que já funciona bem
- **Melhorias** (azul) - Ajustes recomendados
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Estado de loading'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Análise alta confiança - perfil bem estabelecido
export const HighConfidenceAnalysis: Story = {
  args: {
    analysis: {
      profile: {
        niche: 'Direito Empresarial',
        tone: 'Formal e Educativo',
        audience: 'Empresários e Empreendedores',
        topics: ['Sociedades', 'Contratos', 'Compliance', 'Direito Digital', 'Tributário'],
        postFrequency: '3-4 posts por semana',
        bestPerformingContent: 'Posts sobre casos práticos'
      },
      insights: [
        {
          type: 'opportunity',
          title: 'Oportunidade em Direito Digital',
          description: 'Poucos advogados na sua região abordam LGPD e contratos digitais. Grande demanda identificada.',
          impact: 'high'
        },
        {
          type: 'strength',
          title: 'Excelente Engajamento Educativo',
          description: 'Seus posts explicativos geram 40% mais engagement que conteúdo promocional.',
          impact: 'high'
        },
        {
          type: 'improvement',
          title: 'Humanizar Tom de Voz',
          description: 'Adicionar mais elementos pessoais pode aumentar conexão com audiência.',
          impact: 'medium'
        }
      ],
      confidence: 87,
      stats: {
        postsAnalyzed: 24,
        engagementAverage: '3.2%',
        topHashtags: ['#direitoempresarial', '#advocaciadigital', '#compliance'],
        peakTimes: ['09:00', '14:00', '19:00']
      }
    },
    onProceed: action('onProceed'),
    onRefineAnalysis: action('onRefineAnalysis'),
    loading: false
  }
};

// Análise média confiança - perfil em desenvolvimento
export const MediumConfidenceAnalysis: Story = {
  args: {
    analysis: {
      profile: {
        niche: 'Consultoria de Produtividade',
        tone: 'Motivacional e Prático',
        audience: 'Profissionais Liberais',
        topics: ['Produtividade', 'Organização', 'Mindset', 'Ferramentas'],
        postFrequency: '2-3 posts por semana',
        bestPerformingContent: 'Dicas rápidas em stories'
      },
      insights: [
        {
          type: 'opportunity',
          title: 'Explorar Conteúdo Longo',
          description: 'Sua audiência responde bem a dicas, mas carouseis educativos podem gerar mais autoridade.',
          impact: 'medium'
        },
        {
          type: 'improvement',
          title: 'Definir Nicho Específico',
          description: 'Focar em um público mais específico pode aumentar relevância e conversão.',
          impact: 'high'
        },
        {
          type: 'strength',
          title: 'Boa Frequência de Postagem',
          description: 'Mantém presença consistente sem sobrecarregar audiência.',
          impact: 'low'
        }
      ],
      confidence: 64,
      stats: {
        postsAnalyzed: 18,
        engagementAverage: '2.1%',
        topHashtags: ['#produtividade', '#organizacao', '#foco'],
        peakTimes: ['07:00', '12:00', '18:00']
      }
    },
    onProceed: action('onProceed'),
    onRefineAnalysis: action('onRefineAnalysis'),
    loading: false
  }
};

// Análise baixa confiança - perfil novo/limitado
export const LowConfidenceAnalysis: Story = {
  args: {
    analysis: {
      profile: {
        niche: 'Coaching de Carreira',
        tone: 'Inspiracional',
        audience: 'Jovens Profissionais',
        topics: ['Carreira', 'Networking', 'Desenvolvimento'],
        postFrequency: '1-2 posts por semana',
        bestPerformingContent: 'Posts motivacionais'
      },
      insights: [
        {
          type: 'improvement',
          title: 'Aumentar Frequência de Posts',
          description: 'Postar mais regularmente pode melhorar alcance e engajamento.',
          impact: 'high'
        },
        {
          type: 'opportunity',
          title: 'Explorar Conteúdo Educativo',
          description: 'Balancear inspiração com conteúdo prático pode atrair mais seguidores.',
          impact: 'medium'
        }
      ],
      confidence: 42,
      stats: {
        postsAnalyzed: 8,
        engagementAverage: '1.8%',
        topHashtags: ['#carreira', '#motivacao'],
        peakTimes: ['08:00', '20:00']
      }
    },
    onProceed: action('onProceed'),
    onRefineAnalysis: action('onRefineAnalysis'),
    loading: false
  }
};

// Estado loading - processando confirmação
export const Loading: Story = {
  args: {
    analysis: {
      profile: {
        niche: 'Marketing Digital',
        tone: 'Descontraído e Técnico',
        audience: 'Empreendedores Digitais',
        topics: ['SEO', 'Ads', 'Analytics', 'Growth'],
        postFrequency: '5-6 posts por semana',
        bestPerformingContent: 'Tutoriais práticos'
      },
      insights: [
        {
          type: 'strength',
          title: 'Excelente Produção de Conteúdo',
          description: 'Alta frequência mantém audiência engajada.',
          impact: 'high'
        }
      ],
      confidence: 91,
      stats: {
        postsAnalyzed: 32,
        engagementAverage: '4.7%',
        topHashtags: ['#marketingdigital', '#seo', '#ads'],
        peakTimes: ['09:00', '15:00', '21:00']
      }
    },
    onProceed: action('onProceed'),
    onRefineAnalysis: action('onRefineAnalysis'),
    loading: true
  }
};

// Mobile responsivo
export const Mobile: Story = {
  args: {
    analysis: {
      profile: {
        niche: 'Nutrição Esportiva',
        tone: 'Científico e Acessível',
        audience: 'Atletas e Praticantes',
        topics: ['Suplementação', 'Dieta', 'Performance', 'Receitas'],
        postFrequency: '4-5 posts por semana',
        bestPerformingContent: 'Receitas práticas'
      },
      insights: [
        {
          type: 'opportunity',
          title: 'Vídeos de Preparo',
          description: 'Receitas em vídeo podem aumentar engagement significativamente.',
          impact: 'high'
        },
        {
          type: 'strength',
          title: 'Conteúdo Científico Sólido',
          description: 'Base científica gera confiança e autoridade.',
          impact: 'high'
        }
      ],
      confidence: 78,
      stats: {
        postsAnalyzed: 21,
        engagementAverage: '3.8%',
        topHashtags: ['#nutricao', '#esportes', '#receitas'],
        peakTimes: ['06:00', '12:00', '19:00']
      }
    },
    onProceed: action('onProceed'),
    onRefineAnalysis: action('onRefineAnalysis'),
    loading: false
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

// Expert user - análise muito detalhada
export const ExpertUserAnalysis: Story = {
  args: {
    analysis: {
      profile: {
        niche: 'Tecnologia e Inovação',
        tone: 'Técnico e Visionário',
        audience: 'CTOs e Tech Leaders',
        topics: ['IA', 'Cloud', 'DevOps', 'Arquitetura', 'Liderança Tech', 'Startups'],
        postFrequency: 'Diário',
        bestPerformingContent: 'Análises de mercado'
      },
      insights: [
        {
          type: 'strength',
          title: 'Autoridade Reconhecida',
          description: 'Alto engajamento de líderes tech e menções por influencers.',
          impact: 'high'
        },
        {
          type: 'opportunity',
          title: 'Monetização de Conhecimento',
          description: 'Potencial para consultoria premium e cursos especializados.',
          impact: 'high'
        },
        {
          type: 'improvement',
          title: 'Cross-platform Strategy',
          description: 'Adaptar conteúdo para diferentes redes pode ampliar alcance.',
          impact: 'medium'
        },
        {
          type: 'opportunity',
          title: 'Thought Leadership Global',
          description: 'Conteúdo em inglês pode abrir mercados internacionais.',
          impact: 'high'
        }
      ],
      confidence: 94,
      stats: {
        postsAnalyzed: 45,
        engagementAverage: '6.2%',
        topHashtags: ['#tech', '#ai', '#leadership', '#innovation', '#startups'],
        peakTimes: ['08:00', '14:00', '20:00']
      }
    },
    onProceed: action('onProceed'),
    onRefineAnalysis: action('onRefineAnalysis'),
    loading: false
  }
}; 