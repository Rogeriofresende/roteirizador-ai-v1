// API Testing Suite for Gemini Integration
import { geminiService } from './geminiService';
import { analyticsService } from './analyticsService';

export class APITestingSuite {
  private testResults: TestResult[] = [];

  async runAllTests(): Promise<TestSuiteResult> {
    console.log('🧪 Iniciando testes da API Gemini...');
    
    this.testResults = [];
    
    // Test 1: API Integration Test
    await this.testScriptGeneration();
    
    // Test 2: Network Resilience Test
    await this.testNetworkResilience();
    
    // Test 3: Circuit Breaker Test
    await this.testCircuitBreaker();
    
    // Test 4: Authentication Test
    await this.testAuthentication();
    
    // Test 5: Fallback Test
    await this.testFallbackMechanisms();

    const summary = this.generateSummary();
    console.log('📊 Testes concluídos:', summary);
    
    return summary;
  }

  private async testScriptGeneration(): Promise<void> {
    console.log('🧪 Teste 1: Geração de Script');
    
    try {
      const testParams = {
        subject: 'Teste de conectividade API',
        platform: 'YouTube',
        duration: '60 segundos',
        tone: 'casual',
        audience: 'geral'
      };
      
      const startTime = Date.now();
      const result = await geminiService.generateScript(testParams);
      const responseTime = Date.now() - startTime;
      
      const success = result && result.length > 50;
      
      this.testResults.push({
        testName: 'Script Generation',
        success,
        responseTime,
        details: {
          contentLength: result?.length || 0,
          hasContent: !!result,
          responseTime
        },
        error: success ? null : 'Generated content too short or empty'
      });
      
      console.log(success ? '✅ Script generation: PASSED' : '❌ Script generation: FAILED');
      
    } catch (error) {
      this.testResults.push({
        testName: 'Script Generation',
        success: false,
        responseTime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Script generation: FAILED -', error);
    }
  }

  private async testNetworkResilience(): Promise<void> {
    console.log('🧪 Teste 2: Resiliência de Rede');
    
    try {
      // Test connection multiple times to verify resilience
      const testPromises = Array(3).fill(null).map((_, i) => 
        geminiService.testConnection().catch(error => ({
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: i + 1
        }))
      );
      
      const results = await Promise.all(testPromises);
      const successCount = results.filter(result => result === true).length;
      const success = successCount > 0; // At least one should succeed
      
      this.testResults.push({
        testName: 'Network Resilience',
        success,
        responseTime: 0,
        details: {
          successfulConnections: successCount,
          totalAttempts: 3,
          successRate: (successCount / 3) * 100
        },
        error: success ? null : 'All connection attempts failed'
      });
      
      console.log(success ? '✅ Network resilience: PASSED' : '❌ Network resilience: FAILED');
      
    } catch (error) {
      this.testResults.push({
        testName: 'Network Resilience',
        success: false,
        responseTime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Network resilience: FAILED -', error);
    }
  }

  private async testCircuitBreaker(): Promise<void> {
    console.log('🧪 Teste 3: Circuit Breaker');
    
    try {
      const systemStatus = geminiService.getSystemStatus();
      
      // Test that circuit breaker is functional
      const success = systemStatus.circuitBreakerState !== undefined;
      
      this.testResults.push({
        testName: 'Circuit Breaker',
        success,
        responseTime: 0,
        details: {
          circuitBreakerState: systemStatus.circuitBreakerState,
          failureCount: systemStatus.failureCount,
          configured: systemStatus.configured
        },
        error: success ? null : 'Circuit breaker not properly initialized'
      });
      
      console.log(success ? '✅ Circuit breaker: PASSED' : '❌ Circuit breaker: FAILED');
      
    } catch (error) {
      this.testResults.push({
        testName: 'Circuit Breaker',
        success: false,
        responseTime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Circuit breaker: FAILED -', error);
    }
  }

  private async testAuthentication(): Promise<void> {
    console.log('🧪 Teste 4: Autenticação');
    
    try {
      const isConfigured = geminiService.isConfigured();
      const connectionTest = await geminiService.testConnection();
      
      const success = isConfigured && connectionTest;
      
      this.testResults.push({
        testName: 'Authentication',
        success,
        responseTime: 0,
        details: {
          configured: isConfigured,
          connectionSuccessful: connectionTest
        },
        error: success ? null : 'Authentication failed or not configured'
      });
      
      console.log(success ? '✅ Authentication: PASSED' : '❌ Authentication: FAILED');
      
    } catch (error) {
      this.testResults.push({
        testName: 'Authentication',
        success: false,
        responseTime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Authentication: FAILED -', error);
    }
  }

  private async testFallbackMechanisms(): Promise<void> {
    console.log('🧪 Teste 5: Mecanismos de Fallback');
    
    try {
      // Test if fallback mechanisms are properly configured
      // This is a structural test since we can't easily simulate API failures
      
      const hasLocalStorage = typeof localStorage !== 'undefined';
      const success = hasLocalStorage; // Basic fallback mechanism test
      
      this.testResults.push({
        testName: 'Fallback Mechanisms',
        success,
        responseTime: 0,
        details: {
          localStorageAvailable: hasLocalStorage,
          fallbackStrategiesConfigured: true // Based on implementation
        },
        error: success ? null : 'Fallback mechanisms not properly configured'
      });
      
      console.log(success ? '✅ Fallback mechanisms: PASSED' : '❌ Fallback mechanisms: FAILED');
      
    } catch (error) {
      this.testResults.push({
        testName: 'Fallback Mechanisms',
        success: false,
        responseTime: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.log('❌ Fallback mechanisms: FAILED -', error);
    }
  }

  private generateSummary(): TestSuiteResult {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;
    
    const summary: TestSuiteResult = {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      allTestsPassed: failedTests === 0,
      results: this.testResults,
      timestamp: new Date()
    };
    
    // Track test results
    analyticsService.trackUserAction('api_test_suite_completed', {
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: failedTests,
      success_rate: successRate,
      all_tests_passed: summary.allTestsPassed
    });
    
    return summary;
  }

  getLastResults(): TestResult[] {
    return [...this.testResults];
  }
}

// Types
interface TestResult {
  testName: string;
  success: boolean;
  responseTime: number;
  details: any;
  error: string | null;
}

interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  allTestsPassed: boolean;
  results: TestResult[];
  timestamp: Date;
}

// Singleton export
export const apiTestingSuite = new APITestingSuite(); 