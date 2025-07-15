import React, { useState, useRef, useCallback, memo, forwardRef, useId, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Loader2, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Shield,
  Zap,
  Target,
  Settings,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Play,
  Square,
  RotateCcw
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

export interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  isPending: boolean;
  isDraft: boolean;
  isValidating: boolean;
  progress: number;
  startTime: number | null;
  endTime: number | null;
  duration: number | null;
  retryCount: number;
  maxRetries: number;
  lastSubmitTime: number | null;
  submissionHistory: SubmissionAttempt[];
}

export interface SubmissionAttempt {
  id: string;
  timestamp: number;
  data: any;
  result: 'success' | 'error' | 'cancelled';
  error?: string;
  duration: number;
  retryCount: number;
}

export interface SubmissionResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
  duration: number;
  timestamp: number;
}

export interface SubmissionConfig {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  showProgress?: boolean;
  enableDraftSave?: boolean;
  draftSaveInterval?: number;
  validationRequired?: boolean;
  confirmBeforeSubmit?: boolean;
  resetOnSuccess?: boolean;
  preventDuplicateSubmission?: boolean;
  debounceMs?: number;
}

export interface FormSubmitProps {
  // Core Props
  id?: string;
  name?: string;
  formData?: any;
  
  // V7.5 Enhanced Variants
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // State Management Props
  submissionState?: SubmissionState;
  submissionConfig?: SubmissionConfig;
  
  // Submission Props
  onSubmit?: (data: any) => Promise<SubmissionResult>;
  onValidate?: (data: any) => Promise<boolean>;
  onDraftSave?: (data: any) => Promise<void>;
  onSuccess?: (result: SubmissionResult) => void;
  onError?: (error: string, attempt: SubmissionAttempt) => void;
  onProgress?: (progress: number) => void;
  onRetry?: (attempt: number) => void;
  onCancel?: () => void;
  onReset?: () => void;
  
  // Validation Integration
  validateBeforeSubmit?: boolean;
  validationRules?: any[];
  showValidationSummary?: boolean;
  
  // State Props
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  
  // Content Props
  label?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  retryText?: string;
  cancelText?: string;
  resetText?: string;
  
  // Button Props
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  showIcon?: boolean;
  iconPosition?: 'left' | 'right';
  
  // Progress Props
  showProgress?: boolean;
  showProgressText?: boolean;
  progressText?: string;
  showElapsedTime?: boolean;
  showRetryCount?: boolean;
  
  // Advanced Features
  showSubmissionHistory?: boolean;
  showAdvancedMetrics?: boolean;
  enableKeyboardShortcuts?: boolean;
  showConfirmDialog?: boolean;
  
  // Layout Props
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  buttonClassName?: string;
  progressClassName?: string;
  
  // Advanced Props
  autoFocus?: boolean;
  'data-testid'?: string;
}

interface SubmissionEngineState {
  currentSubmission: SubmissionState;
  submissionQueue: SubmissionAttempt[];
  draftData: any;
  lastValidation: any;
  metrics: {
    totalSubmissions: number;
    successRate: number;
    averageDuration: number;
    lastSuccessTime: number | null;
    consecutiveFailures: number;
  };
}

// ===== ALPHA PERFORMANCE OPTIMIZATION: HOOKS =====

