// ScriptApplicationService - Clean Architecture V6.4
// Application Service para orquestrar operações de script

import { 
  IGenerateScriptUseCase,
  GenerateScriptUseCase 
} from '../usecases';
import { 
  CreateScriptDTO, 
  UpdateScriptDTO,
  ScriptResponseDTO, 
  ApiResponse 
} from '../dto';

// Interface para o Application Service
export interface IScriptApplicationService {
  generateScript(input: CreateScriptDTO): Promise<ApiResponse<ScriptResponseDTO>>;
  updateScript(input: UpdateScriptDTO): Promise<ApiResponse<ScriptResponseDTO>>;
  getScript(scriptId: string, userId: string): Promise<ApiResponse<ScriptResponseDTO>>;
  getUserScripts(userId: string, filters?: any): Promise<ApiResponse<ScriptResponseDTO[]>>;
  deleteScript(scriptId: string, userId: string): Promise<ApiResponse<boolean>>;
  duplicateScript(scriptId: string, userId: string): Promise<ApiResponse<ScriptResponseDTO>>;
}

// Implementação do Application Service
export class ScriptApplicationService implements IScriptApplicationService {
  constructor(
    private generateScriptUseCase: IGenerateScriptUseCase,
    private projectRepository: any, // TODO: Replace with proper DI interface
    private analyticsService: any, // TODO: Replace with proper DI interface
    private cacheService: any // TODO: Replace with proper DI interface
  ) {}

  async generateScript(input: CreateScriptDTO): Promise<ApiResponse<ScriptResponseDTO>> {
    try {
      // Delegate to use case
      const result = await this.generateScriptUseCase.execute(input);
      
      // Additional application-level logic
      if (result.success && result.data) {
        // Invalidate user's script cache
        await this.cacheService.invalidatePattern(`user:${input.userId}:scripts:*`);
        
        // Update user's script count
        await this.updateUserScriptCount(input.userId, 1);
      }

      return result;
    } catch (error) {
      console.error('ScriptApplicationService generateScript failed:', error);
      
      return {
        success: false,
        error: {
          code: 'APPLICATION_ERROR',
          message: 'Script generation failed at application level',
          details: error.message
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '6.4',
          requestId: this.generateRequestId()
        }
      };
    }
  }

