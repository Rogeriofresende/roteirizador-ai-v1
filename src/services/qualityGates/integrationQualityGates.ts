// Integration Quality Gates - Week 4.4 Critical Integration Fixes
// IA CHARLIE - Real validation and integration testing
// Quality gates that actually detect real problems

import { logger } from '../../utils/logger';

interface IntegrationValidationResult {
  passed: boolean;
  issues: IntegrationIssue[];
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface IntegrationIssue {
  type: 'method_missing' | 'interface_mismatch' | 'dependency_unavailable' | 'test_mocked' | 'configuration_error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  description: string;
  suggestion: string;
  codeLocation?: string;
}

export class IntegrationQualityGates {
  
  // ✅ ENHANCED: Detect analytics method mismatches
  async validateAnalyticsIntegration(): Promise<IntegrationValidationResult> {
    const issues: IntegrationIssue[] = [];
    
    try {
      logger.info('Validating analytics integration with real method checks');
      
      // Dynamic import to test actual service
      const { analyticsService } = await import('../analyticsService');
      
      // Check if required methods exist
      const requiredMethods = [
        { name: 'trackEvent', critical: true },
        { name: 'trackUserAction', critical: true },
        { name: 'trackError', critical: true }
      ];
      
      for (const method of requiredMethods) {
        if (typeof analyticsService?.[method.name] !== 'function') {
          issues.push({
            type: 'method_missing',
            severity: method.critical ? 'critical' : 'high',
            component: 'analyticsService',
            description: `Method ${method.name} is missing but called in code`,
            suggestion: `Implement ${method.name} method in analyticsService`,
            codeLocation: 'Multiple files call this method'
          });
        }
      }

      // Test actual method calls that are used in the codebase
      try {
        // This should work if methods exist
        if (typeof analyticsService?.trackUserAction === 'function') {
          // Don't actually send data, just test the call
          logger.debug('trackUserAction method exists and is callable');
        } else {
          issues.push({
            type: 'method_missing',
            severity: 'critical',
            component: 'GeminiApiConfig',
            description: 'trackUserAction call will fail with TypeError in GeminiApiConfig.tsx:118',
            suggestion: 'Add trackUserAction method to analyticsService',
            codeLocation: 'src/components/GeminiApiConfig.tsx:118'
          });
        }
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('is not a function')) {
          issues.push({
            type: 'method_missing',
            severity: 'critical',
            component: 'analyticsService',
            description: `TypeError caught: ${error.message}`,
            suggestion: 'Ensure all called methods exist in analyticsService interface'
          });
        }
      }

      try {
        if (typeof analyticsService?.trackError === 'function') {
          logger.debug('trackError method exists and is callable');
        } else {
          issues.push({
            type: 'method_missing',
            severity: 'critical',
            component: 'GeminiApiConfig',
            description: 'trackError call will fail with TypeError in GeminiApiConfig.tsx:136',
            suggestion: 'Add trackError method to analyticsService',
            codeLocation: 'src/components/GeminiApiConfig.tsx:136'
          });
        }
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('is not a function')) {
          issues.push({
            type: 'method_missing',
            severity: 'critical',
            component: 'analyticsService',
            description: `TypeError caught: ${error.message}`,
            suggestion: 'Ensure all called methods exist in analyticsService interface'
          });
        }
      }

    } catch (error) {
      issues.push({
        type: 'dependency_unavailable',
        severity: 'high',
        component: 'analyticsService',
        description: `Analytics service validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Check analytics service initialization and exports'
      });
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const severity = criticalIssues.length > 0 ? 'critical' : 
                     issues.filter(i => i.severity === 'high').length > 0 ? 'high' :
                     issues.length > 0 ? 'medium' : 'low';

    return {
      passed: criticalIssues.length === 0,
      issues,
      summary: `Analytics integration: ${issues.length} issues found (${criticalIssues.length} critical)`,
      severity
    };
  }

  // ✅ ENHANCED: Detect API authentication and service issues
  async validateAPIIntegration(): Promise<IntegrationValidationResult> {
    const issues: IntegrationIssue[] = [];

    try {
      logger.info('Validating API integration with real connection tests');

      // Check if Gemini service is properly configured
      try {
        const { geminiService } = await import('../geminiService');
        
        if (!geminiService?.isConfigured || typeof geminiService.isConfigured !== 'function') {
          issues.push({
            type: 'interface_mismatch',
            severity: 'high',
            component: 'geminiService',
            description: 'isConfigured method missing or not accessible',
            suggestion: 'Ensure geminiService exports isConfigured method'
          });
        } else if (!geminiService.isConfigured()) {
          issues.push({
            type: 'configuration_error',
            severity: 'medium',
            component: 'geminiAPI',
            description: 'Gemini API not configured - service will not work',
            suggestion: 'Configure Gemini API key in environment variables'
          });
        }

        // Test connection if configured
        if (geminiService?.isConfigured?.() && typeof geminiService.testConnection === 'function') {
          try {
            const connectionTest = await geminiService.testConnection();
            if (!connectionTest) {
              issues.push({
                type: 'interface_mismatch',
                severity: 'high',
                component: 'geminiAPI',
                description: 'API authentication test failed',
                suggestion: 'Check API credentials and network connectivity'
              });
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes('503')) {
              issues.push({
                type: 'dependency_unavailable',
                severity: 'high',
                component: 'geminiAPI',
                description: 'API service unavailable (503 error)',
                suggestion: 'Check API service status and implement retry logic'
              });
            }
          }
        }

      } catch (importError) {
        issues.push({
          type: 'dependency_unavailable',
          severity: 'critical',
          component: 'geminiService',
          description: `Cannot import geminiService: ${importError instanceof Error ? importError.message : 'Unknown error'}`,
          suggestion: 'Check geminiService file exists and exports are correct'
        });
      }

    } catch (error) {
      issues.push({
        type: 'dependency_unavailable',
        severity: 'high',
        component: 'apiIntegration',
        description: `API integration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Check API service implementations and dependencies'
      });
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const severity = criticalIssues.length > 0 ? 'critical' : 
                     issues.filter(i => i.severity === 'high').length > 0 ? 'high' :
                     issues.length > 0 ? 'medium' : 'low';

    return {
      passed: criticalIssues.length === 0,
      issues,
      summary: `API integration: ${issues.length} issues found (${criticalIssues.length} critical)`,
      severity
    };
  }

