/**
 * SMART CATEGORIZATION SERVICE - SPRINT 5
 * Intelligent categorization with machine learning algorithms
 * V7.5 Enhanced - IA Alpha Implementation
 */

// Types and Interfaces
export interface CategoryPrediction {
  category: string;
  confidence: number;
  subcategories: string[];
  reasoning: string;
  metadata: {
    keywordMatches: string[];
    contextualClues: string[];
    semanticSimilarity: number;
    userHistoryWeight: number;
  };
}

export interface CategoryModel {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  patterns: RegExp[];
  semanticVectors: number[];
  subcategories: string[];
  examples: string[];
  weight: number;
}

export interface TrainingData {
  content: string;
  category: string;
  subcategory?: string;
  confidence: number;
  userFeedback?: 'positive' | 'negative';
}

export interface UserFeedback {
  contentId: string;
  predictedCategory: string;
  actualCategory: string;
  feedback: 'correct' | 'incorrect' | 'partially_correct';
  timestamp: Date;
}

// Smart Categorization Service Implementation
export class SmartCategorizationService {
  private models: Map<string, CategoryModel> = new Map();
  private trainingData: TrainingData[] = [];
  private userFeedback: UserFeedback[] = [];
  private categoryPerformance: Map<string, number> = new Map();
  private semanticCache: Map<string, number[]> = new Map();

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize categorization service
   */
  private initializeService(): void {
    this.loadFromStorage();
    this.initializeDefaultModels();
    this.calculateModelPerformance();
  }

