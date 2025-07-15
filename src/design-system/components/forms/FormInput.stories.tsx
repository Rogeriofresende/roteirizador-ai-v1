import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useState } from 'react';
import { FormInput } from './FormInput';
import './FormInput.css';

// Icons for demonstration
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

// V7.5 Enhanced FormInput Story Configuration
const meta: Meta<typeof FormInput> = {
  title: 'Design System/Forms/FormInput',
  component: FormInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# FormInput - V7.5 Enhanced Professional Input Component

Enterprise-grade input component with glass-morphism effects, enhanced validation, and comprehensive accessibility compliance. Built following V7.5 Enhanced methodology with TypeScript 100% coverage and performance optimization.

## ✨ V7.5 Enhanced Features:
- **Glass-morphism Design:** 5 professional variants with backdrop blur effects
- **Enhanced Validation:** Real-time feedback with smooth animations and comprehensive rule engine
- **Icon Integration:** Leading/trailing icons with proper spacing and semantic meaning
- **Floating Labels:** Smooth animation with focus states and accessibility compliance
- **Accessibility First:** WCAG 2.1 AA compliance with screen reader optimization
- **Mobile Optimized:** Touch-friendly responsive design with 44px minimum targets
- **Performance Excellence:** Debounced validation, memoized callbacks, optimized renders

## 🎨 Design Variants:
- **Glass**: Modern glass-morphism with backdrop blur and translucency
- **Outlined**: Professional border design with subtle shadows
- **Filled**: Subtle background with smooth hover transitions
- **Minimal**: Clean underline design for modern interfaces
- **Floating**: Elevated design with depth and hover animations

## 🔧 Technical Excellence:
- **TypeScript Coverage**: 100% type safety with comprehensive interfaces
- **Validation Engine**: Built-in rules (required, email, pattern, custom) with async support
- **Performance Optimized**: Debounced input, memoized validation, efficient re-renders
- **Memory Efficient**: Proper cleanup, optimized event handlers, no memory leaks

## 🎯 UX Optimization:
- **Progressive Enhancement**: Works without JavaScript, enhanced with React
- **Error Prevention**: Real-time validation with clear feedback
- **Cognitive Load**: Maximum 3 decisions per interaction
- **Positive Reinforcement**: Success states with smooth animations

## ♿ Accessibility Features:
- **Semantic HTML**: Proper form structure with labels and ARIA attributes
- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader**: Live regions for validation announcements
- **High Contrast**: Support for high contrast mode and custom themes
- **Reduced Motion**: Respects user motion preferences
        `,
      },
    },
    backgrounds: {
      default: 'v7-enhanced-gradient',
      values: [
        {
          name: 'v7-enhanced-gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1f2937',
        },
      ],
    },
  },
  tags: ['autodocs', 'design-system', 'v7-enhanced', 'forms'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['glass', 'outlined', 'filled', 'minimal', 'floating'],
      description: 'Visual variant of the input field',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input field',
    },
    glassEffect: {
      control: 'select',
      options: ['subtle', 'medium', 'strong'],
      description: 'Intensity of glass-morphism effect (glass variant only)',
    },
    validationState: {
      control: 'select',
      options: ['neutral', 'success', 'warning', 'error'],
      description: 'Current validation state',
    },
    floatingLabel: {
      control: 'boolean',
      description: 'Enable floating label animation',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input field',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    validateOnChange: {
      control: 'boolean',
      description: 'Validate input on every change',
    },
    validateOnBlur: {
      control: 'boolean',
      description: 'Validate input when focus is lost',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// STORY 1: GLASS VARIANT - V7.5 ENHANCED SIGNATURE
// ============================================================================

export const GlassVariant: Story = {
  args: {
    variant: 'glass',
    size: 'md',
    glassEffect: 'medium',
    label: 'Glass-morphism Input',
    placeholder: 'Enter your text...',
    helperText: 'This input features V7.5 Enhanced glass-morphism effects',
  },
  parameters: {
    docs: {
      description: {
        story: 'Signature V7.5 Enhanced glass-morphism variant with backdrop blur and translucency effects. Perfect for modern, professional interfaces.',
      },
    },
  },
};

// ============================================================================
// STORY 2: OUTLINED PROFESSIONAL
// ============================================================================

export const OutlinedProfessional: Story = {
  args: {
    variant: 'outlined',
    size: 'md',
    label: 'Professional Input',
    placeholder: 'Enterprise-grade styling',
    leadingIcon: <UserIcon />,
    helperText: 'Professional outlined variant with leading icon',
  },
  parameters: {
    docs: {
      description: {
        story: 'Professional outlined variant with subtle shadows and enterprise-grade styling. Ideal for business applications.',
      },
    },
  },
};

// ============================================================================
// STORY 3: FLOATING LABEL ANIMATION
// ============================================================================

export const FloatingLabelAnimation: Story = {
  args: {
    variant: 'glass',
    size: 'md',
    floatingLabel: true,
    label: 'Floating Label',
    leadingIcon: <MailIcon />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Smooth floating label animation with glass-morphism effects. Label animates smoothly on focus and when input has value.',
      },
    },
  },
};

// ============================================================================
// STORY 4: VALIDATION STATES SHOWCASE
// ============================================================================

export const ValidationStatesShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <FormInput
        variant="glass"
        label="Neutral State"
        placeholder="Default input state"
        helperText="Enter your information"
        validationState="neutral"
      />
      <FormInput
        variant="glass"
        label="Success State"
        placeholder="Valid input"
        value="Valid input value"
        helperText="Perfect! This input is valid"
        validationState="success"
        trailingIcon={<CheckIcon />}
      />
      <FormInput
        variant="glass"
        label="Warning State"
        placeholder="Warning input"
        value="Warning value"
        helperText="Please double-check this information"
        validationState="warning"
        trailingIcon={<WarningIcon />}
      />
      <FormInput
        variant="glass"
        label="Error State"
        placeholder="Invalid input"
        value="Invalid"
        errorMessage="This field is required and must be valid"
        validationState="error"
        trailingIcon={<ErrorIcon />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all validation states with appropriate colors, icons, and messages. Demonstrates real-time feedback system.',
      },
    },
  },
};

// ============================================================================
// STORY 5: ALL VARIANTS COMPARISON
// ============================================================================

export const AllVariantsComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <FormInput
        variant="glass"
        label="Glass Variant"
        placeholder="Glass-morphism effects"
        helperText="Modern glass design with backdrop blur"
      />
      <FormInput
        variant="outlined"
        label="Outlined Variant"
        placeholder="Professional borders"
        helperText="Enterprise-grade outlined design"
      />
      <FormInput
        variant="filled"
        label="Filled Variant"
        placeholder="Subtle background"
        helperText="Soft filled background design"
      />
      <FormInput
        variant="minimal"
        label="Minimal Variant"
        placeholder="Clean underline"
        helperText="Minimalist underline design"
      />
      <FormInput
        variant="floating"
        label="Floating Variant"
        placeholder="Elevated design"
        helperText="Floating design with depth effects"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all 5 V7.5 Enhanced variants, showcasing the design flexibility and consistency across different styles.',
      },
    },
  },
};

// ============================================================================
// STORY 6: SIZE VARIATIONS
// ============================================================================

export const SizeVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <FormInput
        variant="glass"
        size="sm"
        label="Small Size"
        placeholder="Compact design"
        helperText="Small size for compact layouts"
      />
      <FormInput
        variant="glass"
        size="md"
        label="Medium Size (Default)"
        placeholder="Standard design"
        helperText="Medium size for most use cases"
      />
      <FormInput
        variant="glass"
        size="lg"
        label="Large Size"
        placeholder="Prominent design"
        helperText="Large size for emphasis and better accessibility"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Three size variations optimized for different use cases and accessibility requirements. Large size provides 44px minimum touch target.',
      },
    },
  },
};

// ============================================================================
// STORY 7: WITH ICONS SHOWCASE
// ============================================================================

export const WithIconsShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <FormInput
        variant="glass"
        label="Search Input"
        placeholder="Search anything..."
        leadingIcon={<SearchIcon />}
        helperText="Leading icon for context"
      />
      <FormInput
        variant="glass"
        label="Password Input"
        type="password"
        placeholder="Enter password"
        trailingIcon={<EyeIcon />}
        helperText="Trailing icon for actions"
      />
      <FormInput
        variant="glass"
        label="Email Verified"
        type="email"
        value="user@example.com"
        leadingIcon={<MailIcon />}
        trailingIcon={<CheckIcon />}
        validationState="success"
        helperText="Both leading and trailing icons"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon integration examples showing semantic meaning and visual hierarchy. Icons provide context and interactive functionality.',
      },
    },
  },
};

// ============================================================================
// STORY 8: VALIDATION RULES DEMO
// ============================================================================

export const ValidationRulesDemo: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const emailRules = [
      { type: 'required' as const, message: 'Email is required' },
      { type: 'email' as const, message: 'Please enter a valid email address' },
    ];
    
    const passwordRules = [
      { type: 'required' as const, message: 'Password is required' },
      { type: 'minLength' as const, value: 8, message: 'Password must be at least 8 characters' },
      { 
        type: 'custom' as const, 
        message: 'Password must contain at least one number',
        validator: (value: string) => /\d/.test(value)
      },
    ];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <FormInput
          variant="glass"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          validationRules={emailRules}
          validateOnChange={true}
          leadingIcon={<MailIcon />}
          helperText="Real-time email validation"
        />
        <FormInput
          variant="glass"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          validationRules={passwordRules}
          validateOnChange={true}
          trailingIcon={<EyeIcon />}
          helperText="Custom validation rules with real-time feedback"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive validation system with custom rules. Demonstrates real-time validation, error messages, and success states.',
      },
    },
  },
};

// ============================================================================
// STORY 9: LOADING AND DISABLED STATES
// ============================================================================

export const LoadingAndDisabledStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <FormInput
        variant="glass"
        label="Loading Input"
        placeholder="Processing..."
        loading={true}
        helperText="Input is being processed"
      />
      <FormInput
        variant="glass"
        label="Disabled Input"
        placeholder="Cannot be edited"
        value="Disabled value"
        disabled={true}
        helperText="This input is disabled"
      />
      <FormInput
        variant="glass"
        label="Loading with Icon"
        placeholder="Validating..."
        loading={true}
        leadingIcon={<UserIcon />}
        helperText="Loading state with leading icon"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading and disabled states with proper accessibility attributes and visual feedback. Loading spinner replaces trailing icon.',
      },
    },
  },
};

// ============================================================================
// STORY 10: INTERACTIVE PLAYGROUND
// ============================================================================

export const InteractivePlayground: Story = {
  args: {
    variant: 'glass',
    size: 'md',
    glassEffect: 'medium',
    label: 'Interactive Playground',
    placeholder: 'Customize me with controls!',
    helperText: 'Use the controls panel to experiment with all features',
    floatingLabel: false,
    disabled: false,
    loading: false,
    validateOnChange: false,
    validateOnBlur: true,
    validationState: 'neutral',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all FormInput features. Use the controls panel to test different combinations.',
      },
    },
  },
};

// ============================================================================
// STORY 11: ACCESSIBILITY SHOWCASE
// ============================================================================

export const AccessibilityShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <FormInput
        variant="glass"
        label="Screen Reader Optimized"
        placeholder="Full name"
        ariaLabel="Enter your full name"
        screenReaderText="This field is for entering your full legal name as it appears on official documents"
        helperText="ARIA labels and screen reader text included"
        validationRules={[{ type: 'required', message: 'Full name is required' }]}
      />
      <FormInput
        variant="glass"
        label="Required Field"
        placeholder="Required information"
        validationRules={[{ type: 'required', message: 'This field is required' }]}
        helperText="Required field with proper ARIA attributes"
      />
      <FormInput
        variant="glass"
        label="High Contrast Support"
        placeholder="Accessible design"
        helperText="Supports high contrast mode and custom themes"
        leadingIcon={<UserIcon />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive accessibility features including ARIA labels, screen reader text, required field indicators, and high contrast support.',
      },
    },
  },
};

// ============================================================================
// STORY 12: MOBILE RESPONSIVE DEMO
// ============================================================================

export const MobileResponsiveDemo: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile-optimized design with 44px minimum touch targets, adjusted spacing, and responsive typography. Test on different viewport sizes.',
      },
    },
  },
  render: () => (
    <div style={{ width: '100%', padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormInput
          variant="glass"
          size="lg"
          label="Mobile Optimized"
          placeholder="Touch-friendly design"
          helperText="Large size ensures 44px minimum touch target"
        />
        <FormInput
          variant="glass"
          size="md"
          floatingLabel={true}
          label="Mobile Floating Label"
          leadingIcon={<SearchIcon />}
          helperText="Optimized for mobile interaction"
        />
      </div>
    </div>
  ),
};

// ============================================================================
// STORY 13: FORM INTEGRATION EXAMPLE
// ============================================================================

export const FormIntegrationExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    
    const handleInputChange = (field: string) => (value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    return (
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormInput
            variant="glass"
            label="First Name"
            value={formData.firstName}
            onValueChange={handleInputChange('firstName')}
            validationRules={[{ type: 'required', message: 'First name is required' }]}
            validateOnBlur={true}
          />
          <FormInput
            variant="glass"
            label="Last Name"
            value={formData.lastName}
            onValueChange={handleInputChange('lastName')}
            validationRules={[{ type: 'required', message: 'Last name is required' }]}
            validateOnBlur={true}
          />
        </div>
        <FormInput
          variant="glass"
          label="Email Address"
          type="email"
          value={formData.email}
          onValueChange={handleInputChange('email')}
          leadingIcon={<MailIcon />}
          validationRules={[
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
          validateOnChange={true}
        />
        <FormInput
          variant="glass"
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onValueChange={handleInputChange('phone')}
          placeholder="(555) 123-4567"
          helperText="US phone number format"
        />
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete form integration example showing multiple FormInput components working together with state management and validation.',
      },
    },
  },
};

// ============================================================================
// STORY 14: GLASS EFFECT INTENSITY
// ============================================================================

export const GlassEffectIntensity: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <FormInput
        variant="glass"
        glassEffect="subtle"
        label="Subtle Glass Effect"
        placeholder="Light glass-morphism"
        helperText="Subtle backdrop blur and transparency"
      />
      <FormInput
        variant="glass"
        glassEffect="medium"
        label="Medium Glass Effect"
        placeholder="Balanced glass-morphism"
        helperText="Medium backdrop blur for most use cases"
      />
      <FormInput
        variant="glass"
        glassEffect="strong"
        label="Strong Glass Effect"
        placeholder="Intense glass-morphism"
        helperText="Strong backdrop blur for dramatic effect"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of glass-morphism effect intensities from subtle to strong. Choose based on background complexity and desired visual impact.',
      },
    },
  },
};

// ============================================================================
// STORY 15: ENTERPRISE THEME DEMO
// ============================================================================

export const EnterpriseThemeDemo: Story = {
  render: () => (
    <div style={{ 
      background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
      padding: '2rem',
      borderRadius: '1rem',
      color: 'white'
    }}>
      <h3 style={{ marginBottom: '1.5rem', color: 'white' }}>Enterprise Application Form</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <FormInput
          variant="glass"
          label="Employee ID"
          placeholder="Enter your employee ID"
          leadingIcon={<UserIcon />}
          validationRules={[{ type: 'required', message: 'Employee ID is required' }]}
        />
        <FormInput
          variant="glass"
          label="Department Email"
          type="email"
          placeholder="department@company.com"
          leadingIcon={<MailIcon />}
          validationRules={[
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
          validateOnChange={true}
        />
        <FormInput
          variant="glass"
          label="Security Code"
          type="password"
          placeholder="Enter security code"
          trailingIcon={<EyeIcon />}
          validationRules={[
            { type: 'required', message: 'Security code is required' },
            { type: 'minLength', value: 6, message: 'Minimum 6 characters' }
          ]}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Enterprise application theme demonstration showing how FormInput adapts to professional contexts with dark backgrounds.',
      },
    },
  },
};

// ============================================================================
// STORY 16: PERFORMANCE DEMO WITH ANALYTICS
// ============================================================================

export const PerformanceDemoWithAnalytics: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [analyticsEvents, setAnalyticsEvents] = useState<string[]>([]);
    
    const logEvent = (event: string) => {
      setAnalyticsEvents(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${event}`]);
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <FormInput
          variant="glass"
          label="Performance Monitored Input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onValueChange={(val) => logEvent(`Value changed to: ${val}`)}
          onFocusChange={(focused) => logEvent(`Focus ${focused ? 'gained' : 'lost'}`)}
          onValidationChange={(valid, errors) => logEvent(`Validation: ${valid ? 'valid' : 'invalid'} (${errors.length} errors)`)}
          validationRules={[
            { type: 'required', message: 'This field is required' },
            { type: 'minLength', value: 3, message: 'Minimum 3 characters' }
          ]}
          validateOnChange={true}
          debounceMs={300}
          trackingId="perf-demo-input"
          analyticsEvent="input-interaction"
          helperText="Type to see performance monitoring in action"
        />
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.05)', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          <strong>Analytics Events:</strong>
          {analyticsEvents.length === 0 ? (
            <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Start typing to see events...</div>
          ) : (
            analyticsEvents.map((event, index) => (
              <div key={index} style={{ marginTop: '0.25rem' }}>{event}</div>
            ))
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance demonstration with analytics integration. Shows debounced validation, event tracking, and optimized re-renders.',
      },
    },
  },
};

// Export all stories for comprehensive documentation
/*
export {
  GlassVariant,
  OutlinedProfessional,
  FloatingLabelAnimation,
  ValidationStatesShowcase,
  AllVariantsComparison,
  SizeVariations,
  WithIconsShowcase,
  ValidationRulesDemo,
  LoadingAndDisabledStates,
  InteractivePlayground,
  AccessibilityShowcase,
  MobileResponsiveDemo,
  FormIntegrationExample,
  GlassEffectIntensity,
  EnterpriseThemeDemo,
  PerformanceDemoWithAnalytics,
}; 
*/ 