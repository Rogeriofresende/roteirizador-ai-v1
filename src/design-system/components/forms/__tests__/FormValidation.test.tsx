import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FormValidation, FormValidationRef, FormValidationSchema } from '../FormValidation';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ==========================================
// 🟡 IA CHARLIE - QUALITY EXCELLENCE TESTS
// ==========================================

describe('FormValidation V7.5 Enhanced', () => {
  const user = userEvent.setup();
  
  // Sample test schemas
  const simpleSchema: FormValidationSchema = {
    fields: {
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email address' }
      ],
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
      ]
    },
    validateOn: ['change', 'blur', 'submit'],
    debounceMs: 100
  };
  
  const crossFieldSchema: FormValidationSchema = {
    fields: {
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
      ],
      confirmPassword: [
        { type: 'required', message: 'Please confirm your password' }
      ]
    },
    crossFieldRules: [
      {
        type: 'crossField',
        field: 'confirmPassword',
        dependsOn: ['password'],
        message: 'Passwords do not match',
        validator: (value, formData) => {
          return value === formData?.password;
        }
      }
    ],
    validateOn: ['change', 'blur'],
    debounceMs: 100
  };
  
  const asyncSchema: FormValidationSchema = {
    fields: {
      username: [
        { type: 'required', message: 'Username is required' },
        {
          type: 'custom',
          async: true,
          message: 'Username is already taken',
          validator: async (value) => {
            if (!value) return true;
            await new Promise(resolve => setTimeout(resolve, 100));
            return value !== 'taken';
          }
        }
      ]
    },
    validateOn: ['blur'],
    debounceMs: 50
  };
  
  // Mock form children component
  const MockFormFields = ({ onFieldChange }: { onFieldChange?: (field: string, value: string) => void }) => (
    <>
      <input
        data-testid="email-input"
        name="email"
        type="email"
        onChange={(e) => onFieldChange?.('email', e.target.value)}
      />
      <input
        data-testid="password-input"
        name="password"
        type="password"
        onChange={(e) => onFieldChange?.('password', e.target.value)}
      />
      <input
        data-testid="confirm-password-input"
        name="confirmPassword"
        type="password"
        onChange={(e) => onFieldChange?.('confirmPassword', e.target.value)}
      />
      <input
        data-testid="username-input"
        name="username"
        type="text"
        onChange={(e) => onFieldChange?.('username', e.target.value)}
      />
      <button type="submit" data-testid="submit-button">Submit</button>
    </>
  );
  
  // ==========================================
  // BASIC RENDERING TESTS
  // ==========================================
  
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(
        <FormValidation schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
    
    test('renders with title and description', () => {
      render(
        <FormValidation 
          schema={simpleSchema}
          title="Test Form"
          description="This is a test form"
        >
          <MockFormFields />
        </FormValidation>
      );
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.getByText('This is a test form')).toBeInTheDocument();
    });
    
    test('renders form with proper attributes', () => {
      render(
        <FormValidation 
          schema={simpleSchema}
          name="test-form"
          method="POST"
          action="/submit"
          id="validation-form"
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('name', 'test-form');
      expect(form).toHaveAttribute('method', 'POST');
      expect(form).toHaveAttribute('action', '/submit');
      expect(form).toHaveAttribute('novalidate');
    });
    
    test('renders children correctly', () => {
      render(
        <FormValidation schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // VARIANT TESTS
  // ==========================================
  
  describe('Variants', () => {
    test('renders glass variant with correct classes', () => {
      const { container } = render(
        <FormValidation variant="glass" schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      expect(container.querySelector('.form-validation-container--glass')).toBeInTheDocument();
    });
    
    test('renders outlined variant with correct classes', () => {
      const { container } = render(
        <FormValidation variant="outlined" schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      expect(container.querySelector('.form-validation-container--outlined')).toBeInTheDocument();
    });
    
    test('renders filled variant with correct classes', () => {
      const { container } = render(
        <FormValidation variant="filled" schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      expect(container.querySelector('.form-validation-container--filled')).toBeInTheDocument();
    });
    
    test('renders minimal variant with correct classes', () => {
      const { container } = render(
        <FormValidation variant="minimal" schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      expect(container.querySelector('.form-validation-container--minimal')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SIZE TESTS
  // ==========================================
  
  describe('Sizes', () => {
    test('renders small size with correct classes', () => {
      const { container } = render(
        <FormValidation size="sm" schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      expect(container.querySelector('.form-validation-container--sm')).toBeInTheDocument();
    });
    
    test('renders large size with correct classes', () => {
      const { container } = render(
        <FormValidation size="lg" schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      expect(container.querySelector('.form-validation-container--lg')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // SCHEMA VALIDATION TESTS
  // ==========================================
  
  describe('Schema Validation', () => {
    test('validates schema structure', () => {
      const invalidSchema = {} as FormValidationSchema;
      
      render(
        <FormValidation schema={invalidSchema}>
          <MockFormFields />
        </FormValidation>
      );
      
      // Component should still render but may show validation errors
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
    
    test('handles missing schema gracefully', () => {
      render(
        <FormValidation>
          <MockFormFields />
        </FormValidation>
      );
      
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
    
    test('validates field rules structure', () => {
      const schemaWithInvalidRules: FormValidationSchema = {
        fields: {
          email: [
            // @ts-ignore - Testing invalid rule structure
            { type: 'required' } // Missing message
          ]
        }
      };
      
      render(
        <FormValidation schema={schemaWithInvalidRules}>
          <MockFormFields />
        </FormValidation>
      );
      
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
  
  // ==========================================
  // FIELD VALIDATION TESTS
  // ==========================================
  
  describe('Field Validation', () => {
    test('validates required fields', async () => {
      const mockOnValidationComplete = jest.fn();
      
      render(
        <FormValidation 
          schema={simpleSchema}
          eventHandlers={{ onValidationComplete: mockOnValidationComplete }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnValidationComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
            hasErrors: true
          })
        );
      });
    });
    
    test('validates email format', async () => {
      const mockOnFieldValidated = jest.fn();
      let formData = { email: '', password: '' };
      
      render(
        <FormValidation 
          schema={simpleSchema}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields 
            onFieldChange={(field, value) => {
              formData = { ...formData, [field]: value };
            }}
          />
        </FormValidation>
      );
      
      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur validation
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'email',
            isValid: false,
            errors: expect.arrayContaining(['Please enter a valid email address'])
          })
        );
      }, { timeout: 2000 });
    });
    
    test('validates minimum length', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={simpleSchema}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const passwordInput = screen.getByTestId('password-input');
      
      await user.type(passwordInput, '123');
      await user.tab(); // Trigger blur validation
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'password',
            isValid: false,
            errors: expect.arrayContaining(['Password must be at least 8 characters'])
          })
        );
      }, { timeout: 2000 });
    });
    
    test('validates valid input', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={simpleSchema}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'test@example.com');
      await user.tab(); // Trigger blur validation
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'email',
            isValid: true,
            errors: []
          })
        );
      }, { timeout: 2000 });
    });
  });
  
  // ==========================================
  // CROSS-FIELD VALIDATION TESTS
  // ==========================================
  
  describe('Cross-Field Validation', () => {
    test('validates password confirmation', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={crossFieldSchema}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');
      await user.tab(); // Trigger blur validation
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'confirmPassword',
            isValid: false,
            errors: expect.arrayContaining(['Passwords do not match'])
          })
        );
      }, { timeout: 2000 });
    });
    
    test('validates matching passwords', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={crossFieldSchema}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.tab(); // Trigger blur validation
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'confirmPassword',
            isValid: true,
            errors: []
          })
        );
      }, { timeout: 2000 });
    });
  });
  
  // ==========================================
  // ASYNC VALIDATION TESTS
  // ==========================================
  
  describe('Async Validation', () => {
    test('handles async validation with loading state', async () => {
      const mockOnValidationStart = jest.fn();
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={asyncSchema}
          eventHandlers={{ 
            onValidationStart: mockOnValidationStart,
            onFieldValidated: mockOnFieldValidated 
          }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const usernameInput = screen.getByTestId('username-input');
      
      await user.type(usernameInput, 'taken');
      await user.tab(); // Trigger blur validation
      
      // Should show validation start
      expect(mockOnValidationStart).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'username',
            isValid: false,
            errors: expect.arrayContaining(['Username is already taken'])
          })
        );
      }, { timeout: 3000 });
    });
    
    test('handles successful async validation', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={asyncSchema}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const usernameInput = screen.getByTestId('username-input');
      
      await user.type(usernameInput, 'available');
      await user.tab(); // Trigger blur validation
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'username',
            isValid: true,
            errors: []
          })
        );
      }, { timeout: 3000 });
    });
  });
  
  // ==========================================
  // VALIDATION TIMING TESTS
  // ==========================================
  
  describe('Validation Timing', () => {
    test('validates on change when configured', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={simpleSchema}
          timing={{ validateOnChange: true, debounceMs: 50 }}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'test@example.com');
      
      // Should validate after debounce delay
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
    
    test('validates on blur when configured', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={simpleSchema}
          timing={{ validateOnChange: false, validateOnBlur: true }}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'test@example.com');
      
      // Should not validate yet
      expect(mockOnFieldValidated).not.toHaveBeenCalled();
      
      await user.tab(); // Trigger blur
      
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalled();
      });
    });
    
    test('validates on submit when configured', async () => {
      const mockOnValidationComplete = jest.fn();
      
      render(
        <FormValidation 
          schema={simpleSchema}
          timing={{ validateOnChange: false, validateOnBlur: false, validateOnSubmit: true }}
          eventHandlers={{ onValidationComplete: mockOnValidationComplete }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');
      
      await user.type(emailInput, 'test@example.com');
      await user.tab(); // Should not trigger validation
      
      expect(mockOnValidationComplete).not.toHaveBeenCalled();
      
      await user.click(submitButton); // Should trigger validation
      
      await waitFor(() => {
        expect(mockOnValidationComplete).toHaveBeenCalled();
      });
    });
  });
  
  // ==========================================
  // ERROR DISPLAY TESTS
  // ==========================================
  
  describe('Error Display', () => {
    test('displays errors in summary mode', async () => {
      render(
        <FormValidation 
          schema={simpleSchema}
          errorDisplay={{ mode: 'summary', showErrorCount: true }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
    
    test('displays errors inline when configured', async () => {
      render(
        <FormValidation 
          schema={simpleSchema}
          errorDisplay={{ mode: 'inline', groupByField: true }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        // Should show field-level errors
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
    
    test('displays errors in both modes', async () => {
      render(
        <FormValidation 
          schema={simpleSchema}
          errorDisplay={{ mode: 'both', groupByField: true, showErrorCount: true }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================
  // REF INTERFACE TESTS
  // ==========================================
  
  describe('Ref Interface', () => {
    test('provides imperative handle methods', () => {
      const ref = React.createRef<FormValidationRef>();
      
      render(
        <FormValidation schema={simpleSchema} ref={ref}>
          <MockFormFields />
        </FormValidation>
      );
      
      expect(ref.current).toMatchObject({
        validate: expect.any(Function),
        validateField: expect.any(Function),
        getValidationState: expect.any(Function),
        getFieldValue: expect.any(Function),
        setFieldValue: expect.any(Function),
        getFormData: expect.any(Function),
        setFormData: expect.any(Function),
        clearValidation: expect.any(Function),
        reset: expect.any(Function),
        submit: expect.any(Function),
        getMetrics: expect.any(Function),
        addValidationRule: expect.any(Function),
        removeValidationRule: expect.any(Function),
        updateSchema: expect.any(Function)
      });
    });
    
    test('getValidationState returns current state', () => {
      const ref = React.createRef<FormValidationRef>();
      
      render(
        <FormValidation schema={simpleSchema} ref={ref}>
          <MockFormFields />
        </FormValidation>
      );
      
      const state = ref.current?.getValidationState();
      expect(state).toMatchObject({
        isValid: expect.any(Boolean),
        isPending: expect.any(Boolean),
        hasErrors: expect.any(Boolean),
        hasWarnings: expect.any(Boolean),
        fields: expect.any(Object),
        errors: expect.any(Array),
        warnings: expect.any(Array),
        validationCount: expect.any(Number)
      });
    });
    
    test('validate method validates form', async () => {
      const ref = React.createRef<FormValidationRef>();
      
      render(
        <FormValidation schema={simpleSchema} ref={ref}>
          <MockFormFields />
        </FormValidation>
      );
      
      const result = await ref.current?.validate();
      expect(result).toMatchObject({
        isValid: expect.any(Boolean),
        hasErrors: expect.any(Boolean)
      });
    });
    
    test('validateField method validates specific field', async () => {
      const ref = React.createRef<FormValidationRef>();
      
      render(
        <FormValidation schema={simpleSchema} ref={ref}>
          <MockFormFields />
        </FormValidation>
      );
      
      const result = await ref.current?.validateField('email');
      expect(result).toMatchObject({
        field: 'email',
        isValid: expect.any(Boolean),
        errors: expect.any(Array)
      });
    });
    
    test('reset method clears validation state', () => {
      const ref = React.createRef<FormValidationRef>();
      
      render(
        <FormValidation schema={simpleSchema} ref={ref}>
          <MockFormFields />
        </FormValidation>
      );
      
      ref.current?.reset();
      
      const state = ref.current?.getValidationState();
      expect(state?.validationCount).toBe(0);
      expect(state?.errors).toEqual([]);
    });
  });
  
  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  
  describe('Accessibility', () => {
    test('has no accessibility violations', async () => {
      const { container } = render(
        <FormValidation
          schema={simpleSchema}
          title="Accessible Form"
          description="Form with proper accessibility"
          ariaLabel="Test form"
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    test('creates proper form structure', () => {
      render(
        <FormValidation schema={simpleSchema} ariaLabel="Test form">
          <MockFormFields />
        </FormValidation>
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Test form');
      expect(form).toHaveAttribute('novalidate');
    });
    
    test('error messages have alert role', async () => {
      render(
        <FormValidation schema={simpleSchema}>
          <MockFormFields />
        </FormValidation>
      );
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });
    
    test('supports aria-describedby', () => {
      render(
        <FormValidation schema={simpleSchema} ariaDescribedBy="helper-text">
          <MockFormFields />
        </FormValidation>
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-describedby', 'helper-text');
    });
  });
  
  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================
  
  describe('Performance', () => {
    test('handles large schemas efficiently', () => {
      const largeSchema: FormValidationSchema = {
        fields: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [
            `field${i}`,
            [{ type: 'required', message: `Field ${i} is required` }]
          ])
        )
      };
      
      const startTime = performance.now();
      
      render(
        <FormValidation schema={largeSchema}>
          <MockFormFields />
        </FormValidation>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large schemas in reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });
    
    test('debounces validation calls', async () => {
      const mockOnFieldValidated = jest.fn();
      
      render(
        <FormValidation 
          schema={simpleSchema}
          timing={{ validateOnChange: true, debounceMs: 100 }}
          eventHandlers={{ onFieldValidated: mockOnFieldValidated }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const emailInput = screen.getByTestId('email-input');
      
      // Type multiple characters quickly
      await user.type(emailInput, 'test');
      
      // Should only validate once after debounce
      await waitFor(() => {
        expect(mockOnFieldValidated).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });
  
  // ==========================================
  // INTEGRATION TESTS
  // ==========================================
  
  describe('Integration', () => {
    test('works with form submission', async () => {
      const mockSubmit = jest.fn();
      
      const TestForm = () => {
        const [isValid, setIsValid] = React.useState(false);
        
        return (
          <form onSubmit={(e) => { e.preventDefault(); if (isValid) mockSubmit(); }}>
            <FormValidation
              schema={simpleSchema}
              eventHandlers={{
                onValidationComplete: (state) => setIsValid(state.isValid)
              }}
            >
              <input data-testid="email-input" name="email" type="email" defaultValue="test@example.com" />
              <input data-testid="password-input" name="password" type="password" defaultValue="password123" />
              <button type="submit" data-testid="submit-button">Submit</button>
            </FormValidation>
          </form>
        );
      };
      
      render(<TestForm />);
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
    
    test('integrates with external state management', async () => {
      const externalValidator = jest.fn((state) => {
        return state.isValid;
      });
      
      const TestComponent = () => {
        const [validationState, setValidationState] = React.useState(null);
        
        React.useEffect(() => {
          if (validationState) {
            externalValidator(validationState);
          }
        }, [validationState]);
        
        return (
          <FormValidation
            schema={simpleSchema}
            eventHandlers={{
              onValidationComplete: setValidationState
            }}
          >
            <MockFormFields />
          </FormValidation>
        );
      };
      
      render(<TestComponent />);
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(externalValidator).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: expect.any(Boolean)
          })
        );
      });
    });
  });
  
  // ==========================================
  // EDGE CASES AND ERROR HANDLING
  // ==========================================
  
  describe('Edge Cases', () => {
    test('handles missing validation rules gracefully', () => {
      const schemaWithoutRules: FormValidationSchema = {
        fields: {}
      };
      
      render(
        <FormValidation schema={schemaWithoutRules}>
          <MockFormFields />
        </FormValidation>
      );
      
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
    
    test('handles validation errors gracefully', async () => {
      const schemaWithBadValidator: FormValidationSchema = {
        fields: {
          email: [
            {
              type: 'custom',
              message: 'Validation error',
              validator: () => {
                throw new Error('Validator failed');
              }
            }
          ]
        }
      };
      
      const mockOnValidationError = jest.fn();
      
      render(
        <FormValidation 
          schema={schemaWithBadValidator}
          eventHandlers={{ onValidationError: mockOnValidationError }}
        >
          <MockFormFields />
        </FormValidation>
      );
      
      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnValidationError).toHaveBeenCalled();
      });
    });
    
    test('handles disabled state correctly', () => {
      render(
        <FormValidation schema={simpleSchema} disabled={true}>
          <MockFormFields />
        </FormValidation>
      );
      
      const form = screen.getByRole('form');
      expect(form.closest('.form-validation-container')).toHaveClass('form-validation-container--disabled');
    });
    
    test('handles readonly state correctly', () => {
      render(
        <FormValidation schema={simpleSchema} readOnly={true}>
          <MockFormFields />
        </FormValidation>
      );
      
      const form = screen.getByRole('form');
      expect(form.closest('.form-validation-container')).toHaveClass('form-validation-container--readonly');
    });
  });
}); 