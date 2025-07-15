import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormRadio, FormRadioRef, FormRadioOption, FormRadioGroup } from '../FormRadio';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ==========================================
// 🟡 IA CHARLIE - QUALITY EXCELLENCE TESTS
// ==========================================

describe('FormRadio V7.5 Enhanced', () => {
  const user = userEvent.setup();
  
  // Sample test data
  const simpleOptions: FormRadioOption[] = [
    { value: 'option1', label: 'First Option' },
    { value: 'option2', label: 'Second Option' },
    { value: 'option3', label: 'Third Option' },
    { value: 'option4', label: 'Fourth Option' }
  ];
  
  const optionsWithIcons: FormRadioOption[] = [
    { 
      value: 'basic', 
      label: 'Basic Plan', 
      icon: <span>📦</span>, 
      description: 'Perfect for getting started',
      badge: 'Popular'
    },
    { 
      value: 'pro', 
      label: 'Pro Plan', 
      icon: <span>🚀</span>, 
      description: 'Best for growing businesses',
      badge: 'Recommended'
    },
    { 
      value: 'enterprise', 
      label: 'Enterprise Plan', 
      icon: <span>🏢</span>, 
      description: 'For large organizations',
      disabled: true 
    }
  ];
  
  const groupedOptions: FormRadioGroup[] = [
    {
      id: 'subscription',
      label: 'Subscription Plans',
      description: 'Choose your subscription tier',
      options: [
        { value: 'free', label: 'Free Plan' },
        { value: 'starter', label: 'Starter Plan' }
      ]
    },
    {
      id: 'billing',
      label: 'Billing Frequency',
      options: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
      ]
    }
  ];
  
  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================
  
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<FormRadio options={simpleOptions} />);
      expect(screen.getAllByRole('radio')).toHaveLength(simpleOptions.length);
    });
    
    test('renders radio buttons with labels', () => {
      render(<FormRadio options={simpleOptions} />);
      
      simpleOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
      
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(simpleOptions.length);
    });
    
    test('renders with label and description', () => {
      render(
        <FormRadio 
          options={simpleOptions}
          label="Choose an option"
          description="Select one of the available options"
          helperText="This is a helper text"
        />
      );
      
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
      expect(screen.getByText('Select one of the available options')).toBeInTheDocument();
      expect(screen.getByText('This is a helper text')).toBeInTheDocument();
    });
    
    test('renders with error text', () => {
      render(<FormRadio options={simpleOptions} errorText="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    test('renders options with icons and descriptions', () => {
      render(<FormRadio options={optionsWithIcons} />);
      
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Perfect for getting started')).toBeInTheDocument();
      expect(screen.getByText('📦')).toBeInTheDocument();
      expect(screen.getByText('Popular')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // VARIANT TESTS
  // ==========================================
  
  describe('Variants', () => {
    test('renders glass variant with correct classes', () => {
      const { container } = render(<FormRadio variant="glass" options={simpleOptions} />);
      expect(container.querySelector('.form-radio-container--glass')).toBeInTheDocument();
    });
    
    test('renders outlined variant with correct classes', () => {
      const { container } = render(<FormRadio variant="outlined" options={simpleOptions} />);
      expect(container.querySelector('.form-radio-container--outlined')).toBeInTheDocument();
    });
    
    test('renders filled variant with correct classes', () => {
      const { container } = render(<FormRadio variant="filled" options={simpleOptions} />);
      expect(container.querySelector('.form-radio-container--filled')).toBeInTheDocument();
    });
    
    test('renders minimal variant with correct classes', () => {
      const { container } = render(<FormRadio variant="minimal" options={simpleOptions} />);
      expect(container.querySelector('.form-radio-container--minimal')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SIZE TESTS
  // ==========================================
  
  describe('Sizes', () => {
    test('renders small size with correct classes', () => {
      const { container } = render(<FormRadio size="sm" options={simpleOptions} />);
      expect(container.querySelector('.form-radio-container--sm')).toBeInTheDocument();
    });
    
    test('renders medium size with correct classes', () => {
      const { container } = render(<FormRadio size="md" options={simpleOptions} />);
      expect(container.querySelector('.form-radio-container--md')).toBeInTheDocument();
    });
    
    test('renders large size with correct classes', () => {
      const { container } = render(<FormRadio size="lg" options={simpleOptions} />);
      expect(container.querySelector('.form-radio-container--lg')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // CARD STYLE TESTS
  // ==========================================
  
  describe('Card Style', () => {
    test('renders card style when enabled', () => {
      const { container } = render(
        <FormRadio 
          options={simpleOptions}
          cardStyle={{ enabled: true }}
        />
      );
      expect(container.querySelector('.form-radio-container--card-style')).toBeInTheDocument();
      expect(container.querySelector('.form-radio-option-wrapper--card')).toBeInTheDocument();
    });
    
    test('does not render card style when disabled', () => {
      const { container } = render(
        <FormRadio 
          options={simpleOptions}
          cardStyle={{ enabled: false }}
        />
      );
      expect(container.querySelector('.form-radio-container--card-style')).not.toBeInTheDocument();
    });
    
    test('renders card content correctly', () => {
      render(
        <FormRadio 
          options={optionsWithIcons}
          cardStyle={{
            enabled: true,
            showIcon: true,
            showDescription: true,
            showBadge: true
          }}
        />
      );
      
      expect(screen.getByText('📦')).toBeInTheDocument();
      expect(screen.getByText('Perfect for getting started')).toBeInTheDocument();
      expect(screen.getByText('Popular')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // RADIO INTERACTION TESTS
  // ==========================================
  
  describe('Radio Interactions', () => {
    test('selects radio option on click', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const firstRadio = screen.getAllByRole('radio')[0];
      expect(firstRadio).not.toBeChecked();
      
      await user.click(firstRadio);
      expect(firstRadio).toBeChecked();
      expect(mockOnChange).toHaveBeenCalledWith('option1', expect.objectContaining({
        value: 'option1',
        label: 'First Option'
      }));
    });
    
    test('only allows single selection', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const radioButtons = screen.getAllByRole('radio');
      
      await user.click(radioButtons[0]);
      expect(radioButtons[0]).toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
      
      await user.click(radioButtons[1]);
      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).toBeChecked();
      
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
    
    test('respects controlled value prop', () => {
      const { rerender } = render(
        <FormRadio options={simpleOptions} value="option1" />
      );
      
      let radioButtons = screen.getAllByRole('radio');
      expect(radioButtons[0]).toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
      
      rerender(<FormRadio options={simpleOptions} value="option2" />);
      
      radioButtons = screen.getAllByRole('radio');
      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).toBeChecked();
    });
    
    test('respects defaultValue prop', () => {
      render(<FormRadio options={simpleOptions} defaultValue="option2" />);
      
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).toBeChecked();
    });
    
    test('handles disabled state', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions}
          disabled={true}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled();
      });
      
      await user.click(radioButtons[0]);
      expect(mockOnChange).not.toHaveBeenCalled();
    });
    
    test('handles readOnly state', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions}
          readOnly={true}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const firstRadio = screen.getAllByRole('radio')[0];
      await user.click(firstRadio);
      expect(mockOnChange).not.toHaveBeenCalled();
    });
    
    test('respects disabled options', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={optionsWithIcons}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const radioButtons = screen.getAllByRole('radio');
      const disabledRadio = radioButtons[2]; // 'enterprise' option is disabled
      
      expect(disabledRadio).toBeDisabled();
      
      await user.click(disabledRadio);
      expect(mockOnChange).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        value: 'enterprise'
      }));
    });
  });
  
  // ==========================================
  // GROUPED RADIO TESTS
  // ==========================================
  
  describe('Grouped Radio Functionality', () => {
    test('renders grouped radio buttons correctly', () => {
      render(<FormRadio grouped={true} groups={groupedOptions} />);
      
      // Check group headers
      expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
      expect(screen.getByText('Billing Frequency')).toBeInTheDocument();
      
      // Check group descriptions
      expect(screen.getByText('Choose your subscription tier')).toBeInTheDocument();
      
      // Check individual options
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });
    
    test('maintains single selection across groups', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          grouped={true}
          groups={groupedOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      // Select option from first group
      const freeRadio = screen.getByDisplayValue('free');
      await user.click(freeRadio);
      
      expect(mockOnChange).toHaveBeenCalledWith('free', expect.objectContaining({
        value: 'free'
      }));
      
      // Select option from second group
      const monthlyRadio = screen.getByDisplayValue('monthly');
      await user.click(monthlyRadio);
      
      expect(mockOnChange).toHaveBeenCalledWith('monthly', expect.objectContaining({
        value: 'monthly'
      }));
      
      // First selection should be deselected
      expect(freeRadio).not.toBeChecked();
      expect(monthlyRadio).toBeChecked();
    });
    
    test('handles group validation requirements', () => {
      const groupsWithValidation = [
        {
          ...groupedOptions[0],
          required: true
        }
      ];
      
      render(
        <FormRadio 
          grouped={true}
          groups={groupsWithValidation}
          validationRules={[
            { type: 'required', message: 'Please select a subscription plan' }
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
    test('navigates between radio options with arrow keys', async () => {
      render(<FormRadio options={simpleOptions} />);
      
      const firstRadio = screen.getAllByRole('radio')[0];
      firstRadio.focus();
      
      await user.keyboard('{ArrowDown}');
      
      const secondRadio = screen.getAllByRole('radio')[1];
      expect(secondRadio).toHaveFocus();
    });
    
    test('selects radio option with space key', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const firstRadio = screen.getAllByRole('radio')[0];
      firstRadio.focus();
      
      await user.keyboard(' ');
      expect(mockOnChange).toHaveBeenCalledWith('option1', expect.objectContaining({
        value: 'option1'
      }));
    });
    
    test('selects radio option with enter key', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const firstRadio = screen.getAllByRole('radio')[0];
      firstRadio.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnChange).toHaveBeenCalledWith('option1', expect.objectContaining({
        value: 'option1'
      }));
    });
    
    test('navigates to first radio with Home key', async () => {
      render(<FormRadio options={simpleOptions} />);
      
      const lastRadio = screen.getAllByRole('radio')[3];
      lastRadio.focus();
      
      await user.keyboard('{Home}');
      
      const firstRadio = screen.getAllByRole('radio')[0];
      expect(firstRadio).toHaveFocus();
    });
    
    test('navigates to last radio with End key', async () => {
      render(<FormRadio options={simpleOptions} />);
      
      const firstRadio = screen.getAllByRole('radio')[0];
      firstRadio.focus();
      
      await user.keyboard('{End}');
      
      const lastRadio = screen.getAllByRole('radio')[3];
      expect(lastRadio).toHaveFocus();
    });
    
    test('skips disabled radio options during navigation', async () => {
      render(<FormRadio options={optionsWithIcons} />);
      
      const secondRadio = screen.getAllByRole('radio')[1];
      secondRadio.focus();
      
      // Navigate down should skip disabled option and go to next available
      await user.keyboard('{ArrowDown}');
      
      // Should skip the disabled enterprise option
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons[2]).toBeDisabled();
    });
  });
  
  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormRadio
          options={simpleOptions}
          label="Accessible radio buttons"
          helperText="Select your preference"
          ariaLabel="Custom aria label"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('creates proper radio group', () => {
      render(<FormRadio options={simpleOptions} label="Test Radio Group" />);
      
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveAttribute('aria-label', 'Test Radio Group');
    });
    
    test('supports aria-label', () => {
      render(<FormRadio options={simpleOptions} ariaLabel="Custom aria label" />);
      
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-label', 'Custom aria label');
    });
    
    test('supports aria-describedby', () => {
      render(<FormRadio options={simpleOptions} ariaDescribedBy="helper-text" />);
      
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-describedby', 'helper-text');
    });
    
    test('sets aria-required for required fields', () => {
      render(<FormRadio options={simpleOptions} required />);
      
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-required', 'true');
    });
    
    test('provides screen reader text', () => {
      render(<FormRadio options={simpleOptions} screenReaderText="Additional context" />);
      
      expect(screen.getByText('Additional context')).toHaveClass('sr-only');
    });
    
    test('error messages have alert role', () => {
      render(<FormRadio options={simpleOptions} errorText="This field is required" />);
      
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
    
    test('grouped radio buttons have proper ARIA structure', () => {
      render(<FormRadio grouped={true} groups={groupedOptions} />);
      
      // Should have proper radio group structure
      const radioGroups = screen.getAllByRole('radiogroup');
      expect(radioGroups.length).toBeGreaterThan(0);
      
      // Individual radio buttons should be properly labeled
      const freeRadio = screen.getByDisplayValue('free');
      expect(freeRadio).toHaveAttribute('value', 'free');
    });
    
    test('radio buttons have proper name attribute for grouping', () => {
      render(<FormRadio options={simpleOptions} name="test-group" />);
      
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('name', 'test-group');
      });
    });
  });
  
  // ==========================================
  // VALIDATION TESTS
  // ==========================================
  
  describe('Validation', () => {
    test('validates required fields', async () => {
      const mockOnValidationChange = jest.fn();
      render(
        <FormRadio 
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
            errors: expect.arrayContaining(['Please select an option'])
          })
        );
      });
    });
    
    test('validates with custom validator', async () => {
      const customValidator = jest.fn((value) => value !== 'option3');
      const mockOnValidationChange = jest.fn();
      
      render(
        <FormRadio 
          options={simpleOptions}
          validationRules={[
            { 
              type: 'custom', 
              message: 'Option 3 is not allowed',
              validator: customValidator
            }
          ]}
          value="option3"
          eventHandlers={{ onValidationChange: mockOnValidationChange }}
        />
      );
      
      await waitFor(() => {
        expect(customValidator).toHaveBeenCalledWith('option3');
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
            errors: expect.arrayContaining(['Option 3 is not allowed'])
          })
        );
      });
    });
    
    test('passes validation when selection is valid', async () => {
      const mockOnValidationChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions}
          validationRules={[
            { type: 'required', message: 'Selection required' }
          ]}
          value="option1"
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
      const { container } = render(<FormRadio options={simpleOptions} />);
      expect(container.querySelector('.form-radio-list')).toBeInTheDocument();
    });
    
    test('renders horizontal layout when specified', () => {
      const { container } = render(
        <FormRadio 
          options={simpleOptions}
          layout={{ orientation: 'horizontal' }}
        />
      );
      expect(container.querySelector('.form-radio-container--horizontal')).toBeInTheDocument();
    });
    
    test('renders grid layout with specified columns', () => {
      const { container } = render(
        <FormRadio 
          options={simpleOptions}
          layout={{ orientation: 'grid', columns: 2 }}
        />
      );
      expect(container.querySelector('.form-radio-container--grid')).toBeInTheDocument();
    });
    
    test('applies spacing variants correctly', () => {
      const { container: compactContainer } = render(
        <FormRadio 
          options={simpleOptions}
          layout={{ spacing: 'compact' }}
        />
      );
      expect(compactContainer.querySelector('.form-radio-container--spacing-compact')).toBeInTheDocument();
      
      const { container: relaxedContainer } = render(
        <FormRadio 
          options={simpleOptions}
          layout={{ spacing: 'relaxed' }}
        />
      );
      expect(relaxedContainer.querySelector('.form-radio-container--spacing-relaxed')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // REF INTERFACE TESTS
  // ==========================================
  
  describe('Ref Interface', () => {
    test('provides imperative handle methods', () => {
      const ref = React.createRef<FormRadioRef>();
      render(<FormRadio options={simpleOptions} ref={ref} />);
      
      expect(ref.current).toMatchObject({
        focus: expect.any(Function),
        blur: expect.any(Function),
        getSelectedValue: expect.any(Function),
        setSelectedValue: expect.any(Function),
        validate: expect.any(Function),
        getValidationState: expect.any(Function),
        clearSelection: expect.any(Function)
      });
    });
    
    test('focus method works', () => {
      const ref = React.createRef<FormRadioRef>();
      render(<FormRadio options={simpleOptions} ref={ref} />);
      
      ref.current?.focus();
      
      const firstRadio = screen.getAllByRole('radio')[0];
      expect(firstRadio).toHaveFocus();
    });
    
    test('getSelectedValue returns current selection', () => {
      const ref = React.createRef<FormRadioRef>();
      render(<FormRadio options={simpleOptions} ref={ref} value="option2" />);
      
      const selectedValue = ref.current?.getSelectedValue();
      expect(selectedValue).toBe('option2');
    });
    
    test('setSelectedValue changes selection', () => {
      const ref = React.createRef<FormRadioRef>();
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions} 
          ref={ref}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      act(() => {
        ref.current?.setSelectedValue('option3');
      });
      
      expect(mockOnChange).toHaveBeenCalledWith('option3');
    });
    
    test('clearSelection clears current selection', () => {
      const ref = React.createRef<FormRadioRef>();
      const mockOnChange = jest.fn();
      render(
        <FormRadio 
          options={simpleOptions} 
          ref={ref}
          value="option1"
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      act(() => {
        ref.current?.clearSelection();
      });
      
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
    
    test('validate method returns validation state', async () => {
      const ref = React.createRef<FormRadioRef>();
      render(
        <FormRadio 
          options={simpleOptions} 
          ref={ref}
          validationRules={[
            { type: 'required', message: 'Selection required' }
          ]}
        />
      );
      
      const validationState = await ref.current?.validate();
      expect(validationState).toMatchObject({
        isValid: false,
        errors: expect.arrayContaining(['Selection required'])
      });
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
      
      render(<FormRadio options={largeOptionsList} />);
      
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
        <FormRadio 
          options={largeOptionsList}
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const radioButtons = screen.getAllByRole('radio');
      
      const startTime = performance.now();
      
      // Select multiple radio buttons rapidly (only last one should remain selected)
      for (let i = 0; i < 10; i++) {
        await user.click(radioButtons[i]);
      }
      
      const endTime = performance.now();
      const selectionTime = endTime - startTime;
      
      // Should handle rapid selections efficiently
      expect(selectionTime).toBeLessThan(1000);
      expect(mockOnChange).toHaveBeenCalledTimes(10);
    });
  });
  
  // ==========================================
  // EDGE CASES AND ERROR HANDLING
  // ==========================================
  
  describe('Edge Cases', () => {
    test('handles empty options array', () => {
      render(<FormRadio options={[]} />);
      const radioButtons = screen.queryAllByRole('radio');
      expect(radioButtons).toHaveLength(0);
    });
    
    test('handles options with duplicate values', () => {
      const duplicateOptions = [
        { value: 'duplicate', label: 'First' },
        { value: 'duplicate', label: 'Second' }
      ];
      
      render(<FormRadio options={duplicateOptions} />);
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
    
    test('handles invalid value prop', () => {
      render(<FormRadio options={simpleOptions} value="invalid-value" />);
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked();
      });
    });
    
    test('handles options with special characters', () => {
      const specialOptions = [
        { value: 'special-1', label: 'Option with "quotes"' },
        { value: 'special-2', label: 'Option with <tags>' },
        { value: 'special-3', label: 'Option with émojis 🎉' }
      ];
      
      render(<FormRadio options={specialOptions} />);
      
      expect(screen.getByText('Option with "quotes"')).toBeInTheDocument();
      expect(screen.getByText('Option with <tags>')).toBeInTheDocument();
      expect(screen.getByText('Option with émojis 🎉')).toBeInTheDocument();
    });
    
    test('maintains focus management during interactions', async () => {
      render(<FormRadio options={simpleOptions} />);
      
      const firstRadio = screen.getAllByRole('radio')[0];
      firstRadio.focus();
      
      expect(firstRadio).toHaveFocus();
      
      await user.click(firstRadio);
      
      // Focus should be maintained after interaction
      expect(firstRadio).toHaveFocus();
    });
  });
  
  // ==========================================
  // INTEGRATION TESTS
  // ==========================================
  
  describe('Integration', () => {
    test('works with form submission', async () => {
      const mockSubmit = jest.fn();
      
      const TestForm = () => {
        const [value, setValue] = React.useState<string | number | null>(null);
        
        return (
          <form onSubmit={(e) => { e.preventDefault(); mockSubmit(value); }}>
            <FormRadio
              options={simpleOptions}
              value={value}
              eventHandlers={{ onChange: setValue }}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };
      
      render(<TestForm />);
      
      await user.click(screen.getAllByRole('radio')[0]);
      await user.click(screen.getByRole('button'));
      
      expect(mockSubmit).toHaveBeenCalledWith('option1');
    });
    
    test('integrates with external validation library', async () => {
      const externalValidator = (value: string | number | null) => {
        if (value === null) return 'Please select an option';
        if (value === 'option3') return 'Option 3 is not allowed';
        return '';
      };
      
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | number | null>(null);
        const [error, setError] = React.useState('');
        
        React.useEffect(() => {
          setError(externalValidator(value));
        }, [value]);
        
        return (
          <FormRadio
            options={simpleOptions}
            value={value}
            eventHandlers={{ onChange: setValue }}
            validationState={error ? 'error' : 'neutral'}
            errorText={error}
          />
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
      
      await user.click(screen.getAllByRole('radio')[2]); // option3
      
      expect(screen.getByText('Option 3 is not allowed')).toBeInTheDocument();
      
      await user.click(screen.getAllByRole('radio')[0]); // option1
      
      expect(screen.queryByText('Please select an option')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3 is not allowed')).not.toBeInTheDocument();
    });
  });
}); 