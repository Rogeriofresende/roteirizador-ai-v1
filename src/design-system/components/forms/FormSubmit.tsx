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
  MouseEvent
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Check, 
  X, 
  AlertCircle, 
  Send, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import './FormSubmit.css';

// ==========================================
// 🔴 IA ALPHA - ADVANCED TYPESCRIPT INTERFACES
// ==========================================

/**
 * V7.5 Enhanced Submission State
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isCompleted: boolean;
  isSuccess: boolean;
  isError: boolean;
  hasErrors: boolean;
  progress: number;
  startTime: Date | null;
  endTime: Date | null;
  duration: number;
  errors: string[];
  warnings: string[];
  data: Record<string, any>;
  response: any;
}

/**
 * V7.5 Enhanced Submit Button State
 */
export interface FormSubmitButtonState {
  isDisabled: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  canSubmit: boolean;
  validationStatus: 'idle' | 'validating' | 'valid' | 'invalid';
  submissionStatus: 'idle' | 'preparing' | 'submitting' | 'success' | 'error';
}

/**
 * V7.5 Enhanced Submit Configuration
 */
export interface FormSubmitConfig {
  validateBeforeSubmit?: boolean;
  showProgress?: boolean;
  showValidationStatus?: boolean;
  enableRetry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  preventDefault?: boolean;
  resetOnSuccess?: boolean;
  focusOnError?: boolean;
  confirmBeforeSubmit?: boolean;
}

/**
 * V7.5 Enhanced Submit Progress
 */
export interface FormSubmitProgress {
  phase: 'validation' | 'preparation' | 'submission' | 'processing' | 'complete';
  progress: number;
  message: string;
  startTime: Date;
  estimatedTime?: number;
  canCancel: boolean;
}

/**
 * V7.5 Enhanced Submit Validation
 */
export interface FormSubmitValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string[]>;
  lastValidated: Date | null;
  validationDuration: number;
}

/**
 * V7.5 Enhanced Submit Response
 */
export interface FormSubmitResponse {
  success: boolean;
  data?: any;
  errors?: string[];
  warnings?: string[];
  redirect?: string;
  message?: string;
  timestamp: Date;
  duration: number;
}

/**
 * V7.5 Enhanced Submit Metrics
 */
export interface FormSubmitMetrics {
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  averageSubmissionTime: number;
  validationTime: number;
  retryAttempts: number;
  cancelledSubmissions: number;
}

/**
 * V7.5 Enhanced Event Handlers
 */
export interface FormSubmitEventHandlers {
  onSubmitStart?: (data: Record<string, any>) => void | Promise<void>;
  onSubmitProgress?: (progress: FormSubmitProgress) => void;
  onSubmitSuccess?: (response: FormSubmitResponse) => void;
  onSubmitError?: (error: Error, data?: Record<string, any>) => void;
  onSubmitComplete?: (state: FormSubmissionState) => void;
  onSubmitCancel?: () => void;
  onSubmitRetry?: (attempt: number) => void;
  onValidationStart?: () => void;
  onValidationComplete?: (validation: FormSubmitValidation) => void;
  onReset?: () => void;
}

/**
 * V7.5 Enhanced Animation Configuration
 */
export interface FormSubmitAnimation {
  preset?: 'smooth' | 'bounce' | 'pulse' | 'slide' | 'fade';
  duration?: number;
  delay?: number;
  enabled?: boolean;
  easing?: string;
}

/**
 * V7.5 Enhanced Button Customization
 */
export interface FormSubmitButtonCustomization {
  idleIcon?: ReactNode;
  loadingIcon?: ReactNode;
  successIcon?: ReactNode;
  errorIcon?: ReactNode;
  idleText?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  validatingText?: string;
  retryText?: string;
}

/**
 * V7.5 Enhanced Main FormSubmit Props Interface
 */
export interface FormSubmitProps {
  // V7.5 Core Design System Integration
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
  // Glass-morphism Effects
  glassEffect?: 'subtle' | 'medium' | 'strong';
  
  // Submit Button Configuration
  type?: 'submit' | 'button';
  disabled?: boolean;
  loading?: boolean;
  
