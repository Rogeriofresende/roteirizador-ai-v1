/**
 * 🧪 ADVANCED PERFORMANCE TESTS
 * Week 7 Day 5: Comprehensive performance testing for all advanced features
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ProgressiveLoadingService } from '../../services/progressiveLoadingService';
import { BackgroundProcessingService } from '../../services/backgroundProcessingService';
import { ResourceManagerService } from '../../services/resourceManagerService';
import { AdvancedNetworkOptimizer } from '../../services/advancedNetworkOptimizer';

// Mock data for testing
const generateMockData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    content: `Content for item ${i}`,
    timestamp: Date.now() + i,
    size: Math.floor(Math.random() * 1000) + 100
  }));
};

describe('Advanced Performance Tests', () => {
  beforeEach(() => {
    // Reset performance marks
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
  });

  afterEach(async () => {
    // Cleanup services
    ProgressiveLoadingService.cleanup();
    BackgroundProcessingService.cleanup();
    ResourceManagerService.cleanup();
    AdvancedNetworkOptimizer.cleanup();
  });

  describe('Progressive Loading Performance', () => {
    it('loads initial data efficiently for large datasets', async () => {
      const startTime = performance.now();
      
      const mockLoadFunction = async (page: number, pageSize: number) => {
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate network delay
        return {
          items: generateMockData(pageSize),
          totalCount: 10000
        };
      };

      ProgressiveLoadingService.initializeDataset(
        'test-dataset',
        mockLoadFunction,
        { pageSize: 50, virtualScrolling: true }
      );

      const result = await ProgressiveLoadingService.loadInitialData('test-dataset', 50);
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Performance requirements
      expect(loadTime).toBeLessThan(100); // Initial load should be fast
      expect(result.items).toHaveLength(50);
      expect(result.totalCount).toBe(10000);
    });

    it('handles virtual scrolling efficiently', async () => {
      const datasetId = 'virtual-scroll-test';
      const mockLoadFunction = async (page: number, pageSize: number) => ({
        items: generateMockData(pageSize),
        totalCount: 100000
      });

      ProgressiveLoadingService.initializeDataset(datasetId, mockLoadFunction);
      await ProgressiveLoadingService.loadInitialData(datasetId, 100);

      const startTime = performance.now();
      
      // Simulate multiple viewport updates
      for (let i = 0; i < 100; i++) {
        ProgressiveLoadingService.updateVirtualScrolling(
          datasetId,
          i * 80, // 80px item height
          600,    // container height
          80      // item height
        );
      }
      
      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Virtual scrolling should be very fast
      expect(updateTime).toBeLessThan(50); // 100 updates in < 50ms
    });

    it('manages cache efficiently', async () => {
      const datasetId = 'cache-test';
      let loadCount = 0;
      
      const mockLoadFunction = async (page: number, pageSize: number) => {
        loadCount++;
        return {
          items: generateMockData(pageSize),
          totalCount: 1000
        };
      };

      ProgressiveLoadingService.initializeDataset(datasetId, mockLoadFunction);
      
      // Load initial data
      await ProgressiveLoadingService.loadInitialData(datasetId, 20);
      const initialLoadCount = loadCount;
      
      // Load more pages
      await ProgressiveLoadingService.loadNextPage(datasetId, 20);
      await ProgressiveLoadingService.loadNextPage(datasetId, 20);
      
      // Reset and reload - should use cache
      ProgressiveLoadingService.invalidateDataset(datasetId);
      await ProgressiveLoadingService.loadInitialData(datasetId, 20);
      
      const metrics = ProgressiveLoadingService.getProgressiveLoadingMetrics();
      
      expect(loadCount).toBeGreaterThan(initialLoadCount);
      expect(metrics.datasets).toHaveLength(1);
      expect(metrics.preloaderMetrics[0].cacheHits).toBeGreaterThan(0);
    });
  });

  describe('Background Processing Performance', () => {
    it('initializes workers efficiently', async () => {
      const startTime = performance.now();
      
      const success = await BackgroundProcessingService.initialize(4);
      
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(success).toBe(true);
      expect(initTime).toBeLessThan(200); // Worker initialization should be fast
    });

    it('processes data in background without blocking', async () => {
      await BackgroundProcessingService.initialize();
      
      const largeDataset = generateMockData(1000);
      const startTime = performance.now();
      
      // This should not block the main thread
      const taskId = BackgroundProcessingService.processData(largeDataset, { priority: 'high' });
      
      const taskCreationTime = performance.now() - startTime;
      expect(taskCreationTime).toBeLessThan(10); // Task creation should be instant
      
      // Wait for task completion
      const result = await BackgroundProcessingService.waitForTask(taskId, 10000);
      
      expect(result.error).toBeUndefined();
      expect(result.result).toBeDefined();
    });

    it('handles multiple concurrent tasks efficiently', async () => {
      await BackgroundProcessingService.initialize(4);
      
      const startTime = performance.now();
      const tasks: string[] = [];
      
      // Create multiple tasks
      for (let i = 0; i < 10; i++) {
        const taskId = BackgroundProcessingService.processData(
          generateMockData(100),
          { priority: i < 5 ? 'high' : 'medium' }
        );
        tasks.push(taskId);
      }
      
      const creationTime = performance.now() - startTime;
      expect(creationTime).toBeLessThan(50); // Multiple task creation should be fast
      
      // Wait for all tasks
      const results = await Promise.allSettled(
        tasks.map(taskId => BackgroundProcessingService.waitForTask(taskId, 15000))
      );
      
      const completionTime = performance.now() - startTime;
      expect(completionTime).toBeLessThan(5000); // All tasks should complete in reasonable time
      
      const successfulTasks = results.filter(r => r.status === 'fulfilled').length;
      expect(successfulTasks).toBe(tasks.length);
      
      const metrics = BackgroundProcessingService.getMetrics();
      expect(metrics.performance.successRate).toBeGreaterThan(90);
    });

    it('handles text analysis efficiently', async () => {
      await BackgroundProcessingService.initialize();
      
      const longText = 'Lorem ipsum '.repeat(1000); // ~11KB of text
      const startTime = performance.now();
      
      const taskId = BackgroundProcessingService.analyzeText(longText, { priority: 'high' });
      const result = await BackgroundProcessingService.waitForTask(taskId, 10000);
      
      const endTime = performance.now();
      const analysisTime = endTime - startTime;
      
      expect(result.error).toBeUndefined();
      expect(result.result.wordCount).toBeGreaterThan(2000);
      expect(analysisTime).toBeLessThan(1000); // Text analysis should be fast
    });
  });

  describe('Resource Management Performance', () => {
    it('initializes resource monitoring efficiently', async () => {
      const startTime = performance.now();
      
      const success = await ResourceManagerService.initialize();
      
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(success).toBe(true);
      expect(initTime).toBeLessThan(100);
    });

    it('tracks resource usage efficiently', async () => {
      await ResourceManagerService.initialize();
      
      const startTime = performance.now();
      
      // Register many resources
      for (let i = 0; i < 1000; i++) {
        ResourceManagerService.registerResource(
          `resource-${i}`,
          'data',
          Math.floor(Math.random() * 1000),
          { priority: i % 2 === 0 ? 'high' : 'medium' }
        );
      }
      
      const registrationTime = performance.now() - startTime;
      expect(registrationTime).toBeLessThan(100); // Resource registration should be fast
      
      // Access resources
      const accessStartTime = performance.now();
      for (let i = 0; i < 100; i++) {
        ResourceManagerService.accessResource(`resource-${i}`);
      }
      
      const accessTime = performance.now() - accessStartTime;
      expect(accessTime).toBeLessThan(50); // Resource access should be very fast
      
      const metrics = ResourceManagerService.getResourceMetrics();
      expect(metrics.cache.totalResources).toBeGreaterThan(0);
    });

    it('performs cleanup efficiently', async () => {
      await ResourceManagerService.initialize();
      
      // Register resources
      for (let i = 0; i < 500; i++) {
        ResourceManagerService.registerResource(`cleanup-test-${i}`, 'data', 1000);
      }
      
      const startTime = performance.now();
      await ResourceManagerService.performCleanup();
      const endTime = performance.now();
      
      const cleanupTime = endTime - startTime;
      expect(cleanupTime).toBeLessThan(200); // Cleanup should be reasonably fast
    });

    it('lazy loads components efficiently', async () => {
      await ResourceManagerService.initialize();
      
      // Register lazy components
      ResourceManagerService.registerLazyComponent('test-component', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { component: 'MockComponent' };
      });
      
      const startTime = performance.now();
      const result = await ResourceManagerService.loadLazyComponent('test-component');
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(100);
      expect(result.component).toBe('MockComponent');
      
      // Second load should be from cache
      const cacheStartTime = performance.now();
      await ResourceManagerService.loadLazyComponent('test-component');
      const cacheEndTime = performance.now();
      
      const cacheLoadTime = cacheEndTime - cacheStartTime;
      expect(cacheLoadTime).toBeLessThan(10); // Cached load should be very fast
    });
  });

  describe('Network Optimization Performance', () => {
    it('initializes network optimizer efficiently', async () => {
      const startTime = performance.now();
      
      const success = await AdvancedNetworkOptimizer.initialize();
      
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(success).toBe(true);
      expect(initTime).toBeLessThan(150);
    });

    it('optimizes requests efficiently', async () => {
      await AdvancedNetworkOptimizer.initialize();
      
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' })
      });
      
      const startTime = performance.now();
      
      // Make multiple optimized requests
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          AdvancedNetworkOptimizer.optimizeRequest(`/api/test/${i}`, {
            method: 'GET',
            priority: 'medium'
          })
        );
      }
      
      const results = await Promise.allSettled(requests);
      const endTime = performance.now();
      
      const requestTime = endTime - startTime;
      expect(requestTime).toBeLessThan(500); // Multiple requests should be fast
      
      const successfulRequests = results.filter(r => r.status === 'fulfilled').length;
      expect(successfulRequests).toBe(5);
      
      const metrics = AdvancedNetworkOptimizer.getNetworkOptimizationMetrics();
      expect(metrics.network.totalRequests).toBeGreaterThan(0);
    });

    it('handles compression efficiently', async () => {
      await AdvancedNetworkOptimizer.initialize();
      
      const largePayload = { data: 'x'.repeat(10000) }; // 10KB payload
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ compressed: true })
      });
      
      const startTime = performance.now();
      
      await AdvancedNetworkOptimizer.optimizeRequest('/api/upload', {
        method: 'POST',
        body: largePayload,
        compression: true
      });
      
      const endTime = performance.now();
      const compressionTime = endTime - startTime;
      
      expect(compressionTime).toBeLessThan(300); // Compression should be reasonably fast
    });
  });

  describe('Integration Performance', () => {
    it('all services work together efficiently', async () => {
      const startTime = performance.now();
      
      // Initialize all services
      const [
        progressiveInit,
        backgroundInit,
        resourceInit,
        networkInit
      ] = await Promise.all([
        ProgressiveLoadingService.initializeDataset(
          'integration-test',
          async () => ({ items: generateMockData(20), totalCount: 1000 }),
          { pageSize: 20 }
        ),
        BackgroundProcessingService.initialize(),
        ResourceManagerService.initialize(),
        AdvancedNetworkOptimizer.initialize()
      ]);
      
      const initTime = performance.now() - startTime;
      expect(initTime).toBeLessThan(500); // All services should initialize quickly
      
      // Perform integrated operations
      const operationStartTime = performance.now();
      
      await Promise.all([
        ProgressiveLoadingService.loadInitialData('integration-test', 20),
        BackgroundProcessingService.processData(generateMockData(100)),
        ResourceManagerService.performCleanup()
      ]);
      
      const operationTime = performance.now() - operationStartTime;
      expect(operationTime).toBeLessThan(1000); // Integrated operations should be efficient
    });

    it('maintains performance under load', async () => {
      // Initialize services
      await Promise.all([
        BackgroundProcessingService.initialize(8),
        ResourceManagerService.initialize(),
        AdvancedNetworkOptimizer.initialize()
      ]);
      
      const startTime = performance.now();
      const operations = [];
      
      // Create load test operations
      for (let i = 0; i < 20; i++) {
        operations.push(
          BackgroundProcessingService.processData(generateMockData(50), {
            priority: i < 10 ? 'high' : 'medium'
          })
        );
      }
      
      // Wait for all operations
      const results = await Promise.allSettled(
        operations.map(taskId => BackgroundProcessingService.waitForTask(taskId, 10000))
      );
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(8000); // Load test should complete in reasonable time
      
      const successRate = results.filter(r => r.status === 'fulfilled').length / results.length;
      expect(successRate).toBeGreaterThan(0.9); // 90% success rate under load
      
      // Check memory usage
      const metrics = ResourceManagerService.getResourceMetrics();
      expect(metrics.memory.memoryUsage.percentage).toBeLessThan(0.9); // Memory should stay reasonable
    });
  });
}); 