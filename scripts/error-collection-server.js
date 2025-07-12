#!/usr/bin/env node

/**
 * Error Collection Server V6.3 Enhanced
 * Backend inteligente para coletar erros de browser em tempo real
 * Agora com análise de padrões e classificação automática avançada
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.ERROR_COLLECTOR_PORT || 3001;

// Arquivo para salvar erros
const browserErrorsFile = path.join(__dirname, '..', 'logs', 'browser-errors.json');
const analysisFile = path.join(__dirname, '..', 'logs', 'error-analysis.json');

// Garantir que o diretório logs existe
const logsDir = path.dirname(browserErrorsFile);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Cache para análise de padrões
let patternCache = {
  lastAnalysis: null,
  patterns: [],
  errorCounts: {},
  recurrentErrors: []
};

/**
 * Parse JSON body from request
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Set CORS headers
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Classificação inteligente de erros
 */
function intelligentClassification(errorData) {
  const { type, message, stack, url } = errorData;
  const lowerMessage = message.toLowerCase();
  
  // Padrões críticos
  const criticalPatterns = [
    /cannot read property.*of undefined/i,
    /cannot read property.*of null/i,
    /typeerror.*is not a function/i,
    /reference.*is not defined/i,
    /react.*error.*#\d+/i,
    /uncaught.*error/i,
    /syntax.*error/i,
    /chunk.*load.*failed/i
  ];
  
  // Padrões de alta prioridade
  const highPatterns = [
    /network.*error/i,
    /failed to fetch/i,
    /request.*failed/i,
    /timeout/i,
    /connection.*refused/i,
    /cors.*error/i,
    /401|403|404|500|502|503/i
  ];
  
  // Padrões de média prioridade
  const mediumPatterns = [
    /warning/i,
    /deprecated/i,
    /console\.warn/i,
    /performance/i,
    /lighthouse/i
  ];
  
  // Verificar padrões críticos
  if (criticalPatterns.some(pattern => pattern.test(lowerMessage))) {
    return {
      priority: 'CRITICAL',
      category: 'runtime-error',
      fixSuggestion: 'Adicionar verificação de null/undefined antes do acesso',
      urgency: 'immediate'
    };
  }
  
  // Verificar padrões altos
  if (highPatterns.some(pattern => pattern.test(lowerMessage))) {
    return {
      priority: 'HIGH',
      category: 'network-error',
      fixSuggestion: 'Implementar retry logic e tratamento de falhas de rede',
      urgency: 'high'
    };
  }
  
  // Verificar padrões médios
  if (mediumPatterns.some(pattern => pattern.test(lowerMessage))) {
    return {
      priority: 'MEDIUM',
      category: 'warning',
      fixSuggestion: 'Revisar e resolver warning para melhor qualidade',
      urgency: 'medium'
    };
  }
  
  // Análise baseada em tipo
  if (type === 'javascript' || type === 'react') {
    return {
      priority: 'CRITICAL',
      category: 'runtime-error',
      fixSuggestion: 'Adicionar error boundary e tratamento de exceções',
      urgency: 'immediate'
    };
  }
  
  if (type === 'network') {
    return {
      priority: 'HIGH',
      category: 'network-error',
      fixSuggestion: 'Verificar conectividade e endpoints de API',
      urgency: 'high'
    };
  }
  
  // Análise baseada em contexto
  if (url && url.includes('admin')) {
    return {
      priority: 'HIGH',
      category: 'admin-error',
      fixSuggestion: 'Erro na área administrativa - verificar permissões',
      urgency: 'high'
    };
  }
  
  // Padrão padrão
  return {
    priority: 'MEDIUM',
    category: 'general',
    fixSuggestion: 'Analisar erro e implementar correção apropriada',
    urgency: 'medium'
  };
}

/**
 * Análise de padrões em tempo real
 */
