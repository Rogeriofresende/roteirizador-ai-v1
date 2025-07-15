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
  Children
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Save,
  Settings
} from 'lucide-react';
import './FormWizard.css';

// ==========================================
// 🔴 IA ALPHA - ADVANCED TYPESCRIPT INTERFACES
// ==========================================

/**
 * V7.5 Enhanced Step Configuration
 */
export interface FormWizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  component: ReactNode;
  isOptional?: boolean;
  isCompleted?: boolean;
  hasErrors?: boolean;
  validationRules?: FormWizardValidationRule[];
  data?: Record<string, any>;
  progress?: number;
  estimatedTime?: number;
  dependencies?: string[];
}

/**
 * V7.5 Enhanced Navigation Configuration
 */
export interface FormWizardNavigation {
  canGoBack: boolean;
  canGoForward: boolean;
  canSkip: boolean;
  canSubmit: boolean;
  showProgress: boolean;
  showStepNumbers: boolean;
  showStepTitles: boolean;
  allowNonLinearNavigation: boolean;
  persistProgress: boolean;
}

/**
 * V7.5 Enhanced Validation Integration
 */
export interface FormWizardValidationRule {
  stepId: string;
  validator: (stepData: Record<string, any>, allData: Record<string, any>) => Promise<FormWizardValidationResult>;
  isRequired?: boolean;
  errorMessage?: string;
  warningMessage?: string;
  dependencies?: string[];
}

/**
 * V7.5 Enhanced Validation Result
 */
export interface FormWizardValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors?: Record<string, string[]>;
  canProceed: boolean;
}

/**
 * V7.5 Enhanced Wizard State
 */
export interface FormWizardState {
  currentStepIndex: number;
  currentStepId: string;
  completedSteps: string[];
  stepsWithErrors: string[];
  stepsWithWarnings: string[];
  isValidating: boolean;
  isSubmitting: boolean;
  isCompleted: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  progress: number;
  totalSteps: number;
}

/**
 * V7.5 Enhanced Data Persistence
 */
export interface FormWizardPersistence {
  enabled: boolean;
  storageKey: string;
  autoSave: boolean;
  autoSaveInterval: number;
  encryptData: boolean;
  clearOnSubmit: boolean;
  clearOnComplete: boolean;
  version: string;
}

/**
 * V7.5 Enhanced Progress Tracking
 */
export interface FormWizardProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  estimatedTimeRemaining: number;
  timeElapsed: number;
  averageTimePerStep: number;
  stepsWithErrors: number;
  stepsWithWarnings: number;
}

/**
 * V7.5 Enhanced Event Handlers
 */
export interface FormWizardEventHandlers {
  onStepChange?: (stepId: string, direction: 'next' | 'previous' | 'jump') => void;
  onStepComplete?: (stepId: string, data: Record<string, any>) => void;
  onStepValidation?: (stepId: string, result: FormWizardValidationResult) => void;
  onWizardComplete?: (data: Record<string, any>) => void;
  onWizardCancel?: () => void;
  onDataChange?: (stepId: string, data: Record<string, any>) => void;
  onProgressSave?: (data: Record<string, any>) => void;
  onError?: (error: Error, stepId?: string) => void;
  onWarning?: (warning: string, stepId?: string) => void;
}

/**
 * V7.5 Enhanced Animation Configuration
 */
export interface FormWizardAnimation {
  stepTransition: 'slide' | 'fade' | 'scale' | 'none';
  duration: number;
  easing: string;
  progressAnimations: boolean;
  navigationAnimations: boolean;
  validationAnimations: boolean;
}

/**
 * V7.5 Enhanced Customization
 */
