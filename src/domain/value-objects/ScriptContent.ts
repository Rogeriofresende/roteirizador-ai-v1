/**
 * ScriptContent Value Object - Domain Layer
 * Roteirar IA - Clean Architecture Implementation
 */

import { PlatformType } from '../entities/Script';

export interface ScriptContentProps {
  content: string;
  platform: PlatformType;
  language: string;
  encoding: string;
}

/**
 * ScriptContent Value Object - Immutable script content with validation
 */
export class ScriptContent {
  private constructor(private readonly props: ScriptContentProps) {
    this.validate();
  }

  static create(params: {
    content: string;
    platform: PlatformType;
    language?: string;
    encoding?: string;
  }): ScriptContent {
    return new ScriptContent({
      content: params.content,
      platform: params.platform,
      language: params.language || 'pt-BR',
      encoding: params.encoding || 'UTF-8',
    });
  }

  // Getters
  get content(): string {
    return this.props.content;
  }

  get platform(): PlatformType {
    return this.props.platform;
  }

  get language(): string {
    return this.props.language;
  }

  get encoding(): string {
    return this.props.encoding;
  }

  // Domain methods

  /**
   * Get word count
   */
  getWordCount(): number {
    return this.props.content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  /**
   * Get character count (excluding whitespace)
   */
  getCharacterCount(): number {
    return this.props.content.replace(/\s/g, '').length;
  }

  /**
   * Get line count
   */
  getLineCount(): number {
    return this.props.content.split('\n').length;
  }

  /**
   * Get estimated reading time in seconds
   */
  getEstimatedReadingTime(): number {
    const wordCount = this.getWordCount();
    const wordsPerMinute = this.getWordsPerMinuteForPlatform();
    return Math.ceil((wordCount / wordsPerMinute) * 60);
  }

  /**
   * Get content sections
   */
  getSections(): ScriptSection[] {
    const lines = this.props.content.split('\n');
    const sections: ScriptSection[] = [];
    let currentSection: ScriptSection | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if it's a header (starts with # or is all caps and short)
      if (this.isHeader(trimmedLine)) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: trimmedLine.replace(/^#+\s*/, '').replace(/:/g, ''),
          content: '',
          lineStart: sections.reduce((acc, s) => acc + s.content.split('\n').length, 0) + sections.length,
          wordCount: 0,
        };
      } else if (currentSection && trimmedLine) {
        // Add to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      } else if (!currentSection && trimmedLine) {
        // Create default section if no header found
        currentSection = {
          title: 'Conteúdo Principal',
          content: line,
          lineStart: 0,
          wordCount: 0,
        };
      }
    }

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // Calculate word counts
    sections.forEach(section => {
      section.wordCount = section.content
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;
    });

