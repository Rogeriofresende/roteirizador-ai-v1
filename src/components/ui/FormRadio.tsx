import React, { useState, useRef, useCallback, memo, forwardRef, useId, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle } from 'lucide-react';
import { theme as designTokens } from '../../design-system/tokens';
import { cn } from '../../lib/utils';

// ===== ALPHA TECHNICAL FOUNDATION: ADVANCED TYPESCRIPT INTERFACES =====

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
  badge?: string;
  highlight?: boolean;
}

export interface RadioGroup {
  label: string;
  options: RadioOption[];
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

export interface FormRadioProps {
  // Core Props
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  
  // V7.5 Enhanced Variants
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Radio Specific Styling
  radioStyle?: 'default' | 'card' | 'button' | 'tile';
  
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
  
  // Radio Specific Props
  option?: RadioOption;
  options?: RadioOption[];
  group?: RadioGroup;
  groups?: RadioGroup[];
  
  // Group Props
  groupDirection?: 'horizontal' | 'vertical' | 'grid';
  gridColumns?: number;
  allowDeselect?: boolean;
  
  // Custom Styling
  radioSize?: number;
  borderRadius?: string;
  animationDuration?: number;
  cardPadding?: string;
  
  // Interaction Props
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onGroupChange?: (value: string, selectedOption: RadioOption) => void;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  radioClassName?: string;
  labelClassName?: string;
  groupClassName?: string;
  
  // Advanced Props
  autoFocus?: boolean;
  'data-testid'?: string;
}

interface FormRadioState {
  selectedValue: string | null;
  isFocused: boolean;
  isHovered: boolean;
  focusedIndex: number;
}

interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'error' | 'success' | 'warning' | 'none';
}

interface KeyboardNavigationState {
  currentIndex: number;
  isNavigating: boolean;
}

// ===== ALPHA PERFORMANCE OPTIMIZATION: HOOKS =====

const useRadioState = (
  value: string | undefined,
  defaultValue: string | undefined,
  options: RadioOption[] | undefined
) => {
  return useMemo(() => {
    const currentValue = value !== undefined ? value : defaultValue;
    const selectedOption = options?.find(option => option.value === currentValue);
    
    return {
      selectedValue: currentValue || null,
      selectedOption: selectedOption || null,
      hasSelection: !!currentValue,
    };
  }, [value, defaultValue, options]);
};

const useKeyboardNavigation = (
  options: RadioOption[] | undefined,
  onChange: ((value: string, event: React.ChangeEvent<HTMLInputElement>) => void) | undefined,
  disabled: boolean
) => {
  const [navigationState, setNavigationState] = useState<KeyboardNavigationState>({
    currentIndex: -1,
    isNavigating: false,
  });
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!options || disabled) return;
    
    const enabledOptions = options.filter(option => !option.disabled);
    if (enabledOptions.length === 0) return;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setNavigationState(prev => {
          const nextIndex = (prev.currentIndex + 1) % enabledOptions.length;
          const nextOption = enabledOptions[nextIndex];
          onChange?.(nextOption.value, { target: { value: nextOption.value } } as React.ChangeEvent<HTMLInputElement>);
          return { currentIndex: nextIndex, isNavigating: true };
        });
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setNavigationState(prev => {
          const prevIndex = prev.currentIndex <= 0 ? enabledOptions.length - 1 : prev.currentIndex - 1;
          const prevOption = enabledOptions[prevIndex];
          onChange?.(prevOption.value, { target: { value: prevOption.value } } as React.ChangeEvent<HTMLInputElement>);
          return { currentIndex: prevIndex, isNavigating: true };
        });
        break;
        
      case 'Home':
        event.preventDefault();
        if (enabledOptions.length > 0) {
          const firstOption = enabledOptions[0];
          onChange?.(firstOption.value, { target: { value: firstOption.value } } as React.ChangeEvent<HTMLInputElement>);
          setNavigationState({ currentIndex: 0, isNavigating: true });
        }
        break;
        
      case 'End':
        event.preventDefault();
        if (enabledOptions.length > 0) {
          const lastIndex = enabledOptions.length - 1;
          const lastOption = enabledOptions[lastIndex];
          onChange?.(lastOption.value, { target: { value: lastOption.value } } as React.ChangeEvent<HTMLInputElement>);
          setNavigationState({ currentIndex: lastIndex, isNavigating: true });
        }
        break;
    }
  }, [options, onChange, disabled]);
  
  return { navigationState, handleKeyDown };
};