  async updateScript(input: UpdateScriptDTO): Promise<ApiResponse<ScriptResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate script ownership
      const script = await this.projectRepository.findById(input.id);
      if (!script) {
        return {
          success: false,
          error: {
            code: 'SCRIPT_NOT_FOUND',
            message: 'Script not found',
            details: { scriptId: input.id }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      if (script.userId !== input.userId) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'User does not have permission to update this script',
            details: { scriptId: input.id, userId: input.userId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Update script
      const updateData = {
        ...input,
        updatedAt: new Date(),
        version: script.version + 1
      };

      // Calculate word count if content is updated
      if (input.content) {
        updateData.wordCount = this.calculateWordCount(input.content);
      }

      const updatedScript = await this.projectRepository.update(input.id, updateData);

      // 3. Invalidate cache
      await this.cacheService.del(`script:${input.id}`);
      await this.cacheService.invalidatePattern(`user:${input.userId}:scripts:*`);

      // 4. Track update
      await this.analyticsService.trackEvent({
        type: 'script_updated',
        userId: input.userId,
        metadata: {
          scriptId: input.id,
          fieldsUpdated: Object.keys(input).filter(key => key !== 'id' && key !== 'userId'),
          newVersion: updatedScript.version
        }
      });

      // 5. Return response
      const response: ScriptResponseDTO = {
        id: updatedScript.id,
        title: updatedScript.title,
        content: updatedScript.content,
        status: updatedScript.status,
        tags: updatedScript.tags,
        folderId: updatedScript.folderId,
        isFavorite: updatedScript.isFavorite,
        wordCount: updatedScript.wordCount,
        version: updatedScript.version,
        createdAt: updatedScript.createdAt.toISOString(),
        updatedAt: updatedScript.updatedAt.toISOString()
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('ScriptApplicationService updateScript failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SCRIPT_UPDATE_ERROR',
          message: 'Failed to update script',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async getScript(scriptId: string, userId: string): Promise<ApiResponse<ScriptResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Check cache first
      const cacheKey = `script:${scriptId}`;
      const cachedScript = await this.cacheService.get(cacheKey);
      
      if (cachedScript && cachedScript.userId === userId) {
        return {
          success: true,
          data: cachedScript,
          metadata: { timestamp, version: '6.4', requestId, source: 'cache' }
        };
      }

      // 2. Fetch from repository
      const script = await this.projectRepository.findById(scriptId);
      if (!script) {
        return {
          success: false,
          error: {
            code: 'SCRIPT_NOT_FOUND',
            message: 'Script not found',
            details: { scriptId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 3. Verify ownership or collaboration access
      if (script.userId !== userId) {
        const hasAccess = await this.projectRepository.hasCollaborationAccess(scriptId, userId);
        if (!hasAccess) {
          return {
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'User does not have access to this script',
              details: { scriptId, userId }
            },
            metadata: { timestamp, version: '6.4', requestId }
          };
        }
      }

      // 4. Transform to response DTO
      const response: ScriptResponseDTO = {
        id: script.id,
        title: script.title,
        content: script.content,
        status: script.status,
        tags: script.tags,
        folderId: script.folderId,
        isFavorite: script.isFavorite,
        wordCount: script.wordCount,
        version: script.version,
        createdAt: script.createdAt.toISOString(),
        updatedAt: script.updatedAt.toISOString()
      };

      // 5. Cache result
      if (script.userId === userId) {
        await this.cacheService.set(cacheKey, response, { ttl: 1800 });
      }

      // 6. Track access
      await this.analyticsService.trackEvent({
        type: 'script_accessed',
        userId,
        metadata: {
          scriptId,
          isOwner: script.userId === userId,
          accessType: 'view'
        }
      });

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId, source: 'database' }
      };

    } catch (error) {
      console.error('ScriptApplicationService getScript failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SCRIPT_FETCH_ERROR',
          message: 'Failed to fetch script',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async getUserScripts(userId: string, filters?: any): Promise<ApiResponse<ScriptResponseDTO[]>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Build cache key
      const filtersKey = filters ? JSON.stringify(filters) : 'default';
      const cacheKey = `user:${userId}:scripts:${filtersKey}`;
      
      // 2. Check cache
      const cachedScripts = await this.cacheService.get(cacheKey);
      if (cachedScripts) {
        return {
          success: true,
          data: cachedScripts,
          metadata: { timestamp, version: '6.4', requestId, source: 'cache' }
        };
      }

      // 3. Fetch from repository
      const queryFilters = {
        userId,
        ...filters,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
        orderBy: filters?.orderBy || 'updatedAt',
        direction: filters?.direction || 'desc'
      };

      const scripts = await this.projectRepository.findByUser(queryFilters);

      // 4. Transform to response DTOs
      const responseScripts: ScriptResponseDTO[] = scripts.map(script => ({
        id: script.id,
        title: script.title,
        content: script.content,
        status: script.status,
        tags: script.tags,
        folderId: script.folderId,
        isFavorite: script.isFavorite,
        wordCount: script.wordCount,
        version: script.version,
        createdAt: script.createdAt.toISOString(),
        updatedAt: script.updatedAt.toISOString()
      }));

      // 5. Cache results
      await this.cacheService.set(cacheKey, responseScripts, { ttl: 600 });

      // 6. Track access
      await this.analyticsService.trackEvent({
        type: 'user_scripts_accessed',
        userId,
        metadata: {
          scriptCount: responseScripts.length,
          filters: queryFilters,
          hasFilters: !!filters
        }
      });

      return {
        success: true,
        data: responseScripts,
        metadata: { timestamp, version: '6.4', requestId, source: 'database' }
      };

    } catch (error) {
      console.error('ScriptApplicationService getUserScripts failed:', error);
      
      return {
        success: false,
        error: {
          code: 'USER_SCRIPTS_FETCH_ERROR',
          message: 'Failed to fetch user scripts',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async deleteScript(scriptId: string, userId: string): Promise<ApiResponse<boolean>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Verify ownership
      const script = await this.projectRepository.findById(scriptId);
      if (!script) {
        return {
          success: false,
          error: {
            code: 'SCRIPT_NOT_FOUND',
            message: 'Script not found',
            details: { scriptId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      if (script.userId !== userId) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'User does not have permission to delete this script',
            details: { scriptId, userId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Delete script
      await this.projectRepository.delete(scriptId);

      // 3. Clear cache
      await this.cacheService.del(`script:${scriptId}`);
      await this.cacheService.invalidatePattern(`user:${userId}:scripts:*`);

      // 4. Update user's script count
      await this.updateUserScriptCount(userId, -1);

      // 5. Track deletion
      await this.analyticsService.trackEvent({
        type: 'script_deleted',
        userId,
        metadata: {
          scriptId,
          scriptTitle: script.title,
          scriptWordCount: script.wordCount
        }
      });

      return {
        success: true,
        data: true,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('ScriptApplicationService deleteScript failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SCRIPT_DELETE_ERROR',
          message: 'Failed to delete script',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async duplicateScript(scriptId: string, userId: string): Promise<ApiResponse<ScriptResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Get original script
      const originalScript = await this.projectRepository.findById(scriptId);
      if (!originalScript) {
        return {
          success: false,
          error: {
            code: 'SCRIPT_NOT_FOUND',
            message: 'Original script not found',
            details: { scriptId }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Verify access
      if (originalScript.userId !== userId) {
        const hasAccess = await this.projectRepository.hasCollaborationAccess(scriptId, userId);
        if (!hasAccess) {
          return {
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'User does not have access to this script',
              details: { scriptId, userId }
            },
            metadata: { timestamp, version: '6.4', requestId }
          };
        }
      }

      // 3. Create duplicate
      const duplicateData = {
        userId,
        title: `${originalScript.title} (Copy)`,
        content: originalScript.content,
        formData: originalScript.formData,
        status: 'draft' as const,
        tags: [...originalScript.tags, 'copy'],
        isFavorite: false,
        version: 1,
        wordCount: originalScript.wordCount,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const duplicatedScript = await this.projectRepository.create(duplicateData);

      // 4. Clear cache
      await this.cacheService.invalidatePattern(`user:${userId}:scripts:*`);

      // 5. Update user's script count
      await this.updateUserScriptCount(userId, 1);

      // 6. Track duplication
      await this.analyticsService.trackEvent({
        type: 'script_duplicated',
        userId,
        metadata: {
          originalScriptId: scriptId,
          duplicatedScriptId: duplicatedScript.id,
          isOwnScript: originalScript.userId === userId
        }
      });

      // 7. Return response
      const response: ScriptResponseDTO = {
        id: duplicatedScript.id,
        title: duplicatedScript.title,
        content: duplicatedScript.content,
        status: duplicatedScript.status,
        tags: duplicatedScript.tags,
        folderId: duplicatedScript.folderId,
        isFavorite: duplicatedScript.isFavorite,
        wordCount: duplicatedScript.wordCount,
        version: duplicatedScript.version,
        createdAt: duplicatedScript.createdAt.toISOString(),
        updatedAt: duplicatedScript.updatedAt.toISOString()
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('ScriptApplicationService duplicateScript failed:', error);
      
      return {
        success: false,
        error: {
          code: 'SCRIPT_DUPLICATE_ERROR',
          message: 'Failed to duplicate script',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  private async updateUserScriptCount(userId: string, delta: number): Promise<void> {
    try {
      // Update user's metadata with script count
      // This could be handled by a separate user service
      console.log(`Updating script count for user ${userId} by ${delta}`);
    } catch (error) {
      console.warn('Failed to update user script count:', error);
    }
  }

  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 