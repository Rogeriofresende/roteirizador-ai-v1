import React, { useState, useRef, useCallback, memo, forwardRef, useId, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme as designTokens } from '../../design-system/tokens';

// ===== ALPHA TECHNICAL FOUNDATION: ADVANCED TYPESCRIPT INTERFACES =====

export interface FormTextareaProps {
  // Core Props
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  
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
  
  // Content Props
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  warningMessage?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  
  // Textarea Specific Props
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  resizable?: boolean;
  
  // Advanced Features
  showToolbar?: boolean;
  toolbarActions?: ToolbarAction[];
  showWordCount?: boolean;
  showLineCount?: boolean;
  
  // Interaction Props
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onResize?: (height: number) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  textareaClassName?: string;
  labelClassName?: string;
  
  // Advanced Props
  debounceMs?: number;
  autoFocus?: boolean;
  spellCheck?: boolean;
  'data-testid'?: string;
}

interface ToolbarAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (textareaRef: React.RefObject<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

interface FormTextareaState {
  isFocused: boolean;
  hasValue: boolean;
  isHovered: boolean;
  currentHeight: number;
  isResizing: boolean;
}

interface ValidationState {
  isValid: boolean;
  message: string;
  type: 'error' | 'success' | 'warning' | 'none';
}

interface TextMetrics {
  characterCount: number;
  wordCount: number;
  lineCount: number;
  remainingChars: number;
}

// ===== ALPHA PERFORMANCE OPTIMIZATION: AUTO-RESIZE HOOKS =====

const useAutoResize = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  value: string,
  autoResize: boolean,
  minRows: number,
  maxRows: number,
  onResize?: (height: number) => void
) => {
  const [height, setHeight] = useState<number>(0);
  
  const calculateHeight = useCallback(() => {
    if (!textareaRef.current || !autoResize) return;
    
    const textarea = textareaRef.current;
    const style = window.getComputedStyle(textarea);
    const lineHeight = parseInt(style.lineHeight);
    const paddingTop = parseInt(style.paddingTop);
    const paddingBottom = parseInt(style.paddingBottom);
    
    // Reset height to calculate scroll height
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    
    // Calculate constraints
    const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
    
    // Apply constraints
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    
    textarea.style.height = `${newHeight}px`;
    setHeight(newHeight);
    onResize?.(newHeight);
  }, [autoResize, minRows, maxRows, onResize]);
  
  useLayoutEffect(() => {
    calculateHeight();
  }, [value, calculateHeight]);
  
  return { height, calculateHeight };
};

const useTextMetrics = (value: string, maxLength?: number): TextMetrics => {
  return React.useMemo(() => {
    const characterCount = value.length;
    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const lineCount = value.split('\n').length;
    const remainingChars = maxLength ? Math.max(0, maxLength - characterCount) : 0;
    
    return {
      characterCount,
      wordCount,
      lineCount,
      remainingChars,
    };
  }, [value, maxLength]);
};

const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// ===== BETA V7.5 ENHANCED: GLASS-MORPHISM VARIANTS =====

const getVariantStyles = (variant: string, state: FormTextareaState, validation: ValidationState) => {
  const baseStyles = {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: designTokens.borderRadius.lg,
    resize: 'none' as const,
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
      paddingRight: 0,
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
      minHeight: '64px',
      fontSize: designTokens.typography.fontSize.sm,
      padding: '8px 12px',
      lineHeight: '1.4',
    },
    md: {
      minHeight: '80px', 
      fontSize: designTokens.typography.fontSize.base,
      padding: '12px 16px',
      lineHeight: '1.5',
    },
    lg: {
      minHeight: '96px',
      fontSize: designTokens.typography.fontSize.lg,
      padding: '16px 20px',
      lineHeight: '1.6',
    },
    xl: {
      minHeight: '112px',
      fontSize: designTokens.typography.fontSize.xl,
      padding: '20px 24px',
      lineHeight: '1.7',
    },
  };
  
  return sizes[size as keyof typeof sizes] || sizes.md;
};

// ===== CHARLIE ACCESSIBILITY FRAMEWORK =====

const getAriaProps = (props: FormTextareaProps, validation: ValidationState, textareaId: string, metrics: TextMetrics) => ({
  'aria-invalid': validation.type === 'error',
  'aria-describedby': [
    props.helperText && `${textareaId}-helper`,
    validation.message && `${textareaId}-validation`,
    props.showCharacterCount && `${textareaId}-count`,
  ].filter(Boolean).join(' ') || undefined,
  'aria-required': props.required,
  'aria-label': !props.label ? props.placeholder : undefined,
  'aria-multiline': true,
  'aria-expanded': undefined, // For future autocomplete features
});

// ===== TOOLBAR COMPONENT =====

