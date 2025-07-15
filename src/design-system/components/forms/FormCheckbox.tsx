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
import './FormCheckbox.css';

// ==========================================
// 🔴 IA ALPHA - ADVANCED TYPESCRIPT INTERFACES
// ==========================================

/**
 * V7.5 Enhanced FormCheckbox Option Interface
 */
export interface FormCheckboxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
  metadata?: Record<string, any>;
}

/**
 * V7.5 Enhanced Checkbox Group Configuration
 */
export interface FormCheckboxGroup {
  id: string;
  label: string;
  description?: string;
  options: FormCheckboxOption[];
  orientation?: 'horizontal' | 'vertical';
  columns?: number;
  spacing?: 'compact' | 'normal' | 'relaxed';
  disabled?: boolean;
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
}

/**
 * V7.5 Enhanced Indeterminate State Configuration
 */
export interface FormCheckboxIndeterminate {
  enabled: boolean;
  showIcon?: boolean;
  animationDuration?: number;
  visualFeedback?: 'icon' | 'background' | 'both';
}

/**
 * V7.5 Enhanced Validation Rule
 */
export interface FormCheckboxValidationRule {
  type: 'required' | 'minSelections' | 'maxSelections' | 'custom';
  value?: number;
  message: string;
  validator?: (values: (string | number)[]) => boolean | Promise<boolean>;
}

/**
 * V7.5 Enhanced Validation State
 */
export interface FormCheckboxValidationState {
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
export interface FormCheckboxEventHandlers {
  onChange?: (values: (string | number)[], option?: FormCheckboxOption) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onValidationChange?: (validationState: FormCheckboxValidationState) => void;
  onGroupChange?: (groupId: string, values: (string | number)[]) => void;
  onIndeterminateChange?: (isIndeterminate: boolean) => void;
}

/**
 * V7.5 Enhanced Layout Configuration
 */
export interface FormCheckboxLayout {
  orientation?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  spacing?: 'compact' | 'normal' | 'relaxed';
  alignment?: 'start' | 'center' | 'end';
  wrap?: boolean;
}

/**
 * V7.5 Enhanced Animation Configuration
 */
export interface FormCheckboxAnimation {
  preset?: 'smooth' | 'bounce' | 'elastic' | 'fade';
  duration?: number;
  easing?: string;
  enabled?: boolean;
}

/**
 * V7.5 Enhanced Main FormCheckbox Props Interface
 */
export interface FormCheckboxProps {
  // V7.5 Core Design System Integration
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
  // Glass-morphism Effects
  glassEffect?: 'subtle' | 'medium' | 'strong';
  
  // Enhanced Validation System
  validationState?: 'neutral' | 'success' | 'warning' | 'error';
  
