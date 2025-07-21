/**
 * 🎯 NL TO TECHNICAL PLAN PROCESSOR
 * 
 * Processador que converte especificações em linguagem natural para planos técnicos
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Charlie - Implementation Planner + Testing
 * @created 2025-07-18T15:15:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import { 
  NaturalLanguageSpecification, 
  TechnicalPlan, 
  ProcessingContext,
  ImplementationStep,
  ComponentSpecification,
  TestStrategy,
  QualityGate,
  Timeline,
  RiskAssessment
} from '../types/naturalLanguageTypes';

import { nlProcessor } from '../utils/nlProcessor';

/**
 * 🧠 NL TO TECHNICAL PLAN PROCESSOR
 * 
 * Processador principal que converte especificações em linguagem natural
 * para planos técnicos detalhados e executáveis
 */
class NLToTechnicalPlanProcessor {
  private processingQueue: Map<string, ProcessingJob> = new Map();
  private processingHistory: ProcessingHistory[] = [];

  /**
   * 🔄 PROCESSAR ESPECIFICAÇÃO
   * 
   * Método principal que orquestra a conversão de NL Spec para Technical Plan
   */
  async processSpecification(
    spec: NaturalLanguageSpecification,
    context: ProcessingContext,
    options: ProcessingOptions = {}
  ): Promise<TechnicalPlan> {
    const jobId = this.generateJobId();
    
    console.log(`🔄 [NL-TO-TECH] Iniciando processamento: ${spec.title} (Job: ${jobId})`);

    // Create processing job
    const job: ProcessingJob = {
      id: jobId,
      specificationId: spec.id,
      status: 'processing',
      startTime: new Date(),
      context,
      options,
      steps: []
    };

    this.processingQueue.set(jobId, job);

    try {
      // Phase 1: Validate prerequisites
      await this.validatePrerequisites(spec, context, job);

      // Phase 2: Analyze specification
      const analysis = await this.analyzeSpecification(spec, context, job);

      // Phase 3: Generate technical plan
      const technicalPlan = await this.generateTechnicalPlan(spec, analysis, context, job);

      // Phase 4: Validate technical plan
      await this.validateTechnicalPlan(technicalPlan, spec, context, job);

      // Phase 5: Optimize plan
      const optimizedPlan = await this.optimizeTechnicalPlan(technicalPlan, context, job);

      // Complete job
      job.status = 'completed';
      job.endTime = new Date();
      job.result = optimizedPlan;

      // Add to history
      this.addToHistory(job);

      console.log(`✅ [NL-TO-TECH] Processamento concluído: ${optimizedPlan.id}`);

      return optimizedPlan;

    } catch (error) {
      console.error(`❌ [NL-TO-TECH] Erro no processamento:`, error);
      
      job.status = 'failed';
      job.endTime = new Date();
      job.error = error instanceof Error ? error.message : 'Erro desconhecido';
      
      this.addToHistory(job);
      
      throw error;
    } finally {
      this.processingQueue.delete(jobId);
    }
  }

  /**
   * ✅ VALIDAR PRERREQUISITOS
   */
  private async validatePrerequisites(
    spec: NaturalLanguageSpecification,
    context: ProcessingContext,
    job: ProcessingJob
  ): Promise<void> {
    this.addJobStep(job, 'Validando prerrequisitos', 'in_progress');

    // Check specification validation
    if (!spec.validation.isValid) {
      throw new Error('Especificação deve ser válida antes do processamento');
    }

    // Check minimum validation score
    if (spec.validation.score < 0.75) {
      throw new Error(`Score de validação muito baixo: ${spec.validation.score}. Mínimo: 0.75`);
    }

    // Check required sections
    const requiredSections = [
      'overview',
      'userExperience',
      'technicalBehavior',
      'successCriteria'
    ];

    for (const section of requiredSections) {
      if (!this.hasMinimumContent(spec, section)) {
        throw new Error(`Seção obrigatória incompleta: ${section}`);
      }
    }

    // Check context validity
    if (!context.project || !context.framework) {
      throw new Error('Contexto de processamento inválido');
    }

    this.updateJobStep(job, 'Validando prerrequisitos', 'completed');
  }

