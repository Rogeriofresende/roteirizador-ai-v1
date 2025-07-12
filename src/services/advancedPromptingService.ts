/**
 * 🚀 WEEK 7 DAY 2 - ADVANCED PROMPTING SERVICE
 * Dynamic template generation with context awareness and adaptive prompting
 */

import { logger } from '../utils/logger';
import { recordMetric } from './performance';
import { analyticsService } from './analyticsService';

// 🚀 WEEK 7: Advanced Prompt Types
export interface PromptTemplate {
  id: string;
  name: string;
  category: 'script' | 'refinement' | 'analysis' | 'creative' | 'technical';
  platform?: string;
  variables: string[];
  baseTemplate: string;
  adaptiveRules: AdaptiveRule[];
  qualityScore: number;
  usageCount: number;
  successRate: number;
}

export interface AdaptiveRule {
  condition: string;
  action: 'enhance' | 'simplify' | 'focus' | 'expand' | 'restructure';
  modification: string;
  priority: number;
}

export interface PromptContext {
  userLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  contentType: 'educational' | 'entertainment' | 'marketing' | 'informational' | 'promotional';
  audience: string;
  platform: string;
  previousInteractions: number;
  successHistory: number[];
  preferences: Record<string, any>;
}

export interface DynamicPromptRequest {
  category: 'script' | 'refinement' | 'analysis' | 'creative' | 'technical';
  context: PromptContext;
  userInput: string;
  targetOutcome: string;
  constraints?: {
    maxLength?: number;
    tone?: string;
    style?: string;
    format?: string;
  };
  adaptiveMode?: boolean;
}

export interface GeneratedPrompt {
  prompt: string;
  templateId: string;
  adaptations: string[];
  confidence: number;
  expectedQuality: number;
  estimatedResponseTime: number;
  variables: Record<string, string>;
  metadata: {
    generationTime: number;
    rulesApplied: number;
    contextFactors: string[];
  };
}

