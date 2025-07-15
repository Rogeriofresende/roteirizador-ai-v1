import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormWizard, FormWizardRef, FormWizardStep } from '../FormWizard';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ==========================================
// 🟡 IA CHARLIE - QUALITY EXCELLENCE TESTS
// ==========================================

describe('FormWizard V7.5 Enhanced', () => {
  const user = userEvent.setup();
  
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
  });
  
  // Mock step components
  const Step1 = ({ data, onChange }: any) => (
    <div>
      <input
        data-testid="step1-input"
        value={data.value || ''}
        onChange={(e) => onChange({ ...data, value: e.target.value })}
        placeholder="Step 1 input"
      />
    </div>
  );
  
  const Step2 = ({ data, onChange }: any) => (
    <div>
      <input
        data-testid="step2-input"
        value={data.value || ''}
        onChange={(e) => onChange({ ...data, value: e.target.value })}
        placeholder="Step 2 input"
      />
    </div>
  );
  
  const Step3 = ({ data, onChange }: any) => (
    <div>
      <input
        data-testid="step3-input"
        value={data.value || ''}
        onChange={(e) => onChange({ ...data, value: e.target.value })}
        placeholder="Step 3 input"
      />
    </div>
  );
  
  // Mock steps
  const mockSteps: FormWizardStep[] = [
    {
      id: 'step1',
      title: 'Step 1',
      description: 'First step',
      component: <Step1 />
    },
    {
      id: 'step2',
      title: 'Step 2',
      description: 'Second step',
      component: <Step2 />
    },
    {
      id: 'step3',
      title: 'Step 3',
      description: 'Third step',
      component: <Step3 />
    }
  ];
  
  // Mock validation functions
  const mockValidationRules = [
    {
      stepId: 'step1',
      validator: jest.fn().mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        canProceed: true
      })
    },
    {
      stepId: 'step2',
      validator: jest.fn().mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        canProceed: true
      })
    }
  ];
  
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  const mockEventHandlers = {
    onStepChange: jest.fn(),
    onStepComplete: jest.fn(),
    onWizardComplete: jest.fn(),
    onDataChange: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================
  
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      expect(screen.getByTestId('step1-input')).toBeInTheDocument();
    });
    
    test('renders with title and description', () => {
      render(
        <FormWizard 
          steps={mockSteps}
          onSubmit={mockOnSubmit}
          title="Test Wizard"
          description="Test wizard description"
        />
      );
      
      expect(screen.getByText('Test Wizard')).toBeInTheDocument();
      expect(screen.getByText('Test wizard description')).toBeInTheDocument();
    });
    
    test('renders step indicators', () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });
    
    test('renders progress bar', () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
    
    test('renders navigation buttons', () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.queryByText('Back')).not.toBeInTheDocument(); // Not shown on first step
    });
  });
  
  // ==========================================
  // VARIANT TESTS
  // ==========================================
  
  describe('Variants', () => {
    test('renders glass variant with correct classes', () => {
      const { container } = render(
        <FormWizard variant="glass" steps={mockSteps} onSubmit={mockOnSubmit} />
      );
      
      expect(container.querySelector('.form-wizard-container--glass')).toBeInTheDocument();
    });
    
    test('renders outlined variant with correct classes', () => {
      const { container } = render(
        <FormWizard variant="outlined" steps={mockSteps} onSubmit={mockOnSubmit} />
      );
      
      expect(container.querySelector('.form-wizard-container--outlined')).toBeInTheDocument();
    });
    
    test('renders filled variant with correct classes', () => {
      const { container } = render(
        <FormWizard variant="filled" steps={mockSteps} onSubmit={mockOnSubmit} />
      );
      
      expect(container.querySelector('.form-wizard-container--filled')).toBeInTheDocument();
    });
    
    test('renders minimal variant with correct classes', () => {
      const { container } = render(
        <FormWizard variant="minimal" steps={mockSteps} onSubmit={mockOnSubmit} />
      );
      
      expect(container.querySelector('.form-wizard-container--minimal')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // NAVIGATION TESTS
  // ==========================================
  
  describe('Navigation', () => {
    test('navigates to next step', async () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByTestId('step1-input')).toBeInTheDocument();
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('step2-input')).toBeInTheDocument();
      });
    });
    
    test('navigates to previous step', async () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      // Go to step 2
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('step2-input')).toBeInTheDocument();
      });
      
      // Go back to step 1
      const backButton = screen.getByText('Back');
      await user.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('step1-input')).toBeInTheDocument();
      });
    });
    
    test('shows submit button on last step', async () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument();
      });
    });
    
    test('handles step validation before navigation', async () => {
      const invalidValidation = {
        stepId: 'step1',
        validator: jest.fn().mockResolvedValue({
          isValid: false,
          errors: ['Step 1 is invalid'],
          warnings: [],
          canProceed: false
        })
      };
      
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          validationRules={[invalidValidation]}
          validateOnStepChange={true}
        />
      );
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(invalidValidation.validator).toHaveBeenCalled();
        expect(screen.getByTestId('step1-input')).toBeInTheDocument(); // Should stay on step 1
      });
    });
    
    test('allows non-linear navigation when enabled', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          navigation={{ allowNonLinearNavigation: true }}
        />
      );
      
      // Click on step 3 indicator
      const step3Indicator = screen.getByText('Step 3');
      await user.click(step3Indicator);
      
      await waitFor(() => {
        expect(screen.getByTestId('step3-input')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // VALIDATION TESTS
  // ==========================================
  
  describe('Validation', () => {
    test('validates step before proceeding', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          validationRules={mockValidationRules}
          validateOnStepChange={true}
        />
      );
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(mockValidationRules[0].validator).toHaveBeenCalled();
      });
    });
    
    test('prevents navigation when validation fails', async () => {
      const failingValidation = {
        stepId: 'step1',
        validator: jest.fn().mockResolvedValue({
          isValid: false,
          errors: ['Required field missing'],
          warnings: [],
          canProceed: false
        })
      };
      
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          validationRules={[failingValidation]}
          validateOnStepChange={true}
        />
      );
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(failingValidation.validator).toHaveBeenCalled();
        expect(screen.getByTestId('step1-input')).toBeInTheDocument();
      });
    });
    
    test('validates all steps before submission', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          validationRules={mockValidationRules}
        />
      );
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      // Submit
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockValidationRules[0].validator).toHaveBeenCalled();
        expect(mockValidationRules[1].validator).toHaveBeenCalled();
      });
    });
    
    test('shows validation errors', async () => {
      const errorValidation = {
        stepId: 'step1',
        validator: jest.fn().mockResolvedValue({
          isValid: false,
          errors: ['Test error message'],
          warnings: [],
          canProceed: false
        })
      };
      
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          validationRules={[errorValidation]}
          validateOnStepChange={true}
          customization={{ showValidationSummary: true }}
        />
      );
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please fix the following issues:')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // DATA PERSISTENCE TESTS
  // ==========================================
  
  describe('Data Persistence', () => {
    test('saves data to localStorage when enabled', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          persistence={{ enabled: true, storageKey: 'test-wizard' }}
        />
      );
      
      const input = screen.getByTestId('step1-input');
      await user.type(input, 'test value');
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'test-wizard',
          expect.stringContaining('test value')
        );
      });
    });
    
    test('loads data from localStorage on mount', () => {
      const savedData = JSON.stringify({
        currentStepIndex: 1,
        stepData: {
          step1: { value: 'saved value' }
        },
        completedSteps: ['step1'],
        stepsWithErrors: [],
        stepsWithWarnings: [],
        version: '1.0'
      });
      
      mockLocalStorage.getItem.mockReturnValue(savedData);
      
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          persistence={{ enabled: true, storageKey: 'test-wizard' }}
        />
      );
      
      expect(screen.getByTestId('step2-input')).toBeInTheDocument();
    });
    
    test('clears data from localStorage when configured', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          persistence={{ 
            enabled: true, 
            storageKey: 'test-wizard',
            clearOnComplete: true 
          }}
        );
      
      // Navigate to last step and submit
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-wizard');
      });
    });
  });
  
  // ==========================================
  // SUBMISSION TESTS
  // ==========================================
  
  describe('Submission', () => {
    test('calls onSubmit when wizard is completed', async () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      // Submit
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
    
    test('shows loading state during submission', async () => {
      const slowSubmit = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<FormWizard steps={mockSteps} onSubmit={slowSubmit} />);
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      // Submit
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);
      
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
    
    test('shows completion message after successful submission', async () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      // Submit
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Wizard Completed Successfully!')).toBeInTheDocument();
      });
    });
    
    test('handles submission errors', async () => {
      const failingSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
      
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={failingSubmit}
          eventHandlers={mockEventHandlers}
        />
      );
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      // Submit
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockEventHandlers.onStepChange).toHaveBeenCalled();
      });
    });
  });
  
  // ==========================================
  // EVENT HANDLER TESTS
  // ==========================================
  
  describe('Event Handlers', () => {
    test('calls onStepChange when step changes', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          eventHandlers={mockEventHandlers}
        />
      );
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(mockEventHandlers.onStepChange).toHaveBeenCalledWith('step2', 'next');
      });
    });
    
    test('calls onDataChange when step data changes', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          eventHandlers={mockEventHandlers}
        />
      );
      
      const input = screen.getByTestId('step1-input');
      await user.type(input, 'test');
      
      await waitFor(() => {
        expect(mockEventHandlers.onDataChange).toHaveBeenCalled();
      });
    });
    
    test('calls onWizardComplete when wizard is completed', async () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          eventHandlers={mockEventHandlers}
        />
      );
      
      // Navigate to last step and submit
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      await user.click(nextButton);
      
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockEventHandlers.onWizardComplete).toHaveBeenCalled();
      });
    });
  });
  
  // ==========================================
  // IMPERATIVE API TESTS
  // ==========================================
  
  describe('Imperative API', () => {
    test('provides imperative handle methods', () => {
      const ref = React.createRef<FormWizardRef>();
      
      render(
        <FormWizard 
          ref={ref}
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(ref.current).toMatchObject({
        goToStep: expect.any(Function),
        goNext: expect.any(Function),
        goBack: expect.any(Function),
        submit: expect.any(Function),
        cancel: expect.any(Function),
        reset: expect.any(Function),
        saveProgress: expect.any(Function),
        loadProgress: expect.any(Function),
        clearProgress: expect.any(Function),
        validateCurrentStep: expect.any(Function),
        validateAllSteps: expect.any(Function),
        getState: expect.any(Function),
        getProgress: expect.any(Function),
        getCurrentData: expect.any(Function),
        getStepData: expect.any(Function),
        setStepData: expect.any(Function),
        isStepCompleted: expect.any(Function),
        isStepValid: expect.any(Function),
        focus: expect.any(Function),
        blur: expect.any(Function)
      });
    });
    
    test('goToStep method changes current step', () => {
      const ref = React.createRef<FormWizardRef>();
      
      render(
        <FormWizard 
          ref={ref}
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
        />
      );
      
      act(() => {
        ref.current?.goToStep('step2');
      });
      
      expect(screen.getByTestId('step2-input')).toBeInTheDocument();
    });
    
    test('getState method returns current wizard state', () => {
      const ref = React.createRef<FormWizardRef>();
      
      render(
        <FormWizard 
          ref={ref}
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
        />
      );
      
      const state = ref.current?.getState();
      expect(state).toMatchObject({
        currentStepIndex: 0,
        currentStepId: 'step1',
        completedSteps: [],
        stepsWithErrors: [],
        stepsWithWarnings: [],
        isValidating: false,
        isSubmitting: false,
        isCompleted: false,
        totalSteps: 3
      });
    });
    
    test('reset method resets wizard state', async () => {
      const ref = React.createRef<FormWizardRef>();
      
      render(
        <FormWizard 
          ref={ref}
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
        />
      );
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      // Reset
      act(() => {
        ref.current?.reset();
      });
      
      expect(screen.getByTestId('step1-input')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          title="Test Wizard"
          description="Test description"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('has proper ARIA attributes', () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          ariaLabel="Test wizard"
          ariaDescribedBy="wizard-description"
        />
      );
      
      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Test wizard');
      expect(container).toHaveAttribute('aria-describedby', 'wizard-description');
    });
    
    test('step indicators have proper roles', () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      const stepIndicators = screen.getAllByText(/Step \d/);
      stepIndicators.forEach(indicator => {
        expect(indicator).toBeInTheDocument();
      });
    });
    
    test('navigation buttons have proper labels', () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toHaveAttribute('type', 'button');
    });
    
    test('supports keyboard navigation', async () => {
      render(<FormWizard steps={mockSteps} onSubmit={mockOnSubmit} />);
      
      const nextButton = screen.getByText('Next');
      
      // Focus and activate with keyboard
      nextButton.focus();
      await user.keyboard('[Enter]');
      
      await waitFor(() => {
        expect(screen.getByTestId('step2-input')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // CUSTOMIZATION TESTS
  // ==========================================
  
  describe('Customization', () => {
    test('applies custom layout', () => {
      const { container } = render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          customization={{ layout: 'compact' }}
        />
      );
      
      expect(container.querySelector('.form-wizard-container--compact')).toBeInTheDocument();
    });
    
    test('hides step titles when configured', () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          navigation={{ showStepTitles: false }}
        />
      );
      
      expect(screen.queryByText('First step')).not.toBeInTheDocument();
    });
    
    test('hides progress when configured', () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          navigation={{ showProgress: false }}
        />
      );
      
      expect(screen.queryByText('Step 1 of 3')).not.toBeInTheDocument();
    });
    
    test('uses custom submit text', () => {
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          submitText="Complete"
        />
      );
      
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // EDGE CASES
  // ==========================================
  
  describe('Edge Cases', () => {
    test('handles empty steps array', () => {
      render(<FormWizard steps={[]} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText('No steps configured')).toBeInTheDocument();
    });
    
    test('handles missing onSubmit gracefully', () => {
      expect(() => {
        render(<FormWizard steps={mockSteps} />);
      }).not.toThrow();
    });
    
    test('handles validation errors gracefully', async () => {
      const errorValidation = {
        stepId: 'step1',
        validator: jest.fn().mockRejectedValue(new Error('Validation error'))
      };
      
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          validationRules={[errorValidation]}
          validateOnStepChange={true}
        />
      );
      
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('step1-input')).toBeInTheDocument();
      });
    });
    
    test('handles localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => {
        render(
          <FormWizard 
            steps={mockSteps} 
            onSubmit={mockOnSubmit}
            persistence={{ enabled: true, storageKey: 'test-wizard' }}
          />
        );
      }).not.toThrow();
    });
    
    test('handles version mismatch in stored data', () => {
      const savedData = JSON.stringify({
        currentStepIndex: 1,
        stepData: {},
        completedSteps: [],
        stepsWithErrors: [],
        stepsWithWarnings: [],
        version: '0.1' // Old version
      });
      
      mockLocalStorage.getItem.mockReturnValue(savedData);
      
      render(
        <FormWizard 
          steps={mockSteps} 
          onSubmit={mockOnSubmit}
          persistence={{ enabled: true, storageKey: 'test-wizard', version: '1.0' }}
        />
      );
      
      // Should start from step 1 (default) due to version mismatch
      expect(screen.getByTestId('step1-input')).toBeInTheDocument();
    });
  });
}); 