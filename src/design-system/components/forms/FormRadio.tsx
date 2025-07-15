import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  forwardRef,
  useImperativeHandle,
  ReactNode,
  FocusEvent,
  ChangeEvent,
  KeyboardEvent
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FormRadio.css';

// ==========================================
// 🔴 IA ALPHA - ADVANCED TYPESCRIPT INTERFACES
// ==========================================

/**
 * V7.5 Enhanced FormRadio Option Interface
 */
export interface FormRadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
  image?: string;
  badge?: string;
  metadata?: Record<string, any>;
}

/**
 * V7.5 Enhanced Radio Group Configuration
 */
export interface FormRadioGroup {
  id: string;
  label: string;
  description?: string;
  options: FormRadioOption[];
  orientation?: 'horizontal' | 'vertical';
  columns?: number;
  spacing?: 'compact' | 'normal' | 'relaxed';
  disabled?: boolean;
  required?: boolean;
}

/**
 * V7.5 Enhanced Card Style Configuration
 */
export interface FormRadioCardStyle {
  enabled: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  hoverEffect?: 'lift' | 'scale' | 'border' | 'none';
}

/**
 * V7.5 Enhanced Validation Rule
 */
export interface FormRadioValidationRule {
  type: 'required' | 'custom';
  message: string;
  validator?: (value: string | number | null) => boolean | Promise<boolean>;
}

/**
 * V7.5 Enhanced Validation State
 */
export interface FormRadioValidationState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * V7.5 Enhanced Event Handlers
 */
export interface FormRadioEventHandlers {
  onChange?: (value: string | number | null, option?: FormRadioOption) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onValidationChange?: (validationState: FormRadioValidationState) => void;
  onGroupChange?: (groupId: string, value: string | number | null) => void;
}

/**
 * V7.5 Enhanced Layout Configuration
 */
export interface FormRadioLayout {
  orientation?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  spacing?: 'compact' | 'normal' | 'relaxed';
  alignment?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

/**
 * V7.5 Enhanced Animation Configuration
 */
export interface FormRadioAnimation {
  preset?: 'smooth' | 'bounce' | 'elastic' | 'fade';
  duration?: number;
  easing?: string;
  enabled?: boolean;
}

/**
 * V7.5 Enhanced Main FormRadio Props Interface
 */
export interface FormRadioProps {
  // V7.5 Core Design System Integration
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
  // Glass-morphism Effects
  glassEffect?: 'subtle' | 'medium' | 'strong';
  
  // Enhanced Validation System
  validationState?: 'neutral' | 'success' | 'warning' | 'error';
  
  // Core Radio Properties
  options?: FormRadioOption[];
  value?: string | number | null;
  defaultValue?: string | number | null;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Radio Group Properties
  name?: string;
  
  // Professional Features
  label?: string;
  description?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: ReactNode;
  
  // Advanced Features
  grouped?: boolean;
  groups?: FormRadioGroup[];
  cardStyle?: FormRadioCardStyle;
  layout?: FormRadioLayout;
  
  // Validation System
  validationRules?: FormRadioValidationRule[];
  
  // Custom Rendering
  customOptionRenderer?: (option: FormRadioOption, isSelected: boolean) => ReactNode;
  customGroupRenderer?: (group: FormRadioGroup, children: ReactNode) => ReactNode;
  
  // Performance & Accessibility
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  screenReaderText?: string;
  
  // Animation System
  animation?: FormRadioAnimation;
  
  // V7.5 Enhanced Event Handlers
  eventHandlers?: FormRadioEventHandlers;
  
  // Analytics Integration
  analyticsId?: string;
  trackInteractions?: boolean;
  
