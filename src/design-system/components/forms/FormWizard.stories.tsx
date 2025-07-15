import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FormWizard, FormWizardStep } from './FormWizard';
import { FormValidation } from './FormValidation';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { FormSelect } from './FormSelect';
import { FormCheckbox } from './FormCheckbox';
import { FormRadio } from './FormRadio';
import { FormSubmit } from './FormSubmit';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Check, 
  Settings,
  Star,
  Shield
} from 'lucide-react';
import './FormWizard.css';

// ============================================================================
// OPTIMIZED MOCK VALIDATION
// ============================================================================

const createMockValidation = (required: string[] = [], minLength: Record<string, number> = {}) => {
  return async (stepData: Record<string, any>) => {
    const errors: string[] = [];
    
    required.forEach(field => {
      if (!stepData[field] || stepData[field].trim() === '') {
        errors.push(`${field} is required`);
      }
    });
    
    Object.entries(minLength).forEach(([field, min]) => {
      if (stepData[field] && stepData[field].length < min) {
        errors.push(`${field} must be at least ${min} characters`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      canProceed: errors.length === 0
    };
  };
};

// ============================================================================
// OPTIMIZED STEPS
// ============================================================================

const basicSteps: FormWizardStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Enter your basic information',
    icon: <User size={20} />,
    validation: createMockValidation(['firstName', 'lastName', 'email'], { firstName: 2, lastName: 2 }),
    component: () => (
      <FormValidation
        schema={{
          fields: {
            firstName: [{ type: 'required', message: 'First name is required' }],
            lastName: [{ type: 'required', message: 'Last name is required' }],
            email: [{ type: 'required', message: 'Email is required' }, { type: 'email', message: 'Invalid email' }],
          },
          validateOn: ['blur', 'submit'],
          debounceMs: 300
        }}
      >
        <FormInput name="firstName" label="First Name" placeholder="Enter your first name" />
        <FormInput name="lastName" label="Last Name" placeholder="Enter your last name" />
        <FormInput name="email" label="Email" type="email" placeholder="Enter your email" />
      </FormValidation>
    )
  },
  {
    id: 'contact',
    title: 'Contact Details',
    description: 'Provide your contact information',
    icon: <Phone size={20} />,
    validation: createMockValidation(['phone', 'address']),
    component: () => (
      <FormValidation
        schema={{
          fields: {
            phone: [{ type: 'required', message: 'Phone is required' }],
            address: [{ type: 'required', message: 'Address is required' }],
            city: [{ type: 'required', message: 'City is required' }],
          },
          validateOn: ['blur', 'submit'],
          debounceMs: 300
        }}
      >
        <FormInput name="phone" label="Phone" placeholder="Enter your phone number" />
        <FormInput name="address" label="Address" placeholder="Enter your address" />
        <FormInput name="city" label="City" placeholder="Enter your city" />
      </FormValidation>
    )
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Tell us about your preferences',
    icon: <Settings size={20} />,
    validation: createMockValidation(['newsletter']),
    component: () => (
      <FormValidation
        schema={{
          fields: {
            newsletter: [{ type: 'required', message: 'Please select newsletter preference' }],
            interests: [],
          },
          validateOn: ['blur', 'submit'],
          debounceMs: 300
        }}
      >
        <FormRadio 
          name="newsletter"
          label="Newsletter Subscription"
          options={[
            { value: 'yes', label: 'Yes, subscribe me' },
            { value: 'no', label: 'No, thanks' }
          ]}
        />
        <FormCheckbox 
          name="interests"
          label="Interests"
          options={[
            { value: 'tech', label: 'Technology' },
            { value: 'design', label: 'Design' },
            { value: 'business', label: 'Business' }
          ]}
        />
      </FormValidation>
    )
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your information and submit',
    icon: <Check size={20} />,
    validation: createMockValidation(),
    component: () => (
      <div>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          Please review your information and click submit to complete the process.
        </p>
        <FormSubmit>Submit Application</FormSubmit>
      </div>
    )
  }
];

// ============================================================================
// STORYBOOK CONFIGURATION
// ============================================================================

const meta: Meta<typeof FormWizard> = {
  title: 'Design System/Forms/FormWizard',
  component: FormWizard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Multi-step form wizard with validation and navigation controls.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    steps: {
      description: 'Array of wizard steps',
      control: { type: 'object' },
    },
    onStepChange: {
      description: 'Callback when step changes',
      action: 'step-changed',
    },
    onComplete: {
      description: 'Callback when wizard completes',
      action: 'completed',
    },
    variant: {
      description: 'Visual variant of the wizard',
      control: { type: 'select' },
      options: ['default', 'outlined', 'filled', 'minimal'],
    },
    allowSkip: {
      description: 'Allow skipping steps',
      control: { type: 'boolean' },
    },
    showProgress: {
      description: 'Show progress indicator',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormWizard>;

// ============================================================================
// OPTIMIZED STORIES
// ============================================================================

export const Default: Story = {
  args: {
    steps: basicSteps,
    onStepChange: action('step-changed'),
    onComplete: action('completed'),
    variant: 'default',
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
};

export const WithoutProgress: Story = {
  args: {
    steps: basicSteps,
    onStepChange: action('step-changed'),
    onComplete: action('completed'),
    variant: 'default',
    showProgress: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
};

export const AllowSkip: Story = {
  args: {
    steps: basicSteps,
    onStepChange: action('step-changed'),
    onComplete: action('completed'),
    variant: 'default',
    allowSkip: true,
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', color: '#333' }}>Default Variant</h3>
          <FormWizard
            steps={basicSteps.slice(0, 2)}
            onStepChange={action('default-step-changed')}
            onComplete={action('default-completed')}
            variant="default"
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', color: '#333' }}>Outlined Variant</h3>
          <FormWizard
            steps={basicSteps.slice(0, 2)}
            onStepChange={action('outlined-step-changed')}
            onComplete={action('outlined-completed')}
            variant="outlined"
          />
        </div>
      </div>
    </div>
  ),
};

export const SimpleWizard: Story = {
  args: {
    steps: [
      {
        id: 'info',
        title: 'Basic Info',
        description: 'Enter your information',
        icon: <User size={20} />,
        validation: createMockValidation(['name', 'email']),
        component: () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormInput name="name" label="Name" placeholder="Enter your name" />
            <FormInput name="email" label="Email" type="email" placeholder="Enter your email" />
          </div>
        )
      },
      {
        id: 'finish',
        title: 'Finish',
        description: 'Complete the process',
        icon: <Check size={20} />,
        validation: createMockValidation(),
        component: () => (
          <div>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Thank you! Click finish to complete.
            </p>
            <FormSubmit>Finish</FormSubmit>
          </div>
        )
      }
    ],
    onStepChange: action('simple-step-changed'),
    onComplete: action('simple-completed'),
    variant: 'default',
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    steps: [
      {
        id: 'account',
        title: 'Account',
        description: 'Create your account',
        icon: <User size={20} />,
        validation: createMockValidation(['username', 'password']),
        component: () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormInput name="username" label="Username" placeholder="Choose a username" />
            <FormInput name="password" label="Password" type="password" placeholder="Create a password" />
          </div>
        )
      },
      {
        id: 'profile',
        title: 'Profile',
        description: 'Set up your profile',
        icon: <Star size={20} />,
        validation: createMockValidation(['bio']),
        component: () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormTextarea name="bio" label="Bio" placeholder="Tell us about yourself..." rows={4} />
            <FormSelect 
              name="role" 
              label="Role"
              placeholder="Select your role"
              options={[
                { value: 'developer', label: 'Developer' },
                { value: 'designer', label: 'Designer' },
                { value: 'manager', label: 'Manager' }
              ]}
            />
          </div>
        )
      },
      {
        id: 'security',
        title: 'Security',
        description: 'Security settings',
        icon: <Shield size={20} />,
        validation: createMockValidation(),
        component: () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormCheckbox 
              name="security"
              label="Security Options"
              options={[
                { value: 'two-factor', label: 'Enable two-factor authentication' },
                { value: 'notifications', label: 'Security notifications' }
              ]}
            />
            <FormSubmit>Complete Setup</FormSubmit>
          </div>
        )
      }
    ],
    onStepChange: action('icons-step-changed'),
    onComplete: action('icons-completed'),
    variant: 'outlined',
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {
    steps: basicSteps.slice(0, 2),
    onStepChange: action('custom-step-changed'),
    onComplete: action('custom-completed'),
    variant: 'default',
    showProgress: true,
    style: {
      border: '2px solid #8b5cf6',
      borderRadius: '12px',
      padding: '24px',
      backgroundColor: '#faf5ff',
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
};

export const MinimalSteps: Story = {
  args: {
    steps: [
      {
        id: 'step1',
        title: 'Step 1',
        description: 'First step',
        component: () => (
          <FormInput name="field1" label="Field 1" placeholder="Enter value" />
        )
      },
      {
        id: 'step2',
        title: 'Step 2',
        description: 'Second step',
        component: () => (
          <FormInput name="field2" label="Field 2" placeholder="Enter value" />
        )
      }
    ],
    onStepChange: action('minimal-step-changed'),
    onComplete: action('minimal-completed'),
    variant: 'minimal',
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
};

// ============================================================================
// PLAYGROUND
// ============================================================================

export const Playground: Story = {
  args: {
    steps: basicSteps,
    onStepChange: action('step-changed'),
    onComplete: action('completed'),
    variant: 'default',
    allowSkip: false,
    showProgress: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <FormWizard {...args} />
    </div>
  ),
}; 