export interface FormWizardCustomization {
  stepIndicatorType: 'dots' | 'numbers' | 'icons' | 'progress';
  navigationStyle: 'buttons' | 'tabs' | 'breadcrumbs' | 'minimal';
  layout: 'vertical' | 'horizontal' | 'compact';
  theme: 'light' | 'dark' | 'auto';
  showStepPreview: boolean;
  showTimeEstimation: boolean;
  showValidationSummary: boolean;
  customStepRenderer?: (step: FormWizardStep, isActive: boolean) => ReactNode;
  customNavigationRenderer?: (navigation: FormWizardNavigation) => ReactNode;
  customProgressRenderer?: (progress: FormWizardProgress) => ReactNode;
}

/**
 * V7.5 Enhanced Main FormWizard Props Interface
 */
export interface FormWizardProps {
  // V7.5 Core Design System Integration
  variant?: 'glass' | 'outlined' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  
  // Glass-morphism Effects
  glassEffect?: 'subtle' | 'medium' | 'strong';
  
  // Wizard Configuration
  steps: FormWizardStep[];
  initialStep?: string;
  
  // Navigation Configuration
  navigation?: Partial<FormWizardNavigation>;
  
  // Data Persistence
  persistence?: Partial<FormWizardPersistence>;
  
  // Validation
  validationRules?: FormWizardValidationRule[];
  validateOnStepChange?: boolean;
  
  // Customization
  customization?: Partial<FormWizardCustomization>;
  
  // Animation
  animation?: Partial<FormWizardAnimation>;
  
  // Professional Features
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  backText?: string;
  nextText?: string;
  
  // Event Handlers
  eventHandlers?: FormWizardEventHandlers;
  
