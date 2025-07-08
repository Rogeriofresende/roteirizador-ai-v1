#!/usr/bin/env node

/**
 * Auto-Fix Orchestrator V6.2 - Orquestração Completa de Correções
 * Coordena todo o processo de detecção → análise → correção → validação
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoFixOrchestrator {
  constructor() {
    this.logsDir = path.join(__dirname, '..', 'logs');
    this.promptsDir = path.join(__dirname, '..', 'PROMPTS_AUTO_GENERATED');
    this.maxIterations = 5; // Máximo de tentativas
    this.currentIteration = 0;
  }

  /**
   * Executa ciclo completo de correção automática
   */
  async runAutoFix() {
    console.log('🚀 Auto-Fix Orchestrator V6.2 iniciado');
    console.log('🔄 Executando ciclo completo de correção automática...');

    try {
      while (this.currentIteration < this.maxIterations) {
        this.currentIteration++;
        console.log(`\n🔄 === ITERAÇÃO ${this.currentIteration}/${this.maxIterations} ===`);

        // Passo 1: Detectar erros
        console.log('📊 1. Detectando erros...');
        await this.detectErrors();

        // Passo 2: Analisar erros
        console.log('🧠 2. Analisando erros...');
        const analysis = await this.analyzeErrors();

        // Se não há erros, parar
        if (!analysis || analysis.totalErrors === 0) {
          console.log('✅ Nenhum erro detectado! Sistema limpo.');
          break;
        }

        console.log(`📋 Encontrados ${analysis.totalErrors} erros para correção`);

        // Passo 3: Gerar prompts
        console.log('📝 3. Gerando prompts de correção...');
        const prompts = await this.generatePrompts();

        if (prompts.length === 0) {
          console.log('⚠️  Nenhum prompt gerado. Parando processo.');
          break;
        }

        // Passo 4: Executar correções (simular por agora)
        console.log('🔧 4. Executando correções...');
        await this.executeCorrections(prompts);

        // Passo 5: Validar correções
        console.log('✅ 5. Validando correções...');
        const validationResult = await this.validateCorrections();

        if (validationResult.success) {
          console.log('✅ Correções validadas com sucesso!');
          
          // Executar uma última verificação
          await this.detectErrors();
          const finalAnalysis = await this.analyzeErrors();
          
          if (!finalAnalysis || finalAnalysis.totalErrors === 0) {
            console.log('🎉 Sistema completamente limpo! Processo concluído.');
            break;
          }
        }

        // Se chegou aqui, ainda há erros
        console.log('⚠️  Ainda há erros após correção. Repetindo processo...');
        
        if (this.currentIteration >= this.maxIterations) {
          console.log('⚠️  Máximo de iterações atingido. Processo interrompido.');
          console.log('💡 Alguns erros podem precisar de intervenção manual.');
        }
      }

      // Relatório final
      await this.generateFinalReport();

    } catch (error) {
      console.error('❌ Erro durante processo de auto-fix:', error.message);
      throw error;
    }
  }

  /**
   * Detecta erros executando monitor
   */
  async detectErrors() {
    try {
      // Executar monitor rapidamente para capturar estado atual
      execSync('timeout 10s node scripts/error-monitor.js || true', { 
        stdio: 'pipe' 
      });
    } catch (error) {
      // Ignorar timeout - é esperado
    }
  }

  /**
   * Analisa erros executando analyzer
   */
  async analyzeErrors() {
    try {
      execSync('node scripts/error-analyzer.js', { stdio: 'pipe' });
      
      const analysisFile = path.join(this.logsDir, 'error-analysis.json');
      if (fs.existsSync(analysisFile)) {
        return JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Falha na análise:', error.message);
    }
    
    return null;
  }

  /**
   * Gera prompts executando generator
   */
  async generatePrompts() {
    try {
      execSync('node scripts/prompt-generator.js', { stdio: 'pipe' });
      
      // Listar prompts gerados
      if (fs.existsSync(this.promptsDir)) {
        const files = fs.readdirSync(this.promptsDir)
          .filter(f => f.endsWith('.md'))
          .map(f => path.join(this.promptsDir, f));
        
        return files;
      }
    } catch (error) {
      console.warn('⚠️  Falha na geração de prompts:', error.message);
    }
    
    return [];
  }

  /**
   * Executa correções (simular por agora)
   */
  async executeCorrections(prompts) {
    console.log(`📋 ${prompts.length} prompts prontos para execução`);
    
    prompts.forEach((promptFile, index) => {
      const promptName = path.basename(promptFile);
      console.log(`  ${index + 1}. ${promptName}`);
    });

    // Por agora, simular execução
    console.log('💡 SIMULAÇÃO: Em produção, aqui os prompts seriam enviados para IAs do Cursor');
    console.log('🔄 Para executar manualmente: copie o conteúdo dos prompts e execute com IA');
    
    // Simular delay de execução
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Valida se correções funcionaram
   */
  async validateCorrections() {
    try {
      console.log('🔍 Executando validação...');
      
      // Tentar build
      execSync('npm run build', { stdio: 'pipe', timeout: 60000 });
      console.log('✅ Build passou');
      
      // Outras validações poderiam ser adicionadas aqui
      return { success: true, message: 'Build passou com sucesso' };
      
    } catch (error) {
      console.log('❌ Validação falhou');
      return { 
        success: false, 
        message: 'Build failed: ' + error.message.substring(0, 100) 
      };
    }
  }

  /**
   * Gera relatório final do processo
   */
  async generateFinalReport() {
    const reportFile = path.join(this.logsDir, 'auto-fix-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      iterations: this.currentIteration,
      maxIterations: this.maxIterations,
      status: this.currentIteration < this.maxIterations ? 'completed' : 'max_iterations_reached',
      finalAnalysis: null
    };

    // Incluir análise final se disponível
    try {
      const finalAnalysis = await this.analyzeErrors();
      report.finalAnalysis = finalAnalysis;
    } catch (error) {
      // Ignorar erro na análise final
    }

    try {
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`📊 Relatório final salvo: ${reportFile}`);
    } catch (error) {
      console.warn('⚠️  Erro ao salvar relatório:', error.message);
    }

    // Exibir resumo
    this.displayFinalSummary(report);
  }

  /**
   * Exibe resumo final
   */
  displayFinalSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DO AUTO-FIX');
    console.log('='.repeat(60));
    console.log(`⏱️  Iterações executadas: ${report.iterations}/${report.maxIterations}`);
    console.log(`📅 Finalizado em: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🎯 Status: ${report.status}`);
    
    if (report.finalAnalysis) {
      console.log(`📊 Erros finais: ${report.finalAnalysis.totalErrors}`);
      if (report.finalAnalysis.totalErrors === 0) {
        console.log('🎉 SUCESSO: Sistema completamente limpo!');
      } else {
        console.log('⚠️  PARCIAL: Alguns erros ainda existem');
        console.log('💡 Recomendação: Revisar prompts gerados manualmente');
      }
    }
    
    console.log('='.repeat(60));
  }
}

// Execução se chamado diretamente
const orchestrator = new AutoFixOrchestrator();

// Captura sinais para relatório de interrupção
process.on('SIGINT', () => {
  console.log('\n⏹️  Processo interrompido pelo usuário');
  orchestrator.generateFinalReport().then(() => {
    process.exit(0);
  });
});

orchestrator.runAutoFix().catch(error => {
  console.error('❌ Erro crítico:', error.message);
  process.exit(1);
});

export default AutoFixOrchestrator; 