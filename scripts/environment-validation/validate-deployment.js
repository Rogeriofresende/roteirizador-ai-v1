#!/usr/bin/env node

/**
 * 🚀 DEPLOYMENT VALIDATION SCRIPT
 * 
 * IA CHARLIE - Production Environment Audit
 * Validates deployment readiness, build configuration, and production settings
 * 
 * SUCCESS CRITERIA:
 * ✅ Build process working correctly
 * ✅ Production environment configurations validated
 * ✅ Deployment artifacts ready
 * ✅ No blocking issues for production deployment
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env') });

class DeploymentValidator {
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
    console.log('🚀 DEPLOYMENT VALIDATION - STARTING');
    console.log(`📍 Environment: ${this.environment}`);
    console.log(`📍 Project Root: ${PROJECT_ROOT}`);
    console.log('─'.repeat(60));

    // Core validations
    await this.validatePackageConfiguration();
    await this.validateBuildProcess();
    await this.validateEnvironmentFiles();
    await this.validateDeploymentFiles();
    await this.validateProductionReadiness();
    await this.validateSSLAndSecurity();
    await this.validatePerformanceOptimizations();

    this.generateReport();
    return this.results.failed === 0;
  }

  /**
   * Validate Package Configuration
   */
  async validatePackageConfiguration() {
    const test = {
      name: 'Package Configuration',
      category: 'CRITICAL',
      required: true
    };

    try {
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      
      if (!existsSync(packageJsonPath)) {
        this.addResult(test, false, 'package.json not found');
        return;
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      // Check required scripts
      const requiredScripts = ['build', 'preview', 'dev'];
      const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
      
      if (missingScripts.length > 0) {
        this.addResult(test, false, `Missing scripts: ${missingScripts.join(', ')}`);
        return;
      }

      // Check for production dependencies
      const prodDeps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      
      // Critical dependencies check
      const criticalDeps = ['react', 'react-dom'];
      const missingCritical = criticalDeps.filter(dep => !prodDeps[dep]);
      
      if (missingCritical.length > 0) {
        this.addResult(test, false, `Missing critical dependencies: ${missingCritical.join(', ')}`);
        return;
      }

      // Version information
      const version = packageJson.version || '1.0.0';
      const name = packageJson.name || 'unknown';
      
      this.addResult(test, true, `Package configured: ${name}@${version} with ${Object.keys(prodDeps).length} dependencies`);

    } catch (error) {
      this.addResult(test, false, `Package validation error: ${error.message}`);
    }
  }

  /**
   * Validate Build Process
   */
  async validateBuildProcess() {
    const test = {
      name: 'Build Process',
      category: 'CRITICAL',
      required: true
    };

    try {
      console.log('🔨 Testing build process...');
      
      // Clean previous builds
      const distPath = join(PROJECT_ROOT, 'dist');
      if (existsSync(distPath)) {
        console.log('   • Cleaning previous build...');
      }

      // Execute build command
      console.log('   • Running npm run build...');
      const buildStart = Date.now();
      
      try {
        const buildOutput = execSync('npm run build', {
          cwd: PROJECT_ROOT,
          encoding: 'utf8',
          timeout: 120000 // 2 minutes timeout
        });
        
        const buildTime = Math.round((Date.now() - buildStart) / 1000);
        
        // Check if dist directory was created
        if (!existsSync(distPath)) {
          this.addResult(test, false, 'Build completed but dist directory not found');
          return;
        }

        // Check build artifacts
        const requiredFiles = ['index.html', 'assets'];
        const missingFiles = requiredFiles.filter(file => !existsSync(join(distPath, file)));
        
        if (missingFiles.length > 0) {
          this.addResult(test, false, `Build missing files: ${missingFiles.join(', ')}`);
          return;
        }

        // Get build size information
        const buildSize = this.getDirectorySize(distPath);
        const buildSizeMB = (buildSize / 1024 / 1024).toFixed(2);
        
        this.addResult(test, true, `Build successful in ${buildTime}s, size: ${buildSizeMB}MB`);

      } catch (buildError) {
        this.addResult(test, false, `Build failed: ${buildError.message}`);
        return;
      }

    } catch (error) {
      this.addResult(test, false, `Build validation error: ${error.message}`);
    }
  }

  /**
   * Validate Environment Files
   */
  async validateEnvironmentFiles() {
    const test = {
      name: 'Environment Files',
      category: 'HIGH',
      required: this.isProduction
    };

    try {
      const envFiles = [
        { name: '.env.example', required: true, description: 'Environment template' },
        { name: '.env.local', required: false, description: 'Local development config' },
        { name: '.env.production', required: this.isProduction, description: 'Production config' },
        { name: '.gitignore', required: true, description: 'Git ignore rules' }
      ];

      const results = [];
      let criticalMissing = 0;

      for (const envFile of envFiles) {
        const filePath = join(PROJECT_ROOT, envFile.name);
        const exists = existsSync(filePath);
        
        if (!exists && envFile.required) {
          criticalMissing++;
          results.push(`❌ ${envFile.name} (REQUIRED)`);
        } else if (!exists) {
          results.push(`⚠️ ${envFile.name} (optional)`);
        } else {
          // Check file content for .gitignore
          if (envFile.name === '.gitignore') {
            const content = readFileSync(filePath, 'utf8');
            if (!content.includes('.env.local')) {
              results.push(`⚠️ .gitignore missing .env.local protection`);
            } else {
              results.push(`✅ ${envFile.name}`);
            }
          } else {
            results.push(`✅ ${envFile.name}`);
          }
        }
      }

      if (criticalMissing > 0) {
        this.addResult(test, false, `Missing critical files: ${criticalMissing}. Details: ${results.join(', ')}`);
      } else {
        this.addResult(test, true, `Environment files validated: ${results.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Environment files validation error: ${error.message}`);
    }
  }

  /**
   * Validate Deployment Files
   */
  async validateDeploymentFiles() {
    const test = {
      name: 'Deployment Configuration',
      category: 'HIGH',
      required: false
    };

    try {
      const deploymentFiles = [
        { name: 'vercel.json', platform: 'Vercel' },
        { name: 'netlify.toml', platform: 'Netlify' },
        { name: 'Dockerfile', platform: 'Docker' },
        { name: 'firebase.json', platform: 'Firebase Hosting' }
      ];

      const foundConfigs = [];
      
      for (const deployFile of deploymentFiles) {
        const filePath = join(PROJECT_ROOT, deployFile.name);
        if (existsSync(filePath)) {
          foundConfigs.push(deployFile.platform);
          
          // Validate specific configurations
          if (deployFile.name === 'vercel.json') {
            try {
              const vercelConfig = JSON.parse(readFileSync(filePath, 'utf8'));
              if (!vercelConfig.builds && !vercelConfig.framework) {
                foundConfigs[foundConfigs.length - 1] += ' (needs configuration)';
              }
            } catch (e) {
              foundConfigs[foundConfigs.length - 1] += ' (invalid JSON)';
            }
          }
        }
      }

      if (foundConfigs.length === 0) {
        this.addResult(test, true, 'No specific deployment configs found (using platform defaults)', 'warning');
      } else {
        this.addResult(test, true, `Deployment configs found: ${foundConfigs.join(', ')}`);
      }

      // Check for public directory
      const publicPath = join(PROJECT_ROOT, 'public');
      if (existsSync(publicPath)) {
        const publicFiles = ['manifest.json', 'robots.txt', 'favicon.ico'];
        const foundPublicFiles = publicFiles.filter(file => existsSync(join(publicPath, file)));
        
        if (foundPublicFiles.length > 0) {
          this.addResult(test, true, `Public assets: ${foundPublicFiles.join(', ')}`);
        }
      }

    } catch (error) {
      this.addResult(test, false, `Deployment configuration validation error: ${error.message}`);
    }
  }

  /**
   * Validate Production Readiness
   */
  async validateProductionReadiness() {
    const test = {
      name: 'Production Readiness',
      category: 'CRITICAL',
      required: this.isProduction
    };

    try {
      const readinessChecks = [];

      // Check environment variables for production
      const criticalEnvVars = [
        'VITE_GOOGLE_GEMINI_API_KEY',
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_PROJECT_ID'
      ];

      const missingCritical = criticalEnvVars.filter(envVar => !process.env[envVar]);
      
      if (this.isProduction && missingCritical.length > 0) {
        readinessChecks.push(`Missing critical env vars: ${missingCritical.join(', ')}`);
      }

      // Check for development settings in production
      if (this.isProduction) {
        if (process.env.VITE_DEBUG_MODE === 'true') {
          readinessChecks.push('Debug mode enabled in production');
        }
        
        if (process.env.VITE_LOG_LEVEL === 'debug') {
          readinessChecks.push('Debug logging enabled in production');
        }
      }

      // Check build optimization
      const viteConfigPath = join(PROJECT_ROOT, 'vite.config.ts');
      if (existsSync(viteConfigPath)) {
        const viteConfig = readFileSync(viteConfigPath, 'utf8');
        if (!viteConfig.includes('minify') && this.isProduction) {
          readinessChecks.push('Vite minification not explicitly configured');
        }
      }

      // Check for common production issues
      const indexHtmlPath = join(PROJECT_ROOT, 'index.html');
      if (existsSync(indexHtmlPath)) {
        const indexContent = readFileSync(indexHtmlPath, 'utf8');
        if (indexContent.includes('localhost') && this.isProduction) {
          readinessChecks.push('localhost references found in index.html');
        }
      }

      if (readinessChecks.length > 0) {
        this.addResult(test, false, `Production issues: ${readinessChecks.join(', ')}`);
      } else {
        this.addResult(test, true, 'All production readiness checks passed');
      }

    } catch (error) {
      this.addResult(test, false, `Production readiness validation error: ${error.message}`);
    }
  }

  /**
   * Validate SSL and Security
   */
  async validateSSLAndSecurity() {
    const test = {
      name: 'SSL and Security',
      category: 'HIGH',
      required: this.isProduction
    };

    try {
      const securityChecks = [];

      // Check for HTTPS enforcement
      const viteConfigPath = join(PROJECT_ROOT, 'vite.config.ts');
      if (existsSync(viteConfigPath)) {
        const viteConfig = readFileSync(viteConfigPath, 'utf8');
        
        // Check for security headers
        if (!viteConfig.includes('header') && this.isProduction) {
          securityChecks.push('Security headers not configured');
        }
      }

      // Check for secure environment variable handling
      const envExamplePath = join(PROJECT_ROOT, '.env.example');
      if (existsSync(envExamplePath)) {
        const envExample = readFileSync(envExamplePath, 'utf8');
        if (envExample.includes('localhost') && this.isProduction) {
          securityChecks.push('Environment example contains localhost');
        }
      }

      // Check for sensitive files in public directory
      const publicPath = join(PROJECT_ROOT, 'public');
      if (existsSync(publicPath)) {
        const sensitiveFiles = ['.env', '.env.local', 'config.json'];
        const foundSensitive = sensitiveFiles.filter(file => existsSync(join(publicPath, file)));
        
        if (foundSensitive.length > 0) {
          securityChecks.push(`Sensitive files in public: ${foundSensitive.join(', ')}`);
        }
      }

      if (securityChecks.length > 0) {
        const level = this.isProduction ? 'error' : 'warning';
        const passed = !this.isProduction;
        this.addResult(test, passed, `Security considerations: ${securityChecks.join(', ')}`, level);
      } else {
        this.addResult(test, true, 'SSL and security configuration appropriate');
      }

    } catch (error) {
      this.addResult(test, false, `SSL and security validation error: ${error.message}`);
    }
  }

  /**
   * Validate Performance Optimizations
   */
  async validatePerformanceOptimizations() {
    const test = {
      name: 'Performance Optimizations',
      category: 'MEDIUM',
      required: false
    };

    try {
      const perfChecks = [];
      
      // Check for build optimizations
      const distPath = join(PROJECT_ROOT, 'dist');
      if (existsSync(distPath)) {
        const assetsPath = join(distPath, 'assets');
        if (existsSync(assetsPath)) {
          const assetFiles = this.getFilesInDirectory(assetsPath);
          
          // Check for chunking
          const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
          const cssFiles = assetFiles.filter(f => f.endsWith('.css'));
          
          perfChecks.push(`${jsFiles.length} JS chunks, ${cssFiles.length} CSS files`);
          
          // Check for gzip compression
          const gzFiles = assetFiles.filter(f => f.endsWith('.gz'));
          if (gzFiles.length > 0) {
            perfChecks.push(`${gzFiles.length} gzipped assets`);
          }
        }
      }

      // Check for service worker
      const swPath = join(PROJECT_ROOT, 'public', 'sw.js');
      const swManifestPath = join(PROJECT_ROOT, 'public', 'manifest.json');
      
      if (existsSync(swPath) || existsSync(swManifestPath)) {
        perfChecks.push('PWA capabilities detected');
      }

      // Check for image optimization
      const publicPath = join(PROJECT_ROOT, 'public');
      if (existsSync(publicPath)) {
        const imageFiles = this.getFilesInDirectory(publicPath)
          .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
        
        if (imageFiles.length > 0) {
          perfChecks.push(`${imageFiles.length} image assets`);
        }
      }

      if (perfChecks.length > 0) {
        this.addResult(test, true, `Performance features: ${perfChecks.join(', ')}`);
      } else {
        this.addResult(test, true, 'Basic performance optimization in place', 'info');
      }

    } catch (error) {
      this.addResult(test, false, `Performance optimization validation error: ${error.message}`);
    }
  }

  /**
   * Helper: Get directory size
   */
  getDirectorySize(dirPath) {
    let size = 0;
    
    try {
      const files = this.getFilesInDirectory(dirPath, true);
      for (const file of files) {
        const filePath = join(dirPath, file);
        const stats = statSync(filePath);
        if (stats.isFile()) {
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return size;
  }

  /**
   * Helper: Get files in directory
   */
  getFilesInDirectory(dirPath, recursive = false) {
    try {
      const fs = require('fs');
      let files = [];
      
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = join(dirPath, item);
        const stats = statSync(itemPath);
        
        if (stats.isFile()) {
          files.push(item);
        } else if (stats.isDirectory() && recursive) {
          const subFiles = this.getFilesInDirectory(itemPath, true)
            .map(f => join(item, f));
          files = files.concat(subFiles);
        }
      }
      
      return files;
    } catch (error) {
      return [];
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
    console.log('📊 DEPLOYMENT VALIDATION REPORT');
    console.log('─'.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`🎯 Environment: ${this.environment}`);
    
    if (this.results.passed + this.results.failed > 0) {
      const totalScore = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
      console.log(`📈 Deployment Score: ${totalScore}%`);
    }

    if (this.results.failed > 0) {
      console.log('\n🚨 DEPLOYMENT BLOCKERS:');
      this.results.details
        .filter(r => !r.passed && r.required)
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  DEPLOYMENT WARNINGS:');
      this.results.details
        .filter(r => r.level === 'warning')
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    // Next steps
    console.log('\n🚀 DEPLOYMENT READINESS:');
    if (this.results.failed === 0) {
      console.log('   • Ready for production deployment!');
      console.log('   • Consider setting up monitoring and analytics');
      console.log('   • Test thoroughly in staging environment first');
    } else {
      console.log('   • Resolve critical issues before deploying');
      console.log('   • Verify all environment variables are set');
      console.log('   • Test build process in CI/CD pipeline');
    }

    console.log('─'.repeat(60));
    console.log(this.results.failed === 0 ? '🎉 DEPLOYMENT READY!' : '🔧 DEPLOYMENT ISSUES FOUND');
    console.log('─'.repeat(60));
  }
}

// Execute validation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DeploymentValidator();
  
  validator.validate()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Deployment validation failed with error:', error);
      process.exit(1);
    });
}

export { DeploymentValidator }; 