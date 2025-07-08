/**
 * V6.2 Enhanced Framework - Enhanced Performance Service
 * Monitoramento avançado de performance com métricas detalhadas e otimizações automáticas
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('enhancedPerformanceService');

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  renderTime: number;
  scriptTime: number;
  layoutTime: number;
  paintTime: number;
  compositeTime: number;
  bundleSize: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: number;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  propsChangeCount: number;
  unnecessaryRenderCount: number;
  memoryFootprint: number;
}

export interface NetworkMetrics {
  requestCount: number;
  averageLatency: number;
  bandwidthUsage: number;
  cacheHits: number;
  cacheMisses: number;
  failedRequests: number;
  pendingRequests: number;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'memory' | 'network' | 'rendering';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  solution: string;
  autoFixAvailable: boolean;
  relatedMetrics: string[];
}

interface PerformanceThresholds {
  fps: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  renderTime: { warning: number; critical: number };
  networkLatency: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
}

export class EnhancedPerformanceService {
  private static observer: PerformanceObserver | null = null;
  private static metricsHistory: PerformanceMetrics[] = [];
  private static componentMetrics = new Map<string, ComponentMetrics>();
  private static networkMetrics: NetworkMetrics = {
    requestCount: 0,
    averageLatency: 0,
    bandwidthUsage: 0,
    cacheHits: 0,
    cacheMisses: 0,
    failedRequests: 0,
    pendingRequests: 0
  };
  private static rafId: number | null = null;
  private static lastFrameTime = 0;
  private static frameCount = 0;
  private static fps = 60;
  private static monitoring = false;
  private static callbacks = new Map<string, (metrics: PerformanceMetrics) => void>();
  
  private static thresholds: PerformanceThresholds = {
    fps: { warning: 50, critical: 30 },
    memoryUsage: { warning: 100 * 1024 * 1024, critical: 200 * 1024 * 1024 }, // MB
    renderTime: { warning: 16, critical: 33 }, // ms
    networkLatency: { warning: 500, critical: 1000 }, // ms
    errorRate: { warning: 0.05, critical: 0.1 } // percentage
  };

  /**
   * Inicializa o monitoramento de performance
   */
  static initialize(): void {
    if (this.monitoring) return;

    try {
      // Configurar Performance Observer
      this.setupPerformanceObserver();

      // Iniciar monitoramento de FPS
      this.startFPSMonitoring();

      // Interceptar requisições de rede
      this.interceptNetworkRequests();

      // Monitorar componentes React
      this.setupReactMonitoring();

      // Iniciar coleta periódica de métricas
      this.startMetricsCollection();

      this.monitoring = true;
      logger.info('Monitoramento de performance inicializado');

    } catch (error) {
      logger.error('Erro ao inicializar monitoramento', error);
    }
  }

  /**
   * Configura o Performance Observer
   */
  private static setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processPerformanceEntry(entry);
      }
    });

    // Observar diferentes tipos de métricas
    try {
      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      // Fallback para browsers que não suportam todos os tipos
      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }

  /**
   * Processa entradas de performance
   */
  private static processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        this.processNavigationTiming(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.processResourceTiming(entry as PerformanceResourceTiming);
        break;
      case 'paint':
        this.processPaintTiming(entry as PerformancePaintTiming);
        break;
      case 'measure':
        this.processMeasure(entry as PerformanceMeasure);
        break;
    }
  }

  /**
   * Monitora FPS
   */
  private static startFPSMonitoring(): void {
    const calculateFPS = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const delta = timestamp - this.lastFrameTime;
        const instantFPS = 1000 / delta;
        
        // Média móvel para suavizar
        this.fps = this.fps * 0.9 + instantFPS * 0.1;
        
        this.frameCount++;
      }
      
      this.lastFrameTime = timestamp;
      
      if (this.monitoring) {
        this.rafId = requestAnimationFrame(calculateFPS);
      }
    };

    this.rafId = requestAnimationFrame(calculateFPS);
  }

  /**
   * Intercepta requisições de rede
   */
  private static interceptNetworkRequests(): void {
    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      this.networkMetrics.pendingRequests++;
      this.networkMetrics.requestCount++;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const latency = endTime - startTime;

        this.updateNetworkMetrics(latency, response);
        
        return response;
      } catch (error) {
        this.networkMetrics.failedRequests++;
        throw error;
      } finally {
        this.networkMetrics.pendingRequests--;
      }
    };

    // Interceptar XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    const self = this;

    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      let startTime: number;

      xhr.open = function(...args: any[]) {
        return originalOpen.apply(xhr, args);
      };

      xhr.send = function(...args: any[]) {
        startTime = performance.now();
        self.networkMetrics.pendingRequests++;
        self.networkMetrics.requestCount++;

        xhr.addEventListener('loadend', () => {
          const endTime = performance.now();
          const latency = endTime - startTime;
          
          self.updateNetworkMetrics(latency, xhr);
          self.networkMetrics.pendingRequests--;
        });

        xhr.addEventListener('error', () => {
          self.networkMetrics.failedRequests++;
        });

        return originalSend.apply(xhr, args);
      };

      return xhr;
    } as any;
  }

  /**
   * Atualiza métricas de rede
   */
  private static updateNetworkMetrics(latency: number, response: Response | XMLHttpRequest): void {
    // Atualizar latência média
    const totalLatency = this.networkMetrics.averageLatency * (this.networkMetrics.requestCount - 1) + latency;
    this.networkMetrics.averageLatency = totalLatency / this.networkMetrics.requestCount;

    // Verificar cache
    if (response instanceof Response) {
      // @ts-ignore - cache não está no tipo Response padrão
      if (response.headers.get('x-cache') === 'HIT' || response.status === 304) {
        this.networkMetrics.cacheHits++;
      } else {
        this.networkMetrics.cacheMisses++;
      }
    }

    // Estimar uso de banda (simplificado)
    const contentLength = response instanceof Response 
      ? parseInt(response.headers.get('content-length') || '0')
      : parseInt((response as XMLHttpRequest).getResponseHeader('content-length') || '0');
    
    this.networkMetrics.bandwidthUsage += contentLength;
  }

  /**
   * Configura monitoramento React
   */
  private static setupReactMonitoring(): void {
    // Monitorar renders de componentes
    if (typeof window !== 'undefined' && (window as any).React) {
      const React = (window as any).React;
      
      // Interceptar createElement para rastrear renders
      const originalCreateElement = React.createElement;
      React.createElement = (type: any, props: any, ...children: any[]) => {
        if (typeof type === 'function' && type.name) {
          this.trackComponentRender(type.name);
        }
        return originalCreateElement(type, props, ...children);
      };
    }
  }

  /**
   * Rastreia render de componente
   */
  private static trackComponentRender(componentName: string): void {
    const startTime = performance.now();

    // Usar setTimeout para medir após o render
    setTimeout(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (!this.componentMetrics.has(componentName)) {
        this.componentMetrics.set(componentName, {
          componentName,
          renderCount: 0,
          averageRenderTime: 0,
          lastRenderTime: 0,
          propsChangeCount: 0,
          unnecessaryRenderCount: 0,
          memoryFootprint: 0
        });
      }

      const metrics = this.componentMetrics.get(componentName)!;
      metrics.renderCount++;
      metrics.lastRenderTime = renderTime;
      metrics.averageRenderTime = 
        (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

      // Detectar renders desnecessários (renders muito rápidos consecutivos)
      if (renderTime < 1 && metrics.lastRenderTime < 1) {
        metrics.unnecessaryRenderCount++;
      }
    }, 0);
  }

  /**
   * Coleta métricas periodicamente
   */
  private static startMetricsCollection(): void {
    setInterval(() => {
      if (!this.monitoring) return;

      const metrics = this.collectMetrics();
      this.metricsHistory.push(metrics);

      // Manter apenas últimas 100 medições
      if (this.metricsHistory.length > 100) {
        this.metricsHistory.shift();
      }

      // Analisar e gerar sugestões
      this.analyzePerformance();

      // Notificar callbacks
      this.callbacks.forEach(callback => callback(metrics));

    }, 1000); // A cada segundo
  }

  /**
   * Coleta todas as métricas atuais
   */
  private static collectMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    return {
      fps: Math.round(this.fps),
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      cpuUsage: this.estimateCPUUsage(),
      networkLatency: this.networkMetrics.averageLatency,
      renderTime: this.calculateAverageRenderTime(),
      scriptTime: navigation ? navigation.domInteractive - navigation.domLoading : 0,
      layoutTime: this.measureLayoutTime(),
      paintTime: this.measurePaintTime(),
      compositeTime: this.measureCompositeTime(),
      bundleSize: this.estimateBundleSize(),
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: this.calculateErrorRate(),
      timestamp: Date.now()
    };
  }

  /**
   * Métodos auxiliares de medição
   */
  private static estimateCPUUsage(): number {
    // Estimativa baseada em tempo de script vs tempo total
    const measures = performance.getEntriesByType('measure');
    if (measures.length === 0) return 0;

    const totalScriptTime = measures.reduce((sum, measure) => sum + measure.duration, 0);
    const totalTime = performance.now();
    
    return Math.min((totalScriptTime / totalTime) * 100, 100);
  }

  private static calculateAverageRenderTime(): number {
    const componentRenderTimes = Array.from(this.componentMetrics.values())
      .map(m => m.averageRenderTime);
    
    if (componentRenderTimes.length === 0) return 0;
    
    return componentRenderTimes.reduce((sum, time) => sum + time, 0) / componentRenderTimes.length;
  }

  private static measureLayoutTime(): number {
    const layoutEntries = performance.getEntriesByName('layout', 'measure');
    if (layoutEntries.length === 0) return 0;
    
    return layoutEntries.reduce((sum, entry) => sum + entry.duration, 0) / layoutEntries.length;
  }

  private static measurePaintTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    if (paintEntries.length === 0) return 0;
    
    const lastPaint = paintEntries[paintEntries.length - 1];
    return lastPaint.startTime;
  }

  private static measureCompositeTime(): number {
    // Estimativa baseada no tempo entre paint e próximo frame
    return 16.67 - this.calculateAverageRenderTime(); // Assumindo 60fps target
  }

  private static estimateBundleSize(): number {
    // Soma o tamanho de todos os scripts carregados
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = resources.filter(r => r.initiatorType === 'script');
    
    return scripts.reduce((sum, script) => sum + (script.transferSize || 0), 0);
  }

  private static calculateCacheHitRate(): number {
    const total = this.networkMetrics.cacheHits + this.networkMetrics.cacheMisses;
    if (total === 0) return 0;
    
    return (this.networkMetrics.cacheHits / total) * 100;
  }

  private static calculateErrorRate(): number {
    if (this.networkMetrics.requestCount === 0) return 0;
    
    return (this.networkMetrics.failedRequests / this.networkMetrics.requestCount) * 100;
  }

  /**
   * Analisa performance e gera sugestões
   */
  private static analyzePerformance(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    
    if (!currentMetrics) return suggestions;

    // Verificar FPS
    if (currentMetrics.fps < this.thresholds.fps.critical) {
      suggestions.push({
        id: 'low-fps-critical',
        type: 'rendering',
        severity: 'critical',
        title: 'FPS Crítico',
        description: `FPS atual (${currentMetrics.fps}) está abaixo do limite crítico`,
        impact: 'Experiência do usuário severamente impactada',
        solution: 'Reduzir complexidade de animações, otimizar renders',
        autoFixAvailable: true,
        relatedMetrics: ['fps', 'renderTime']
      });
    } else if (currentMetrics.fps < this.thresholds.fps.warning) {
      suggestions.push({
        id: 'low-fps-warning',
        type: 'rendering',
        severity: 'high',
        title: 'FPS Baixo',
        description: `FPS atual (${currentMetrics.fps}) está abaixo do ideal`,
        impact: 'Possível impacto na fluidez das animações',
        solution: 'Revisar componentes com muitos re-renders',
        autoFixAvailable: true,
        relatedMetrics: ['fps', 'renderTime']
      });
    }

    // Verificar uso de memória
    if (currentMetrics.memoryUsage > this.thresholds.memoryUsage.critical) {
      suggestions.push({
        id: 'high-memory-critical',
        type: 'memory',
        severity: 'critical',
        title: 'Uso Excessivo de Memória',
        description: `Uso de memória (${Math.round(currentMetrics.memoryUsage / 1024 / 1024)}MB) excede limite crítico`,
        impact: 'Risco de crashes e lentidão severa',
        solution: 'Identificar e corrigir vazamentos de memória',
        autoFixAvailable: false,
        relatedMetrics: ['memoryUsage']
      });
    }

    // Verificar latência de rede
    if (currentMetrics.networkLatency > this.thresholds.networkLatency.critical) {
      suggestions.push({
        id: 'high-latency-critical',
        type: 'network',
        severity: 'critical',
        title: 'Latência de Rede Crítica',
        description: `Latência média (${Math.round(currentMetrics.networkLatency)}ms) está muito alta`,
        impact: 'Aplicação extremamente lenta para carregar dados',
        solution: 'Implementar cache agressivo, reduzir chamadas de API',
        autoFixAvailable: true,
        relatedMetrics: ['networkLatency', 'cacheHitRate']
      });
    }

    // Verificar taxa de erro
    if (currentMetrics.errorRate > this.thresholds.errorRate.critical) {
      suggestions.push({
        id: 'high-error-rate',
        type: 'network',
        severity: 'critical',
        title: 'Taxa de Erro Alta',
        description: `${Math.round(currentMetrics.errorRate)}% das requisições estão falhando`,
        impact: 'Funcionalidades podem estar indisponíveis',
        solution: 'Verificar estabilidade da API e conexão',
        autoFixAvailable: false,
        relatedMetrics: ['errorRate']
      });
    }

    // Verificar componentes problemáticos
    this.componentMetrics.forEach((metrics, componentName) => {
      if (metrics.averageRenderTime > this.thresholds.renderTime.warning) {
        suggestions.push({
          id: `slow-component-${componentName}`,
          type: 'rendering',
          severity: 'medium',
          title: `Componente Lento: ${componentName}`,
          description: `Tempo médio de render: ${metrics.averageRenderTime.toFixed(2)}ms`,
          impact: 'Pode causar jank durante interações',
          solution: 'Otimizar com React.memo, useMemo ou useCallback',
          autoFixAvailable: true,
          relatedMetrics: ['renderTime']
        });
      }

      if (metrics.unnecessaryRenderCount > metrics.renderCount * 0.3) {
        suggestions.push({
          id: `unnecessary-renders-${componentName}`,
          type: 'rendering',
          severity: 'low',
          title: `Re-renders Desnecessários: ${componentName}`,
          description: `${metrics.unnecessaryRenderCount} de ${metrics.renderCount} renders parecem desnecessários`,
          impact: 'Desperdício de recursos de CPU',
          solution: 'Verificar dependências de hooks e props',
          autoFixAvailable: true,
          relatedMetrics: ['renderTime', 'cpuUsage']
        });
      }
    });

    return suggestions;
  }

  /**
   * Aplica otimizações automáticas
   */
  static async applyAutoOptimizations(suggestionId: string): Promise<boolean> {
    try {
      switch (suggestionId) {
        case 'low-fps-critical':
        case 'low-fps-warning':
          // Reduzir qualidade de animações temporariamente
          document.documentElement.style.setProperty('--animation-duration', '0.1s');
          document.documentElement.style.setProperty('--transition-duration', '0.1s');
          logger.info('Animações simplificadas para melhorar FPS');
          return true;

        case 'high-latency-critical':
          // Aumentar cache time
          localStorage.setItem('performance_cache_extended', 'true');
          logger.info('Cache estendido ativado');
          return true;

        default:
          if (suggestionId.startsWith('slow-component-')) {
            // Sugerir memo para o componente
            const componentName = suggestionId.replace('slow-component-', '');
            logger.info(`Sugestão: Adicionar React.memo ao componente ${componentName}`);
            return false;
          }
          
          if (suggestionId.startsWith('unnecessary-renders-')) {
            const componentName = suggestionId.replace('unnecessary-renders-', '');
            logger.info(`Sugestão: Revisar hooks e props do componente ${componentName}`);
            return false;
          }
      }

      return false;
    } catch (error) {
      logger.error('Erro ao aplicar otimização', error);
      return false;
    }
  }

  /**
   * API Pública
   */
  static getCurrentMetrics(): PerformanceMetrics | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  static getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  static getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }

  static getNetworkMetrics(): NetworkMetrics {
    return { ...this.networkMetrics };
  }

  static getSuggestions(): OptimizationSuggestion[] {
    return this.analyzePerformance();
  }

  static subscribe(id: string, callback: (metrics: PerformanceMetrics) => void): void {
    this.callbacks.set(id, callback);
  }

  static unsubscribe(id: string): void {
    this.callbacks.delete(id);
  }

  static updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  static reset(): void {
    this.metricsHistory = [];
    this.componentMetrics.clear();
    this.networkMetrics = {
      requestCount: 0,
      averageLatency: 0,
      bandwidthUsage: 0,
      cacheHits: 0,
      cacheMisses: 0,
      failedRequests: 0,
      pendingRequests: 0
    };
    logger.info('Métricas resetadas');
  }

  static stop(): void {
    this.monitoring = false;
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.callbacks.clear();
    logger.info('Monitoramento de performance parado');
  }

  /**
   * Processa timings específicos
   */
  private static processNavigationTiming(entry: PerformanceNavigationTiming): void {
    logger.debug('Navigation timing', {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.fetchStart
    });
  }

  private static processResourceTiming(entry: PerformanceResourceTiming): void {
    if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
      const duration = entry.responseEnd - entry.startTime;
      logger.debug('Resource timing', {
        url: entry.name,
        duration,
        size: entry.transferSize
      });
    }
  }

  private static processPaintTiming(entry: PerformancePaintTiming): void {
    logger.debug('Paint timing', {
      name: entry.name,
      startTime: entry.startTime
    });
  }

  private static processMeasure(entry: PerformanceMeasure): void {
    logger.debug('Performance measure', {
      name: entry.name,
      duration: entry.duration
    });
  }
} 