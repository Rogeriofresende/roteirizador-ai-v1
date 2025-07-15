import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FormValidation, FormValidationSchema } from './FormValidation';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { FormSelect } from './FormSelect';
import { FormCheckbox } from './FormCheckbox';
import { FormRadio } from './FormRadio';
import './FormValidation.css';

// ============================================================================
// OPTIMIZED VALIDATION SCHEMAS
// ============================================================================

const schemas = {
  simple: {
    fields: {
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email address' }
      ],
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
      ]
    },
    validateOn: ['change', 'blur', 'submit'],
    debounceMs: 300
  },
  registration: {
    fields: {
      firstName: [
        { type: 'required', message: 'First name is required' },
        { type: 'minLength', value: 2, message: 'First name must be at least 2 characters' }
      ],
      lastName: [
        { type: 'required', message: 'Last name is required' },
        { type: 'minLength', value: 2, message: 'Last name must be at least 2 characters' }
      ],
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email address' }
      ],
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
        { 
          type: 'pattern', 
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
          message: 'Password must contain uppercase, lowercase, number and special character' 
        }
      ],
      confirmPassword: [
        { type: 'required', message: 'Please confirm your password' },
        { type: 'match', field: 'password', message: 'Passwords do not match' }
      ]
    },
    validateOn: ['change', 'blur', 'submit'],
    debounceMs: 300
  }
} satisfies Record<string, FormValidationSchema>;

// ============================================================================
// STORYBOOK CONFIGURATION
// ============================================================================

const meta: Meta<typeof FormValidation> = {
  title: 'Design System/Forms/FormValidation',
  component: FormValidation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Comprehensive form validation component with real-time validation and error handling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    schema: {
      description: 'Validation schema defining rules and behavior',
      control: { type: 'object' },
    },
    onValidationChange: {
      description: 'Callback for validation state changes',
      action: 'validation-changed',
    },
    onSubmit: {
      description: 'Callback for form submission',
      action: 'form-submitted',
    },
    initialValues: {
      description: 'Initial form values',
      control: { type: 'object' },
    },
    disabled: {
      description: 'Disable all form fields',
      control: { type: 'boolean' },
    },
    variant: {
      description: 'Visual variant of the form',
      control: { type: 'select' },
      options: ['default', 'inline', 'floating'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormValidation>;

// ============================================================================
// OPTIMIZED STORIES
// ============================================================================

export const Default: Story = {
  args: {
    schema: schemas.simple,
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
    variant: 'default',
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
      </FormValidation>
    </div>
  ),
};

export const InlineValidation: Story = {
  args: {
    schema: schemas.simple,
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
    variant: 'inline',
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
      </FormValidation>
    </div>
  ),
};

export const FloatingLabels: Story = {
  args: {
    schema: schemas.simple,
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
    variant: 'floating',
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
      </FormValidation>
    </div>
  ),
};

export const RegistrationForm: Story = {
  args: {
    schema: schemas.registration,
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
    variant: 'default',
  },
  render: (args) => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormInput name="firstName" label="First Name" placeholder="Enter first name" />
          <FormInput name="lastName" label="Last Name" placeholder="Enter last name" />
        </div>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
        <FormInput name="confirmPassword" label="Confirm Password" type="password" placeholder="Confirm your password" />
      </FormValidation>
    </div>
  ),
};

export const MultiFieldTypes: Story = {
  args: {
    schema: {
      fields: {
        name: [{ type: 'required', message: 'Name is required' }],
        email: [{ type: 'required', message: 'Email is required' }, { type: 'email', message: 'Invalid email' }],
        age: [{ type: 'required', message: 'Age is required' }, { type: 'number', message: 'Must be a number' }],
        bio: [{ type: 'maxLength', value: 200, message: 'Bio must be less than 200 characters' }],
        country: [{ type: 'required', message: 'Country is required' }],
        newsletter: [],
        preference: [{ type: 'required', message: 'Preference is required' }],
      },
      validateOn: ['change', 'blur', 'submit'],
      debounceMs: 300
    },
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
  },
  render: (args) => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <FormInput name="name" label="Full Name" placeholder="Enter your full name" />
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="age" label="Age" type="number" placeholder="Enter your age" />
        <FormTextarea name="bio" label="Bio" placeholder="Tell us about yourself..." />
        <FormSelect 
          name="country" 
          label="Country" 
          placeholder="Select your country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' },
            { value: 'br', label: 'Brazil' },
          ]}
        />
        <FormCheckbox name="newsletter" label="Subscribe to newsletter" />
        <FormRadio 
          name="preference" 
          label="Preference" 
          options={[
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
            { value: 'phone', label: 'Phone' },
          ]}
        />
      </FormValidation>
    </div>
  ),
};

export const DisabledState: Story = {
  args: {
    schema: schemas.simple,
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
    disabled: true,
    initialValues: {
      email: 'user@example.com',
      password: 'password123',
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
      </FormValidation>
    </div>
  ),
};

export const WithInitialValues: Story = {
  args: {
    schema: schemas.simple,
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
    initialValues: {
      email: 'user@example.com',
      password: '',
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
      </FormValidation>
    </div>
  ),
};

export const CustomValidationTiming: Story = {
  args: {
    schema: {
      ...schemas.simple,
      validateOn: ['blur', 'submit'],
      debounceMs: 100,
    },
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
        This form validates on blur and submit only, with faster debounce (100ms).
      </p>
      <FormValidation {...args}>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
      </FormValidation>
    </div>
  ),
};

// ============================================================================
// OPTIMIZED PLAYGROUND
// ============================================================================

export const Playground: Story = {
  args: {
    schema: schemas.simple,
    onValidationChange: action('validation-changed'),
    onSubmit: action('form-submitted'),
    variant: 'default',
    disabled: false,
    initialValues: {},
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormValidation {...args}>
        <FormInput name="email" label="Email" placeholder="Enter your email" />
        <FormInput name="password" label="Password" type="password" placeholder="Enter your password" />
      </FormValidation>
    </div>
  ),
}; 