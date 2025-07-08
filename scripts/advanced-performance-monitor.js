#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

/**
 * Advanced Performance Monitoring System V6.2
 * Monitora: Build time, Bundle size, Memory usage, Test coverage, Lint status
 */
class AdvancedPerformanceMonitor {
    constructor() {
        this.metrics = {
            timestamp: new Date().toISOString(),
            buildMetrics: {},
            testMetrics: {},
            lintMetrics: {},
            bundleMetrics: {},
            memoryMetrics: {},
            qualityScore: 0
        };
    }

    // Medir build time e size
    async measureBuildPerformance() {
        console.log('🏗️  Medindo performance do build...');
        const startTime = performance.now();
        
        try {
            // Clean previous build
            await execAsync('rm -rf dist');
            
            // Run build
            const { stdout, stderr } = await execAsync('npm run build');
            const endTime = performance.now();
            const buildTime = ((endTime - startTime) / 1000).toFixed(2);
            
            // Extract build info from output
            const buildInfo = stdout + stderr;
            const sizeMatch = buildInfo.match(/dist\/assets\/index-\w+\.js\s+(\d+\.?\d*)\s+kB/);
            const gzipMatch = buildInfo.match(/gzip:\s+(\d+\.?\d*)\s+kB/);
            
            this.metrics.buildMetrics = {
                buildTime: `${buildTime}s`,
                bundleSize: sizeMatch ? `${sizeMatch[1]}KB` : 'N/A',
                gzipSize: gzipMatch ? `${gzipMatch[1]}KB` : 'N/A',
                success: true
            };
            
            // Measure actual dist folder size
            const distPath = path.join(process.cwd(), 'dist');
            if (fs.existsSync(distPath)) {
                const distSize = await this.getFolderSize(distPath);
                this.metrics.buildMetrics.distSize = `${(distSize / 1024 / 1024).toFixed(2)}MB`;
            }
            
        } catch (error) {
            this.metrics.buildMetrics = {
                buildTime: 'N/A',
                success: false,
                error: error.message
            };
        }
    }

    // Medir test coverage e status
    async measureTestPerformance() {
        console.log('🧪 Medindo cobertura de testes...');
        
        try {
            const { stdout } = await execAsync('npm test -- --watchAll=false --coverage --silent 2>&1 || true');
            
            // Extract test results
            const passMatch = stdout.match(/Tests:\s+(\d+)\s+passed/);
            const failMatch = stdout.match(/Tests:\s+(\d+)\s+failed/);
            const totalMatch = stdout.match(/Tests:.*\s+(\d+)\s+total/);
            const suitesMatch = stdout.match(/Test Suites:.*\s+(\d+)\s+total/);
            
            // Extract coverage
            const coverageMatch = stdout.match(/All files\s+\|\s+([\d.]+)/);
            
            this.metrics.testMetrics = {
                passed: passMatch ? parseInt(passMatch[1]) : 0,
                failed: failMatch ? parseInt(failMatch[1]) : 0,
                total: totalMatch ? parseInt(totalMatch[1]) : 0,
                suites: suitesMatch ? parseInt(suitesMatch[1]) : 0,
                coverage: coverageMatch ? `${coverageMatch[1]}%` : 'N/A'
            };
            
        } catch (error) {
            this.metrics.testMetrics = {
                error: error.message
            };
        }
    }

    // Medir lint status
    async measureLintStatus() {
        console.log('🔍 Analisando qualidade do código...');
        
        try {
            const { stdout } = await execAsync('npm run lint 2>&1 || true');
            
            // Count errors and warnings
            const errorMatches = stdout.match(/✖ \d+ problems? \((\d+) errors?, (\d+) warnings?\)/);
            const errorCount = errorMatches ? parseInt(errorMatches[1]) : 0;
            const warningCount = errorMatches ? parseInt(errorMatches[2]) : 0;
            
            this.metrics.lintMetrics = {
                errors: errorCount,
                warnings: warningCount,
                total: errorCount + warningCount
            };
            
        } catch (error) {
            this.metrics.lintMetrics = {
                error: error.message
            };
        }
    }

