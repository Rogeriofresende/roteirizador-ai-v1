import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { FileText, Users, Settings, Database, BarChart3, Folder, Star, Tag } from 'lucide-react';

// V7.5 Enhanced Breadcrumb Story Configuration
const meta: Meta<typeof Breadcrumb> = {
  title: 'Design System/Navigation/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs', 'design-system', 'v7-enhanced', 'navigation'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'glass', 'minimal', 'cards'],
      description: 'Visual variant of the breadcrumb',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the breadcrumb component',
    },
    showBackButton: {
      control: 'boolean',
      description: 'Show back navigation button',
    },
    showHomeIcon: {
      control: 'boolean',
      description: 'Show home icon in first item',
    },
    maxItems: {
      control: 'number',
      description: 'Maximum items before collapsing',
      min: 3,
      max: 10,
    },
  },
  decorators: [
    (Story) => (
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '200px',
        borderRadius: '8px'
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// V7.5 Enhanced Sample Data
const basicBreadcrumbItems: BreadcrumbItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <BarChart3 size={16} /> },
  { id: 'settings', label: 'Configurações', href: '/settings', icon: <Settings size={16} /> },
  { id: 'profile', label: 'Perfil', isActive: true },
];

const longBreadcrumbItems: BreadcrumbItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'company', label: 'Empresa', href: '/company', icon: <Users size={16} /> },
  { id: 'projects', label: 'Projetos', href: '/projects', icon: <Folder size={16} /> },
  { id: 'ai-content', label: 'Conteúdo IA', href: '/projects/ai-content', icon: <FileText size={16} /> },
  { id: 'campaigns', label: 'Campanhas', href: '/projects/ai-content/campaigns', icon: <Tag size={16} /> },
  { id: 'social-media', label: 'Redes Sociais', href: '/projects/ai-content/campaigns/social-media' },
  { id: 'instagram', label: 'Instagram', href: '/projects/ai-content/campaigns/social-media/instagram' },
  { id: 'post-123', label: 'Post #123', isActive: true },
];

const adminBreadcrumbItems: BreadcrumbItem[] = [
  { id: 'admin', label: 'Admin', href: '/admin' },
  { id: 'system', label: 'Sistema', href: '/admin/system', icon: <Database size={16} /> },
  { id: 'monitoring', label: 'Monitoramento', href: '/admin/system/monitoring', icon: <BarChart3 size={16} /> },
  { id: 'analytics', label: 'Analytics', isActive: true, icon: <Star size={16} /> },
];

// V7.5 Enhanced Stories

export const Default: Story = {
  args: {
    items: basicBreadcrumbItems,
    variant: 'glass',
    size: 'md',
    showBackButton: false,
    showHomeIcon: true,
    onItemClick: action('item-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Breadcrumb padrão com glass-morphism effect e navegação hierárquica clara.',
      },
    },
  },
};

export const VariantGlass: Story = {
  args: {
    items: basicBreadcrumbItems,
    variant: 'glass',
    size: 'md',
    showHomeIcon: true,
    onItemClick: action('item-clicked'),
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
    items: basicBreadcrumbItems,
    variant: 'cards',
    size: 'md',
    showHomeIcon: true,
    onItemClick: action('item-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Variante cards com itens individuais em cartões para hierarquias complexas.',
      },
    },
  },
};

export const VariantMinimal: Story = {
  args: {
    items: basicBreadcrumbItems,
    variant: 'minimal',
    size: 'md',
    showHomeIcon: false,
    onItemClick: action('item-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Variante minimal sem background, ideal para layouts clean.',
      },
    },
  },
};

export const WithBackButton: Story = {
  args: {
    items: basicBreadcrumbItems,
    variant: 'glass',
    size: 'md',
    showBackButton: true,
    showHomeIcon: true,
    onItemClick: action('item-clicked'),
    onBackClick: action('back-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Breadcrumb com botão de voltar para navegação browser-like.',
      },
    },
  },
};

export const LongHierarchy: Story = {
  args: {
    items: longBreadcrumbItems,
    variant: 'glass',
    size: 'md',
    maxItems: 5,
    showHomeIcon: true,
    onItemClick: action('item-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Hierarquia longa com colapso inteligente dos itens do meio.',
      },
    },
  },
};

export const AdminContext: Story = {
  args: {
    items: adminBreadcrumbItems,
    variant: 'cards',
    size: 'lg',
    showBackButton: true,
    showHomeIcon: false,
    onItemClick: action('admin-item-clicked'),
    onBackClick: action('admin-back-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Contexto administrativo com visual destacado e navegação especializada.',
      },
    },
  },
};