function analyzePatterns(errorData, existingData) {
  const { message, type, url } = errorData;
  
  // Contar ocorrências
  const errorKey = `${type}:${message.substring(0, 100)}`;
  patternCache.errorCounts[errorKey] = (patternCache.errorCounts[errorKey] || 0) + 1;
  
  // Detectar erros recorrentes
  if (patternCache.errorCounts[errorKey] >= 3) {
    const recurrentError = {
      pattern: errorKey,
      count: patternCache.errorCounts[errorKey],
      firstSeen: errorData.timestamp,
      lastSeen: new Date().toISOString(),
      suggestion: 'Erro recorrente - investigar causa raiz imediatamente'
    };
    
    // Adicionar aos recorrentes se não existir
    if (!patternCache.recurrentErrors.some(e => e.pattern === errorKey)) {
      patternCache.recurrentErrors.push(recurrentError);
    } else {
      // Atualizar contagem
      patternCache.recurrentErrors = patternCache.recurrentErrors.map(e => 
        e.pattern === errorKey ? { ...e, count: patternCache.errorCounts[errorKey], lastSeen: new Date().toISOString() } : e
      );
    }
  }
  
  // Análise temporal
  const currentHour = new Date().getHours();
  const hourlyKey = `hour_${currentHour}`;
  patternCache.errorCounts[hourlyKey] = (patternCache.errorCounts[hourlyKey] || 0) + 1;
  
  // Detectar picos de erro
  if (patternCache.errorCounts[hourlyKey] >= 5) {
    console.log(`🚨 Pico de erros detectado às ${currentHour}h (${patternCache.errorCounts[hourlyKey]} erros)`);
  }
  
  // Análise por página
  if (url) {
    const pageKey = `page:${url.split('?')[0]}`;
    patternCache.errorCounts[pageKey] = (patternCache.errorCounts[pageKey] || 0) + 1;
    
    if (patternCache.errorCounts[pageKey] >= 3) {
      console.log(`🚨 Página problemática detectada: ${url} (${patternCache.errorCounts[pageKey]} erros)`);
    }
  }
  
  return {
    isRecurrent: patternCache.errorCounts[errorKey] >= 3,
    totalRecurrent: patternCache.recurrentErrors.length,
    hourlyCount: patternCache.errorCounts[hourlyKey],
    pageErrorCount: url ? patternCache.errorCounts[`page:${url.split('?')[0]}`] : 0
  };
}

/**
 * Gerar insights automáticos
 */
function generateInsights(errorData, patterns, existingData) {
  const insights = [];
  
  // Insight sobre recorrência
  if (patterns.isRecurrent) {
    insights.push({
      type: 'recurrence',
      severity: 'high',
      message: `Erro recorrente detectado: ${errorData.message.substring(0, 100)}...`,
      action: 'Investigar causa raiz imediatamente',
      impact: 'Afeta múltiplos usuários'
    });
  }
  
  // Insight sobre picos
  if (patterns.hourlyCount >= 5) {
    insights.push({
      type: 'spike',
      severity: 'medium',
      message: `Pico de erros no horário atual (${patterns.hourlyCount} erros)`,
      action: 'Monitorar sistema e recursos',
      impact: 'Possível sobrecarga do sistema'
    });
  }
  
  // Insight sobre páginas problemáticas
  if (patterns.pageErrorCount >= 3) {
    insights.push({
      type: 'page-specific',
      severity: 'high',
      message: `Página com múltiplos erros: ${errorData.url}`,
      action: 'Revisar funcionalidade específica da página',
      impact: 'Experiência do usuário comprometida'
    });
  }
  
  // Insight sobre tipos de erro
  const errorsByType = existingData.errors.reduce((acc, err) => {
    acc[err.type] = (acc[err.type] || 0) + 1;
    return acc;
  }, {});
  
  const dominantType = Object.entries(errorsByType).sort(([,a], [,b]) => b - a)[0];
  if (dominantType && dominantType[1] >= 3) {
    insights.push({
      type: 'error-type-pattern',
      severity: 'medium',
      message: `Predominância de erros do tipo: ${dominantType[0]} (${dominantType[1]} ocorrências)`,
      action: `Focar correção em erros de ${dominantType[0]}`,
      impact: 'Padrão consistente de problemas'
    });
  }
  
  return insights;
}

