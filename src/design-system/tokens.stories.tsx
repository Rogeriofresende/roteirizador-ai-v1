import type { Meta } from '@storybook/react';
import { colors, typography, spacing, shadows, borderRadius } from './tokens';

const meta: Meta = {
  title: 'Design System/Design Tokens',
  parameters: {
    docs: {
      description: {
        component: 'Design Tokens são a base do nosso sistema de design, fornecendo valores consistentes para cores, tipografia, espaçamento e outros elementos visuais.',
      },
    },
    layout: 'fullscreen',
  },
};

export default meta;

// Color Palette Component
const ColorItem = ({ title, subtitle, colorValue }: { title: string; subtitle: string; colorValue: string }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1rem', 
    padding: '1rem',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: borderRadius.md,
    marginBottom: '0.5rem'
  }}>
    <div style={{ 
      width: '60px', 
      height: '60px', 
      backgroundColor: colorValue,
      borderRadius: borderRadius.sm,
      border: `1px solid ${colors.neutral[300]}`
    }} />
    <div>
      <h4 style={{ margin: 0, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
        {title}
      </h4>
      <p style={{ margin: 0, fontSize: typography.fontSize.xs, color: colors.neutral[600] }}>
        {subtitle}
      </p>
      <code style={{ fontSize: typography.fontSize.xs, fontFamily: 'monospace', color: colors.neutral[700] }}>
        {colorValue}
      </code>
    </div>
  </div>
);

// Main Colors Story
export const Colors = () => (
  <div style={{ padding: '2rem', fontFamily: typography.fontFamily.sans }}>
    <h1 style={{ 
      fontSize: typography.fontSize['3xl'], 
      fontWeight: typography.fontWeight.bold,
      marginBottom: '2rem',
      color: colors.neutral[900]
    }}>
      🎨 Design Tokens V7.0 Enhanced
    </h1>
    
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        fontSize: typography.fontSize['2xl'], 
        fontWeight: typography.fontWeight.semibold,
        marginBottom: '1.5rem',
        color: colors.neutral[800]
      }}>
        Cores Principais
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: typography.fontSize.lg, marginBottom: '1rem', color: colors.primary[700] }}>
            Primary - Modern Blue
          </h3>
          <ColorItem title="Primary 50" subtitle="Ultra light backgrounds" colorValue={colors.primary[50]} />
          <ColorItem title="Primary 500" subtitle="Main brand color" colorValue={colors.primary[500]} />
          <ColorItem title="Primary 900" subtitle="Darkest emphasis" colorValue={colors.primary[900]} />
        </div>
        
        <div>
          <h3 style={{ fontSize: typography.fontSize.lg, marginBottom: '1rem', color: colors.accent[700] }}>
            Accent - Creative Purple  
          </h3>
          <ColorItem title="Accent 50" subtitle="Light creative elements" colorValue={colors.accent[50]} />
          <ColorItem title="Accent 500" subtitle="Main accent color" colorValue={colors.accent[500]} />
          <ColorItem title="Accent 900" subtitle="Dark creative elements" colorValue={colors.accent[900]} />
        </div>
      </div>
    </section>

    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{ 
        fontSize: typography.fontSize['2xl'], 
        fontWeight: typography.fontWeight.semibold,
        marginBottom: '1.5rem',
        color: colors.neutral[800]
      }}>
        Cores Funcionais
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <ColorItem title="Success" subtitle="Estados de sucesso" colorValue={colors.success[500]} />
        <ColorItem title="Warning" subtitle="Estados de atenção" colorValue={colors.warning[500]} />
        <ColorItem title="Error" subtitle="Estados de erro" colorValue={colors.error[500]} />
        <ColorItem title="Neutral" subtitle="Cores neutras" colorValue={colors.neutral[500]} />
      </div>
    </section>
  </div>
);