export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium opacity-70">Small Size</h3>
        <Breadcrumb
          items={basicBreadcrumbItems}
          variant="glass"
          size="sm"
          onItemClick={action('small-item-clicked')}
        />
      </div>
      
      <div>
        <h3 className="mb-2 text-sm font-medium opacity-70">Medium Size (Default)</h3>
        <Breadcrumb
          items={basicBreadcrumbItems}
          variant="glass"
          size="md"
          onItemClick={action('medium-item-clicked')}
        />
      </div>
      
      <div>
        <h3 className="mb-2 text-sm font-medium opacity-70">Large Size</h3>
        <Breadcrumb
          items={basicBreadcrumbItems}
          variant="glass"
          size="lg"
          onItemClick={action('large-item-clicked')}
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
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium opacity-70">Default Variant</h3>
        <Breadcrumb
          items={basicBreadcrumbItems}
          variant="default"
          size="md"
          onItemClick={action('default-variant-clicked')}
        />
      </div>
      
      <div>
        <h3 className="mb-2 text-sm font-medium opacity-70">Glass Variant</h3>
        <Breadcrumb
          items={basicBreadcrumbItems}
          variant="glass"
          size="md"
          onItemClick={action('glass-variant-clicked')}
        />
      </div>
      
      <div>
        <h3 className="mb-2 text-sm font-medium opacity-70">Cards Variant</h3>
        <Breadcrumb
          items={basicBreadcrumbItems}
          variant="cards"
          size="md"
          onItemClick={action('cards-variant-clicked')}
        />
      </div>
      
      <div>
        <h3 className="mb-2 text-sm font-medium opacity-70">Minimal Variant</h3>
        <Breadcrumb
          items={basicBreadcrumbItems}
          variant="minimal"
          size="md"
          showHomeIcon={false}
          onItemClick={action('minimal-variant-clicked')}
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
    items: basicBreadcrumbItems,
    variant: 'glass',
    size: 'md',
    showBackButton: true,
    showHomeIcon: true,
    onItemClick: action('accessibility-item-clicked'),
    onBackClick: action('accessibility-back-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo de acessibilidade. Use Tab para navegar, Enter/Space para ativar links.',
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
      <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <h4 className="font-medium mb-2">🔍 Teste de Acessibilidade</h4>
        <ul className="text-sm space-y-1">
          <li>• Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> para navegar entre itens</li>
          <li>• Pressione <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> ou <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> para ativar links</li>
          <li>• Screen readers anunciarão "Breadcrumb navigation" e posição de cada item</li>
          <li>• Focus ring visível em todos os elementos interativos</li>
        </ul>
      </div>
      <Breadcrumb {...args} />
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    const [currentPath, setCurrentPath] = React.useState(['home', 'dashboard', 'settings']);
    
    const allItems: Record<string, BreadcrumbItem> = {
      home: { id: 'home', label: 'Home', href: '/' },
      dashboard: { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <BarChart3 size={16} /> },
      settings: { id: 'settings', label: 'Configurações', href: '/settings', icon: <Settings size={16} /> },
      profile: { id: 'profile', label: 'Perfil', href: '/profile', icon: <Users size={16} /> },
      security: { id: 'security', label: 'Segurança', href: '/security', icon: <Star size={16} /> },
    };

    const buildBreadcrumbItems = (): BreadcrumbItem[] => {
      return currentPath.map((pathId, index) => ({
        ...allItems[pathId],
        isActive: index === currentPath.length - 1,
      }));
    };

    const handleItemClick = (item: BreadcrumbItem) => {
      const itemIndex = currentPath.indexOf(item.id);
      if (itemIndex >= 0) {
        setCurrentPath(currentPath.slice(0, itemIndex + 1));
      }
      action('interactive-item-clicked')(item);
    };

    const handleBackClick = () => {
      if (currentPath.length > 1) {
        setCurrentPath(currentPath.slice(0, -1));
      }
      action('interactive-back-clicked')();
    };

    const addPage = (pageId: string) => {
      if (!currentPath.includes(pageId)) {
        setCurrentPath([...currentPath, pageId]);
      }
    };

    return (
      <div className="space-y-6">
        <Breadcrumb
          items={buildBreadcrumbItems()}
          variant="glass"
          size="md"
          showBackButton={currentPath.length > 1}
          onItemClick={handleItemClick}
          onBackClick={handleBackClick}
        />
        
        <div className="p-4 rounded-lg bg-gray-50 border">
          <h4 className="font-medium mb-3">🎮 Controles Interativos</h4>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => addPage('profile')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              + Perfil
            </button>
            <button 
              onClick={() => addPage('security')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              + Segurança
            </button>
            <button 
              onClick={() => setCurrentPath(['home'])}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              🏠 Reset
            </button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Exemplo interativo demonstrando navegação dinâmica e controle de estado.',
      },
    },
  },
}; 