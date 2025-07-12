/**
 * 🔄 ADVANCED ANALYTICS SERVICE - UNIFIED ALIAS V6.4
 * Week 2 Consolidation: This now exports advanced analytics from the unified service
 * Maintains backward compatibility while using the consolidated implementation
 */

// Export advanced analytics features from the unified service
export { unifiedAnalyticsService as AdvancedAnalyticsService } from './unifiedAnalyticsService';

// Re-export types for backward compatibility
export type { 
  ProductivityMetrics, 
  UserAnalytics, 
  DashboardMetrics
} from './unifiedAnalyticsService';

// Export default
export { unifiedAnalyticsService as default } from './unifiedAnalyticsService'; 