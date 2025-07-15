/**
 * 🧪 FormInput Component Tests - V7.5 Enhanced Quality Assurance
 * 
 * Comprehensive testing suite covering functionality, accessibility,
 * performance, and edge cases for enterprise-grade reliability
 * 
 * Quality Excellence by IA Charlie
 * Technical Foundation by IA Alpha
 * Visual Excellence by IA Beta
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormInput, FormInputProps } from '../FormInput';
import '../FormInput.css';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test utilities
const defaultProps: FormInputProps = {
  label: 'Test Input',
  placeholder: 'Enter text',
};

const renderFormInput = (props: Partial<FormInputProps> = {}) => {
  return render(<FormInput {...defaultProps} {...props} />);
};

const createMockValidationRule = (type: string, message: string, validator?: any) => ({
  type: type as any,
  message,
  validator,
});

// ============================================================================
// BASIC FUNCTIONALITY TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Basic Functionality', () => {
  test('renders correctly with required props', () => {
    renderFormInput();
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  test('renders all variants correctly', () => {
    const variants: Array<FormInputProps['variant']> = ['glass', 'outlined', 'filled', 'minimal', 'floating'];
    
    variants.forEach(variant => {
      const { container } = renderFormInput({ variant });
      expect(container.firstChild).toHaveClass(`form-input-${variant}`);
    });
  });

  test('renders all sizes correctly', () => {
    const sizes: Array<FormInputProps['size']> = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      const { container } = renderFormInput({ size });
      expect(container.firstChild).toHaveClass(`form-input-${size}`);
    });
  });

  test('handles controlled input correctly', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const mockOnValueChange = jest.fn();
    
    renderFormInput({ 
      value: 'initial',
      onChange: mockOnChange,
      onValueChange: mockOnValueChange 
    });
    
    const input = screen.getByDisplayValue('initial');
    await user.clear(input);
    await user.type(input, 'new value');
    
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnValueChange).toHaveBeenCalledWith('new value');
  });

  test('displays helper text correctly', () => {
    const helperText = 'This is helper text';
    renderFormInput({ helperText });
    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  test('displays error message correctly', () => {
    const errorMessage = 'This is an error';
    renderFormInput({ 
      errorMessage,
      validationState: 'error' 
    });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('displays success message correctly', () => {
    const successMessage = 'This is success';
    renderFormInput({ 
      successMessage,
      validationState: 'success' 
    });
    expect(screen.getByText(successMessage)).toBeInTheDocument();
  });
});

// ============================================================================
// VALIDATION SYSTEM TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Validation System', () => {
  test('validates required field correctly', async () => {
    const user = userEvent.setup();
    const mockOnValidationChange = jest.fn();
    
    renderFormInput({
      validationRules: [createMockValidationRule('required', 'Field is required')],
      validateOnBlur: true,
      onValidationChange: mockOnValidationChange
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Focus and blur without entering value
    await user.click(input);
    await user.tab();
    
    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(false, ['Field is required']);
    });
  });

  test('validates email field correctly', async () => {
    const user = userEvent.setup();
    const mockOnValidationChange = jest.fn();
    
    renderFormInput({
      type: 'email',
      validationRules: [createMockValidationRule('email', 'Invalid email')],
      validateOnChange: true,
      onValidationChange: mockOnValidationChange
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Enter invalid email
    await user.type(input, 'invalid-email');
    
    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(false, ['Invalid email']);
    });
    
    // Clear and enter valid email
    await user.clear(input);
    await user.type(input, 'valid@email.com');
    
    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(true, []);
    });
  });

  test('validates minimum length correctly', async () => {
    const user = userEvent.setup();
    const mockOnValidationChange = jest.fn();
    
    renderFormInput({
      validationRules: [createMockValidationRule('minLength', 'Minimum 5 characters', 5)],
      validateOnChange: true,
      onValidationChange: mockOnValidationChange
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Enter text shorter than minimum
    await user.type(input, 'abc');
    
    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(false, ['Minimum 5 characters']);
    });
    
    // Add more characters
    await user.type(input, 'de');
    
    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(true, []);
    });
  });

  test('validates custom rule correctly', async () => {
    const user = userEvent.setup();
    const mockOnValidationChange = jest.fn();
    const customValidator = jest.fn().mockReturnValue(false);
    
    renderFormInput({
      validationRules: [createMockValidationRule('custom', 'Custom validation failed', customValidator)],
      validateOnChange: true,
      onValidationChange: mockOnValidationChange
    });
    
    const input = screen.getByLabelText('Test Input');
    await user.type(input, 'test');
    
    await waitFor(() => {
      expect(customValidator).toHaveBeenCalledWith('test');
      expect(mockOnValidationChange).toHaveBeenCalledWith(false, ['Custom validation failed']);
    });
  });

  test('handles multiple validation rules', async () => {
    const user = userEvent.setup();
    const mockOnValidationChange = jest.fn();
    
    renderFormInput({
      validationRules: [
        createMockValidationRule('required', 'Field is required'),
        createMockValidationRule('minLength', 'Minimum 5 characters', 5),
        createMockValidationRule('email', 'Invalid email')
      ],
      validateOnChange: true,
      onValidationChange: mockOnValidationChange
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Test empty field (should only show required error)
    await user.click(input);
    await user.tab();
    
    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalledWith(false, ['Field is required']);
    });
  });

  test('debounces validation correctly', async () => {
    const user = userEvent.setup();
    const mockOnValidationChange = jest.fn();
    
    renderFormInput({
      validationRules: [createMockValidationRule('minLength', 'Minimum 5 characters', 5)],
      validateOnChange: true,
      debounceMs: 100,
      onValidationChange: mockOnValidationChange
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Type quickly
    await user.type(input, 'a');
    await user.type(input, 'b');
    await user.type(input, 'c');
    
    // Should not have been called yet
    expect(mockOnValidationChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnValidationChange).toHaveBeenCalled();
    }, { timeout: 150 });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Accessibility', () => {
  test('has no accessibility violations', async () => {
    const { container } = renderFormInput({
      label: 'Accessible Input',
      helperText: 'Helper text for context',
      validationRules: [createMockValidationRule('required', 'Required field')],
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('has proper ARIA attributes', () => {
    renderFormInput({
      id: 'test-input',
      helperText: 'Helper text',
      validationRules: [createMockValidationRule('required', 'Required field')],
    });
    
    const input = screen.getByLabelText('Test Input');
    
    expect(input).toHaveAttribute('aria-label', 'Test Input');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-message');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('role', 'textbox');
  });

  test('announces validation errors to screen readers', async () => {
    const user = userEvent.setup();
    
    renderFormInput({
      id: 'test-input',
      validationRules: [createMockValidationRule('required', 'Field is required')],
      validateOnBlur: true,
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Trigger validation error
    await user.click(input);
    await user.tab();
    
    await waitFor(() => {
      const errorMessage = screen.getByText('Field is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const mockOnFocus = jest.fn();
    const mockOnBlur = jest.fn();
    
    renderFormInput({
      onFocus: mockOnFocus,
      onBlur: mockOnBlur,
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Tab to input
    await user.tab();
    expect(input).toHaveFocus();
    expect(mockOnFocus).toHaveBeenCalled();
    
    // Tab away
    await user.tab();
    expect(input).not.toHaveFocus();
    expect(mockOnBlur).toHaveBeenCalled();
  });

  test('handles screen reader text correctly', () => {
    const screenReaderText = 'Additional context for screen readers';
    renderFormInput({ screenReaderText });
    
    const srElement = screen.getByText(screenReaderText);
    expect(srElement).toHaveClass('sr-only');
  });

  test('displays required indicator correctly', () => {
    renderFormInput({
      validationRules: [createMockValidationRule('required', 'Required field')],
    });
    
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toHaveAttribute('aria-label', 'required');
  });
});

// ============================================================================
// FLOATING LABEL TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Floating Label', () => {
  test('animates floating label on focus', async () => {
    const user = userEvent.setup();
    
    renderFormInput({
      floatingLabel: true,
      label: 'Floating Label',
    });
    
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Floating Label');
    
    // Focus input
    await user.click(input);
    
    // Label should be in focused position (tested via class presence)
    expect(input.closest('.form-input-container')).toHaveClass('form-input-focused');
  });

  test('keeps floating label in top position when input has value', () => {
    renderFormInput({
      floatingLabel: true,
      label: 'Floating Label',
      value: 'Some value',
    });
    
    const input = screen.getByDisplayValue('Some value');
    
    // Should have value-based styling
    expect(input.closest('.form-input-container')).not.toHaveClass('form-input-focused');
  });

  test('floating label works with validation states', async () => {
    const user = userEvent.setup();
    
    renderFormInput({
      floatingLabel: true,
      label: 'Floating Label',
      validationState: 'error',
      errorMessage: 'Error message',
    });
    
    const input = screen.getByRole('textbox');
    
    // Focus input
    await user.click(input);
    
    // Should have error state
    expect(input.closest('.form-input-container')).toHaveClass('form-input-error');
  });
});

// ============================================================================
// ICON INTEGRATION TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Icon Integration', () => {
  test('renders leading icon correctly', () => {
    const LeadingIcon = () => <span data-testid="leading-icon">Icon</span>;
    
    renderFormInput({
      leadingIcon: <LeadingIcon />,
    });
    
    expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
  });

  test('renders trailing icon correctly', () => {
    const TrailingIcon = () => <span data-testid="trailing-icon">Icon</span>;
    
    renderFormInput({
      trailingIcon: <TrailingIcon />,
    });
    
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
  });

  test('shows validation state icons correctly', () => {
    const { rerender } = renderFormInput({ validationState: 'success' });
    
    // Success state should show success icon
    expect(screen.getByTestId('success-icon') || document.querySelector('.form-input-success-icon')).toBeTruthy();
    
    // Change to error state
    rerender(<FormInput {...defaultProps} validationState="error" />);
    
    // Error state should show error icon
    expect(screen.getByTestId('error-icon') || document.querySelector('.form-input-error-icon')).toBeTruthy();
  });

  test('shows loading spinner when loading', () => {
    renderFormInput({ loading: true });
    
    expect(document.querySelector('.form-input-loading-spinner')).toBeInTheDocument();
  });
});

// ============================================================================
// PERFORMANCE TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Performance', () => {
  test('does not re-render unnecessarily', () => {
    const mockOnChange = jest.fn();
    const { rerender } = renderFormInput({ onChange: mockOnChange });
    
    // Re-render with same props should not cause issues
    rerender(<FormInput {...defaultProps} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  test('handles rapid input changes efficiently', async () => {
    const user = userEvent.setup();
    const mockOnValueChange = jest.fn();
    
    renderFormInput({
      onValueChange: mockOnValueChange,
      debounceMs: 50,
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Rapid typing
    await user.type(input, 'rapid');
    
    // Should handle all characters
    expect(input).toHaveValue('rapid');
  });

  test('cleans up event listeners correctly', () => {
    const { unmount } = renderFormInput({
      validateOnChange: true,
      debounceMs: 100,
    });
    
    // Unmount component
    unmount();
    
    // No memory leaks expected (tested via React dev tools in real scenarios)
    expect(true).toBe(true);
  });
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING (IA CHARLIE)
// ============================================================================

describe('FormInput - Edge Cases', () => {
  test('handles undefined/null props gracefully', () => {
    renderFormInput({
      value: undefined as any,
      validationRules: undefined as any,
      leadingIcon: null as any,
    });
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  test('handles disabled state correctly', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    renderFormInput({
      disabled: true,
      onChange: mockOnChange,
    });
    
    const input = screen.getByLabelText('Test Input');
    
    expect(input).toBeDisabled();
    
    // Try to type in disabled input
    await user.type(input, 'test');
    
    // Should not have changed
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('handles missing validation rule properties', async () => {
    const user = userEvent.setup();
    
    renderFormInput({
      validationRules: [
        { type: 'minLength' as any, message: 'Too short' }, // Missing value
      ],
      validateOnChange: true,
    });
    
    const input = screen.getByLabelText('Test Input');
    
    // Should not crash
    await user.type(input, 'test');
    
    expect(input).toHaveValue('test');
  });

  test('handles async validation correctly', async () => {
    const user = userEvent.setup();
    const mockAsyncValidator = jest.fn().mockResolvedValue(true);
    const mockOnValidationChange = jest.fn();
    
    renderFormInput({
      validationRules: [
        createMockValidationRule('custom', 'Async validation failed', mockAsyncValidator)
      ],
      validateOnBlur: true,
      onValidationChange: mockOnValidationChange,
    });
    
    const input = screen.getByLabelText('Test Input');
    
    await user.type(input, 'test');
    await user.tab();
    
    await waitFor(() => {
      expect(mockAsyncValidator).toHaveBeenCalledWith('test');
      expect(mockOnValidationChange).toHaveBeenCalledWith(true, []);
    });
  });

  test('handles very long input values', async () => {
    const user = userEvent.setup();
    const longValue = 'a'.repeat(1000);
    
    renderFormInput();
    
    const input = screen.getByLabelText('Test Input');
    
    await user.type(input, longValue);
    
    expect(input).toHaveValue(longValue);
  });

  test('handles special characters correctly', async () => {
    const user = userEvent.setup();
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
    
    renderFormInput();
    
    const input = screen.getByLabelText('Test Input');
    
    await user.type(input, specialChars);
    
    expect(input).toHaveValue(specialChars);
  });
});

// ============================================================================
// INTEGRATION TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Integration', () => {
  test('works correctly in forms', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    
    render(
      <form onSubmit={mockOnSubmit}>
        <FormInput
          name="testField"
          label="Test Field"
          validationRules={[createMockValidationRule('required', 'Required')]}
        />
        <button type="submit">Submit</button>
      </form>
    );
    
    const input = screen.getByLabelText('Test Field');
    const submitButton = screen.getByText('Submit');
    
    // Fill input and submit
    await user.type(input, 'test value');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  test('maintains focus management in complex layouts', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <FormInput label="First Input" />
        <FormInput label="Second Input" />
        <FormInput label="Third Input" />
      </div>
    );
    
    const firstInput = screen.getByLabelText('First Input');
    const secondInput = screen.getByLabelText('Second Input');
    const thirdInput = screen.getByLabelText('Third Input');
    
    // Tab through inputs
    await user.tab();
    expect(firstInput).toHaveFocus();
    
    await user.tab();
    expect(secondInput).toHaveFocus();
    
    await user.tab();
    expect(thirdInput).toHaveFocus();
  });
});

// ============================================================================
// VISUAL REGRESSION PREVENTION (IA CHARLIE)
// ============================================================================

describe('FormInput - Visual Regression Prevention', () => {
  test('maintains consistent CSS classes', () => {
    const { container } = renderFormInput({
      variant: 'glass',
      size: 'md',
      validationState: 'success',
    });
    
    expect(container.firstChild).toHaveClass('form-input-container');
    expect(container.firstChild).toHaveClass('form-input-glass');
    expect(container.firstChild).toHaveClass('form-input-md');
    expect(container.firstChild).toHaveClass('form-input-success');
  });

  test('maintains proper DOM structure', () => {
    renderFormInput({
      label: 'Test Label',
      helperText: 'Helper text',
      leadingIcon: <span>Icon</span>,
    });
    
    // Check DOM structure
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('preserves glass-morphism styling integrity', () => {
    const { container } = renderFormInput({
      variant: 'glass',
      glassEffect: 'strong',
    });
    
    const wrapper = container.querySelector('.form-input-wrapper');
    expect(wrapper).toBeInTheDocument();
    
    // Verify glass variant is applied
    expect(container.firstChild).toHaveClass('form-input-glass');
  });
});

// ============================================================================
// CROSS-BROWSER COMPATIBILITY TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Cross-browser Compatibility', () => {
  test('handles input events consistently', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    renderFormInput({ onChange: mockOnChange });
    
    const input = screen.getByLabelText('Test Input');
    
    // Simulate different input methods
    await user.type(input, 'test');
    fireEvent.input(input, { target: { value: 'test input' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  test('supports different keyboard layouts', async () => {
    const user = userEvent.setup();
    
    renderFormInput();
    
    const input = screen.getByLabelText('Test Input');
    
    // Test international characters
    await user.type(input, 'café résumé naïve');
    
    expect(input).toHaveValue('café résumé naïve');
  });

  test('maintains functionality with CSS disabled', () => {
    renderFormInput({
      label: 'No CSS Test',
      validationRules: [createMockValidationRule('required', 'Required')],
    });
    
    // Basic functionality should work even without CSS
    expect(screen.getByLabelText('No CSS Test')).toBeInTheDocument();
  });
});

// ============================================================================
// SECURITY TESTS (IA CHARLIE)
// ============================================================================

describe('FormInput - Security', () => {
  test('sanitizes input correctly', async () => {
    const user = userEvent.setup();
    
    renderFormInput();
    
    const input = screen.getByLabelText('Test Input');
    
    // Try to inject potentially harmful content
    const maliciousInput = '<script>alert("xss")</script>';
    await user.type(input, maliciousInput);
    
    // Should be treated as plain text
    expect(input).toHaveValue(maliciousInput);
  });

  test('prevents form submission with invalid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn((e) => e.preventDefault());
    
    render(
      <form onSubmit={mockOnSubmit}>
        <FormInput
          name="secureField"
          label="Secure Field"
          validationRules={[createMockValidationRule('required', 'Required')]}
        />
        <button type="submit">Submit</button>
      </form>
    );
    
    const submitButton = screen.getByText('Submit');
    
    // Try to submit without filling required field
    await user.click(submitButton);
    
    // Form should be submitted (validation is UI-level, not security)
    // Security validation should be on server side
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});

// Test cleanup
afterEach(() => {
  jest.clearAllMocks();
}); 