const useValidation = (
  props: FormRadioProps,
  selectedValue: string | null
) => {
  return useMemo((): ValidationState => {
    const { error, success, warning, errorMessage, successMessage, warningMessage, required } = props;
    
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
    
    // Required validation
    if (required && !selectedValue) {
      return {
        isValid: false,
        message: 'Please select an option',
        type: 'error',
      };
    }
    
    return {
      isValid: true,
      message: '',
      type: 'none',
    };
  }, [props, selectedValue]);
};

// ===== BETA V7.5 ENHANCED: GLASS-MORPHISM VARIANTS =====

const getRadioVariantStyles = (
  variant: string, 
  radioStyle: string,
  isSelected: boolean, 
  isFocused: boolean, 
  isHovered: boolean, 
  validation: ValidationState, 
  size: string,
  disabled: boolean
) => {
  const sizeMap = {
    sm: { radio: 16, padding: 12, fontSize: 'sm' },
    md: { radio: 20, padding: 16, fontSize: 'base' },
    lg: { radio: 24, padding: 20, fontSize: 'lg' },
    xl: { radio: 28, padding: 24, fontSize: 'xl' },
  };
  
  const sizeConfig = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
  
  const baseRadioStyles = {
    width: `${sizeConfig.radio}px`,
    height: `${sizeConfig.radio}px`,
    borderRadius: '50%',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const variants = {
    glass: {
      background: isSelected
        ? 'rgba(99, 102, 241, 0.8)' 
        : isFocused || isHovered
        ? 'rgba(255, 255, 255, 0.25)' 
        : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: `2px solid ${isSelected
        ? 'rgba(99, 102, 241, 0.8)' 
        : isFocused
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(255, 255, 255, 0.2)'}`,
      boxShadow: isFocused
        ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(99, 102, 241, 0.2)' 
        : '0 4px 16px rgba(0, 0, 0, 0.05)',
    },
    
    outlined: {
      background: isSelected
        ? designTokens.colors.primary[500] 
        : 'transparent',
      border: `2px solid ${isSelected || isFocused
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[300]}`,
      boxShadow: isFocused
        ? `0 0 0 3px ${designTokens.colors.primary[100]}` 
        : 'none',
    },
    
    filled: {
      background: isSelected
        ? designTokens.colors.primary[500] 
        : isFocused || isHovered
        ? designTokens.colors.neutral[50] 
        : designTokens.colors.neutral[100],
      border: `1px solid ${isSelected || isFocused
        ? designTokens.colors.primary[500] 
        : 'transparent'}`,
    },
    
    minimal: {
      background: isSelected
        ? designTokens.colors.primary[500] 
        : 'transparent',
      border: `2px solid ${isSelected || isFocused
        ? designTokens.colors.primary[500] 
        : designTokens.colors.neutral[400]}`,
    },
  };

  let radioStyles = { ...baseRadioStyles, ...variants[variant as keyof typeof variants] };

  // Validation state overrides
  if (validation.type === 'error') {
    radioStyles.border = `2px solid ${designTokens.colors.red[500]}`;
    if (isFocused) {
      radioStyles.boxShadow = `0 0 0 3px ${designTokens.colors.red[100]}`;
    }
  } else if (validation.type === 'success') {
    radioStyles.border = `2px solid ${designTokens.colors.green[500]}`;
    if (isFocused) {
      radioStyles.boxShadow = `0 0 0 3px ${designTokens.colors.green[100]}`;
    }
  } else if (validation.type === 'warning') {
    radioStyles.border = `2px solid ${designTokens.colors.yellow[500]}`;
    if (isFocused) {
      radioStyles.boxShadow = `0 0 0 3px ${designTokens.colors.yellow[100]}`;
    }
  }

  // Radio Style Variations
  if (radioStyle === 'card') {
    return {
      radioStyles,
      containerStyles: {
        padding: `${sizeConfig.padding}px`,
        borderRadius: designTokens.borderRadius.lg,
        border: `2px solid ${isSelected
          ? designTokens.colors.primary[500]
          : isFocused
          ? designTokens.colors.primary[200]
          : designTokens.colors.neutral[200]}`,
        background: isSelected
          ? designTokens.colors.primary[50]
          : isFocused || isHovered
          ? designTokens.colors.neutral[50]
          : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    };
  }

  if (radioStyle === 'button') {
    return {
      radioStyles,
      containerStyles: {
        padding: `${sizeConfig.padding}px ${sizeConfig.padding * 1.5}px`,
        borderRadius: designTokens.borderRadius.md,
        border: `2px solid ${isSelected
          ? designTokens.colors.primary[500]
          : designTokens.colors.neutral[300]}`,
        background: isSelected
          ? designTokens.colors.primary[500]
          : isFocused || isHovered
          ? designTokens.colors.neutral[50]
          : 'white',
        color: isSelected ? 'white' : designTokens.colors.neutral[700],
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: isSelected ? designTokens.typography.fontWeight.semibold : designTokens.typography.fontWeight.medium,
      },
    };
  }

  if (radioStyle === 'tile') {
    return {
      radioStyles,
      containerStyles: {
        padding: `${sizeConfig.padding * 1.5}px`,
        borderRadius: designTokens.borderRadius.xl,
        border: `2px solid ${isSelected
          ? designTokens.colors.primary[500]
          : designTokens.colors.neutral[200]}`,
        background: isSelected
          ? `linear-gradient(135deg, ${designTokens.colors.primary[500]}, ${designTokens.colors.primary[600]})`
          : isFocused || isHovered
          ? designTokens.colors.neutral[50]
          : 'white',
        color: isSelected ? 'white' : designTokens.colors.neutral[700],
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'center' as const,
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: designTokens.spacing[2],
      },
    };
  }

  return {
    radioStyles,
    containerStyles: {
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  };
};

const getLabelStyles = (size: string, disabled: boolean, validation: ValidationState, radioStyle: string, isSelected: boolean) => {
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

  let color = disabled
    ? designTokens.colors.neutral[400]
    : validation.type === 'error'
    ? designTokens.colors.red[700]
    : designTokens.colors.neutral[700];

  // Override color for button and tile styles when selected
  if ((radioStyle === 'button' || radioStyle === 'tile') && isSelected) {
    color = 'white';
  }

  return {
    ...sizeStyles[size as keyof typeof sizeStyles],
    fontWeight: designTokens.typography.fontWeight.medium,
    color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none' as const,
    marginLeft: radioStyle === 'default' ? designTokens.spacing[2] : 0,
    flex: 1,
  };
};

// ===== CHARLIE ACCESSIBILITY FRAMEWORK =====

const getAriaProps = (
  props: FormRadioProps,
  validation: ValidationState,
  radioId: string,
  isChecked: boolean
) => ({
  'aria-invalid': validation.type === 'error',
  'aria-describedby': [
    props.helperText && `${radioId}-helper`,
    validation.message && `${radioId}-validation`,
  ].filter(Boolean).join(' ') || undefined,
  'aria-required': props.required,
  'aria-checked': isChecked,
  role: 'radio',
});

// ===== RADIO INPUT COMPONENT =====

const RadioInput: React.FC<{
  option: RadioOption;
  isSelected: boolean;
  disabled?: boolean;
  variant: string;
  radioStyle: string;
  size: string;
  validation: ValidationState;
  onChange: (value: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  radioId: string;
  name?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
  'data-testid'?: string;
}> = ({
  option,
  isSelected,
  disabled = false,
  variant,
  radioStyle,
  size,
  validation,
  onChange,
  onFocus,
  onBlur,
  radioId,
  name,
  required,
  helperText,
  className = '',
  'data-testid': testId,
}) => {
  const [state, setState] = useState({
    isFocused: false,
    isHovered: false,
  });

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(option.value);
  }, [onChange, option.value]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, isFocused: true }));
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, isFocused: false }));
    onBlur?.(event);
  }, [onBlur]);

  const { radioStyles, containerStyles } = getRadioVariantStyles(
    variant, 
    radioStyle, 
    isSelected, 
    state.isFocused, 
    state.isHovered, 
    validation, 
    size,
    disabled
  );
  
  const labelStyles = getLabelStyles(size, disabled, validation, radioStyle, isSelected);

  const innerDotSize = size === 'sm' ? 6 : size === 'md' ? 8 : size === 'lg' ? 10 : 12;

  const renderRadioContent = () => {
    if (radioStyle === 'button') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing[2] }}>
          {option.icon && <span>{option.icon}</span>}
          <span style={labelStyles}>{option.label}</span>
          {option.badge && (
            <span style={{
              background: isSelected ? 'rgba(255, 255, 255, 0.2)' : designTokens.colors.primary[100],
              color: isSelected ? 'white' : designTokens.colors.primary[700],
              padding: '2px 8px',
              borderRadius: designTokens.borderRadius.full,
              fontSize: designTokens.typography.fontSize.xs,
              fontWeight: designTokens.typography.fontWeight.medium,
            }}>
              {option.badge}
            </span>
          )}
        </div>
      );
    }

    if (radioStyle === 'tile') {
      return (
        <div>
          {option.icon && (
            <div style={{ fontSize: '24px', marginBottom: designTokens.spacing[2] }}>
              {option.icon}
            </div>
          )}
          <div style={labelStyles}>{option.label}</div>
          {option.description && (
            <div style={{
              fontSize: designTokens.typography.fontSize.sm,
              color: isSelected ? 'rgba(255, 255, 255, 0.8)' : designTokens.colors.neutral[500],
              marginTop: designTokens.spacing[1],
            }}>
              {option.description}
            </div>
          )}
          {option.badge && (
            <span style={{
              background: isSelected ? 'rgba(255, 255, 255, 0.2)' : designTokens.colors.primary[100],
              color: isSelected ? 'white' : designTokens.colors.primary[700],
              padding: '2px 8px',
              borderRadius: designTokens.borderRadius.full,
              fontSize: designTokens.typography.fontSize.xs,
              fontWeight: designTokens.typography.fontWeight.medium,
              marginTop: designTokens.spacing[2],
              display: 'inline-block',
            }}>
              {option.badge}
            </span>
          )}
        </div>
      );
    }

    if (radioStyle === 'card') {
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: designTokens.spacing[3], width: '100%' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="radio"
              id={radioId}
              name={name}
              value={option.value}
              checked={isSelected}
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
              {...getAriaProps({ required, helperText }, validation, radioId, isSelected)}
            />
            
            <motion.div
              style={radioStyles}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              transition={{ duration: 0.1 }}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    key="selected"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      width: `${innerDotSize}px`,
                      height: `${innerDotSize}px`,
                      borderRadius: '50%',
                      background: variant === 'glass' || isSelected ? 'white' : designTokens.colors.primary[500],
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={labelStyles}>
              {option.icon && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  marginRight: designTokens.spacing[2] 
                }}>
                  {option.icon}
                </span>
              )}
              {option.label}
              {option.badge && (
                <span style={{
                  background: designTokens.colors.primary[100],
                  color: designTokens.colors.primary[700],
                  padding: '2px 8px',
                  borderRadius: designTokens.borderRadius.full,
                  fontSize: designTokens.typography.fontSize.xs,
                  fontWeight: designTokens.typography.fontWeight.medium,
                  marginLeft: designTokens.spacing[2],
                }}>
                  {option.badge}
                </span>
              )}
            </div>
            {option.description && (
              <div style={{
                fontSize: designTokens.typography.fontSize.sm,
                color: disabled 
                  ? designTokens.colors.neutral[400] 
                  : designTokens.colors.neutral[500],
                marginTop: '2px',
              }}>
                {option.description}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default style
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: designTokens.spacing[2] }}>
        <div style={{ position: 'relative' }}>
          <input
            type="radio"
            id={radioId}
            name={name}
            value={option.value}
            checked={isSelected}
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
            {...getAriaProps({ required, helperText }, validation, radioId, isSelected)}
          />
          
          <motion.div
            style={radioStyles}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            transition={{ duration: 0.1 }}
          >
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  key="selected"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    width: `${innerDotSize}px`,
                    height: `${innerDotSize}px`,
                    borderRadius: '50%',
                    background: variant === 'glass' || isSelected ? 'white' : designTokens.colors.primary[500],
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={labelStyles}>
            {option.icon && (
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                marginRight: designTokens.spacing[1] 
              }}>
                {option.icon}
              </span>
            )}
            {option.label}
          </div>
          {option.description && (
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
      </div>
    );
  };

  // For button and tile styles, wrap everything in the container
  if (radioStyle === 'button' || radioStyle === 'tile') {
    return (
      <motion.label
        style={containerStyles}
        className={className}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onMouseEnter={() => setState(prev => ({ ...prev, isHovered: true }))}
        onMouseLeave={() => setState(prev => ({ ...prev, isHovered: false }))}
      >
        <input
          type="radio"
          id={radioId}
          name={name}
          value={option.value}
          checked={isSelected}
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
          {...getAriaProps({ required, helperText }, validation, radioId, isSelected)}
        />
        {renderRadioContent()}
      </motion.label>
    );
  }

  // For card style, use container styles
  if (radioStyle === 'card') {
    return (
      <motion.label
        style={containerStyles}
        className={className}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onMouseEnter={() => setState(prev => ({ ...prev, isHovered: true }))}
        onMouseLeave={() => setState(prev => ({ ...prev, isHovered: false }))}
      >
        {renderRadioContent()}
      </motion.label>
    );
  }

  // Default style
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
      {renderRadioContent()}
    </motion.label>
  );
};