    // Medir memory usage
    async measureMemoryUsage() {
        const used = process.memoryUsage();
        this.metrics.memoryMetrics = {
            rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(used.external / 1024 / 1024)}MB`
        };
    }

    // Calculate quality score
    calculateQualityScore() {
        let score = 100;
        
        // Build metrics impact
        if (this.metrics.buildMetrics.success === false) score -= 30;
        const buildTime = parseFloat(this.metrics.buildMetrics.buildTime);
        if (buildTime > 3) score -= 10;
        
        // Bundle size impact
        const gzipSize = parseFloat(this.metrics.buildMetrics.gzipSize);
        if (gzipSize > 350) score -= 20;
        
        // Test metrics impact
        const testsFailed = this.metrics.testMetrics.failed || 0;
        score -= testsFailed * 2;
        
        // Lint metrics impact
        const lintErrors = this.metrics.lintMetrics.errors || 0;
        if (lintErrors > 100) score -= 15;
        else if (lintErrors > 50) score -= 10;
        else if (lintErrors > 0) score -= 5;
        
        this.metrics.qualityScore = Math.max(0, score);
    }

    // Helper to get folder size
    async getFolderSize(dirPath) {
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                totalSize += await this.getFolderSize(filePath);
            } else {
                totalSize += stats.size;
            }
        }
        
        return totalSize;
    }

    // Generate quality report
    generateReport() {
        console.log('\n📊 PERFORMANCE & QUALITY REPORT V6.2');
        console.log('=====================================\n');
        
        // Build Metrics
        console.log('🏗️  BUILD METRICS:');
        console.log(`   Build Time: ${this.metrics.buildMetrics.buildTime} ${this.metrics.buildMetrics.buildTime < '3s' ? '✅' : '⚠️'}`);
        console.log(`   Bundle Size: ${this.metrics.buildMetrics.bundleSize}`);
        console.log(`   Gzip Size: ${this.metrics.buildMetrics.gzipSize} ${parseFloat(this.metrics.buildMetrics.gzipSize) < 350 ? '✅' : '⚠️'}`);
        console.log(`   Dist Size: ${this.metrics.buildMetrics.distSize}\n`);
        
        // Test Metrics
        console.log('🧪 TEST METRICS:');
        console.log(`   Tests Passed: ${this.metrics.testMetrics.passed}`);
        console.log(`   Tests Failed: ${this.metrics.testMetrics.failed} ${this.metrics.testMetrics.failed === 0 ? '✅' : '❌'}`);
        console.log(`   Total Tests: ${this.metrics.testMetrics.total}`);
        console.log(`   Coverage: ${this.metrics.testMetrics.coverage}\n`);
        
        // Lint Metrics
        console.log('🔍 CODE QUALITY:');
        console.log(`   Lint Errors: ${this.metrics.lintMetrics.errors} ${this.metrics.lintMetrics.errors === 0 ? '✅' : '⚠️'}`);
        console.log(`   Lint Warnings: ${this.metrics.lintMetrics.warnings}\n`);
        
        // Memory Metrics
        console.log('💾 MEMORY USAGE:');
        console.log(`   Heap Used: ${this.metrics.memoryMetrics.heapUsed}`);
        console.log(`   RSS: ${this.metrics.memoryMetrics.rss}\n`);
        
        // Quality Score
        console.log('🎯 QUALITY SCORE:');
        const scoreEmoji = this.metrics.qualityScore >= 90 ? '🏆' : 
                          this.metrics.qualityScore >= 70 ? '✅' : 
                          this.metrics.qualityScore >= 50 ? '⚠️' : '❌';
        console.log(`   Score: ${this.metrics.qualityScore}/100 ${scoreEmoji}\n`);
        
        // Recommendations
        console.log('💡 RECOMMENDATIONS:');
        if (this.metrics.buildMetrics.buildTime > '3s') {
            console.log('   - Optimize build time (current: ' + this.metrics.buildMetrics.buildTime + ')');
        }
        if (parseFloat(this.metrics.buildMetrics.gzipSize) > 350) {
            console.log('   - Reduce bundle size (current: ' + this.metrics.buildMetrics.gzipSize + ')');
        }
        if (this.metrics.testMetrics.failed > 0) {
            console.log('   - Fix failing tests (' + this.metrics.testMetrics.failed + ' failing)');
        }
        if (this.metrics.lintMetrics.errors > 0) {
            console.log('   - Fix lint errors (' + this.metrics.lintMetrics.errors + ' errors)');
        }
    }

    // Save metrics
    async saveMetrics() {
        const metricsPath = 'performance-metrics-v6.json';
        let history = [];
        
        try {
            if (fs.existsSync(metricsPath)) {
                history = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            }
            
            history.push(this.metrics);
            
            // Keep last 20 measurements
            if (history.length > 20) {
                history = history.slice(-20);
            }
            
            fs.writeFileSync(metricsPath, JSON.stringify(history, null, 2));
            console.log('\n📁 Metrics saved to performance-metrics-v6.json');
            
        } catch (error) {
            console.error('Failed to save metrics:', error.message);
        }
    }

    // Main execution
    async run() {
        console.log('🚀 Advanced Performance Monitor V6.2\n');
        
        await this.measureBuildPerformance();
        await this.measureTestPerformance();
        await this.measureLintStatus();
        await this.measureMemoryUsage();
        
        this.calculateQualityScore();
        this.generateReport();
        await this.saveMetrics();
        
        // Exit with appropriate code
        process.exit(this.metrics.qualityScore >= 70 ? 0 : 1);
    }
}

// Run monitor
const monitor = new AdvancedPerformanceMonitor();
monitor.run().catch(console.error); 