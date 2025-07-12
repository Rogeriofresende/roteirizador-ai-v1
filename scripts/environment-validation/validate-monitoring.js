#!/usr/bin/env node

/**
 * 📊 MONITORING VALIDATION SCRIPT
 * 
 * IA CHARLIE - Production Environment Audit
 * Validates monitoring infrastructure, analytics, and observability systems
 * 
 * SUCCESS CRITERIA:
 * ✅ Error monitoring systems operational
 * ✅ Analytics tracking configured
 * ✅ Performance monitoring ready
 * ✅ Health check systems working
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env') });

class MonitoringValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
    
    this.environment = process.env.NODE_ENV || process.env.VITE_ENVIRONMENT || 'development';
    this.isProduction = this.environment === 'production';
  }

  /**
   * Main validation runner
   */
  async validate() {
    console.log('📊 MONITORING VALIDATION - STARTING');
    console.log(`📍 Environment: ${this.environment}`);
    console.log(`📍 Project Root: ${PROJECT_ROOT}`);
    console.log('─'.repeat(60));

    // Core validations
    await this.validateErrorMonitoring();
    await this.validateAnalyticsTracking();
    await this.validatePerformanceMonitoring();
    await this.validateHealthChecks();
    await this.validateLoggingSystem();
    await this.validateAlertSystems();
    await this.validateMonitoringInfrastructure();

    this.generateReport();
    return this.results.failed === 0;
  }

  /**
   * Validate Error Monitoring
   */
  async validateErrorMonitoring() {
    const test = {
      name: 'Error Monitoring System',
      category: 'HIGH',
      required: this.isProduction
    };

    try {
      const errorMonitoringFiles = [
        'src/services/errorMonitoringService.ts',
        'src/services/monitoring/errorTracking.ts',
        'src/components/ErrorBoundaryV6.tsx'
      ];

      const foundFiles = errorMonitoringFiles.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundFiles.length === 0) {
        this.addResult(test, false, 'No error monitoring files found');
        return;
      }

      // Check for error boundary implementation
      const errorBoundaryPath = join(PROJECT_ROOT, 'src/components/ErrorBoundaryV6.tsx');
      if (existsSync(errorBoundaryPath)) {
        const content = readFileSync(errorBoundaryPath, 'utf8');
        
        const hasErrorCapture = content.includes('componentDidCatch') || 
                               content.includes('getDerivedStateFromError') ||
                               content.includes('ErrorBoundary');
        
        if (!hasErrorCapture) {
          this.addResult(test, false, 'Error boundary exists but missing error capture logic');
          return;
        }
      }

      // Check environment configuration for error monitoring
      const errorMonitoringEnabled = process.env.VITE_ERROR_MONITORING_ENABLED === 'true' ||
                                     this.isProduction;
      
      if (this.isProduction && !errorMonitoringEnabled) {
        this.addResult(test, false, 'Error monitoring disabled in production');
        return;
      }

      this.addResult(test, true, `Error monitoring configured: ${foundFiles.length} components found`);

    } catch (error) {
      this.addResult(test, false, `Error monitoring validation error: ${error.message}`);
    }
  }

  /**
   * Validate Analytics Tracking
   */
  async validateAnalyticsTracking() {
    const test = {
      name: 'Analytics Tracking',
      category: 'MEDIUM',
      required: false
    };

    try {
      const analyticsServices = [];
      
      // Check for Microsoft Clarity
      const clarityId = process.env.VITE_CLARITY_PROJECT_ID || process.env.VITE_CLARITY_ID;
      if (clarityId) {
        analyticsServices.push(`Microsoft Clarity: ${clarityId}`);
        
        // Validate Clarity integration
        const clarityServicePath = join(PROJECT_ROOT, 'src/services/clarityService.ts');
        if (existsSync(clarityServicePath)) {
          analyticsServices[analyticsServices.length - 1] += ' (service implemented)';
        }
      }

      // Check for Google Analytics
      const gaId = process.env.VITE_GA4_MEASUREMENT_ID;
      if (gaId) {
        const gaPattern = /^G-[A-Z0-9]{10}$/;
        if (gaPattern.test(gaId)) {
          analyticsServices.push(`Google Analytics 4: ${gaId}`);
        } else {
          analyticsServices.push(`Google Analytics 4: ${gaId} (INVALID FORMAT)`);
        }
      }

      // Check for custom analytics
      const analyticsFiles = [
        'src/services/analyticsService.ts',
        'src/hooks/useAdvancedAnalytics.ts',
        'src/components/analytics'
      ];

      const foundAnalyticsFiles = analyticsFiles.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundAnalyticsFiles.length > 0) {
        analyticsServices.push(`Custom analytics: ${foundAnalyticsFiles.length} components`);
      }

      if (analyticsServices.length === 0) {
        this.addResult(test, true, 'No analytics configured (acceptable for development)', 'warning');
      } else {
        this.addResult(test, true, `Analytics services: ${analyticsServices.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Analytics validation error: ${error.message}`);
    }
  }

  /**
   * Validate Performance Monitoring
   */
  async validatePerformanceMonitoring() {
    const test = {
      name: 'Performance Monitoring',
      category: 'MEDIUM',
      required: false
    };

    try {
      const performanceFeatures = [];

      // Check for Web Vitals
      const webVitalsPath = join(PROJECT_ROOT, 'src/utils/webVitals.ts');
      const webVitalsMockPath = join(PROJECT_ROOT, 'src/__mocks__/web-vitals.ts');
      
      if (existsSync(webVitalsPath) || existsSync(webVitalsMockPath)) {
        performanceFeatures.push('Web Vitals tracking');
      }

      // Check for performance hooks
      const performanceHooksPath = join(PROJECT_ROOT, 'src/hooks/useAdvancedPerformance.ts');
      if (existsSync(performanceHooksPath)) {
        performanceFeatures.push('Performance hooks');
      }

      // Check for performance monitoring services
      const performanceFiles = [
        'src/services/performanceMonitoringService.ts',
        'src/services/monitoring/performanceMonitor.ts'
      ];

      const foundPerfFiles = performanceFiles.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundPerfFiles.length > 0) {
        performanceFeatures.push(`Performance services: ${foundPerfFiles.length}`);
      }

      // Check for advanced performance monitoring scripts
      const perfScriptsPath = join(PROJECT_ROOT, 'scripts');
      if (existsSync(perfScriptsPath)) {
        const perfScripts = [
          'advanced-performance-monitor.js',
          'performance-validation-v6.js'
        ].filter(script => existsSync(join(perfScriptsPath, script)));

        if (perfScripts.length > 0) {
          performanceFeatures.push(`Performance scripts: ${perfScripts.length}`);
        }
      }

      if (performanceFeatures.length === 0) {
        this.addResult(test, true, 'Basic performance monitoring (browser defaults)', 'info');
      } else {
        this.addResult(test, true, `Performance monitoring: ${performanceFeatures.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Performance monitoring validation error: ${error.message}`);
    }
  }

  /**
   * Validate Health Checks
   */
  async validateHealthChecks() {
    const test = {
      name: 'Health Check Systems',
      category: 'HIGH',
      required: this.isProduction
    };

    try {
      const healthCheckFeatures = [];

      // Check for health check services
      const healthCheckFiles = [
        'src/services/healthCheckService.ts',
        'src/services/systemHealthService.ts'
      ];

      const foundHealthFiles = healthCheckFiles.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundHealthFiles.length > 0) {
        healthCheckFeatures.push(`Health services: ${foundHealthFiles.length}`);
      }

      // Check for health monitoring scripts
      const scriptsPath = join(PROJECT_ROOT, 'scripts');
      if (existsSync(scriptsPath)) {
        const healthScripts = [
          'health-check.sh',
          'health-monitor.js',
          'health-monitor.mjs'
        ].filter(script => existsSync(join(scriptsPath, script)));

        if (healthScripts.length > 0) {
          healthCheckFeatures.push(`Health scripts: ${healthScripts.length}`);
        }
      }

      // Check for API health dashboards
      const healthDashboardFiles = [
        'src/components/ApiHealthDashboard.tsx',
        'src/components/admin/SystemHealthDashboard.tsx'
      ];

      const foundDashboards = healthDashboardFiles.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundDashboards.length > 0) {
        healthCheckFeatures.push(`Health dashboards: ${foundDashboards.length}`);
      }

      if (healthCheckFeatures.length === 0 && this.isProduction) {
        this.addResult(test, false, 'No health check systems found (required for production)');
      } else if (healthCheckFeatures.length === 0) {
        this.addResult(test, true, 'Basic health monitoring (development)', 'warning');
      } else {
        this.addResult(test, true, `Health check systems: ${healthCheckFeatures.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Health check validation error: ${error.message}`);
    }
  }

  /**
   * Validate Logging System
   */
  async validateLoggingSystem() {
    const test = {
      name: 'Logging System',
      category: 'MEDIUM',
      required: false
    };

    try {
      const loggingFeatures = [];

      // Check environment logging configuration
      const logLevel = process.env.VITE_LOG_LEVEL || 'info';
      const consoleLogging = process.env.VITE_CONSOLE_LOGGING !== 'false';
      
      loggingFeatures.push(`Log level: ${logLevel}`);
      
      if (consoleLogging) {
        loggingFeatures.push('Console logging enabled');
      }

      // Check for custom logging services
      const loggingFiles = [
        'src/services/loggingService.ts',
        'src/utils/logger.ts'
      ];

      const foundLoggingFiles = loggingFiles.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundLoggingFiles.length > 0) {
        loggingFeatures.push(`Custom logging: ${foundLoggingFiles.length} services`);
      }

      // Check for log directories
      const logsPath = join(PROJECT_ROOT, 'logs');
      if (existsSync(logsPath)) {
        loggingFeatures.push('Log storage configured');
      }

      // Check production logging settings
      if (this.isProduction) {
        if (logLevel === 'debug') {
          this.addResult(test, false, 'Debug logging enabled in production (security risk)');
          return;
        }
        
        if (consoleLogging) {
          loggingFeatures.push('Console logging (consider disabling in production)');
        }
      }

      this.addResult(test, true, `Logging system: ${loggingFeatures.join(', ')}`);

    } catch (error) {
      this.addResult(test, false, `Logging system validation error: ${error.message}`);
    }
  }

  /**
   * Validate Alert Systems
   */
  async validateAlertSystems() {
    const test = {
      name: 'Alert Systems',
      category: 'LOW',
      required: false
    };

    try {
      const alertFeatures = [];

      // Check for notification services
      const notificationFiles = [
        'src/services/notificationService.ts',
        'src/services/alertService.ts'
      ];

      const foundNotificationFiles = notificationFiles.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundNotificationFiles.length > 0) {
        alertFeatures.push(`Notification services: ${foundNotificationFiles.length}`);
      }

      // Check for browser notification capabilities
      const notificationHooks = [
        'src/hooks/useNotifications.ts'
      ];

      const foundNotificationHooks = notificationHooks.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundNotificationHooks.length > 0) {
        alertFeatures.push('Browser notifications');
      }

      // Check for error alert components
      const alertComponents = [
        'src/components/ui/alert.tsx',
        'src/components/ui/toast.tsx'
      ];

      const foundAlertComponents = alertComponents.filter(file => 
        existsSync(join(PROJECT_ROOT, file))
      );

      if (foundAlertComponents.length > 0) {
        alertFeatures.push(`Alert components: ${foundAlertComponents.length}`);
      }

      if (alertFeatures.length === 0) {
        this.addResult(test, true, 'Basic error alerts (browser default)', 'info');
      } else {
        this.addResult(test, true, `Alert systems: ${alertFeatures.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Alert systems validation error: ${error.message}`);
    }
  }

  /**
   * Validate Monitoring Infrastructure
   */
  async validateMonitoringInfrastructure() {
    const test = {
      name: 'Monitoring Infrastructure',
      category: 'HIGH',
      required: this.isProduction
    };

    try {
      const infrastructureScore = {
        total: 0,
        passed: 0
      };

      // Error monitoring
      infrastructureScore.total += 1;
      if (this.results.details.find(d => d.name === 'Error Monitoring System')?.passed) {
        infrastructureScore.passed += 1;
      }

      // Performance monitoring
      infrastructureScore.total += 1;
      if (this.results.details.find(d => d.name === 'Performance Monitoring')?.passed) {
        infrastructureScore.passed += 1;
      }

      // Health checks
      infrastructureScore.total += 1;
      if (this.results.details.find(d => d.name === 'Health Check Systems')?.passed) {
        infrastructureScore.passed += 1;
      }

      // Analytics (optional but recommended)
      infrastructureScore.total += 1;
      if (this.results.details.find(d => d.name === 'Analytics Tracking')?.passed) {
        infrastructureScore.passed += 1;
      }

      const monitoringScore = Math.round((infrastructureScore.passed / infrastructureScore.total) * 100);
      
      // Production requirements
      if (this.isProduction && monitoringScore < 75) {
        this.addResult(test, false, `Monitoring infrastructure insufficient for production: ${monitoringScore}% (${infrastructureScore.passed}/${infrastructureScore.total})`);
      } else {
        this.addResult(test, true, `Monitoring infrastructure: ${monitoringScore}% coverage (${infrastructureScore.passed}/${infrastructureScore.total})`);
      }

    } catch (error) {
      this.addResult(test, false, `Monitoring infrastructure validation error: ${error.message}`);
    }
  }

  /**
   * Add validation result
   */
  addResult(test, passed, message, level = null) {
    const result = {
      name: test.name,
      category: test.category,
      passed,
      message,
      level: level || (passed ? 'success' : 'error'),
      required: test.required
    };

    this.results.details.push(result);
    
    if (passed && level !== 'warning') {
      this.results.passed++;
    } else if (!passed) {
      this.results.failed++;
    } else {
      this.results.warnings++;
    }

    // Console output with color
    const icon = passed ? '✅' : '❌';
    const color = passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${icon} ${test.name}: ${message}${reset}`);
  }

  /**
   * Generate final validation report
   */
  generateReport() {
    console.log('─'.repeat(60));
    console.log('📊 MONITORING VALIDATION REPORT');
    console.log('─'.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`🎯 Environment: ${this.environment}`);
    
    if (this.results.passed + this.results.failed > 0) {
      const totalScore = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
      console.log(`📈 Monitoring Score: ${totalScore}%`);
    }

    if (this.results.failed > 0) {
      console.log('\n🚨 MONITORING ISSUES TO RESOLVE:');
      this.results.details
        .filter(r => !r.passed && r.required)
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  MONITORING WARNINGS:');
      this.results.details
        .filter(r => r.level === 'warning')
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    // Recommendations
    console.log('\n💡 MONITORING RECOMMENDATIONS:');
    if (this.results.failed === 0) {
      console.log('   • Monitoring infrastructure is well configured!');
      console.log('   • Consider adding real-time alerts for production');
      console.log('   • Review monitoring data regularly for optimization opportunities');
    } else {
      console.log('   • Set up error monitoring for production environments');
      console.log('   • Configure health checks for critical system components');
      console.log('   • Implement performance tracking for user experience insights');
    }

    console.log('─'.repeat(60));
    console.log(this.results.failed === 0 ? '🎉 MONITORING VALIDATION PASSED!' : '🔧 MONITORING ISSUES FOUND');
    console.log('─'.repeat(60));
  }
}

// Execute validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new MonitoringValidator();
  
  validator.validate()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Monitoring validation failed with error:', error);
      process.exit(1);
    });
}

export { MonitoringValidator }; 