// ===== MAIN COMPONENT =====

export const FormRadio = memo(forwardRef<HTMLInputElement, FormRadioProps>(({
  // Core props
  id,
  name,
  value,
  defaultValue,
  
  // V7.5 Enhanced props  
  variant = 'glass',
  size = 'md',
  radioStyle = 'default',
  
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
  
  // Radio specific props
  option,
  options = [],
  group,
  groups = [],
  
  // Group props
  groupDirection = 'vertical',
  gridColumns = 2,
  allowDeselect = false,
  
  // Interaction props
  onChange,
  onFocus,
  onBlur,
  onGroupChange,
  
  // Layout props
  fullWidth = false,
  className = '',
  style,
  radioClassName = '',
  labelClassName = '',
  groupClassName = '',
  
  // Advanced props
  autoFocus = false,
  'data-testid': testId,
  
  ...restProps
}, ref) => {
  // ===== STATE MANAGEMENT =====
  const radioId = useId();
  const finalId = id || radioId;
  const finalName = name || `radio-group-${finalId}`;
  
  const isGroup = !!(options.length > 0 || groups.length > 0);
  const isSingleOption = !!option;
  
  const [internalValue, setInternalValue] = useState<string>(() => {
    return defaultValue || '';
  });
  
  const currentValue = value !== undefined ? value : internalValue;
  const radioState = useRadioState(currentValue, defaultValue, options);
  const validation = useValidation({ error, success, warning, errorMessage, successMessage, warningMessage, required }, currentValue);
  const { navigationState, handleKeyDown } = useKeyboardNavigation(options, onChange, disabled);
  
  // ===== EVENT HANDLERS =====
  const handleSingleChange = useCallback((optionValue: string) => {
    let newValue = optionValue;
    
    // Allow deselect for single radios if allowDeselect is true
    if (allowDeselect && currentValue === optionValue) {
      newValue = '';
    }
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue, { target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
  }, [value, onChange, allowDeselect, currentValue]);
  
  const handleGroupChange = useCallback((optionValue: string) => {
    let newValue = optionValue;
    
    // Allow deselect for groups if allowDeselect is true
    if (allowDeselect && currentValue === optionValue) {
      newValue = '';
    }
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    const selectedOption = options.find(opt => opt.value === newValue);
    onChange?.(newValue, { target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
    if (selectedOption) {
      onGroupChange?.(newValue, selectedOption);
    }
  }, [value, onChange, onGroupChange, options, allowDeselect, currentValue]);
  
  // ===== STYLES =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };
  
  const getGroupStyles = () => {
    if (groupDirection === 'grid') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: designTokens.spacing[3],
      };
    }
    
    return {
      display: 'flex',
      flexDirection: groupDirection === 'horizontal' ? 'row' as const : 'column' as const,
      gap: radioStyle === 'card' || radioStyle === 'button' || radioStyle === 'tile' 
        ? designTokens.spacing[3] 
        : designTokens.spacing[2],
      flexWrap: groupDirection === 'horizontal' ? 'wrap' as const : 'nowrap' as const,
    };
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
    <div style={containerStyles} className={className} onKeyDown={handleKeyDown}>
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
      
      {/* Single Radio */}
      {!isGroup && option && (
        <RadioInput
          option={option}
          isSelected={radioState.selectedValue === option.value}
          disabled={disabled}
          variant={variant}
          radioStyle={radioStyle}
          size={size}
          validation={validation}
          onChange={handleSingleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          radioId={finalId}
          name={finalName}
          required={required}
          helperText={helperText}
          className={radioClassName}
          data-testid={testId}
        />
      )}
      
      {/* Radio Group */}
      {isGroup && (
        <div 
          className={groupClassName}
          role="radiogroup"
          aria-labelledby={label ? `${finalId}-label` : undefined}
          aria-invalid={validation.type === 'error'}
          aria-describedby={[
            helperText && `${finalId}-helper`,
            validation.message && `${finalId}-validation`,
          ].filter(Boolean).join(' ') || undefined}
        >
          <div style={getGroupStyles()}>
            {options.map((radioOption, index) => (
              <RadioInput
                key={radioOption.value}
                option={radioOption}
                isSelected={radioState.selectedValue === radioOption.value}
                disabled={disabled || radioOption.disabled}
                variant={variant}
                radioStyle={radioStyle}
                size={size}
                validation={validation}
                onChange={handleGroupChange}
                onFocus={onFocus}
                onBlur={onBlur}
                radioId={`${finalId}-${radioOption.value}`}
                name={finalName}
                className={radioClassName}
                data-testid={testId ? `${testId}-${radioOption.value}` : undefined}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Footer Information */}
      <AnimatePresence>
        {(helperText || validation.message) && (
          <motion.div
            style={{
              marginTop: designTokens.spacing[2],
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}));

FormRadio.displayName = 'FormRadio';

export default FormRadio; 