/**
 * V5.1 Enhanced Framework - Intelligence Layer Service
 * Advanced AI-driven user experience optimization
 */

import { analyticsService } from './analyticsService';
import { performanceService } from './performance';
import { createLogger } from '../utils/logger';

const logger = createLogger('V51Intelligence');

interface UserPattern {
  id: string;
  userId?: string;
  sessionId: string;
  pattern: string[];
  frequency: number;
  lastSeen: number;
  confidence: number;
  outcome: 'success' | 'abandon' | 'error';
  context: Record<string, any>;
}

interface OptimizationSuggestion {
  type: 'prefetch' | 'preload' | 'cache' | 'ui_hint' | 'layout_change';
  target: string;
  reason: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
}

interface IntelligenceMetrics {
  totalPatterns: number;
  activeOptimizations: number;
  successfulPredictions: number;
  failedPredictions: number;
  averageConfidence: number;
  performanceImpact: number;
}

class V51IntelligenceService {
  private patterns: Map<string, UserPattern> = new Map();
  private optimizations: Map<string, OptimizationSuggestion> = new Map();
  private metrics: IntelligenceMetrics = {
    totalPatterns: 0,
    activeOptimizations: 0,
    successfulPredictions: 0,
    failedPredictions: 0,
    averageConfidence: 0,
    performanceImpact: 0
  };
  
  private isLearning: boolean = true;
  private maxPatterns: number = 1000;
  private confidenceThreshold: number = 0.6;

  constructor() {
    this.initialize();
  }

  // Initialize intelligence service
  private async initialize(): Promise<void> {
    try {
      // Load existing patterns from localStorage
      await this.loadStoredPatterns();
      
      // Setup performance monitoring
      this.setupPerformanceMonitoring();
      
      // Start learning cycle
      this.startLearningCycle();
      
      logger.info('V51Intelligence service initialized', {
        storedPatterns: this.patterns.size,
        isLearning: this.isLearning
      });
    } catch (error) {
      logger.error('Failed to initialize V51Intelligence service', { error });
    }
  }

