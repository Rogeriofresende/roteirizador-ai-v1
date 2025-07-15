import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormSubmit, FormSubmitRef, FormSubmitResponse } from '../FormSubmit';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ==========================================
// 🟡 IA CHARLIE - QUALITY EXCELLENCE TESTS
// ==========================================

describe('FormSubmit V7.5 Enhanced', () => {
  const user = userEvent.setup();
  
  // Mock submission handlers
  const mockSubmissionHandlers = {
    success: jest.fn().mockResolvedValue({
      success: true,
      data: { id: '123' },
      message: 'Success!',
      timestamp: new Date(),
      duration: 1000
    }),
    
    error: jest.fn().mockResolvedValue({
      success: false,
      errors: ['Submission failed'],
      message: 'Error occurred',
      timestamp: new Date(),
      duration: 1000
    }),
    
    slow: jest.fn().mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        success: true,
        data: {},
        timestamp: new Date(),
        duration: 2000
      }), 2000)
    ))
  };
  
  // Mock form ref
  const mockFormRef = {
    current: {
      action: '/submit',
      method: 'POST',
      reset: jest.fn(),
      submit: jest.fn()
    } as any
  };
  
  // Mock validation ref
  const mockValidationRef = {
    current: {
      validate: jest.fn().mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        fields: {}
      })
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock performance.now
    jest.spyOn(performance, 'now').mockReturnValue(1000);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================
  
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<FormSubmit onSubmit={mockSubmissionHandlers.success}>Submit</FormSubmit>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    test('renders with custom text', () => {
      render(<FormSubmit onSubmit={mockSubmissionHandlers.success}>Custom Submit</FormSubmit>);
      expect(screen.getByText('Custom Submit')).toBeInTheDocument();
    });
    
    test('renders with title and description', () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          title="Form Submission"
          description="Submit your form data"
        >
          Submit
        </FormSubmit>
      );
      
      expect(screen.getByText('Form Submission')).toBeInTheDocument();
      expect(screen.getByText('Submit your form data')).toBeInTheDocument();
    });
    
    test('renders with proper button attributes', () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          id="submit-btn-1752598069"
          type="submit"
          ariaLabel="Submit form"
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('id', 'submit-btn');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });
  });
  
  // ==========================================
  // VARIANT TESTS
  // ==========================================
  
  describe('Variants', () => {
    test('renders glass variant with correct classes', () => {
      const { container } = render(
        <FormSubmit variant="glass" onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(container.querySelector('.form-submit-button--glass')).toBeInTheDocument();
    });
    
    test('renders outlined variant with correct classes', () => {
      const { container } = render(
        <FormSubmit variant="outlined" onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(container.querySelector('.form-submit-button--outlined')).toBeInTheDocument();
    });
    
    test('renders filled variant with correct classes', () => {
      const { container } = render(
        <FormSubmit variant="filled" onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(container.querySelector('.form-submit-button--filled')).toBeInTheDocument();
    });
    
    test('renders minimal variant with correct classes', () => {
      const { container } = render(
        <FormSubmit variant="minimal" onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(container.querySelector('.form-submit-button--minimal')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SIZE TESTS
  // ==========================================
  
  describe('Sizes', () => {
    test('renders small size with correct classes', () => {
      const { container } = render(
        <FormSubmit size="sm" onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(container.querySelector('.form-submit-button--sm')).toBeInTheDocument();
    });
    
    test('renders large size with correct classes', () => {
      const { container } = render(
        <FormSubmit size="lg" onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(container.querySelector('.form-submit-button--lg')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SUBMISSION HANDLING TESTS
  // ==========================================
  
  describe('Submission Handling', () => {
    test('handles successful submission', async () => {
      const onSubmitStart = jest.fn();
      const onSubmitSuccess = jest.fn();
      const onSubmitComplete = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          eventHandlers={{
            onSubmitStart,
            onSubmitSuccess,
            onSubmitComplete
          }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(onSubmitStart).toHaveBeenCalled();
        expect(mockSubmissionHandlers.success).toHaveBeenCalled();
        expect(onSubmitSuccess).toHaveBeenCalled();
        expect(onSubmitComplete).toHaveBeenCalled();
      });
    });
    
    test('handles submission error', async () => {
      const onSubmitError = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.error}
          eventHandlers={{ onSubmitError }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockSubmissionHandlers.error).toHaveBeenCalled();
        expect(onSubmitError).toHaveBeenCalled();
      });
    });
    
    test('shows loading state during submission', async () => {
      render(
        <FormSubmit onSubmit={mockSubmissionHandlers.slow}>
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute('disabled');
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
      });
    });
    
    test('prevents multiple submissions', async () => {
      render(
        <FormSubmit onSubmit={mockSubmissionHandlers.slow}>
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      
      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      // Should only call handler once
      expect(mockSubmissionHandlers.slow).toHaveBeenCalledTimes(1);
    });
  });
  
  // ==========================================
  // VALIDATION INTEGRATION TESTS
  // ==========================================
  
  describe('Validation Integration', () => {
    test('validates form before submission when configured', async () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          validationRef={mockValidationRef as any}
          config={{ validateBeforeSubmit: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockValidationRef.current.validate).toHaveBeenCalled();
        expect(mockSubmissionHandlers.success).toHaveBeenCalled();
      });
    });
    
    test('prevents submission when validation fails', async () => {
      const mockInvalidValidation = {
        current: {
          validate: jest.fn().mockResolvedValue({
            isValid: false,
            errors: ['Name is required'],
            warnings: [],
            fields: {}
          })
        }
      };
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          validationRef={mockInvalidValidation as any}
          config={{ validateBeforeSubmit: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockInvalidValidation.current.validate).toHaveBeenCalled();
        expect(mockSubmissionHandlers.success).not.toHaveBeenCalled();
      });
    });
    
    test('shows validation status when configured', async () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          validationRef={mockValidationRef as any}
          config={{ 
            validateBeforeSubmit: true,
            showValidationStatus: true 
          }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Form is valid')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // PROGRESS TRACKING TESTS
  // ==========================================
  
  describe('Progress Tracking', () => {
    test('shows progress indicator when configured', async () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          config={{ showProgress: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Preparing submission...')).toBeInTheDocument();
      });
    });
    
    test('hides progress indicator when disabled', async () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          config={{ showProgress: false }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Preparing submission...')).not.toBeInTheDocument();
      });
    });
    
    test('shows progress phases during submission', async () => {
      const onSubmitProgress = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          config={{ showProgress: true }}
          eventHandlers={{ onSubmitProgress }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(onSubmitProgress).toHaveBeenCalled();
      });
    });
  });
  
  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================
  
  describe('Error Handling', () => {
    test('displays error messages after failed submission', async () => {
      render(
        <FormSubmit onSubmit={mockSubmissionHandlers.error}>
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Submission Failed')).toBeInTheDocument();
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      });
    });
    
    test('shows retry button when retry is enabled', async () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.error}
          config={{ enableRetry: true, retryAttempts: 3 }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Retry \(1\/3\)/)).toBeInTheDocument();
      });
    });
    
    test('handles retry attempts', async () => {
      const onSubmitRetry = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.error}
          config={{ enableRetry: true, retryAttempts: 2 }}
          eventHandlers={{ onSubmitRetry }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Retry \(1\/2\)/)).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText(/Retry \(1\/2\)/);
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(onSubmitRetry).toHaveBeenCalledWith(1);
      });
    });
    
    test('limits retry attempts', async () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.error}
          config={{ enableRetry: true, retryAttempts: 1 }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Retry \(1\/1\)/)).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText(/Retry \(1\/1\)/);
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Retry/)).not.toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // FORM INTEGRATION TESTS
  // ==========================================
  
  describe('Form Integration', () => {
    test('integrates with form element', async () => {
      render(
        <FormSubmit 
          formRef={mockFormRef as any}
          config={{ resetOnSuccess: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Should attempt to submit form if no onSubmit provided
      await waitFor(() => {
        expect(button).toHaveAttribute('disabled');
      });
    });
    
    test('resets form on successful submission when configured', async () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          formRef={mockFormRef as any}
          config={{ resetOnSuccess: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockFormRef.current.reset).toHaveBeenCalled();
      });
    });
  });
  
  // ==========================================
  // IMPERATIVE API TESTS
  // ==========================================
  
  describe('Imperative API', () => {
    test('provides imperative handle methods', () => {
      const ref = React.createRef<FormSubmitRef>();
      
      render(
        <FormSubmit ref={ref} onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(ref.current).toMatchObject({
        submit: expect.any(Function),
        cancel: expect.any(Function),
        retry: expect.any(Function),
        reset: expect.any(Function),
        getState: expect.any(Function),
        getMetrics: expect.any(Function),
        getProgress: expect.any(Function),
        isSubmitting: expect.any(Function),
        canSubmit: expect.any(Function),
        focus: expect.any(Function),
        blur: expect.any(Function)
      });
    });
    
    test('submit method triggers submission', async () => {
      const ref = React.createRef<FormSubmitRef>();
      
      render(
        <FormSubmit ref={ref} onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      await act(async () => {
        await ref.current?.submit();
      });
      
      expect(mockSubmissionHandlers.success).toHaveBeenCalled();
    });
    
    test('getState method returns current state', () => {
      const ref = React.createRef<FormSubmitRef>();
      
      render(
        <FormSubmit ref={ref} onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      const state = ref.current?.getState();
      expect(state).toMatchObject({
        isSubmitting: false,
        isCompleted: false,
        isSuccess: false,
        isError: false,
        hasErrors: false,
        progress: 0,
        errors: [],
        warnings: [],
        data: {}
      });
    });
    
    test('isSubmitting method returns submission status', async () => {
      const ref = React.createRef<FormSubmitRef>();
      
      render(
        <FormSubmit ref={ref} onSubmit={mockSubmissionHandlers.slow}>
          Submit
        </FormSubmit>
      );
      
      expect(ref.current?.isSubmitting()).toBe(false);
      
      act(() => {
        ref.current?.submit();
      });
      
      await waitFor(() => {
        expect(ref.current?.isSubmitting()).toBe(true);
      });
    });
    
    test('reset method clears submission state', async () => {
      const ref = React.createRef<FormSubmitRef>();
      
      render(
        <FormSubmit ref={ref} onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      await act(async () => {
        await ref.current?.submit();
      });
      
      act(() => {
        ref.current?.reset();
      });
      
      const state = ref.current?.getState();
      expect(state?.isCompleted).toBe(false);
      expect(state?.isSuccess).toBe(false);
      expect(state?.errors).toEqual([]);
    });
  });
  
  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          ariaLabel="Submit form"
          title="Form Submission"
          description="Submit your form data"
        >
          Submit
        </FormSubmit>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('button has proper accessibility attributes', () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          ariaLabel="Submit form"
          ariaDescribedBy="form-help"
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
      expect(button).toHaveAttribute('aria-describedby', 'form-help');
    });
    
    test('disabled button has proper aria attributes', () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          disabled={true}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
    
    test('loading state is announced to screen readers', async () => {
      render(
        <FormSubmit onSubmit={mockSubmissionHandlers.slow}>
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute('disabled');
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // CONFIGURATION TESTS
  // ==========================================
  
  describe('Configuration', () => {
    test('respects timeout configuration', async () => {
      const timeoutHandler = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );
      
      render(
        <FormSubmit 
          onSubmit={timeoutHandler}
          config={{ timeout: 1000 }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Should timeout and handle error
      await waitFor(() => {
        expect(button).not.toHaveAttribute('disabled');
      }, { timeout: 2000 });
    });
    
    test('shows confirmation dialog when configured', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          config={{ confirmBeforeSubmit: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to submit this form?');
      confirmSpy.mockRestore();
    });
    
    test('cancels submission when confirmation is rejected', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          config={{ confirmBeforeSubmit: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockSubmissionHandlers.success).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });
  
  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================
  
  describe('Performance', () => {
    test('handles rapid clicks efficiently', async () => {
      render(
        <FormSubmit onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      
      // Click rapidly multiple times
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }
      const endTime = performance.now();
      
      // Should complete quickly (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should only trigger one submission
      expect(mockSubmissionHandlers.success).toHaveBeenCalledTimes(1);
    });
    
    test('cleans up resources on unmount', () => {
      const { unmount } = render(
        <FormSubmit onSubmit={mockSubmissionHandlers.success}>
          Submit
        </FormSubmit>
      );
      
      expect(() => unmount()).not.toThrow();
    });
  });
  
  // ==========================================
  // EDGE CASES
  // ==========================================
  
  describe('Edge Cases', () => {
    test('handles undefined onSubmit gracefully', () => {
      expect(() => {
        render(<FormSubmit>Submit</FormSubmit>);
      }).not.toThrow();
    });
    
    test('handles submission handler errors', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
      
      render(
        <FormSubmit onSubmit={errorHandler}>
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Submission Failed')).toBeInTheDocument();
      });
    });
    
    test('handles validation errors gracefully', async () => {
      const mockErrorValidation = {
        current: {
          validate: jest.fn().mockRejectedValue(new Error('Validation error'))
        }
      };
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          validationRef={mockErrorValidation as any}
          config={{ validateBeforeSubmit: true }}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Submission Failed')).toBeInTheDocument();
      });
    });
    
    test('handles disabled state correctly', () => {
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          disabled={true}
        >
          Submit
        </FormSubmit>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveClass('form-submit-button--disabled');
    });
    
    test('handles custom button customization', () => {
      const customization = {
        idleText: 'Custom Submit',
        loadingText: 'Custom Loading...',
        successText: 'Custom Success!',
        errorText: 'Custom Error'
      };
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionHandlers.success}
          buttonCustomization={customization}
        >
          Submit
        </FormSubmit>
      );
      
      expect(screen.getByText('Custom Submit')).toBeInTheDocument();
    });
  });
}); 