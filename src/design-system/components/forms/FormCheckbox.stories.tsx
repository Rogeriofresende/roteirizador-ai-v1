import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useState } from 'react';
import { FormCheckbox, FormCheckboxOption, FormCheckboxGroup } from './FormCheckbox';
import './FormCheckbox.css';

// Icons for demonstration
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H15.7V16H8.3V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

// Sample data
const simpleOptions: FormCheckboxOption[] = [
  { value: 'option1', label: 'First Option' },
  { value: 'option2', label: 'Second Option' },
  { value: 'option3', label: 'Third Option' },
  { value: 'option4', label: 'Fourth Option' }
];

const optionsWithIcons: FormCheckboxOption[] = [
  { 
    value: 'user', 
    label: 'User Management', 
    icon: <UserIcon />, 
    description: 'Manage users and permissions' 
  },
  { 
    value: 'security', 
    label: 'Security Settings', 
    icon: <ShieldIcon />, 
    description: 'Configure security policies' 
  },
  { 
    value: 'system', 
    label: 'System Configuration', 
    icon: <SettingsIcon />, 
    description: 'General system settings' 
  },
  { 
    value: 'reports', 
    label: 'Reports & Analytics', 
    icon: <FileIcon />, 
    description: 'View and generate reports',
    disabled: true 
  }
];

const groupedPermissions: FormCheckboxGroup[] = [
  {
    id: 'admin',
    label: 'Administrative Permissions',
    description: 'High-level system access',
    options: [
      { value: 'admin.users', label: 'Manage Users', description: 'Create, edit, and delete users' },
      { value: 'admin.system', label: 'System Configuration', description: 'Modify system settings' },
      { value: 'admin.security', label: 'Security Management', description: 'Configure security policies' }
    ],
    minSelections: 1
  },
  {
    id: 'content',
    label: 'Content Management',
    description: 'Content creation and editing',
    options: [
      { value: 'content.create', label: 'Create Content', description: 'Add new content items' },
      { value: 'content.edit', label: 'Edit Content', description: 'Modify existing content' },
      { value: 'content.delete', label: 'Delete Content', description: 'Remove content items' },
      { value: 'content.publish', label: 'Publish Content', description: 'Make content public' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & Reporting',
    description: 'Data analysis and reporting tools',
    options: [
      { value: 'analytics.view', label: 'View Analytics', description: 'Access analytics dashboards' },
      { value: 'analytics.export', label: 'Export Data', description: 'Download analytics data' },
      { value: 'analytics.custom', label: 'Custom Reports', description: 'Create custom analytics reports' }
    ]
  }
];

// V7.5 Enhanced FormCheckbox Story Configuration
const meta: Meta<typeof FormCheckbox> = {
  title: 'Design System/Forms/FormCheckbox',
  component: FormCheckbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# FormCheckbox V7.5 Enhanced

Professional checkbox component with grouped functionality, indeterminate states, and advanced validation.

## Key Features
- **4 Professional Variants**: Glass-morphism, Outlined, Filled, Minimal
- **Grouped Checkboxes**: Parent-child relationships with indeterminate states
- **Advanced Validation**: Group-level and individual checkbox validation
- **Keyboard Navigation**: Full accessibility with Tab, Space, Arrow key support
- **Custom Styling**: V7.5 Enhanced variants with professional animations
- **Performance**: Optimized state management for large checkbox groups

## V7.5 Enhanced Patterns
- Glass-morphism effects with backdrop blur
- Professional group layouts with hierarchy
- Smooth check/uncheck animations
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
      description: 'Visual variant of the checkbox'
    },
    size: {
      control: 'select', 
      options: ['sm', 'md', 'lg'],
      description: 'Size of the checkbox'
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
    checked: true,
    label: 'Glass Checkbox',
    description: 'V7.5 Enhanced glass-morphism with backdrop blur effects',
    helperText: 'Professional glass design with smooth animations'
  },
  parameters: {
    docs: {
      description: {
        story: 'Signature V7.5 Enhanced glass-morphism design with backdrop blur effects and smooth check animations.'
      }
    }
  }
};

/**
 * Professional Outlined - Enterprise Grade
 */
export const OutlinedProfessional: Story = {
  args: {
    variant: 'outlined',
    size: 'md',
    options: optionsWithIcons,
    defaultValue: ['user', 'security'],
    label: 'System Permissions',
    helperText: 'Select the permissions you want to grant',
    validationRules: [
      { type: 'minSelections', value: 1, message: 'At least one permission must be selected' }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Professional outlined variant with icons, descriptions, and validation rules.'
      }
    }
  }
};

