import type { Meta, StoryObj } from '@storybook/react';
import { AIAnalysisLoading } from './AIAnalysisLoading';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof AIAnalysisLoading> = {
  title: 'Banco de Ideias V2/Qualification/AIAnalysisLoading',
  component: AIAnalysisLoading,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 🤖 AIAnalysisLoading Wireframe

**Segunda tela da qualificação** - Loading inteligente que mantém o usuário engajado durante a análise.

### ✨ Funcionalidades:
- **Progress steps visuais** com status (pending/processing/completed)
- **Insights em tempo real** aparecem conforme análise progride
- **Countdown timer** mostra tempo restante
- **Feedback visual** dos perfis sendo analisados
- **Animations** para manter engajamento

### 🔄 Fluxo:
1. Recebe perfis do SocialMediaInput
2. Executa 5 steps de análise sequenciais
3. Mostra insights descobertos em tempo real
4. Ao completar → AIInsightsDisplay

### 🎨 Design Features:
- **Progress header** com % e tempo restante
- **Step-by-step visual** com ícones e status
- **Real-time insights card** com animações
- **Summary section** do que está acontecendo
- **Large progress indicator** central

### ⏱️ Timing:
- Total: ~30-45 segundos
- Step 1: 3s (Detectando)
- Step 2: 8s (Analisando Conteúdo) 
- Step 3: 6s (Identificando Nicho)
- Step 4: 7s (Analisando Audiência)
- Step 5: 6s (Gerando Estratégia)
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    estimatedTime: {
      control: { type: 'number', min: 15, max: 120 },
      description: 'Tempo estimado da análise em segundos'
    },
    profiles: {
      control: 'object',
      description: 'Array de perfis para analisar'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Cenário padrão - usuário com Instagram e LinkedIn
export const Default: Story = {
  args: {
    profiles: [
      { platform: 'Instagram', username: '@joaoadvogado' },
      { platform: 'LinkedIn', username: 'joao-silva-advogado' }
    ],
    onComplete: action('onComplete'),
    estimatedTime: 45
  }
};

// Usuário power user - múltiplas redes
export const PowerUser: Story = {
  args: {
    profiles: [
      { platform: 'Instagram', username: '@mariaempreendedora' },
      { platform: 'LinkedIn', username: 'maria-santos-ceo' },
      { platform: 'Twitter', username: '@maria_insights' },
      { platform: 'TikTok', username: '@maria_tips' }
    ],
    onComplete: action('onComplete'),
    estimatedTime: 60
  },
  parameters: {
    docs: {
      description: {
        story: 'Usuário com presença em múltiplas redes sociais - análise mais completa e demorada.'
      }
    }
  }
};

// Usuário iniciante - apenas uma rede
export const BeginnerUser: Story = {
  args: {
    profiles: [
      { platform: 'Instagram', username: '@pedro_consultor' }
    ],
    onComplete: action('onComplete'),
    estimatedTime: 30
  },
  parameters: {
    docs: {
      description: {
        story: 'Usuário com apenas uma rede social - análise mais rápida e focada.'
      }
    }
  }
};

// Análise rápida - perfil limitado
export const QuickAnalysis: Story = {
  args: {
    profiles: [
      { platform: 'LinkedIn', username: 'ana-coach-profissional' }
    ],
    onComplete: action('onComplete'),
    estimatedTime: 20
  },
  parameters: {
    docs: {
      description: {
        story: 'Análise acelerada para perfis com poucos dados ou perfis privados.'
      }
    }
  }
};

// Análise complexa - perfil robusto
export const ComplexAnalysis: Story = {
  args: {
    profiles: [
      { platform: 'Instagram', username: '@dr_ricardo_direito' },
      { platform: 'LinkedIn', username: 'ricardo-oliveira-advogado' },
      { platform: 'Twitter', username: '@dr_ricardo_law' }
    ],
    onComplete: action('onComplete'),
    estimatedTime: 75
  },
  parameters: {
    docs: {
      description: {
        story: 'Análise profunda para perfis com muito conteúdo e engagement complexo.'
      }
    }
  }
};

// Mobile responsivo
export const Mobile: Story = {
  args: {
    profiles: [
      { platform: 'Instagram', username: '@consultora_digital' },
      { platform: 'LinkedIn', username: 'lucia-martins-consultoria' }
    ],
    onComplete: action('onComplete'),
    estimatedTime: 40
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Versão otimizada para dispositivos móveis com layout responsivo.'
      }
    }
  }
};

// Demo com steps específicos (para testing)
export const StepByStepDemo: Story = {
  args: {
    profiles: [
      { platform: 'Instagram', username: '@exemplo_usuario' },
      { platform: 'LinkedIn', username: 'exemplo-perfil' }
    ],
    onComplete: action('onComplete'),
    estimatedTime: 35
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstração step-by-step para validar timing e UX de cada etapa da análise.'
      }
    }
  }
}; 