const TextareaToolbar: React.FC<{
  actions: ToolbarAction[];
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  size: string;
}> = ({ actions, textareaRef, size }) => {
  const toolbarHeight = size === 'sm' ? '32px' : size === 'md' ? '36px' : '40px';
  
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing[2],
        padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
        borderTop: `1px solid ${designTokens.colors.neutral[200]}`,
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: `0 0 ${designTokens.borderRadius.lg} ${designTokens.borderRadius.lg}`,
        height: toolbarHeight,
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {actions.map((action) => (
        <motion.button
          key={action.id}
          type="button"
          disabled={action.disabled}
          onClick={() => action.action(textareaRef)}
          style={{
            background: 'none',
            border: 'none',
            padding: `${designTokens.spacing[1]} ${designTokens.spacing[2]}`,
            cursor: action.disabled ? 'not-allowed' : 'pointer',
            color: action.disabled 
              ? designTokens.colors.neutral[400] 
              : designTokens.colors.neutral[600],
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSize.sm,
            display: 'flex',
            alignItems: 'center',
            gap: designTokens.spacing[1],
          }}
          whileHover={!action.disabled ? { 
            backgroundColor: designTokens.colors.neutral[100],
          } : {}}
          whileTap={!action.disabled ? { scale: 0.95 } : {}}
        >
          {action.icon}
          <span>{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

// ===== MAIN COMPONENT =====

export const FormTextarea = memo(forwardRef<HTMLTextAreaElement, FormTextareaProps>(({
  // Core props
  id,
  name,
  value,
  defaultValue,
  placeholder,
  
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
  
  // Textarea specific props
  rows = 3,
  minRows = 2,
  maxRows = 10,
  autoResize = true,
  resizable = false,
  
  // Advanced features
  showToolbar = false,
  toolbarActions = [],
  showWordCount = false,
  showLineCount = false,
  
  // Interaction props
  onChange,
  onFocus,
  onBlur,
  onResize,
  onKeyDown,
  
  // Layout props
  fullWidth = false,
  className = '',
  style,
  textareaClassName = '',
  labelClassName = '',
  
  // Advanced props
  debounceMs = 0,
  autoFocus = false,
  spellCheck,
  'data-testid': testId,
  
  ...restProps
}, ref) => {
  // ===== STATE MANAGEMENT =====
  const textareaId = useId();
  const finalId = id || textareaId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Merge refs
  React.useImperativeHandle(ref, () => textareaRef.current!, []);
  
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [state, setState] = useState<FormTextareaState>({
    isFocused: false,
    hasValue: Boolean(value || defaultValue),
    isHovered: false,
    currentHeight: 0,
    isResizing: false,
  });
  
  const currentValue = value !== undefined ? value : internalValue;
  const validation = {
    isValid: !error,
    message: error ? errorMessage : success ? successMessage : warning ? warningMessage : '',
    type: error ? 'error' as const : success ? 'success' as const : warning ? 'warning' as const : 'none' as const,
  };
  
  // ===== HOOKS =====
  const textMetrics = useTextMetrics(currentValue, maxLength);
  const { height, calculateHeight } = useAutoResize(
    textareaRef, 
    currentValue, 
    autoResize, 
    minRows, 
    maxRows, 
    onResize
  );
  const debouncedOnChange = useDebounce(onChange, debounceMs);
  
  // ===== EVENT HANDLERS =====
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  
  const handleFocus = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, isFocused: true }));
    onFocus?.(event);
  }, [onFocus]);
  
  const handleBlur = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, isFocused: false }));
    onBlur?.(event);
  }, [onBlur]);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle common shortcuts
    if (event.metaKey || event.ctrlKey) {
      switch (event.key) {
        case 'Enter':
          // Allow Cmd/Ctrl+Enter for submit
          break;
        case 'a':
          // Allow Cmd/Ctrl+A for select all
          break;
        default:
          break;
      }
    }
    
    onKeyDown?.(event);
  }, [onKeyDown]);
  
  // ===== STYLES =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    position: 'relative' as const,
  };
  
  const textareaStyles = {
    ...getSizeStyles(size),
    ...getVariantStyles(variant, state, validation),
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: designTokens.colors.neutral[900],
    fontFamily: designTokens.typography.fontFamily.sans,
    fontWeight: designTokens.typography.fontWeight.normal,
    resize: resizable ? 'vertical' as const : 'none' as const,
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
      
      {/* Textarea Container */}
      <div style={{ position: 'relative' }}>
        <motion.textarea
          ref={textareaRef}
          id={finalId}
          name={name}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          rows={autoResize ? undefined : rows}
          autoFocus={autoFocus}
          spellCheck={spellCheck}
          data-testid={testId}
          style={textareaStyles}
          className={textareaClassName}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...getAriaProps({ required, helperText, errorMessage, successMessage, warningMessage, showCharacterCount }, validation, finalId, textMetrics)}
          {...restProps}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Toolbar */}
        <AnimatePresence>
          {showToolbar && toolbarActions.length > 0 && (
            <TextareaToolbar
              actions={toolbarActions}
              textareaRef={textareaRef}
              size={size}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Information */}
      <AnimatePresence>
        {(helperText || validation.message || showCharacterCount || showWordCount || showLineCount) && (
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
            
            {/* Metrics */}
            {(showCharacterCount || showWordCount || showLineCount) && (
              <div
                id={`${finalId}-count`}
                style={{
                  display: 'flex',
                  gap: designTokens.spacing[3],
                  fontSize: designTokens.typography.fontSize.xs,
                  color: designTokens.colors.neutral[500],
                  flexShrink: 0,
                }}
              >
                {showCharacterCount && (
                  <span style={{
                    color: maxLength && textMetrics.characterCount > maxLength * 0.9
                      ? designTokens.colors.red[500]
                      : maxLength && textMetrics.characterCount > maxLength * 0.8
                      ? designTokens.colors.yellow[500]
                      : designTokens.colors.neutral[500],
                  }}>
                    {maxLength 
                      ? `${textMetrics.characterCount}/${maxLength}`
                      : `${textMetrics.characterCount} chars`
                    }
                  </span>
                )}
                
                {showWordCount && (
                  <span>{textMetrics.wordCount} words</span>
                )}
                
                {showLineCount && (
                  <span>{textMetrics.lineCount} lines</span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}));

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea; 