/**
 * Grouped Checkboxes Showcase - Advanced Functionality
 */
export const GroupedCheckboxesShowcase: Story = {
  args: {
    variant: 'outlined',
    size: 'md',
    grouped: true,
    groups: groupedPermissions,
    defaultValue: ['admin.users', 'content.create', 'content.edit'],
    helperText: 'Configure user permissions by category',
    indeterminate: {
      enabled: true,
      showIcon: true,
      animationDuration: 300
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced grouped checkboxes with parent-child relationships and indeterminate states.'
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
      <FormCheckbox
        variant="glass"
        label="Glass Variant"
        checked={true}
        description="Glass-morphism design with backdrop blur"
        glassEffect="medium"
      />
      
      <FormCheckbox
        variant="outlined"
        label="Outlined Variant"
        checked={true}
        description="Professional outlined design"
      />
      
      <FormCheckbox
        variant="filled"
        label="Filled Variant"
        checked={true}
        description="Soft filled background design"
      />
      
      <FormCheckbox
        variant="minimal"
        label="Minimal Variant"
        checked={true}
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
      <FormCheckbox
        variant="outlined"
        size="sm"
        label="Small Size"
        checked={true}
        description="Compact size for tight layouts"
      />
      
      <FormCheckbox
        variant="outlined"
        size="md"
        label="Medium Size (Default)"
        checked={true}
        description="Standard size for most interfaces"
      />
      
      <FormCheckbox
        variant="outlined"
        size="lg"
        label="Large Size"
        checked={true}
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
 * Indeterminate States Demo
 */
export const IndeterminateStatesDemo: Story = {
  render: () => {
    const [selectedPermissions, setSelectedPermissions] = useState<(string | number)[]>([
      'admin.users', 
      'content.create'
    ]);
    
    return (
      <div style={{ width: '600px' }}>
        <FormCheckbox
          variant="outlined"
          grouped={true}
          groups={groupedPermissions}
          value={selectedPermissions}
          eventHandlers={{
            onChange: setSelectedPermissions
          }}
          indeterminate={{
            enabled: true,
            showIcon: true,
            animationDuration: 200,
            visualFeedback: 'both'
          }}
          helperText="Notice how parent checkboxes show indeterminate state when partially selected"
        />
        
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: '#f9fafb'
        }}>
          <strong>Selected Permissions:</strong>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            {selectedPermissions.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {selectedPermissions.map(perm => (
                  <li key={perm}>{String(perm)}</li>
                ))}
              </ul>
            ) : (
              <em>No permissions selected</em>
            )}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of indeterminate states with real-time selection tracking.'
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
      <FormCheckbox
        variant="outlined"
        label="Success State"
        checked={true}
        validationState="success"
        description="Successfully validated selection"
        helperText="This selection meets all requirements"
      />
      
      <FormCheckbox
        variant="outlined"
        label="Warning State"
        checked={true}
        validationState="warning"
        description="Selection with warning"
        helperText="Please review your selection"
      />
      
      <FormCheckbox
        variant="outlined"
        label="Error State"
        validationState="error"
        description="Invalid selection"
        errorText="This field is required"
      />
      
      <FormCheckbox
        variant="outlined"
        label="Neutral State"
        validationState="neutral"
        description="Normal checkbox state"
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
        <FormCheckbox
          variant="outlined"
          options={simpleOptions}
          defaultValue={['option1', 'option2']}
          layout={{ orientation: 'vertical', spacing: 'normal' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Horizontal Layout</h4>
        <FormCheckbox
          variant="outlined"
          options={simpleOptions}
          defaultValue={['option1', 'option3']}
          layout={{ orientation: 'horizontal', spacing: 'normal' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Grid Layout (2 Columns)</h4>
        <FormCheckbox
          variant="outlined"
          options={simpleOptions}
          defaultValue={['option2', 'option4']}
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
 * Custom Option Rendering
 */
export const CustomOptionRendering: Story = {
  render: () => {
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(['user']);
    
    const customRenderer = (option: FormCheckboxOption, isChecked: boolean) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        border: `2px solid ${isChecked ? '#2563eb' : '#e5e7eb'}`,
        borderRadius: '8px',
        background: isChecked ? '#eff6ff' : '#ffffff',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isChecked ? '#2563eb' : '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isChecked ? 'white' : '#6b7280'
        }}>
          {option.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: '600',
            color: isChecked ? '#2563eb' : '#111827',
            fontSize: '1rem'
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
        {isChecked && (
          <div style={{ color: '#2563eb' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        )}
      </div>
    );
    
    return (
      <div style={{ width: '500px' }}>
        <FormCheckbox
          variant="outlined"
          options={optionsWithIcons}
          value={selectedValues}
          eventHandlers={{ onChange: setSelectedValues }}
          customOptionRenderer={customRenderer}
          label="Custom Rendered Permissions"
          helperText="Custom card-style option rendering with enhanced visual feedback"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom option rendering with card-style layout and enhanced visual feedback.'
      }
    }
  }
};

/**
 * Advanced Validation Rules
 */
export const AdvancedValidationRules: Story = {
  render: () => {
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>([]);
    const [validationState, setValidationState] = useState({ isValid: true, errors: [] });
    
    const validationRules = [
      { type: 'required' as const, message: 'At least one option must be selected' },
      { type: 'minSelections' as const, value: 2, message: 'Please select at least 2 options' },
      { type: 'maxSelections' as const, value: 3, message: 'Maximum 3 options allowed' },
      { 
        type: 'custom' as const, 
        message: 'Security permission is required when user management is selected',
        validator: (values: (string | number)[]) => {
          if (values.includes('user') && !values.includes('security')) {
            return false;
          }
          return true;
        }
      }
    ];
    
    return (
      <div style={{ width: '600px' }}>
        <FormCheckbox
          variant="outlined"
          options={optionsWithIcons}
          value={selectedValues}
          eventHandlers={{
            onChange: setSelectedValues,
            onValidationChange: setValidationState as any
          }}
          validationRules={validationRules}
          validationState={validationState.isValid ? 'neutral' : 'error'}
          label="Advanced Validation Demo"
          helperText="Try different combinations to see validation rules in action"
          errorText={validationState.errors[0]}
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
            <li>At least one option required</li>
            <li>Minimum 2 selections</li>
            <li>Maximum 3 selections</li>
            <li>Security required when User Management is selected</li>
          </ul>
          
          <div>
            <strong>Current Status:</strong> {validationState.isValid ? '✅ Valid' : '❌ Invalid'}
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
          <li><kbd>Tab</kbd> - Navigate between checkboxes</li>
          <li><kbd>Space</kbd> / <kbd>Enter</kbd> - Toggle checkbox</li>
          <li><kbd>↑</kbd> / <kbd>↓</kbd> - Navigate within group</li>
          <li><kbd>Home</kbd> / <kbd>End</kbd> - First/last checkbox</li>
        </ul>
      </div>
      
      <FormCheckbox
        variant="outlined"
        grouped={true}
        groups={groupedPermissions.slice(0, 2)} // Limit for demo
        defaultValue={['admin.users', 'content.create']}
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
      <FormCheckbox
        variant="outlined"
        options={simpleOptions}
        defaultValue={['option1', 'option2']}
        disabled={true}
        label="Disabled State"
        helperText="All checkboxes are disabled and cannot be interacted with"
      />
      
      <FormCheckbox
        variant="outlined"
        options={[
          ...simpleOptions.slice(0, 2),
          { ...simpleOptions[2], disabled: true },
          simpleOptions[3]
        ]}
        defaultValue={['option1']}
        label="Partially Disabled"
        helperText="Some checkboxes are disabled while others remain interactive"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled states for entire component and individual checkboxes.'
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
        <FormCheckbox
          variant="outlined"
          options={simpleOptions}
          defaultValue={['option1', 'option2']}
          layout={{ spacing: 'compact' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Normal Spacing (Default)</h4>
        <FormCheckbox
          variant="outlined"
          options={simpleOptions}
          defaultValue={['option1', 'option3']}
          layout={{ spacing: 'normal' }}
        />
      </div>
      
      <div>
        <h4 style={{ marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>Relaxed Spacing</h4>
        <FormCheckbox
          variant="outlined"
          options={simpleOptions}
          defaultValue={['option2', 'option4']}
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
      grouped: false,
      glassEffect: 'medium' as const,
      disabled: false,
      spacing: 'normal' as const,
      orientation: 'vertical' as const
    });
    
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(['user']);
    
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
              Grouped:
              <input
                type="checkbox"
                checked={config.grouped}
                onChange={(e) => setConfig(prev => ({ ...prev, grouped: e.target.checked }))}
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
        
        {/* Interactive FormCheckbox */}
        <FormCheckbox
          variant={config.variant}
          size={config.size}
          glassEffect={config.glassEffect}
          grouped={config.grouped}
          groups={config.grouped ? groupedPermissions.slice(0, 2) : undefined}
          options={config.grouped ? undefined : optionsWithIcons}
          value={selectedValues}
          eventHandlers={{ onChange: setSelectedValues }}
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
          <strong>Selected Values:</strong>
          <div style={{ marginTop: '8px', fontFamily: 'monospace', background: '#ffffff', padding: '8px', borderRadius: '4px' }}>
            {JSON.stringify(selectedValues, null, 2)}
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

// Performance and edge cases story
export const PerformanceAndEdgeCases: Story = {
  render: () => {
    const largeOptions: FormCheckboxOption[] = Array.from({ length: 50 }, (_, i) => ({
      value: `option-${i}`,
      label: `Option ${i + 1}`,
      description: i % 5 === 0 ? `Description for option ${i + 1}` : undefined,
      disabled: i % 10 === 0
    }));
    
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>([]);
    const [renderTime, setRenderTime] = useState<number>(0);
    
    const handleChange = (values: (string | number)[]) => {
      const start = performance.now();
      setSelectedValues(values);
      setTimeout(() => {
        const end = performance.now();
        setRenderTime(end - start);
      }, 0);
    };
    
    return (
      <div style={{ width: '700px' }}>
        <div style={{
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: '#f9fafb',
          marginBottom: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Performance Metrics</h4>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '14px' }}>
            <span>Options: {largeOptions.length}</span>
            <span>Selected: {selectedValues.length}</span>
            <span>Last Render: {renderTime.toFixed(2)}ms</span>
          </div>
        </div>
        
        <FormCheckbox
          variant="outlined"
          options={largeOptions}
          value={selectedValues}
          eventHandlers={{ onChange: handleChange }}
          label="Performance Test (50 options)"
          layout={{ orientation: 'grid', columns: 3, spacing: 'compact' }}
          helperText="Performance optimized for large option lists with disabled items"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Performance testing with 50 options including disabled items and real-time metrics.'
      }
    }
  }
}; 