  // Final Submission
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  
  // Performance & Accessibility
  id?: string;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  
  // Additional Props
  style?: React.CSSProperties;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * V7.5 Enhanced Ref Interface
 */
export interface FormWizardRef {
  goToStep: (stepId: string) => void;
  goNext: () => void;
  goBack: () => void;
  submit: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  saveProgress: () => void;
  loadProgress: () => void;
  clearProgress: () => void;
  validateCurrentStep: () => Promise<FormWizardValidationResult>;
  validateAllSteps: () => Promise<FormWizardValidationResult>;
  getState: () => FormWizardState;
  getProgress: () => FormWizardProgress;
  getCurrentData: () => Record<string, any>;
  getStepData: (stepId: string) => Record<string, any>;
  setStepData: (stepId: string, data: Record<string, any>) => void;
  isStepCompleted: (stepId: string) => boolean;
  isStepValid: (stepId: string) => boolean;
  focus: () => void;
  blur: () => void;
}

// ==========================================
// 🔴 IA ALPHA - PERFORMANCE HOOKS
// ==========================================

/**
 * Wizard state management hook
 */
function useFormWizardState(
  steps: FormWizardStep[],
  initialStep?: string,
  persistence?: Partial<FormWizardPersistence>
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    if (initialStep) {
      const index = steps.findIndex(step => step.id === initialStep);
      return index !== -1 ? index : 0;
    }
    return 0;
  });
  
  const [stepData, setStepData] = useState<Record<string, Record<string, any>>>(() => {
    const initialData: Record<string, Record<string, any>> = {};
    steps.forEach(step => {
      initialData[step.id] = step.data || {};
    });
    return initialData;
  });
  
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepsWithErrors, setStepsWithErrors] = useState<Set<string>>(new Set());
  const [stepsWithWarnings, setStepsWithWarnings] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [startTime] = useState<Date>(new Date());
  
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  
  // Calculate progress
  const progress = useMemo(() => {
    const completedCount = completedSteps.size;
    const percentage = Math.round((completedCount / totalSteps) * 100);
    const timeElapsed = new Date().getTime() - startTime.getTime();
    const averageTimePerStep = completedCount > 0 ? timeElapsed / completedCount : 0;
    const remainingSteps = totalSteps - completedCount;
    const estimatedTimeRemaining = remainingSteps * averageTimePerStep;
    
    return {
      currentStep: currentStepIndex + 1,
      totalSteps,
      completedSteps: completedCount,
      percentage,
      estimatedTimeRemaining,
      timeElapsed,
      averageTimePerStep,
      stepsWithErrors: stepsWithErrors.size,
      stepsWithWarnings: stepsWithWarnings.size
    };
  }, [currentStepIndex, totalSteps, completedSteps.size, stepsWithErrors.size, stepsWithWarnings.size, startTime]);
  
  // Auto-save functionality
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  
  const saveProgress = useCallback(() => {
    if (!persistence?.enabled || !persistence?.storageKey) return;
    
    try {
      const progressData = {
        currentStepIndex,
        stepData,
        completedSteps: Array.from(completedSteps),
        stepsWithErrors: Array.from(stepsWithErrors),
        stepsWithWarnings: Array.from(stepsWithWarnings),
        lastSavedAt: new Date().toISOString(),
        version: persistence.version || '1.0'
      };
      
      const dataToStore = persistence.encryptData 
        ? btoa(JSON.stringify(progressData))
        : JSON.stringify(progressData);
      
      localStorage.setItem(persistence.storageKey, dataToStore);
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save wizard progress:', error);
    }
  }, [
    currentStepIndex,
    stepData,
    completedSteps,
    stepsWithErrors,
    stepsWithWarnings,
    persistence
  ]);
  
  const loadProgress = useCallback(() => {
    if (!persistence?.enabled || !persistence?.storageKey) return;
    
    try {
      const saved = localStorage.getItem(persistence.storageKey);
      if (!saved) return;
      
      const progressData = JSON.parse(
        persistence.encryptData ? atob(saved) : saved
      );
      
      if (progressData.version !== (persistence.version || '1.0')) {
        console.warn('Wizard progress version mismatch, clearing data');
        localStorage.removeItem(persistence.storageKey);
        return;
      }
      
      setCurrentStepIndex(progressData.currentStepIndex || 0);
      setStepData(progressData.stepData || {});
      setCompletedSteps(new Set(progressData.completedSteps || []));
      setStepsWithErrors(new Set(progressData.stepsWithErrors || []));
      setStepsWithWarnings(new Set(progressData.stepsWithWarnings || []));
      setLastSavedAt(new Date(progressData.lastSavedAt));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to load wizard progress:', error);
    }
  }, [persistence]);
  
  const clearProgress = useCallback(() => {
    if (!persistence?.enabled || !persistence?.storageKey) return;
    
    try {
      localStorage.removeItem(persistence.storageKey);
      setLastSavedAt(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to clear wizard progress:', error);
    }
  }, [persistence]);
  
  // Auto-save setup
  useEffect(() => {
    if (persistence?.autoSave && hasUnsavedChanges) {
      autoSaveRef.current = setTimeout(() => {
        saveProgress();
      }, persistence.autoSaveInterval || 5000);
    }
    
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [hasUnsavedChanges, persistence?.autoSave, persistence?.autoSaveInterval, saveProgress]);
  
  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);
  
  // Step navigation functions
  const goToStep = useCallback((stepId: string) => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index !== -1) {
      setCurrentStepIndex(index);
      setHasUnsavedChanges(true);
    }
  }, [steps]);
  
  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setHasUnsavedChanges(true);
    }
  }, [currentStepIndex, steps.length]);
  
  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setHasUnsavedChanges(true);
    }
  }, [currentStepIndex]);
  
  const updateStepData = useCallback((stepId: string, data: Record<string, any>) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data }
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const markStepCompleted = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
    setStepsWithErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
    setHasUnsavedChanges(true);
  }, []);
  
  const markStepWithError = useCallback((stepId: string) => {
    setStepsWithErrors(prev => new Set(prev).add(stepId));
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
    setHasUnsavedChanges(true);
  }, []);
  
  const markStepWithWarning = useCallback((stepId: string) => {
    setStepsWithWarnings(prev => new Set(prev).add(stepId));
    setHasUnsavedChanges(true);
  }, []);
  
  const clearStepWarning = useCallback((stepId: string) => {
    setStepsWithWarnings(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
    setHasUnsavedChanges(true);
  }, []);
  
  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setStepData(() => {
      const initialData: Record<string, Record<string, any>> = {};
      steps.forEach(step => {
        initialData[step.id] = step.data || {};
      });
      return initialData;
    });
    setCompletedSteps(new Set());
    setStepsWithErrors(new Set());
    setStepsWithWarnings(new Set());
    setIsValidating(false);
    setIsSubmitting(false);
    setIsCompleted(false);
    setHasUnsavedChanges(false);
    setLastSavedAt(null);
    clearProgress();
  }, [steps, clearProgress]);
  
  const wizardState: FormWizardState = {
    currentStepIndex,
    currentStepId: currentStep?.id || '',
    completedSteps: Array.from(completedSteps),
    stepsWithErrors: Array.from(stepsWithErrors),
    stepsWithWarnings: Array.from(stepsWithWarnings),
    isValidating,
    isSubmitting,
    isCompleted,
    hasUnsavedChanges,
    lastSavedAt,
    progress: progress.percentage,
    totalSteps
  };
  
  return {
    wizardState,
    progress,
    currentStep,
    stepData,
    completedSteps,
    stepsWithErrors,
    stepsWithWarnings,
    goToStep,
    goNext,
    goBack,
    updateStepData,
    markStepCompleted,
    markStepWithError,
    markStepWithWarning,
    clearStepWarning,
    setIsValidating,
    setIsSubmitting,
    setIsCompleted,
    reset,
    saveProgress,
    loadProgress,
    clearProgress
  };
}

