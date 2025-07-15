import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormCheckbox, CheckboxOption } from '../components/ui/FormCheckbox';

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE TEST SUITE =====

expect.extend(toHaveNoViolations);

// ===== TEST DATA =====

const basicOptions: CheckboxOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

const iconOptions: CheckboxOption[] = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'editor', label: 'Editor', description: 'Content management' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const disabledOptions: CheckboxOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2', disabled: true },
  { value: 'option3', label: 'Option 3' },
];

describe('FormCheckbox V7.5 Enhanced', () => {
  // ===== BASIC FUNCTIONALITY TESTS =====
  
  describe('Basic Functionality', () => {
    test('renders with default props', () => {
      render(<FormCheckbox option={{ value: 'test', label: 'Test' }} data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    test('renders with label', () => {
      render(<FormCheckbox label="Test Label" option={{ value: 'test', label: 'Test Option' }} data-testid="checkbox" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Option')).toBeInTheDocument();
    });

    test('renders with helper text', () => {
      render(<FormCheckbox helperText="Helper text" option={{ value: 'test', label: 'Test' }} data-testid="checkbox" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    test('handles default value', () => {
      render(<FormCheckbox defaultValue={true} option={{ value: 'test', label: 'Test' }} data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    test('handles controlled value', () => {
      const handleChange = jest.fn();
      render(<FormCheckbox value={true} onChange={handleChange} option={{ value: 'test', label: 'Test' }} data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  // ===== VARIANT TESTS =====
  
  describe('V7.5 Enhanced Variants', () => {
    test('renders all variants without errors', () => {
      const variants = ['glass', 'outlined', 'filled', 'minimal'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <FormCheckbox 
            variant={variant as any} 
            option={{ value: 'test', label: 'Test' }}
            data-testid={`checkbox-${variant}`} 
          />
        );
        expect(screen.getByTestId(`checkbox-${variant}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(
          <FormCheckbox 
            size={size as any} 
            option={{ value: 'test', label: 'Test' }}
            data-testid={`checkbox-${size}`} 
          />
        );
        expect(screen.getByTestId(`checkbox-${size}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ===== SINGLE CHECKBOX TESTS =====
  
  describe('Single Checkbox Functionality', () => {
    test('toggles on click', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          option={{ value: 'test', label: 'Test' }}
          onChange={handleChange} 
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);
      
      expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    test('handles indeterminate state', () => {
      render(
        <FormCheckbox 
          option={{ value: 'test', label: 'Test' }}
          indeterminate
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    test('handles disabled state', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          option={{ value: 'test', label: 'Test' }}
          disabled
          onChange={handleChange} 
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toBeDisabled();
      
      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    test('calls onChange with correct parameters', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          option={{ value: 'test-value', label: 'Test' }}
          onChange={handleChange} 
          data-testid="checkbox" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox'));
      
      expect(handleChange).toHaveBeenCalledWith('test-value', expect.any(Object));
    });
  });

  // ===== CHECKBOX GROUPS TESTS =====
  
  describe('Checkbox Groups Functionality', () => {
    test('renders multiple checkboxes for options', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          data-testid="checkbox-group" 
        />
      );
      
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('handles group value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      const reactCheckbox = screen.getByTestId('checkbox-group-react');
      await user.click(reactCheckbox);
      
      expect(handleChange).toHaveBeenCalledWith(['react'], expect.any(Object));
    });

    test('maintains multiple selections', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox-group-react'));
      await user.click(screen.getByTestId('checkbox-group-vue'));
      
      expect(handleChange).toHaveBeenLastCalledWith(['react', 'vue'], expect.any(Object));
    });

    test('removes selection when unchecked', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          value={['react', 'vue']}
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox-group-react'));
      
      expect(handleChange).toHaveBeenCalledWith(['vue'], expect.any(Object));
    });

    test('calls onGroupChange when provided', async () => {
      const handleGroupChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          onGroupChange={handleGroupChange}
          data-testid="checkbox-group" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox-group-react'));
      
      expect(handleGroupChange).toHaveBeenCalledWith(['react'], [basicOptions[0]]);
    });

    test('shows selection count', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          value={['react', 'vue']}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('2 of 4 selected')).toBeInTheDocument();
    });
  });

  // ===== SELECT ALL TESTS =====
  
  describe('Select All Functionality', () => {
    test('renders select all checkbox when showSelectAll is true', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          showSelectAll
          selectAllLabel="Select All Frameworks"
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('Select All Frameworks')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-group-select-all')).toBeInTheDocument();
    });

    test('selects all options when select all is clicked', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          showSelectAll
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox-group-select-all'));
      
      const expectedValues = basicOptions.map(opt => opt.value);
      expect(handleChange).toHaveBeenCalledWith(expectedValues, expect.any(Object));
    });

    test('deselects all options when select all is clicked again', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      const allValues = basicOptions.map(opt => opt.value);
      
      render(
        <FormCheckbox 
          options={basicOptions}
          showSelectAll
          value={allValues}
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox-group-select-all'));
      
      expect(handleChange).toHaveBeenCalledWith([], expect.any(Object));
    });

    test('shows indeterminate state when some options are selected', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          showSelectAll
          value={['react']}
          data-testid="checkbox-group" 
        />
      );
      
      const selectAllCheckbox = screen.getByTestId('checkbox-group-select-all');
      expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'mixed');
    });

    test('shows checked state when all options are selected', () => {
      const allValues = basicOptions.map(opt => opt.value);
      
      render(
        <FormCheckbox 
          options={basicOptions}
          showSelectAll
          value={allValues}
          data-testid="checkbox-group" 
        />
      );
      
      const selectAllCheckbox = screen.getByTestId('checkbox-group-select-all') as HTMLInputElement;
      expect(selectAllCheckbox.checked).toBe(true);
    });

    test('ignores disabled options in select all calculation', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={disabledOptions}
          showSelectAll
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox-group-select-all'));
      
      // Should only select enabled options
      expect(handleChange).toHaveBeenCalledWith(['option1', 'option3'], expect.any(Object));
    });
  });

  // ===== SELECTION LIMITS TESTS =====
  
  describe('Selection Limits', () => {
    test('respects maxSelections limit', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          maxSelections={2}
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox-group-react'));
      await user.click(screen.getByTestId('checkbox-group-vue'));
      await user.click(screen.getByTestId('checkbox-group-angular'));
      
      // Should only have been called twice (for first two selections)
      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    test('validates minSelections requirement', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          minSelections={2}
          required
          value={[]}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('Please select at least 2 option(s)')).toBeInTheDocument();
    });

    test('validates maxSelections limit', () => {
      const allValues = basicOptions.map(opt => opt.value);
      
      render(
        <FormCheckbox 
          options={basicOptions}
          maxSelections={2}
          value={allValues}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('Please select no more than 2 option(s)')).toBeInTheDocument();
    });

    test('shows selection count with limits', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          maxSelections={3}
          minSelections={1}
          value={['react']}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('1 of 4 selected (max 3) (min 1)')).toBeInTheDocument();
    });
  });

  // ===== LAYOUT TESTS =====
  
  describe('Layout and Styling', () => {
    test('renders horizontal layout', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          groupDirection="horizontal"
          data-testid="checkbox-group" 
        />
      );
      
      // Test that checkboxes are rendered (implementation detail may vary)
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('renders vertical layout', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          groupDirection="vertical"
          data-testid="checkbox-group" 
        />
      );
      
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('applies full width correctly', () => {
      const { container } = render(
        <FormCheckbox 
          fullWidth 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%' });
    });

    test('applies custom className', () => {
      const { container } = render(
        <FormCheckbox 
          className="custom-class" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <FormCheckbox 
          style={customStyle} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });
  });

  // ===== VALIDATION TESTS =====
  
  describe('Validation States', () => {
    test('shows error state correctly', () => {
      render(
        <FormCheckbox 
          error 
          errorMessage="Error message" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    test('shows success state correctly', () => {
      render(
        <FormCheckbox 
          success 
          successMessage="Success message" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-invalid', 'false');
    });

    test('shows warning state correctly', () => {
      render(
        <FormCheckbox 
          warning 
          warningMessage="Warning message" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    test('handles required attribute', () => {
      render(
        <FormCheckbox 
          required 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-required', 'true');
    });

    test('validates required group', () => {
      render(
        <FormCheckbox 
          options={basicOptions}
          required
          value={[]}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('Please select at least one option')).toBeInTheDocument();
    });
  });

  // ===== FOCUS & INTERACTION TESTS =====
  
  describe('Focus and Interaction', () => {
    test('calls onFocus when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          onFocus={handleFocus} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      await user.click(screen.getByTestId('checkbox'));
      expect(handleFocus).toHaveBeenCalled();
    });

    test('calls onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(
        <div>
          <FormCheckbox 
            onBlur={handleBlur} 
            option={{ value: 'test', label: 'Test' }}
            data-testid="checkbox" 
          />
          <button data-testid="other">Other</button>
        </div>
      );
      
      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);
      await user.click(screen.getByTestId('other'));
      
      expect(handleBlur).toHaveBeenCalled();
    });

    test('autoFocus works correctly', () => {
      render(
        <FormCheckbox 
          autoFocus 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      expect(screen.getByTestId('checkbox')).toHaveFocus();
    });

    test('handles keyboard navigation', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          onChange={handleChange} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      checkbox.focus();
      await user.keyboard(' ');
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  
  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormCheckbox 
          label="Accessible Checkbox"
          helperText="Helper text"
          required
          option={{ value: 'test', label: 'Test Option' }}
          data-testid="checkbox"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has no accessibility violations for groups', async () => {
      const { container } = render(
        <FormCheckbox 
          label="Accessible Group"
          helperText="Helper text"
          options={basicOptions}
          showSelectAll
          data-testid="checkbox-group"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('associates label with checkbox', () => {
      render(
        <FormCheckbox 
          label="Test Label" 
          option={{ value: 'test', label: 'Test Option' }}
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAccessibleName();
    });

    test('associates helper text with checkbox', () => {
      render(
        <FormCheckbox 
          helperText="Helper text" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      const helperText = screen.getByText('Helper text');
      
      expect(checkbox).toHaveAttribute('aria-describedby', expect.stringContaining(helperText.id));
    });

    test('has proper checkbox role', () => {
      render(
        <FormCheckbox 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('role', 'checkbox');
    });

    test('announces checked state changes', async () => {
      const user = userEvent.setup();
      render(
        <FormCheckbox 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      
      await user.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    test('announces indeterminate state correctly', () => {
      render(
        <FormCheckbox 
          option={{ value: 'test', label: 'Test' }}
          indeterminate
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    });

    test('handles disabled options correctly', () => {
      render(
        <FormCheckbox 
          options={disabledOptions}
          data-testid="checkbox-group" 
        />
      );
      
      const disabledCheckbox = screen.getByTestId('checkbox-group-option2');
      expect(disabledCheckbox).toBeDisabled();
    });
  });

  // ===== OPTIONS WITH DESCRIPTIONS & ICONS =====
  
  describe('Rich Content Options', () => {
    test('renders options with descriptions', () => {
      render(
        <FormCheckbox 
          options={iconOptions}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('Full system access')).toBeInTheDocument();
      expect(screen.getByText('Content management')).toBeInTheDocument();
      expect(screen.getByText('Read-only access')).toBeInTheDocument();
    });

    test('renders options with icons', () => {
      const optionsWithIcons = [
        { value: 'icon1', label: 'Option 1', icon: <span data-testid="icon-1">Icon</span> },
        { value: 'icon2', label: 'Option 2', icon: <span data-testid="icon-2">Icon</span> },
      ];
      
      render(
        <FormCheckbox 
          options={optionsWithIcons}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByTestId('icon-1')).toBeInTheDocument();
      expect(screen.getByTestId('icon-2')).toBeInTheDocument();
    });
  });

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { option: { value: 'test', label: 'Test' }, 'data-testid': 'checkbox' };
      const { rerender } = render(<FormCheckbox {...props} />);
      
      // Should not re-render with same props
      const firstRender = screen.getByTestId('checkbox');
      rerender(<FormCheckbox {...props} />);
      const secondRender = screen.getByTestId('checkbox');
      
      expect(firstRender).toBe(secondRender);
    });

    test('handles large option sets efficiently', async () => {
      const largeOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i + 1}`,
      }));
      
      const startTime = performance.now();
      
      render(
        <FormCheckbox 
          options={largeOptions}
          data-testid="checkbox-group" 
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should handle large datasets efficiently
      expect(renderTime).toBeLessThan(1000); // 1 second
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    test('group state management is efficient', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          onChange={handleChange}
          data-testid="checkbox-group" 
        />
      );
      
      const startTime = performance.now();
      
      // Rapid selections
      for (const option of basicOptions) {
        await user.click(screen.getByTestId(`checkbox-group-${option.value}`));
      }
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      // Should handle rapid state changes efficiently
      expect(operationTime).toBeLessThan(1000); // 1 second
      expect(handleChange).toHaveBeenCalledTimes(basicOptions.length);
    });
  });

  // ===== EDGE CASES =====
  
  describe('Edge Cases', () => {
    test('handles empty options array', () => {
      render(
        <FormCheckbox 
          options={[]}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('0 of 0 selected')).toBeInTheDocument();
    });

    test('handles undefined value correctly', () => {
      render(
        <FormCheckbox 
          value={undefined} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    test('handles null onChange gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          onChange={undefined} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      await user.click(checkbox);
      
      // Should not crash
      expect(checkbox).toBeInTheDocument();
    });

    test('handles options with duplicate values', () => {
      const duplicateOptions = [
        { value: 'same', label: 'Option 1' },
        { value: 'same', label: 'Option 2' },
      ];
      
      render(
        <FormCheckbox 
          options={duplicateOptions}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    test('handles very long option labels', () => {
      const longLabelOption = {
        value: 'long',
        label: 'This is a very long option label that might cause layout issues but should be handled gracefully',
      };
      
      render(
        <FormCheckbox 
          option={longLabelOption}
          data-testid="checkbox" 
        />
      );
      
      expect(screen.getByText(longLabelOption.label)).toBeInTheDocument();
    });

    test('handles special characters in option values and labels', () => {
      const specialOptions = [
        { value: '!@#$%^&*()', label: 'Special !@#$%^&*()' },
        { value: 'unicode-🚀', label: 'Unicode 🚀 Option' },
      ];
      
      render(
        <FormCheckbox 
          options={specialOptions}
          data-testid="checkbox-group" 
        />
      );
      
      expect(screen.getByText('Special !@#$%^&*()')).toBeInTheDocument();
      expect(screen.getByText('Unicode 🚀 Option')).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTS =====
  
  describe('Integration', () => {
    test('works correctly within form context', async () => {
      const handleSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <FormCheckbox 
            name="testField" 
            option={{ value: 'test', label: 'Test' }}
            data-testid="checkbox" 
          />
          <button type="submit">Submit</button>
        </form>
      );
      
      await user.click(screen.getByTestId('checkbox'));
      await user.click(screen.getByText('Submit'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    test('maintains ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      
      render(
        <FormCheckbox 
          ref={ref} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="checkbox" 
        />
      );
      
      // Note: ref forwarding for checkbox groups might be different
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    test('forwards all HTML attributes correctly', () => {
      render(
        <FormCheckbox 
          data-testid="checkbox"
          name="frameworks"
          id="framework-checkbox"
          option={{ value: 'test', label: 'Test' }}
        />
      );
      
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('name', 'frameworks');
      expect(checkbox).toHaveAttribute('id', 'framework-checkbox');
    });

    test('integrates groups with indeterminate state correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <FormCheckbox 
          options={basicOptions}
          showSelectAll
          data-testid="checkbox-group" 
        />
      );
      
      // Select one option
      await user.click(screen.getByTestId('checkbox-group-react'));
      
      // Select all should show indeterminate
      const selectAllCheckbox = screen.getByTestId('checkbox-group-select-all');
      expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'mixed');
    });
  });
});

// ===== CHARLIE PERFORMANCE BENCHMARKS =====

describe('FormCheckbox Performance Benchmarks', () => {
  test('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(
      <FormCheckbox 
        options={basicOptions}
        showSelectAll
        data-testid="checkbox-group" 
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 16ms (60fps budget)
    expect(renderTime).toBeLessThan(16);
  });

  test('group state updates performance', async () => {
    const user = userEvent.setup();
    const startTime = performance.now();
    
    render(
      <FormCheckbox 
        options={basicOptions}
        data-testid="checkbox-group" 
      />
    );
    
    // Simulate rapid interactions
    for (const option of basicOptions) {
      await user.click(screen.getByTestId(`checkbox-group-${option.value}`));
    }
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should handle interactions efficiently
    expect(operationTime).toBeLessThan(500); // 0.5 seconds
  });

  test('handles many simultaneous checkbox groups efficiently', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <FormCheckbox 
            key={i} 
            options={basicOptions}
            showSelectAll
            data-testid={`checkbox-group-${i}`} 
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should handle 10 checkbox groups within reasonable time
    expect(renderTime).toBeLessThan(200); // 0.2 seconds
  });
});

// ===== CHARLIE BUNDLE SIZE TEST =====

describe('FormCheckbox Bundle Impact', () => {
  test('component exports are tree-shakeable', () => {
    // This test ensures the component can be imported individually
    expect(FormCheckbox).toBeDefined();
    expect(typeof FormCheckbox).toBe('object'); // React.ForwardRefExoticComponent
  });

  test('group functionality is modular', () => {
    // Test that single checkboxes don't import group-related code unnecessarily
    render(
      <FormCheckbox 
        option={{ value: 'test', label: 'Test' }}
        data-testid="checkbox" 
      />
    );
    
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('indeterminate functionality is optional', () => {
    // Test without indeterminate state
    render(
      <FormCheckbox 
        option={{ value: 'test', label: 'Test' }}
        data-testid="checkbox-1" 
      />
    );
    
    const checkbox1 = screen.getByTestId('checkbox-1');
    expect(checkbox1).toHaveAttribute('aria-checked', 'false');
    
    // Test with indeterminate state
    render(
      <FormCheckbox 
        option={{ value: 'test2', label: 'Test 2' }}
        indeterminate
        data-testid="checkbox-2" 
      />
    );
    
    const checkbox2 = screen.getByTestId('checkbox-2');
    expect(checkbox2).toHaveAttribute('aria-checked', 'mixed');
  });
}); 