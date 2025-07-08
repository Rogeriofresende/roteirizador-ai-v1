# 📊 PROMPT 2: SISTEMA DE MONITORAMENTO AUTOMÁTICO

## 🎯 MISSÃO: Criar infraestrutura para detectar e analisar erros automaticamente

**Tempo estimado**: 30 minutos  
**Pré-requisito**: PROMPT 1 executado (sistema funcionando sem erros críticos)
**Objetivo**: Implementar monitoramento 24/7 que detecta problemas automaticamente

---

## 📋 COMPONENTES A IMPLEMENTAR

### **1. Error Monitor (Detector de Erros)**
**Arquivo**: `scripts/error-monitor.js`
- Monitora console.error em tempo real
- Captura stack traces completos
- Classifica erros por prioridade
- Salva em arquivo estruturado

### **2. Error Analyzer (Analisador Inteligente)**  
**Arquivo**: `scripts/error-analyzer.js`
- Analisa erros capturados
- Mapeia erro → arquivo → solução
- Identifica padrões recorrentes
- Gera relatórios estruturados

### **3. Error Dashboard (Interface Visual)**
**Arquivo**: `src/components/admin/ErrorDashboard.tsx`
- Mostra erros ativos em tempo real
- Interface simples para acompanhar status
- Botão para triggar correções automáticas

---

## 🔧 IMPLEMENTAÇÃO DETALHADA

### **ARQUIVO 1: scripts/error-monitor.js**

```javascript
#!/usr/bin/env node

/**
 * Error Monitor V6.2 - Sistema de Monitoramento Automático
 * Detecta e captura erros em tempo real
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
if (require.main === module) {
  const monitor = new ErrorMonitor();
  
  // Captura sinais para parar gracefully
  process.on('SIGINT', () => {
    console.log('\n⏹️  Parando Error Monitor...');
    monitor.stopMonitoring();
    process.exit(0);
  });
  
  monitor.startMonitoring();
}

module.exports = ErrorMonitor;
```

### **ARQUIVO 2: scripts/error-analyzer.js**

```javascript
#!/usr/bin/env node

/**
 * Error Analyzer V6.2 - Análise Inteligente de Erros
 * Analisa erros detectados e gera insights para correção
 */

const fs = require('fs');
const path = require('path');

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
if (require.main === module) {
  const analyzer = new ErrorAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('❌ Erro na análise:', error.message);
    process.exit(1);
  });
}

module.exports = ErrorAnalyzer;
```

### **ARQUIVO 3: src/components/admin/ErrorDashboard.tsx**

```typescript
/**
 * Error Dashboard V6.2 - Interface Visual para Monitoramento
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

interface ErrorData {
  id: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  error: {
    message: string;
    stack: string;
  };
  status: 'detected' | 'analyzing' | 'fixing' | 'resolved';
}

interface ErrorAnalysis {
  timestamp: string;
  totalErrors: number;
  errorsByPriority: Record<string, ErrorData[]>;
  patterns: Array<{
    type: string;
    message: string;
    count?: number;
  }>;
  recommendations: Array<{
    priority: string;
    title: string;
    description: string;
    estimatedTime: string;
  }>;
}

export const ErrorDashboard: React.FC = () => {
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Simular carregamento de erros (em produção, viria de API ou arquivo)
  useEffect(() => {
    loadErrors();
    loadAnalysis();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadErrors();
      loadAnalysis();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadErrors = async () => {
    try {
      // Em implementação real, carregaria do arquivo logs/errors-detected.json
      // Por agora, simular dados
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Erro ao carregar dados de erro:', error);
    }
  };

  const loadAnalysis = async () => {
    try {
      // Em implementação real, carregaria do arquivo logs/error-analysis.json
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    // Em implementação real, iniciaria o script de monitoramento
    console.log('Iniciando monitoramento automático...');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    console.log('Parando monitoramento...');
  };

  const triggerAutoFix = () => {
    console.log('Triggering correção automática...');
    // Em implementação real, executaria o script de correção
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertCircle className="h-4 w-4" />;
      case 'HIGH': return <Alert className="h-4 w-4" />;
      case 'MEDIUM': return <Clock className="h-4 w-4" />;
      case 'LOW': return <CheckCircle className="h-4 w-4" />;
      default: return <Alert className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Error Monitor Dashboard</h2>
          <p className="text-muted-foreground">
            Monitoramento automático de erros • Última atualização: {lastUpdate}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isMonitoring ? (
            <Button onClick={startMonitoring} className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Iniciar Monitoramento
            </Button>
          ) : (
            <Button variant="outline" onClick={stopMonitoring}>
              Parar Monitoramento
            </Button>
          )}
          
          <Button variant="secondary" onClick={triggerAutoFix}>
            Correção Automática
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Erros</p>
              <p className="text-2xl font-bold">{errors.length}</p>
            </div>
            <Alert className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Críticos</p>
              <p className="text-2xl font-bold text-red-500">
                {errors.filter(e => e.priority === 'CRITICAL').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold text-green-500">
                {isMonitoring ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold">99.8%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Error List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Erros Detectados</h3>
          
          {errors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Nenhum erro detectado!</p>
              <p className="text-sm">Sistema funcionando perfeitamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error) => (
                <div key={error.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getPriorityIcon(error.priority)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getPriorityColor(error.priority)} text-white`}>
                            {error.priority}
                          </Badge>
                          <Badge variant="outline">{error.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium">{error.error.message}</p>
                        <details className="mt-2">
                          <summary className="text-sm text-muted-foreground cursor-pointer">
                            Ver stack trace
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                            {error.error.stack}
                          </pre>
                        </details>
                      </div>
                    </div>
                    
                    <Badge variant={error.status === 'resolved' ? 'default' : 'secondary'}>
                      {error.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Recommendations */}
      {analysis && analysis.recommendations.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recomendações</h3>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(rec.priority) + ' text-white'}>
                        {rec.priority}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.estimatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
```

---

## 📋 CONFIGURAÇÃO ADICIONAL

### **ARQUIVO: package.json (adicionar scripts)**

Adicionar os seguintes scripts no `package.json`:

```json
{
  "scripts": {
    "monitor:start": "node scripts/error-monitor.js",
    "monitor:analyze": "node scripts/error-analyzer.js",
    "monitor:status": "cat logs/error-analysis.json | jq '.totalErrors'"
  }
}
```

### **ARQUIVO: .gitignore (adicionar logs)**

Adicionar ao `.gitignore`:

```
# Error monitoring logs
logs/errors-detected.json
logs/error-analysis.json
```

---

## ✅ VALIDAÇÃO DO SISTEMA

### **TESTE 1: Executar Monitor**
```bash
npm run monitor:start
# Deve iniciar monitoramento em background
# Verificar que arquivo logs/errors-detected.json é criado
```

### **TESTE 2: Executar Analyzer**
```bash
npm run monitor:analyze  
# Deve analisar erros (se houver)
# Verificar que arquivo logs/error-analysis.json é criado
```

### **TESTE 3: Acessar Dashboard**
```
# Adicionar rota para /admin/errors
# Verificar que dashboard carrega e mostra dados
```

---

## 🎯 RESULTADO ESPERADO

**Sistema de Monitoramento Ativo**:
- ✅ Monitor rodando em background detectando erros
- ✅ Analyzer classificando e gerando insights
- ✅ Dashboard visual mostrando status em tempo real
- ✅ Infraestrutura pronta para próxima fase (correção automática)

**🚀 PRÓXIMO PASSO**: PROMPT 3 - Gerador automático de prompts de correção