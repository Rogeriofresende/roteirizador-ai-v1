import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useState } from 'react';
import { FormRadio, FormRadioOption, FormRadioGroup } from './FormRadio';
import './FormRadio.css';

// Icons for demonstration
const PlanIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
    <path d="M2 17L12 22L22 17"/>
    <path d="M2 12L12 17L22 12"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H15.7V16H8.3V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.81,14.12L5.64,11.29L8.17,10.79C11.39,6.41 17.55,4.22 19.78,4.22C19.78,6.45 17.59,12.61 13.21,15.83L12.71,18.36L9.88,21.19C9.27,21.8 8.27,21.8 7.66,21.19L7.66,21.19L2.81,16.34C2.2,15.73 2.2,14.73 2.81,14.12Z"/>
  </svg>
);

// Sample data
const simpleOptions: FormRadioOption[] = [
  { value: 'option1', label: 'First Option' },
  { value: 'option2', label: 'Second Option' },
  { value: 'option3', label: 'Third Option' },
  { value: 'option4', label: 'Fourth Option' }
];

const planOptions: FormRadioOption[] = [
  { 
    value: 'basic', 
    label: 'Basic Plan', 
    icon: <PlanIcon />, 
    description: 'Perfect for getting started',
    badge: 'Most Popular'
  },
  { 
    value: 'pro', 
    label: 'Pro Plan', 
    icon: <RocketIcon />, 
    description: 'Best for growing businesses',
    badge: 'Recommended'
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise Plan', 
    icon: <ShieldIcon />, 
    description: 'For large organizations',
    disabled: true 
  }
];

const paymentMethods: FormRadioOption[] = [
  { 
    value: 'credit', 
    label: 'Credit Card', 
    icon: <CreditCardIcon />, 
    description: 'Visa, Mastercard, American Express',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop'
  },
  { 
    value: 'paypal', 
    label: 'PayPal', 
    icon: <CreditCardIcon />, 
    description: 'Pay with your PayPal account'
  },
  { 
    value: 'bank', 
    label: 'Bank Transfer', 
    icon: <CreditCardIcon />, 
    description: 'Direct bank transfer'
  }
];

const groupedOptions: FormRadioGroup[] = [
  {
    id: 'subscription',
    label: 'Subscription Plans',
    description: 'Choose your subscription tier',
    options: [
      { value: 'free', label: 'Free Plan', description: '10 projects, 1GB storage' },
      { value: 'starter', label: 'Starter Plan', description: '50 projects, 10GB storage', badge: '$9/mo' },
      { value: 'business', label: 'Business Plan', description: 'Unlimited projects, 100GB storage', badge: '$29/mo' }
    ]
  },
  {
    id: 'billing',
    label: 'Billing Frequency',
    description: 'Select how often you want to be billed',
    options: [
      { value: 'monthly', label: 'Monthly', description: 'Billed monthly' },
      { value: 'yearly', label: 'Yearly', description: '2 months free!', badge: 'Save 20%' }
    ]
  }
];

