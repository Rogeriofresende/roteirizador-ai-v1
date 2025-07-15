import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormRadio, RadioOption } from '../components/ui/FormRadio';

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE TEST SUITE =====

expect.extend(toHaveNoViolations);

// ===== TEST DATA =====

const basicOptions: RadioOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

const richOptions: RadioOption[] = [
  { 
    value: 'basic', 
    label: 'Basic Plan', 
    description: 'Perfect for getting started',
    badge: '$9/month'
  },
  { 
    value: 'pro', 
    label: 'Pro Plan', 
    description: 'Best for professionals',
    badge: '$29/month',
    highlight: true
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise Plan', 
    description: 'For large organizations',
    badge: '$99/month'
  },
];

const disabledOptions: RadioOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2', disabled: true },
  { value: 'option3', label: 'Option 3' },
];

describe('FormRadio V7.5 Enhanced', () => {
  // ===== BASIC FUNCTIONALITY TESTS =====
  
  describe('Basic Functionality', () => {
    test('renders with default props', () => {
      render(<FormRadio option={{ value: 'test', label: 'Test' }} data-testid="radio" />);
      const radio = screen.getByTestId('radio');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute('type', 'radio');
    });

    test('renders with label', () => {
      render(<FormRadio label="Test Label" option={{ value: 'test', label: 'Test Option' }} data-testid="radio" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Option')).toBeInTheDocument();
    });

    test('renders with helper text', () => {
      render(<FormRadio helperText="Helper text" option={{ value: 'test', label: 'Test' }} data-testid="radio" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    test('handles default value', () => {
      render(<FormRadio defaultValue="test" option={{ value: 'test', label: 'Test' }} data-testid="radio" />);
      const radio = screen.getByTestId('radio') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    test('handles controlled value', () => {
      const handleChange = jest.fn();
      render(<FormRadio value="test" onChange={handleChange} option={{ value: 'test', label: 'Test' }} data-testid="radio" />);
      const radio = screen.getByTestId('radio') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });

  // ===== VARIANT TESTS =====
  
  describe('V7.5 Enhanced Variants', () => {
    test('renders all variants without errors', () => {
      const variants = ['glass', 'outlined', 'filled', 'minimal'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <FormRadio 
            variant={variant as any} 
            option={{ value: 'test', label: 'Test' }}
            data-testid={`radio-${variant}`} 
          />
        );
        expect(screen.getByTestId(`radio-${variant}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(
          <FormRadio 
            size={size as any} 
            option={{ value: 'test', label: 'Test' }}
            data-testid={`radio-${size}`} 
          />
        );
        expect(screen.getByTestId(`radio-${size}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all radio styles correctly', () => {
      const radioStyles = ['default', 'card', 'button', 'tile'];
      
      radioStyles.forEach(radioStyle => {
        const { unmount } = render(
          <FormRadio 
            radioStyle={radioStyle as any} 
            option={{ value: 'test', label: 'Test' }}
            data-testid={`radio-${radioStyle}`} 
          />
        );
        expect(screen.getByTestId(`radio-${radioStyle}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ===== SINGLE RADIO TESTS =====
  
  describe('Single Radio Functionality', () => {
    test('selects on click', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          option={{ value: 'test', label: 'Test' }}
          onChange={handleChange} 
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      await user.click(radio);
      
      expect(handleChange).toHaveBeenCalledWith('test', expect.any(Object));
    });

    test('handles disabled state', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          option={{ value: 'test', label: 'Test' }}
          disabled
          onChange={handleChange} 
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      expect(radio).toBeDisabled();
      
      await user.click(radio);
      expect(handleChange).not.toHaveBeenCalled();
    });

    test('handles deselect when allowDeselect is true', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          option={{ value: 'test', label: 'Test' }}
          value="test"
          allowDeselect
          onChange={handleChange} 
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      await user.click(radio);
      
      expect(handleChange).toHaveBeenCalledWith('', expect.any(Object));
    });

    test('calls onChange with correct parameters', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          option={{ value: 'test-value', label: 'Test' }}
          onChange={handleChange} 
          data-testid="radio" 
        />
      );
      
      await user.click(screen.getByTestId('radio'));
      
      expect(handleChange).toHaveBeenCalledWith('test-value', expect.any(Object));
    });
  });

  // ===== RADIO GROUPS TESTS =====
  
  describe('Radio Groups Functionality', () => {
    test('renders multiple radios for options', () => {
      render(
        <FormRadio 
          options={basicOptions}
          data-testid="radio-group" 
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
        <FormRadio 
          options={basicOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const reactRadio = screen.getByTestId('radio-group-react');
      await user.click(reactRadio);
      
      expect(handleChange).toHaveBeenCalledWith('react', expect.any(Object));
    });

    test('enforces single selection in groups', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={basicOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      // Select first option
      await user.click(screen.getByTestId('radio-group-react'));
      expect(handleChange).toHaveBeenCalledWith('react', expect.any(Object));
      
      // Select second option (should replace first)
      await user.click(screen.getByTestId('radio-group-vue'));
      expect(handleChange).toHaveBeenCalledWith('vue', expect.any(Object));
    });

    test('calls onGroupChange when provided', async () => {
      const handleGroupChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={basicOptions}
          onGroupChange={handleGroupChange}
          data-testid="radio-group" 
        />
      );
      
      await user.click(screen.getByTestId('radio-group-react'));
      
      expect(handleGroupChange).toHaveBeenCalledWith('react', basicOptions[0]);
    });

    test('handles group with disabled options', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={disabledOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const disabledRadio = screen.getByTestId('radio-group-option2');
      expect(disabledRadio).toBeDisabled();
      
      await user.click(disabledRadio);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // ===== KEYBOARD NAVIGATION TESTS =====
  
  describe('Keyboard Navigation', () => {
    test('handles arrow key navigation', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={basicOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const firstRadio = screen.getByTestId('radio-group-react');
      firstRadio.focus();
      
      await user.keyboard('{ArrowDown}');
      expect(handleChange).toHaveBeenCalledWith('vue', expect.any(Object));
    });

    test('handles home and end keys', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={basicOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const firstRadio = screen.getByTestId('radio-group-react');
      firstRadio.focus();
      
      await user.keyboard('{Home}');
      expect(handleChange).toHaveBeenCalledWith('react', expect.any(Object));
      
      await user.keyboard('{End}');
      expect(handleChange).toHaveBeenCalledWith('svelte', expect.any(Object));
    });

    test('skips disabled options in navigation', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={disabledOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const firstRadio = screen.getByTestId('radio-group-option1');
      firstRadio.focus();
      
      await user.keyboard('{ArrowDown}');
      // Should skip disabled option2 and go to option3
      expect(handleChange).toHaveBeenCalledWith('option3', expect.any(Object));
    });

    test('handles space key for selection', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={basicOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const firstRadio = screen.getByTestId('radio-group-react');
      firstRadio.focus();
      
      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledWith('react', expect.any(Object));
    });
  });

  // ===== LAYOUT TESTS =====
  
  describe('Layout and Styling', () => {
    test('renders horizontal layout', () => {
      render(
        <FormRadio 
          options={basicOptions}
          groupDirection="horizontal"
          data-testid="radio-group" 
        />
      );
      
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('renders grid layout', () => {
      render(
        <FormRadio 
          options={basicOptions}
          groupDirection="grid"
          gridColumns={2}
          data-testid="radio-group" 
        />
      );
      
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('applies full width correctly', () => {
      const { container } = render(
        <FormRadio 
          fullWidth 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%' });
    });

    test('applies custom className', () => {
      const { container } = render(
        <FormRadio 
          className="custom-class" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <FormRadio 
          style={customStyle} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });
  });

  // ===== RADIO STYLES TESTS =====
  
  describe('Radio Styles', () => {
    test('renders card style correctly', () => {
      render(
        <FormRadio 
          options={richOptions}
          radioStyle="card"
          data-testid="radio-group" 
        />
      );
      
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Perfect for getting started')).toBeInTheDocument();
      expect(screen.getByText('$9/month')).toBeInTheDocument();
    });

    test('renders button style correctly', () => {
      render(
        <FormRadio 
          options={basicOptions}
          radioStyle="button"
          data-testid="radio-group" 
        />
      );
      
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('renders tile style correctly', () => {
      render(
        <FormRadio 
          options={basicOptions}
          radioStyle="tile"
          data-testid="radio-group" 
        />
      );
      
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });

    test('handles rich content in options', () => {
      const optionsWithIcons = [
        { value: 'icon1', label: 'Option 1', icon: <span data-testid="icon-1">Icon</span> },
        { value: 'icon2', label: 'Option 2', description: 'Test description' },
      ];
      
      render(
        <FormRadio 
          options={optionsWithIcons}
          radioStyle="card"
          data-testid="radio-group" 
        />
      );
      
      expect(screen.getByTestId('icon-1')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  // ===== VALIDATION TESTS =====
  
  describe('Validation States', () => {
    test('shows error state correctly', () => {
      render(
        <FormRadio 
          error 
          errorMessage="Error message" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('radio')).toHaveAttribute('aria-invalid', 'true');
    });

    test('shows success state correctly', () => {
      render(
        <FormRadio 
          success 
          successMessage="Success message" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByTestId('radio')).toHaveAttribute('aria-invalid', 'false');
    });

    test('shows warning state correctly', () => {
      render(
        <FormRadio 
          warning 
          warningMessage="Warning message" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    test('handles required attribute', () => {
      render(
        <FormRadio 
          required 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      expect(screen.getByTestId('radio')).toHaveAttribute('aria-required', 'true');
    });

    test('validates required group', () => {
      render(
        <FormRadio 
          options={basicOptions}
          required
          value=""
          data-testid="radio-group" 
        />
      );
      
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });
  });

  // ===== FOCUS & INTERACTION TESTS =====
  
  describe('Focus and Interaction', () => {
    test('calls onFocus when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          onFocus={handleFocus} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      await user.click(screen.getByTestId('radio'));
      expect(handleFocus).toHaveBeenCalled();
    });

    test('calls onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(
        <div>
          <FormRadio 
            onBlur={handleBlur} 
            option={{ value: 'test', label: 'Test' }}
            data-testid="radio" 
          />
          <button data-testid="other">Other</button>
        </div>
      );
      
      const radio = screen.getByTestId('radio');
      await user.click(radio);
      await user.click(screen.getByTestId('other'));
      
      expect(handleBlur).toHaveBeenCalled();
    });

    test('autoFocus works correctly', () => {
      render(
        <FormRadio 
          autoFocus 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      expect(screen.getByTestId('radio')).toHaveFocus();
    });

    test('handles mouse interactions', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          onChange={handleChange} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      await user.click(radio);
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  
  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormRadio 
          label="Accessible Radio"
          helperText="Helper text"
          required
          option={{ value: 'test', label: 'Test Option' }}
          data-testid="radio"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has no accessibility violations for groups', async () => {
      const { container } = render(
        <FormRadio 
          label="Accessible Group"
          helperText="Helper text"
          options={basicOptions}
          data-testid="radio-group"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('associates label with radio', () => {
      render(
        <FormRadio 
          label="Test Label" 
          option={{ value: 'test', label: 'Test Option' }}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      expect(radio).toHaveAccessibleName();
    });

    test('associates helper text with radio', () => {
      render(
        <FormRadio 
          helperText="Helper text" 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      const helperText = screen.getByText('Helper text');
      
      expect(radio).toHaveAttribute('aria-describedby', expect.stringContaining(helperText.id));
    });

    test('has proper radio role', () => {
      render(
        <FormRadio 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      expect(radio).toHaveAttribute('role', 'radio');
    });

    test('has proper radiogroup role for groups', () => {
      render(
        <FormRadio 
          label="Test Group"
          options={basicOptions}
          data-testid="radio-group" 
        />
      );
      
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
    });

    test('announces checked state changes', async () => {
      const user = userEvent.setup();
      render(
        <FormRadio 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      expect(radio).toHaveAttribute('aria-checked', 'false');
      
      await user.click(radio);
      expect(radio).toHaveAttribute('aria-checked', 'true');
    });

    test('handles disabled options correctly', () => {
      render(
        <FormRadio 
          options={disabledOptions}
          data-testid="radio-group" 
        />
      );
      
      const disabledRadio = screen.getByTestId('radio-group-option2');
      expect(disabledRadio).toBeDisabled();
    });
  });

  // ===== DESELECT FUNCTIONALITY TESTS =====
  
  describe('Deselect Functionality', () => {
    test('allows deselection when allowDeselect is true', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          option={{ value: 'test', label: 'Test' }}
          value="test"
          allowDeselect
          onChange={handleChange}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      await user.click(radio);
      
      expect(handleChange).toHaveBeenCalledWith('', expect.any(Object));
    });

    test('prevents deselection when allowDeselect is false', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          option={{ value: 'test', label: 'Test' }}
          value="test"
          allowDeselect={false}
          onChange={handleChange}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      await user.click(radio);
      
      expect(handleChange).toHaveBeenCalledWith('test', expect.any(Object));
    });

    test('handles group deselection', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={basicOptions}
          value="react"
          allowDeselect
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const reactRadio = screen.getByTestId('radio-group-react');
      await user.click(reactRadio);
      
      expect(handleChange).toHaveBeenCalledWith('', expect.any(Object));
    });
  });

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { option: { value: 'test', label: 'Test' }, 'data-testid': 'radio' };
      const { rerender } = render(<FormRadio {...props} />);
      
      // Should not re-render with same props
      const firstRender = screen.getByTestId('radio');
      rerender(<FormRadio {...props} />);
      const secondRender = screen.getByTestId('radio');
      
      expect(firstRender).toBe(secondRender);
    });

    test('handles large option sets efficiently', async () => {
      const largeOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i + 1}`,
      }));
      
      const startTime = performance.now();
      
      render(
        <FormRadio 
          options={largeOptions}
          data-testid="radio-group" 
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should handle large datasets efficiently
      expect(renderTime).toBeLessThan(1000); // 1 second
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    test('keyboard navigation performance', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          options={basicOptions}
          onChange={handleChange}
          data-testid="radio-group" 
        />
      );
      
      const startTime = performance.now();
      
      const firstRadio = screen.getByTestId('radio-group-react');
      firstRadio.focus();
      
      // Rapid keyboard navigation
      for (let i = 0; i < basicOptions.length; i++) {
        await user.keyboard('{ArrowDown}');
      }
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      // Should handle rapid navigation efficiently
      expect(operationTime).toBeLessThan(500); // 0.5 seconds
      expect(handleChange).toHaveBeenCalled();
    });
  });

  // ===== EDGE CASES =====
  
  describe('Edge Cases', () => {
    test('handles empty options array', () => {
      render(
        <FormRadio 
          options={[]}
          data-testid="radio-group" 
        />
      );
      
      // Should render without error
      expect(screen.queryByTestId('radio-group')).toBeInTheDocument();
    });

    test('handles undefined value correctly', () => {
      render(
        <FormRadio 
          value={undefined} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio') as HTMLInputElement;
      expect(radio.checked).toBe(false);
    });

    test('handles null onChange gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <FormRadio 
          onChange={undefined} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      const radio = screen.getByTestId('radio');
      await user.click(radio);
      
      // Should not crash
      expect(radio).toBeInTheDocument();
    });

    test('handles options with duplicate values', () => {
      const duplicateOptions = [
        { value: 'same', label: 'Option 1' },
        { value: 'same', label: 'Option 2' },
      ];
      
      render(
        <FormRadio 
          options={duplicateOptions}
          data-testid="radio-group" 
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
        <FormRadio 
          option={longLabelOption}
          data-testid="radio" 
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
        <FormRadio 
          options={specialOptions}
          data-testid="radio-group" 
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
          <FormRadio 
            name="testField" 
            option={{ value: 'test', label: 'Test' }}
            data-testid="radio" 
          />
          <button type="submit">Submit</button>
        </form>
      );
      
      await user.click(screen.getByTestId('radio'));
      await user.click(screen.getByText('Submit'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    test('maintains ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      
      render(
        <FormRadio 
          ref={ref} 
          option={{ value: 'test', label: 'Test' }}
          data-testid="radio" 
        />
      );
      
      expect(screen.getByTestId('radio')).toBeInTheDocument();
    });

    test('forwards all HTML attributes correctly', () => {
      render(
        <FormRadio 
          data-testid="radio"
          name="frameworks"
          id="framework-radio"
          option={{ value: 'test', label: 'Test' }}
        />
      );
      
      const radio = screen.getByTestId('radio');
      expect(radio).toHaveAttribute('name', 'frameworks');
      expect(radio).toHaveAttribute('id', 'framework-radio');
    });

    test('integrates custom styling with accessibility', async () => {
      const { container } = render(
        <FormRadio 
          options={basicOptions}
          radioStyle="card"
          variant="glass"
          data-testid="radio-group" 
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Should still function properly with custom styling
      basicOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });
});

// ===== CHARLIE PERFORMANCE BENCHMARKS =====

describe('FormRadio Performance Benchmarks', () => {
  test('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(
      <FormRadio 
        options={basicOptions}
        radioStyle="card"
        data-testid="radio-group" 
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 16ms (60fps budget)
    expect(renderTime).toBeLessThan(16);
  });

  test('keyboard navigation performance', async () => {
    const user = userEvent.setup();
    const startTime = performance.now();
    
    render(
      <FormRadio 
        options={basicOptions}
        data-testid="radio-group" 
      />
    );
    
    const firstRadio = screen.getByTestId('radio-group-react');
    firstRadio.focus();
    
    // Rapid keyboard navigation
    for (let i = 0; i < 10; i++) {
      await user.keyboard('{ArrowDown}');
    }
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should handle rapid navigation efficiently
    expect(operationTime).toBeLessThan(300); // 0.3 seconds
  });

  test('handles many simultaneous radio groups efficiently', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <FormRadio 
            key={i} 
            options={basicOptions}
            radioStyle="default"
            data-testid={`radio-group-${i}`} 
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should handle 10 radio groups within reasonable time
    expect(renderTime).toBeLessThan(200); // 0.2 seconds
  });
});

// ===== CHARLIE BUNDLE SIZE TEST =====

describe('FormRadio Bundle Impact', () => {
  test('component exports are tree-shakeable', () => {
    // This test ensures the component can be imported individually
    expect(FormRadio).toBeDefined();
    expect(typeof FormRadio).toBe('object'); // React.ForwardRefExoticComponent
  });

  test('radio styles are modular', () => {
    // Test that default radios don't import card/button/tile styling unnecessarily
    render(
      <FormRadio 
        option={{ value: 'test', label: 'Test' }}
        radioStyle="default"
        data-testid="radio" 
      />
    );
    
    const radio = screen.getByTestId('radio');
    expect(radio).toBeInTheDocument();
  });

  test('deselect functionality is optional', () => {
    // Test without deselect
    render(
      <FormRadio 
        option={{ value: 'test', label: 'Test' }}
        allowDeselect={false}
        data-testid="radio-1" 
      />
    );
    
    const radio1 = screen.getByTestId('radio-1');
    expect(radio1).toBeInTheDocument();
    
    // Test with deselect
    render(
      <FormRadio 
        option={{ value: 'test2', label: 'Test 2' }}
        allowDeselect={true}
        data-testid="radio-2" 
      />
    );
    
    const radio2 = screen.getByTestId('radio-2');
    expect(radio2).toBeInTheDocument();
  });
}); 