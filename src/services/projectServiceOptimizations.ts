/**
 * 🚀 PROJECT SERVICE OPTIMIZATIONS
 * Week 7 Day 3: Advanced optimizations for existing EnhancedProjectService
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { databaseOptimizationService } from './databaseOptimizationService';

// =============================================================================
// PROJECT SERVICE OPTIMIZATION EXTENSIONS
// =============================================================================

export class ProjectServiceOptimizations {
  /**
   * Optimized bulk project operations
   */
  static async optimizedBulkProjectUpdate(
    userId: string,
    updates: Array<{ id: string; data: any }>
  ): Promise<{ successful: number; failed: number; errors: string[] }> {
    const startTime = performance.now();
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    try {
      // Use database optimization for batch operations
      await databaseOptimizationService.batchUpdate('enhanced_projects', updates);
      successful = updates.length;

      const duration = performance.now() - startTime;
      performanceService.recordMetric('bulk_project_update', duration, 'ms', 'projects', {
        userId,
        updateCount: updates.length,
        successful,
        failed
      });

      logger.info('Bulk project update completed', {
        userId,
        updateCount: updates.length,
        successful,
        failed,
        duration: `${duration.toFixed(2)}ms`
      }, 'PROJECT_OPTIMIZER');

      return { successful, failed, errors };
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      performanceService.recordMetric('bulk_project_update_error', duration, 'ms', 'projects', {
        userId,
        error: errorMessage
      });

      failed = updates.length;
      errors.push(errorMessage);
      
      return { successful: 0, failed, errors };
    }
  }

  /**
   * Optimized project analytics aggregation
   */
  static async getOptimizedProjectAnalytics(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    totalProjects: number;
    projectsByPlatform: Record<string, number>;
    projectsByStatus: Record<string, number>;
    averageCompletionTime: number;
    fromCache: boolean;
  }> {
    const analyticsKey = `analytics_${userId}_${timeRange.start.getTime()}_${timeRange.end.getTime()}`;
    
    return databaseOptimizationService.executeQuery(
      analyticsKey,
      async () => {
        // Import EnhancedProjectService dynamically
        const { EnhancedProjectService } = await import('./enhancedProjectService');
        const service = new EnhancedProjectService();
        
        const projects = await service.getProjectsByFilters(userId, {
          dateRange: timeRange,
          limit: 1000 // Reasonable limit for analytics
        });

        // Aggregate data
        const totalProjects = projects.length;
        const projectsByPlatform: Record<string, number> = {};
        const projectsByStatus: Record<string, number> = {};
        let totalCompletionTime = 0;
        let completedProjects = 0;

        projects.forEach(project => {
          // Platform aggregation
          const platform = project.formData?.platform || 'unknown';
          projectsByPlatform[platform] = (projectsByPlatform[platform] || 0) + 1;

          // Status aggregation
          const status = project.status || 'unknown';
          projectsByStatus[status] = (projectsByStatus[status] || 0) + 1;

          // Completion time calculation
          if (project.status === 'completed' && project.createdAt && project.updatedAt) {
            const completionTime = project.updatedAt.getTime() - project.createdAt.getTime();
            totalCompletionTime += completionTime;
            completedProjects++;
          }
        });

        const averageCompletionTime = completedProjects > 0 
          ? totalCompletionTime / completedProjects 
          : 0;

        return {
          totalProjects,
          projectsByPlatform,
          projectsByStatus,
          averageCompletionTime,
          fromCache: false
        };
      },
      {
        cacheStrategy: 'aggressive',
        timeoutMs: 20000, // 20 seconds for analytics
        retryConfig: {
          maxRetries: 2,
          backoffMs: 1000
        }
      }
    );
  }

  /**
   * Preload user's critical project data
   */
  static async preloadCriticalProjectData(userId: string): Promise<void> {
    const criticalQueries = [
      {
        key: `recent_projects_${userId}`,
        queryFn: async () => {
          const { EnhancedProjectService } = await import('./enhancedProjectService');
          const service = new EnhancedProjectService();
          return service.getProjectsByFilters(userId, {
            sortBy: 'updatedAt',
            sortOrder: 'desc',
            limit: 20
          });
        }
      },
      {
        key: `favorite_projects_${userId}`,
        queryFn: async () => {
          const { EnhancedProjectService } = await import('./enhancedProjectService');
          const service = new EnhancedProjectService();
          return service.getProjectsByFilters(userId, {
            isFavorite: true,
            limit: 10
          });
        }
      },
      {
        key: `draft_projects_${userId}`,
        queryFn: async () => {
          const { EnhancedProjectService } = await import('./enhancedProjectService');
          const service = new EnhancedProjectService();
          return service.getProjectsByFilters(userId, {
            status: ['draft'],
            limit: 15
          });
        }
      }
    ];

    await databaseOptimizationService.preloadCriticalData(criticalQueries);
    
    logger.info('Critical project data preloaded', { userId }, 'PROJECT_OPTIMIZER');
  }
} 