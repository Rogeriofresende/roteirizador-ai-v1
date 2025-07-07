import { useState, useEffect, useCallback, useRef } from 'react';
import { aiAnalyticsService, PredictiveInsight, UserSegment } from '../services/aiAnalyticsService';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('useAIAnalytics');

export interface AIAnalyticsState {
  insights: PredictiveInsight[];
  segments: UserSegment[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface AIAnalyticsActions {
  trackAction: (actionType: string, context: string, metadata?: Record<string, unknown>) => void;
  predictNextAction: (context: string) => Promise<{
    action: string;
    confidence: number;
    reasoning: string;
  } | null>;
  refreshInsights: () => Promise<void>;
  getSmartCachingStrategy: () => {
    preloadResources: string[];
    cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
    reasoning: string;
  };
}

export const useAIAnalytics = (): AIAnalyticsState & AIAnalyticsActions => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<AIAnalyticsState>({
    insights: [],
    segments: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const trackingQueue = useRef<Array<{
    actionType: string;
    context: string;
    metadata?: Record<string, unknown>;
  }>>([]);

  const isInitialized = useRef(false);

  // Internal tracking function
  const trackActionInternal = useCallback((
    actionType: string, 
    context: string, 
    metadata?: Record<string, unknown>
  ) => {
    if (!currentUser?.uid) {
      logger.warn('Cannot track action: user not authenticated');
      return;
    }

    try {
      aiAnalyticsService.trackBehavior({
        userId: currentUser.uid,
        actionType: actionType as 'navigate' | 'interact' | 'error' | 'convert',
        context,
        metadata: metadata || {}
      });
      
      logger.debug('Action tracked', { actionType, context, userId: currentUser.uid });
    } catch (error: unknown) {
      logger.error('Failed to track action', { error, actionType, context });
    }
  }, [currentUser?.uid]);

  // Initialize AI Analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      if (isInitialized.current) return;
      
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        await aiAnalyticsService.initialize();
        
        // Load initial data
        const [insights, segments] = await Promise.all([
          aiAnalyticsService.getInsights(currentUser?.uid),
          Promise.resolve(aiAnalyticsService.getUserSegments())
        ]);

        setState(prev => ({
          ...prev,
          insights,
          segments,
          isLoading: false,
          lastUpdated: new Date()
        }));

        // Process any queued tracking events
        if (trackingQueue.current.length > 0) {
          trackingQueue.current.forEach(({ actionType, context, metadata }) => {
            trackActionInternal(actionType, context, metadata);
          });
          trackingQueue.current = [];
        }

        isInitialized.current = true;
        logger.info('AI Analytics initialized successfully', {
          insightsCount: insights.length,
          segmentsCount: segments.length,
          userId: currentUser?.uid
        });
      } catch (error: unknown) {
        logger.error('Failed to initialize AI Analytics', { error });
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    initializeAnalytics();
  }, [currentUser?.uid, trackActionInternal]);

  // Auto-refresh insights periodically
  useEffect(() => {
    if (!isInitialized.current) return;

    const interval = setInterval(async () => {
      try {
        const insights = await aiAnalyticsService.getInsights(currentUser?.uid);
        setState(prev => ({
          ...prev,
          insights,
          lastUpdated: new Date()
        }));
        logger.debug('Insights auto-refreshed', { count: insights.length });
      } catch (error: unknown) {
        logger.warn('Failed to auto-refresh insights', { error });
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  // Public API methods
  const trackAction = useCallback((
    actionType: string, 
    context: string, 
    metadata?: Record<string, unknown>
  ) => {
    if (!isInitialized.current) {
      // Queue the action for later processing
      trackingQueue.current.push({ actionType, context, metadata });
      logger.debug('Action queued for tracking', { actionType, context });
      return;
    }

    trackActionInternal(actionType, context, metadata);
  }, [trackActionInternal]);

  const predictNextAction = useCallback(async (context: string) => {
    if (!currentUser?.uid || !isInitialized.current) {
      logger.warn('Cannot predict next action: not ready');
      return null;
    }

    try {
      const prediction = await aiAnalyticsService.predictNextAction(currentUser.uid, context);
      logger.debug('Next action predicted', { 
        context, 
        prediction: prediction?.action,
        confidence: prediction?.confidence 
      });
      return prediction;
    } catch (error: unknown) {
      logger.error('Failed to predict next action', { error, context });
      return null;
    }
  }, [currentUser?.uid]);

  const refreshInsights = useCallback(async () => {
    if (!isInitialized.current) {
      logger.warn('Cannot refresh insights: not initialized');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const [insights, segments] = await Promise.all([
        aiAnalyticsService.getInsights(currentUser?.uid),
        Promise.resolve(aiAnalyticsService.getUserSegments())
      ]);

      setState(prev => ({
        ...prev,
        insights,
        segments,
        isLoading: false,
        lastUpdated: new Date(),
        error: null
      }));

      logger.info('Insights refreshed manually', { 
        insightsCount: insights.length,
        segmentsCount: segments.length 
      });
    } catch (error: unknown) {
      logger.error('Failed to refresh insights', { error });
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh insights'
      }));
    }
  }, [currentUser?.uid]);

  const getSmartCachingStrategy = useCallback(() => {
    if (!currentUser?.uid || !isInitialized.current) {
      logger.warn('Cannot get caching strategy: not ready');
      return {
        preloadResources: [],
        cacheStrategy: 'minimal' as const,
        reasoning: 'User not authenticated or analytics not initialized'
      };
    }

    try {
      const strategy = aiAnalyticsService.getSmartCachingStrategy(currentUser.uid);
      logger.debug('Caching strategy generated', { 
        strategy: strategy.cacheStrategy,
        resourceCount: strategy.preloadResources.length 
      });
      return strategy;
    } catch (error: unknown) {
      logger.error('Failed to get caching strategy', { error });
      return {
        preloadResources: [],
        cacheStrategy: 'minimal' as const,
        reasoning: 'Error generating strategy'
      };
    }
  }, [currentUser?.uid]);

  return {
    // State
    insights: state.insights,
    segments: state.segments,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    trackAction,
    predictNextAction,
    refreshInsights,
    getSmartCachingStrategy
  };
};

// Custom hook for page-level tracking
export const usePageTracking = (pageName: string, metadata?: Record<string, unknown>) => {
  const { trackAction } = useAIAnalytics();

  useEffect(() => {
    trackAction('navigate', `page:${pageName}`, {
      ...metadata,
      timestamp: Date.now(),
      url: window.location.pathname
    });
  }, [trackAction, pageName, metadata]);
};

// Custom hook for feature usage tracking
export const useFeatureTracking = () => {
  const { trackAction } = useAIAnalytics();

  const trackFeatureUsage = useCallback((
    featureName: string, 
    action: 'start' | 'complete' | 'error' | 'cancel',
    metadata?: Record<string, unknown>
  ) => {
    trackAction('feature', `${featureName}:${action}`, {
      ...metadata,
      timestamp: Date.now(),
      feature: featureName,
      action
    });
  }, [trackAction]);

  return { trackFeatureUsage };
}; 