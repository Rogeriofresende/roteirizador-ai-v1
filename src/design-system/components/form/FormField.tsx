/**
 * 📝 FormField Component - Form Foundation
 * 
 * Wrapper component for form fields with comprehensive error handling
 * Label + Input + Error + Helper text integration with accessibility
 * 
 * Part of: WEEK 0 Days 3-4 - IA Beta Form Components
 * Integration: Design tokens + Migration patterns + Alpha cost tiers + Charlie monitoring
 */

import React, { 
  forwardRef, 
  ReactNode, 
  useState, 
  useEffect, 
  useRef,
  HTMLAttributes,
  cloneElement,
  isValidElement 
} from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../../tokens';
import { familiarElements, userComfortPatterns } from '../../migration-patterns';
import { formAccessibility, screenReaderSupport } from '../../accessibility';

// ============================================================================
// FORM FIELD TYPES & INTERFACES
// ============================================================================

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'custom';
  value?: string | number | RegExp;
  message: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Form field content (input, select, textarea, etc.) */
  children: ReactNode;
  
  /** Field label */
  label?: string;
  
  /** Field description/helper text */
  description?: string;
  
  /** Error message */
  error?: string;
  
  /** Success message */
  success?: string;
  
  /** Warning message */
  warning?: string;
  
  /** Field is required */
  required?: boolean;
  
  /** Field is disabled */
  disabled?: boolean;
  
  /** Field layout */
  layout?: 'vertical' | 'horizontal' | 'inline';
  
  /** Label position */
  labelPosition?: 'top' | 'left' | 'right' | 'inside';
  
  /** Field size */
  size?: 'small' | 'medium' | 'large';
  
  /** Migration mode for styling */
  migrationMode?: 'familiar' | 'enhanced';
  
  /** Cost tier for Alpha integration */
  costTier?: 'free' | 'premium';
  
  /** Analytics tracking for Charlie integration */
  trackingId?: string;
  
  /** Validation rules */
  validationRules?: ValidationRule[];
  
  /** Validate on change */
  validateOnChange?: boolean;
  
  /** Validate on blur */
  validateOnBlur?: boolean;
  
  /** Show validation icons */
  showValidationIcons?: boolean;
  
  /** Field tooltip */
  tooltip?: string;
  
  /** Character count display */
  showCharCount?: boolean;
  
  /** Maximum character count */
  maxLength?: number;
  
  /** Field is loading */
  loading?: boolean;
  
  /** Custom field ID */
  fieldId?: string;
  
  /** Callback when validation state changes */
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  
  /** Callback when field value changes */
  onValueChange?: (value: any) => void;
  
  /** Callback when field is focused */
  onFieldFocus?: () => void;
  
  /** Callback when field loses focus */
  onFieldBlur?: () => void;
}

// ============================================================================
// FORM FIELD STYLES
// ============================================================================

const getFormFieldStyles = (
  layout: FormFieldProps['layout'] = 'vertical',
  size: FormFieldProps['size'] = 'medium',
  migrationMode: FormFieldProps['migrationMode'] = 'enhanced',
  disabled: boolean = false
): React.CSSProperties => {
  
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    opacity: disabled ? 0.6 : 1,
    transition: transitions.common.all
  };
  
  const layoutStyles: Record<string, React.CSSProperties> = {
    vertical: {
      flexDirection: 'column',
      gap: spacing[2]
    },
    horizontal: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing[4]
    },
    inline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3]
    }
  };
  
  return {
    ...baseStyles,
    ...layoutStyles[layout]
  };
};

