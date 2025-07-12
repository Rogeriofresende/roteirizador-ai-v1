/**
 * ScriptGenerationService - Domain Service
 * Roteirar IA - Clean Architecture Implementation
 */

import { Script, PlatformType, FormatType } from '../entities/Script';
import { Template } from '../entities/Template';
import { User } from '../entities/User';
import { ScriptContent } from '../value-objects/ScriptContent';

export interface ScriptGenerationRequest {
  userId: string;
  title: string;
  platform: PlatformType;
  format: FormatType;
  objective: string;
  targetAudience: string;
  tone: string;
  additionalRequirements?: string;
  useTemplate?: boolean;
  templateId?: string;
  customPrompt?: string;
}

export interface AIGenerationRequest {
  prompt: string;
  platform: PlatformType;
  format: FormatType;
  tone: string;
  targetAudience: string;
  objective: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerationResult {
  script: Script;
  metadata: GenerationMetadata;
  suggestions: GenerationSuggestion[];
  qualityScore: number;
}

export interface GenerationMetadata {
  aiModel: string;
  processingTime: number;
  tokensUsed: number;
  promptUsed: string;
  qualityChecks: QualityCheck[];
  optimizationApplied: string[];
}

export interface GenerationSuggestion {
  type: SuggestionType;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'content' | 'structure' | 'seo' | 'engagement';
}

export type SuggestionType = 'hook_improvement' | 'structure_optimization' | 'cta_enhancement' | 'keyword_addition' | 'tone_adjustment';

export interface QualityCheck {
  check: string;
  passed: boolean;
  score: number;
  recommendations?: string[];
}

/**
 * ScriptGenerationService - Core business logic for AI script generation
 */
export class ScriptGenerationService {
  constructor(
    private aiProvider: IAIProvider,
    private qualityAssessment: IQualityAssessmentService
  ) {}

  /**
   * Generate script with AI
   */
  async generateScript(request: ScriptGenerationRequest): Promise<GenerationResult> {
    // 1. Validate request
    this.validateGenerationRequest(request);

    // 2. Check user permissions
    await this.validateUserPermissions(request.userId);

    // 3. Build generation prompt
    const prompt = await this.buildGenerationPrompt(request);

    // 4. Generate content with AI
    const aiRequest: AIGenerationRequest = {
      prompt: prompt.text,
      platform: request.platform,
      format: request.format,
      tone: request.tone,
      targetAudience: request.targetAudience,
      objective: request.objective,
      maxTokens: this.getMaxTokensForPlatform(request.platform),
      temperature: this.getTemperatureForFormat(request.format),
    };

    const aiResult = await this.aiProvider.generateText(aiRequest);

    // 5. Process and validate generated content
    const processedContent = this.processGeneratedContent(aiResult.content, request);

    // 6. Create script content value object
    const scriptContent = ScriptContent.create({
      content: processedContent,
      platform: request.platform,
    });

    // 7. Validate content for platform
    const contentValidation = scriptContent.isValidForPlatform();
    if (!contentValidation.isValid) {
      throw new Error(`Generated content is not valid for ${request.platform}: ${contentValidation.errors.join(', ')}`);
    }

    // 8. Create script entity
    const script = Script.create({
      userId: request.userId,
      title: request.title,
      content: processedContent,
      platform: request.platform,
      format: request.format,
      objective: request.objective,
      targetAudience: request.targetAudience,
      tone: request.tone,
      originalPrompt: prompt.text,
      aiModelUsed: aiResult.model,
      generationTime: aiResult.processingTime,
      fromTemplate: request.templateId,
    });

    // 9. Perform quality assessment
    const qualityScore = await this.qualityAssessment.assessScript(script);

    // 10. Generate improvement suggestions
    const suggestions = await this.generateSuggestions(script, contentValidation);

    // 11. Apply automatic optimizations
    const optimizations = await this.applyOptimizations(script);

    return {
      script: optimizations.script,
      metadata: {
        aiModel: aiResult.model,
        processingTime: aiResult.processingTime,
        tokensUsed: aiResult.tokensUsed,
        promptUsed: prompt.text,
        qualityChecks: qualityScore.checks,
        optimizationApplied: optimizations.applied,
      },
      suggestions,
      qualityScore: qualityScore.overall,
    };
  }

