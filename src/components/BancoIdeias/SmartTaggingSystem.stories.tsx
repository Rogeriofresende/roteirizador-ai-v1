/**
 * 📚 SMART TAGGING SYSTEM STORIES V9.0
 * 
 * Storybook stories para demonstrar o Sistema de Tags Inteligentes
 * Showcases de todos os modos e funcionalidades
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @feature Sistema de Tags Inteligentes
 * @author IA Delta - Quality Assurance + Performance
 */

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SmartTaggingSystem } from './SmartTaggingSystem';
import { SuggestedTag } from './TagSuggestionEngine';
import { TagMetrics } from './TagCloudVisualizer';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSelectedTags: SuggestedTag[] = [
  {
    id: 'drama-1',
    name: 'Drama',
    category: 'genero',
    confidence: 0.95,
    reasoning: 'Gênero identificado pelo tom emocional do conteúdo'
  },
  {
    id: 'familia-1',
    name: 'Família',
    category: 'tema',
    confidence: 0.88,
    reasoning: 'Tema central da narrativa baseado no contexto'
  },
  {
    id: 'jovem-1',
    name: 'Jovem Adulto',
    category: 'publico',
    confidence: 0.82,
    reasoning: 'Público-alvo inferido pelo estilo de linguagem'
  }
];

const mockExistingTags: TagMetrics[] = [
  {
    id: 'drama-tag',
    name: 'Drama',
    category: 'genero',
    count: 45,
    percentage: 18.2,
    trending: 'up',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    associatedIdeas: 23
  },
  {
    id: 'comedia-tag',
    name: 'Comédia',
    category: 'genero',
    count: 38,
    percentage: 15.4,
    trending: 'stable',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    associatedIdeas: 19
  },
  {
    id: 'romance-tag',
    name: 'Romance',
    category: 'genero',
    count: 32,
    percentage: 13.0,
    trending: 'up',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    associatedIdeas: 16
  },
  {
    id: 'familia-tag',
    name: 'Família',
    category: 'tema',
    count: 28,
    percentage: 11.3,
    trending: 'down',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    associatedIdeas: 14
  },
  {
    id: 'trabalho-tag',
    name: 'Trabalho',
    category: 'tema',
    count: 25,
    percentage: 10.1,
    trending: 'stable',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    associatedIdeas: 12
  },
  {
    id: 'amizade-tag',
    name: 'Amizade',
    category: 'tema',
    count: 22,
    percentage: 8.9,
    trending: 'up',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    associatedIdeas: 11
  },
  {
    id: 'jovem-tag',
    name: 'Jovem',
    category: 'publico',
    count: 20,
    percentage: 8.1,
    trending: 'stable',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    associatedIdeas: 10
  },
  {
    id: 'adulto-tag',
    name: 'Adulto',
    category: 'publico',
    count: 18,
    percentage: 7.3,
    trending: 'down',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
    associatedIdeas: 9
  }
];

// ============================================================================
// STORY CONFIGURATION
// ============================================================================