  // Text Content
  children?: ReactNode;
  
  // Form Integration
  formRef?: React.RefObject<HTMLFormElement>;
  validationRef?: React.RefObject<any>;
  
  // Submit Configuration
  config?: FormSubmitConfig;
  
  // Custom Submission Handler
  onSubmit?: (data: Record<string, any>) => Promise<FormSubmitResponse> | FormSubmitResponse;
  
  // Button Customization
  buttonCustomization?: FormSubmitButtonCustomization;
  
  // Professional Features
  title?: string;
  description?: string;
  
  // Performance Configuration
  debounceMs?: number;
  enableMetrics?: boolean;
  
  // Custom Rendering
  customProgressRenderer?: (progress: FormSubmitProgress) => ReactNode;
  customSuccessRenderer?: (response: FormSubmitResponse) => ReactNode;
  customErrorRenderer?: (error: Error, retry?: () => void) => ReactNode;
  
  // Performance & Accessibility
  id?: string;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  
  // Animation System
  animation?: FormSubmitAnimation;
  
  // V7.5 Enhanced Event Handlers
  eventHandlers?: FormSubmitEventHandlers;
  
  // Additional Props
  style?: React.CSSProperties;
  tabIndex?: number;
  autoFocus?: boolean;
}

/**
 * V7.5 Enhanced Ref Interface
 */
export interface FormSubmitRef {
  submit: (data?: Record<string, any>) => Promise<FormSubmitResponse>;
  cancel: () => void;
  retry: () => Promise<FormSubmitResponse>;
  reset: () => void;
  getState: () => FormSubmissionState;
  getMetrics: () => FormSubmitMetrics;
  getProgress: () => FormSubmitProgress | null;
  isSubmitting: () => boolean;
  canSubmit: () => boolean;
  focus: () => void;
  blur: () => void;
}

// ==========================================
// 🔴 IA ALPHA - PERFORMANCE HOOKS
// ==========================================

/**
 * Form submission state management hook
 */