  // Additional Props
  className?: string;
}

/**
 * V7.5 Enhanced Ref Interface
 */
export interface FormRadioRef {
  focus: () => void;
  blur: () => void;
  getSelectedValue: () => string | number | null;
  setSelectedValue: (value: string | number | null) => void;
  validate: () => Promise<FormRadioValidationState>;
  getValidationState: () => FormRadioValidationState;
  clearSelection: () => void;
}

// ==========================================
// 🔴 IA ALPHA - PERFORMANCE HOOKS
// ==========================================

/**
 * Radio group state management hook
 */
function useRadioGroupState(
  options: FormRadioOption[],
  groups: FormRadioGroup[],
  value?: string | number | null,
  onChange?: (value: string | number | null) => void
) {
  const [selectedValue, setSelectedValue] = useState<string | number | null>(() => {
    return value !== undefined ? value : null;
  });
  
  const handleValueChange = useCallback((newValue: string | number | null) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
  }, [onChange]);
  
  const selectValue = useCallback((value: string | number) => {
    handleValueChange(value);
  }, [handleValueChange]);
  
  const clearSelection = useCallback(() => {
    handleValueChange(null);
  }, [handleValueChange]);
  
  // Get the currently selected option
  const selectedOption = useMemo(() => {
    if (selectedValue === null) return null;
    
    if (groups.length > 0) {
      for (const group of groups) {
        const option = group.options.find(opt => opt.value === selectedValue);
        if (option) return option;
      }
    } else {
      return options.find(opt => opt.value === selectedValue) || null;
    }
    
    return null;
  }, [selectedValue, options, groups]);
  
  return {
    selectedValue,
    selectedOption,
    selectValue,
    clearSelection,
    setSelectedValue: handleValueChange
  };
}

/**
 * Validation hook for radio groups
 */
function useFormRadioValidation(
  selectedValue: string | number | null,
  validationRules: FormRadioValidationRule[],
  required: boolean
) {
  const [validationState, setValidationState] = useState<FormRadioValidationState>({
    isValid: true,
    isDirty: false,
    isTouched: false,
    isValidating: false,
    errors: [],
    warnings: []
  });
  
  const validateAsync = useCallback(async (): Promise<FormRadioValidationState> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Required validation
      if (required && selectedValue === null) {
        errors.push('Please select an option');
      }
      
      // Custom validation rules
      for (const rule of validationRules) {
        switch (rule.type) {
          case 'required':
            if (selectedValue === null) {
              errors.push(rule.message);
            }
            break;
            
          case 'custom':
            if (rule.validator) {
              try {
                const isValid = await rule.validator(selectedValue);
                if (!isValid) {
                  errors.push(rule.message);
                }
              } catch (error) {
                errors.push('Validation error occurred');
              }
            }
            break;
        }
      }
      
      const newState: FormRadioValidationState = {
        isValid: errors.length === 0,
        isDirty: true,
        isTouched: true,
        isValidating: false,
        errors,
        warnings
      };
      
      setValidationState(newState);
      return newState;
      
    } catch (error) {
      const errorState: FormRadioValidationState = {
        isValid: false,
        isDirty: true,
        isTouched: true,
        isValidating: false,
        errors: ['Validation failed'],
        warnings: []
      };
      
      setValidationState(errorState);
      return errorState;
    }
  }, [selectedValue, validationRules, required]);
  
  // Auto-validate when value changes
  useEffect(() => {
    validateAsync();
  }, [validateAsync]);
  
  return {
    validationState,
    validateAsync
  };
}

/**
 * Keyboard navigation hook for radio buttons
 */
