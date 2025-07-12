/**
 * 🔍 LOAD TESTING IMPLEMENTATION
 * Week 7 Day 5: Load testing for scalability validation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ProgressiveLoadingService } from '../../services/progressiveLoadingService';
import { BackgroundProcessingService } from '../../services/backgroundProcessingService';
import { ResourceManagerService } from '../../services/resourceManagerService';

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  throughput: number; // requests per second
  memoryUsage: number;
  errorRate: number;
}

class LoadTestRunner {
  private results: LoadTestResult[] = [];

  async runLoadTest(
    testName: string,
    concurrency: number,
    duration: number, // seconds
    requestFn: () => Promise<any>
  ): Promise<LoadTestResult> {
    console.log(`🔍 Starting load test: ${testName} (${concurrency} concurrent, ${duration}s)`);
    
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    const responseTimes: number[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalRequests = 0;

    const workers: Promise<void>[] = [];

    // Create concurrent workers
    for (let i = 0; i < concurrency; i++) {
      const worker = this.createWorker(requestFn, endTime, (success, responseTime) => {
        totalRequests++;
        if (success) {
          successfulRequests++;
          responseTimes.push(responseTime);
        } else {
          failedRequests++;
        }
      });
      workers.push(worker);
    }

    // Wait for all workers to complete
    await Promise.allSettled(workers);

    const actualDuration = (Date.now() - startTime) / 1000;
    const throughput = successfulRequests / actualDuration;
    
    // Calculate response time percentiles
    responseTimes.sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95ResponseTime = responseTimes[p95Index] || 0;

    const result: LoadTestResult = {
      totalRequests,
      successfulRequests,
      failedRequests,
      avgResponseTime: avgResponseTime || 0,
      p95ResponseTime,
      throughput,
      memoryUsage: this.getMemoryUsage(),
      errorRate: totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0
    };

    this.results.push(result);
    
    console.log(`✅ Load test completed: ${testName}`, {
      throughput: `${throughput.toFixed(2)} req/s`,
      errorRate: `${result.errorRate.toFixed(2)}%`,
      avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
      p95ResponseTime: `${p95ResponseTime.toFixed(2)}ms`
    });

    return result;
  }

  private async createWorker(
    requestFn: () => Promise<any>,
    endTime: number,
    onResult: (success: boolean, responseTime: number) => void
  ): Promise<void> {
    while (Date.now() < endTime) {
      const requestStart = Date.now();
      
      try {
        await requestFn();
        const responseTime = Date.now() - requestStart;
        onResult(true, responseTime);
      } catch (error) {
        const responseTime = Date.now() - requestStart;
        onResult(false, responseTime);
      }

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024; // MB
    }
    
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    return 0;
  }

  getResults(): LoadTestResult[] {
    return [...this.results];
  }

  generateReport(): string {
    if (this.results.length === 0) {
      return 'No load test results available';
    }

    const report = this.results.map((result, index) => {
      return `
Load Test ${index + 1}:
- Total Requests: ${result.totalRequests}
- Successful: ${result.successfulRequests}
- Failed: ${result.failedRequests}
- Throughput: ${result.throughput.toFixed(2)} req/s
- Avg Response Time: ${result.avgResponseTime.toFixed(2)}ms
- P95 Response Time: ${result.p95ResponseTime.toFixed(2)}ms
- Error Rate: ${result.errorRate.toFixed(2)}%
- Memory Usage: ${result.memoryUsage.toFixed(2)}MB
      `.trim();
    }).join('\n\n');

    return report;
  }
}

describe('Load Testing', () => {
  let loadTestRunner: LoadTestRunner;

  beforeEach(() => {
    loadTestRunner = new LoadTestRunner();
  });

  afterEach(() => {
    ProgressiveLoadingService.cleanup();
    BackgroundProcessingService.cleanup();
    ResourceManagerService.cleanup();
  });

  describe('Progressive Loading Load Tests', () => {
    it('handles high concurrent progressive loading', async () => {
      let requestCount = 0;
      const mockLoadFunction = async (page: number, pageSize: number) => {
        requestCount++;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
        return {
          items: Array.from({ length: pageSize }, (_, i) => ({ id: page * pageSize + i })),
          totalCount: 10000
        };
      };

      ProgressiveLoadingService.initializeDataset('load-test', mockLoadFunction);

      const result = await loadTestRunner.runLoadTest(
        'Progressive Loading High Concurrency',
        10, // 10 concurrent users
        5,  // 5 seconds
        async () => {
          await ProgressiveLoadingService.loadInitialData('load-test', 20);
          return { success: true };
        }
      );

      // Performance requirements
      expect(result.errorRate).toBeLessThan(5); // Less than 5% error rate
      expect(result.throughput).toBeGreaterThan(5); // At least 5 req/s
      expect(result.avgResponseTime).toBeLessThan(200); // Average < 200ms
      expect(result.p95ResponseTime).toBeLessThan(500); // P95 < 500ms
    });

    it('handles massive dataset loading', async () => {
      const mockLoadFunction = async (page: number, pageSize: number) => {
        // Simulate loading large datasets
        await new Promise(resolve => setTimeout(resolve, 30));
        return {
          items: Array.from({ length: pageSize }, (_, i) => ({
            id: page * pageSize + i,
            data: 'x'.repeat(1000) // 1KB per item
          })),
          totalCount: 100000 // 100k items
        };
      };

      ProgressiveLoadingService.initializeDataset('massive-dataset', mockLoadFunction, {
        pageSize: 100,
        virtualScrolling: true
      });

      const result = await loadTestRunner.runLoadTest(
        'Massive Dataset Loading',
        5,  // 5 concurrent users
        10, // 10 seconds
        async () => {
          await ProgressiveLoadingService.loadInitialData('massive-dataset', 100);
          await ProgressiveLoadingService.loadNextPage('massive-dataset', 100);
          return { success: true };
        }
      );

      expect(result.errorRate).toBeLessThan(10);
      expect(result.memoryUsage).toBeLessThan(200); // Memory usage under 200MB
    });
  });

  describe('Background Processing Load Tests', () => {
    it('handles high volume background processing', async () => {
      await BackgroundProcessingService.initialize(8); // 8 workers

      const result = await loadTestRunner.runLoadTest(
        'Background Processing High Volume',
        15, // 15 concurrent task creators
        8,  // 8 seconds
        async () => {
          const data = Array.from({ length: 100 }, (_, i) => ({ 
            id: i, 
            value: Math.random() * 1000 
          }));
          
          const taskId = BackgroundProcessingService.processData(data, { priority: 'medium' });
          await BackgroundProcessingService.waitForTask( 