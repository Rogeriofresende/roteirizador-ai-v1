/**
 * V5.1 Enhanced Framework - usePredictiveUX Hook
 * Predictive User Experience - Antecipa ações do usuário
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsService } from '../services/analyticsService';
import { createLogger } from '../utils/logger';

const logger = createLogger('usePredictiveUX');

interface UserAction {
  type: 'click' | 'hover' | 'scroll' | 'input' | 'focus' | 'navigation';
  target: string;
  timestamp: number;
  context: Record<string, unknown>;
  sessionId: string;
}

interface PredictionPattern {
  sequence: string[];
  probability: number;
  nextAction: string;
  confidence: number;
  avgTime: number;
}

interface PredictiveState {
  currentSequence: string[];
  predictions: PredictionPattern[];
  isLearning: boolean;
  sessionPatterns: Map<string, number>;
  prefetchQueue: string[];
}

export const usePredictiveUX = () => {
  const [state, setState] = useState<PredictiveState>({
    currentSequence: [],
    predictions: [],
    isLearning: true,
    sessionPatterns: new Map(),
    prefetchQueue: []
  });

  const sessionId = useRef<string>(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const actionHistory = useRef<UserAction[]>([]);
  const learningWindow = useRef<number>(5); // Consider last 5 actions

  // Track user action
  const trackAction = useCallback((
    type: UserAction['type'], 
    target: string, 
    context: Record<string, unknown> = {}
  ) => {
    const action: UserAction = {
      type,
      target,
      timestamp: Date.now(),
      context,
      sessionId: sessionId.current
    };

    actionHistory.current.push(action);
    
    // Keep only recent actions (performance optimization)
    if (actionHistory.current.length > 100) {
      actionHistory.current = actionHistory.current.slice(-50);
    }

    // Update current sequence using setState callback to avoid dependency
    setState(prev => {
      const newSequence = [...prev.currentSequence, `${type}:${target}`];
      if (newSequence.length > learningWindow.current) {
        newSequence.shift();
      }
      
      return {
        ...prev,
        currentSequence: newSequence
      };
    });

    // Analytics integration
    analyticsService.trackEvent?.('predictive_ux_action', {
      type,
      target,
      sequenceLength: actionHistory.current.length,
      sessionId: sessionId.current,
      ...context
    });

    logger.debug('Action tracked', { action, sequenceLength: actionHistory.current.length });
  }, []); // Remove state.currentSequence dependency to prevent loop

  // Analyze patterns and generate predictions
  const analyzePatterns = useCallback(() => {
    if (actionHistory.current.length < 3) return;

    const patterns = new Map<string, { count: number; nextActions: Map<string, number>; timings: number[] }>();
    const actions = actionHistory.current;

    // Build pattern sequences
    for (let i = 0; i < actions.length - 1; i++) {
      const window = Math.min(learningWindow.current, actions.length - i);
      
      for (let w = 2; w <= window; w++) {
        const sequence = actions.slice(i, i + w - 1)
          .map(a => `${a.type}:${a.target}`)
          .join(' → ');
        
        const nextAction = `${actions[i + w - 1].type}:${actions[i + w - 1].target}`;
        
        if (!patterns.has(sequence)) {
          patterns.set(sequence, { count: 0, nextActions: new Map(), timings: [] });
        }
        
        const pattern = patterns.get(sequence)!;
        pattern.count++;
        pattern.nextActions.set(nextAction, (pattern.nextActions.get(nextAction) || 0) + 1);
        
        // Calculate timing
        const timeDiff = actions[i + w - 1].timestamp - actions[i + w - 2].timestamp;
        pattern.timings.push(timeDiff);
      }
    }

    // Generate predictions using state callback
    setState(prev => {
      const currentSeq = prev.currentSequence.join(' → ');
      const predictions: PredictionPattern[] = [];

      patterns.forEach((data, sequence) => {
        if (data.count >= 2 && (currentSeq.endsWith(sequence) || sequence.includes(currentSeq))) {
          data.nextActions.forEach((count, nextAction) => {
            const probability = count / data.count;
            const confidence = Math.min(probability * (data.count / 10), 1);
            const avgTime = data.timings.reduce((a, b) => a + b, 0) / data.timings.length;

            if (probability > 0.3) { // Only predictions with >30% probability
              predictions.push({
                sequence: sequence.split(' → '),
                probability,
                nextAction,
                confidence,
                avgTime
              });
            }
          });
        }
      });

      // Sort by confidence
      predictions.sort((a, b) => b.confidence - a.confidence);

      return {
        ...prev,
        predictions: predictions.slice(0, 5) // Keep top 5 predictions
      };
    });

    logger.debug('Patterns analyzed', { 
      totalPatterns: patterns.size,
      actionsLength: actionHistory.current.length
    });
  }, []); // Remove state.currentSequence dependency

  // Get most likely next action
  const getMostLikelyNext = useCallback(() => {
    if (state.predictions.length === 0) return null;
    
    const best = state.predictions[0];
    return {
      action: best.nextAction,
      confidence: best.confidence,
      expectedTime: best.avgTime
    };
  }, [state.predictions]);

  // Get predictions for specific action type
  const getPredictionsFor = useCallback((actionType: UserAction['type']) => {
    return state.predictions.filter(p => 
      p.nextAction.startsWith(`${actionType}:`)
    );
  }, [state.predictions]);

  // Check if action matches prediction
  const isPredictedAction = useCallback((type: UserAction['type'], target: string) => {
    const actionStr = `${type}:${target}`;
    return state.predictions.some(p => p.nextAction === actionStr && p.confidence > 0.5);
  }, [state.predictions]);

  // Suggest prefetch targets
  const suggestPrefetch = useCallback(() => {
    const navigationPredictions = getPredictionsFor('navigation');
    const prefetchTargets = navigationPredictions
      .filter(p => p.confidence > 0.6)
      .map(p => p.nextAction.split(':')[1])
      .slice(0, 3);

    setState(prev => ({
      ...prev,
      prefetchQueue: prefetchTargets
    }));

    return prefetchTargets;
  }, [getPredictionsFor]);

  // Auto-analyze patterns periodically
  useEffect(() => {
    if (!state.isLearning) return;

    const interval = setInterval(() => {
      if (actionHistory.current.length >= 3) {
        analyzePatterns();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [state.isLearning]); // ✅ FIXED: Removed analyzePatterns dependency

  // Session analytics
  useEffect(() => {
    const handleBeforeUnload = () => {
      analyticsService.trackEvent?.('predictive_ux_session_end', {
        sessionId: sessionId.current,
        totalActions: actionHistory.current.length,
        uniqueTargets: new Set(actionHistory.current.map(a => a.target)).size,
        sessionDuration: Date.now() - (actionHistory.current[0]?.timestamp || Date.now())
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ✅ PERFORMANCE OPTIMIZATION: Stable analyzePatterns reference
  const analyzePatternRef = useRef(analyzePatterns);
  analyzePatternRef.current = analyzePatterns;

  // V5.0 RECOVERY: Implement missing getSmartSuggestions function
  const getSmartSuggestions = useCallback((context: string) => {
    const contextPredictions = state.predictions.filter(p => 
      p.nextAction.includes(context) || p.sequence.some(s => s.includes(context))
    );
    
    return contextPredictions
      .filter(p => p.confidence > 0.4)
      .map(p => p.nextAction)
      .slice(0, 3);
  }, [state.predictions]);

  // Control
  const toggleLearning = useCallback(() => {
    setState(prev => ({ ...prev, isLearning: !prev.isLearning }));
  }, []);

  const clearHistory = useCallback(() => {
    actionHistory.current = [];
    setState(prev => ({
      ...prev,
      currentSequence: [],
      predictions: [],
      prefetchQueue: []
    }));
  }, []);

  // ✅ PERFORMANCE OPTIMIZATION: Stable analytics function
  const getSessionStats = useCallback(() => ({
    totalActions: actionHistory.current.length,
    uniqueTargets: new Set(actionHistory.current.map(a => a.target)).size,
    averageTimeBetweenActions: actionHistory.current.length > 1 
      ? (actionHistory.current[actionHistory.current.length - 1].timestamp - actionHistory.current[0].timestamp) / (actionHistory.current.length - 1)
      : 0
  }), []);

  return {
    // Core tracking
    trackAction,
    
    // Predictions
    predictions: state.predictions,
    getMostLikelyNext,
    getPredictionsFor,
    isPredictedAction,
    
    // V5.0 RECOVERY: Re-added missing function
    getSmartSuggestions,
    
    // Prefetching
    suggestPrefetch,
    prefetchQueue: state.prefetchQueue,
    
    // State
    currentSequence: state.currentSequence,
    isLearning: state.isLearning,
    sessionId: sessionId.current,
    
    // Analytics
    getSessionStats,
    
    // Control
    toggleLearning,
    clearHistory
  };
};