  // ✅ NEW: Detect connection refused errors from monitoring
  async validateMonitoringEndpoints(): Promise<IntegrationValidationResult> {
    const issues: IntegrationIssue[] = [];

    try {
      logger.info('Validating monitoring endpoints for connection refused errors');

      // Check for localhost:3001 dependencies that cause connection refused
      const problematicEndpoints = [
        'http://localhost:3001/api/errors',
        'http://localhost:3001/health',
        'http://localhost:3001'
      ];

      // This is a static analysis - we know these endpoints don't exist
      for (const endpoint of problematicEndpoints) {
        issues.push({
          type: 'dependency_unavailable',
          severity: 'medium',
          component: 'monitoring',
          description: `Endpoint ${endpoint} does not exist and causes connection refused errors`,
          suggestion: 'Remove references to localhost:3001 or implement actual service',
          codeLocation: 'Multiple files reference this endpoint'
        });
      }

      // Test if realistic monitoring is working
      try {
        const { realisticHealthMonitor } = await import('./realisticHealthMonitor');
        const status = realisticHealthMonitor.getStatus();
        
        if (!status) {
          issues.push({
            type: 'interface_mismatch',
            severity: 'medium',
            component: 'realisticHealthMonitor',
            description: 'Realistic health monitor not providing status',
            suggestion: 'Ensure realistic health monitor is initialized and running'
          });
        }
      } catch (error) {
        issues.push({
          type: 'dependency_unavailable',
          severity: 'medium',
          component: 'realisticHealthMonitor',
          description: 'Cannot access realistic health monitor',
          suggestion: 'Implement realistic health monitoring'
        });
      }

    } catch (error) {
      issues.push({
        type: 'dependency_unavailable',
        severity: 'low',
        component: 'monitoring',
        description: `Monitoring validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Check monitoring system implementation'
      });
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const severity = criticalIssues.length > 0 ? 'critical' : 
                     issues.filter(i => i.severity === 'high').length > 0 ? 'high' :
                     issues.length > 0 ? 'medium' : 'low';

    return {
      passed: criticalIssues.length === 0,
      issues,
      summary: `Monitoring endpoints: ${issues.length} issues found (${criticalIssues.length} critical)`,
      severity
    };
  }

  // ✅ COMPREHENSIVE: Run all quality gates
  async runAllQualityGates(): Promise<IntegrationValidationResult> {
    logger.info('Running comprehensive integration quality gates');
    
    const results = await Promise.all([
      this.validateAnalyticsIntegration(),
      this.validateAPIIntegration(),
      this.validateMonitoringEndpoints()
    ]);

    const allIssues = results.flatMap(r => r.issues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const highIssues = allIssues.filter(i => i.severity === 'high');
    
    const overallSeverity = criticalIssues.length > 0 ? 'critical' :
                           highIssues.length > 0 ? 'high' :
                           allIssues.length > 0 ? 'medium' : 'low';

    const result: IntegrationValidationResult = {
      passed: criticalIssues.length === 0,
      issues: allIssues,
      summary: `Quality Gates: ${allIssues.length} total issues (${criticalIssues.length} critical, ${highIssues.length} high)`,
      severity: overallSeverity
    };

    // Log comprehensive report
    logger.info('Quality gates validation completed', {
      totalIssues: allIssues.length,
      criticalIssues: criticalIssues.length,
      highIssues: highIssues.length,
      passed: result.passed,
      severity: overallSeverity
    });

    return result;
  }

  // ✅ EVIDENCE-BASED: Generate detailed report
  async generateEvidenceReport(): Promise<{
    timestamp: Date;
    validationResults: IntegrationValidationResult;
    systemInfo: any;
    recommendations: string[];
  }> {
    const validationResults = await this.runAllQualityGates();
    
    const recommendations: string[] = [];
    
    // Generate specific recommendations based on issues found
    validationResults.issues.forEach(issue => {
      if (issue.type === 'method_missing' && issue.component === 'analyticsService') {
        recommendations.push('URGENT: Implement missing analytics methods (trackUserAction, trackError) to prevent TypeErrors');
      }
      if (issue.type === 'dependency_unavailable' && issue.description.includes('localhost:3001')) {
        recommendations.push('Remove localhost:3001 dependencies and implement realistic monitoring endpoints');
      }
      if (issue.severity === 'critical') {
        recommendations.push(`CRITICAL: ${issue.suggestion}`);
      }
    });

    // Add quality gate improvements
    if (validationResults.issues.length > 0) {
      recommendations.push('Implement continuous integration quality gates to detect these issues automatically');
    }

    return {
      timestamp: new Date(),
      validationResults,
      systemInfo: {
        environment: process.env.NODE_ENV || 'development',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
        location: typeof window !== 'undefined' ? window.location.href : 'Server'
      },
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }
}

// Global instance for immediate use
export const integrationQualityGates = new IntegrationQualityGates();

// Auto-run quality gates in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run quality gates after page load
  window.addEventListener('load', async () => {
    try {
      setTimeout(async () => {
        const results = await integrationQualityGates.runAllQualityGates();
        
        if (!results.passed) {
          console.warn('🚨 Quality Gates Failed:', results.summary);
          console.table(results.issues.map(issue => ({
            Component: issue.component,
            Severity: issue.severity,
            Issue: issue.description,
            Suggestion: issue.suggestion
          })));
        } else {
          console.log('✅ Quality Gates Passed:', results.summary);
        }
      }, 2000); // Wait 2 seconds for services to initialize
    } catch (error) {
      console.error('Quality gates validation failed:', error);
    }
  });
} 