// Typography Story
export const Typography = () => (
  <div style={{ padding: '2rem', fontFamily: typography.fontFamily.sans }}>
    <h1 style={{ 
      fontSize: typography.fontSize['3xl'], 
      fontWeight: typography.fontWeight.bold,
      marginBottom: '2rem',
      color: colors.neutral[900]
    }}>
      🔤 Tipografia
    </h1>
    
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ 
        fontSize: typography.textStyles.h1.fontSize, 
        fontWeight: typography.textStyles.h1.fontWeight,
        lineHeight: typography.textStyles.h1.lineHeight,
        letterSpacing: typography.textStyles.h1.letterSpacing,
        margin: '1rem 0',
        color: colors.neutral[900]
      }}>
        Heading 1 - Títulos Principais
      </h1>
      
      <h2 style={{ 
        fontSize: typography.textStyles.h2.fontSize, 
        fontWeight: typography.textStyles.h2.fontWeight,
        lineHeight: typography.textStyles.h2.lineHeight,
        letterSpacing: typography.textStyles.h2.letterSpacing,
        margin: '1rem 0',
        color: colors.neutral[800]
      }}>
        Heading 2 - Seções Importantes
      </h2>
      
      <h3 style={{ 
        fontSize: typography.textStyles.h3.fontSize, 
        fontWeight: typography.textStyles.h3.fontWeight,
        lineHeight: typography.textStyles.h3.lineHeight,
        margin: '1rem 0',
        color: colors.neutral[700]
      }}>
        Heading 3 - Subseções
      </h3>
      
      <p style={{ 
        fontSize: typography.textStyles.body.fontSize, 
        fontWeight: typography.textStyles.body.fontWeight,
        lineHeight: typography.textStyles.body.lineHeight,
        margin: '1rem 0',
        color: colors.neutral[700]
      }}>
        Body Text - Texto principal para conteúdo, oferecendo boa legibilidade e conforto de leitura em diferentes dispositivos.
      </p>
      
      <p style={{ 
        fontSize: typography.textStyles.bodySmall.fontSize, 
        fontWeight: typography.textStyles.bodySmall.fontWeight,
        lineHeight: typography.textStyles.bodySmall.lineHeight,
        margin: '1rem 0',
        color: colors.neutral[600]
      }}>
        Small Text - Texto secundário, metadados e informações auxiliares.
      </p>
    </div>
  </div>
);

// Spacing Story
export const Spacing = () => (
  <div style={{ padding: '2rem', fontFamily: typography.fontFamily.sans }}>
    <h1 style={{ 
      fontSize: typography.fontSize['3xl'], 
      fontWeight: typography.fontWeight.bold,
      marginBottom: '2rem',
      color: colors.neutral[900]
    }}>
      📏 Espaçamento
    </h1>
    
    <p style={{ marginBottom: '2rem', color: colors.neutral[700] }}>
      Sistema de espaçamento baseado em múltiplos de 4px para consistência visual.
    </p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {Object.entries(spacing).slice(0, 12).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: value, 
            height: '16px', 
            backgroundColor: colors.primary[500],
            borderRadius: borderRadius.sm
          }} />
          <span style={{ fontSize: typography.fontSize.sm, fontFamily: 'monospace', color: colors.neutral[700] }}>
            {key}: {value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Shadows Story
export const Shadows = () => (
  <div style={{ padding: '2rem', fontFamily: typography.fontFamily.sans }}>
    <h1 style={{ 
      fontSize: typography.fontSize['3xl'], 
      fontWeight: typography.fontWeight.bold,
      marginBottom: '2rem',
      color: colors.neutral[900]
    }}>
      🌟 Sombras V7.0 Enhanced
    </h1>
    
    <p style={{ marginBottom: '2rem', color: colors.neutral[700] }}>
      Sistema de sombras aprimorado com efeitos de glass-morphism e sombras coloridas.
    </p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white',
        borderRadius: borderRadius.lg,
        boxShadow: shadows.sm
      }}>
        <strong>Shadow SM</strong>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600], margin: '0.5rem 0 0 0' }}>
          Sombra sutil para elementos básicos
        </p>
      </div>
      
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white',
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md
      }}>
        <strong>Shadow MD</strong>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600], margin: '0.5rem 0 0 0' }}>
          Sombra média para cards e containers
        </p>
      </div>
      
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white',
        borderRadius: borderRadius.lg,
        boxShadow: shadows.lg
      }}>
        <strong>Shadow LG</strong>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.neutral[600], margin: '0.5rem 0 0 0' }}>
          Sombra grande para elementos elevados
        </p>
      </div>
    </div>
  </div>
);

// Border Radius Story
export const BorderRadius = () => (
  <div style={{ padding: '2rem', fontFamily: typography.fontFamily.sans }}>
    <h1 style={{ 
      fontSize: typography.fontSize['3xl'], 
      fontWeight: typography.fontWeight.bold,
      marginBottom: '2rem',
      color: colors.neutral[900]
    }}>
      🔲 Border Radius
    </h1>
    
    <p style={{ marginBottom: '2rem', color: colors.neutral[700] }}>
      Sistema de cantos arredondados para diferentes níveis de suavidade.
    </p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
      {Object.entries(borderRadius).map(([key, value]) => (
        <div key={key} style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: colors.primary[100],
            borderRadius: value,
            margin: '0 auto 0.5rem',
            border: `2px solid ${colors.primary[300]}`
          }} />
          <div style={{ fontSize: typography.fontSize.xs, fontFamily: 'monospace', color: colors.neutral[700] }}>
            {key}: {value}
          </div>
        </div>
      ))}
    </div>
  </div>
); 