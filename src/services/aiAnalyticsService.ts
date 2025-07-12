/**
 * 🔄 AI ANALYTICS SERVICE - UNIFIED ALIAS V6.4
 * Week 2 Consolidation: This now exports AI analytics from the unified service
 * Maintains backward compatibility while using the consolidated implementation
 */

// Export AI analytics features from the unified service
export { unifiedAnalyticsService as aiAnalyticsService } from './unifiedAnalyticsService';

// Re-export types for backward compatibility
export type { 
  PredictiveInsight, 
  UserSegment, 
  UserBehaviorPattern
} from './unifiedAnalyticsService';

// Export default
export { unifiedAnalyticsService as default } from './unifiedAnalyticsService'; 