/**
 * Wizard validation hook
 */
function useFormWizardValidation(
  steps: FormWizardStep[],
  validationRules: FormWizardValidationRule[] = [],
  stepData: Record<string, Record<string, any>>
) {
  const validateStep = useCallback(async (
    stepId: string,
    allData: Record<string, Record<string, any>>
  ): Promise<FormWizardValidationResult> => {
    const stepRules = validationRules.filter(rule => rule.stepId === stepId);
    const stepDataForValidation = allData[stepId] || {};
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors: Record<string, string[]> = {};
    
    try {
      for (const rule of stepRules) {
        const result = await rule.validator(stepDataForValidation, allData);
        
        if (!result.isValid) {
          errors.push(...result.errors);
          warnings.push(...result.warnings);
          
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, fieldErrorList]) => {
              fieldErrors[field] = [...(fieldErrors[field] || []), ...fieldErrorList];
            });
          }
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        fieldErrors,
        canProceed: errors.length === 0
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
        fieldErrors: {},
        canProceed: false
      };
    }
  }, [validationRules]);
  
  const validateAllSteps = useCallback(async (
    allData: Record<string, Record<string, any>>
  ): Promise<FormWizardValidationResult> => {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const allFieldErrors: Record<string, string[]> = {};
    
    for (const step of steps) {
      const result = await validateStep(step.id, allData);
      
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      
      Object.entries(result.fieldErrors || {}).forEach(([field, fieldErrorList]) => {
        const fieldKey = `${step.id}.${field}`;
        allFieldErrors[fieldKey] = [...(allFieldErrors[fieldKey] || []), ...fieldErrorList];
      });
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      fieldErrors: allFieldErrors,
      canProceed: allErrors.length === 0
    };
  }, [steps, validateStep]);
  
  return {
    validateStep,
    validateAllSteps
  };
}

/**
 * Wizard navigation hook
 */
