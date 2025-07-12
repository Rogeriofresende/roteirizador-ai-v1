#!/usr/bin/env node

/**
 * Critical Files Validator V1.0
 * Script para validar arquivos críticos e prevenir falhas como a da IA Alpha
 * 
 * Uso: node scripts/validate-critical-files.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Lista de arquivos críticos que DEVEM existir
const CRITICAL_FILES = [
  'src/utils/errorCapture.ts',
  'src/App.tsx',
  'src/main.tsx',
  'package.json',
  'vite.config.ts',
  'tsconfig.json'
];

// Funções obrigatórias que devem existir em arquivos específicos
const REQUIRED_EXPORTS = {
  'src/utils/errorCapture.ts': [
    'initializeErrorCapture',
    'cleanupErrorCapture'
  ],
  'src/App.tsx': [
    'default' // export default
  ]
};

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    log(`❌ CRITICAL: File missing: ${filePath}`, 'red');
    return false;
  }
  log(`✅ File exists: ${filePath}`, 'green');
  return true;
}

function checkRequiredExports(filePath, requiredExports) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`❌ Cannot check exports: ${filePath} does not exist`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const missingExports = [];
  
  for (const exportName of requiredExports) {
    if (exportName === 'default') {
      if (!content.includes('export default')) {
        missingExports.push('export default');
      }
    } else {
      const exportRegex = new RegExp(`export\\s+.*\\b${exportName}\\b`);
      if (!exportRegex.test(content)) {
        missingExports.push(exportName);
      }
    }
  }
  
  if (missingExports.length > 0) {
    log(`❌ Missing exports in ${filePath}: ${missingExports.join(', ')}`, 'red');
    return false;
  }
  
  log(`✅ All required exports found in ${filePath}`, 'green');
  return true;
}

function runBuildTest() {
  log('🔨 Running build test...', 'blue');
  
  try {
    execSync('npm run build', { 
      cwd: ROOT_DIR, 
      stdio: 'pipe' 
    });
    log('✅ Build test passed', 'green');
    return true;
  } catch (error) {
    log('❌ Build test failed:', 'red');
    log(error.stdout?.toString() || error.message, 'red');
    return false;
  }
}

function runTypeCheck() {
  log('🔍 Running TypeScript check...', 'blue');
  
  try {
    execSync('npx tsc --noEmit', { 
      cwd: ROOT_DIR, 
      stdio: 'pipe' 
    });
    log('✅ TypeScript check passed', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript check failed:', 'red');
    log(error.stdout?.toString() || error.message, 'red');
    return false;
  }
}

function generateReport(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    overallStatus: results.every(r => r.success) ? 'PASS' : 'FAIL',
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  };
  
  const reportPath = path.join(ROOT_DIR, 'logs', 'validation-report.json');
  const logsDir = path.dirname(reportPath);
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📄 Report saved to: ${reportPath}`, 'blue');
  
  return report;
}

function main() {
  log('🚀 Starting Critical Files Validation...', 'blue');
  log('=' * 50, 'blue');
  
  const results = [];
  
  // 1. Check critical files exist
  log('\n📂 Checking critical files...', 'blue');
  for (const filePath of CRITICAL_FILES) {
    const success = checkFileExists(filePath);
    results.push({
      test: 'file_exists',
      target: filePath,
      success
    });
  }
  
  // 2. Check required exports
  log('\n📤 Checking required exports...', 'blue');
  for (const [filePath, requiredExports] of Object.entries(REQUIRED_EXPORTS)) {
    const success = checkRequiredExports(filePath, requiredExports);
    results.push({
      test: 'required_exports',
      target: filePath,
      success
    });
  }
  
  // 3. Run build test
  log('\n🔨 Running build validation...', 'blue');
  const buildSuccess = runBuildTest();
  results.push({
    test: 'build_test',
    target: 'npm run build',
    success: buildSuccess
  });
  
  // 4. Run TypeScript check
  log('\n🔍 Running TypeScript validation...', 'blue');
  const typeCheckSuccess = runTypeCheck();
  results.push({
    test: 'type_check',
    target: 'npx tsc --noEmit',
    success: typeCheckSuccess
  });
  
  // 5. Generate report
  log('\n📊 Generating report...', 'blue');
  const report = generateReport(results);
  
  // 6. Final summary
  log('\n' + '=' * 50, 'blue');
  log('📋 VALIDATION SUMMARY', 'blue');
  log('=' * 50, 'blue');
  
  if (report.overallStatus === 'PASS') {
    log(`✅ ALL VALIDATIONS PASSED (${report.summary.passed}/${report.summary.total})`, 'green');
    log('🎉 System is ready for production!', 'green');
    process.exit(0);
  } else {
    log(`❌ VALIDATIONS FAILED (${report.summary.failed}/${report.summary.total})`, 'red');
    log('🚨 System is NOT ready for production!', 'red');
    
    // Show failed tests
    const failedTests = results.filter(r => !r.success);
    log('\n💥 Failed tests:', 'red');
    failedTests.forEach(test => {
      log(`  - ${test.test}: ${test.target}`, 'red');
    });
    
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught Exception: ${error.message}`, 'red');
  process.exit(1);
});

// Run main function
main(); 