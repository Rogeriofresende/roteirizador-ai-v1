#!/usr/bin/env node

/**
 * Error Analyzer V6.3 Enhanced - Análise Inteligente de Erros em Tempo Real
 * Agora integrado com o servidor de coleta aprimorado
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ErrorAnalyzer {
  constructor() {
    this.errorsFile = path.join(__dirname, '..', 'logs', 'errors-detected.json');
    this.browserErrorsFile = path.join(__dirname, '..', 'logs', 'browser-errors.json');
    this.analysisFile = path.join(__dirname, '..', 'logs', 'error-analysis.json');
    this.reportFile = path.join(__dirname, '..', 'logs', 'error-report.json');
    this.patterns = this.loadKnownPatterns();
    this.includeRuntime = false;
  }

  /**
   * Executa análise completa aprimorada
   */
  async analyze() {
    console.log('🧠 Error Analyzer V6.3 Enhanced iniciado');
    
    // Check command line args
    const args = process.argv.slice(2);
    if (args.includes('--include-runtime')) {
      this.includeRuntime = true;
      console.log('🌐 Incluindo erros de runtime na análise');
    }
    
    // Carregar dados de múltiplas fontes
    const buildErrors = this.loadBuildErrors();
    const runtimeErrors = this.loadRuntimeErrors();
    const allErrors = [...buildErrors, ...runtimeErrors];
    
    if (allErrors.length === 0) {
      console.log('✅ Nenhum erro para analisar');
      return;
    }

    console.log(`📊 Analisando ${allErrors.length} erros (${buildErrors.length} build, ${runtimeErrors.length} runtime)...`);

    // Análise aprimorada
    const analysis = {
      timestamp: new Date().toISOString(),
      totalErrors: allErrors.length,
      errorsBySource: {
        build: buildErrors.length,
        runtime: runtimeErrors.length
      },
      errorsByPriority: this.categorizeByPriority(allErrors),
      errorsByType: this.categorizeByType(allErrors),
      errorsByCategory: this.categorizeByCategory(allErrors),
      patterns: this.identifyAdvancedPatterns(allErrors),
      trends: this.analyzeTrends(allErrors),
      recommendations: this.generateAdvancedRecommendations(allErrors),
      quickFixes: this.suggestQuickFixes(allErrors),
      healthScore: this.calculateHealthScore(allErrors),
      actionPlan: this.generateActionPlan(allErrors)
    };

    // Integrar com análise do servidor
    const serverAnalysis = this.loadServerAnalysis();
    if (serverAnalysis) {
      analysis.serverInsights = serverAnalysis;
      analysis.realTimePatterns = serverAnalysis.patterns;
    }

    this.saveAnalysis(analysis);
    this.generateReport(analysis);
    this.displayEnhancedSummary(analysis);

    return analysis;
  }

  /**
   * Carrega erros de runtime do servidor
   */
  loadRuntimeErrors() {
    try {
      if (!fs.existsSync(this.browserErrorsFile)) {
        return [];
      }

      const data = JSON.parse(fs.readFileSync(this.browserErrorsFile, 'utf8'));
      return (data.errors || []).map(error => ({
        ...error,
        source: 'runtime'
      }));
    } catch (error) {
      console.error('❌ Erro ao carregar erros de runtime:', error.message);
      return [];
    }
  }

  /**
   * Carrega erros de build
   */
  loadBuildErrors() {
    try {
      if (!fs.existsSync(this.errorsFile)) {
        return [];
      }

      const data = JSON.parse(fs.readFileSync(this.errorsFile, 'utf8'));
      return (data.errors || []).map(error => ({
        ...error,
        source: 'build'
      }));
    } catch (error) {
      console.error('❌ Erro ao carregar erros de build:', error.message);
      return [];
    }
  }

  /**
   * Carrega análise do servidor
   */
  loadServerAnalysis() {
    try {
      if (!fs.existsSync(this.analysisFile)) {
        return null;
      }

      return JSON.parse(fs.readFileSync(this.analysisFile, 'utf8'));
    } catch (error) {
      console.error('❌ Erro ao carregar análise do servidor:', error.message);
      return null;
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
   * Categoriza erros por tipo
   */
  categorizeByType(errors) {
    const types = {};
    
    errors.forEach(error => {
      const type = error.type || 'unknown';
      if (!types[type]) {
        types[type] = [];
      }
      types[type].push(error);
    });
    
    return types;
  }

  /**
   * Categoriza erros por categoria
   */
  categorizeByCategory(errors) {
    const categories = {};
    
    errors.forEach(error => {
      const category = error.category || 'unknown';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(error);
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
      const message = error.message || error.error?.message || 'unknown';
      const key = message.substring(0, 100); // Primeiros 100 chars
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
   * Identifica padrões avançados
   */
  identifyAdvancedPatterns(errors) {
    const patterns = [];

    // Padrões existentes
    patterns.push(...this.identifyPatterns(errors));

    // Padrões por urgência
    const urgentErrors = errors.filter(e => e.urgency === 'immediate');
    if (urgentErrors.length > 0) {
      patterns.push({
        type: 'urgency',
        message: `${urgentErrors.length} erros requerem ação imediata`,
        severity: 'CRITICAL',
        errors: urgentErrors.length
      });
    }

    // Padrões por categoria
    const categoryStats = {};
    errors.forEach(error => {
      const category = error.category || 'unknown';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    const dominantCategory = Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0];
    if (dominantCategory && dominantCategory[1] >= 3) {
      patterns.push({
        type: 'category-dominance',
        message: `Predominância de erros de ${dominantCategory[0]} (${dominantCategory[1]} erros)`,
        severity: 'HIGH',
        category: dominantCategory[0],
        count: dominantCategory[1]
      });
    }

    // Padrões de frequência
    const errorFrequency = {};
    errors.forEach(error => {
      const message = error.message || error.error?.message || 'unknown';
      const key = message.substring(0, 100);
      errorFrequency[key] = (errorFrequency[key] || 0) + (error.count || 1);
    });

    const highFrequency = Object.entries(errorFrequency).filter(([,count]) => count >= 5);
    if (highFrequency.length > 0) {
      patterns.push({
        type: 'high-frequency',
        message: `${highFrequency.length} erros com alta frequência detectados`,
        severity: 'HIGH',
        errors: highFrequency.length
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

    // Recomendações para erros de runtime JavaScript/React
    const jsErrors = errors.filter(e => 
      e.type === 'runtime:javascript' || e.type === 'runtime:react'
    );
    if (jsErrors.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        type: 'runtime',
        title: 'Corrigir Erros JavaScript/React Críticos',
        description: `${jsErrors.length} erros de runtime que afetam usuários`,
        action: 'Adicionar error boundaries e tratamento de exceções',
        estimatedTime: '30-60 min'
      });
    }

    // Recomendações para erros de network
    const networkErrors = errors.filter(e => e.type === 'runtime:network');
    if (networkErrors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'network',
        title: 'Resolver Problemas de Rede',
        description: `${networkErrors.length} falhas de requisição detectadas`,
        action: 'Implementar retry logic e tratamento de falhas de rede',
        estimatedTime: '20-40 min'
      });
    }

    // Recomendações para console warnings
    const consoleWarnings = errors.filter(e => 
      e.type === 'runtime:console' && e.priority === 'MEDIUM'
    );
    if (consoleWarnings.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'console',
        title: 'Limpar Console Warnings',
        description: `${consoleWarnings.length} warnings no console`,
        action: 'Revisar e corrigir warnings para melhor qualidade',
        estimatedTime: '15-30 min'
      });
    }

    // Recomendação para erros críticos
    const criticalErrors = errors.filter(e => e.priority === 'CRITICAL');
    if (criticalErrors.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        type: 'mixed',
        title: 'Corrigir Todos Erros Críticos Urgentemente',
        description: `${criticalErrors.length} erros críticos que quebram funcionalidades`,
        action: 'Priorizar correção imediata de todos os erros críticos',
        estimatedTime: '45-90 min'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Gera recomendações avançadas
   */
  generateAdvancedRecommendations(errors) {
    const recommendations = [];

    // Recomendações existentes
    recommendations.push(...this.generateRecommendations(errors));

    // Recomendações baseadas em categoria
    const categoryStats = {};
    errors.forEach(error => {
      const category = error.category || 'unknown';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    Object.entries(categoryStats).forEach(([category, count]) => {
      if (count >= 3) {
        let recommendation = {};
        
        switch (category) {
          case 'runtime-error':
            recommendation = {
              priority: 'CRITICAL',
              type: 'runtime',
              title: 'Implementar Error Boundaries',
              description: `${count} erros de runtime detectados`,
              action: 'Adicionar error boundaries e tratamento robusto',
              estimatedTime: '45-60 min'
            };
            break;
          case 'network-error':
            recommendation = {
              priority: 'HIGH',
              type: 'network',
              title: 'Melhorar Resiliência de Rede',
              description: `${count} erros de rede detectados`,
              action: 'Implementar retry logic e fallbacks',
              estimatedTime: '30-45 min'
            };
            break;
          case 'admin-error':
            recommendation = {
              priority: 'HIGH',
              type: 'admin',
              title: 'Revisar Área Administrativa',
              description: `${count} erros na área admin detectados`,
              action: 'Verificar permissões e funcionalidades admin',
              estimatedTime: '30-45 min'
            };
            break;
        }
        
        if (recommendation.title) {
          recommendations.push(recommendation);
        }
      }
    });

    // Recomendações baseadas em urgência
    const urgentErrors = errors.filter(e => e.urgency === 'immediate');
    if (urgentErrors.length > 0) {
      recommendations.unshift({
        priority: 'CRITICAL',
        type: 'urgent',
        title: 'AÇÃO IMEDIATA REQUERIDA',
        description: `${urgentErrors.length} erros críticos precisam de correção imediata`,
        action: 'Corrigir todos os erros marcados como "immediate"',
        estimatedTime: '15-30 min'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
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
    const message = (error.message || error.error?.message || '').toLowerCase();

    // Padrões conhecidos existentes
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

    // Novos padrões para runtime errors
    if (message.includes('cannot read property') || message.includes('undefined')) {
      return {
        type: 'null-reference',
        description: 'Tentativa de acessar propriedade de valor null/undefined',
        solution: 'Adicionar verificação de null/undefined antes do acesso',
        confidence: 0.9
      };
    }

    if (message.includes('network error') || message.includes('failed to fetch')) {
      return {
        type: 'network',
        description: 'Falha de conexão ou API indisponível',
        solution: 'Implementar retry logic e feedback de erro ao usuário',
        confidence: 0.85
      };
    }

    if (message.includes('syntax error') || message.includes('unexpected token')) {
      return {
        type: 'syntax',
        description: 'Erro de sintaxe JavaScript',
        solution: 'Revisar código e corrigir sintaxe inválida',
        confidence: 0.95
      };
    }

    if (error.type && error.type.includes('react')) {
      return {
        type: 'react',
        description: 'Erro específico do React',
        solution: 'Adicionar Error Boundary e revisar lifecycle/hooks',
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
   * Analisa tendências
   */
  analyzeTrends(errors) {
    const trends = {};
    
    // Tendência temporal
    const hourlyDistribution = {};
    errors.forEach(error => {
      if (error.timestamp) {
        const hour = new Date(error.timestamp).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      }
    });

    const peakHours = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    trends.temporal = {
      peakHours: peakHours.map(([hour, count]) => ({ hour: parseInt(hour), count })),
      distribution: hourlyDistribution
    };

    // Tendência por tipo
    const typeDistribution = {};
    errors.forEach(error => {
      const type = error.type || 'unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    trends.byType = Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    // Tendência por prioridade
    const priorityDistribution = {};
    errors.forEach(error => {
      const priority = error.priority || 'MEDIUM';
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
    });

    trends.byPriority = Object.entries(priorityDistribution)
      .sort(([,a], [,b]) => b - a)
      .map(([priority, count]) => ({ priority, count }));

    return trends;
  }

  /**
   * Calcula score de saúde
   */
  calculateHealthScore(errors) {
    let score = 100;
    
    // Penalidade por prioridade
    const criticalErrors = errors.filter(e => e.priority === 'CRITICAL').length;
    const highErrors = errors.filter(e => e.priority === 'HIGH').length;
    const mediumErrors = errors.filter(e => e.priority === 'MEDIUM').length;
    
    score -= criticalErrors * 15;
    score -= highErrors * 10;
    score -= mediumErrors * 5;
    
    // Penalidade por frequência
    const highFrequencyErrors = errors.filter(e => (e.count || 1) >= 5).length;
    score -= highFrequencyErrors * 8;
    
    // Bonus por correções recentes (se houver timestamp)
    const recentErrors = errors.filter(e => {
      if (!e.timestamp) return false;
      const hoursSinceError = (Date.now() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60);
      return hoursSinceError <= 24;
    });
    
    if (recentErrors.length === 0 && errors.length > 0) {
      score += 10; // Bonus por não ter erros recentes
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Gera plano de ação
   */
  generateActionPlan(errors) {
    const plan = [];
    
    // Fase 1: Erros críticos
    const criticalErrors = errors.filter(e => e.priority === 'CRITICAL');
    if (criticalErrors.length > 0) {
      plan.push({
        phase: 1,
        title: 'URGENTE: Corrigir Erros Críticos',
        duration: '15-30 min',
        errors: criticalErrors.length,
        actions: criticalErrors.map(e => e.fixSuggestion || 'Analisar e corrigir erro').slice(0, 3)
      });
    }
    
    // Fase 2: Erros de alta prioridade
    const highErrors = errors.filter(e => e.priority === 'HIGH');
    if (highErrors.length > 0) {
      plan.push({
        phase: 2,
        title: 'Alta Prioridade: Resolver Problemas Principais',
        duration: '30-45 min',
        errors: highErrors.length,
        actions: highErrors.map(e => e.fixSuggestion || 'Implementar correção').slice(0, 3)
      });
    }
    
    // Fase 3: Otimizações
    const mediumErrors = errors.filter(e => e.priority === 'MEDIUM');
    if (mediumErrors.length > 0) {
      plan.push({
        phase: 3,
        title: 'Otimização: Melhorar Qualidade',
        duration: '20-30 min',
        errors: mediumErrors.length,
        actions: ['Resolver warnings', 'Otimizar performance', 'Limpar console']
      });
    }
    
    return plan;
  }

  /**
   * Gera relatório detalhado
   */
  generateReport(analysis) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: analysis.totalErrors,
        healthScore: analysis.healthScore,
        criticalErrors: analysis.errorsByPriority.CRITICAL.length,
        recommendationsCount: analysis.recommendations.length
      },
      analysis: analysis,
      actionPlan: analysis.actionPlan
    };
    
    try {
      fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
      console.log(`📄 Relatório detalhado salvo em ${this.reportFile}`);
    } catch (error) {
      console.error('❌ Erro ao salvar relatório:', error.message);
    }
  }

  /**
   * Exibe resumo aprimorado
   */
  displayEnhancedSummary(analysis) {
    console.log('\n📋 RESUMO DA ANÁLISE V6.3 ENHANCED');
    console.log('='.repeat(60));
    console.log(`Total de erros: ${analysis.totalErrors}`);
    console.log(`Health Score: ${analysis.healthScore}/100`);
    console.log(`  • Build errors: ${analysis.errorsBySource.build}`);
    console.log(`  • Runtime errors: ${analysis.errorsBySource.runtime}`);
    
    console.log(`\nPor prioridade:`);
    console.log(`  • Críticos: ${analysis.errorsByPriority.CRITICAL.length}`);
    console.log(`  • Altos: ${analysis.errorsByPriority.HIGH.length}`);
    console.log(`  • Médios: ${analysis.errorsByPriority.MEDIUM.length}`);
    console.log(`  • Baixos: ${analysis.errorsByPriority.LOW.length}`);
    
    if (Object.keys(analysis.errorsByCategory).length > 0) {
      console.log(`\nPor categoria:`);
      Object.entries(analysis.errorsByCategory).forEach(([category, errors]) => {
        console.log(`  • ${category}: ${errors.length}`);
      });
    }
    
    if (analysis.patterns.length > 0) {
      console.log(`\n🔍 Padrões identificados: ${analysis.patterns.length}`);
      analysis.patterns.forEach(pattern => {
        console.log(`  • ${pattern.message}`);
      });
    }

    if (analysis.trends) {
      console.log(`\n📈 Tendências:`);
      if (analysis.trends.temporal.peakHours.length > 0) {
        console.log(`  • Horário pico: ${analysis.trends.temporal.peakHours[0].hour}h (${analysis.trends.temporal.peakHours[0].count} erros)`);
      }
      if (analysis.trends.byType.length > 0) {
        console.log(`  • Tipo predominante: ${analysis.trends.byType[0].type} (${analysis.trends.byType[0].count} erros)`);
      }
    }

    if (analysis.actionPlan.length > 0) {
      console.log(`\n🎯 Plano de ação:`);
      analysis.actionPlan.forEach(phase => {
        console.log(`  • Fase ${phase.phase}: ${phase.title} (${phase.duration})`);
      });
    }

    if (analysis.recommendations.length > 0) {
      console.log(`\n💡 Recomendações top 3:`);
      analysis.recommendations.slice(0, 3).forEach(rec => {
        console.log(`  • [${rec.priority}] ${rec.title} (${rec.estimatedTime})`);
      });
    }

    console.log('\n✅ Análise enhanced concluída');
  }
}

// Execução se chamado diretamente
const analyzer = new ErrorAnalyzer();
analyzer.analyze().catch(error => {
  console.error('❌ Erro na análise:', error.message);
  process.exit(1);
}); 