  /**
   * Predict category for content
   */
  public async predictCategory(content: string, userId?: string): Promise<CategoryPrediction[]> {
    // Preprocess content
    const processedContent = this.preprocessContent(content);
    
    // Get semantic vector for content
    const contentVector = this.getSemanticVector(processedContent);
    
    // Calculate predictions for each model
    const predictions: CategoryPrediction[] = [];
    
    for (const [categoryId, model] of this.models) {
      const prediction = this.calculateCategoryPrediction(
        processedContent,
        contentVector,
        model,
        userId
      );
      
      if (prediction.confidence > 0.1) { // Only include predictions with reasonable confidence
        predictions.push(prediction);
      }
    }

    // Sort by confidence and return top predictions
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Train model with new data
   */
  public async trainModel(trainingData: TrainingData[]): Promise<void> {
    this.trainingData.push(...trainingData);
    
    // Update models based on new training data
    trainingData.forEach(data => {
      this.updateModelWithTrainingData(data);
    });
    
    // Recalculate performance metrics
    this.calculateModelPerformance();
    
    // Save updated models
    this.saveToStorage();
    
    console.log(`🧠 Model trained with ${trainingData.length} new samples`);
  }

  /**
   * Process user feedback to improve predictions
   */
  public async processFeedback(feedback: UserFeedback): Promise<void> {
    this.userFeedback.push(feedback);
    
    // Update model weights based on feedback
    this.updateModelWeights(feedback);
    
    // Adjust category performance metrics
    this.adjustCategoryPerformance(feedback);
    
    // Save feedback
    this.saveToStorage();
    
    console.log(`📊 Processed feedback for category: ${feedback.predictedCategory}`);
  }

  /**
   * Get category suggestions based on partial input
   */
  public async getSuggestions(partialContent: string): Promise<string[]> {
    if (partialContent.length < 3) return [];
    
    const predictions = await this.predictCategory(partialContent);
    
    return predictions
      .filter(p => p.confidence > 0.3)
      .map(p => p.category)
      .slice(0, 3);
  }

  /**
   * Get category analytics
   */
  public getCategoryAnalytics(): {
    totalCategories: number;
    performance: Record<string, number>;
    mostUsed: string[];
    accuracy: number;
  } {
    const performance: Record<string, number> = {};
    this.categoryPerformance.forEach((value, key) => {
      performance[key] = value;
    });
    
    const mostUsed = Array.from(this.categoryPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([category]) => category);
    
    const accuracy = this.calculateOverallAccuracy();
    
    return {
      totalCategories: this.models.size,
      performance,
      mostUsed,
      accuracy
    };
  }

  /**
   * Initialize default category models
   */
  private initializeDefaultModels(): void {
    const defaultModels: CategoryModel[] = [
      {
        id: 'educacao',
        name: 'Educação',
        description: 'Conteúdo educacional, tutoriais e guias',
        keywords: ['tutorial', 'guia', 'aprender', 'ensinar', 'explicar', 'passo a passo', 'como fazer'],
        patterns: [/como\s+fazer/gi, /tutorial/gi, /guia/gi, /aprender/gi],
        semanticVectors: [0.8, 0.9, 0.7, 0.6, 0.8],
        subcategories: ['tutorial', 'guia', 'explicativo', 'passo-a-passo'],
        examples: ['Como fazer um bolo', 'Tutorial de programação', 'Guia completo de marketing'],
        weight: 1.0
      },
      {
        id: 'entretenimento',
        name: 'Entretenimento',
        description: 'Conteúdo de entretenimento, humor e diversão',
        keywords: ['diversão', 'humor', 'engraçado', 'viral', 'meme', 'comédia', 'entretenimento'],
        patterns: [/humor/gi, /engraçado/gi, /diversão/gi, /viral/gi],
        semanticVectors: [0.9, 0.7, 0.8, 0.9, 0.6],
        subcategories: ['humor', 'viral', 'comédia', 'meme'],
        examples: ['Vídeo engraçado', 'Meme viral', 'Comédia stand-up'],
        weight: 1.0
      },
      {
        id: 'tecnologia',
        name: 'Tecnologia',
        description: 'Conteúdo sobre tecnologia, inovação e digital',
        keywords: ['tecnologia', 'tech', 'digital', 'inovação', 'app', 'software', 'ia', 'artificial'],
        patterns: [/tecnologia/gi, /tech/gi, /digital/gi, /app/gi, /software/gi],
        semanticVectors: [0.7, 0.8, 0.9, 0.8, 0.9],
        subcategories: ['software', 'hardware', 'ia', 'apps', 'inovação'],
        examples: ['Nova tecnologia IA', 'Review de smartphone', 'Desenvolvimento de app'],
        weight: 1.0
      },
      {
        id: 'lifestyle',
        name: 'Estilo de Vida',
        description: 'Conteúdo sobre estilo de vida, rotina e bem-estar',
        keywords: ['lifestyle', 'vida', 'rotina', 'hábitos', 'bem-estar', 'saúde', 'fitness'],
        patterns: [/lifestyle/gi, /rotina/gi, /hábitos/gi, /bem-estar/gi],
        semanticVectors: [0.8, 0.6, 0.7, 0.9, 0.8],
        subcategories: ['rotina', 'hábitos', 'bem-estar', 'saúde', 'fitness'],
        examples: ['Rotina matinal', 'Hábitos saudáveis', 'Dicas de bem-estar'],
        weight: 1.0
      },
      {
        id: 'negocios',
        name: 'Negócios',
        description: 'Conteúdo sobre negócios, empreendedorismo e carreira',
        keywords: ['negócios', 'empreendedorismo', 'carreira', 'vendas', 'marketing', 'estratégia'],
        patterns: [/negócios/gi, /empreendedorismo/gi, /carreira/gi, /vendas/gi],
        semanticVectors: [0.6, 0.8, 0.7, 0.8, 0.9],
        subcategories: ['empreendedorismo', 'vendas', 'marketing', 'carreira', 'estratégia'],
        examples: ['Estratégias de vendas', 'Dicas de empreendedorismo', 'Crescimento profissional'],
        weight: 1.0
      },
      {
        id: 'viagem',
        name: 'Viagem',
        description: 'Conteúdo sobre viagens, turismo e destinos',
        keywords: ['viagem', 'turismo', 'destino', 'hotel', 'viajar', 'trip', 'travel'],
        patterns: [/viagem/gi, /turismo/gi, /destino/gi, /viajar/gi],
        semanticVectors: [0.9, 0.7, 0.6, 0.8, 0.7],
        subcategories: ['destinos', 'dicas', 'hotéis', 'turismo'],
        examples: ['Destinos incríveis', 'Dicas de viagem', 'Melhores hotéis'],
        weight: 1.0
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
      this.categoryPerformance.set(model.id, 0.8); // Initial performance
    });
  }

  /**
   * Preprocess content for analysis
   */
  private preprocessContent(content: string): string {
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate semantic vector for content
   */
  private getSemanticVector(content: string): number[] {
    // Simple semantic vector calculation
    // In a real implementation, this would use word embeddings or transformers
    
    const cacheKey = content.substring(0, 100);
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey)!;
    }

    const words = content.split(' ');
    const vector = new Array(5).fill(0);
    
    // Simple TF-IDF like calculation
    words.forEach(word => {
      const hash = this.simpleHash(word);
      vector[hash % 5] += 1;
    });

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = magnitude > 0 ? vector.map(val => val / magnitude) : vector;

    this.semanticCache.set(cacheKey, normalizedVector);
    return normalizedVector;
  }

