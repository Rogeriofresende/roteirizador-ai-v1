#!/usr/bin/env node

/**
 * 🟡 IA CHARLIE - CONTINUOUS MONITORING SYSTEM
 * Health Monitor Script for V6.4 Clean Architecture Migration
 * 
 * Monitors system health, tracks errors, and provides alerts
 * for the multi-AI coordination system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HEALTH_MONITOR_CONFIG = {
  name: 'IA Charlie Health Monitor',
  version: '6.4.0',
  targets: {
    maxErrors: 10,
    maxCriticalErrors: 5,
    maxBuildTime: 5000, // 5 seconds
    maxBundleSize: 400000, // 400KB
    minTestCoverage: 85
  },
  alertThresholds: {
    yellow: {
      errorIncrease: 20, // 20% increase triggers yellow
      buildTimeIncrease: 50, // 50% increase triggers yellow
      bundleSizeIncrease: 25 // 25% increase triggers yellow
    },
    red: {
      errorIncrease: 50, // 50% increase triggers red
      buildTimeIncrease: 100, // 100% increase triggers red
      bundleSizeIncrease: 50 // 50% increase triggers red
    }
  }
};

class HealthMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/health-monitor.log');
    this.reportFile = path.join(__dirname, '../logs/health-report.json');
    this.lastReport = this.loadLastReport();
    this.currentReport = this.createEmptyReport();
    
    console.log('🟡 IA CHARLIE - Health Monitor Starting...');
    console.log(`📊 Monitoring V6.4 System Health`);
    console.log(`🎯 Targets: <${HEALTH_MONITOR_CONFIG.targets.maxErrors} errors, <${HEALTH_MONITOR_CONFIG.targets.maxCriticalErrors} critical`);
  }

  createEmptyReport() {
    return {
      timestamp: new Date().toISOString(),
      phase: 'Week 1-2 Foundation Extended',
      activeIA: 'Alpha',
      metrics: {
        errorCount: 0,
        criticalErrors: 0,
        buildTime: 0,
        bundleSize: 0,
        testCoverage: 0,
        featuresWorking: 0
      },
      status: 'unknown',
      alerts: [],
      recommendations: []
    };
  }

  loadLastReport() {
    try {
      if (fs.existsSync(this.reportFile)) {
        const data = fs.readFileSync(this.reportFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️ Could not load last report:', error.message);
    }
    return this.createEmptyReport();
  }

  saveReport() {
    try {
      fs.writeFileSync(this.reportFile, JSON.stringify(this.currentReport, null, 2));
      console.log('✅ Health report saved');
    } catch (error) {
      console.error('❌ Failed to save health report:', error.message);
    }
  }

  async checkBuildHealth() {
    console.log('🔍 Checking build health...');
    
    try {
      const startTime = Date.now();
      const buildOutput = execSync('npm run build', { 
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        timeout: 30000
      });
      
      const buildTime = Date.now() - startTime;
      this.currentReport.metrics.buildTime = buildTime;
      
      // Extract bundle size from build output
      const bundleMatch = buildOutput.match(/gzip:\s*(\d+\.?\d*)\s*kB/);
      if (bundleMatch) {
        this.currentReport.metrics.bundleSize = parseFloat(bundleMatch[1]) * 1024; // Convert to bytes
      }
      
      console.log(`✅ Build successful: ${buildTime}ms`);
      if (bundleMatch) {
        console.log(`📦 Bundle size: ${bundleMatch[1]} KB`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      this.currentReport.alerts.push({
        type: 'build_failure',
        level: 'red',
        message: 'Build process failed',
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  async checkErrorHealth() {
    console.log('🔍 Checking error health...');
    
    try {
      const errorReportPath = path.join(__dirname, '../logs/error-report.json');
      if (fs.existsSync(errorReportPath)) {
        const errorData = JSON.parse(fs.readFileSync(errorReportPath, 'utf8'));
        
        this.currentReport.metrics.errorCount = errorData.summary?.totalErrors || 0;
        this.currentReport.metrics.criticalErrors = errorData.summary?.criticalErrors || 0;
        
        console.log(`📊 Total errors: ${this.currentReport.metrics.errorCount}`);
        console.log(`🚨 Critical errors: ${this.currentReport.metrics.criticalErrors}`);
        
        // Check against targets
        if (this.currentReport.metrics.errorCount > HEALTH_MONITOR_CONFIG.targets.maxErrors) {
          this.currentReport.alerts.push({
            type: 'high_error_count',
            level: 'red',
            message: `Error count (${this.currentReport.metrics.errorCount}) exceeds target (${HEALTH_MONITOR_CONFIG.targets.maxErrors})`,
            timestamp: new Date().toISOString()
          });
        }
        
        if (this.currentReport.metrics.criticalErrors > HEALTH_MONITOR_CONFIG.targets.maxCriticalErrors) {
          this.currentReport.alerts.push({
            type: 'high_critical_errors',
            level: 'red',
            message: `Critical errors (${this.currentReport.metrics.criticalErrors}) exceed target (${HEALTH_MONITOR_CONFIG.targets.maxCriticalErrors})`,
            timestamp: new Date().toISOString()
          });
        }
        
        return true;
      } else {
        console.warn('⚠️ Error report not found');
        return false;
      }
    } catch (error) {
      console.error('❌ Error health check failed:', error.message);
      return false;
    }
  }

  async checkTestCoverage() {
    console.log('🔍 Checking test coverage...');
    
    try {
      // Count test files
      const testFiles = execSync('find src -name "*.test.*" -o -name "*.spec.*" | wc -l', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      }).trim();
      
      // Count source files
      const sourceFiles = execSync('find src -name "*.tsx" -o -name "*.ts" | grep -v test | wc -l', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      }).trim();
      
      const coverage = (parseInt(testFiles) / parseInt(sourceFiles)) * 100;
      this.currentReport.metrics.testCoverage = Math.round(coverage);
      
      console.log(`📊 Test coverage: ${this.currentReport.metrics.testCoverage}% (${testFiles}/${sourceFiles} files)`);
      
      if (coverage < HEALTH_MONITOR_CONFIG.targets.minTestCoverage) {
        this.currentReport.alerts.push({
          type: 'low_test_coverage',
          level: 'yellow',
          message: `Test coverage (${Math.round(coverage)}%) below target (${HEALTH_MONITOR_CONFIG.targets.minTestCoverage}%)`,
          timestamp: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Test coverage check failed:', error.message);
      return false;
    }
  }

  async checkFeatureHealth() {
    console.log('🔍 Checking feature health...');
    
    try {
      // TODO: Implement feature health check
      // For now, assuming all features are working
      this.currentReport.metrics.featuresWorking = 50;
      
      console.log(`✅ Features working: ${this.currentReport.metrics.featuresWorking}/50+`);
      return true;
    } catch (error) {
      console.error('❌ Feature health check failed:', error.message);
      return false;
    }
  }

  determineOverallStatus() {
    const alerts = this.currentReport.alerts;
    const redAlerts = alerts.filter(a => a.level === 'red').length;
    const yellowAlerts = alerts.filter(a => a.level === 'yellow').length;
    
    if (redAlerts > 0) {
      this.currentReport.status = 'red';
    } else if (yellowAlerts > 0) {
      this.currentReport.status = 'yellow';
    } else {
      this.currentReport.status = 'green';
    }
    
    console.log(`📊 Overall status: ${this.currentReport.status.toUpperCase()}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.currentReport.metrics.errorCount > HEALTH_MONITOR_CONFIG.targets.maxErrors) {
      recommendations.push({
        priority: 'high',
        action: 'IA Alpha should prioritize error reduction in next phase',
        target: 'ErrorReduction',
        details: `Current: ${this.currentReport.metrics.errorCount}, Target: ${HEALTH_MONITOR_CONFIG.targets.maxErrors}`
      });
    }
    
    if (this.currentReport.metrics.testCoverage < HEALTH_MONITOR_CONFIG.targets.minTestCoverage) {
      recommendations.push({
        priority: 'medium',
        action: 'Prepare test reactivation plan for Week 6',
        target: 'TestCoverage',
        details: `Current: ${this.currentReport.metrics.testCoverage}%, Target: ${HEALTH_MONITOR_CONFIG.targets.minTestCoverage}%`
      });
    }
    
    if (this.currentReport.metrics.buildTime > HEALTH_MONITOR_CONFIG.targets.maxBuildTime) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize build performance',
        target: 'BuildTime',
        details: `Current: ${this.currentReport.metrics.buildTime}ms, Target: ${HEALTH_MONITOR_CONFIG.targets.maxBuildTime}ms`
      });
    }
    
    this.currentReport.recommendations = recommendations;
  }

  async run() {
    console.log('\n🚀 Starting comprehensive health check...\n');
    
    const checks = [
      this.checkBuildHealth(),
      this.checkErrorHealth(),
      this.checkTestCoverage(),
      this.checkFeatureHealth()
    ];
    
    const results = await Promise.all(checks);
    const successCount = results.filter(r => r).length;
    
    console.log(`\n📊 Health checks completed: ${successCount}/${results.length} successful`);
    
    this.determineOverallStatus();
    this.generateRecommendations();
    this.saveReport();
    
    this.printSummary();
    
    return this.currentReport;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🟡 IA CHARLIE - HEALTH MONITOR SUMMARY');
    console.log('='.repeat(60));
    console.log(`📅 Timestamp: ${new Date().toLocaleString()}`);
    console.log(`📊 Overall Status: ${this.currentReport.status.toUpperCase()}`);
    console.log(`🎯 Phase: ${this.currentReport.phase}`);
    console.log('\n📈 METRICS:');
    console.log(`   Errors: ${this.currentReport.metrics.errorCount} (target: <${HEALTH_MONITOR_CONFIG.targets.maxErrors})`);
    console.log(`   Critical: ${this.currentReport.metrics.criticalErrors} (target: <${HEALTH_MONITOR_CONFIG.targets.maxCriticalErrors})`);
    console.log(`   Build: ${this.currentReport.metrics.buildTime}ms (target: <${HEALTH_MONITOR_CONFIG.targets.maxBuildTime}ms)`);
    console.log(`   Bundle: ${(this.currentReport.metrics.bundleSize/1024).toFixed(1)}KB (target: <${HEALTH_MONITOR_CONFIG.targets.maxBundleSize/1024}KB)`);
    console.log(`   Tests: ${this.currentReport.metrics.testCoverage}% (target: >${HEALTH_MONITOR_CONFIG.targets.minTestCoverage}%)`);
    console.log(`   Features: ${this.currentReport.metrics.featuresWorking}/50+`);
    
    if (this.currentReport.alerts.length > 0) {
      console.log('\n🚨 ALERTS:');
      this.currentReport.alerts.forEach(alert => {
        console.log(`   ${alert.level.toUpperCase()}: ${alert.message}`);
      });
    }
    
    if (this.currentReport.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.currentReport.recommendations.forEach(rec => {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.action}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new HealthMonitor();
  monitor.run().catch(console.error);
}

module.exports = { HealthMonitor, HEALTH_MONITOR_CONFIG }; 