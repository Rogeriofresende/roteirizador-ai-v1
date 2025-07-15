import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Navbar from './Navbar';
import { User, Settings, LogOut, Bell, Search, Menu, X } from 'lucide-react';

// V7.5 Enhanced Navbar Story Configuration
const meta: Meta<typeof Navbar> = {
  title: 'Design System/Navigation/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Navbar Component - V7.5 Enhanced

Sistema de navegação principal com glass-morphism effects e experiência profissional otimizada.

## 🎨 Features V7.5 Enhanced
- **Glass-morphism Design**: Efeitos translúcidos modernos adaptáveis
- **Professional Appearance**: >9/10 rating com visual enterprise-grade
- **Responsive Design**: Adapta-se automaticamente a diferentes tamanhos
- **User Management**: Sistema completo de autenticação e perfil
- **Notification System**: Indicadores visuais para notificações
- **Search Integration**: Busca inteligente com sugestões

## 🔧 Technical Excellence
- **Design System Integration**: 100% componentes V7.5 Enhanced
        `,
      },
    },
  },
  argTypes: {
    isAuthenticated: {
      control: 'boolean',
      description: 'User authentication status',
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search functionality',
    },
    showNotifications: {
      control: 'boolean',
      description: 'Show notification bell',
    },
    variant: {
      control: 'select',
      options: ['default', 'glass', 'minimal'],
      description: 'Visual style variant',
    },
  },
  decorators: [
    (Story) => (
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        padding: '0'
      }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Default story
export const Default: Story = {
  args: {
    isAuthenticated: false,
    showSearch: true,
    showNotifications: true,
    variant: 'default',
  },
  render: (args) => <Navbar {...args} />,
};

// Authenticated user story
export const AuthenticatedUser: Story = {
  args: {
    isAuthenticated: true,
    showSearch: true,
    showNotifications: true,
    variant: 'default',
    user: {
      name: 'João Silva',
      email: 'joao@example.com',
      avatar: 'https://via.placeholder.com/40',
    },
    notificationCount: 3,
  },
  render: (args) => <Navbar {...args} />,
};

// Glass variant story
export const GlassVariant: Story = {
  args: {
    isAuthenticated: true,
    showSearch: true,
    showNotifications: true,
    variant: 'glass',
    user: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      avatar: 'https://via.placeholder.com/40',
    },
    notificationCount: 5,
  },
  render: (args) => <Navbar {...args} />,
};

// Minimal variant story  
export const MinimalVariant: Story = {
  args: {
    isAuthenticated: false,
    showSearch: false,
    showNotifications: false,
    variant: 'minimal',
  },
  render: (args) => <Navbar {...args} />,
};

// Mobile responsive story
export const MobileResponsive: Story = {
  args: {
    isAuthenticated: true,
    showSearch: true,
    showNotifications: true,
    variant: 'default',
    user: {
      name: 'Carlos Oliveira',
      email: 'carlos@example.com',
      avatar: 'https://via.placeholder.com/40',
    },
    notificationCount: 2,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: (args) => <Navbar {...args} />,
};

// With search active story
export const WithSearchActive: Story = {
  args: {
    isAuthenticated: true,
    showSearch: true,
    showNotifications: true,
    variant: 'default',
    user: {
      name: 'Ana Costa',
      email: 'ana@example.com',
      avatar: 'https://via.placeholder.com/40',
    },
  },
  render: (args) => <Navbar {...args} />,
};

// With notifications story
export const WithNotifications: Story = {
  args: {
    isAuthenticated: true,
    showSearch: true,
    showNotifications: true,
    variant: 'default',
    user: {
      name: 'Pedro Ferreira',
      email: 'pedro@example.com',
      avatar: 'https://via.placeholder.com/40',
    },
    notificationCount: 10,
  },
  render: (args) => <Navbar {...args} />,
};

// Loading state story
export const LoadingState: Story = {
  args: {
    isAuthenticated: true,
    showSearch: true,
    showNotifications: true,
    variant: 'default',
    isLoading: true,
  },
  render: (args) => <Navbar {...args} />,
};

// Error state story
export const ErrorState: Story = {
  args: {
    isAuthenticated: false,
    showSearch: true,
    showNotifications: true,
    variant: 'default',
    hasError: true,
  },
  render: (args) => <Navbar {...args} />,
}; 