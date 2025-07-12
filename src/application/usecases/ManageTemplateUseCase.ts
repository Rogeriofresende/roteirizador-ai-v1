// ManageTemplateUseCase - Clean Architecture V6.4
// Use Case para gerenciamento de templates de script

import { 
  CreateTemplateDTO, 
  TemplateResponseDTO, 
  ValidationResult, 
  ApiResponse 
} from '../dto';

import {
  ITemplateRepository,
  IAnalyticsService,
  ICacheService,
  IGeminiService,
  ILogger,
  TemplateEntity
} from '../interfaces';

// Interface para o Use Case
export interface IManageTemplateUseCase {
  createTemplate(input: CreateTemplateDTO): Promise<ApiResponse<TemplateResponseDTO>>;
  getTemplatesByCategory(category: string, limit?: number): Promise<ApiResponse<TemplateResponseDTO[]>>;
  getFeaturedTemplates(limit?: number): Promise<ApiResponse<TemplateResponseDTO[]>>;
  searchTemplates(query: string, filters?: Record<string, unknown>): Promise<ApiResponse<TemplateResponseDTO[]>>;
  validateTemplateInput(input: CreateTemplateDTO): ValidationResult;
}

// Implementação do Use Case
export class ManageTemplateUseCase implements IManageTemplateUseCase {
  constructor(
    private readonly templateRepository: ITemplateRepository,
    private readonly analyticsService: IAnalyticsService,
    private readonly cacheService: ICacheService,
    private readonly aiService: IGeminiService,
    private readonly logger: ILogger
  ) {}

