#!/usr/bin/env node

/**
 * 🔨 PRODUCTION BUILD TESTING SCRIPT
 * 
 * IA CHARLIE - Deployment Pipeline Testing
 * Tests production build process, optimization, and artifact generation
 * 
 * SUCCESS CRITERIA:
 * ✅ Build completes successfully in production mode
 * ✅ Build artifacts optimized and compressed
 * ✅ Build time within acceptable limits (<5 minutes)
 * ✅ Build size optimized for production
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, statSync, readFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env') });

class ProductionBuildTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: [],
      metrics: {}
    };
    
    this.environment = 'production'; // Force production for this test
    this.buildStartTime = null;
    this.buildEndTime = null;
  }

  /**
   * Main test runner
   */
  async test() {
    console.log('🔨 PRODUCTION BUILD TESTING - STARTING');
    console.log(`📍 Environment: ${this.environment}`);
    console.log(`📍 Project Root: ${PROJECT_ROOT}`);
    console.log('─'.repeat(60));

    // Core tests
    await this.testPreBuildValidation();
    await this.testProductionBuild();
    await this.testBuildArtifacts();
    await this.testBuildOptimizations();
    await this.testBuildPerformance();
    await this.testAssetCompression();
    await this.testDeploymentReadiness();

    this.generateReport();
    return this.results.failed === 0;
  }

  /**
   * Test Pre-Build Validation
   */
  async testPreBuildValidation() {
    const test = {
      name: 'Pre-Build Validation',
      category: 'CRITICAL',
      required: true
    };

    try {
      const validationChecks = [];

      // Check package.json
      const packageJsonPath = join(PROJECT_ROOT, 'package.json');
      if (!existsSync(packageJsonPath)) {
        this.addResult(test, false, 'package.json not found');
        return;
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      // Check build script
      if (!packageJson.scripts?.build) {
        this.addResult(test, false, 'Build script not defined in package.json');
        return;
      }

      validationChecks.push('Build script configured');

      // Check dependencies
      const criticalDeps = ['react', 'react-dom', 'vite'];
      const missingDeps = criticalDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        this.addResult(test, false, `Missing critical dependencies: ${missingDeps.join(', ')}`);
        return;
      }

      validationChecks.push(`${Object.keys(packageJson.dependencies || {}).length} production dependencies`);

      // Check for node_modules
      const nodeModulesPath = join(PROJECT_ROOT, 'node_modules');
      if (!existsSync(nodeModulesPath)) {
        this.addResult(test, false, 'node_modules not found - run npm install');
        return;
      }

      validationChecks.push('Dependencies installed');

      // Check environment configuration
      const envKeys = [
        'VITE_GOOGLE_GEMINI_API_KEY',
        'VITE_FIREBASE_PROJECT_ID'
      ];

      const configuredKeys = envKeys.filter(key => process.env[key]);
      validationChecks.push(`${configuredKeys.length}/${envKeys.length} critical env vars configured`);

      this.addResult(test, true, `Pre-build validation: ${validationChecks.join(', ')}`);

    } catch (error) {
      this.addResult(test, false, `Pre-build validation error: ${error.message}`);
    }
  }

  /**
   * Test Production Build Process
   */
  async testProductionBuild() {
    const test = {
      name: 'Production Build Process',
      category: 'CRITICAL',
      required: true
    };

    try {
      console.log('🏗️ Starting production build...');
      
      // Clean previous build
      const distPath = join(PROJECT_ROOT, 'dist');
      if (existsSync(distPath)) {
        console.log('   • Cleaning previous build...');
        execSync(`rm -rf "${distPath}"`, { cwd: PROJECT_ROOT });
      }

      // Set production environment
      const buildEnv = {
        ...process.env,
        NODE_ENV: 'production',
        VITE_ENVIRONMENT: 'production'
      };

      this.buildStartTime = Date.now();
      
      try {
        // Execute production build
        const buildOutput = execSync('npm run build', {
          cwd: PROJECT_ROOT,
          encoding: 'utf8',
          env: buildEnv,
          timeout: 300000, // 5 minutes timeout
          maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        this.buildEndTime = Date.now();
        
        // Check if build completed successfully
        if (!existsSync(distPath)) {
          this.addResult(test, false, 'Build completed but dist directory not created');
          return;
        }

        const buildTime = Math.round((this.buildEndTime - this.buildStartTime) / 1000);
        this.results.metrics.buildTime = buildTime;
        
        // Analyze build output for warnings/errors
        const hasWarnings = buildOutput.includes('warning') || buildOutput.includes('Warning');
        const hasErrors = buildOutput.includes('error') || buildOutput.includes('Error');
        
        if (hasErrors) {
          this.addResult(test, false, `Build completed with errors. Time: ${buildTime}s`);
          return;
        }

        let message = `Production build successful in ${buildTime}s`;
        if (hasWarnings) {
          message += ' (with warnings)';
        }

        this.addResult(test, true, message, hasWarnings ? 'warning' : 'success');

      } catch (buildError) {
        this.buildEndTime = Date.now();
        const buildTime = Math.round((this.buildEndTime - this.buildStartTime) / 1000);
        
        if (buildError.signal === 'SIGTERM') {
          this.addResult(test, false, `Build timeout after ${buildTime}s`);
        } else {
          this.addResult(test, false, `Build failed: ${buildError.message}`);
        }
        return;
      }

    } catch (error) {
      this.addResult(test, false, `Build process error: ${error.message}`);
    }
  }

  /**
   * Test Build Artifacts
   */
  async testBuildArtifacts() {
    const test = {
      name: 'Build Artifacts Validation',
      category: 'HIGH',
      required: true
    };

    try {
      const distPath = join(PROJECT_ROOT, 'dist');
      
      if (!existsSync(distPath)) {
        this.addResult(test, false, 'Dist directory not found');
        return;
      }

      const artifactChecks = [];

      // Check required files
      const requiredFiles = [
        'index.html',
        'assets'
      ];

      const missingFiles = requiredFiles.filter(file => !existsSync(join(distPath, file)));
      
      if (missingFiles.length > 0) {
        this.addResult(test, false, `Missing required files: ${missingFiles.join(', ')}`);
        return;
      }

      artifactChecks.push('Required files present');

      // Check assets directory
      const assetsPath = join(distPath, 'assets');
      if (existsSync(assetsPath)) {
        const assetFiles = readdirSync(assetsPath);
        const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
        const cssFiles = assetFiles.filter(f => f.endsWith('.css'));
        
        artifactChecks.push(`${jsFiles.length} JS files, ${cssFiles.length} CSS files`);
        
        // Check for chunking (multiple JS files indicate code splitting)
        if (jsFiles.length > 1) {
          artifactChecks.push('Code splitting implemented');
        }

        // Check for hash in filenames (cache busting)
        const hashedFiles = assetFiles.filter(f => /\.[a-f0-9]{8,}\.(js|css)$/.test(f));
        if (hashedFiles.length > 0) {
          artifactChecks.push('Cache busting implemented');
        }
      }

      // Check public assets
      const publicAssets = ['manifest.json', 'robots.txt'];
      const foundPublicAssets = publicAssets.filter(asset => existsSync(join(distPath, asset)));
      
      if (foundPublicAssets.length > 0) {
        artifactChecks.push(`Public assets: ${foundPublicAssets.join(', ')}`);
      }

      // Calculate total build size
      const totalSize = this.getDirectorySize(distPath);
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      this.results.metrics.buildSize = totalSize;
      
      artifactChecks.push(`Total size: ${sizeMB}MB`);

      this.addResult(test, true, `Build artifacts: ${artifactChecks.join(', ')}`);

    } catch (error) {
      this.addResult(test, false, `Build artifacts validation error: ${error.message}`);
    }
  }

  /**
   * Test Build Optimizations
   */
  async testBuildOptimizations() {
    const test = {
      name: 'Build Optimizations',
      category: 'HIGH',
      required: true
    };

    try {
      const distPath = join(PROJECT_ROOT, 'dist');
      const assetsPath = join(distPath, 'assets');
      
      if (!existsSync(assetsPath)) {
        this.addResult(test, false, 'Assets directory not found');
        return;
      }

      const optimizationChecks = [];

      // Check for minification
      const jsFiles = readdirSync(assetsPath).filter(f => f.endsWith('.js'));
      let minifiedFiles = 0;
      
      for (const jsFile of jsFiles) {
        const filePath = join(assetsPath, jsFile);
        const content = readFileSync(filePath, 'utf8');
        
        // Check if file appears minified (no formatting, long lines)
        const lines = content.split('\n');
        const avgLineLength = content.length / lines.length;
        
        if (avgLineLength > 200 || lines.length < 10) {
          minifiedFiles++;
        }
      }

      if (minifiedFiles === jsFiles.length && jsFiles.length > 0) {
        optimizationChecks.push('JavaScript minified');
      } else if (minifiedFiles > 0) {
        optimizationChecks.push(`${minifiedFiles}/${jsFiles.length} JS files minified`);
      }

      // Check CSS minification
      const cssFiles = readdirSync(assetsPath).filter(f => f.endsWith('.css'));
      let minifiedCssFiles = 0;
      
      for (const cssFile of cssFiles) {
        const filePath = join(assetsPath, cssFile);
        const content = readFileSync(filePath, 'utf8');
        
        // Check if CSS is minified (no extra whitespace, line breaks)
        if (!content.includes('\n  ') && content.length > 100) {
          minifiedCssFiles++;
        }
      }

      if (minifiedCssFiles === cssFiles.length && cssFiles.length > 0) {
        optimizationChecks.push('CSS minified');
      }

      // Check for tree shaking (smaller bundle sizes)
      const jsFileSizes = jsFiles.map(file => {
        const filePath = join(assetsPath, file);
        return statSync(filePath).size;
      });

      const totalJsSize = jsFileSizes.reduce((sum, size) => sum + size, 0);
      const avgJsSize = totalJsSize / jsFiles.length;
      
      if (avgJsSize < 500 * 1024) { // Less than 500KB average
        optimizationChecks.push('Bundle size optimized');
      }

      // Check for compression preparation
      const hasSourceMaps = readdirSync(assetsPath).some(f => f.endsWith('.map'));
      if (hasSourceMaps) {
        optimizationChecks.push('Source maps generated');
      }

      if (optimizationChecks.length === 0) {
        this.addResult(test, false, 'No build optimizations detected');
      } else {
        this.addResult(test, true, `Build optimizations: ${optimizationChecks.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Build optimizations validation error: ${error.message}`);
    }
  }

  /**
   * Test Build Performance
   */
  async testBuildPerformance() {
    const test = {
      name: 'Build Performance',
      category: 'MEDIUM',
      required: false
    };

    try {
      const performanceChecks = [];

      // Check build time
      if (this.results.metrics.buildTime) {
        const buildTime = this.results.metrics.buildTime;
        
        if (buildTime < 60) {
          performanceChecks.push(`Fast build: ${buildTime}s`);
        } else if (buildTime < 180) {
          performanceChecks.push(`Moderate build: ${buildTime}s`);
        } else {
          performanceChecks.push(`Slow build: ${buildTime}s (consider optimization)`);
        }
      }

      // Check build size efficiency
      if (this.results.metrics.buildSize) {
        const sizeMB = (this.results.metrics.buildSize / 1024 / 1024);
        
        if (sizeMB < 5) {
          performanceChecks.push(`Efficient size: ${sizeMB.toFixed(2)}MB`);
        } else if (sizeMB < 15) {
          performanceChecks.push(`Moderate size: ${sizeMB.toFixed(2)}MB`);
        } else {
          performanceChecks.push(`Large size: ${sizeMB.toFixed(2)}MB (consider optimization)`);
        }
      }

      // Check for performance features
      const distPath = join(PROJECT_ROOT, 'dist');
      
      // Check for service worker (PWA)
      if (existsSync(join(distPath, 'sw.js')) || existsSync(join(distPath, 'service-worker.js'))) {
        performanceChecks.push('Service Worker enabled');
      }

      // Check for preload hints in index.html
      const indexPath = join(distPath, 'index.html');
      if (existsSync(indexPath)) {
        const indexContent = readFileSync(indexPath, 'utf8');
        
        if (indexContent.includes('rel="preload"')) {
          performanceChecks.push('Resource preloading');
        }
        
        if (indexContent.includes('rel="modulepreload"')) {
          performanceChecks.push('Module preloading');
        }
      }

      if (performanceChecks.length === 0) {
        this.addResult(test, true, 'Basic build performance', 'info');
      } else {
        this.addResult(test, true, `Build performance: ${performanceChecks.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Build performance validation error: ${error.message}`);
    }
  }

  /**
   * Test Asset Compression
   */
  async testAssetCompression() {
    const test = {
      name: 'Asset Compression',
      category: 'MEDIUM',
      required: false
    };

    try {
      const distPath = join(PROJECT_ROOT, 'dist');
      const assetsPath = join(distPath, 'assets');
      
      if (!existsSync(assetsPath)) {
        this.addResult(test, true, 'No assets directory to compress', 'info');
        return;
      }

      const compressionChecks = [];

      // Check for gzip files
      const allFiles = this.getFilesRecursively(distPath);
      const gzipFiles = allFiles.filter(f => f.endsWith('.gz'));
      
      if (gzipFiles.length > 0) {
        compressionChecks.push(`${gzipFiles.length} gzipped files`);
      }

      // Check for brotli files
      const brotliFiles = allFiles.filter(f => f.endsWith('.br'));
      
      if (brotliFiles.length > 0) {
        compressionChecks.push(`${brotliFiles.length} brotli files`);
      }

      // Check compression potential
      const jsFiles = allFiles.filter(f => f.endsWith('.js') && !f.endsWith('.gz') && !f.endsWith('.br'));
      const cssFiles = allFiles.filter(f => f.endsWith('.css') && !f.endsWith('.gz') && !f.endsWith('.br'));
      
      const compressibleFiles = jsFiles.length + cssFiles.length;
      if (compressibleFiles > 0) {
        compressionChecks.push(`${compressibleFiles} files ready for server compression`);
      }

      // Check for image optimization
      const imageFiles = allFiles.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
      if (imageFiles.length > 0) {
        compressionChecks.push(`${imageFiles.length} image files`);
      }

      if (compressionChecks.length === 0) {
        this.addResult(test, true, 'No compression artifacts (handled by server)', 'info');
      } else {
        this.addResult(test, true, `Asset compression: ${compressionChecks.join(', ')}`);
      }

    } catch (error) {
      this.addResult(test, false, `Asset compression validation error: ${error.message}`);
    }
  }

  /**
   * Test Deployment Readiness
   */
  async testDeploymentReadiness() {
    const test = {
      name: 'Deployment Readiness',
      category: 'CRITICAL',
      required: true
    };

    try {
      const distPath = join(PROJECT_ROOT, 'dist');
      const readinessChecks = [];

      // Check if all critical files exist
      const criticalFiles = ['index.html'];
      const missingCritical = criticalFiles.filter(file => !existsSync(join(distPath, file)));
      
      if (missingCritical.length > 0) {
        this.addResult(test, false, `Missing critical deployment files: ${missingCritical.join(', ')}`);
        return;
      }

      readinessChecks.push('Critical files present');

      // Check index.html validity
      const indexPath = join(distPath, 'index.html');
      const indexContent = readFileSync(indexPath, 'utf8');
      
      if (!indexContent.includes('<html') || !indexContent.includes('</html>')) {
        this.addResult(test, false, 'Invalid index.html structure');
        return;
      }

      readinessChecks.push('HTML structure valid');

      // Check for production-ready meta tags
      if (indexContent.includes('<meta name="viewport"')) {
        readinessChecks.push('Responsive meta tags');
      }

      // Check build metrics
      const buildMetrics = [];
      if (this.results.metrics.buildTime) {
        buildMetrics.push(`${this.results.metrics.buildTime}s build`);
      }
      if (this.results.metrics.buildSize) {
        const sizeMB = (this.results.metrics.buildSize / 1024 / 1024).toFixed(2);
        buildMetrics.push(`${sizeMB}MB size`);
      }

      if (buildMetrics.length > 0) {
        readinessChecks.push(`Build metrics: ${buildMetrics.join(', ')}`);
      }

      // Check for common deployment issues
      if (indexContent.includes('localhost')) {
        this.addResult(test, false, 'localhost references found in production build');
        return;
      }

      this.addResult(test, true, `Deployment ready: ${readinessChecks.join(', ')}`);

    } catch (error) {
      this.addResult(test, false, `Deployment readiness validation error: ${error.message}`);
    }
  }

  /**
   * Helper: Get directory size recursively
   */
  getDirectorySize(dirPath) {
    let size = 0;
    
    try {
      const files = this.getFilesRecursively(dirPath);
      for (const file of files) {
        const filePath = join(dirPath, file);
        if (existsSync(filePath)) {
          const stats = statSync(filePath);
          if (stats.isFile()) {
            size += stats.size;
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return size;
  }

  /**
   * Helper: Get files recursively
   */
  getFilesRecursively(dirPath, relativePath = '') {
    let files = [];
    
    try {
      const items = readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = join(dirPath, item);
        const relativeItemPath = relativePath ? join(relativePath, item) : item;
        
        const stats = statSync(itemPath);
        
        if (stats.isFile()) {
          files.push(relativeItemPath);
        } else if (stats.isDirectory()) {
          const subFiles = this.getFilesRecursively(itemPath, relativeItemPath);
          files = files.concat(subFiles);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Add test result
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
   * Generate final test report
   */
  generateReport() {
    console.log('─'.repeat(60));
    console.log('📊 PRODUCTION BUILD TEST REPORT');
    console.log('─'.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    // Build metrics
    if (Object.keys(this.results.metrics).length > 0) {
      console.log('\n📈 BUILD METRICS:');
      if (this.results.metrics.buildTime) {
        console.log(`   • Build Time: ${this.results.metrics.buildTime}s`);
      }
      if (this.results.metrics.buildSize) {
        const sizeMB = (this.results.metrics.buildSize / 1024 / 1024).toFixed(2);
        console.log(`   • Build Size: ${sizeMB}MB`);
      }
    }

    if (this.results.passed + this.results.failed > 0) {
      const totalScore = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
      console.log(`📈 Overall Score: ${totalScore}%`);
    }

    if (this.results.failed > 0) {
      console.log('\n🚨 BUILD ISSUES TO RESOLVE:');
      this.results.details
        .filter(r => !r.passed && r.required)
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  BUILD WARNINGS:');
      this.results.details
        .filter(r => r.level === 'warning')
        .forEach(r => console.log(`   • ${r.name}: ${r.message}`));
    }

    // Recommendations
    console.log('\n🚀 DEPLOYMENT READINESS:');
    if (this.results.failed === 0) {
      console.log('   • Production build is ready for deployment!');
      console.log('   • Consider setting up CI/CD pipeline for automated builds');
      console.log('   • Test in staging environment before production deployment');
    } else {
      console.log('   • Fix critical build issues before deployment');
      console.log('   • Optimize build process for better performance');
      console.log('   • Verify all required files are generated correctly');
    }

    console.log('─'.repeat(60));
    console.log(this.results.failed === 0 ? '🎉 PRODUCTION BUILD READY!' : '🔧 BUILD ISSUES FOUND');
    console.log('─'.repeat(60));
  }
}

// Execute test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ProductionBuildTester();
  
  tester.test()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Production build test failed with error:', error);
      process.exit(1);
    });
}

export { ProductionBuildTester }; 