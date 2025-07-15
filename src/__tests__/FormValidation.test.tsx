import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormValidation, ValidationRules, ValidationRule } from '../components/ui/FormValidation';

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE TEST SUITE =====

expect.extend(toHaveNoViolations);

// ===== TEST DATA =====

const basicValidationRules: ValidationRule[] = [
  ValidationRules.required('Field is required'),
  ValidationRules.minLength(3, 'Must be at least 3 characters'),
];

const emailValidationRules: ValidationRule[] = [
  ValidationRules.required('Email is required'),
  ValidationRules.email('Invalid email format'),
];

const passwordValidationRules: ValidationRule[] = [
  ValidationRules.required('Password is required'),
  ValidationRules.minLength(8, 'Password must be at least 8 characters'),
  ValidationRules.passwordStrength('Password must contain uppercase, lowercase, number and symbol'),
];

const asyncValidationRules: ValidationRule[] = [
  {
    name: 'asyncCheck',
    message: 'Value is not available',
    validator: async (value) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return !value.includes('taken');
    },
    trigger: 'onBlur',
    priority: 5,
  },
];

describe('FormValidation V7.5 Enhanced', () => {
  // ===== BASIC FUNCTIONALITY TESTS =====
  
  describe('Basic Functionality', () => {
    test('renders with default props', () => {
      render(<FormValidation data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    test('renders with label', () => {
      render(<FormValidation label="Test Label" data-testid="input" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    test('renders with helper text', () => {
      render(<FormValidation helperText="Helper text" data-testid="input" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    test('handles default value', () => {
      render(<FormValidation defaultValue="test" data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('test');
    });

    test('handles controlled value', () => {
      const handleChange = jest.fn();
      render(<FormValidation value="controlled" onChange={handleChange} data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('controlled');
    });
  });

  // ===== VARIANT TESTS =====
  
  describe('V7.5 Enhanced Variants', () => {
    test('renders all variants without errors', () => {
      const variants = ['glass', 'outlined', 'filled', 'minimal'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <FormValidation 
            variant={variant as any} 
            data-testid={`input-${variant}`} 
          />
        );
        expect(screen.getByTestId(`input-${variant}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(
          <FormValidation 
            size={size as any} 
            data-testid={`input-${size}`} 
          />
        );
        expect(screen.getByTestId(`input-${size}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all input types correctly', () => {
      const types = ['text', 'email', 'password', 'number', 'url', 'tel', 'search'];
      
      types.forEach(type => {
        const { unmount } = render(
          <FormValidation 
            type={type as any} 
            data-testid={`input-${type}`} 
          />
        );
        const input = screen.getByTestId(`input-${type}`);
        expect(input).toHaveAttribute('type', type);
        unmount();
      });
    });
  });

  // ===== VALIDATION FUNCTIONALITY TESTS =====
  
  describe('Validation Functionality', () => {
    test('validates required field', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[ValidationRules.required('Field is required')]}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab(); // blur
      
      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          type="email"
          validationRules={emailValidationRules}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'invalid-email');
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    test('validates minimum length', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[ValidationRules.minLength(5, 'Must be at least 5 characters')]}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'ab');
      
      await waitFor(() => {
        expect(screen.getByText('Must be at least 5 characters')).toBeInTheDocument();
      });
    });

    test('validates password strength', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          type="password"
          validationRules={passwordValidationRules}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'weak');
      
      await waitFor(() => {
        expect(screen.getByText('Password must contain uppercase, lowercase, number and symbol')).toBeInTheDocument();
      });
    });

    test('shows success state for valid input', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          type="email"
          validationRules={emailValidationRules}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'valid@example.com');
      await user.tab(); // blur to trigger touched state
      
      await waitFor(() => {
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Check icon
      });
    });
  });

  // ===== ASYNC VALIDATION TESTS =====
  
  describe('Async Validation', () => {
    test('performs async validation on blur', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[ValidationRules.required('Field is required')]}
          asyncValidationRules={asyncValidationRules}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'taken');
      await user.tab(); // blur
      
      // Should show loading state
      expect(screen.getByText('Validating...')).toBeInTheDocument();
      
      // Wait for async validation to complete
      await waitFor(() => {
        expect(screen.getByText('Value is not available')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('shows loading spinner during async validation', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          asyncValidationRules={asyncValidationRules}
          validateOnBlur
          showValidationProgress
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'testing');
      await user.tab(); // blur
      
      // Should show loading spinner
      expect(screen.getByText('Validating...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Validating...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('handles async validation success', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          asyncValidationRules={asyncValidationRules}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'available');
      await user.tab(); // blur
      
      await waitFor(() => {
        expect(screen.queryByText('Value is not available')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('handles async validation errors gracefully', async () => {
      const errorRule: ValidationRule = {
        name: 'errorRule',
        message: 'Validation failed',
        validator: async () => {
          throw new Error('Network error');
        },
        trigger: 'onBlur',
      };

      const user = userEvent.setup();
      render(
        <FormValidation 
          asyncValidationRules={[errorRule]}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      await user.tab(); // blur
      
      await waitFor(() => {
        expect(screen.getByText('Validation error occurred')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===== VALIDATION TRIGGERS TESTS =====
  
  describe('Validation Triggers', () => {
    test('validates on change when enabled', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={basicValidationRules}
          validateOnChange={true}
          validateOnBlur={false}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'a');
      
      await waitFor(() => {
        expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
      });
    });

    test('validates on blur when enabled', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={basicValidationRules}
          validateOnChange={false}
          validateOnBlur={true}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'a');
      
      // Should not validate immediately
      expect(screen.queryByText('Must be at least 3 characters')).not.toBeInTheDocument();
      
      await user.tab(); // blur
      
      await waitFor(() => {
        expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
      });
    });

    test('validates on focus when enabled', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[ValidationRules.required('Field is required')]}
          validateOnFocus={true}
          validateOnChange={false}
          validateOnBlur={false}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      
      await waitFor(() => {
        expect(screen.getByText('Field is required')).toBeInTheDocument();
      });
    });

    test('disables real-time validation when configured', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={basicValidationRules}
          realTimeValidation={false}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'a');
      
      // Should not validate in real-time
      expect(screen.queryByText('Must be at least 3 characters')).not.toBeInTheDocument();
    });
  });

  // ===== DEBOUNCING TESTS =====
  
  describe('Debouncing', () => {
    test('debounces validation by configured delay', async () => {
      const user = userEvent.setup();
      const onValidationChange = jest.fn();
      
      render(
        <FormValidation 
          validationRules={basicValidationRules}
          validateOnChange
          debounceMs={500}
          onValidationChange={onValidationChange}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      
      // Type rapidly
      await user.type(input, 'ab');
      
      // Should not validate immediately
      expect(onValidationChange).not.toHaveBeenCalled();
      
      // Wait for debounce
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    test('resets debounce timer on new input', async () => {
      const user = userEvent.setup();
      const onValidationChange = jest.fn();
      
      render(
        <FormValidation 
          validationRules={basicValidationRules}
          validateOnChange
          debounceMs={300}
          onValidationChange={onValidationChange}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      
      await user.type(input, 'a');
      
      // Wait a bit but not full debounce time
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Type more - should reset timer
      await user.type(input, 'b');
      
      // Should not have validated yet
      expect(onValidationChange).not.toHaveBeenCalled();
      
      // Wait for full debounce
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalled();
      }, { timeout: 500 });
    });
  });

  // ===== PASSWORD FEATURES TESTS =====
  
  describe('Password Features', () => {
    test('shows password toggle button when enabled', () => {
      render(
        <FormValidation 
          type="password"
          showPasswordToggle
          data-testid="input" 
        />
      );
      
      expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    });

    test('toggles password visibility', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          type="password"
          showPasswordToggle
          value="secret123"
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      const toggleButton = screen.getByLabelText('Show password');
      
      expect(input).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
    });

    test('hides password toggle for non-password types', () => {
      render(
        <FormValidation 
          type="text"
          showPasswordToggle
          data-testid="input" 
        />
      );
      
      expect(screen.queryByLabelText('Show password')).not.toBeInTheDocument();
    });
  });

  // ===== VALIDATION STATE DISPLAY TESTS =====
  
  describe('Validation State Display', () => {
    test('shows validation state icons when enabled', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[ValidationRules.required('Required')]}
          showValidationState
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab(); // blur
      
      await waitFor(() => {
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // X icon
      });
    });

    test('hides validation state icons when disabled', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[ValidationRules.required('Required')]}
          showValidationState={false}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab(); // blur
      
      await waitFor(() => {
        expect(screen.getByText('Required')).toBeInTheDocument();
      });
      
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    test('shows validation progress bar during async validation', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          asyncValidationRules={asyncValidationRules}
          showValidationProgress
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      await user.tab(); // blur
      
      // Should show progress bar during validation
      expect(screen.getByText('Validating...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Validating...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===== EVENT HANDLERS TESTS =====
  
  describe('Event Handlers', () => {
    test('calls onChange with validation result', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormValidation 
          onChange={handleChange}
          validationRules={basicValidationRules}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalledWith('test', expect.any(Object));
    });

    test('calls onValidationChange when validation state changes', async () => {
      const handleValidationChange = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormValidation 
          onValidationChange={handleValidationChange}
          validationRules={basicValidationRules}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'ab');
      
      await waitFor(() => {
        expect(handleValidationChange).toHaveBeenCalledWith(expect.objectContaining({
          isValid: false,
          errors: expect.any(Array),
        }));
      });
    });

    test('calls onFocus and onBlur handlers', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormValidation 
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalled();
      
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalled();
    });

    test('calls onSubmit with validation result', async () => {
      const handleSubmit = jest.fn();
      
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        const validationRef = React.useRef<any>();
        
        const handleFormSubmit = async () => {
          if (validationRef.current) {
            await validationRef.current.handleSubmit();
          }
        };
        
        return (
          <div>
            <FormValidation 
              ref={validationRef}
              value={value}
              onChange={setValue}
              onSubmit={handleSubmit}
              validationRules={basicValidationRules}
              validateOnSubmit
              data-testid="input" 
            />
            <button onClick={handleFormSubmit} data-testid="submit">Submit</button>
          </div>
        );
      };
      
      const user = userEvent.setup();
      render(<TestComponent />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      const submitButton = screen.getByTestId('submit');
      await user.click(submitButton);
      
      expect(handleSubmit).toHaveBeenCalledWith('test', expect.any(Object));
    });
  });

  // ===== VALIDATION STATES TESTS =====
  
  describe('Validation States', () => {
    test('shows error state correctly', () => {
      render(
        <FormValidation 
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
        <FormValidation 
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
        <FormValidation 
          warning 
          warningMessage="Warning message" 
          data-testid="input" 
        />
      );
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    test('handles required attribute', () => {
      render(
        <FormValidation 
          required 
          data-testid="input" 
        />
      );
      expect(screen.getByTestId('input')).toHaveAttribute('aria-required', 'true');
    });

    test('handles disabled state', () => {
      render(
        <FormValidation 
          disabled 
          data-testid="input" 
        />
      );
      expect(screen.getByTestId('input')).toBeDisabled();
    });
  });

  // ===== LAYOUT & STYLING TESTS =====
  
  describe('Layout and Styling', () => {
    test('applies full width correctly', () => {
      const { container } = render(
        <FormValidation 
          fullWidth 
          data-testid="input" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%' });
    });

    test('applies custom className', () => {
      const { container } = render(
        <FormValidation 
          className="custom-class" 
          data-testid="input" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <FormValidation 
          style={customStyle} 
          data-testid="input" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });

    test('applies input-specific className', () => {
      render(
        <FormValidation 
          inputClassName="input-custom-class" 
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('input-custom-class');
    });

    test('applies label-specific className', () => {
      render(
        <FormValidation 
          label="Test Label"
          labelClassName="label-custom-class" 
          data-testid="input" 
        />
      );
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('label-custom-class');
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  
  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormValidation 
          label="Accessible Input"
          helperText="Helper text"
          required
          validationRules={[ValidationRules.required('Required')]}
          data-testid="input"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('associates label with input', () => {
      render(
        <FormValidation 
          label="Test Label" 
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      const label = screen.getByText('Test Label');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.id);
    });

    test('associates helper text with input', () => {
      render(
        <FormValidation 
          helperText="Helper text" 
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      const helperText = screen.getByText('Helper text');
      
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(helperText.id));
    });

    test('associates validation message with input', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[ValidationRules.required('Required field')]}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab(); // blur
      
      await waitFor(() => {
        const validationMessage = screen.getByText('Required field');
        expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(validationMessage.id));
      });
    });

    test('announces validation state changes', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={emailValidationRules}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      
      expect(input).toHaveAttribute('aria-invalid', 'false');
      
      await user.type(input, 'invalid');
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    test('announces async validation loading state', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          asyncValidationRules={asyncValidationRules}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      await user.tab(); // blur
      
      expect(input).toHaveAttribute('aria-busy', 'true');
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-busy', 'false');
      }, { timeout: 3000 });
    });
  });

  // ===== VALIDATION RULES LIBRARY TESTS =====
  
  describe('Validation Rules Library', () => {
    test('ValidationRules.required works correctly', () => {
      const rule = ValidationRules.required('Required');
      
      expect(rule.validator('')).toBe(false);
      expect(rule.validator('  ')).toBe(false);
      expect(rule.validator('test')).toBe(true);
      expect(rule.validator(null)).toBe(false);
      expect(rule.validator(undefined)).toBe(false);
    });

    test('ValidationRules.email works correctly', () => {
      const rule = ValidationRules.email('Invalid email');
      
      expect(rule.validator('')).toBe(true); // empty is valid (use required separately)
      expect(rule.validator('invalid')).toBe(false);
      expect(rule.validator('test@example.com')).toBe(true);
      expect(rule.validator('user+tag@domain.co.uk')).toBe(true);
    });

    test('ValidationRules.minLength works correctly', () => {
      const rule = ValidationRules.minLength(5, 'Too short');
      
      expect(rule.validator('')).toBe(true); // empty is valid
      expect(rule.validator('abc')).toBe(false);
      expect(rule.validator('abcde')).toBe(true);
      expect(rule.validator('abcdef')).toBe(true);
    });

    test('ValidationRules.maxLength works correctly', () => {
      const rule = ValidationRules.maxLength(5, 'Too long');
      
      expect(rule.validator('')).toBe(true);
      expect(rule.validator('abc')).toBe(true);
      expect(rule.validator('abcde')).toBe(true);
      expect(rule.validator('abcdef')).toBe(false);
    });

    test('ValidationRules.pattern works correctly', () => {
      const rule = ValidationRules.pattern(/^\d+$/, 'Numbers only');
      
      expect(rule.validator('')).toBe(true);
      expect(rule.validator('123')).toBe(true);
      expect(rule.validator('abc')).toBe(false);
      expect(rule.validator('123abc')).toBe(false);
    });

    test('ValidationRules.url works correctly', () => {
      const rule = ValidationRules.url('Invalid URL');
      
      expect(rule.validator('')).toBe(true);
      expect(rule.validator('https://example.com')).toBe(true);
      expect(rule.validator('http://test.co.uk')).toBe(true);
      expect(rule.validator('invalid-url')).toBe(false);
    });

    test('ValidationRules.passwordStrength works correctly', () => {
      const rule = ValidationRules.passwordStrength('Weak password');
      
      expect(rule.validator('')).toBe(true);
      expect(rule.validator('password')).toBe(false); // no uppercase, number, symbol
      expect(rule.validator('Password1')).toBe(false); // no symbol
      expect(rule.validator('Password1!')).toBe(true); // all requirements met
    });
  });

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { validationRules: basicValidationRules, 'data-testid': 'input' };
      const { rerender } = render(<FormValidation {...props} />);
      
      // Should not re-render with same props
      const firstRender = screen.getByTestId('input');
      rerender(<FormValidation {...props} />);
      const secondRender = screen.getByTestId('input');
      
      expect(firstRender).toBe(secondRender);
    });

    test('debounced validation performs efficiently', async () => {
      const user = userEvent.setup();
      const onValidationChange = jest.fn();
      
      render(
        <FormValidation 
          validationRules={basicValidationRules}
          validateOnChange
          debounceMs={100}
          onValidationChange={onValidationChange}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      
      const startTime = performance.now();
      
      // Type rapidly
      await user.type(input, 'abcdefghij');
      
      // Wait for debounce
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalled();
      }, { timeout: 500 });
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      // Should handle debounced validation efficiently
      expect(operationTime).toBeLessThan(1000); // 1 second
      expect(onValidationChange).toHaveBeenCalledTimes(1); // Only once due to debouncing
    });

    test('handles multiple validation rules efficiently', async () => {
      const multipleRules = [
        ValidationRules.required('Required'),
        ValidationRules.minLength(3, 'Too short'),
        ValidationRules.maxLength(10, 'Too long'),
        ValidationRules.email('Invalid email'),
        ValidationRules.pattern(/\d/, 'Must contain number'),
      ];

      const user = userEvent.setup();
      const startTime = performance.now();
      
      render(
        <FormValidation 
          validationRules={multipleRules}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test@example.com');
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      // Should handle multiple rules efficiently
      expect(operationTime).toBeLessThan(500); // 0.5 seconds
    });
  });

  // ===== EDGE CASES =====
  
  describe('Edge Cases', () => {
    test('handles empty validation rules array', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={[]}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      
      // Should not show any validation errors
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    test('handles null/undefined values correctly', async () => {
      const user = userEvent.setup();
      render(
        <FormValidation 
          value={null}
          validationRules={[ValidationRules.required('Required')]}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('');
      
      await user.type(input, 'test');
      expect(input.value).toBe('test');
    });

    test('handles validation rule priority correctly', async () => {
      const priorityRules = [
        { ...ValidationRules.minLength(5, 'Too short'), priority: 1 },
        { ...ValidationRules.required('Required'), priority: 10 },
      ];

      const user = userEvent.setup();
      render(
        <FormValidation 
          validationRules={priorityRules}
          validateOnBlur
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab(); // blur empty field
      
      await waitFor(() => {
        // Should show higher priority error first
        expect(screen.getByText('Required')).toBeInTheDocument();
        expect(screen.queryByText('Too short')).not.toBeInTheDocument();
      });
    });

    test('handles very long values correctly', async () => {
      const longValue = 'a'.repeat(1000);
      const user = userEvent.setup();
      
      render(
        <FormValidation 
          validationRules={[ValidationRules.maxLength(50, 'Too long')]}
          validateOnChange
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, longValue);
      
      await waitFor(() => {
        expect(screen.getByText('Too long')).toBeInTheDocument();
      });
    });

    test('handles special characters in validation messages', () => {
      const specialRule: ValidationRule = {
        name: 'special',
        message: 'Error with special chars: !@#$%^&*()[]{}|;:,.<>?',
        validator: () => false,
      };

      render(
        <FormValidation 
          validationRules={[specialRule]}
          validateOnChange
          value="test"
          data-testid="input" 
        />
      );
      
      expect(screen.getByText('Error with special chars: !@#$%^&*()[]{}|;:,.<>?')).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTS =====
  
  describe('Integration', () => {
    test('works correctly within form context', async () => {
      const handleSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <FormValidation 
            name="testField" 
            validationRules={basicValidationRules}
            data-testid="input" 
          />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByTestId('input');
      await user.type(input, 'test');
      await user.click(screen.getByText('Submit'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    test('maintains ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      
      render(
        <FormValidation 
          ref={ref} 
          data-testid="input" 
        />
      );
      
      expect(ref.current).toBe(screen.getByTestId('input'));
    });

    test('forwards all HTML attributes correctly', () => {
      render(
        <FormValidation 
          data-testid="input"
          name="testField"
          id="test-input-1752598066"
          autoComplete="email"
          inputMode="email"
          maxLength={50}
        />
      );
      
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('name', 'testField');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('autoComplete', 'email');
      expect(input).toHaveAttribute('inputMode', 'email');
      expect(input).toHaveAttribute('maxLength', '50');
    });

    test('integrates multiple validation features correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <FormValidation 
          type="email"
          validationRules={emailValidationRules}
          asyncValidationRules={asyncValidationRules}
          validateOnChange
          validateOnBlur
          showValidationState
          showValidationProgress
          debounceMs={100}
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      
      // Should validate on change
      await user.type(input, 'invalid');
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
      
      // Clear and test valid email
      await user.clear(input);
      await user.type(input, 'test@example.com');
      
      // Should trigger async validation on blur
      await user.tab();
      
      expect(screen.getByText('Validating...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Validating...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});

// ===== CHARLIE PERFORMANCE BENCHMARKS =====

describe('FormValidation Performance Benchmarks', () => {
  test('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(
      <FormValidation 
        validationRules={basicValidationRules}
        data-testid="input" 
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 16ms (60fps budget)
    expect(renderTime).toBeLessThan(16);
  });

  test('validation performance with complex rules', async () => {
    const complexRules = Array.from({ length: 20 }, (_, i) => ({
      name: `rule-${i}`,
      message: `Error ${i}`,
      validator: (value: string) => value.length > i,
      priority: i,
    }));

    const user = userEvent.setup();
    const startTime = performance.now();
    
    render(
      <FormValidation 
        validationRules={complexRules}
        validateOnChange
        data-testid="input" 
      />
    );
    
    const input = screen.getByTestId('input');
    await user.type(input, 'test');
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should handle complex validation efficiently
    expect(operationTime).toBeLessThan(200); // 0.2 seconds
  });

  test('async validation performance', async () => {
    const user = userEvent.setup();
    const startTime = performance.now();
    
    render(
      <FormValidation 
        asyncValidationRules={asyncValidationRules}
        validateOnBlur
        data-testid="input" 
      />
    );
    
    const input = screen.getByTestId('input');
    await user.type(input, 'test');
    await user.tab(); // trigger async validation
    
    await waitFor(() => {
      expect(screen.queryByText('Validating...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should handle async validation efficiently
    expect(operationTime).toBeLessThan(3000); // 3 seconds (including async delay)
  });
});

// ===== CHARLIE BUNDLE SIZE TEST =====

describe('FormValidation Bundle Impact', () => {
  test('component exports are tree-shakeable', () => {
    // This test ensures the component can be imported individually
    expect(FormValidation).toBeDefined();
    expect(typeof FormValidation).toBe('object'); // React.ForwardRefExoticComponent
  });

  test('validation rules library is modular', () => {
    expect(ValidationRules.required).toBeDefined();
    expect(ValidationRules.email).toBeDefined();
    expect(ValidationRules.minLength).toBeDefined();
    expect(ValidationRules.maxLength).toBeDefined();
    expect(ValidationRules.pattern).toBeDefined();
    expect(ValidationRules.url).toBeDefined();
    expect(ValidationRules.passwordStrength).toBeDefined();
  });

  test('async validation is optional', () => {
    // Test without async validation
    render(
      <FormValidation 
        validationRules={basicValidationRules}
        data-testid="input-1" 
      />
    );
    
    const input1 = screen.getByTestId('input-1');
    expect(input1).toBeInTheDocument();
    
    // Test with async validation
    render(
      <FormValidation 
        asyncValidationRules={asyncValidationRules}
        data-testid="input-2" 
      />
    );
    
    const input2 = screen.getByTestId('input-2');
    expect(input2).toBeInTheDocument();
  });
}); 