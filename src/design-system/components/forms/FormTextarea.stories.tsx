import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FormTextarea } from './FormTextarea';
import './FormTextarea.css';

// ============================================================================
// OPTIMIZED ICONS
// ============================================================================

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

// ============================================================================
// STORYBOOK CONFIGURATION
// ============================================================================

const meta: Meta<typeof FormTextarea> = {
  title: 'Design System/Forms/FormTextarea',
  component: FormTextarea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Professional textarea component with auto-resize, character count, and advanced validation features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current value of the textarea',
      control: { type: 'text' },
    },
    onChange: {
      description: 'Callback when value changes',
      action: 'changed',
    },
    placeholder: {
      description: 'Placeholder text',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Disable the textarea',
      control: { type: 'boolean' },
    },
    required: {
      description: 'Mark as required field',
      control: { type: 'boolean' },
    },
    variant: {
      description: 'Visual variant of the textarea',
      control: { type: 'select' },
      options: ['default', 'outlined', 'filled', 'minimal'],
    },
    size: {
      description: 'Size of the textarea',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    rows: {
      description: 'Number of visible rows',
      control: { type: 'number' },
    },
    maxLength: {
      description: 'Maximum number of characters',
      control: { type: 'number' },
    },
    showCharCount: {
      description: 'Show character count indicator',
      control: { type: 'boolean' },
    },
    autoResize: {
      description: 'Auto-resize based on content',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormTextarea>;

// ============================================================================
// OPTIMIZED STORIES
// ============================================================================

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
    onChange: action('changed'),
    variant: 'default',
    size: 'medium',
    rows: 4,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    label: 'Message',
    placeholder: 'Enter your message...',
    onChange: action('changed'),
    variant: 'default',
    size: 'medium',
    rows: 4,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
};

export const WithCharacterCount: Story = {
  args: {
    label: 'Description',
    placeholder: 'Describe your project...',
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
    rows: 4,
    maxLength: 200,
    showCharCount: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
};

export const AutoResize: Story = {
  args: {
    label: 'Auto-resizing Textarea',
    placeholder: 'Start typing and watch the textarea grow...',
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
    rows: 3,
    autoResize: true,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Textarea',
    placeholder: 'This textarea is disabled',
    value: 'This is disabled content that cannot be edited.',
    onChange: action('changed'),
    disabled: true,
    variant: 'default',
    size: 'medium',
    rows: 4,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
};

export const Required: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'This field is required...',
    onChange: action('changed'),
    required: true,
    variant: 'outlined',
    size: 'medium',
    rows: 4,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Default</h4>
          <FormTextarea
            placeholder="Default variant"
            variant="default"
            onChange={action('default-changed')}
            rows={3}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Outlined</h4>
          <FormTextarea
            placeholder="Outlined variant"
            variant="outlined"
            onChange={action('outlined-changed')}
            rows={3}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Filled</h4>
          <FormTextarea
            placeholder="Filled variant"
            variant="filled"
            onChange={action('filled-changed')}
            rows={3}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Minimal</h4>
          <FormTextarea
            placeholder="Minimal variant"
            variant="minimal"
            onChange={action('minimal-changed')}
            rows={3}
          />
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Small</h4>
          <FormTextarea
            placeholder="Small size"
            size="small"
            onChange={action('small-changed')}
            rows={3}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Medium</h4>
          <FormTextarea
            placeholder="Medium size"
            size="medium"
            onChange={action('medium-changed')}
            rows={3}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Large</h4>
          <FormTextarea
            placeholder="Large size"
            size="large"
            onChange={action('large-changed')}
            rows={3}
          />
        </div>
      </div>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormTextarea
          label="Message"
          placeholder="Enter your message..."
          onChange={action('message-changed')}
          variant="outlined"
          rows={4}
          icon={<MessageIcon />}
        />
        <FormTextarea
          label="Edit Content"
          placeholder="Edit your content..."
          onChange={action('edit-changed')}
          variant="outlined"
          rows={4}
          icon={<EditIcon />}
        />
        <FormTextarea
          label="Document"
          placeholder="Document content..."
          onChange={action('document-changed')}
          variant="outlined"
          rows={4}
          icon={<DocumentIcon />}
        />
      </div>
    </div>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormTextarea
          label="Success State"
          placeholder="Valid input..."
          onChange={action('success-changed')}
          variant="outlined"
          rows={3}
          validationState="success"
          helperText="Content is valid"
        />
        <FormTextarea
          label="Warning State"
          placeholder="Warning input..."
          onChange={action('warning-changed')}
          variant="outlined"
          rows={3}
          validationState="warning"
          helperText="Please review your input"
        />
        <FormTextarea
          label="Error State"
          placeholder="Invalid input..."
          onChange={action('error-changed')}
          variant="outlined"
          rows={3}
          validationState="error"
          helperText="This field is required"
        />
      </div>
    </div>
  ),
};

export const ComplexExample: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FormTextarea
        label="Project Description"
        placeholder="Describe your project in detail..."
        onChange={action('complex-changed')}
        variant="outlined"
        size="medium"
        rows={5}
        maxLength={500}
        showCharCount={true}
        autoResize={true}
        required={true}
        icon={<DocumentIcon />}
        helperText="Provide a detailed description of your project goals and requirements."
      />
    </div>
  ),
};

export const WithInitialValue: Story = {
  args: {
    label: 'Pre-filled Content',
    value: 'This is some initial content that was pre-filled in the textarea.',
    placeholder: 'Enter your message...',
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
    rows: 4,
    showCharCount: true,
    maxLength: 300,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea
        label="Custom Styled Textarea"
        placeholder="Custom styling example..."
        onChange={action('custom-changed')}
        rows={4}
        style={{
          border: '2px solid #8b5cf6',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '16px',
          fontFamily: 'monospace',
          backgroundColor: '#f8fafc',
        }}
      />
    </div>
  ),
};

// ============================================================================
// PLAYGROUND
// ============================================================================

export const Playground: Story = {
  args: {
    label: 'Textarea Label',
    placeholder: 'Enter your message...',
    onChange: action('changed'),
    variant: 'default',
    size: 'medium',
    rows: 4,
    disabled: false,
    required: false,
    showCharCount: false,
    autoResize: false,
    maxLength: undefined,
  },
  render: (args) => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <FormTextarea {...args} />
    </div>
  ),
}; 