// 🚀 WEEK 7: Prompt Template Registry
const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'youtube_educational',
    name: 'YouTube Educational Script',
    category: 'script',
    platform: 'youtube',
    variables: ['subject', 'audience', 'duration', 'complexity_level'],
    baseTemplate: `Create an educational YouTube script about {{subject}} for {{audience}}.

Structure (Duration: {{duration}}):
1. HOOK (0-15s): Start with a compelling question or surprising fact
2. PREVIEW (15-30s): What viewers will learn in this video
3. MAIN CONTENT (30s-{{main_duration}}): Break down the topic into digestible segments
4. PRACTICAL APPLICATION ({{practical_start}}-{{practical_end}}): Real-world examples
5. RECAP & CTA ({{recap_start}}-{{duration}}): Summarize key points and encourage engagement

Requirements:
- Use simple, clear language appropriate for {{audience}}
- Include natural pause points for visual aids
- Add subscriber prompts at strategic moments
- Ensure content is {{complexity_level}} level`,
    adaptiveRules: [
      {
        condition: 'audience.includes("children") || audience.includes("kids")',
        action: 'simplify',
        modification: 'Use simpler vocabulary, shorter sentences, and more interactive elements',
        priority: 9
      },
      {
        condition: 'context.userLevel === "beginner"',
        action: 'enhance',
        modification: 'Add more detailed explanations and step-by-step breakdowns',
        priority: 7
      },
      {
        condition: 'duration.includes("short") || duration.includes("under 5")',
        action: 'focus',
        modification: 'Prioritize most important points, remove optional sections',
        priority: 8
      }
    ],
    qualityScore: 0.95,
    usageCount: 0,
    successRate: 0.92
  },
  {
    id: 'instagram_engagement',
    name: 'Instagram High-Engagement Post',
    category: 'script',
    platform: 'instagram',
    variables: ['topic', 'hook_style', 'cta_type', 'hashtag_strategy'],
    baseTemplate: `Create an Instagram post script about {{topic}} designed for maximum engagement.

Structure:
1. HOOK ({{hook_style}} style): {{hook_content}}
2. VALUE CONTENT: Provide genuine value related to {{topic}}
3. PERSONAL TOUCH: Add relatable experience or story
4. ENGAGEMENT QUESTION: Encourage comments and shares
5. HASHTAG STRATEGY: {{hashtag_strategy}} approach
6. CALL-TO-ACTION: {{cta_type}} focused

Format Requirements:
- First line must be scroll-stopping
- Use line breaks for readability
- Include emoji strategically
- Optimize for Instagram's algorithm`,
    adaptiveRules: [
      {
        condition: 'context.contentType === "marketing"',
        action: 'restructure',
        modification: 'Lead with value, soft-sell approach, focus on audience benefit',
        priority: 8
      },
      {
        condition: 'context.previousInteractions < 5',
        action: 'enhance',
        modification: 'Add more context and background information',
        priority: 6
      }
    ],
    qualityScore: 0.88,
    usageCount: 0,
    successRate: 0.85
  },
  {
    id: 'text_refinement_adaptive',
    name: 'Adaptive Text Refinement',
    category: 'refinement',
    variables: ['original_text', 'refinement_goal', 'target_style', 'audience_level'],
    baseTemplate: `Refine the following text to achieve: {{refinement_goal}}

ORIGINAL TEXT:
"{{original_text}}"

REFINEMENT OBJECTIVES:
- Target Style: {{target_style}}
- Audience Level: {{audience_level}}
- Specific Goal: {{refinement_goal}}

REFINEMENT GUIDELINES:
1. Preserve original meaning and intent
2. Adapt language complexity to {{audience_level}} level
3. Apply {{target_style}} style consistently
4. {{specific_instructions}}

REFINED TEXT:`,
    adaptiveRules: [
      {
        condition: 'refinement_goal.includes("clarity")',
        action: 'simplify',
        modification: 'Break complex sentences, use active voice, eliminate jargon',
        priority: 9
      },
      {
        condition: 'target_style.includes("professional")',
        action: 'enhance',
        modification: 'Use formal language, industry terminology, structured format',
        priority: 7
      },
      {
        condition: 'audience_level === "expert"',
        action: 'expand',
        modification: 'Include technical details, advanced concepts, nuanced explanations',
        priority: 6
      }
    ],
    qualityScore: 0.91,
    usageCount: 0,
    successRate: 0.89
  },
  {
    id: 'tiktok_viral_potential',
    name: 'TikTok Viral Optimization',
    category: 'script',
    platform: 'tiktok',
    variables: ['trend_element', 'hook_type', 'engagement_trigger', 'loop_factor'],
    baseTemplate: `Create a TikTok script optimized for viral potential incorporating {{trend_element}}.

VIRAL FORMULA:
1. INSTANT HOOK (0-3s): {{hook_type}} - Must stop the scroll immediately
2. TREND INTEGRATION (3-8s): Incorporate {{trend_element}} naturally
3. VALUE/ENTERTAINMENT (8-20s): Core content that delivers on hook promise
4. ENGAGEMENT TRIGGER (20-25s): {{engagement_trigger}} to drive comments
5. LOOP SETUP (25-30s): {{loop_factor}} to encourage replay

OPTIMIZATION ELEMENTS:
- Text overlay strategy for silent viewing
- Background music/sound recommendations
- Visual transition suggestions
- Hashtag mix: trending + niche + branded`,
    adaptiveRules: [
      {
        condition: 'context.contentType === "educational"',
        action: 'restructure',
        modification: 'Balance entertainment with learning, quick tips format',
        priority: 7
      },
      {
        condition: 'trend_element.includes("dance") || trend_element.includes("music")',
        action: 'enhance',
        modification: 'Add rhythm cues, beat synchronization, movement descriptions',
        priority: 8
      }
    ],
    qualityScore: 0.86,
    usageCount: 0,
    successRate: 0.78
  }
];

class AdvancedPromptingService {
  private templates: Map<string, PromptTemplate> = new Map();
  private contextHistory: Map<string, PromptContext[]> = new Map(); // User context history
  private performanceMetrics = {
    totalPrompts: 0,
    adaptivePrompts: 0,
    avgConfidence: 0,
    avgQuality: 0,
    templateUsage: new Map<string, number>(),
    successfulAdaptations: 0
  };