  /**
   * 📊 ANALISAR ESPECIFICAÇÃO
   */
  private async analyzeSpecification(
    spec: NaturalLanguageSpecification,
    context: ProcessingContext,
    job: ProcessingJob
  ): Promise<SpecificationAnalysis> {
    this.addJobStep(job, 'Analisando especificação', 'in_progress');

    const analysis: SpecificationAnalysis = {
      complexity: this.analyzeComplexity(spec),
      scope: this.analyzeScope(spec),
      risks: this.analyzeRisks(spec),
      dependencies: this.analyzeDependencies(spec),
      components: this.identifyComponents(spec),
      dataFlows: this.analyzeDataFlows(spec),
      integrations: this.analyzeIntegrations(spec),
      testingRequirements: this.analyzeTestingRequirements(spec)
    };

    this.updateJobStep(job, 'Analisando especificação', 'completed');
    return analysis;
  }

  /**
   * 🏗️ GERAR PLANO TÉCNICO
   */
  private async generateTechnicalPlan(
    spec: NaturalLanguageSpecification,
    analysis: SpecificationAnalysis,
    context: ProcessingContext,
    job: ProcessingJob
  ): Promise<TechnicalPlan> {
    this.addJobStep(job, 'Gerando plano técnico', 'in_progress');

    // Use nlProcessor to generate base plan
    const basePlan = await nlProcessor.processSpecification(spec, context);

    // Enhance with analysis insights
    const enhancedPlan: TechnicalPlan = {
      ...basePlan,
      
      // Enhanced components based on analysis
      components: this.enhanceComponents(basePlan.components, analysis),
      
      // Enhanced implementation steps
      implementationSteps: this.enhanceImplementationSteps(basePlan.implementationSteps, analysis),
      
      // Enhanced timeline
      timeline: this.enhanceTimeline(basePlan.timeline, analysis),
      
      // Enhanced test strategy
      testStrategy: this.enhanceTestStrategy(basePlan.testStrategy, analysis),
      
      // Enhanced quality gates
      qualityGates: this.enhanceQualityGates(basePlan.qualityGates, analysis),
      
      // Enhanced risk assessment
      riskAssessment: this.enhanceRiskAssessment(basePlan.riskAssessment, analysis)
    };

    this.updateJobStep(job, 'Gerando plano técnico', 'completed');
    return enhancedPlan;
  }

  /**
   * ✅ VALIDAR PLANO TÉCNICO
   */
  private async validateTechnicalPlan(
    plan: TechnicalPlan,
    spec: NaturalLanguageSpecification,
    context: ProcessingContext,
    job: ProcessingJob
  ): Promise<void> {
    this.addJobStep(job, 'Validando plano técnico', 'in_progress');

    // Validate completeness
    this.validatePlanCompleteness(plan);

    // Validate consistency
    this.validatePlanConsistency(plan, spec);

    // Validate feasibility
    this.validatePlanFeasibility(plan, context);

    // Validate testability
    this.validatePlanTestability(plan);

    this.updateJobStep(job, 'Validando plano técnico', 'completed');
  }

  /**
   * ⚡ OTIMIZAR PLANO TÉCNICO
   */
  private async optimizeTechnicalPlan(
    plan: TechnicalPlan,
    context: ProcessingContext,
    job: ProcessingJob
  ): Promise<TechnicalPlan> {
    this.addJobStep(job, 'Otimizando plano técnico', 'in_progress');

    // Optimize timeline
    const optimizedTimeline = this.optimizeTimeline(plan.timeline);

    // Optimize resource allocation
    const optimizedResources = this.optimizeResources(plan.resources);

    // Optimize component dependencies
    const optimizedComponents = this.optimizeComponentDependencies(plan.components);

    // Optimize test strategy
    const optimizedTestStrategy = this.optimizeTestStrategy(plan.testStrategy);

    const optimizedPlan: TechnicalPlan = {
      ...plan,
      timeline: optimizedTimeline,
      resources: optimizedResources,
      components: optimizedComponents,
      testStrategy: optimizedTestStrategy
    };

    this.updateJobStep(job, 'Otimizando plano técnico', 'completed');
    return optimizedPlan;
  }

