import type { Meta, StoryObj } from '@storybook/react';
import { theme as designTokens } from '../tokens';

// V7.5 Enhanced Brand Tokens Documentation
const meta: Meta = {
  title: 'Design System/Brand/Design Tokens',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs', 'design-system', 'v7-enhanced', 'brand'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Color Palette Story
export const ColorPalette: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: designTokens.colors.text.primary, marginBottom: '2rem' }}>
        V7.5 Enhanced Color Palette
      </h1>
      
      {/* Primary Colors */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: designTokens.colors.text.secondary, marginBottom: '1rem' }}>
          Primary Colors
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <ColorSwatch 
            name="Primary" 
            color={designTokens.colors.primary} 
            description="Main brand color"
          />
          <ColorSwatch 
            name="Primary Light" 
            color={designTokens.colors.primaryLight} 
            description="Lighter variant"
          />
          <ColorSwatch 
            name="Primary Dark" 
            color={designTokens.colors.primaryDark} 
            description="Darker variant"
          />
        </div>
      </section>

      {/* Glass-morphism Effects */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: designTokens.colors.text.secondary, marginBottom: '1rem' }}>
          Glass-morphism Effects
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <EffectSwatch 
            name="Glass Light" 
            effect={designTokens.glassEffect.light}
            description="Light glass effect"
          />
          <EffectSwatch 
            name="Glass Medium" 
            effect={designTokens.glassEffect.medium}
            description="Medium opacity glass"
          />
          <EffectSwatch 
            name="Glass Strong" 
            effect={designTokens.glassEffect.strong}
            description="Strong glass effect"
          />
        </div>
      </section>

      {/* Typography System */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: designTokens.colors.text.secondary, marginBottom: '1rem' }}>
          Typography Scale
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={designTokens.typography.h1}>H1 Heading - 2.5rem (40px)</div>
          <div style={designTokens.typography.h2}>H2 Heading - 2rem (32px)</div>
          <div style={designTokens.typography.h3}>H3 Heading - 1.5rem (24px)</div>
          <div style={designTokens.typography.h4}>H4 Heading - 1.25rem (20px)</div>
          <div style={designTokens.typography.body}>Body Text - 1rem (16px)</div>
          <div style={designTokens.typography.caption}>Caption Text - 0.875rem (14px)</div>
        </div>
      </section>

      {/* Spacing System */}
      <section>
        <h2 style={{ color: designTokens.colors.text.secondary, marginBottom: '1rem' }}>
          Spacing System (8px Grid)
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          {Object.entries(designTokens.spacing).map(([key, value]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div 
                style={{ 
                  width: value, 
                  height: value, 
                  backgroundColor: designTokens.colors.primary,
                  marginBottom: '0.5rem',
                  borderRadius: '4px'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: designTokens.colors.text.secondary }}>
                {key}: {value}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete color palette showcasing V7.5 Enhanced brand colors and glass-morphism effects.',
      },
    },
  },
};

// Typography Showcase
export const TypographyShowcase: Story = {
  render: () => (
    <div style={{ 
      padding: '2rem',
      fontFamily: designTokens.typography.fontFamily
    }}>
      <div style={designTokens.typography.h1}>
        The Five Boxing Wizards Jump Quickly
      </div>
      <div style={{ ...designTokens.typography.body, margin: '1rem 0', opacity: 0.8 }}>
        Demonstrating Inter font family in V7.5 Enhanced design system
      </div>
      
      <div style={designTokens.typography.h2}>
        Professional Typography Hierarchy
      </div>
      <div style={{ ...designTokens.typography.body, margin: '1rem 0' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
        nostrud exercitation ullamco laboris.
      </div>
      
      <div style={designTokens.typography.h3}>
        Enhanced for Accessibility
      </div>
      <div style={{ ...designTokens.typography.body, margin: '1rem 0' }}>
        All typography scales maintain WCAG 2.1 AA contrast ratios and optimal reading 
        experience across devices.
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Typography system with Inter font family and semantic hierarchy.',
      },
    },
  },
};

// Helper Components
const ColorSwatch = ({ name, color, description }: { name: string; color: string; description: string }) => (
  <div style={{
    padding: '1rem',
    border: `1px solid ${designTokens.colors.border}`,
    borderRadius: designTokens.borderRadius.md,
    background: designTokens.glassEffect.light,
    backdropFilter: 'blur(10px)',
  }}>
    <div style={{
      width: '100%',
      height: '60px',
      backgroundColor: color,
      borderRadius: designTokens.borderRadius.sm,
      marginBottom: '0.5rem',
      border: `1px solid ${designTokens.colors.border}`,
    }} />
    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{name}</div>
    <div style={{ fontSize: '0.875rem', color: designTokens.colors.text.secondary, marginBottom: '0.25rem' }}>
      {color}
    </div>
    <div style={{ fontSize: '0.75rem', color: designTokens.colors.text.secondary }}>
      {description}
    </div>
  </div>
);

const EffectSwatch = ({ name, effect, description }: { name: string; effect: string; description: string }) => (
  <div style={{
    padding: '2rem',
    border: `1px solid ${designTokens.colors.border}`,
    borderRadius: designTokens.borderRadius.lg,
    background: effect,
    backdropFilter: 'blur(15px)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{ fontWeight: '600', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
      {name}
    </div>
    <div style={{ fontSize: '0.875rem', color: designTokens.colors.text.secondary, position: 'relative', zIndex: 1 }}>
      {description}
    </div>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
      pointerEvents: 'none',
    }} />
  </div>
);

// Accessibility Testing Story
export const AccessibilityValidation: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h1 style={designTokens.typography.h1}>Accessibility Validation</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={designTokens.typography.h2}>Color Contrast Testing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <ContrastTest 
            background={designTokens.colors.background}
            foreground={designTokens.colors.text.primary}
            label="Primary Text on Background"
          />
          <ContrastTest 
            background={designTokens.colors.primary}
            foreground={designTokens.colors.white}
            label="White Text on Primary"
          />
          <ContrastTest 
            background={designTokens.glassEffect.medium}
            foreground={designTokens.colors.text.primary}
            label="Text on Glass Effect"
          />
        </div>
      </section>

      <section>
        <h2 style={designTokens.typography.h2}>Focus Indicators</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: designTokens.colors.primary,
            color: designTokens.colors.white,
            border: 'none',
            borderRadius: designTokens.borderRadius.md,
            cursor: 'pointer',
            outline: `2px solid transparent`,
            ':focus': { outline: `2px solid ${designTokens.colors.primary}` }
          }}>
            Focusable Button
          </button>
          <a href="#" style={{
            padding: '0.75rem 1.5rem',
            background: designTokens.glassEffect.light,
            color: designTokens.colors.text.primary,
            textDecoration: 'none',
            borderRadius: designTokens.borderRadius.md,
            border: `1px solid ${designTokens.colors.border}`,
            display: 'inline-block',
          }}>
            Focusable Link
          </a>
        </div>
      </section>
    </div>
  ),
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'focus-management', enabled: true },
        ],
      },
    },
    docs: {
      description: {
        story: 'Accessibility validation testing for WCAG 2.1 AA compliance.',
      },
    },
  },
};

const ContrastTest = ({ background, foreground, label }: { background: string; foreground: string; label: string }) => (
  <div style={{
    padding: '1.5rem',
    background,
    color: foreground,
    borderRadius: designTokens.borderRadius.md,
    border: `1px solid ${designTokens.colors.border}`,
  }}>
    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
      Testing contrast ratio compliance for accessibility standards.
    </div>
    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>
      Background: {background} | Foreground: {foreground}
    </div>
  </div>
); 