// V7.5 Enhanced FormRadio Story Configuration
const meta: Meta<typeof FormRadio> = {
  title: 'Design System/Forms/FormRadio',
  component: FormRadio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# FormRadio V7.5 Enhanced

Professional radio button component with card-style variants, radio groups, and advanced validation.

## Key Features
- **4 Professional Variants**: Glass-morphism, Outlined, Filled, Minimal
- **Card-Style Radio Options**: Rich content with images, icons, and badges
- **Radio Groups**: Organized selection with grouped options
- **Advanced Validation**: Required selection and custom validation rules
- **Keyboard Navigation**: Full accessibility with Arrow key navigation
- **Custom Styling**: V7.5 Enhanced variants with professional animations

## V7.5 Enhanced Patterns
- Glass-morphism effects with backdrop blur
- Professional card layouts with hover effects
- Smooth selection animations with radio dots
- Mobile-responsive design with touch targets
- Enterprise-grade accessibility (WCAG 2.1 AA)
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['glass', 'outlined', 'filled', 'minimal'],
      description: 'Visual variant of the radio buttons'
    },
    size: {
      control: 'select', 
      options: ['sm', 'md', 'lg'],
      description: 'Size of the radio buttons'
    },
    glassEffect: {
      control: 'select',
      options: ['subtle', 'medium', 'strong'],
      description: 'Intensity of glass-morphism effect'
    },
    validationState: {
      control: 'select',
      options: ['neutral', 'success', 'warning', 'error'],
      description: 'Current validation state'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// ==========================================
// 🔵 IA BETA - VISUAL EXCELLENCE STORIES
// ==========================================

/**
 * Glass Variant - V7.5 Enhanced Signature Design
 */
export const GlassVariant: Story = {
  args: {
    variant: 'glass',
    size: 'md',
    glassEffect: 'medium',
    value: 'option2',
    options: simpleOptions,
    label: 'Glass Radio Buttons',
    description: 'V7.5 Enhanced glass-morphism with backdrop blur effects',
    helperText: 'Professional glass design with smooth selection animations'
  },
  parameters: {
    docs: {
      description: {
        story: 'Signature V7.5 Enhanced glass-morphism design with backdrop blur effects and smooth radio dot animations.'
      }
    }
  }
};

/**
 * Card Style Showcase - Modern Radio Cards
 */
export const CardStyleShowcase: Story = {
  args: {
    variant: 'outlined',
    size: 'md',
    options: planOptions,
    defaultValue: 'basic',
    label: 'Select Your Plan',
    cardStyle: {
      enabled: true,
      variant: 'elevated',
      size: 'md',
      showIcon: true,
      showDescription: true,
      showBadge: true,
      hoverEffect: 'lift'
    },
    helperText: 'Card-style radio options with rich content and visual feedback'
  },
  parameters: {
    docs: {
      description: {
        story: 'Card-style radio buttons with icons, descriptions, badges, and professional hover effects.'
      }
    }
  }
};

/**
 * Payment Method Cards - Real-world Example
 */
export const PaymentMethodCards: Story = {
  args: {
    variant: 'filled',
    size: 'lg',
    options: paymentMethods,
    defaultValue: 'credit',
    label: 'Payment Method',
    cardStyle: {
      enabled: true,
      variant: 'default',
      size: 'lg',
      showIcon: true,
      showDescription: true,
      hoverEffect: 'border'
    },
    layout: { orientation: 'grid', columns: 3, spacing: 'normal' },
    helperText: 'Select your preferred payment method'
  },
  parameters: {
    docs: {
      description: {
        story: 'Real-world example of payment method selection with card-style radio options and grid layout.'
      }
    }
  }
};

/**
 * Grouped Radio Options - Advanced Organization
 */
export const GroupedRadioOptions: Story = {
  args: {
    variant: 'outlined',
    size: 'md',
    grouped: true,
    groups: groupedOptions,
    defaultValue: 'starter',
    helperText: 'Configure your subscription settings',
    validationRules: [
      { type: 'required', message: 'Please select a subscription plan' }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced grouped radio options with organized sections and validation rules.'
      }
    }
  }
};

/**
 * All Variants Comparison
 */
export const AllVariantsComparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '800px' }}>
      <FormRadio
        variant="glass"
        label="Glass Variant"
        options={simpleOptions}
        defaultValue="option1"
        description="Glass-morphism design with backdrop blur"
        glassEffect="medium"
      />
      
      <FormRadio
        variant="outlined"
        label="Outlined Variant"
        options={simpleOptions}
        defaultValue="option1"
        description="Professional outlined design"
      />
      
      <FormRadio
        variant="filled"
        label="Filled Variant"
        options={simpleOptions}
        defaultValue="option1"
        description="Soft filled background design"
      />
      
      <FormRadio
        variant="minimal"
        label="Minimal Variant"
        options={simpleOptions}
        defaultValue="option1"
        description="Clean minimal design"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all four variants showcasing different design approaches.'
      }
    }
  }
};

