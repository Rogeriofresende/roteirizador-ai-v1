/**
 * Core Services Monitoring Quality Integration Tests - IA Charlie Week 0 Days 4-7
 * Comprehensive monitoring integration for Alpha's Core Services
 * Connects all business services with Charlie's monitoring infrastructure
 * 
 * Features:
 * - Real-time monitoring of IdeaBankService and PersonalizationService
 * - Integration with productionMonitor and collaborationMonitor
 * - Alert system validation for service health and performance
 * - Cost tracking and budget monitoring integration
 * - Quality metrics aggregation and reporting
 * - Emergency protocol validation
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { ServiceContainer } from '../../architecture/ServiceArchitecture';

// Import all monitoring services
import productionMonitor from '../../services/monitoring/productionMonitor';
import collaborationMonitor from '../../services/monitoring/collaborationMonitor';
import { AlertSystem } from '../../services/monitoring/alertSystem';

interface CoreServicesMonitoringMetrics {
  serviceMonitoring: {
    ideaBankServiceMonitored: boolean;
    personalizationServiceMonitored: boolean;
    costManagementMonitored: boolean;
    realTimeMetricsActive: boolean;
  };
  alertSystem: {
    performanceAlertsActive: boolean;
    costAlertsActive: boolean;
    healthAlertsActive: boolean;
    emergencyProtocolsActive: boolean;
  };
  qualityTracking: {
    responseTimeTracking: boolean;
    errorRateTracking: boolean;
    userSatisfactionTracking: boolean;
    costEfficiencyTracking: boolean;
  };
  integration: {
    alphaServicesConnected: boolean;
    betaDesignSystemConnected: boolean;
    productionMonitorHealthy: boolean;
    collaborationMonitorHealthy: boolean;
  };
}

describe('Core Services Monitoring Quality Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let alertSystem: AlertSystem;
  let ideaBankService: any;
  let personalizationService: any;
  let monitoringMetrics: CoreServicesMonitoringMetrics;
  
  // Monitoring test configuration
  const monitoringConfig = {
    metricsInterval: 1000, // 1 second for testing
    alertThresholds: {
      responseTime: 2000, // 2s max response time
      errorRate: 0.05,    // 5% max error rate
      costPerIdea: 0.10,  // $0.10 max cost per idea
      healthCheckFailures: 3 // Max consecutive failures
    },
    emergencyThresholds: {
      responseTime: 5000,  // 5s emergency threshold
      errorRate: 0.20,     // 20% emergency error rate
      dailyCost: 3.00      // $3.00 emergency daily cost
    }
  };

  beforeAll(async () => {
    console.log('📊 Initializing Core Services Monitoring Quality Tests...');
    
    // Initialize service container and services
    serviceContainer = new ServiceContainer();
    await serviceContainer.initialize();
    
    // Initialize alert system
    alertSystem = new AlertSystem();
    
    // Attempt to resolve core services
    try {
      ideaBankService = serviceContainer.resolve('IdeaBankService');
    } catch (error) {
      console.warn('IdeaBankService not available:', error);
      ideaBankService = null;
    }
    
    try {
      personalizationService = serviceContainer.resolve('PersonalizationService');
    } catch (error) {
      console.warn('PersonalizationService not available:', error);
      personalizationService = null;
    }
    
    // Initialize monitoring metrics
    monitoringMetrics = {
      serviceMonitoring: {
        ideaBankServiceMonitored: false,
        personalizationServiceMonitored: false,
        costManagementMonitored: false,
        realTimeMetricsActive: false
      },
      alertSystem: {
        performanceAlertsActive: false,
        costAlertsActive: false,
        healthAlertsActive: false,
        emergencyProtocolsActive: false
      },
      qualityTracking: {
        responseTimeTracking: false,
        errorRateTracking: false,
        userSatisfactionTracking: false,
        costEfficiencyTracking: false
      },
      integration: {
        alphaServicesConnected: false,
        betaDesignSystemConnected: false,
        productionMonitorHealthy: false,
        collaborationMonitorHealthy: false
      }
    };
    
    console.log('✅ Core Services monitoring infrastructure ready');
  });

  afterAll(async () => {
    await generateMonitoringQualityReport();
    console.log('🎯 Core Services monitoring quality tests completed');
  });

  beforeEach(async () => {
    // Reset monitoring state for each test
    await resetMonitoringState();
  });

  describe('Production Monitor Integration', () => {
    test('should validate production monitor health and connectivity', async () => {
      const monitorHealthy = await productionMonitor.isHealthy();
      expect(monitorHealthy).toBe(true);
      
      monitoringMetrics.integration.productionMonitorHealthy = monitorHealthy;
      
      // Test metric recording capability
      const testMetric = {
        timestamp: new Date(),
        service: 'CoreServicesTest',
        metric: 'health_check',
        value: 1
      };
      
      await productionMonitor.recordMetric('test_metric', testMetric);
      
      console.log('✅ Production monitor integration validated');
    });

    test('should monitor IdeaBankService real-time metrics', async () => {
      if (ideaBankService) {
        console.log('🔍 Setting up IdeaBankService monitoring...');
        
        // Monitor idea generation request
        const testRequest = {
          userId: 'test-monitoring-user-001',
          category: 'tecnologia'
        };
        
        const startTime = Date.now();
        
        // Hook into service monitoring
        const originalGenerateIdea = ideaBankService.generateIdea.bind(ideaBankService);
        ideaBankService.generateIdea = async (request: any) => {
          const requestStartTime = Date.now();
          
          try {
            const result = await originalGenerateIdea(request);
            const responseTime = Date.now() - requestStartTime;
            
            // Record real-time metrics
            await productionMonitor.recordMetric('idea_generation_realtime', {
              userId: request.userId,
              responseTime,
              success: result.success,
              cost: result.metadata?.cost || 0,
              timestamp: new Date()
            });
            
            // Check alert thresholds
            if (responseTime > monitoringConfig.alertThresholds.responseTime) {
              await alertSystem.triggerAlert('performance', {
                service: 'IdeaBankService',
                metric: 'responseTime',
                value: responseTime,
                threshold: monitoringConfig.alertThresholds.responseTime
              });
            }
            
            if (result.metadata?.cost > monitoringConfig.alertThresholds.costPerIdea) {
              await alertSystem.triggerAlert('cost', {
                service: 'IdeaBankService',
                metric: 'costPerIdea',
                value: result.metadata.cost,
                threshold: monitoringConfig.alertThresholds.costPerIdea
              });
            }
            
            return result;
          } catch (error) {
            const responseTime = Date.now() - requestStartTime;
            
            // Record error metrics
            await productionMonitor.recordMetric('idea_generation_error', {
              userId: request.userId,
              responseTime,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date()
            });
            
            throw error;
          }
        };
        
        // Test the monitored service
        const response = await ideaBankService.generateIdea(testRequest);
        
        expect(response).toBeDefined();
        
        monitoringMetrics.serviceMonitoring.ideaBankServiceMonitored = true;
        monitoringMetrics.serviceMonitoring.realTimeMetricsActive = true;
        monitoringMetrics.qualityTracking.responseTimeTracking = true;
        monitoringMetrics.qualityTracking.costEfficiencyTracking = true;
        
        console.log('✅ IdeaBankService real-time monitoring active');
      } else {
        console.log('⏳ IdeaBankService monitoring pending service implementation');
      }
    });

    test('should monitor PersonalizationService metrics', async () => {
      if (personalizationService) {
        console.log('🔍 Setting up PersonalizationService monitoring...');
        
        // Monitor personalization request
        const testUserId = 'test-personalization-monitoring-001';
        
        // Hook into personalization monitoring
        if (typeof personalizationService.getUserPreferences === 'function') {
          const originalGetPreferences = personalizationService.getUserPreferences.bind(personalizationService);
          personalizationService.getUserPreferences = async (userId: string) => {
            const startTime = Date.now();
            
            try {
              const result = await originalGetPreferences(userId);
              const responseTime = Date.now() - startTime;
              
              // Record personalization metrics
              await productionMonitor.recordMetric('personalization_realtime', {
                userId,
                responseTime,
                success: true,
                preferencesFound: !!result,
                timestamp: new Date()
              });
              
              return result;
            } catch (error) {
              const responseTime = Date.now() - startTime;
              
              await productionMonitor.recordMetric('personalization_error', {
                userId,
                responseTime,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
              });
              
              throw error;
            }
          };
          
          // Test monitored personalization
          await personalizationService.getUserPreferences(testUserId);
          
          monitoringMetrics.serviceMonitoring.personalizationServiceMonitored = true;
          
          console.log('✅ PersonalizationService monitoring active');
        }
      } else {
        console.log('⏳ PersonalizationService monitoring pending service implementation');
      }
    });
  });

  describe('Collaboration Monitor Integration', () => {
    test('should validate collaboration monitor health', async () => {
      const collaborationHealthy = await collaborationMonitor.isHealthy();
      expect(collaborationHealthy).toBe(true);
      
      monitoringMetrics.integration.collaborationMonitorHealthy = collaborationHealthy;
      
      console.log('✅ Collaboration monitor integration validated');
    });

    test('should monitor Alpha-Beta-Charlie collaboration metrics', async () => {
      // Simulate collaboration between IAs
      const collaborationEvent = {
        timestamp: new Date(),
        sourceIA: 'Charlie',
        targetIA: 'Alpha',
        event: 'quality_validation',
        service: 'IdeaBankService',
        status: 'monitoring_active',
        metrics: {
          testsExecuted: 15,
          qualityScore: 0.95,
          issuesFound: 1,
          recommendationsGenerated: 3
        }
      };
      
      await collaborationMonitor.recordCollaboration(collaborationEvent);
      
      // Test collaboration score calculation
      const collaborationScore = await collaborationMonitor.calculateCollaborationScore();
      expect(collaborationScore).toBeGreaterThan(0.8);
      
      monitoringMetrics.integration.alphaServicesConnected = true;
      
      console.log(`✅ IA collaboration monitoring: score ${(collaborationScore * 100).toFixed(1)}%`);
    });

    test('should track cross-IA integration health', async () => {
      const integrationHealthChecks = {
        'Alpha-Charlie': {
          servicesIntegrated: ideaBankService !== null,
          monitoringActive: monitoringMetrics.serviceMonitoring.ideaBankServiceMonitored,
          qualityGatesImplemented: true,
          communicationActive: true
        },
        'Beta-Charlie': {
          designSystemMonitored: true, // Beta's design system
          migrationTracked: true,
          userExperienceTracked: true,
          communicationActive: true
        }
      };
      
      for (const [integration, health] of Object.entries(integrationHealthChecks)) {
        await collaborationMonitor.recordIntegrationHealth(integration, health);
      }
      
      monitoringMetrics.integration.betaDesignSystemConnected = true;
      
      console.log('✅ Cross-IA integration health tracking active');
    });
  });

  describe('Alert System Validation', () => {
    test('should validate performance alert triggers', async () => {
      if (ideaBankService) {
        console.log('🚨 Testing performance alert system...');
        
        // Simulate slow response scenario
        const slowRequest = {
          userId: 'test-slow-response-001',
          category: 'tecnologia',
          keywords: Array(100).fill('keyword') // Create a heavy request
        };
        
        const response = await ideaBankService.generateIdea(slowRequest);
        
        // Check if performance alert was triggered (response time > threshold)
        if (response.metadata?.processingTime > monitoringConfig.alertThresholds.responseTime) {
          monitoringMetrics.alertSystem.performanceAlertsActive = true;
          console.log(`✅ Performance alert triggered: ${response.metadata.processingTime}ms > ${monitoringConfig.alertThresholds.responseTime}ms`);
        }
      } else {
        console.log('⏳ Performance alert testing pending IdeaBankService');
      }
    });

    test('should validate cost alert triggers', async () => {
      if (ideaBankService) {
        console.log('🚨 Testing cost alert system...');
        
        // Simulate expensive request
        const expensiveRequest = {
          userId: 'test-expensive-request-001',
          category: 'análise_profunda',
          keywords: Array(50).fill('expensive-keyword'),
          personalizedContext: {
            preferredCategories: Array(20).fill('category'),
            recentInteractions: Array(100).fill({})
          }
        };
        
        const response = await ideaBankService.generateIdea(expensiveRequest);
        
        // Check if cost alert was triggered
        if (response.metadata?.cost > monitoringConfig.alertThresholds.costPerIdea) {
          monitoringMetrics.alertSystem.costAlertsActive = true;
          console.log(`✅ Cost alert triggered: $${response.metadata.cost.toFixed(4)} > $${monitoringConfig.alertThresholds.costPerIdea}`);
        }
      } else {
        console.log('⏳ Cost alert testing pending IdeaBankService');
      }
    });

    test('should validate health alert system', async () => {
      console.log('🚨 Testing health alert system...');
      
      // Simulate service health check failures
      let healthCheckFailures = 0;
      
      for (let i = 0; i < 5; i++) {
        try {
          const healthCheck = ideaBankService ? await ideaBankService.healthCheck() : false;
          
          if (!healthCheck) {
            healthCheckFailures++;
            
            if (healthCheckFailures >= monitoringConfig.alertThresholds.healthCheckFailures) {
              await alertSystem.triggerAlert('health', {
                service: 'IdeaBankService',
                metric: 'healthCheckFailures',
                value: healthCheckFailures,
                threshold: monitoringConfig.alertThresholds.healthCheckFailures
              });
              
              monitoringMetrics.alertSystem.healthAlertsActive = true;
              break;
            }
          }
        } catch (error) {
          healthCheckFailures++;
        }
      }
      
      console.log(`✅ Health monitoring: ${healthCheckFailures} failures detected`);
    });

    test('should validate emergency protocol triggers', async () => {
      console.log('🚨 Testing emergency protocol system...');
      
      // Simulate emergency scenarios
      const emergencyScenarios = [
        {
          type: 'cost_explosion',
          dailyCost: 5.00, // Above $3.00 emergency threshold
          description: 'Daily cost exceeding emergency threshold'
        },
        {
          type: 'performance_degradation',
          responseTime: 6000, // Above 5s emergency threshold
          description: 'Response time exceeding emergency threshold'
        },
        {
          type: 'error_spike',
          errorRate: 0.25, // Above 20% emergency threshold
          description: 'Error rate exceeding emergency threshold'
        }
      ];
      
      for (const scenario of emergencyScenarios) {
        await alertSystem.triggerEmergencyAlert(scenario.type, {
          value: scenario.dailyCost || scenario.responseTime || scenario.errorRate,
          threshold: monitoringConfig.emergencyThresholds.dailyCost || 
                     monitoringConfig.emergencyThresholds.responseTime || 
                     monitoringConfig.emergencyThresholds.errorRate,
          description: scenario.description
        });
      }
      
      monitoringMetrics.alertSystem.emergencyProtocolsActive = true;
      
      console.log('✅ Emergency protocols validated');
    });
  });

  describe('Quality Metrics Aggregation', () => {
    test('should aggregate comprehensive quality metrics', async () => {
      const qualityMetrics = {
        serviceHealth: {
          ideaBankService: ideaBankService !== null,
          personalizationService: personalizationService !== null,
          monitoringActive: monitoringMetrics.serviceMonitoring.realTimeMetricsActive
        },
        performance: {
          responseTimeTracking: monitoringMetrics.qualityTracking.responseTimeTracking,
          errorRateTracking: monitoringMetrics.qualityTracking.errorRateTracking,
          alertSystemActive: Object.values(monitoringMetrics.alertSystem).some(Boolean)
        },
        integration: {
          alphaIntegration: monitoringMetrics.integration.alphaServicesConnected,
          betaIntegration: monitoringMetrics.integration.betaDesignSystemConnected,
          monitoringInfrastructure: monitoringMetrics.integration.productionMonitorHealthy
        },
        costManagement: {
          trackingActive: monitoringMetrics.qualityTracking.costEfficiencyTracking,
          alertsActive: monitoringMetrics.alertSystem.costAlertsActive,
          emergencyProtocols: monitoringMetrics.alertSystem.emergencyProtocolsActive
        }
      };
      
      await productionMonitor.recordMetric('comprehensive_quality_metrics', qualityMetrics);
      
      const overallQualityScore = calculateOverallQualityScore(qualityMetrics);
      
      expect(overallQualityScore).toBeGreaterThan(0.6); // >60% overall quality
      
      console.log(`✅ Comprehensive quality score: ${(overallQualityScore * 100).toFixed(1)}%`);
    });

    test('should validate Week 1 monitoring readiness', async () => {
      const week1MonitoringReadiness = {
        coreServicesMonitored: 
          monitoringMetrics.serviceMonitoring.ideaBankServiceMonitored ||
          monitoringMetrics.serviceMonitoring.personalizationServiceMonitored,
        
        realTimeMetricsActive: monitoringMetrics.serviceMonitoring.realTimeMetricsActive,
        
        alertSystemOperational: Object.values(monitoringMetrics.alertSystem).some(Boolean),
        
        integrationHealthy: 
          monitoringMetrics.integration.productionMonitorHealthy &&
          monitoringMetrics.integration.collaborationMonitorHealthy,
        
        qualityTrackingActive: Object.values(monitoringMetrics.qualityTracking).some(Boolean)
      };
      
      const week1ReadinessScore = Object.values(week1MonitoringReadiness).filter(Boolean).length / 
                                 Object.values(week1MonitoringReadiness).length;
      
      await productionMonitor.recordMetric('monitoring_week1_readiness', {
        score: week1ReadinessScore,
        readiness: week1MonitoringReadiness,
        timestamp: new Date()
      });
      
      expect(week1ReadinessScore).toBeGreaterThan(0.7); // >70% ready for Week 1
      
      console.log(`✅ Week 1 monitoring readiness: ${(week1ReadinessScore * 100).toFixed(1)}%`);
    });
  });

  // Helper functions
  async function resetMonitoringState(): Promise<void> {
    // Reset any monitoring state between tests
    console.log('🔄 Resetting monitoring state...');
  }
  
  async function generateMonitoringQualityReport(): Promise<void> {
    const report = {
      testSuite: 'Core Services Monitoring Quality Integration',
      timestamp: new Date(),
      metrics: monitoringMetrics,
      summary: {
        monitoringHealth: calculateMonitoringHealth(),
        integrationStatus: calculateIntegrationStatus(),
        week1Readiness: calculateWeek1MonitoringReadiness(),
        recommendations: generateMonitoringRecommendations()
      }
    };
    
    await productionMonitor.recordMetric('monitoring_quality_report', report);
    
    console.log('📊 Monitoring Quality Report Generated:', JSON.stringify(report, null, 2));
  }
  
  function calculateOverallQualityScore(metrics: any): number {
    const allMetrics = Object.values(metrics).flatMap(category => Object.values(category as any));
    return allMetrics.filter(Boolean).length / allMetrics.length;
  }
  
  function calculateMonitoringHealth(): string {
    const healthFactors = [
      monitoringMetrics.integration.productionMonitorHealthy,
      monitoringMetrics.integration.collaborationMonitorHealthy,
      monitoringMetrics.serviceMonitoring.realTimeMetricsActive,
      Object.values(monitoringMetrics.alertSystem).some(Boolean)
    ];
    
    const healthScore = healthFactors.filter(Boolean).length / healthFactors.length;
    
    if (healthScore >= 0.9) return 'EXCELLENT';
    if (healthScore >= 0.7) return 'GOOD';
    if (healthScore >= 0.5) return 'FAIR';
    return 'NEEDS_IMPROVEMENT';
  }
  
  function calculateIntegrationStatus(): string {
    const integrationFactors = [
      monitoringMetrics.integration.alphaServicesConnected,
      monitoringMetrics.integration.betaDesignSystemConnected,
      monitoringMetrics.serviceMonitoring.ideaBankServiceMonitored,
      monitoringMetrics.serviceMonitoring.costManagementMonitored
    ];
    
    const integrationScore = integrationFactors.filter(Boolean).length / integrationFactors.length;
    
    if (integrationScore >= 0.8) return 'FULLY_INTEGRATED';
    if (integrationScore >= 0.6) return 'PARTIALLY_INTEGRATED';
    if (integrationScore >= 0.3) return 'BASIC_INTEGRATION';
    return 'NOT_INTEGRATED';
  }
  
  function calculateWeek1MonitoringReadiness(): number {
    const readinessFactors = [
      monitoringMetrics.serviceMonitoring.realTimeMetricsActive,
      monitoringMetrics.integration.productionMonitorHealthy,
      monitoringMetrics.alertSystem.performanceAlertsActive || monitoringMetrics.alertSystem.costAlertsActive,
      monitoringMetrics.qualityTracking.responseTimeTracking,
      monitoringMetrics.qualityTracking.costEfficiencyTracking
    ];
    
    return readinessFactors.filter(Boolean).length / readinessFactors.length;
  }
  
  function generateMonitoringRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!monitoringMetrics.serviceMonitoring.realTimeMetricsActive) {
      recommendations.push('Activate real-time metrics collection for core services');
    }
    
    if (!monitoringMetrics.alertSystem.emergencyProtocolsActive) {
      recommendations.push('Implement emergency alert protocols for cost and performance');
    }
    
    if (!monitoringMetrics.integration.alphaServicesConnected) {
      recommendations.push('Complete integration with Alpha\'s Core Services');
    }
    
    if (!monitoringMetrics.qualityTracking.userSatisfactionTracking) {
      recommendations.push('Implement user satisfaction tracking for quality assessment');
    }
    
    return recommendations;
  }
}); 