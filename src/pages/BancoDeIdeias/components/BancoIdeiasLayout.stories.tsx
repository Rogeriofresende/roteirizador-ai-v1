/**
 * 🧠 BANCO DE IDEIAS - LAYOUT STORIES V8.0
 * Storybook stories for BancoIdeiasLayout component
 * Following V8.0 Unified Development methodology - Frontend Phase
 */

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { BancoIdeiasLayout } from './BancoIdeiasLayout';
import { TabType } from '../types';

// ============================================================================
// MOCK DATA & HANDLERS
// ============================================================================

const mockTabChangeHandler = action('onTabChange');
const mockMobileMenuToggle = action('onMobileMenuToggle');

const sampleChildren = (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <h2 className="text-xl font-semibold mb-4">Conteúdo Principal</h2>
      <p className="text-neutral-600 mb-4">
        Este é o conteúdo principal que será exibido na área central do layout.
        O componente BancoIdeiasLayout fornece uma estrutura responsiva com:
      </p>
      <ul className="list-disc list-inside space-y-2 text-neutral-600">
        <li>Header fixo com navegação</li>
        <li>Menu responsivo para mobile</li>
        <li>Sidebar com estatísticas e atividades</li>
        <li>Área principal flexível para conteúdo</li>
        <li>Sistema de abas integrado</li>
      </ul>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
        <h3 className="font-medium text-primary-800 mb-2">Card de Exemplo 1</h3>
        <p className="text-primary-600 text-sm">Conteúdo de exemplo para testar o layout</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-800 mb-2">Card de Exemplo 2</h3>
        <p className="text-green-600 text-sm">Mais conteúdo para visualizar a responsividade</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">Card de Exemplo 3</h3>
        <p className="text-blue-600 text-sm">Testando diferentes variações de conteúdo</p>
      </div>
    </div>
  </div>
);

const customSidebarContent = (
  <div className="space-y-4">
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-medium text-yellow-800 mb-2">Conteúdo Personalizado</h4>
      <p className="text-yellow-600 text-sm">Este é um exemplo de conteúdo personalizado na sidebar.</p>
    </div>
  </div>
);

// ============================================================================
// STORYBOOK META
// ============================================================================

const meta: Meta<typeof BancoIdeiasLayout> = {
  title: 'Pages/BancoDeIdeias/BancoIdeiasLayout',
  component: BancoIdeiasLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# BancoIdeiasLayout

Layout principal do sistema Banco de Ideias com:

- **Header responsivo** com navegação por abas
- **Menu mobile** com overlay
- **Sidebar inteligente** com estatísticas e atividades
- **Área de conteúdo flexível**
- **Design system integrado** com componentes reutilizáveis

## Características

- ✅ **Responsivo**: Adaptado para desktop, tablet e mobile
- ✅ **Acessível**: Navegação por teclado e screen readers
- ✅ **Performance**: Otimizado para carregamento rápido
- ✅ **Manutenível**: Código modular e bem documentado
        `,
      },
    },
  },
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['generator', 'history', 'templates', 'export', 'performance', 'analytics', 'personalization'] as TabType[],
      description: 'Aba atualmente ativa na navegação',
    },
    onTabChange: {
      action: 'onTabChange',
      description: 'Callback executado quando uma aba é selecionada',
    },
    children: {
      control: false,
      description: 'Conteúdo principal a ser exibido na área central',
    },
    sidebarContent: {
      control: false,
      description: 'Conteúdo adicional para a sidebar (opcional)',
    },
    showMobileMenu: {
      control: 'boolean',
      description: 'Controla se o menu mobile está visível',
    },
    onMobileMenuToggle: {
      action: 'onMobileMenuToggle',
      description: 'Callback para alternar o menu mobile',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BancoIdeiasLayout>;

// ============================================================================
// STORIES
// ============================================================================

export const Default: Story = {
  args: {
    activeTab: 'generator',
    onTabChange: mockTabChangeHandler,
    children: sampleChildren,
    showMobileMenu: false,
    onMobileMenuToggle: mockMobileMenuToggle,
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout padrão com a aba "Gerador" ativa e conteúdo de exemplo.',
      },
    },
  },
};

export const HistoryTab: Story = {
  args: {
    ...Default.args,
    activeTab: 'history',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout com a aba "Histórico" ativa, mostrando como diferentes abas são destacadas.',
      },
    },
  },
};

export const TemplatesTab: Story = {
  args: {
    ...Default.args,
    activeTab: 'templates',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout com a aba "Templates" ativa.',
      },
    },
  },
};

export const WithCustomSidebar: Story = {
  args: {
    ...Default.args,
    sidebarContent: customSidebarContent,
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout com conteúdo personalizado adicional na sidebar.',
      },
    },
  },
};

export const MobileMenuOpen: Story = {
  args: {
    ...Default.args,
    showMobileMenu: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout com menu mobile aberto (simula visualização em dispositivos móveis).',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const PerformanceTab: Story = {
  args: {
    ...Default.args,
    activeTab: 'performance',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout com a aba "Performance" ativa, mostrando métricas e análises.',
      },
    },
  },
};

export const AnalyticsTab: Story = {
  args: {
    ...Default.args,
    activeTab: 'analytics',
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout com a aba "Analytics" ativa.',
      },
    },
  },
};

export const EmptyContent: Story = {
  args: {
    ...Default.args,
    children: (
      <div className="flex items-center justify-center h-96 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-600 mb-2">Nenhum conteúdo</h3>
          <p className="text-neutral-500">Este é um exemplo de estado vazio do layout.</p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout com estado vazio, útil para testes de UX quando não há dados.',
      },
    },
  },
};

// ============================================================================
// RESPONSIVE TESTING STORIES
// ============================================================================

export const TabletView: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Layout otimizado para visualização em tablets.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Layout responsivo para dispositivos móveis com navegação colapsada.',
      },
    },
  },
}; 