const useSubmissionEngine = (config: SubmissionConfig = {}) => {
  const [engineState, setEngineState] = useState<SubmissionEngineState>({
    currentSubmission: {
      isSubmitting: false,
      isSuccess: false,
      isError: false,
      isPending: false,
      isDraft: false,
      isValidating: false,
      progress: 0,
      startTime: null,
      endTime: null,
      duration: null,
      retryCount: 0,
      maxRetries: config.maxRetries || 3,
      lastSubmitTime: null,
      submissionHistory: [],
    },
    submissionQueue: [],
    draftData: null,
    lastValidation: null,
    metrics: {
      totalSubmissions: 0,
      successRate: 0,
      averageDuration: 0,
      lastSuccessTime: null,
      consecutiveFailures: 0,
    },
  });

  const generateSubmissionId = useCallback(() => {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setEngineState(prev => ({
      ...prev,
      currentSubmission: {
        ...prev.currentSubmission,
        progress: Math.min(100, Math.max(0, progress)),
      }
    }));
  }, []);

  const startSubmission = useCallback(async (
    data: any,
    onSubmit: (data: any) => Promise<SubmissionResult>,
    onProgress?: (progress: number) => void
  ): Promise<SubmissionResult> => {
    const submissionId = generateSubmissionId();
    const startTime = Date.now();
    
    // Initialize submission state
    setEngineState(prev => ({
      ...prev,
      currentSubmission: {
        ...prev.currentSubmission,
        isSubmitting: true,
        isSuccess: false,
        isError: false,
        isPending: true,
        progress: 0,
        startTime,
        endTime: null,
        duration: null,
      }
    }));

    const attempt: SubmissionAttempt = {
      id: submissionId,
      timestamp: startTime,
      data,
      result: 'error',
      duration: 0,
      retryCount: 0,
    };

    try {
      // Progress simulation for user feedback
      const progressInterval = setInterval(() => {
        updateProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          onProgress?.(newProgress);
          return newProgress;
        });
      }, 100);

      // Execute submission
      const result = await onSubmit(data);
      clearInterval(progressInterval);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      attempt.result = result.success ? 'success' : 'error';
      attempt.duration = duration;
      attempt.error = result.error;

      // Update state based on result
      setEngineState(prev => ({
        ...prev,
        currentSubmission: {
          ...prev.currentSubmission,
          isSubmitting: false,
          isSuccess: result.success,
          isError: !result.success,
          isPending: false,
          progress: result.success ? 100 : 0,
          endTime,
          duration,
          submissionHistory: [...prev.currentSubmission.submissionHistory, attempt].slice(-10),
        },
        metrics: {
          ...prev.metrics,
          totalSubmissions: prev.metrics.totalSubmissions + 1,
          lastSuccessTime: result.success ? endTime : prev.metrics.lastSuccessTime,
          consecutiveFailures: result.success ? 0 : prev.metrics.consecutiveFailures + 1,
        }
      }));

      updateProgress(result.success ? 100 : 0);
      onProgress?.(result.success ? 100 : 0);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      attempt.result = 'error';
      attempt.duration = duration;
      attempt.error = error instanceof Error ? error.message : 'Unknown error';

      setEngineState(prev => ({
        ...prev,
        currentSubmission: {
          ...prev.currentSubmission,
          isSubmitting: false,
          isSuccess: false,
          isError: true,
          isPending: false,
          progress: 0,
          endTime,
          duration,
          submissionHistory: [...prev.currentSubmission.submissionHistory, attempt].slice(-10),
        },
        metrics: {
          ...prev.metrics,
          totalSubmissions: prev.metrics.totalSubmissions + 1,
          consecutiveFailures: prev.metrics.consecutiveFailures + 1,
        }
      }));

      updateProgress(0);
      onProgress?.(0);

      throw error;
    }
  }, [generateSubmissionId, updateProgress]);

  const retrySubmission = useCallback(async (
    data: any,
    onSubmit: (data: any) => Promise<SubmissionResult>,
    onProgress?: (progress: number) => void
  ): Promise<SubmissionResult> => {
    setEngineState(prev => ({
      ...prev,
      currentSubmission: {
        ...prev.currentSubmission,
        retryCount: prev.currentSubmission.retryCount + 1,
      }
    }));

    // Add delay before retry
    if (config.retryDelay) {
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }

    return startSubmission(data, onSubmit, onProgress);
  }, [startSubmission, config.retryDelay]);

  const cancelSubmission = useCallback(() => {
    setEngineState(prev => ({
      ...prev,
      currentSubmission: {
        ...prev.currentSubmission,
        isSubmitting: false,
        isPending: false,
        progress: 0,
      }
    }));
  }, []);

  const resetSubmission = useCallback(() => {
    setEngineState(prev => ({
      ...prev,
      currentSubmission: {
        isSubmitting: false,
        isSuccess: false,
        isError: false,
        isPending: false,
        isDraft: false,
        isValidating: false,
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        retryCount: 0,
        maxRetries: config.maxRetries || 3,
        lastSubmitTime: null,
        submissionHistory: [],
      }
    }));
  }, [config.maxRetries]);

  const saveDraft = useCallback(async (data: any, onDraftSave?: (data: any) => Promise<void>) => {
    setEngineState(prev => ({
      ...prev,
      currentSubmission: {
        ...prev.currentSubmission,
        isDraft: true,
      },
      draftData: data,
    }));

    if (onDraftSave) {
      try {
        await onDraftSave(data);
      } catch (error) {
        console.error('Draft save failed:', error);
      }
    }
  }, []);

  const validateSubmission = useCallback(async (
    data: any,
    onValidate?: (data: any) => Promise<boolean>
  ): Promise<boolean> => {
    setEngineState(prev => ({
      ...prev,
      currentSubmission: {
        ...prev.currentSubmission,
        isValidating: true,
      }
    }));

    try {
      const isValid = onValidate ? await onValidate(data) : true;
      
      setEngineState(prev => ({
        ...prev,
        currentSubmission: {
          ...prev.currentSubmission,
          isValidating: false,
        },
        lastValidation: { isValid, timestamp: Date.now(), data }
      }));

      return isValid;
    } catch (error) {
      setEngineState(prev => ({
        ...prev,
        currentSubmission: {
          ...prev.currentSubmission,
          isValidating: false,
        }
      }));
      
      return false;
    }
  }, []);

  return {
    engineState,
    startSubmission,
    retrySubmission,
    cancelSubmission,
    resetSubmission,
    saveDraft,
    validateSubmission,
    updateProgress,
  };
};

