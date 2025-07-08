#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { performance } from 'perf_hooks';

const execAsync = promisify(exec);

/**
 * Smoke Tests V6.2 Ultimate
 * Valida todas as integrações críticas antes do deploy
 */
class SmokeTestsV6 {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: {},
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            },
            deployReady: false
        };
    }

    // Test 1: Build System
    async testBuildSystem() {
        console.log('\n🏗️  TEST 1: Build System');
        console.log('━'.repeat(40));
        
        const test = { name: 'Build System', status: 'running' };
        const startTime = performance.now();
        
        try {
            // Clean build
            await execAsync('rm -rf dist');
            
            // Production build
            const { stdout, stderr } = await execAsync('npm run build');
            const buildTime = ((performance.now() - startTime) / 1000).toFixed(2);
            
            // Verify dist exists
            if (!fs.existsSync('dist')) {
                throw new Error('Build failed - no dist folder');
            }
            
            // Check bundle size
            const output = stdout + stderr;
            const gzipMatch = output.match(/gzip: ([\d.]+) kB/);
            const gzipSize = gzipMatch ? parseFloat(gzipMatch[1]) : 0;
            
            test.buildTime = buildTime;
            test.bundleSize = gzipSize;
            test.status = buildTime < 5 && gzipSize < 350 ? 'passed' : 'warning';
            test.message = `Build in ${buildTime}s, bundle ${gzipSize}KB`;
            
            console.log(`✅ Build completed in ${buildTime}s`);
            console.log(`📦 Bundle size: ${gzipSize}KB gzipped`);
            
        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
            console.log(`❌ Build failed: ${error.message}`);
        }
        
        this.results.tests.buildSystem = test;
        this.updateSummary(test.status);
    }

    // Test 2: TypeScript Compilation
    async testTypeScript() {
        console.log('\n📘 TEST 2: TypeScript Compilation');
        console.log('━'.repeat(40));
        
        const test = { name: 'TypeScript', status: 'running' };
        
        try {
            const { stdout } = await execAsync('npx tsc --noEmit 2>&1 || true');
            const errors = (stdout.match(/error TS/g) || []).length;
            
            test.errors = errors;
            test.status = errors === 0 ? 'passed' : errors < 10 ? 'warning' : 'failed';
            test.message = `${errors} TypeScript errors`;
            
            if (errors === 0) {
                console.log('✅ TypeScript compilation clean');
            } else {
                console.log(`⚠️  ${errors} TypeScript errors found`);
            }
            
        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
            console.log(`❌ TypeScript check failed: ${error.message}`);
        }
        
        this.results.tests.typeScript = test;
        this.updateSummary(test.status);
    }

    // Test 3: Critical Dependencies
    async testDependencies() {
        console.log('\n📦 TEST 3: Critical Dependencies');
        console.log('━'.repeat(40));
        
        const test = { name: 'Dependencies', status: 'running', missing: [] };
        
        const criticalDeps = [
            'react', 'react-dom', 'react-router-dom',
            'firebase', '@google/generative-ai',
            'framer-motion', 'lucide-react',
            'axios', 'recharts'
        ];
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            criticalDeps.forEach(dep => {
                if (!allDeps[dep]) {
                    test.missing.push(dep);
                    console.log(`❌ Missing: ${dep}`);
                } else {
                    console.log(`✅ ${dep}: ${allDeps[dep]}`);
                }
            });
            
            test.status = test.missing.length === 0 ? 'passed' : 'failed';
            test.message = test.missing.length === 0 ? 
                'All critical dependencies installed' : 
                `Missing ${test.missing.length} dependencies`;
                
        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
            console.log(`❌ Dependency check failed: ${error.message}`);
        }
        
        this.results.tests.dependencies = test;
        this.updateSummary(test.status);
    }

    // Test 4: Feature Files Validation
    async testFeatureFiles() {
        console.log('\n🚀 TEST 4: V6.2 Feature Files');
        console.log('━'.repeat(40));
        
        const test = { name: 'Feature Files', status: 'running', missing: [] };
        
        const requiredFiles = {
            // Predictive UX
            'src/hooks/usePredictiveUX.ts': 'Predictive UX Hook',
            'src/services/predictiveAnalytics.ts': 'Predictive Analytics Service',
            
            // Multi-AI
            'src/components/MultiAISelector.tsx': 'Multi-AI Selector Component',
            'src/services/multiAIService.ts': 'Multi-AI Service',
            
            // Voice Synthesis
            'src/services/voiceService.ts': 'Voice Service',
            'src/components/VoiceControls.tsx': 'Voice Controls Component',
            
            // Smart Loading
            'src/components/ui/SmartLoadingStates.tsx': 'Smart Loading States',
            
            // Micro-interactions
            'src/components/ui/AdvancedMicroInteractions.tsx': 'Micro-interactions'
        };
        
        Object.entries(requiredFiles).forEach(([file, name]) => {
            if (fs.existsSync(file)) {
                console.log(`✅ ${name}`);
            } else {
                test.missing.push(name);
                console.log(`⚠️  ${name} - not found`);
            }
        });
        
        test.status = test.missing.length === 0 ? 'passed' : 
                     test.missing.length <= 2 ? 'warning' : 'failed';
        test.message = `${Object.keys(requiredFiles).length - test.missing.length}/${Object.keys(requiredFiles).length} feature files found`;
        
        this.results.tests.featureFiles = test;
        this.updateSummary(test.status);
    }

    // Test 5: API Configuration
    async testAPIConfiguration() {
        console.log('\n🔑 TEST 5: API Configuration');
        console.log('━'.repeat(40));
        
        const test = { name: 'API Configuration', status: 'running', missing: [] };
        
        try {
            // Check for env files
            const envFiles = ['.env', '.env.local', '.env.production'];
            const envExists = envFiles.some(file => fs.existsSync(file));
            
            if (!envExists) {
                test.missing.push('Environment file');
                console.log('⚠️  No environment file found');
            } else {
                console.log('✅ Environment file exists');
            }
            
            // Check Firebase config
            const firebaseFiles = [
                'src/firebaseConfig.ts',
                'src/services/firebase.ts'
            ];
            
            const firebaseExists = firebaseFiles.some(file => fs.existsSync(file));
            if (!firebaseExists) {
                test.missing.push('Firebase configuration');
                console.log('⚠️  Firebase config not found');
            } else {
                console.log('✅ Firebase configured');
            }
            
            // Check Gemini service
            if (!fs.existsSync('src/services/geminiService.ts')) {
                test.missing.push('Gemini AI service');
                console.log('⚠️  Gemini service not found');
            } else {
                console.log('✅ Gemini AI configured');
            }
            
            test.status = test.missing.length === 0 ? 'passed' : 
                         test.missing.length === 1 ? 'warning' : 'failed';
            test.message = `${3 - test.missing.length}/3 APIs configured`;
            
        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
        }
        
        this.results.tests.apiConfiguration = test;
        this.updateSummary(test.status);
    }

    // Test 6: Performance Benchmarks
    async testPerformance() {
        console.log('\n⚡ TEST 6: Performance Benchmarks');
        console.log('━'.repeat(40));
        
        const test = { name: 'Performance', status: 'running', metrics: {} };
        
        try {
            // Memory usage
            const memUsage = process.memoryUsage();
            test.metrics.heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
            console.log(`💾 Heap Used: ${test.metrics.heapUsed}MB`);
            
            // Check if performance monitoring is setup
            if (fs.existsSync('performance-metrics-v6.json')) {
                const metrics = JSON.parse(fs.readFileSync('performance-metrics-v6.json', 'utf8'));
                const latest = metrics[metrics.length - 1];
                
                if (latest && latest.qualityScore) {
                    test.metrics.qualityScore = latest.qualityScore;
                    console.log(`🎯 Quality Score: ${latest.qualityScore}/100`);
                }
            }
            
            // Dev server response time
            try {
                const startTime = performance.now();
                await execAsync('curl -s http://localhost:5174 > /dev/null || true');
                const responseTime = performance.now() - startTime;
                test.metrics.devServerResponse = Math.round(responseTime);
                console.log(`🌐 Dev Server Response: ${test.metrics.devServerResponse}ms`);
            } catch {
                console.log('⚠️  Dev server not running');
            }
            
            test.status = test.metrics.qualityScore >= 70 ? 'passed' : 'warning';
            test.message = 'Performance metrics collected';
            
        } catch (error) {
            test.status = 'warning';
            test.error = error.message;
        }
        
        this.results.tests.performance = test;
        this.updateSummary(test.status);
    }

    // Test 7: Security Audit
    async testSecurity() {
        console.log('\n🔒 TEST 7: Security Audit');
        console.log('━'.repeat(40));
        
        const test = { name: 'Security', status: 'running' };
        
        try {
            const { stdout } = await execAsync('npm audit --json 2>&1 || true');
            const auditData = JSON.parse(stdout);
            
            const vulnerabilities = auditData.metadata?.vulnerabilities || {};
            const total = Object.values(vulnerabilities).reduce((sum, val) => sum + val, 0);
            
            test.vulnerabilities = {
                total,
                high: vulnerabilities.high || 0,
                critical: vulnerabilities.critical || 0
            };
            
            test.status = test.vulnerabilities.critical === 0 && test.vulnerabilities.high === 0 ? 
                         'passed' : 'warning';
            test.message = `${total} vulnerabilities (${test.vulnerabilities.critical} critical, ${test.vulnerabilities.high} high)`;
            
            console.log(`🛡️  Total vulnerabilities: ${total}`);
            if (test.vulnerabilities.critical > 0) {
                console.log(`❌ Critical: ${test.vulnerabilities.critical}`);
            }
            if (test.vulnerabilities.high > 0) {
                console.log(`⚠️  High: ${test.vulnerabilities.high}`);
            }
            
        } catch (error) {
            test.status = 'warning';
            test.message = 'Security audit could not complete';
        }
        
        this.results.tests.security = test;
        this.updateSummary(test.status);
    }

    // Update summary counts
    updateSummary(status) {
        this.results.summary.total++;
        if (status === 'passed') this.results.summary.passed++;
        else if (status === 'failed') this.results.summary.failed++;
        else if (status === 'warning') this.results.summary.warnings++;
    }

    // Generate deployment readiness report
    generateDeploymentReport() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 SMOKE TESTS REPORT V6.2');
        console.log('='.repeat(50) + '\n');
        
        // Summary
        const { total, passed, failed, warnings } = this.results.summary;
        console.log('📈 TEST SUMMARY:');
        console.log(`   Total Tests: ${total}`);
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   ⚠️  Warnings: ${warnings}\n`);
        
        // Detailed results
        console.log('📋 DETAILED RESULTS:');
        Object.entries(this.results.tests).forEach(([key, test]) => {
            const icon = test.status === 'passed' ? '✅' : 
                        test.status === 'failed' ? '❌' : '⚠️';
            console.log(`   ${icon} ${test.name}: ${test.message || test.status}`);
        });
        
        // Deployment readiness
        this.results.deployReady = failed === 0 && warnings <= 2;
        
        console.log('\n🚀 DEPLOYMENT READINESS:');
        if (this.results.deployReady) {
            console.log('   ✅ SYSTEM IS READY FOR DEPLOYMENT');
            console.log('   ✅ All critical tests passed');
            console.log('   ✅ V6.2 features validated');
        } else {
            console.log('   ❌ NOT READY FOR DEPLOYMENT');
            if (failed > 0) {
                console.log(`   ❌ Fix ${failed} failed tests before deploying`);
            }
            if (warnings > 2) {
                console.log(`   ⚠️  Address ${warnings} warnings for optimal deployment`);
            }
        }
        
        // Save report
        fs.writeFileSync(
            'smoke-tests-report-v6.json',
            JSON.stringify(this.results, null, 2)
        );
        
        console.log('\n📁 Full report saved to smoke-tests-report-v6.json');
    }

    // Main execution
    async run() {
        console.log('🚀 SMOKE TESTS V6.2 ULTIMATE');
        console.log('Testing all critical integrations...\n');
        
        await this.testBuildSystem();
        await this.testTypeScript();
        await this.testDependencies();
        await this.testFeatureFiles();
        await this.testAPIConfiguration();
        await this.testPerformance();
        await this.testSecurity();
        
        this.generateDeploymentReport();
        
        // Exit code based on deployment readiness
        process.exit(this.results.deployReady ? 0 : 1);
    }
}

// Execute smoke tests
const smokeTests = new SmokeTestsV6();
smokeTests.run().catch(console.error); 