  // 🔧 ANALYSIS METHODS

  private analyzeComplexity(spec: NaturalLanguageSpecification): ComplexityAnalysis {
    const factors = {
      userJourneySteps: spec.userExperience.userJourney.length,
      behaviorRules: spec.technicalBehavior.shouldBehaviors.length,
      integrationPoints: spec.technicalBehavior.integrationPoints.length,
      successCriteria: spec.successCriteria.functional.length + spec.successCriteria.nonFunctional.length
    };

    const complexityScore = (
      factors.userJourneySteps * 0.2 +
      factors.behaviorRules * 0.3 +
      factors.integrationPoints * 0.4 +
      factors.successCriteria * 0.1
    );

    return {
      score: complexityScore,
      level: complexityScore > 10 ? 'high' : complexityScore > 5 ? 'medium' : 'low',
      factors,
      recommendations: this.getComplexityRecommendations(complexityScore)
    };
  }

  private analyzeScope(spec: NaturalLanguageSpecification): ScopeAnalysis {
    return {
      features: this.extractFeatures(spec),
      pages: this.extractPages(spec),
      components: this.extractComponents(spec),
      services: this.extractServices(spec),
      estimatedEffort: this.estimateEffort(spec)
    };
  }

  private analyzeRisks(spec: NaturalLanguageSpecification): RiskAnalysis[] {
    const risks: RiskAnalysis[] = [];

    // Complexity risk
    if (spec.overview.complexity === 'complex') {
      risks.push({
        type: 'complexity',
        level: 'high',
        description: 'Alta complexidade pode levar a atrasos',
        mitigation: 'Quebrar em tarefas menores, adicionar checkpoints'
      });
    }

    // Integration risk
    if (spec.technicalBehavior.integrationPoints.length > 3) {
      risks.push({
        type: 'integration',
        level: 'medium',
        description: 'Múltiplas integrações podem causar dependências',
        mitigation: 'Implementar mocks, planejar testes de integração'
      });
    }

    // Requirement clarity risk
    if (spec.validation.clarity < 0.8) {
      risks.push({
        type: 'requirements',
        level: 'high',
        description: 'Requisitos não claros podem causar retrabalho',
        mitigation: 'Revisar especificação, validar com stakeholders'
      });
    }

    return risks;
  }

  private analyzeDependencies(spec: NaturalLanguageSpecification): DependencyAnalysis[] {
    return spec.constraints.dependencies.map(dep => ({
      name: dep.name,
      type: dep.type,
      critical: dep.critical,
      timeline: dep.timeline,
      owner: dep.owner,
      risk: dep.critical ? 'high' : 'medium',
      mitigation: dep.critical ? 'Plano de contingência necessário' : 'Monitorar progresso'
    }));
  }

  private identifyComponents(spec: NaturalLanguageSpecification): ComponentAnalysis[] {
    const components: ComponentAnalysis[] = [];

    // Analyze user journey for UI components
    for (const step of spec.userExperience.userJourney) {
      const componentType = this.inferComponentType(step.userAction);
      if (componentType) {
        components.push({
          name: this.generateComponentName(step.userAction),
          type: componentType,
          complexity: this.assessComponentComplexity(step),
          dependencies: [],
          testingRequirements: this.generateTestingRequirements(step)
        });
      }
    }

    // Analyze technical behaviors for services
    for (const behavior of spec.technicalBehavior.shouldBehaviors) {
      if (this.isServiceBehavior(behavior.behavior)) {
        components.push({
          name: this.generateServiceName(behavior.behavior),
          type: 'service',
          complexity: behavior.condition.length > 50 ? 'high' : 'medium',
          dependencies: this.extractDependencies(behavior.condition),
          testingRequirements: ['unit', 'integration']
        });
      }
    }

    return components;
  }

