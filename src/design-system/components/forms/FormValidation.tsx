import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  forwardRef,
  useImperativeHandle,
  ReactNode,
  FormEvent,
  ChangeEvent
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FormValidation.css';

// ==========================================
// 🔴 IA ALPHA - ADVANCED TYPESCRIPT INTERFACES
// ==========================================

/**
 * V7.5 Enhanced Form Field Reference
 */
export interface FormFieldRef {
  name: string;
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  validate: () => Promise<FormFieldValidationResult>;
  getValue: () => any;
  setValue: (value: any) => void;
  focus: () => void;
  blur: () => void;
}

/**
 * V7.5 Enhanced Validation Rule Definition
 */
export interface FormValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom' | 'crossField';
  field?: string;
  dependsOn?: string[];
  value?: any;
  message: string;
  validator?: (value: any, formData?: Record<string, any>) => boolean | Promise<boolean>;
  async?: boolean;
  debounce?: number;
}

/**
 * V7.5 Enhanced Field Validation Result
 */
export interface FormFieldValidationResult {
  field: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isPending: boolean;
  lastValidated: Date;
}

/**
 * V7.5 Enhanced Form Validation State
 */
export interface FormValidationState {
  isValid: boolean;
  isPending: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  fields: Record<string, FormFieldValidationResult>;
  errors: string[];
  warnings: string[];
  lastValidated: Date | null;
  validationCount: number;
}

/**
 * V7.5 Enhanced Validation Schema
 */
export interface FormValidationSchema {
  fields: Record<string, FormValidationRule[]>;
  crossFieldRules?: FormValidationRule[];
  globalRules?: FormValidationRule[];
  validateOn?: ('change' | 'blur' | 'submit')[];
  debounceMs?: number;
  async?: boolean;
}

/**
 * V7.5 Enhanced Validation Timing Configuration
 */
export interface FormValidationTiming {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  debounceMs?: number;
  asyncTimeout?: number;
  batchValidation?: boolean;
}

/**
 * V7.5 Enhanced Error Display Configuration
 */
export interface FormValidationErrorDisplay {
  mode?: 'inline' | 'summary' | 'both';
  groupByField?: boolean;
  showErrorCount?: boolean;
  showWarningCount?: boolean;
  maxErrors?: number;
  collapsible?: boolean;
  position?: 'top' | 'bottom' | 'floating';
}

/**
 * V7.5 Enhanced Validation Performance Metrics
 */
export interface FormValidationMetrics {
  totalValidations: number;
  averageValidationTime: number;
  slowestValidation: number;
  failedValidations: number;
  asyncValidations: number;
  cacheHits: number;
}

/**
 * V7.5 Enhanced Event Handlers
 */
export interface FormValidationEventHandlers {
  onValidationStart?: (field?: string) => void;
  onValidationComplete?: (result: FormValidationState) => void;
  onValidationError?: (error: Error, field?: string) => void;
  onFieldValidated?: (result: FormFieldValidationResult) => void;
  onSchemaChange?: (schema: FormValidationSchema) => void;
  onStateChange?: (state: FormValidationState) => void;
}

/**
 * V7.5 Enhanced Animation Configuration
 */
export interface FormValidationAnimation {
  preset?: 'smooth' | 'bounce' | 'slide' | 'fade';
  duration?: number;
  stagger?: number;
  enabled?: boolean;
}

/**
 * V7.5 Enhanced Main FormValidation Props Interface
 */
export interface FormValidationProps {
  // V7.5 Core Design System Integration
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
  // Glass-morphism Effects
  glassEffect?: 'subtle' | 'medium' | 'strong';
  
  // Enhanced Validation System
  validationState?: 'neutral' | 'validating' | 'success' | 'warning' | 'error';
  
  // Core Validation Properties
  schema?: FormValidationSchema;
  initialValues?: Record<string, any>;
  disabled?: boolean;
  readOnly?: boolean;
  
  // Form Configuration
  name?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  action?: string;
  
  // Professional Features
  title?: string;
  description?: string;
  
  // Advanced Features
  timing?: FormValidationTiming;
  errorDisplay?: FormValidationErrorDisplay;
  
  // Performance Configuration
  enableCache?: boolean;
  maxCacheSize?: number;
  enableMetrics?: boolean;
  
