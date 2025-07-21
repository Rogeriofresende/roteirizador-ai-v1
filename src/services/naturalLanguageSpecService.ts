/**
 * 🎯 NATURAL LANGUAGE SPECIFICATION SERVICE
 * 
 * Serviço principal para processamento de especificações em linguagem natural
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Alpha - Requirements Analyst + Backend
 * @created 2025-07-18T14:50:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import { 
  NaturalLanguageSpecification, 
  TechnicalPlan, 
  ValidationResult, 
  ProcessingContext,
  SpecificationStatus,
  ValidationIssue,
  VALIDATION_THRESHOLDS,
  PROCESSING_TIMEOUTS
} from '../types/naturalLanguageTypes';

import { nlProcessor } from '../utils/nlProcessor';

/**
 * 🎯 NATURAL LANGUAGE SPECIFICATION SERVICE
 * 
 * Serviço principal para gerenciamento de especificações em linguagem natural
 * Implementa os core principles do V8.2 Enhanced + BMAD Fusion
 */
class NaturalLanguageSpecService {
  private specifications: Map<string, NaturalLanguageSpecification> = new Map();
  private technicalPlans: Map<string, TechnicalPlan> = new Map();
  private processingQueue: Array<{ specId: string; priority: number }> = [];

  /**
   * 📝 CRIAR NOVA ESPECIFICAÇÃO
   * 
   * Cria uma nova especificação em linguagem natural a partir de um template
   */
  async createSpecification(
    template: Partial<NaturalLanguageSpecification>,
    context: ProcessingContext
  ): Promise<NaturalLanguageSpecification> {
    const spec: NaturalLanguageSpecification = {
      id: this.generateId(),
      title: template.title || 'Nova Especificação',
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date(),
      author: context.team || 'Sistema',
      status: 'draft',
      
      // Core sections with defaults
      overview: template.overview || {
        what: '',
        why: '',
        who: [],
        when: '',
        priority: 'medium',
        complexity: 'medium'
      },
      
      userExperience: template.userExperience || {
        userJourney: [],
        happyPath: {
          goal: '',
          expectedOutcome: '',
          userSatisfaction: '',
          successMetrics: []
        },
        edgeCases: [],
        userPersonas: []
      },
      
      technicalBehavior: template.technicalBehavior || {
        shouldBehaviors: [],
        shouldNotBehaviors: [],
        performanceRequirements: [],
        integrationPoints: []
      },
      
      successCriteria: template.successCriteria || {
        functional: [],
        nonFunctional: [],
        businessMetrics: [],
        userSatisfaction: []
      },
      
      constraints: template.constraints || {
        technicalConstraints: [],
        businessConstraints: [],
        assumptions: [],
        dependencies: []
      },
      
      metadata: template.metadata || {
        project: context.project,
        epic: '',
        labels: [],
        reviewers: [],
        stakeholders: [],
        relatedSpecs: [],
        changeHistory: []
      },
      
      validation: {
        isValid: false,
        score: 0,
        completeness: 0,
        clarity: 0,
        testability: 0,
        issues: [],
        suggestions: [],
        lastValidated: new Date()
      }
    };

    // Store specification
    this.specifications.set(spec.id, spec);
    
    // Initial validation
    await this.validateSpecification(spec.id);
    
    return spec;
  }

  /**
   * 📖 OBTER ESPECIFICAÇÃO
   */
  async getSpecification(id: string): Promise<NaturalLanguageSpecification | null> {
    return this.specifications.get(id) || null;
  }