  // 🔧 ENHANCEMENT METHODS

  private enhanceComponents(
    components: ComponentSpecification[],
    analysis: SpecificationAnalysis
  ): ComponentSpecification[] {
    return components.map(component => ({
      ...component,
      testRequirements: [
        ...component.testRequirements,
        ...this.generateAdditionalTestRequirements(component, analysis)
      ]
    }));
  }

  private enhanceImplementationSteps(
    steps: ImplementationStep[],
    analysis: SpecificationAnalysis
  ): ImplementationStep[] {
    // Add risk mitigation steps
    const riskMitigationSteps = analysis.risks
      .filter(risk => risk.level === 'high')
      .map((risk, index) => ({
        step: steps.length + index + 1,
        title: `Mitigar risco: ${risk.type}`,
        description: risk.mitigation,
        deliverables: [`Plano de mitigação para ${risk.type}`],
        dependencies: [],
        effort: '0.5 dias'
      }));

    return [...steps, ...riskMitigationSteps];
  }

  private enhanceTimeline(timeline: Timeline, analysis: SpecificationAnalysis): Timeline {
    // Add buffer for high complexity projects
    if (analysis.complexity.level === 'high') {
      const bufferedPhases = timeline.phases.map(phase => ({
        ...phase,
        end: new Date(phase.end.getTime() + 2 * 24 * 60 * 60 * 1000) // Add 2 days buffer
      }));

      return {
        ...timeline,
        phases: bufferedPhases
      };
    }

    return timeline;
  }

  // 🔧 VALIDATION METHODS

  private validatePlanCompleteness(plan: TechnicalPlan): void {
    const requiredSections = [
      'architecture',
      'components',
      'implementationSteps',
      'testStrategy',
      'qualityGates'
    ];

    for (const section of requiredSections) {
      if (!plan[section as keyof TechnicalPlan] || 
          (Array.isArray(plan[section as keyof TechnicalPlan]) && 
           (plan[section as keyof TechnicalPlan] as any[]).length === 0)) {
        throw new Error(`Seção obrigatória ausente no plano técnico: ${section}`);
      }
    }
  }

  private validatePlanConsistency(plan: TechnicalPlan, spec: NaturalLanguageSpecification): void {
    // Validate that components align with user journey
    const userJourneyComponents = spec.userExperience.userJourney.length;
    const planComponents = plan.components.length;

    if (planComponents < userJourneyComponents * 0.5) {
      throw new Error('Plano técnico não possui componentes suficientes para cobrir a jornada do usuário');
    }

    // Validate that test strategy covers all components
    const testableComponents = plan.components.filter(c => c.testRequirements.length > 0);
    if (testableComponents.length !== plan.components.length) {
      throw new Error('Nem todos os componentes possuem requisitos de teste');
    }
  }

  private validatePlanFeasibility(plan: TechnicalPlan, context: ProcessingContext): void {
    // Validate timeline feasibility
    const totalEffort = plan.implementationSteps.reduce((sum, step) => {
      const days = parseFloat(step.effort.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(days) ? 0 : days);
    }, 0);

    if (totalEffort > 30) { // More than 30 days
      console.warn(`⚠️ Plano com alta estimativa de esforço: ${totalEffort} dias`);
    }

    // Validate resource requirements
    const requiredSkills = plan.resources.flatMap(r => r.skills);
    const uniqueSkills = [...new Set(requiredSkills)];
    
    if (uniqueSkills.length > 10) {
      console.warn(`⚠️ Plano requer muitas habilidades diferentes: ${uniqueSkills.length}`);
    }
  }

  private validatePlanTestability(plan: TechnicalPlan): void {
    // Ensure all components have test requirements
    const untestedComponents = plan.components.filter(c => c.testRequirements.length === 0);
    if (untestedComponents.length > 0) {
      throw new Error(`Componentes sem requisitos de teste: ${untestedComponents.map(c => c.name).join(', ')}`);
    }

    // Ensure test strategy covers all test types
    const requiredTestTypes = ['unit', 'integration', 'e2e'];
    const testStrategy = plan.testStrategy;
    
    for (const testType of requiredTestTypes) {
      const hasTestType = testStrategy.unitTests.length > 0 || 
                         testStrategy.integrationTests.length > 0 || 
                         testStrategy.e2eTests.length > 0;
      
      if (!hasTestType) {
        console.warn(`⚠️ Estratégia de teste não inclui testes do tipo: ${testType}`);
      }
    }
  }

