/**
 * 💰 PERFORMANCE BUDGETS
 * System for setting and monitoring performance budgets
 */

import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { performanceService } from './performance';
import { bundleOptimizer } from '../services/bundleOptimizer';
import { trackPerformanceIssue } from './errorTrackingService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface PerformanceBudget {
  id: string;
  name: string;
  metric: string;
  limit: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent' | 'score';
  category: 'loading' | 'interactivity' | 'visual_stability' | 'memory' | 'bundle';
  severity: 'warning' | 'error';
  enabled: boolean;
  description: string;
}

export interface BudgetViolation {
  budgetId: string;
  budgetName: string;
  metric: string;
  currentValue: number;
  budgetLimit: number;
  violation: number;
  severity: 'warning' | 'error';
  timestamp: string;
  suggestions: string[];
}

export interface BudgetReport {
  timestamp: string;
  totalBudgets: number;
  passingBudgets: number;
  violatingBudgets: number;
  violations: BudgetViolation[];
  overallScore: number;
  recommendations: string[];
}

// =============================================================================
// DEFAULT BUDGETS
// =============================================================================

const DEFAULT_BUDGETS: PerformanceBudget[] = [
  // Loading Performance
  {
    id: 'lcp-budget',
    name: 'Largest Contentful Paint',
    metric: 'LCP',
    limit: 2500,
    unit: 'ms',
    category: 'loading',
    severity: 'error',
    enabled: true,
    description: 'Time until the largest content element is rendered',
  },
  {
    id: 'fcp-budget',
    name: 'First Contentful Paint',
    metric: 'FCP',
    limit: 1800,
    unit: 'ms',
    category: 'loading',
    severity: 'warning',
    enabled: true,
    description: 'Time until the first content is painted',
  },
  {
    id: 'ttfb-budget',
    name: 'Time to First Byte',
    metric: 'TTFB',
    limit: 800,
    unit: 'ms',
    category: 'loading',
    severity: 'warning',
    enabled: true,
    description: 'Time until the first byte is received from the server',
  },

  // Interactivity
  {
    id: 'fid-budget',
    name: 'First Input Delay',
    metric: 'FID',
    limit: 100,
    unit: 'ms',
    category: 'interactivity',
    severity: 'error',
    enabled: true,
    description: 'Time from first user input to browser response',
  },

  // Visual Stability
  {
    id: 'cls-budget',
    name: 'Cumulative Layout Shift',
    metric: 'CLS',
    limit: 0.1,
    unit: 'score',
    category: 'visual_stability',
    severity: 'error',
    enabled: true,
    description: 'Visual stability - amount of unexpected layout shift',
  },

  // Bundle Size
  {
    id: 'bundle-total-budget',
    name: 'Total Bundle Size',
    metric: 'bundleSize',
    limit: 1024 * 1024, // 1MB
    unit: 'bytes',
    category: 'bundle',
    severity: 'error',
    enabled: true,
    description: 'Total size of all JavaScript and CSS bundles',
  },
  {
    id: 'main-bundle-budget',
    name: 'Main Bundle Size',
    metric: 'mainBundleSize',
    limit: 250 * 1024, // 250KB
    unit: 'bytes',
    category: 'bundle',
    severity: 'warning',
    enabled: true,
    description: 'Size of the main JavaScript bundle',
  },

  // Memory
  {
    id: 'memory-usage-budget',
    name: 'Memory Usage',
    metric: 'memoryUsage',
    limit: 50,
    unit: 'percent',
    category: 'memory',
    severity: 'warning',
    enabled: true,
    description: 'JavaScript heap memory usage percentage',
  },
  {
    id: 'dom-nodes-budget',
    name: 'DOM Nodes Count',
    metric: 'domNodes',
    limit: 2000,
    unit: 'count',
    category: 'memory',
    severity: 'warning',
    enabled: true,
    description: 'Total number of DOM nodes in the document',
  },
];

// =============================================================================
// PERFORMANCE BUDGETS SERVICE
// =============================================================================

class PerformanceBudgetsService {
  private budgets: Map<string, PerformanceBudget> = new Map();
  private violations: BudgetViolation[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultBudgets();
    this.startMonitoring();
    
    logger.info('Performance budgets service initialized', {
      budgetsCount: this.budgets.size,
    }, 'PERFORMANCE_BUDGETS');
  }

  /**
   * Add or update a performance budget
   */
  setBudget(budget: PerformanceBudget): void {
    this.budgets.set(budget.id, budget);
    
    logger.info('Performance budget updated', {
      budgetId: budget.id,
      metric: budget.metric,
      limit: budget.limit,
      unit: budget.unit,
    }, 'PERFORMANCE_BUDGETS');
  }

