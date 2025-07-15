#!/usr/bin/env node

/**
 * 🔧 PROFESSIONAL STORYBOOK DEBUGGING SYSTEM V8.0
 * 
 * Como os profissionais fazem debugging sistemático:
 * 1. Automação total de health checks
 * 2. Coleta centralizada de errors
 * 3. Análise categórica de problemas
 * 4. Relatórios estruturados
 * 
 * @author IA Alpha - Professional Debugging Specialist
 * @version 8.0 - Storybook Focus
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProfessionalStorybookDebugger {
  constructor() {
    this.storybookPort = 6006;
    this.baseUrl = `http://localhost:${this.storybookPort}`;
    this.resultsDir = './evidence/storybook-professional-analysis';
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Health Check Categories
    this.healthCategories = {
      BUILD_HEALTH: 'Build & Compilation',
      STORY_LOADING: 'Story Loading Status', 
      COMPONENT_ERRORS: 'Component Runtime Errors',
      TYPE_SAFETY: 'TypeScript Issues',
      PERFORMANCE: 'Loading Performance',
      CONSOLE_HEALTH: 'Console Warnings/Errors'
    };
  }

  /**
   * 🎯 PROFESSIONAL METHOD 1: AUTOMATED HEALTH SCANNING
   * Em empresas reais, usam ferramentas como Chromatic, Percy, etc.
   */
  async runComprehensiveHealthScan() {
    console.log('\n🔍 INICIANDO HEALTH SCAN PROFISSIONAL DO STORYBOOK...\n');
    
    const healthReport = {
      scanTimestamp: new Date().toISOString(),
      methodology: 'PROFESSIONAL_SYSTEMATIC_DEBUGGING_V8',
      scope: 'STORYBOOK_COMPREHENSIVE_ANALYSIS',
      categories: {}
    };

    // 1. Verificar se Storybook está rodando
    const isRunning = await this.checkStorybookRunning();
    healthReport.categories.SERVICE_STATUS = {
      status: isRunning ? 'HEALTHY' : 'CRITICAL',
      details: isRunning ? 'Storybook respondendo na porta 6006' : 'Storybook não acessível'
    };

    if (!isRunning) {
      console.log('❌ CRÍTICO: Storybook não está rodando. Iniciando...');
      await this.startStorybook();
      await this.waitForStorybook();
    }

    // 2. Build Health Check
    healthReport.categories.BUILD_HEALTH = await this.checkBuildHealth();
    
    // 3. Stories Loading Analysis
    healthReport.categories.STORY_LOADING = await this.analyzeStoriesLoading();
    
    // 4. Console Errors Analysis  
    healthReport.categories.CONSOLE_HEALTH = await this.analyzeConsoleErrors();
    
    // 5. Performance Metrics
    healthReport.categories.PERFORMANCE = await this.measurePerformance();

    // 6. Generate Professional Report
    await this.generateProfessionalReport(healthReport);
    
    return healthReport;
  }

  /**
   * 🔧 CHECK 1: Build Health
   */
  async checkBuildHealth() {
    try {
      console.log('📦 Verificando build health...');
      
      const buildOutput = execSync('npm run build-storybook', { 
        encoding: 'utf8',
        timeout: 120000,
        stdio: 'pipe'
      });
      
      const warnings = buildOutput.match(/warning/gi) || [];
      const errors = buildOutput.match(/error/gi) || [];
      
      return {
        status: errors.length === 0 ? 'HEALTHY' : 'DEGRADED',
        buildTime: this.extractBuildTime(buildOutput),
        warnings: warnings.length,
        errors: errors.length,
        details: buildOutput.split('\n').slice(-10).join('\n')
      };
    } catch (error) {
      return {
        status: 'CRITICAL',
        error: error.message,
        details: 'Build failed completely'
      };
    }
  }

  /**
   * 🔧 CHECK 2: Stories Loading Analysis
   */
  async analyzeStoriesLoading() {
    try {
      console.log('📚 Analisando carregamento de stories...');
      
      // Professional approach: Parse Storybook's internal API
      const response = await fetch(`${this.baseUrl}/stories.json`);
      const storiesData = await response.json();
      
      const totalStories = Object.keys(storiesData.stories || {}).length;
      const loadingIssues = [];
      
      // Categorize stories by status
      const categorizedStories = {
        loaded: 0,
        errored: 0,
        missing: 0
      };

      // Simulate checking each story (professional tools do this automatically)
      for (const [storyId, story] of Object.entries(storiesData.stories || {})) {
        try {
          // Check if story is accessible
          const storyResponse = await fetch(`${this.baseUrl}/iframe.html?id=${storyId}`, {
            timeout: 5000
          });
          
          if (storyResponse.ok) {
            categorizedStories.loaded++;
          } else {
            categorizedStories.errored++;
            loadingIssues.push({
              id: storyId,
              title: story.title,
              issue: `HTTP ${storyResponse.status}`
            });
          }
        } catch (error) {
          categorizedStories.missing++;
          loadingIssues.push({
            id: storyId,
            title: story.title,
            issue: error.message
          });
        }
      }

      const healthPercentage = (categorizedStories.loaded / totalStories) * 100;
      
      return {
        status: healthPercentage > 95 ? 'HEALTHY' : healthPercentage > 80 ? 'DEGRADED' : 'CRITICAL',
        totalStories,
        loadedStories: categorizedStories.loaded,
        erroredStories: categorizedStories.errored,
        missingStories: categorizedStories.missing,
        healthPercentage: Math.round(healthPercentage),
        issues: loadingIssues.slice(0, 10) // Top 10 issues
      };
    } catch (error) {
      return {
        status: 'CRITICAL',
        error: error.message,
        details: 'Cannot access Storybook stories API'
      };
    }
  }

  /**
   * 🔧 CHECK 3: Console Errors Analysis
   */
  async analyzeConsoleErrors() {
    try {
      console.log('🖥️  Analisando console errors...');
      
      // Professional approach: Use headless browser to capture console
      const puppeteer = require('puppeteer-core');
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      });
      
      const page = await browser.newPage();
      const consoleErrors = [];
      const consoleWarnings = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });
      
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(5000); // Let Storybook fully load
      
      await browser.close();
      
      // Categorize errors
      const categorizedErrors = this.categorizeConsoleErrors(consoleErrors);
      
      return {
        status: consoleErrors.length === 0 ? 'HEALTHY' : consoleErrors.length < 5 ? 'DEGRADED' : 'CRITICAL',
        totalErrors: consoleErrors.length,
        totalWarnings: consoleWarnings.length,
        errorCategories: categorizedErrors,
        topErrors: consoleErrors.slice(0, 5),
        topWarnings: consoleWarnings.slice(0, 5)
      };
    } catch (error) {
      return {
        status: 'UNKNOWN',
        error: error.message,
        details: 'Could not analyze console (puppeteer required)'
      };
    }
  }

  /**
   * 🔧 CHECK 4: Performance Metrics
   */
  async measurePerformance() {
    try {
      console.log('⚡ Medindo performance...');
      
      const startTime = Date.now();
      const response = await fetch(this.baseUrl);
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      const responseSize = parseInt(response.headers.get('content-length') || '0');
      
      return {
        status: loadTime < 2000 ? 'HEALTHY' : loadTime < 5000 ? 'DEGRADED' : 'CRITICAL',
        loadTime: `${loadTime}ms`,
        responseSize: `${Math.round(responseSize / 1024)}KB`,
        responseStatus: response.status,
        performanceGrade: this.calculatePerformanceGrade(loadTime)
      };
    } catch (error) {
      return {
        status: 'CRITICAL',
        error: error.message
      };
    }
  }

  /**
   * 🔧 UTILITY: Categorize Console Errors (Professional Pattern Recognition)
   */
  categorizeConsoleErrors(errors) {
    const categories = {
      TYPESCRIPT_ERRORS: [],
      REACT_WARNINGS: [],
      MISSING_MODULES: [],
      NETWORK_ERRORS: [],
      OTHER: []
    };

    errors.forEach(error => {
      if (error.includes('TypeScript') || error.includes('TS')) {
        categories.TYPESCRIPT_ERRORS.push(error);
      } else if (error.includes('React') || error.includes('Warning:')) {
        categories.REACT_WARNINGS.push(error);
      } else if (error.includes('Module not found') || error.includes('Cannot resolve')) {
        categories.MISSING_MODULES.push(error);
      } else if (error.includes('fetch') || error.includes('network') || error.includes('CORS')) {
        categories.NETWORK_ERRORS.push(error);
      } else {
        categories.OTHER.push(error);
      }
    });

    return categories;
  }

  /**
   * 📊 PROFESSIONAL REPORT GENERATION
   */
  async generateProfessionalReport(healthReport) {
    const reportPath = path.join(this.resultsDir, `storybook-health-${this.timestamp}.json`);
    const summaryPath = path.join(this.resultsDir, `storybook-summary-${this.timestamp}.md`);
    
    // Ensure directory exists
    fs.mkdirSync(this.resultsDir, { recursive: true });
    
    // Save detailed JSON report
    fs.writeFileSync(reportPath, JSON.stringify(healthReport, null, 2));
    
    // Generate executive summary
    const summary = this.generateExecutiveSummary(healthReport);
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`\n📊 RELATÓRIO PROFISSIONAL GERADO:`);
    console.log(`   📄 Detalhado: ${reportPath}`);
    console.log(`   📋 Resumo: ${summaryPath}`);
    
    // Print immediate summary
    console.log('\n' + summary);
  }

  /**
   * 📋 EXECUTIVE SUMMARY GENERATION
   */
  generateExecutiveSummary(healthReport) {
    const overallHealth = this.calculateOverallHealth(healthReport);
    
    return `# 🔍 STORYBOOK HEALTH REPORT - PROFESSIONAL ANALYSIS

## 📊 **EXECUTIVE SUMMARY**
- **Overall Health:** ${overallHealth.status} (${overallHealth.score}/100)
- **Scan Timestamp:** ${healthReport.scanTimestamp}
- **Methodology:** Professional Systematic Debugging v8.0

## 🎯 **CRITICAL FINDINGS**

### Build Health: ${healthReport.categories.BUILD_HEALTH?.status || 'N/A'}
${healthReport.categories.BUILD_HEALTH?.errors > 0 ? `❌ ${healthReport.categories.BUILD_HEALTH.errors} build errors detected` : '✅ Build successful'}

### Story Loading: ${healthReport.categories.STORY_LOADING?.status || 'N/A'}  
${healthReport.categories.STORY_LOADING ? `📚 ${healthReport.categories.STORY_LOADING.loadedStories}/${healthReport.categories.STORY_LOADING.totalStories} stories loaded (${healthReport.categories.STORY_LOADING.healthPercentage}%)` : 'Data unavailable'}

### Console Health: ${healthReport.categories.CONSOLE_HEALTH?.status || 'N/A'}
${healthReport.categories.CONSOLE_HEALTH ? `🖥️ ${healthReport.categories.CONSOLE_HEALTH.totalErrors} errors, ${healthReport.categories.CONSOLE_HEALTH.totalWarnings} warnings` : 'Analysis pending'}

### Performance: ${healthReport.categories.PERFORMANCE?.status || 'N/A'}
${healthReport.categories.PERFORMANCE ? `⚡ Load time: ${healthReport.categories.PERFORMANCE.loadTime}` : 'Metrics unavailable'}

## 🔧 **RECOMMENDED ACTIONS**
${this.generateRecommendations(healthReport)}

## 📈 **PROFESSIONAL NOTES**
Este é o tipo de análise que empresas como Google, Netflix, Spotify fazem automaticamente:
- ✅ Monitoring contínuo ao invés de verificação manual
- ✅ Categorização automática de problemas  
- ✅ Métricas de performance em tempo real
- ✅ Alertas proativos ao invés de descoberta reativa

---
*Generated by Professional Debugging System v8.0*`;
  }

  /**
   * 🎯 HELPER METHODS
   */
  async checkStorybookRunning() {
    try {
      const response = await fetch(this.baseUrl, { timeout: 5000 });
      return response.ok;
    } catch {
      return false;
    }
  }

  calculateOverallHealth(report) {
    const scores = Object.values(report.categories).map(category => {
      switch (category.status) {
        case 'HEALTHY': return 100;
        case 'DEGRADED': return 70;
        case 'CRITICAL': return 30;
        default: return 50;
      }
    });
    
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const status = averageScore > 85 ? 'HEALTHY' : averageScore > 60 ? 'DEGRADED' : 'CRITICAL';
    
    return { score: Math.round(averageScore), status };
  }

  generateRecommendations(report) {
    const recommendations = [];
    
    Object.entries(report.categories).forEach(([category, data]) => {
      if (data.status === 'CRITICAL') {
        recommendations.push(`🚨 URGENTE: Resolver ${category}`);
      } else if (data.status === 'DEGRADED') {
        recommendations.push(`⚠️ MÉDIO: Otimizar ${category}`);
      }
    });
    
    return recommendations.length > 0 ? recommendations.join('\n') : '✅ Nenhuma ação crítica necessária';
  }
}

// 🚀 EXECUTE PROFESSIONAL ANALYSIS
async function main() {
  console.log('🔍 PROFESSIONAL STORYBOOK DEBUGGING SYSTEM V8.0');
  console.log('===============================================\n');
  
  const debugger = new ProfessionalStorybookDebugger();
  
  try {
    const healthReport = await debugger.runComprehensiveHealthScan();
    
    console.log('\n✅ ANÁLISE PROFISSIONAL COMPLETA!');
    console.log('Verifique os relatórios gerados em ./evidence/storybook-professional-analysis/');
    
  } catch (error) {
    console.error('❌ ERRO NA ANÁLISE:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ProfessionalStorybookDebugger; 