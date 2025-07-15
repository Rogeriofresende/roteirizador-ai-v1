import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';

const meta = {
  title: 'Design System/Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Card Component - V7.0 Enhanced

O componente Card oferece containers versáteis com diferentes níveis de elevação e estilos visuais, seguindo a metodologia V7.0 Enhanced.

## Features V7.0:
- **Glass-morphism backgrounds** com blur effects
- **Enhanced shadows** com profundidade visual
- **Interactive elevations** em hover
- **Brand-consistent borders** e cantos arredondados
- **Responsive design** para diferentes breakpoints

## Variantes Disponíveis:
- **default**: Card básico com sombra sutil
- **elevated**: Card com elevação maior
- **outlined**: Card com borda sem sombra
- **interactive**: Card interativo com animações

## Design Tokens Utilizados:
- Shadows: base, md, lg, glass effects
- BorderRadius: lg, xl para diferentes variantes
- Colors: background, border, neutral palette
- Spacing: padding consistente
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined', 'interactive'],
      description: 'Variação visual do card',
    },
    className: {
      control: 'text',
      description: 'Classes CSS adicionais',
    },
    isNewFeature: {
      control: 'boolean',
      description: 'Indica se é uma nova funcionalidade',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Cards
export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Card Padrão</h3>
        <p className="text-gray-600">
          Este é um card com estilo padrão, oferecendo uma sombra sutil e background limpo.
        </p>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Card Elevado</h3>
        <p className="text-gray-600">
          Card com maior elevação, criando destaque visual na interface.
        </p>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Card com Borda</h3>
        <p className="text-gray-600">
          Card com borda definida, sem sombra, ideal para layouts mais limpos.
        </p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Card Interativo</h3>
        <p className="text-gray-600 mb-4">
          Card interativo com animações de hover e feedback visual.
        </p>
        <Button variant="primary" size="sm">Clique Aqui</Button>
      </div>
    ),
  },
};

// Content Examples
export const IdeaCard: Story = {
  args: {
    variant: 'elevated',
    isNewFeature: true,
    children: (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">💡 Estratégia de Growth Hacking</h2>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Marketing</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Startups</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Descrição</h3>
          <p className="text-gray-600 text-sm">
            Desenvolva uma estratégia completa de growth hacking focada em aquisição de usuários 
            através de canais digitais otimizados e métricas de conversão.
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {['growth hacking', 'marketing digital', 'conversão', 'analytics'].map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="ghost" startIcon="👍" size="sm">Curtir</Button>
          <Button variant="ghost" startIcon="💾" size="sm">Salvar</Button>
          <Button variant="ghost" startIcon="📤" size="sm">Compartilhar</Button>
          <Button variant="primary" startIcon="🚀" size="sm">Implementar</Button>
        </div>
      </div>
    ),
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Exemplo de card usado para exibir ideias geradas, com todas as informações e ações disponíveis.',
      },
    },
  },
};

export const BudgetCard: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Orçamento & Tier</h3>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
            PREMIUM
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Uso Diário</span>
            <span>$0.0234 / $0.50</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '4.68%' }}></div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p>Ideias hoje: 15 disponíveis</p>
        </div>
        
        <Button variant="primary" size="sm" fullWidth>
          Upgrade para Pro
        </Button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card de status de orçamento e tier do usuário, mostrando uso atual e limites.',
      },
    },
  },
};

export const AnalyticsCard: Story = {
  args: {
    variant: 'default',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Analytics Resumo</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">127</div>
            <div className="text-sm text-gray-600">Ideias Geradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">89%</div>
            <div className="text-sm text-gray-600">Taxa Satisfação</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">23</div>
            <div className="text-sm text-gray-600">Implementadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">12</div>
            <div className="text-sm text-gray-600">Compartilhadas</div>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card de analytics mostrando métricas importantes de forma visual e organizada.',
      },
    },
  },
};

// Layout Examples
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      <Card variant="default">
        <div className="p-4">
          <h3 className="font-semibold">Card 1</h3>
          <p className="text-sm text-gray-600">Conteúdo do primeiro card</p>
        </div>
      </Card>
      <Card variant="elevated">
        <div className="p-4">
          <h3 className="font-semibold">Card 2</h3>
          <p className="text-sm text-gray-600">Conteúdo do segundo card</p>
        </div>
      </Card>
      <Card variant="outlined">
        <div className="p-4">
          <h3 className="font-semibold">Card 3</h3>
          <p className="text-sm text-gray-600">Conteúdo do terceiro card</p>
        </div>
      </Card>
      <Card variant="interactive">
        <div className="p-4">
          <h3 className="font-semibold">Card 4</h3>
          <p className="text-sm text-gray-600">Card interativo com hover</p>
        </div>
      </Card>
      <Card variant="default" isNewFeature>
        <div className="p-4">
          <h3 className="font-semibold">Card 5</h3>
          <p className="text-sm text-gray-600">Nova funcionalidade destacada</p>
        </div>
      </Card>
      <Card variant="elevated">
        <div className="p-4">
          <h3 className="font-semibold">Card 6</h3>
          <p className="text-sm text-gray-600">Último card do grid</p>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Exemplo de grid responsivo com diferentes variantes de cards.',
      },
    },
  },
};