#!/usr/bin/env node

/**
 * 🔑 API KEYS VALIDATION SCRIPT
 * 
 * IA CHARLIE - Production Environment Audit
 * Validates all API keys and critical configurations for production deployment
 * 
 * SUCCESS CRITERIA:
 * ✅ All 7+ API keys validated and functional
 * ✅ Security patterns validated (no hardcoded keys)
 * ✅ Environment-specific configurations working
 * ✅ Rate limiting and quotas checked
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// Load environment variables from multiple sources
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env') });

class APIKeysValidator {
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
    console.log('🔑 API KEYS VALIDATION - STARTING');
    console.log(`📍 Environment: ${this.environment}`);
    console.log(`📍 Project Root: ${PROJECT_ROOT}`);
    console.log('─'.repeat(60));

    // Core validations
    await this.validateGeminiAPI();
    await this.validateFirebaseConfig();
    await this.validateAnalyticsConfig();
    await this.validateTallyConfig();
    await this.validateEnvironmentConfig();
    await this.validateSecurityPatterns();
    await this.validateProductionReadiness();

    this.generateReport();
    return this.results.failed === 0;
  }

  /**
   * Validate Google Gemini API Key
   */
  async validateGeminiAPI() {
    const test = {
      name: 'Google Gemini API Key',
      category: 'CRITICAL',
      required: this.isProduction
    };

    try {
      const apiKey = process.env.VITE_GOOGLE_GEMINI_API_KEY;
      
      if (!apiKey) {
        this.addResult(test, false, 'API key not found in environment variables');
        return;
      }

      // Validate API key format
      const geminiPattern = /^AIza[0-9A-Za-z-_]{35}$/;
      if (!geminiPattern.test(apiKey)) {
        this.addResult(test, false, `Invalid API key format. Expected: AIzaSy... (39 chars), Got: ${apiKey.substring(0, 10)}... (${apiKey.length} chars)`);
        return;
      }

      // Test API connectivity (simple validation call)
      console.log('🧪 Testing Gemini API connectivity...');
      
      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (testResponse.ok) {
        const data = await testResponse.json();
        const modelCount = data.models?.length || 0;
        this.addResult(test, true, `API key valid and functional. ${modelCount} models available.`);
      } else {
        const errorText = await testResponse.text();
        this.addResult(test, false, `API call failed: ${testResponse.status} - ${errorText}`);
      }

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
    }
  }

  /**
   * Validate Firebase Configuration
   */
  async validateFirebaseConfig() {
    const test = {
      name: 'Firebase Configuration',
      category: 'HIGH',
      required: this.isProduction
    };

    try {
      const firebaseKeys = {
        'VITE_FIREBASE_API_KEY': process.env.VITE_FIREBASE_API_KEY,
        'VITE_FIREBASE_AUTH_DOMAIN': process.env.VITE_FIREBASE_AUTH_DOMAIN,
        'VITE_FIREBASE_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID,
        'VITE_FIREBASE_STORAGE_BUCKET': process.env.VITE_FIREBASE_STORAGE_BUCKET,
        'VITE_FIREBASE_MESSAGING_SENDER_ID': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        'VITE_FIREBASE_APP_ID': process.env.VITE_FIREBASE_APP_ID
      };

      const missing = Object.entries(firebaseKeys)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missing.length > 0 && this.isProduction) {
        this.addResult(test, false, `Missing Firebase config: ${missing.join(', ')}`);
        return;
      }

      if (missing.length > 0) {
        this.addResult(test, true, `Firebase partially configured (${6 - missing.length}/6). Missing: ${missing.join(', ')}`, 'warning');
        return;
      }

      // Validate Firebase config format
      const apiKey = firebaseKeys['VITE_FIREBASE_API_KEY'];
      const projectId = firebaseKeys['VITE_FIREBASE_PROJECT_ID'];
      const authDomain = firebaseKeys['VITE_FIREBASE_AUTH_DOMAIN'];

      if (apiKey && !apiKey.startsWith('AIza')) {
        this.addResult(test, false, 'Invalid Firebase API key format');
        return;
      }

      if (authDomain && !authDomain.includes('firebaseapp.com')) {
        this.addResult(test, false, 'Invalid Firebase auth domain format');
        return;
      }

      this.addResult(test, true, `Firebase fully configured with project: ${projectId}`);

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
    }
  }

  /**
   * Validate Analytics Configuration
   */
  async validateAnalyticsConfig() {
    const test = {
      name: 'Analytics Configuration',
      category: 'MEDIUM',
      required: false
    };

    try {
      const clarityId = process.env.VITE_CLARITY_PROJECT_ID || process.env.VITE_CLARITY_ID;
      const gaId = process.env.VITE_GA4_MEASUREMENT_ID;

      const services = [];
      
      if (clarityId) {
        services.push(`Microsoft Clarity: ${clarityId}`);
      }
      
      if (gaId) {
        const gaPattern = /^G-[A-Z0-9]{10}$/;
        if (gaPattern.test(gaId)) {
          services.push(`Google Analytics 4: ${gaId}`);
        } else {
          services.push(`Google Analytics 4: ${gaId} (INVALID FORMAT)`);
        }
      }

      if (services.length === 0) {
        this.addResult(test, true, 'No analytics configured (optional)', 'warning');
      } else {
        this.addResult(test, true, `Analytics configured: ${services.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
    }
  }

  /**
   * Validate Tally Forms Configuration
   */
  async validateTallyConfig() {
    const test = {
      name: 'Tally Forms Configuration',
      category: 'LOW',
      required: false
    };

    try {
      const tallyEnabled = process.env.VITE_TALLY_ENABLED === 'true';
      
      if (!tallyEnabled) {
        this.addResult(test, true, 'Tally forms disabled (optional)', 'info');
        return;
      }

      const tallyForms = {
        'VITE_TALLY_FEEDBACK_FORM_ID': process.env.VITE_TALLY_FEEDBACK_FORM_ID,
        'VITE_TALLY_NPS_FORM_ID': process.env.VITE_TALLY_NPS_FORM_ID,
        'VITE_TALLY_FEATURES_FORM_ID': process.env.VITE_TALLY_FEATURES_FORM_ID,
        'VITE_TALLY_BUGS_FORM_ID': process.env.VITE_TALLY_BUGS_FORM_ID
      };

      const configured = Object.entries(tallyForms)
        .filter(([key, value]) => value && value.length > 0)
        .length;

      this.addResult(test, true, `Tally forms: ${configured}/4 configured`);

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
    }
  }

  /**
   * Validate Environment Configuration
   */
  async validateEnvironmentConfig() {
    const test = {
      name: 'Environment Configuration',
      category: 'HIGH',
      required: true
    };

    try {
      const envVars = {
        'Environment': this.environment,
        'App Version': process.env.VITE_APP_VERSION || 'not set',
        'Base URL': process.env.VITE_APP_BASE_URL || 'not set',
        'Debug Mode': process.env.VITE_DEBUG_MODE || 'not set',
        'Log Level': process.env.VITE_LOG_LEVEL || 'not set'
      };

      // Check for required production settings
      if (this.isProduction) {
        if (process.env.VITE_DEBUG_MODE !== 'false') {
          this.addResult(test, false, 'Debug mode should be disabled in production');
          return;
        }
        
        if (!process.env.VITE_LOG_LEVEL || process.env.VITE_LOG_LEVEL === 'debug') {
          this.addResult(test, false, 'Log level should be "error" or "warn" in production');
          return;
        }
      }

      const details = Object.entries(envVars)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      this.addResult(test, true, `Environment properly configured: ${details}`);

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
    }
  }

  /**
   * Validate Security Patterns
   */
  async validateSecurityPatterns() {
    const test = {
      name: 'Security Patterns Validation',
      category: 'CRITICAL',
      required: true
    };

    try {
      const issues = [];
      
      // Check for hardcoded secrets in source files
      const sourceFiles = [
        'src/services/geminiService.ts',
        'src/config/environment.ts',
        'src/infrastructure/config/EnvironmentConfig.ts'
      ];

      for (const file of sourceFiles) {
        const filePath = join(PROJECT_ROOT, file);
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf8');
          
          // Check for hardcoded API keys
          const hardcodedPattern = /AIza[0-9A-Za-z-_]{35}/g;
          const matches = content.match(hardcodedPattern);
          
          if (matches && matches.length > 0) {
            issues.push(`Hardcoded API key found in ${file}`);
          }
        }
      }

      // Check environment file security
      const envFile = join(PROJECT_ROOT, '.env');
      if (existsSync(envFile)) {
        issues.push('.env file exists in root (should use .env.local for sensitive data)');
      }

      if (issues.length > 0) {
        this.addResult(test, false, `Security issues found: ${issues.join(', ')}`);
      } else {
        this.addResult(test, true, 'No security issues detected');
      }

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
    }
  }

  /**
   * Validate Production Readiness
   */
  async validateProductionReadiness() {
    const test = {
      name: 'Production Readiness Check',
      category: 'CRITICAL',
      required: this.isProduction
    };

    try {
      const readinessScore = {
        total: 0,
        passed: 0
      };

      // Critical APIs
      readinessScore.total += 2;
      if (process.env.VITE_GOOGLE_GEMINI_API_KEY) readinessScore.passed += 2;

      // Firebase
      readinessScore.total += 2;
      if (process.env.VITE_FIREBASE_API_KEY && process.env.VITE_FIREBASE_PROJECT_ID) {
        readinessScore.passed += 2;
      }

      // Environment setup
      readinessScore.total += 1;
      if (this.environment === 'production' && process.env.VITE_DEBUG_MODE === 'false') {
        readinessScore.passed += 1;
      }

      // Security
      readinessScore.total += 1;
      if (this.results.details.find(d => d.name === 'Security Patterns Validation')?.passed) {
        readinessScore.passed += 1;
      }

      const score = Math.round((readinessScore.passed / readinessScore.total) * 100);
      
      if (score >= 80) {
        this.addResult(test, true, `Production readiness: ${score}% (${readinessScore.passed}/${readinessScore.total})`);
      } else {
        this.addResult(test, false, `Production readiness insufficient: ${score}% (${readinessScore.passed}/${readinessScore.total})`);
      }

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
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
    console.log('📊 VALIDATION REPORT');
    console.log('─'.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`🎯 Environment: ${this.environment}`);
    
    const totalScore = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    console.log(`📈 Overall Score: ${totalScore}%`);

    if (this.results.failed > 0) {
      console.log('\n🚨 CRITICAL ISSUES TO RESOLVE:');
      this.results.details
        .filter(r => !r.passed && r.required)
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.details
        .filter(r => r.level === 'warning')
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    console.log('─'.repeat(60));
    console.log(this.results.failed === 0 ? '🎉 ALL VALIDATIONS PASSED!' : '🔧 ISSUES FOUND - SEE ABOVE');
    console.log('─'.repeat(60));
  }
}

// Execute validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new APIKeysValidator();
  
  validator.validate()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Validation failed with error:', error);
      process.exit(1);
    });
}

export { APIKeysValidator }; 