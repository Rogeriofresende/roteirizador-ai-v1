/**
 * 🔗 ADVANCED PERFORMANCE HOOKS
 * Week 7 Day 4: React hooks for integrating advanced performance features
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProgressiveLoadingService } from '../services/progressiveLoadingService';
import { BackgroundProcessingService } from '../services/backgroundProcessingService';
import { ResourceManagerService } from '../services/resourceManagerService';
import { AdvancedNetworkOptimizer } from '../services/advancedNetworkOptimizer';
import { logger } from '../utils/logger';

// =============================================================================
// PROGRESSIVE LOADING HOOK
// =============================================================================

export function useProgressiveLoading<T>(
  datasetId: string,
  loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; totalCount: number }>,
  pageSize: number = 20
) {
  const [dataset, setDataset] = useState(() => 
    ProgressiveLoadingService.getDataset<T>(datasetId)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dataset
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        ProgressiveLoadingService.initializeDataset(
          datasetId,
          loadFunction,
          { pageSize, virtualScrolling: true }
        );

        await ProgressiveLoadingService.loadInitialData<T>(datasetId, pageSize);
        setDataset(ProgressiveLoadingService.getDataset<T>(datasetId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Loading failed');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [datasetId, loadFunction, pageSize]);

  const loadMore = useCallback(async () => {
    if (!dataset?.hasNextPage || loading) return;

    try {
      setLoading(true);
      await ProgressiveLoadingService.loadNextPage<T>(datasetId, pageSize);
      setDataset(ProgressiveLoadingService.getDataset<T>(datasetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Load more failed');
    } finally {
      setLoading(false);
    }
  }, [datasetId, dataset, pageSize, loading]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      ProgressiveLoadingService.invalidateDataset(datasetId);
      await ProgressiveLoadingService.loadInitialData<T>(datasetId, pageSize);
      setDataset(ProgressiveLoadingService.getDataset<T>(datasetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setLoading(false);
    }
  }, [datasetId, pageSize]);

  return {
    items: dataset?.items || [],
    totalCount: dataset?.totalCount || 0,
    hasNextPage: dataset?.hasNextPage || false,
    loading,
    error,
    loadMore,
    refresh
  };
}

// =============================================================================
// BACKGROUND PROCESSING HOOK
// =============================================================================

export function useBackgroundProcessing() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [tasks, setTasks] = useState(new Map<string, any>());

  useEffect(() => {
    const initialize = async () => {
      const success = await BackgroundProcessingService.initialize();
      setIsInitialized(success);
    };

    initialize();
  }, []);

  const processData = useCallback(async (
    data: any[],
    options?: { priority?: 'critical' | 'high' | 'medium' | 'low' }
  ) => {
    if (!isInitialized) {
      throw new Error('Background processing not initialized');
    }

    const taskId = BackgroundProcessingService.processData(data, options);
    
    setTasks(prev => new Map(prev.set(taskId, { 
      id: taskId, 
      type: 'processData', 
      status: 'pending' 
    })));

    try {
      const result = await BackgroundProcessingService.waitForTask(taskId);
      
      setTasks(prev => new Map(prev.set(taskId, { 
        id: taskId, 
        type: 'processData', 
        status: 'completed',
        result: result.result 
      })));

      return result.result;
    } catch (error) {
      setTasks(prev => new Map(prev.set(taskId, { 
        id: taskId, 
        type: 'processData', 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed'
      })));
      throw error;
    }
  }, [isInitialized]);

  const analyzeText = useCallback(async (
    text: string,
    options?: { priority?: 'critical' | 'high' | 'medium' | 'low' }
  ) => {
    if (!isInitialized) {
      throw new Error('Background processing not initialized');
    }

    const taskId = BackgroundProcessingService.analyzeText(text, options);
    
    setTasks(prev => new Map(prev.set(taskId, { 
      id: taskId, 
      type: 'analyzeText', 
      status: 'pending' 
    })));

    try {
      const result = await BackgroundProcessingService.waitForTask(taskId);
      
      setTasks(prev => new Map(prev.set(taskId, { 
        id: taskId, 
        type: 'analyzeText', 
        status: 'completed',
        result: result.result 
      })));

      return result.result;
    } catch (error) {
      setTasks(prev => new Map(prev.set(taskId, { 
        id: taskId, 
        type: 'analyzeText', 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Analysis failed'
      })));
      throw error;
    }
  }, [isInitialized]);

  const getMetrics = useCallback(() => {
    if (!isInitialized) return null;
    return BackgroundProcessingService.getMetrics();
  }, [isInitialized]);

  return {
    isInitialized,
    tasks: Array.from(tasks.values()),
    processData,
    analyzeText,
    getMetrics
  };
}

// =============================================================================
// RESOURCE MANAGEMENT HOOK
// =============================================================================

export function useResourceManagement() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const success = await ResourceManagerService.initialize();
      setIsInitialized(success);
    };

    initialize();
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateMetrics = () => {
      setMetrics(ResourceManagerService.getResourceMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  const registerResource = useCallback((
    resourceId: string,
    type: 'component' | 'service' | 'data' | 'asset',
    size: number,
    options?: any
  ) => {
    if (!isInitialized) return;
    ResourceManagerService.registerResource(resourceId, type, size, options);
  }, [isInitialized]);

  const loadLazyComponent = useCallback(async (componentId: string) => {
    if (!isInitialized) {
      throw new Error('Resource manager not initialized');
    }
    return ResourceManagerService.loadLazyComponent(componentId);
  }, [isInitialized]);

  const performCleanup = useCallback(async () => {
    if (!isInitialized) return;
    await ResourceManagerService.performCleanup();
  }, [isInitialized]);

  return {
    isInitialized,
    metrics,
    registerResource,
    loadLazyComponent,
    performCleanup
  };
}

// =============================================================================
// NETWORK OPTIMIZATION HOOK
// =============================================================================

export function useNetworkOptimization() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const success = await AdvancedNetworkOptimizer.initialize();
      setIsInitialized(success);
    };

    initialize();
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateMetrics = () => {
      setMetrics(AdvancedNetworkOptimizer.getNetworkOptimizationMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  const optimizeRequest = useCallback(async <T>(
    url: string,
    options?: any
  ): Promise<T> => {
    if (!isInitialized) {
      throw new Error('Network optimizer not initialized');
    }
    return AdvancedNetworkOptimizer.optimizeRequest<T>(url, options);
  }, [isInitialized]);

  const preloadResources = useCallback(async (urls: string[]) => {
    if (!isInitialized) return;
    await AdvancedNetworkOptimizer.preloadCriticalResources(urls);
  }, [isInitialized]);

  return {
    isInitialized,
    metrics,
    optimizeRequest,
    preloadResources
  };
}

// =============================================================================
// COMBINED PERFORMANCE HOOK
// =============================================================================

export function useAdvancedPerformance() {
  const progressiveLoading = useProgressiveLoading;
  const backgroundProcessing = useBackgroundProcessing();
  const resourceManagement = useResourceManagement();
  const networkOptimization = useNetworkOptimization();

  const isReady = useMemo(() => 
    backgroundProcessing.isInitialized &&
    resourceManagement.isInitialized &&
    networkOptimization.isInitialized
  , [
    backgroundProcessing.isInitialized,
    resourceManagement.isInitialized,
    networkOptimization.isInitialized
  ]);

  const allMetrics = useMemo(() => {
    if (!isReady) return null;

    return {
      backgroundProcessing: backgroundProcessing.getMetrics(),
      resourceManagement: resourceManagement.metrics,
      networkOptimization: networkOptimization.metrics
    };
  }, [isReady, backgroundProcessing, resourceManagement.metrics, networkOptimization.metrics]);

  return {
    isReady,
    metrics: allMetrics,
    progressiveLoading,
    backgroundProcessing,
    resourceManagement,
    networkOptimization
  };
} 