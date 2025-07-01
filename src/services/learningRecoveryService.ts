/**
 * Learning Recovery Service - Sistema para capturar e aplicar aprendizados perdidos
 */

interface HistoricalLearning {
  id: string;
  version: string;
  category: 'ux' | 'performance' | 'architecture' | 'user_behavior';
  decision: string;
  reasoning: string;
  implementation: string;
  impact: 'high' | 'medium' | 'low';
  currentStatus: 'implemented' | 'lost' | 'partially_implemented';
  discoveredAt: number;
}

class LearningRecoveryService {
  private knownLearnings: Map<string, HistoricalLearning> = new Map();

  constructor() {
    this.initializeLearningDatabase();
  }

  private initializeLearningDatabase(): void {
    const learnings: HistoricalLearning[] = [
      {
        id: 'v4_1_direct_access',
        version: 'V4.1',
        category: 'ux',
        decision: 'Página principal deve ser o gerador diretamente',
        reasoning: 'Usuários querem acesso imediato à funcionalidade principal',
        implementation: 'Route "/" → GeneratorPage',
        impact: 'high',
        currentStatus: 'implemented',
        discoveredAt: Date.now()
      },
      {
        id: 'v4_nomenclature',
        version: 'V4.1',
        category: 'ux',
        decision: 'Nome consistente: "Roteirar IA"',
        reasoning: 'Eliminar confusão de branding',
        implementation: 'Global nomenclature standardization',
        impact: 'medium',
        currentStatus: 'partially_implemented',
        discoveredAt: Date.now()
      }
    ];

    learnings.forEach(learning => {
      this.knownLearnings.set(learning.id, learning);
    });
  }

  public getLostLearnings(): HistoricalLearning[] {
    return Array.from(this.knownLearnings.values())
      .filter(l => l.currentStatus === 'lost');
  }

  public getHighImpactLearnings(): HistoricalLearning[] {
    return Array.from(this.knownLearnings.values())
      .filter(l => l.impact === 'high');
  }

  public generateReport() {
    const learnings = Array.from(this.knownLearnings.values());
    return {
      total: learnings.length,
      implemented: learnings.filter(l => l.currentStatus === 'implemented').length,
      lost: learnings.filter(l => l.currentStatus === 'lost').length,
      recommendations: this.getLostLearnings().map(l => l.decision)
    };
  }
}

export const learningRecoveryService = new LearningRecoveryService();
