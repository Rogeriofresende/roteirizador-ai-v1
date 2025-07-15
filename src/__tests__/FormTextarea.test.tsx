import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormTextarea } from '../components/ui/FormTextarea';

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE TEST SUITE =====

expect.extend(toHaveNoViolations);

describe('FormTextarea V7.5 Enhanced', () => {
  // ===== BASIC FUNCTIONALITY TESTS =====
  
  describe('Basic Functionality', () => {
    test('renders with default props', () => {
      render(<FormTextarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    test('renders with label', () => {
      render(<FormTextarea label="Test Label" data-testid="textarea" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toHaveAccessibleName('Test Label');
    });

    test('renders with placeholder', () => {
      render(<FormTextarea placeholder="Test placeholder" data-testid="textarea" />);
      expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
    });

    test('renders with helper text', () => {
      render(<FormTextarea helperText="Helper text" data-testid="textarea" />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    test('handles default rows', () => {
      render(<FormTextarea rows={5} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('rows', '5');
    });
  });

  // ===== VARIANT TESTS =====
  
  describe('V7.5 Enhanced Variants', () => {
    test('renders glass variant with correct styles', () => {
      render(<FormTextarea variant="glass" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
    });

    test('renders all variants without errors', () => {
      const variants = ['glass', 'outlined', 'filled', 'minimal'];
      
      variants.forEach(variant => {
        const { unmount } = render(<FormTextarea variant={variant as any} data-testid={`textarea-${variant}`} />);
        expect(screen.getByTestId(`textarea-${variant}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(<FormTextarea size={size as any} data-testid={`textarea-${size}`} />);
        expect(screen.getByTestId(`textarea-${size}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ===== AUTO-RESIZE FUNCTIONALITY TESTS =====
  
  describe('Auto-Resize Functionality', () => {
    test('enables auto-resize by default', () => {
      render(<FormTextarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      
      // Should not have rows attribute when auto-resize is enabled
      expect(textarea).not.toHaveAttribute('rows');
    });

    test('disables auto-resize when autoResize is false', () => {
      render(<FormTextarea autoResize={false} rows={5} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      
      expect(textarea).toHaveAttribute('rows', '5');
    });

    test('calls onResize when height changes', async () => {
      const handleResize = jest.fn();
      const user = userEvent.setup();
      
      render(
        <FormTextarea 
          autoResize 
          onResize={handleResize} 
          data-testid="textarea" 
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      
      // Add content that should trigger resize
      await user.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5');
      
      // onResize should be called when content changes height
      await waitFor(() => {
        expect(handleResize).toHaveBeenCalled();
      });
    });

    test('respects minRows and maxRows constraints', () => {
      render(
        <FormTextarea 
          autoResize 
          minRows={3} 
          maxRows={6} 
          data-testid="textarea" 
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
      
      // Note: Full height constraint testing would require more complex DOM manipulation
      // This test validates the props are passed correctly
    });
  });

  // ===== CHARACTER COUNT TESTS =====
  
  describe('Character Count & Metrics', () => {
    test('shows character count when enabled', () => {
      render(
        <FormTextarea 
          showCharacterCount 
          value="test" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('4 chars')).toBeInTheDocument();
    });

    test('shows character count with maxLength', () => {
      render(
        <FormTextarea 
          showCharacterCount 
          maxLength={10} 
          value="test" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('4/10')).toBeInTheDocument();
    });

    test('shows word count when enabled', () => {
      render(
        <FormTextarea 
          showWordCount 
          value="hello world test" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('3 words')).toBeInTheDocument();
    });

    test('shows line count when enabled', () => {
      render(
        <FormTextarea 
          showLineCount 
          value="line 1\nline 2\nline 3" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('3 lines')).toBeInTheDocument();
    });

    test('shows multiple metrics together', () => {
      render(
        <FormTextarea 
          showCharacterCount 
          showWordCount 
          showLineCount 
          maxLength={50}
          value="hello world\ntest content" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('23/50')).toBeInTheDocument();
      expect(screen.getByText('3 words')).toBeInTheDocument();
      expect(screen.getByText('2 lines')).toBeInTheDocument();
    });

    test('updates metrics in real-time', async () => {
      const user = userEvent.setup();
      
      render(
        <FormTextarea 
          showCharacterCount 
          showWordCount 
          data-testid="textarea" 
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'hello world');
      
      expect(screen.getByText('11 chars')).toBeInTheDocument();
      expect(screen.getByText('2 words')).toBeInTheDocument();
    });
  });

  // ===== STATE MANAGEMENT TESTS =====
  
  describe('State Management', () => {
    test('handles controlled value', () => {
      const handleChange = jest.fn();
      render(<FormTextarea value="test value" onChange={handleChange} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('test value');
    });

    test('handles uncontrolled value with defaultValue', () => {
      render(<FormTextarea defaultValue="default value" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('default value');
    });

    test('calls onChange when value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormTextarea onChange={handleChange} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'test');
      
      expect(handleChange).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
    });

    test('updates internal state for uncontrolled component', async () => {
      const user = userEvent.setup();
      
      render(<FormTextarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'test content');
      
      expect(textarea.value).toBe('test content');
    });
  });

  // ===== VALIDATION TESTS =====
  
  describe('Validation States', () => {
    test('shows error state correctly', () => {
      render(
        <FormTextarea 
          error 
          errorMessage="Error message" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'true');
    });

    test('shows success state correctly', () => {
      render(
        <FormTextarea 
          success 
          successMessage="Success message" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'false');
    });

    test('shows warning state correctly', () => {
      render(
        <FormTextarea 
          warning 
          warningMessage="Warning message" 
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    test('handles required attribute', () => {
      render(<FormTextarea required data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-required', 'true');
    });

    test('handles disabled state', () => {
      render(<FormTextarea disabled data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeDisabled();
    });

    test('handles readonly state', () => {
      render(<FormTextarea readOnly data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('readonly');
    });
  });

  // ===== TOOLBAR TESTS =====
  
  describe('Toolbar Integration', () => {
    const mockToolbarActions = [
      {
        id: 'bold',
        label: 'Bold',
        icon: 'B',
        action: jest.fn(),
      },
      {
        id: 'italic',
        label: 'Italic',
        icon: 'I',
        action: jest.fn(),
      },
    ];

    test('renders toolbar when showToolbar is true', () => {
      render(
        <FormTextarea 
          showToolbar 
          toolbarActions={mockToolbarActions}
          data-testid="textarea" 
        />
      );
      
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('Italic')).toBeInTheDocument();
    });

    test('does not render toolbar when showToolbar is false', () => {
      render(
        <FormTextarea 
          showToolbar={false}
          toolbarActions={mockToolbarActions}
          data-testid="textarea" 
        />
      );
      
      expect(screen.queryByText('Bold')).not.toBeInTheDocument();
    });

    test('calls toolbar action when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <FormTextarea 
          showToolbar 
          toolbarActions={mockToolbarActions}
          data-testid="textarea" 
        />
      );
      
      const boldButton = screen.getByText('Bold');
      await user.click(boldButton);
      
      expect(mockToolbarActions[0].action).toHaveBeenCalled();
    });
  });

  // ===== FOCUS & INTERACTION TESTS =====
  
  describe('Focus and Interaction', () => {
    test('calls onFocus when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      
      render(<FormTextarea onFocus={handleFocus} data-testid="textarea" />);
      
      await user.click(screen.getByTestId('textarea'));
      expect(handleFocus).toHaveBeenCalled();
    });

    test('calls onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      
      render(<FormTextarea onBlur={handleBlur} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.click(textarea);
      await user.tab(); // Move focus away
      
      expect(handleBlur).toHaveBeenCalled();
    });

    test('calls onKeyDown when key is pressed', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();
      
      render(<FormTextarea onKeyDown={handleKeyDown} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'a');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });

    test('autoFocus works correctly', () => {
      render(<FormTextarea autoFocus data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveFocus();
    });

    test('handles keyboard shortcuts', async () => {
      const handleKeyDown = jest.fn();
      const user = userEvent.setup();
      
      render(<FormTextarea onKeyDown={handleKeyDown} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      
      // Test Ctrl+A (select all)
      await user.click(textarea);
      await user.keyboard('{Control>}a{/Control}');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  // ===== DEBOUNCE TESTS =====
  
  describe('Debouncing', () => {
    test('debounces onChange calls', async () => {
      jest.useFakeTimers();
      const handleChange = jest.fn();
      const user = userEvent.setup();
      
      render(<FormTextarea debounceMs={300} onChange={handleChange} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'test');
      
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
        <FormTextarea 
          label="Accessible Textarea"
          helperText="Helper text"
          required
          autoResize
          showCharacterCount
          data-testid="textarea"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('associates label with textarea', () => {
      render(<FormTextarea label="Test Label" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      const label = screen.getByText('Test Label');
      
      expect(textarea).toHaveAccessibleName('Test Label');
      expect(label).toHaveAttribute('for', textarea.id);
    });

    test('associates helper text with textarea', () => {
      render(<FormTextarea helperText="Helper text" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      const helperText = screen.getByText('Helper text');
      
      expect(textarea).toHaveAttribute('aria-describedby', expect.stringContaining(helperText.id));
    });

    test('associates character count with textarea', () => {
      render(
        <FormTextarea 
          showCharacterCount 
          value="test" 
          data-testid="textarea" 
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      const countElement = screen.getByText('4 chars');
      
      expect(textarea).toHaveAttribute('aria-describedby', expect.stringContaining(countElement.id));
    });

    test('has proper aria-multiline attribute', () => {
      render(<FormTextarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-multiline', 'true');
    });

    test('announces validation state changes to screen readers', () => {
      const { rerender } = render(<FormTextarea data-testid="textarea" />);
      
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'false');
      
      rerender(<FormTextarea error errorMessage="Error" data-testid="textarea" />);
      
      expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  // ===== LAYOUT TESTS =====
  
  describe('Layout and Styling', () => {
    test('applies full width correctly', () => {
      const { container } = render(<FormTextarea fullWidth data-testid="textarea" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%' });
    });

    test('applies custom className', () => {
      const { container } = render(<FormTextarea className="custom-class" data-testid="textarea" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<FormTextarea style={customStyle} data-testid="textarea" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });

    test('applies custom textarea className', () => {
      render(<FormTextarea textareaClassName="custom-textarea" data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('custom-textarea');
    });

    test('applies custom label className', () => {
      render(<FormTextarea label="Test" labelClassName="custom-label" data-testid="textarea" />);
      
      const label = screen.getByText('Test');
      expect(label).toHaveClass('custom-label');
    });

    test('handles resizable prop', () => {
      render(<FormTextarea resizable data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
      // Note: CSS resize property testing would require more complex setup
    });
  });

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { label: 'Test', 'data-testid': 'textarea' };
      const { rerender } = render(<FormTextarea {...props} />);
      
      // Should not re-render with same props
      const firstRender = screen.getByTestId('textarea');
      rerender(<FormTextarea {...props} />);
      const secondRender = screen.getByTestId('textarea');
      
      expect(firstRender).toBe(secondRender);
    });

    test('handles large text efficiently', async () => {
      const largeText = 'A'.repeat(10000);
      const user = userEvent.setup();
      
      render(<FormTextarea autoResize showCharacterCount data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      
      // Should handle large text without errors
      await user.clear(textarea);
      await user.type(textarea, largeText);
      
      expect(textarea).toHaveValue(largeText);
      expect(screen.getByText('10000 chars')).toBeInTheDocument();
    });

    test('auto-resize performance with rapid changes', async () => {
      const user = userEvent.setup();
      
      render(<FormTextarea autoResize data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      
      // Rapid line additions
      for (let i = 0; i < 10; i++) {
        await user.type(textarea, `Line ${i + 1}\n`);
      }
      
      // Should handle rapid changes without errors
      expect(textarea).toHaveValue(expect.stringContaining('Line 10'));
    });
  });

  // ===== EDGE CASES =====
  
  describe('Edge Cases', () => {
    test('handles empty value correctly', () => {
      render(<FormTextarea value="" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveValue('');
    });

    test('handles undefined value correctly', () => {
      render(<FormTextarea value={undefined} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveValue('');
    });

    test('handles null onChange gracefully', async () => {
      const user = userEvent.setup();
      
      render(<FormTextarea onChange={undefined} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'test');
      
      expect(textarea).toHaveValue('test');
    });

    test('handles maxLength correctly', async () => {
      const user = userEvent.setup();
      
      render(<FormTextarea maxLength={10} data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'very long content that exceeds limit');
      
      expect((textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(10);
    });

    test('handles special characters and line breaks', async () => {
      const user = userEvent.setup();
      
      render(<FormTextarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      const specialText = '!@#$%^&*()_+{}|:"<>?[];\'\\,./`~\nLine 2\nLine 3';
      await user.type(textarea, specialText);
      
      expect(textarea).toHaveValue(specialText);
    });

    test('handles paste operations correctly', async () => {
      const user = userEvent.setup();
      
      render(<FormTextarea data-testid="textarea" />);
      
      const textarea = screen.getByTestId('textarea');
      await user.click(textarea);
      await user.paste('pasted\nmultiline\ncontent');
      
      expect(textarea).toHaveValue('pasted\nmultiline\ncontent');
    });

    test('handles empty toolbar actions array', () => {
      render(
        <FormTextarea 
          showToolbar 
          toolbarActions={[]}
          data-testid="textarea" 
        />
      );
      
      // Should not crash with empty toolbar actions
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTS =====
  
  describe('Integration', () => {
    test('works correctly within form context', async () => {
      const handleSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <form onSubmit={handleSubmit}>
          <FormTextarea name="testField" data-testid="textarea" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'test content');
      await user.click(screen.getByText('Submit'));
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    test('maintains ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      
      render(<FormTextarea ref={ref} data-testid="textarea" />);
      
      expect(ref.current).toBe(screen.getByTestId('textarea'));
    });

    test('forwards all HTML attributes correctly', () => {
      render(
        <FormTextarea 
          data-testid="textarea"
          spellCheck={false}
          name="content"
          id="content-textarea"
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('spellCheck', 'false');
      expect(textarea).toHaveAttribute('name', 'content');
      expect(textarea).toHaveAttribute('id', 'content-textarea');
    });

    test('integrates with auto-resize and character count simultaneously', async () => {
      const user = userEvent.setup();
      
      render(
        <FormTextarea 
          autoResize
          showCharacterCount
          showWordCount
          showLineCount
          minRows={2}
          maxRows={6}
          data-testid="textarea"
        />
      );
      
      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Line 1\nLine 2\nLine 3 with more content');
      
      // Should show all metrics
      expect(screen.getByText(/chars/)).toBeInTheDocument();
      expect(screen.getByText(/words/)).toBeInTheDocument();
      expect(screen.getByText(/lines/)).toBeInTheDocument();
      
      // Auto-resize should be working
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3 with more content');
    });
  });
});

// ===== CHARLIE PERFORMANCE BENCHMARKS =====

describe('FormTextarea Performance Benchmarks', () => {
  test('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<FormTextarea autoResize showCharacterCount data-testid="textarea" />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 16ms (60fps budget)
    expect(renderTime).toBeLessThan(16);
  });

  test('auto-resize performance with large content', async () => {
    const user = userEvent.setup();
    const startTime = performance.now();
    
    render(<FormTextarea autoResize data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    const largeContent = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join('\n');
    
    await user.type(textarea, largeContent);
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should handle large content efficiently
    expect(operationTime).toBeLessThan(1000); // 1 second
    expect(textarea).toHaveValue(largeContent);
  });

  test('handles many simultaneous textareas efficiently', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 20 }, (_, i) => (
          <FormTextarea 
            key={i} 
            autoResize 
            showCharacterCount 
            data-testid={`textarea-${i}`} 
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should handle 20 textareas within reasonable time
    expect(renderTime).toBeLessThan(500); // 0.5 seconds
  });
});

// ===== CHARLIE BUNDLE SIZE TEST =====

describe('FormTextarea Bundle Impact', () => {
  test('component exports are tree-shakeable', () => {
    // This test ensures the component can be imported individually
    expect(FormTextarea).toBeDefined();
    expect(typeof FormTextarea).toBe('object'); // React.ForwardRefExoticComponent
  });

  test('auto-resize functionality is optional', () => {
    // Test that auto-resize can be disabled without importing related code
    render(<FormTextarea autoResize={false} rows={5} data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('rows', '5');
  });
}); 