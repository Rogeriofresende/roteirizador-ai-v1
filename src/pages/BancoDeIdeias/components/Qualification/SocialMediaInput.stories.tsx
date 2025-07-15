import type { Meta, StoryObj } from '@storybook/react';
import { SocialMediaInput } from './SocialMediaInput';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof SocialMediaInput> = {
  title: 'Banco de Ideias V2/Qualification/SocialMediaInput',
  component: SocialMediaInput,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 🎯 SocialMediaInput Wireframe

**Primeira tela da qualificação** - Captura as redes sociais do usuário para análise automática.

### ✨ Funcionalidades:
- **Validação em tempo real** dos perfis inseridos
- **Suporte a múltiplas redes** (Instagram, LinkedIn, Twitter, TikTok)
- **Estados visuais** (loading, sucesso, erro)
- **Fallback** para usuários sem redes sociais
- **Progress indicator** (Etapa 1/5)

### 🔄 Fluxo:
1. Usuário insere @username das redes
2. Sistema valida se perfil existe
3. Usuário clica "Analisar Perfis"
4. Próximo: AIAnalysisLoading

### 🎨 Design Features:
- **Card principal** com gradient header
- **Inputs com validação visual** (check/error icons)
- **Privacy notice** (apenas dados públicos)
- **CTA prominente** para análise
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Estado de loading durante análise'
    },
    validationErrors: {
      control: 'object',
      description: 'Erros de validação por plataforma'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Estado inicial - usuário ainda não preencheu nada
export const Default: Story = {
  args: {
    onAnalyze: action('onAnalyze'),
    onSkip: action('onSkip'),
    loading: false
  }
};

// Estado loading - IA analisando perfis
export const Loading: Story = {
  args: {
    onAnalyze: action('onAnalyze'),
    onSkip: action('onSkip'),
    loading: true
  }
};

// Estado com erros de validação
export const WithValidationErrors: Story = {
  args: {
    onAnalyze: action('onAnalyze'),
    onSkip: action('onSkip'),
    loading: false,
    validationErrors: {
      instagram: 'Perfil não encontrado ou privado',
      linkedin: 'URL inválida do LinkedIn'
    }
  }
};

// Demonstração do fluxo completo - perfis válidos
export const ValidProfiles: Story = {
  args: {
    onAnalyze: action('onAnalyze'),
    onSkip: action('onSkip'),
    loading: false
  },
  play: async ({ canvasElement }) => {
    // Simular usuário preenchendo campos
    // Para demonstração, assumimos que a validação é automática
  }
};

// Cenário mobile - responsivo
export const Mobile: Story = {
  args: {
    onAnalyze: action('onAnalyze'),
    onSkip: action('onSkip'),
    loading: false
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

// Estado de usuário expert - todos os perfis preenchidos
export const ExpertUser: Story = {
  args: {
    onAnalyze: action('onAnalyze'),
    onSkip: action('onSkip'),
    loading: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Usuário power user que tem presença em todas as redes sociais principais.'
      }
    }
  }
};

// Variante para usuário iniciante - apenas uma rede
export const BeginnerUser: Story = {
  args: {
    onAnalyze: action('onAnalyze'),
    onSkip: action('onSkip'),
    loading: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Usuário iniciante que só tem perfil no Instagram ou LinkedIn.'
      }
    }
  }
}; 