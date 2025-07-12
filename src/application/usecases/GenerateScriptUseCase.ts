// GenerateScriptUseCase - Clean Architecture V6.4
// Use Case para orquestrar a geração de scripts com IA

import { 
  CreateScriptDTO, 
  ScriptResponseDTO, 
  ValidationResult, 
  ApiResponse 
} from '../dto';

import {
  IGeminiService,
  ITemplateRepository,
  IScriptRepository,
  IAnalyticsService,
  ILogger,
  TemplateEntity,
  ScriptEntity
} from '../interfaces';

// Interface para o Use Case
export interface IGenerateScriptUseCase {
  execute(input: CreateScriptDTO): Promise<ApiResponse<ScriptResponseDTO>>;
  validateInput(input: CreateScriptDTO): ValidationResult;
}

// Implementação do Use Case
export class GenerateScriptUseCase implements IGenerateScriptUseCase {
  constructor(
    private readonly geminiService: IGeminiService,
    private readonly templateRepository: ITemplateRepository,
    private readonly scriptRepository: IScriptRepository,
    private readonly analyticsService: IAnalyticsService,
    private readonly logger: ILogger
  ) {}

  async execute(input: CreateScriptDTO): Promise<ApiResponse<ScriptResponseDTO>> {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate input
      const validation = this.validateInput(input);
      if (!validation.isValid) {
        this.logger.warn('Input validation failed', { userId: input.userId, errors: validation.errors });
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            details: validation.errors
          },
          metadata: { timestamp, version: '6.4', requestId }
        };
      }

      // 2. Get template based on formData
      const template = await this.getOptimalTemplate(input.formData);
      
      // 3. Prepare prompt for AI generation
      const prompt = this.buildPrompt(input.formData, template);
      
      // 4. Generate script content using Gemini
      const aiResponse = await this.geminiService.generateContent({
        prompt,
        context: {
          platform: input.formData.platform,
          audience: input.formData.targetAudience,
          tone: input.formData.toneOfVoice,
          duration: input.formData.duration
        },
        options: {
          temperature: 0.7,
          maxTokens: 2048,
          topP: 0.9
        }
      });

      if (!aiResponse.success) {
        throw new Error(`AI generation failed: ${aiResponse.error}`);
      }

      // 5. Process and enhance the generated content
      const processedContent = await this.processGeneratedContent(
        aiResponse.content!,
        input.formData
      );

      // 6. Create script entity data
      const scriptData: Omit<ScriptEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: input.userId,
        title: input.title || this.generateTitle(input.formData),
        content: processedContent,
        status: 'draft',
        tags: this.generateTags(input.formData),
        folderId: undefined,
        isFavorite: false,
        version: 1,
        wordCount: this.calculateWordCount(processedContent),
        formData: input.formData
      };

      // 7. Create and save the script
      const script = await this.scriptRepository.create(scriptData as any); // TODO: Fix create DTO mapping

      // 8. Track analytics
      await this.analyticsService.trackEvent({
        type: 'script_generated',
        userId: input.userId,
        metadata: {
          platform: input.formData.platform,
          duration: input.formData.duration,
          wordCount: this.calculateWordCount(processedContent),
          aiModel: 'gemini-pro',
          templateUsed: template?.id,
          tokensUsed: aiResponse.metadata?.tokensUsed,
          responseTime: aiResponse.metadata?.responseTime
        },
        timestamp: new Date()
      });

      // 9. Return response
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

      this.logger.info('Script generated successfully', {
        userId: input.userId,
        scriptId: script.id,
        platform: input.formData.platform,
        wordCount: script.wordCount
      });

      return {
        success: true,
        data: response,
        metadata: { timestamp, version: '6.4', requestId }
      };

    } catch (error) {
      this.logger.error('GenerateScriptUseCase execution failed', error as Error, {
        userId: input.userId,
        platform: input.formData.platform,
        requestId
      });
      
      // Track error for analytics
      await this.analyticsService.trackError({
        type: 'script_generation_error',
        userId: input.userId,
        error: (error as Error).message,
        metadata: {
          platform: input.formData.platform,
          requestId
        },
        timestamp: new Date()
      });

      return {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: 'Failed to generate script',
          details: (error as Error).message
        },
        metadata: { timestamp, version: '6.4', requestId }
      };
    }
  }

  validateInput(input: CreateScriptDTO): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    // Required fields validation
    if (!input.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED' });
    }

    if (!input.formData.platform) {
      errors.push({ field: 'platform', message: 'Platform is required', code: 'REQUIRED' });
    }

    if (!input.formData.videoTopic) {
      errors.push({ field: 'videoTopic', message: 'Video topic is required', code: 'REQUIRED' });
    }

    if (!input.formData.targetAudience) {
      errors.push({ field: 'targetAudience', message: 'Target audience is required', code: 'REQUIRED' });
    }

    if (!input.formData.toneOfVoice) {
      errors.push({ field: 'toneOfVoice', message: 'Tone of voice is required', code: 'REQUIRED' });
    }

    // Content length validation
    if (input.formData.details && input.formData.details.length > 2000) {
      warnings.push({ 
        field: 'details', 
        message: 'Details are very long, consider summarizing', 
        code: 'LENGTH_WARNING' 
      });
    }

    // Duration validation
    if (input.formData.duration) {
      const durationSeconds = this.parseDuration(input.formData.duration);
      if (durationSeconds > 600) { // 10 minutes
        warnings.push({
          field: 'duration',
          message: 'Long videos may require multiple content blocks',
          code: 'DURATION_WARNING'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async getOptimalTemplate(formData: CreateScriptDTO['formData']): Promise<TemplateEntity | null> {
    try {
      const searchResult = await this.templateRepository.search({
        platform: formData.platform,
        category: this.mapGoalToCategory(formData.videoGoal),
        difficulty: 'beginner', // Default to beginner for better success rates
        limit: 1
      });

      return searchResult.templates.length > 0 ? searchResult.templates[0] : null;
    } catch (error) {
      this.logger.warn('Failed to fetch template, proceeding without template', error as Error, {
        platform: formData.platform,
        category: this.mapGoalToCategory(formData.videoGoal)
      });
      return null;
    }
  }

  private buildPrompt(formData: CreateScriptDTO['formData'], template?: TemplateEntity): string {
    let prompt = `Create a ${formData.duration} video script for ${formData.platform}.

Topic: ${formData.videoTopic}
Target Audience: ${formData.targetAudience}
Tone: ${formData.toneOfVoice}
Goal: ${formData.videoGoal}
Format: ${formData.format}

`;

    if (formData.details) {
      prompt += `Additional Details: ${formData.details}\n\n`;
    }

    if (formData.hook) {
      prompt += `Hook/Opening: ${formData.hook}\n\n`;
    }

    if (formData.callToAction) {
      prompt += `Call to Action: ${formData.callToAction}\n\n`;
    }

    if (formData.keyPoints) {
      prompt += `Key Points to Cover: ${formData.keyPoints}\n\n`;
    }

    if (template) {
      prompt += `Structure Template: ${template.title}\n`;
      template.structure.forEach((section, index) => {
        prompt += `${index + 1}. ${section.title}: ${section.description}\n`;
      });
      prompt += '\n';
    }

    prompt += `Please create an engaging script that:
1. Captures attention immediately
2. Maintains the specified tone throughout
3. Delivers value to the target audience
4. Includes natural transitions
5. Ends with a compelling call-to-action
6. Fits the ${formData.duration} duration

Format the output with clear sections and timestamps if appropriate.`;

    return prompt;
  }

  private async processGeneratedContent(content: string, formData: CreateScriptDTO['formData']): Promise<string> {
    // Add basic content processing
    let processed = content;

    // Add platform-specific formatting
    if (formData.platform === 'youtube') {
      processed = this.addYouTubeFormatting(processed);
    } else if (formData.platform === 'tiktok') {
      processed = this.addTikTokFormatting(processed);
    } else if (formData.platform === 'instagram') {
      processed = this.addInstagramFormatting(processed);
    }

    return processed;
  }

  private generateTitle(formData: CreateScriptDTO['formData']): string {
    const platform = formData.platform.charAt(0).toUpperCase() + formData.platform.slice(1);
    const topic = formData.videoTopic.slice(0, 30);
    return `${platform} Script - ${topic}`;
  }

  private generateTags(formData: CreateScriptDTO['formData']): string[] {
    const tags = [
      formData.platform,
      formData.format,
      formData.videoGoal,
      formData.toneOfVoice
    ];

    if (formData.targetAudience && formData.targetAudience !== 'Outro') {
      tags.push(formData.targetAudience);
    }

    return tags.filter(tag => tag && tag.length > 0);
  }

  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  private parseDuration(duration: string): number {
    // Parse duration string to seconds
    // Examples: "30 segundos", "2 minutos", "1-3 minutos"
    const minutes = duration.match(/(\d+)[-–]?(\d+)?\s*minuto/i);
    const seconds = duration.match(/(\d+)\s*segundo/i);

    if (minutes) {
      const min1 = parseInt(minutes[1]);
      const min2 = minutes[2] ? parseInt(minutes[2]) : min1;
      return ((min1 + min2) / 2) * 60;
    }

    if (seconds) {
      return parseInt(seconds[1]);
    }

    return 60; // Default to 1 minute
  }

  private mapGoalToCategory(goal: string): 'educational' | 'entertainment' | 'marketing' | 'news' | 'tutorial' | 'review' | 'story' {
    const goalMap: Record<string, 'educational' | 'entertainment' | 'marketing' | 'news' | 'tutorial' | 'review' | 'story'> = {
      'Educar': 'educational',
      'Entreter': 'entertainment',
      'Vender': 'marketing',
      'Informar': 'news',
      'Ensinar': 'tutorial',
      'Revisar': 'review',
      'Contar História': 'story'
    };

    return goalMap[goal] || 'educational';
  }

  private addYouTubeFormatting(content: string): string {
    // Add YouTube-specific formatting
    return content;
  }

  private addTikTokFormatting(content: string): string {
    // Add TikTok-specific formatting
    return content;
  }

  private addInstagramFormatting(content: string): string {
    // Add Instagram-specific formatting
    return content;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 