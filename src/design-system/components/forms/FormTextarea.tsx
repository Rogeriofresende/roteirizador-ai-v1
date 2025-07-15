import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  forwardRef,
  useImperativeHandle,
  TextareaHTMLAttributes,
  ReactNode,
  FocusEvent,
  ChangeEvent,
  KeyboardEvent
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FormTextarea.css';

// ==========================================
// 🔴 IA ALPHA - ADVANCED TYPESCRIPT INTERFACES
// ==========================================

/**
 * V7.5 Enhanced FormTextarea Validation Rules
 */
export interface FormTextareaValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'wordCount' | 'custom';
  value?: string | number | RegExp;
  message: string;
  validator?: (value: string) => boolean | Promise<boolean>;
}

/**
 * V7.5 Enhanced Character Count Configuration
 */
export interface FormTextareaCharacterCount {
  enabled: boolean;
  maxLength?: number;
  showProgress?: boolean;
  showWarning?: boolean;
  warningThreshold?: number; // Percentage (e.g., 80 for 80%)
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  format?: 'simple' | 'detailed' | 'percentage';
}

/**
 * V7.5 Enhanced Auto-resize Configuration
 */
export interface FormTextareaAutoResize {
  enabled: boolean;
  minRows?: number;
  maxRows?: number;
  animationDuration?: number; // in milliseconds
  animationEasing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  debounceDelay?: number; // in milliseconds
}

/**
 * V7.5 Enhanced Toolbar Configuration
 */
export interface FormTextareaToolbar {
  enabled: boolean;
  position?: 'top' | 'bottom';
  tools?: ('bold' | 'italic' | 'underline' | 'link' | 'emoji' | 'mention' | 'hashtag')[];
  customTools?: {
    icon: ReactNode;
    label: string;
    action: (textarea: HTMLTextAreaElement) => void;
  }[];
}

/**
 * V7.5 Enhanced Validation State
 */
export interface FormTextareaValidationState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  errors: string[];
  warnings: string[];
  validationProgress?: number;
}

/**
 * V7.5 Enhanced Performance Metrics
 */
export interface FormTextareaMetrics {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number; // in minutes
  sentiment?: 'positive' | 'neutral' | 'negative';
  density?: 'sparse' | 'normal' | 'dense';
}

/**
 * V7.5 Enhanced Event Handlers
 */
export interface FormTextareaEventHandlers {
  onChange?: (value: string, metrics: FormTextareaMetrics) => void;
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onValidation?: (state: FormTextareaValidationState) => void;
  onResize?: (height: number) => void;
  onCharacterLimit?: (exceeded: boolean, remaining: number) => void;
  onToolbarAction?: (tool: string, selection: string) => void;
}

/**
 * V7.5 Enhanced Main FormTextarea Props Interface
 */
export interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onFocus' | 'onBlur'> {
  // V7.5 Core Design System Integration
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
  // Glass-morphism Effects
  glassEffect?: 'subtle' | 'medium' | 'strong';
  
  // Enhanced Validation System
  validationState?: 'neutral' | 'success' | 'warning' | 'error';
  validationRules?: FormTextareaValidationRule[];
  
  // Professional Features
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: ReactNode;
  
  // Advanced Features
  characterCount?: FormTextareaCharacterCount;
  autoResize?: FormTextareaAutoResize;
  toolbar?: FormTextareaToolbar;
  
  // Performance & Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  screenReaderText?: string;
  
  // Animation System
  animationPreset?: 'smooth' | 'bounce' | 'slide';
  
  // V7.5 Enhanced Event Handlers
  eventHandlers?: FormTextareaEventHandlers;
  
  // Analytics Integration
  analyticsId?: string;
  trackInteractions?: boolean;
}

/**
 * V7.5 Enhanced Ref Interface
 */
export interface FormTextareaRef {
  focus: () => void;
  blur: () => void;
  select: () => void;
  getMetrics: () => FormTextareaMetrics;
  getValidationState: () => FormTextareaValidationState;
  setValue: (value: string) => void;
  insertText: (text: string, position?: number) => void;
  selectRange: (start: number, end: number) => void;
  resize: () => void;
}

