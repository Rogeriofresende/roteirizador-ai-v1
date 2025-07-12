/**
 * 🔄 ANALYTICS SERVICE - UNIFIED ALIAS V6.4
 * Week 2 Consolidation: This now exports the unified analytics service
 * Maintains backward compatibility while using the consolidated implementation
 * 
 * ✅ WEEK 4.4 FIX: Ensure trackUserAction and trackError are always available
 */

import { unifiedAnalyticsService, UnifiedAnalyticsService } from './unifiedAnalyticsService';

// ✅ CRITICAL FIX: Create a wrapper that ensures methods are always available
class AnalyticsServiceWrapper {
  private service: UnifiedAnalyticsService;

  constructor() {
    this.service = unifiedAnalyticsService;
  }

  // Ensure all methods are properly bound and available
  trackEvent = (event: string, parameters?: Record<string, unknown>) => {
    return this.service.trackEvent(event, parameters);
  };

  trackUserAction = (action: string, data?: Record<string, unknown>) => {
    return this.service.trackUserAction(action, data);
  };

  trackError = (error: string, context?: Record<string, unknown>) => {
    return this.service.trackError(error, context);
  };

  trackFeatureUsage = (feature: string, data?: Record<string, unknown>) => {
    return this.service.trackFeatureUsage(feature, data);
  };

  trackPageView = (page: string) => {
    return this.service.trackPageView(page);
  };

  trackScriptGeneration = (data: {
    platform: string;
    subject: string;
    duration: string;
    tone: string;
    audience: string;
    success: boolean;
    generation_time: number;
    script_length?: number;
    error_message?: string;
  }) => {
    return this.service.trackScriptGeneration(data);
  };

  // Forward all other methods
  initialize = () => this.service.initialize();
  getStatus = () => this.service.getStatus();
  isEnabled = () => this.service.isEnabled();
  getUserSegments = () => this.service.getUserSegments();
  getInsights = (userId?: string) => this.service.getInsights(userId);
  predictNextAction = (userId: string, currentContext: string) => 
    this.service.predictNextAction(userId, currentContext);
  getProductivityMetrics = (userId: string, timeRange: '7d' | '30d' | '90d' | '1y') =>
    this.service.getProductivityMetrics(userId, timeRange);
  getDashboardMetrics = () => this.service.getDashboardMetrics();
  trackBehavior = (behavior: any) => this.service.trackBehavior(behavior);
}

// Create wrapper instance
const analyticsServiceWrapper = new AnalyticsServiceWrapper();

// Export the wrapper as analyticsService
export { analyticsServiceWrapper as analyticsService };
export { UnifiedAnalyticsService as AnalyticsService };

// Re-export types for backward compatibility
export type { 
  PredictiveInsight, 
  UserSegment, 
  ProductivityMetrics, 
  UserAnalytics, 
  DashboardMetrics,
  UserBehaviorPattern
} from './unifiedAnalyticsService';

// Export default
export { analyticsServiceWrapper as default }; 