import type { Meta, StoryObj } from '@storybook/react';
import { PageLayout, Section, Grid, CardLayout } from '../Layout';

// V7.5 Enhanced Story Configuration
const meta: Meta<typeof PageLayout> = {
  title: 'Design System/Layout/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
    docs: {
      description: {
        component: `
# PageLayout Component - V7.5 Enhanced

Professional enterprise-grade layout component with glass-morphism effects and responsive design.

## Features
- 🎨 **Glass-morphism Effects**: Modern translucent design
- 📱 **Responsive Design**: Mobile-first approach
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 🎯 **Performance**: Optimized for fast rendering

## Design Tokens
- Uses V7.5 Enhanced color palette
- Consistent spacing and typography
- Semantic component structure
        `,
      },
    },
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  tags: ['autodocs', 'design-system', 'v7-enhanced'],
  argTypes: {
    children: {
      description: 'Content to be rendered inside the layout',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// V7.5 Enhanced Stories
export const Default: Story = {
  args: {
    children: (
      <Section>
        <h1>V7.5 Enhanced PageLayout</h1>
        <p>Professional enterprise-grade layout component</p>
      </Section>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default PageLayout with basic content and V7.5 Enhanced styling.',
      },
    },
  },
};

export const WithGrid: Story = {
  args: {
    children: (
      <Section>
        <h1>Grid Layout Example</h1>
        <Grid>
          <CardLayout>
            <h3>Card 1</h3>
            <p>Content with glass-morphism effect</p>
          </CardLayout>
          <CardLayout>
            <h3>Card 2</h3>
            <p>Responsive grid system</p>
          </CardLayout>
          <CardLayout>
            <h3>Card 3</h3>
            <p>V7.5 Enhanced design tokens</p>
          </CardLayout>
        </Grid>
      </Section>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'PageLayout with Grid and CardLayout components demonstrating responsive design.',
      },
    },
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Mobile: Story = {
  args: {
    children: (
      <Section>
        <h1>Mobile Layout</h1>
        <p>Optimized for mobile devices</p>
        <Grid>
          <CardLayout>
            <h3>Mobile Card</h3>
            <p>Stack layout on mobile</p>
          </CardLayout>
        </Grid>
      </Section>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Mobile-optimized layout with responsive behavior.',
      },
    },
  },
};

export const Accessibility: Story = {
  args: {
    children: (
      <Section>
        <h1>Accessibility Example</h1>
        <p>WCAG 2.1 AA compliant layout</p>
        <button>Focusable Element</button>
        <a href="#" tabIndex={0}>
          Keyboard Navigable Link
        </a>
      </Section>
    ),
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
        ],
      },
    },
    docs: {
      description: {
        story: 'Layout component with accessibility features and keyboard navigation.',
      },
    },
  },
}; 