/**
 * Salvar análise aprimorada
 */
function saveEnhancedAnalysis(errorData, patterns, insights, existingData) {
  const analysis = {
    timestamp: new Date().toISOString(),
    totalErrors: existingData.errors.length,
    errorsByPriority: {
      CRITICAL: existingData.errors.filter(e => e.priority === 'CRITICAL').length,
      HIGH: existingData.errors.filter(e => e.priority === 'HIGH').length,
      MEDIUM: existingData.errors.filter(e => e.priority === 'MEDIUM').length,
      LOW: existingData.errors.filter(e => e.priority === 'LOW').length
    },
    errorsByType: existingData.errors.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {}),
    patterns: {
      recurrentErrors: patternCache.recurrentErrors,
      hourlyDistribution: Object.entries(patternCache.errorCounts)
        .filter(([key]) => key.startsWith('hour_'))
        .map(([key, count]) => ({ hour: key.replace('hour_', ''), count })),
      pageErrors: Object.entries(patternCache.errorCounts)
        .filter(([key]) => key.startsWith('page:'))
        .map(([key, count]) => ({ page: key.replace('page:', ''), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    },
    insights: insights,
    recommendations: [
      {
        priority: 'CRITICAL',
        title: 'Corrigir erros críticos imediatamente',
        description: `${existingData.errors.filter(e => e.priority === 'CRITICAL').length} erros críticos detectados`,
        action: 'Implementar correções urgentes',
        estimatedTime: '30-60 min'
      },
      {
        priority: 'HIGH',
        title: 'Resolver erros recorrentes',
        description: `${patternCache.recurrentErrors.length} padrões de erro recorrente`,
        action: 'Investigar causa raiz dos erros mais frequentes',
        estimatedTime: '45-90 min'
      },
      {
        priority: 'MEDIUM',
        title: 'Otimizar páginas problemáticas',
        description: 'Múltiplas páginas com padrões de erro',
        action: 'Revisar funcionalidades específicas',
        estimatedTime: '20-40 min'
      }
    ]
  };
  
  try {
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));
    console.log(`📊 Análise aprimorada salva em ${analysisFile}`);
  } catch (error) {
    console.error('❌ Erro ao salvar análise:', error);
  }
}

/**
 * Handle POST /api/errors (Enhanced)
 */
