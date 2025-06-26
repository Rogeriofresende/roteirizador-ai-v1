/**
 * 📦 BUNDLE OPTIMIZATION SERVICE
 * Monitor bundle size and provide optimization suggestions
 */

import { logger } from '../utils/logger';
import { config, isDevelopment } from '../config/environment';
import { performanceService } from './performance';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  assets: AssetInfo[];
  dependencies: DependencyInfo[];
  recommendations: BundleRecommendation[];
  score: number;
}

export interface ChunkInfo {
  name: string;
  size: number;
  type: 'main' | 'vendor' | 'async' | 'css' | 'other';
  modules: string[];
  loadTime?: number;
}

export interface AssetInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
  compressed: boolean;
  cacheHit: boolean;
}

export interface DependencyInfo {
  name: string;
  size: number;
  version: string;
  treeshakeable: boolean;
  alternatives: string[];
  usage: 'high' | 'medium' | 'low' | 'unused';
}

export interface BundleRecommendation {
  type: 'size' | 'splitting' | 'lazy' | 'treeshaking' | 'compression' | 'caching';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
}

export interface BundleMetrics {
  initialBundleSize: number;
  currentBundleSize: number;
  loadTime: number;
  parseTime: number;
  executeTime: number;
  cacheHitRatio: number;
  compressionRatio: number;
}

// =============================================================================
// BUNDLE OPTIMIZATION SERVICE
// =============================================================================

class BundleOptimizationService {
  private metrics: BundleMetrics;
  private analysisCache: Map<string, BundleAnalysis> = new Map();
  private sizeBudgets = {
    main: 250 * 1024, // 250KB
    vendor: 500 * 1024, // 500KB
    async: 100 * 1024, // 100KB
    css: 50 * 1024, // 50KB
    total: 1024 * 1024, // 1MB
  };

  constructor() {
    this.metrics = this.initializeMetrics();
    this.analyzeCurrentBundle();
    
    logger.info('Bundle optimization service initialized', {
      budgets: this.sizeBudgets,
    }, 'BUNDLE_OPTIMIZER');
  }

  /**
   * Analyze current bundle
   */
  async analyzeCurrentBundle(): Promise<BundleAnalysis> {
    const cacheKey = this.generateCacheKey();
    
    // Check cache first
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    logger.debug('Starting bundle analysis', {}, 'BUNDLE_OPTIMIZER');

    const analysis: BundleAnalysis = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      assets: [],
      dependencies: [],
      recommendations: [],
      score: 0,
    };

    try {
      // Analyze resources
      const resources = this.getResourceEntries();
      analysis.assets = this.analyzeAssets(resources);
      analysis.chunks = this.analyzeChunks(resources);
      analysis.dependencies = this.analyzeDependencies();
      
      // Calculate sizes
      analysis.totalSize = analysis.assets.reduce((sum, asset) => sum + asset.size, 0);
      analysis.gzippedSize = this.estimateGzippedSize(analysis.totalSize);
      
      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);
      
      // Calculate score
      analysis.score = this.calculateBundleScore(analysis);

      // Cache the analysis
      this.analysisCache.set(cacheKey, analysis);

      // Record metrics
      this.recordBundleMetrics(analysis);

