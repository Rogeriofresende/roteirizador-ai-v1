import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';

export interface OnboardingState {
  isFirstTime: boolean;
  hasCompletedOnboarding: boolean;
  lastCompletedStep: string | null;
  onboardingStartTime: number | null;
  userJourneyStage: 'new' | 'onboarding' | 'experienced';
  showQuickStart: boolean;
}

const STORAGE_KEY = 'roteirar_onboarding_state';
const ONBOARDING_VERSION = '1.0';

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if it's the current version of onboarding
        if (parsed.version === ONBOARDING_VERSION) {
          return {
            isFirstTime: false,
            hasCompletedOnboarding: parsed.hasCompletedOnboarding || false,
            lastCompletedStep: parsed.lastCompletedStep || null,
            onboardingStartTime: parsed.onboardingStartTime || null,
            userJourneyStage: parsed.hasCompletedOnboarding ? 'experienced' : 'new',
            showQuickStart: !parsed.hasCompletedOnboarding
          };
        }
      }
    } catch (error) {
      console.warn('Failed to parse onboarding state from localStorage:', error);
    }
    
    // Default state for new users
    return {
      isFirstTime: true,
      hasCompletedOnboarding: false,
      lastCompletedStep: null,
      onboardingStartTime: null,
      userJourneyStage: 'new',
      showQuickStart: true
    };
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Persist state to localStorage
  const persistState = useCallback((newState: Partial<OnboardingState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...updatedState,
        version: ONBOARDING_VERSION,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to persist onboarding state:', error);
    }
  }, [state]);

  // Check if user should see onboarding
  const shouldShowOnboarding = useCallback(() => {
    // Show onboarding for:
    // 1. First-time users
    // 2. Users who haven't completed onboarding
    // 3. Users who explicitly request it
    return state.isFirstTime || !state.hasCompletedOnboarding;
  }, [state]);

  // Start onboarding
  const startOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
    
    const startTime = Date.now();
    persistState({
      onboardingStartTime: startTime,
      userJourneyStage: 'onboarding',
      isFirstTime: false
    });

    // Track onboarding start
    analyticsService.trackEvent('onboarding_started', {
      isFirstTime: state.isFirstTime,
      userJourneyStage: state.userJourneyStage,
      timestamp: startTime
    });
  }, [persistState, state.isFirstTime, state.userJourneyStage]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    
    const completionTime = Date.now();
    const duration = state.onboardingStartTime 
      ? completionTime - state.onboardingStartTime 
      : 0;

    persistState({
      hasCompletedOnboarding: true,
      userJourneyStage: 'experienced',
      showQuickStart: false,
      lastCompletedStep: 'completed'
    });

    // Track onboarding completion
    analyticsService.trackEvent('onboarding_completed', {
      duration,
      completionTime,
      wasFirstTime: state.isFirstTime,
      conversionFromStart: duration > 0
    });

    console.log('🎉 Onboarding completed! Duration:', duration + 'ms');
  }, [persistState, state.onboardingStartTime, state.isFirstTime]);

  // Skip onboarding
  const skipOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
    
    const skipTime = Date.now();
    const duration = state.onboardingStartTime 
      ? skipTime - state.onboardingStartTime 
      : 0;

    persistState({
      hasCompletedOnboarding: true, // Mark as completed even if skipped
      userJourneyStage: 'experienced',
      showQuickStart: false,
      lastCompletedStep: 'skipped'
    });

    // Track onboarding skip
    analyticsService.trackEvent('onboarding_skipped', {
      duration,
      skipTime,
      wasFirstTime: state.isFirstTime,
      abandonmentPoint: 'user_initiated'
    });

    console.log('⏭️ Onboarding skipped. Duration before skip:', duration + 'ms');
  }, [persistState, state.onboardingStartTime, state.isFirstTime]);

  // Dismiss quick start prompt
  const dismissQuickStart = useCallback(() => {
    persistState({
      showQuickStart: false
    });

    analyticsService.trackEvent('quick_start_dismissed', {
      userJourneyStage: state.userJourneyStage,
      timestamp: Date.now()
    });
  }, [persistState, state.userJourneyStage]);

  // Reset onboarding (for testing or special cases)
  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear onboarding state:', error);
    }
    
    setState({
      isFirstTime: true,
      hasCompletedOnboarding: false,
      lastCompletedStep: null,
      onboardingStartTime: null,
      userJourneyStage: 'new',
      showQuickStart: true
    });

    analyticsService.trackEvent('onboarding_reset', {
      timestamp: Date.now(),
      reason: 'manual_reset'
    });
  }, []);

  // Get user guidance based on current state
  const getUserGuidance = useCallback(() => {
    if (state.userJourneyStage === 'new') {
      return {
        title: 'Bem-vindo! 👋',
        message: 'Vamos criar seu primeiro roteiro em 2 minutos?',
        cta: 'Começar Tutorial',
        priority: 'high'
      };
    }
    
    if (state.userJourneyStage === 'onboarding') {
      return {
        title: 'Continue de onde parou',
        message: 'Você estava no meio do tutorial. Quer continuar?',
        cta: 'Continuar',
        priority: 'medium'
      };
    }
    
    if (state.showQuickStart) {
      return {
        title: 'Precisa de ajuda?',
        message: 'Quer uma recapitulação rápida?',
        cta: 'Ajuda Rápida',
        priority: 'low'
      };
    }
    
    return null;
  }, [state]);

  // Auto-show onboarding on first visit
  useEffect(() => {
    if (state.isFirstTime && shouldShowOnboarding()) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.isFirstTime, shouldShowOnboarding, startOnboarding]);

  return {
    // State
    ...state,
    isOnboardingOpen,
    
    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    dismissQuickStart,
    resetOnboarding,
    
    // Helpers
    shouldShowOnboarding,
    getUserGuidance,
    
    // Setters (for controlled usage)
    setIsOnboardingOpen
  };
}; 