  /**
   * Generate script from template
   */
  async generateFromTemplate(
    template: Template,
    placeholderValues: Record<string, any>,
    userId: string
  ): Promise<GenerationResult> {
    // 1. Validate template usage permissions
    const user = await this.getUserById(userId);
    if (!template.canBeUsedBy(userId, user.subscription)) {
      throw new Error('User does not have permission to use this template');
    }

    // 2. Process template with placeholder values
    const processedContent = template.processWithValues(placeholderValues);

    // 3. Create script from processed template
    const script = Script.create({
      userId,
      title: `Script from ${template.title}`,
      content: processedContent,
      platform: template.platform[0], // Use first platform
      format: template.format[0], // Use first format
      objective: placeholderValues.objective || 'Generated from template',
      targetAudience: placeholderValues.targetAudience || 'General audience',
      tone: placeholderValues.tone || 'Professional',
      fromTemplate: template.id,
    });

    // 4. Record template usage
    template.recordUsage();

    // 5. Perform quality assessment
    const qualityScore = await this.qualityAssessment.assessScript(script);

    // 6. Generate suggestions for template-based content
    const suggestions = await this.generateTemplateSuggestions(script, template);

    return {
      script,
      metadata: {
        aiModel: 'template',
        processingTime: 0,
        tokensUsed: 0,
        promptUsed: `Template: ${template.id}`,
        qualityChecks: qualityScore.checks,
        optimizationApplied: [],
      },
      suggestions,
      qualityScore: qualityScore.overall,
    };
  }

  /**
   * Enhance existing script with AI
   */
  async enhanceScript(
    script: Script,
    enhancementType: EnhancementType,
    userId: string
  ): Promise<GenerationResult> {
    // 1. Validate permissions
    if (!script.canBeEditedBy(userId)) {
      throw new Error('User does not have permission to edit this script');
    }

    // 2. Build enhancement prompt
    const prompt = this.buildEnhancementPrompt(script, enhancementType);

    // 3. Generate enhanced content
    const aiRequest: AIGenerationRequest = {
      prompt: prompt,
      platform: script.platform,
      format: script.format,
      tone: script.tone,
      targetAudience: script.targetAudience,
      objective: script.objective,
    };

    const aiResult = await this.aiProvider.generateText(aiRequest);

    // 4. Apply enhancement to script
    const enhancedContent = this.mergeEnhancement(script.content, aiResult.content, enhancementType);
    script.updateContent(enhancedContent);

    // 5. Re-assess quality
    const qualityScore = await this.qualityAssessment.assessScript(script);

    // 6. Generate new suggestions
    const suggestions = await this.generateEnhancementSuggestions(script, enhancementType);

    return {
      script,
      metadata: {
        aiModel: aiResult.model,
        processingTime: aiResult.processingTime,
        tokensUsed: aiResult.tokensUsed,
        promptUsed: prompt,
        qualityChecks: qualityScore.checks,
        optimizationApplied: [enhancementType],
      },
      suggestions,
      qualityScore: qualityScore.overall,
    };
  }

  // Private methods

  private validateGenerationRequest(request: ScriptGenerationRequest): void {
    if (!request.userId) {
      throw new Error('User ID is required');
    }

    if (!request.title?.trim()) {
      throw new Error('Title is required');
    }

    if (!request.platform) {
      throw new Error('Platform is required');
    }

    if (!request.format) {
      throw new Error('Format is required');
    }

    if (!request.objective?.trim()) {
      throw new Error('Objective is required');
    }

    if (!request.targetAudience?.trim()) {
      throw new Error('Target audience is required');
    }

    if (!request.tone?.trim()) {
      throw new Error('Tone is required');
    }
  }

  private async validateUserPermissions(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    
    if (!user.hasPermission('canUseAIFeatures')) {
      throw new Error('User does not have permission to use AI features');
    }

    if (!user.canPerformActionBySubscription('ai_generation')) {
      throw new Error('User subscription does not allow AI generation');
    }
  }

  private async buildGenerationPrompt(request: ScriptGenerationRequest): Promise<{ text: string; tokens: number }> {
    let prompt = `Create a ${request.format} script for ${request.platform} with the following requirements:

Objective: ${request.objective}
Target Audience: ${request.targetAudience}
Tone: ${request.tone}
Title: ${request.title}`;

    if (request.additionalRequirements) {
      prompt += `\nAdditional Requirements: ${request.additionalRequirements}`;
    }

    // Add platform-specific guidelines
    prompt += this.getPlatformGuidelines(request.platform);

    // Add format-specific structure
    prompt += this.getFormatStructure(request.format);

    if (request.customPrompt) {
      prompt += `\n\nCustom Instructions: ${request.customPrompt}`;
    }

    return {
      text: prompt,
      tokens: this.estimateTokens(prompt),
    };
  }

  private processGeneratedContent(content: string, request: ScriptGenerationRequest): string {
    // Remove any AI model metadata or formatting artifacts
    let processed = content.trim();

    // Ensure proper formatting for platform
    processed = this.formatForPlatform(processed, request.platform);

    // Add platform-specific elements if missing
    processed = this.addPlatformElements(processed, request.platform);

    return processed;
  }

  private async generateSuggestions(script: Script, validation: any): Promise<GenerationSuggestion[]> {
    const suggestions: GenerationSuggestion[] = [];

    // Add validation-based suggestions
    validation.suggestions.forEach((suggestion: string) => {
      suggestions.push({
        type: 'structure_optimization',
        title: 'Content Structure',
        description: suggestion,
        impact: 'medium',
        category: 'structure',
      });
    });

    // Analyze content for improvement opportunities
    const contentAnalysis = await this.analyzeContentForSuggestions(script);
    suggestions.push(...contentAnalysis);

    return suggestions;
  }

  private async applyOptimizations(script: Script): Promise<{ script: Script; applied: string[] }> {
    const applied: string[] = [];

    // Auto-optimize for SEO
    if (this.shouldOptimizeForSEO(script)) {
      script = this.optimizeForSEO(script);
      applied.push('seo_optimization');
    }

    // Auto-optimize for engagement
    if (this.shouldOptimizeForEngagement(script)) {
      script = this.optimizeForEngagement(script);
      applied.push('engagement_optimization');
    }

    return { script, applied };
  }

  private getPlatformGuidelines(platform: PlatformType): string {
    const guidelines = {
      'YouTube': '\n\nYouTube Guidelines:\n- Include engaging hook in first 15 seconds\n- Add clear call-to-action\n- Structure with intro, main content, conclusion',
      'Instagram': '\n\nInstagram Guidelines:\n- Keep concise and visual\n- Include relevant hashtags\n- Focus on aesthetic and lifestyle',
      'TikTok': '\n\nTikTok Guidelines:\n- Start with immediate hook\n- Keep fast-paced and engaging\n- Include trending elements',
      'LinkedIn': '\n\nLinkedIn Guidelines:\n- Maintain professional tone\n- Focus on value proposition\n- Include industry insights',
      'Podcast': '\n\nPodcast Guidelines:\n- Conversational tone\n- Include natural transitions\n- Allow for host interjections',
    };

    return guidelines[platform] || '';
  }

  private getFormatStructure(format: FormatType): string {
    const structures = {
      'tutorial': '\n\nTutorial Structure:\n1. Introduction and what viewers will learn\n2. Step-by-step instructions\n3. Common mistakes to avoid\n4. Summary and next steps',
      'review': '\n\nReview Structure:\n1. Product/service introduction\n2. Key features and benefits\n3. Pros and cons\n4. Final recommendation',
      'entertainment': '\n\nEntertainment Structure:\n1. Engaging hook\n2. Main content with humor/interest\n3. Climax or punchline\n4. Memorable ending',
      'educational': '\n\nEducational Structure:\n1. Learning objective\n2. Context and background\n3. Main concepts explained\n4. Practical applications',
      'marketing': '\n\nMarketing Structure:\n1. Attention-grabbing opening\n2. Problem identification\n3. Solution presentation\n4. Strong call-to-action',
    };

    return structures[format] || '';
  }