const getLabelStyles = (
  labelPosition: FormFieldProps['labelPosition'] = 'top',
  size: FormFieldProps['size'] = 'medium',
  required: boolean = false,
  disabled: boolean = false
): React.CSSProperties => {
  
  const baseStyles: React.CSSProperties = {
    fontSize: size === 'small' ? typography.fontSize.sm : typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: disabled ? colors.neutral[400] : colors.neutral[700],
    lineHeight: typography.lineHeight.normal,
    userSelect: 'none'
  };
  
  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      marginBottom: spacing[1]
    },
    left: {
      minWidth: '120px',
      textAlign: 'right',
      paddingRight: spacing[3]
    },
    right: {
      minWidth: '120px',
      textAlign: 'left',
      paddingLeft: spacing[3]
    },
    inside: {
      position: 'absolute',
      top: spacing[2],
      left: spacing[3],
      fontSize: typography.fontSize.xs,
      zIndex: 1
    }
  };
  
  return {
    ...baseStyles,
    ...positionStyles[labelPosition]
  };
};

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({
    children,
    label,
    description,
    error,
    success,
    warning,
    required = false,
    disabled = false,
    layout = 'vertical',
    labelPosition = 'top',
    size = 'medium',
    migrationMode = 'enhanced',
    costTier = 'free',
    trackingId,
    validationRules = [],
    validateOnChange = true,
    validateOnBlur = true,
    showValidationIcons = true,
    tooltip,
    showCharCount = false,
    maxLength,
    loading = false,
    fieldId,
    onValidationChange,
    onValueChange,
    onFieldFocus,
    onFieldBlur,
    className = '',
    ...props
  }, ref) => {
    
    const [fieldValue, setFieldValue] = useState<any>('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isValid, setIsValid] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    const [hasBeenTouched, setHasBeenTouched] = useState(false);
    
    const fieldRef = useRef<HTMLDivElement>(null);
    const uniqueId = fieldId || `form-field-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validation function
    const validateField = async (value: any): Promise<{ isValid: boolean; errors: string[] }> => {
      const errors: string[] = [];
      
      for (const rule of validationRules) {
        let isRuleValid = true;
        
        switch (rule.type) {
          case 'required':
            isRuleValid = value !== null && value !== undefined && value !== '';
            break;
            
          case 'minLength':
            isRuleValid = typeof value === 'string' && value.length >= (rule.value as number);
            break;
            
          case 'maxLength':
            isRuleValid = typeof value === 'string' && value.length <= (rule.value as number);
            break;
            
          case 'pattern':
            isRuleValid = typeof value === 'string' && (rule.value as RegExp).test(value);
            break;
            
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isRuleValid = typeof value === 'string' && emailRegex.test(value);
            break;
            
          case 'custom':
            if (rule.validator) {
              isRuleValid = await rule.validator(value);
            }
            break;
        }
        
        if (!isRuleValid) {
          errors.push(rule.message);
        }
      }
      
      return { isValid: errors.length === 0, errors };
    };
    
    // Handle field value change
    const handleValueChange = async (value: any) => {
      setFieldValue(value);
      onValueChange?.(value);
      
      if (validateOnChange && hasBeenTouched) {
        const validation = await validateField(value);
        setValidationErrors(validation.errors);
        setIsValid(validation.isValid);
        onValidationChange?.(validation.isValid, validation.errors);
      }
      
      // Analytics tracking
      if (trackingId && typeof window !== 'undefined') {
        const trackingData = {
          component: 'FormField',
          action: 'value_changed',
          fieldId: uniqueId,
          label,
          size,
          migrationMode,
          costTier,
          trackingId,
          valueLength: typeof value === 'string' ? value.length : 0,
          timestamp: new Date().toISOString()
        };
        
        window.dispatchEvent(new CustomEvent('design-system-interaction', {
          detail: trackingData
        }));
      }
    };
    
    // Handle field focus
    const handleFieldFocus = () => {
      setIsFocused(true);
      onFieldFocus?.();
      
      // Screen reader announcement for tooltip
      if (tooltip) {
        screenReaderSupport.announceToScreenReader(tooltip, 'polite');
      }
    };
    
    // Handle field blur
    const handleFieldBlur = async () => {
      setIsFocused(false);
      setHasBeenTouched(true);
      onFieldBlur?.();
      
      if (validateOnBlur) {
        const validation = await validateField(fieldValue);
        setValidationErrors(validation.errors);
        setIsValid(validation.isValid);
        onValidationChange?.(validation.isValid, validation.errors);
      }
    };
    
    // Clone children with additional props
    const enhancedChildren = React.Children.map(children, (child) => {
      if (isValidElement(child)) {
        return cloneElement(child, {
          id: uniqueId,
          disabled: disabled || loading,
          'aria-invalid': !isValid,
          'aria-describedby': [
            description ? `${uniqueId}-description` : '',
            error || validationErrors.length > 0 ? `${uniqueId}-error` : '',
            success ? `${uniqueId}-success` : '',
            warning ? `${uniqueId}-warning` : ''
          ].filter(Boolean).join(' ') || undefined,
          onFocus: handleFieldFocus,
          onBlur: handleFieldBlur,
          onChange: (e: any) => {
            const value = e.target ? e.target.value : e;
            handleValueChange(value);
            child.props.onChange?.(e);
          },
          ...child.props
        });
      }
      return child;
    });
    
    // Get current error message
    const getCurrentError = () => {
      if (error) return error;
      if (validationErrors.length > 0) return validationErrors[0];
      return null;
    };
    
    // Get validation state
    const getValidationState = () => {
      if (getCurrentError()) return 'error';
      if (success) return 'success';
      if (warning) return 'warning';
      return 'neutral';
    };
    
    // Get validation icon
    const getValidationIcon = () => {
      if (!showValidationIcons) return null;
      
      const state = getValidationState();
      const iconStyles: React.CSSProperties = {
        fontSize: size === 'small' ? '14px' : '16px',
        marginLeft: spacing[2]
      };
      
      switch (state) {
        case 'error':
          return <span style={{ ...iconStyles, color: colors.error[500] }}>⚠️</span>;
        case 'success':
          return <span style={{ ...iconStyles, color: colors.success[500] }}>✅</span>;
        case 'warning':
          return <span style={{ ...iconStyles, color: colors.warning[500] }}>⚠️</span>;
        default:
          return null;
      }
    };
    
    // Character count
    const charCount = typeof fieldValue === 'string' ? fieldValue.length : 0;
    const isOverLimit = maxLength && charCount > maxLength;
    
    // Get computed styles
    const fieldStyles = getFormFieldStyles(layout, size, migrationMode, disabled);
    const labelStyles = getLabelStyles(labelPosition, size, required, disabled);
    
    // Message styles
    const messageStyles: React.CSSProperties = {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      margin: 0,
      display: 'flex',
      alignItems: 'center'
    };
    
    const renderLabel = () => {
      if (!label) return null;
      
      return (
        <label 
          htmlFor={uniqueId}
          style={labelStyles}
          className="form-field-label"
        >
          {label}
          {required && (
            <span 
              style={{ 
                color: colors.error[500], 
                marginLeft: spacing[1] 
              }}
              aria-label="obrigatório"
            >
              *
            </span>
          )}
          {tooltip && (
            <span 
              style={{ 
                marginLeft: spacing[2],
                cursor: 'help',
                color: colors.neutral[500]
              }}
              title={tooltip}
              aria-label={`Dica: ${tooltip}`}
            >
              ℹ️
            </span>
          )}
        </label>
      );
    };
    
    const renderMessages = () => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Description */}
          {description && !getCurrentError() && !success && !warning && (
            <p
              id={`${uniqueId}-description`}
              style={{
                ...messageStyles,
                color: colors.neutral[600]
              }}
            >
              {description}
            </p>
          )}
          
          {/* Error Message */}
          {getCurrentError() && (
            <p
              id={`${uniqueId}-error`}
              role="alert"
              style={{
                ...messageStyles,
                color: colors.error[600],
                fontWeight: typography.fontWeight.medium
              }}
            >
              {getCurrentError()}
              {getValidationIcon()}
            </p>
          )}
          
          {/* Success Message */}
          {success && !getCurrentError() && (
            <p
              id={`${uniqueId}-success`}
              style={{
                ...messageStyles,
                color: colors.success[600],
                fontWeight: typography.fontWeight.medium
              }}
            >
              {success}
              {getValidationIcon()}
            </p>
          )}
          
          {/* Warning Message */}
          {warning && !getCurrentError() && !success && (
            <p
              id={`${uniqueId}-warning`}
              style={{
                ...messageStyles,
                color: colors.warning[600],
                fontWeight: typography.fontWeight.medium
              }}
            >
              {warning}
              {getValidationIcon()}
            </p>
          )}
        </div>
        
        {/* Character Count */}
        {showCharCount && maxLength && (
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: isOverLimit ? colors.error[500] : colors.neutral[500],
              fontWeight: isOverLimit ? typography.fontWeight.medium : typography.fontWeight.normal,
              marginLeft: spacing[3],
              whiteSpace: 'nowrap'
            }}
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    );
    
    return (
      <div
        ref={ref}
        className={`design-system-form-field ${className}`}
        style={fieldStyles}
        data-layout={layout}
        data-label-position={labelPosition}
        data-size={size}
        data-migration-mode={migrationMode}
        data-cost-tier={costTier}
        data-tracking-id={trackingId}
        data-validation-state={getValidationState()}
        data-required={required}
        data-disabled={disabled}
        data-loading={loading}
        {...props}
      >
        {/* Label (for top/left positions) */}
        {(labelPosition === 'top' || labelPosition === 'left') && renderLabel()}
        
        {/* Field Content */}
        <div style={{ 
          flex: layout === 'horizontal' ? 1 : undefined,
          position: labelPosition === 'inside' ? 'relative' : undefined 
        }}>
          {/* Label (for inside position) */}
          {labelPosition === 'inside' && renderLabel()}
          
          {/* Enhanced Children */}
          <div style={{ position: 'relative' }}>
            {enhancedChildren}
            
            {/* Loading Overlay */}
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: borderRadius.md,
                zIndex: 1
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: `2px solid ${colors.primary[500]}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            )}
          </div>
          
          {/* Messages */}
          {renderMessages()}
        </div>
        
        {/* Label (for right position) */}
        {labelPosition === 'right' && renderLabel()}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// ============================================================================