  // Core Checkbox Properties
  options?: FormCheckboxOption[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Single Checkbox Mode
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  description?: string;
  
  // Professional Features
  helperText?: string;
  errorText?: string;
  leadingIcon?: ReactNode;
  
  // Advanced Features
  grouped?: boolean;
  groups?: FormCheckboxGroup[];
  indeterminate?: FormCheckboxIndeterminate;
  layout?: FormCheckboxLayout;
  
  // Validation System
  validationRules?: FormCheckboxValidationRule[];
  
  // Custom Rendering
  customOptionRenderer?: (option: FormCheckboxOption, isChecked: boolean, isIndeterminate: boolean) => ReactNode;
  customGroupRenderer?: (group: FormCheckboxGroup, children: ReactNode) => ReactNode;
  
  // Performance & Accessibility
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  screenReaderText?: string;
  
  // Animation System
  animation?: FormCheckboxAnimation;
  
  // V7.5 Enhanced Event Handlers
  eventHandlers?: FormCheckboxEventHandlers;
  
  // Analytics Integration
  analyticsId?: string;
  trackInteractions?: boolean;
  
  // Additional Props
  className?: string;
}

/**
 * V7.5 Enhanced Ref Interface
 */
export interface FormCheckboxRef {
  focus: () => void;
  blur: () => void;
  checkAll: () => void;
  uncheckAll: () => void;
  toggleAll: () => void;
  getCheckedValues: () => (string | number)[];
  setCheckedValues: (values: (string | number)[]) => void;
  validate: () => Promise<FormCheckboxValidationState>;
  getValidationState: () => FormCheckboxValidationState;
  isIndeterminate: () => boolean;
}

// ==========================================
// 🔴 IA ALPHA - PERFORMANCE HOOKS
// ==========================================

/**
 * Grouped checkbox state management hook
 */
function useGroupedCheckboxState(
  options: FormCheckboxOption[],
  groups: FormCheckboxGroup[],
  value?: (string | number)[],
  onChange?: (values: (string | number)[]) => void
) {
  const [checkedValues, setCheckedValues] = useState<(string | number)[]>(() => {
    return value || [];
  });
  
  const [groupStates, setGroupStates] = useState<Record<string, {
    checkedCount: number;
    totalCount: number;
    isIndeterminate: boolean;
    isAllChecked: boolean;
  }>>({});
  
  // Update group states when checked values change
  useEffect(() => {
    const newGroupStates: typeof groupStates = {};
    
    groups.forEach(group => {
      const groupOptionValues = group.options.map(opt => opt.value);
      const checkedInGroup = checkedValues.filter(val => groupOptionValues.includes(val));
      const totalInGroup = group.options.filter(opt => !opt.disabled).length;
      
      newGroupStates[group.id] = {
        checkedCount: checkedInGroup.length,
        totalCount: totalInGroup,
        isIndeterminate: checkedInGroup.length > 0 && checkedInGroup.length < totalInGroup,
        isAllChecked: checkedInGroup.length === totalInGroup && totalInGroup > 0
      };
    });
    
    setGroupStates(newGroupStates);
  }, [checkedValues, groups]);
  
  const handleValueChange = useCallback((newValues: (string | number)[]) => {
    setCheckedValues(newValues);
    onChange?.(newValues);
  }, [onChange]);
  
  const toggleValue = useCallback((value: string | number) => {
    const newValues = checkedValues.includes(value)
      ? checkedValues.filter(v => v !== value)
      : [...checkedValues, value];
    
    handleValueChange(newValues);
  }, [checkedValues, handleValueChange]);
  
  const toggleGroup = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const groupState = groupStates[groupId];
    const groupOptionValues = group.options
      .filter(opt => !opt.disabled)
      .map(opt => opt.value);
    
    let newValues: (string | number)[];
    
    if (groupState?.isAllChecked) {
      // Uncheck all in group
      newValues = checkedValues.filter(val => !groupOptionValues.includes(val));
    } else {
      // Check all in group
      const otherValues = checkedValues.filter(val => !groupOptionValues.includes(val));
      newValues = [...otherValues, ...groupOptionValues];
    }
    
    handleValueChange(newValues);
  }, [groups, groupStates, checkedValues, handleValueChange]);
  
  const checkAll = useCallback(() => {
    const allValues = options
      .filter(opt => !opt.disabled)
      .map(opt => opt.value);
    handleValueChange(allValues);
  }, [options, handleValueChange]);
  
  const uncheckAll = useCallback(() => {
    handleValueChange([]);
  }, [handleValueChange]);
  
  const toggleAll = useCallback(() => {
    const allValues = options
      .filter(opt => !opt.disabled)
      .map(opt => opt.value);
    
    const isAllChecked = allValues.every(val => checkedValues.includes(val));
    
    if (isAllChecked) {
      uncheckAll();
    } else {
      checkAll();
    }
  }, [options, checkedValues, checkAll, uncheckAll]);
  
  return {
    checkedValues,
    groupStates,
    toggleValue,
    toggleGroup,
    checkAll,
    uncheckAll,
    toggleAll,
    setCheckedValues: handleValueChange
  };
}

/**
 * Validation hook for checkbox groups
 */