function useFormWizardNavigation(
  steps: FormWizardStep[],
  currentStepIndex: number,
  completedSteps: Set<string>,
  stepsWithErrors: Set<string>,
  navigation: Partial<FormWizardNavigation> = {}
) {
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const canGoBack = !isFirstStep && (navigation.canGoBack ?? true);
  const canGoForward = !isLastStep && !stepsWithErrors.has(currentStep?.id || '');
  const canSkip = currentStep?.isOptional && (navigation.canSkip ?? false);
  const canSubmit = isLastStep && !stepsWithErrors.has(currentStep?.id || '');
  
  const navigationState: FormWizardNavigation = {
    canGoBack,
    canGoForward,
    canSkip,
    canSubmit,
    showProgress: navigation.showProgress ?? true,
    showStepNumbers: navigation.showStepNumbers ?? true,
    showStepTitles: navigation.showStepTitles ?? true,
    allowNonLinearNavigation: navigation.allowNonLinearNavigation ?? false,
    persistProgress: navigation.persistProgress ?? true
  };
  
  return navigationState;
}

// ==========================================
// 🔴 IA ALPHA - MAIN COMPONENT
// ==========================================

/**
 * V7.5 Enhanced FormWizard Component
 * Professional multi-step form navigation with validation integration
 */
