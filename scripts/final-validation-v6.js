#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Final Validation V6.2
 * Valida toda a infraestrutura antes da integração final das features
 */
class FinalValidationV6 {
    constructor() {
        this.validations = {
            timestamp: new Date().toISOString(),
            infrastructure: {},
            performance: {},
            quality: {},
            features: {},
            readiness: {
                overall: 0,
                details: {}
            }
        };
    }

    // Validar scripts de infraestrutura
    async validateInfrastructureScripts() {
        console.log('🔧 Validando scripts de infraestrutura...');
        
        const requiredScripts = [
            'scripts/advanced-performance-monitor.js',
            'scripts/quality-gates-v6.sh',
            'scripts/infrastructure-validator.js',
            'scripts/test-infrastructure-setup.js'
        ];
        
        let allPresent = true;
        
        for (const script of requiredScripts) {
            if (fs.existsSync(script)) {
                console.log(`✅ ${script}`);
                this.validations.infrastructure[script] = true;
            } else {
                console.log(`❌ ${script} não encontrado`);
                this.validations.infrastructure[script] = false;
                allPresent = false;
            }
        }
        
        this.validations.readiness.details.infrastructure = allPresent;
    }

    // Validar performance atual
    async validatePerformance() {
        console.log('\n⚡ Validando performance...');
        
        try {
            // Executar build para medir performance
            const startTime = Date.now();
            await execAsync('npm run build');
            const buildTime = (Date.now() - startTime) / 1000;
            
            console.log(`Build Time: ${buildTime}s ${buildTime < 3 ? '✅' : '⚠️'}`);
            this.validations.performance.buildTime = buildTime;
            
            // Verificar tamanho do bundle
            const buildOutput = fs.readFileSync('/tmp/build-output.log', 'utf8').toString();
            const gzipMatch = buildOutput.match(/gzip: ([\d.]+) kB/);
            
            if (gzipMatch) {
                const gzipSize = parseFloat(gzipMatch[1]);
                console.log(`Bundle Size: ${gzipSize}KB ${gzipSize < 350 ? '✅' : '⚠️'}`);
                this.validations.performance.bundleSize = gzipSize;
            }
            
            this.validations.readiness.details.performance = 
                buildTime < 3 && (!gzipMatch || parseFloat(gzipMatch[1]) < 350);
                
        } catch (error) {
            console.log('❌ Erro ao validar performance:', error.message);
            this.validations.readiness.details.performance = false;
        }
    }

    // Validar quality gates
    async validateQualityGates() {
        console.log('\n🚪 Validando quality gates...');
        
        try {
            // Verificar TypeScript
            const { stdout: tscOutput } = await execAsync('npx tsc --noEmit 2>&1 || true');
            const tsErrors = (tscOutput.match(/error TS/g) || []).length;
            console.log(`TypeScript Errors: ${tsErrors} ${tsErrors === 0 ? '✅' : '⚠️'}`);
            this.validations.quality.typeScriptErrors = tsErrors;
            
            // Verificar ESLint
            const { stdout: lintOutput } = await execAsync('npm run lint 2>&1 || true');
            const lintErrors = (lintOutput.match(/\d+ errors?/g) || ['0'])[0];
            console.log(`ESLint: ${lintErrors} ${parseInt(lintErrors) < 50 ? '✅' : '⚠️'}`);
            this.validations.quality.lintErrors = parseInt(lintErrors);
            
            this.validations.readiness.details.quality = 
                tsErrors === 0 && parseInt(lintErrors) < 50;
                
        } catch (error) {
            console.log('❌ Erro ao validar quality gates:', error.message);
            this.validations.readiness.details.quality = false;
        }
    }

    // Validar preparação para features V6.2
    async validateFeatureReadiness() {
        console.log('\n🚀 Validando preparação para features V6.2...');
        
        const featureChecks = {
            predictiveUX: {
                files: [
                    'src/hooks/usePredictiveUX.ts',
                    'src/__tests__/mocks/predictiveUX.mock.ts'
                ]
            },
            multiAI: {
                files: [
                    'src/services/geminiService.ts',
                    'src/__tests__/mocks/multiAI.mock.ts'
                ]
            },
            voiceSynthesis: {
                files: [
                    'src/__tests__/mocks/voiceSynthesis.mock.ts'
                ]
            },
            smartLoading: {
                files: [
                    'src/components/ui/SmartLoadingStates.tsx',
                    'src/__tests__/mocks/smartLoading.mock.ts'
                ]
            },
            microInteractions: {
                files: [
                    'src/components/ui/AdvancedMicroInteractions.tsx'
                ]
            }
        };
        
        let totalReady = 0;
        const totalFeatures = Object.keys(featureChecks).length;
        
        for (const [feature, config] of Object.entries(featureChecks)) {
            let featureReady = true;
            console.log(`\n📌 ${feature}:`);
            
            for (const file of config.files) {
                if (fs.existsSync(file)) {
                    console.log(`  ✅ ${path.basename(file)}`);
                } else {
                    console.log(`  ⚠️  ${path.basename(file)} - aguardando implementação`);
                    featureReady = false;
                }
            }
            
            this.validations.features[feature] = featureReady;
            if (featureReady) totalReady++;
        }
        
        this.validations.readiness.details.features = totalReady / totalFeatures;
        console.log(`\n📊 Features prontas: ${totalReady}/${totalFeatures} (${Math.round(totalReady/totalFeatures * 100)}%)`);
    }

