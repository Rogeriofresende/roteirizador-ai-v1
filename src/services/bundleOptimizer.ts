/**
 * 📦 BUNDLE OPTIMIZER SERVICE
 * Monitor bundle size and provide optimization suggestions
 */

import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { performanceService } from './performance';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  recommendations: BundleRecommendation[];
  score: number;
}

export interface ChunkInfo {
  name: string;
  size: number;
  type: 'main' | 'vendor' | 'async' | 'css';
  loadTime?: number;
}

export interface BundleRecommendation {
  type: 'size' | 'splitting' | 'lazy' | 'compression';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  implementation: string;
}

export interface BundleMetrics {
  currentBundleSize: number;
  loadTime: number;
  cacheHitRatio: number;
  compressionRatio: number;
}

// =============================================================================
// BUNDLE OPTIMIZER SERVICE
// =============================================================================

class BundleOptimizerService {
  private metrics: BundleMetrics;
  private sizeBudgets = {
    main: 250 * 1024, // 250KB
    vendor: 500 * 1024, // 500KB
    total: 1024 * 1024, // 1MB
  };

  constructor() {
    this.metrics = this.initializeMetrics();
    this.analyzeCurrentBundle();
    
    logger.info('Bundle optimizer service initialized', {
      budgets: this.sizeBudgets,
    }, 'BUNDLE_OPTIMIZER');
  }

  /**
   * Analyze current bundle
   */
  async analyzeCurrentBundle(): Promise<BundleAnalysis> {
    logger.debug('Starting bundle analysis', {}, 'BUNDLE_OPTIMIZER');

    const analysis: BundleAnalysis = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      recommendations: [],
      score: 0,
    };

    try {
      // Analyze resources
      const resources = this.getResourceEntries();
      analysis.chunks = this.analyzeChunks(resources);
      
      // Calculate sizes
      analysis.totalSize = analysis.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
      analysis.gzippedSize = this.estimateGzippedSize(analysis.totalSize);
      
      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);
      
      // Calculate score
      analysis.score = this.calculateBundleScore(analysis);

      // Record metrics
      this.recordBundleMetrics(analysis);