function useFormSubmissionState(
  config: FormSubmitConfig = {},
  eventHandlers: FormSubmitEventHandlers = {}
) {
  const [submissionState, setSubmissionState] = useState<FormSubmissionState>(() => ({
    isSubmitting: false,
    isCompleted: false,
    isSuccess: false,
    isError: false,
    hasErrors: false,
    progress: 0,
    startTime: null,
    endTime: null,
    duration: 0,
    errors: [],
    warnings: [],
    data: {},
    response: null
  }));
  
  const [buttonState, setButtonState] = useState<FormSubmitButtonState>(() => ({
    isDisabled: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    canSubmit: true,
    validationStatus: 'idle',
    submissionStatus: 'idle'
  }));
  
  const [progress, setProgress] = useState<FormSubmitProgress | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const metricsRef = useRef<FormSubmitMetrics>({
    totalSubmissions: 0,
    successfulSubmissions: 0,
    failedSubmissions: 0,
    averageSubmissionTime: 0,
    validationTime: 0,
    retryAttempts: 0,
    cancelledSubmissions: 0
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateProgress = useCallback((newProgress: Partial<FormSubmitProgress>) => {
    setProgress(prev => prev ? { ...prev, ...newProgress } : null);
    eventHandlers.onSubmitProgress?.(progress!);
  }, [eventHandlers, progress]);
  
  const startSubmission = useCallback((data: Record<string, any>) => {
    const startTime = new Date();
    
    setSubmissionState(prev => ({
      ...prev,
      isSubmitting: true,
      isCompleted: false,
      isSuccess: false,
      isError: false,
      hasErrors: false,
      progress: 0,
      startTime,
      endTime: null,
      duration: 0,
      errors: [],
      warnings: [],
      data,
      response: null
    }));
    
    setButtonState(prev => ({
      ...prev,
      isLoading: true,
      isSuccess: false,
      isError: false,
      submissionStatus: 'preparing'
    }));
    
    setProgress({
      phase: 'preparation',
      progress: 0,
      message: 'Preparing submission...',
      startTime,
      canCancel: true
    });
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    // Set timeout if configured
    if (config.timeout) {
      timeoutRef.current = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, config.timeout);
    }
    
    metricsRef.current.totalSubmissions++;
    eventHandlers.onSubmitStart?.(data);
  }, [config.timeout, eventHandlers]);
  
  const completeSubmission = useCallback((response: FormSubmitResponse) => {
    const endTime = new Date();
    const duration = submissionState.startTime ? endTime.getTime() - submissionState.startTime.getTime() : 0;
    
    setSubmissionState(prev => ({
      ...prev,
      isSubmitting: false,
      isCompleted: true,
      isSuccess: response.success,
      isError: !response.success,
      hasErrors: !response.success,
      progress: 100,
      endTime,
      duration,
      errors: response.errors || [],
      warnings: response.warnings || [],
      response
    }));
    
    setButtonState(prev => ({
      ...prev,
      isLoading: false,
      isSuccess: response.success,
      isError: !response.success,
      submissionStatus: response.success ? 'success' : 'error'
    }));
    
    setProgress({
      phase: 'complete',
      progress: 100,
      message: response.success ? 'Submission completed successfully' : 'Submission failed',
      startTime: submissionState.startTime!,
      canCancel: false
    });
    
    // Update metrics
    if (response.success) {
      metricsRef.current.successfulSubmissions++;
    } else {
      metricsRef.current.failedSubmissions++;
    }
    
    metricsRef.current.averageSubmissionTime = 
      (metricsRef.current.averageSubmissionTime * (metricsRef.current.totalSubmissions - 1) + duration) / 
      metricsRef.current.totalSubmissions;
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    abortControllerRef.current = null;
    
    eventHandlers.onSubmitComplete?.(submissionState);
    
    if (response.success) {
      eventHandlers.onSubmitSuccess?.(response);
    } else {
      eventHandlers.onSubmitError?.(new Error(response.errors?.join(', ') || 'Submission failed'), submissionState.data);
    }
  }, [submissionState.startTime, submissionState.data, eventHandlers]);
  
  const cancelSubmission = useCallback(() => {
    abortControllerRef.current?.abort();
    
    setSubmissionState(prev => ({
      ...prev,
      isSubmitting: false,
      isCompleted: true,
      isSuccess: false,
      isError: false,
      hasErrors: false,
      progress: 0
    }));
    
    setButtonState(prev => ({
      ...prev,
      isLoading: false,
      isSuccess: false,
      isError: false,
      submissionStatus: 'idle'
    }));
    
    setProgress(null);
    
    metricsRef.current.cancelledSubmissions++;
    eventHandlers.onSubmitCancel?.();
  }, [eventHandlers]);
  
  const retrySubmission = useCallback(() => {
    setRetryCount(prev => prev + 1);
    metricsRef.current.retryAttempts++;
    eventHandlers.onSubmitRetry?.(retryCount + 1);
  }, [retryCount, eventHandlers]);
  
  const resetSubmission = useCallback(() => {
    setSubmissionState({
      isSubmitting: false,
      isCompleted: false,
      isSuccess: false,
      isError: false,
      hasErrors: false,
      progress: 0,
      startTime: null,
      endTime: null,
      duration: 0,
      errors: [],
      warnings: [],
      data: {},
      response: null
    });
    
    setButtonState({
      isDisabled: false,
      isLoading: false,
      isSuccess: false,
      isError: false,
      canSubmit: true,
      validationStatus: 'idle',
      submissionStatus: 'idle'
    });
    
    setProgress(null);
    setRetryCount(0);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    abortControllerRef.current = null;
    eventHandlers.onReset?.();
  }, [eventHandlers]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);
  
  return {
    submissionState,
    buttonState,
    progress,
    retryCount,
    metrics: metricsRef.current,
    abortController: abortControllerRef.current,
    startSubmission,
    completeSubmission,
    cancelSubmission,
    retrySubmission,
    resetSubmission,
    updateProgress,
    setButtonState
  };
}

/**
 * Form validation integration hook
 */
function useFormValidationIntegration(
  validationRef: React.RefObject<any> | undefined,
  config: FormSubmitConfig = {}
) {
  const [validation, setValidation] = useState<FormSubmitValidation>({
    isValid: true,
    errors: [],
    warnings: [],
    fieldErrors: {},
    lastValidated: null,
    validationDuration: 0
  });
  
  const validateForm = useCallback(async (): Promise<FormSubmitValidation> => {
    if (!config.validateBeforeSubmit || !validationRef?.current) {
      return validation;
    }
    
    const startTime = performance.now();
    
    try {
      const validationResult = await validationRef.current.validate();
      const endTime = performance.now();
      
      const newValidation: FormSubmitValidation = {
        isValid: validationResult.isValid,
        errors: validationResult.errors || [],
        warnings: validationResult.warnings || [],
        fieldErrors: validationResult.fields || {},
        lastValidated: new Date(),
        validationDuration: endTime - startTime
      };
      
      setValidation(newValidation);
      return newValidation;
    } catch (error) {
      const endTime = performance.now();
      
      const errorValidation: FormSubmitValidation = {
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
        fieldErrors: {},
        lastValidated: new Date(),
        validationDuration: endTime - startTime
      };
      
      setValidation(errorValidation);
      return errorValidation;
    }
  }, [config.validateBeforeSubmit, validationRef, validation]);
  
  return {
    validation,
    validateForm
  };
}

/**
 * Form data collection hook
 */
function useFormDataCollection(formRef: React.RefObject<HTMLFormElement> | undefined) {
  const collectFormData = useCallback((): Record<string, any> => {
    if (!formRef?.current) {
      return {};
    }
    
    const formData = new FormData(formRef.current);
    const data: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      if (key in data) {
        // Handle multiple values (e.g., checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    
    return data;
  }, [formRef]);
  
  return {
    collectFormData
  };
}

// ==========================================
// 🔴 IA ALPHA - MAIN COMPONENT
// ==========================================

/**
 * V7.5 Enhanced FormSubmit Component
 * Professional form submission with validation integration and feedback
 */
export const FormSubmit = forwardRef<FormSubmitRef, FormSubmitProps>(
  ({
    variant = 'outlined',
    size = 'md',
    glassEffect = 'subtle',
    type = 'submit',
    disabled = false,
    loading = false,
    children = 'Submit',
    formRef,
    validationRef,
    config = {
      validateBeforeSubmit: true,
      showProgress: true,
      showValidationStatus: true,
      enableRetry: true,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000,
      preventDefault: true,
      resetOnSuccess: false,
      focusOnError: true,
      confirmBeforeSubmit: false
    },
    onSubmit,
    buttonCustomization = {},
    title,
    description,
    debounceMs = 0,
    enableMetrics = true,
    customProgressRenderer,
    customSuccessRenderer,
    customErrorRenderer,
    id,
    className = '',
    ariaLabel,
    ariaDescribedBy,
    animation = { preset: 'smooth', duration: 300, enabled: true },
    eventHandlers = {},
    style,
    tabIndex,
    autoFocus
  }, ref) => {
    
    // Refs
    const buttonRef = useRef<HTMLButtonElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    
    // Hooks
    const {
      submissionState,
      buttonState,
      progress,
      retryCount,
      metrics,
      abortController,
      startSubmission,
      completeSubmission,
      cancelSubmission,
      retrySubmission,
      resetSubmission,
      updateProgress,
      setButtonState
    } = useFormSubmissionState(config, eventHandlers);
    
    const { validation, validateForm } = useFormValidationIntegration(validationRef, config);
    const { collectFormData } = useFormDataCollection(formRef);
    
    // Debounced click handler
    const debouncedClick = useCallback(
      debounceMs > 0 
        ? debounce((handler: () => void) => handler(), debounceMs)
        : (handler: () => void) => handler(),
      [debounceMs]
    );
    
    // Main submission handler
    const handleSubmit = useCallback(async (event?: FormEvent | MouseEvent, data?: Record<string, any>) => {
      if (config.preventDefault && event) {
        event.preventDefault();
      }
      
      if (disabled || loading || submissionState.isSubmitting) {
        return;
      }
      
      const formData = data || collectFormData();
      
      // Confirmation dialog
      if (config.confirmBeforeSubmit) {
        const confirmed = window.confirm('Are you sure you want to submit this form?');
        if (!confirmed) return;
      }
      
      startSubmission(formData);
      
      try {
        // Validation phase
        if (config.validateBeforeSubmit) {
          setButtonState(prev => ({ ...prev, validationStatus: 'validating' }));
          updateProgress({ phase: 'validation', progress: 10, message: 'Validating form...' });
          
          eventHandlers.onValidationStart?.();
          const validationResult = await validateForm();
          
          if (!validationResult.isValid) {
            completeSubmission({
              success: false,
              errors: validationResult.errors,
              warnings: validationResult.warnings,
              message: 'Form validation failed',
              timestamp: new Date(),
              duration: 0
            });
            
            if (config.focusOnError && buttonRef.current) {
              buttonRef.current.focus();
            }
            
            return;
          }
          
          eventHandlers.onValidationComplete?.(validationResult);
        }
        
        // Submission phase
        setButtonState(prev => ({ ...prev, submissionStatus: 'submitting' }));
        updateProgress({ phase: 'submission', progress: 50, message: 'Submitting form...' });
        
        if (onSubmit) {
          const response = await onSubmit(formData);
          
          updateProgress({ phase: 'processing', progress: 90, message: 'Processing response...' });
          
          const submitResponse: FormSubmitResponse = {
            success: response.success,
            data: response.data,
            errors: response.errors,
            warnings: response.warnings,
            redirect: response.redirect,
            message: response.message,
            timestamp: new Date(),
            duration: submissionState.startTime ? new Date().getTime() - submissionState.startTime.getTime() : 0
          };
          
          completeSubmission(submitResponse);
          
          // Handle redirect
          if (response.redirect) {
            window.location.href = response.redirect;
          }
          
          // Reset form if configured
          if (config.resetOnSuccess && response.success && formRef?.current) {
            formRef.current.reset();
            if (config.resetOnSuccess) {
              resetSubmission();
            }
          }
        } else {
          // Default form submission
          if (formRef?.current) {
            const form = formRef.current;
            const formData = new FormData(form);
            
            try {
              const response = await fetch(form.action || '', {
                method: form.method || 'POST',
                body: formData,
                signal: abortController?.signal
              });
              
              const success = response.ok;
              const responseData = await response.json().catch(() => ({}));
              
              completeSubmission({
                success,
                data: responseData,
                errors: success ? [] : ['Submission failed'],
                timestamp: new Date(),
                duration: submissionState.startTime ? new Date().getTime() - submissionState.startTime.getTime() : 0
              });
              
            } catch (error) {
              completeSubmission({
                success: false,
                errors: [error instanceof Error ? error.message : 'Submission failed'],
                timestamp: new Date(),
                duration: submissionState.startTime ? new Date().getTime() - submissionState.startTime.getTime() : 0
              });
            }
          }
        }
        
      } catch (error) {
        completeSubmission({
          success: false,
          errors: [error instanceof Error ? error.message : 'Submission failed'],
          timestamp: new Date(),
          duration: submissionState.startTime ? new Date().getTime() - submissionState.startTime.getTime() : 0
        });
      }
    }, [
      config,
      disabled,
      loading,
      submissionState.isSubmitting,
      submissionState.startTime,
      collectFormData,
      startSubmission,
      validateForm,
      updateProgress,
      setButtonState,
      eventHandlers,
      onSubmit,
      completeSubmission,
      formRef,
      abortController,
      resetSubmission
    ]);
    
    // Retry handler
    const handleRetry = useCallback(async () => {
      if (retryCount >= (config.retryAttempts || 3)) {
        return;
      }
      
      retrySubmission();
      
      // Delay before retry
      if (config.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      }
      
      await handleSubmit(undefined, submissionState.data);
    }, [retryCount, config.retryAttempts, config.retryDelay, retrySubmission, handleSubmit, submissionState.data]);
    
    // Click handler with debouncing
    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
      if (type === 'button') {
        debouncedClick(() => handleSubmit(event));
      }
    }, [type, debouncedClick, handleSubmit]);
    
    // Imperative Handle
    useImperativeHandle(ref, () => ({
      submit: async (data?: Record<string, any>) => {
        await handleSubmit(undefined, data);
        return submissionState.response || {
          success: false,
          timestamp: new Date(),
          duration: 0
        };
      },
      cancel: cancelSubmission,
      retry: handleRetry,
      reset: resetSubmission,
      getState: () => submissionState,
      getMetrics: () => metrics,
      getProgress: () => progress,
      isSubmitting: () => submissionState.isSubmitting,
      canSubmit: () => buttonState.canSubmit && !disabled && !loading,
      focus: () => buttonRef.current?.focus(),
      blur: () => buttonRef.current?.blur()
    }), [
      handleSubmit,
      cancelSubmission,
      handleRetry,
      resetSubmission,
      submissionState,
      metrics,
      progress,
      buttonState.canSubmit,
      disabled,
      loading
    ]);
    
    // Button text logic
    const getButtonText = useCallback(() => {
      if (submissionState.isSubmitting) {
        return buttonCustomization.loadingText || 'Submitting...';
      }
      
      if (submissionState.isSuccess) {
        return buttonCustomization.successText || 'Success!';
      }
      
      if (submissionState.isError) {
        return buttonCustomization.errorText || 'Error';
      }
      
      if (buttonState.validationStatus === 'validating') {
        return buttonCustomization.validatingText || 'Validating...';
      }
      
      if (retryCount > 0) {
        return buttonCustomization.retryText || `Retry (${retryCount})`;
      }
      
      return buttonCustomization.idleText || children;
    }, [
      submissionState.isSubmitting,
      submissionState.isSuccess,
      submissionState.isError,
      buttonState.validationStatus,
      retryCount,
      buttonCustomization,
      children
    ]);
    
    // Button icon logic
    const getButtonIcon = useCallback(() => {
      if (submissionState.isSubmitting) {
        return buttonCustomization.loadingIcon || <Loader2 className="form-submit-icon spin" />;
      }
      
      if (submissionState.isSuccess) {
        return buttonCustomization.successIcon || <CheckCircle className="form-submit-icon" />;
      }
      
      if (submissionState.isError) {
        return buttonCustomization.errorIcon || <XCircle className="form-submit-icon" />;
      }
      
      if (buttonState.validationStatus === 'validating') {
        return <Clock className="form-submit-icon spin" />;
      }
      
      if (retryCount > 0) {
        return <RefreshCw className="form-submit-icon" />;
      }
      
      return buttonCustomization.idleIcon || <Send className="form-submit-icon" />;
    }, [
      submissionState.isSubmitting,
      submissionState.isSuccess,
      submissionState.isError,
      buttonState.validationStatus,
      retryCount,
      buttonCustomization
    ]);
    
    // CSS Classes
    const containerClasses = [
      'form-submit-container',
      `form-submit-container--${variant}`,
      `form-submit-container--${size}`,
      variant === 'glass' && `form-submit-container--glass-${glassEffect}`,
      submissionState.isSubmitting && 'form-submit-container--submitting',
      submissionState.isSuccess && 'form-submit-container--success',
      submissionState.isError && 'form-submit-container--error',
      disabled && 'form-submit-container--disabled',
      className
    ].filter(Boolean).join(' ');
    
    const buttonClasses = [
      'form-submit-button',
      `form-submit-button--${variant}`,
      `form-submit-button--${size}`,
      submissionState.isSubmitting && 'form-submit-button--loading',
      submissionState.isSuccess && 'form-submit-button--success',
      submissionState.isError && 'form-submit-button--error',
      disabled && 'form-submit-button--disabled'
    ].filter(Boolean).join(' ');
    
    return (
      <div className={containerClasses} style={style}>
        {/* Header */}
        {(title || description) && (
          <div className="form-submit-header">
            {title && (
              <h3 className="form-submit-title">{title}</h3>
            )}
            {description && (
              <p className="form-submit-description">{description}</p>
            )}
          </div>
        )}
        
        {/* Progress Indicator */}
        {config.showProgress && progress && (
          <AnimatePresence>
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="form-submit-progress"
              ref={progressRef}
            >
              {customProgressRenderer ? (
                customProgressRenderer(progress)
              ) : (
                <div className="form-submit-progress-content">
                  <div className="form-submit-progress-info">
                    <span className="form-submit-progress-phase">{progress.phase}</span>
                    <span className="form-submit-progress-message">{progress.message}</span>
                  </div>
                  
                  <div className="form-submit-progress-bar">
                    <motion.div
                      className="form-submit-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  <div className="form-submit-progress-actions">
                    <span className="form-submit-progress-percentage">
                      {Math.round(progress.progress)}%
                    </span>
                    
                    {progress.canCancel && (
                      <button
                        type="button"
                        className="form-submit-progress-cancel"
                        onClick={cancelSubmission}
                        aria-label="Cancel submission"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Submit Button */}
        <motion.button
          ref={buttonRef}
          type={type}
          className={buttonClasses}
          disabled={disabled || loading || submissionState.isSubmitting}
          onClick={handleClick}
          id={id}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          tabIndex={tabIndex}
          autoFocus={autoFocus}
          whileHover={animation.enabled ? { scale: 1.02 } : undefined}
          whileTap={animation.enabled ? { scale: 0.98 } : undefined}
          transition={{ duration: animation.duration / 1000 }}
        >
          <span className="form-submit-button-content">
            {getButtonIcon()}
            <span className="form-submit-button-text">{getButtonText()}</span>
          </span>
          
          {/* Loading Overlay */}
          {submissionState.isSubmitting && (
            <motion.div
              className="form-submit-button-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.button>
        
        {/* Success Message */}
        {submissionState.isSuccess && submissionState.response && (
          <AnimatePresence>
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="form-submit-success"
            >
              {customSuccessRenderer ? (
                customSuccessRenderer(submissionState.response)
              ) : (
                <div className="form-submit-success-content">
                  <CheckCircle className="form-submit-success-icon" />
                  <div className="form-submit-success-text">
                    <h4>Success!</h4>
                    <p>
                      {submissionState.response.message || 'Your form has been submitted successfully.'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Error Message */}
        {submissionState.isError && submissionState.errors.length > 0 && (
          <AnimatePresence>
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="form-submit-error"
            >
              {customErrorRenderer ? (
                customErrorRenderer(new Error(submissionState.errors.join(', ')), handleRetry)
              ) : (
                <div className="form-submit-error-content">
                  <XCircle className="form-submit-error-icon" />
                  <div className="form-submit-error-text">
                    <h4>Submission Failed</h4>
                    <ul className="form-submit-error-list">
                      {submissionState.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {config.enableRetry && retryCount < (config.retryAttempts || 3) && (
                    <button
                      type="button"
                      className="form-submit-retry-button"
                      onClick={handleRetry}
                    >
                      <RefreshCw size={16} />
                      Retry ({retryCount + 1}/{config.retryAttempts || 3})
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Validation Status */}
        {config.showValidationStatus && validation.lastValidated && (
          <motion.div
            className="form-submit-validation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="form-submit-validation-content">
              {validation.isValid ? (
                <div className="form-submit-validation-valid">
                  <Check size={16} />
                  <span>Form is valid</span>
                </div>
              ) : (
                <div className="form-submit-validation-invalid">
                  <AlertCircle size={16} />
                  <span>{validation.errors.length} validation error(s)</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Debug Information (Development) */}
        {process.env.NODE_ENV === 'development' && enableMetrics && (
          <details className="form-submit-debug">
            <summary>Submit Debug Info</summary>
            <div className="form-submit-debug-content">
              <h4>Submission State</h4>
              <pre>{JSON.stringify(submissionState, null, 2)}</pre>
              
              <h4>Button State</h4>
              <pre>{JSON.stringify(buttonState, null, 2)}</pre>
              
              <h4>Validation</h4>
              <pre>{JSON.stringify(validation, null, 2)}</pre>
              
              <h4>Metrics</h4>
              <pre>{JSON.stringify(metrics, null, 2)}</pre>
              
              <h4>Progress</h4>
              <pre>{JSON.stringify(progress, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    );
  }
);

FormSubmit.displayName = 'FormSubmit';

// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

/**
 * Debounce utility function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default FormSubmit; 