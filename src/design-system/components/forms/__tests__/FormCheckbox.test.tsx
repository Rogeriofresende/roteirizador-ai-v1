import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormCheckbox, FormCheckboxRef, FormCheckboxOption, FormCheckboxGroup } from '../FormCheckbox';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ==========================================
// 🟡 IA CHARLIE - QUALITY EXCELLENCE TESTS
// ==========================================

describe('FormCheckbox V7.5 Enhanced', () => {
  const user = userEvent.setup();
  
  // Sample test data
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
      icon: <span>👤</span>, 
      description: 'Manage users and permissions' 
    },
    { 
      value: 'security', 
      label: 'Security Settings', 
      icon: <span>🔒</span>, 
      description: 'Configure security policies' 
    },
    { 
      value: 'reports', 
      label: 'Reports', 
      icon: <span>📊</span>, 
      description: 'View and generate reports',
      disabled: true 
    }
  ];
  
  const groupedOptions: FormCheckboxGroup[] = [
    {
      id: 'admin',
      label: 'Administrative Permissions',
      description: 'High-level system access',
      options: [
        { value: 'admin.users', label: 'Manage Users' },
        { value: 'admin.system', label: 'System Configuration' }
      ]
    },
    {
      id: 'content',
      label: 'Content Management',
      options: [
        { value: 'content.create', label: 'Create Content' },
        { value: 'content.edit', label: 'Edit Content' },
        { value: 'content.delete', label: 'Delete Content' }
      ]
    }
  ];
  
  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================
  
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<FormCheckbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
    
    test('renders single checkbox with label', () => {
      render(<FormCheckbox label="Test Checkbox" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    });
    
    test('renders multiple checkboxes from options', () => {
      render(<FormCheckbox options={simpleOptions} />);
      
      simpleOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(simpleOptions.length);
    });
    
    test('renders with description and helper text', () => {
      render(
        <FormCheckbox 
          label="Test Checkbox"
          description="This is a test checkbox"
          helperText="Select this option if applicable"
        />
      );
      
      expect(screen.getByText('This is a test checkbox')).toBeInTheDocument();
      expect(screen.getByText('Select this option if applicable')).toBeInTheDocument();
    });
    
    test('renders with error text', () => {
      render(<FormCheckbox label="Test Checkbox" errorText="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // VARIANT TESTS
  // ==========================================
  
  describe('Variants', () => {
    test('renders glass variant with correct classes', () => {
      const { container } = render(<FormCheckbox variant="glass" label="Glass Checkbox" />);
      expect(container.querySelector('.form-checkbox-container--glass')).toBeInTheDocument();
    });
    
    test('renders outlined variant with correct classes', () => {
      const { container } = render(<FormCheckbox variant="outlined" label="Outlined Checkbox" />);
      expect(container.querySelector('.form-checkbox-container--outlined')).toBeInTheDocument();
    });
    
    test('renders filled variant with correct classes', () => {
      const { container } = render(<FormCheckbox variant="filled" label="Filled Checkbox" />);
      expect(container.querySelector('.form-checkbox-container--filled')).toBeInTheDocument();
    });
    
    test('renders minimal variant with correct classes', () => {
      const { container } = render(<FormCheckbox variant="minimal" label="Minimal Checkbox" />);
      expect(container.querySelector('.form-checkbox-container--minimal')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SIZE TESTS
  // ==========================================
  
  describe('Sizes', () => {
    test('renders small size with correct classes', () => {
      const { container } = render(<FormCheckbox size="sm" label="Small Checkbox" />);
      expect(container.querySelector('.form-checkbox-container--sm')).toBeInTheDocument();
    });
    
    test('renders medium size with correct classes', () => {
      const { container } = render(<FormCheckbox size="md" label="Medium Checkbox" />);
      expect(container.querySelector('.form-checkbox-container--md')).toBeInTheDocument();
    });
    
    test('renders large size with correct classes', () => {
      const { container } = render(<FormCheckbox size="lg" label="Large Checkbox" />);
      expect(container.querySelector('.form-checkbox-container--lg')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SINGLE CHECKBOX INTERACTION TESTS
  // ==========================================
  
  describe('Single Checkbox Interactions', () => {
    test('toggles checked state on click', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          label="Test Checkbox"
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      expect(mockOnChange).toHaveBeenCalledWith(['checked']);
      
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
    
    test('respects controlled checked prop', () => {
      const { rerender } = render(<FormCheckbox label="Test Checkbox" checked={false} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      
      rerender(<FormCheckbox label="Test Checkbox" checked={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
    
    test('respects defaultChecked prop', () => {
      render(<FormCheckbox label="Test Checkbox" defaultChecked={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
    
    test('handles disabled state', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          label="Test Checkbox"
          disabled={true}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      
      await user.click(checkbox);
      expect(mockOnChange).not.toHaveBeenCalled();
    });
    
    test('handles readOnly state', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          label="Test Checkbox"
          readOnly={true}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
  
  // ==========================================
  // MULTIPLE CHECKBOX TESTS
  // ==========================================
  
  describe('Multiple Checkbox Functionality', () => {
    test('allows multiple selections', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      await user.click(checkboxes[0]);
      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
      
      await user.click(checkboxes[2]);
      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option3']);
    });
    
    test('handles default values correctly', () => {
      render(<FormCheckbox options={simpleOptions} defaultValue={['option1', 'option3']} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // option1
      expect(checkboxes[1]).not.toBeChecked(); // option2
      expect(checkboxes[2]).toBeChecked(); // option3
      expect(checkboxes[3]).not.toBeChecked(); // option4
    });
    
    test('respects controlled value prop', () => {
      const { rerender } = render(
        <FormCheckbox options={simpleOptions} value={['option1']} />
      );
      
      let checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      
      rerender(<FormCheckbox options={simpleOptions} value={['option1', 'option2']} />);
      
      checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });
    
    test('handles options with icons and descriptions', () => {
      render(<FormCheckbox options={optionsWithIcons} />);
      
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Manage users and permissions')).toBeInTheDocument();
      expect(screen.getByText('👤')).toBeInTheDocument();
    });
    
    test('respects disabled options', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={optionsWithIcons}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      const disabledCheckbox = checkboxes[2]; // 'reports' option is disabled
      
      expect(disabledCheckbox).toBeDisabled();
      
      await user.click(disabledCheckbox);
      expect(mockOnChange).not.toHaveBeenCalledWith(expect.arrayContaining(['reports']));
    });
  });
  
  // ==========================================
  // GROUPED CHECKBOX TESTS
  // ==========================================
  
  describe('Grouped Checkbox Functionality', () => {
    test('renders grouped checkboxes correctly', () => {
      render(<FormCheckbox grouped={true} groups={groupedOptions} />);
      
      // Check group headers
      expect(screen.getByText('Administrative Permissions')).toBeInTheDocument();
      expect(screen.getByText('Content Management')).toBeInTheDocument();
      
      // Check group descriptions
      expect(screen.getByText('High-level system access')).toBeInTheDocument();
      
      // Check individual options
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
      expect(screen.getByText('Create Content')).toBeInTheDocument();
    });
    
    test('handles group selection and indeterminate states', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          grouped={true}
          groups={groupedOptions}
          eventHandlers={{ onChange: mockOnChange }}
          indeterminate={{ enabled: true }}
        />
      );
      
      // Select one option from admin group
      const adminUsersCheckbox = screen.getByDisplayValue('admin.users');
      await user.click(adminUsersCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(['admin.users']);
      
      // Group checkbox should be indeterminate
      const adminGroupCheckbox = screen.getByLabelText(/Toggle all options in Administrative Permissions/);
      expect(adminGroupCheckbox).toHaveAttribute('data-indeterminate', 'true');
    });
    
    test('selects all options in group when group checkbox is clicked', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          grouped={true}
          groups={groupedOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const adminGroupCheckbox = screen.getByLabelText(/Toggle all options in Administrative Permissions/);
      await user.click(adminGroupCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith(['admin.users', 'admin.system']);
    });
    
    test('deselects all options in group when all are selected', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          grouped={true}
          groups={groupedOptions}
          value={['admin.users', 'admin.system']}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const adminGroupCheckbox = screen.getByLabelText(/Toggle all options in Administrative Permissions/);
      expect(adminGroupCheckbox).toBeChecked();
      
      await user.click(adminGroupCheckbox);
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
    
    test('handles group validation requirements', async () => {
      const groupsWithValidation = [
        {
          ...groupedOptions[0],
          required: true,
          minSelections: 1
        }
      ];
      
      render(
        <FormCheckbox 
          grouped={true}
          groups={groupsWithValidation}
          validationRules={[
            { type: 'required', message: 'At least one admin permission is required' }
          ]}
        />
      );
      
      // Should show required indicator
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // KEYBOARD NAVIGATION TESTS
  // ==========================================
  
  describe('Keyboard Navigation', () => {
    test('navigates between checkboxes with arrow keys', async () => {
      render(<FormCheckbox options={simpleOptions} />);
      
      const container = screen.getByRole('group') || document.body;
      container.focus();
      
      // Navigate down
      await user.keyboard('{ArrowDown}');
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toHaveFocus();
    });
    
    test('toggles checkbox with space key', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      firstCheckbox.focus();
      
      await user.keyboard(' ');
      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });
    
    test('toggles checkbox with enter key', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      firstCheckbox.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });
    
    test('navigates to first checkbox with Home key', async () => {
      render(<FormCheckbox options={simpleOptions} />);
      
      const container = screen.getByRole('group') || document.body;
      container.focus();
      
      await user.keyboard('{Home}');
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      expect(firstCheckbox).toHaveFocus();
    });
    
    test('navigates to last checkbox with End key', async () => {
      render(<FormCheckbox options={simpleOptions} />);
      
      const container = screen.getByRole('group') || document.body;
      container.focus();
      
      await user.keyboard('{End}');
      
      const checkboxes = screen.getAllByRole('checkbox');
      const lastCheckbox = checkboxes[checkboxes.length - 1];
      expect(lastCheckbox).toHaveFocus();
    });
    
    test('skips disabled checkboxes during navigation', async () => {
      render(<FormCheckbox options={optionsWithIcons} />);
      
      const container = screen.getByRole('group') || document.body;
      container.focus();
      
      // Navigate to last enabled checkbox
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toHaveFocus(); // Should skip disabled checkbox at index 2
    });
  });
  
  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormCheckbox
          options={simpleOptions}
          label="Accessible checkboxes"
          helperText="Select your preferences"
          ariaLabel="Custom aria label"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('associates label with checkboxes', () => {
      render(<FormCheckbox label="Test Label" id="test-checkbox" />);
      
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Test Label');
      
      expect(checkbox).toHaveAttribute('id', 'test-checkbox');
      expect(label.closest('label')).toContainElement(checkbox);
    });
    
    test('supports aria-label', () => {
      render(<FormCheckbox ariaLabel="Custom aria label" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Custom aria label');
    });
    
    test('supports aria-describedby', () => {
      render(<FormCheckbox ariaDescribedBy="helper-text" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'helper-text');
    });
    
    test('sets aria-invalid for error state', () => {
      render(<FormCheckbox validationState="error" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });
    
    test('sets aria-required for required fields', () => {
      render(<FormCheckbox required />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });
    
    test('provides screen reader text', () => {
      render(<FormCheckbox screenReaderText="Additional context" />);
      
      expect(screen.getByText('Additional context')).toHaveClass('sr-only');
    });
    
    test('error messages have alert role', () => {
      render(<FormCheckbox errorText="This field is required" />);
      
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
    
    test('grouped checkboxes have proper ARIA structure', () => {
      render(<FormCheckbox grouped={true} groups={groupedOptions} />);
      
      // Group checkboxes should have proper labels
      const adminGroupCheckbox = screen.getByLabelText(/Toggle all options in Administrative Permissions/);
      expect(adminGroupCheckbox).toBeInTheDocument();
      
      // Individual checkboxes should be properly labeled
      const userCheckbox = screen.getByDisplayValue('admin.users');
      expect(userCheckbox).toHaveAttribute('value', 'admin.users');
    });
    
    test('indeterminate state is properly announced', () => {
      render(
        <FormCheckbox 
          grouped={true}
          groups={groupedOptions}
          value={['admin.users']} // Partial selection
          indeterminate={{ enabled: true }}
        />
      );
      
      const adminGroupCheckbox = screen.getByLabelText(/Toggle all options in Administrative Permissions/);
      expect(adminGroupCheckbox).toHaveAttribute('data-indeterminate', 'true');
    });
  });
  
  // ==========================================
  // VALIDATION TESTS
  // ==========================================
  
  describe('Validation', () => {
    test('validates required fields', async () => {
      const mockOnValidationChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          required={true}
          eventHandlers={{ onValidationChange: mockOnValidationChange }}
        />
      );
      
      // Should initially be invalid (no selection)
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
            errors: expect.arrayContaining(['At least one option must be selected'])
          })
        );
      });
    });
    
    test('validates minimum selections', async () => {
      const mockOnValidationChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          validationRules={[
            { type: 'minSelections', value: 2, message: 'Please select at least 2 options' }
          ]}
          eventHandlers={{ onValidationChange: mockOnValidationChange }}
        />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(firstCheckbox);
      
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
            errors: expect.arrayContaining(['Please select at least 2 options'])
          })
        );
      });
    });
    
    test('validates maximum selections', async () => {
      const mockOnValidationChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          validationRules={[
            { type: 'maxSelections', value: 2, message: 'Maximum 2 options allowed' }
          ]}
          value={['option1', 'option2', 'option3']}
          eventHandlers={{ onValidationChange: mockOnValidationChange }}
        />
      );
      
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
            errors: expect.arrayContaining(['Maximum 2 options allowed'])
          })
        );
      });
    });
    
    test('validates with custom validator', async () => {
      const customValidator = jest.fn((values) => values.includes('option1'));
      const mockOnValidationChange = jest.fn();
      
      render(
        <FormCheckbox 
          options={simpleOptions}
          validationRules={[
            { 
              type: 'custom', 
              message: 'Option 1 must be selected',
              validator: customValidator
            }
          ]}
          value={['option2']}
          eventHandlers={{ onValidationChange: mockOnValidationChange }}
        />
      );
      
      await waitFor(() => {
        expect(customValidator).toHaveBeenCalledWith(['option2']);
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
            errors: expect.arrayContaining(['Option 1 must be selected'])
          })
        );
      });
    });
    
    test('passes validation when all rules are satisfied', async () => {
      const mockOnValidationChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          validationRules={[
            { type: 'minSelections', value: 1, message: 'At least one required' },
            { type: 'maxSelections', value: 3, message: 'Maximum 3 allowed' }
          ]}
          value={['option1', 'option2']}
          eventHandlers={{ onValidationChange: mockOnValidationChange }}
        />
      );
      
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: true,
            errors: []
          })
        );
      });
    });
  });
  
  // ==========================================
  // LAYOUT AND ORIENTATION TESTS
  // ==========================================
  
  describe('Layout and Orientation', () => {
    test('renders vertical layout by default', () => {
      const { container } = render(<FormCheckbox options={simpleOptions} />);
      expect(container.querySelector('.form-checkbox-list')).toBeInTheDocument();
    });
    
    test('renders horizontal layout when specified', () => {
      const { container } = render(
        <FormCheckbox 
          options={simpleOptions}
          layout={{ orientation: 'horizontal' }}
        />
      );
      expect(container.querySelector('.form-checkbox-container--horizontal')).toBeInTheDocument();
    });
    
    test('renders grid layout with specified columns', () => {
      const { container } = render(
        <FormCheckbox 
          options={simpleOptions}
          layout={{ orientation: 'grid', columns: 2 }}
        />
      );
      expect(container.querySelector('.form-checkbox-container--grid')).toBeInTheDocument();
    });
    
    test('applies spacing variants correctly', () => {
      const { container: compactContainer } = render(
        <FormCheckbox 
          options={simpleOptions}
          layout={{ spacing: 'compact' }}
        />
      );
      expect(compactContainer.querySelector('.form-checkbox-container--spacing-compact')).toBeInTheDocument();
      
      const { container: relaxedContainer } = render(
        <FormCheckbox 
          options={simpleOptions}
          layout={{ spacing: 'relaxed' }}
        />
      );
      expect(relaxedContainer.querySelector('.form-checkbox-container--spacing-relaxed')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // REF INTERFACE TESTS
  // ==========================================
  
  describe('Ref Interface', () => {
    test('provides imperative handle methods', () => {
      const ref = React.createRef<FormCheckboxRef>();
      render(<FormCheckbox options={simpleOptions} ref={ref} />);
      
      expect(ref.current).toMatchObject({
        focus: expect.any(Function),
        blur: expect.any(Function),
        checkAll: expect.any(Function),
        uncheckAll: expect.any(Function),
        toggleAll: expect.any(Function),
        getCheckedValues: expect.any(Function),
        setCheckedValues: expect.any(Function),
        validate: expect.any(Function),
        getValidationState: expect.any(Function),
        isIndeterminate: expect.any(Function)
      });
    });
    
    test('focus method works', () => {
      const ref = React.createRef<FormCheckboxRef>();
      render(<FormCheckbox options={simpleOptions} ref={ref} />);
      
      ref.current?.focus();
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      expect(firstCheckbox).toHaveFocus();
    });
    
    test('checkAll method selects all options', () => {
      const ref = React.createRef<FormCheckboxRef>();
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions} 
          ref={ref}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      act(() => {
        ref.current?.checkAll();
      });
      
      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2', 'option3', 'option4']);
    });
    
    test('uncheckAll method clears all selections', () => {
      const ref = React.createRef<FormCheckboxRef>();
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions} 
          ref={ref}
          value={['option1', 'option2']}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      act(() => {
        ref.current?.uncheckAll();
      });
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
    
    test('getCheckedValues returns current selection', () => {
      const ref = React.createRef<FormCheckboxRef>();
      render(<FormCheckbox options={simpleOptions} ref={ref} value={['option1', 'option3']} />);
      
      const checkedValues = ref.current?.getCheckedValues();
      expect(checkedValues).toEqual(['option1', 'option3']);
    });
    
    test('validate method returns validation state', async () => {
      const ref = React.createRef<FormCheckboxRef>();
      render(
        <FormCheckbox 
          options={simpleOptions} 
          ref={ref}
          validationRules={[
            { type: 'minSelections', value: 1, message: 'At least one required' }
          ]}
        />
      );
      
      const validationState = await ref.current?.validate();
      expect(validationState).toMatchObject({
        isValid: false,
        errors: expect.arrayContaining(['At least one required'])
      });
    });
    
    test('isIndeterminate method returns correct state for grouped checkboxes', () => {
      const ref = React.createRef<FormCheckboxRef>();
      render(
        <FormCheckbox 
          grouped={true}
          groups={groupedOptions}
          ref={ref}
          value={['admin.users']} // Partial selection
        />
      );
      
      const isIndeterminate = ref.current?.isIndeterminate();
      expect(isIndeterminate).toBe(true);
    });
  });
  
  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================
  
  describe('Performance', () => {
    test('handles large number of options efficiently', () => {
      const largeOptionsList = Array.from({ length: 100 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i + 1}`
      }));
      
      const startTime = performance.now();
      
      render(<FormCheckbox options={largeOptionsList} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large lists in reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });
    
    test('selection performance with large datasets', async () => {
      const largeOptionsList = Array.from({ length: 50 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i + 1}`
      }));
      
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={largeOptionsList}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      const startTime = performance.now();
      
      // Select multiple checkboxes rapidly
      for (let i = 0; i < 10; i++) {
        await user.click(checkboxes[i]);
      }
      
      const endTime = performance.now();
      const selectionTime = endTime - startTime;
      
      // Should handle rapid selections efficiently
      expect(selectionTime).toBeLessThan(1000);
      expect(mockOnChange).toHaveBeenCalledTimes(10);
    });
    
    test('grouped checkbox performance', () => {
      const largeGroups = Array.from({ length: 10 }, (_, groupIndex) => ({
        id: `group-${groupIndex}`,
        label: `Group ${groupIndex + 1}`,
        options: Array.from({ length: 10 }, (_, optionIndex) => ({
          value: `group-${groupIndex}-option-${optionIndex}`,
          label: `Option ${optionIndex + 1}`
        }))
      }));
      
      const startTime = performance.now();
      
      render(<FormCheckbox grouped={true} groups={largeGroups} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large grouped lists efficiently
      expect(renderTime).toBeLessThan(200);
    });
  });
  
  // ==========================================
  // EDGE CASES AND ERROR HANDLING
  // ==========================================
  
  describe('Edge Cases', () => {
    test('handles empty options array', () => {
      render(<FormCheckbox options={[]} />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes).toHaveLength(0);
    });
    
    test('handles options with duplicate values', () => {
      const duplicateOptions = [
        { value: 'duplicate', label: 'First' },
        { value: 'duplicate', label: 'Second' }
      ];
      
      render(<FormCheckbox options={duplicateOptions} />);
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
    
    test('handles invalid value prop', () => {
      render(<FormCheckbox options={simpleOptions} value={['invalid-value'] as any} />);
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });
    
    test('handles options with special characters', () => {
      const specialOptions = [
        { value: 'special-1', label: 'Option with "quotes"' },
        { value: 'special-2', label: 'Option with <tags>' },
        { value: 'special-3', label: 'Option with émojis 🎉' }
      ];
      
      render(<FormCheckbox options={specialOptions} />);
      
      expect(screen.getByText('Option with "quotes"')).toBeInTheDocument();
      expect(screen.getByText('Option with <tags>')).toBeInTheDocument();
      expect(screen.getByText('Option with émojis 🎉')).toBeInTheDocument();
    });
    
    test('handles rapid state changes', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormCheckbox 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      
      // Rapid clicks should not cause errors
      for (let i = 0; i < 10; i++) {
        await user.click(firstCheckbox);
      }
      
      expect(mockOnChange).toHaveBeenCalledTimes(10);
    });
    
    test('maintains focus management during interactions', async () => {
      render(<FormCheckbox options={simpleOptions} />);
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      firstCheckbox.focus();
      
      expect(firstCheckbox).toHaveFocus();
      
      await user.click(firstCheckbox);
      
      // Focus should be maintained after interaction
      expect(firstCheckbox).toHaveFocus();
    });
  });
  
  // ==========================================
  // INTEGRATION TESTS
  // ==========================================
  
  describe('Integration', () => {
    test('works with form submission', async () => {
      const mockSubmit = jest.fn();
      
      const TestForm = () => {
        const [values, setValues] = React.useState<(string | number)[]>([]);
        
        return (
          <form onSubmit={(e) => { e.preventDefault(); mockSubmit(values); }}>
            <FormCheckbox
              options={simpleOptions}
              value={values}
              eventHandlers={{ onChange: setValues }}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };
      
      render(<TestForm />);
      
      await user.click(screen.getAllByRole('checkbox')[0]);
      await user.click(screen.getByRole('button'));
      
      expect(mockSubmit).toHaveBeenCalledWith(['option1']);
    });
    
    test('integrates with external validation library', async () => {
      const externalValidator = (values: (string | number)[]) => {
        if (values.length === 0) return 'At least one option must be selected';
        if (values.includes('option3')) return 'Option 3 is not allowed';
        return '';
      };
      
      const TestComponent = () => {
        const [values, setValues] = React.useState<(string | number)[]>([]);
        const [error, setError] = React.useState('');
        
        React.useEffect(() => {
          setError(externalValidator(values));
        }, [values]);
        
        return (
          <FormCheckbox
            options={simpleOptions}
            value={values}
            eventHandlers={{ onChange: setValues }}
            validationState={error ? 'error' : 'neutral'}
            errorText={error}
          />
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('At least one option must be selected')).toBeInTheDocument();
      
      await user.click(screen.getAllByRole('checkbox')[2]); // option3
      
      expect(screen.getByText('Option 3 is not allowed')).toBeInTheDocument();
      
      await user.click(screen.getAllByRole('checkbox')[2]); // uncheck option3
      await user.click(screen.getAllByRole('checkbox')[0]); // check option1
      
      expect(screen.queryByText('At least one option must be selected')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3 is not allowed')).not.toBeInTheDocument();
    });
  });
}); 