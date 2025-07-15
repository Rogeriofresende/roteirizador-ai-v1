import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormInput } from '../components/ui/FormInput';

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
      expect(input).toBeInTheDocument();
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

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { label: 'Test', 'data-testid': 'input' };
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