import React, { useState, useRef, useCallback, memo, forwardRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme as designTokens } from '../../design-system/tokens';

// ===== ALPHA TECHNICAL FOUNDATION: ADVANCED TYPESCRIPT INTERFACES =====

export interface FormInputProps {
  // Core Props
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';
  
  // V7.5 Enhanced Variants
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal' | 'floating';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // State Props
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  
  // Content Props
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  warningMessage?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  
  // Icon Props
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  clearable?: boolean;
  
  // Interaction Props
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  inputClassName?: string;
  labelClassName?: string;
  
  // Advanced Props
  debounceMs?: number;
  autoFocus?: boolean;
  autoComplete?: string;
  spellCheck?: boolean;
  'data-testid'?: string;
}

interface FormInputState {
  isFocused: boolean;
  hasValue: boolean;
  isHovered: boolean;
  showClearButton: boolean;
}

interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'error' | 'success' | 'warning' | 'none';
}

// ===== ALPHA PERFORMANCE OPTIMIZATION: HOOKS & UTILITIES =====

const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

const useFormInputState = (value?: string, defaultValue?: string): FormInputState => {
  const [state, setState] = useState<FormInputState>({
    isFocused: false,
    hasValue: Boolean(value || defaultValue),
    isHovered: false,
    showClearButton: false,
  });
  
  return state;
};

const getValidationState = (props: FormInputProps): ValidationState => {
  if (props.error && props.errorMessage) {
    return { isValid: false, message: props.errorMessage, type: 'error' };
  }
  if (props.success && props.successMessage) {
    return { isValid: true, message: props.successMessage, type: 'success' };
  }
  if (props.warning && props.warningMessage) {
    return { isValid: true, message: props.warningMessage, type: 'warning' };
  }
  return { isValid: true, message: '', type: 'none' };
};

// ===== BETA V7.5 ENHANCED: GLASS-MORPHISM VARIANTS =====