  /**
   * 📝 ATUALIZAR ESPECIFICAÇÃO
   */
  async updateSpecification(
    id: string, 
    updates: Partial<NaturalLanguageSpecification>
  ): Promise<NaturalLanguageSpecification | null> {
    const spec = this.specifications.get(id);
    if (!spec) return null;

    const updatedSpec = {
      ...spec,
      ...updates,
      lastModified: new Date(),
      metadata: {
        ...spec.metadata,
        changeHistory: [
          ...spec.metadata.changeHistory,
          {
            version: this.incrementVersion(spec.version),
            date: new Date(),
            author: updates.author || spec.author,
            changes: Object.keys(updates),
            reason: 'Atualização da especificação'
          }
        ]
      }
    };

    this.specifications.set(id, updatedSpec);
    
    // Re-validate after update
    await this.validateSpecification(id);
    
    return updatedSpec;
  }

  /**
   * ✅ VALIDAR ESPECIFICAÇÃO
   * 
   * Valida completude, clareza e testabilidade da especificação
   */
  async validateSpecification(id: string): Promise<ValidationResult> {
    const spec = this.specifications.get(id);
    if (!spec) {
      throw new Error(`Especificação ${id} não encontrada`);
    }

    console.log(`🔍 [NL-SPEC] Validando especificação: ${spec.title}`);

    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];

    // Validate completeness
    const completeness = this.calculateCompleteness(spec);
    if (completeness < VALIDATION_THRESHOLDS.MIN_COMPLETENESS) {
      issues.push({
        type: 'warning',
        section: 'completeness',
        message: `Especificação ${Math.round(completeness * 100)}% completa (mínimo: ${VALIDATION_THRESHOLDS.MIN_COMPLETENESS * 100}%)`,
        severity: 'medium',
        fixable: true
      });
    }

    // Validate clarity
    const clarity = this.calculateClarity(spec);
    if (clarity < VALIDATION_THRESHOLDS.MIN_CLARITY) {
      issues.push({
        type: 'warning',
        section: 'clarity',
        message: `Clareza da especificação: ${Math.round(clarity * 100)}% (mínimo: ${VALIDATION_THRESHOLDS.MIN_CLARITY * 100}%)`,
        severity: 'medium',
        fixable: true
      });
    }

    // Validate testability
    const testability = this.calculateTestability(spec);
    if (testability < VALIDATION_THRESHOLDS.MIN_TESTABILITY) {
      issues.push({
        type: 'error',
        section: 'testability',
        message: `Testabilidade: ${Math.round(testability * 100)}% (mínimo: ${VALIDATION_THRESHOLDS.MIN_TESTABILITY * 100}%)`,
        severity: 'high',
        fixable: true
      });
    }

    // Calculate overall score
    const score = (completeness + clarity + testability) / 3;
    const isValid = score >= VALIDATION_THRESHOLDS.MIN_OVERALL_SCORE;

    // Generate suggestions
    if (!isValid) {
      suggestions.push(
        'Adicione mais detalhes nas seções incompletas',
        'Seja mais específico nos critérios de sucesso',
        'Defina comportamentos testáveis'
      );
    }

    const validationResult: ValidationResult = {
      isValid,
      score,
      completeness,
      clarity,
      testability,
      issues,
      suggestions,
      lastValidated: new Date()
    };

    // Update specification with validation result
    spec.validation = validationResult;
    this.specifications.set(id, spec);

    console.log(`✅ [NL-SPEC] Validação concluída: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'} (Score: ${Math.round(score * 100)}%)`);

