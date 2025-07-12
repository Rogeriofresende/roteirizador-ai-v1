/**
 * DI Container Advanced Testing Suite - IA Charlie Week 0 Days 5-6
 * Advanced validation of Alpha's Dependency Injection Container implementation
 * Focus on performance, memory management, circular dependencies, and service lifecycle
 * 
 * Features:
 * - Performance testing under high load
 * - Memory usage optimization validation
 * - Circular dependency detection and resolution
 * - Service lifecycle management testing
 * - Concurrent service resolution validation
 * - Error handling and recovery testing
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { ServiceContainer, ServiceFactory } from '../../architecture/ServiceArchitecture';

// Import monitoring for performance tracking
import productionMonitor from '../../services/monitoring/productionMonitor';

interface DIContainerAdvancedMetrics {
  performance: {
    registrationTime: number;
    resolutionTime: number;
    concurrentResolutionTime: number;
    memoryUsage: number;
    memoryLeaks: boolean;
  };
  reliability: {
    circularDependencyHandling: boolean;
    errorRecovery: boolean;
    serviceLifecycleManagement: boolean;
    concurrentSafety: boolean;
  };
  scalability: {
    maxServicesSupported: number;
    performanceDegradation: number;
    memoryGrowthRate: number;
    resolutionTimeGrowth: number;
  };
  integration: {
    alphaServicesSupport: boolean;
    betaServicesSupport: boolean;
    charlieServicesSupport: boolean;
    crossServiceDependencies: boolean;
  };
}

describe('DI Container Advanced Testing Suite', () => {
  let serviceContainer: ServiceContainer;
  let serviceFactory: ServiceFactory;
  let advancedMetrics: DIContainerAdvancedMetrics;
  
  // Test configuration
  const testConfig = {
    maxServices: 100,
    concurrentRequests: 50,
    memoryThreshold: 50 * 1024 * 1024, // 50MB
    performanceThreshold: {
      registration: 100, // 100ms max
      resolution: 10,    // 10ms max
      concurrent: 1000   // 1s max for concurrent
    }
  };

  beforeAll(async () => {
    console.log('🏗️ Initializing DI Container Advanced Testing...');
    
    // Initialize metrics tracking
    advancedMetrics = {
      performance: {
        registrationTime: 0,
        resolutionTime: 0,
        concurrentResolutionTime: 0,
        memoryUsage: 0,
        memoryLeaks: false
      },
      reliability: {
        circularDependencyHandling: false,
        errorRecovery: false,
        serviceLifecycleManagement: false,
        concurrentSafety: false
      },
      scalability: {
        maxServicesSupported: 0,
        performanceDegradation: 0,
        memoryGrowthRate: 0,
        resolutionTimeGrowth: 0
      },
      integration: {
        alphaServicesSupport: false,
        betaServicesSupport: false,
        charlieServicesSupport: false,
        crossServiceDependencies: false
      }
    };
    
    console.log('✅ DI Container advanced testing infrastructure ready');
  });

  afterAll(async () => {
    await generateAdvancedTestingReport();
    console.log('🎯 DI Container advanced testing completed');
  });

  beforeEach(async () => {
    // Fresh container for each test
    serviceContainer = new ServiceContainer();
    serviceFactory = new ServiceFactory();
    
    // Record initial memory usage
    advancedMetrics.performance.memoryUsage = process.memoryUsage().heapUsed;
  });

  afterEach(async () => {
    // Clean up resources
    if (serviceContainer && typeof serviceContainer.dispose === 'function') {
      await serviceContainer.dispose();
    }
  });

  describe('Performance Testing Under Load', () => {
    test('should handle rapid service registration efficiently', async () => {
      console.log('🔥 Testing rapid service registration performance...');
      
      const serviceCount = 50;
      const registrationTimes: number[] = [];
      
      await serviceContainer.initialize();
      
      for (let i = 0; i < serviceCount; i++) {
        const startTime = Date.now();
        
        serviceContainer.register(`TestService${i}`, () => ({
          id: i,
          name: `Service ${i}`,
          dependencies: [],
          createdAt: new Date()
        }), false); // Not singleton for variety
        
        const registrationTime = Date.now() - startTime;
        registrationTimes.push(registrationTime);
      }
      
      const averageRegistrationTime = registrationTimes.reduce((a, b) => a + b, 0) / registrationTimes.length;
      const maxRegistrationTime = Math.max(...registrationTimes);
      
      advancedMetrics.performance.registrationTime = averageRegistrationTime;
      advancedMetrics.scalability.maxServicesSupported = serviceCount;
      
      // Performance requirements
      expect(averageRegistrationTime).toBeLessThan(testConfig.performanceThreshold.registration);
      expect(maxRegistrationTime).toBeLessThan(testConfig.performanceThreshold.registration * 2);
      
      console.log(`✅ Registration performance: ${averageRegistrationTime.toFixed(2)}ms average, ${maxRegistrationTime}ms max`);
    });

    test('should handle rapid service resolution efficiently', async () => {
      console.log('🔥 Testing rapid service resolution performance...');
      
      await serviceContainer.initialize();
      
      // Register test services
      const serviceCount = 30;
      const serviceNames: string[] = [];
      
      for (let i = 0; i < serviceCount; i++) {
        const serviceName = `FastResolveService${i}`;
        serviceNames.push(serviceName);
        
        serviceContainer.register(serviceName, () => ({
          id: i,
          resolve: () => `Service ${i} resolved`,
          timestamp: Date.now()
        }), true); // Singleton for consistent resolution
      }
      
      // Test resolution performance
      const resolutionTimes: number[] = [];
      
      for (let round = 0; round < 3; round++) {
        for (const serviceName of serviceNames) {
          const startTime = Date.now();
          
          const service = serviceContainer.resolve(serviceName);
          expect(service).toBeDefined();
          
          const resolutionTime = Date.now() - startTime;
          resolutionTimes.push(resolutionTime);
        }
      }
      
      const averageResolutionTime = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
      const maxResolutionTime = Math.max(...resolutionTimes);
      
      advancedMetrics.performance.resolutionTime = averageResolutionTime;
      
      // Performance requirements
      expect(averageResolutionTime).toBeLessThan(testConfig.performanceThreshold.resolution);
      expect(maxResolutionTime).toBeLessThan(testConfig.performanceThreshold.resolution * 3);
      
      console.log(`✅ Resolution performance: ${averageResolutionTime.toFixed(2)}ms average, ${maxResolutionTime}ms max`);
    });

    test('should handle concurrent service resolution safely', async () => {
      console.log('🔥 Testing concurrent service resolution...');
      
      await serviceContainer.initialize();
      
      // Register services with different complexity
      const services = [
        {
          name: 'SimpleService',
          factory: () => ({ type: 'simple', id: Math.random() })
        },
        {
          name: 'ComplexService',
          factory: () => {
            // Simulate complex initialization
            const data = Array.from({ length: 1000 }, (_, i) => i);
            return { type: 'complex', data, id: Math.random() };
          }
        },
        {
          name: 'DependentService',
          factory: (container: ServiceContainer) => {
            const simple = container.resolve('SimpleService');
            return { type: 'dependent', dependency: simple, id: Math.random() };
          }
        }
      ];
      
      // Register services
      for (const service of services) {
        serviceContainer.register(service.name, service.factory, true);
      }
      
      // Test concurrent resolution
      const concurrentRequests = 20;
      const promises = [];
      
      const startTime = Date.now();
      
      for (let i = 0; i < concurrentRequests; i++) {
        const serviceIndex = i % services.length;
        const serviceName = services[serviceIndex].name;
        
        promises.push(
          Promise.resolve().then(() => {
            const resolveStart = Date.now();
            const service = serviceContainer.resolve(serviceName);
            const resolveTime = Date.now() - resolveStart;
            
            return {
              serviceName,
              service,
              resolveTime,
              requestIndex: i
            };
          })
        );
      }
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      advancedMetrics.performance.concurrentResolutionTime = totalTime;
      advancedMetrics.reliability.concurrentSafety = true;
      
      // Validation
      expect(results).toHaveLength(concurrentRequests);
      expect(results.every(r => r.service !== null)).toBe(true);
      expect(totalTime).toBeLessThan(testConfig.performanceThreshold.concurrent);
      
      // Check for singleton behavior
      const simpleServices = results.filter(r => r.serviceName === 'SimpleService');
      if (simpleServices.length > 1) {
        const firstService = simpleServices[0].service;
        const allSame = simpleServices.every(r => r.service === firstService);
        expect(allSame).toBe(true); // Singleton should return same instance
      }
      
      console.log(`✅ Concurrent resolution: ${concurrentRequests} requests in ${totalTime}ms`);
    });
  });

  describe('Memory Management Validation', () => {
    test('should manage memory efficiently during service lifecycle', async () => {
      console.log('🧠 Testing memory management...');
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      await serviceContainer.initialize();
      
      // Create services with various memory footprints
      const memoryIntensiveServices = 10;
      
      for (let i = 0; i < memoryIntensiveServices; i++) {
        serviceContainer.register(`MemoryService${i}`, () => {
          return {
            id: i,
            largeData: new Array(10000).fill(`data-${i}`),
            buffer: Buffer.alloc(1024 * 10), // 10KB buffer
            timestamp: new Date()
          };
        }, false); // Not singleton to test memory cleanup
      }
      
      // Resolve services multiple times
      const resolutionRounds = 5;
      for (let round = 0; round < resolutionRounds; round++) {
        for (let i = 0; i < memoryIntensiveServices; i++) {
          const service = serviceContainer.resolve(`MemoryService${i}`);
          expect(service).toBeDefined();
          // Use the service briefly then let it go out of scope
          const _ = service.largeData.length;
        }
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      advancedMetrics.performance.memoryUsage = memoryIncrease;
      advancedMetrics.performance.memoryLeaks = memoryIncrease > testConfig.memoryThreshold;
      
      // Memory should not grow excessively
      expect(memoryIncrease).toBeLessThan(testConfig.memoryThreshold);
      
      console.log(`✅ Memory management: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
    });

    test('should handle service disposal correctly', async () => {
      console.log('🗑️ Testing service disposal...');
      
      await serviceContainer.initialize();
      
      // Register services with disposal logic
      const disposableServices = 5;
      const disposalCalls: string[] = [];
      
      for (let i = 0; i < disposableServices; i++) {
        serviceContainer.register(`DisposableService${i}`, () => ({
          id: i,
          name: `Disposable ${i}`,
          dispose: () => {
            disposalCalls.push(`DisposableService${i}`);
          },
          isDisposed: false
        }), true);
      }
      
      // Resolve all services
      const services = [];
      for (let i = 0; i < disposableServices; i++) {
        const service = serviceContainer.resolve(`DisposableService${i}`);
        services.push(service);
      }
      
      // Test container disposal
      if (typeof serviceContainer.dispose === 'function') {
        await serviceContainer.dispose();
        
        // Check if disposal was called
        expect(disposalCalls.length).toBeGreaterThan(0);
        console.log(`✅ Service disposal: ${disposalCalls.length} services disposed`);
      } else {
        console.log('⏳ Service disposal not implemented yet');
      }
    });
  });

  describe('Circular Dependency Detection', () => {
    test('should detect and handle circular dependencies gracefully', async () => {
      console.log('🔄 Testing circular dependency detection...');
      
      await serviceContainer.initialize();
      
      let circularDependencyDetected = false;
      let errorMessage = '';
      
      try {
        // Register services with circular dependencies
        serviceContainer.register('ServiceA', (container: ServiceContainer) => {
          const serviceB = container.resolve('ServiceB');
          return {
            name: 'ServiceA',
            dependency: serviceB,
            getValue: () => 'A'
          };
        });
        
        serviceContainer.register('ServiceB', (container: ServiceContainer) => {
          const serviceC = container.resolve('ServiceC');
          return {
            name: 'ServiceB',
            dependency: serviceC,
            getValue: () => 'B'
          };
        });
        
        serviceContainer.register('ServiceC', (container: ServiceContainer) => {
          const serviceA = container.resolve('ServiceA'); // Circular dependency
          return {
            name: 'ServiceC',
            dependency: serviceA,
            getValue: () => 'C'
          };
        });
        
        // This should either handle gracefully or throw a meaningful error
        const serviceA = serviceContainer.resolve('ServiceA');
        
        // If it doesn't throw, check if it handled circular dependency
        if (serviceA && !serviceA.dependency) {
          circularDependencyDetected = true;
          errorMessage = 'Circular dependency handled by returning partial service';
        }
        
      } catch (error) {
        circularDependencyDetected = true;
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if error message indicates circular dependency detection
        expect(errorMessage.toLowerCase()).toMatch(/circular|cycle|dependency/);
      }
      
      advancedMetrics.reliability.circularDependencyHandling = circularDependencyDetected;
      
      expect(circularDependencyDetected).toBe(true);
      console.log(`✅ Circular dependency detection: ${errorMessage}`);
    });

    test('should handle complex dependency chains correctly', async () => {
      console.log('🔗 Testing complex dependency chains...');
      
      await serviceContainer.initialize();
      
      // Create a complex but valid dependency chain
      serviceContainer.register('DatabaseConfig', () => ({
        connectionString: 'test://localhost',
        timeout: 5000
      }));
      
      serviceContainer.register('DatabaseService', (container: ServiceContainer) => {
        const config = container.resolve('DatabaseConfig');
        return {
          config,
          connect: () => 'connected',
          query: (sql: string) => `Result for: ${sql}`
        };
      });
      
      serviceContainer.register('UserRepository', (container: ServiceContainer) => {
        const db = container.resolve('DatabaseService');
        return {
          db,
          findUser: (id: string) => ({ id, name: 'Test User' }),
          saveUser: (user: any) => ({ ...user, saved: true })
        };
      });
      
      serviceContainer.register('UserService', (container: ServiceContainer) => {
        const repository = container.resolve('UserRepository');
        return {
          repository,
          getUser: (id: string) => repository.findUser(id),
          createUser: (data: any) => repository.saveUser(data)
        };
      });
      
      serviceContainer.register('AuthService', (container: ServiceContainer) => {
        const userService = container.resolve('UserService');
        return {
          userService,
          authenticate: (credentials: any) => {
            const user = userService.getUser(credentials.id);
            return { user, token: 'test-token' };
          }
        };
      });
      
      // Resolve the top-level service
      const authService = serviceContainer.resolve('AuthService');
      
      expect(authService).toBeDefined();
      expect(authService.userService).toBeDefined();
      expect(authService.userService.repository).toBeDefined();
      expect(authService.userService.repository.db).toBeDefined();
      expect(authService.userService.repository.db.config).toBeDefined();
      
      // Test functionality
      const authResult = authService.authenticate({ id: 'test-123' });
      expect(authResult.user.id).toBe('test-123');
      expect(authResult.token).toBe('test-token');
      
      advancedMetrics.integration.crossServiceDependencies = true;
      
      console.log('✅ Complex dependency chain resolved successfully');
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle service registration errors gracefully', async () => {
      console.log('⚠️ Testing service registration error handling...');
      
      await serviceContainer.initialize();
      
      let errorHandled = false;
      
      try {
        // Register a service with a factory that throws an error
        serviceContainer.register('FailingService', () => {
          throw new Error('Service initialization failed');
        });
        
        // Try to resolve the failing service
        const service = serviceContainer.resolve('FailingService');
        
        // Should either return null or throw a meaningful error
        if (service === null) {
          errorHandled = true;
        }
        
      } catch (error) {
        errorHandled = true;
        expect(error).toBeInstanceOf(Error);
        console.log(`Expected error caught: ${error instanceof Error ? error.message : error}`);
      }
      
      // Container should still be functional for other services
      serviceContainer.register('WorkingService', () => ({
        status: 'working',
        getValue: () => 'success'
      }));
      
      const workingService = serviceContainer.resolve('WorkingService');
      expect(workingService).toBeDefined();
      expect(workingService.status).toBe('working');
      
      advancedMetrics.reliability.errorRecovery = errorHandled;
      
      expect(errorHandled).toBe(true);
      console.log('✅ Error handling validated - container remains functional');
    });

    test('should handle missing dependency gracefully', async () => {
      console.log('❓ Testing missing dependency handling...');
      
      await serviceContainer.initialize();
      
      let missingDependencyHandled = false;
      
      try {
        serviceContainer.register('ServiceWithMissingDep', (container: ServiceContainer) => {
          const missingService = container.resolve('NonExistentService');
          return {
            dependency: missingService,
            status: missingService ? 'has-dependency' : 'missing-dependency'
          };
        });
        
        const service = serviceContainer.resolve('ServiceWithMissingDep');
        
        if (service === null || service.status === 'missing-dependency') {
          missingDependencyHandled = true;
        }
        
      } catch (error) {
        missingDependencyHandled = true;
        console.log(`Missing dependency error handled: ${error instanceof Error ? error.message : error}`);
      }
      
      expect(missingDependencyHandled).toBe(true);
      console.log('✅ Missing dependency handling validated');
    });
  });

  describe('Service Lifecycle Management', () => {
    test('should manage singleton vs transient services correctly', async () => {
      console.log('🔄 Testing service lifecycle management...');
      
      await serviceContainer.initialize();
      
      // Register singleton service
      let singletonInstanceCount = 0;
      serviceContainer.register('SingletonService', () => {
        singletonInstanceCount++;
        return {
          id: singletonInstanceCount,
          type: 'singleton',
          createdAt: new Date()
        };
      }, true); // singleton = true
      
      // Register transient service
      let transientInstanceCount = 0;
      serviceContainer.register('TransientService', () => {
        transientInstanceCount++;
        return {
          id: transientInstanceCount,
          type: 'transient',
          createdAt: new Date()
        };
      }, false); // singleton = false
      
      // Test singleton behavior
      const singleton1 = serviceContainer.resolve('SingletonService');
      const singleton2 = serviceContainer.resolve('SingletonService');
      const singleton3 = serviceContainer.resolve('SingletonService');
      
      expect(singleton1).toBe(singleton2);
      expect(singleton2).toBe(singleton3);
      expect(singletonInstanceCount).toBe(1);
      
      // Test transient behavior
      const transient1 = serviceContainer.resolve('TransientService');
      const transient2 = serviceContainer.resolve('TransientService');
      const transient3 = serviceContainer.resolve('TransientService');
      
      expect(transient1).not.toBe(transient2);
      expect(transient2).not.toBe(transient3);
      expect(transientInstanceCount).toBe(3);
      
      advancedMetrics.reliability.serviceLifecycleManagement = true;
      
      console.log(`✅ Lifecycle management: Singleton (1 instance), Transient (${transientInstanceCount} instances)`);
    });

    test('should validate Alpha Core Services integration', async () => {
      console.log('🔗 Testing Alpha Core Services integration...');
      
      await serviceContainer.initialize();
      
      // Test Alpha's actual services
      const alphaServices = [
        'GeminiService',
        'CostManagementService',
        'BudgetControlService',
        'RateLimitingService',
        'UsageTierService',
        'IdeaBankService'
      ];
      
      let alphaServicesSupported = 0;
      
      for (const serviceName of alphaServices) {
        try {
          const service = serviceContainer.resolve(serviceName);
          if (service !== null) {
            alphaServicesSupported++;
            
            // Test basic service functionality if available
            if (typeof service.healthCheck === 'function') {
              const health = await service.healthCheck();
              expect(typeof health).toBe('boolean');
            }
          }
        } catch (error) {
          console.warn(`Alpha service ${serviceName} not available:`, error);
        }
      }
      
      const supportRate = alphaServicesSupported / alphaServices.length;
      advancedMetrics.integration.alphaServicesSupport = supportRate > 0.5;
      
      expect(supportRate).toBeGreaterThan(0.3); // At least 30% of Alpha services should be available
      
      console.log(`✅ Alpha services integration: ${alphaServicesSupported}/${alphaServices.length} services available`);
    });
  });

  describe('Advanced Integration Validation', () => {
    test('should validate Week 1 DI Container readiness', async () => {
      console.log('🎯 Testing Week 1 DI Container readiness...');
      
      await serviceContainer.initialize();
      
      const week1Requirements = {
        performanceAcceptable: 
          advancedMetrics.performance.registrationTime < testConfig.performanceThreshold.registration &&
          advancedMetrics.performance.resolutionTime < testConfig.performanceThreshold.resolution,
        
        memoryEfficient: !advancedMetrics.performance.memoryLeaks,
        
        reliabilityValidated: 
          advancedMetrics.reliability.circularDependencyHandling &&
          advancedMetrics.reliability.errorRecovery,
        
        concurrentSafe: advancedMetrics.reliability.concurrentSafety,
        
        alphaIntegrationReady: advancedMetrics.integration.alphaServicesSupport,
        
        lifecycleManagement: advancedMetrics.reliability.serviceLifecycleManagement
      };
      
      const readinessScore = Object.values(week1Requirements).filter(Boolean).length / 
                           Object.values(week1Requirements).length;
      
      await productionMonitor.recordMetric('di_container_week1_readiness', {
        score: readinessScore,
        requirements: week1Requirements,
        metrics: advancedMetrics,
        timestamp: new Date()
      });
      
      expect(readinessScore).toBeGreaterThan(0.7); // >70% ready for Week 1
      
      console.log(`✅ Week 1 DI Container readiness: ${(readinessScore * 100).toFixed(1)}%`);
      console.log('Requirements status:', week1Requirements);
    });
  });

  // Helper functions
  async function generateAdvancedTestingReport(): Promise<void> {
    const report = {
      testSuite: 'DI Container Advanced Testing Suite',
      timestamp: new Date(),
      metrics: advancedMetrics,
      summary: {
        performanceGrade: calculatePerformanceGrade(),
        reliabilityScore: calculateReliabilityScore(),
        scalabilityAssessment: calculateScalabilityAssessment(),
        integrationReadiness: calculateIntegrationReadiness(),
        week1Readiness: calculateWeek1Readiness(),
        recommendations: generateDIRecommendations()
      }
    };
    
    await productionMonitor.recordMetric('di_container_advanced_report', report);
    
    console.log('🏗️ DI Container Advanced Report Generated:', JSON.stringify(report, null, 2));
  }
  
  function calculatePerformanceGrade(): string {
    const { registrationTime, resolutionTime, concurrentResolutionTime } = advancedMetrics.performance;
    
    const grades = [
      registrationTime < 50 ? 'A' : registrationTime < 100 ? 'B' : 'C',
      resolutionTime < 5 ? 'A' : resolutionTime < 10 ? 'B' : 'C',
      concurrentResolutionTime < 500 ? 'A' : concurrentResolutionTime < 1000 ? 'B' : 'C'
    ];
    
    const averageGrade = grades.filter(g => g === 'A').length > 2 ? 'A' :
                        grades.filter(g => g !== 'C').length > 1 ? 'B' : 'C';
    
    return averageGrade;
  }
  
  function calculateReliabilityScore(): number {
    const reliabilityFactors = Object.values(advancedMetrics.reliability);
    return reliabilityFactors.filter(Boolean).length / reliabilityFactors.length;
  }
  
  function calculateScalabilityAssessment(): string {
    const { maxServicesSupported, performanceDegradation } = advancedMetrics.scalability;
    
    if (maxServicesSupported >= 80 && performanceDegradation < 0.2) return 'EXCELLENT';
    if (maxServicesSupported >= 50 && performanceDegradation < 0.5) return 'GOOD';
    if (maxServicesSupported >= 30) return 'FAIR';
    return 'LIMITED';
  }
  
  function calculateIntegrationReadiness(): number {
    const integrationFactors = Object.values(advancedMetrics.integration);
    return integrationFactors.filter(Boolean).length / integrationFactors.length;
  }
  
  function calculateWeek1Readiness(): number {
    const readinessFactors = [
      !advancedMetrics.performance.memoryLeaks,
      advancedMetrics.reliability.errorRecovery,
      advancedMetrics.reliability.concurrentSafety,
      advancedMetrics.integration.alphaServicesSupport,
      advancedMetrics.reliability.serviceLifecycleManagement
    ];
    
    return readinessFactors.filter(Boolean).length / readinessFactors.length;
  }
  
  function generateDIRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (advancedMetrics.performance.memoryLeaks) {
      recommendations.push('Implement proper service disposal to prevent memory leaks');
    }
    
    if (!advancedMetrics.reliability.circularDependencyHandling) {
      recommendations.push('Implement circular dependency detection and resolution');
    }
    
    if (!advancedMetrics.reliability.concurrentSafety) {
      recommendations.push('Ensure thread-safe service resolution for concurrent requests');
    }
    
    if (!advancedMetrics.integration.alphaServicesSupport) {
      recommendations.push('Complete integration with Alpha\'s Core Services');
    }
    
    if (advancedMetrics.performance.resolutionTime > 10) {
      recommendations.push('Optimize service resolution performance');
    }
    
    return recommendations;
  }
}); 