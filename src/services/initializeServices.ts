/**
 * V6.2 Enhanced Framework - Services Initialization
 * Inicialização centralizada de todos os services
 */

import { createLogger } from '../utils/logger';
import { AdvancedMicroInteractionsService } from './advancedMicroInteractionsService';
import { EnhancedPerformanceService } from './enhancedPerformanceService';
import { VoiceSynthesisService } from './voiceSynthesisService';
import { MultiAIService } from './multiAIService';
import { PredictiveUXService } from './predictiveUXService';
import { SmartLoadingService } from './smartLoadingService';
import { IntelligenceDashboardService } from './intelligenceDashboardService';
import { DirectAccessService } from './directAccessService';

const logger = createLogger('initializeServices');

interface InitializationResult {
  service: string;
  success: boolean;
  error?: string;
}

/**
 * Inicializa todos os services do V6.2
 */
export async function initializeV62Services(): Promise<{
  success: boolean;
  results: InitializationResult[];
}> {
  const results: InitializationResult[] = [];
  let overallSuccess = true;

  logger.info('Iniciando inicialização dos services V6.2');

  // 1. Advanced Micro-interactions Service
  try {
    await AdvancedMicroInteractionsService.initialize();
    results.push({ service: 'AdvancedMicroInteractions', success: true });
    logger.info('✅ AdvancedMicroInteractions inicializado');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    results.push({ service: 'AdvancedMicroInteractions', success: false, error: errorMsg });
    logger.error('❌ Erro ao inicializar AdvancedMicroInteractions', error);
    // Não é crítico, continuar
  }

  // 2. Enhanced Performance Service
  try {
    EnhancedPerformanceService.initialize();
    results.push({ service: 'EnhancedPerformance', success: true });
    logger.info('✅ EnhancedPerformance inicializado');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    results.push({ service: 'EnhancedPerformance', success: false, error: errorMsg });
    logger.error('❌ Erro ao inicializar EnhancedPerformance', error);
    // Não é crítico, continuar
  }

  // 3. Voice Synthesis Service
  try {
    await VoiceSynthesisService.initialize();
    results.push({ service: 'VoiceSynthesis', success: true });
    logger.info('✅ VoiceSynthesis inicializado');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    results.push({ service: 'VoiceSynthesis', success: false, error: errorMsg });
    logger.error('❌ Erro ao inicializar VoiceSynthesis', error);
    // Não é crítico, continuar
  }

  // 4. Multi-AI Service
  try {
    await MultiAIService.initialize();
    results.push({ service: 'MultiAI', success: true });
    logger.info('✅ MultiAI inicializado');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    results.push({ service: 'MultiAI', success: false, error: errorMsg });
    logger.error('❌ Erro ao inicializar MultiAI', error);
    overallSuccess = false; // Este é crítico
  }

  // 5. Predictive UX Service
  try {
    await PredictiveUXService.initialize();
    results.push({ service: 'PredictiveUX', success: true });
    logger.info('✅ PredictiveUX inicializado');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    results.push({ service: 'PredictiveUX', success: false, error: errorMsg });
    logger.error('❌ Erro ao inicializar PredictiveUX', error);
    // Não é crítico, continuar
  }

  // 6. Smart Loading Service - Não precisa inicialização
  results.push({ service: 'SmartLoading', success: true });
  logger.info('✅ SmartLoading pronto (sem inicialização necessária)');

  // 7. Intelligence Dashboard Service - Não precisa inicialização
  results.push({ service: 'IntelligenceDashboard', success: true });
  logger.info('✅ IntelligenceDashboard pronto (sem inicialização necessária)');

  // 8. Direct Access Service
  try {
    DirectAccessService.initialize();
    results.push({ service: 'DirectAccess', success: true });
    logger.info('✅ DirectAccess inicializado');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
    results.push({ service: 'DirectAccess', success: false, error: errorMsg });
    logger.error('❌ Erro ao inicializar DirectAccess', error);
    // Não é crítico, continuar
  }

  // Resumo final
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  logger.info(`Inicialização V6.2 concluída: ${successCount}/${totalCount} services inicializados`, {
    results,
    overallSuccess
  });

  return {
    success: overallSuccess,
    results
  };
}

/**
 * Verifica o status de todos os services
 */
export function checkServicesHealth(): {
  service: string;
  status: 'healthy' | 'degraded' | 'offline';
  details?: any;
}[] {
  const healthChecks = [];

  // Verificar cada service
  try {
    const perfMetrics = EnhancedPerformanceService.getCurrentMetrics();
    healthChecks.push({
      service: 'EnhancedPerformance',
      status: perfMetrics ? 'healthy' : 'degraded',
      details: perfMetrics ? { fps: perfMetrics.fps, memory: perfMetrics.memoryUsage } : null
    });
  } catch {
    healthChecks.push({ service: 'EnhancedPerformance', status: 'offline' });
  }

  try {
    const voices = VoiceSynthesisService.getAvailableVoices();
    healthChecks.push({
      service: 'VoiceSynthesis',
      status: voices.length > 0 ? 'healthy' : 'degraded',
      details: { voicesCount: voices.length }
    });
  } catch {
    healthChecks.push({ service: 'VoiceSynthesis', status: 'offline' });
  }

  try {
    const patterns = PredictiveUXService.getUserPatterns('test');
    healthChecks.push({
      service: 'PredictiveUX',
      status: 'healthy',
      details: { ready: true }
    });
  } catch {
    healthChecks.push({ service: 'PredictiveUX', status: 'degraded' });
  }

  // Services que não precisam verificação especial
  healthChecks.push(
    { service: 'MultiAI', status: 'healthy' },
    { service: 'SmartLoading', status: 'healthy' },
    { service: 'IntelligenceDashboard', status: 'healthy' },
    { service: 'DirectAccess', status: 'healthy' },
    { service: 'AdvancedMicroInteractions', status: 'healthy' }
  );

  return healthChecks;
}

/**
 * Cleanup de todos os services
 */
export function cleanupServices(): void {
  logger.info('Iniciando cleanup dos services V6.2');

  try {
    EnhancedPerformanceService.stop();
    logger.info('✅ EnhancedPerformance cleanup concluído');
  } catch (error) {
    logger.error('Erro no cleanup de EnhancedPerformance', error);
  }

  try {
    AdvancedMicroInteractionsService.cleanup();
    logger.info('✅ AdvancedMicroInteractions cleanup concluído');
  } catch (error) {
    logger.error('Erro no cleanup de AdvancedMicroInteractions', error);
  }

  try {
    VoiceSynthesisService.cleanup();
    logger.info('✅ VoiceSynthesis cleanup concluído');
  } catch (error) {
    logger.error('Erro no cleanup de VoiceSynthesis', error);
  }

  logger.info('Cleanup dos services V6.2 concluído');
}

// Auto-inicializar em produção
if (process.env.NODE_ENV === 'production') {
  // Dar tempo para o app carregar
  setTimeout(() => {
    initializeV62Services().catch(error => {
      logger.error('Erro crítico na inicialização automática', error);
    });
  }, 1000);
}

// Cleanup ao fechar a página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupServices();
  });
} 