#!/usr/bin/env node

/**
 * Error Monitor V6.2 - Sistema de Monitoramento Automático
 * Detecta e captura erros em tempo real
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ErrorMonitor {
  constructor() {
    this.errorsFile = path.join(__dirname, '..', 'logs', 'errors-detected.json');
    this.errors = [];
    this.isMonitoring = false;
    
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
    console.log('🚀 Error Monitor V6.2 iniciado');
    console.log('📊 Monitorando erros em tempo real...');
    
    this.isMonitoring = true;
    
    // Monitora build errors
    setInterval(() => {
      this.checkBuildErrors();
    }, 30000); // A cada 30 segundos

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
        type: 'build',
        priority: 'HIGH',
        timestamp: new Date().toISOString(),
        error: {
          message: 'Build failed',
          stack: error.stdout?.toString() || error.stderr?.toString() || error.message,
          command: 'npm run build'
        },
        status: 'detected'
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
    // Evitar duplicatas
    const isDuplicate = this.errors.some(existing => 
      existing.error.message === error.error.message &&
      existing.type === error.type
    );
    
    if (!isDuplicate) {
      this.errors.push(error);
      console.log(`🚨 Novo erro detectado: ${error.error.message}`);
      
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
        errors: this.errors
      };
      
      fs.writeFileSync(this.errorsFile, JSON.stringify(errorData, null, 2));
      console.log(`💾 ${this.errors.length} erros salvos em ${this.errorsFile}`);
      
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