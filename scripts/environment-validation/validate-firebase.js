#!/usr/bin/env node

/**
 * 🔥 FIREBASE VALIDATION SCRIPT
 * 
 * IA CHARLIE - Production Environment Audit
 * Validates Firebase configuration, connectivity and security rules
 * 
 * SUCCESS CRITERIA:
 * ✅ Firebase configuration valid and complete
 * ✅ Authentication methods working correctly
 * ✅ Firestore database accessible with proper rules
 * ✅ Security configurations validated
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env') });

class FirebaseValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
    
    this.environment = process.env.NODE_ENV || process.env.VITE_ENVIRONMENT || 'development';
    this.isProduction = this.environment === 'production';
    
    this.firebaseConfig = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID
    };
  }

  /**
   * Main validation runner
   */
  async validate() {
    console.log('🔥 FIREBASE VALIDATION - STARTING');
    console.log(`📍 Environment: ${this.environment}`);
    console.log(`📍 Project ID: ${this.firebaseConfig.projectId || 'NOT SET'}`);
    console.log('─'.repeat(60));

    // Core validations
    await this.validateConfiguration();
    await this.validateConnectivity();
    await this.validateAuthentication();
    await this.validateFirestore();
    await this.validateSecurity();
    await this.validateProductionSettings();

    this.generateReport();
    return this.results.failed === 0;
  }

  /**
   * Validate Firebase Configuration
   */
  async validateConfiguration() {
    const test = {
      name: 'Firebase Configuration',
      category: 'CRITICAL',
      required: this.isProduction
    };

    try {
      const requiredFields = [
        'apiKey',
        'authDomain', 
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId'
      ];

      const missing = requiredFields.filter(field => !this.firebaseConfig[field]);
      
      if (missing.length > 0) {
        if (this.isProduction) {
          this.addResult(test, false, `Missing required fields: ${missing.join(', ')}`);
          return;
        } else {
          this.addResult(test, true, `Partially configured (${6 - missing.length}/6). Missing: ${missing.join(', ')}`, 'warning');
          return;
        }
      }

      // Validate field formats
      const validations = [
        {
          field: 'apiKey',
          pattern: /^AIza[0-9A-Za-z-_]{35}$/,
          message: 'API key should start with "AIza" and be 39 characters'
        },
        {
          field: 'authDomain',
          pattern: /^[a-zA-Z0-9-]+\.firebaseapp\.com$/,
          message: 'Auth domain should end with .firebaseapp.com'
        },
        {
          field: 'projectId',
          pattern: /^[a-z0-9-]+$/,
          message: 'Project ID should contain only lowercase letters, numbers, and hyphens'
        },
        {
          field: 'storageBucket',
          pattern: /^[a-z0-9.-]+\.appspot\.com$/,
          message: 'Storage bucket should end with .appspot.com'
        },
        {
          field: 'messagingSenderId',
          pattern: /^\d+$/,
          message: 'Messaging sender ID should be numeric'
        },
        {
          field: 'appId',
          pattern: /^1:\d+:web:[a-zA-Z0-9]+$/,
          message: 'App ID should follow Firebase app ID format'
        }
      ];

      const formatErrors = validations
        .filter(v => this.firebaseConfig[v.field] && !v.pattern.test(this.firebaseConfig[v.field]))
        .map(v => `${v.field}: ${v.message}`);

      if (formatErrors.length > 0) {
        this.addResult(test, false, `Invalid formats: ${formatErrors.join(', ')}`);
        return;
      }

      this.addResult(test, true, `All 6 Firebase configuration fields valid for project: ${this.firebaseConfig.projectId}`);

    } catch (error) {
      this.addResult(test, false, `Validation error: ${error.message}`);
    }
  }

  /**
   * Validate Firebase Connectivity
   */
  async validateConnectivity() {
    const test = {
      name: 'Firebase Connectivity',
      category: 'HIGH',
      required: this.isProduction && this.firebaseConfig.projectId
    };

    try {
      if (!this.firebaseConfig.projectId) {
        this.addResult(test, true, 'Skipped - No Firebase project configured', 'info');
        return;
      }

      console.log('🌐 Testing Firebase connectivity...');

      // Test Firebase REST API connectivity
      const apiUrl = `https://firebase.googleapis.com/v1beta1/projects/${this.firebaseConfig.projectId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.firebaseConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const projectData = await response.json();
        this.addResult(test, true, `Firebase project reachable: ${projectData.displayName || this.firebaseConfig.projectId}`);
      } else if (response.status === 403) {
        this.addResult(test, true, 'Firebase project exists but requires authentication (expected)', 'warning');
      } else if (response.status === 404) {
        this.addResult(test, false, `Firebase project not found: ${this.firebaseConfig.projectId}`);
      } else {
        this.addResult(test, false, `Unexpected response: ${response.status} - ${await response.text()}`);
      }

    } catch (error) {
      this.addResult(test, false, `Connection error: ${error.message}`);
    }
  }

  /**
   * Validate Authentication Configuration
   */
  async validateAuthentication() {
    const test = {
      name: 'Firebase Authentication',
      category: 'HIGH',
      required: false
    };

    try {
      if (!this.firebaseConfig.projectId) {
        this.addResult(test, true, 'Skipped - No Firebase project configured', 'info');
        return;
      }

      console.log('🔐 Testing Firebase Authentication endpoints...');

      // Test Auth configuration endpoint
      const authConfigUrl = `https://identitytoolkit.googleapis.com/v1/projects/${this.firebaseConfig.projectId}/config?key=${this.firebaseConfig.apiKey}`;
      
      const response = await fetch(authConfigUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const authConfig = await response.json();
        const providers = authConfig.signIn?.allowedProviders || [];
        
        if (providers.length === 0) {
          this.addResult(test, true, 'Firebase Auth configured but no providers enabled', 'warning');
        } else {
          this.addResult(test, true, `Firebase Auth configured with providers: ${providers.join(', ')}`);
        }
      } else if (response.status === 400) {
        this.addResult(test, false, 'Invalid Firebase API key or project configuration');
      } else if (response.status === 403) {
        this.addResult(test, true, 'Firebase Auth configured (API key restrictions active)', 'info');
      } else {
        this.addResult(test, false, `Auth endpoint error: ${response.status}`);
      }

    } catch (error) {
      this.addResult(test, false, `Authentication validation error: ${error.message}`);
    }
  }

  /**
   * Validate Firestore Database
   */
  async validateFirestore() {
    const test = {
      name: 'Firestore Database',
      category: 'MEDIUM',
      required: false
    };

    try {
      if (!this.firebaseConfig.projectId) {
        this.addResult(test, true, 'Skipped - No Firebase project configured', 'info');
        return;
      }

      console.log('📊 Testing Firestore database access...');

      // Test Firestore REST API
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${this.firebaseConfig.projectId}/databases/(default)/documents?key=${this.firebaseConfig.apiKey}`;
      
      const response = await fetch(firestoreUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const collections = data.documents?.length || 0;
        this.addResult(test, true, `Firestore accessible with ${collections} documents visible`);
      } else if (response.status === 403) {
        this.addResult(test, true, 'Firestore configured with security rules (expected)', 'info');
      } else if (response.status === 404) {
        this.addResult(test, true, 'Firestore database not initialized (can be created on first use)', 'warning');
      } else {
        this.addResult(test, false, `Firestore error: ${response.status} - ${await response.text()}`);
      }

    } catch (error) {
      this.addResult(test, false, `Firestore validation error: ${error.message}`);
    }
  }

  /**
   * Validate Security Configuration
   */
  async validateSecurity() {
    const test = {
      name: 'Firebase Security',
      category: 'HIGH',
      required: this.isProduction
    };

    try {
      const securityChecks = [];

      // Check for localhost in auth domain (should not be in production)
      if (this.firebaseConfig.authDomain && this.firebaseConfig.authDomain.includes('localhost')) {
        securityChecks.push('Auth domain contains localhost (not suitable for production)');
      }

      // Check API key format (should not be exposed in client code)
      if (this.isProduction && this.firebaseConfig.apiKey) {
        securityChecks.push('API key configured for production (ensure proper restrictions are set)');
      }

      // Check project ID format
      if (this.firebaseConfig.projectId && this.firebaseConfig.projectId.includes('test')) {
        securityChecks.push('Project ID contains "test" (consider using production project)');
      }

      // Check environment-specific configuration
      if (this.isProduction) {
        const devIndicators = ['dev', 'test', 'staging', 'localhost'];
        const hasDevIndicators = Object.values(this.firebaseConfig)
          .some(value => value && devIndicators.some(indicator => 
            value.toString().toLowerCase().includes(indicator)
          ));

        if (hasDevIndicators) {
          securityChecks.push('Configuration contains development indicators');
        }
      }

      if (securityChecks.length > 0) {
        const level = this.isProduction ? 'error' : 'warning';
        const passed = !this.isProduction;
        this.addResult(test, passed, `Security considerations: ${securityChecks.join(', ')}`, level);
      } else {
        this.addResult(test, true, 'Firebase security configuration appropriate for environment');
      }

    } catch (error) {
      this.addResult(test, false, `Security validation error: ${error.message}`);
    }
  }

  /**
   * Validate Production Settings
   */
  async validateProductionSettings() {
    const test = {
      name: 'Production Settings',
      category: 'CRITICAL',
      required: this.isProduction
    };

    try {
      if (!this.isProduction) {
        this.addResult(test, true, 'Not in production environment', 'info');
        return;
      }

      const productionChecks = [];

      // All required configuration should be present
      const missingConfig = Object.entries(this.firebaseConfig)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingConfig.length > 0) {
        productionChecks.push(`Missing configuration: ${missingConfig.join(', ')}`);
      }

      // Check for production-appropriate project naming
      if (this.firebaseConfig.projectId) {
        const projectId = this.firebaseConfig.projectId;
        if (projectId.includes('test') || projectId.includes('dev')) {
          productionChecks.push('Project ID suggests non-production environment');
        }
      }

      // Validate that authDomain matches project
      if (this.firebaseConfig.authDomain && this.firebaseConfig.projectId) {
        const expectedDomain = `${this.firebaseConfig.projectId}.firebaseapp.com`;
        if (this.firebaseConfig.authDomain !== expectedDomain) {
          productionChecks.push(`Auth domain mismatch: expected ${expectedDomain}, got ${this.firebaseConfig.authDomain}`);
        }
      }

      if (productionChecks.length > 0) {
        this.addResult(test, false, `Production issues: ${productionChecks.join(', ')}`);
      } else {
        this.addResult(test, true, 'All production settings validated successfully');
      }

    } catch (error) {
      this.addResult(test, false, `Production settings validation error: ${error.message}`);
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
    console.log('📊 FIREBASE VALIDATION REPORT');
    console.log('─'.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`🎯 Environment: ${this.environment}`);
    console.log(`🔥 Project ID: ${this.firebaseConfig.projectId || 'NOT SET'}`);
    
    if (this.results.passed + this.results.failed > 0) {
      const totalScore = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
      console.log(`📈 Firebase Score: ${totalScore}%`);
    }

    if (this.results.failed > 0) {
      console.log('\n🚨 FIREBASE ISSUES TO RESOLVE:');
      this.results.details
        .filter(r => !r.passed && r.required)
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  FIREBASE WARNINGS:');
      this.results.details
        .filter(r => r.level === 'warning')
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    // Recommendations
    console.log('\n💡 FIREBASE RECOMMENDATIONS:');
    if (!this.firebaseConfig.projectId) {
      console.log('   • Consider setting up Firebase for authentication and database features');
    } else if (this.results.failed === 0) {
      console.log('   • Firebase configuration is solid! Consider enabling additional features like Analytics');
    }

    console.log('─'.repeat(60));
    console.log(this.results.failed === 0 ? '🎉 FIREBASE VALIDATION PASSED!' : '🔧 FIREBASE ISSUES FOUND');
    console.log('─'.repeat(60));
  }
}

// Execute validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new FirebaseValidator();
  
  validator.validate()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Firebase validation failed with error:', error);
      process.exit(1);
    });
}

export { FirebaseValidator }; 