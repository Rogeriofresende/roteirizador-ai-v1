import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FormSelect, FormSelectOption } from './FormSelect';
import './FormSelect.css';

// ============================================================================
// OPTIMIZED ICONS
// ============================================================================

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
  </svg>
);

// ============================================================================
// OPTIMIZED DATA SETS
// ============================================================================

const optionSets = {
  simple: [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' }
  ],
  withIcons: [
    { value: 'user1', label: 'John Doe', icon: <UserIcon />, description: 'Software Engineer' },
    { value: 'user2', label: 'Jane Smith', icon: <UserIcon />, description: 'Product Manager' },
    { value: 'user3', label: 'Bob Johnson', icon: <UserIcon />, description: 'UI/UX Designer' },
    { value: 'user4', label: 'Alice Brown', icon: <UserIcon />, description: 'Data Analyst' }
  ],
  locations: [
    { value: 'us', label: 'United States', icon: <LocationIcon />, description: 'North America' },
    { value: 'uk', label: 'United Kingdom', icon: <LocationIcon />, description: 'Europe' },
    { value: 'ca', label: 'Canada', icon: <LocationIcon />, description: 'North America' },
    { value: 'au', label: 'Australia', icon: <LocationIcon />, description: 'Oceania' },
    { value: 'jp', label: 'Japan', icon: <LocationIcon />, description: 'Asia' }
  ],
  categories: [
    { value: 'tech', label: 'Technology', icon: <TagIcon />, group: 'Industry' },
    { value: 'design', label: 'Design', icon: <TagIcon />, group: 'Industry' },
    { value: 'marketing', label: 'Marketing', icon: <TagIcon />, group: 'Industry' },
    { value: 'sales', label: 'Sales', icon: <TagIcon />, group: 'Industry' },
    { value: 'hr', label: 'Human Resources', icon: <TagIcon />, group: 'Industry' }
  ]
} satisfies Record<string, FormSelectOption[]>;

// ============================================================================
// STORYBOOK CONFIGURATION
// ============================================================================

const meta: Meta<typeof FormSelect> = {
  title: 'Design System/Forms/FormSelect',
  component: FormSelect,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Comprehensive select component with search, multi-select, and virtual scrolling capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    options: {
      description: 'Array of options for the select',
      control: { type: 'object' },
    },
    value: {
      description: 'Current selected value(s)',
      control: { type: 'text' },
    },
    onChange: {
      description: 'Callback when selection changes',
      action: 'changed',
    },
    placeholder: {
      description: 'Placeholder text when no option is selected',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Disable the select',
      control: { type: 'boolean' },
    },
    searchable: {
      description: 'Enable search functionality',
      control: { type: 'boolean' },
    },
    multiple: {
      description: 'Allow multiple selections',
      control: { type: 'boolean' },
    },
    variant: {
      description: 'Visual variant of the select',
      control: { type: 'select' },
      options: ['default', 'outlined', 'filled', 'minimal'],
    },
    size: {
      description: 'Size of the select',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormSelect>;

// ============================================================================
// OPTIMIZED STORIES
// ============================================================================

export const Default: Story = {
  args: {
    options: optionSets.simple,
    placeholder: 'Select an option...',
    onChange: action('changed'),
    variant: 'default',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    options: optionSets.withIcons,
    placeholder: 'Select a team member...',
    onChange: action('changed'),
    variant: 'default',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

export const Searchable: Story = {
  args: {
    options: optionSets.locations,
    placeholder: 'Search and select country...',
    searchable: true,
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

export const Multiple: Story = {
  args: {
    options: optionSets.categories,
    placeholder: 'Select categories...',
    multiple: true,
    searchable: true,
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    options: optionSets.simple,
    placeholder: 'This select is disabled',
    disabled: true,
    value: 'apple',
    onChange: action('changed'),
    variant: 'default',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Default</h4>
          <FormSelect
            options={optionSets.simple}
            placeholder="Default variant"
            variant="default"
            onChange={action('default-changed')}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Outlined</h4>
          <FormSelect
            options={optionSets.simple}
            placeholder="Outlined variant"
            variant="outlined"
            onChange={action('outlined-changed')}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Filled</h4>
          <FormSelect
            options={optionSets.simple}
            placeholder="Filled variant"
            variant="filled"
            onChange={action('filled-changed')}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Minimal</h4>
          <FormSelect
            options={optionSets.simple}
            placeholder="Minimal variant"
            variant="minimal"
            onChange={action('minimal-changed')}
          />
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Small</h4>
          <FormSelect
            options={optionSets.simple}
            placeholder="Small size"
            size="small"
            onChange={action('small-changed')}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Medium</h4>
          <FormSelect
            options={optionSets.simple}
            placeholder="Medium size"
            size="medium"
            onChange={action('medium-changed')}
          />
        </div>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Large</h4>
          <FormSelect
            options={optionSets.simple}
            placeholder="Large size"
            size="large"
            onChange={action('large-changed')}
          />
        </div>
      </div>
    </div>
  ),
};

export const WithInitialValue: Story = {
  args: {
    options: optionSets.simple,
    placeholder: 'Select an option...',
    value: 'banana',
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

export const LargeOptionsList: Story = {
  args: {
    options: Array.from({ length: 50 }, (_, i) => ({
      value: `option-${i}`,
      label: `Option ${i + 1}`,
      description: `Description for option ${i + 1}`
    })),
    placeholder: 'Search through many options...',
    searchable: true,
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

export const ComplexOptions: Story = {
  args: {
    options: [
      { value: 'user1', label: 'John Doe', icon: <UserIcon />, description: 'Software Engineer', group: 'Engineering' },
      { value: 'user2', label: 'Jane Smith', icon: <UserIcon />, description: 'Senior Engineer', group: 'Engineering' },
      { value: 'user3', label: 'Bob Johnson', icon: <UserIcon />, description: 'UI/UX Designer', group: 'Design' },
      { value: 'user4', label: 'Alice Brown', icon: <UserIcon />, description: 'Product Designer', group: 'Design' },
      { value: 'user5', label: 'Charlie Wilson', icon: <UserIcon />, description: 'Product Manager', group: 'Product' },
      { value: 'user6', label: 'Diana Davis', icon: <UserIcon />, description: 'Marketing Lead', group: 'Marketing' },
    ],
    placeholder: 'Select team member...',
    searchable: true,
    onChange: action('changed'),
    variant: 'outlined',
    size: 'medium',
  },
  render: (args) => (
    <div style={{ maxWidth: '350px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
};

// ============================================================================
// PLAYGROUND
// ============================================================================

export const Playground: Story = {
  args: {
    options: optionSets.simple,
    placeholder: 'Select an option...',
    onChange: action('changed'),
    variant: 'default',
    size: 'medium',
    disabled: false,
    searchable: false,
    multiple: false,
  },
  render: (args) => (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <FormSelect {...args} />
    </div>
  ),
}; 