  // Custom Rendering
  customErrorRenderer?: (errors: string[], field?: string) => ReactNode;
  customSuccessRenderer?: (message: string) => ReactNode;
  customLoadingRenderer?: () => ReactNode;
  
  // Performance & Accessibility
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  
  // Animation System
  animation?: FormValidationAnimation;
  
  // V7.5 Enhanced Event Handlers
  eventHandlers?: FormValidationEventHandlers;
  
  // Form Children
  children?: ReactNode;
  
  // Additional Props
  className?: string;
}

/**
 * V7.5 Enhanced Ref Interface
 */
export interface FormValidationRef {
  validate: (fields?: string[]) => Promise<FormValidationState>;
  validateField: (field: string) => Promise<FormFieldValidationResult>;
  getValidationState: () => FormValidationState;
  getFieldValue: (field: string) => any;
  setFieldValue: (field: string, value: any) => void;
  getFormData: () => Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  clearValidation: (field?: string) => void;
  reset: () => void;
  submit: () => Promise<FormValidationState>;
  getMetrics: () => FormValidationMetrics;
  addValidationRule: (field: string, rule: FormValidationRule) => void;
  removeValidationRule: (field: string, ruleType: string) => void;
  updateSchema: (schema: Partial<FormValidationSchema>) => void;
}

// ==========================================
// 🔴 IA ALPHA - PERFORMANCE HOOKS
// ==========================================

/**
 * Form validation state management hook
 */
function useFormValidationState(
  schema: FormValidationSchema | undefined,
  initialValues: Record<string, any> = {},
  timing: FormValidationTiming = {}
) {
  const [validationState, setValidationState] = useState<FormValidationState>(() => ({
    isValid: true,
    isPending: false,
    hasErrors: false,
    hasWarnings: false,
    fields: {},
    errors: [],
    warnings: [],
    lastValidated: null,
    validationCount: 0
  }));
  
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const validationCache = useRef<Map<string, FormFieldValidationResult>>(new Map());
  const metricsRef = useRef<FormValidationMetrics>({
    totalValidations: 0,
    averageValidationTime: 0,
    slowestValidation: 0,
    failedValidations: 0,
    asyncValidations: 0,
    cacheHits: 0
  });
  
  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  const clearValidationForField = useCallback((field: string) => {
    setValidationState(prev => {
      const newFields = { ...prev.fields };
      delete newFields[field];
      
      return {
        ...prev,
        fields: newFields,
        hasErrors: Object.values(newFields).some(f => !f.isValid),
        hasWarnings: Object.values(newFields).some(f => f.warnings.length > 0),
        isValid: Object.values(newFields).every(f => f.isValid)
      };
    });
    
    validationCache.current.delete(field);
  }, []);
  
  const updateValidationResult = useCallback((result: FormFieldValidationResult) => {
    setValidationState(prev => {
      const newFields = {
        ...prev.fields,
        [result.field]: result
      };
      
      const hasErrors = Object.values(newFields).some(f => !f.isValid);
      const hasWarnings = Object.values(newFields).some(f => f.warnings.length > 0);
      const isValid = Object.values(newFields).every(f => f.isValid);
      const isPending = Object.values(newFields).some(f => f.isPending);
      
      return {
        ...prev,
        fields: newFields,
        hasErrors,
        hasWarnings,
        isValid: isValid && !hasErrors,
        isPending,
        lastValidated: new Date(),
        validationCount: prev.validationCount + 1
      };
    });
    
    // Update cache
    if (!result.isPending && result.isValid) {
      validationCache.current.set(result.field, result);
    }
  }, []);
  
  const reset = useCallback(() => {
    setValidationState({
      isValid: true,
      isPending: false,
      hasErrors: false,
      hasWarnings: false,
      fields: {},
      errors: [],
      warnings: [],
      lastValidated: null,
      validationCount: 0
    });
    setFormData(initialValues);
    validationCache.current.clear();
  }, [initialValues]);
  
  return {
    validationState,
    formData,
    updateField,
    clearValidationForField,
    updateValidationResult,
    reset,
    metrics: metricsRef.current
  };
}

/**
 * Field validation execution hook
 */
