#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Infrastructure Validator V6.2
 * Valida a infraestrutura para suportar as features avançadas:
 * - Predictive UX
 * - Multi-AI Selection  
 * - Voice Synthesis
 * - Smart Loading States
 * - Advanced Micro-interactions
 */
class InfrastructureValidator {
    constructor() {
        this.validations = {
            timestamp: new Date().toISOString(),
            environment: {},
            dependencies: {},
            apiKeys: {},
            performance: {},
            compatibility: {},
            readiness: {}
        };
        this.errors = [];
        this.warnings = [];
    }

    // Validate Node.js version
    validateNodeVersion() {
        console.log('🔧 Validando versão do Node.js...');
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
            
            this.validations.environment.nodeVersion = nodeVersion;
            
            if (majorVersion >= 18) {
                console.log(`✅ Node.js ${nodeVersion} - Compatível`);
                this.validations.environment.nodeCompatible = true;
            } else {
                console.log(`❌ Node.js ${nodeVersion} - Requer v18+`);
                this.errors.push('Node.js version must be 18 or higher');
                this.validations.environment.nodeCompatible = false;
            }
        } catch (error) {
            this.errors.push(`Node validation failed: ${error.message}`);
        }
    }

    // Validate required dependencies for V6.2 features
    validateDependencies() {
        console.log('\n📦 Validando dependências críticas...');
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        const requiredDeps = {
            // Core React ecosystem
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'react-router-dom': '^6.0.0',
            
            // Firebase for auth and data
            'firebase': '^10.0.0',
            
            // UI/UX dependencies
            '@radix-ui/react-alert-dialog': '*',
            '@radix-ui/react-dialog': '*',
            '@radix-ui/react-select': '*',
            '@radix-ui/react-tabs': '*',
            'framer-motion': '^10.0.0',
            
            // AI Integration
            '@google/generative-ai': '^0.1.0',
            
            // Utilities
            'axios': '*',
            'date-fns': '*',
            'lucide-react': '*',
            'recharts': '*',
            
            // Development
            'vite': '^5.0.0',
            'typescript': '^5.0.0',
            '@types/react': '^18.0.0'
        };
        
        Object.entries(requiredDeps).forEach(([dep, minVersion]) => {
            if (deps[dep]) {
                console.log(`✅ ${dep}: ${deps[dep]}`);
                this.validations.dependencies[dep] = { installed: true, version: deps[dep] };
            } else {
                console.log(`❌ ${dep}: NOT INSTALLED (required: ${minVersion})`);
                this.errors.push(`Missing dependency: ${dep}`);
                this.validations.dependencies[dep] = { installed: false, required: minVersion };
            }
        });
    }

    // Validate API configurations
    validateAPIConfigs() {
        console.log('\n🔑 Validando configurações de API...');
        
        // Check for environment files
        const envFiles = ['.env', '.env.local', '.env.production'];
        let envFound = false;
        
        envFiles.forEach(file => {
            if (fs.existsSync(file)) {
                envFound = true;
                console.log(`✅ ${file} encontrado`);
            }
        });
        
        if (!envFound) {
            console.log('⚠️  Nenhum arquivo .env encontrado');
            this.warnings.push('No .env file found - API keys may not be configured');
        }
        
        // Check Firebase config
        const firebaseConfigPath = path.join('src', 'services', 'firebase.ts');
        if (fs.existsSync(firebaseConfigPath)) {
            console.log('✅ Firebase config encontrado');
            this.validations.apiKeys.firebase = true;
        } else {
            console.log('❌ Firebase config não encontrado');
            this.errors.push('Firebase configuration not found');
            this.validations.apiKeys.firebase = false;
        }
        
        // Check Gemini service
        const geminiServicePath = path.join('src', 'services', 'geminiService.ts');
        if (fs.existsSync(geminiServicePath)) {
            console.log('✅ Gemini service encontrado');
            this.validations.apiKeys.gemini = true;
        } else {
            console.log('⚠️  Gemini service não encontrado');
            this.warnings.push('Gemini service not found - AI features may be limited');
            this.validations.apiKeys.gemini = false;
        }
    }

    // Validate build system performance
    validateBuildPerformance() {
        console.log('\n⚡ Validando performance do build...');
        
        try {
            // Check if dist exists from previous build
            if (fs.existsSync('dist')) {
                const stats = fs.statSync('dist');
                const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
                
                if (ageInHours < 24) {
                    console.log('✅ Build recente encontrado');
                    this.validations.performance.recentBuild = true;
                } else {
                    console.log('⚠️  Build antigo (>24h)');
                    this.warnings.push('Build is older than 24 hours');
                    this.validations.performance.recentBuild = false;
                }
            } else {
                console.log('⚠️  Nenhum build encontrado');
                this.warnings.push('No build found - run npm run build');
                this.validations.performance.recentBuild = false;
            }
            
            // Check Vite config
            if (fs.existsSync('vite.config.ts')) {
                const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
                
                // Check for optimizations
                if (viteConfig.includes('optimizeDeps')) {
                    console.log('✅ Vite optimizations configuradas');
                    this.validations.performance.viteOptimized = true;
                } else {
                    console.log('⚠️  Vite optimizations não configuradas');
                    this.warnings.push('Consider adding optimizeDeps to vite.config.ts');
                    this.validations.performance.viteOptimized = false;
                }
            }
        } catch (error) {
            this.warnings.push(`Performance validation warning: ${error.message}`);
        }
    }

    // Validate V6.2 feature readiness
    validateFeatureReadiness() {
        console.log('\n🚀 Validando prontidão para features V6.2...');
        
        const features = {
            predictiveUX: {
                required: ['usePredictiveUX.ts', 'predictiveAnalytics.ts'],
                path: 'src/hooks'
            },
            multiAI: {
                required: ['geminiService.ts', 'openAIService.ts'],
                path: 'src/services'
            },
            voiceSynthesis: {
                required: ['voiceService.ts', 'speechSynthesis.ts'],
                path: 'src/services'
            },
            smartLoading: {
                required: ['SmartLoadingStates.tsx', 'loadingService.ts'],
                path: 'src/components/ui'
            },
            microInteractions: {
                required: ['AdvancedMicroInteractions.tsx'],
                path: 'src/components/ui'
            }
        };
        
        Object.entries(features).forEach(([feature, config]) => {
            console.log(`\n📌 ${feature}:`);
            let ready = true;
            
            config.required.forEach(file => {
                const filePath = path.join(config.path, file);
                if (fs.existsSync(filePath)) {
                    console.log(`  ✅ ${file}`);
                } else {
                    console.log(`  ⚠️  ${file} - será criado`);
                    ready = false;
                }
            });
            
            this.validations.readiness[feature] = ready;
        });
    }

    // Check TypeScript configuration
    validateTypeScriptConfig() {
        console.log('\n📘 Validando configuração TypeScript...');
        
        if (fs.existsSync('tsconfig.json')) {
            const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
            
            // Check strict mode
            if (tsConfig.compilerOptions?.strict) {
                console.log('✅ TypeScript strict mode ativado');
                this.validations.compatibility.strictMode = true;
            } else {
                console.log('⚠️  TypeScript strict mode desativado');
                this.warnings.push('Consider enabling TypeScript strict mode');
                this.validations.compatibility.strictMode = false;
            }
            
            // Check module resolution
            if (tsConfig.compilerOptions?.moduleResolution === 'bundler') {
                console.log('✅ Module resolution otimizado para bundler');
                this.validations.compatibility.moduleResolution = true;
            } else {
                console.log('⚠️  Module resolution não otimizado');
                this.warnings.push('Consider using "bundler" for moduleResolution');
                this.validations.compatibility.moduleResolution = false;
            }
        } else {
            console.log('❌ tsconfig.json não encontrado');
            this.errors.push('TypeScript configuration not found');
        }
    }

    // Generate infrastructure report
    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 INFRASTRUCTURE VALIDATION REPORT V6.2');
        console.log('='.repeat(50) + '\n');
        
        // Summary
        const totalErrors = this.errors.length;
        const totalWarnings = this.warnings.length;
        const readyFeatures = Object.values(this.validations.readiness).filter(r => r).length;
        const totalFeatures = Object.keys(this.validations.readiness).length;
        
        console.log('📈 SUMMARY:');
        console.log(`   Errors: ${totalErrors} ${totalErrors === 0 ? '✅' : '❌'}`);
        console.log(`   Warnings: ${totalWarnings} ${totalWarnings < 5 ? '✅' : '⚠️'}`);
        console.log(`   Features Ready: ${readyFeatures}/${totalFeatures}`);
        console.log(`   Overall Status: ${totalErrors === 0 ? '✅ READY' : '❌ NOT READY'}\n`);
        
        // Errors
        if (this.errors.length > 0) {
            console.log('❌ ERRORS:');
            this.errors.forEach(err => console.log(`   - ${err}`));
            console.log('');
        }
        
        // Warnings
        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.warnings.forEach(warn => console.log(`   - ${warn}`));
            console.log('');
        }
        
        // Recommendations
        console.log('💡 RECOMMENDATIONS FOR V6.2:');
        if (!this.validations.readiness.predictiveUX) {
            console.log('   - Implement Predictive UX hooks and services');
        }
        if (!this.validations.readiness.multiAI) {
            console.log('   - Set up Multi-AI service integration');
        }
        if (!this.validations.readiness.voiceSynthesis) {
            console.log('   - Add Voice Synthesis capabilities');
        }
        if (!this.validations.performance.viteOptimized) {
            console.log('   - Optimize Vite configuration for production');
        }
        
        // Save report
        fs.writeFileSync(
            'infrastructure-validation-report.json',
            JSON.stringify(this.validations, null, 2)
        );
        console.log('\n📁 Full report saved to infrastructure-validation-report.json');
    }

    // Main execution
    async run() {
        console.log('🔍 Infrastructure Validator V6.2\n');
        
        this.validateNodeVersion();
        this.validateDependencies();
        this.validateAPIConfigs();
        this.validateBuildPerformance();
        this.validateFeatureReadiness();
        this.validateTypeScriptConfig();
        
        this.generateReport();
        
        // Return status code
        return this.errors.length === 0 ? 0 : 1;
    }
}

// Run validator
const validator = new InfrastructureValidator();
validator.run().then(code => process.exit(code)); 