#!/usr/bin/env node

/**
 * 🔍 STORYBOOK VALIDATION SCRIPT
 * Script para validação completa do Storybook em pipelines CI/CD
 * Implementado seguindo metodologia V7.5 Enhanced
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const CONFIG = {
  STORYBOOK_PORT: process.env.STORYBOOK_PORT || 6006,
  TIMEOUT: 60000,
  RETRY_COUNT: 3,
  BUILD_DIR: 'storybook-static',
  REQUIRED_FILES: [
    '.storybook/main.ts',
    '.storybook/preview.ts',
    'package.json'
  ],
  STORY_PATTERNS: [
    'src/**/*.stories.@(js|jsx|ts|tsx)',
    'src/**/*.stories.mdx'
  ]
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class StorybookValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validations = [];
    this.startTime = Date.now();
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const color = {
      'INFO': colors.cyan,
      'SUCCESS': colors.green,
      'WARNING': colors.yellow,
      'ERROR': colors.red
    }[type] || colors.reset;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  addValidation(name, status, details = {}) {
    this.validations.push({
      name,
      status,
      details,
      timestamp: new Date().toISOString()
    });
  }

  exec(command, options = {}) {
    try {
      return execSync(command, { 
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
    } catch (error) {
      if (!options.allowFailure) {
        throw error;
      }
      return null;
    }
  }

  async validateEnvironment() {
    this.log('🔍 Validating environment...', 'INFO');
    
    // Verificar Node.js version
    const nodeVersion = process.version;
    this.log(`Node.js version: ${nodeVersion}`);
    
    // Verificar npm version
    const npmVersion = this.exec('npm --version', { silent: true });
    this.log(`npm version: ${npmVersion?.trim()}`);
    
    // Verificar se está no diretório correto
    if (!fs.existsSync('package.json')) {
      this.errors.push('package.json not found - not in project root');
      return false;
    }
    
    // Verificar se Storybook está instalado
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasStorybook = packageJson.devDependencies?.['@storybook/react-vite'] || 
                       packageJson.dependencies?.['@storybook/react-vite'];
    
    if (!hasStorybook) {
      this.errors.push('Storybook not found in dependencies');
      return false;
    }
    
    this.addValidation('Environment Check', 'PASS', {
      nodeVersion,
      npmVersion: npmVersion?.trim(),
      storybookInstalled: true
    });
    
    this.log('✅ Environment validation passed', 'SUCCESS');
    return true;
  }

  async validateConfiguration() {
    this.log('⚙️ Validating Storybook configuration...', 'INFO');
    
    let allValid = true;
    
    // Verificar arquivos obrigatórios
    for (const file of CONFIG.REQUIRED_FILES) {
      if (fs.existsSync(file)) {
        this.log(`✅ Found: ${file}`);
      } else {
        this.errors.push(`Missing required file: ${file}`);
        allValid = false;
      }
    }
    
    // Validar sintaxe dos arquivos de configuração
    if (fs.existsSync('.storybook/main.ts')) {
      try {
        this.exec('npx tsc --noEmit --skipLibCheck .storybook/main.ts', { silent: true });
        this.log('✅ main.ts syntax is valid');
      } catch (error) {
        this.errors.push('main.ts has syntax errors');
        allValid = false;
      }
    }
    
    if (fs.existsSync('.storybook/preview.ts')) {
      try {
        this.exec('npx tsc --noEmit --skipLibCheck .storybook/preview.ts', { silent: true });
        this.log('✅ preview.ts syntax is valid');
      } catch (error) {
        this.errors.push('preview.ts has syntax errors');
        allValid = false;
      }
    }
    
    this.addValidation('Configuration Check', allValid ? 'PASS' : 'FAIL', {
      requiredFiles: CONFIG.REQUIRED_FILES.map(file => ({
        file,
        exists: fs.existsSync(file)
      }))
    });
    
    if (allValid) {
      this.log('✅ Configuration validation passed', 'SUCCESS');
    } else {
      this.log('❌ Configuration validation failed', 'ERROR');
    }
    
    return allValid;
  }

  async validateStories() {
    this.log('📖 Validating stories...', 'INFO');
    
    // Encontrar arquivos de stories
    const storyFiles = [];
    const findStories = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          findStories(filePath);
        } else if (file.includes('.stories.')) {
          storyFiles.push(filePath);
        }
      }
    };
    
    if (fs.existsSync('src')) {
      findStories('src');
    }
    
    this.log(`📊 Found ${storyFiles.length} story files`);
    
    // Validar sintaxe das stories
    let validStories = 0;
    for (const storyFile of storyFiles) {
      try {
        this.exec(`npx tsc --noEmit --skipLibCheck "${storyFile}"`, { silent: true });
        validStories++;
      } catch (error) {
        this.warnings.push(`Story file has syntax issues: ${storyFile}`);
      }
    }
    
    this.addValidation('Stories Check', 'PASS', {
      totalStories: storyFiles.length,
      validStories,
      storyFiles: storyFiles.map(f => path.relative(process.cwd(), f))
    });
    
    this.log(`✅ Stories validation completed (${validStories}/${storyFiles.length} valid)`, 'SUCCESS');
    return true;
  }

  async validateBuild() {
    this.log('🏗️ Validating Storybook build...', 'INFO');
    
    // Limpar build anterior
    if (fs.existsSync(CONFIG.BUILD_DIR)) {
      this.exec(`rm -rf ${CONFIG.BUILD_DIR}`);
    }
    
    // Executar build
    try {
      const buildOutput = this.exec('npm run build-storybook', { silent: true });
      this.log('✅ Build completed successfully');
      
      // Verificar se build foi criado
      if (!fs.existsSync(CONFIG.BUILD_DIR)) {
        this.errors.push('Build directory not created');
        return false;
      }
      
      // Verificar arquivos essenciais
      const requiredBuildFiles = ['index.html', 'static'];
      for (const file of requiredBuildFiles) {
        const filePath = path.join(CONFIG.BUILD_DIR, file);
        if (!fs.existsSync(filePath)) {
          this.errors.push(`Missing build file: ${file}`);
          return false;
        }
      }
      
      // Verificar tamanho do build
      const buildSize = this.exec(`du -sh ${CONFIG.BUILD_DIR}`, { silent: true });
      this.log(`📏 Build size: ${buildSize?.trim()}`);
      
      this.addValidation('Build Check', 'PASS', {
        buildSize: buildSize?.trim(),
        outputDir: CONFIG.BUILD_DIR
      });
      
      return true;
    } catch (error) {
      this.errors.push(`Build failed: ${error.message}`);
      this.addValidation('Build Check', 'FAIL', {
        error: error.message
      });
      return false;
    }
  }

  async validateRuntime() {
    this.log('🚀 Validating runtime behavior...', 'INFO');
    
    // Iniciar servidor
    const server = this.exec(`npx serve ${CONFIG.BUILD_DIR} -p ${CONFIG.STORYBOOK_PORT}`, { 
      silent: true,
      detached: true
    });
    
    // Aguardar servidor iniciar
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        this.exec(`curl -s -f http://localhost:${CONFIG.STORYBOOK_PORT} > /dev/null`);
        this.log('✅ Server started successfully');
        break;
      } catch (error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (attempts >= maxAttempts) {
      this.errors.push('Server failed to start within timeout');
      return false;
    }
    
    // Verificar resposta HTTP
    try {
      const response = this.exec(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${CONFIG.STORYBOOK_PORT}`);
      if (response?.trim() !== '200') {
        this.errors.push(`Server returned HTTP ${response?.trim()}`);
        return false;
      }
    } catch (error) {
      this.errors.push('Failed to check server response');
      return false;
    }
    
    // Verificar conteúdo
    try {
      const content = this.exec(`curl -s http://localhost:${CONFIG.STORYBOOK_PORT}`);
      if (!content?.includes('Storybook')) {
        this.warnings.push('Storybook content not found in response');
      }
    } catch (error) {
      this.warnings.push('Failed to check content');
    }
    
    this.addValidation('Runtime Check', 'PASS', {
      serverPort: CONFIG.STORYBOOK_PORT,
      httpStatus: '200'
    });
    
    return true;
  }

  async generateReport() {
    const duration = Date.now() - this.startTime;
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      status: this.errors.length === 0 ? 'PASS' : 'FAIL',
      summary: {
        validations: this.validations.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      validations: this.validations,
      errors: this.errors,
      warnings: this.warnings,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd()
      }
    };
    
    // Salvar relatório
    const reportFile = `logs/storybook-validation-${Date.now()}.json`;
    fs.mkdirSync('logs', { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    // Console output
    this.log('\n📊 VALIDATION REPORT', 'INFO');
    this.log('─'.repeat(60));
    this.log(`Duration: ${duration}ms`);
    this.log(`Status: ${report.status}`);
    this.log(`Validations: ${this.validations.length}`);
    this.log(`Errors: ${this.errors.length}`);
    this.log(`Warnings: ${this.warnings.length}`);
    this.log(`Report saved: ${reportFile}`);
    
    if (this.errors.length > 0) {
      this.log('\n❌ ERRORS:', 'ERROR');
      this.errors.forEach(error => this.log(`  • ${error}`, 'ERROR'));
    }
    
    if (this.warnings.length > 0) {
      this.log('\n⚠️  WARNINGS:', 'WARNING');
      this.warnings.forEach(warning => this.log(`  • ${warning}`, 'WARNING'));
    }
    
    if (report.status === 'PASS') {
      this.log('\n🎉 All validations passed!', 'SUCCESS');
    } else {
      this.log('\n🚨 Validation failed!', 'ERROR');
    }
    
    return report;
  }

  async run() {
    this.log('🔍 Starting Storybook validation...', 'INFO');
    
    try {
      // Executar validações
      await this.validateEnvironment();
      await this.validateConfiguration();
      await this.validateStories();
      await this.validateBuild();
      await this.validateRuntime();
      
      // Gerar relatório
      const report = await this.generateReport();
      
      // Exit code baseado no status
      process.exit(report.status === 'PASS' ? 0 : 1);
      
    } catch (error) {
      this.log(`💥 Validation failed with error: ${error.message}`, 'ERROR');
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const validator = new StorybookValidator();
  validator.run();
}

module.exports = StorybookValidator; 