    return sections;
  }

  /**
   * Check if content is valid for platform
   */
  isValidForPlatform(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const wordCount = this.getWordCount();
    const readingTime = this.getEstimatedReadingTime();
    const constraints = this.getPlatformConstraints();

    // Check length constraints
    if (wordCount < constraints.minWords) {
      errors.push(`Content is too short for ${this.props.platform} (${wordCount} words < ${constraints.minWords} words)`);
      suggestions.push('Add more content to meet platform requirements');
    }

    if (wordCount > constraints.maxWords) {
      if (constraints.strictMaxWords) {
        errors.push(`Content exceeds ${this.props.platform} limit (${wordCount} words > ${constraints.maxWords} words)`);
      } else {
        warnings.push(`Content might be too long for optimal engagement (${wordCount} words > ${constraints.maxWords} words)`);
      }
      suggestions.push('Consider splitting content or focusing on key points');
    }

    // Check reading time
    if (readingTime > constraints.maxDuration) {
      warnings.push(`Content might be too long for ${this.props.platform} (${readingTime}s > ${constraints.maxDuration}s)`);
      suggestions.push('Consider reducing content length for better retention');
    }

    // Platform-specific validations
    const platformSpecificResult = this.validatePlatformSpecific();
    errors.push(...platformSpecificResult.errors);
    warnings.push(...platformSpecificResult.warnings);
    suggestions.push(...platformSpecificResult.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(): string[] {
    const words = this.props.content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Remove common stop words
    const stopWords = new Set([
      'que', 'para', 'com', 'por', 'uma', 'dos', 'das', 'como', 'mais', 'mas',
      'foi', 'ser', 'tem', 'são', 'não', 'sua', 'seu', 'ela', 'ele', 'isso',
      'este', 'esta', 'quando', 'onde', 'sobre', 'depois', 'antes', 'muito',
      'pode', 'fazer', 'estar', 'cada', 'todo', 'todos', 'algumas', 'alguns'
    ]);

    const filteredWords = words.filter(word => !stopWords.has(word));

    // Count word frequency
    const wordCount: Record<string, number> = {};
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top 10 most frequent words
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Get content preview (first N words)
   */
  getPreview(wordLimit: number = 50): string {
    const words = this.props.content.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return this.props.content;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
  }

  /**
   * Check if content contains sensitive information
   */
  hasSensitiveContent(): SensitiveContentCheck {
    const sensitivePatterns = [
      // Email patterns
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      // Phone patterns (Brazilian)
      /\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}/g,
      // CPF patterns
      /[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}/g,
      // Credit card patterns
      /[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}/g,
    ];

    const findings: SensitiveContentFinding[] = [];

    sensitivePatterns.forEach((pattern, index) => {
      const matches = this.props.content.match(pattern);
      if (matches) {
        const type = ['email', 'phone', 'cpf', 'credit_card'][index] as SensitiveContentType;
        matches.forEach(match => {
          findings.push({
            type,
            content: match,
            position: this.props.content.indexOf(match),
          });
        });
      }
    });

    return {
      hasSensitiveContent: findings.length > 0,
      findings,
      recommendation: findings.length > 0 ? 'Remove sensitive information before sharing' : 'No sensitive content detected',
    };
  }

  /**
   * Equals comparison
   */
  equals(other: ScriptContent): boolean {
    return (
      this.props.content === other.props.content &&
      this.props.platform === other.props.platform &&
      this.props.language === other.props.language &&
      this.props.encoding === other.props.encoding
    );
  }

  /**
   * Create copy with updated content
   */
  withContent(newContent: string): ScriptContent {
    return new ScriptContent({
      ...this.props,
      content: newContent,
    });
  }

  /**
   * Create copy for different platform
   */
  forPlatform(platform: PlatformType): ScriptContent {
    return new ScriptContent({
      ...this.props,
      platform,
    });
  }

  // Private methods

  private validate(): void {
    if (typeof this.props.content !== 'string') {
      throw new Error('Content must be a string');
    }

    if (!this.props.platform) {
      throw new Error('Platform is required');
    }

    if (!this.props.language) {
      throw new Error('Language is required');
    }

    if (!this.props.encoding) {
      throw new Error('Encoding is required');
    }
  }

  private isHeader(line: string): boolean {
    // Markdown headers
    if (line.startsWith('#')) {
      return true;
    }

    // All caps headers (max 50 chars)
    if (line === line.toUpperCase() && line.length <= 50 && line.length > 0) {
      return true;
    }

    // Headers with colons
    if (line.endsWith(':') && line.length <= 50) {
      return true;
    }

    return false;
  }

  private getWordsPerMinuteForPlatform(): number {
    switch (this.props.platform) {
      case 'TikTok':
      case 'Instagram':
        return 180; // Faster for short-form content
      case 'Podcast':
        return 130; // Slower for conversational content
      case 'LinkedIn':
        return 140; // Professional, slightly slower
      case 'YouTube':
      default:
        return 150; // Standard speaking rate
    }
  }

  private getPlatformConstraints(): PlatformConstraints {
    switch (this.props.platform) {
      case 'TikTok':
        return {
          minWords: 10,
          maxWords: 150,
          maxDuration: 180,
          strictMaxWords: false,
        };
      case 'Instagram':
        return {
          minWords: 10,
          maxWords: 100,
          maxDuration: 60,
          strictMaxWords: false,
        };
      case 'YouTube':
        return {
          minWords: 100,
          maxWords: 3000,
          maxDuration: 3600,
          strictMaxWords: false,
        };
      case 'LinkedIn':
        return {
          minWords: 50,
          maxWords: 1000,
          maxDuration: 600,
          strictMaxWords: false,
        };
      case 'Podcast':
        return {
          minWords: 500,
          maxWords: 5000,
          maxDuration: 7200,
          strictMaxWords: false,
        };
      default:
        return {
          minWords: 50,
          maxWords: 1000,
          maxDuration: 600,
          strictMaxWords: false,
        };
    }
  }

  private validatePlatformSpecific(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    switch (this.props.platform) {
      case 'TikTok':
        if (!this.hasHook()) {
          warnings.push('TikTok content should start with an engaging hook');
          suggestions.push('Add an attention-grabbing opening line');
        }
        break;

      case 'Instagram':
        if (!this.hasHashtags()) {
          suggestions.push('Consider adding relevant hashtags for Instagram');
        }
        break;

      case 'YouTube': {
        const sections = this.getSections();
        if (sections.length < 3) {
          suggestions.push('YouTube videos benefit from clear structure (intro, main content, conclusion)');
        }
        break;
      }

      case 'LinkedIn':
        if (!this.isProfessionalTone()) {
          warnings.push('LinkedIn content should maintain a professional tone');
        }
        break;
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  private hasHook(): boolean {
    const firstLine = this.props.content.split('\n')[0]?.trim() || '';
    const hookWords = ['você', 'sabia', 'imagine', 'atenção', 'incrível', 'urgente', 'revelado'];
    return hookWords.some(word => firstLine.toLowerCase().includes(word));
  }

  private hasHashtags(): boolean {
    return this.props.content.includes('#');
  }

  private isProfessionalTone(): boolean {
    const casualWords = ['cara', 'mano', 'galera', 'pessoal', 'gente'];
    const content = this.props.content.toLowerCase();
    return !casualWords.some(word => content.includes(word));
  }
}

// Supporting types

export interface ScriptSection {
  title: string;
  content: string;
  lineStart: number;
  wordCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PlatformConstraints {
  minWords: number;
  maxWords: number;
  maxDuration: number;
  strictMaxWords: boolean;
}

export interface SensitiveContentCheck {
  hasSensitiveContent: boolean;
  findings: SensitiveContentFinding[];
  recommendation: string;
}

export interface SensitiveContentFinding {
  type: SensitiveContentType;
  content: string;
  position: number;
}

export type SensitiveContentType = 'email' | 'phone' | 'cpf' | 'credit_card'; 