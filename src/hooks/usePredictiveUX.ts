import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface UserAction {
  type: 'click' | 'hover' | 'focus' | 'scroll' | 'input';
  target: string;
  timestamp: number;
  context?: Record<string, any>;
}

interface PredictionPattern {
  sequence: string[];
  probability: number;
  nextActions: string[];
  frequency: number;
}

interface PredictiveState {
  patterns: PredictionPattern[];
  currentSession: UserAction[];
  predictions: string[];
  preloadedResources: Set<string>;
}

/**
 * Advanced Predictive UX Hook - Phase 6 Feature
 * Learns user behavior patterns and anticipates actions
 */
export const usePredictiveUX = (options: {
  maxSessionActions?: number;
  predictionThreshold?: number;
  enablePreloading?: boolean;
  enableSmartSuggestions?: boolean;
} = {}) => {
  const {
    maxSessionActions = 50,
    predictionThreshold = 0.6,
    enablePreloading = true,
    enableSmartSuggestions = true,
  } = options;

  const [state, setState] = useState<PredictiveState>({
    patterns: [],
    currentSession: [],
    predictions: [],
    preloadedResources: new Set(),
  });

  const sessionRef = useRef<UserAction[]>([]);
  const patternsRef = useRef<PredictionPattern[]>([]);

  // Load patterns from localStorage on mount
  useEffect(() => {
    try {
      const savedPatterns = localStorage.getItem('predictive-ux-patterns');
      if (savedPatterns) {
        const patterns = JSON.parse(savedPatterns);
        patternsRef.current = patterns;
        setState(prev => ({ ...prev, patterns }));
      }
    } catch (error) {
      console.warn('Failed to load predictive patterns:', error);
    }
  }, []);

  // Save patterns to localStorage when they change
  const savePatterns = useCallback((patterns: PredictionPattern[]) => {
    try {
      localStorage.setItem('predictive-ux-patterns', JSON.stringify(patterns));
    } catch (error) {
      console.warn('Failed to save predictive patterns:', error);
    }
  }, []);

  // Analyze patterns and generate predictions
  const analyzePatterns = useCallback((session: UserAction[]): string[] => {
    if (session.length < 2) return [];

    const recentActions = session.slice(-5).map(action => action.target);
    const patterns = patternsRef.current;
    
    const predictions: Array<{ action: string; score: number }> = [];

    // Find matching patterns
    patterns.forEach(pattern => {
      if (pattern.sequence.length === 0) return;

      // Check if recent actions match pattern sequence
      const sequenceMatch = pattern.sequence.every((action, index) => {
        const sessionIndex = recentActions.length - pattern.sequence.length + index;
        return sessionIndex >= 0 && recentActions[sessionIndex] === action;
      });

      if (sequenceMatch) {
        pattern.nextActions.forEach(nextAction => {
          const existingPrediction = predictions.find(p => p.action === nextAction);
          if (existingPrediction) {
            existingPrediction.score += pattern.probability * pattern.frequency;
          } else {
            predictions.push({
              action: nextAction,
              score: pattern.probability * pattern.frequency,
            });
          }
        });
      }
    });

    // Return top predictions above threshold
    return predictions
      .filter(p => p.score >= predictionThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(p => p.action);
  }, [predictionThreshold]);

  // Track user action
  const trackAction = useCallback((action: UserAction) => {
    const newSession = [...sessionRef.current, action];
    
    // Limit session size
    if (newSession.length > maxSessionActions) {
      newSession.shift();
    }

    sessionRef.current = newSession;
    
    // Generate predictions
    const predictions = enableSmartSuggestions ? analyzePatterns(newSession) : [];
    
    setState(prev => ({
      ...prev,
      currentSession: newSession,
      predictions,
    }));
  }, [maxSessionActions, enableSmartSuggestions, analyzePatterns]);

  return {
    // State
    patterns: state.patterns,
    currentSession: state.currentSession,
    predictions: state.predictions,
    preloadedResources: state.preloadedResources,
    
    // Actions
    trackAction,
    
    // Analytics
    sessionLength: state.currentSession.length,
    patternCount: state.patterns.length,
  };
};