  // Record user behavior pattern
  public recordPattern(
    sessionId: string,
    actions: string[],
    outcome: UserPattern['outcome'],
    context: Record<string, any> = {}
  ): void {
    if (!this.isLearning || actions.length < 2) return;

    const patternKey = actions.join(' → ');
    const existing = this.patterns.get(patternKey);
    
    const pattern: UserPattern = {
      id: existing?.id || `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      pattern: actions,
      frequency: (existing?.frequency || 0) + 1,
      lastSeen: Date.now(),
      confidence: this.calculateConfidence(actions, outcome, existing?.frequency || 0),
      outcome,
      context: { ...existing?.context, ...context }
    };

    this.patterns.set(patternKey, pattern);
    this.metrics.totalPatterns = this.patterns.size;

    // Cleanup old patterns if needed
    if (this.patterns.size > this.maxPatterns) {
      this.cleanupOldPatterns();
    }

    // Generate optimizations if confidence is high
    if (pattern.confidence >= this.confidenceThreshold) {
      this.generateOptimizations(pattern);
    }

    logger.debug('Pattern recorded', {
      pattern: patternKey,
      frequency: pattern.frequency,
      confidence: pattern.confidence,
      outcome
    });
  }

  // Calculate confidence score for patterns
  private calculateConfidence(
    actions: string[],
    outcome: UserPattern['outcome'],
    frequency: number
  ): number {
    let confidence = 0;

    // Base confidence from frequency
    confidence += Math.min(frequency / 10, 0.4);

    // Outcome bonus
    if (outcome === 'success') confidence += 0.3;
    else if (outcome === 'abandon') confidence += 0.1;
    else confidence -= 0.2; // error penalty

    // Pattern length bonus (longer patterns = more specific)
    confidence += Math.min(actions.length / 10, 0.2);

    // Recent activity bonus
    confidence += 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  // Generate optimization suggestions
  private generateOptimizations(pattern: UserPattern): void {
    const nextAction = this.predictNextAction(pattern.pattern);
    
    if (!nextAction || nextAction.confidence < this.confidenceThreshold) return;

    const optimization: OptimizationSuggestion = {
      type: this.determineOptimizationType(nextAction.action),
      target: nextAction.action,
      reason: `High confidence prediction based on pattern: ${pattern.pattern.join(' → ')}`,
      confidence: nextAction.confidence,
      impact: this.assessImpact(nextAction.action, pattern.frequency),
      implementation: this.generateImplementationAdvice(nextAction.action)
    };

    this.optimizations.set(nextAction.action, optimization);
    this.metrics.activeOptimizations = this.optimizations.size;

    logger.info('Optimization generated', {
      type: optimization.type,
      target: optimization.target,
      confidence: optimization.confidence,
      impact: optimization.impact
    });
  }

  // Predict next user action
  private predictNextAction(currentPattern: string[]): { action: string; confidence: number } | null {
    const relevantPatterns = Array.from(this.patterns.values())
      .filter(p => {
        const patternStart = p.pattern.slice(0, currentPattern.length);
        return JSON.stringify(patternStart) === JSON.stringify(currentPattern);
      })
      .filter(p => p.pattern.length > currentPattern.length);

    if (relevantPatterns.length === 0) return null;

    // Find most common next action
    const nextActions = new Map<string, { count: number; totalConfidence: number }>();
    
    relevantPatterns.forEach(pattern => {
      const nextAction = pattern.pattern[currentPattern.length];
      const existing = nextActions.get(nextAction) || { count: 0, totalConfidence: 0 };
      
      nextActions.set(nextAction, {
        count: existing.count + 1,
        totalConfidence: existing.totalConfidence + pattern.confidence
      });
    });

    // Find best prediction
    let bestAction = '';
    let bestScore = 0;

    nextActions.forEach((data, action) => {
      const score = (data.count / relevantPatterns.length) * (data.totalConfidence / data.count);
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    });

    return bestAction ? { action: bestAction, confidence: bestScore } : null;
  }

  // Determine optimization type based on action
  private determineOptimizationType(action: string): OptimizationSuggestion['type'] {
    if (action.includes('navigation') || action.includes('route')) return 'prefetch';
    if (action.includes('generator') || action.includes('create')) return 'preload';
    if (action.includes('data') || action.includes('load')) return 'cache';
    if (action.includes('hover') || action.includes('focus')) return 'ui_hint';
    return 'layout_change';
  }

  // Assess potential impact of optimization
  private assessImpact(action: string, frequency: number): OptimizationSuggestion['impact'] {
    if (frequency >= 10) return 'high';
    if (frequency >= 5) return 'medium';
    return 'low';
  }

  // Generate implementation advice
  private generateImplementationAdvice(action: string): string {
    const adviceMap: Record<string, string> = {
      'navigation': 'Implement route prefetching using React Router',
      'generator': 'Preload AI generator components and models',
      'data': 'Cache frequently requested data in localStorage',
      'hover': 'Show contextual tooltips or previews',
      'scroll': 'Implement virtual scrolling for performance'
    };

    const category = Object.keys(adviceMap).find(key => action.includes(key));
    return adviceMap[category] || 'Monitor and optimize based on user behavior';
  }

  // Get current optimizations
  public getOptimizations(): OptimizationSuggestion[] {
    return Array.from(this.optimizations.values())
      .sort((a, b) => (b.confidence * this.getImpactScore(b.impact)) - (a.confidence * this.getImpactScore(a.impact)));
  }

  private getImpactScore(impact: OptimizationSuggestion['impact']): number {
    return { low: 1, medium: 2, high: 3 }[impact];
  }

  // Get intelligence metrics
  public getMetrics(): IntelligenceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  private updateMetrics(): void {
    const patterns = Array.from(this.patterns.values());
    
    this.metrics.totalPatterns = patterns.length;
    this.metrics.activeOptimizations = this.optimizations.size;
    this.metrics.averageConfidence = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
      : 0;
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            performanceService.recordMetric('v51_page_load', loadTime, 'ms', 'performance');
          }
        }, 0);
      });
    }
  }

  // Start learning cycle
  private startLearningCycle(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      if (this.isLearning) {
        this.analyzeAndOptimize();
      }
    }, 30000); // Every 30 seconds
  }

  // Analyze patterns and create optimizations
  private analyzeAndOptimize(): void {
    const recentPatterns = Array.from(this.patterns.values())
      .filter(p => Date.now() - p.lastSeen < 300000) // Last 5 minutes
      .filter(p => p.confidence >= this.confidenceThreshold);

    recentPatterns.forEach(pattern => {
      this.generateOptimizations(pattern);
    });

    logger.debug('Analysis cycle completed', {
      recentPatterns: recentPatterns.length,
      totalOptimizations: this.optimizations.size
    });
  }

  // Cleanup old patterns
  private cleanupOldPatterns(): void {
    const patterns = Array.from(this.patterns.entries());
    patterns.sort(([,a], [,b]) => b.lastSeen - a.lastSeen);
    
    // Keep only the most recent 80% of patterns
    const keepCount = Math.floor(patterns.length * 0.8);
    const toRemove = patterns.slice(keepCount);
    
    toRemove.forEach(([key]) => {
      this.patterns.delete(key);
    });

    logger.debug('Pattern cleanup completed', {
      removed: toRemove.length,
      remaining: this.patterns.size
    });
  }

  // Store patterns to localStorage
  private storePatterns(): void {
    try {
      const patternsData = Array.from(this.patterns.entries()).slice(0, 100); // Store only top 100
      localStorage.setItem('v51_patterns', JSON.stringify(patternsData));
    } catch (error) {
      logger.warn('Failed to store patterns', { error });
    }
  }

  // Load patterns from localStorage
  private async loadStoredPatterns(): Promise<void> {
    try {
      const stored = localStorage.getItem('v51_patterns');
      if (stored) {
        const patternsData = JSON.parse(stored);
        this.patterns = new Map(patternsData);
        logger.info('Patterns loaded from storage', { count: this.patterns.size });
      }
    } catch (error) {
      logger.warn('Failed to load stored patterns', { error });
    }
  }

  // Public API methods
  public toggleLearning(): void {
    this.isLearning = !this.isLearning;
    logger.info('Learning mode toggled', { isLearning: this.isLearning });
  }

  public clearPatterns(): void {
    this.patterns.clear();
    this.optimizations.clear();
    localStorage.removeItem('v51_patterns');
    this.updateMetrics();
    logger.info('All patterns cleared');
  }

  public exportPatterns(): string {
    return JSON.stringify({
      patterns: Array.from(this.patterns.entries()),
      optimizations: Array.from(this.optimizations.entries()),
      metrics: this.metrics,
      timestamp: Date.now()
    }, null, 2);
  }

  // Cleanup on page unload
  public cleanup(): void {
    this.storePatterns();
    logger.info('V51Intelligence service cleaned up');
  }
}

// Create singleton instance
export const v51Intelligence = new V51IntelligenceService();

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    v51Intelligence.cleanup();
  });
}