function useFieldValidation(
  schema: FormValidationSchema | undefined,
  formData: Record<string, any>,
  timing: FormValidationTiming = {}
) {
  const [pendingValidations, setPendingValidations] = useState<Set<string>>(new Set());
  
  const validateSingleRule = useCallback(async (
    rule: FormValidationRule,
    value: any,
    formData: Record<string, any>
  ): Promise<{ isValid: boolean; message?: string }> => {
    try {
      switch (rule.type) {
        case 'required':
          const isValid = value !== null && value !== undefined && value !== '';
          return { isValid, message: isValid ? undefined : rule.message };
          
        case 'minLength':
          const minValid = !value || String(value).length >= (rule.value || 0);
          return { isValid: minValid, message: minValid ? undefined : rule.message };
          
        case 'maxLength':
          const maxValid = !value || String(value).length <= (rule.value || Infinity);
          return { isValid: maxValid, message: maxValid ? undefined : rule.message };
          
        case 'pattern':
          const patternValid = !value || (rule.value as RegExp).test(String(value));
          return { isValid: patternValid, message: patternValid ? undefined : rule.message };
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const emailValid = !value || emailRegex.test(String(value));
          return { isValid: emailValid, message: emailValid ? undefined : rule.message };
          
        case 'custom':
          if (rule.validator) {
            const customValid = await rule.validator(value, formData);
            return { isValid: customValid, message: customValid ? undefined : rule.message };
          }
          return { isValid: true };
          
        case 'crossField':
          if (rule.validator && rule.dependsOn) {
            const dependentValues = rule.dependsOn.reduce((acc, dep) => {
              acc[dep] = formData[dep];
              return acc;
            }, {} as Record<string, any>);
            
            const crossValid = await rule.validator(value, { ...formData, ...dependentValues });
            return { isValid: crossValid, message: crossValid ? undefined : rule.message };
          }
          return { isValid: true };
          
        default:
          return { isValid: true };
      }
    } catch (error) {
      console.error('Validation rule error:', error);
      return { isValid: false, message: 'Validation error occurred' };
    }
  }, []);
  
  const validateField = useCallback(async (field: string): Promise<FormFieldValidationResult> => {
    const startTime = performance.now();
    
    setPendingValidations(prev => new Set(prev).add(field));
    
    try {
      const fieldRules = schema?.fields[field] || [];
      const value = formData[field];
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Validate each rule for the field
      for (const rule of fieldRules) {
        const result = await validateSingleRule(rule, value, formData);
        if (!result.isValid && result.message) {
          errors.push(result.message);
        }
      }
      
      // Cross-field validation
      if (schema?.crossFieldRules) {
        for (const rule of schema.crossFieldRules) {
          if (rule.field === field || rule.dependsOn?.includes(field)) {
            const result = await validateSingleRule(rule, value, formData);
            if (!result.isValid && result.message) {
              errors.push(result.message);
            }
          }
        }
      }
      
      const validationResult: FormFieldValidationResult = {
        field,
        isValid: errors.length === 0,
        errors,
        warnings,
        isPending: false,
        lastValidated: new Date()
      };
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      // Update metrics (would be handled by parent component)
      console.log(`Field ${field} validated in ${validationTime.toFixed(2)}ms`);
      
      return validationResult;
      
    } catch (error) {
      console.error(`Validation failed for field ${field}:`, error);
      
      return {
        field,
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
        isPending: false,
        lastValidated: new Date()
      };
    } finally {
      setPendingValidations(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  }, [schema, formData, validateSingleRule]);
  
  const validateMultipleFields = useCallback(async (fields: string[]): Promise<FormFieldValidationResult[]> => {
    const validationPromises = fields.map(field => validateField(field));
    return Promise.all(validationPromises);
  }, [validateField]);
  
  return {
    validateField,
    validateMultipleFields,
    pendingValidations
  };
}

/**
 * Schema validation hook
 */
function useSchemaValidation(schema: FormValidationSchema | undefined) {
  const [isSchemaValid, setIsSchemaValid] = useState(true);
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);
  
  useEffect(() => {
    if (!schema) {
      setIsSchemaValid(true);
      setSchemaErrors([]);
      return;
    }
    
    const errors: string[] = [];
    
    // Validate schema structure
    if (!schema.fields || Object.keys(schema.fields).length === 0) {
      errors.push('Schema must contain at least one field');
    }
    
    // Validate field rules
    Object.entries(schema.fields).forEach(([field, rules]) => {
      if (!Array.isArray(rules)) {
        errors.push(`Field ${field} rules must be an array`);
        return;
      }
      
      rules.forEach((rule, index) => {
        if (!rule.type) {
          errors.push(`Field ${field} rule ${index} missing type`);
        }
        
        if (!rule.message) {
          errors.push(`Field ${field} rule ${index} missing message`);
        }
        
        if (rule.type === 'crossField' && !rule.dependsOn) {
          errors.push(`Field ${field} crossField rule missing dependsOn`);
        }
      });
    });
    
    setIsSchemaValid(errors.length === 0);
    setSchemaErrors(errors);
  }, [schema]);
  
  return {
    isSchemaValid,
    schemaErrors
  };
}

// ==========================================
// 🔴 IA ALPHA - MAIN COMPONENT
// ==========================================

/**
 * V7.5 Enhanced FormValidation Component
 * Professional form-level validation with schema building and cross-field validation
 */
export const FormValidation = forwardRef<FormValidationRef, FormValidationProps>(
  ({
    variant = 'outlined',
    size = 'md',
    glassEffect = 'subtle',
    validationState = 'neutral',
    schema,
    initialValues = {},
    disabled = false,
    readOnly = false,
    name,
    method = 'POST',
    action,
    title,
    description,
    timing = {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
      debounceMs: 300
    },
    errorDisplay = {
      mode: 'both',
      groupByField: true,
      showErrorCount: true,
      position: 'top'
    },
    enableCache = true,
    maxCacheSize = 100,
    enableMetrics = true,
    customErrorRenderer,
    customSuccessRenderer,
    customLoadingRenderer,
    id,
    ariaLabel,
    ariaDescribedBy,
    animation = { preset: 'smooth', duration: 300, enabled: true },
    eventHandlers = {},
    children,
    className = ''
  }, ref) => {
    
    // State Management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    
    // Refs
    const formRef = useRef<HTMLFormElement>(null);
    const fieldRefs = useRef<Map<string, FormFieldRef>>(new Map());
    
    // Hooks
    const {
      validationState: currentValidationState,
      formData,
      updateField,
      clearValidationForField,
      updateValidationResult,
      reset,
      metrics
    } = useFormValidationState(schema, initialValues, timing);
    
    const { validateField, validateMultipleFields, pendingValidations } = useFieldValidation(
      schema,
      formData,
      timing
    );
    
    const { isSchemaValid, schemaErrors } = useSchemaValidation(schema);
    
    // Form submission handler
    const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      if (disabled || readOnly || isSubmitting) return;
      
      setIsSubmitting(true);
      setSubmitAttempted(true);
      
      eventHandlers.onValidationStart?.();
      
      try {
        // Validate all fields
        const fields = Object.keys(schema?.fields || {});
        const results = await validateMultipleFields(fields);
        
        // Update validation results
        results.forEach(result => {
          updateValidationResult(result);
        });
        
        const hasErrors = results.some(result => !result.isValid);
        
        if (!hasErrors) {
          // Form is valid, proceed with submission
          const finalState: FormValidationState = {
            ...currentValidationState,
            isValid: true,
            hasErrors: false,
            lastValidated: new Date()
          };
          
          eventHandlers.onValidationComplete?.(finalState);
          
          // If action is provided, submit form naturally
          if (action) {
            formRef.current?.submit();
          }
          
          return finalState;
        } else {
          // Form has errors
          const finalState: FormValidationState = {
            ...currentValidationState,
            isValid: false,
            hasErrors: true,
            lastValidated: new Date()
          };
          
          eventHandlers.onValidationComplete?.(finalState);
          return finalState;
        }
        
      } catch (error) {
        console.error('Form validation error:', error);
        eventHandlers.onValidationError?.(error as Error);
        
        const errorState: FormValidationState = {
          ...currentValidationState,
          isValid: false,
          hasErrors: true,
          errors: ['Form validation failed'],
          lastValidated: new Date()
        };
        
        return errorState;
      } finally {
        setIsSubmitting(false);
      }
    }, [
      disabled,
      readOnly,
      isSubmitting,
      schema,
      validateMultipleFields,
      updateValidationResult,
      currentValidationState,
      eventHandlers,
      action
    ]);
    
    // Field change handler with debouncing
    const handleFieldChange = useCallback((field: string, value: any) => {
      updateField(field, value);
      
      if (timing.validateOnChange) {
        const debounceMs = timing.debounceMs || 300;
        
        // Simple debouncing implementation
        const timeoutId = setTimeout(async () => {
          try {
            const result = await validateField(field);
            updateValidationResult(result);
            eventHandlers.onFieldValidated?.(result);
          } catch (error) {
            eventHandlers.onValidationError?.(error as Error, field);
          }
        }, debounceMs);
        
        return () => clearTimeout(timeoutId);
      }
    }, [updateField, timing, validateField, updateValidationResult, eventHandlers]);
    
    // Field blur handler
    const handleFieldBlur = useCallback(async (field: string) => {
      if (timing.validateOnBlur) {
        try {
          const result = await validateField(field);
          updateValidationResult(result);
          eventHandlers.onFieldValidated?.(result);
        } catch (error) {
          eventHandlers.onValidationError?.(error as Error, field);
        }
      }
    }, [timing, validateField, updateValidationResult, eventHandlers]);
    
    // Imperative Handle
    useImperativeHandle(ref, () => ({
      validate: async (fields?: string[]) => {
        const fieldsToValidate = fields || Object.keys(schema?.fields || {});
        const results = await validateMultipleFields(fieldsToValidate);
        
        results.forEach(result => {
          updateValidationResult(result);
        });
        
        return currentValidationState;
      },
      
      validateField: async (field: string) => {
        const result = await validateField(field);
        updateValidationResult(result);
        return result;
      },
      
      getValidationState: () => currentValidationState,
      
      getFieldValue: (field: string) => formData[field],
      
      setFieldValue: (field: string, value: any) => {
        updateField(field, value);
      },
      
      getFormData: () => formData,
      
      setFormData: (data: Record<string, any>) => {
        Object.entries(data).forEach(([field, value]) => {
          updateField(field, value);
        });
      },
      
      clearValidation: (field?: string) => {
        if (field) {
          clearValidationForField(field);
        } else {
          reset();
        }
      },
      
      reset,
      
      submit: async () => {
        const event = new Event('submit', { cancelable: true });
        await handleSubmit(event as any);
        return currentValidationState;
      },
      
      getMetrics: () => metrics,
      
      addValidationRule: (field: string, rule: FormValidationRule) => {
        // Implementation would update schema
        console.log('Adding validation rule:', field, rule);
      },
      
      removeValidationRule: (field: string, ruleType: string) => {
        // Implementation would update schema
        console.log('Removing validation rule:', field, ruleType);
      },
      
      updateSchema: (newSchema: Partial<FormValidationSchema>) => {
        // Implementation would merge schema
        console.log('Updating schema:', newSchema);
      }
    }), [
      schema,
      validateMultipleFields,
      updateValidationResult,
      currentValidationState,
      validateField,
      formData,
      updateField,
      clearValidationForField,
      reset,
      handleSubmit,
      metrics
    ]);
    
    // CSS Classes
    const containerClasses = [
      'form-validation-container',
      `form-validation-container--${variant}`,
      `form-validation-container--${size}`,
      `form-validation-container--glass-${glassEffect}`,
      `form-validation-container--${validationState}`,
      disabled && 'form-validation-container--disabled',
      readOnly && 'form-validation-container--readonly',
      isSubmitting && 'form-validation-container--submitting',
      currentValidationState.isPending && 'form-validation-container--validating',
      className
    ].filter(Boolean).join(' ');
    
    return (
      <div className={containerClasses}>
        {/* Form Header */}
        {(title || description) && (
          <div className="form-validation-header">
            {title && (
              <h2 className="form-validation-title">
                {title}
              </h2>
            )}
            
            {description && (
              <p className="form-validation-description">
                {description}
              </p>
            )}
          </div>
        )}
        
        {/* Error Display - Top */}
        {errorDisplay.mode !== 'inline' && errorDisplay.position === 'top' && (
          <AnimatePresence>
            {(currentValidationState.hasErrors || schemaErrors.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="form-validation-errors form-validation-errors--top"
                role="alert"
              >
                {customErrorRenderer ? (
                  customErrorRenderer([...currentValidationState.errors, ...schemaErrors])
                ) : (
                  <div className="form-validation-error-list">
                    {errorDisplay.showErrorCount && (
                      <div className="form-validation-error-count">
                        {currentValidationState.errors.length + schemaErrors.length} error(s) found
                      </div>
                    )}
                    
                    {schemaErrors.map((error, index) => (
                      <div key={`schema-${index}`} className="form-validation-error-item">
                        <span className="form-validation-error-icon">⚠</span>
                        <span className="form-validation-error-text">{error}</span>
                      </div>
                    ))}
                    
                    {currentValidationState.errors.map((error, index) => (
                      <div key={`form-${index}`} className="form-validation-error-item">
                        <span className="form-validation-error-icon">❌</span>
                        <span className="form-validation-error-text">{error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Validation Status Indicator */}
        {currentValidationState.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="form-validation-status"
          >
            {customLoadingRenderer ? (
              customLoadingRenderer()
            ) : (
              <div className="form-validation-loading">
                <div className="form-validation-spinner" />
                <span>Validating form...</span>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Success Indicator */}
        {submitAttempted && currentValidationState.isValid && !currentValidationState.isPending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="form-validation-success"
          >
            {customSuccessRenderer ? (
              customSuccessRenderer('Form is valid!')
            ) : (
              <div className="form-validation-success-content">
                <span className="form-validation-success-icon">✅</span>
                <span className="form-validation-success-text">Form is valid!</span>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Main Form */}
        <form
          ref={formRef}
          className="form-validation-form"
          onSubmit={handleSubmit}
          name={name}
          method={method}
          action={action}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          noValidate
        >
          {/* Form Fields Container */}
          <div className="form-validation-fields">
            {children}
          </div>
          
          {/* Field-level Error Display */}
          {errorDisplay.mode !== 'summary' && errorDisplay.groupByField && (
            <div className="form-validation-field-errors">
              {Object.entries(currentValidationState.fields).map(([field, result]) => (
                result.errors.length > 0 && (
                  <AnimatePresence key={field}>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="form-validation-field-error"
                    >
                      <div className="form-validation-field-error-header">
                        <span className="form-validation-field-name">{field}</span>
                        <span className="form-validation-field-error-count">
                          {result.errors.length} error(s)
                        </span>
                      </div>
                      
                      <div className="form-validation-field-error-list">
                        {result.errors.map((error, index) => (
                          <div key={index} className="form-validation-field-error-item">
                            {error}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )
              ))}
            </div>
          )}
        </form>
        
        {/* Error Display - Bottom */}
        {errorDisplay.mode !== 'inline' && errorDisplay.position === 'bottom' && (
          <AnimatePresence>
            {(currentValidationState.hasErrors || schemaErrors.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="form-validation-errors form-validation-errors--bottom"
                role="alert"
              >
                {customErrorRenderer ? (
                  customErrorRenderer([...currentValidationState.errors, ...schemaErrors])
                ) : (
                  <div className="form-validation-error-list">
                    {errorDisplay.showErrorCount && (
                      <div className="form-validation-error-count">
                        {currentValidationState.errors.length + schemaErrors.length} error(s) found
                      </div>
                    )}
                    
                    {[...schemaErrors, ...currentValidationState.errors].map((error, index) => (
                      <div key={index} className="form-validation-error-item">
                        <span className="form-validation-error-icon">❌</span>
                        <span className="form-validation-error-text">{error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Debug Information (Development) */}
        {process.env.NODE_ENV === 'development' && enableMetrics && (
          <details className="form-validation-debug">
            <summary>Validation Debug Info</summary>
            <div className="form-validation-debug-content">
              <h4>Validation State</h4>
              <pre>{JSON.stringify(currentValidationState, null, 2)}</pre>
              
              <h4>Form Data</h4>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
              
              <h4>Metrics</h4>
              <pre>{JSON.stringify(metrics, null, 2)}</pre>
              
              <h4>Schema</h4>
              <pre>{JSON.stringify(schema, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    );
  }
);

FormValidation.displayName = 'FormValidation';

export default FormValidation; 