    return validationResult;
  }

  /**
   * 🔄 PROCESSAR ESPECIFICAÇÃO → PLANO TÉCNICO
   * 
   * Converte especificação em linguagem natural para plano técnico
   */
  async processSpecificationToTechnicalPlan(
    specId: string,
    context: ProcessingContext
  ): Promise<TechnicalPlan> {
    const spec = this.specifications.get(specId);
    if (!spec) {
      throw new Error(`Especificação ${specId} não encontrada`);
    }

    if (!spec.validation.isValid) {
      throw new Error(`Especificação ${specId} deve ser válida antes do processamento`);
    }

    console.log(`⚙️ [NL-SPEC] Processando especificação para plano técnico: ${spec.title}`);

    try {
      // Use nlProcessor to convert specification to technical plan
      const technicalPlan = await nlProcessor.processSpecification(spec, context);
      
      // Store technical plan
      this.technicalPlans.set(specId, technicalPlan);
      
      // Update specification with technical plan reference
      spec.technicalPlan = technicalPlan;
      spec.status = 'approved';
      this.specifications.set(specId, spec);

      console.log(`✅ [NL-SPEC] Plano técnico gerado com sucesso: ${technicalPlan.id}`);
      
      return technicalPlan;
    } catch (error) {
      console.error(`❌ [NL-SPEC] Erro ao processar especificação:`, error);
      throw error;
    }
  }

  /**
   * 📊 OBTER PLANO TÉCNICO
   */
  async getTechnicalPlan(specId: string): Promise<TechnicalPlan | null> {
    return this.technicalPlans.get(specId) || null;
  }

  /**
   * 📋 LISTAR ESPECIFICAÇÕES
   */
  async listSpecifications(filters?: {
    status?: SpecificationStatus;
    project?: string;
    author?: string;
  }): Promise<NaturalLanguageSpecification[]> {
    let specs = Array.from(this.specifications.values());

    if (filters) {
      if (filters.status) {
        specs = specs.filter(spec => spec.status === filters.status);
      }
      if (filters.project) {
        specs = specs.filter(spec => spec.metadata.project === filters.project);
      }
      if (filters.author) {
        specs = specs.filter(spec => spec.author === filters.author);
      }
    }

    return specs.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  /**
   * 🔍 BUSCAR ESPECIFICAÇÕES
   */
  async searchSpecifications(query: string): Promise<NaturalLanguageSpecification[]> {
    const specs = Array.from(this.specifications.values());
    const lowerQuery = query.toLowerCase();

    return specs.filter(spec => 
      spec.title.toLowerCase().includes(lowerQuery) ||
      spec.overview.what.toLowerCase().includes(lowerQuery) ||
      spec.overview.why.toLowerCase().includes(lowerQuery) ||
      spec.metadata.labels.some(label => label.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 🗑️ DELETAR ESPECIFICAÇÃO
   */
  async deleteSpecification(id: string): Promise<boolean> {
    const spec = this.specifications.get(id);
    if (!spec) return false;

    this.specifications.delete(id);
    this.technicalPlans.delete(id);
    
    console.log(`🗑️ [NL-SPEC] Especificação deletada: ${spec.title}`);
    
    return true;
  }

  /**
   * 📤 EXPORTAR ESPECIFICAÇÃO
   */
  async exportSpecification(id: string, format: 'json' | 'markdown' | 'pdf'): Promise<string> {
    const spec = this.specifications.get(id);
    if (!spec) {
      throw new Error(`Especificação ${id} não encontrada`);
    }

    switch (format) {
      case 'json':
        return JSON.stringify(spec, null, 2);
      
      case 'markdown':
        return this.convertToMarkdown(spec);
      
      case 'pdf':
        // PDF generation would require additional libraries
        throw new Error('Exportação PDF não implementada');
      
      default:
        throw new Error(`Formato ${format} não suportado`);
    }
  }

  /**
   * 📥 IMPORTAR ESPECIFICAÇÃO
   */
  async importSpecification(data: string, format: 'json' | 'markdown'): Promise<NaturalLanguageSpecification> {
    switch (format) {
      case 'json':
        const spec = JSON.parse(data) as NaturalLanguageSpecification;
        spec.id = this.generateId(); // Generate new ID
        spec.created = new Date();
        spec.lastModified = new Date();
        
        this.specifications.set(spec.id, spec);
        await this.validateSpecification(spec.id);
        
        return spec;
      
      case 'markdown':
        throw new Error('Importação Markdown não implementada');
      
      default:
        throw new Error(`Formato ${format} não suportado`);
    }
  }

  // 🔧 PRIVATE UTILITY METHODS

  private generateId(): string {
    return `nl-spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private calculateCompleteness(spec: NaturalLanguageSpecification): number {
    const checks = [
      spec.overview.what.length > 0,
      spec.overview.why.length > 0,
      spec.overview.who.length > 0,
      spec.userExperience.userJourney.length > 0,
      spec.userExperience.happyPath.goal.length > 0,
      spec.technicalBehavior.shouldBehaviors.length > 0,
      spec.successCriteria.functional.length > 0,
      spec.successCriteria.nonFunctional.length > 0
    ];

    return checks.filter(Boolean).length / checks.length;
  }

  private calculateClarity(spec: NaturalLanguageSpecification): number {
    const checks = [
      spec.overview.what.length > 20,
      spec.overview.why.length > 20,
      spec.userExperience.happyPath.goal.length > 10,
      spec.technicalBehavior.shouldBehaviors.every(b => b.behavior.length > 10),
      spec.successCriteria.functional.every(c => c.outcome.length > 10)
    ];

    return checks.filter(Boolean).length / checks.length;
  }

  private calculateTestability(spec: NaturalLanguageSpecification): number {
    const checks = [
      spec.technicalBehavior.shouldBehaviors.every(b => b.testable),
      spec.successCriteria.functional.every(c => c.testable),
      spec.successCriteria.nonFunctional.every(c => c.measurement.length > 0),
      spec.technicalBehavior.performanceRequirements.every(p => p.target.length > 0)
    ];

    return checks.filter(Boolean).length / checks.length;
  }

  private convertToMarkdown(spec: NaturalLanguageSpecification): string {
    return `# ${spec.title}

> **Versão:** ${spec.version}  
> **Criado:** ${spec.created.toISOString()}  
> **Autor:** ${spec.author}  
> **Status:** ${spec.status}

## 🎯 Visão Geral

**O que:** ${spec.overview.what}

**Por que:** ${spec.overview.why}

**Quem:** ${spec.overview.who.join(', ')}

**Quando:** ${spec.overview.when}

**Prioridade:** ${spec.overview.priority}

**Complexidade:** ${spec.overview.complexity}

## 🎨 Experiência do Usuário

### Jornada do Usuário
${spec.userExperience.userJourney.map(step => 
  `${step.step}. **${step.userAction}** → ${step.systemResponse} → ${step.userResult}`
).join('\n')}

### Caminho Principal
**Objetivo:** ${spec.userExperience.happyPath.goal}
**Resultado:** ${spec.userExperience.happyPath.expectedOutcome}
**Satisfação:** ${spec.userExperience.happyPath.userSatisfaction}

## 🔧 Comportamento Técnico

### Deve Fazer
${spec.technicalBehavior.shouldBehaviors.map(b => 
  `- ${b.behavior} quando ${b.condition}`
).join('\n')}

### Não Deve Fazer
${spec.technicalBehavior.shouldNotBehaviors.map(b => 
  `- ${b.antiBehavior} mesmo se ${b.condition}`
).join('\n')}

## 📊 Critérios de Sucesso

### Funcionais
${spec.successCriteria.functional.map(c => 
  `- [ ] ${c.outcome}`
).join('\n')}

### Não Funcionais
${spec.successCriteria.nonFunctional.map(c => 
  `- [ ] ${c.requirement}: ${c.target}`
).join('\n')}

## 🚨 Restrições e Premissas

### Restrições Técnicas
${spec.constraints.technicalConstraints.map(c => 
  `- ${c.constraint} (${c.reason})`
).join('\n')}

### Premissas
${spec.constraints.assumptions.map(a => 
  `- ${a.assumption} (confiança: ${a.confidence})`
).join('\n')}

---

*Gerado automaticamente pelo Natural Language Spec Service*
*Validação: ${spec.validation.isValid ? '✅ Válida' : '❌ Inválida'} (Score: ${Math.round(spec.validation.score * 100)}%)*
`;
  }
}

// 🚀 EXPORT SINGLETON INSTANCE
export const naturalLanguageSpecService = new NaturalLanguageSpecService();
export default naturalLanguageSpecService;