function useRadioKeyboardNavigation(
  options: FormRadioOption[],
  groups: FormRadioGroup[],
  selectedValue: string | number | null,
  onSelect: (value: string | number) => void
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedGroup, setFocusedGroup] = useState<string | null>(null);
  
  const flattenedOptions = useMemo(() => {
    if (groups.length > 0) {
      return groups.reduce<(FormRadioOption & { groupId: string })[]>((acc, group) => {
        return [...acc, ...group.options.map(opt => ({ ...opt, groupId: group.id }))];
      }, []);
    }
    return options.map(opt => ({ ...opt, groupId: '' }));
  }, [options, groups]);
  
  const moveFocus = useCallback((direction: 'up' | 'down' | 'first' | 'last') => {
    const enabledOptions = flattenedOptions.filter(opt => !opt.disabled);
    
    if (enabledOptions.length === 0) return;
    
    let newIndex: number;
    
    switch (direction) {
      case 'up':
        newIndex = focusedIndex <= 0 ? enabledOptions.length - 1 : focusedIndex - 1;
        break;
      case 'down':
        newIndex = focusedIndex >= enabledOptions.length - 1 ? 0 : focusedIndex + 1;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = enabledOptions.length - 1;
        break;
      default:
        return;
    }
    
    setFocusedIndex(newIndex);
    
    // Find the actual option
    const focusedOption = enabledOptions[newIndex];
    if (focusedOption) {
      setFocusedGroup(focusedOption.groupId || null);
    }
  }, [flattenedOptions, focusedIndex]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus('down');
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus('up');
        break;
      case 'Home':
        event.preventDefault();
        moveFocus('first');
        break;
      case 'End':
        event.preventDefault();
        moveFocus('last');
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < flattenedOptions.length) {
          const focusedOption = flattenedOptions[focusedIndex];
          if (!focusedOption.disabled) {
            onSelect(focusedOption.value);
          }
        }
        break;
    }
  }, [moveFocus, focusedIndex, flattenedOptions, onSelect]);
  
  return {
    focusedIndex,
    focusedGroup,
    setFocusedIndex,
    setFocusedGroup,
    handleKeyDown
  };
}

// ==========================================
// 🔴 IA ALPHA - MAIN COMPONENT
// ==========================================

/**
 * V7.5 Enhanced FormRadio Component
 * Professional radio buttons with group functionality and card-style variants
 */