      logger.info('Bundle analysis completed', {
        totalSize: `${(analysis.totalSize / 1024).toFixed(1)}KB`,
        score: analysis.score,
        recommendations: analysis.recommendations.length,
      }, 'BUNDLE_OPTIMIZER');

    } catch (error) {
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
        effort: 'medium',
        implementation: 'Implement code splitting with React.lazy() and dynamic imports',
      });
    }

    // Check for large dependencies
    const largeDependencies = this.findLargeDependencies();
    largeDependencies.forEach(dep => {
      suggestions.push({
        type: 'treeshaking',
        priority: 'medium',
        description: `Large dependency detected: ${dep.name} (${(dep.size / 1024).toFixed(1)}KB)`,
        impact: 'Reduced bundle size',
        effort: 'low',
        implementation: `Consider tree-shaking or alternative: ${dep.alternatives.join(', ')}`,
      });
    });

    // Check compression
    if (!this.isCompressionEnabled()) {
      suggestions.push({
        type: 'compression',
        priority: 'high',
        description: 'Gzip compression not detected',
        impact: '60-80% size reduction',
        effort: 'low',
        implementation: 'Enable gzip/brotli compression on server',
      });
    }

    // Check lazy loading opportunities
    const lazyLoadCandidates = this.findLazyLoadCandidates();
    if (lazyLoadCandidates.length > 0) {
      suggestions.push({
        type: 'lazy',
        priority: 'medium',
        description: `${lazyLoadCandidates.length} components can be lazy loaded`,
        impact: 'Faster initial load',
        effort: 'medium',
        implementation: 'Use React.lazy() for route components and large modals',
      });
    }

    return suggestions;
  }

  /**
   * Monitor bundle performance in real-time
   */
  startPerformanceMonitoring(): void {
    // Monitor script loading times
    this.observeResourceTiming();
    
    // Monitor parse/execute times
    this.observeScriptTiming();
    
    // Monitor cache performance
    this.observeCachePerformance();

    logger.info('Bundle performance monitoring started', {}, 'BUNDLE_OPTIMIZER');
  }

  /**
   * Get current bundle metrics
   */
  getCurrentMetrics(): BundleMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if bundle meets performance budgets
   */
  checkPerformanceBudgets(): { passed: boolean; violations: string[] } {
    const analysis = this.analysisCache.get(this.generateCacheKey());
    const violations: string[] = [];
    
    if (!analysis) {
      return { passed: false, violations: ['Analysis not available'] };
    }

    // Check total size budget
    if (analysis.totalSize > this.sizeBudgets.total) {
      violations.push(`Total bundle size ${(analysis.totalSize / 1024).toFixed(1)}KB exceeds ${(this.sizeBudgets.total / 1024).toFixed(1)}KB budget`);
    }

    // Check chunk budgets
    analysis.chunks.forEach(chunk => {
      const budget = this.sizeBudgets[chunk.type] || this.sizeBudgets.main;
      if (chunk.size > budget) {
        violations.push(`${chunk.type} chunk ${chunk.name} (${(chunk.size / 1024).toFixed(1)}KB) exceeds ${(budget / 1024).toFixed(1)}KB budget`);
      }
    });

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Generate bundle report
   */
  generateReport(): string {
    const analysis = this.analysisCache.get(this.generateCacheKey());
    
    if (!analysis) {
      return 'Bundle analysis not available. Run analyzeCurrentBundle() first.';
    }

    const report = [
      '📦 BUNDLE OPTIMIZATION REPORT',
      '=' .repeat(50),
      '',
      `📊 Overview:`,
      `  Total Size: ${(analysis.totalSize / 1024).toFixed(1)}KB`,
      `  Gzipped: ${(analysis.gzippedSize / 1024).toFixed(1)}KB`,
      `  Score: ${analysis.score}/100`,
      '',
      `📁 Chunks (${analysis.chunks.length}):`,
      ...analysis.chunks.map(chunk => 
        `  ${chunk.name}: ${(chunk.size / 1024).toFixed(1)}KB (${chunk.type})`
      ),
      '',
      `🎯 Recommendations (${analysis.recommendations.length}):`,
      ...analysis.recommendations.map((rec, i) => 
        `  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`
      ),
      '',
      `⚡ Performance:`,
      `  Load Time: ${this.metrics.loadTime.toFixed(0)}ms`,
      `  Parse Time: ${this.metrics.parseTime.toFixed(0)}ms`,
      `  Cache Hit Ratio: ${(this.metrics.cacheHitRatio * 100).toFixed(1)}%`,
    ];

    return report.join('\n');
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initializeMetrics(): BundleMetrics {
    return {
      initialBundleSize: 0,
      currentBundleSize: 0,
      loadTime: 0,
      parseTime: 0,
      executeTime: 0,
      cacheHitRatio: 0,
      compressionRatio: 0,
    };
  }

  private generateCacheKey(): string {
    return `bundle_${config.environment}_${config.version}`;
  }

  private getResourceEntries(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  private analyzeAssets(resources: PerformanceResourceTiming[]): AssetInfo[] {
    return resources.map(resource => ({
      name: resource.name,
      size: resource.transferSize || resource.decodedBodySize || 0,
      type: this.getAssetType(resource.name),
      compressed: (resource.transferSize || 0) < (resource.decodedBodySize || 0),
      cacheHit: resource.transferSize === 0,
    }));
  }

  private analyzeChunks(resources: PerformanceResourceTiming[]): ChunkInfo[] {
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    return jsResources.map(resource => {
      const chunkName = this.extractChunkName(resource.name);
      return {
        name: chunkName,
        size: resource.transferSize || resource.decodedBodySize || 0,
        type: this.getChunkType(chunkName),
        modules: [], // Would need build-time analysis
        loadTime: resource.responseEnd - resource.responseStart,
      };
    });
  }

  private analyzeDependencies(): DependencyInfo[] {
    // This would ideally integrate with webpack-bundle-analyzer or similar
    // For now, we'll return some common large dependencies to watch for
    const knownDependencies: DependencyInfo[] = [
      {
        name: 'react',
        size: 45 * 1024,
        version: '18.x',
        treeshakeable: false,
        alternatives: ['preact', 'solid-js'],
        usage: 'high',
      },
      {
        name: 'lodash',
        size: 70 * 1024,
        version: '4.x',
        treeshakeable: true,
        alternatives: ['lodash-es', 'ramda'],
        usage: 'medium',
      },
    ];

    return knownDependencies;
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
        effort: 'medium',
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
        effort: 'low',
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
    
    // Chunk distribution
    const mainChunks = analysis.chunks.filter(c => c.type === 'main');
    if (mainChunks.length > 1 || (mainChunks[0]?.size || 0) > this.sizeBudgets.main) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private recordBundleMetrics(analysis: BundleAnalysis): void {
    this.metrics.currentBundleSize = analysis.totalSize;
    this.metrics.compressionRatio = analysis.gzippedSize / analysis.totalSize;
    
    performanceService.recordMetric('bundle_size', analysis.totalSize, 'bytes', 'loading');
    performanceService.recordMetric('bundle_score', analysis.score, 'score', 'loading');
  }

  private getAssetType(url: string): AssetInfo['type'] {
    if (url.includes('.js')) return 'js';
    if (url.includes('.css')) return 'css';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private getChunkType(chunkName: string): ChunkInfo['type'] {
    if (chunkName.includes('vendor') || chunkName.includes('node_modules')) return 'vendor';
    if (chunkName.includes('main') || chunkName.includes('index')) return 'main';
    if (chunkName.includes('.css')) return 'css';
    if (chunkName.includes('async') || chunkName.includes('lazy')) return 'async';
    return 'other';
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

  private findLargeDependencies(): DependencyInfo[] {
    return this.analyzeDependencies().filter(dep => dep.size > 50 * 1024);
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

  private findLazyLoadCandidates(): string[] {
    // This would require build-time analysis
    // For now, return some common candidates
    return [
      'UserDashboard',
      'AdminPanel',
      'Settings',
      'Help',
    ];
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          const resource = entry as PerformanceResourceTiming;
          if (resource.name.includes('.js')) {
            this.metrics.loadTime = resource.responseEnd - resource.responseStart;
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private observeScriptTiming(): void {
    // Monitor script execution time
    const scriptStartTime = performance.now();
    
    window.addEventListener('load', () => {
      this.metrics.executeTime = performance.now() - scriptStartTime;
    });
  }

  private observeCachePerformance(): void {
    const resources = this.getResourceEntries();
    const cacheHits = resources.filter(r => r.transferSize === 0).length;
    this.metrics.cacheHitRatio = resources.length > 0 ? cacheHits / resources.length : 0;
  }

  private estimateGzippedSize(totalSize: number): number {
    // Rough estimation - actual would need server integration
    return totalSize * 0.3; // Assume 70% compression
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

export const bundleOptimizationService = new BundleOptimizationService();

export default bundleOptimizationService; 