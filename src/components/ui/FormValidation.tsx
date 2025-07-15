import React, { useState, useRef, useCallback, memo, forwardRef, useId, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  Loader2, 
  Eye, 
  EyeOff,
  Shield,
  Zap,
  Target,
  Settings,
  Clock,
  TrendingUp,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { theme as designTokens } from '../../design-system/tokens';

// Layout.Section - V7.5 Enhanced Structure
const Layout = {
  Section: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative ${className}`}>{children}</div>
  ),
  Container: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-3 ${className}`}>{children}</div>
  ),
  Row: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex items-center space-x-2 ${className}`}>{children}</div>
  ),
  Grid: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`grid gap-4 ${className}`}>{children}</div>
  )
};

// ===== ALPHA TECHNICAL FOUNDATION: ADVANCED TYPESCRIPT INTERFACES =====

export interface ValidationRule {
  name: string;
  message: string;
  validator: (value: any, formData?: Record<string, any>) => boolean | Promise<boolean>;
  trigger?: 'onChange' | 'onBlur' | 'onSubmit' | 'onFocus';
  debounceMs?: number;
  priority?: number;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  timestamp: number;
  priority: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  hasAsyncValidation: boolean;
  isPending: boolean;
}

export interface FieldValidationState {
  value: any;
  errors: ValidationError[];
  warnings: ValidationError[];
  isValidating: boolean;
  isTouched: boolean;
  isFocused: boolean;
  lastValidatedAt: number;
  validationHistory: ValidationError[];
}

export interface FormValidationProps {
  // Core Props
  id?: string;
  name?: string;
  value?: any;
  defaultValue?: any;
  
  // V7.5 Enhanced Variants
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Validation Props
  validationSchema?: ValidationSchema;
  validationRules?: ValidationRule[];
  asyncValidationRules?: ValidationRule[];
  
  // Validation Configuration
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnFocus?: boolean;
  validateOnSubmit?: boolean;
  debounceMs?: number;
  showValidationState?: boolean;
  showValidationProgress?: boolean;
  realTimeValidation?: boolean;
  
  // State Props
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  
  // Content Props
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  warningMessage?: string;
  
  // Input Type Props
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'search';
  inputMode?: 'text' | 'email' | 'numeric' | 'tel' | 'url' | 'search';
  autoComplete?: string;
  
  // Advanced Features
  showPasswordToggle?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  
  // V7.5 Enhanced Props
  showFeatureIndicators?: boolean;
  compactMode?: boolean;
  showEnhancedFeedback?: boolean;
  
  // Interaction Props
  onChange?: (value: any, validationResult: ValidationResult) => void;
  onValidationChange?: (result: ValidationResult) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onSubmit?: (value: any, validationResult: ValidationResult) => void;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  inputClassName?: string;
  labelClassName?: string;
  
  // Advanced Props
  autoFocus?: boolean;
  'data-testid'?: string;
}

// ===== V7.5 ENHANCED: FEATURE INDICATORS COMPONENT =====
const EnhancedFeatureIndicators: React.FC<{
  validationState: any;
  fieldState: FieldValidationState;
  hasAsyncValidation: boolean;
  showValidationProgress: boolean;
  size: string;
  variant: string;
}> = ({ validationState, fieldState, hasAsyncValidation, showValidationProgress, size, variant }) => {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : size === 'xl' ? 20 : 14;
  
  return (
    <Layout.Row className="justify-between items-center mt-1">
      <Layout.Row>
        {/* Validation State Indicator */}
        {validationState.type === 'error' && (
          <Shield size={iconSize} className="text-red-500" aria-label="Proteção ativa contra erros" />
        )}
        {validationState.type === 'success' && (
          <Shield size={iconSize} className="text-green-500" aria-label="Validação protegida" />
        )}
        {validationState.type === 'warning' && (
          <Shield size={iconSize} className="text-yellow-500" aria-label="Atenção na validação" />
        )}
        
        {/* Real-time Validation Indicator */}
        {fieldState.isTouched && (
          <Zap size={iconSize} className="text-blue-500" aria-label="Validação em tempo real" />
        )}
        
        {/* Async Validation Capability */}
        {hasAsyncValidation && (
          <Target size={iconSize} className="text-purple-500" aria-label="Validação assíncrona disponível" />
        )}
        
        {/* Advanced Configuration */}
        {showValidationProgress && (
          <Settings size={iconSize} className="text-gray-500" aria-label="Progresso de validação ativo" />
        )}
        
        {/* Validation History */}
        {fieldState.validationHistory.length > 0 && (
          <Clock size={iconSize} className="text-indigo-500" aria-label="Histórico de validação" />
        )}
      </Layout.Row>
      
      <Layout.Row>
        {/* Enterprise Feature Indicator */}
        <Sparkles size={iconSize - 2} className="text-amber-500" aria-label="Enterprise validation engine" />
        
        {/* Performance Indicator */}
        <TrendingUp size={iconSize - 2} className="text-green-600" aria-label="High performance validation" />
      </Layout.Row>
    </Layout.Row>
  );
};

// ===== V7.5 ENHANCED: VALIDATION FEEDBACK COMPONENT =====
const EnhancedValidationFeedback: React.FC<{
  validationState: any;
  fieldState: FieldValidationState;
  errorMessage?: string;
  successMessage?: string;
  warningMessage?: string;
  finalId: string;
  size: string;
}> = ({ validationState, fieldState, errorMessage, successMessage, warningMessage, finalId, size }) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : size === 'xl' ? 20 : 16;
  
  return (
    <AnimatePresence>
      {(validationState.message || errorMessage || successMessage || warningMessage) && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Layout.Container className="mt-2">
            {/* Error Messages */}
            {(validationState.type === 'error' && (validationState.message || errorMessage)) && (
              <Layout.Row className="items-start space-x-2">
                <AlertCircle size={iconSize} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p 
                    id={`${finalId}-error`}
                    style={{
                      fontSize: designTokens.typography.fontSize.sm,
                      color: designTokens.colors.red[600],
                      margin: 0,
                      lineHeight: 1.4
                    }}
                  >
                    {validationState.message || errorMessage}
                  </p>
                  {fieldState.errors.length > 1 && (
                    <p style={{
                      fontSize: designTokens.typography.fontSize.xs,
                      color: designTokens.colors.red[500],
                      margin: '4px 0 0 0'
                    }}>
                      +{fieldState.errors.length - 1} erro(s) adicional(is)
                    </p>
                  )}
                </div>
              </Layout.Row>
            )}
            
            {/* Success Messages */}
            {(validationState.type === 'success' && (validationState.message || successMessage)) && (
              <Layout.Row className="items-start space-x-2">
                <CheckCircle2 size={iconSize} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p 
                  id={`${finalId}-success`}
                  style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.green[600],
                    margin: 0,
                    lineHeight: 1.4
                  }}
                >
                  {validationState.message || successMessage}
                </p>
              </Layout.Row>
            )}
            
            {/* Warning Messages */}
            {(validationState.type === 'warning' && (validationState.message || warningMessage)) && (
              <Layout.Row className="items-start space-x-2">
                <AlertCircle size={iconSize} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <p 
                  id={`${finalId}-warning`}
                  style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.yellow[600],
                    margin: 0,
                    lineHeight: 1.4
                  }}
                >
                  {validationState.message || warningMessage}
                </p>
              </Layout.Row>
            )}
          </Layout.Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ===== ORIGINAL ENTERPRISE LOGIC PRESERVED =====

interface ValidationEngineState {
  fieldStates: Record<string, FieldValidationState>;
  formErrors: ValidationError[];
  formWarnings: ValidationError[];
  isValidating: boolean;
  lastValidatedAt: number;
  validationContext: Record<string, any>;
}

const useValidationEngine = (
  schema: ValidationSchema | undefined,
  rules: ValidationRule[] | undefined,
  asyncRules: ValidationRule[] | undefined
) => {
  const [engineState, setEngineState] = useState<ValidationEngineState>({
    fieldStates: {},
    formErrors: [],
    formWarnings: [],
    isValidating: false,
    lastValidatedAt: 0,
    validationContext: {},
  });

  const validateField = useCallback(async (
    fieldId: string,
    value: any,
    trigger: 'onChange' | 'onBlur' | 'onSubmit' | 'onFocus' = 'onChange'
  ): Promise<ValidationResult> => {
    const fieldRules = schema?.[fieldId] || rules || [];
    const fieldAsyncRules = asyncRules || [];
    
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let hasAsyncValidation = false;
    let isPending = false;

    // Set field as validating
    setEngineState(prev => ({
      ...prev,
      fieldStates: {
        ...prev.fieldStates,
        [fieldId]: {
          ...prev.fieldStates[fieldId],
          value,
          isValidating: true,
          lastValidatedAt: Date.now(),
        }
      }
    }));

    // Synchronous validation
    for (const rule of fieldRules) {
      if (rule.trigger && rule.trigger !== trigger) continue;
      
      try {
        const result = await rule.validator(value, engineState.validationContext);
        if (!result) {
          const error: ValidationError = {
            field: fieldId,
            rule: rule.name,
            message: rule.message,
            timestamp: Date.now(),
            priority: rule.priority || 0,
          };
          
          if (rule.priority && rule.priority > 5) {
            warnings.push(error);
          } else {
            errors.push(error);
          }
        }
      } catch (error) {
        console.error(`Validation error for field ${fieldId}:`, error);
      }
    }

    // Asynchronous validation
    if (fieldAsyncRules.length > 0) {
      hasAsyncValidation = true;
      isPending = true;
      
      for (const rule of fieldAsyncRules) {
        if (rule.trigger && rule.trigger !== trigger) continue;
        
        try {
          const result = await rule.validator(value, engineState.validationContext);
          if (!result) {
            const error: ValidationError = {
              field: fieldId,
              rule: rule.name,
              message: rule.message,
              timestamp: Date.now(),
              priority: rule.priority || 0,
            };
            
            if (rule.priority && rule.priority > 5) {
              warnings.push(error);
            } else {
              errors.push(error);
            }
          }
        } catch (error) {
          console.error(`Async validation error for field ${fieldId}:`, error);
        }
      }
      
      isPending = false;
    }

    // Update field state
    setEngineState(prev => ({
      ...prev,
      fieldStates: {
        ...prev.fieldStates,
        [fieldId]: {
          ...prev.fieldStates[fieldId],
          value,
          errors,
          warnings,
          isValidating: false,
          isTouched: true,
          lastValidatedAt: Date.now(),
          validationHistory: [
            ...(prev.fieldStates[fieldId]?.validationHistory || []),
            ...errors,
            ...warnings
          ].slice(-10), // Keep last 10 validation results
        }
      }
    }));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasAsyncValidation,
      isPending,
    };
  }, [schema, rules, asyncRules, engineState.validationContext]);

  const getFieldState = useCallback((fieldId: string): FieldValidationState => {
    return engineState.fieldStates[fieldId] || {
      value: '',
      errors: [],
      warnings: [],
      isValidating: false,
      isTouched: false,
      isFocused: false,
      lastValidatedAt: 0,
      validationHistory: [],
    };
  }, [engineState.fieldStates]);

  const clearValidation = useCallback((fieldId?: string) => {
    if (fieldId) {
      setEngineState(prev => ({
        ...prev,
        fieldStates: {
          ...prev.fieldStates,
          [fieldId]: {
            ...prev.fieldStates[fieldId],
            errors: [],
            warnings: [],
            isValidating: false,
          }
        }
      }));
    } else {
      setEngineState(prev => ({
        ...prev,
        fieldStates: Object.keys(prev.fieldStates).reduce((acc, key) => ({
          ...acc,
          [key]: {
            ...prev.fieldStates[key],
            errors: [],
            warnings: [],
            isValidating: false,
          }
        }), {}),
        formErrors: [],
        formWarnings: [],
      }));
    }
  }, []);

  return {
    engineState,
    validateField,
    getFieldState,
    clearValidation,
  };
};

// Common validation rules
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    name: 'required',
    message,
    validator: (value) => value !== null && value !== undefined && String(value).trim() !== '',
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    name: 'email',
    message,
    validator: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(String(value));
    },
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    name: 'minLength',
    message: message || `Must be at least ${min} characters long`,
    validator: (value) => !value || String(value).length >= min,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    name: 'maxLength',
    message: message || `Must be no more than ${max} characters long`,
    validator: (value) => !value || String(value).length <= max,
  }),
  
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    name: 'pattern',
    message,
    validator: (value) => !value || regex.test(String(value)),
  }),
  
  asyncAvailability: (checkUrl: string, message = 'This value is not available'): ValidationRule => ({
    name: 'asyncAvailability',
    message,
    validator: async (value) => {
      if (!value) return true;
      try {
        const response = await fetch(`${checkUrl}?value=${encodeURIComponent(String(value))}`);
        const result = await response.json();
        return result.available;
      } catch {
        return false;
      }
    },
  }),
};

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useValidationState = (
  props: FormValidationProps,
  validationResult: ValidationResult,
  fieldState: FieldValidationState
) => {
  return useMemo(() => {
    const { error, success, warning, errorMessage, successMessage, warningMessage } = props;
    
    // Priority: explicit props > validation result > field state
    if (error || errorMessage) {
      return {
        type: 'error' as const,
        message: errorMessage || 'Validation error',
        color: designTokens.colors.red[500],
        borderColor: designTokens.colors.red[300],
        backgroundColor: designTokens.colors.red[50],
      };
    }
    
    if (success || successMessage) {
      return {
        type: 'success' as const,
        message: successMessage || 'Validation successful',
        color: designTokens.colors.green[500],
        borderColor: designTokens.colors.green[300],
        backgroundColor: designTokens.colors.green[50],
      };
    }
    
    if (warning || warningMessage) {
      return {
        type: 'warning' as const,
        message: warningMessage || 'Validation warning',
        color: designTokens.colors.yellow[500],
        borderColor: designTokens.colors.yellow[300],
        backgroundColor: designTokens.colors.yellow[50],
      };
    }
    
    // Check validation result
    if (validationResult.errors.length > 0) {
      return {
        type: 'error' as const,
        message: validationResult.errors[0].message,
        color: designTokens.colors.red[500],
        borderColor: designTokens.colors.red[300],
        backgroundColor: designTokens.colors.red[50],
      };
    }
    
    if (validationResult.warnings.length > 0) {
      return {
        type: 'warning' as const,
        message: validationResult.warnings[0].message,
        color: designTokens.colors.yellow[500],
        borderColor: designTokens.colors.yellow[300],
        backgroundColor: designTokens.colors.yellow[50],
      };
    }
    
    if (fieldState.isTouched && validationResult.isValid && !validationResult.isPending) {
      return {
        type: 'success' as const,
        message: successMessage || 'Valid',
        color: designTokens.colors.green[500],
        borderColor: designTokens.colors.green[300],
        backgroundColor: designTokens.colors.green[50],
      };
    }
    
    return {
      type: 'neutral' as const,
      message: '',
      color: designTokens.colors.neutral[500],
      borderColor: designTokens.colors.neutral[300],
      backgroundColor: designTokens.colors.neutral[50],
    };
  }, [props, validationResult, fieldState]);
};

const getValidationVariantStyles = (
  variant: string,
  validationState: any,
  isFocused: boolean,
  isHovered: boolean,
  size: string,
  disabled: boolean,
  isValidating: boolean
) => {
  const baseStyles = {
    width: '100%',
    border: '1px solid',
    borderRadius: designTokens.borderRadius.md,
    fontSize: designTokens.typography.fontSize.sm,
    fontFamily: designTokens.typography.fontFamily.sans,
    outline: 'none',
    transition: 'all 0.15s ease-in-out',
    position: 'relative' as const,
  };

  // Size styles
  const sizeStyles = {
    sm: {
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
      fontSize: designTokens.typography.fontSize.sm,
      minHeight: '36px',
    },
    md: {
      padding: `${designTokens.spacing[3]} ${designTokens.spacing[4]}`,
      fontSize: designTokens.typography.fontSize.base,
      minHeight: '40px',
    },
    lg: {
      padding: `${designTokens.spacing[4]} ${designTokens.spacing[5]}`,
      fontSize: designTokens.typography.fontSize.lg,
      minHeight: '48px',
    },
    xl: {
      padding: `${designTokens.spacing[5]} ${designTokens.spacing[6]}`,
      fontSize: designTokens.typography.fontSize.xl,
      minHeight: '56px',
    },
  };

  // Variant styles
  const variantStyles = {
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    outlined: {
      backgroundColor: 'transparent',
      border: '2px solid',
    },
    filled: {
      backgroundColor: designTokens.colors.neutral[100],
      border: '1px solid transparent',
    },
    minimal: {
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '2px solid',
      borderRadius: 0,
    },
  };

  // State styles
  let stateStyles = {};
  
  if (disabled) {
    stateStyles = {
      backgroundColor: designTokens.colors.neutral[100],
      color: designTokens.colors.neutral[400],
      borderColor: designTokens.colors.neutral[200],
      cursor: 'not-allowed',
      opacity: 0.6,
    };
  } else if (isValidating) {
    stateStyles = {
      borderColor: designTokens.colors.blue[400],
      boxShadow: `0 0 0 3px ${designTokens.colors.blue[100]}`,
    };
  } else if (isFocused) {
    stateStyles = {
      borderColor: validationState.borderColor,
      boxShadow: `0 0 0 3px ${validationState.backgroundColor}`,
    };
  } else if (isHovered) {
    stateStyles = {
      borderColor: validationState.borderColor,
    };
  } else {
    stateStyles = {
      borderColor: validationState.borderColor,
    };
  }

  return {
    ...baseStyles,
    ...sizeStyles[size as keyof typeof sizeStyles],
    ...variantStyles[variant as keyof typeof variantStyles],
    ...stateStyles,
  };
};

const getLabelStyles = (size: string, disabled: boolean, validationState: any) => {
  const baseStyles = {
    display: 'block',
    fontWeight: designTokens.typography.fontWeight.medium,
    color: disabled ? designTokens.colors.neutral[400] : validationState.color,
    marginBottom: designTokens.spacing[2],
    transition: 'color 0.15s ease-in-out',
  };

  const sizeStyles = {
    sm: { fontSize: designTokens.typography.fontSize.sm },
    md: { fontSize: designTokens.typography.fontSize.base },
    lg: { fontSize: designTokens.typography.fontSize.lg },
    xl: { fontSize: designTokens.typography.fontSize.xl },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size as keyof typeof sizeStyles],
  };
};

const getAriaProps = (
  props: FormValidationProps,
  validationState: any,
  inputId: string,
  isValidating: boolean
) => ({
  'aria-invalid': validationState.type === 'error',
  'aria-describedby': [
    props.helperText ? `${inputId}-helper` : null,
    validationState.type === 'error' ? `${inputId}-error` : null,
    validationState.type === 'success' ? `${inputId}-success` : null,
    validationState.type === 'warning' ? `${inputId}-warning` : null,
    isValidating ? `${inputId}-validating` : null,
  ].filter(Boolean).join(' '),
  'aria-required': props.required,
});

// ===== MAIN COMPONENT WITH V7.5 ENHANCED STRUCTURE =====

const FormValidation = memo(forwardRef<HTMLInputElement, FormValidationProps>((props, ref) => {
  const {
    // Core props
    id,
    name,
    value,
    defaultValue,
    
    // V7.5 Enhanced props
    variant = 'outlined',
    size = 'md',
    showFeatureIndicators = true,
    compactMode = false,
    showEnhancedFeedback = true,
    
    // Validation props
    validationSchema,
    validationRules,
    asyncValidationRules,
    
    // Configuration
    validateOnChange = true,
    validateOnBlur = true,
    validateOnFocus = false,
    validateOnSubmit = true,
    debounceMs = 300,
    showValidationState = true,
    showValidationProgress = false,
    realTimeValidation = true,
    
    // State props
    disabled = false,
    readOnly = false,
    required = false,
    error = false,
    success = false,
    warning = false,
    
    // Content props
    label,
    placeholder,
    helperText,
    errorMessage,
    successMessage,
    warningMessage,
    
    // Input props
    type = 'text',
    inputMode,
    autoComplete,
    
    // Advanced features
    showPasswordToggle = false,
    maxLength,
    minLength,
    pattern,
    
    // Interaction props
    onChange,
    onValidationChange,
    onFocus,
    onBlur,
    onSubmit,
    
    // Layout props
    fullWidth = true,
    className = '',
    style = {},
    inputClassName = '',
    labelClassName = '',
    
    // Advanced props
    autoFocus = false,
    'data-testid': testId,
    
    ...restProps
  } = props;

  // ===== HOOKS & STATE =====
  const inputId = useId();
  const finalId = id || inputId;
  
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  const debouncedValue = useDebounce(currentValue, debounceMs);
  
  const { engineState, validateField, getFieldState, clearValidation } = useValidationEngine(
    validationSchema,
    validationRules,
    asyncValidationRules
  );
  
  const fieldState = getFieldState(finalId);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    hasAsyncValidation: false,
    isPending: false,
  });
  
  const validationState = useValidationState({ error, success, warning, errorMessage, successMessage, warningMessage }, validationResult, fieldState);
  
  // ===== VALIDATION EFFECTS (PRESERVED) =====
  useEffect(() => {
    if (realTimeValidation && validateOnChange && isTouched) {
      const validate = async () => {
        const result = await validateField(finalId, debouncedValue, 'onChange');
        setValidationResult(result);
        onValidationChange?.(result);
      };
      validate();
    }
  }, [debouncedValue, realTimeValidation, validateOnChange, isTouched, validateField, finalId, onValidationChange]);
  
  // ===== EVENT HANDLERS (PRESERVED) =====
  const handleChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    if (!isTouched) {
      setIsTouched(true);
    }
    
    onChange?.(newValue, validationResult);
    
    if (validateOnChange && realTimeValidation) {
      const result = await validateField(finalId, newValue, 'onChange');
      setValidationResult(result);
      onValidationChange?.(result);
    }
  }, [value, onChange, validationResult, validateOnChange, realTimeValidation, validateField, finalId, onValidationChange, isTouched]);
  
  const handleFocus = useCallback(async (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
    
    if (validateOnFocus) {
      const result = await validateField(finalId, currentValue, 'onFocus');
      setValidationResult(result);
      onValidationChange?.(result);
    }
  }, [onFocus, validateOnFocus, validateField, finalId, currentValue, onValidationChange]);
  
  const handleBlur = useCallback(async (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setIsTouched(true);
    onBlur?.(event);
    
    if (validateOnBlur) {
      const result = await validateField(finalId, currentValue, 'onBlur');
      setValidationResult(result);
      onValidationChange?.(result);
    }
  }, [onBlur, validateOnBlur, validateField, finalId, currentValue, onValidationChange]);
  
  const handleSubmit = useCallback(async () => {
    if (validateOnSubmit) {
      const result = await validateField(finalId, currentValue, 'onSubmit');
      setValidationResult(result);
      onValidationChange?.(result);
      onSubmit?.(currentValue, result);
      return result;
    }
    onSubmit?.(currentValue, validationResult);
    return validationResult;
  }, [validateOnSubmit, validateField, finalId, currentValue, onValidationChange, onSubmit, validationResult]);
  
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  // ===== STYLES (PRESERVED) =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };
  
  const inputStyles = getValidationVariantStyles(
    variant,
    validationState,
    isFocused,
    isHovered,
    size,
    disabled,
    fieldState.isValidating
  );
  
  const labelStyles = getLabelStyles(size, disabled, validationState);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // ===== V7.5 ENHANCED RENDER =====
  return (
    <Layout.Section style={containerStyles} className={className}>
      <Layout.Container>
        {/* Enhanced Label */}
        {label && (
          <Layout.Row className="justify-between items-center">
            <motion.label
              htmlFor={finalId}
              style={labelStyles}
              className={labelClassName}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {label}
              {required && (
                <span style={{ color: designTokens.colors.red[500], marginLeft: 4 }}>
                  *
                </span>
              )}
            </motion.label>
            
            {/* Validation Status Indicator */}
            {showValidationState && !compactMode && (
              <Layout.Row>
                {fieldState.isValidating && (
                  <Loader2 size={14} className="animate-spin text-blue-500" />
                )}
                {!fieldState.isValidating && validationState.type === 'success' && (
                  <CheckCircle2 size={14} className="text-green-500" />
                )}
                {!fieldState.isValidating && validationState.type === 'error' && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Layout.Row>
            )}
          </Layout.Row>
        )}
        
        {/* V7.5 Enhanced Feature Indicators */}
        {showFeatureIndicators && !compactMode && (
          <EnhancedFeatureIndicators
            validationState={validationState}
            fieldState={fieldState}
            hasAsyncValidation={!!asyncValidationRules?.length}
            showValidationProgress={showValidationProgress}
            size={size}
            variant={variant}
          />
        )}
        
        {/* Input Container */}
        <Layout.Section className="relative">
          <motion.input
            ref={ref}
            id={finalId}
            name={name}
            type={inputType}
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={inputStyles}
            className={inputClassName}
            data-testid={testId}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            {...getAriaProps({ required, helperText }, validationState, finalId, fieldState.isValidating)}
            {...restProps}
          />
          
          {/* Enhanced Validation State Icons */}
          {showValidationState && (
            <div style={{
              position: 'absolute',
              right: showPasswordToggle && type === 'password' ? '44px' : '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing[1],
            }}>
              <AnimatePresence mode="wait">
                {fieldState.isValidating && (
                  <motion.div
                    key="validating"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Loader2 size={16} className="animate-spin" color={designTokens.colors.blue[500]} />
                  </motion.div>
                )}
                
                {!fieldState.isValidating && validationState.type === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={16} color={designTokens.colors.red[500]} />
                  </motion.div>
                )}
                
                {!fieldState.isValidating && validationState.type === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check size={16} color={designTokens.colors.green[500]} />
                  </motion.div>
                )}
                
                {!fieldState.isValidating && validationState.type === 'warning' && (
                  <motion.div
                    key="warning"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <AlertCircle size={16} color={designTokens.colors.yellow[500]} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Password Toggle (PRESERVED) */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: designTokens.borderRadius.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={16} color={designTokens.colors.neutral[500]} />
              ) : (
                <Eye size={16} color={designTokens.colors.neutral[500]} />
              )}
            </button>
          )}
        </Layout.Section>
        
        {/* Enhanced Validation Progress (PRESERVED + ENHANCED) */}
        {showValidationProgress && fieldState.isValidating && (
          <motion.div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: designTokens.colors.neutral[200],
              borderRadius: designTokens.borderRadius.full,
              overflow: 'hidden',
              marginTop: designTokens.spacing[2],
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              style={{
                height: '100%',
                backgroundColor: designTokens.colors.blue[500],
                borderRadius: designTokens.borderRadius.full,
              }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.div>
        )}
        
        {/* V7.5 Enhanced Validation Feedback */}
        {showEnhancedFeedback && (
          <EnhancedValidationFeedback
            validationState={validationState}
            fieldState={fieldState}
            errorMessage={errorMessage}
            successMessage={successMessage}
            warningMessage={warningMessage}
            finalId={finalId}
            size={size}
          />
        )}
        
        {/* Helper Text (PRESERVED) */}
        {helperText && (
          <div
            id={`${finalId}-helper`}
            style={{
              fontSize: designTokens.typography.fontSize.sm,
              color: designTokens.colors.neutral[600],
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing[1],
              marginTop: designTokens.spacing[1],
            }}
          >
            <Info size={14} />
            {helperText}
          </div>
        )}
        
        {/* Validating State (PRESERVED) */}
        {fieldState.isValidating && (
          <div
            id={`${finalId}-validating`}
            style={{
              fontSize: designTokens.typography.fontSize.sm,
              color: designTokens.colors.blue[600],
              display: 'flex',
              alignItems: 'center',
              gap: designTokens.spacing[1],
              marginTop: designTokens.spacing[1],
            }}
          >
            <Loader2 size={14} className="animate-spin" />
            Validating...
          </div>
        )}
        
        {/* Screen Reader Description */}
        <div className="sr-only">
          Campo de validação enterprise com engine avançado, validação assíncrona, 
          histórico de validação e feedback visual profissional.
          {asyncValidationRules?.length && " Inclui validação assíncrona."}
          {realTimeValidation && " Validação em tempo real ativa."}
        </div>
      </Layout.Container>
    </Layout.Section>
  );
}));

FormValidation.displayName = 'FormValidation';

// Export validation engine for external use (PRESERVED)
export { useValidationEngine };

export default FormValidation; 