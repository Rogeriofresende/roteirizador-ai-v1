import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { TabNavigation, TabItem } from './TabNavigation';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Database, 
  Bell,
  Heart,
  Star,
  Folder,
  Calendar,
  MessageSquare,
  Lightbulb,
  Zap,
  Target,
  Code,
  Image,
  Music
} from 'lucide-react';

// V7.5 Enhanced TabNavigation Story Configuration
const meta: Meta<typeof TabNavigation> = {
  title: 'Design System/Navigation/TabNavigation',
  component: TabNavigation,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        component: `
# TabNavigation Component - V7.5 Enhanced

Sistema de navegação por abas com glass-morphism effects, animações fluidas e experiência profissional otimizada.

## 🎨 Features V7.5 Enhanced
- **Glass-morphism Design**: Efeitos translúcidos modernos adaptáveis
- **Professional Appearance**: >9/10 rating com visual enterprise-grade
- **Multiple Variants**: 5 variantes (glass, cards, underline, minimal, default)
- **Dynamic Tabs**: Add/close/reorder tabs com animações suaves
- **Accessibility**: WCAG 2.1 AA compliance com navegação por teclado
- **Orientation Support**: Horizontal e vertical layouts

## 🔧 Technical Excellence
- **Design System Integration**: 100% componentes V7.5 Enhanced
- **TypeScript Coverage**: 100% type safety com interfaces comprehensivas
- **Performance Optimization**: Animações otimizadas com framer-motion
- **State Management**: Controlled/uncontrolled modes com flexibilidade
- **Content Rendering**: Sistema de conteúdo dinâmico por aba

## 🎯 UX Optimization
- **Visual Hierarchy**: Indicadores claros de estado ativo
- **Badge System**: Notificações e status visuais
- **Smart Interactions**: Hover/focus/active states otimizados
- **Content Transitions**: Animações suaves entre abas
- **Close Protection**: Controle granular de abas fecháveis

## ♿ Accessibility Features
- **Semantic HTML**: role="tab", "tablist", "tabpanel" structure
- **Keyboard Navigation**: 100% funcional com Arrow/Tab/Enter/Space
- **ARIA States**: aria-selected, aria-disabled para screen readers
- **Focus Management**: Indicadores visuais claros
- **Screen Reader**: Anúncios corretos de mudanças de aba
        `,
      },
    },
  },
  tags: ['autodocs', 'design-system', 'v7-enhanced', 'navigation'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'glass', 'minimal', 'cards', 'underline'],
      description: 'Visual variant of the tab navigation',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the tab components',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation',
    },
    allowAddTab: {
      control: 'boolean',
      description: 'Allow adding new tabs',
    },
    allowCloseTab: {
      control: 'boolean',
      description: 'Allow closing tabs',
    },
    renderContent: {
      control: 'boolean',
      description: 'Render tab content panels',
    },
    maxTabs: {
      control: 'number',
      description: 'Maximum number of tabs',
      min: 1,
      max: 20,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', minHeight: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// V7.5 Enhanced Sample Data
const basicTabs: TabItem[] = [
  { 
    id: 'overview', 
    label: 'Visão Geral', 
    icon: <Home size={16} />, 
    isActive: true,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dashboard Overview</h3>
        <p>Bem-vindo ao painel principal. Aqui você encontra um resumo das principais métricas e atividades.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium">Usuários Ativos</h4>
            <p className="text-2xl font-bold">1,234</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium">Receita Mensal</h4>
            <p className="text-2xl font-bold">R$ 45,678</p>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: <BarChart3 size={16} />, 
    badge: 'New',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <p>Análise detalhada de performance e métricas de engajamento.</p>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de Analytics aqui</p>
        </div>
      </div>
    )
  },
  { 
    id: 'users', 
    label: 'Usuários', 
    icon: <Users size={16} />, 
    badge: 156,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gestão de Usuários</h3>
        <p>Administre usuários, permissões e configurações de acesso.</p>
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Usuário {i + 1}</p>
                <p className="text-sm text-gray-500">usuario{i + 1}@exemplo.com</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  { 
    id: 'settings', 
    label: 'Configurações', 
    icon: <Settings size={16} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
        <p>Ajuste preferências e configurações globais.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Notificações por email</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Modo escuro</span>
            <input type="checkbox" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Backup automático</span>
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    )
  },
];

