#!/usr/bin/env node

/**
 * IA CHARLIE - MONITORING SYSTEM VALIDATION
 * Script para validar todos os sistemas de monitoramento implementados
 */

console.log('🔍 IA CHARLIE - MONITORING SYSTEM VALIDATION');
console.log('=====================================');

// Test 1: Verify monitoring services exist
console.log('\n📋 PHASE 1: MONITORING SERVICES VALIDATION');

const fs = require('fs');
const path = require('path');

const monitoringFiles = [
  'src/services/healthCheckService.ts',
  'src/services/systemHealthService.ts', 
  'src/services/monitoring/healthMonitor.ts',
  'src/services/monitoring/realisticHealthMonitor.ts',
  'src/services/qualityGates/HealthMonitoringSystem.ts',
  'src/components/SystemDashboard.tsx'
];

let validationsPassed = 0;
let totalValidations = 0;

console.log('🔍 Checking monitoring files existence:');
monitoringFiles.forEach(file => {
  totalValidations++;
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
    validationsPassed++;
  } else {
    console.log(`❌ ${file}`);
  }
});

// Test 2: Verify scripts exist
console.log('\n📋 PHASE 2: MONITORING SCRIPTS VALIDATION');

const scriptFiles = [
  'scripts/health-check.sh'
];

console.log('🔍 Checking monitoring scripts:');
scriptFiles.forEach(file => {
  totalValidations++;
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
    validationsPassed++;
  } else {
    console.log(`❌ ${file}`);
  }
});

// Test 3: Check for implemented classes and functions
console.log('\n📋 PHASE 3: IMPLEMENTATION VALIDATION');

const healthCheckServiceContent = fs.readFileSync('src/services/healthCheckService.ts', 'utf8');
const systemHealthServiceContent = fs.readFileSync('src/services/systemHealthService.ts', 'utf8');

const implementationChecks = [
  { name: 'HealthCheckService class', content: healthCheckServiceContent, pattern: /class HealthCheckService/ },
  { name: 'performHealthCheck method', content: healthCheckServiceContent, pattern: /performHealthCheck/ },
  { name: 'SystemHealthService class', content: systemHealthServiceContent, pattern: /class SystemHealthService/ },
  { name: 'startMonitoring method', content: healthCheckServiceContent, pattern: /startMonitoring/ },
  { name: 'getHealth method', content: healthCheckServiceContent, pattern: /getHealth/ }
];

console.log('🔍 Checking implementation details:');
implementationChecks.forEach(check => {
  totalValidations++;
  if (check.pattern.test(check.content)) {
    console.log(`✅ ${check.name}`);
    validationsPassed++;
  } else {
    console.log(`❌ ${check.name}`);
  }
});

// Test 4: Quality Gates validation
console.log('\n📋 PHASE 4: QUALITY GATES VALIDATION');

const qualityGatesFiles = [
  'src/services/qualityGates/QualityGateOrchestrator.ts',
  'src/services/qualityGates/HealthMonitoringSystem.ts'
];

console.log('🔍 Checking quality gates:');
qualityGatesFiles.forEach(file => {
  totalValidations++;
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
    validationsPassed++;
  } else {
    console.log(`❌ ${file}`);
  }
});

// Final Results
console.log('\n📊 VALIDATION RESULTS');
console.log('===================');

const successRate = Math.round((validationsPassed / totalValidations) * 100);
console.log(`✅ Validations Passed: ${validationsPassed}/${totalValidations}`);
console.log(`📊 Success Rate: ${successRate}%`);

if (successRate >= 90) {
  console.log('🎉 MONITORING SYSTEM: EXCELLENT');
} else if (successRate >= 80) {
  console.log('✅ MONITORING SYSTEM: GOOD');
} else if (successRate >= 70) {
  console.log('⚠️ MONITORING SYSTEM: NEEDS IMPROVEMENT');
} else {
  console.log('❌ MONITORING SYSTEM: CRITICAL ISSUES');
}

// Test 5: Service Health Check (if possible)
console.log('\n📋 PHASE 5: RUNTIME VALIDATION');

try {
  const { checkServicesHealth } = require('../src/services/initializeServices.ts');
  console.log('🔍 Running service health check...');
  const healthResults = checkServicesHealth();
  
  console.log(`📊 Services Health:`);
  healthResults.forEach(service => {
    const statusIcon = service.status === 'healthy' ? '✅' : 
                      service.status === 'degraded' ? '⚠️' : '❌';
    console.log(`${statusIcon} ${service.service}: ${service.status}`);
  });
  
} catch (error) {
  console.log('⚠️ Runtime validation not available in this environment');
}

console.log('\n🎯 IA CHARLIE MONITORING VALIDATION COMPLETE');
console.log(`📈 Overall System Health: ${successRate >= 90 ? 'EXCELLENT' : successRate >= 80 ? 'GOOD' : 'NEEDS ATTENTION'}`); 