export const FormWizard = forwardRef<FormWizardRef, FormWizardProps>(
  ({
    variant = 'outlined',
    size = 'md',
    glassEffect = 'subtle',
    steps = [],
    initialStep,
    navigation = {},
    persistence = { enabled: true, storageKey: 'formWizard' },
    validationRules = [],
    validateOnStepChange = true,
    customization = {},
    animation = { stepTransition: 'slide', duration: 300 },
    title,
    description,
    submitText = 'Submit',
    cancelText = 'Cancel',
    backText = 'Back',
    nextText = 'Next',
    eventHandlers = {},
    onSubmit,
    id,
    className = '',
    ariaLabel,
    ariaDescribedBy,
    style,
    disabled = false,
    loading = false
  }, ref) => {
    
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const stepContentRef = useRef<HTMLDivElement>(null);
    
    // Hooks
    const {
      wizardState,
      progress,
      currentStep,
      stepData,
      completedSteps,
      stepsWithErrors,
      stepsWithWarnings,
      goToStep,
      goNext,
      goBack,
      updateStepData,
      markStepCompleted,
      markStepWithError,
      markStepWithWarning,
      clearStepWarning,
      setIsValidating,
      setIsSubmitting,
      setIsCompleted,
      reset,
      saveProgress,
      loadProgress,
      clearProgress
    } = useFormWizardState(steps, initialStep, persistence);
    
    const { validateStep, validateAllSteps } = useFormWizardValidation(steps, validationRules, stepData);
    
    const navigationState = useFormWizardNavigation(
      steps,
      wizardState.currentStepIndex,
      completedSteps,
      stepsWithErrors,
      navigation
    );
    
    // Step change handler
    const handleStepChange = useCallback(async (
      newStepId: string,
      direction: 'next' | 'previous' | 'jump'
    ) => {
      if (validateOnStepChange && direction !== 'previous') {
        setIsValidating(true);
        
        try {
          const validationResult = await validateStep(currentStep.id, stepData);
          
          if (!validationResult.isValid) {
            markStepWithError(currentStep.id);
            eventHandlers.onStepValidation?.(currentStep.id, validationResult);
            return;
          }
          
          markStepCompleted(currentStep.id);
          clearStepWarning(currentStep.id);
        } catch (error) {
          markStepWithError(currentStep.id);
          eventHandlers.onError?.(error as Error, currentStep.id);
          return;
        } finally {
          setIsValidating(false);
        }
      }
      
      goToStep(newStepId);
      eventHandlers.onStepChange?.(newStepId, direction);
    }, [
      validateOnStepChange,
      currentStep,
      stepData,
      validateStep,
      markStepCompleted,
      markStepWithError,
      clearStepWarning,
      goToStep,
      eventHandlers,
      setIsValidating
    ]);
    
    // Navigation handlers
    const handleNext = useCallback(() => {
      if (wizardState.currentStepIndex < steps.length - 1) {
        const nextStep = steps[wizardState.currentStepIndex + 1];
        handleStepChange(nextStep.id, 'next');
      }
    }, [wizardState.currentStepIndex, steps, handleStepChange]);
    
    const handleBack = useCallback(() => {
      if (wizardState.currentStepIndex > 0) {
        const previousStep = steps[wizardState.currentStepIndex - 1];
        handleStepChange(previousStep.id, 'previous');
      }
    }, [wizardState.currentStepIndex, steps, handleStepChange]);
    
    const handleSubmit = useCallback(async () => {
      if (!onSubmit) return;
      
      setIsSubmitting(true);
      
      try {
        // Validate all steps before submission
        const validationResult = await validateAllSteps(stepData);
        
        if (!validationResult.isValid) {
          eventHandlers.onError?.(
            new Error(`Validation failed: ${validationResult.errors.join(', ')}`),
            currentStep.id
          );
          return;
        }
        
        // Flatten step data for submission
        const allData: Record<string, any> = {};
        Object.entries(stepData).forEach(([stepId, data]) => {
          Object.entries(data).forEach(([key, value]) => {
            allData[`${stepId}.${key}`] = value;
          });
        });
        
        await onSubmit(allData);
        
        setIsCompleted(true);
        eventHandlers.onWizardComplete?.(allData);
        
        // Clear progress if configured
        if (persistence.clearOnComplete) {
          clearProgress();
        }
      } catch (error) {
        eventHandlers.onError?.(error as Error, currentStep.id);
      } finally {
        setIsSubmitting(false);
      }
    }, [
      onSubmit,
      validateAllSteps,
      stepData,
      currentStep.id,
      eventHandlers,
      setIsSubmitting,
      setIsCompleted,
      persistence.clearOnComplete,
      clearProgress
    ]);
    
    const handleCancel = useCallback(() => {
      eventHandlers.onWizardCancel?.();
    }, [eventHandlers]);
    
    // Imperative Handle
    useImperativeHandle(ref, () => ({
      goToStep,
      goNext: handleNext,
      goBack: handleBack,
      submit: handleSubmit,
      cancel: handleCancel,
      reset,
      saveProgress,
      loadProgress,
      clearProgress,
      validateCurrentStep: () => validateStep(currentStep.id, stepData),
      validateAllSteps: () => validateAllSteps(stepData),
      getState: () => wizardState,
      getProgress: () => progress,
      getCurrentData: () => stepData,
      getStepData: (stepId: string) => stepData[stepId] || {},
      setStepData: updateStepData,
      isStepCompleted: (stepId: string) => completedSteps.has(stepId),
      isStepValid: (stepId: string) => !stepsWithErrors.has(stepId),
      focus: () => containerRef.current?.focus(),
      blur: () => containerRef.current?.blur()
    }), [
      goToStep,
      handleNext,
      handleBack,
      handleSubmit,
      handleCancel,
      reset,
      saveProgress,
      loadProgress,
      clearProgress,
      validateStep,
      validateAllSteps,
      currentStep.id,
      stepData,
      wizardState,
      progress,
      updateStepData,
      completedSteps,
      stepsWithErrors
    ]);
    
    // CSS Classes
    const containerClasses = [
      'form-wizard-container',
      `form-wizard-container--${variant}`,
      `form-wizard-container--${size}`,
      variant === 'glass' && `form-wizard-container--glass-${glassEffect}`,
      `form-wizard-container--${customization.layout || 'vertical'}`,
      wizardState.isValidating && 'form-wizard-container--validating',
      wizardState.isSubmitting && 'form-wizard-container--submitting',
      wizardState.isCompleted && 'form-wizard-container--completed',
      disabled && 'form-wizard-container--disabled',
      loading && 'form-wizard-container--loading',
      className
    ].filter(Boolean).join(' ');
    
    if (steps.length === 0) {
      return (
        <div className={containerClasses}>
          <div className="form-wizard-empty">
            <AlertCircle className="form-wizard-empty-icon" />
            <h3>No steps configured</h3>
            <p>Please provide at least one step to display the wizard.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div
        ref={containerRef}
        className={containerClasses}
        style={style}
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || description) && (
          <div className="form-wizard-header">
            {title && (
              <h2 className="form-wizard-title">{title}</h2>
            )}
            {description && (
              <p className="form-wizard-description">{description}</p>
            )}
          </div>
        )}
        
        {/* Progress Indicator */}
        {navigationState.showProgress && (
          <div className="form-wizard-progress">
            {customization.customProgressRenderer ? (
              customization.customProgressRenderer(progress)
            ) : (
              <div className="form-wizard-progress-content">
                <div className="form-wizard-progress-bar">
                  <motion.div
                    className="form-wizard-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: animation.duration / 1000 }}
                  />
                </div>
                
                <div className="form-wizard-progress-info">
                  <span className="form-wizard-progress-text">
                    Step {progress.currentStep} of {progress.totalSteps}
                  </span>
                  <span className="form-wizard-progress-percentage">
                    {progress.percentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Step Indicators */}
        <div className="form-wizard-steps">
          {steps.map((step, index) => {
            const isActive = index === wizardState.currentStepIndex;
            const isCompleted = completedSteps.has(step.id);
            const hasError = stepsWithErrors.has(step.id);
            const hasWarning = stepsWithWarnings.has(step.id);
            const isClickable = navigationState.allowNonLinearNavigation && !hasError;
            
            return (
              <motion.div
                key={step.id}
                className={[
                  'form-wizard-step-indicator',
                  isActive && 'form-wizard-step-indicator--active',
                  isCompleted && 'form-wizard-step-indicator--completed',
                  hasError && 'form-wizard-step-indicator--error',
                  hasWarning && 'form-wizard-step-indicator--warning',
                  isClickable && 'form-wizard-step-indicator--clickable'
                ].filter(Boolean).join(' ')}
                onClick={isClickable ? () => handleStepChange(step.id, 'jump') : undefined}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="form-wizard-step-indicator-icon">
                  {hasError ? (
                    <XCircle size={20} />
                  ) : isCompleted ? (
                    <CheckCircle size={20} />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="form-wizard-step-number">{index + 1}</span>
                  )}
                </div>
                
                {navigationState.showStepTitles && (
                  <div className="form-wizard-step-indicator-content">
                    <h4 className="form-wizard-step-indicator-title">{step.title}</h4>
                    {step.description && (
                      <p className="form-wizard-step-indicator-description">{step.description}</p>
                    )}
                  </div>
                )}
                
                {/* Step connector */}
                {index < steps.length - 1 && (
                  <div className="form-wizard-step-connector" />
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Step Content */}
        <div className="form-wizard-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              ref={stepContentRef}
              className="form-wizard-step-content"
              initial={
                animation.stepTransition === 'slide' ? { opacity: 0, x: 50 } :
                animation.stepTransition === 'fade' ? { opacity: 0 } :
                animation.stepTransition === 'scale' ? { opacity: 0, scale: 0.95 } :
                {}
              }
              animate={
                animation.stepTransition === 'slide' ? { opacity: 1, x: 0 } :
                animation.stepTransition === 'fade' ? { opacity: 1 } :
                animation.stepTransition === 'scale' ? { opacity: 1, scale: 1 } :
                {}
              }
              exit={
                animation.stepTransition === 'slide' ? { opacity: 0, x: -50 } :
                animation.stepTransition === 'fade' ? { opacity: 0 } :
                animation.stepTransition === 'scale' ? { opacity: 0, scale: 0.95 } :
                {}
              }
              transition={{ duration: animation.duration / 1000 }}
            >
              {React.cloneElement(currentStep.component as React.ReactElement, {
                data: stepData[currentStep.id] || {},
                onChange: (data: Record<string, any>) => {
                  updateStepData(currentStep.id, data);
                  eventHandlers.onDataChange?.(currentStep.id, data);
                },
                onComplete: () => {
                  markStepCompleted(currentStep.id);
                  eventHandlers.onStepComplete?.(currentStep.id, stepData[currentStep.id] || {});
                },
                isActive: true,
                stepId: currentStep.id,
                wizardState,
                progress
              })}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation */}
        <div className="form-wizard-navigation">
          {customization.customNavigationRenderer ? (
            customization.customNavigationRenderer(navigationState)
          ) : (
            <div className="form-wizard-navigation-content">
              <div className="form-wizard-navigation-left">
                {navigationState.canGoBack && (
                  <motion.button
                    type="button"
                    className="form-wizard-button form-wizard-button--secondary"
                    onClick={handleBack}
                    disabled={disabled || wizardState.isValidating || wizardState.isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft size={16} />
                    {backText}
                  </motion.button>
                )}
              </div>
              
              <div className="form-wizard-navigation-center">
                {wizardState.hasUnsavedChanges && (
                  <motion.button
                    type="button"
                    className="form-wizard-button form-wizard-button--ghost"
                    onClick={saveProgress}
                    disabled={disabled}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={16} />
                    Save Progress
                  </motion.button>
                )}
              </div>
              
              <div className="form-wizard-navigation-right">
                {navigationState.canSubmit ? (
                  <motion.button
                    type="button"
                    className="form-wizard-button form-wizard-button--primary"
                    onClick={handleSubmit}
                    disabled={disabled || wizardState.isValidating || wizardState.isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {wizardState.isSubmitting ? (
                      <>
                        <motion.div
                          className="form-wizard-spinner"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        {submitText}
                      </>
                    )}
                  </motion.button>
                ) : navigationState.canGoForward ? (
                  <motion.button
                    type="button"
                    className="form-wizard-button form-wizard-button--primary"
                    onClick={handleNext}
                    disabled={disabled || wizardState.isValidating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {wizardState.isValidating ? (
                      <>
                        <motion.div
                          className="form-wizard-spinner"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Validating...
                      </>
                    ) : (
                      <>
                        {nextText}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                ) : null}
              </div>
            </div>
          )}
        </div>
        
        {/* Validation Summary */}
        {customization.showValidationSummary && stepsWithErrors.size > 0 && (
          <motion.div
            className="form-wizard-validation-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="form-wizard-validation-summary-content">
              <AlertCircle className="form-wizard-validation-summary-icon" />
              <div className="form-wizard-validation-summary-text">
                <h4>Please fix the following issues:</h4>
                <ul>
                  {Array.from(stepsWithErrors).map(stepId => {
                    const step = steps.find(s => s.id === stepId);
                    return (
                      <li key={stepId}>
                        <button
                          type="button"
                          onClick={() => goToStep(stepId)}
                          className="form-wizard-validation-summary-link"
                        >
                          {step?.title || stepId}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Completion Message */}
        {wizardState.isCompleted && (
          <motion.div
            className="form-wizard-completion"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="form-wizard-completion-content">
              <CheckCircle className="form-wizard-completion-icon" />
              <h3>Wizard Completed Successfully!</h3>
              <p>Your information has been submitted and processed.</p>
            </div>
          </motion.div>
        )}
        
        {/* Debug Information (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="form-wizard-debug">
            <summary>Wizard Debug Info</summary>
            <div className="form-wizard-debug-content">
              <h4>Wizard State</h4>
              <pre>{JSON.stringify(wizardState, null, 2)}</pre>
              
              <h4>Progress</h4>
              <pre>{JSON.stringify(progress, null, 2)}</pre>
              
              <h4>Navigation State</h4>
              <pre>{JSON.stringify(navigationState, null, 2)}</pre>
              
              <h4>Step Data</h4>
              <pre>{JSON.stringify(stepData, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    );
  }
);

FormWizard.displayName = 'FormWizard';

export default FormWizard; 