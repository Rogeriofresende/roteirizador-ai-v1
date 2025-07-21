/**
 * 🧪 NATURAL LANGUAGE SPEC TESTS
 * 
 * Testes para o sistema de especificações em linguagem natural
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Charlie - Implementation Planner + Testing
 * @created 2025-07-18T15:20:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  NaturalLanguageSpecification, 
  ProcessingContext,
  ValidationResult,
  VALIDATION_THRESHOLDS
} from '../types/naturalLanguageTypes';
import { naturalLanguageSpecService } from '../services/naturalLanguageSpecService';

// 🎯 TEST SETUP
describe('🎯 Natural Language Specification System', () => {
  let mockContext: ProcessingContext;
  let sampleSpec: Partial<NaturalLanguageSpecification>;

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
      title: 'Sistema de Login com Google',
      overview: {
        what: 'Implementar autenticação com Google OAuth para permitir login de usuários',
        why: 'Facilitar acesso dos usuários sem necessidade de criar nova conta',
        who: ['Usuário final', 'Administrador'],
        when: 'Sprint 2 - 2 semanas',
        priority: 'high',
        complexity: 'medium'
      },
      userExperience: {
        userJourney: [
          {
            step: 1,
            userAction: 'Usuário clica no botão "Entrar com Google"',
            systemResponse: 'Sistema abre popup de autenticação do Google',
            userResult: 'Usuário vê tela de login do Google',
            nextActions: ['Inserir credenciais', 'Cancelar']
          },
          {
            step: 2,
            userAction: 'Usuário insere credenciais e autoriza aplicação',
            systemResponse: 'Sistema recebe token de autenticação e cria sessão',
            userResult: 'Usuário é redirecionado para dashboard',
            nextActions: ['Navegar pelo sistema', 'Fazer logout']
          }
        ],
        happyPath: {
          goal: 'Fazer login no sistema usando conta Google',
          expectedOutcome: 'Usuário autenticado e redirecionado para dashboard',
          userSatisfaction: 'Usuário consegue acessar sistema rapidamente',
          successMetrics: ['Login em menos de 30 segundos', 'Taxa de sucesso > 95%']
        },
        edgeCases: [
          {
            scenario: 'Usuário cancela autenticação',
            condition: 'Durante processo de OAuth',
            expectedBehavior: 'Retornar para tela de login sem erro',
            fallbackOptions: ['Tentar novamente', 'Login tradicional']
          }
        ],
        userPersonas: [
          {
            name: 'Maria',
            role: 'Usuário final',
            experience: 'intermediate',
            needs: ['Acesso rápido', 'Segurança'],
            painPoints: ['Muitas senhas', 'Processo lento']
          }
        ]
      },
      technicalBehavior: {
        shouldBehaviors: [
          {
            behavior: 'Redirecionar para Google OAuth quando botão clicado',
            condition: 'Usuário não autenticado',
            priority: 'high',
            testable: true
          },
          {
            behavior: 'Criar sessão de usuário após sucesso na autenticação',
            condition: 'Token válido recebido do Google',
            priority: 'high',
            testable: true
          }
        ],
        shouldNotBehaviors: [
          {
            antiBehavior: 'Armazenar senha do Google localmente',
            condition: 'Em qualquer circunstância',
            reasoning: 'Segurança - senhas devem ficar no Google',
            priority: 'critical'
          }
        ],
        performanceRequirements: [
          {
            metric: 'Tempo de login',
            target: '< 30 segundos',
            measurement: 'Do clique até redirect',
            priority: 'high'
          }
        ],
        integrationPoints: [
          {
            service: 'Google OAuth API',
            type: 'external',
            dependency: true,
            requirements: ['HTTPS', 'Credenciais válidas']
          }
        ]
      },
      successCriteria: {
        functional: [
          {
            outcome: 'Usuário consegue fazer login com Google',
            measurable: true,
            testable: true,
            acceptance: 'Login completo em ambiente de produção'
          }
        ],
        nonFunctional: [
          {
            type: 'performance',
            requirement: 'Login rápido',
            target: '< 30 segundos',
            measurement: 'Tempo médio de autenticação'
          },
          {
            type: 'security',
            requirement: 'Dados seguros',
            target: 'HTTPS obrigatório',
            measurement: 'Auditoria de segurança'
          }
        ],
        businessMetrics: [
          {
            metric: 'Taxa de conversão de login',
            baseline: '60%',
            target: '85%',
            timeline: '1 mês após implementação'
          }
        ],
        userSatisfaction: [
          {
            metric: 'NPS do processo de login',
            method: 'Survey pós-login',
            target: '> 8.0',
            frequency: 'Mensal'
          }
        ]
      },
      constraints: {
        technicalConstraints: [
          {
            constraint: 'Usar Google OAuth 2.0',
            reason: 'Padrão de mercado e documentação',
            impact: 'medium',
            workarounds: ['OAuth 1.0 como fallback']
          }
        ],
        businessConstraints: [
          {
            constraint: 'Implementar em 2 semanas',
            type: 'timeline',
            value: '14 dias',
            flexibility: 'low'
          }
        ],
        assumptions: [
          {
            assumption: 'Usuários têm conta Google',
            confidence: 'high',
            validation: 'Survey com usuários',
            impact: 'Fallback para login tradicional se necessário'
          }
        ],
        dependencies: [
          {
            name: 'Google Developer Console',
            type: 'external',
            critical: true,
            timeline: 'Imediato',
            owner: 'DevOps Team'
          }
        ]
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 🧪 SPECIFICATION CREATION TESTS
  describe('📝 Specification Creation', () => {
    it('should create a new specification from template', async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );

      expect(spec).toBeDefined();
      expect(spec.id).toMatch(/^nl-spec-/);
      expect(spec.title).toBe(sampleSpec.title);
      expect(spec.author).toBe(mockContext.team);
      expect(spec.status).toBe('draft');
      expect(spec.metadata.project).toBe(mockContext.project);
    });

    it('should create specification with default values when template is empty', async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        {},
        mockContext
      );

      expect(spec).toBeDefined();
      expect(spec.title).toBe('Nova Especificação');
      expect(spec.overview.priority).toBe('medium');
      expect(spec.overview.complexity).toBe('medium');
      expect(spec.userExperience.userJourney).toEqual([]);
    });

    it('should automatically validate specification after creation', async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );

      expect(spec.validation).toBeDefined();
      expect(spec.validation.lastValidated).toBeInstanceOf(Date);
      expect(typeof spec.validation.score).toBe('number');
      expect(typeof spec.validation.completeness).toBe('number');
      expect(typeof spec.validation.clarity).toBe('number');
      expect(typeof spec.validation.testability).toBe('number');
    });
  });

  // 🧪 SPECIFICATION VALIDATION TESTS
  describe('✅ Specification Validation', () => {
    let specId: string;

    beforeEach(async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );
      specId = spec.id;
    });

    it('should validate specification and return validation result', async () => {
      const validation = await naturalLanguageSpecService.validateSpecification(specId);

      expect(validation).toBeDefined();
      expect(validation.isValid).toBeDefined();
      expect(validation.score).toBeGreaterThanOrEqual(0);
      expect(validation.score).toBeLessThanOrEqual(1);
      expect(validation.completeness).toBeGreaterThanOrEqual(0);
      expect(validation.completeness).toBeLessThanOrEqual(1);
      expect(validation.clarity).toBeGreaterThanOrEqual(0);
      expect(validation.clarity).toBeLessThanOrEqual(1);
      expect(validation.testability).toBeGreaterThanOrEqual(0);
      expect(validation.testability).toBeLessThanOrEqual(1);
      expect(Array.isArray(validation.issues)).toBe(true);
      expect(Array.isArray(validation.suggestions)).toBe(true);
    });

    it('should mark specification as valid when all criteria are met', async () => {
      // Complete specification should be valid
      const validation = await naturalLanguageSpecService.validateSpecification(specId);
      
      // With our comprehensive sample spec, it should be valid
      expect(validation.score).toBeGreaterThan(VALIDATION_THRESHOLDS.MIN_OVERALL_SCORE);
      expect(validation.isValid).toBe(true);
    });

    it('should identify issues in incomplete specifications', async () => {
      // Create incomplete specification
      const incompleteSpec = await naturalLanguageSpecService.createSpecification(
        {
          title: 'Incomplete Spec',
          overview: {
            what: 'Test',
            why: '',
            who: [],
            when: '',
            priority: 'low',
            complexity: 'simple'
          }
        },
        mockContext
      );

      const validation = await naturalLanguageSpecService.validateSpecification(incompleteSpec.id);

      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.suggestions.length).toBeGreaterThan(0);
    });

    it('should provide specific validation issues with details', async () => {
      const incompleteSpec = await naturalLanguageSpecService.createSpecification(
        { title: 'Test' },
        mockContext
      );

      const validation = await naturalLanguageSpecService.validateSpecification(incompleteSpec.id);

      const issues = validation.issues;
      expect(issues.length).toBeGreaterThan(0);

      issues.forEach(issue => {
        expect(issue).toHaveProperty('type');
        expect(issue).toHaveProperty('section');
        expect(issue).toHaveProperty('message');
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('fixable');
        expect(['error', 'warning', 'suggestion']).toContain(issue.type);
        expect(['low', 'medium', 'high']).toContain(issue.severity);
        expect(typeof issue.fixable).toBe('boolean');
      });
    });
  });

  // 🧪 SPECIFICATION CRUD TESTS
  describe('📋 Specification CRUD Operations', () => {
    let specId: string;

    beforeEach(async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );
      specId = spec.id;
    });

    it('should retrieve existing specification', async () => {
      const spec = await naturalLanguageSpecService.getSpecification(specId);

      expect(spec).toBeDefined();
      expect(spec!.id).toBe(specId);
      expect(spec!.title).toBe(sampleSpec.title);
    });

    it('should return null for non-existent specification', async () => {
      const spec = await naturalLanguageSpecService.getSpecification('non-existent-id');
      expect(spec).toBeNull();
    });

    it('should update specification and track changes', async () => {
      const updates = {
        title: 'Updated Title',
        overview: {
          ...sampleSpec.overview!,
          what: 'Updated description'
        }
      };

      const updatedSpec = await naturalLanguageSpecService.updateSpecification(
        specId,
        updates
      );

      expect(updatedSpec).toBeDefined();
      expect(updatedSpec!.title).toBe('Updated Title');
      expect(updatedSpec!.overview.what).toBe('Updated description');
      expect(updatedSpec!.lastModified).toBeInstanceOf(Date);
      expect(updatedSpec!.metadata.changeHistory.length).toBeGreaterThan(0);

      const lastChange = updatedSpec!.metadata.changeHistory[updatedSpec!.metadata.changeHistory.length - 1];
      expect(lastChange.changes).toContain('title');
      expect(lastChange.changes).toContain('overview');
    });

    it('should delete specification', async () => {
      const deleted = await naturalLanguageSpecService.deleteSpecification(specId);
      expect(deleted).toBe(true);

      const spec = await naturalLanguageSpecService.getSpecification(specId);
      expect(spec).toBeNull();
    });

    it('should return false when deleting non-existent specification', async () => {
      const deleted = await naturalLanguageSpecService.deleteSpecification('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  // 🧪 SPECIFICATION LISTING AND SEARCH TESTS
  describe('🔍 Specification Listing and Search', () => {
    beforeEach(async () => {
      // Create multiple specifications for testing
      await naturalLanguageSpecService.createSpecification(
        { ...sampleSpec, title: 'Login System' },
        mockContext
      );
      await naturalLanguageSpecService.createSpecification(
        { ...sampleSpec, title: 'Dashboard Feature', author: 'AnotherAuthor' },
        { ...mockContext, project: 'AnotherProject' }
      );
      await naturalLanguageSpecService.createSpecification(
        { ...sampleSpec, title: 'User Profile', status: 'approved' },
        mockContext
      );
    });

    it('should list all specifications', async () => {
      const specs = await naturalLanguageSpecService.listSpecifications();

      expect(Array.isArray(specs)).toBe(true);
      expect(specs.length).toBeGreaterThanOrEqual(3);
      
      // Should be sorted by lastModified (newest first)
      for (let i = 1; i < specs.length; i++) {
        expect(specs[i-1].lastModified.getTime()).toBeGreaterThanOrEqual(
          specs[i].lastModified.getTime()
        );
      }
    });

    it('should filter specifications by status', async () => {
      const draftSpecs = await naturalLanguageSpecService.listSpecifications({
        status: 'draft'
      });
      const approvedSpecs = await naturalLanguageSpecService.listSpecifications({
        status: 'approved'
      });

      expect(draftSpecs.every(spec => spec.status === 'draft')).toBe(true);
      expect(approvedSpecs.every(spec => spec.status === 'approved')).toBe(true);
      expect(approvedSpecs.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter specifications by project', async () => {
      const projectSpecs = await naturalLanguageSpecService.listSpecifications({
        project: mockContext.project
      });

      expect(projectSpecs.every(spec => spec.metadata.project === mockContext.project)).toBe(true);
      expect(projectSpecs.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter specifications by author', async () => {
      const authorSpecs = await naturalLanguageSpecService.listSpecifications({
        author: 'AnotherAuthor'
      });

      expect(authorSpecs.every(spec => spec.author === 'AnotherAuthor')).toBe(true);
      expect(authorSpecs.length).toBeGreaterThanOrEqual(1);
    });

    it('should search specifications by query', async () => {
      const loginSpecs = await naturalLanguageSpecService.searchSpecifications('login');
      const userSpecs = await naturalLanguageSpecService.searchSpecifications('user');

      expect(loginSpecs.length).toBeGreaterThanOrEqual(1);
      expect(userSpecs.length).toBeGreaterThanOrEqual(1);
      
      expect(
        loginSpecs.some(spec => 
          spec.title.toLowerCase().includes('login') ||
          spec.overview.what.toLowerCase().includes('login')
        )
      ).toBe(true);
    });

    it('should return empty array for non-matching search', async () => {
      const specs = await naturalLanguageSpecService.searchSpecifications('nonexistentterm');
      expect(specs).toEqual([]);
    });
  });

  // 🧪 TECHNICAL PLAN GENERATION TESTS
  describe('⚙️ Technical Plan Generation', () => {
    let validSpecId: string;

    beforeEach(async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );
      validSpecId = spec.id;
      
      // Ensure validation passes
      await naturalLanguageSpecService.validateSpecification(validSpecId);
    });

    it('should generate technical plan from valid specification', async () => {
      const technicalPlan = await naturalLanguageSpecService.processSpecificationToTechnicalPlan(
        validSpecId,
        mockContext
      );

      expect(technicalPlan).toBeDefined();
      expect(technicalPlan.id).toMatch(/^tech-plan-/);
      expect(technicalPlan.specificationId).toBe(validSpecId);
      expect(technicalPlan.generated).toBeInstanceOf(Date);
      expect(Array.isArray(technicalPlan.architecture)).toBe(true);
      expect(Array.isArray(technicalPlan.components)).toBe(true);
      expect(Array.isArray(technicalPlan.implementationSteps)).toBe(true);
      expect(technicalPlan.timeline).toBeDefined();
      expect(technicalPlan.testStrategy).toBeDefined();
      expect(Array.isArray(technicalPlan.qualityGates)).toBe(true);
      expect(technicalPlan.riskAssessment).toBeDefined();
    });

    it('should update specification with technical plan reference', async () => {
      await naturalLanguageSpecService.processSpecificationToTechnicalPlan(
        validSpecId,
        mockContext
      );

      const updatedSpec = await naturalLanguageSpecService.getSpecification(validSpecId);
      
      expect(updatedSpec).toBeDefined();
      expect(updatedSpec!.technicalPlan).toBeDefined();
      expect(updatedSpec!.status).toBe('approved');
    });

    it('should store and retrieve technical plan', async () => {
      const generatedPlan = await naturalLanguageSpecService.processSpecificationToTechnicalPlan(
        validSpecId,
        mockContext
      );

      const retrievedPlan = await naturalLanguageSpecService.getTechnicalPlan(validSpecId);
      
      expect(retrievedPlan).toBeDefined();
      expect(retrievedPlan!.id).toBe(generatedPlan.id);
    });

    it('should reject invalid specifications for technical plan generation', async () => {
      // Create invalid specification
      const invalidSpec = await naturalLanguageSpecService.createSpecification(
        { title: 'Invalid Spec' },
        mockContext
      );

      await expect(
        naturalLanguageSpecService.processSpecificationToTechnicalPlan(
          invalidSpec.id,
          mockContext
        )
      ).rejects.toThrow();
    });

    it('should reject non-existent specifications', async () => {
      await expect(
        naturalLanguageSpecService.processSpecificationToTechnicalPlan(
          'non-existent-id',
          mockContext
        )
      ).rejects.toThrow();
    });
  });

  // 🧪 EXPORT/IMPORT TESTS
  describe('📤📥 Export/Import Operations', () => {
    let specId: string;

    beforeEach(async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );
      specId = spec.id;
    });

    it('should export specification as JSON', async () => {
      const jsonExport = await naturalLanguageSpecService.exportSpecification(
        specId,
        'json'
      );

      expect(typeof jsonExport).toBe('string');
      
      const parsedSpec = JSON.parse(jsonExport);
      expect(parsedSpec.id).toBe(specId);
      expect(parsedSpec.title).toBe(sampleSpec.title);
    });

    it('should export specification as Markdown', async () => {
      const markdownExport = await naturalLanguageSpecService.exportSpecification(
        specId,
        'markdown'
      );

      expect(typeof markdownExport).toBe('string');
      expect(markdownExport).toContain(`# ${sampleSpec.title}`);
      expect(markdownExport).toContain('## 🎯 Visão Geral');
      expect(markdownExport).toContain(sampleSpec.overview!.what);
    });

    it('should reject unsupported export formats', async () => {
      await expect(
        naturalLanguageSpecService.exportSpecification(specId, 'pdf' as any)
      ).rejects.toThrow();
    });

    it('should import specification from JSON', async () => {
      const jsonExport = await naturalLanguageSpecService.exportSpecification(
        specId,
        'json'
      );

      const importedSpec = await naturalLanguageSpecService.importSpecification(
        jsonExport,
        'json'
      );

      expect(importedSpec).toBeDefined();
      expect(importedSpec.id).not.toBe(specId); // Should have new ID
      expect(importedSpec.title).toBe(sampleSpec.title);
      expect(importedSpec.created).toBeInstanceOf(Date);
      expect(importedSpec.lastModified).toBeInstanceOf(Date);
    });

    it('should reject invalid JSON for import', async () => {
      await expect(
        naturalLanguageSpecService.importSpecification(
          'invalid json',
          'json'
        )
      ).rejects.toThrow();
    });

    it('should reject unsupported import formats', async () => {
      await expect(
        naturalLanguageSpecService.importSpecification(
          'some content',
          'markdown' as any
        )
      ).rejects.toThrow();
    });
  });

  // 🧪 ERROR HANDLING TESTS
  describe('🚨 Error Handling', () => {
    it('should handle validation of non-existent specification', async () => {
      await expect(
        naturalLanguageSpecService.validateSpecification('non-existent-id')
      ).rejects.toThrow('Especificação non-existent-id não encontrada');
    });

    it('should handle update of non-existent specification', async () => {
      const result = await naturalLanguageSpecService.updateSpecification(
        'non-existent-id',
        { title: 'Updated' }
      );
      
      expect(result).toBeNull();
    });

    it('should handle export of non-existent specification', async () => {
      await expect(
        naturalLanguageSpecService.exportSpecification(
          'non-existent-id',
          'json'
        )
      ).rejects.toThrow('Especificação non-existent-id não encontrada');
    });

    it('should handle technical plan retrieval for non-existent specification', async () => {
      const plan = await naturalLanguageSpecService.getTechnicalPlan('non-existent-id');
      expect(plan).toBeNull();
    });
  });

  // 🧪 PERFORMANCE TESTS
  describe('⚡ Performance Tests', () => {
    it('should create specification within reasonable time', async () => {
      const start = Date.now();
      
      await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should validate specification within reasonable time', async () => {
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );
      
      const start = Date.now();
      await naturalLanguageSpecService.validateSpecification(spec.id);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle multiple concurrent operations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        naturalLanguageSpecService.createSpecification(
          { ...sampleSpec, title: `Concurrent Spec ${i}` },
          mockContext
        )
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach((spec, i) => {
        expect(spec.title).toBe(`Concurrent Spec ${i}`);
        expect(spec.id).toBeDefined();
      });
    });
  });

  // 🧪 INTEGRATION TESTS
  describe('🔗 Integration Tests', () => {
    it('should complete full workflow: create → validate → update → generate plan', async () => {
      // Create
      const spec = await naturalLanguageSpecService.createSpecification(
        sampleSpec,
        mockContext
      );
      expect(spec.status).toBe('draft');

      // Validate
      const validation = await naturalLanguageSpecService.validateSpecification(spec.id);
      expect(validation.isValid).toBe(true);

      // Update
      const updatedSpec = await naturalLanguageSpecService.updateSpecification(
        spec.id,
        { overview: { ...spec.overview, priority: 'critical' } }
      );
      expect(updatedSpec!.overview.priority).toBe('critical');

      // Generate technical plan
      const technicalPlan = await naturalLanguageSpecService.processSpecificationToTechnicalPlan(
        spec.id,
        mockContext
      );
      expect(technicalPlan).toBeDefined();
      expect(technicalPlan.specificationId).toBe(spec.id);

      // Verify final state
      const finalSpec = await naturalLanguageSpecService.getSpecification(spec.id);
      expect(finalSpec!.status).toBe('approved');
      expect(finalSpec!.technicalPlan).toBeDefined();
    });

    it('should maintain data consistency across operations', async () => {
      const spec1 = await naturalLanguageSpecService.createSpecification(
        { ...sampleSpec, title: 'Spec 1' },
        mockContext
      );
      const spec2 = await naturalLanguageSpecService.createSpecification(
        { ...sampleSpec, title: 'Spec 2' },
        mockContext
      );

      const allSpecs = await naturalLanguageSpecService.listSpecifications();
      expect(allSpecs.some(s => s.id === spec1.id)).toBe(true);
      expect(allSpecs.some(s => s.id === spec2.id)).toBe(true);

      await naturalLanguageSpecService.deleteSpecification(spec1.id);
      
      const remainingSpecs = await naturalLanguageSpecService.listSpecifications();
      expect(remainingSpecs.some(s => s.id === spec1.id)).toBe(false);
      expect(remainingSpecs.some(s => s.id === spec2.id)).toBe(true);
    });
  });
});