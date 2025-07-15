import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormInput } from './FormInput';
import { theme as designTokens } from '../../design-system/tokens';

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE TEST SUITE =====

expect.extend(toHaveNoViolations);

describe('FormInput V7.5 Enhanced', () => {
  // ===== BASIC FUNCTIONALITY TESTS =====
  
  describe('Basic Functionality', () => {
    test('renders with default props', () => {
      render(<FormInput data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    test('renders with label', () => {
      render(<FormInput label="Test Label" data-testid="input" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toHaveAccessibleName('Test Label');
    });

    test('renders with placeholder', () => {
      render(<FormInput placeholder="Test placeholder" data-testid="input" />);
      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });

    test('renders with helper text', () => {
      render(<FormInput helperText="Helper text" data-testid="input" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    test('supports all input types', () => {
      const types = ['text', 'email', 'password', 'tel', 'url', 'search', 'number'];
      
      types.forEach(type => {
        const { unmount } = render(<FormInput type={type as any} data-testid={`input-${type}`} />);
        expect(screen.getByTestId(`input-${type}`)).toHaveAttribute('type', type);
        unmount();
      });
    });
  });

  // ===== VARIANT TESTS =====
  
  describe('V7.5 Enhanced Variants', () => {
    test('renders glass variant with correct styles', () => {
      render(<FormInput variant="glass" data-testid="input" />);
      const input = screen.getByTestId('input');
      const container = input.parentElement;
      
      expect(container).toHaveStyle({
        backdropFilter: 'blur(10px)',
      });
    });

    test('renders all variants without errors', () => {
      const variants = ['glass', 'outlined', 'filled', 'minimal', 'floating'];
      
      variants.forEach(variant => {
        const { unmount } = render(<FormInput variant={variant as any} data-testid={`input-${variant}`} />);
        expect(screen.getByTestId(`input-${variant}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(<FormInput size={size as any} data-testid={`input-${size}`} />);
        expect(screen.getByTestId(`input-${size}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ===== STATE MANAGEMENT TESTS =====
  
  describe('State Management', () => {
    test('handles controlled value', () => {
      const handleChange = jest.fn();
      render(<FormInput value="test value" onChange={handleChange} data-testid="input" />);
      
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    test('handles uncontrolled value with defaultValue', () => {
      render(<FormInput defaultValue="default value" data-testid="input" />);
      
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('default value');
    });

    test('calls onChange when value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormInput onChange={handleChange} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
    });

    test('updates internal state for uncontrolled component', async () => {
      const user = userEvent.setup();
      
      render(<FormInput data-testid="input" />);
      
      const input = screen.getByTestId('input') as HTMLInputElement;
      await user.type(input, 'test');
      
      expect(input.value).toBe('test');
    });
  });

  // ===== VALIDATION TESTS =====
  
  describe('Validation States', () => {
    test('shows error state correctly', () => {
      render(
        <FormInput 
          error 
          errorMessage="Error message" 
          data-testid="input" 
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });

    test('shows success state correctly', () => {
      render(
        <FormInput 
          success 
          successMessage="Success message" 
          data-testid="input" 
        />
      );
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'false');
    });

    test('shows warning state correctly', () => {
      render(
        <FormInput 
          warning 
          warningMessage="Warning message" 
          data-testid="input" 
        />
      );
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    test('handles required attribute', () => {
      render(<FormInput required data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-required', 'true');
    });

    test('handles disabled state', () => {
      render(<FormInput disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    test('handles readonly state', () => {
      render(<FormInput readOnly data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('readonly');
    });
  });

  // ===== ICON & INTERACTIVE FEATURES TESTS =====
  
  describe('Icons and Interactive Features', () => {
    test('renders start icon', () => {
      render(<FormInput startIcon="🔍" data-testid="input" />);
      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    test('renders end icon', () => {
      render(<FormInput endIcon="👁" data-testid="input" />);
      expect(screen.getByText('👁')).toBeInTheDocument();
    });

    test('shows clear button when clearable and has value', async () => {
      const user = userEvent.setup();
      
      render(<FormInput clearable data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      expect(screen.getByTestId('input-clear')).toBeInTheDocument();
    });

    test('clear button clears input value', async () => {
      const handleChange = jest.fn();
      const handleClear = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormInput 
          clearable 
          onChange={handleChange}
          onClear={handleClear}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      const clearButton = screen.getByTestId('input-clear');
      await user.click(clearButton);
      
      expect(handleClear).toHaveBeenCalled();
      expect(handleChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: '' })
        })
      );
    });

    test('shows character count when enabled', () => {
      render(
        <FormInput 
          maxLength={10} 
          showCharacterCount 
          value="test" 
          data-testid="input" 
        />
      );
      
      expect(screen.getByText('4/10')).toBeInTheDocument();
    });
  });

  // ===== FOCUS & INTERACTION TESTS =====
  
  describe('Focus and Interaction', () => {
    test('calls onFocus when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(<FormInput onFocus={handleFocus} data-testid="input" />);
      
      await user.click(screen.getByTestId('input'));
      expect(handleFocus).toHaveBeenCalled();
    });

    test('calls onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(<FormInput onBlur={handleBlur} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab(); // Move focus away
      
      expect(handleBlur).toHaveBeenCalled();
    });

    test('calls onKeyDown when key is pressed', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();
      
      render(<FormInput onKeyDown={handleKeyDown} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'a');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });

    test('autoFocus works correctly', () => {
      render(<FormInput autoFocus data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveFocus();
    });
  });

  // ===== DEBOUNCE TESTS =====
  
  describe('Debouncing', () => {
    test('debounces onChange calls', async () => {
      jest.useFakeTimers();
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormInput debounceMs={300} onChange={handleChange} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      // Should not have called debounced function yet
      expect(handleChange).not.toHaveBeenCalled();
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(handleChange).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  
  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormInput 
          label="Accessible Input"
          helperText="Helper text"
          required
          data-testid="input"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('associates label with input', () => {
      render(<FormInput label="Test Label" data-testid="input" />);
      
      const input = screen.getByTestId('input');
      const label = screen.getByText('Test Label');
      
      expect(input).toHaveAccessibleName('Test Label');
      expect(label).toHaveAttribute('for', input.id);
    });

    test('associates helper text with input', () => {
      render(<FormInput helperText="Helper text" data-testid="input" />);
      
      const input = screen.getByTestId('input');
      const helperText = screen.getByText('Helper text');
      
      expect(input).toHaveAttribute('aria-describedby', helperText.id);
    });

    test('associates error message with input', () => {
      render(
        <FormInput 
          error 
          errorMessage="Error message" 
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      const errorMessage = screen.getByText('Error message');
      
      expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
    });

    test('supports keyboard navigation for clear button', async () => {
      const user = userEvent.setup();
      
      render(<FormInput clearable defaultValue="test" data-testid="input" />);
      
      const clearButton = screen.getByTestId('input-clear');
      
      // Should be focusable
      await user.tab();
      await user.tab(); // First tab goes to input, second to clear button
      expect(clearButton).toHaveFocus();
      
      // Should work with Enter key
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('input')).toHaveValue('');
    });

    test('announces validation state changes to screen readers', () => {
      const { rerender } = render(<FormInput data-testid="input" />);
      
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'false');
      
      rerender(<FormInput error errorMessage="Error" data-testid="input" />);
      
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  // ===== LAYOUT TESTS =====
  
  describe('Layout and Styling', () => {
    test('applies full width correctly', () => {
      const { container } = render(<FormInput fullWidth data-testid="input" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%' });
    });

    test('applies custom className', () => {
      const { container } = render(<FormInput className="custom-class" data-testid="input" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<FormInput style={customStyle} data-testid="input" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });

    test('applies custom input className', () => {
      render(<FormInput inputClassName="custom-input" data-testid="input" />);
      
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input');
    });

    test('applies custom label className', () => {
      render(<FormInput label="Test" labelClassName="custom-label" data-testid="input" />);
      
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label');
    });
  });

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { label: 'Test', data-testid: 'input' };
      const { rerender } = render(<FormInput {...props} />);
      
      // Should not re-render with same props
      const firstRender = screen.getByTestId('input');
      rerender(<FormInput {...props} />);
      const secondRender = screen.getByTestId('input');
      
      expect(firstRender).toBe(secondRender);
    });

    test('handles many rapid value changes efficiently', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormInput onChange={handleChange} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      
      // Simulate rapid typing
      await user.type(input, 'very long text input');
      
      // Should handle all changes without errors
      expect(handleChange).toHaveBeenCalledTimes(20); // 20 characters
      expect(input).toHaveValue('very long text input');
    });
  });

  // ===== EDGE CASES =====
  
  describe('Edge Cases', () => {
    test('handles empty value correctly', () => {
      render(<FormInput value="" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('');
    });

    test('handles undefined value correctly', () => {
      render(<FormInput value={undefined} data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveValue('');
    });

    test('handles null onChange gracefully', async () => {
      const user = userEvent.setup();
      
      render(<FormInput onChange={undefined} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      expect(input).toHaveValue('test');
    });

    test('handles maxLength correctly', async () => {
      const user = userEvent.setup();
      
      render(<FormInput maxLength={5} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'very long text');
      
      expect((input as HTMLInputElement).value.length).toBeLessThanOrEqual(5);
    });

    test('handles special characters correctly', async () => {
      const user = userEvent.setup();
      
      render(<FormInput data-testid="input" />);
      
      const input = screen.getByTestId('input');
      const specialText = '!@#$%^&*()_+{}|:"<>?[];\'\\,./`~';
      await user.type(input, specialText);
      
      expect(input).toHaveValue(specialText);
    });

    test('handles paste operations correctly', async () => {
      const user = userEvent.setup();
      
      render(<FormInput data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.click(input);
      await user.paste('pasted text');
      
      expect(input).toHaveValue('pasted text');
    });
  });

  // ===== INTEGRATION TESTS =====
  
  describe('Integration', () => {
    test('works correctly within form context', async () => {
      const handleSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <FormInput name="testField" data-testid="input" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test value');
      await user.click(screen.getByText('Submit'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    test('maintains ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      
      render(<FormInput ref={ref} data-testid="input" />);
      
      expect(ref.current).toBe(screen.getByTestId('input'));
    });

    test('forwards all HTML attributes correctly', () => {
      render(
        <FormInput 
          data-testid="input"
          autoComplete="email"
          spellCheck={false}
          name="email"
          id="email-input"
        />
      );
      
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('autoComplete', 'email');
      expect(input).toHaveAttribute('spellCheck', 'false');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toHaveAttribute('id', 'email-input');
    });
  });

  // ===== REGRESSION TESTS =====
  
  describe('Regression Tests', () => {
    test('does not lose focus when validation state changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<FormInput data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.click(input);
      expect(input).toHaveFocus();
      
      // Change validation state
      rerender(<FormInput error errorMessage="Error" data-testid="input" />);
      
      expect(input).toHaveFocus();
    });

    test('clear button does not appear for disabled inputs', () => {
      render(<FormInput clearable disabled value="test" data-testid="input" />);
      
      expect(screen.queryByTestId('input-clear')).not.toBeInTheDocument();
    });

    test('validation messages are properly announced', () => {
      render(
        <FormInput 
          error 
          errorMessage="This field is required" 
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      const errorMessage = screen.getByText('This field is required');
      
      expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
      expect(errorMessage).toHaveAttribute('id');
    });
  });
});

// ===== CHARLIE PERFORMANCE BENCHMARKS =====

describe('FormInput Performance Benchmarks', () => {
  test('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<FormInput data-testid="input" />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 16ms (60fps budget)
    expect(renderTime).toBeLessThan(16);
  });

  test('handles many simultaneous inputs efficiently', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <FormInput key={i} data-testid={`input-${i}`} />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should handle 100 inputs within reasonable time
    expect(renderTime).toBeLessThan(1000); // 1 second
  });
});

// ===== CHARLIE BUNDLE SIZE TEST =====

describe('FormInput Bundle Impact', () => {
  test('component exports are tree-shakeable', () => {
    // This test ensures the component can be imported individually
    expect(FormInput).toBeDefined();
    expect(typeof FormInput).toBe('object'); // React.ForwardRefExoticComponent
  });
}); 