    // Verificar CI/CD
    async validateCICD() {
        console.log('\n🔄 Validando CI/CD...');
        
        const cicdFiles = [
            '.github/workflows/quality-gates.yml'
        ];
        
        let cicdReady = true;
        
        for (const file of cicdFiles) {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file}`);
                
                // Verificar conteúdo básico
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('quality-gates') && content.includes('performance-monitor')) {
                    console.log('  ✅ Pipeline configurado corretamente');
                } else {
                    console.log('  ⚠️  Pipeline incompleto');
                    cicdReady = false;
                }
            } else {
                console.log(`❌ ${file} não encontrado`);
                cicdReady = false;
            }
        }
        
        this.validations.readiness.details.cicd = cicdReady;
    }

    // Calcular prontidão geral
    calculateOverallReadiness() {
        const categories = Object.values(this.validations.readiness.details);
        const readyCount = categories.filter(v => v === true || v >= 0.8).length;
        
        this.validations.readiness.overall = 
            Math.round((readyCount / categories.length) * 100);
    }

    // Gerar recomendações
    generateRecommendations() {
        const recommendations = [];
        
        if (!this.validations.readiness.details.infrastructure) {
            recommendations.push('Execute todos os scripts de infraestrutura');
        }
        
        if (!this.validations.readiness.details.performance) {
            recommendations.push('Otimize o build time e bundle size');
        }
        
        if (!this.validations.readiness.details.quality) {
            recommendations.push('Corrija erros de TypeScript e ESLint');
        }
        
        if (this.validations.readiness.details.features < 0.8) {
            recommendations.push('Complete a implementação das features V6.2');
        }
        
        if (!this.validations.readiness.details.cicd) {
            recommendations.push('Configure o pipeline CI/CD');
        }
        
        return recommendations;
    }

    // Gerar relatório final
    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 FINAL VALIDATION REPORT V6.2');
        console.log('='.repeat(50) + '\n');
        
        // Overall Readiness
        const readiness = this.validations.readiness.overall;
        const readinessEmoji = readiness >= 90 ? '🏆' : 
                              readiness >= 70 ? '✅' : 
                              readiness >= 50 ? '⚠️' : '❌';
        
        console.log(`🎯 OVERALL READINESS: ${readiness}% ${readinessEmoji}\n`);
        
        // Category breakdown
        console.log('📈 CATEGORY BREAKDOWN:');
        Object.entries(this.validations.readiness.details).forEach(([category, ready]) => {
            const status = ready === true ? '✅' : 
                          ready === false ? '❌' : 
                          ready >= 0.8 ? '✅' : 
                          ready >= 0.5 ? '⚠️' : '❌';
            const percentage = typeof ready === 'number' ? ` (${Math.round(ready * 100)}%)` : '';
            console.log(`  ${category}: ${status}${percentage}`);
        });
        
        // Recommendations
        const recommendations = this.generateRecommendations();
        if (recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            recommendations.forEach(rec => console.log(`  - ${rec}`));
        }
        
        // Next steps
        console.log('\n🚀 NEXT STEPS:');
        if (readiness >= 90) {
            console.log('  ✅ Infrastructure is READY for V6.2 features!');
            console.log('  ✅ All systems prepared for premium features integration');
            console.log('  ✅ Quality gates and monitoring in place');
        } else if (readiness >= 70) {
            console.log('  ⚠️  Infrastructure is mostly ready');
            console.log('  ⚠️  Complete remaining items before full integration');
        } else {
            console.log('  ❌ Infrastructure needs more preparation');
            console.log('  ❌ Focus on recommendations above');
        }
        
        // Save report
        fs.writeFileSync(
            'final-validation-report-v6.json',
            JSON.stringify(this.validations, null, 2)
        );
        
        console.log('\n📁 Full report saved to final-validation-report-v6.json');
    }

    // Main execution
    async run() {
        console.log('🚀 Final Validation V6.2\n');
        
        await this.validateInfrastructureScripts();
        await this.validatePerformance();
        await this.validateQualityGates();
        await this.validateFeatureReadiness();
        await this.validateCICD();
        
        this.calculateOverallReadiness();
        this.generateReport();
        
        // Exit code based on readiness
        process.exit(this.validations.readiness.overall >= 70 ? 0 : 1);
    }
}

// Run validation
const validator = new FinalValidationV6();
validator.run().catch(console.error); 