const useSubmissionState = (
  props: FormSubmitProps,
  submissionState: SubmissionState
) => {
  return useMemo(() => {
    const { disabled, loading, variant } = props;
    
    if (disabled || loading) {
      return {
        type: 'disabled' as const,
        color: designTokens.colors.neutral[400],
        backgroundColor: designTokens.colors.neutral[100],
        borderColor: designTokens.colors.neutral[300],
        cursor: 'not-allowed',
      };
    }
    
    if (submissionState.isSubmitting) {
      return {
        type: 'submitting' as const,
        color: designTokens.colors.blue[600],
        backgroundColor: designTokens.colors.blue[50],
        borderColor: designTokens.colors.blue[400],
        cursor: 'wait',
      };
    }
    
    if (submissionState.isSuccess) {
      return {
        type: 'success' as const,
        color: designTokens.colors.green[600],
        backgroundColor: designTokens.colors.green[50],
        borderColor: designTokens.colors.green[400],
        cursor: 'pointer',
      };
    }
    
    if (submissionState.isError) {
      return {
        type: 'error' as const,
        color: designTokens.colors.red[600],
        backgroundColor: designTokens.colors.red[50],
        borderColor: designTokens.colors.red[400],
        cursor: 'pointer',
      };
    }
    
    if (submissionState.isValidating) {
      return {
        type: 'validating' as const,
        color: designTokens.colors.purple[600],
        backgroundColor: designTokens.colors.purple[50],
        borderColor: designTokens.colors.purple[400],
        cursor: 'wait',
      };
    }
    
    return {
      type: 'ready' as const,
      color: designTokens.colors.neutral[700],
      backgroundColor: 'white',
      borderColor: designTokens.colors.neutral[300],
      cursor: 'pointer',
    };
  }, [props, submissionState]);
};

