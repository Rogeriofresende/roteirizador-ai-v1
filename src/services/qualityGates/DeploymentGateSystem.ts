// Deployment Gate System - Final validation before deployment
import { EvidenceQualityGate, EvidencePackage, QualityGateResult } from './EvidenceQualityGate';
import { FunctionalityQualityGate } from './FunctionalityQualityGate';
import { HealthMonitoringSystem } from './HealthMonitoringSystem';
import { AlertSystem } from './AlertSystem';
import { EvidenceCollector } from './EvidenceCollector';

interface DeploymentGateConfig {
  evidenceThreshold: number;
  functionalityThreshold: number;
  healthThreshold: number;
  requireAllGatesPassing: boolean;
  blockOnCriticalFailures: boolean;
  evidenceValidationEnabled: boolean;
}

interface DeploymentValidationResult {
  approved: boolean;
  overallScore: number;
  gateResults: {
    evidence: QualityGateResult | null;
    functionality: QualityGateResult | null;
    health: any | null;
  };
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: string;
  evidencePackage?: EvidencePackage;
}

interface DeploymentAttempt {
  id: string;
  timestamp: string;
  result: DeploymentValidationResult;
  duration: number;
  blockedReason?: string;
}

export class DeploymentGateSystem {
  private evidenceQualityGate: EvidenceQualityGate;
  private functionalityQualityGate: FunctionalityQualityGate;
  private healthMonitoringSystem: HealthMonitoringSystem;
  private alertSystem: AlertSystem;
  private evidenceCollector: EvidenceCollector;
  
  private config: DeploymentGateConfig;
  private deploymentHistory: DeploymentAttempt[] = [];
  private isValidating: boolean = false;
  
  constructor(
    config: Partial<DeploymentGateConfig> = {}
  ) {
    this.config = {
      evidenceThreshold: 85,
      functionalityThreshold: 95,
      healthThreshold: 80,
      requireAllGatesPassing: true,
      blockOnCriticalFailures: true,
      evidenceValidationEnabled: true,
      ...config
    };
    
    // Initialize all quality gate systems
    this.evidenceQualityGate = new EvidenceQualityGate();
    this.functionalityQualityGate = new FunctionalityQualityGate();
    this.healthMonitoringSystem = new HealthMonitoringSystem();
    this.alertSystem = new AlertSystem();
    this.evidenceCollector = new EvidenceCollector();
    
    console.log('🛡️ Deployment Gate System initialized');
    this.logConfiguration();
  }
  