const getVariantStyles = (variant: string, state: FormInputState, validation: ValidationState) => {
  const baseStyles = {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: designTokens.borderRadius.lg,
  };

  const variants = {
    glass: {
      background: state.isFocused 
        ? 'rgba(255, 255, 255, 0.25)' 
        : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${state.isFocused 
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(255, 255, 255, 0.2)'}`,
      boxShadow: state.isFocused 
        ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(99, 102, 241, 0.2)' 
        : '0 4px 16px rgba(0, 0, 0, 0.05)',
    },
    
    outlined: {
      background: 'transparent',
      border: `2px solid ${state.isFocused 
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[300]}`,
      boxShadow: state.isFocused 
        ? `0 0 0 3px ${designTokens.colors.primary[100]}` 
        : 'none',
    },
    
    filled: {
      background: state.isFocused 
        ? designTokens.colors.neutral[50] 
        : designTokens.colors.neutral[100],
      border: `1px solid ${state.isFocused 
        ? designTokens.colors.primary[500] 
        : 'transparent'}`,
      borderRadius: designTokens.borderRadius.lg,
    },
    
    minimal: {
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid ${state.isFocused 
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[300]}`,
      borderRadius: 0,
      paddingLeft: 0,
    },
    
    floating: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${state.isFocused 
        ? designTokens.colors.primary[400] 
        : 'rgba(255, 255, 255, 0.1)'}`,
      boxShadow: state.isFocused 
        ? '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(99, 102, 241, 0.15)' 
        : '0 6px 20px rgba(0, 0, 0, 0.08)',
    },
  };

  let styles = { ...baseStyles, ...variants[variant as keyof typeof variants] };

  // Validation state overrides
  if (validation.type === 'error') {
    styles.border = `2px solid ${designTokens.colors.red[500]}`;
    styles.boxShadow = `0 0 0 3px ${designTokens.colors.red[100]}`;
  } else if (validation.type === 'success') {
    styles.border = `2px solid ${designTokens.colors.green[500]}`;
    styles.boxShadow = `0 0 0 3px ${designTokens.colors.green[100]}`;
  } else if (validation.type === 'warning') {
    styles.border = `2px solid ${designTokens.colors.yellow[500]}`;
    styles.boxShadow = `0 0 0 3px ${designTokens.colors.yellow[100]}`;
  }

  return styles;
};

const getSizeStyles = (size: string) => {
  const sizes = {
    sm: {
      height: '32px',
      fontSize: designTokens.typography.fontSize.sm,
      padding: '6px 12px',
    },
    md: {
      height: '40px', 
      fontSize: designTokens.typography.fontSize.base,
      padding: '8px 16px',
    },
    lg: {
      height: '48px',
      fontSize: designTokens.typography.fontSize.lg,
      padding: '12px 20px',
    },
    xl: {
      height: '56px',
      fontSize: designTokens.typography.fontSize.xl,
      padding: '16px 24px',
    },
  };
  
  return sizes[size as keyof typeof sizes] || sizes.md;
};

// ===== CHARLIE ACCESSIBILITY FRAMEWORK =====

const getAriaProps = (props: FormInputProps, validation: ValidationState, inputId: string) => ({
  'aria-invalid': validation.type === 'error',
  'aria-describedby': [
    props.helperText && `${inputId}-helper`,
    validation.message && `${inputId}-validation`,
  ].filter(Boolean).join(' ') || undefined,
  'aria-required': props.required,
  'aria-label': !props.label ? props.placeholder : undefined,
});

// ===== MAIN COMPONENT =====

export const FormInput = memo(forwardRef<HTMLInputElement, FormInputProps>(({
  // Core props
  id,
  name,
  value,
  defaultValue,
  placeholder,
  type = 'text',
  
  // V7.5 Enhanced props  
  variant = 'glass',
  size = 'md',
  
  // State props
  disabled = false,
  readOnly = false,
  required = false,
  error = false,
  success = false,
  warning = false,
  
  // Content props
  label,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
  maxLength,
  showCharacterCount = false,
  
  // Icon props
  startIcon,
  endIcon,
  clearable = false,
  
  // Interaction props
  onChange,
  onFocus,
  onBlur,
  onClear,
  onKeyDown,
  
  // Layout props
  fullWidth = false,
  className = '',
  style,
  inputClassName = '',
  labelClassName = '',
  
  // Advanced props
  debounceMs = 0,
  autoFocus = false,
  autoComplete,
  spellCheck,
  'data-testid': testId,
  
  ...restProps
}, ref) => {
  // ===== STATE MANAGEMENT =====
  const inputId = useId();
  const finalId = id || inputId;
  
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [state, setState] = useState<FormInputState>({
    isFocused: false,
    hasValue: Boolean(value || defaultValue),
    isHovered: false,
    showClearButton: false,
  });
  
  const currentValue = value !== undefined ? value : internalValue;
  const validation = getValidationState({ error, success, warning, errorMessage, successMessage, warningMessage });
  
  // ===== EVENT HANDLERS =====
  const debouncedOnChange = useDebounce(onChange, debounceMs);
  
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    setState(prev => ({ ...prev, hasValue: Boolean(newValue) }));
    
    if (debounceMs > 0 && debouncedOnChange) {
      debouncedOnChange(event);
    } else if (onChange) {
      onChange(event);
    }
  }, [value, onChange, debouncedOnChange, debounceMs]);
  
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, isFocused: true }));
    onFocus?.(event);
  }, [onFocus]);
  
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, isFocused: false }));
    onBlur?.(event);
  }, [onBlur]);
  
  const handleClear = useCallback(() => {
    const event = {
      target: { value: '' },
      currentTarget: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    
    if (value === undefined) {
      setInternalValue('');
    }
    
    setState(prev => ({ ...prev, hasValue: false }));
    onChange?.(event);
    onClear?.();
  }, [value, onChange, onClear]);
  
  // ===== STYLES =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    position: 'relative' as const,
  };
  
  const inputStyles = {
    ...getSizeStyles(size),
    ...getVariantStyles(variant, state, validation),
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: designTokens.colors.neutral[900],
    fontFamily: designTokens.typography.fontFamily.sans,
    fontWeight: designTokens.typography.fontWeight.normal,
    '::placeholder': {
      color: designTokens.colors.neutral[400],
      fontWeight: designTokens.typography.fontWeight.normal,
    },
  };
  
  const labelStyles = {
    display: 'block',
    marginBottom: designTokens.spacing[2],
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: validation.type === 'error' 
      ? designTokens.colors.red[700] 
      : designTokens.colors.neutral[700],
  };
  
  // ===== RENDER =====
  return (
    <div style={containerStyles} className={className}>
      {/* Label */}
      {label && (
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
      )}
      
      {/* Input Container */}
      <div style={{ position: 'relative' }}>
        {/* Start Icon */}
        {startIcon && (
          <div
            style={{
              position: 'absolute',
              left: getSizeStyles(size).padding.split(' ')[1],
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              color: designTokens.colors.neutral[500],
            }}
          >
            {startIcon}
          </div>
        )}
        
        {/* Input Element */}
        <motion.input
          ref={ref}
          id={finalId}
          name={name}
          type={type}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          data-testid={testId}
          style={{
            ...inputStyles,
            paddingLeft: startIcon 
              ? `calc(${getSizeStyles(size).padding.split(' ')[1]} + 24px)` 
              : getSizeStyles(size).padding.split(' ')[1],
            paddingRight: (endIcon || (clearable && state.hasValue)) 
              ? `calc(${getSizeStyles(size).padding.split(' ')[1]} + 24px)` 
              : getSizeStyles(size).padding.split(' ')[1],
          }}
          className={inputClassName}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          {...getAriaProps({ required, helperText, errorMessage, successMessage, warningMessage }, validation, finalId)}
          {...restProps}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.1 }}
        />
        
        {/* End Icons */}
        <div
          style={{
            position: 'absolute',
            right: getSizeStyles(size).padding.split(' ')[1],
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing[2],
            zIndex: 1,
          }}
        >
          {/* Clear Button */}
          <AnimatePresence>
            {clearable && state.hasValue && !disabled && (
              <motion.button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: 'pointer',
                  color: designTokens.colors.neutral[400],
                  borderRadius: designTokens.borderRadius.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ 
                  backgroundColor: designTokens.colors.neutral[100],
                  color: designTokens.colors.neutral[600],
                }}
                data-testid={`${testId}-clear`}
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* End Icon */}
          {endIcon && (
            <div style={{ color: designTokens.colors.neutral[500] }}>
              {endIcon}
            </div>
          )}
        </div>
      </div>
      
      {/* Helper Text / Validation Message */}
      <AnimatePresence>
        {(helperText || validation.message) && (
          <motion.div
            style={{
              marginTop: designTokens.spacing[1],
              fontSize: designTokens.typography.fontSize.sm,
              color: validation.type === 'error' 
                ? designTokens.colors.red[600]
                : validation.type === 'success'
                ? designTokens.colors.green[600] 
                : validation.type === 'warning'
                ? designTokens.colors.yellow[600]
                : designTokens.colors.neutral[600],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <span id={`${finalId}-${validation.message ? 'validation' : 'helper'}`}>
              {validation.message || helperText}
            </span>
            
            {/* Character Count */}
            {showCharacterCount && maxLength && (
              <span style={{ 
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.neutral[500],
              }}>
                {currentValue.length}/{maxLength}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}));

FormInput.displayName = 'FormInput';

export default FormInput; 