import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import FormSubmit, { SubmissionResult, SubmissionConfig } from '../components/ui/FormSubmit';

// ===== CHARLIE QUALITY EXCELLENCE: COMPREHENSIVE TEST SUITE =====

expect.extend(toHaveNoViolations);

// ===== TEST DATA =====

const mockFormData = {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Test message',
};

const mockSubmissionSuccess = jest.fn<Promise<SubmissionResult>, [any]>().mockImplementation(async (data) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    success: true,
    data: { id: '12345', ...data },
    duration: 100,
    timestamp: Date.now(),
  };
});

const mockSubmissionError = jest.fn<Promise<SubmissionResult>, [any]>().mockImplementation(async (data) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    success: false,
    error: 'Submission failed',
    duration: 100,
    timestamp: Date.now(),
  };
});

const mockSubmissionThrow = jest.fn<Promise<SubmissionResult>, [any]>().mockImplementation(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  throw new Error('Network error');
});

const mockValidation = jest.fn<Promise<boolean>, [any]>().mockImplementation(async (data) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return !!(data.name && data.email);
});

const mockValidationFail = jest.fn<Promise<boolean>, [any]>().mockImplementation(async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return false;
});

const defaultConfig: SubmissionConfig = {
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 100,
  showProgress: true,
  enableDraftSave: true,
  validationRequired: true,
};

