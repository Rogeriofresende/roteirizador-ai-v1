import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Design System/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Button Component - V7.0 Enhanced

O componente Button é parte fundamental do Design System V7.0 Enhanced, oferecendo diferentes variantes e estados para todas as necessidades da interface.

## Features V7.0:
- **Glass-morphism effects** em hover
- **Colored shadows** seguindo brand colors  
- **Gradientes modernos** para variantes primárias
- **Animações suaves** de transição
- **Accessibility compliant** (WCAG 2.1 AA)

## Design Tokens Utilizados:
- Colors: Primary, Secondary, Accent palettes
- Shadows: Interactive, Colored, Glass effects
- Typography: Button text styles
- Spacing: Consistent padding system
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Variação visual do botão',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Tamanho do botão',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado desabilitado do botão',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carregamento do botão',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Ocupa toda a largura disponível',
    },
    startIcon: {
      control: 'text',
      description: 'Ícone no início do botão',
    },
    endIcon: {
      control: 'text',
      description: 'Ícone no final do botão',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary Stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button Primary',
  },
};

export const PrimaryWithIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Gerar Ideia',
    startIcon: '🧠',
  },
};

export const PrimaryLoading: Story = {
  args: {
    variant: 'primary',
    children: 'Carregando...',
    loading: true,
  },
};

// Secondary Stories
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button Secondary',
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    variant: 'secondary',
    children: 'Cancelar',
    startIcon: '✕',
  },
};

// Ghost Stories
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Button Ghost',
  },
};

export const GhostWithIcons: Story = {
  args: {
    variant: 'ghost',
    children: 'Compartilhar',
    startIcon: '📤',
  },
};

// Danger Stories
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Deletar',
    startIcon: '🗑️',
  },
};

// Size Variations
export const SmallSize: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

export const MediumSize: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Medium Button',
  },
};

export const LargeSize: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// Disabled States
export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Disabled Secondary',
    disabled: true,
  },
};

// Interactive Example
export const InteractiveExample: Story = {
  args: {
    variant: 'primary',
    children: 'Clique para Interagir',
    startIcon: '✨',
  },
  parameters: {
    docs: {
      description: {
        story: `
Este botão demonstra os efeitos V7.0 Enhanced:
- Hover com glass-morphism
- Colored shadows na cor primária  
- Transições suaves
- Feedback visual interativo
        `,
      },
    },
  },
};

// Group Example
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <Button variant="primary" startIcon="💾">Salvar</Button>
      <Button variant="secondary" startIcon="👁️">Preview</Button>
      <Button variant="ghost" startIcon="📤">Compartilhar</Button>
      <Button variant="danger" startIcon="🗑️">Deletar</Button>
    </div>
  ),
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: `
Exemplo de grupo de botões demonstrando diferentes variantes e ícones. 
Observe a consistência visual e os diferentes pesos hierárquicos.
        `,
      },
    },
  },
};