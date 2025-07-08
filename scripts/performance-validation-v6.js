#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

/**
 * Performance Validation V6.2
 * Comprehensive performance testing for production readiness
 */
class PerformanceValidationV6 {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            metrics: {},
            benchmarks: {},
            recommendations: [],
            productionReady: false
        };
    }

    // Test 1: Build Performance
    async testBuildPerformance() {
        console.log('\n🏗️  TESTING BUILD PERFORMANCE');
        console.log('━'.repeat(40));
        
        const metrics = { builds: [] };
        
        // Run 3 builds to get average
        for (let i = 0; i < 3; i++) {
            console.log(`\nBuild ${i + 1}/3...`);
            
            // Clean
            await execAsync('rm -rf dist');
            
            const startTime = performance.now();
            const startMemory = process.memoryUsage();
            
            try {
                await execAsync('npm run build');
                
                const endTime = performance.now();
                const endMemory = process.memoryUsage();
                
                const buildTime = (endTime - startTime) / 1000;
                const memoryUsed = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;
                
                metrics.builds.push({
                    time: buildTime,
                    memory: memoryUsed
                });
                
                console.log(`  Time: ${buildTime.toFixed(2)}s`);
                console.log(`  Memory: ${memoryUsed.toFixed(2)}MB`);
                
            } catch (error) {
                console.log(`  ❌ Build failed: ${error.message}`);
            }
        }
        
        // Calculate averages
        if (metrics.builds.length > 0) {
            metrics.avgBuildTime = metrics.builds.reduce((sum, b) => sum + b.time, 0) / metrics.builds.length;
            metrics.avgMemoryUsed = metrics.builds.reduce((sum, b) => sum + b.memory, 0) / metrics.builds.length;
            
            console.log(`\n📊 Average Build Time: ${metrics.avgBuildTime.toFixed(2)}s`);
            console.log(`📊 Average Memory Used: ${metrics.avgMemoryUsed.toFixed(2)}MB`);
            
            // Recommendations
            if (metrics.avgBuildTime > 5) {
                this.results.recommendations.push('Consider optimizing build time (>5s)');
            }
            if (metrics.avgMemoryUsed > 500) {
                this.results.recommendations.push('High memory usage during build');
            }
        }
        
        this.results.metrics.build = metrics;
    }

    // Test 2: Bundle Analysis
    async testBundleSize() {
        console.log('\n📦 ANALYZING BUNDLE SIZE');
        console.log('━'.repeat(40));
        
        const metrics = {};
        
        try {
            // Get main bundle stats
            const distPath = path.join(process.cwd(), 'dist');
            const assetsPath = path.join(distPath, 'assets');
            
            if (fs.existsSync(assetsPath)) {
                const files = fs.readdirSync(assetsPath);
                
                // Find JS bundles
                const jsFiles = files.filter(f => f.endsWith('.js'));
                const cssFiles = files.filter(f => f.endsWith('.css'));
                
                metrics.bundles = [];
                
                // Analyze each bundle
                for (const file of jsFiles) {
                    const filePath = path.join(assetsPath, file);
                    const stats = fs.statSync(filePath);
                    const sizeKB = stats.size / 1024;
                    
                    metrics.bundles.push({
                        name: file,
                        size: sizeKB.toFixed(2) + 'KB',
                        type: 'javascript'
                    });
                    
                    console.log(`  📄 ${file}: ${sizeKB.toFixed(2)}KB`);
                }
                
                // Total size
                const totalSize = metrics.bundles.reduce((sum, b) => sum + parseFloat(b.size), 0);
                metrics.totalBundleSize = totalSize.toFixed(2) + 'KB';
                
                console.log(`\n📊 Total Bundle Size: ${metrics.totalBundleSize}`);
                
                // Check against limits
                if (totalSize > 500) {
                    this.results.recommendations.push('Bundle size exceeds 500KB - consider code splitting');
                }
            }
            
        } catch (error) {
            console.log(`❌ Bundle analysis failed: ${error.message}`);
        }
        
        this.results.metrics.bundle = metrics;
    }

    // Test 3: Runtime Performance
    async testRuntimePerformance() {
        console.log('\n⚡ TESTING RUNTIME PERFORMANCE');
        console.log('━'.repeat(40));
        
        const metrics = {};
        
        // Memory baseline
        const baselineMemory = process.memoryUsage();
        metrics.baselineMemory = {
            heapUsed: (baselineMemory.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
            rss: (baselineMemory.rss / 1024 / 1024).toFixed(2) + 'MB'
        };
        
        console.log(`  Baseline Memory: ${metrics.baselineMemory.heapUsed}`);
        
        // Simulate load
        console.log('\n  Simulating application load...');
        
        const loadTests = [];
        for (let i = 0; i < 10; i++) {
            const startTime = performance.now();
            
            // Simulate heavy computation
            const data = Array(10000).fill(0).map(() => Math.random());
            const sorted = data.sort();
            const filtered = sorted.filter(n => n > 0.5);
            
            const endTime = performance.now();
            loadTests.push(endTime - startTime);
        }
        
        metrics.avgOperationTime = (loadTests.reduce((a, b) => a + b, 0) / loadTests.length).toFixed(2) + 'ms';
        console.log(`  Average Operation Time: ${metrics.avgOperationTime}`);
        
        // Final memory
        const finalMemory = process.memoryUsage();
        metrics.memoryGrowth = ((finalMemory.heapUsed - baselineMemory.heapUsed) / 1024 / 1024).toFixed(2) + 'MB';
        console.log(`  Memory Growth: ${metrics.memoryGrowth}`);
        
        this.results.metrics.runtime = metrics;
    }

    // Test 4: Optimization Opportunities
    async testOptimizations() {
        console.log('\n🔧 CHECKING OPTIMIZATION OPPORTUNITIES');
        console.log('━'.repeat(40));
        
        const optimizations = [];
        
        // Check for source maps in production
        if (fs.existsSync('dist')) {
            const hasSourceMaps = fs.readdirSync('dist').some(f => f.endsWith('.map'));
            if (hasSourceMaps) {
                optimizations.push({
                    issue: 'Source maps in production',
                    impact: 'Increases bundle size',
                    fix: 'Disable sourcemaps in production build'
                });
            }
        }
        
        // Check for console logs
        try {
            const { stdout } = await execAsync('grep -r "console.log" dist/ | wc -l');
            const consoleCount = parseInt(stdout.trim());
            if (consoleCount > 0) {
                optimizations.push({
                    issue: `${consoleCount} console.log statements in production`,
                    impact: 'Performance and security',
                    fix: 'Remove console statements in production'
                });
            }
        } catch {}
        
        // Check compression
        if (!fs.existsSync('dist/assets') || !fs.readdirSync('dist/assets').some(f => f.endsWith('.gz'))) {
            optimizations.push({
                issue: 'No gzip compression',
                impact: 'Larger download size',
                fix: 'Enable gzip compression on server'
            });
        }
        
        optimizations.forEach(opt => {
            console.log(`\n  ⚠️  ${opt.issue}`);
            console.log(`     Impact: ${opt.impact}`);
            console.log(`     Fix: ${opt.fix}`);
        });
        
        this.results.optimizations = optimizations;
    }

    // Test 5: Production Readiness
    async testProductionReadiness() {
        console.log('\n🚀 PRODUCTION READINESS CHECK');
        console.log('━'.repeat(40));
        
        const checks = {
            buildTime: this.results.metrics.build?.avgBuildTime < 5,
            bundleSize: parseFloat(this.results.metrics.bundle?.totalBundleSize) < 500,
            memoryStable: parseFloat(this.results.metrics.runtime?.memoryGrowth) < 50,
            noOptimizationIssues: this.results.optimizations?.length === 0
        };
        
        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`  ${passed ? '✅' : '❌'} ${check}`);
        });
        
        this.results.productionReady = Object.values(checks).every(c => c);
    }

    // Generate comprehensive report
    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 PERFORMANCE VALIDATION REPORT V6.2');
        console.log('='.repeat(50) + '\n');
        
        // Build Metrics
        if (this.results.metrics.build) {
            console.log('🏗️  BUILD PERFORMANCE:');
            console.log(`   Average Time: ${this.results.metrics.build.avgBuildTime.toFixed(2)}s`);
            console.log(`   Memory Used: ${this.results.metrics.build.avgMemoryUsed.toFixed(2)}MB\n`);
        }
        
        // Bundle Metrics
        if (this.results.metrics.bundle) {
            console.log('📦 BUNDLE SIZE:');
            console.log(`   Total Size: ${this.results.metrics.bundle.totalBundleSize}`);
            console.log(`   Bundles: ${this.results.metrics.bundle.bundles?.length || 0}\n`);
        }
        
        // Runtime Metrics
        if (this.results.metrics.runtime) {
            console.log('⚡ RUNTIME PERFORMANCE:');
            console.log(`   Operation Time: ${this.results.metrics.runtime.avgOperationTime}`);
            console.log(`   Memory Growth: ${this.results.metrics.runtime.memoryGrowth}\n`);
        }
        
        // Optimizations
        if (this.results.optimizations.length > 0) {
            console.log('🔧 OPTIMIZATION OPPORTUNITIES:');
            this.results.optimizations.forEach(opt => {
                console.log(`   - ${opt.issue}`);
            });
            console.log('');
        }
        
        // Recommendations
        if (this.results.recommendations.length > 0) {
            console.log('💡 RECOMMENDATIONS:');
            this.results.recommendations.forEach(rec => {
                console.log(`   - ${rec}`);
            });
            console.log('');
        }
        
        // Final verdict
        console.log('🎯 PRODUCTION READINESS:');
        if (this.results.productionReady) {
            console.log('   ✅ SYSTEM IS READY FOR PRODUCTION');
            console.log('   ✅ All performance metrics within limits');
            console.log('   ✅ No critical issues found');
        } else {
            console.log('   ⚠️  PERFORMANCE NEEDS OPTIMIZATION');
            console.log('   ⚠️  Address issues before production deployment');
        }
        
        // Save report
        fs.writeFileSync(
            'performance-validation-report-v6.json',
            JSON.stringify(this.results, null, 2)
        );
        
        console.log('\n📁 Full report saved to performance-validation-report-v6.json');
    }

    // Main execution
    async run() {
        console.log('🚀 PERFORMANCE VALIDATION V6.2');
        console.log('Comprehensive performance testing...\n');
        
        await this.testBuildPerformance();
        await this.testBundleSize();
        await this.testRuntimePerformance();
        await this.testOptimizations();
        await this.testProductionReadiness();
        
        this.generateReport();
        
        // Exit code based on readiness
        process.exit(this.results.productionReady ? 0 : 1);
    }
}

// Execute validation
const validator = new PerformanceValidationV6();
validator.run().catch(console.error); 