  /**
   * Calculate category prediction
   */
  private calculateCategoryPrediction(
    content: string,
    contentVector: number[],
    model: CategoryModel,
    userId?: string
  ): CategoryPrediction {
    let confidence = 0;
    const keywordMatches: string[] = [];
    const contextualClues: string[] = [];

    // Keyword matching
    model.keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        keywordMatches.push(keyword);
        confidence += 0.1;
      }
    });

    // Pattern matching
    model.patterns.forEach(pattern => {
      if (pattern.test(content)) {
        confidence += 0.15;
      }
    });

    // Semantic similarity
    const semanticSimilarity = this.calculateCosineSimilarity(contentVector, model.semanticVectors);
    confidence += semanticSimilarity * 0.3;

    // User history weight (if available)
    const userHistoryWeight = userId ? this.getUserHistoryWeight(userId, model.id) : 0;
    confidence += userHistoryWeight * 0.2;

    // Apply model performance weight
    const performanceWeight = this.categoryPerformance.get(model.id) || 0.5;
    confidence *= performanceWeight;

    // Apply model weight
    confidence *= model.weight;

    // Normalize confidence
    confidence = Math.min(1, Math.max(0, confidence));

    return {
      category: model.name,
      confidence,
      subcategories: model.subcategories,
      reasoning: this.generateReasoning(keywordMatches, semanticSimilarity, userHistoryWeight),
      metadata: {
        keywordMatches,
        contextualClues,
        semanticSimilarity,
        userHistoryWeight
      }
    };
  }

  /**
   * Calculate cosine similarity between vectors
   */
  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) return 0;

    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  /**
   * Update model with training data
   */
  private updateModelWithTrainingData(data: TrainingData): void {
    // Find the model for this category
    const modelEntry = Array.from(this.models.entries())
      .find(([, model]) => model.name.toLowerCase() === data.category.toLowerCase());

    if (modelEntry) {
      const [modelId, model] = modelEntry;
      
      // Extract new keywords from training content
      const newKeywords = this.extractKeywords(data.content);
      
      // Add new keywords to model (if not already present)
      newKeywords.forEach(keyword => {
        if (!model.keywords.includes(keyword)) {
          model.keywords.push(keyword);
        }
      });

      // Update semantic vectors (simple average)
      const contentVector = this.getSemanticVector(data.content);
      model.semanticVectors = model.semanticVectors.map((val, i) => 
        (val + contentVector[i]) / 2
      );

      // Add example if confidence is high
      if (data.confidence > 0.8) {
        model.examples.push(data.content.substring(0, 100));
      }

      // Update model in map
      this.models.set(modelId, model);
    }
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'com', 'para', 'por'];
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  }

  /**
   * Calculate model performance
   */
  private calculateModelPerformance(): void {
    // Calculate performance based on user feedback
    this.userFeedback.forEach(feedback => {
      const currentPerformance = this.categoryPerformance.get(feedback.predictedCategory) || 0.5;
      
      let adjustment = 0;
      switch (feedback.feedback) {
        case 'correct':
          adjustment = 0.1;
          break;
        case 'partially_correct':
          adjustment = 0.05;
          break;
        case 'incorrect':
          adjustment = -0.1;
          break;
      }
      
      const newPerformance = Math.max(0.1, Math.min(1.0, currentPerformance + adjustment));
      this.categoryPerformance.set(feedback.predictedCategory, newPerformance);
    });
  }

  /**
   * Update model weights based on feedback
   */
  private updateModelWeights(feedback: UserFeedback): void {
    const modelEntry = Array.from(this.models.entries())
      .find(([, model]) => model.name === feedback.predictedCategory);

    if (modelEntry) {
      const [modelId, model] = modelEntry;
      
      switch (feedback.feedback) {
        case 'correct':
          model.weight = Math.min(1.5, model.weight + 0.1);
          break;
        case 'incorrect':
          model.weight = Math.max(0.5, model.weight - 0.1);
          break;
      }
      
      this.models.set(modelId, model);
    }
  }

  /**
   * Adjust category performance
   */
  private adjustCategoryPerformance(feedback: UserFeedback): void {
    const currentPerformance = this.categoryPerformance.get(feedback.predictedCategory) || 0.5;
    let adjustment = 0;
    
    switch (feedback.feedback) {
      case 'correct':
        adjustment = 0.05;
        break;
      case 'partially_correct':
        adjustment = 0.02;
        break;
      case 'incorrect':
        adjustment = -0.05;
        break;
    }
    
    const newPerformance = Math.max(0.1, Math.min(1.0, currentPerformance + adjustment));
    this.categoryPerformance.set(feedback.predictedCategory, newPerformance);
  }

  /**
   * Calculate overall accuracy
   */
  private calculateOverallAccuracy(): number {
    if (this.userFeedback.length === 0) return 0.8; // Default accuracy
    
    const correctCount = this.userFeedback.filter(f => f.feedback === 'correct').length;
    const partialCount = this.userFeedback.filter(f => f.feedback === 'partially_correct').length;
    
    return (correctCount + partialCount * 0.5) / this.userFeedback.length;
  }

  /**
   * Get user history weight
   */
  private getUserHistoryWeight(userId: string, categoryId: string): number {
    // Simple implementation - would use user's category preferences
    return 0.1;
  }

  /**
   * Generate reasoning for prediction
   */
  private generateReasoning(keywordMatches: string[], semanticSimilarity: number, userHistoryWeight: number): string {
    let reasoning = 'Baseado em: ';
    
    if (keywordMatches.length > 0) {
      reasoning += `palavras-chave (${keywordMatches.join(', ')})`;
    }
    
    if (semanticSimilarity > 0.5) {
      reasoning += reasoning.length > 11 ? ', ' : '';
      reasoning += 'similaridade semântica';
    }
    
    if (userHistoryWeight > 0.1) {
      reasoning += reasoning.length > 11 ? ', ' : '';
      reasoning += 'histórico do usuário';
    }
    
    return reasoning;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Load data from storage
   */
  private loadFromStorage(): void {
    try {
      const storedModels = localStorage.getItem('smartCategorizationModels');
      if (storedModels) {
        const models = JSON.parse(storedModels);
        this.models = new Map(models);
      }

      const storedPerformance = localStorage.getItem('categoryPerformance');
      if (storedPerformance) {
        const performance = JSON.parse(storedPerformance);
        this.categoryPerformance = new Map(performance);
      }

      const storedFeedback = localStorage.getItem('userFeedback');
      if (storedFeedback) {
        this.userFeedback = JSON.parse(storedFeedback);
      }
    } catch (error) {
      console.error('Error loading categorization data:', error);
    }
  }

  /**
   * Save data to storage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('smartCategorizationModels', JSON.stringify(Array.from(this.models.entries())));
      localStorage.setItem('categoryPerformance', JSON.stringify(Array.from(this.categoryPerformance.entries())));
      localStorage.setItem('userFeedback', JSON.stringify(this.userFeedback));
    } catch (error) {
      console.error('Error saving categorization data:', error);
    }
  }
}

export default SmartCategorizationService; 