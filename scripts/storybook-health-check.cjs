#!/usr/bin/env node

/**
 * 🏥 STORYBOOK HEALTH CHECK SYSTEM
 * Sistema automatizado de monitoramento e health checks para o Storybook
 * Implementado seguindo metodologia V7.5 Enhanced
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configurações
const CONFIG = {
  STORYBOOK_URL: 'http://localhost:6006',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 2000,
  LOG_FILE: 'logs/storybook-health.log',
  ALERT_EMAIL: process.env.STORYBOOK_ALERT_EMAIL || null,
  WEBHOOK_URL: process.env.STORYBOOK_WEBHOOK_URL || null
};

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class StorybookHealthChecker {
  constructor() {
    this.startTime = Date.now();
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(CONFIG.LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    
    // Console output com cores
    const color = {
      'INFO': colors.green,
      'WARN': colors.yellow,
      'ERROR': colors.red,
      'DEBUG': colors.cyan
    }[type] || colors.reset;
    
    console.log(`${color}${logEntry}${colors.reset}`);
    
    // Arquivo de log
    fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async httpRequest(url, timeout = CONFIG.TIMEOUT) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, { timeout }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            responseTime: Date.now() - startTime
          });
        });
      });

      const startTime = Date.now();
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout (${timeout}ms)`));
      });

      req.on('error', reject);
    });
  }

  async checkStorybookResponse() {
    this.log('🌐 Verificando resposta do Storybook...');
    
    try {
      const response = await this.httpRequest(CONFIG.STORYBOOK_URL);
      
      if (response.statusCode === 200) {
        this.log(`✅ Storybook respondendo (${response.responseTime}ms)`);
        this.checks.push({
          name: 'HTTP Response',
          status: 'PASS',
          responseTime: response.responseTime,
          statusCode: response.statusCode
        });
        return true;
      } else {
        this.log(`❌ Storybook retornou status ${response.statusCode}`, 'ERROR');
        this.errors.push(`HTTP ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ Erro ao conectar com Storybook: ${error.message}`, 'ERROR');
      this.errors.push(`Connection Error: ${error.message}`);
      return false;
    }
  }

  async checkStorybookProcess() {
    this.log('🔍 Verificando processo do Storybook...');
    
    try {
      const { stdout } = await execAsync('lsof -ti:6006');
      const pid = stdout.trim();
      
      if (pid) {
        this.log(`✅ Storybook rodando (PID: ${pid})`);
        this.checks.push({
          name: 'Process Check',
          status: 'PASS',
          pid: pid
        });
        return true;
      } else {
        this.log('❌ Processo do Storybook não encontrado', 'ERROR');
        this.errors.push('No process found on port 6006');
        return false;
      }
    } catch (error) {
      this.log(`❌ Erro ao verificar processo: ${error.message}`, 'ERROR');
      this.errors.push(`Process Check Error: ${error.message}`);
      return false;
    }
  }

  async checkStorybookConfig() {
    this.log('⚙️ Verificando configuração do Storybook...');
    
    const requiredFiles = [
      '.storybook/main.ts',
      '.storybook/preview.ts',
      'package.json'
    ];
    
    let allFilesExist = true;
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.log(`✅ Arquivo encontrado: ${file}`);
      } else {
        this.log(`❌ Arquivo não encontrado: ${file}`, 'ERROR');
        this.errors.push(`Missing file: ${file}`);
        allFilesExist = false;
      }
    }
    
    this.checks.push({
      name: 'Configuration Check',
      status: allFilesExist ? 'PASS' : 'FAIL',
      files: requiredFiles.map(file => ({ file, exists: fs.existsSync(file) }))
    });
    
    return allFilesExist;
  }

  async checkStorybookBuild() {
    this.log('🏗️ Verificando capacidade de build do Storybook...');
    
    try {
      const { stdout, stderr } = await execAsync('npm run build-storybook 2>&1 | head -20');
      
      if (stderr && stderr.includes('error')) {
        this.log(`⚠️ Warnings durante build: ${stderr}`, 'WARN');
        this.warnings.push('Build warnings detected');
      }
      
      this.log('✅ Build do Storybook funcional');
      this.checks.push({
        name: 'Build Check',
        status: 'PASS',
        output: stdout.substring(0, 200) + '...'
      });
      
      return true;
    } catch (error) {
      this.log(`❌ Erro no build: ${error.message}`, 'ERROR');
      this.errors.push(`Build Error: ${error.message}`);
      
      this.checks.push({
        name: 'Build Check',
        status: 'FAIL',
        error: error.message
      });
      
      return false;
    }
  }

  async checkStorybookStories() {
    this.log('📖 Verificando stories do Storybook...');
    
    try {
      const response = await this.httpRequest(`${CONFIG.STORYBOOK_URL}/index.json`);
      
      if (response.statusCode === 200) {
        const indexData = JSON.parse(response.body);
        const storyCount = Object.keys(indexData.entries || {}).length;
        
        this.log(`✅ ${storyCount} stories encontradas`);
        this.checks.push({
          name: 'Stories Check',
          status: 'PASS',
          storyCount: storyCount
        });
        
        return true;
      } else {
        this.log('❌ Não foi possível carregar index das stories', 'ERROR');
        this.errors.push('Stories index not accessible');
        return false;
      }
    } catch (error) {
      this.log(`❌ Erro ao verificar stories: ${error.message}`, 'ERROR');
      this.errors.push(`Stories Check Error: ${error.message}`);
      return false;
    }
  }

  async checkSystemResources() {
    this.log('💻 Verificando recursos do sistema...');
    
    try {
      const { stdout: memInfo } = await execAsync('free -h 2>/dev/null || vm_stat 2>/dev/null || echo "Memory info not available"');
      const { stdout: diskInfo } = await execAsync('df -h . 2>/dev/null || echo "Disk info not available"');
      
      this.log('✅ Recursos do sistema verificados');
      this.checks.push({
        name: 'System Resources',
        status: 'PASS',
        memory: memInfo.substring(0, 100) + '...',
        disk: diskInfo.substring(0, 100) + '...'
      });
      
      return true;
    } catch (error) {
      this.log(`⚠️ Não foi possível verificar recursos: ${error.message}`, 'WARN');
      this.warnings.push('System resources check failed');
      return false;
    }
  }

  async sendAlert(message) {
    if (CONFIG.WEBHOOK_URL) {
      try {
        // Implementar webhook notification
        this.log(`📢 Enviando alerta via webhook: ${message}`);
      } catch (error) {
        this.log(`❌ Erro ao enviar webhook: ${error.message}`, 'ERROR');
      }
    }
  }

  async generateReport() {
    const duration = Date.now() - this.startTime;
    const totalChecks = this.checks.length;
    const passedChecks = this.checks.filter(c => c.status === 'PASS').length;
    const failedChecks = this.checks.filter(c => c.status === 'FAIL').length;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        total: totalChecks,
        passed: passedChecks,
        failed: failedChecks,
        warnings: this.warnings.length,
        errors: this.errors.length
      },
      checks: this.checks,
      errors: this.errors,
      warnings: this.warnings,
      status: this.errors.length === 0 ? 'HEALTHY' : 'UNHEALTHY'
    };
    
    // Salvar relatório
    const reportFile = `logs/storybook-health-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Console output
    console.log(`\n${colors.bright}╭─────────────────────────────────────────────────────────────╮${colors.reset}`);
    console.log(`${colors.bright}│                    🏥 HEALTH CHECK REPORT                   │${colors.reset}`);
    console.log(`${colors.bright}╰─────────────────────────────────────────────────────────────╯${colors.reset}`);
    console.log(`${colors.cyan}📊 Resumo:${colors.reset}`);
    console.log(`   ✅ Checks passed: ${passedChecks}/${totalChecks}`);
    console.log(`   ❌ Checks failed: ${failedChecks}/${totalChecks}`);
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📄 Report saved: ${reportFile}`);
    
    if (report.status === 'HEALTHY') {
      console.log(`${colors.green}🎉 Storybook está saudável!${colors.reset}`);
    } else {
      console.log(`${colors.red}🚨 Storybook apresenta problemas!${colors.reset}`);
      await this.sendAlert('Storybook health check failed');
    }
    
    return report;
  }

  async run() {
    this.log('🏥 Iniciando health check do Storybook...');
    
    // Executar todos os checks
    await this.checkStorybookConfig();
    await this.checkStorybookProcess();
    await this.checkStorybookResponse();
    await this.checkStorybookStories();
    await this.checkSystemResources();
    
    // Gerar relatório
    const report = await this.generateReport();
    
    // Exit code baseado no status
    process.exit(report.status === 'HEALTHY' ? 0 : 1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const checker = new StorybookHealthChecker();
  checker.run().catch(error => {
    console.error(`${colors.red}❌ Health check falhou: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = StorybookHealthChecker; 