/**
 * Size Variations
 */
export const SizeVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '400px' }}>
      <FormRadio
        variant="outlined"
        size="sm"
        label="Small Size"
        options={simpleOptions}
        defaultValue="option1"
        description="Compact size for tight layouts"
      />
      
      <FormRadio
        variant="outlined"
        size="md"
        label="Medium Size (Default)"
        options={simpleOptions}
        defaultValue="option1"
        description="Standard size for most interfaces"
      />
      
      <FormRadio
        variant="outlined"
        size="lg"
        label="Large Size"
        options={simpleOptions}
        defaultValue="option1"
        description="Large size with generous spacing"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different size variants: small, medium, and large with appropriate spacing and touch targets.'
      }
    }
  }
};

/**
 * Validation States Showcase
 */
export const ValidationStatesShowcase: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '800px' }}>
      <FormRadio
        variant="outlined"
        label="Success State"
        options={simpleOptions}
        defaultValue="option1"
        validationState="success"
        description="Successfully selected option"
        helperText="Your selection is valid"
      />
      
      <FormRadio
        variant="outlined"
        label="Warning State"
        options={simpleOptions}
        defaultValue="option2"
        validationState="warning"
        description="Selection with warning"
        helperText="Please review your selection"
      />
      
      <FormRadio
        variant="outlined"
        label="Error State"
        options={simpleOptions}
        validationState="error"
        description="Invalid selection"
        errorText="This field is required"
        required
      />
      
      <FormRadio
        variant="outlined"
        label="Neutral State"
        options={simpleOptions}
        validationState="neutral"
        description="Normal radio button state"
        helperText="Make your selection"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different validation states with appropriate colors and feedback messages.'
      }
    }
  }
};

/**
 * Layout Orientations
 */
