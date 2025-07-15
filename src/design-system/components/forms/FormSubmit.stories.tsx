import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FormSubmit, FormSubmitResponse } from './FormSubmit';
import { FormValidation } from './FormValidation';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { FormSelect } from './FormSelect';
import { FormCheckbox } from './FormCheckbox';
import './FormSubmit.css';

// ============================================================================
// OPTIMIZED MOCK HANDLERS
// ============================================================================

const mockHandlers = {
  success: async (data: Record<string, any>): Promise<FormSubmitResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: { id: '123', ...data },
      message: 'Form submitted successfully!',
      timestamp: new Date(),
      duration: 1000
    };
  },
  
  error: async (data: Record<string, any>): Promise<FormSubmitResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: false,
      errors: ['Network error occurred', 'Please try again'],
      message: 'Submission failed',
      timestamp: new Date(),
      duration: 800
    };
  },
  
  validation: async (data: Record<string, any>): Promise<FormSubmitResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!data.email || !data.name) {
      return {
        success: false,
        errors: ['Email and name are required'],
        timestamp: new Date(),
        duration: 500
      };
    }
    return {
      success: true,
      data,
      message: 'Form submitted successfully!',
      timestamp: new Date(),
      duration: 500
    };
  }
};

// ============================================================================
// STORYBOOK CONFIGURATION
// ============================================================================

const meta: Meta<typeof FormSubmit> = {
  title: 'Design System/Forms/FormSubmit',
  component: FormSubmit,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Form submission component with loading states, success feedback, and error handling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      description: 'Callback function for form submission',
      action: 'submitted',
    },
    disabled: {
      description: 'Disable the submit button',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Show loading state',
      control: { type: 'boolean' },
    },
    variant: {
      description: 'Visual variant of the submit button',
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger'],
    },
    size: {
      description: 'Size of the submit button',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    children: {
      description: 'Button text content',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormSubmit>;

// ============================================================================
// OPTIMIZED STORIES
// ============================================================================

export const Default: Story = {
  args: {
    onSubmit: mockHandlers.success,
    children: 'Submit Form',
    variant: 'primary',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit {...args} />
    </div>
  ),
};

export const WithLoadingState: Story = {
  args: {
    onSubmit: mockHandlers.success,
    loading: true,
    children: 'Submitting...',
    variant: 'primary',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit {...args} />
    </div>
  ),
};

export const DisabledState: Story = {
  args: {
    onSubmit: mockHandlers.success,
    disabled: true,
    children: 'Submit Form',
    variant: 'primary',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormSubmit onSubmit={mockHandlers.success} variant="primary">
          Primary Submit
        </FormSubmit>
        <FormSubmit onSubmit={mockHandlers.success} variant="secondary">
          Secondary Submit
        </FormSubmit>
        <FormSubmit onSubmit={mockHandlers.success} variant="success">
          Success Submit
        </FormSubmit>
        <FormSubmit onSubmit={mockHandlers.success} variant="danger">
          Danger Submit
        </FormSubmit>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormSubmit onSubmit={mockHandlers.success} size="small">
          Small Submit
        </FormSubmit>
        <FormSubmit onSubmit={mockHandlers.success} size="medium">
          Medium Submit
        </FormSubmit>
        <FormSubmit onSubmit={mockHandlers.success} size="large">
          Large Submit
        </FormSubmit>
      </div>
    </div>
  ),
};

export const WithSuccessHandling: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit 
        onSubmit={mockHandlers.success}
        onSuccess={(response) => {
          action('success')(response);
          console.log('Success:', response);
        }}
      >
        Submit with Success Callback
      </FormSubmit>
    </div>
  ),
};

export const WithErrorHandling: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit 
        onSubmit={mockHandlers.error}
        onError={(error) => {
          action('error')(error);
          console.log('Error:', error);
        }}
      >
        Submit with Error Callback
      </FormSubmit>
    </div>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit 
        onSubmit={mockHandlers.validation}
        onValidationError={(errors) => {
          action('validation-error')(errors);
          console.log('Validation errors:', errors);
        }}
      >
        Submit with Validation
      </FormSubmit>
    </div>
  ),
};

export const InFormContext: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormValidation
        schema={{
          fields: {
            name: [{ type: 'required', message: 'Name is required' }],
            email: [{ type: 'required', message: 'Email is required' }, { type: 'email', message: 'Invalid email' }],
            message: [{ type: 'required', message: 'Message is required' }],
          },
          validateOn: ['blur', 'submit'],
          debounceMs: 300
        }}
        onSubmit={mockHandlers.success}
      >
        <FormInput name="name" label="Name" placeholder="Enter your name" />
        <FormInput name="email" label="Email" type="email" placeholder="Enter your email" />
        <FormTextarea name="message" label="Message" placeholder="Enter your message..." />
        <FormSubmit>Submit Contact Form</FormSubmit>
      </FormValidation>
    </div>
  ),
};

export const ComplexForm: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FormValidation
        schema={{
          fields: {
            firstName: [{ type: 'required', message: 'First name is required' }],
            lastName: [{ type: 'required', message: 'Last name is required' }],
            email: [{ type: 'required', message: 'Email is required' }, { type: 'email', message: 'Invalid email' }],
            country: [{ type: 'required', message: 'Country is required' }],
            bio: [{ type: 'maxLength', value: 500, message: 'Bio too long' }],
            terms: [{ type: 'required', message: 'Terms must be accepted' }],
          },
          validateOn: ['blur', 'submit'],
          debounceMs: 300
        }}
        onSubmit={mockHandlers.success}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormInput name="firstName" label="First Name" placeholder="Enter first name" />
          <FormInput name="lastName" label="Last Name" placeholder="Enter last name" />
        </div>
        <FormInput name="email" label="Email" type="email" placeholder="Enter your email" />
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
        <FormTextarea name="bio" label="Bio" placeholder="Tell us about yourself..." />
        <FormCheckbox name="terms" label="I agree to the terms and conditions" />
        <FormSubmit>Submit Registration</FormSubmit>
      </FormValidation>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit 
        onSubmit={mockHandlers.success}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        Custom Styled Submit
      </FormSubmit>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit onSubmit={mockHandlers.success}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          Send Message
        </span>
      </FormSubmit>
    </div>
  ),
};

// ============================================================================
// PLAYGROUND
// ============================================================================

export const Playground: Story = {
  args: {
    onSubmit: mockHandlers.success,
    children: 'Submit Form',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormSubmit {...args} />
    </div>
  ),
}; 