function useFormCheckboxValidation(
  checkedValues: (string | number)[],
  validationRules: FormCheckboxValidationRule[],
  required: boolean
) {
  const [validationState, setValidationState] = useState<FormCheckboxValidationState>({
    isValid: true,
    isDirty: false,
    isTouched: false,
    isValidating: false,
    errors: [],
    warnings: []
  });
  
  const validateAsync = useCallback(async (): Promise<FormCheckboxValidationState> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Required validation
      if (required && checkedValues.length === 0) {
        errors.push('At least one option must be selected');
      }
      
      // Custom validation rules
      for (const rule of validationRules) {
        switch (rule.type) {
          case 'required':
            if (checkedValues.length === 0) {
              errors.push(rule.message);
            }
            break;
            
          case 'minSelections':
            if (rule.value && checkedValues.length < rule.value) {
              errors.push(rule.message);
            }
            break;
            
          case 'maxSelections':
            if (rule.value && checkedValues.length > rule.value) {
              errors.push(rule.message);
            }
            break;
            
          case 'custom':
            if (rule.validator) {
              try {
                const isValid = await rule.validator(checkedValues);
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
      
      const newState: FormCheckboxValidationState = {
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
      const errorState: FormCheckboxValidationState = {
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
  }, [checkedValues, validationRules, required]);
  
  // Auto-validate when values change
  useEffect(() => {
    validateAsync();
  }, [validateAsync]);
  
  return {
    validationState,
    validateAsync
  };
}

/**
 * Keyboard navigation hook for checkboxes
 */
function useCheckboxKeyboardNavigation(
  options: FormCheckboxOption[],
  groups: FormCheckboxGroup[],
  onToggle: (value: string | number) => void,
  onGroupToggle: (groupId: string) => void
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedGroup, setFocusedGroup] = useState<string | null>(null);
  
  const flattenedOptions = useMemo(() => {
    if (groups.length > 0) {
      return groups.reduce<(FormCheckboxOption & { groupId: string })[]>((acc, group) => {
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
            onToggle(focusedOption.value);
          }
        }
        break;
    }
  }, [moveFocus, focusedIndex, flattenedOptions, onToggle]);
  
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
 * V7.5 Enhanced FormCheckbox Component
 * Professional checkbox with grouped functionality and indeterminate states
 */
export const FormCheckbox = forwardRef<FormCheckboxRef, FormCheckboxProps>(
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
    checked,
    defaultChecked,
    label,
    description,
    helperText,
    errorText,
    leadingIcon,
    grouped = false,
    groups = [],
    indeterminate = { enabled: true, showIcon: true, animationDuration: 200 },
    layout = { orientation: 'vertical', spacing: 'normal' },
    validationRules = [],
    customOptionRenderer,
    customGroupRenderer,
    id,
    name,
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
    const checkboxRefs = useRef<Map<string | number, HTMLInputElement>>(new Map());
    
    // Determine if we're in single or grouped mode
    const isSingleMode = !grouped && !groups.length && options.length <= 1;
    const workingOptions = grouped && groups.length > 0 
      ? groups.reduce<FormCheckboxOption[]>((acc, group) => [...acc, ...group.options], [])
      : options;
    
    // Hooks
    const {
      checkedValues,
      groupStates,
      toggleValue,
      toggleGroup,
      checkAll,
      uncheckAll,
      toggleAll,
      setCheckedValues
    } = useGroupedCheckboxState(workingOptions, groups, value, eventHandlers.onChange);
    
    const { validationState: currentValidationState, validateAsync } = useFormCheckboxValidation(
      checkedValues,
      validationRules,
      required
    );
    
    const { focusedIndex, handleKeyDown } = useCheckboxKeyboardNavigation(
      workingOptions,
      groups,
      toggleValue,
      toggleGroup
    );
    
    // Single checkbox state (for non-grouped mode)
    const [singleChecked, setSingleChecked] = useState(() => {
      if (isSingleMode) {
        return checked !== undefined ? checked : (defaultChecked || false);
      }
      return false;
    });
    
    // Event Handlers
    const handleSingleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      if (isSingleMode && !disabled && !readOnly) {
        const newChecked = event.target.checked;
        setSingleChecked(newChecked);
        eventHandlers.onChange?.([newChecked ? 'checked' : 'unchecked']);
        
        // Analytics tracking
        if (trackInteractions && analyticsId) {
          // Analytics implementation would go here
        }
      }
    }, [isSingleMode, disabled, readOnly, eventHandlers, trackInteractions, analyticsId]);
    
    const handleOptionChange = useCallback((option: FormCheckboxOption) => {
      if (option.disabled || disabled || readOnly) return;
      
      toggleValue(option.value);
      eventHandlers.onOptionSelect?.(option);
      setIsTouched(true);
      
      // Analytics tracking
      if (trackInteractions && analyticsId) {
        // Analytics implementation would go here
      }
    }, [toggleValue, disabled, readOnly, eventHandlers, trackInteractions, analyticsId]);
    
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
      if (value !== undefined && !isSingleMode) {
        setCheckedValues(value);
      }
    }, [value, setCheckedValues, isSingleMode]);
    
    useEffect(() => {
      if (checked !== undefined && isSingleMode) {
        setSingleChecked(checked);
      }
    }, [checked, isSingleMode]);
    
    // Validation state change notification
    useEffect(() => {
      eventHandlers.onValidationChange?.(currentValidationState);
    }, [currentValidationState, eventHandlers]);
    
    // Imperative Handle
    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstCheckbox = checkboxRefs.current.values().next().value;
        firstCheckbox?.focus();
      },
      blur: () => {
        const focusedCheckbox = document.activeElement;
        if (focusedCheckbox instanceof HTMLInputElement) {
          focusedCheckbox.blur();
        }
      },
      checkAll,
      uncheckAll,
      toggleAll,
      getCheckedValues: () => isSingleMode ? (singleChecked ? ['checked'] : []) : checkedValues,
      setCheckedValues: (values: (string | number)[]) => {
        if (isSingleMode) {
          setSingleChecked(values.includes('checked'));
        } else {
          setCheckedValues(values);
        }
      },
      validate: validateAsync,
      getValidationState: () => currentValidationState,
      isIndeterminate: () => {
        if (isSingleMode) return false;
        return Object.values(groupStates).some(state => state.isIndeterminate);
      }
    }), [
      checkAll, 
      uncheckAll, 
      toggleAll, 
      checkedValues, 
      singleChecked, 
      isSingleMode, 
      setCheckedValues, 
      validateAsync, 
      currentValidationState, 
      groupStates
    ]);
    
    // CSS Classes
    const containerClasses = [
      'form-checkbox-container',
      `form-checkbox-container--${variant}`,
      `form-checkbox-container--${size}`,
      `form-checkbox-container--glass-${glassEffect}`,
      isFocused && 'form-checkbox-container--focused',
      validationState !== 'neutral' && `form-checkbox-container--${validationState}`,
      disabled && 'form-checkbox-container--disabled',
      readOnly && 'form-checkbox-container--readonly',
      grouped && 'form-checkbox-container--grouped',
      isSingleMode && 'form-checkbox-container--single',
      layout.orientation && `form-checkbox-container--${layout.orientation}`,
      layout.spacing && `form-checkbox-container--spacing-${layout.spacing}`,
      className
    ].filter(Boolean).join(' ');
    
    // Render single checkbox
    if (isSingleMode) {
      const singleOption = options[0] || { value: 'single', label: label || 'Checkbox' };
      
      return (
        <div className={containerClasses} ref={containerRef}>
          <div className="form-checkbox-single">
            <label className="form-checkbox-label-wrapper">
              <input
                ref={(el) => el && checkboxRefs.current.set(singleOption.value, el)}
                type="checkbox"
                className="form-checkbox-input"
                checked={singleChecked}
                onChange={handleSingleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                readOnly={readOnly}
                required={required}
                id={id}
                name={name}
                aria-label={ariaLabel}
                aria-describedby={ariaDescribedBy}
                aria-invalid={validationState === 'error'}
                aria-required={required}
              />
              
              <div className="form-checkbox-visual">
                <motion.div
                  className="form-checkbox-check"
                  initial={false}
                  animate={{
                    scale: singleChecked ? 1 : 0,
                    opacity: singleChecked ? 1 : 0
                  }}
                  transition={{
                    duration: animation.enabled ? (animation.duration || 200) / 1000 : 0,
                    ease: animation.easing || 'easeOut'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </motion.div>
              </div>
              
              <div className="form-checkbox-content">
                {leadingIcon && (
                  <div className="form-checkbox-leading-icon">
                    {leadingIcon}
                  </div>
                )}
                
                <div className="form-checkbox-text">
                  <span className="form-checkbox-label">
                    {label || singleOption.label}
                    {required && (
                      <span className="form-checkbox-required" aria-label="required">*</span>
                    )}
                  </span>
                  
                  {(description || singleOption.description) && (
                    <span className="form-checkbox-description">
                      {description || singleOption.description}
                    </span>
                  )}
                </div>
              </div>
            </label>
          </div>
          
          {/* Helper Text */}
          {helperText && !errorText && (
            <p className="form-checkbox-helper-text">
              {helperText}
            </p>
          )}
          
          {/* Error Text */}
          {errorText && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="form-checkbox-error-text"
              role="alert"
            >
              {errorText}
            </motion.p>
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
    
    // Render grouped checkboxes
    if (grouped && groups.length > 0) {
      return (
        <div className={containerClasses} ref={containerRef} onKeyDown={handleKeyDown}>
          {groups.map((group) => {
            const groupState = groupStates[group.id];
            
            const groupContent = (
              <div key={group.id} className="form-checkbox-group">
                {/* Group Header */}
                <div className="form-checkbox-group-header">
                  <label className="form-checkbox-group-label-wrapper">
                    <input
                      type="checkbox"
                      className="form-checkbox-group-input"
                      checked={groupState?.isAllChecked || false}
                      ref={(el) => el && checkboxRefs.current.set(`group-${group.id}`, el)}
                      onChange={() => toggleGroup(group.id)}
                      disabled={disabled || group.disabled}
                      aria-label={`Toggle all options in ${group.label}`}
                      {...(groupState?.isIndeterminate && indeterminate.enabled ? {
                        'data-indeterminate': 'true'
                      } : {})}
                    />
                    
                    <div className="form-checkbox-visual form-checkbox-visual--group">
                      <AnimatePresence>
                        {groupState?.isIndeterminate && indeterminate.enabled ? (
                          <motion.div
                            key="indeterminate"
                            className="form-checkbox-indeterminate"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: (indeterminate.animationDuration || 200) / 1000 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 13H5v-2h14v2z"/>
                            </svg>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="check"
                            className="form-checkbox-check"
                            initial={false}
                            animate={{
                              scale: groupState?.isAllChecked ? 1 : 0,
                              opacity: groupState?.isAllChecked ? 1 : 0
                            }}
                            transition={{
                              duration: animation.enabled ? (animation.duration || 200) / 1000 : 0
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="form-checkbox-group-text">
                      <span className="form-checkbox-group-label">
                        {group.label}
                        {(required || group.required) && (
                          <span className="form-checkbox-required" aria-label="required">*</span>
                        )}
                      </span>
                      
                      {group.description && (
                        <span className="form-checkbox-group-description">
                          {group.description}
                        </span>
                      )}
                    </div>
                  </label>
                </div>
                
                {/* Group Options */}
                <div 
                  className={`form-checkbox-group-options form-checkbox-group-options--${group.orientation || 'vertical'}`}
                  style={{
                    gridTemplateColumns: group.columns ? `repeat(${group.columns}, 1fr)` : undefined
                  }}
                >
                  {group.options.map((option) => {
                    const isChecked = checkedValues.includes(option.value);
                    
                    const optionContent = customOptionRenderer ? (
                      customOptionRenderer(option, isChecked, false)
                    ) : (
                      <label key={option.value} className="form-checkbox-option-wrapper">
                        <input
                          ref={(el) => el && checkboxRefs.current.set(option.value, el)}
                          type="checkbox"
                          className="form-checkbox-input"
                          checked={isChecked}
                          onChange={() => handleOptionChange(option)}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          disabled={disabled || group.disabled || option.disabled}
                          name={name}
                          value={String(option.value)}
                          aria-describedby={ariaDescribedBy}
                        />
                        
                        <div className="form-checkbox-visual">
                          <motion.div
                            className="form-checkbox-check"
                            initial={false}
                            animate={{
                              scale: isChecked ? 1 : 0,
                              opacity: isChecked ? 1 : 0
                            }}
                            transition={{
                              duration: animation.enabled ? (animation.duration || 200) / 1000 : 0
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </motion.div>
                        </div>
                        
                        <div className="form-checkbox-option-content">
                          {option.icon && (
                            <div className="form-checkbox-option-icon">
                              {option.icon}
                            </div>
                          )}
                          
                          <div className="form-checkbox-option-text">
                            <span className="form-checkbox-option-label">
                              {option.label}
                            </span>
                            
                            {option.description && (
                              <span className="form-checkbox-option-description">
                                {option.description}
                              </span>
                            )}
                          </div>
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
            <p className="form-checkbox-helper-text">
              {helperText}
            </p>
          )}
          
          {/* Error Text */}
          {(errorText || currentValidationState.errors.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="form-checkbox-error-text"
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
    
    // Render simple list of checkboxes
    return (
      <div className={containerClasses} ref={containerRef} onKeyDown={handleKeyDown}>
        {label && (
          <div className="form-checkbox-list-label">
            {label}
            {required && (
              <span className="form-checkbox-required" aria-label="required">*</span>
            )}
          </div>
        )}
        
        <div 
          className={`form-checkbox-list form-checkbox-list--${layout.orientation || 'vertical'}`}
          style={{
            gridTemplateColumns: layout.columns ? `repeat(${layout.columns}, 1fr)` : undefined
          }}
        >
          {workingOptions.map((option) => {
            const isChecked = checkedValues.includes(option.value);
            
            return customOptionRenderer ? (
              <div key={option.value}>
                {customOptionRenderer(option, isChecked, false)}
              </div>
            ) : (
              <label key={option.value} className="form-checkbox-option-wrapper">
                <input
                  ref={(el) => el && checkboxRefs.current.set(option.value, el)}
                  type="checkbox"
                  className="form-checkbox-input"
                  checked={isChecked}
                  onChange={() => handleOptionChange(option)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={disabled || option.disabled}
                  name={name}
                  value={String(option.value)}
                  aria-describedby={ariaDescribedBy}
                />
                
                <div className="form-checkbox-visual">
                  <motion.div
                    className="form-checkbox-check"
                    initial={false}
                    animate={{
                      scale: isChecked ? 1 : 0,
                      opacity: isChecked ? 1 : 0
                    }}
                    transition={{
                      duration: animation.enabled ? (animation.duration || 200) / 1000 : 0
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </motion.div>
                </div>
                
                <div className="form-checkbox-option-content">
                  {option.icon && (
                    <div className="form-checkbox-option-icon">
                      {option.icon}
                    </div>
                  )}
                  
                  <div className="form-checkbox-option-text">
                    <span className="form-checkbox-option-label">
                      {option.label}
                    </span>
                    
                    {option.description && (
                      <span className="form-checkbox-option-description">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        
        {/* Helper Text */}
        {helperText && !errorText && (
          <p className="form-checkbox-helper-text">
            {helperText}
          </p>
        )}
        
        {/* Error Text */}
        {(errorText || currentValidationState.errors.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="form-checkbox-error-text"
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

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox; 