export const LayoutOrientations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '700px' }}>
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Vertical Layout (Default)</h4>
        <FormRadio
          variant="outlined"
          options={simpleOptions}
          defaultValue="option1"
          layout={{ orientation: 'vertical', spacing: 'normal' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Horizontal Layout</h4>
        <FormRadio
          variant="outlined"
          options={simpleOptions}
          defaultValue="option2"
          layout={{ orientation: 'horizontal', spacing: 'normal' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Grid Layout (2 Columns)</h4>
        <FormRadio
          variant="outlined"
          options={simpleOptions}
          defaultValue="option3"
          layout={{ orientation: 'grid', columns: 2, spacing: 'normal' }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different layout orientations: vertical, horizontal, and grid with configurable columns.'
      }
    }
  }
};

/**
 * Custom Card Rendering
 */
export const CustomCardRendering: Story = {
  render: () => {
    const [selectedValue, setSelectedValue] = useState<string | number | null>('pro');
    
    const customRenderer = (option: FormRadioOption, isSelected: boolean) => (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px',
        border: `2px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
        borderRadius: '12px',
        background: isSelected ? '#eff6ff' : '#ffffff',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        minHeight: '120px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              color: isSelected ? '#2563eb' : '#6b7280',
              fontSize: '24px'
            }}>
              {option.icon}
            </div>
            <div>
              <div style={{
                fontWeight: '600',
                color: isSelected ? '#2563eb' : '#111827',
                fontSize: '1.125rem'
              }}>
                {option.label}
              </div>
              {option.description && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>
                  {option.description}
                </div>
              )}
            </div>
          </div>
          
          {option.badge && (
            <div style={{
              background: isSelected ? '#2563eb' : '#f59e0b',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {option.badge}
            </div>
          )}
        </div>
        
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'white'
            }} />
          </div>
        )}
      </div>
    );
    
    return (
      <div style={{ width: '600px' }}>
        <FormRadio
          variant="outlined"
          options={planOptions}
          value={selectedValue}
          eventHandlers={{ onChange: setSelectedValue }}
          customOptionRenderer={customRenderer}
          label="Custom Rendered Plans"
          helperText="Custom card-style option rendering with enhanced visual feedback"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom option rendering with enhanced card-style layout and professional visual feedback.'
      }
    }
  }
};

/**
 * Advanced Validation Rules
 */
export const AdvancedValidationRules: Story = {
  render: () => {
    const [selectedValue, setSelectedValue] = useState<string | number | null>(null);
    const [validationState, setValidationState] = useState({ isValid: true, errors: [] });
    
    const validationRules = [
      { type: 'required' as const, message: 'Please select an option' },
      { 
        type: 'custom' as const, 
        message: 'Enterprise plan is currently unavailable',
        validator: (value: string | number | null) => {
          return value !== 'enterprise';
        }
      }
    ];
    
    return (
      <div style={{ width: '600px' }}>
        <FormRadio
          variant="outlined"
          options={planOptions}
          value={selectedValue}
          eventHandlers={{
            onChange: setSelectedValue,
            onValidationChange: setValidationState as any
          }}
          validationRules={validationRules}
          validationState={validationState.isValid ? 'neutral' : 'error'}
          label="Advanced Validation Demo"
          helperText="Try selecting different options to see validation rules in action"
          errorText={validationState.errors[0]}
          required
        />
        
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: '#f9fafb',
          fontSize: '0.875rem'
        }}>
          <strong>Validation Rules:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>Selection is required</li>
            <li>Enterprise plan is currently unavailable</li>
          </ul>
          
          <div>
            <strong>Current Status:</strong> {validationState.isValid ? '✅ Valid' : '❌ Invalid'}
          </div>
          
          <div>
            <strong>Selected Value:</strong> {selectedValue || 'None'}
          </div>
          
          {validationState.errors.length > 0 && (
            <div style={{ marginTop: '0.5rem', color: '#ef4444' }}>
              <strong>Errors:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                {validationState.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced validation rules including custom validators with real-time feedback.'
      }
    }
  }
};

/**
 * Keyboard Navigation Demo
 */
export const KeyboardNavigationDemo: Story = {
  render: () => (
    <div style={{ width: '600px' }}>
      <div style={{
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        <strong>Keyboard Navigation:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li><kbd>Tab</kbd> - Navigate between radio groups</li>
          <li><kbd>↑</kbd> / <kbd>↓</kbd> - Navigate within radio group</li>
          <li><kbd>Space</kbd> / <kbd>Enter</kbd> - Select radio option</li>
          <li><kbd>Home</kbd> / <kbd>End</kbd> - First/last radio option</li>
        </ul>
      </div>
      
      <FormRadio
        variant="outlined"
        grouped={true}
        groups={groupedOptions.slice(0, 1)} // Limit for demo
        defaultValue="starter"
        label="Keyboard Navigation Test"
        helperText="Focus this component and try the keyboard shortcuts above"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full keyboard navigation support with comprehensive shortcuts for accessibility.'
      }
    }
  }
};

/**
 * Loading and Disabled States
 */
export const LoadingAndDisabledStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '800px' }}>
      <FormRadio
        variant="outlined"
        options={simpleOptions}
        defaultValue="option1"
        disabled={true}
        label="Disabled State"
        helperText="All radio options are disabled and cannot be selected"
      />
      
      <FormRadio
        variant="outlined"
        options={[
          ...simpleOptions.slice(0, 2),
          { ...simpleOptions[2], disabled: true },
          simpleOptions[3]
        ]}
        defaultValue="option1"
        label="Partially Disabled"
        helperText="Some radio options are disabled while others remain selectable"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled states for entire component and individual radio options.'
      }
    }
  }
};

/**
 * Spacing Variations
 */
export const SpacingVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '500px' }}>
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Compact Spacing</h4>
        <FormRadio
          variant="outlined"
          options={simpleOptions}
          defaultValue="option1"
          layout={{ spacing: 'compact' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Normal Spacing (Default)</h4>
        <FormRadio
          variant="outlined"
          options={simpleOptions}
          defaultValue="option2"
          layout={{ spacing: 'normal' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Relaxed Spacing</h4>
        <FormRadio
          variant="outlined"
          options={simpleOptions}
          defaultValue="option3"
          layout={{ spacing: 'relaxed' }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different spacing options: compact, normal, and relaxed for various layout needs.'
      }
    }
  }
};

/**
 * Interactive Playground
 */
export const InteractivePlayground: Story = {
  render: () => {
    const [config, setConfig] = useState({
      variant: 'outlined' as const,
      size: 'md' as const,
      cardStyle: false,
      glassEffect: 'medium' as const,
      disabled: false,
      spacing: 'normal' as const,
      orientation: 'vertical' as const
    });
    
    const [selectedValue, setSelectedValue] = useState<string | number | null>('basic');
    
    return (
      <div style={{ width: '800px' }}>
        {/* Configuration Panel */}
        <div style={{
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: '#f9fafb',
          marginBottom: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Inter, sans-serif' }}>Configuration</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <label>
              Variant:
              <select
                value={config.variant}
                onChange={(e) => setConfig(prev => ({ ...prev, variant: e.target.value as any }))}
                style={{ marginLeft: '8px', padding: '4px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="glass">Glass</option>
                <option value="outlined">Outlined</option>
                <option value="filled">Filled</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>
            
            <label>
              Size:
              <select
                value={config.size}
                onChange={(e) => setConfig(prev => ({ ...prev, size: e.target.value as any }))}
                style={{ marginLeft: '8px', padding: '4px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </label>
            
            <label>
              Card Style:
              <input
                type="checkbox"
                checked={config.cardStyle}
                onChange={(e) => setConfig(prev => ({ ...prev, cardStyle: e.target.checked }))}
                style={{ marginLeft: '8px' }}
              />
            </label>
            
            <label>
              Orientation:
              <select
                value={config.orientation}
                onChange={(e) => setConfig(prev => ({ ...prev, orientation: e.target.value as any }))}
                style={{ marginLeft: '8px', padding: '4px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
                <option value="grid">Grid</option>
              </select>
            </label>
            
            <label>
              Spacing:
              <select
                value={config.spacing}
                onChange={(e) => setConfig(prev => ({ ...prev, spacing: e.target.value as any }))}
                style={{ marginLeft: '8px', padding: '4px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </label>
            
            <label>
              Disabled:
              <input
                type="checkbox"
                checked={config.disabled}
                onChange={(e) => setConfig(prev => ({ ...prev, disabled: e.target.checked }))}
                style={{ marginLeft: '8px' }}
              />
            </label>
          </div>
        </div>
        
        {/* Interactive FormRadio */}
        <FormRadio
          variant={config.variant}
          size={config.size}
          glassEffect={config.glassEffect}
          options={planOptions}
          value={selectedValue}
          eventHandlers={{ onChange: setSelectedValue }}
          cardStyle={config.cardStyle ? {
            enabled: true,
            variant: 'default',
            showIcon: true,
            showDescription: true,
            showBadge: true,
            hoverEffect: 'lift'
          } : { enabled: false }}
          layout={{ 
            orientation: config.orientation,
            spacing: config.spacing,
            columns: config.orientation === 'grid' ? 2 : undefined
          }}
          disabled={config.disabled}
          label="Interactive Playground"
          helperText="Use the configuration panel above to experiment with different settings"
        />
        
        {/* Current Value Display */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: '#f9fafb',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <strong>Selected Value:</strong>
          <div style={{ marginTop: '8px', fontFamily: 'monospace', background: '#ffffff', padding: '8px', borderRadius: '4px' }}>
            {JSON.stringify(selectedValue, null, 2)}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive playground with live configuration controls and real-time value display.'
      }
    }
  }
}; 