  // 🔧 OPTIMIZATION METHODS

  private optimizeTimeline(timeline: Timeline): Timeline {
    // Identify parallel tasks
    const optimizedPhases = timeline.phases.map(phase => {
      // Tasks that can run in parallel
      const parallelizableTasks = phase.deliverables.filter(d => 
        !d.includes('depend') && !d.includes('require')
      );

      if (parallelizableTasks.length > 1) {
        // Reduce phase duration by 20% if tasks can be parallelized
        const duration = phase.end.getTime() - phase.start.getTime();
        const optimizedDuration = duration * 0.8;
        
        return {
          ...phase,
          end: new Date(phase.start.getTime() + optimizedDuration)
        };
      }

      return phase;
    });

    return {
      ...timeline,
      phases: optimizedPhases
    };
  }

  private optimizeResources(resources: any[]): any[] {
    // Combine similar roles
    const optimizedResources = resources.reduce((acc, resource) => {
      const existingResource = acc.find(r => r.role === resource.role);
      
      if (existingResource) {
        // Combine effort
        const existingEffort = parseFloat(existingResource.effort.replace(/[^0-9.]/g, ''));
        const newEffort = parseFloat(resource.effort.replace(/[^0-9.]/g, ''));
        
        existingResource.effort = `${existingEffort + newEffort} dias`;
        existingResource.skills = [...new Set([...existingResource.skills, ...resource.skills])];
      } else {
        acc.push(resource);
      }
      
      return acc;
    }, []);

    return optimizedResources;
  }

  private optimizeComponentDependencies(components: ComponentSpecification[]): ComponentSpecification[] {
    // Sort components by dependency order
    const sortedComponents = [...components].sort((a, b) => {
      const aDeps = a.dependencies.length;
      const bDeps = b.dependencies.length;
      return aDeps - bDeps;
    });

    return sortedComponents;
  }

  private optimizeTestStrategy(testStrategy: TestStrategy): TestStrategy {
    // Prioritize high-impact tests
    const optimizedUnitTests = testStrategy.unitTests.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return {
      ...testStrategy,
      unitTests: optimizedUnitTests
    };
  }

  // 🔧 UTILITY METHODS

  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addJobStep(job: ProcessingJob, description: string, status: JobStepStatus): void {
    job.steps.push({
      description,
      status,
      startTime: new Date()
    });
  }

  private updateJobStep(job: ProcessingJob, description: string, status: JobStepStatus): void {
    const step = job.steps.find(s => s.description === description);
    if (step) {
      step.status = status;
      step.endTime = new Date();
    }
  }

  private addToHistory(job: ProcessingJob): void {
    this.processingHistory.push({
      jobId: job.id,
      specificationId: job.specificationId,
      startTime: job.startTime,
      endTime: job.endTime!,
      status: job.status,
      context: job.context,
      steps: job.steps.length,
      error: job.error
    });

    // Keep only last 100 entries
    if (this.processingHistory.length > 100) {
      this.processingHistory = this.processingHistory.slice(-100);
    }
  }

  private hasMinimumContent(spec: NaturalLanguageSpecification, section: string): boolean {
    switch (section) {
      case 'overview':
        return spec.overview.what.length > 10 && spec.overview.why.length > 10;
      case 'userExperience':
        return spec.userExperience.userJourney.length > 0;
      case 'technicalBehavior':
        return spec.technicalBehavior.shouldBehaviors.length > 0;
      case 'successCriteria':
        return spec.successCriteria.functional.length > 0;
      default:
        return false;
    }
  }

