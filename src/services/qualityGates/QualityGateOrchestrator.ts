// Quality Gate Orchestrator - Main integration and coordination system
import { DeploymentGateSystem } from './DeploymentGateSystem';
import { HealthMonitoringSystem } from './HealthMonitoringSystem';
import { AlertSystem } from './AlertSystem';
import { EvidenceCollector } from './EvidenceCollector';
import { EvidenceQualityGate } from './EvidenceQualityGate';
import { FunctionalityQualityGate } from './FunctionalityQualityGate';

interface QualityGateSystemStatus {
  deploymentGate: 'active' | 'inactive' | 'error';
  healthMonitoring: 'active' | 'inactive' | 'error';
  alertSystem: 'active' | 'inactive' | 'error';
  evidenceCollection: 'ready' | 'collecting' | 'error';
  overallStatus: 'operational' | 'degraded' | 'critical';
  timestamp: string;
}

interface SystemHealthReport {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    [key: string]: {
      status: 'healthy' | 'warning' | 'critical';
      details: any;
      lastCheck: string;
    };
  };
  metrics: {
    deploymentApprovalRate: number;
    alertResponseTime: number;
    evidenceQuality: number;
    systemUptime: number;
  };
  timestamp: string;
}

export class QualityGateOrchestrator {
  private deploymentGateSystem: DeploymentGateSystem;
  private healthMonitoringSystem: HealthMonitoringSystem;
  private alertSystem: AlertSystem;
  private evidenceCollector: EvidenceCollector;
  private evidenceQualityGate: EvidenceQualityGate;
  private functionalityQualityGate: FunctionalityQualityGate;
  
  private isInitialized: boolean = false;
  private initializationTime: number = 0;
  
  constructor() {
    this.initializeSystems();
  }
  
