#!/usr/bin/env node

/**
 * Error Analyzer V6.2 - Análise Inteligente de Erros
 * Analisa erros detectados e gera insights para correção
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ErrorAnalyzer {
  constructor() {
    this.errorsFile = path.join(__dirname, '..', 'logs', 'errors-detected.json');
    this.analysisFile = path.join(__dirname, '..', 'logs', 'error-analysis.json');
    this.patterns = this.loadKnownPatterns();
  }

  /**
   * Executa análise completa
   */
  async analyze() {
    console.log('🧠 Error Analyzer V6.2 iniciado');
    
    const errors = this.loadErrors();
    if (!errors || errors.length === 0) {
      console.log('✅ Nenhum erro para analisar');
      return;
    }

    console.log(`📊 Analisando ${errors.length} erros...`);

    const analysis = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      errorsByPriority: this.categorizeByPriority(errors),
      patterns: this.identifyPatterns(errors),
      recommendations: this.generateRecommendations(errors),
      quickFixes: this.suggestQuickFixes(errors)
    };

    this.saveAnalysis(analysis);
    this.displaySummary(analysis);

    return analysis;
  }

  /**
   * Carrega erros detectados
   */
  loadErrors() {
    try {
      if (!fs.existsSync(this.errorsFile)) {
        return [];
      }

      const data = JSON.parse(fs.readFileSync(this.errorsFile, 'utf8'));
      return data.errors || [];
    } catch (error) {
      console.error('❌ Erro ao carregar erros:', error.message);
      return [];
    }
  }

  /**
   * Categoriza erros por prioridade
   */
  categorizeByPriority(errors) {
    const categories = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: []
    };

    errors.forEach(error => {
      const priority = error.priority || 'MEDIUM';
      if (categories[priority]) {
        categories[priority].push(error);
      }
    });

    return categories;
  }

  /**
   * Identifica padrões nos erros
   */
  identifyPatterns(errors) {
    const patterns = [];

    // Padrão: Erros recorrentes
    const errorCounts = {};
    errors.forEach(error => {
      const key = error.error.message.substring(0, 100); // Primeiros 100 chars
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    Object.entries(errorCounts).forEach(([message, count]) => {
      if (count > 1) {
        patterns.push({
          type: 'recurring',
          message: `Erro recorrente (${count}x): ${message}`,
          count,
          severity: count > 3 ? 'HIGH' : 'MEDIUM'
        });
      }
    });

    // Padrão: Erros em horários específicos
    const hourlyErrors = {};
    errors.forEach(error => {
      const hour = new Date(error.timestamp).getHours();
      hourlyErrors[hour] = (hourlyErrors[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourlyErrors)
      .sort(([,a], [,b]) => b - a)[0];

    if (peakHour && peakHour[1] > 2) {
      patterns.push({
        type: 'temporal',
        message: `Pico de erros às ${peakHour[0]}h (${peakHour[1]} erros)`,
        hour: parseInt(peakHour[0]),
        count: peakHour[1]
      });
    }

    return patterns;
  }

  /**
   * Gera recomendações baseadas nos erros
   */
  generateRecommendations(errors) {
    const recommendations = [];

    // Recomendação para erros de build
    const buildErrors = errors.filter(e => e.type === 'build');
    if (buildErrors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'build',
        title: 'Corrigir Erros de Build',
        description: `${buildErrors.length} erros de build detectados`,
        action: 'Executar correção automática de build errors',
        estimatedTime: '15-30 min'
      });
    }

    // Recomendação para erros críticos
    const criticalErrors = errors.filter(e => e.priority === 'CRITICAL');
    if (criticalErrors.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        type: 'runtime',
        title: 'Corrigir Erros Críticos',
        description: `${criticalErrors.length} erros críticos que quebram o sistema`,
        action: 'Executar correção automática imediata',
        estimatedTime: '30-45 min'
      });
    }

    return recommendations;
  }

  /**
   * Sugere correções rápidas
   */
  suggestQuickFixes(errors) {
    const quickFixes = [];

    errors.forEach(error => {
      const fix = this.matchKnownPattern(error);
      if (fix) {
        quickFixes.push({
          errorId: error.id,
          fix: fix
        });
      }
    });

    return quickFixes;
  }

  /**
   * Corresponde erro a padrão conhecido
   */
  matchKnownPattern(error) {
    const message = error.error.message.toLowerCase();

    // Padrões conhecidos
    if (message.includes('cannot access') && message.includes('before initialization')) {
      return {
        type: 'hoisting',
        description: 'Problema de hoisting - variável usada antes da declaração',
        solution: 'Mover declaração da função/variável para antes do uso',
        confidence: 0.9
      };
    }

    if (message.includes('environment') || message.includes('vite_')) {
      return {
        type: 'environment',
        description: 'Variável de ambiente não configurada',
        solution: 'Verificar arquivo .env e configuração do Vite',
        confidence: 0.85
      };
    }

    if (message.includes('failed to analyze') || message.includes('performance')) {
      return {
        type: 'service',
        description: 'Erro em service - falta error handling',
        solution: 'Adicionar try-catch robusto no service',
        confidence: 0.8
      };
    }

    return null;
  }

  /**
   * Carrega padrões conhecidos
   */
  loadKnownPatterns() {
    // Implementar carregamento de arquivo de padrões
    return {};
  }

  /**
   * Salva análise
   */
  saveAnalysis(analysis) {
    try {
      fs.writeFileSync(this.analysisFile, JSON.stringify(analysis, null, 2));
      console.log(`💾 Análise salva em ${this.analysisFile}`);
    } catch (error) {
      console.error('❌ Erro ao salvar análise:', error.message);
    }
  }

  /**
   * Exibe resumo da análise
   */
  displaySummary(analysis) {
    console.log('\n📋 RESUMO DA ANÁLISE');
    console.log('='.repeat(50));
    console.log(`Total de erros: ${analysis.totalErrors}`);
    console.log(`Críticos: ${analysis.errorsByPriority.CRITICAL.length}`);
    console.log(`Altos: ${analysis.errorsByPriority.HIGH.length}`);
    console.log(`Médios: ${analysis.errorsByPriority.MEDIUM.length}`);
    console.log(`Baixos: ${analysis.errorsByPriority.LOW.length}`);
    
    if (analysis.patterns.length > 0) {
      console.log(`\n🔍 Padrões identificados: ${analysis.patterns.length}`);
      analysis.patterns.forEach(pattern => {
        console.log(`  • ${pattern.message}`);
      });
    }

    if (analysis.recommendations.length > 0) {
      console.log(`\n💡 Recomendações: ${analysis.recommendations.length}`);
      analysis.recommendations.forEach(rec => {
        console.log(`  • [${rec.priority}] ${rec.title} (${rec.estimatedTime})`);
      });
    }

    console.log('\n✅ Análise concluída');
  }
}

// Execução se chamado diretamente
const analyzer = new ErrorAnalyzer();
analyzer.analyze().catch(error => {
  console.error('❌ Erro na análise:', error.message);
  process.exit(1);
}); 