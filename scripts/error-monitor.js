#!/usr/bin/env node

/**
 * Error Monitor V6.3 - Sistema de Monitoramento Automático Expandido
 * Detecta e captura erros de build e runtime (browser) em tempo real
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ErrorMonitor {
  constructor() {
    this.errorsFile = path.join(__dirname, '..', 'logs', 'errors-detected.json');
    this.browserErrorsFile = path.join(__dirname, '..', 'logs', 'browser-errors.json');
    this.errors = [];
    this.isMonitoring = false;
    this.browserMonitorMode = false;
    
    // Criar diretório de logs se não existir
    const logsDir = path.dirname(this.errorsFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Inicia monitoramento contínuo
   */
  startMonitoring() {
    console.log('🚀 Error Monitor V6.3 iniciado');
    console.log('📊 Monitorando erros de build e runtime...');
    
    this.isMonitoring = true;
    
    // Check command line args
    const args = process.argv.slice(2);
    if (args.includes('--browser-only')) {
      this.browserMonitorMode = true;
      console.log('🌐 Modo browser-only ativado');
    }
    
    if (!this.browserMonitorMode) {
      // Monitora build errors
      setInterval(() => {
        this.checkBuildErrors();
      }, 30000); // A cada 30 segundos
    }

    // Monitora browser errors
    setInterval(() => {
      this.processBrowserErrors();
    }, 10000); // A cada 10 segundos

    // Monitora runtime errors (se em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      this.monitorDevServer();
    }

    // Salva erros periodicamente
    setInterval(() => {
      this.saveErrors();
    }, 60000); // A cada minuto
  }

  /**
   * Processa erros de browser do arquivo
   */
  processBrowserErrors() {
    try {
      if (!fs.existsSync(this.browserErrorsFile)) {
        return;
      }

      const browserData = JSON.parse(fs.readFileSync(this.browserErrorsFile, 'utf8'));
      
      if (!browserData.errors || browserData.errors.length === 0) {
        return;
      }

      console.log(`🌐 Processando ${browserData.errors.length} erros de browser...`);

      browserData.errors.forEach(browserError => {
        // Criar hash único para evitar duplicatas
        const errorHash = this.generateErrorHash(browserError);
        
        // Verificar se já processamos este erro
        const alreadyProcessed = this.errors.some(e => e.hash === errorHash);
        
        if (!alreadyProcessed) {
          // Adaptar estrutura para o sistema existente
          const adaptedError = {
            id: browserError.id,
            hash: errorHash,
            type: `runtime:${browserError.type}`,
            priority: browserError.priority,
            timestamp: browserError.timestamp,
            error: {
              message: browserError.message,
              stack: browserError.stack || 'No stack trace available',
              url: browserError.url,
              userAgent: browserError.userAgent
            },
            status: 'detected',
            source: 'browser',
            count: browserError.count || 1,
            firstSeen: browserError.firstSeen,
            lastSeen: browserError.lastSeen
          };
          
          this.addError(adaptedError);
        }
      });

    } catch (error) {
      console.error('❌ Erro ao processar browser errors:', error.message);
    }
  }

  /**
   * Gera hash único para um erro
   */
  generateErrorHash(error) {
    const content = `${error.type}-${error.message}-${error.url}`;
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  }

  /**
   * Verifica erros de build
   */
  checkBuildErrors() {
    try {
      console.log('🔍 Verificando build errors...');
      
      // Tenta build sem output verboso
      execSync('npm run build', { 
        stdio: 'pipe',
        timeout: 60000 
      });
      
      console.log('✅ Build OK - nenhum erro detectado');
      
    } catch (error) {
      console.log('❌ Build errors detectados!');
      
      const buildError = {
        id: `build-${Date.now()}`,
        hash: this.generateErrorHash({ 
          type: 'build', 
          message: 'Build failed', 
          url: 'build-process' 
        }),
        type: 'build',
        priority: 'HIGH',
        timestamp: new Date().toISOString(),
        error: {
          message: 'Build failed',
          stack: error.stdout?.toString() || error.stderr?.toString() || error.message,
          command: 'npm run build'
        },
        status: 'detected',
        source: 'build'
      };
      
      this.addError(buildError);
    }
  }

  /**
   * Monitora dev server (modo desenvolvimento)
   */
  monitorDevServer() {
    // Implementar captura de logs do dev server
    console.log('🔧 Monitoramento dev server ativo');
    
    // Placeholder para captura de logs do vite dev server
    // Em implementação real, capturaria logs do processo do vite
  }

  /**
   * Adiciona erro à lista
   */
  addError(error) {
    // Evitar duplicatas usando hash
    const isDuplicate = this.errors.some(existing => 
      existing.hash === error.hash
    );
    
    if (!isDuplicate) {
      this.errors.push(error);
      console.log(`🚨 Novo erro detectado: [${error.type}] ${error.error.message.substring(0, 60)}...`);
      
      // Trigger análise imediata se for crítico
      if (error.priority === 'CRITICAL' || error.priority === 'HIGH') {
        this.triggerImmediateAnalysis(error);
      }
    }
  }

  /**
   * Trigger análise imediata para erros críticos
   */
  triggerImmediateAnalysis(error) {
    console.log(`⚡ Triggering análise imediata para erro ${error.priority}`);
    
    try {
      // Executa analyzer imediatamente
      execSync('node scripts/error-analyzer.js --immediate', { 
        stdio: 'inherit' 
      });
    } catch (analyzerError) {
      console.error('❌ Falha ao executar analyzer:', analyzerError.message);
    }
  }

  /**
   * Salva erros em arquivo
   */
  saveErrors() {
    if (this.errors.length === 0) return;
    
    try {
      const errorData = {
        lastUpdated: new Date().toISOString(),
        totalErrors: this.errors.length,
        buildErrors: this.errors.filter(e => e.source === 'build').length,
        runtimeErrors: this.errors.filter(e => e.source === 'browser').length,
        errors: this.errors
      };
      
      fs.writeFileSync(this.errorsFile, JSON.stringify(errorData, null, 2));
      console.log(`💾 ${this.errors.length} erros salvos (${errorData.buildErrors} build, ${errorData.runtimeErrors} runtime)`);
      
    } catch (saveError) {
      console.error('❌ Falha ao salvar erros:', saveError.message);
    }
  }

  /**
   * Para monitoramento
   */
  stopMonitoring() {
    this.isMonitoring = false;
    this.saveErrors();
    console.log('🛑 Error Monitor parado');
  }
}

// Execução se chamado diretamente
const monitor = new ErrorMonitor();

// Captura sinais para parar gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Parando Error Monitor...');
  monitor.stopMonitoring();
  process.exit(0);
});

monitor.startMonitoring(); 