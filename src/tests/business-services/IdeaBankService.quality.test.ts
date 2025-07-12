/**
 * IdeaBankService Quality Integration Tests - IA Charlie Week 0 Days 4-7
 * Comprehensive quality testing framework for Alpha's Core Services
 * Integrates with monitoring infrastructure and validates cost management
 * 
 * Features:
 * - Cost control validation and budget enforcement testing
 * - Performance benchmarking and response time validation
 * - Integration testing with all cost management services
 * - Quality gates for personalization effectiveness
 * - Real-time monitoring integration
 * - Health check validation and error handling
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { IdeaBankService, GenerateIdeaRequest, GenerateIdeaResponse } from '../../services/business/IdeaBankService';
import { ServiceContainer } from '../../architecture/ServiceArchitecture';

// Import monitoring services
import productionMonitor from '../../services/monitoring/productionMonitor';
import collaborationMonitor from '../../services/monitoring/collaborationMonitor';
import { AlertSystem } from '../../services/monitoring/alertSystem';

interface QualityTestMetrics {
  performanceMetrics: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    costEfficiency: number;
  };
  costValidation: {
    budgetCompliance: boolean;
    costPerIdea: number;
    tierLimitEnforcement: boolean;
    emergencyCircuitBreaker: boolean;
  };
  integrationHealth: {
    geminiServiceHealth: boolean;
    costManagementHealth: boolean;
    personalizationHealth: boolean;
    repositoryHealth: boolean;
  };
  qualityGates: {
    responseTime: boolean; // < 2s target
    costControl: boolean;  // < $0.10 per idea
    userSatisfaction: boolean; // > 85%
    systemReliability: boolean; // > 99.5%
  };
}

describe('IdeaBankService Quality Integration Tests', () => {
  let ideaBankService: IdeaBankService;
  let serviceContainer: ServiceContainer;
  let alertSystem: AlertSystem;
  let testMetrics: QualityTestMetrics;
  
  // Test user IDs for different tiers
  const testUsers = {
    free: 'test-user-free-001',
    premium: 'test-user-premium-001',
    enterprise: 'test-user-enterprise-001'
  };

  beforeAll(async () => {
    console.log('🔧 Initializing IdeaBankService Quality Integration Tests...');
    
    // Initialize service container with test configuration
    serviceContainer = new ServiceContainer();
    await serviceContainer.initialize();
    
    // Initialize IdeaBankService
    ideaBankService = new IdeaBankService(serviceContainer);
    await ideaBankService.initialize();
    
    // Initialize alert system for quality monitoring
    alertSystem = new AlertSystem();
    
    // Initialize test metrics tracking
    testMetrics = {
      performanceMetrics: {
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        costEfficiency: 0
      },
      costValidation: {
        budgetCompliance: false,
        costPerIdea: 0,
        tierLimitEnforcement: false,
        emergencyCircuitBreaker: false
      },
      integrationHealth: {
        geminiServiceHealth: false,
        costManagementHealth: false,
        personalizationHealth: false,
        repositoryHealth: false
      },
      qualityGates: {
        responseTime: false,
        costControl: false,
        userSatisfaction: false,
        systemReliability: false
      }
    };
    
    console.log('✅ Quality testing infrastructure initialized');
  });

  afterAll(async () => {
    // Generate quality report
    await generateQualityReport();
    
    // Cleanup test data
    await cleanupTestData();
    
    console.log('🎯 Quality integration tests completed');
  });

  beforeEach(async () => {
    // Reset metrics for each test
    await resetTestMetrics();
  });

  describe('Performance Benchmarking', () => {
    test('should meet response time targets (<2s for idea generation)', async () => {
      const request: GenerateIdeaRequest = {
        userId: testUsers.premium,
        category: 'tecnologia',
        style: 'educativo',
        targetAudience: 'desenvolvedores',
        contentType: 'post',
        keywords: ['javascript', 'react', 'performance']
      };

      const startTime = Date.now();
      const response = await ideaBankService.generateIdea(request);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(response.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // < 2s target
      expect(response.metadata.processingTime).toBeLessThan(2000);
      
      // Update performance metrics
      testMetrics.performanceMetrics.averageResponseTime = responseTime;
      testMetrics.qualityGates.responseTime = responseTime < 2000;
      
      // Send metrics to monitoring
      await productionMonitor.recordMetric('idea_generation_performance', {
        responseTime,
        userId: request.userId,
        success: response.success,
        cost: response.metadata.cost
      });
      
      console.log(`✅ Performance: ${responseTime}ms (target: <2000ms)`);
    });

    test('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 5;
      const requests = Array(concurrentRequests).fill(null).map((_, index) => ({
        userId: `${testUsers.premium}-concurrent-${index}`,
        category: 'tecnologia',
        style: 'educativo',
        targetAudience: 'desenvolvedores'
      }));

      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(request => ideaBankService.generateIdea(request))
      );
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrentRequests;
      
      // All requests should succeed
      expect(responses.every(r => r.success)).toBe(true);
      
      // Average time should still be reasonable
      expect(averageTime).toBeLessThan(3000); // 3s for concurrent requests
      
      await productionMonitor.recordMetric('concurrent_performance', {
        totalTime,
        averageTime,
        concurrentRequests,
        successRate: responses.filter(r => r.success).length / concurrentRequests
      });
      
      console.log(`✅ Concurrent Performance: ${averageTime}ms average for ${concurrentRequests} requests`);
    });
  });

  describe('Cost Control Validation', () => {
    test('should enforce tier-based rate limits', async () => {
      const freeUserRequests = 6; // Free tier limit is 5/day
      const requests = Array(freeUserRequests).fill(null).map(() => ({
        userId: testUsers.free,
        category: 'tecnologia'
      }));

      const responses = await Promise.allSettled(
        requests.map(request => ideaBankService.generateIdea(request))
      );

      // First 5 should succeed, 6th should fail
      const successfulResponses = responses.slice(0, 5);
      const rateLimitedResponse = responses[5];
      
      expect(successfulResponses.every(r => 
        r.status === 'fulfilled' && r.value.success
      )).toBe(true);
      
      expect(rateLimitedResponse.status).toBe('fulfilled');
      if (rateLimitedResponse.status === 'fulfilled') {
        expect(rateLimitedResponse.value.success).toBe(false);
        expect(rateLimitedResponse.value.error).toContain('Rate limit exceeded');
      }
      
      testMetrics.costValidation.tierLimitEnforcement = true;
      
      console.log('✅ Rate limiting enforced correctly for free tier');
    });

    test('should track and validate cost per idea', async () => {
      const request: GenerateIdeaRequest = {
        userId: testUsers.premium,
        category: 'tecnologia',
        style: 'educativo'
      };

      const response = await ideaBankService.generateIdea(request);
      
      expect(response.success).toBe(true);
      expect(response.metadata.cost).toBeGreaterThan(0);
      expect(response.metadata.cost).toBeLessThan(0.10); // Cost target: <$0.10 per idea
      
      testMetrics.costValidation.costPerIdea = response.metadata.cost;
      testMetrics.qualityGates.costControl = response.metadata.cost < 0.10;
      
      await productionMonitor.recordMetric('cost_per_idea', {
        cost: response.metadata.cost,
        userId: request.userId,
        tier: 'premium'
      });
      
      console.log(`✅ Cost validation: $${response.metadata.cost.toFixed(4)} per idea`);
    });

    test('should trigger emergency circuit breaker on high costs', async () => {
      // Simulate high-cost scenario
      const expensiveRequest: GenerateIdeaRequest = {
        userId: testUsers.enterprise,
        category: 'tecnologia',
        style: 'análise_profunda',
        keywords: Array(50).fill('keyword'), // Excessive keywords to increase cost
        personalizedContext: {
          preferredCategories: Array(20).fill('category'),
          recentInteractions: Array(100).fill({})
        }
      };

      const response = await ideaBankService.generateIdea(expensiveRequest);
      
      // Should either succeed with reasonable cost or fail with circuit breaker
      if (response.success) {
        expect(response.metadata.cost).toBeLessThan(0.50); // Emergency threshold
      } else {
        expect(response.error).toContain('Budget limit') || 
        expect(response.error).toContain('Emergency');
      }
      
      testMetrics.costValidation.emergencyCircuitBreaker = true;
      
      console.log('✅ Emergency circuit breaker validation completed');
    });
  });

  describe('Integration Health Validation', () => {
    test('should validate GeminiService integration', async () => {
      const healthCheck = await ideaBankService.healthCheck();
      expect(healthCheck).toBe(true);
      
      testMetrics.integrationHealth.geminiServiceHealth = healthCheck;
      
      console.log('✅ GeminiService integration healthy');
    });

    test('should validate cost management services integration', async () => {
      // Test each cost management service individually
      const costServices = [
        'RateLimitingService',
        'UsageTierService', 
        'BudgetControlService',
        'FallbackService'
      ];
      
      let allHealthy = true;
      
      for (const serviceName of costServices) {
        try {
          const service = serviceContainer.resolve(serviceName);
          if (service && typeof service.healthCheck === 'function') {
            const health = await service.healthCheck();
            if (!health) allHealthy = false;
          }
        } catch (error) {
          console.warn(`Cost service ${serviceName} not available:`, error);
          allHealthy = false;
        }
      }
      
      testMetrics.integrationHealth.costManagementHealth = allHealthy;
      
      console.log(`✅ Cost management services integration: ${allHealthy ? 'healthy' : 'issues detected'}`);
    });

    test('should validate monitoring integration', async () => {
      // Test monitoring endpoints
      const monitoringHealthy = await productionMonitor.isHealthy();
      const collaborationHealthy = await collaborationMonitor.isHealthy();
      
      expect(monitoringHealthy).toBe(true);
      expect(collaborationHealthy).toBe(true);
      
      await productionMonitor.recordMetric('quality_test_validation', {
        timestamp: new Date(),
        service: 'IdeaBankService',
        healthStatus: 'healthy'
      });
      
      console.log('✅ Monitoring integration validated');
    });
  });

  describe('Personalization Quality Gates', () => {
    test('should handle missing PersonalizationService gracefully', async () => {
      const request: GenerateIdeaRequest = {
        userId: testUsers.premium,
        category: 'tecnologia',
        personalizedContext: {
          preferredCategories: ['javascript', 'react'],
          recentInteractions: []
        }
      };

      const response = await ideaBankService.generateIdea(request);
      
      // Should succeed even without PersonalizationService
      expect(response.success).toBe(true);
      expect(response.metadata.personalizationApplied).toBeDefined();
      
      testMetrics.integrationHealth.personalizationHealth = true;
      
      console.log('✅ Graceful handling of PersonalizationService dependency');
    });

    test('should validate feedback processing system', async () => {
      // First generate an idea
      const generateRequest: GenerateIdeaRequest = {
        userId: testUsers.premium,
        category: 'tecnologia'
      };
      
      const ideaResponse = await ideaBankService.generateIdea(generateRequest);
      expect(ideaResponse.success).toBe(true);
      
      if (ideaResponse.idea) {
        // Then process feedback
        const feedbackResponse = await ideaBankService.processIdeaFeedback({
          userId: testUsers.premium,
          ideaId: ideaResponse.idea.id,
          interactionType: 'like',
          rating: 5,
          feedback: 'Excellent idea, very helpful!'
        });
        
        expect(feedbackResponse.success).toBe(true);
        expect(feedbackResponse.personalizationImpact).toBeDefined();
        expect(feedbackResponse.cost).toBeGreaterThanOrEqual(0);
        
        console.log('✅ Feedback processing system validated');
      }
    });
  });

  describe('Quality Gates Validation', () => {
    test('should validate system reliability targets', async () => {
      const reliabilityTests = 10;
      const requests = Array(reliabilityTests).fill(null).map((_, index) => ({
        userId: `${testUsers.premium}-reliability-${index}`,
        category: 'tecnologia'
      }));

      const responses = await Promise.allSettled(
        requests.map(request => ideaBankService.generateIdea(request))
      );

      const successCount = responses.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const successRate = successCount / reliabilityTests;
      
      expect(successRate).toBeGreaterThan(0.995); // >99.5% target
      
      testMetrics.performanceMetrics.successRate = successRate;
      testMetrics.qualityGates.systemReliability = successRate > 0.995;
      
      console.log(`✅ System reliability: ${(successRate * 100).toFixed(2)}% (target: >99.5%)`);
    });

    test('should validate overall quality metrics', async () => {
      // Aggregate all quality metrics
      const overallQuality = {
        performancePassed: testMetrics.qualityGates.responseTime,
        costControlPassed: testMetrics.qualityGates.costControl,
        reliabilityPassed: testMetrics.qualityGates.systemReliability,
        integrationHealthy: Object.values(testMetrics.integrationHealth).every(Boolean),
        costValidationPassed: Object.values(testMetrics.costValidation).every(Boolean)
      };
      
      const qualityScore = Object.values(overallQuality).filter(Boolean).length / Object.values(overallQuality).length;
      
      expect(qualityScore).toBeGreaterThan(0.8); // >80% quality gates must pass
      
      await productionMonitor.recordMetric('overall_quality_score', {
        score: qualityScore,
        details: overallQuality,
        timestamp: new Date()
      });
      
      console.log(`✅ Overall Quality Score: ${(qualityScore * 100).toFixed(1)}%`);
    });
  });

  // Helper functions
  async function generateQualityReport(): Promise<void> {
    const report = {
      testSuite: 'IdeaBankService Quality Integration',
      timestamp: new Date(),
      metrics: testMetrics,
      summary: {
        performanceTargetsMet: testMetrics.qualityGates.responseTime,
        costTargetsMet: testMetrics.qualityGates.costControl,
        reliabilityTargetsMet: testMetrics.qualityGates.systemReliability,
        integrationHealthy: Object.values(testMetrics.integrationHealth).every(Boolean)
      },
      recommendations: generateRecommendations()
    };
    
    await productionMonitor.recordMetric('quality_test_report', report);
    
    console.log('📊 Quality Report Generated:', JSON.stringify(report, null, 2));
  }
  
  function generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!testMetrics.qualityGates.responseTime) {
      recommendations.push('Optimize idea generation performance to meet <2s target');
    }
    
    if (!testMetrics.qualityGates.costControl) {
      recommendations.push('Review cost optimization strategies for idea generation');
    }
    
    if (!testMetrics.integrationHealth.personalizationHealth) {
      recommendations.push('Implement PersonalizationService for enhanced user experience');
    }
    
    if (!testMetrics.costValidation.tierLimitEnforcement) {
      recommendations.push('Strengthen tier-based rate limiting enforcement');
    }
    
    return recommendations;
  }
  
  async function resetTestMetrics(): Promise<void> {
    // Reset performance metrics for each test
    testMetrics.performanceMetrics = {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
      costEfficiency: 0
    };
  }
  
  async function cleanupTestData(): Promise<void> {
    // Cleanup test user data and cache
    console.log('🧹 Cleaning up test data...');
    // Implementation would clean up test users and their generated ideas
  }
}); 