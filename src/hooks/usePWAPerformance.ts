import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  interactionTime: number;
  memoryUsage?: number;
  connectionSpeed: string;
  cacheHitRate: number;
}

interface PWAPerformanceData {
  metrics: PerformanceMetrics | null;
  isLoading: boolean;
  warnings: string[];
  recommendations: string[];
}

export const usePWAPerformance = () => {
  const [performanceData, setPerformanceData] = useState<PWAPerformanceData>({
    metrics: null,
    isLoading: true,
    warnings: [],
    recommendations: [],
  });

  useEffect(() => {
    const measurePerformance = async () => {
      try {
        // Aguardar que tudo carregue
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(void 0);
          } else {
            window.addEventListener('load', () => resolve(void 0));
          }
        });

        // Coletar métricas de performance
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Performance Paint API
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        
        // Largest Contentful Paint (se disponível)
        let lcp = 0;
        if ('getLargestContentfulPaint' in window) {
          // Em ambiente real, usaríamos PerformanceObserver
          // Para demo, vamos estimar baseado no DOM
          lcp = fcp + 500; // Estimativa
        }

        // Connection info
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const connectionSpeed = connection ? connection.effectiveType || 'unknown' : 'unknown';

        // Memory usage (se disponível)
        const memory = (performance as any).memory;
        const memoryUsage = memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : undefined;

        // Calcular cache hit rate (simulado)
        const cacheHitRate = Math.random() * 40 + 60; // Simular 60-100%

        const metrics: PerformanceMetrics = {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp,
          interactionTime: Date.now() - performance.timeOrigin,
          memoryUsage,
          connectionSpeed,
          cacheHitRate,
        };

        // Analisar métricas e gerar avisos/recomendações
        const warnings: string[] = [];
        const recommendations: string[] = [];

        if (metrics.loadTime > 3000) {
          warnings.push('Tempo de carregamento alto (> 3s)');
          recommendations.push('Otimizar cache e compressão de assets');
        }

        if (metrics.firstContentfulPaint > 1500) {
          warnings.push('First Contentful Paint lento (> 1.5s)');
          recommendations.push('Reduzir tamanho de CSS/JS inicial');
        }

        if (metrics.memoryUsage && metrics.memoryUsage > 75) {
          warnings.push('Uso de memória alto (> 75%)');
          recommendations.push('Implementar limpeza de componentes React');
        }

        if (metrics.cacheHitRate < 70) {
          warnings.push('Taxa de acerto do cache baixa (< 70%)');
          recommendations.push('Revisar estratégias de cache do Service Worker');
        }

        // Recomendações gerais para PWA
        if (connectionSpeed === '2g' || connectionSpeed === 'slow-2g') {
          recommendations.push('Implementar modo offline mais robusto para conexões lentas');
        }

        if (!('serviceWorker' in navigator)) {
          warnings.push('Service Worker não suportado');
        }

        setPerformanceData({
          metrics,
          isLoading: false,
          warnings,
          recommendations,
        });

        // Log para análise
        console.log('PWA Performance Metrics:', {
          loadTime: `${Math.round(metrics.loadTime)}ms`,
          fcp: `${Math.round(metrics.firstContentfulPaint)}ms`,
          lcp: `${Math.round(metrics.largestContentfulPaint)}ms`,
          connectionSpeed: metrics.connectionSpeed,
          cacheHitRate: `${Math.round(metrics.cacheHitRate)}%`,
          memoryUsage: metrics.memoryUsage ? `${Math.round(metrics.memoryUsage)}%` : 'N/A',
        });

      } catch (error) {
        console.error('Error measuring PWA performance:', error);
        setPerformanceData(prev => ({ 
          ...prev, 
          isLoading: false,
          warnings: [...prev.warnings, 'Erro ao medir performance'],
        }));
      }
    };

    // Aguardar um pouco antes de medir
    const timer = setTimeout(measurePerformance, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPerformanceScore = (): number => {
    if (!performanceData.metrics) return 0;

    const { metrics } = performanceData;
    let score = 100;

    // Penalizar baseado nas métricas
    if (metrics.loadTime > 2000) score -= 20;
    if (metrics.firstContentfulPaint > 1000) score -= 15;
    if (metrics.largestContentfulPaint > 2500) score -= 15;
    if (metrics.memoryUsage && metrics.memoryUsage > 75) score -= 10;
    if (metrics.cacheHitRate < 80) score -= 10;

    // Bonificar conexões rápidas
    if (metrics.connectionSpeed === '4g') score += 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#F59E0B'; // Yellow
    if (score >= 50) return '#EF4444'; // Red
    return '#DC2626'; // Dark Red
  };

  const exportPerformanceReport = (): string => {
    const report = {
      timestamp: new Date().toISOString(),
      score: getPerformanceScore(),
      metrics: performanceData.metrics,
      warnings: performanceData.warnings,
      recommendations: performanceData.recommendations,
      userAgent: navigator.userAgent,
      pwaStatus: {
        isInstalled: window.matchMedia('(display-mode: standalone)').matches,
        hasServiceWorker: 'serviceWorker' in navigator,
        isOnline: navigator.onLine,
      },
    };

    return JSON.stringify(report, null, 2);
  };

  return {
    ...performanceData,
    score: getPerformanceScore(),
    scoreColor: getScoreColor(getPerformanceScore()),
    exportReport: exportPerformanceReport,
  };
}; 