// ===== BETA V7.5 ENHANCED: GLASS-MORPHISM VARIANTS =====

const getSubmitVariantStyles = (
  variant: string,
  submissionState: any,
  size: string,
  disabled: boolean
) => {
  const baseStyles = {
    border: '1px solid',
    borderRadius: designTokens.borderRadius.md,
    fontSize: designTokens.typography.fontSize.sm,
    fontFamily: designTokens.typography.fontFamily.sans,
    fontWeight: designTokens.typography.fontWeight.medium,
    outline: 'none',
    transition: 'all 0.15s ease-in-out',
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing[2],
    cursor: submissionState.cursor,
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
      color: submissionState.color,
    },
    outlined: {
      backgroundColor: 'transparent',
      border: '2px solid',
      borderColor: submissionState.borderColor,
      color: submissionState.color,
    },
    filled: {
      backgroundColor: submissionState.backgroundColor,
      border: '1px solid',
      borderColor: submissionState.borderColor,
      color: submissionState.color,
    },
    minimal: {
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '2px solid',
      borderColor: submissionState.borderColor,
      borderRadius: 0,
      color: submissionState.color,
    },
  };

  // State modifications
  let stateStyles = {};
  
  if (disabled) {
    stateStyles = {
      opacity: 0.6,
      cursor: 'not-allowed',
    };
  }

  return {
    ...baseStyles,
    ...sizeStyles[size as keyof typeof sizeStyles],
    ...variantStyles[variant as keyof typeof variantStyles],
    ...stateStyles,
  };
};

// ===== V7.5 ENHANCED: FEATURE INDICATORS COMPONENT =====
const EnhancedSubmissionIndicators: React.FC<{
  submissionState: SubmissionState;
  config: SubmissionConfig;
  size: string;
  variant: string;
}> = ({ submissionState, config, size, variant }) => {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : size === 'xl' ? 20 : 14;
  
  return (
    <Layout.Row className="justify-between items-center mt-1">
      <Layout.Row>
        {/* Submission State Indicator */}
        {submissionState.isSubmitting && (
          <Shield size={iconSize} className="text-blue-500" aria-label="Submission in progress" />
        )}
        {submissionState.isSuccess && (
          <Shield size={iconSize} className="text-green-500" aria-label="Submission successful" />
        )}
        {submissionState.isError && (
          <Shield size={iconSize} className="text-red-500" aria-label="Submission failed" />
        )}
        
        {/* Retry Capability */}
        {config.enableRetry && (
          <Zap size={iconSize} className="text-purple-500" aria-label="Retry enabled" />
        )}
        
        {/* Progress Tracking */}
        {config.showProgress && (
          <Target size={iconSize} className="text-blue-500" aria-label="Progress tracking active" />
        )}
        
        {/* Draft Save */}
        {config.enableDraftSave && (
          <Settings size={iconSize} className="text-gray-500" aria-label="Draft save enabled" />
        )}
        
        {/* Validation Required */}
        {config.validationRequired && (
          <Clock size={iconSize} className="text-indigo-500" aria-label="Validation required" />
        )}
      </Layout.Row>
      
      <Layout.Row>
        {/* Enterprise Feature Indicator */}
        <Sparkles size={iconSize - 2} className="text-amber-500" aria-label="Enterprise submission engine" />
        
        {/* Performance Indicator */}
        <TrendingUp size={iconSize - 2} className="text-green-600" aria-label="High performance submission" />
      </Layout.Row>
    </Layout.Row>
  );
};

