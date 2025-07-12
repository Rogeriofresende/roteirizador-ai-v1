/**
 * 🖥️ PROGRESSIVE LIST COMPONENT
 * Week 7 Day 4: React component with virtual scrolling and progressive loading
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Skeleton } from './Skeleton';
import { ProgressiveLoadingService } from '../../services/progressiveLoadingService';
import { logger } from '../../utils/logger';
import { performanceService } from '../../services/performance';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface ProgressiveListProps<T> {
  datasetId: string;
  loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; totalCount: number }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
  itemHeight?: number;
  pageSize?: number;
  className?: string;
  enableVirtualScrolling?: boolean;
  onLoadMore?: (items: T[]) => void;
  onError?: (error: string) => void;
  loadMoreThreshold?: number; // Pixels from bottom to trigger load more
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  errorState?: (error: string, retry: () => void) => React.ReactNode;
}

interface VirtualItem<T> {
  index: number;
  item: T;
  style: React.CSSProperties;
}

// =============================================================================
// PROGRESSIVE LIST COMPONENT
// =============================================================================

export function ProgressiveList<T>({
  datasetId,
  loadFunction,
  renderItem,
  renderSkeleton,
  itemHeight = 80,
  pageSize = 20,
  className = '',
  enableVirtualScrolling = true,
  onLoadMore,
  onError,
  loadMoreThreshold = 200,
  emptyState,
  loadingState,
  errorState
}: ProgressiveListProps<T>) {
  const [dataset, setDataset] = useState(() => 
    ProgressiveLoadingService.getDataset<T>(datasetId)
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewportInfo, setViewportInfo] = useState<{
    startIndex: number;
    endIndex: number;
    overscan: number;
    itemHeight: number;
    containerHeight: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);

  // Initialize dataset
  useEffect(() => {
    const initializeDataset = async () => {
      try {
        logger.info('Initializing progressive list', { datasetId }, 'PROGRESSIVE_LIST');
        
        ProgressiveLoadingService.initializeDataset(
          datasetId,
          loadFunction,
          {
            pageSize,
            virtualScrolling: enableVirtualScrolling,
            preloadPages: 2,
            cacheStrategy: 'mixed'
          }
        );

        const initialData = await ProgressiveLoadingService.loadInitialData<T>(
          datasetId,
          pageSize
        );

        setDataset(ProgressiveLoadingService.getDataset<T>(datasetId));
        setIsInitialized(true);

        logger.info('Progressive list initialized', {
          datasetId,
          itemCount: initialData.items.length,
          totalCount: initialData.totalCount
        }, 'PROGRESSIVE_LIST');

      } catch (error) {
        logger.error('Failed to initialize progressive list', {
          datasetId,
          error
        }, 'PROGRESSIVE_LIST');
        
        if (onError) {
          onError(error instanceof Error ? error.message : 'Initialization failed');
        }
      }
    };

    if (!isInitialized) {
      initializeDataset();
    }
  }, [datasetId, loadFunction, pageSize, enableVirtualScrolling, isInitialized, onError]);

  // Handle scroll for virtual scrolling and load more
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // Update virtual scrolling viewport
    if (enableVirtualScrolling && containerRef.current) {
      const viewport = ProgressiveLoadingService.updateVirtualScrolling(
        datasetId,
        scrollTop,
        clientHeight,
        itemHeight
      );
      
      if (viewport) {
        setViewportInfo(viewport);
      }
    }

    // Check if we need to load more
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom < loadMoreThreshold && 
        dataset?.hasNextPage && 
        !dataset.isLoading && 
        !isLoadingMore.current) {
      
      loadMore();
    }
  }, [datasetId, enableVirtualScrolling, itemHeight, loadMoreThreshold, dataset]);

  // Load more items
  const loadMore = useCallback(async () => {
    if (!dataset || !dataset.hasNextPage || dataset.isLoading || isLoadingMore.current) {
      return;
    }

    isLoadingMore.current = true;

    try {
      const result = await ProgressiveLoadingService.loadNextPage<T>(datasetId, pageSize);
      
      const updatedDataset = ProgressiveLoadingService.getDataset<T>(datasetId);
      setDataset(updatedDataset);

      if (onLoadMore && result.items.length > 0) {
        onLoadMore(result.items);
      }

      logger.debug('Loaded more items', {
        datasetId,
        newItems: result.items.length,
        hasMore: result.hasMore
      }, 'PROGRESSIVE_LIST');

    } catch (error) {
      logger.error('Failed to load more items', {
        datasetId,
        error
      }, 'PROGRESSIVE_LIST');
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to load more');
      }
    } finally {
      isLoadingMore.current = false;
    }
  }, [datasetId, dataset, pageSize, onLoadMore, onError]);

  // Handle resize for virtual scrolling
  useEffect(() => {
    if (!enableVirtualScrolling || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { clientHeight } = containerRef.current;
        const viewport = ProgressiveLoadingService.updateVirtualScrolling(
          datasetId,
          scrollElementRef.current?.scrollTop || 0,
          clientHeight,
          itemHeight
        );
        
        if (viewport) {
          setViewportInfo(viewport);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [datasetId, enableVirtualScrolling, itemHeight]);

  // Calculate virtual items
  const virtualItems = useMemo<VirtualItem<T>[]>(() => {
    if (!enableVirtualScrolling || !viewportInfo || !dataset) {
      return [];
    }

    const items: VirtualItem<T>[] = [];
    
    for (let i = viewportInfo.startIndex; i < viewportInfo.endIndex && i < dataset.items.length; i++) {
      items.push({
        index: i,
        item: dataset.items[i],
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight
        }
      });
    }

    return items;
  }, [enableVirtualScrolling, viewportInfo, dataset, itemHeight]);

  // Retry function
  const retry = useCallback(() => {
    ProgressiveLoadingService.invalidateDataset(datasetId);
    setIsInitialized(false);
  }, [datasetId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ProgressiveLoadingService.cleanup([datasetId]);
    };
  }, [datasetId]);

  // Loading state
  if (!isInitialized || !dataset) {
    if (loadingState) {
      return <>{loadingState}</>;
    }
    
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: Math.min(pageSize, 10) }).map((_, i) => (
          <div key={i}>
            {renderSkeleton ? renderSkeleton() : <Skeleton className="h-20 w-full" />}
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (dataset.error) {
    if (errorState) {
      return <>{errorState(dataset.error, retry)}</>;
    }
    
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-4">❌ {dataset.error}</div>
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Empty state
  if (dataset.items.length === 0 && !dataset.isLoading) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        Nenhum item encontrado
      </div>
    );
  }

  // Virtual scrolling render
  if (enableVirtualScrolling) {
    const totalHeight = dataset.totalCount * itemHeight;
    
    return (
      <div
        ref={containerRef}
        className={`overflow-auto ${className}`}
        onScroll={handleScroll}
        style={{ height: '100%' }}
      >
        <div
          ref={scrollElementRef}
          style={{ height: totalHeight, position: 'relative' }}
        >
          {virtualItems.map(({ index, item, style }) => (
            <div key={index} style={style}>
              {renderItem(item, index)}
            </div>
          ))}
          
          {/* Loading indicator for virtual scrolling */}
          {dataset.isLoading && (
            <div
              style={{
                position: 'absolute',
                top: dataset.items.length * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight * 3
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Carregando mais...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard scrolling render
  return (
    <div
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
    >
      {dataset.items.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {/* Loading indicator */}
      {dataset.isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Carregando mais...</span>
        </div>
      )}
      
      {/* End of list indicator */}
      {!dataset.hasNextPage && dataset.items.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          Todos os itens foram carregados
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PROGRESSIVE GRID COMPONENT
// =============================================================================

interface ProgressiveGridProps<T> extends Omit<ProgressiveListProps<T>, 'itemHeight'> {
  columns?: number;
  gap?: number;
  itemMinWidth?: number;
  itemAspectRatio?: number;
}

export function ProgressiveGrid<T>({
  columns = 3,
  gap = 16,
  itemMinWidth = 200,
  itemAspectRatio = 1,
  className = '',
  ...listProps
}: ProgressiveGridProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive columns
  const responsiveColumns = useMemo(() => {
    if (containerWidth === 0) return columns;
    
    const availableWidth = containerWidth - (gap * (columns - 1));
    const maxColumns = Math.floor(availableWidth / itemMinWidth);
    
    return Math.max(1, Math.min(columns, maxColumns));
  }, [containerWidth, columns, gap, itemMinWidth]);

  // Calculate item height
  const itemHeight = useMemo(() => {
    if (containerWidth === 0) return 200;
    
    const availableWidth = containerWidth - (gap * (responsiveColumns - 1));
    const itemWidth = availableWidth / responsiveColumns;
    
    return itemWidth / itemAspectRatio;
  }, [containerWidth, responsiveColumns, gap, itemAspectRatio]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    });

    resizeObserver.observe(containerRef.current);
    setContainerWidth(containerRef.current.clientWidth);
    
    return () => resizeObserver.disconnect();
  }, []);

  const renderGridItem = useCallback((item: T, index: number) => {
    const columnIndex = index % responsiveColumns;
    const rowIndex = Math.floor(index / responsiveColumns);
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: columnIndex * (100 / responsiveColumns) + '%',
      top: rowIndex * (itemHeight + gap),
      width: `calc(${100 / responsiveColumns}% - ${gap * (responsiveColumns - 1) / responsiveColumns}px)`,
      height: itemHeight
    };

    return (
      <div style={style}>
        {listProps.renderItem(item, index)}
      </div>
    );
  }, [responsiveColumns, itemHeight, gap, listProps.renderItem]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <ProgressiveList
        {...listProps}
        renderItem={renderGridItem}
        itemHeight={itemHeight + gap}
        enableVirtualScrolling={true}
        className="w-full"
      />
    </div>
  );
} 