// ==========================================
// 🔴 IA ALPHA - PERFORMANCE HOOKS
// ==========================================

/**
 * Auto-resize hook with performance optimization
 */
function useAutoResize(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  config: FormTextareaAutoResize,
  value: string
) {
  const [height, setHeight] = useState<number>(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  
  const calculateHeight = useCallback(() => {
    if (!textareaRef.current || !config.enabled) return;
    
    const textarea = textareaRef.current;
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight);
    const paddingTop = parseInt(computedStyle.paddingTop);
    const paddingBottom = parseInt(computedStyle.paddingBottom);
    const borderTop = parseInt(computedStyle.borderTopWidth);
    const borderBottom = parseInt(computedStyle.borderBottomWidth);
    
    // Reset height to get accurate scrollHeight
    textarea.style.height = 'auto';
    
    const minHeight = (config.minRows || 3) * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    const maxHeight = (config.maxRows || 10) * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
    
    let newHeight = Math.max(minHeight, textarea.scrollHeight);
    if (config.maxRows) {
      newHeight = Math.min(newHeight, maxHeight);
    }
    
    setHeight(newHeight);
    textarea.style.height = `${newHeight}px`;
  }, [textareaRef, config]);
  
  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      calculateHeight();
    }, config.debounceDelay || 100);
  }, [calculateHeight, config.debounceDelay]);
  
  useEffect(() => {
    calculateHeight();
  }, [value, calculateHeight]);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !config.enabled) return;
    
    textarea.addEventListener('input', debouncedResize);
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      textarea.removeEventListener('input', debouncedResize);
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [debouncedResize, config.enabled]);
  
  return { height, calculateHeight };
}

/**
 * Character count hook with optimization
 */
function useCharacterCount(
  value: string,
  config: FormTextareaCharacterCount
) {
  const metrics = useMemo(() => {
    if (!config.enabled) return null;
    
    const characters = value.length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const sentences = value.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = value.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    // Estimate reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);
    
    const remaining = config.maxLength ? config.maxLength - characters : Infinity;
    const isNearLimit = config.maxLength && config.warningThreshold ? 
      (characters / config.maxLength) >= (config.warningThreshold / 100) : false;
    const isOverLimit = config.maxLength ? characters > config.maxLength : false;
    
    return {
      characters,
      words,
      sentences,
      paragraphs,
      readingTime,
      remaining,
      isNearLimit,
      isOverLimit,
      progress: config.maxLength ? (characters / config.maxLength) * 100 : 0
    };
  }, [value, config]);
  
  return metrics;
}

/**
 * Validation hook with async support
 */
function useFormTextareaValidation(
  value: string,
  rules: FormTextareaValidationRule[] = []
) {
  const [validationState, setValidationState] = useState<FormTextareaValidationState>({
    isValid: true,
    isDirty: false,
    isTouched: false,
    isValidating: false,
    errors: [],
    warnings: []
  });
  
  const validateField = useCallback(async () => {
    if (rules.length === 0) return;
    
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const rule of rules) {
      try {
        let isValid = true;
        
        switch (rule.type) {
          case 'required':
            isValid = value.trim().length > 0;
            break;
          case 'minLength':
            isValid = value.length >= (rule.value as number);
            break;
          case 'maxLength':
            isValid = value.length <= (rule.value as number);
            break;
          case 'pattern':
            isValid = (rule.value as RegExp).test(value);
            break;
          case 'wordCount':
            const wordCount = value.trim().split(/\s+/).length;
            isValid = wordCount >= (rule.value as number);
            break;
          case 'custom':
            if (rule.validator) {
              isValid = await rule.validator(value);
            }
            break;
        }
        
        if (!isValid) {
          errors.push(rule.message);
        }
      } catch (error) {
        errors.push(`Validation error: ${error}`);
      }
    }
    
    setValidationState(prev => ({
      ...prev,
      isValid: errors.length === 0,
      errors,
      warnings,
      isValidating: false,
      isDirty: true
    }));
  }, [value, rules]);
  
  useEffect(() => {
    const timeoutId = setTimeout(validateField, 300);
    return () => clearTimeout(timeoutId);
  }, [validateField]);
  
  return validationState;
}