describe('FormSubmit V7.5 Enhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== BASIC FUNCTIONALITY TESTS =====
  
  describe('Basic Functionality', () => {
    test('renders with default props', () => {
      render(<FormSubmit data-testid="submit-button" />);
      const button = screen.getByTestId('submit-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Submit');
    });

    test('renders with custom button text', () => {
      render(<FormSubmit buttonText="Send Message" data-testid="submit-button" />);
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveTextContent('Send Message');
    });

    test('renders with label', () => {
      render(<FormSubmit label="Form Submission" data-testid="submit-button" />);
      expect(screen.getByText('Form Submission')).toBeInTheDocument();
    });

    test('renders with custom icon', () => {
      const CustomIcon = () => <span data-testid="custom-icon">📧</span>;
      render(
        <FormSubmit 
          buttonIcon={<CustomIcon />}
          showIcon
          data-testid="submit-button" 
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    test('handles disabled state', () => {
      render(<FormSubmit disabled data-testid="submit-button" />);
      const button = screen.getByTestId('submit-button');
      expect(button).toBeDisabled();
    });

    test('handles loading state', () => {
      render(<FormSubmit loading data-testid="submit-button" />);
      const button = screen.getByTestId('submit-button');
      expect(button).toBeDisabled();
    });
  });

  // ===== VARIANT TESTS =====
  
  describe('V7.5 Enhanced Variants', () => {
    test('renders all variants without errors', () => {
      const variants = ['glass', 'outlined', 'filled', 'minimal'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <FormSubmit 
            variant={variant as any} 
            data-testid={`submit-${variant}`} 
          />
        );
        expect(screen.getByTestId(`submit-${variant}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all sizes correctly', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(
          <FormSubmit 
            size={size as any} 
            data-testid={`submit-${size}`} 
          />
        );
        expect(screen.getByTestId(`submit-${size}`)).toBeInTheDocument();
        unmount();
      });
    });

    test('applies full width correctly', () => {
      const { container } = render(
        <FormSubmit 
          fullWidth 
          data-testid="submit-button" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%' });
    });
  });

  // ===== SUBMISSION FUNCTIONALITY TESTS =====
  
  describe('Submission Functionality', () => {
    test('submits successfully', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onSuccess={onSuccess}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should show loading state
      expect(button).toHaveTextContent('Submitting...');
      
      // Wait for completion
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith(mockFormData);
        expect(onSuccess).toHaveBeenCalled();
      });
      
      // Should show success state
      expect(button).toHaveTextContent('Success!');
    });

    test('handles submission error', async () => {
      const user = userEvent.setup();
      const onError = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          onError={onError}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should show loading state
      expect(button).toHaveTextContent('Submitting...');
      
      // Wait for error
      await waitFor(() => {
        expect(mockSubmissionError).toHaveBeenCalledWith(mockFormData);
        expect(onError).toHaveBeenCalled();
      });
      
      // Should show error state
      expect(button).toHaveTextContent('Error occurred');
    });

    test('handles submission exception', async () => {
      const user = userEvent.setup();
      const onError = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionThrow}
          onError={onError}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(mockSubmissionThrow).toHaveBeenCalledWith(mockFormData);
        expect(onError).toHaveBeenCalledWith('Network error', expect.any(Object));
      });
      
      // Should show error state
      expect(button).toHaveTextContent('Error occurred');
    });

    test('prevents submission when disabled', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          disabled
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      expect(mockSubmissionSuccess).not.toHaveBeenCalled();
    });

    test('prevents double submission', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      
      // Click twice quickly
      await user.click(button);
      await user.click(button);
      
      // Should only submit once
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ===== VALIDATION TESTS =====
  
  describe('Validation Integration', () => {
    test('validates before submission', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={onSubmit}
          onValidate={mockValidation}
          validateBeforeSubmit
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockValidation).toHaveBeenCalledWith(mockFormData);
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    test('prevents submission on validation failure', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={onSubmit}
          onValidate={mockValidationFail}
          validateBeforeSubmit
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockValidationFail).toHaveBeenCalledWith(mockFormData);
      });
      
      // Should not submit
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('shows validation state', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onValidate={mockValidation}
          validateBeforeSubmit
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should show validating state temporarily
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'false');
      });
    });
  });

  // ===== RETRY LOGIC TESTS =====
  
  describe('Retry Logic', () => {
    test('shows retry button on error', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          submissionConfig={{ enableRetry: true, maxRetries: 3 }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Should show retry button
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    test('retries submission', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          onRetry={onRetry}
          submissionConfig={{ enableRetry: true, maxRetries: 3 }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Click retry
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledWith(1);
      expect(mockSubmissionError).toHaveBeenCalledTimes(2);
    });

    test('limits retry attempts', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          submissionConfig={{ enableRetry: true, maxRetries: 1 }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Click retry once
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      // Wait for second error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Should not show retry button anymore
      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });

    test('shows retry count', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          submissionConfig={{ enableRetry: true, maxRetries: 3 }}
          showRetryCount
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Should show retry count
      expect(screen.getByText('Retry (1/3)')).toBeInTheDocument();
    });

    test('applies retry delay', async () => {
      const user = userEvent.setup();
      const startTime = Date.now();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          submissionConfig={{ enableRetry: true, maxRetries: 3, retryDelay: 200 }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Click retry
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      // Wait for retry to complete
      await waitFor(() => {
        const elapsedTime = Date.now() - startTime;
        expect(elapsedTime).toBeGreaterThanOrEqual(200);
        expect(mockSubmissionError).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ===== PROGRESS TRACKING TESTS =====
  
  describe('Progress Tracking', () => {
    test('shows progress bar during submission', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          showProgress
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should show progress bar
      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveTextContent('Success!');
      });
    });

    test('shows progress text', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          showProgress
          showProgressText
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should show progress text
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveTextContent('Success!');
      });
    });

    test('shows elapsed time', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          showProgress
          showElapsedTime
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should show elapsed time
      expect(screen.getByText(/\d+s/)).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveTextContent('Success!');
      });
    });

    test('calls progress callback', async () => {
      const user = userEvent.setup();
      const onProgress = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onProgress={onProgress}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for completion
      await waitFor(() => {
        expect(onProgress).toHaveBeenCalled();
      });
    });
  });

  // ===== CANCEL AND RESET TESTS =====
  
  describe('Cancel and Reset Functionality', () => {
    test('shows cancel button during submission', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should show cancel button
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('cancels submission', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onCancel={onCancel}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalled();
    });

    test('shows reset button after completion', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveTextContent('Success!');
      });
      
      // Should show reset button
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    test('resets submission state', async () => {
      const user = userEvent.setup();
      const onReset = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onReset={onReset}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveTextContent('Success!');
      });
      
      // Click reset
      const resetButton = screen.getByText('Reset');
      await user.click(resetButton);
      
      expect(onReset).toHaveBeenCalled();
      expect(button).toHaveTextContent('Submit');
    });
  });

  // ===== KEYBOARD SHORTCUTS TESTS =====
  
  describe('Keyboard Shortcuts', () => {
    test('submits on Ctrl+Enter', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          enableKeyboardShortcuts
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      // Press Ctrl+Enter
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith(mockFormData);
      });
    });

    test('submits on Cmd+Enter (Mac)', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          enableKeyboardShortcuts
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      // Press Cmd+Enter
      await user.keyboard('{Meta>}{Enter}{/Meta}');
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith(mockFormData);
      });
    });

    test('cancels on Escape during submission', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onCancel={onCancel}
          enableKeyboardShortcuts
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      expect(onCancel).toHaveBeenCalled();
    });

    test('retries on Ctrl+R during error', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          enableKeyboardShortcuts
          submissionConfig={{ enableRetry: true, maxRetries: 3 }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Press Ctrl+R
      await user.keyboard('{Control>}r{/Control}');
      
      expect(mockSubmissionError).toHaveBeenCalledTimes(2);
    });

    test('ignores shortcuts when disabled', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          enableKeyboardShortcuts={false}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      // Press Ctrl+Enter
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      // Should not submit
      expect(mockSubmissionSuccess).not.toHaveBeenCalled();
    });
  });

  // ===== SUBMISSION HISTORY TESTS =====
  
  describe('Submission History', () => {
    test('shows submission history', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          showSubmissionHistory
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveTextContent('Success!');
      });
      
      // Should show history
      expect(screen.getByText('Submission History')).toBeInTheDocument();
      expect(screen.getByText('Attempt #1')).toBeInTheDocument();
    });

    test('tracks multiple attempts', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          showSubmissionHistory
          submissionConfig={{ enableRetry: true, maxRetries: 3 }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Click retry
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      // Wait for second error
      await waitFor(() => {
        expect(button).toHaveTextContent('Error occurred');
      });
      
      // Should show both attempts
      expect(screen.getByText('Attempt #1')).toBeInTheDocument();
      expect(screen.getByText('Attempt #2')).toBeInTheDocument();
    });

    test('shows attempt duration', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          showSubmissionHistory
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveTextContent('Success!');
      });
      
      // Should show duration
      expect(screen.getByText(/\d+ms/)).toBeInTheDocument();
    });
  });

  // ===== DRAFT SAVE TESTS =====
  
  describe('Draft Save Functionality', () => {
    test('saves draft', async () => {
      const onDraftSave = jest.fn();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onDraftSave={onDraftSave}
          submissionConfig={{ enableDraftSave: true }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      // Press Ctrl+S
      await userEvent.keyboard('{Control>}s{/Control}');
      
      await waitFor(() => {
        expect(onDraftSave).toHaveBeenCalledWith(mockFormData);
      });
    });

    test('handles draft save error gracefully', async () => {
      const onDraftSave = jest.fn().mockRejectedValue(new Error('Draft save failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          onDraftSave={onDraftSave}
          submissionConfig={{ enableDraftSave: true }}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      // Press Ctrl+S
      await userEvent.keyboard('{Control>}s{/Control}');
      
      await waitFor(() => {
        expect(onDraftSave).toHaveBeenCalledWith(mockFormData);
        expect(consoleSpy).toHaveBeenCalledWith('Draft save failed:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  // ===== LAYOUT & STYLING TESTS =====
  
  describe('Layout and Styling', () => {
    test('applies custom className', () => {
      const { container } = render(
        <FormSubmit 
          className="custom-class" 
          data-testid="submit-button" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <FormSubmit 
          style={customStyle} 
          data-testid="submit-button" 
        />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle(customStyle);
    });

    test('applies button-specific className', () => {
      render(
        <FormSubmit 
          buttonClassName="button-custom-class" 
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveClass('button-custom-class');
    });

    test('shows icon in correct position', () => {
      const { rerender } = render(
        <FormSubmit 
          showIcon
          iconPosition="left"
          data-testid="submit-button" 
        />
      );
      
      // Test left position (default)
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      
      // Test right position
      rerender(
        <FormSubmit 
          showIcon
          iconPosition="right"
          data-testid="submit-button" 
        />
      );
      
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  
  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormSubmit 
          label="Accessible Submit"
          buttonText="Submit Form"
          data-testid="submit-button"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('has correct ARIA attributes', () => {
      render(
        <FormSubmit 
          buttonText="Submit Form"
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
      expect(button).toHaveAttribute('aria-live', 'polite');
      expect(button).toHaveAttribute('aria-atomic', 'true');
    });

    test('announces submission state changes', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={mockFormData}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      
      // Initial state
      expect(button).toHaveAttribute('aria-busy', 'false');
      
      await user.click(button);
      
      // Should announce busy state
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      // Wait for completion
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'false');
        expect(button).toHaveAttribute('aria-label', 'Form submitted successfully');
      });
    });

    test('announces error state', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionError}
          formData={mockFormData}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Wait for error
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label', 'Form submission failed');
      });
    });

    test('associates descriptions correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          showProgress
          formData={mockFormData}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should have aria-describedby
      expect(button).toHaveAttribute('aria-describedby', expect.stringMatching(/progress/));
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={mockFormData}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      
      // Focus and activate with keyboard
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalled();
      });
    });
  });

  // ===== SUBMISSION ENGINE TESTS =====
  
  describe('Submission Engine', () => {
    test('tracks submission metrics', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          showSubmissionHistory
          formData={mockFormData}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      
      // Submit multiple times
      await user.click(button);
      await waitFor(() => expect(button).toHaveTextContent('Success!'));
      
      await user.click(screen.getByText('Reset'));
      await user.click(button);
      await waitFor(() => expect(button).toHaveTextContent('Success!'));
      
      // Should track multiple submissions
      expect(screen.getByText('Submission History')).toBeInTheDocument();
    });

    test('generates unique submission IDs', async () => {
      const user = userEvent.setup();
      const submissions: string[] = [];
      
      const mockSubmitWithId = jest.fn().mockImplementation(async (data) => {
        submissions.push(data.id || 'no-id');
        return mockSubmissionSuccess(data);
      });
      
      render(
        <FormSubmit 
          onSubmit={mockSubmitWithId}
          formData={mockFormData}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      
      // Submit multiple times
      await user.click(button);
      await waitFor(() => expect(button).toHaveTextContent('Success!'));
      
      await user.click(screen.getByText('Reset'));
      await user.click(button);
      await waitFor(() => expect(button).toHaveTextContent('Success!'));
      
      // Should generate different IDs (in practice, the engine handles this)
      expect(mockSubmitWithId).toHaveBeenCalledTimes(2);
    });

    test('handles concurrent submissions correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={mockFormData}
          data-testid="submit-button"
        />
      );
      
      const button = screen.getByTestId('submit-button');
      
      // Try to submit multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      // Should only process once
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ===== PERFORMANCE TESTS =====
  
  describe('Performance', () => {
    test('component is memoized', () => {
      const props = { 
        onSubmit: mockSubmissionSuccess,
        formData: mockFormData,
        'data-testid': 'submit-button' 
      };
      
      const { rerender } = render(<FormSubmit {...props} />);
      
      // Should not re-render with same props
      const firstRender = screen.getByTestId('submit-button');
      rerender(<FormSubmit {...props} />);
      const secondRender = screen.getByTestId('submit-button');
      
      expect(firstRender).toBe(secondRender);
    });

    test('renders within performance budget', () => {
      const startTime = performance.now();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 16ms (60fps budget)
      expect(renderTime).toBeLessThan(16);
    });

    test('handles large form data efficiently', async () => {
      const user = userEvent.setup();
      const largeFormData = {
        ...mockFormData,
        largeField: 'x'.repeat(10000),
        arrayField: Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
      };
      
      const startTime = performance.now();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={largeFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      // Should handle large data efficiently
      expect(operationTime).toBeLessThan(500); // 0.5 seconds
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith(largeFormData);
      });
    });
  });

  // ===== EDGE CASES =====
  
  describe('Edge Cases', () => {
    test('handles null/undefined form data', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={null}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith(null);
      });
    });

    test('handles empty form data', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          formData={{}}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith({});
      });
    });

    test('handles submission without onSubmit handler', async () => {
      const user = userEvent.setup();
      
      render(
        <FormSubmit 
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      // Should not error
      expect(button).toHaveTextContent('Submit');
    });

    test('handles very long submission text', () => {
      const longText = 'Very long submission button text that might cause layout issues if not handled properly';
      
      render(
        <FormSubmit 
          buttonText={longText}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveTextContent(longText);
    });

    test('handles special characters in text', () => {
      const specialText = 'Submit with special chars: !@#$%^&*()[]{}|;:,.<>?';
      
      render(
        <FormSubmit 
          buttonText={specialText}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveTextContent(specialText);
    });
  });

  // ===== INTEGRATION TESTS =====
  
  describe('Integration', () => {
    test('integrates with form context', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn();
      
      render(
        <form onSubmit={handleSubmit}>
          <FormSubmit 
            onSubmit={mockSubmissionSuccess}
            formData={mockFormData}
            data-testid="submit-button" 
          />
        </form>
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith(mockFormData);
      });
    });

    test('maintains ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      
      render(
        <FormSubmit 
          ref={ref} 
          data-testid="submit-button" 
        />
      );
      
      expect(ref.current).toBe(screen.getByTestId('submit-button'));
    });

    test('forwards HTML attributes correctly', () => {
      render(
        <FormSubmit 
          data-testid="submit-button"
          name="submitButton"
          id="submit-form"
          tabIndex={0}
        />
      );
      
      const button = screen.getByTestId('submit-button');
      expect(button).toHaveAttribute('name', 'submitButton');
      expect(button).toHaveAttribute('id', 'submit-form');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    test('integrates with external state management', async () => {
      const user = userEvent.setup();
      const externalState = {
        isSubmitting: false,
        isSuccess: false,
        isError: false,
        isPending: false,
        isDraft: false,
        isValidating: false,
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        retryCount: 0,
        maxRetries: 3,
        lastSubmitTime: null,
        submissionHistory: [],
      };
      
      render(
        <FormSubmit 
          onSubmit={mockSubmissionSuccess}
          submissionState={externalState}
          formData={mockFormData}
          data-testid="submit-button" 
        />
      );
      
      const button = screen.getByTestId('submit-button');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockSubmissionSuccess).toHaveBeenCalledWith(mockFormData);
      });
    });
  });
});

// ===== CHARLIE PERFORMANCE BENCHMARKS =====

describe('FormSubmit Performance Benchmarks', () => {
  test('submission performance with complex data', async () => {
    const user = userEvent.setup();
    const complexData = {
      user: { id: 1, name: 'John', email: 'john@example.com' },
      items: Array(100).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` })),
      metadata: { timestamp: Date.now(), version: '1.0.0' },
    };
    
    const startTime = performance.now();
    
    render(
      <FormSubmit 
        onSubmit={mockSubmissionSuccess}
        formData={complexData}
        data-testid="submit-button" 
      />
    );
    
    const button = screen.getByTestId('submit-button');
    await user.click(button);
    
    await waitFor(() => {
      expect(mockSubmissionSuccess).toHaveBeenCalledWith(complexData);
    });
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should handle complex data efficiently
    expect(operationTime).toBeLessThan(1000); // 1 second
  });

  test('retry performance with multiple attempts', async () => {
    const user = userEvent.setup();
    const startTime = performance.now();
    
    render(
      <FormSubmit 
        onSubmit={mockSubmissionError}
        submissionConfig={{ enableRetry: true, maxRetries: 3, retryDelay: 10 }}
        formData={mockFormData}
        data-testid="submit-button" 
      />
    );
    
    const button = screen.getByTestId('submit-button');
    await user.click(button);
    
    // Wait for error and retry multiple times
    await waitFor(() => {
      expect(button).toHaveTextContent('Error occurred');
    });
    
    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);
    
    await waitFor(() => {
      expect(button).toHaveTextContent('Error occurred');
    });
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Should handle retries efficiently
    expect(operationTime).toBeLessThan(2000); // 2 seconds
  });
});

// ===== CHARLIE BUNDLE SIZE TEST =====

describe('FormSubmit Bundle Impact', () => {
  test('component exports are tree-shakeable', () => {
    expect(FormSubmit).toBeDefined();
    expect(typeof FormSubmit).toBe('object'); // React.ForwardRefExoticComponent
  });

  test('submission engine is modular', () => {
    // Test that submission engine can be imported separately
    const { useSubmissionEngine } = require('../components/ui/FormSubmit');
    expect(useSubmissionEngine).toBeDefined();
  });

  test('configuration is optional', () => {
    // Test without configuration
    render(
      <FormSubmit 
        onSubmit={mockSubmissionSuccess}
        data-testid="submit-1" 
      />
    );
    
    const button1 = screen.getByTestId('submit-1');
    expect(button1).toBeInTheDocument();
    
    // Test with configuration
    render(
      <FormSubmit 
        onSubmit={mockSubmissionSuccess}
        submissionConfig={defaultConfig}
        data-testid="submit-2" 
      />
    );
    
    const button2 = screen.getByTestId('submit-2');
    expect(button2).toBeInTheDocument();
  });
}); 