  async validateDeployment(): Promise<DeploymentValidationResult> {
    if (this.isValidating) {
      throw new Error('Deployment validation already in progress');
    }
    
    this.isValidating = true;
    const startTime = Date.now();
    const deploymentId = this.generateDeploymentId();
    
    console.log(`🚀 Starting deployment validation: ${deploymentId}`);
    
    try {
      // Collect evidence package first
      let evidencePackage: EvidencePackage | undefined;
      if (this.config.evidenceValidationEnabled) {
        console.log('📊 Collecting evidence package...');
        evidencePackage = await this.evidenceCollector.collectEvidencePackage();
      }
      
      // Run all quality gates in parallel
      const gatePromises = {
        evidence: this.config.evidenceValidationEnabled && evidencePackage 
          ? this.runEvidenceGate(evidencePackage)
          : Promise.resolve(null),
        functionality: this.runFunctionalityGate(),
        health: this.runHealthGate()
      };
      
      const gateResults = await this.executeGatesWithTimeout(gatePromises);
      
      // Validate results and make deployment decision
      const validationResult = this.evaluateDeploymentApproval(
        gateResults, 
        evidencePackage,
        deploymentId
      );
      
      const duration = Date.now() - startTime;
      
      // Record deployment attempt
      const deploymentAttempt: DeploymentAttempt = {
        id: deploymentId,
        timestamp: new Date().toISOString(),
        result: validationResult,
        duration,
        blockedReason: validationResult.approved ? undefined : this.getBlockingReason(validationResult)
      };
      
      this.recordDeploymentAttempt(deploymentAttempt);
      
      // Send alerts based on result
      await this.sendDeploymentAlerts(validationResult);
      
      // Log final result
      this.logDeploymentResult(validationResult, duration);
      
      return validationResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Deployment validation failed:', error);
      
      // Create failure result
      const failureResult: DeploymentValidationResult = {
        approved: false,
        overallScore: 0,
        gateResults: { evidence: null, functionality: null, health: null },
        criticalIssues: [`Deployment validation system error: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        recommendations: ['Fix deployment validation system errors before attempting deployment'],
        timestamp: new Date().toISOString()
      };
      
      // Record failed attempt
      this.recordDeploymentAttempt({
        id: deploymentId,
        timestamp: new Date().toISOString(),
        result: failureResult,
        duration,
        blockedReason: 'System error during validation'
      });
      
      // Send critical alert
      await this.alertSystem.triggerAlert({
        type: 'deployment_validation_system_error',
        severity: 'critical',
        message: 'Deployment validation system encountered a critical error',
        details: { error, deploymentId },
        timestamp: new Date().toISOString()
      });
      
      return failureResult;
      
    } finally {
      this.isValidating = false;
    }
  }
  
  private async executeGatesWithTimeout(gatePromises: any, timeoutMs: number = 60000): Promise<any> {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Quality gates validation timeout')), timeoutMs)
    );
    
    return Promise.race([
      Promise.all([
        gatePromises.evidence.catch((error: any) => ({ error: error.message })),
        gatePromises.functionality.catch((error: any) => ({ error: error.message })),
        gatePromises.health.catch((error: any) => ({ error: error.message }))
      ]).then(([evidence, functionality, health]) => ({
        evidence,
        functionality,
        health
      })),
      timeout
    ]);
  }
  
  private async runEvidenceGate(evidencePackage: EvidencePackage): Promise<QualityGateResult> {
    console.log('🔍 Running Evidence Quality Gate...');
    return await this.evidenceQualityGate.validateEvidence(evidencePackage);
  }
  
  private async runFunctionalityGate(): Promise<QualityGateResult> {
    console.log('🔧 Running Functionality Quality Gate...');
    return await this.functionalityQualityGate.validateFunctionality();
  }
  
  private async runHealthGate(): Promise<any> {
    console.log('📊 Checking Health Status...');
    const healthStatus = this.healthMonitoringSystem.getCurrentHealthStatus();
    
    if (!healthStatus) {
      // If no health status available, start monitoring and wait for first result
      this.healthMonitoringSystem.startMonitoring();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return this.healthMonitoringSystem.getCurrentHealthStatus();
    }
    
    return healthStatus;
  }
  
  private evaluateDeploymentApproval(
    gateResults: any, 
    evidencePackage?: EvidencePackage,
    deploymentId?: string
  ): DeploymentValidationResult {
    
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Evaluate Evidence Gate
    if (gateResults.evidence && !gateResults.evidence.error) {
      if (gateResults.evidence.score < this.config.evidenceThreshold) {
        criticalIssues.push(`Evidence quality below threshold: ${gateResults.evidence.score}% (required: ${this.config.evidenceThreshold}%)`);
      }
      if (gateResults.evidence.issues) {
        criticalIssues.push(...gateResults.evidence.issues);
      }
      if (gateResults.evidence.recommendations) {
        recommendations.push(...gateResults.evidence.recommendations);
      }
    } else if (this.config.evidenceValidationEnabled) {
      criticalIssues.push('Evidence validation failed or unavailable');
    }
    
    // Evaluate Functionality Gate
    if (gateResults.functionality && !gateResults.functionality.error) {
      if (gateResults.functionality.score < this.config.functionalityThreshold) {
        criticalIssues.push(`Functionality score below threshold: ${gateResults.functionality.score}% (required: ${this.config.functionalityThreshold}%)`);
      }
      if (gateResults.functionality.issues) {
        criticalIssues.push(...gateResults.functionality.issues);
      }
      if (gateResults.functionality.recommendations) {
        recommendations.push(...gateResults.functionality.recommendations);
      }
      
      // Check for critical functionality failures
      if (gateResults.functionality.details?.criticalFailures > 0) {
        criticalIssues.push(`Critical functionality failures: ${gateResults.functionality.details.criticalFailures}`);
      }
    } else {
      criticalIssues.push('Functionality validation failed or unavailable');
    }
    
    // Evaluate Health Gate
    if (gateResults.health && !gateResults.health.error) {
      if (gateResults.health.score < this.config.healthThreshold) {
        if (gateResults.health.overall === 'critical') {
          criticalIssues.push(`System health critical: ${gateResults.health.score}% (required: ${this.config.healthThreshold}%)`);
        } else {
          warnings.push(`System health below threshold: ${gateResults.health.score}% (required: ${this.config.healthThreshold}%)`);
        }
      }
      if (gateResults.health.issues) {
        if (gateResults.health.overall === 'critical') {
          criticalIssues.push(...gateResults.health.issues);
        } else {
          warnings.push(...gateResults.health.issues);
        }
      }
      if (gateResults.health.recommendations) {
        recommendations.push(...gateResults.health.recommendations);
      }
    } else {
      warnings.push('Health status unavailable');
    }
    
    // Calculate overall score
    const scores: number[] = [];
    if (gateResults.evidence && !gateResults.evidence.error) scores.push(gateResults.evidence.score);
    if (gateResults.functionality && !gateResults.functionality.error) scores.push(gateResults.functionality.score);
    if (gateResults.health && !gateResults.health.error) scores.push(gateResults.health.score);
    
    const overallScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    // Determine approval
    let approved = true;
    
    if (this.config.blockOnCriticalFailures && criticalIssues.length > 0) {
      approved = false;
    }
    
    if (this.config.requireAllGatesPassing) {
      const evidencePassing = !gateResults.evidence || gateResults.evidence.error || gateResults.evidence.passed;
      const functionalityPassing = !gateResults.functionality || gateResults.functionality.error || gateResults.functionality.passed;
      const healthPassing = !gateResults.health || gateResults.health.error || gateResults.health.overall !== 'critical';
      
      if (!evidencePassing || !functionalityPassing || !healthPassing) {
        approved = false;
      }
    }
    
    return {
      approved,
      overallScore: Math.round(overallScore),
      gateResults,
      criticalIssues,
      warnings,
      recommendations,
      timestamp: new Date().toISOString(),
      evidencePackage
    };
  }
  
  private getBlockingReason(result: DeploymentValidationResult): string {
    if (result.criticalIssues.length > 0) {
      return `Critical issues: ${result.criticalIssues.join('; ')}`;
    }
    
    if (result.overallScore < 80) {
      return `Overall score too low: ${result.overallScore}%`;
    }
    
    return 'Quality gates not passing';
  }
  
  private async sendDeploymentAlerts(result: DeploymentValidationResult): Promise<void> {
    if (!result.approved) {
      await this.alertSystem.triggerAlert({
        type: 'deployment_blocked',
        severity: result.criticalIssues.length > 0 ? 'high' : 'medium',
        message: `Deployment blocked - Quality gates not passing (Score: ${result.overallScore}%)`,
        details: {
          criticalIssues: result.criticalIssues,
          warnings: result.warnings,
          overallScore: result.overallScore,
          gateResults: result.gateResults
        },
        timestamp: new Date().toISOString()
      });
    } else {
      await this.alertSystem.triggerAlert({
        type: 'deployment_approved',
        severity: 'low',
        message: `Deployment approved - All quality gates passing (Score: ${result.overallScore}%)`,
        details: {
          overallScore: result.overallScore,
          warnings: result.warnings,
          gateResults: result.gateResults
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private recordDeploymentAttempt(attempt: DeploymentAttempt): void {
    this.deploymentHistory.push(attempt);
    
    // Keep only last 50 deployment attempts
    if (this.deploymentHistory.length > 50) {
      this.deploymentHistory = this.deploymentHistory.slice(-50);
    }
    
    console.log(`📝 Deployment attempt recorded: ${attempt.id}`);
  }
  
  private generateDeploymentId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `deploy-${timestamp}-${random}`;
  }
  
  private logConfiguration(): void {
    console.log('\n🛡️ DEPLOYMENT GATE CONFIGURATION:');
    console.log(`📊 Evidence Threshold: ${this.config.evidenceThreshold}%`);
    console.log(`🔧 Functionality Threshold: ${this.config.functionalityThreshold}%`);
    console.log(`💗 Health Threshold: ${this.config.healthThreshold}%`);
    console.log(`🔒 Require All Gates Passing: ${this.config.requireAllGatesPassing}`);
    console.log(`🚫 Block on Critical Failures: ${this.config.blockOnCriticalFailures}`);
    console.log(`📋 Evidence Validation: ${this.config.evidenceValidationEnabled ? 'Enabled' : 'Disabled'}`);
  }
  
  private logDeploymentResult(result: DeploymentValidationResult, duration: number): void {
    console.log('\n🚀 DEPLOYMENT VALIDATION RESULT:');
    console.log(`✅ Status: ${result.approved ? 'APPROVED ✅' : 'BLOCKED ❌'}`);
    console.log(`📊 Overall Score: ${result.overallScore}%`);
    console.log(`⏱️ Validation Duration: ${duration}ms`);
    console.log(`⏰ Timestamp: ${result.timestamp}`);
    
    // Log gate results
    console.log('\n📋 Gate Results:');
    if (result.gateResults.evidence) {
      console.log(`  Evidence: ${result.gateResults.evidence.passed ? '✅' : '❌'} (${result.gateResults.evidence.score}%)`);
    }
    if (result.gateResults.functionality) {
      console.log(`  Functionality: ${result.gateResults.functionality.passed ? '✅' : '❌'} (${result.gateResults.functionality.score}%)`);
    }
    if (result.gateResults.health) {
      console.log(`  Health: ${result.gateResults.health.overall === 'healthy' ? '✅' : '❌'} (${result.gateResults.health.score}%)`);
    }
    
    if (result.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      result.criticalIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }
  
  // Public methods for system management
  public getDeploymentHistory(limit: number = 10): DeploymentAttempt[] {
    return this.deploymentHistory.slice(-limit);
  }
  
  public getDeploymentStats(): any {
    if (this.deploymentHistory.length === 0) {
      return {
        totalAttempts: 0,
        approvedAttempts: 0,
        blockedAttempts: 0,
        approvalRate: 0,
        avgScore: 0,
        avgDuration: 0
      };
    }
    
    const approvedAttempts = this.deploymentHistory.filter(attempt => attempt.result.approved);
    const blockedAttempts = this.deploymentHistory.filter(attempt => !attempt.result.approved);
    
    const avgScore = this.deploymentHistory.reduce((sum, attempt) => 
      sum + attempt.result.overallScore, 0) / this.deploymentHistory.length;
    
    const avgDuration = this.deploymentHistory.reduce((sum, attempt) => 
      sum + attempt.duration, 0) / this.deploymentHistory.length;
    
    return {
      totalAttempts: this.deploymentHistory.length,
      approvedAttempts: approvedAttempts.length,
      blockedAttempts: blockedAttempts.length,
      approvalRate: (approvedAttempts.length / this.deploymentHistory.length) * 100,
      avgScore: Math.round(avgScore),
      avgDuration: Math.round(avgDuration)
    };
  }
  
  public updateConfiguration(newConfig: Partial<DeploymentGateConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Deployment gate configuration updated');
    this.logConfiguration();
  }
  
  public isValidationInProgress(): boolean {
    return this.isValidating;
  }
  
  public getHealthMonitoringSystem(): HealthMonitoringSystem {
    return this.healthMonitoringSystem;
  }
  
  public getAlertSystem(): AlertSystem {
    return this.alertSystem;
  }
} 