  /**
   * Remove a performance budget
   */
  removeBudget(budgetId: string): boolean {
    const removed = this.budgets.delete(budgetId);
    
    if (removed) {
      logger.info('Performance budget removed', { budgetId }, 'PERFORMANCE_BUDGETS');
    }
    
    return removed;
  }

  /**
   * Get all budgets
   */
  getAllBudgets(): PerformanceBudget[] {
    return Array.from(this.budgets.values());
  }

  /**
   * Get budget by ID
   */
  getBudget(budgetId: string): PerformanceBudget | undefined {
    return this.budgets.get(budgetId);
  }

  /**
   * Check all budgets against current metrics
   */
  checkBudgets(): BudgetReport {
    const violations: BudgetViolation[] = [];
    const enabledBudgets = Array.from(this.budgets.values()).filter(b => b.enabled);
    
    // Get current metrics
    const webVitals = performanceService.getWebVitals();
    const memoryMetrics = performanceService.getMemoryMetrics();
    const bundleMetrics = bundleOptimizer.getCurrentMetrics();
    
    // Check each budget
    enabledBudgets.forEach(budget => {
      const currentValue = this.getCurrentValue(budget.metric, {
        webVitals,
        memoryMetrics,
        bundleMetrics,
      });
      
      if (currentValue !== null && currentValue > budget.limit) {
        const violation: BudgetViolation = {
          budgetId: budget.id,
          budgetName: budget.name,
          metric: budget.metric,
          currentValue,
          budgetLimit: budget.limit,
          violation: currentValue - budget.limit,
          severity: budget.severity,
          timestamp: new Date().toISOString(),
          suggestions: this.generateSuggestions(budget, currentValue),
        };
        
        violations.push(violation);
        
        // Track performance issue
        trackPerformanceIssue(budget.metric, currentValue, budget.limit, {
          budgetId: budget.id,
          severity: budget.severity,
          category: budget.category,
        });
      }
    });

    // Store violations
    this.violations = violations;

    // Calculate overall score
    const overallScore = this.calculateOverallScore(enabledBudgets.length, violations.length);

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations);

    const report: BudgetReport = {
      timestamp: new Date().toISOString(),
      totalBudgets: enabledBudgets.length,
      passingBudgets: enabledBudgets.length - violations.length,
      violatingBudgets: violations.length,
      violations,
      overallScore,
      recommendations,
    };

    // Log results
    if (violations.length > 0) {
      logger.warn('Performance budget violations detected', {
        violationsCount: violations.length,
        totalBudgets: enabledBudgets.length,
        score: overallScore,
      }, 'PERFORMANCE_BUDGETS');
    } else {
      logger.info('All performance budgets passing', {
        totalBudgets: enabledBudgets.length,
        score: overallScore,
      }, 'PERFORMANCE_BUDGETS');
    }