// ===== V7.5 ENHANCED: PROGRESS COMPONENT =====
const EnhancedSubmissionProgress: React.FC<{
  submissionState: SubmissionState;
  showProgressText?: boolean;
  progressText?: string;
  showElapsedTime?: boolean;
  size: string;
}> = ({ submissionState, showProgressText, progressText, showElapsedTime, size }) => {
  const elapsedTime = submissionState.startTime 
    ? Math.round((Date.now() - submissionState.startTime) / 1000)
    : 0;
  
  return (
    <AnimatePresence>
      {submissionState.isSubmitting && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Layout.Container className="mt-2">
            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px',
                backgroundColor: designTokens.colors.neutral[200],
                borderRadius: designTokens.borderRadius.full,
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: designTokens.colors.blue[500],
                  borderRadius: designTokens.borderRadius.full,
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${submissionState.progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            
            {/* Progress Text */}
            {(showProgressText || showElapsedTime) && (
              <Layout.Row className="justify-between items-center mt-1">
                {showProgressText && (
                  <span style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[600],
                  }}>
                    {progressText || `${Math.round(submissionState.progress)}%`}
                  </span>
                )}
                
                {showElapsedTime && (
                  <span style={{
                    fontSize: designTokens.typography.fontSize.sm,
                    color: designTokens.colors.neutral[500],
                  }}>
                    {elapsedTime}s
                  </span>
                )}
              </Layout.Row>
            )}
          </Layout.Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ===== V7.5 ENHANCED: SUBMISSION HISTORY COMPONENT =====
const EnhancedSubmissionHistory: React.FC<{
  submissionState: SubmissionState;
  size: string;
}> = ({ submissionState, size }) => {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  
  return (
    <AnimatePresence>
      {submissionState.submissionHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Layout.Container className="mt-2">
            <div style={{
              padding: designTokens.spacing[2],
              backgroundColor: designTokens.colors.neutral[50],
              borderRadius: designTokens.borderRadius.md,
              border: `1px solid ${designTokens.colors.neutral[200]}`,
            }}>
              <Layout.Row className="justify-between items-center mb-2">
                <span style={{
                  fontSize: designTokens.typography.fontSize.sm,
                  fontWeight: designTokens.typography.fontWeight.medium,
                  color: designTokens.colors.neutral[700],
                }}>
                  Submission History
                </span>
                <span style={{
                  fontSize: designTokens.typography.fontSize.xs,
                  color: designTokens.colors.neutral[500],
                }}>
                  Last {submissionState.submissionHistory.length} attempts
                </span>
              </Layout.Row>
              
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {submissionState.submissionHistory.map((attempt, index) => (
                  <Layout.Row key={attempt.id} className="justify-between items-center py-1">
                    <Layout.Row>
                      {attempt.result === 'success' && (
                        <Check size={iconSize} className="text-green-500" />
                      )}
                      {attempt.result === 'error' && (
                        <X size={iconSize} className="text-red-500" />
                      )}
                      {attempt.result === 'cancelled' && (
                        <Square size={iconSize} className="text-gray-500" />
                      )}
                      
                      <span style={{
                        fontSize: designTokens.typography.fontSize.xs,
                        color: designTokens.colors.neutral[600],
                      }}>
                        Attempt #{index + 1}
                      </span>
                    </Layout.Row>
                    
                    <Layout.Row>
                      <span style={{
                        fontSize: designTokens.typography.fontSize.xs,
                        color: designTokens.colors.neutral[500],
                      }}>
                        {attempt.duration}ms
                      </span>
                      {attempt.retryCount > 0 && (
                        <span style={{
                          fontSize: designTokens.typography.fontSize.xs,
                          color: designTokens.colors.orange[500],
                        }}>
                          {attempt.retryCount} retries
                        </span>
                      )}
                    </Layout.Row>
                  </Layout.Row>
                ))}
              </div>
            </div>
          </Layout.Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ===== CHARLIE ACCESSIBILITY FRAMEWORK =====

const getSubmissionAriaProps = (
  props: FormSubmitProps,
  submissionState: SubmissionState,
  buttonId: string
) => ({
  'aria-label': submissionState.isSubmitting 
    ? 'Submitting form data'
    : submissionState.isSuccess
    ? 'Form submitted successfully'
    : submissionState.isError
    ? 'Form submission failed'
    : 'Submit form',
  'aria-describedby': [
    submissionState.isSubmitting && `${buttonId}-progress`,
    submissionState.isError && `${buttonId}-error`,
    submissionState.isSuccess && `${buttonId}-success`,
  ].filter(Boolean).join(' ') || undefined,
  'aria-busy': submissionState.isSubmitting,
  'aria-live': 'polite',
  'aria-atomic': true,
});

// ===== MAIN COMPONENT =====

const FormSubmit = memo(forwardRef<HTMLButtonElement, FormSubmitProps>((props, ref) => {
  const {
    // Core props
    id,
    name,
    formData,
    
    // V7.5 Enhanced props
    variant = 'outlined',
    size = 'md',
    
    // State Management
    submissionState: externalSubmissionState,
    submissionConfig = {},
    
    // Submission handlers
    onSubmit,
    onValidate,
    onDraftSave,
    onSuccess,
    onError,
    onProgress,
    onRetry,
    onCancel,
    onReset,
    
    // Validation
    validateBeforeSubmit = true,
    validationRules = [],
    showValidationSummary = false,
    
    // State props
    disabled = false,
    readOnly = false,
    loading = false,
    
    // Content props
    label,
    loadingText = 'Submitting...',
    successText = 'Success!',
    errorText = 'Error occurred',
    retryText = 'Retry',
    cancelText = 'Cancel',
    resetText = 'Reset',
    
    // Button props
    buttonText = 'Submit',
    buttonIcon = <Send size={16} />,
    showIcon = true,
    iconPosition = 'left',
    
    // Progress props
    showProgress = true,
    showProgressText = true,
    progressText,
    showElapsedTime = true,
    showRetryCount = true,
    
    // Advanced features
    showSubmissionHistory = false,
    showAdvancedMetrics = false,
    enableKeyboardShortcuts = true,
    showConfirmDialog = false,
    
    // Layout props
    fullWidth = false,
    className = '',
    style = {},
    buttonClassName = '',
    progressClassName = '',
    
    // Advanced props
    autoFocus = false,
    'data-testid': testId,
    
    ...restProps
  } = props;

  // ===== HOOKS & STATE =====
  const buttonId = useId();
  const finalId = id || buttonId;
  
  const {
    engineState,
    startSubmission,
    retrySubmission,
    cancelSubmission,
    resetSubmission,
    saveDraft,
    validateSubmission,
    updateProgress,
  } = useSubmissionEngine(submissionConfig);
  
  // Use external state if provided, otherwise use internal state
  const submissionState = externalSubmissionState || engineState.currentSubmission;
  const submissionStateInfo = useSubmissionState(props, submissionState);
  
  // ===== EVENT HANDLERS =====
  const handleSubmit = useCallback(async () => {
    if (!onSubmit || submissionState.isSubmitting || disabled || readOnly) return;
    
    try {
      // Validate before submit if required
      if (validateBeforeSubmit && onValidate) {
        const isValid = await validateSubmission(formData, onValidate);
        if (!isValid) {
          return;
        }
      }
      
      // Start submission
      const result = await startSubmission(formData, onSubmit, onProgress);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        const attempt = submissionState.submissionHistory[submissionState.submissionHistory.length - 1];
        onError?.(result.error || 'Submission failed', attempt);
      }
    } catch (error) {
      const attempt = submissionState.submissionHistory[submissionState.submissionHistory.length - 1];
      onError?.(error instanceof Error ? error.message : 'Unknown error', attempt);
    }
  }, [
    onSubmit,
    submissionState.isSubmitting,
    disabled,
    readOnly,
    validateBeforeSubmit,
    onValidate,
    formData,
    validateSubmission,
    startSubmission,
    onProgress,
    onSuccess,
    onError,
    submissionState.submissionHistory
  ]);
  
  const handleRetry = useCallback(async () => {
    if (!onSubmit || submissionState.isSubmitting || !submissionState.isError) return;
    
    if (submissionState.retryCount >= submissionState.maxRetries) {
      return;
    }
    
    try {
      onRetry?.(submissionState.retryCount + 1);
      const result = await retrySubmission(formData, onSubmit, onProgress);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        const attempt = submissionState.submissionHistory[submissionState.submissionHistory.length - 1];
        onError?.(result.error || 'Retry failed', attempt);
      }
    } catch (error) {
      const attempt = submissionState.submissionHistory[submissionState.submissionHistory.length - 1];
      onError?.(error instanceof Error ? error.message : 'Retry error', attempt);
    }
  }, [
    onSubmit,
    submissionState.isSubmitting,
    submissionState.isError,
    submissionState.retryCount,
    submissionState.maxRetries,
    onRetry,
    retrySubmission,
    formData,
    onProgress,
    onSuccess,
    onError,
    submissionState.submissionHistory
  ]);
  
  const handleCancel = useCallback(() => {
    if (submissionState.isSubmitting) {
      cancelSubmission();
      onCancel?.();
    }
  }, [submissionState.isSubmitting, cancelSubmission, onCancel]);
  
  const handleReset = useCallback(() => {
    resetSubmission();
    onReset?.();
  }, [resetSubmission, onReset]);
  
  const handleDraftSave = useCallback(async () => {
    if (onDraftSave && formData) {
      await saveDraft(formData, onDraftSave);
    }
  }, [onDraftSave, formData, saveDraft]);
  
  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            handleSubmit();
            break;
          case 's':
            event.preventDefault();
            handleDraftSave();
            break;
          case 'r':
            if (submissionState.isError) {
              event.preventDefault();
              handleRetry();
            }
            break;
          case 'Escape':
            if (submissionState.isSubmitting) {
              event.preventDefault();
              handleCancel();
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    enableKeyboardShortcuts,
    handleSubmit,
    handleDraftSave,
    handleRetry,
    handleCancel,
    submissionState.isError,
    submissionState.isSubmitting
  ]);
  
  // ===== STYLES =====
  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };
  
  const buttonStyles = getSubmitVariantStyles(variant, submissionStateInfo, size, disabled);
  
  // ===== RENDER CONTENT =====
  const renderButtonContent = () => {
    if (submissionState.isSubmitting) {
      return (
        <Layout.Row>
          <Loader2 size={16} className="animate-spin" />
          <span>{loadingText}</span>
        </Layout.Row>
      );
    }
    
    if (submissionState.isSuccess) {
      return (
        <Layout.Row>
          <Check size={16} />
          <span>{successText}</span>
        </Layout.Row>
      );
    }
    
    if (submissionState.isError) {
      return (
        <Layout.Row>
          <X size={16} />
          <span>{errorText}</span>
        </Layout.Row>
      );
    }
    
    return (
      <Layout.Row>
        {showIcon && iconPosition === 'left' && buttonIcon}
        <span>{buttonText}</span>
        {showIcon && iconPosition === 'right' && buttonIcon}
      </Layout.Row>
    );
  };
  
  // ===== V7.5 ENHANCED RENDER =====
  return (
    <Layout.Section style={containerStyles} className={className}>
      <Layout.Container>
        {/* Enhanced Label */}
        {label && (
          <Layout.Row className="justify-between items-center">
            <span style={{
              fontSize: designTokens.typography.fontSize.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
              color: designTokens.colors.neutral[700],
            }}>
              {label}
            </span>
            
            {/* Submission Status */}
            <Layout.Row>
              {submissionState.isSubmitting && (
                <Loader2 size={14} className="animate-spin text-blue-500" />
              )}
              {submissionState.isSuccess && (
                <CheckCircle2 size={14} className="text-green-500" />
              )}
              {submissionState.isError && (
                <AlertCircle size={14} className="text-red-500" />
              )}
            </Layout.Row>
          </Layout.Row>
        )}
        
        {/* Enhanced Feature Indicators */}
        <EnhancedSubmissionIndicators
          submissionState={submissionState}
          config={submissionConfig}
          size={size}
          variant={variant}
        />
        
        {/* Main Submit Button */}
        <Layout.Section>
          <motion.button
            ref={ref}
            id={finalId}
            name={name}
            type="button"
            disabled={disabled || submissionState.isSubmitting}
            onClick={handleSubmit}
            style={buttonStyles}
            className={buttonClassName}
            data-testid={testId}
            autoFocus={autoFocus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            {...getSubmissionAriaProps(props, submissionState, finalId)}
            {...restProps}
          >
            {renderButtonContent()}
          </motion.button>
          
          {/* Action Buttons */}
          {(submissionState.isError || submissionState.isSuccess || submissionState.isSubmitting) && (
            <Layout.Row className="mt-2 justify-center">
              {/* Retry Button */}
              {submissionState.isError && submissionConfig.enableRetry && 
               submissionState.retryCount < submissionState.maxRetries && (
                <motion.button
                  type="button"
                  onClick={handleRetry}
                  style={{
                    ...buttonStyles,
                    backgroundColor: designTokens.colors.orange[50],
                    borderColor: designTokens.colors.orange[300],
                    color: designTokens.colors.orange[700],
                    fontSize: designTokens.typography.fontSize.sm,
                    padding: `${designTokens.spacing[1]} ${designTokens.spacing[3]}`,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <RefreshCw size={14} />
                  {retryText}
                  {showRetryCount && ` (${submissionState.retryCount + 1}/${submissionState.maxRetries})`}
                </motion.button>
              )}
              
              {/* Cancel Button */}
              {submissionState.isSubmitting && (
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    ...buttonStyles,
                    backgroundColor: designTokens.colors.red[50],
                    borderColor: designTokens.colors.red[300],
                    color: designTokens.colors.red[700],
                    fontSize: designTokens.typography.fontSize.sm,
                    padding: `${designTokens.spacing[1]} ${designTokens.spacing[3]}`,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <Square size={14} />
                  {cancelText}
                </motion.button>
              )}
              
              {/* Reset Button */}
              {(submissionState.isSuccess || submissionState.isError) && (
                <motion.button
                  type="button"
                  onClick={handleReset}
                  style={{
                    ...buttonStyles,
                    backgroundColor: designTokens.colors.neutral[50],
                    borderColor: designTokens.colors.neutral[300],
                    color: designTokens.colors.neutral[700],
                    fontSize: designTokens.typography.fontSize.sm,
                    padding: `${designTokens.spacing[1]} ${designTokens.spacing[3]}`,
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <RotateCcw size={14} />
                  {resetText}
                </motion.button>
              )}
            </Layout.Row>
          )}
        </Layout.Section>
        
        {/* Enhanced Progress */}
        {showProgress && (
          <EnhancedSubmissionProgress
            submissionState={submissionState}
            showProgressText={showProgressText}
            progressText={progressText}
            showElapsedTime={showElapsedTime}
            size={size}
          />
        )}
        
        {/* Enhanced Submission History */}
        {showSubmissionHistory && (
          <EnhancedSubmissionHistory
            submissionState={submissionState}
            size={size}
          />
        )}
        
        {/* Screen Reader Description */}
        <div className="sr-only">
          Enterprise submission system with advanced state management, retry logic, 
          progress tracking, and comprehensive error handling.
          {submissionConfig.enableRetry && " Retry functionality enabled."}
          {submissionConfig.enableDraftSave && " Draft save available."}
          {submissionConfig.validationRequired && " Validation required before submission."}
        </div>
      </Layout.Container>
    </Layout.Section>
  );
}));

FormSubmit.displayName = 'FormSubmit';

// Export submission engine for external use
export { useSubmissionEngine };

export default FormSubmit; 