export const FormRadio = forwardRef<FormRadioRef, FormRadioProps>(
  ({
    variant = 'outlined',
    size = 'md',
    glassEffect = 'subtle',
    validationState = 'neutral',
    options = [],
    value,
    defaultValue,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    label,
    description,
    helperText,
    errorText,
    leadingIcon,
    grouped = false,
    groups = [],
    cardStyle = { enabled: false },
    layout = { orientation: 'vertical', spacing: 'normal' },
    validationRules = [],
    customOptionRenderer,
    customGroupRenderer,
    id,
    ariaLabel,
    ariaDescribedBy,
    screenReaderText,
    animation = { preset: 'smooth', duration: 200, enabled: true },
    eventHandlers = {},
    analyticsId,
    trackInteractions = false,
    className = ''
  }, ref) => {
    
    // State Management
    const [isFocused, setIsFocused] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const radioRefs = useRef<Map<string | number, HTMLInputElement>>(new Map());
    
    // Determine working options
    const workingOptions = grouped && groups.length > 0 
      ? groups.reduce<FormRadioOption[]>((acc, group) => [...acc, ...group.options], [])
      : options;
    
    // Hooks
    const {
      selectedValue,
      selectedOption,
      selectValue,
      clearSelection,
      setSelectedValue
    } = useRadioGroupState(workingOptions, groups, value, eventHandlers.onChange);
    
    const { validationState: currentValidationState, validateAsync } = useFormRadioValidation(
      selectedValue,
      validationRules,
      required
    );
    
    const { focusedIndex, handleKeyDown } = useRadioKeyboardNavigation(
      workingOptions,
      groups,
      selectedValue,
      selectValue
    );
    
    // Event Handlers
    const handleOptionChange = useCallback((option: FormRadioOption) => {
      if (option.disabled || disabled || readOnly) return;
      
      selectValue(option.value);
      setIsTouched(true);
      
      // Analytics tracking
      if (trackInteractions && analyticsId) {
        // Analytics implementation would go here
      }
    }, [selectValue, disabled, readOnly, trackInteractions, analyticsId]);
    
    const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      eventHandlers.onFocus?.(event);
    }, [eventHandlers]);
    
    const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setIsTouched(true);
      eventHandlers.onBlur?.(event);
    }, [eventHandlers]);
    
    // Sync with external value prop
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value, setSelectedValue]);
    
    // Validation state change notification
    useEffect(() => {
      eventHandlers.onValidationChange?.(currentValidationState);
    }, [currentValidationState, eventHandlers]);
    
    // Imperative Handle
    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstRadio = radioRefs.current.values().next().value;
        firstRadio?.focus();
      },
      blur: () => {
        const focusedRadio = document.activeElement;
        if (focusedRadio instanceof HTMLInputElement) {
          focusedRadio.blur();
        }
      },
      getSelectedValue: () => selectedValue,
      setSelectedValue,
      validate: validateAsync,
      getValidationState: () => currentValidationState,
      clearSelection
    }), [selectedValue, setSelectedValue, validateAsync, currentValidationState, clearSelection]);
    
    // CSS Classes
    const containerClasses = [
      'form-radio-container',
      `form-radio-container--${variant}`,
      `form-radio-container--${size}`,
      `form-radio-container--glass-${glassEffect}`,
      isFocused && 'form-radio-container--focused',
      validationState !== 'neutral' && `form-radio-container--${validationState}`,
      disabled && 'form-radio-container--disabled',
      readOnly && 'form-radio-container--readonly',
      grouped && 'form-radio-container--grouped',
      cardStyle.enabled && 'form-radio-container--card-style',
      layout.orientation && `form-radio-container--${layout.orientation}`,
      layout.spacing && `form-radio-container--spacing-${layout.spacing}`,
      className
    ].filter(Boolean).join(' ');
    
    // Render grouped radio buttons
    if (grouped && groups.length > 0) {
      return (
        <div className={containerClasses} ref={containerRef} onKeyDown={handleKeyDown}>
          {groups.map((group) => {
            const groupContent = (
              <div key={group.id} className="form-radio-group">
                {/* Group Header */}
                <div className="form-radio-group-header">
                  <div className="form-radio-group-text">
                    <span className="form-radio-group-label">
                      {group.label}
                      {(required || group.required) && (
                        <span className="form-radio-required" aria-label="required">*</span>
                      )}
                    </span>
                    
                    {group.description && (
                      <span className="form-radio-group-description">
                        {group.description}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Group Options */}
                <div 
                  className={`form-radio-group-options form-radio-group-options--${group.orientation || 'vertical'}`}
                  style={{
                    gridTemplateColumns: group.columns ? `repeat(${group.columns}, 1fr)` : undefined
                  }}
                >
                  {group.options.map((option) => {
                    const isSelected = selectedValue === option.value;
                    
                    const optionContent = customOptionRenderer ? (
                      customOptionRenderer(option, isSelected)
                    ) : (
                      <label 
                        key={option.value} 
                        className={`form-radio-option-wrapper ${cardStyle.enabled ? 'form-radio-option-wrapper--card' : ''}`}
                      >
                        <input
                          ref={(el) => el && radioRefs.current.set(option.value, el)}
                          type="radio"
                          className="form-radio-input"
                          checked={isSelected}
                          onChange={() => handleOptionChange(option)}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          disabled={disabled || group.disabled || option.disabled}
                          name={name || `radio-group-${group.id}`}
                          value={String(option.value)}
                          aria-describedby={ariaDescribedBy}
                        />
                        
                        {!cardStyle.enabled && (
                          <div className="form-radio-visual">
                            <motion.div
                              className="form-radio-dot"
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0
                              }}
                              transition={{
                                duration: animation.enabled ? (animation.duration || 200) / 1000 : 0
                              }}
                            />
                          </div>
                        )}
                        
                        <div className={`form-radio-option-content ${cardStyle.enabled ? 'form-radio-option-content--card' : ''}`}>
                          {option.icon && cardStyle.showIcon !== false && (
                            <div className="form-radio-option-icon">
                              {option.icon}
                            </div>
                          )}
                          
                          {option.image && cardStyle.enabled && (
                            <div className="form-radio-option-image">
                              <img src={option.image} alt={option.label} />
                            </div>
                          )}
                          
                          <div className="form-radio-option-text">
                            <span className="form-radio-option-label">
                              {option.label}
                            </span>
                            
                            {option.description && cardStyle.showDescription !== false && (
                              <span className="form-radio-option-description">
                                {option.description}
                              </span>
                            )}
                          </div>
                          
                          {option.badge && cardStyle.showBadge !== false && (
                            <div className="form-radio-option-badge">
                              {option.badge}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                    
                    return optionContent;
                  })}
                </div>
              </div>
            );
            
            return customGroupRenderer ? (
              customGroupRenderer(group, groupContent)
            ) : (
              groupContent
            );
          })}
          
          {/* Helper Text */}
          {helperText && !errorText && (
            <p className="form-radio-helper-text">
              {helperText}
            </p>
          )}
          
          {/* Error Text */}
          {(errorText || currentValidationState.errors.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="form-radio-error-text"
              role="alert"
            >
              {errorText || currentValidationState.errors[0]}
            </motion.div>
          )}
          
          {/* Screen Reader Text */}
          {screenReaderText && (
            <span className="sr-only">
              {screenReaderText}
            </span>
          )}
        </div>
      );
    }
    
    // Render simple list of radio buttons
    return (
      <div className={containerClasses} ref={containerRef} onKeyDown={handleKeyDown}>
        {label && (
          <div className="form-radio-list-label">
            {label}
            {required && (
              <span className="form-radio-required" aria-label="required">*</span>
            )}
          </div>
        )}
        
        {description && (
          <p className="form-radio-list-description">
            {description}
          </p>
        )}
        
        <div 
          className={`form-radio-list form-radio-list--${layout.orientation || 'vertical'}`}
          style={{
            gridTemplateColumns: layout.columns ? `repeat(${layout.columns}, 1fr)` : undefined
          }}
          role="radiogroup"
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
          aria-required={required}
        >
          {workingOptions.map((option) => {
            const isSelected = selectedValue === option.value;
            
            return customOptionRenderer ? (
              <div key={option.value}>
                {customOptionRenderer(option, isSelected)}
              </div>
            ) : (
              <label 
                key={option.value} 
                className={`form-radio-option-wrapper ${cardStyle.enabled ? 'form-radio-option-wrapper--card' : ''}`}
              >
                <input
                  ref={(el) => el && radioRefs.current.set(option.value, el)}
                  type="radio"
                  className="form-radio-input"
                  checked={isSelected}
                  onChange={() => handleOptionChange(option)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={disabled || option.disabled}
                  name={name || 'radio-group'}
                  value={String(option.value)}
                  aria-describedby={ariaDescribedBy}
                />
                
                {!cardStyle.enabled && (
                  <div className="form-radio-visual">
                    <motion.div
                      className="form-radio-dot"
                      initial={false}
                      animate={{
                        scale: isSelected ? 1 : 0,
                        opacity: isSelected ? 1 : 0
                      }}
                      transition={{
                        duration: animation.enabled ? (animation.duration || 200) / 1000 : 0
                      }}
                    />
                  </div>
                )}
                
                <div className={`form-radio-option-content ${cardStyle.enabled ? 'form-radio-option-content--card' : ''}`}>
                  {option.icon && cardStyle.showIcon !== false && (
                    <div className="form-radio-option-icon">
                      {option.icon}
                    </div>
                  )}
                  
                  {option.image && cardStyle.enabled && (
                    <div className="form-radio-option-image">
                      <img src={option.image} alt={option.label} />
                    </div>
                  )}
                  
                  <div className="form-radio-option-text">
                    <span className="form-radio-option-label">
                      {option.label}
                    </span>
                    
                    {option.description && cardStyle.showDescription !== false && (
                      <span className="form-radio-option-description">
                        {option.description}
                      </span>
                    )}
                  </div>
                  
                  {option.badge && cardStyle.showBadge !== false && (
                    <div className="form-radio-option-badge">
                      {option.badge}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        
        {/* Helper Text */}
        {helperText && !errorText && (
          <p className="form-radio-helper-text">
            {helperText}
          </p>
        )}
        
        {/* Error Text */}
        {(errorText || currentValidationState.errors.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="form-radio-error-text"
            role="alert"
          >
            {errorText || currentValidationState.errors[0]}
          </motion.div>
        )}
        
        {/* Screen Reader Text */}
        {screenReaderText && (
          <span className="sr-only">
            {screenReaderText}
          </span>
        )}
      </div>
    );
  }
);

FormRadio.displayName = 'FormRadio';

export default FormRadio; 