  async createTemplate(input: CreateTemplateDTO): Promise<ApiResponse<TemplateResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate input
      const validation = this.validateTemplateInput(input);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Template input validation failed',
            details: validation.errors
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Check for duplicate templates
      const existingTemplate = await this.templateRepository.findByTitle(input.title);
      if (existingTemplate) {
        return {
          success: false,
          error: {
            code: 'TEMPLATE_EXISTS',
            message: 'Template with this title already exists',
            details: { title: input.title }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 3. Enhance template with AI insights
      const enhancedTemplate = await this.enhanceTemplateWithAI(input);

      // 4. Create template
      const template = {
        ...enhancedTemplate,
        id: this.generateTemplateId(),
        popularity: 0,
        usage: 0,
        rating: 0,
        author: {
          id: 'system',
          name: 'Roteirar AI',
          verified: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 5. Save template to repository
      const savedTemplate = await this.templateRepository.create(template);

      // 6. Update cache with new template
      await this.cacheService.invalidatePattern('templates:*');
      await this.cacheService.set(
        `template:${savedTemplate.id}`, 
        savedTemplate, 
        { ttl: 3600 }
      );

      // 7. Track template creation
      await this.analyticsService.trackEvent({
        type: 'template_created',
        metadata: {
          templateId: savedTemplate.id,
          category: input.category,
          platform: input.platform,
          difficulty: input.difficulty,
          isPremium: input.isPremium,
          isPublic: input.isPublic
        }
      });

      // 8. Return response
      const response: TemplateResponseDTO = {
        id: savedTemplate.id,
        title: savedTemplate.title,
        description: savedTemplate.description,
        category: savedTemplate.category,
        platform: savedTemplate.platform,
        difficulty: savedTemplate.difficulty,
        popularity: savedTemplate.popularity,
        usage: savedTemplate.usage,
        rating: savedTemplate.rating,
        isPremium: savedTemplate.isPremium,
        isPublic: savedTemplate.isPublic,
        createdAt: savedTemplate.createdAt.toISOString(),
        author: savedTemplate.author
      };

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      console.error('ManageTemplateUseCase createTemplate failed:', error);
      
      return {
        success: false,
        error: {
          code: 'TEMPLATE_CREATION_ERROR',
          message: 'Failed to create template',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async getTemplatesByCategory(category: string, limit = 10): Promise<ApiResponse<TemplateResponseDTO[]>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Check cache first
      const cacheKey = `templates:category:${category}:limit:${limit}`;
      const cachedTemplates = await this.cacheService.get(cacheKey);
      
      if (cachedTemplates) {
        return {
          success: true,
          data: cachedTemplates,
          metadata: { timestamp, version: '6.4', requestId, source: 'cache' }
        };
      }

      // 2. Fetch from repository
      const templates = await this.templateRepository.findByCategory(category, {
        limit,
        orderBy: 'popularity',
        direction: 'desc'
      });

      // 3. Transform to response DTOs
      const responseTemplates: TemplateResponseDTO[] = templates.map(template => ({
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        platform: template.platform,
        difficulty: template.difficulty,
        popularity: template.popularity,
        usage: template.usage,
        rating: template.rating,
        isPremium: template.isPremium,
        isPublic: template.isPublic,
        createdAt: template.createdAt.toISOString(),
        author: template.author
      }));

      // 4. Cache results
      await this.cacheService.set(cacheKey, responseTemplates, { ttl: 1800 });

      // 5. Track template access
      await this.analyticsService.trackEvent({
        type: 'templates_accessed',
        metadata: {
          category,
          count: responseTemplates.length,
          requestType: 'by_category'
        }
      });

      return {
        success: true,
        data: responseTemplates,
        metadata: { timestamp, version: '6.4', requestId, source: 'database' }
      };

    } catch (error) {
      console.error('ManageTemplateUseCase getTemplatesByCategory failed:', error);
      
      return {
        success: false,
        error: {
          code: 'TEMPLATES_FETCH_ERROR',
          message: 'Failed to fetch templates by category',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async getFeaturedTemplates(limit = 6): Promise<ApiResponse<TemplateResponseDTO[]>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Check cache first
      const cacheKey = `templates:featured:limit:${limit}`;
      const cachedTemplates = await this.cacheService.get(cacheKey);
      
      if (cachedTemplates) {
        return {
          success: true,
          data: cachedTemplates,
          metadata: { timestamp, version: '6.4', requestId, source: 'cache' }
        };
      }

      // 2. Fetch featured templates
      const templates = await this.templateRepository.findFeatured({
        limit,
        criteria: {
          minPopularity: 10,
          minRating: 4.0,
          isPublic: true,
          isPremium: false
        }
      });

      // 3. Transform to response DTOs
      const responseTemplates: TemplateResponseDTO[] = templates.map(template => ({
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        platform: template.platform,
        difficulty: template.difficulty,
        popularity: template.popularity,
        usage: template.usage,
        rating: template.rating,
        isPremium: template.isPremium,
        isPublic: template.isPublic,
        createdAt: template.createdAt.toISOString(),
        author: template.author
      }));

      // 4. Cache results with longer TTL for featured content
      await this.cacheService.set(cacheKey, responseTemplates, { ttl: 3600 });

      // 5. Track featured templates access
      await this.analyticsService.trackEvent({
        type: 'templates_accessed',
        metadata: {
          count: responseTemplates.length,
          requestType: 'featured'
        }
      });

      return {
        success: true,
        data: responseTemplates,
        metadata: { timestamp, version: '6.4', requestId, source: 'database' }
      };

    } catch (error) {
      console.error('ManageTemplateUseCase getFeaturedTemplates failed:', error);
      
      return {
        success: false,
        error: {
          code: 'FEATURED_TEMPLATES_ERROR',
          message: 'Failed to fetch featured templates',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  async searchTemplates(query: string, filters?: any): Promise<ApiResponse<TemplateResponseDTO[]>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate search query
      if (!query || query.length < 2) {
        return {
          success: false,
          error: {
            code: 'INVALID_SEARCH_QUERY',
            message: 'Search query must be at least 2 characters',
            details: { query }
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Build search parameters
      const searchParams = {
        query: query.trim(),
        filters: {
          category: filters?.category,
          platform: filters?.platform,
          difficulty: filters?.difficulty,
          isPremium: filters?.isPremium,
          isPublic: filters?.isPublic ?? true,
          ...filters
        },
        limit: filters?.limit || 20,
        offset: filters?.offset || 0
      };

      // 3. Search templates
      const searchResults = await this.templateRepository.search(searchParams);

      // 4. Transform to response DTOs
      const responseTemplates: TemplateResponseDTO[] = searchResults.templates.map(template => ({
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        platform: template.platform,
        difficulty: template.difficulty,
        popularity: template.popularity,
        usage: template.usage,
        rating: template.rating,
        isPremium: template.isPremium,
        isPublic: template.isPublic,
        createdAt: template.createdAt.toISOString(),
        author: template.author
      }));

      // 5. Track search
      await this.analyticsService.trackEvent({
        type: 'templates_searched',
        metadata: {
          query,
          filters: searchParams.filters,
          resultCount: responseTemplates.length,
          totalResults: searchResults.total
        }
      });

      return {
        success: true,
        data: responseTemplates,
        metadata: { 
          timestamp, 
          version: '6.4', 
          requestId,
          pagination: {
            total: searchResults.total,
            limit: searchParams.limit,
            offset: searchParams.offset
          }
        }
      };

    } catch (error) {
      console.error('ManageTemplateUseCase searchTemplates failed:', error);
      
      return {
        success: false,
        error: {
          code: 'TEMPLATE_SEARCH_ERROR',
          message: 'Failed to search templates',
          details: error.message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  validateTemplateInput(input: CreateTemplateDTO): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Required fields validation
    if (!input.title) {
      errors.push({ field: 'title', message: 'Template title is required', code: 'REQUIRED' });
    } else if (input.title.length < 5) {
      errors.push({ field: 'title', message: 'Title must be at least 5 characters', code: 'MIN_LENGTH' });
    } else if (input.title.length > 100) {
      errors.push({ field: 'title', message: 'Title must be less than 100 characters', code: 'MAX_LENGTH' });
    }

    if (!input.description) {
      errors.push({ field: 'description', message: 'Template description is required', code: 'REQUIRED' });
    } else if (input.description.length < 20) {
      errors.push({ field: 'description', message: 'Description must be at least 20 characters', code: 'MIN_LENGTH' });
    } else if (input.description.length > 500) {
      errors.push({ field: 'description', message: 'Description must be less than 500 characters', code: 'MAX_LENGTH' });
    }

    if (!input.category) {
      errors.push({ field: 'category', message: 'Template category is required', code: 'REQUIRED' });
    }

    if (!input.platform || input.platform.length === 0) {
      errors.push({ field: 'platform', message: 'At least one platform is required', code: 'REQUIRED' });
    }

    if (!input.structure || input.structure.length === 0) {
      errors.push({ field: 'structure', message: 'Template structure is required', code: 'REQUIRED' });
    }

    if (!input.difficulty) {
      errors.push({ field: 'difficulty', message: 'Difficulty level is required', code: 'REQUIRED' });
    }

    // Structure validation
    if (input.structure) {
      input.structure.forEach((section, index) => {
        if (!section.title) {
          errors.push({ 
            field: `structure[${index}].title`, 
            message: 'Section title is required', 
            code: 'REQUIRED' 
          });
        }
        if (!section.content) {
          errors.push({ 
            field: `structure[${index}].content`, 
            message: 'Section content is required', 
            code: 'REQUIRED' 
          });
        }
        if (section.duration <= 0) {
          errors.push({ 
            field: `structure[${index}].duration`, 
            message: 'Section duration must be positive', 
            code: 'INVALID_VALUE' 
          });
        }
      });
    }

    // Placeholders validation
    if (input.placeholders) {
      input.placeholders.forEach((placeholder, index) => {
        if (!placeholder.name) {
          errors.push({ 
            field: `placeholders[${index}].name`, 
            message: 'Placeholder name is required', 
            code: 'REQUIRED' 
          });
        }
        if (!placeholder.type) {
          errors.push({ 
            field: `placeholders[${index}].type`, 
            message: 'Placeholder type is required', 
            code: 'REQUIRED' 
          });
        }
      });
    }

    // Warnings
    if (input.tags.length > 10) {
      warnings.push({ 
        field: 'tags', 
        message: 'Too many tags may affect discoverability', 
        code: 'EXCESSIVE_TAGS' 
      });
    }

    if (input.isPremium && !input.isPublic) {
      warnings.push({ 
        field: 'isPremium', 
        message: 'Private premium templates have limited reach', 
        code: 'LIMITED_REACH' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async enhanceTemplateWithAI(input: CreateTemplateDTO): Promise<CreateTemplateDTO> {
    try {
      // Use AI to enhance template description and suggestions
      const enhancement = await this.aiService.enhanceTemplate({
        title: input.title,
        description: input.description,
        category: input.category,
        platform: input.platform
      });

      return {
        ...input,
        description: enhancement.enhancedDescription || input.description,
        structure: input.structure.map(section => ({
          ...section,
          suggestions: enhancement.sectionSuggestions?.[section.id] || section.suggestions
        }))
      };
    } catch (error) {
      console.warn('Failed to enhance template with AI, using original:', error);
      return input;
    }
  }

  private generateTemplateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 