  private getComplexityRecommendations(score: number): string[] {
    if (score > 10) {
      return [
        'Considere quebrar em múltiplas features',
        'Adicione checkpoints intermediários',
        'Planeje testes de integração extensivos',
        'Considere prototipagem prévia'
      ];
    } else if (score > 5) {
      return [
        'Monitore progresso de perto',
        'Adicione testes de integração',
        'Considere refatoração durante desenvolvimento'
      ];
    } else {
      return [
        'Feature de baixa complexidade',
        'Foque em qualidade e documentação'
      ];
    }
  }

  private extractFeatures(spec: NaturalLanguageSpecification): string[] {
    // Extract features from user journey and technical behaviors
    const features = new Set<string>();
    
    spec.userExperience.userJourney.forEach(step => {
      features.add(step.userAction);
    });
    
    spec.technicalBehavior.shouldBehaviors.forEach(behavior => {
      features.add(behavior.behavior);
    });
    
    return Array.from(features);
  }

  private extractPages(spec: NaturalLanguageSpecification): string[] {
    // Infer pages from user journey
    const pages = new Set<string>();
    
    spec.userExperience.userJourney.forEach(step => {
      if (step.userAction.includes('navega') || step.userAction.includes('acessa')) {
        pages.add(this.inferPageName(step.userAction));
      }
    });
    
    return Array.from(pages);
  }

  private extractComponents(spec: NaturalLanguageSpecification): string[] {
    // Extract UI components from user actions
    const components = new Set<string>();
    
    spec.userExperience.userJourney.forEach(step => {
      const componentName = this.inferComponentType(step.userAction);
      if (componentName) {
        components.add(componentName);
      }
    });
    
    return Array.from(components);
  }

  private extractServices(spec: NaturalLanguageSpecification): string[] {
    // Extract services from technical behaviors
    const services = new Set<string>();
    
    spec.technicalBehavior.shouldBehaviors.forEach(behavior => {
      if (this.isServiceBehavior(behavior.behavior)) {
        services.add(this.generateServiceName(behavior.behavior));
      }
    });
    
    return Array.from(services);
  }

  private estimateEffort(spec: NaturalLanguageSpecification): string {
    const complexity = spec.overview.complexity;
    const baseEffort = {
      'simple': 3,
      'medium': 8,
      'complex': 15,
      'enterprise': 30
    };
    
    return `${baseEffort[complexity]} dias`;
  }

  private inferComponentType(userAction: string): string | null {
    const action = userAction.toLowerCase();
    
    if (action.includes('clica') || action.includes('botão')) return 'button';
    if (action.includes('formulário') || action.includes('preenche')) return 'form';
    if (action.includes('lista') || action.includes('seleciona')) return 'list';
    if (action.includes('modal') || action.includes('popup')) return 'modal';
    if (action.includes('navega') || action.includes('menu')) return 'navigation';
    
    return null;
  }

  private generateComponentName(userAction: string): string {
    const type = this.inferComponentType(userAction);
    return type ? `${type.charAt(0).toUpperCase() + type.slice(1)}Component` : 'GenericComponent';
  }

  private assessComponentComplexity(step: any): 'low' | 'medium' | 'high' {
    const actionLength = step.userAction.length + step.systemResponse.length;
    
    if (actionLength > 100) return 'high';
    if (actionLength > 50) return 'medium';
    return 'low';
  }

  private generateTestingRequirements(step: any): string[] {
    return [
      'unit',
      'integration',
      step.userAction.includes('navega') ? 'e2e' : null
    ].filter(Boolean) as string[];
  }

  private isServiceBehavior(behavior: string): boolean {
    return behavior.includes('processar') || 
           behavior.includes('calcular') || 
           behavior.includes('validar') || 
           behavior.includes('autenticar');
  }

  private generateServiceName(behavior: string): string {
    if (behavior.includes('processar')) return 'ProcessingService';
    if (behavior.includes('calcular')) return 'CalculationService';
    if (behavior.includes('validar')) return 'ValidationService';
    if (behavior.includes('autenticar')) return 'AuthService';
    return 'GenericService';
  }

