import React, { useState, useRef, useCallback, memo, forwardRef, useId, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { theme as designTokens } from '../../design-system/tokens';

// ===== ALPHA TECHNICAL FOUNDATION: ADVANCED TYPESCRIPT INTERFACES =====

export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

export interface CheckboxGroup {
  label: string;
  options: CheckboxOption[];
  disabled?: boolean;
  required?: boolean;
}

export interface FormCheckboxProps {
  // Core Props
  id?: string;
  name?: string;
  value?: boolean | string | string[];
  defaultValue?: boolean | string | string[];
  
  // V7.5 Enhanced Variants
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // State Props
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  indeterminate?: boolean;
  
  // Content Props
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  warningMessage?: string;
  
  // Checkbox Specific Props
  option?: CheckboxOption;
  options?: CheckboxOption[];
  group?: CheckboxGroup;
  groups?: CheckboxGroup[];
  
  // Group Props
  groupDirection?: 'horizontal' | 'vertical';
  showSelectAll?: boolean;
  selectAllLabel?: string;
  maxSelections?: number;
  minSelections?: number;
  
  // Custom Styling
  checkboxSize?: number;
  borderRadius?: string;
  animationDuration?: number;
  
  // Interaction Props
  onChange?: (value: boolean | string | string[], event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onGroupChange?: (groupValue: string[], selectedOptions: CheckboxOption[]) => void;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  checkboxClassName?: string;
  labelClassName?: string;
  groupClassName?: string;
  
  // Advanced Props
  autoFocus?: boolean;
  'data-testid'?: string;
}

interface FormCheckboxState {
  isChecked: boolean;
  isFocused: boolean;
  isHovered: boolean;
  selectedValues: string[];
  indeterminateState: boolean;
}

interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'error' | 'success' | 'warning' | 'none';
}

interface GroupState {
  selectedOptions: CheckboxOption[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

// ===== ALPHA PERFORMANCE OPTIMIZATION: HOOKS =====

const useCheckboxState = (
  value: boolean | string | string[] | undefined,
  options: CheckboxOption[] | undefined,
  isGroup: boolean
) => {
  return useMemo(() => {
    if (isGroup && options) {
      if (Array.isArray(value)) {
        return {
          selectedValues: value,
          selectedOptions: options.filter(option => value.includes(option.value)),
        };
      }
      return { selectedValues: [], selectedOptions: [] };
    }
    
    if (typeof value === 'boolean') {
      return { isChecked: value };
    }
    
    if (typeof value === 'string' && options) {
      return { isChecked: options.some(option => option.value === value) };
    }
    
    return { isChecked: false };
  }, [value, options, isGroup]);
};

const useGroupState = (
  options: CheckboxOption[] | undefined,
  selectedValues: string[]
) => {
  return useMemo((): GroupState => {
    if (!options || options.length === 0) {
      return { selectedOptions: [], isAllSelected: false, isIndeterminate: false };
    }
    
    const enabledOptions = options.filter(option => !option.disabled);
    const selectedOptions = options.filter(option => selectedValues.includes(option.value));
    const selectedEnabledCount = selectedOptions.filter(option => !option.disabled).length;
    
    const isAllSelected = enabledOptions.length > 0 && selectedEnabledCount === enabledOptions.length;
    const isIndeterminate = selectedEnabledCount > 0 && selectedEnabledCount < enabledOptions.length;
    
    return {
      selectedOptions,
      isAllSelected,
      isIndeterminate,
    };
  }, [options, selectedValues]);
};

const useValidation = (
  props: FormCheckboxProps,
  selectedValues: string[],
  isGroup: boolean
) => {
  return useMemo((): ValidationState => {
    const { error, success, warning, errorMessage, successMessage, warningMessage, required, minSelections, maxSelections } = props;
    
    if (error) {
      return {
        isValid: false,
        message: errorMessage || 'Please fix the error',
        type: 'error',
      };
    }
    
    if (success) {
      return {
        isValid: true,
        message: successMessage || 'Success',
        type: 'success',
      };
    }
    
    if (warning) {
      return {
        isValid: true,
        message: warningMessage || 'Warning',
        type: 'warning',
      };
    }
    
    // Validation for groups
    if (isGroup && required && selectedValues.length === 0) {
      return {
        isValid: false,
        message: 'Please select at least one option',
        type: 'error',
      };
    }
    
    if (isGroup && minSelections && selectedValues.length < minSelections) {
      return {
        isValid: false,
        message: `Please select at least ${minSelections} option(s)`,
        type: 'error',
      };
    }
    
    if (isGroup && maxSelections && selectedValues.length > maxSelections) {
      return {
        isValid: false,
        message: `Please select no more than ${maxSelections} option(s)`,
        type: 'error',
      };
    }
    
    return {
      isValid: true,
      message: '',
      type: 'none',
    };
  }, [props, selectedValues, isGroup]);
};

// ===== BETA V7.5 ENHANCED: GLASS-MORPHISM VARIANTS =====

const getVariantStyles = (variant: string, state: FormCheckboxState, validation: ValidationState, size: string) => {
  const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };
  
  const checkboxSize = sizeMap[size as keyof typeof sizeMap] || 20;
  
  const baseStyles = {
    width: `${checkboxSize}px`,
    height: `${checkboxSize}px`,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: designTokens.borderRadius.sm,
    cursor: 'pointer',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const variants = {
    glass: {
      background: state.isChecked || state.indeterminateState
        ? 'rgba(99, 102, 241, 0.8)' 
        : state.isFocused
        ? 'rgba(255, 255, 255, 0.25)' 
        : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: `2px solid ${state.isChecked || state.indeterminateState
        ? 'rgba(99, 102, 241, 0.8)' 
        : state.isFocused
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(255, 255, 255, 0.2)'}`,
      boxShadow: state.isFocused
        ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(99, 102, 241, 0.2)' 
        : '0 4px 16px rgba(0, 0, 0, 0.05)',
    },
    
    outlined: {
      background: state.isChecked || state.indeterminateState
        ? designTokens.colors.primary[500] 
        : 'transparent',
      border: `2px solid ${state.isChecked || state.indeterminateState || state.isFocused
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[300]}`,
      boxShadow: state.isFocused
        ? `0 0 0 3px ${designTokens.colors.primary[100]}` 
        : 'none',
    },
    
    filled: {
      background: state.isChecked || state.indeterminateState
        ? designTokens.colors.primary[500] 
        : state.isFocused
        ? designTokens.colors.neutral[50] 
        : designTokens.colors.neutral[100],
      border: `1px solid ${state.isChecked || state.indeterminateState || state.isFocused
        ? designTokens.colors.primary[500] 
        : 'transparent'}`,
    },
    
    minimal: {
      background: state.isChecked || state.indeterminateState
        ? designTokens.colors.primary[500] 
        : 'transparent',
      border: `2px solid ${state.isChecked || state.indeterminateState || state.isFocused
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[400]}`,
      borderRadius: '2px',
    },
  };

  let styles = { ...baseStyles, ...variants[variant as keyof typeof variants] };

  // Validation state overrides
  if (validation.type === 'error') {
    styles.border = `2px solid ${designTokens.colors.red[500]}`;
    if (state.isFocused) {
      styles.boxShadow = `0 0 0 3px ${designTokens.colors.red[100]}`;
    }
  } else if (validation.type === 'success') {
    styles.border = `2px solid ${designTokens.colors.green[500]}`;
    if (state.isFocused) {
      styles.boxShadow = `0 0 0 3px ${designTokens.colors.green[100]}`;
    }
  } else if (validation.type === 'warning') {
    styles.border = `2px solid ${designTokens.colors.yellow[500]}`;
    if (state.isFocused) {
      styles.boxShadow = `0 0 0 3px ${designTokens.colors.yellow[100]}`;
    }
  }

  return styles;
};

const getLabelStyles = (size: string, disabled: boolean, validation: ValidationState) => {
  const sizeStyles = {
    sm: {
      fontSize: designTokens.typography.fontSize.sm,
      lineHeight: '1.4',
    },
    md: {
      fontSize: designTokens.typography.fontSize.base,
      lineHeight: '1.5',
    },
    lg: {
      fontSize: designTokens.typography.fontSize.lg,
      lineHeight: '1.6',
    },
    xl: {
      fontSize: designTokens.typography.fontSize.xl,
      lineHeight: '1.7',
    },
  };

  return {
    ...sizeStyles[size as keyof typeof sizeStyles],
    fontWeight: designTokens.typography.fontWeight.medium,
    color: disabled
      ? designTokens.colors.neutral[400]
      : validation.type === 'error'
      ? designTokens.colors.red[700]
      : designTokens.colors.neutral[700],
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none' as const,
    marginLeft: designTokens.spacing[2],
    flex: 1,
  };
};

// ===== CHARLIE ACCESSIBILITY FRAMEWORK =====

const getAriaProps = (
  props: FormCheckboxProps,
  validation: ValidationState,
  checkboxId: string,
  isChecked: boolean,
  indeterminate: boolean
) => ({
  'aria-invalid': validation.type === 'error',
  'aria-describedby': [
    props.helperText && `${checkboxId}-helper`,
    validation.message && `${checkboxId}-validation`,
  ].filter(Boolean).join(' ') || undefined,
  'aria-required': props.required,
  'aria-checked': indeterminate ? 'mixed' : isChecked,
  role: 'checkbox',
});

// ===== CHECKBOX COMPONENT =====

const CheckboxInput: React.FC<{
  option?: CheckboxOption;
  isChecked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  variant: string;
  size: string;
  validation: ValidationState;
  onChange: (checked: boolean, value?: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  checkboxId: string;
  name?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
  'data-testid'?: string;
}> = ({
  option,
  isChecked,
  indeterminate = false,
  disabled = false,
  variant,
  size,
  validation,
  onChange,
  onFocus,
  onBlur,
  checkboxId,
  name,
  required,
  helperText,
  className = '',
  'data-testid': testId,
}) => {
  const [state, setState] = useState({
    isChecked,
    isFocused: false,
    isHovered: false,
    selectedValues: [],
    indeterminateState: indeterminate,
  });

  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isChecked, 
      indeterminateState: indeterminate 
    }));
  }, [isChecked, indeterminate]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setState(prev => ({ 
      ...prev, 
      isChecked: checked, 
      indeterminateState: false 
    }));
    onChange(checked, option?.value);
  }, [onChange, option?.value]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, isFocused: true }));
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, isFocused: false }));
    onBlur?.(event);
  }, [onBlur]);

  const checkboxStyles = getVariantStyles(variant, state, validation, size);
  const labelStyles = getLabelStyles(size, disabled, validation);

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : size === 'lg' ? 16 : 18;

  return (
    <motion.label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: designTokens.spacing[2],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      className={className}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onMouseEnter={() => setState(prev => ({ ...prev, isHovered: true }))}
      onMouseLeave={() => setState(prev => ({ ...prev, isHovered: false }))}
    >
      <div style={{ position: 'relative' }}>
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={state.isChecked}
          disabled={disabled}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={testId}
          style={{
            position: 'absolute',
            opacity: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...getAriaProps({ required, helperText }, validation, checkboxId, state.isChecked, state.indeterminateState)}
        />
        
        <motion.div
          style={checkboxStyles}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          transition={{ duration: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {state.indeterminateState ? (
              <motion.div
                key="indeterminate"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Minus 
                  size={iconSize} 
                  color={variant === 'glass' || state.isChecked ? 'white' : designTokens.colors.primary[500]} 
                />
              </motion.div>
            ) : state.isChecked ? (
              <motion.div
                key="checked"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check 
                  size={iconSize} 
                  color={variant === 'glass' || state.isChecked ? 'white' : designTokens.colors.primary[500]} 
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={labelStyles}>
          {option?.icon && (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              marginRight: designTokens.spacing[1] 
            }}>
              {option.icon}
            </span>
          )}
          {option?.label}
        </div>
        {option?.description && (
          <div style={{
            fontSize: designTokens.typography.fontSize.sm,
            color: disabled 
              ? designTokens.colors.neutral[400] 
              : designTokens.colors.neutral[500],
            marginTop: '2px',
            marginLeft: designTokens.spacing[2],
          }}>
            {option.description}
          </div>
        )}
      </div>
    </motion.label>
  );
};

// ===== MAIN COMPONENT =====

export const FormCheckbox = memo(forwardRef<HTMLInputElement, FormCheckboxProps>(({
  // Core props
  id,
  name,
  value,
  defaultValue,
  
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
  indeterminate = false,
  
  // Content props
  label,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
  
  // Checkbox specific props
  option,
  options = [],
  group,
  groups = [],
  
  // Group props
  groupDirection = 'vertical',
  showSelectAll = false,
  selectAllLabel = 'Select All',
  maxSelections,
  minSelections,
  
  // Interaction props
  onChange,
  onFocus,
  onBlur,
  onGroupChange,
  
  // Layout props
  fullWidth = false,
  className = '',
  style,
  checkboxClassName = '',
  labelClassName = '',
  groupClassName = '',
  
  // Advanced props
  autoFocus = false,
  'data-testid': testId,
  
  ...restProps
}, ref) => {
  // ===== STATE MANAGEMENT =====
  const checkboxId = useId();
  const finalId = id || checkboxId;
  
  const isGroup = !!(options.length > 0 || groups.length > 0);
  const isSingleOption = !!option;
  
  const [internalValue, setInternalValue] = useState(() => {
    if (defaultValue !== undefined) return defaultValue;
    if (isGroup) return [];
    return false;
  });
  
  const currentValue = value !== undefined ? value : internalValue;
  const selectedValues = Array.isArray(currentValue) ? currentValue : [];
  
  const checkboxState = useCheckboxState(currentValue, options, isGroup);
  const groupState = useGroupState(options, selectedValues);
  const validation = useValidation({ error, success, warning, errorMessage, successMessage, warningMessage, required, minSelections, maxSelections }, selectedValues, isGroup);
  
  // ===== EVENT HANDLERS =====
  const handleSingleChange = useCallback((checked: boolean, optionValue?: string) => {
    let newValue: boolean | string;
    
    if (optionValue) {
      newValue = optionValue;
    } else {
      newValue = checked;
    }
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue, { target: { checked, value: optionValue } } as React.ChangeEvent<HTMLInputElement>);
  }, [value, onChange]);
  
  const handleGroupChange = useCallback((checked: boolean, optionValue: string) => {
    let newSelectedValues: string[];
    
    if (checked) {
      // Add to selection
      if (maxSelections && selectedValues.length >= maxSelections) return;
      newSelectedValues = [...selectedValues, optionValue];
    } else {
      // Remove from selection
      newSelectedValues = selectedValues.filter(val => val !== optionValue);
    }
    
    if (value === undefined) {
      setInternalValue(newSelectedValues);
    }
    
    const selectedOptions = options.filter(opt => newSelectedValues.includes(opt.value));
    onChange?.(newSelectedValues, { target: { value: newSelectedValues } } as any);
    onGroupChange?.(newSelectedValues, selectedOptions);
  }, [selectedValues, maxSelections, value, onChange, onGroupChange, options]);
  
  const handleSelectAll = useCallback(() => {
    const enabledOptions = options.filter(opt => !opt.disabled);
    const newSelectedValues = groupState.isAllSelected ? [] : enabledOptions.map(opt => opt.value);
    
    if (value === undefined) {
      setInternalValue(newSelectedValues);
    }
    
    const selectedOptions = options.filter(opt => newSelectedValues.includes(opt.value));
    onChange?.(newSelectedValues, { target: { value: newSelectedValues } } as any);
    onGroupChange?.(newSelectedValues, selectedOptions);
  }, [groupState.isAllSelected, options, value, onChange, onGroupChange]);
  
  // ===== STYLES =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };
  
  const groupStyles = {
    display: 'flex',
    flexDirection: groupDirection === 'horizontal' ? 'row' as const : 'column' as const,
    gap: groupDirection === 'horizontal' ? designTokens.spacing[4] : designTokens.spacing[3],
    flexWrap: groupDirection === 'horizontal' ? 'wrap' as const : 'nowrap' as const,
  };
  
  const mainLabelStyles = {
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
      {/* Main Label */}
      {label && (
        <motion.label
          style={mainLabelStyles}
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
      
      {/* Single Checkbox */}
      {!isGroup && (
        <CheckboxInput
          option={option}
          isChecked={checkboxState.isChecked || false}
          indeterminate={indeterminate}
          disabled={disabled}
          variant={variant}
          size={size}
          validation={validation}
          onChange={handleSingleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          checkboxId={finalId}
          name={name}
          required={required}
          helperText={helperText}
          className={checkboxClassName}
          data-testid={testId}
        />
      )}
      
      {/* Checkbox Group */}
      {isGroup && (
        <div className={groupClassName}>
          {/* Select All */}
          {showSelectAll && options.length > 0 && (
            <motion.div
              style={{ marginBottom: designTokens.spacing[3] }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
            >
              <CheckboxInput
                option={{ value: 'select-all', label: selectAllLabel }}
                isChecked={groupState.isAllSelected}
                indeterminate={groupState.isIndeterminate}
                disabled={disabled}
                variant={variant}
                size={size}
                validation={validation}
                onChange={handleSelectAll}
                checkboxId={`${finalId}-select-all`}
                name={`${name}-select-all`}
                className={checkboxClassName}
                data-testid={testId ? `${testId}-select-all` : undefined}
              />
            </motion.div>
          )}
          
          {/* Options */}
          <div style={groupStyles}>
            {options.map((option, index) => (
              <CheckboxInput
                key={option.value}
                option={option}
                isChecked={selectedValues.includes(option.value)}
                disabled={disabled || option.disabled}
                variant={variant}
                size={size}
                validation={validation}
                onChange={(checked) => handleGroupChange(checked, option.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                checkboxId={`${finalId}-${option.value}`}
                name={name}
                className={checkboxClassName}
                data-testid={testId ? `${testId}-${option.value}` : undefined}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Footer Information */}
      <AnimatePresence>
        {(helperText || validation.message || (isGroup && (maxSelections || minSelections))) && (
          <motion.div
            style={{
              marginTop: designTokens.spacing[2],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: designTokens.spacing[2],
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Helper Text / Validation Message */}
            <div style={{ flex: 1 }}>
              {validation.message && (
                <div
                  id={`${finalId}-validation`}
                  style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: validation.type === 'error' 
                      ? designTokens.colors.red[600]
                      : validation.type === 'success'
                      ? designTokens.colors.green[600] 
                      : validation.type === 'warning'
                      ? designTokens.colors.yellow[600]
                      : designTokens.colors.neutral[600],
                    marginBottom: helperText ? designTokens.spacing[1] : 0,
                  }}
                >
                  {validation.message}
                </div>
              )}
              
              {helperText && (
                <div
                  id={`${finalId}-helper`}
                  style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[600],
                  }}
                >
                  {helperText}
                </div>
              )}
            </div>
            
            {/* Selection Info */}
            {isGroup && (
              <div style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.neutral[500],
                flexShrink: 0,
              }}>
                {selectedValues.length} of {options.length} selected
                {maxSelections && ` (max ${maxSelections})`}
                {minSelections && ` (min ${minSelections})`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}));

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox; 