// ==========================================
// 🔴 IA ALPHA - MAIN COMPONENT
// ==========================================

/**
 * V7.5 Enhanced FormTextarea Component
 * Professional textarea with auto-resize, character count, and validation
 */
export const FormTextarea = forwardRef<FormTextareaRef, FormTextareaProps>(
  ({
    variant = 'outlined',
    size = 'md',
    glassEffect = 'subtle',
    validationState = 'neutral',
    validationRules = [],
    label,
    helperText,
    errorText,
    leadingIcon,
    characterCount = { enabled: false },
    autoResize = { enabled: true, minRows: 3, maxRows: 10 },
    toolbar = { enabled: false },
    ariaLabel,
    ariaDescribedBy,
    screenReaderText,
    animationPreset = 'smooth',
    eventHandlers = {},
    analyticsId,
    trackInteractions = false,
    value = '',
    defaultValue,
    className = '',
    ...textareaProps
  }, ref) => {
    
    // State Management
    const [internalValue, setInternalValue] = useState(value || defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    
    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Hooks
    const { height, calculateHeight } = useAutoResize(textareaRef, autoResize, internalValue);
    const characterMetrics = useCharacterCount(internalValue, characterCount);
    const validation = useFormTextareaValidation(internalValue, validationRules);
    
    // Computed values
    const currentValidationState = errorText ? 'error' : validationState;
    const displayError = errorText || (validation.errors.length > 0 ? validation.errors[0] : '');
    const isError = currentValidationState === 'error' || validation.errors.length > 0;
    const isWarning = currentValidationState === 'warning' || (characterMetrics?.isNearLimit && !characterMetrics?.isOverLimit);
    const isSuccess = currentValidationState === 'success' && validation.isValid && isTouched;
    
    // Metrics calculation
    const metrics = useMemo<FormTextareaMetrics>(() => ({
      characters: internalValue.length,
      words: internalValue.trim() ? internalValue.trim().split(/\s+/).length : 0,
      sentences: internalValue.split(/[.!?]+/).filter(s => s.trim()).length,
      paragraphs: internalValue.split(/\n\s*\n/).filter(p => p.trim()).length,
      readingTime: Math.ceil((internalValue.trim().split(/\s+/).length || 1) / 200)
    }), [internalValue]);
    
    // Event Handlers
    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);
      
      // Analytics tracking
      if (trackInteractions && analyticsId) {
        // Analytics implementation would go here
      }
      
      eventHandlers.onChange?.(newValue, metrics);
    }, [eventHandlers, metrics, trackInteractions, analyticsId]);
    
    const handleFocus = useCallback((event: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      eventHandlers.onFocus?.(event);
    }, [eventHandlers]);
    
    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      setIsTouched(true);
      eventHandlers.onBlur?.(event);
    }, [eventHandlers]);
    
    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            // Auto-save logic would go here
            break;
          case 'Enter':
            if (event.shiftKey) {
              // Allow Shift+Enter for new line
              return;
            }
            // Handle submit if needed
            break;
        }
      }
      
      textareaProps.onKeyDown?.(event);
    }, [textareaProps]);
    
    // Imperative Handle
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      select: () => textareaRef.current?.select(),
      getMetrics: () => metrics,
      getValidationState: () => validation,
      setValue: (newValue: string) => setInternalValue(newValue),
      insertText: (text: string, position?: number) => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const start = position ?? textarea.selectionStart;
        const end = position ?? textarea.selectionEnd;
        const before = internalValue.substring(0, start);
        const after = internalValue.substring(end);
        const newValue = before + text + after;
        
        setInternalValue(newValue);
        
        // Set cursor position after inserted text
        setTimeout(() => {
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
      },
      selectRange: (start: number, end: number) => {
        textareaRef.current?.setSelectionRange(start, end);
      },
      resize: calculateHeight
    }), [metrics, validation, internalValue, calculateHeight]);
    
    // CSS Classes
    const containerClasses = [
      'form-textarea-container',
      `form-textarea-container--${variant}`,
      `form-textarea-container--${size}`,
      `form-textarea-container--glass-${glassEffect}`,
      isFocused && 'form-textarea-container--focused',
      isError && 'form-textarea-container--error',
      isWarning && 'form-textarea-container--warning',
      isSuccess && 'form-textarea-container--success',
      textareaProps.disabled && 'form-textarea-container--disabled',
      textareaProps.readOnly && 'form-textarea-container--readonly',
      className
    ].filter(Boolean).join(' ');
    
    const textareaClasses = [
      'form-textarea',
      `form-textarea--${variant}`,
      `form-textarea--${size}`,
      autoResize.enabled && 'form-textarea--auto-resize'
    ].filter(Boolean).join(' ');
    
    return (
      <div className={containerClasses} ref={containerRef}>
        {/* Label */}
        {label && (
          <label className="form-textarea-label" htmlFor={textareaProps.id}>
            {label}
            {validationRules.some(rule => rule.type === 'required') && (
              <span className="form-textarea-required" aria-label="required">*</span>
            )}
          </label>
        )}
        
        {/* Main Textarea Container */}
        <div className="form-textarea-wrapper">
          {/* Leading Icon */}
          {leadingIcon && (
            <div className="form-textarea-leading-icon">
              {leadingIcon}
            </div>
          )}
          
          {/* Textarea */}
          <motion.textarea
            ref={textareaRef}
            className={textareaClasses}
            value={internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={isError}
            aria-required={validationRules.some(rule => rule.type === 'required')}
            style={autoResize.enabled ? { height } : undefined}
            animate={{
              height: autoResize.enabled ? height : undefined
            }}
            transition={{
              duration: (autoResize.animationDuration || 200) / 1000,
              ease: autoResize.animationEasing || 'ease-out'
            }}
            {...textareaProps}
          />
          
          {/* Character Count */}
          {characterCount.enabled && characterMetrics && (
            <div className={`form-textarea-character-count form-textarea-character-count--${characterCount.position || 'bottom-right'}`}>
              <AnimatePresence>
                {characterCount.format === 'detailed' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="form-textarea-metrics"
                  >
                    <span className="form-textarea-metric">{characterMetrics.characters} chars</span>
                    <span className="form-textarea-metric">{characterMetrics.words} words</span>
                    {characterCount.maxLength && (
                      <span className={`form-textarea-limit ${characterMetrics.isOverLimit ? 'form-textarea-limit--over' : characterMetrics.isNearLimit ? 'form-textarea-limit--warning' : ''}`}>
                        {characterMetrics.remaining} remaining
                      </span>
                    )}
                  </motion.div>
                ) : characterCount.format === 'percentage' && characterCount.maxLength ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="form-textarea-percentage"
                  >
                    {Math.round(characterMetrics.progress)}%
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`form-textarea-simple-count ${characterMetrics.isOverLimit ? 'form-textarea-simple-count--over' : ''}`}
                  >
                    {characterCount.maxLength ? `${characterMetrics.characters}/${characterCount.maxLength}` : characterMetrics.characters}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Progress Bar */}
              {characterCount.showProgress && characterCount.maxLength && (
                <div className="form-textarea-progress-container">
                  <motion.div
                    className={`form-textarea-progress ${characterMetrics.isOverLimit ? 'form-textarea-progress--over' : characterMetrics.isNearLimit ? 'form-textarea-progress--warning' : ''}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(characterMetrics.progress, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Helper Text */}
        {helperText && !displayError && (
          <p className="form-textarea-helper-text">
            {helperText}
          </p>
        )}
        
        {/* Error Text */}
        {displayError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="form-textarea-error-text"
            role="alert"
          >
            {displayError}
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
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea; 