  private getMaxTokensForPlatform(platform: PlatformType): number {
    const maxTokens = {
      'TikTok': 300,
      'Instagram': 500,
      'YouTube': 2000,
      'LinkedIn': 800,
      'Podcast': 3000,
      'Twitter': 200,
      'Facebook': 1000,
    };

    return maxTokens[platform] || 1000;
  }

  private getTemperatureForFormat(format: FormatType): number {
    const temperatures = {
      'tutorial': 0.3, // More structured
      'educational': 0.3,
      'review': 0.5,
      'marketing': 0.7,
      'entertainment': 0.8, // More creative
      'storytelling': 0.8,
      'news': 0.2, // Very structured
    };

    return temperatures[format] || 0.5;
  }

  private formatForPlatform(content: string, platform: PlatformType): string {
    // Platform-specific formatting logic
    switch (platform) {
      case 'Instagram':
        return this.formatForInstagram(content);
      case 'TikTok':
        return this.formatForTikTok(content);
      case 'YouTube':
        return this.formatForYouTube(content);
      default:
        return content;
    }
  }

  private formatForInstagram(content: string): string {
    // Add line breaks for readability on mobile
    return content.replace(/\. /g, '.\n\n');
  }

  private formatForTikTok(content: string): string {
    // Ensure short, punchy sentences
    return content.replace(/([.!?]) /g, '$1\n\n');
  }

  private formatForYouTube(content: string): string {
    // Add timestamps and clear sections
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim() && index % 3 === 0) {
        return `[${Math.floor(index / 3)}:00] ${line}`;
      }
      return line;
    }).join('\n');
  }

  // Placeholder implementations for interface dependencies
  private async getUserById(userId: string): Promise<User> {
    // This would be injected as a repository in real implementation
    throw new Error('User repository not implemented');
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimate
  }

  private addPlatformElements(content: string, platform: PlatformType): string {
    // Add platform-specific elements if missing
    return content;
  }

  private async analyzeContentForSuggestions(script: Script): Promise<GenerationSuggestion[]> {
    // Content analysis logic
    return [];
  }

  private shouldOptimizeForSEO(script: Script): boolean {
    return true; // Simplified logic
  }

  private optimizeForSEO(script: Script): Script {
    return script; // Simplified implementation
  }

  private shouldOptimizeForEngagement(script: Script): boolean {
    return true; // Simplified logic
  }

  private optimizeForEngagement(script: Script): Script {
    return script; // Simplified implementation
  }

  private async generateTemplateSuggestions(script: Script, template: Template): Promise<GenerationSuggestion[]> {
    return []; // Template-specific suggestions
  }

  private buildEnhancementPrompt(script: Script, type: EnhancementType): string {
    return `Enhance this script for ${type}: ${script.content}`;
  }

  private mergeEnhancement(original: string, enhancement: string, type: EnhancementType): string {
    return `${original}\n\n${enhancement}`; // Simplified merge
  }

  private async generateEnhancementSuggestions(script: Script, type: EnhancementType): Promise<GenerationSuggestion[]> {
    return []; // Enhancement-specific suggestions
  }
}

// Supporting interfaces

export interface IAIProvider {
  generateText(request: AIGenerationRequest): Promise<AIGenerationResult>;
}

export interface AIGenerationResult {
  content: string;
  model: string;
  processingTime: number;
  tokensUsed: number;
  confidence: number;
}

export interface IQualityAssessmentService {
  assessScript(script: Script): Promise<QualityAssessmentResult>;
}

export interface QualityAssessmentResult {
  overall: number;
  checks: QualityCheck[];
  readability: number;
  engagement: number;
  seoScore: number;
}

export type EnhancementType = 'hook_improvement' | 'structure_optimization' | 'cta_enhancement' | 'seo_optimization' | 'engagement_boost'; 