const contentCreationTabs: TabItem[] = [
  { 
    id: 'editor', 
    label: 'Editor', 
    icon: <FileText size={16} />, 
    isActive: true,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Editor de Conteúdo</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Interface do editor aqui</p>
        </div>
      </div>
    )
  },
  { 
    id: 'media', 
    label: 'Mídia', 
    icon: <Image size={16} />, 
    badge: 12,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Galeria de Mídia</h3>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  },
  { 
    id: 'preview', 
    label: 'Preview', 
    icon: <Target size={16} />,
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview do Conteúdo</h3>
        <div className="p-6 bg-white border rounded-lg">
          <p>Visualização do conteúdo publicado...</p>
        </div>
      </div>
    )
  },
  { 
    id: 'publish', 
    label: 'Publicar', 
    icon: <Zap size={16} />, 
    badge: 'Draft',
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Opções de Publicação</h3>
        <div className="space-y-3">
          <button className="w-full p-3 bg-blue-500 text-white rounded-lg">
            Publicar Imediatamente
          </button>
          <button className="w-full p-3 bg-gray-200 rounded-lg">
            Agendar Publicação
          </button>
          <button className="w-full p-3 bg-gray-200 rounded-lg">
            Salvar como Rascunho
          </button>
        </div>
      </div>
    )
  },
];

// V7.5 Enhanced Stories

export const Default: Story = {
  args: {
    tabs: basicTabs,
    variant: 'glass',
    size: 'md',
    orientation: 'horizontal',
    renderContent: true,
    onTabChange: action('tab-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'TabNavigation padrão com glass-morphism effect e conteúdo dinâmico.',
      },
    },
  },
};

export const VariantGlass: Story = {
  args: {
    tabs: basicTabs,
    variant: 'glass',
    size: 'md',
    renderContent: true,
    onTabChange: action('glass-tab-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Variante glass com efeitos translúcidos modernos e blur backdrop.',
      },
    },
  },
};

export const VariantCards: Story = {
  args: {
    tabs: basicTabs,
    variant: 'cards',
    size: 'md',
    renderContent: true,
    onTabChange: action('cards-tab-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Variante cards com abas individuais em cartões destacados.',
      },
    },
  },
};

export const VariantUnderline: Story = {
  args: {
    tabs: basicTabs,
    variant: 'underline',
    size: 'md',
    renderContent: true,
    onTabChange: action('underline-tab-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Variante underline com indicador de linha inferior.',
      },
    },
  },
};

export const VariantMinimal: Story = {
  args: {
    tabs: basicTabs,
    variant: 'minimal',
    size: 'md',
    renderContent: true,
    onTabChange: action('minimal-tab-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Variante minimal sem backgrounds para layouts clean.',
      },
    },
  },
};

export const VerticalOrientation: Story = {
  args: {
    tabs: basicTabs,
    variant: 'glass',
    size: 'md',
    orientation: 'vertical',
    renderContent: true,
    onTabChange: action('vertical-tab-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout vertical ideal para sidebars e navegação lateral.',
      },
    },
  },
};

export const DynamicTabs: Story = {
  args: {
    tabs: contentCreationTabs,
    variant: 'glass',
    size: 'md',
    allowAddTab: true,
    allowCloseTab: true,
    maxTabs: 8,
    renderContent: true,
    onTabChange: action('dynamic-tab-changed'),
    onTabAdd: action('tab-added'),
    onTabClose: action('tab-closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Abas dinâmicas com capacidade de adicionar e fechar abas.',
      },
    },
  },
};