    return report;
  }

  /**
   * Get current violations
   */
  getCurrentViolations(): BudgetViolation[] {
    return [...this.violations];
  }

  /**
   * Start automatic budget monitoring
   */
  startMonitoring(interval: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.checkBudgets();
    }, interval);

    logger.info('Performance budget monitoring started', { interval }, 'PERFORMANCE_BUDGETS');
  }

  /**
   * Stop automatic budget monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('Performance budget monitoring stopped', {}, 'PERFORMANCE_BUDGETS');
  }

  /**
   * Export budgets configuration
   */
  exportBudgets(): string {
    const budgets = this.getAllBudgets();
    return JSON.stringify(budgets, null, 2);
  }

  /**
   * Import budgets configuration
   */
  importBudgets(budgetsJson: string): boolean {
    try {
      const budgets: PerformanceBudget[] = JSON.parse(budgetsJson);
      
      // Validate budgets
      budgets.forEach(budget => {
        if (!this.validateBudget(budget)) {
          throw new Error(`Invalid budget: ${budget.id}`);
        }
      });

      // Clear existing budgets and import new ones
      this.budgets.clear();
      budgets.forEach(budget => this.setBudget(budget));

      logger.info('Performance budgets imported', {
        count: budgets.length,
      }, 'PERFORMANCE_BUDGETS');

      return true;
    } catch (error) {
      logger.error('Failed to import performance budgets', {
        error: error instanceof Error ? error.message : 'Unknown',
      }, 'PERFORMANCE_BUDGETS');
      return false;
    }
  }

  /**
   * Reset to default budgets
   */
  resetToDefaults(): void {
    this.budgets.clear();
    this.initializeDefaultBudgets();
    
    logger.info('Performance budgets reset to defaults', {
      count: this.budgets.size,
    }, 'PERFORMANCE_BUDGETS');
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeDefaultBudgets(): void {
    DEFAULT_BUDGETS.forEach(budget => {
      this.budgets.set(budget.id, budget);
    });
  }

  private getCurrentValue(metric: string, metrics: any): number | null {
    switch (metric) {
      case 'LCP':
        return metrics.webVitals.LCP || null;
      case 'FCP':
        return metrics.webVitals.FCP || null;
      case 'FID':
        return metrics.webVitals.FID || null;
      case 'CLS':
        return metrics.webVitals.CLS || null;
      case 'TTFB':
        return metrics.webVitals.TTFB || null;
      case 'bundleSize':
        return metrics.bundleMetrics.currentBundleSize || null;
      case 'mainBundleSize':
        // Would need to be calculated from bundle analysis
        return metrics.bundleMetrics.currentBundleSize * 0.3 || null; // Estimate
      case 'memoryUsage':
        return metrics.memoryMetrics.memoryUsagePercent || null;
      case 'domNodes':
        return metrics.memoryMetrics.domNodes || null;
      default:
        return null;
    }
  }

  private generateSuggestions(budget: PerformanceBudget, currentValue: number): string[] {
    const suggestions: string[] = [];
    const violation = currentValue - budget.limit;
    const violationPercent = (violation / budget.limit) * 100;

    switch (budget.category) {
      case 'loading':
        suggestions.push('Optimize resource loading and server response times');
        if (violationPercent > 50) {
          suggestions.push('Consider implementing lazy loading for non-critical resources');
        }
        break;
        
      case 'interactivity':
        suggestions.push('Reduce JavaScript execution time and long tasks');
        suggestions.push('Split large JavaScript bundles into smaller chunks');
        break;
        
      case 'visual_stability':
        suggestions.push('Set explicit dimensions for images and other content');
        suggestions.push('Avoid inserting content above existing content');
        break;
        
      case 'bundle':
        suggestions.push('Implement code splitting and tree shaking');
        if (violationPercent > 100) {
          suggestions.push('Remove unused dependencies and implement dynamic imports');
        }
        break;
        
      case 'memory':
        suggestions.push('Review memory usage and implement proper cleanup');
        suggestions.push('Use React.memo and useMemo to prevent unnecessary re-renders');
        break;
    }

    return suggestions;
  }

  private generateRecommendations(violations: BudgetViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.length === 0) {
      recommendations.push('All performance budgets are within limits - great job!');
      return recommendations;
    }

    // Categorize violations
    const categoryCounts = violations.reduce((acc, v) => {
      const budget = this.budgets.get(v.budgetId);
      if (budget) {
        acc[budget.category] = (acc[budget.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Generate category-specific recommendations
    Object.entries(categoryCounts).forEach(([category, count]) => {
      switch (category) {
        case 'loading':
          recommendations.push(`${count} loading performance issue(s) detected - focus on resource optimization`);
          break;
        case 'bundle':
          recommendations.push(`${count} bundle size issue(s) detected - implement code splitting`);
          break;
        case 'memory':
          recommendations.push(`${count} memory issue(s) detected - review component lifecycle and cleanup`);
          break;
        case 'interactivity':
          recommendations.push(`${count} interactivity issue(s) detected - optimize JavaScript execution`);
          break;
        case 'visual_stability':
          recommendations.push(`${count} visual stability issue(s) detected - fix layout shifts`);
          break;
      }
    });

    // Priority recommendations based on severity
    const criticalViolations = violations.filter(v => v.severity === 'error');
    if (criticalViolations.length > 0) {
      recommendations.unshift(`Priority: Fix ${criticalViolations.length} critical performance issue(s) first`);
    }

    return recommendations;
  }

  private calculateOverallScore(totalBudgets: number, violations: number): number {
    if (totalBudgets === 0) return 100;
    
    const passingBudgets = totalBudgets - violations;
    return Math.round((passingBudgets / totalBudgets) * 100);
  }

  private validateBudget(budget: PerformanceBudget): boolean {
    return !!(
      budget.id &&
      budget.name &&
      budget.metric &&
      typeof budget.limit === 'number' &&
      budget.unit &&
      budget.category &&
      budget.severity &&
      typeof budget.enabled === 'boolean'
    );
  }

  // Cleanup
  destroy(): void {
    this.stopMonitoring();
    logger.info('Performance budgets service destroyed', {}, 'PERFORMANCE_BUDGETS');
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const performanceBudgets = new PerformanceBudgetsService();

export default performanceBudgets; 