  private extractDependencies(condition: string): string[] {
    const deps: string[] = [];
    
    if (condition.includes('API')) deps.push('API');
    if (condition.includes('banco') || condition.includes('database')) deps.push('Database');
    if (condition.includes('autenticação')) deps.push('Auth');
    
    return deps;
  }

  private generateAdditionalTestRequirements(
    component: ComponentSpecification,
    analysis: SpecificationAnalysis
  ): string[] {
    const additional: string[] = [];
    
    if (analysis.complexity.level === 'high') {
      additional.push('Performance testing');
    }
    
    if (component.name.includes('Auth') || component.name.includes('Security')) {
      additional.push('Security testing');
    }
    
    return additional;
  }

  private inferPageName(userAction: string): string {
    if (userAction.includes('login')) return 'LoginPage';
    if (userAction.includes('dashboard')) return 'DashboardPage';
    if (userAction.includes('profile')) return 'ProfilePage';
    if (userAction.includes('settings')) return 'SettingsPage';
    return 'GenericPage';
  }

  /**
   * 📊 OBTER HISTÓRICO DE PROCESSAMENTO
   */
  getProcessingHistory(): ProcessingHistory[] {
    return [...this.processingHistory];
  }

  /**
   * 📊 OBTER ESTATÍSTICAS DE PROCESSAMENTO
   */
  getProcessingStats(): ProcessingStats {
    const history = this.processingHistory;
    const total = history.length;
    const successful = history.filter(h => h.status === 'completed').length;
    const failed = history.filter(h => h.status === 'failed').length;
    
    const avgProcessingTime = history.reduce((sum, h) => {
      const duration = h.endTime.getTime() - h.startTime.getTime();
      return sum + duration;
    }, 0) / total;

    return {
      totalProcessed: total,
      successRate: total > 0 ? successful / total : 0,
      failureRate: total > 0 ? failed / total : 0,
      averageProcessingTime: avgProcessingTime,
      lastProcessedAt: history.length > 0 ? history[history.length - 1].endTime : null
    };
  }
}

// 🎯 INTERFACES

interface ProcessingOptions {
  includeOptimizations?: boolean;
  validateIntermediateSteps?: boolean;
  generateDetailedDocs?: boolean;
}

interface ProcessingJob {
  id: string;
  specificationId: string;
  status: 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  context: ProcessingContext;
  options: ProcessingOptions;
  steps: JobStep[];
  result?: TechnicalPlan;
  error?: string;
}

interface JobStep {
  description: string;
  status: JobStepStatus;
  startTime: Date;
  endTime?: Date;
}

type JobStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface ProcessingHistory {
  jobId: string;
  specificationId: string;
  startTime: Date;
  endTime: Date;
  status: 'completed' | 'failed';
  context: ProcessingContext;
  steps: number;
  error?: string;
}

interface ProcessingStats {
  totalProcessed: number;
  successRate: number;
  failureRate: number;
  averageProcessingTime: number;
  lastProcessedAt: Date | null;
}

interface SpecificationAnalysis {
  complexity: ComplexityAnalysis;
  scope: ScopeAnalysis;
  risks: RiskAnalysis[];
  dependencies: DependencyAnalysis[];
  components: ComponentAnalysis[];
  dataFlows: any[];
  integrations: any[];
  testingRequirements: string[];
}

interface ComplexityAnalysis {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: Record<string, number>;
  recommendations: string[];
}

interface ScopeAnalysis {
  features: string[];
  pages: string[];
  components: string[];
  services: string[];
  estimatedEffort: string;
}

interface RiskAnalysis {
  type: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

interface DependencyAnalysis {
  name: string;
  type: string;
  critical: boolean;
  timeline: string;
  owner: string;
  risk: 'low' | 'medium' | 'high';
  mitigation: string;
}

interface ComponentAnalysis {
  name: string;
  type: string;
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  testingRequirements: string[];
}

// 🚀 EXPORT SINGLETON INSTANCE
export const nlToTechnicalPlanProcessor = new NLToTechnicalPlanProcessor();
export default nlToTechnicalPlanProcessor;