// Quality Gates System - Main Export Index
// Week 4.2 Evidence-Based Validation & Best Practices Implementation
// IA Charlie - Quality Gates & Monitoring Specialist

// Core Quality Gate Systems
export { EvidenceQualityGate } from './EvidenceQualityGate';
export { FunctionalityQualityGate } from './FunctionalityQualityGate';
export { EvidenceCollector } from './EvidenceCollector';

// Monitoring & Alerting Systems
export { HealthMonitoringSystem } from './HealthMonitoringSystem';
export { AlertSystem } from './AlertSystem';

// Deployment & Integration Systems
export { DeploymentGateSystem } from './DeploymentGateSystem';
export { QualityGateOrchestrator } from './QualityGateOrchestrator';

// Types and Interfaces (re-export commonly used types)
export type {
  EvidencePackage,
  QualityGateResult,
  Screenshot,
  PerformanceMetrics,
  TestResult,
  UserJourneyEvidence,
  BrowserCompatibilityReport
} from './EvidenceQualityGate';

export type {
  Alert,
  HealthCheckResult,
  HealthStatus
} from './HealthMonitoringSystem';

// Quick Start Helper Function
export const initializeQualityGateSystem = () => {
  console.log('🛡️ Initializing Quality Gate System...');
  
  try {
    const orchestrator = new QualityGateOrchestrator();
    
    console.log('✅ Quality Gate System initialized successfully!');
    console.log('📊 Available systems:');
    console.log('  🔍 Evidence Quality Gate');
    console.log('  🔧 Functionality Quality Gate');
    console.log('  📊 Evidence Collector');
    console.log('  💗 Health Monitoring System');
    console.log('  📢 Alert System');
    console.log('  🚀 Deployment Gate System');
    console.log('  🎯 Quality Gate Orchestrator');
    
    return orchestrator;
  } catch (error) {
    console.error('❌ Failed to initialize Quality Gate System:', error);
    throw error;
  }
};

// System Constants
export const QUALITY_GATE_CONFIG = {
  EVIDENCE_THRESHOLD: 85,
  FUNCTIONALITY_THRESHOLD: 95,
  HEALTH_THRESHOLD: 80,
  ALERT_RESPONSE_TIME: 100, // ms
  HEALTH_CHECK_INTERVAL: 10000, // 10 seconds
  EVIDENCE_COLLECTION_TIMEOUT: 30000, // 30 seconds
} as const;

// Version Information
export const QUALITY_GATE_VERSION = {
  VERSION: '1.0.0',
  BUILD: 'Week 4.2',
  RELEASE_DATE: '2024',
  AUTHOR: 'IA Charlie - Quality Gates & Monitoring Specialist'
} as const; 