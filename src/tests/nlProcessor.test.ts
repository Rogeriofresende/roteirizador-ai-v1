/**
 * 🧪 NL PROCESSOR TESTS
 * 
 * Testes para o processador de linguagem natural
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Charlie - Implementation Planner + Testing
 * @created 2025-07-18T15:25:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  NaturalLanguageSpecification, 
  ProcessingContext,
  TechnicalPlan
} from '../types/naturalLanguageTypes';
import { nlProcessor } from '../utils/nlProcessor';

// 🎯 TEST SETUP
describe('🧠 Natural Language Processor', () => {
  let mockContext: ProcessingContext;
  let sampleSpec: NaturalLanguageSpecification;

  beforeEach(() => {
    // Setup mock context
    mockContext = {
      project: 'TestProject',
      framework: 'React',
      designSystem: 'Tailwind',
      team: 'TestTeam',
      preferences: {
        codeStyle: {
          language: 'TypeScript',
          framework: 'React',
          linting: 'ESLint',
          formatting: 'Prettier',
          conventions: ['Conventional Commits']
        },
        testingApproach: {
          strategy: 'tdd',
          coverage: 80,
          tools: ['Jest', 'RTL'],
          automation: true
        },
        architecture: {
          patterns: ['Component Composition'],
          principles: ['SOLID', 'DRY'],
          scalability: 'medium',
          performance: 'optimized'
        },
        documentation: {
          style: 'comprehensive',
          formats: ['Markdown', 'JSDoc'],
          automation: true,
          maintenance: 'automated'
        }
      }
    };

    // Setup sample specification
    sampleSpec = {
      id: 'test-spec-001',
      title: 'Sistema de Comentários em Posts',
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date(),
      author: 'TestTeam',
      status: 'approved',
      
      overview: {
        what: 'Implementar sistema para usuários adicionarem comentários em posts do blog',
        why: 'Aumentar engajamento dos usuários e criar comunidade ativa',
        who: ['Usuário logado', 'Moderador', 'Autor do post'],
        when: 'Sprint 3 - 3 semanas',
        priority: 'high',
        complexity: 'medium'
      },
      
      userExperience: {
        userJourney: [
          {
            step: 1,
            userAction: 'Usuário clica no botão "Adicionar Comentário"',
            systemResponse: 'Sistema exibe formulário de comentário',
            userResult: 'Usuário vê área de texto para digitar comentário',
            nextActions: ['Digitar comentário', 'Cancelar']
          },
          {
            step: 2,
            userAction: 'Usuário digita comentário e clica em "Publicar"',
            systemResponse: 'Sistema valida comentário e salva no banco',
            userResult: 'Comentário aparece na lista de comentários',
            nextActions: ['Editar comentário', 'Responder comentário', 'Curtir comentário']
          },
          {
            step: 3,
            userAction: 'Usuário clica em "Responder" em um comentário',
            systemResponse: 'Sistema abre formulário de resposta aninhado',
            userResult: 'Usuário pode responder especificamente aquele comentário',
            nextActions: ['Digitar resposta', 'Cancelar resposta']
          }
        ],
        happyPath: {
          goal: 'Adicionar comentário útil em um post interessante',
          expectedOutcome: 'Comentário publicado e visível para outros usuários',
          userSatisfaction: 'Usuário se sente parte da comunidade e engajado',
          successMetrics: ['Comentário publicado em menos de 30s', 'Zero erros de validação']
        },
        edgeCases: [
          {
            scenario: 'Comentário muito longo',
            condition: 'Mais de 500 caracteres',
            expectedBehavior: 'Mostrar aviso de limite de caracteres',
            fallbackOptions: ['Editar comentário', 'Publicar em partes']
          },
          {
            scenario: 'Usuário não logado tenta comentar',
            condition: 'Sessão expirada ou não autenticado',
            expectedBehavior: 'Redirecionar para login preservando comentário',
            fallbackOptions: ['Login', 'Criar conta', 'Comentário anônimo']
          }
        ],
        userPersonas: [
          {
            name: 'João',
            role: 'Leitor assíduo',
            experience: 'intermediate',
            needs: ['Expressar opinião', 'Interagir com comunidade'],
            painPoints: ['Processo de comentário lento', 'Dificuldade de acompanhar respostas']
          },
          {
            name: 'Maria',
            role: 'Moderadora',
            experience: 'advanced',
            needs: ['Moderar comentários', 'Manter qualidade das discussões'],
            painPoints: ['Spam', 'Comentários ofensivos', 'Falta de ferramentas de moderação']
          }
        ]
      },
      
      technicalBehavior: {
        shouldBehaviors: [
          {
            behavior: 'Validar autenticação antes de permitir comentário',
            condition: 'Usuário tenta adicionar comentário',
            priority: 'high',
            testable: true
          },
          {
            behavior: 'Sanitizar conteúdo do comentário para prevenir XSS',
            condition: 'Comentário sendo processado',
            priority: 'critical',
            testable: true
          },
          {
            behavior: 'Implementar sistema de resposta aninhada até 3 níveis',
            condition: 'Usuário responde a um comentário',
            priority: 'medium',
            testable: true
          },
          {
            behavior: 'Implementar rate limiting para prevenir spam',
            condition: 'Múltiplos comentários do mesmo usuário',
            priority: 'high',
            testable: true
          },
          {
            behavior: 'Enviar notificação para autor do post quando houver novo comentário',
            condition: 'Comentário aprovado e publicado',
            priority: 'medium',
            testable: true
          }
        ],
        shouldNotBehaviors: [
          {
            antiBehavior: 'Permitir comentários com scripts maliciosos',
            condition: 'Em qualquer circunstância',
            reasoning: 'Segurança - prevenir ataques XSS',
            priority: 'critical'
          },
          {
            antiBehavior: 'Permitir comentários sem moderação em posts sensíveis',
            condition: 'Posts marcados como sensíveis',
            reasoning: 'Controle de qualidade e adequação do conteúdo',
            priority: 'high'
          }
        ],
        performanceRequirements: [
          {
            metric: 'Tempo de carregamento dos comentários',
            target: '< 2 segundos',
            measurement: 'Do clique até exibição completa',
            priority: 'high'
          },
          {
            metric: 'Tempo de publicação de comentário',
            target: '< 5 segundos',
            measurement: 'Do envio até aparecer na lista',
            priority: 'medium'
          }
        ],
        integrationPoints: [
          {
            service: 'Sistema de Autenticação',
            type: 'internal',
            dependency: true,
            requirements: ['JWT válido', 'Sessão ativa']
          },
          {
            service: 'Banco de Dados de Posts',
            type: 'database',
            dependency: true,
            requirements: ['Conexão estável', 'Índices otimizados']
          },
          {
            service: 'Sistema de Notificações',
            type: 'internal',
            dependency: false,
            requirements: ['API de email', 'Templates de notificação']
          },
          {
            service: 'Serviço de Moderação Automática',
            type: 'external',
            dependency: false,
            requirements: ['API key', 'Rate limits']
          }
        ]
      },
      
      successCriteria: {
        functional: [
          {
            outcome: 'Usuários conseguem adicionar comentários em posts',
            measurable: true,
            testable: true,
            acceptance: 'Comentário aparece na lista após publicação'
          },
          {
            outcome: 'Sistema de respostas aninhadas funciona corretamente',
            measurable: true,
            testable: true,
            acceptance: 'Respostas aparecem indentadas sob comentário original'
          },
          {
            outcome: 'Moderação automática bloqueia conteúdo inadequado',
            measurable: true,
            testable: true,
            acceptance: 'Comentários com palavrões são flagados para revisão'
          }
        ],
        nonFunctional: [
          {
            type: 'performance',
            requirement: 'Carregamento rápido',
            target: '< 2 segundos',
            measurement: 'Lighthouse performance score'
          },
          {
            type: 'security',
            requirement: 'Proteção contra XSS',
            target: '100% sanitização',
            measurement: 'Testes de penetração'
          },
          {
            type: 'accessibility',
            requirement: 'WCAG AA compliance',
            target: 'Score AA',
            measurement: 'Audit com axe-core'
          }
        ],
        businessMetrics: [
          {
            metric: 'Taxa de engajamento por post',
            baseline: '2%',
            target: '8%',
            timeline: '2 meses após implementação'
          },
          {
            metric: 'Número médio de comentários por post',
            baseline: '0.5',
            target: '3.0',
            timeline: '1 mês após implementação'
          }
        ],
        userSatisfaction: [
          {
            metric: 'NPS do sistema de comentários',
            method: 'Survey in-app',
            target: '> 7.5',
            frequency: 'Trimestral'
          }
        ]
      },
      
      constraints: {
        technicalConstraints: [
          {
            constraint: 'Usar React para frontend',
            reason: 'Consistência com resto da aplicação',
            impact: 'low',
            workarounds: ['Micro-frontend em Vue se necessário']
          },
          {
            constraint: 'Limite de 500 caracteres por comentário',
            reason: 'Performance e design do layout',
            impact: 'medium',
            workarounds: ['Comentários em thread', 'Sistema de "ver mais"']
          }
        ],
        businessConstraints: [
          {
            constraint: 'Implementar em 3 semanas',
            type: 'timeline',
            value: '21 dias',
            flexibility: 'low'
          },
          {
            constraint: 'Budget máximo de R$ 15.000',
            type: 'budget',
            value: 'R$ 15.000',
            flexibility: 'medium'
          }
        ],
        assumptions: [
          {
            assumption: 'Usuários querem interagir via comentários',
            confidence: 'high',
            validation: 'Analytics mostram alta taxa de scroll até final do post',
            impact: 'Se incorreto, focar em outras formas de engajamento'
          },
          {
            assumption: 'Sistema de autenticação já existe e é confiável',
            confidence: 'high',
            validation: 'Sistema em produção há 6 meses',
            impact: 'Se falhar, implementar autenticação própria'
          }
        ],
        dependencies: [
          {
            name: 'API de Moderação de Conteúdo',
            type: 'external',
            critical: false,
            timeline: '1 semana',
            owner: 'External Provider'
          },
          {
            name: 'Sistema de Notificações por Email',
            type: 'internal',
            critical: false,
            timeline: '2 semanas',
            owner: 'Backend Team'
          }
        ]
      },
      
      metadata: {
        project: 'TestProject',
        epic: 'User Engagement',
        sprint: 'Sprint 3',
        labels: ['frontend', 'backend', 'user-engagement'],
        reviewers: ['Tech Lead', 'UX Designer'],
        stakeholders: ['Product Owner', 'Marketing'],
        relatedSpecs: ['auth-system-spec', 'notification-system-spec'],
        changeHistory: []
      },
      
      validation: {
        isValid: true,
        score: 0.92,
        completeness: 0.95,
        clarity: 0.88,
        testability: 0.93,
        issues: [],
        suggestions: [],
        lastValidated: new Date()
      }
    };
  });

  // 🧪 SPECIFICATION PROCESSING TESTS
  describe('🔄 Specification Processing', () => {
    it('should process complete specification and generate technical plan', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(technicalPlan).toBeDefined();
      expect(technicalPlan.id).toMatch(/^tech-plan-/);
      expect(technicalPlan.specificationId).toBe(sampleSpec.id);
      expect(technicalPlan.generated).toBeInstanceOf(Date);
      expect(technicalPlan.version).toBe('1.0.0');
    });

    it('should generate architecture decisions based on specification', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(Array.isArray(technicalPlan.architecture)).toBe(true);
      expect(technicalPlan.architecture.length).toBeGreaterThan(0);

      // Check framework decision
      const frameworkDecision = technicalPlan.architecture.find(
        d => d.decision.includes(mockContext.framework)
      );
      expect(frameworkDecision).toBeDefined();
      expect(frameworkDecision!.reasoning).toContain(mockContext.framework);
      expect(Array.isArray(frameworkDecision!.alternatives)).toBe(true);
      expect(Array.isArray(frameworkDecision!.tradeoffs)).toBe(true);
    });

    it('should identify components from user journey', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(Array.isArray(technicalPlan.components)).toBe(true);
      expect(technicalPlan.components.length).toBeGreaterThan(0);

      // Should identify button component from "clica no botão"
      const buttonComponent = technicalPlan.components.find(
        c => c.name.toLowerCase().includes('button')
      );
      expect(buttonComponent).toBeDefined();
      expect(buttonComponent!.type).toBe('component');

      // Should identify form component from form actions
      const formComponent = technicalPlan.components.find(
        c => c.name.toLowerCase().includes('form') || c.type === 'component'
      );
      expect(formComponent).toBeDefined();

      // Should identify main page component
      const pageComponent = technicalPlan.components.find(
        c => c.type === 'page'
      );
      expect(pageComponent).toBeDefined();
      expect(pageComponent!.name).toContain('Page');
    });

    it('should identify services from technical behaviors', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      // Should identify validation service from "validar" behavior
      const validationService = technicalPlan.components.find(
        c => c.name.includes('Validation') && c.type === 'service'
      );
      expect(validationService).toBeDefined();

      // Check that services have proper interfaces
      technicalPlan.components
        .filter(c => c.type === 'service')
        .forEach(service => {
          expect(service.interfaces.length).toBeGreaterThan(0);
          expect(service.interfaces[0].type).toBe('api');
          expect(service.testRequirements.length).toBeGreaterThan(0);
        });
    });

    it('should create implementation steps with proper dependencies', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(Array.isArray(technicalPlan.implementationSteps)).toBe(true);
      expect(technicalPlan.implementationSteps.length).toBeGreaterThanOrEqual(4);

      // Check step structure
      technicalPlan.implementationSteps.forEach((step, index) => {
        expect(step.step).toBe(index + 1);
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
        expect(Array.isArray(step.deliverables)).toBe(true);
        expect(Array.isArray(step.dependencies)).toBe(true);
        expect(step.effort).toMatch(/\d+[-]\d+\s+dias?|\d+\s+dias?/);
      });

      // First step should be setup with no dependencies
      const firstStep = technicalPlan.implementationSteps[0];
      expect(firstStep.title.toLowerCase()).toContain('setup');
      expect(firstStep.dependencies).toHaveLength(0);

      // Later steps should have dependencies
      const laterSteps = technicalPlan.implementationSteps.slice(1);
      expect(laterSteps.some(step => step.dependencies.length > 0)).toBe(true);
    });

    it('should generate timeline with phases and milestones', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(technicalPlan.timeline).toBeDefined();
      expect(Array.isArray(technicalPlan.timeline.phases)).toBe(true);
      expect(Array.isArray(technicalPlan.timeline.milestones)).toBe(true);
      expect(Array.isArray(technicalPlan.timeline.criticalPath)).toBe(true);

      // Check phases
      technicalPlan.timeline.phases.forEach(phase => {
        expect(phase.name).toBeDefined();
        expect(phase.start).toBeInstanceOf(Date);
        expect(phase.end).toBeInstanceOf(Date);
        expect(phase.end.getTime()).toBeGreaterThan(phase.start.getTime());
        expect(Array.isArray(phase.deliverables)).toBe(true);
        expect(Array.isArray(phase.dependencies)).toBe(true);
      });

      // Check milestones
      technicalPlan.timeline.milestones.forEach(milestone => {
        expect(milestone.name).toBeDefined();
        expect(milestone.date).toBeInstanceOf(Date);
        expect(Array.isArray(milestone.criteria)).toBe(true);
        expect(Array.isArray(milestone.deliverables)).toBe(true);
      });
    });

    it('should estimate resources based on complexity', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(Array.isArray(technicalPlan.resources)).toBe(true);
      expect(technicalPlan.resources.length).toBeGreaterThan(0);

      // Check resource structure
      technicalPlan.resources.forEach(resource => {
        expect(resource.role).toBeDefined();
        expect(resource.effort).toMatch(/\d+\s+dias?/);
        expect(Array.isArray(resource.skills)).toBe(true);
        expect(resource.timeline).toBeDefined();
      });

      // Should include common roles
      const roles = technicalPlan.resources.map(r => r.role);
      expect(roles).toContain('Frontend Developer');
      expect(roles.some(role => role.includes('Developer'))).toBe(true);
    });

    it('should define comprehensive test strategy', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(technicalPlan.testStrategy).toBeDefined();
      expect(Array.isArray(technicalPlan.testStrategy.unitTests)).toBe(true);
      expect(Array.isArray(technicalPlan.testStrategy.integrationTests)).toBe(true);
      expect(Array.isArray(technicalPlan.testStrategy.e2eTests)).toBe(true);
      expect(Array.isArray(technicalPlan.testStrategy.performanceTests)).toBe(true);

      // Check unit tests
      technicalPlan.testStrategy.unitTests.forEach(test => {
        expect(test.scenario).toBeDefined();
        expect(test.type).toBe('unit');
        expect(['low', 'medium', 'high']).toContain(test.priority);
        expect(typeof test.automation).toBe('boolean');
        expect(test.description).toBeDefined();
      });

      // Should have at least one high priority test
      const highPriorityTests = technicalPlan.testStrategy.unitTests.filter(
        t => t.priority === 'high'
      );
      expect(highPriorityTests.length).toBeGreaterThan(0);
    });

    it('should define quality gates with metrics', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(Array.isArray(technicalPlan.qualityGates)).toBe(true);
      expect(technicalPlan.qualityGates.length).toBeGreaterThan(0);

      // Check quality gate structure
      technicalPlan.qualityGates.forEach(gate => {
        expect(gate.name).toBeDefined();
        expect(Array.isArray(gate.criteria)).toBe(true);
        expect(Array.isArray(gate.metrics)).toBe(true);
        expect(typeof gate.blocking).toBe('boolean');

        // Check metrics
        gate.metrics.forEach(metric => {
          expect(metric.metric).toBeDefined();
          expect(metric.target).toBeDefined();
          expect(metric.measurement).toBeDefined();
          expect(metric.tooling).toBeDefined();
        });
      });

      // Should include code quality gate
      const codeQualityGate = technicalPlan.qualityGates.find(
        g => g.name.toLowerCase().includes('code quality')
      );
      expect(codeQualityGate).toBeDefined();
      expect(codeQualityGate!.blocking).toBe(true);
    });

    it('should assess risks and provide mitigation strategies', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(technicalPlan.riskAssessment).toBeDefined();
      expect(Array.isArray(technicalPlan.riskAssessment.risks)).toBe(true);
      expect(Array.isArray(technicalPlan.riskAssessment.mitigation)).toBe(true);
      expect(Array.isArray(technicalPlan.riskAssessment.contingencies)).toBe(true);

      // Check risks
      technicalPlan.riskAssessment.risks.forEach(risk => {
        expect(risk.risk).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(risk.probability);
        expect(['low', 'medium', 'high']).toContain(risk.impact);
        expect(['technical', 'business', 'resource', 'external']).toContain(risk.category);
      });

      // Check mitigation strategies
      technicalPlan.riskAssessment.mitigation.forEach(mitigation => {
        expect(mitigation.riskId).toBeDefined();
        expect(mitigation.strategy).toBeDefined();
        expect(mitigation.owner).toBeDefined();
        expect(mitigation.timeline).toBeDefined();
      });
    });

    it('should analyze data model from specification', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      expect(Array.isArray(technicalPlan.dataModel)).toBe(true);
      
      if (technicalPlan.dataModel.length > 0) {
        technicalPlan.dataModel.forEach(entity => {
          expect(entity.entity).toBeDefined();
          expect(Array.isArray(entity.attributes)).toBe(true);
          expect(Array.isArray(entity.relationships)).toBe(true);
          expect(Array.isArray(entity.constraints)).toBe(true);

          // Check attributes
          entity.attributes.forEach(attr => {
            expect(attr.name).toBeDefined();
            expect(attr.type).toBeDefined();
            expect(typeof attr.required).toBe('boolean');
            expect(Array.isArray(attr.validation)).toBe(true);
            expect(attr.description).toBeDefined();
          });
        });
      }
    });
  });

  // 🧪 CONTEXT ADAPTATION TESTS
  describe('🎯 Context Adaptation', () => {
    it('should adapt to different frameworks', async () => {
      const vueContext = { ...mockContext, framework: 'Vue' };
      const reactContext = { ...mockContext, framework: 'React' };

      const vuePlan = await nlProcessor.processSpecification(sampleSpec, vueContext);
      const reactPlan = await nlProcessor.processSpecification(sampleSpec, reactContext);

      // Architecture decisions should mention the specific framework
      const vueFrameworkDecision = vuePlan.architecture.find(
        d => d.decision.includes('Vue')
      );
      const reactFrameworkDecision = reactPlan.architecture.find(
        d => d.decision.includes('React')
      );

      expect(vueFrameworkDecision).toBeDefined();
      expect(reactFrameworkDecision).toBeDefined();
    });

    it('should adapt to different design systems', async () => {
      const tailwindContext = { ...mockContext, designSystem: 'Tailwind' };
      const materialContext = { ...mockContext, designSystem: 'Material-UI' };

      const tailwindPlan = await nlProcessor.processSpecification(sampleSpec, tailwindContext);
      const materialPlan = await nlProcessor.processSpecification(sampleSpec, materialContext);

      // Both should generate valid plans
      expect(tailwindPlan).toBeDefined();
      expect(materialPlan).toBeDefined();
      expect(tailwindPlan.id).not.toBe(materialPlan.id);
    });

    it('should adjust complexity based on specification complexity', async () => {
      const simpleSpec = {
        ...sampleSpec,
        overview: { ...sampleSpec.overview, complexity: 'simple' as const },
        userExperience: {
          ...sampleSpec.userExperience,
          userJourney: sampleSpec.userExperience.userJourney.slice(0, 1) // Only 1 step
        }
      };

      const complexSpec = {
        ...sampleSpec,
        overview: { ...sampleSpec.overview, complexity: 'complex' as const }
      };

      const simplePlan = await nlProcessor.processSpecification(simpleSpec, mockContext);
      const complexPlan = await nlProcessor.processSpecification(complexSpec, mockContext);

      // Complex plan should have more resources allocated
      const simpleEffort = simplePlan.resources.reduce((sum, r) => {
        const days = parseFloat(r.effort.replace(/[^0-9.]/g, ''));
        return sum + (isNaN(days) ? 0 : days);
      }, 0);

      const complexEffort = complexPlan.resources.reduce((sum, r) => {
        const days = parseFloat(r.effort.replace(/[^0-9.]/g, ''));
        return sum + (isNaN(days) ? 0 : days);
      }, 0);

      expect(complexEffort).toBeGreaterThan(simpleEffort);
    });
  });

  // 🧪 COMPONENT IDENTIFICATION TESTS
  describe('🧩 Component Identification', () => {
    it('should identify UI components from user actions', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      const uiComponents = technicalPlan.components.filter(c => c.type === 'component');
      
      // Should identify button from "clica no botão"
      expect(uiComponents.some(c => c.name.toLowerCase().includes('button'))).toBe(true);
      
      // Should identify form components from form interactions
      expect(uiComponents.some(c => 
        c.name.toLowerCase().includes('form') || 
        c.purpose.toLowerCase().includes('formulário')
      )).toBe(true);
    });

    it('should identify services from technical behaviors', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      const services = technicalPlan.components.filter(c => c.type === 'service');
      
      // Should identify validation service
      expect(services.some(s => s.name.includes('Validation'))).toBe(true);
      
      // Services should have API interfaces
      services.forEach(service => {
        expect(service.interfaces.some(i => i.type === 'api')).toBe(true);
      });
    });

    it('should create page components for main features', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      const pages = technicalPlan.components.filter(c => c.type === 'page');
      
      expect(pages.length).toBeGreaterThanOrEqual(1);
      
      pages.forEach(page => {
        expect(page.name).toContain('Page');
        expect(page.dependencies.length).toBeGreaterThan(0); // Should depend on components
      });
    });

    it('should assign appropriate test requirements to components', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      technicalPlan.components.forEach(component => {
        expect(component.testRequirements.length).toBeGreaterThan(0);
        
        if (component.type === 'component') {
          expect(component.testRequirements).toContain('Renderização correta');
        }
        
        if (component.type === 'service') {
          expect(component.testRequirements).toContain('Comportamento correto');
        }
      });
    });
  });

  // 🧪 TIMELINE GENERATION TESTS
  describe('⏰ Timeline Generation', () => {
    it('should create realistic timeline phases', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      const phases = technicalPlan.timeline.phases;
      
      // Should have multiple phases
      expect(phases.length).toBeGreaterThanOrEqual(3);
      
      // Phases should be in chronological order
      for (let i = 1; i < phases.length; i++) {
        expect(phases[i].start.getTime()).toBeGreaterThanOrEqual(phases[i-1].start.getTime());
      }
      
      // Should include common phases
      const phaseNames = phases.map(p => p.name.toLowerCase());
      expect(phaseNames.some(name => name.includes('setup'))).toBe(true);
      expect(phaseNames.some(name => name.includes('development'))).toBe(true);
      expect(phaseNames.some(name => name.includes('testing'))).toBe(true);
    });

    it('should create meaningful milestones', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      const milestones = technicalPlan.timeline.milestones;
      
      expect(milestones.length).toBeGreaterThanOrEqual(2);
      
      milestones.forEach(milestone => {
        expect(milestone.criteria.length).toBeGreaterThan(0);
        expect(milestone.deliverables.length).toBeGreaterThan(0);
      });
      
      // Should have production ready milestone
      expect(milestones.some(m => 
        m.name.toLowerCase().includes('production') || 
        m.name.toLowerCase().includes('ready')
      )).toBe(true);
    });

    it('should define critical path', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      const criticalPath = technicalPlan.timeline.criticalPath;
      
      expect(criticalPath.length).toBeGreaterThan(0);
      
      // Critical path should reference actual phases
      const phaseNames = technicalPlan.timeline.phases.map(p => p.name);
      criticalPath.forEach(pathItem => {
        expect(phaseNames).toContain(pathItem);
      });
    });
  });

  // 🧪 PERFORMANCE TESTS
  describe('⚡ Performance Tests', () => {
    it('should process specification within reasonable time', async () => {
      const start = Date.now();
      
      await nlProcessor.processSpecification(sampleSpec, mockContext);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle multiple concurrent processing requests', async () => {
      const promises = Array.from({ length: 3 }, (_, i) =>
        nlProcessor.processSpecification(
          { ...sampleSpec, id: `concurrent-spec-${i}` },
          mockContext
        )
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach((plan, i) => {
        expect(plan.specificationId).toBe(`concurrent-spec-${i}`);
        expect(plan.id).toBeDefined();
      });

      // All plans should be unique
      const planIds = results.map(p => p.id);
      const uniquePlanIds = new Set(planIds);
      expect(uniquePlanIds.size).toBe(3);
    });
  });

  // 🧪 ERROR HANDLING TESTS
  describe('🚨 Error Handling', () => {
    it('should handle invalid specification gracefully', async () => {
      const invalidSpec = {
        ...sampleSpec,
        userExperience: {
          ...sampleSpec.userExperience,
          userJourney: [] // Empty journey
        },
        technicalBehavior: {
          ...sampleSpec.technicalBehavior,
          shouldBehaviors: [] // No behaviors
        }
      };

      // Should still generate a plan, but with warnings
      const technicalPlan = await nlProcessor.processSpecification(invalidSpec, mockContext);
      
      expect(technicalPlan).toBeDefined();
      expect(technicalPlan.components.length).toBeGreaterThanOrEqual(1); // Should have at least page component
    });

    it('should handle missing context gracefully', async () => {
      const incompleteContext = {
        ...mockContext,
        framework: '',
        designSystem: ''
      };

      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, incompleteContext);
      
      expect(technicalPlan).toBeDefined();
      // Should still generate architecture decisions with defaults
      expect(technicalPlan.architecture.length).toBeGreaterThan(0);
    });
  });

  // 🧪 INTEGRATION PATTERN TESTS
  describe('🔗 Integration Pattern Tests', () => {
    it('should identify integration requirements from specification', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      // Should identify architecture decisions for integrations
      const integrationDecisions = technicalPlan.architecture.filter(
        d => d.decision.toLowerCase().includes('integra') || 
            d.decision.toLowerCase().includes('api')
      );
      
      expect(integrationDecisions.length).toBeGreaterThan(0);
    });

    it('should handle external dependencies in timeline', async () => {
      const technicalPlan = await nlProcessor.processSpecification(sampleSpec, mockContext);

      // Should account for external dependencies in risk assessment
      const externalRisks = technicalPlan.riskAssessment.risks.filter(
        r => r.category === 'external'
      );
      
      if (sampleSpec.technicalBehavior.integrationPoints.some(ip => ip.type === 'external')) {
        expect(externalRisks.length).toBeGreaterThan(0);
      }
    });
  });
});