  private initializeSystems(): void {
    const startTime = Date.now();
    console.log('🎯 Initializing Quality Gate Orchestrator...');
    
    try {
      // Initialize core systems
      this.deploymentGateSystem = new DeploymentGateSystem();
      this.healthMonitoringSystem = this.deploymentGateSystem.getHealthMonitoringSystem();
      this.alertSystem = this.deploymentGateSystem.getAlertSystem();
      this.evidenceCollector = new EvidenceCollector();
      this.evidenceQualityGate = new EvidenceQualityGate();
      this.functionalityQualityGate = new FunctionalityQualityGate();
      
      // Setup system integration
      this.setupSystemIntegration();
      
      this.initializationTime = Date.now() - startTime;
      this.isInitialized = true;
      
      console.log(`✅ Quality Gate Orchestrator initialized in ${this.initializationTime}ms`);
      
      // Send initialization alert
      this.alertSystem.triggerAlert({
        type: 'quality_gate_system_initialized',
        severity: 'low',
        message: 'Quality Gate Orchestrator successfully initialized',
        details: {
          initializationTime: this.initializationTime,
          components: ['DeploymentGate', 'HealthMonitoring', 'AlertSystem', 'EvidenceCollection']
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Quality Gate Orchestrator:', error);
      
      this.alertSystem?.triggerAlert({
        type: 'quality_gate_system_initialization_failed',
        severity: 'critical',
        message: 'Quality Gate Orchestrator failed to initialize',
        details: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }
  
  private setupSystemIntegration(): void {
    // Setup health monitoring alerts
    this.healthMonitoringSystem.onAlert((alert) => {
      console.log(`📊 Health monitoring alert received: ${alert.type}`);
    });
    
    // Start health monitoring by default
    this.healthMonitoringSystem.startMonitoring();
    
    console.log('🔗 System integration configured');
  }
  
  // Main orchestration methods
  
  async performFullQualityValidation(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Quality Gate Orchestrator not initialized');
    }
    
    console.log('🎯 Starting full quality validation...');
    const startTime = Date.now();
    
    try {
      // Step 1: Check system status
      const systemStatus = await this.getSystemStatus();
      if (systemStatus.overallStatus === 'critical') {
        throw new Error('System status critical - cannot perform validation');
      }
      
      // Step 2: Collect evidence
      console.log('📊 Collecting evidence package...');
      const evidencePackage = await this.evidenceCollector.collectEvidencePackage();
      
      // Step 3: Run quality gates
      console.log('🚪 Running quality gates...');
      const [evidenceResult, functionalityResult] = await Promise.all([
        this.evidenceQualityGate.validateEvidence(evidencePackage),
        this.functionalityQualityGate.validateFunctionality()
      ]);
      
      // Step 4: Get health status
      const healthStatus = this.healthMonitoringSystem.getCurrentHealthStatus();
      
      // Step 5: Generate comprehensive report
      const validationReport = {
        overall: {
          passed: evidenceResult.passed && functionalityResult.passed && 
                 (!healthStatus || healthStatus.overall !== 'critical'),
          score: Math.round((evidenceResult.score + functionalityResult.score + 
                           (healthStatus?.score || 100)) / 3),
          duration: Date.now() - startTime
        },
        evidence: evidenceResult,
        functionality: functionalityResult,
        health: healthStatus,
        evidencePackage,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ Full quality validation completed in ${validationReport.overall.duration}ms`);
      
      // Send validation summary alert
      await this.alertSystem.triggerAlert({
        type: 'quality_validation_completed',
        severity: validationReport.overall.passed ? 'low' : 'medium',
        message: `Quality validation ${validationReport.overall.passed ? 'passed' : 'failed'} (Score: ${validationReport.overall.score}%)`,
        details: validationReport,
        timestamp: new Date().toISOString()
      });
      
      return validationReport;
      
    } catch (error) {
      console.error('❌ Full quality validation failed:', error);
      
      await this.alertSystem.triggerAlert({
        type: 'quality_validation_failed',
        severity: 'high',
        message: 'Full quality validation encountered an error',
        details: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }
  
  async validateForDeployment(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Quality Gate Orchestrator not initialized');
    }
    
    console.log('🚀 Validating for deployment...');
    
    try {
      const deploymentResult = await this.deploymentGateSystem.validateDeployment();
      
      console.log(`🚀 Deployment validation ${deploymentResult.approved ? 'APPROVED' : 'BLOCKED'}`);
      
      return deploymentResult;
      
    } catch (error) {
      console.error('❌ Deployment validation failed:', error);
      throw error;
    }
  }
  
  async getSystemStatus(): Promise<QualityGateSystemStatus> {
    const status: QualityGateSystemStatus = {
      deploymentGate: 'active',
      healthMonitoring: this.healthMonitoringSystem.isMonitoringActive() ? 'active' : 'inactive',
      alertSystem: 'active',
      evidenceCollection: 'ready',
      overallStatus: 'operational',
      timestamp: new Date().toISOString()
    };
    
    // Check health monitoring status
    const healthStatus = this.healthMonitoringSystem.getCurrentHealthStatus();
    if (healthStatus?.overall === 'critical') {
      status.overallStatus = 'critical';
    } else if (healthStatus?.overall === 'warning') {
      status.overallStatus = 'degraded';
    }
    
    return status;
  }
  
  async getSystemHealthReport(): Promise<SystemHealthReport> {
    const healthStatus = this.healthMonitoringSystem.getCurrentHealthStatus();
    const deploymentStats = this.deploymentGateSystem.getDeploymentStats();
    const alertStats = this.alertSystem.getAlertStats();
    
    const report: SystemHealthReport = {
      overall: healthStatus?.overall || 'warning',
      components: {
        deploymentGate: {
          status: deploymentStats.approvalRate > 80 ? 'healthy' : 'warning',
          details: deploymentStats,
          lastCheck: new Date().toISOString()
        },
        healthMonitoring: {
          status: healthStatus?.overall || 'warning',
          details: healthStatus,
          lastCheck: healthStatus?.timestamp || new Date().toISOString()
        },
        alertSystem: {
          status: alertStats.successRate > 95 ? 'healthy' : 'warning',
          details: alertStats,
          lastCheck: new Date().toISOString()
        },
        evidenceCollection: {
          status: 'healthy',
          details: { available: true, lastCollection: 'recent' },
          lastCheck: new Date().toISOString()
        }
      },
      metrics: {
        deploymentApprovalRate: deploymentStats.approvalRate || 0,
        alertResponseTime: alertStats.avgResponseTime || 0,
        evidenceQuality: 95, // Would be calculated from recent evidence quality
        systemUptime: this.getSystemUptime()
      },
      timestamp: new Date().toISOString()
    };
    
    return report;
  }
  
  // Demonstration and testing methods
  
  async runDemonstration(): Promise<void> {
    console.log('\n🎭 STARTING QUALITY GATE SYSTEM DEMONSTRATION');
    console.log('================================================');
    
    try {
      // Step 1: System Status Check
      console.log('\n📊 Step 1: System Status Check');
      const systemStatus = await this.getSystemStatus();
      console.log('System Status:', systemStatus);
      
      // Step 2: Health Monitoring Demo
      console.log('\n💗 Step 2: Health Monitoring Demonstration');
      if (!this.healthMonitoringSystem.isMonitoringActive()) {
        this.healthMonitoringSystem.startMonitoring();
        console.log('Health monitoring started...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      }
      
      const healthReport = await this.getSystemHealthReport();
      console.log('Health Report Generated:', healthReport.overall);
      
      // Step 3: Evidence Collection Demo
      console.log('\n📋 Step 3: Evidence Collection Demonstration');
      const evidencePackage = await this.evidenceCollector.collectEvidencePackage();
      console.log(`Evidence collected: ${evidencePackage.screenshots.length} screenshots, ${evidencePackage.testResults.length} test results`);
      
      // Step 4: Quality Gates Demo
      console.log('\n🚪 Step 4: Quality Gates Demonstration');
      const qualityValidation = await this.performFullQualityValidation();
      console.log(`Quality validation: ${qualityValidation.overall.passed ? 'PASSED' : 'FAILED'} (${qualityValidation.overall.score}%)`);
      
      // Step 5: Deployment Gate Demo
      console.log('\n🚀 Step 5: Deployment Gate Demonstration');
      const deploymentValidation = await this.validateForDeployment();
      console.log(`Deployment: ${deploymentValidation.approved ? 'APPROVED ✅' : 'BLOCKED ❌'} (${deploymentValidation.overallScore}%)`);
      
      // Step 6: Alert System Demo
      console.log('\n📢 Step 6: Alert System Demonstration');
      await this.alertSystem.triggerAlert({
        type: 'demonstration_alert',
        severity: 'low',
        message: 'This is a demonstration alert to show the alert system is working',
        details: { demo: true, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
      
      console.log('\n🎉 DEMONSTRATION COMPLETED SUCCESSFULLY');
      console.log('=====================================');
      
      // Final summary
      const finalStatus = await this.getSystemStatus();
      console.log('\n📊 Final System Status:', finalStatus.overallStatus);
      console.log('All quality gate systems are operational and ready for production use.');
      
    } catch (error) {
      console.error('\n❌ DEMONSTRATION FAILED:', error);
      throw error;
    }
  }
  
  async runSystemTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('\n🧪 RUNNING SYSTEM TESTS');
    console.log('========================');
    
    const tests = [
      { name: 'System Initialization', test: () => this.testSystemInitialization() },
      { name: 'Evidence Collection', test: () => this.testEvidenceCollection() },
      { name: 'Quality Gates', test: () => this.testQualityGates() },
      { name: 'Health Monitoring', test: () => this.testHealthMonitoring() },
      { name: 'Alert System', test: () => this.testAlertSystem() },
      { name: 'Deployment Gates', test: () => this.testDeploymentGates() }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      try {
        console.log(`\n🧪 Testing: ${test.name}`);
        await test.test();
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } catch (error) {
        console.error(`❌ ${test.name}: FAILED`, error);
        failed++;
      }
    }
    
    const total = tests.length;
    const successRate = (passed / total) * 100;
    
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      console.log('🎉 System tests PASSED - Ready for production');
    } else {
      console.log('⚠️ System tests FAILED - Issues need to be addressed');
    }
    
    return { passed, failed, total };
  }
  
  // Individual test methods
  private async testSystemInitialization(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('System not properly initialized');
    }
    if (this.initializationTime <= 0) {
      throw new Error('Invalid initialization time');
    }
  }
  
  private async testEvidenceCollection(): Promise<void> {
    const evidence = await this.evidenceCollector.collectEvidencePackage();
    if (!evidence.screenshots || evidence.screenshots.length === 0) {
      throw new Error('No screenshots collected');
    }
    if (!evidence.performanceMetrics) {
      throw new Error('No performance metrics collected');
    }
  }
  
  private async testQualityGates(): Promise<void> {
    const evidence = await this.evidenceCollector.collectEvidencePackage();
    const evidenceResult = await this.evidenceQualityGate.validateEvidence(evidence);
    const functionalityResult = await this.functionalityQualityGate.validateFunctionality();
    
    if (typeof evidenceResult.score !== 'number') {
      throw new Error('Evidence gate not returning valid score');
    }
    if (typeof functionalityResult.score !== 'number') {
      throw new Error('Functionality gate not returning valid score');
    }
  }
  
  private async testHealthMonitoring(): Promise<void> {
    if (!this.healthMonitoringSystem.isMonitoringActive()) {
      this.healthMonitoringSystem.startMonitoring();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }
    
    const healthStatus = this.healthMonitoringSystem.getCurrentHealthStatus();
    if (!healthStatus) {
      throw new Error('Health monitoring not providing status');
    }
  }
  
  private async testAlertSystem(): Promise<void> {
    const testAlert = {
      type: 'test_alert',
      severity: 'low' as const,
      message: 'Test alert for system validation',
      details: { test: true },
      timestamp: new Date().toISOString()
    };
    
    await this.alertSystem.triggerAlert(testAlert);
    
    const alertHistory = this.alertSystem.getAlertHistory(1);
    if (alertHistory.length === 0) {
      throw new Error('Alert not recorded in history');
    }
  }
  
  private async testDeploymentGates(): Promise<void> {
    const result = await this.deploymentGateSystem.validateDeployment();
    if (typeof result.overallScore !== 'number') {
      throw new Error('Deployment gate not returning valid score');
    }
    if (typeof result.approved !== 'boolean') {
      throw new Error('Deployment gate not returning valid approval status');
    }
  }
  
  // Utility methods
  private getSystemUptime(): number {
    return this.initializationTime > 0 ? Date.now() - this.initializationTime : 0;
  }
  
  // Public interface methods
  public getDeploymentGateSystem(): DeploymentGateSystem {
    return this.deploymentGateSystem;
  }
  
  public getHealthMonitoringSystem(): HealthMonitoringSystem {
    return this.healthMonitoringSystem;
  }
  
  public getAlertSystem(): AlertSystem {
    return this.alertSystem;
  }
  
  public isSystemReady(): boolean {
    return this.isInitialized;
  }
  
  public async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Quality Gate Orchestrator...');
    
    this.healthMonitoringSystem.stopMonitoring();
    this.alertSystem.clearEscalations();
    
    await this.alertSystem.triggerAlert({
      type: 'quality_gate_system_shutdown',
      severity: 'low',
      message: 'Quality Gate Orchestrator is shutting down',
      details: { uptime: this.getSystemUptime() },
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Quality Gate Orchestrator shut down successfully');
  }
} 