// FORM FIELD HOOKS
// ============================================================================

export const useFormValidation = (rules: ValidationRule[]) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);
  
  const validate = async (value: any) => {
    const validationErrors: string[] = [];
    
    for (const rule of rules) {
      let isRuleValid = true;
      
      switch (rule.type) {
        case 'required':
          isRuleValid = value !== null && value !== undefined && value !== '';
          break;
        case 'minLength':
          isRuleValid = typeof value === 'string' && value.length >= (rule.value as number);
          break;
        case 'maxLength':
          isRuleValid = typeof value === 'string' && value.length <= (rule.value as number);
          break;
        case 'pattern':
          isRuleValid = typeof value === 'string' && (rule.value as RegExp).test(value);
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isRuleValid = typeof value === 'string' && emailRegex.test(value);
          break;
        case 'custom':
          if (rule.validator) {
            isRuleValid = await rule.validator(value);
          }
          break;
      }
      
      if (!isRuleValid) {
        validationErrors.push(rule.message);
      }
    }
    
    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
    
    return { isValid: validationErrors.length === 0, errors: validationErrors };
  };
  
  return { errors, isValid, validate };
};

// ============================================================================
// VALIDATION RULES HELPERS
// ============================================================================

export const ValidationRules = {
  required: (message = 'Este campo é obrigatório'): ValidationRule => ({
    type: 'required',
    message
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `Mínimo de ${length} caracteres`
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `Máximo de ${length} caracteres`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message
  }),
  
  email: (message = 'Email inválido'): ValidationRule => ({
    type: 'email',
    message
  }),
  
  custom: (validator: (value: any) => boolean | Promise<boolean>, message: string): ValidationRule => ({
    type: 'custom',
    validator,
    message
  })
};

// ============================================================================
// EXPORT ALL FORM FIELD COMPONENTS
// ============================================================================

export default FormField;

export {
  type FormFieldProps,
  type ValidationRule
}; 