const meta: Meta<typeof SmartTaggingSystem> = {
  title: 'V9.0/BancoIdeias/SmartTaggingSystem',
  component: SmartTaggingSystem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# 🎯 Sistema de Tags Inteligentes V9.0

Sistema completo de tags inteligentes que integra IA para sugestões automáticas,
interface visual avançada e analytics de uso.

## 🚀 Recursos Principais

- **Sugestões IA**: Análise automática de texto com Gemini AI
- **Interface Smart**: Auto-complete, seleção visual e busca inteligente
- **Analytics**: Métricas de uso, tendências e popularidade
- **Modo Compacto**: Interface otimizada para formulários
- **Modo Completo**: Dashboard completo com todas as funcionalidades

## 🎨 Metodologia V9.0

Implementado seguindo a metodologia **V9.0 Natural Language First**:
- Natural Language Specification como ponto de partida
- Agentic Planning com 4 IAs especializadas
- Context-Engineered Development
- Template Processing automático
- Quality Gates integrados
        `
      }
    }
  },
  argTypes: {
    ideaText: {
      control: 'text',
      description: 'Texto da ideia para análise de IA'
    },
    mode: {
      control: 'select',
      options: ['compact', 'full'],
      description: 'Modo de exibição do sistema'
    },
    showAnalytics: {
      control: 'boolean',
      description: 'Mostrar seção de analytics'
    },
    maxTags: {
      control: { type: 'range', min: 5, max: 20, step: 1 },
      description: 'Limite máximo de tags'
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SmartTaggingSystem>;

// ============================================================================
// STORIES
// ============================================================================

export const Default: Story = {
  name: '🎯 Modo Padrão',
  args: {
    ideaText: 'Uma história emocionante sobre uma família que se reconecta durante uma viagem inesperada',
    selectedTags: [],
    onTagsChange: action('tags-changed'),
    mode: 'compact',
    showAnalytics: false,
    maxTags: 10
  }
};

export const WithSelectedTags: Story = {
  name: '🏷️ Com Tags Selecionadas',
  args: {
    ideaText: 'Um drama familiar que explora as complexidades dos relacionamentos modernos',
    selectedTags: mockSelectedTags,
    onTagsChange: action('tags-changed'),
    mode: 'compact',
    showAnalytics: false,
    maxTags: 10
  }
};

export const FullModeWithAnalytics: Story = {
  name: '📊 Modo Completo com Analytics',
  args: {
    ideaText: 'Uma comédia romântica sobre dois jovens que se conhecem em um aplicativo de relacionamento mas descobrem que são vizinhos',
    selectedTags: mockSelectedTags,
    onTagsChange: action('tags-changed'),
    existingTags: mockExistingTags,
    mode: 'full',
    showAnalytics: true,
    maxTags: 15
  }
};

export const EmptyState: Story = {
  name: '🆕 Estado Vazio',
  args: {
    ideaText: '',
    selectedTags: [],
    onTagsChange: action('tags-changed'),
    mode: 'compact',
    showAnalytics: false,
    maxTags: 10
  }
};

export const LongText: Story = {
  name: '📝 Texto Longo',
  args: {
    ideaText: `Uma épica história de ficção científica que se passa em um futuro distópico onde a humanidade foi forçada a viver em cidades subterrâneas após uma catástrofe ambiental. 
    
    A narrativa segue três protagonistas de diferentes gerações: Maya, uma jovem cientista que descobre evidências de que a superfície pode estar se recuperando; 
    Elias, um veterano de guerra que guarda segredos sobre o que realmente causou o desastre; e Zara, uma criança prodígio que desenvolve tecnologia para comunicação com possíveis sobreviventes na superfície.
    
    Temas centrais incluem esperança vs desesperança, sacrifício pessoal pelo bem comum, o poder da ciência e tecnologia, e a resiliência do espírito humano. 
    A história explora questões de sustentabilidade, responsabilidade ambiental e como as escolhas de uma geração afetam as próximas.`,
    selectedTags: [],
    onTagsChange: action('tags-changed'),
    mode: 'full',
    showAnalytics: true,
    maxTags: 12
  }
};

export const MaxTagsReached: Story = {
  name: '🚫 Limite de Tags Atingido',
  args: {
    ideaText: 'Uma história rica e complexa com múltiplos temas e elementos',
    selectedTags: [
      ...mockSelectedTags,
      {
        id: 'acao-1',
        name: 'Ação',
        category: 'genero',
        confidence: 0.75,
        reasoning: 'Elementos de aventura identificados'
      },
      {
        id: 'suspense-1',
        name: 'Suspense',
        category: 'genero',
        confidence: 0.70,
        reasoning: 'Tensão narrativa presente'
      }
    ],
    onTagsChange: action('tags-changed'),
    mode: 'compact',
    maxTags: 5
  }
};

export const InteractiveDemo: Story = {
  name: '🎮 Demo Interativo',
  args: {
    ideaText: 'Digite sua ideia aqui e veja a magia da IA acontecer...',
    selectedTags: [],
    onTagsChange: action('tags-changed'),
    existingTags: mockExistingTags,
    mode: 'full',
    showAnalytics: true,
    maxTags: 10
  },
  parameters: {
    docs: {
      description: {
        story: `
### 🎮 Como Usar Esta Demo

1. **Digite uma ideia** no campo de texto
2. **Aguarde as sugestões** aparecerem automaticamente  
3. **Clique nas tags** sugeridas para adicioná-las
4. **Explore as abas** para ver diferentes funcionalidades
5. **Teste o analytics** para ver métricas de uso

### 💡 Ideias para Testar

- "Uma comédia sobre amigos que abrem um food truck"
- "Drama psicológico sobre identidade e memória"  
- "Documentário sobre sustentabilidade urbana"
- "Romance juvenil em uma escola de arte"
        `
      }
    }
  }
};

// ============================================================================
// VARIATIONS FOR TESTING
// ============================================================================

export const DarkMode: Story = {
  name: '🌙 Modo Escuro',
  args: {
    ideaText: 'Uma história misteriosa que se desenrola durante a noite',
    selectedTags: mockSelectedTags,
    onTagsChange: action('tags-changed'),
    mode: 'full',
    showAnalytics: true,
    className: 'dark'
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

export const MobileView: Story = {
  name: '📱 Visualização Mobile',
  args: {
    ideaText: 'Uma aventura urbana para o público jovem',
    selectedTags: mockSelectedTags.slice(0, 2),
    onTagsChange: action('tags-changed'),
    mode: 'compact',
    maxTags: 8
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

export const PerformanceTest: Story = {
  name: '⚡ Teste de Performance',
  args: {
    ideaText: 'Sistema otimizado para alta performance',
    selectedTags: Array.from({ length: 10 }, (_, i) => ({
      id: `perf-${i}`,
      name: `Tag ${i + 1}`,
      category: 'tema' as const,
      confidence: Math.random(),
      reasoning: `Tag gerada para teste ${i + 1}`
    })),
    onTagsChange: action('tags-changed'),
    existingTags: Array.from({ length: 50 }, (_, i) => ({
      id: `existing-${i}`,
      name: `Popular Tag ${i + 1}`,
      category: 'tema',
      count: Math.floor(Math.random() * 100),
      percentage: Math.random() * 20,
      trending: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
      lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      associatedIdeas: Math.floor(Math.random() * 50)
    })),
    mode: 'full',
    showAnalytics: true,
    maxTags: 15
  }
};

// ============================================================================
// ACCESSIBILITY STORIES
// ============================================================================

export const AccessibilityFocused: Story = {
  name: '♿ Acessibilidade',
  args: {
    ideaText: 'História inclusiva para todos os públicos',
    selectedTags: mockSelectedTags,
    onTagsChange: action('tags-changed'),
    mode: 'full'
  },
  parameters: {
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: true
    },
    docs: {
      description: {
        story: `
### ♿ Recursos de Acessibilidade

- **Navegação por teclado** completa
- **Screen readers** suportados
- **Alto contraste** disponível
- **ARIA labels** implementados
- **Focus management** otimizado
        `
      }
    }
  }
};

// ============================================================================
// ERROR STATES
// ============================================================================

export const ErrorHandling: Story = {
  name: '⚠️ Tratamento de Erros',
  args: {
    ideaText: 'Texto que pode gerar erro na análise de IA',
    selectedTags: [],
    onTagsChange: action('tags-changed'),
    mode: 'compact'
  },
  parameters: {
    docs: {
      description: {
        story: `
### ⚠️ Cenários de Erro Tratados

- Falhas na API do Gemini AI
- Timeout de requisições
- Tags duplicadas
- Limite de caracteres excedido
- Conectividade instável
        `
      }
    }
  }
};