export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Small Size</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="glass"
          size="sm"
          renderContent={false}
          onTabChange={action('small-tab-changed')}
        />
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Medium Size (Default)</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="glass"
          size="md"
          renderContent={false}
          onTabChange={action('medium-tab-changed')}
        />
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Large Size</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="glass"
          size="lg"
          renderContent={false}
          onTabChange={action('large-tab-changed')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstração dos três tamanhos disponíveis: small, medium e large.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Default Variant</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="default"
          size="md"
          renderContent={false}
          onTabChange={action('default-variant-tab')}
        />
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Glass Variant</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="glass"
          size="md"
          renderContent={false}
          onTabChange={action('glass-variant-tab')}
        />
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Cards Variant</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="cards"
          size="md"
          renderContent={false}
          onTabChange={action('cards-variant-tab')}
        />
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Underline Variant</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="underline"
          size="md"
          renderContent={false}
          onTabChange={action('underline-variant-tab')}
        />
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-medium opacity-70">Minimal Variant</h3>
        <TabNavigation
          tabs={basicTabs.slice(0, 3)}
          variant="minimal"
          size="md"
          renderContent={false}
          onTabChange={action('minimal-variant-tab')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparação visual de todas as variantes disponíveis.',
      },
    },
  },
};

export const AccessibilityDemo: Story = {
  args: {
    tabs: basicTabs,
    variant: 'glass',
    size: 'md',
    renderContent: true,
    onTabChange: action('a11y-tab-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo de acessibilidade. Use Tab para navegar, Arrow keys para mudar abas, Enter/Space para ativar.',
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'focus-management', enabled: true },
        ],
      },
    },
  },
  render: (args) => (
    <div>
      <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <h4 className="font-medium mb-2">🔍 Teste de Acessibilidade</h4>
        <ul className="text-sm space-y-1">
          <li>• Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> para navegar até as abas</li>
          <li>• Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">←→</kbd> para navegar entre abas</li>
          <li>• Pressione <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> ou <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> para ativar aba</li>
          <li>• Screen readers anunciarão role="tab" e estados aria-selected</li>
          <li>• Focus ring visível em todos os elementos</li>
        </ul>
      </div>
      <TabNavigation {...args} />
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    const [tabs, setTabs] = React.useState<TabItem[]>(contentCreationTabs);
    const [activeTab, setActiveTab] = React.useState('editor');
    const [tabCounter, setTabCounter] = React.useState(tabs.length + 1);

    const handleTabChange = (tab: TabItem) => {
      setActiveTab(tab.id);
      action('interactive-tab-changed')(tab);
    };

    const handleAddTab = () => {
      const newTab: TabItem = {
        id: `tab-${tabCounter}`,
        label: `Nova Aba ${tabCounter}`,
        icon: <Star size={16} />,
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nova Aba {tabCounter}</h3>
            <p>Conteúdo da aba criada dinamicamente.</p>
          </div>
        ),
      };
      setTabs([...tabs, newTab]);
      setTabCounter(tabCounter + 1);
      setActiveTab(newTab.id);
      action('interactive-tab-added')(newTab);
    };

    const handleCloseTab = (tabToClose: TabItem) => {
      const newTabs = tabs.filter(tab => tab.id !== tabToClose.id);
      setTabs(newTabs);
      
      // Se a aba ativa foi fechada, ativar a primeira disponível
      if (activeTab === tabToClose.id && newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
      }
      
      action('interactive-tab-closed')(tabToClose);
    };

    return (
      <div className="space-y-6">
        <TabNavigation
          tabs={tabs}
          variant="glass"
          size="md"
          activeTabId={activeTab}
          allowAddTab={true}
          allowCloseTab={true}
          maxTabs={8}
          renderContent={true}
          onTabChange={handleTabChange}
          onTabAdd={handleAddTab}
          onTabClose={handleCloseTab}
        />
        
        <div className="p-4 rounded-lg bg-gray-50 border">
          <h4 className="font-medium mb-3">🎮 Controles Interativos</h4>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <strong>Total de Abas:</strong> {tabs.length}
            </div>
            <div>
              <strong>Aba Ativa:</strong> {tabs.find(t => t.id === activeTab)?.label}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={handleAddTab}
              disabled={tabs.length >= 8}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              + Adicionar Aba
            </button>
            <button 
              onClick={() => setActiveTab('editor')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              🏠 Editor
            </button>
            <button 
              onClick={() => {
                setTabs(contentCreationTabs);
                setActiveTab('editor');
                setTabCounter(contentCreationTabs.length + 1);
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Exemplo interativo demonstrando adicionar/fechar abas e controle de estado dinâmico.',
      },
    },
  },
}; 