async function handleErrorCollection(req, res) {
  try {
    const body = await parseBody(req);
    const { 
      type, 
      message, 
      stack, 
      url, 
      userAgent,
      timestamp,
      severity 
    } = body;

    // Validação básica
    if (!message || !type) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Invalid error data: message and type are required' 
      }));
      return;
    }

    // Criar ID único para o erro
    const errorId = `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Classificação inteligente
    const classification = intelligentClassification({ type, message, stack, url });

    // Estrutura do erro aprimorada
    const errorData = {
      id: errorId,
      type,
      priority: classification.priority,
      category: classification.category,
      message: message.substring(0, 500),
      stack: stack ? stack.substring(0, 2000) : null,
      url: url || 'unknown',
      userAgent: userAgent || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      count: 1,
      firstSeen: timestamp || new Date().toISOString(),
      lastSeen: timestamp || new Date().toISOString(),
      fixSuggestion: classification.fixSuggestion,
      urgency: classification.urgency
    };

    // Ler erros existentes
    let existingData = {
      timestamp: new Date().toISOString(),
      totalErrors: 0,
      errors: []
    };

    if (fs.existsSync(browserErrorsFile)) {
      try {
        const fileContent = fs.readFileSync(browserErrorsFile, 'utf8');
        existingData = JSON.parse(fileContent);
      } catch (parseError) {
        console.error('Error parsing browser-errors.json:', parseError);
      }
    }

    // Verificar duplicatas (mesmo erro nos últimos 5 minutos)
    const isDuplicate = existingData.errors.some(existingError => {
      const timeDiff = new Date() - new Date(existingError.lastSeen);
      const fiveMinutes = 5 * 60 * 1000;
      
      return existingError.message === errorData.message &&
             existingError.type === errorData.type &&
             existingError.url === errorData.url &&
             timeDiff < fiveMinutes;
    });

    if (isDuplicate) {
      // Atualizar contagem do erro existente
      existingData.errors = existingData.errors.map(error => {
        if (error.message === errorData.message && 
            error.type === errorData.type &&
            error.url === errorData.url) {
          return {
            ...error,
            count: error.count + 1,
            lastSeen: new Date().toISOString()
          };
        }
        return error;
      });
    } else {
      // Adicionar novo erro
      existingData.errors.push(errorData);
    }

    // Análise de padrões
    const patterns = analyzePatterns(errorData, existingData);
    
    // Gerar insights
    const insights = generateInsights(errorData, patterns, existingData);

    // Atualizar total e timestamp
    existingData.totalErrors = existingData.errors.length;
    existingData.timestamp = new Date().toISOString();

    // Limitar a 1000 erros mais recentes
    if (existingData.errors.length > 1000) {
      existingData.errors = existingData.errors.slice(-1000);
    }

    // Salvar no arquivo
    fs.writeFileSync(browserErrorsFile, JSON.stringify(existingData, null, 2));

    // Salvar análise aprimorada
    saveEnhancedAnalysis(errorData, patterns, insights, existingData);

    console.log(`✅ Error collected: ${errorData.type} - ${errorData.message.substring(0, 50)}...`);
    
    // Log insights importantes
    insights.forEach(insight => {
      if (insight.severity === 'high') {
        console.log(`🚨 INSIGHT: ${insight.message}`);
      }
    });

    // Responder com sucesso e insights
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      errorId: errorData.id,
      classification: classification,
      patterns: patterns,
      insights: insights,
      message: 'Error collected and analyzed successfully'
    }));

  } catch (error) {
    console.error('❌ Error processing request:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }));
  }
}

/**
 * Handle GET /api/errors/status
 */
function handleErrorStatus(res) {
  try {
    let errorCount = 0;
    let lastError = null;

    if (fs.existsSync(browserErrorsFile)) {
      const data = JSON.parse(fs.readFileSync(browserErrorsFile, 'utf8'));
      errorCount = data.totalErrors || 0;
      lastError = data.errors[data.errors.length - 1] || null;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'active',
      errorCount,
      lastError: lastError ? {
        timestamp: lastError.timestamp,
        type: lastError.type,
        message: lastError.message.substring(0, 100)
      } : null
    }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to get status' }));
  }
}

/**
 * Handle GET /api/errors/analysis (New endpoint)
 */
function handleAnalysisRequest(res) {
  try {
    let analysis = null;
    
    if (fs.existsSync(analysisFile)) {
      analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      analysis: analysis,
      patternCache: {
        recurrentErrors: patternCache.recurrentErrors,
        totalPatterns: Object.keys(patternCache.errorCounts).length
      }
    }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to get analysis' }));
  }
}

/**
 * Main HTTP server (Enhanced)
 */
const server = http.createServer(async (req, res) => {
  // Set CORS headers for all requests
  setCorsHeaders(res);

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Route requests
  if (url.pathname === '/api/errors' && req.method === 'POST') {
    await handleErrorCollection(req, res);
  } else if (url.pathname === '/api/errors/status' && req.method === 'GET') {
    handleErrorStatus(res);
  } else if (url.pathname === '/api/errors/analysis' && req.method === 'GET') {
    handleAnalysisRequest(res);
  } else if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'error-collector-enhanced' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Error Collection Server V6.3 Enhanced running on port ${PORT}`);
  console.log(`📥 Collecting errors at POST http://localhost:${PORT}/api/errors`);
  console.log(`📊 Status available at GET http://localhost:${PORT}/api/errors/status`);
  console.log(`🧠 Analysis available at GET http://localhost:${PORT}/api/errors/analysis`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping Error Collection Server...');
  server.close(() => {
    process.exit(0);
  });
}); 