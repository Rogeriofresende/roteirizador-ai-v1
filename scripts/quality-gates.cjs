#!/usr/bin/env node

/**
 * Quality Gates Script - Week 4.2 Evidence Infrastructure
 * Validates application health and evidence collection before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔍 Running Quality Gates Validation...\n');
  
  const results = [];
  
  // Gate 1: Application Health Check
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173', { encoding: 'utf8' });
    const isHealthy = response.trim() === '200';
    
    results.push({
      name: 'Application Health',
      passed: isHealthy,
      message: isHealthy ? 'Application responding on port 5173' : `Application not responding (HTTP ${response})`,
      evidence: `HTTP Status: ${response}`
    });
  } catch (error) {
    results.push({
      name: 'Application Health',
      passed: false,
      message: 'Failed to check application health',
      evidence: `Error: ${error.message}`
    });
  }
  
  // Gate 2: Evidence Directory Check
  const evidenceDir = path.join(process.cwd(), 'evidence');
  const hasEvidence = fs.existsSync(evidenceDir);
  const evidenceFiles = hasEvidence ? fs.readdirSync(evidenceDir).length : 0;
  
  results.push({
    name: 'Evidence Collection',
    passed: hasEvidence && evidenceFiles > 0,
    message: hasEvidence ? `Evidence directory exists with ${evidenceFiles} files` : 'Evidence directory not found',
    evidence: hasEvidence ? `Files: ${evidenceFiles}` : 'No evidence collected'
  });
  
  // Gate 3: Cypress Configuration Check
  const cypressConfig = path.join(process.cwd(), 'cypress.config.js');
  const hasCypress = fs.existsSync(cypressConfig);
  
  results.push({
    name: 'Cypress Configuration',
    passed: hasCypress,
    message: hasCypress ? 'Cypress configuration found' : 'Cypress configuration missing',
    evidence: hasCypress ? 'cypress.config.js exists' : 'Configuration file not found'
  });
  
  // Gate 4: Test Infrastructure Check
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasTestScripts = packageJson.scripts && packageJson.scripts['test:evidence'];
  
  results.push({
    name: 'Test Infrastructure',
    passed: hasTestScripts,
    message: hasTestScripts ? 'Test scripts available' : 'Test scripts missing',
    evidence: hasTestScripts ? 'test:evidence script found' : 'No test scripts configured'
  });
  
  // Gate 5: Build Status Check
  const distDir = path.join(process.cwd(), 'dist');
  const hasBuild = fs.existsSync(distDir);
  
  results.push({
    name: 'Build Artifacts',
    passed: hasBuild,
    message: hasBuild ? 'Production build available' : 'No build artifacts found',
    evidence: hasBuild ? 'dist directory exists' : 'Build required'
  });
  
  // Display Results
  console.log('📊 Quality Gates Results:\n');
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${result.name}: ${status}`);
    console.log(`   ${result.message}`);
    if (result.evidence) {
      console.log(`   Evidence: ${result.evidence}`);
    }
    console.log('');
  });
  
  // Final Result
  const passedGates = results.filter(r => r.passed).length;
  const totalGates = results.length;
  const passRate = (passedGates / totalGates) * 100;
  
  console.log(`📈 Quality Gates Summary: ${passedGates}/${totalGates} (${passRate.toFixed(1)}%)\n`);
  
  if (passedGates === totalGates) {
    console.log('🎉 All Quality Gates PASSED! Infrastructure ready for production.');
    process.exit(0);
  } else if (passRate >= 80) {
    console.log('⚠️  Most Quality Gates passed. Infrastructure operational with minor issues.');
    process.exit(0);
  } else {
    console.log('🚨 Quality Gates FAILED! Infrastructure needs attention.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 