  constructor() {
    this.initializeTemplates();
    this.startPerformanceTracking();
    
    logger.log('info', 'Advanced Prompting Service initialized', {
      templates: this.templates.size,
      adaptiveRules: this.getTotalAdaptiveRules(),
      categories: this.getTemplateCategories()
    }, 'PROMPTING');
  }

  /**
   * 🚀 WEEK 7: Generate dynamic prompt with context adaptation
   */
  async generateDynamicPrompt(request: DynamicPromptRequest): Promise<GeneratedPrompt> {
    const startTime = performance.now();
    this.performanceMetrics.totalPrompts++;

    try {
      // Select optimal template
      const template = this.selectOptimalTemplate(request);
      if (!template) {
        throw new Error(`No template found for category: ${request.category}`);
      }

      // Extract variables from user input
      const variables = this.extractVariables(template, request);

      // Apply adaptive rules if enabled
      let adaptedTemplate = template.baseTemplate;
      const adaptations: string[] = [];

      if (request.adaptiveMode !== false) {
        this.performanceMetrics.adaptivePrompts++;
        
        const { adapted, appliedAdaptations } = this.applyAdaptiveRules(
          template,
          request.context,
          variables
        );
        adaptedTemplate = adapted;
        adaptations.push(...appliedAdaptations);
      }

      // Substitute variables in template
      const finalPrompt = this.substituteVariables(adaptedTemplate, variables);

      // Calculate quality and confidence scores
      const confidence = this.calculateConfidence(template, adaptations, request.context);
      const expectedQuality = this.estimateQuality(template, request.context, adaptations);
      const estimatedResponseTime = this.estimateResponseTime(finalPrompt.length, request.context);

      const generationTime = performance.now() - startTime;

      // Update template usage statistics
      template.usageCount++;
      this.performanceMetrics.templateUsage.set(template.id, template.usageCount);

      // Store context for learning
      this.updateContextHistory(request.context);

      const result: GeneratedPrompt = {
        prompt: finalPrompt,
        templateId: template.id,
        adaptations,
        confidence,
        expectedQuality,
        estimatedResponseTime,
        variables,
        metadata: {
          generationTime,
          rulesApplied: adaptations.length,
          contextFactors: this.analyzeContextFactors(request.context)
        }
      };

      // Track metrics
      this.updateMetrics(confidence, expectedQuality);
      
      // Analytics
      analyticsService.trackEvent('dynamic_prompt_generated', {
        templateId: template.id,
        category: request.category,
        adaptations: adaptations.length,
        confidence,
        generationTime
      });

      recordMetric('prompt_generation_time', generationTime, 'ms', 'ai_optimization');
      recordMetric('prompt_confidence', confidence, 'score', 'ai_optimization');

      logger.log('debug', 'Dynamic prompt generated', {
        templateId: template.id,
        adaptations: adaptations.length,
        confidence,
        promptLength: finalPrompt.length
      }, 'PROMPTING');

      return result;

    } catch (error) {
      logger.log('error', 'Dynamic prompt generation failed', {
        category: request.category,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'PROMPTING');

      recordMetric('prompt_generation_failure', 1, 'count', 'ai_optimization');
      throw error;
    }
  }

  /**
   * 🚀 WEEK 7: Select optimal template based on request and context
   */
  private selectOptimalTemplate(request: DynamicPromptRequest): PromptTemplate | null {
    const candidates = Array.from(this.templates.values())
      .filter(t => t.category === request.category)
      .filter(t => !t.platform || t.platform === request.context.platform);

    if (candidates.length === 0) {
      return null;
    }

    // Score templates based on context and performance
    const scored = candidates.map(template => {
      let score = template.qualityScore * 0.4; // Base quality (40%)
      score += template.successRate * 0.3; // Historical success (30%)
      score += this.calculateContextMatch(template, request.context) * 0.2; // Context fit (20%)
      score += (1 / (template.usageCount + 1)) * 0.1; // Diversity bonus (10%)

      return { template, score };
    });

    // Sort by score and return best match
    scored.sort((a, b) => b.score - a.score);
    return scored[0].template;
  }

  /**
   * 🚀 WEEK 7: Apply adaptive rules based on context
   */
  private applyAdaptiveRules(
    template: PromptTemplate,
    context: PromptContext,
    variables: Record<string, string>
  ): { adapted: string; appliedAdaptations: string[] } {
    let adaptedTemplate = template.baseTemplate;
    const appliedAdaptations: string[] = [];

    // Sort rules by priority (highest first)
    const sortedRules = template.adaptiveRules
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.evaluateCondition(rule.condition, context, variables)) {
        adaptedTemplate = this.applyModification(adaptedTemplate, rule);
        appliedAdaptations.push(`${rule.action}: ${rule.modification}`);
        this.performanceMetrics.successfulAdaptations++;
      }
    }

