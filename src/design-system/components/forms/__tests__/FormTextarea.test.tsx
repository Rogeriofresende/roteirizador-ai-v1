import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormTextarea, FormTextareaRef } from '../FormTextarea';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ==========================================
// 🟡 IA CHARLIE - QUALITY EXCELLENCE TESTS
// ==========================================

describe('FormTextarea V7.5 Enhanced', () => {
  const user = userEvent.setup();
  
  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================
  
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<FormTextarea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    
    test('renders with label', () => {
      render(<FormTextarea label="Test Label" />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });
    
    test('renders with placeholder', () => {
      render(<FormTextarea placeholder="Enter text here" />);
      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });
    
    test('renders with helper text', () => {
      render(<FormTextarea helperText="This is helper text" />);
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });
    
    test('renders with error text', () => {
      render(<FormTextarea errorText="This is an error" />);
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // VARIANT TESTS
  // ==========================================
  
  describe('Variants', () => {
    test('renders glass variant with correct classes', () => {
      const { container } = render(<FormTextarea variant="glass" />);
      expect(container.querySelector('.form-textarea-container--glass')).toBeInTheDocument();
    });
    
    test('renders outlined variant with correct classes', () => {
      const { container } = render(<FormTextarea variant="outlined" />);
      expect(container.querySelector('.form-textarea-container--outlined')).toBeInTheDocument();
    });
    
    test('renders filled variant with correct classes', () => {
      const { container } = render(<FormTextarea variant="filled" />);
      expect(container.querySelector('.form-textarea-container--filled')).toBeInTheDocument();
    });
    
    test('renders minimal variant with correct classes', () => {
      const { container } = render(<FormTextarea variant="minimal" />);
      expect(container.querySelector('.form-textarea-container--minimal')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SIZE TESTS
  // ==========================================
  
  describe('Sizes', () => {
    test('renders small size with correct classes', () => {
      const { container } = render(<FormTextarea size="sm" />);
      expect(container.querySelector('.form-textarea-container--sm')).toBeInTheDocument();
    });
    
    test('renders medium size with correct classes', () => {
      const { container } = render(<FormTextarea size="md" />);
      expect(container.querySelector('.form-textarea-container--md')).toBeInTheDocument();
    });
    
    test('renders large size with correct classes', () => {
      const { container } = render(<FormTextarea size="lg" />);
      expect(container.querySelector('.form-textarea-container--lg')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // AUTO-RESIZE TESTS
  // ==========================================
  
  describe('Auto-resize Functionality', () => {
    test('auto-resize is enabled by default', () => {
      const { container } = render(<FormTextarea />);
      const textarea = container.querySelector('.form-textarea--auto-resize');
      expect(textarea).toBeInTheDocument();
    });
    
    test('auto-resize can be disabled', () => {
      const { container } = render(<FormTextarea autoResize={{ enabled: false }} />);
      const textarea = container.querySelector('.form-textarea--auto-resize');
      expect(textarea).not.toBeInTheDocument();
    });
    
    test('textarea height changes with content', async () => {
      const { container } = render(
        <FormTextarea autoResize={{ enabled: true, minRows: 3, maxRows: 6 }} />
      );
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const initialHeight = textarea.style.height;
      
      await user.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
      
      // Wait for resize animation
      await waitFor(() => {
        expect(textarea.style.height).not.toBe(initialHeight);
      });
    });
    
    test('respects minimum rows configuration', () => {
      const minRows = 5;
      render(<FormTextarea autoResize={{ enabled: true, minRows }} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Calculate expected minimum height (approximate)
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight);
      const expectedMinHeight = minRows * lineHeight;
      
      expect(parseInt(textarea.style.height || '0')).toBeGreaterThanOrEqual(expectedMinHeight - 50); // Allow some variance
    });
    
    test('respects maximum rows configuration', async () => {
      const maxRows = 4;
      render(<FormTextarea autoResize={{ enabled: true, maxRows }} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Add many lines to exceed max rows
      const manyLines = Array(10).fill('Long line of text').join('\n');
      await user.type(textarea, manyLines);
      
      await waitFor(() => {
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseInt(computedStyle.lineHeight);
        const maxHeight = maxRows * lineHeight;
        
        expect(parseInt(textarea.style.height || '0')).toBeLessThanOrEqual(maxHeight + 100); // Allow some variance
      });
    });
  });
  
  // ==========================================
  // CHARACTER COUNT TESTS
  // ==========================================
  
  describe('Character Count', () => {
    test('displays character count when enabled', () => {
      render(<FormTextarea characterCount={{ enabled: true }} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
    
    test('updates character count on input', async () => {
      render(<FormTextarea characterCount={{ enabled: true, format: 'simple' }} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });
    
    test('displays detailed metrics format', async () => {
      render(<FormTextarea characterCount={{ enabled: true, format: 'detailed' }} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world test');
      
      expect(screen.getByText('16 chars')).toBeInTheDocument();
      expect(screen.getByText('3 words')).toBeInTheDocument();
    });
    
    test('shows character limit with max length', async () => {
      render(<FormTextarea characterCount={{ enabled: true, maxLength: 10, format: 'simple' }} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });
    
    test('shows warning when approaching limit', async () => {
      render(
        <FormTextarea
          characterCount={{
            enabled: true,
            maxLength: 10,
            format: 'detailed',
            warningThreshold: 80
          }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello wor'); // 9 chars = 90% of 10
      
      await waitFor(() => {
        const remainingElement = screen.getByText('1 remaining');
        expect(remainingElement).toHaveClass('form-textarea-limit--warning');
      });
    });
    
    test('shows error when over limit', async () => {
      render(
        <FormTextarea
          characterCount={{
            enabled: true,
            maxLength: 5,
            format: 'detailed'
          }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world'); // Over 5 chars
      
      await waitFor(() => {
        const remainingElement = screen.getByText(/-\d+ remaining/);
        expect(remainingElement).toHaveClass('form-textarea-limit--over');
      });
    });
    
    test('displays progress bar when enabled', () => {
      const { container } = render(
        <FormTextarea
          characterCount={{
            enabled: true,
            maxLength: 100,
            showProgress: true
          }}
        />
      );
      
      expect(container.querySelector('.form-textarea-progress-container')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // VALIDATION TESTS
  // ==========================================
  
  describe('Validation', () => {
    test('validates required field', async () => {
      const validationRules = [
        { type: 'required' as const, message: 'Field is required' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      
      // Focus and blur without typing
      await user.click(textarea);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('Field is required')).toBeInTheDocument();
      });
    });
    
    test('validates minimum length', async () => {
      const validationRules = [
        { type: 'minLength' as const, value: 10, message: 'Minimum 10 characters' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello'); // Only 5 chars
      
      await waitFor(() => {
        expect(screen.getByText('Minimum 10 characters')).toBeInTheDocument();
      });
    });
    
    test('validates maximum length', async () => {
      const validationRules = [
        { type: 'maxLength' as const, value: 5, message: 'Maximum 5 characters' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world'); // More than 5 chars
      
      await waitFor(() => {
        expect(screen.getByText('Maximum 5 characters')).toBeInTheDocument();
      });
    });
    
    test('validates word count', async () => {
      const validationRules = [
        { type: 'wordCount' as const, value: 3, message: 'Minimum 3 words' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world'); // Only 2 words
      
      await waitFor(() => {
        expect(screen.getByText('Minimum 3 words')).toBeInTheDocument();
      });
    });
    
    test('validates pattern matching', async () => {
      const validationRules = [
        { type: 'pattern' as const, value: /[A-Z]/, message: 'Must contain uppercase letter' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'hello world'); // No uppercase
      
      await waitFor(() => {
        expect(screen.getByText('Must contain uppercase letter')).toBeInTheDocument();
      });
    });
    
    test('validates custom validation function', async () => {
      const validationRules = [
        {
          type: 'custom' as const,
          message: 'Must not contain numbers',
          validator: (value: string) => !/\d/.test(value)
        }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello123'); // Contains numbers
      
      await waitFor(() => {
        expect(screen.getByText('Must not contain numbers')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // EVENT HANDLING TESTS
  // ==========================================
  
  describe('Event Handling', () => {
    test('calls onChange handler', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormTextarea
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      
      expect(mockOnChange).toHaveBeenCalledWith('Hello', expect.any(Object));
    });
    
    test('calls onFocus handler', async () => {
      const mockOnFocus = jest.fn();
      render(
        <FormTextarea
          eventHandlers={{ onFocus: mockOnFocus }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      expect(mockOnFocus).toHaveBeenCalled();
    });
    
    test('calls onBlur handler', async () => {
      const mockOnBlur = jest.fn();
      render(
        <FormTextarea
          eventHandlers={{ onBlur: mockOnBlur }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab();
      
      expect(mockOnBlur).toHaveBeenCalled();
    });
    
    test('provides metrics in onChange handler', async () => {
      const mockOnChange = jest.fn();
      render(
        <FormTextarea
          eventHandlers={{ onChange: mockOnChange }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world test');
      
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      const metrics = lastCall[1];
      
      expect(metrics).toMatchObject({
        characters: expect.any(Number),
        words: expect.any(Number),
        sentences: expect.any(Number),
        paragraphs: expect.any(Number),
        readingTime: expect.any(Number)
      });
    });
  });
  
  // ==========================================
  // STATE MANAGEMENT TESTS
  // ==========================================
  
  describe('State Management', () => {
    test('shows focused state when focused', async () => {
      const { container } = render(<FormTextarea />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      
      expect(container.querySelector('.form-textarea-container--focused')).toBeInTheDocument();
    });
    
    test('shows validation states', () => {
      const { rerender, container } = render(<FormTextarea validationState="success" />);
      expect(container.querySelector('.form-textarea-container--success')).toBeInTheDocument();
      
      rerender(<FormTextarea validationState="warning" />);
      expect(container.querySelector('.form-textarea-container--warning')).toBeInTheDocument();
      
      rerender(<FormTextarea validationState="error" />);
      expect(container.querySelector('.form-textarea-container--error')).toBeInTheDocument();
    });
    
    test('handles disabled state', () => {
      const { container } = render(<FormTextarea disabled />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(container.querySelector('.form-textarea-container--disabled')).toBeInTheDocument();
    });
    
    test('handles readonly state', () => {
      render(<FormTextarea readOnly />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });
  });
  
  // ==========================================
  // REF INTERFACE TESTS
  // ==========================================
  
  describe('Ref Interface', () => {
    test('provides imperative handle methods', () => {
      const ref = React.createRef<FormTextareaRef>();
      render(<FormTextarea ref={ref} />);
      
      expect(ref.current).toMatchObject({
        focus: expect.any(Function),
        blur: expect.any(Function),
        select: expect.any(Function),
        getMetrics: expect.any(Function),
        getValidationState: expect.any(Function),
        setValue: expect.any(Function),
        insertText: expect.any(Function),
        selectRange: expect.any(Function),
        resize: expect.any(Function)
      });
    });
    
    test('focus method works', () => {
      const ref = React.createRef<FormTextareaRef>();
      render(<FormTextarea ref={ref} />);
      
      const textarea = screen.getByRole('textbox');
      ref.current?.focus();
      
      expect(textarea).toHaveFocus();
    });
    
    test('setValue method works', async () => {
      const ref = React.createRef<FormTextareaRef>();
      render(<FormTextarea ref={ref} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      act(() => {
        ref.current?.setValue('Test value');
      });
      
      expect(textarea.value).toBe('Test value');
    });
    
    test('getMetrics method returns correct data', async () => {
      const ref = React.createRef<FormTextareaRef>();
      render(<FormTextarea ref={ref} defaultValue="Hello world test" />);
      
      const metrics = ref.current?.getMetrics();
      
      expect(metrics).toMatchObject({
        characters: 16,
        words: 3,
        sentences: 1,
        paragraphs: 1,
        readingTime: 1
      });
    });
    
    test('insertText method works', async () => {
      const ref = React.createRef<FormTextareaRef>();
      render(<FormTextarea ref={ref} defaultValue="Hello world" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(5, 5); // Position after "Hello"
      
      act(() => {
        ref.current?.insertText(' beautiful');
      });
      
      expect(textarea.value).toBe('Hello beautiful world');
    });
  });
  
  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormTextarea
          label="Accessible textarea"
          helperText="Helper text"
          ariaLabel="Custom aria label"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('associates label with textarea', () => {
      render(<FormTextarea label="Test Label" id="test-textarea-1752598062" />);
      
      const textarea = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(label).toHaveAttribute('for', 'test-textarea');
    });
    
    test('supports aria-label', () => {
      render(<FormTextarea ariaLabel="Custom aria label" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Custom aria label');
    });
    
    test('supports aria-describedby', () => {
      render(<FormTextarea ariaDescribedBy="helper-text" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'helper-text');
    });
    
    test('sets aria-invalid for error state', () => {
      render(<FormTextarea validationState="error" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
    
    test('sets aria-required for required fields', () => {
      const validationRules = [
        { type: 'required' as const, message: 'Required' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });
    
    test('provides screen reader text', () => {
      render(<FormTextarea screenReaderText="Additional context for screen readers" />);
      
      expect(screen.getByText('Additional context for screen readers')).toHaveClass('sr-only');
    });
    
    test('error messages have alert role', async () => {
      const validationRules = [
        { type: 'required' as const, message: 'Field is required' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab();
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Field is required');
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
  
  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================
  
  describe('Performance', () => {
    test('debounces validation calls', async () => {
      const mockValidator = jest.fn().mockReturnValue(true);
      const validationRules = [
        { type: 'custom' as const, message: 'Custom validation', validator: mockValidator }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      
      // Type multiple characters quickly
      await user.type(textarea, 'Hello', { delay: 50 });
      
      // Validation should be debounced, not called for each keystroke
      await waitFor(() => {
        expect(mockValidator.mock.calls.length).toBeLessThan(5);
      });
    });
    
    test('handles large text input efficiently', async () => {
      const largeText = 'Lorem ipsum '.repeat(1000); // ~11,000 characters
      
      const startTime = performance.now();
      
      render(<FormTextarea characterCount={{ enabled: true, format: 'detailed' }} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      await act(async () => {
        textarea.value = largeText;
        fireEvent.change(textarea, { target: { value: largeText } });
      });
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should handle large text in reasonable time (< 100ms)
      expect(processingTime).toBeLessThan(100);
      
      // Character count should be accurate
      expect(screen.getByText(`${largeText.length} chars`)).toBeInTheDocument();
    });
    
    test('auto-resize performance with rapid content changes', async () => {
      render(
        <FormTextarea
          autoResize={{
            enabled: true,
            minRows: 3,
            maxRows: 10,
            debounceDelay: 50
          }}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      const startTime = performance.now();
      
      // Rapidly add and remove content
      for (let i = 0; i < 10; i++) {
        await user.type(textarea, '\nNew line ' + i);
        await user.keyboard('{Backspace>10}');
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should handle rapid changes efficiently
      expect(processingTime).toBeLessThan(500);
    });
  });
  
  // ==========================================
  // EDGE CASES AND ERROR HANDLING
  // ==========================================
  
  describe('Edge Cases', () => {
    test('handles empty validation rules array', () => {
      render(<FormTextarea validationRules={[]} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    
    test('handles invalid character count configuration', () => {
      render(
        <FormTextarea
          characterCount={{
            enabled: true,
            maxLength: -1, // Invalid
            warningThreshold: 150 // > 100%
          }}
        />
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    
    test('handles auto-resize with invalid configuration', () => {
      render(
        <FormTextarea
          autoResize={{
            enabled: true,
            minRows: -1, // Invalid
            maxRows: 0 // Invalid
          }}
        />
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    
    test('handles special characters in validation', async () => {
      const validationRules = [
        { type: 'pattern' as const, value: /[!@#$%^&*()]/, message: 'Must contain special character' }
      ];
      
      render(<FormTextarea validationRules={validationRules} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello@World!');
      
      // Should not show error with special characters
      await waitFor(() => {
        expect(screen.queryByText('Must contain special character')).not.toBeInTheDocument();
      });
    });
    
    test('handles emoji and unicode characters', async () => {
      render(<FormTextarea characterCount={{ enabled: true, format: 'simple' }} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '🚀🎉👍 Hello 世界');
      
      // Should count unicode characters correctly
      expect(screen.getByText('12')).toBeInTheDocument();
    });
    
    test('maintains performance with very long text', async () => {
      const veryLongText = 'A'.repeat(50000); // 50,000 characters
      
      render(
        <FormTextarea
          characterCount={{ enabled: true, format: 'detailed' }}
          autoResize={{ enabled: true }}
        />
      );
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      await act(async () => {
        textarea.value = veryLongText;
        fireEvent.change(textarea, { target: { value: veryLongText } });
      });
      
      // Should handle very long text without crashing
      expect(textarea.value).toBe(veryLongText);
      expect(screen.getByText('50000 chars')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // INTEGRATION TESTS
  // ==========================================
  
  describe('Integration', () => {
    test('works with form submission', async () => {
      const mockSubmit = jest.fn();
      
      const TestForm = () => {
        const [value, setValue] = React.useState('');
        
        return (
          <form onSubmit={(e) => { e.preventDefault(); mockSubmit(value); }}>
            <FormTextarea
              name="content"
              value={value}
              eventHandlers={{ onChange: setValue }}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };
      
      render(<TestForm />);
      
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button');
      
      await user.type(textarea, 'Test content');
      await user.click(submitButton);
      
      expect(mockSubmit).toHaveBeenCalledWith('Test content');
    });
    
    test('integrates with external validation library', async () => {
      // Simulate external validation (like Formik or react-hook-form)
      const externalValidator = (value: string) => {
        if (value.length < 5) return 'Too short';
        if (!value.includes('@')) return 'Must include @';
        return '';
      };
      
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        const [error, setError] = React.useState('');
        
        React.useEffect(() => {
          setError(externalValidator(value));
        }, [value]);
        
        return (
          <FormTextarea
            value={value}
            eventHandlers={{ onChange: setValue }}
            validationState={error ? 'error' : 'neutral'}
            errorText={error}
          />
        );
      };
      
      render(<TestComponent />);
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'Hi');
      expect(screen.getByText('Too short')).toBeInTheDocument();
      
      await user.clear(textarea);
      await user.type(textarea, 'Hello world');
      expect(screen.getByText('Must include @')).toBeInTheDocument();
      
      await user.clear(textarea);
      await user.type(textarea, 'test@example.com');
      expect(screen.queryByText('Too short')).not.toBeInTheDocument();
      expect(screen.queryByText('Must include @')).not.toBeInTheDocument();
    });
  });
}); 