      logger.info('Bundle analysis completed', {
        totalSize: `${(analysis.totalSize / 1024).toFixed(1)}KB`,
        score: analysis.score,
        recommendations: analysis.recommendations.length,
      }, 'BUNDLE_OPTIMIZER');

    } catch (error: unknown) {
      logger.error('Bundle analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown',
      }, 'BUNDLE_OPTIMIZER');
    }

    return analysis;
  }

  /**
   * Get bundle optimization suggestions
   */
  getOptimizationSuggestions(): BundleRecommendation[] {
    const resources = this.getResourceEntries();
    const suggestions: BundleRecommendation[] = [];

    // Check main bundle size
    const mainJsSize = this.getMainBundleSize(resources);
    if (mainJsSize > this.sizeBudgets.main) {
      suggestions.push({
        type: 'splitting',
        priority: 'high',
        description: `Main bundle is ${(mainJsSize / 1024).toFixed(1)}KB, exceeding ${(this.sizeBudgets.main / 1024).toFixed(1)}KB budget`,
        impact: 'Faster initial page load',
        implementation: 'Implement code splitting with React.lazy() and dynamic imports',
      });
    }

    // Check compression
    if (!this.isCompressionEnabled()) {
      suggestions.push({
        type: 'compression',
        priority: 'high',
        description: 'Gzip compression not detected',
        impact: '60-80% size reduction',
        implementation: 'Enable gzip/brotli compression on server',
      });
    }

    return suggestions;
  }

  /**
   * Check if bundle meets performance budgets
   */
  checkPerformanceBudgets(): { passed: boolean; violations: string[] } {
    const resources = this.getResourceEntries();
    const violations: string[] = [];
    
    const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

    // Check total size budget
    if (totalSize > this.sizeBudgets.total) {
      violations.push(`Total bundle size ${(totalSize / 1024).toFixed(1)}KB exceeds ${(this.sizeBudgets.total / 1024).toFixed(1)}KB budget`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Get current bundle metrics
   */
  getCurrentMetrics(): BundleMetrics {
    return { ...this.metrics };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeMetrics(): BundleMetrics {
    return {
      currentBundleSize: 0,
      loadTime: 0,
      cacheHitRatio: 0,
      compressionRatio: 0,
    };
  }

  private getResourceEntries(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  private analyzeChunks(resources: PerformanceResourceTiming[]): ChunkInfo[] {
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    return jsResources.map(resource => {
      const chunkName = this.extractChunkName(resource.name);
      return {
        name: chunkName,
        size: resource.transferSize || resource.decodedBodySize || 0,
        type: this.getChunkType(chunkName),
        loadTime: resource.responseEnd - resource.responseStart,
      };
    });
  }

  private generateRecommendations(analysis: BundleAnalysis): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];

    // Size-based recommendations
    if (analysis.totalSize > this.sizeBudgets.total) {
      recommendations.push({
        type: 'size',
        priority: 'high',
        description: 'Bundle size exceeds recommended limit',
        impact: 'Improved load performance',
        implementation: 'Implement code splitting and tree shaking',
      });
    }

    // Compression recommendations
    if (analysis.gzippedSize / analysis.totalSize > 0.7) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        description: 'Poor compression ratio detected',
        impact: 'Smaller transfer size',
        implementation: 'Enable better compression or optimize assets',
      });
    }

    return recommendations;
  }

  private calculateBundleScore(analysis: BundleAnalysis): number {
    let score = 100;
    
    // Size penalties
    if (analysis.totalSize > this.sizeBudgets.total) {
      score -= 30;
    } else if (analysis.totalSize > this.sizeBudgets.total * 0.8) {
      score -= 15;
    }
    
    // Compression score
    const compressionRatio = analysis.gzippedSize / analysis.totalSize;
    if (compressionRatio > 0.4) score -= 20;
    else if (compressionRatio > 0.3) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private recordBundleMetrics(analysis: BundleAnalysis): void {
    this.metrics.currentBundleSize = analysis.totalSize;
    this.metrics.compressionRatio = analysis.gzippedSize / analysis.totalSize;
    
    performanceService.recordMetric('bundle_size', analysis.totalSize, 'bytes', 'loading');
    performanceService.recordMetric('bundle_score', analysis.score, 'score', 'loading');
  }

  private getChunkType(chunkName: string): ChunkInfo['type'] {
    if (chunkName.includes('vendor') || chunkName.includes('node_modules')) return 'vendor';
    if (chunkName.includes('main') || chunkName.includes('index')) return 'main';
    if (chunkName.includes('.css')) return 'css';
    return 'async';
  }

  private extractChunkName(url: string): string {
    const match = url.match(/\/([^\/]+)\.(js|css)$/);
    return match ? match[1] : 'unknown';
  }

  private getMainBundleSize(resources: PerformanceResourceTiming[]): number {
    const mainBundle = resources.find(r => 
      r.name.includes('main.') || r.name.includes('index.')
    );
    return mainBundle?.transferSize || 0;
  }

  private isCompressionEnabled(): boolean {
    const resources = this.getResourceEntries();
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    if (jsResources.length === 0) return false;
    
    const compressionRatio = jsResources.reduce((sum, r) => {
      const transferred = r.transferSize || 0;
      const actual = r.decodedBodySize || 0;
      return sum + (actual > 0 ? transferred / actual : 1);
    }, 0) / jsResources.length;
    
    return compressionRatio < 0.7; // Good compression
  }

  private estimateGzippedSize(totalSize: number): number {
    // Rough estimation - actual would need server integration
    return totalSize * 0.3; // Assume 70% compression
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const bundleOptimizer = new BundleOptimizerService();

export default bundleOptimizer; 