    return { adapted: adaptedTemplate, appliedAdaptations };
  }

  /**
   * 🚀 WEEK 7: Extract variables from user input and context
   */
  private extractVariables(template: PromptTemplate, request: DynamicPromptRequest): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Basic extraction from user input
    variables.subject = request.userInput;
    variables.audience = request.context.audience;
    variables.platform = request.context.platform;

    // Platform-specific variables
    if (template.platform === 'youtube') {
      variables.duration = this.extractDuration(request.userInput) || '10 minutes';
      variables.complexity_level = this.mapUserLevelToComplexity(request.context.userLevel);
      variables.main_duration = this.calculateMainDuration(variables.duration);
      variables.practical_start = this.calculateTimepoint(variables.duration, 0.6);
      variables.practical_end = this.calculateTimepoint(variables.duration, 0.8);
      variables.recap_start = this.calculateTimepoint(variables.duration, 0.9);
    }

    if (template.platform === 'instagram') {
      variables.topic = request.userInput;
      variables.hook_style = this.selectHookStyle(request.context);
      variables.cta_type = this.selectCTAType(request.context.contentType);
      variables.hashtag_strategy = this.selectHashtagStrategy(request.context);
      variables.hook_content = this.generateHookContent(variables.topic, variables.hook_style);
    }

    if (template.platform === 'tiktok') {
      variables.trend_element = this.identifyTrendElement(request.userInput);
      variables.hook_type = this.selectTikTokHook(request.context);
      variables.engagement_trigger = this.selectEngagementTrigger(request.context);
      variables.loop_factor = this.selectLoopFactor(request.context);
    }

    // Refinement-specific variables
    if (template.category === 'refinement') {
      variables.original_text = request.userInput;
      variables.refinement_goal = request.targetOutcome;
      variables.target_style = request.constraints?.style || 'professional';
      variables.audience_level = request.context.userLevel;
      variables.specific_instructions = this.generateSpecificInstructions(request);
    }

    return variables;
  }

  /**
   * 🚀 WEEK 7: Substitute variables in template with intelligent fallbacks
   */
  private substituteVariables(template: string, variables: Record<string, string>): string {
    let result = template;

    // Replace all {{variable}} patterns
    result = result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      if (variables[varName]) {
        return variables[varName];
      }
      
      // Intelligent fallbacks
      const fallback = this.getVariableFallback(varName);
      logger.log('warn', `Variable ${varName} not found, using fallback: ${fallback}`, {}, 'PROMPTING');
      return fallback;
    });

    return result;
  }

  /**
   * 🚀 WEEK 7: Helper methods for variable extraction and adaptation
   */
  private extractDuration(input: string): string | null {
    const durationPatterns = [
      /(\d+)\s*min/i,
      /(\d+)\s*minute/i,
      /(\d+)\s*second/i,
      /short/i,
      /long/i,
      /quick/i
    ];

    for (const pattern of durationPatterns) {
      const match = input.match(pattern);
      if (match) {
        if (match[1]) {
          return `${match[1]} minutes`;
        }
        return match[0].toLowerCase().includes('short') || match[0].toLowerCase().includes('quick') 
          ? '5 minutes' 
          : '15 minutes';
      }
    }

    return null;
  }

  private mapUserLevelToComplexity(level: string): string {
    const mapping = {
      'beginner': 'basic',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'expert': 'expert'
    };
    return mapping[level as keyof typeof mapping] || 'intermediate';
  }

  private calculateMainDuration(duration: string): string {
    const minutes = parseInt(duration) || 10;
    const mainStart = Math.round(minutes * 0.25 * 60); // 25% into video
    const mainEnd = Math.round(minutes * 0.75 * 60);   // 75% into video
    return `${mainStart}s-${mainEnd}s`;
  }

  private calculateTimepoint(duration: string, percentage: number): string {
    const minutes = parseInt(duration) || 10;
    const seconds = Math.round(minutes * 60 * percentage);
    return `${seconds}s`;
  }

  private selectHookStyle(context: PromptContext): string {
    const styles = {
      'educational': 'question-based',
      'entertainment': 'curiosity-gap',
      'marketing': 'benefit-focused',
      'informational': 'surprising-fact',
      'promotional': 'urgency-driven'
    };
    return styles[context.contentType] || 'question-based';
  }

  private selectCTAType(contentType: string): string {
    const ctas = {
      'educational': 'save-and-share',
      'entertainment': 'engagement',
      'marketing': 'conversion',
      'informational': 'save-for-later',
      'promotional': 'action-oriented'
    };
    return ctas[contentType] || 'engagement';
  }

  private selectHashtagStrategy(context: PromptContext): string {
    return context.userLevel === 'beginner' ? 'broad-reach' : 'niche-targeted';
  }

  private generateHookContent(topic: string, style: string): string {
    const hooks = {
      'question-based': `What if I told you that ${topic} could change everything?`,
      'curiosity-gap': `The one thing about ${topic} that nobody talks about...`,
      'benefit-focused': `How ${topic} can transform your results in 30 days`,
      'surprising-fact': `Here's what shocked me about ${topic}...`,
      'urgency-driven': `Don't make this ${topic} mistake (it's costly!)`
    };
    return hooks[style as keyof typeof hooks] || hooks['question-based'];
  }

  private identifyTrendElement(input: string): string {
    // Simple trend identification - in production, this would use trend APIs
    const trends = ['trending sound', 'viral dance', 'popular filter', 'meme format', 'challenge'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private selectTikTokHook(context: PromptContext): string {
    const hooks = ['POV', 'Watch this', 'This or that', 'Quick tip', 'Behind the scenes'];
    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  private selectEngagementTrigger(context: PromptContext): string {
    const triggers = ['Comment your answer', 'Share if you agree', 'Tag someone who needs this', 'What would you do?'];
    return triggers[Math.floor(Math.random() * triggers.length)];
  }

  private selectLoopFactor(context: PromptContext): string {
    const factors = ['End where you started', 'Teaser for part 2', 'Quick recap', 'Unexpected twist'];
    return factors[Math.floor(Math.random() * factors.length)];
  }

  private generateSpecificInstructions(request: DynamicPromptRequest): string {
    const instructions = [];
    
    if (request.constraints?.maxLength) {
      instructions.push(`Keep under ${request.constraints.maxLength} characters`);
    }
    
    if (request.constraints?.tone) {
      instructions.push(`Maintain ${request.constraints.tone} tone throughout`);
    }
    
    if (request.constraints?.format) {
      instructions.push(`Format as ${request.constraints.format}`);
    }

    return instructions.join(', ') || 'Follow standard refinement practices';
  }

  private getVariableFallback(varName: string): string {
    const fallbacks: Record<string, string> = {
      'subject': 'the topic',
      'audience': 'general audience',
      'platform': 'social media',
      'duration': '10 minutes',
      'tone': 'professional',
      'style': 'clear and engaging',
      'topic': 'your content',
      'hook_style': 'question-based',
      'cta_type': 'engagement'
    };
    return fallbacks[varName] || `[${varName}]`;
  }

  /**
   * 🚀 WEEK 7: Condition evaluation and modification application
   */
  private evaluateCondition(
    condition: string, 
    context: PromptContext, 
    variables: Record<string, string>
  ): boolean {
    try {
      // Simple condition evaluation - in production, use a safe expression evaluator
      const contextString = JSON.stringify({ context, variables });
      
      // Check for common patterns
      if (condition.includes('userLevel')) {
        return condition.includes(context.userLevel);
      }
      
      if (condition.includes('contentType')) {
        return condition.includes(context.contentType);
      }
      
      if (condition.includes('audience')) {
        const audienceLower = context.audience.toLowerCase();
        return condition.toLowerCase().split('"').some(part => audienceLower.includes(part));
      }

      // Variable checks
      for (const [key, value] of Object.entries(variables)) {
        if (condition.includes(key) && condition.includes(value.toLowerCase())) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.log('warn', 'Condition evaluation failed', { condition, error }, 'PROMPTING');
      return false;
    }
  }

  private applyModification(template: string, rule: AdaptiveRule): string {
    // Apply modification based on action type
    switch (rule.action) {
      case 'enhance':
        return this.enhanceTemplate(template, rule.modification);
      case 'simplify':
        return this.simplifyTemplate(template, rule.modification);
      case 'focus':
        return this.focusTemplate(template, rule.modification);
      case 'expand':
        return this.expandTemplate(template, rule.modification);
      case 'restructure':
        return this.restructureTemplate(template, rule.modification);
      default:
        return template;
    }
  }

  private enhanceTemplate(template: string, modification: string): string {
    return template + `\n\nADDITIONAL ENHANCEMENT:\n${modification}`;
  }

  private simplifyTemplate(template: string, modification: string): string {
    return template + `\n\nSIMPLIFICATION NOTE:\n${modification}`;
  }

  private focusTemplate(template: string, modification: string): string {
    return template + `\n\nFOCUS ADJUSTMENT:\n${modification}`;
  }

  private expandTemplate(template: string, modification: string): string {
    return template + `\n\nEXPANSION GUIDANCE:\n${modification}`;
  }

  private restructureTemplate(template: string, modification: string): string {
    return template + `\n\nSTRUCTURE MODIFICATION:\n${modification}`;
  }

  /**
   * 🚀 WEEK 7: Quality and confidence calculation
   */
  private calculateConfidence(
    template: PromptTemplate, 
    adaptations: string[], 
    context: PromptContext
  ): number {
    let confidence = template.qualityScore * 0.6; // Base from template quality
    confidence += template.successRate * 0.2;    // Historical success
    confidence += Math.min(0.1, adaptations.length * 0.02); // Adaptation bonus
    confidence += this.calculateContextMatch(template, context) * 0.1; // Context fit

    return Math.min(1, Math.max(0, confidence));
  }

  private estimateQuality(
    template: PromptTemplate, 
    context: PromptContext, 
    adaptations: string[]
  ): number {
    let quality = template.qualityScore;
    
    // Boost for good context match
    quality += this.calculateContextMatch(template, context) * 0.1;
    
    // Boost for adaptations
    quality += Math.min(0.1, adaptations.length * 0.03);
    
    // User experience factor
    if (context.previousInteractions > 5) {
      quality += 0.05; // Experienced users get better prompts
    }

    return Math.min(1, Math.max(0, quality));
  }

  private estimateResponseTime(promptLength: number, context: PromptContext): number {
    // Base time estimation (ms)
    let baseTime = 1000 + (promptLength * 2); // 1s base + 2ms per character
    
    // Complexity adjustments
    if (context.userLevel === 'expert') baseTime *= 1.2; // More complex requests
    if (context.contentType === 'technical') baseTime *= 1.3;
    
    return Math.round(baseTime);
  }

  private calculateContextMatch(template: PromptTemplate, context: PromptContext): number {
    let match = 0.5; // Base match
    
    // Platform match
    if (template.platform === context.platform) match += 0.3;
    else if (!template.platform) match += 0.1; // Generic template partial match
    
    // Content type considerations
    if (template.category === 'script' && ['educational', 'entertainment'].includes(context.contentType)) {
      match += 0.2;
    }
    
    return Math.min(1, match);
  }

  /**
   * 🚀 WEEK 7: Context and performance management
   */
  private updateContextHistory(context: PromptContext): void {
    const userId = 'current_user'; // In production, get from auth
    const history = this.contextHistory.get(userId) || [];
    
    history.push({
      ...context,
      timestamp: Date.now()
    } as any);
    
    // Keep only last 20 interactions
    if (history.length > 20) {
      history.shift();
    }
    
    this.contextHistory.set(userId, history);
  }

  private analyzeContextFactors(context: PromptContext): string[] {
    const factors = [];
    
    factors.push(`user_level:${context.userLevel}`);
    factors.push(`content_type:${context.contentType}`);
    factors.push(`platform:${context.platform}`);
    
    if (context.previousInteractions > 10) factors.push('experienced_user');
    if (context.successHistory.length > 0) {
      const avgSuccess = context.successHistory.reduce((a, b) => a + b, 0) / context.successHistory.length;
      if (avgSuccess > 0.8) factors.push('high_success_user');
    }
    
    return factors;
  }

  private updateMetrics(confidence: number, quality: number): void {
    const alpha = 0.2;
    this.performanceMetrics.avgConfidence = 
      this.performanceMetrics.avgConfidence * (1 - alpha) + confidence * alpha;
    this.performanceMetrics.avgQuality = 
      this.performanceMetrics.avgQuality * (1 - alpha) + quality * alpha;
  }

  /**
   * 🚀 WEEK 7: Service management methods
   */
  private initializeTemplates(): void {
    PROMPT_TEMPLATES.forEach(template => {
      this.templates.set(template.id, { ...template });
    });
  }

  private getTotalAdaptiveRules(): number {
    return Array.from(this.templates.values())
      .reduce((total, template) => total + template.adaptiveRules.length, 0);
  }

  private getTemplateCategories(): string[] {
    return [...new Set(Array.from(this.templates.values()).map(t => t.category))];
  }

  private startPerformanceTracking(): void {
    setInterval(() => {
      const metrics = this.getMetrics();
      
      recordMetric('prompting_avg_confidence', metrics.avgConfidence, 'score', 'ai_optimization');
      recordMetric('prompting_avg_quality', metrics.avgQuality, 'score', 'ai_optimization');
      recordMetric('prompting_adaptation_rate', metrics.adaptationRate, 'percent', 'ai_optimization');
      
      logger.log('debug', 'Prompting metrics updated', metrics, 'PROMPTING');
    }, 60000); // Every minute
  }

  /**
   * 🚀 WEEK 7: Public API methods
   */
  getMetrics() {
    const adaptationRate = this.performanceMetrics.totalPrompts > 0
      ? (this.performanceMetrics.adaptivePrompts / this.performanceMetrics.totalPrompts) * 100
      : 0;

    return {
      ...this.performanceMetrics,
      adaptationRate: Math.round(adaptationRate * 100) / 100,
      templateCount: this.templates.size,
      totalAdaptiveRules: this.getTotalAdaptiveRules()
    };
  }

  getTemplateAnalytics() {
    const templates = Array.from(this.templates.values());
    
    return {
      totalTemplates: templates.length,
      categoriesCovered: this.getTemplateCategories(),
      avgQualityScore: templates.reduce((sum, t) => sum + t.qualityScore, 0) / templates.length,
      avgSuccessRate: templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length,
      mostUsed: templates.sort((a, b) => b.usageCount - a.usageCount).slice(0, 3),
      leastUsed: templates.sort((a, b) => a.usageCount - b.usageCount).slice(0, 3)
    };
  }

  addCustomTemplate(template: Omit<PromptTemplate, 'usageCount' | 'successRate'>): void {
    const newTemplate: PromptTemplate = {
      ...template,
      usageCount: 0,
      successRate: 0.5 // Default starting success rate
    };
    
    this.templates.set(template.id, newTemplate);
    
    logger.log('info', 'Custom template added', { templateId: template.id }, 'PROMPTING');
  }

  removeTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    
    if (deleted) {
      logger.log('info', 'Template removed', { templateId }, 'PROMPTING');
    }
    
    return deleted;
  }

  updateTemplateSuccess(templateId: string, success: boolean): void {
    const template = this.templates.get(templateId);
    if (template) {
      const alpha = 0.1; // Learning rate
      template.successRate = template.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;
      
      logger.log('debug', 'Template success rate updated', {
        templateId,
        newSuccessRate: template.successRate
      }, 'PROMPTING');
    }
  }
}

// 🚀 WEEK 7: Export service instance
export const advancedPromptingService = new AdvancedPromptingService(); 