/**
 * ⚡ PERFORMANCE VALIDATION SYSTEM
 * 
 * Sistema para validação do objetivo <5 minutos de qualificação
 * conforme especificado no PROJECT_CHARTER_SONORA_V1_MVP
 * 
 * @author V8.1 Enhanced System
 * @created 2025-07-17T17:00:00Z
 */

// 🎯 PERFORMANCE TARGETS (conforme PROJECT CHARTER)
export const PERFORMANCE_TARGETS = {
  ULTRA_FAST_QUALIFICATION: 5 * 60 * 1000, // 5 minutos em ms
  PROFILE_VERIFICATION: 15 * 1000,         // 15 segundos
  CONTENT_ANALYSIS: 30 * 1000,             // 30 segundos  
  AUTO_FILL_PROCESSING: 5 * 1000,          // 5 segundos
  WIZARD_COMPLETION: 3 * 60 * 1000,        // 3 minutos
} as const;

// 📊 PERFORMANCE TRACKING INTERFACE
export interface PerformanceMetrics {
  stage: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  target: number;
  status: 'in_progress' | 'completed' | 'exceeded_target';
  metadata?: Record<string, any>;
}

// 🚀 PERFORMANCE TRACKER CLASS
export class SonoraPerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private sessionStartTime: number;
  
  constructor() {
    this.sessionStartTime = performance.now();
    console.log('🏁 [PERFORMANCE] Sonora session tracking started');
  }

  /**
   * Inicia tracking de uma stage específica
   */
  startStage(stage: string, target: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      stage,
      startTime: performance.now(),
      target,
      status: 'in_progress',
      metadata
    };
    
    this.metrics.set(stage, metric);
    
    console.log(`⏱️ [PERFORMANCE] Started: ${stage} (target: ${target}ms)`, metadata);
  }

  /**
   * Finaliza tracking de uma stage
   */
  endStage(stage: string, metadata?: Record<string, any>): PerformanceMetrics | null {
    const metric = this.metrics.get(stage);
    if (!metric) {
      console.warn(`⚠️ [PERFORMANCE] Stage not found: ${stage}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    const status = duration <= metric.target ? 'completed' : 'exceeded_target';

    const updatedMetric: PerformanceMetrics = {
      ...metric,
      endTime,
      duration,
      status,
      metadata: { ...metric.metadata, ...metadata }
    };

    this.metrics.set(stage, updatedMetric);

    const statusEmoji = status === 'completed' ? '✅' : '⚠️';
    console.log(
      `${statusEmoji} [PERFORMANCE] Completed: ${stage} (${duration.toFixed(0)}ms / ${metric.target}ms)`,
      { status, efficiency: Math.round((metric.target / duration) * 100) }
    );

    return updatedMetric;
  }

  /**
   * Obtém métricas de uma stage específica
   */
  getStageMetrics(stage: string): PerformanceMetrics | null {
    return this.metrics.get(stage) || null;
  }

  /**
   * Obtém todas as métricas da sessão
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Calcula tempo total da sessão até agora
   */
  getTotalSessionTime(): number {
    return performance.now() - this.sessionStartTime;
  }

  /**
   * Valida se objetivo <5 minutos foi atingido
   */
  validateUltraFastTarget(): {
    achieved: boolean;
    totalTime: number;
    target: number;
    efficiency: number;
    breakdown: Record<string, number>;
  } {
    const totalTime = this.getTotalSessionTime();
    const target = PERFORMANCE_TARGETS.ULTRA_FAST_QUALIFICATION;
    const achieved = totalTime <= target;
    const efficiency = Math.round((target / totalTime) * 100);

    // Breakdown por stage
    const breakdown: Record<string, number> = {};
    this.metrics.forEach((metric, stage) => {
      if (metric.duration) {
        breakdown[stage] = Math.round(metric.duration);
      }
    });

    const result = {
      achieved,
      totalTime: Math.round(totalTime),
      target,
      efficiency,
      breakdown
    };

    const statusEmoji = achieved ? '🎯' : '⏰';
    console.log(
      `${statusEmoji} [PERFORMANCE] Ultra-Fast Target Validation:`,
      result
    );

    return result;
  }

  /**
   * Gera relatório completo de performance
   */
  generateReport(): {
    session: {
      totalTime: number;
      target: number;
      achieved: boolean;
      efficiency: number;
    };
    stages: PerformanceMetrics[];
    bottlenecks: string[];
    recommendations: string[];
  } {
    const validation = this.validateUltraFastTarget();
    const stages = this.getAllMetrics();
    
    // Identificar gargalos (stages que excederam target)
    const bottlenecks = stages
      .filter(metric => metric.status === 'exceeded_target')
      .map(metric => metric.stage);

    // Gerar recomendações baseadas nos gargalos
    const recommendations: string[] = [];
    
    if (bottlenecks.includes('profile_verification')) {
      recommendations.push('Otimizar verificação de perfil: implementar cache ou pre-loading');
    }
    
    if (bottlenecks.includes('content_analysis')) {
      recommendations.push('Acelerar análise de conteúdo: processamento paralelo ou análise limitada');
    }
    
    if (bottlenecks.includes('wizard_completion')) {
      recommendations.push('Simplificar wizard: reduzir perguntas ou implementar auto-skip');
    }

    if (validation.totalTime > PERFORMANCE_TARGETS.ULTRA_FAST_QUALIFICATION) {
      recommendations.push('Otimização geral necessária para atingir target <5 minutos');
    }

    const report = {
      session: {
        totalTime: validation.totalTime,
        target: validation.target,
        achieved: validation.achieved,
        efficiency: validation.efficiency
      },
      stages,
      bottlenecks,
      recommendations
    };

    console.log('📊 [PERFORMANCE] Full Report Generated:', report);
    
    return report;
  }

  /**
   * Reset do tracker para nova sessão
   */
  reset(): void {
    this.metrics.clear();
    this.sessionStartTime = performance.now();
    console.log('🔄 [PERFORMANCE] Tracker reset for new session');
  }
}

// 🎯 PERFORMANCE HOOKS PARA REACT COMPONENTS

/**
 * Hook para tracking automático de performance de components
 */
export const usePerformanceTracking = (componentName: string) => {
  const tracker = new SonoraPerformanceTracker();
  
  const startTracking = (stage: string, target?: number, metadata?: Record<string, any>) => {
    const stageTarget = target || PERFORMANCE_TARGETS.ULTRA_FAST_QUALIFICATION;
    tracker.startStage(`${componentName}_${stage}`, stageTarget, metadata);
  };

  const endTracking = (stage: string, metadata?: Record<string, any>) => {
    return tracker.endStage(`${componentName}_${stage}`, metadata);
  };

  const validateTarget = () => {
    return tracker.validateUltraFastTarget();
  };

  const getReport = () => {
    return tracker.generateReport();
  };

  return {
    startTracking,
    endTracking,
    validateTarget,
    getReport,
    tracker
  };
};

// 🔧 UTILITY FUNCTIONS

/**
 * Decorator para auto-tracking de funções async
 */
export function trackPerformance(stageName: string, target: number) {
  return function (target_: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracker = new SonoraPerformanceTracker();
      tracker.startStage(stageName, target, { method: propertyKey, args: args.length });

      try {
        const result = await originalMethod.apply(this, args);
        tracker.endStage(stageName, { success: true });
        return result;
      } catch (error) {
        tracker.endStage(stageName, { success: false, error: error.message });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Função para medir performance de operações síncronas
 */
export function measureSync<T>(operation: () => T, operationName: string): {
  result: T;
  duration: number;
} {
  const startTime = performance.now();
  const result = operation();
  const duration = performance.now() - startTime;
  
  console.log(`⚡ [PERFORMANCE] ${operationName}: ${duration.toFixed(2)}ms`);
  
  return { result, duration };
}

/**
 * Função para medir performance de operações assíncronas
 */
export async function measureAsync<T>(
  operation: () => Promise<T>, 
  operationName: string
): Promise<{
  result: T;
  duration: number;
}> {
  const startTime = performance.now();
  const result = await operation();
  const duration = performance.now() - startTime;
  
  console.log(`⚡ [PERFORMANCE] ${operationName}: ${duration.toFixed(2)}ms`);
  
  return { result, duration };
}

// 📊 GLOBAL PERFORMANCE INSTANCE
export const globalPerformanceTracker = new SonoraPerformanceTracker();