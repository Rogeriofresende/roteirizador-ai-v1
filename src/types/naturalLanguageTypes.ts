/**
 * 🎯 NATURAL LANGUAGE TYPES
 * 
 * Definições de tipos TypeScript para o sistema de especificações em linguagem natural
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Alpha - Requirements Analyst + Backend
 * @created 2025-07-18T14:45:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

// 🎯 NATURAL LANGUAGE SPECIFICATION CORE TYPES
export interface NaturalLanguageSpecification {
  id: string;
  title: string;
  version: string;
  created: Date;
  lastModified: Date;
  author: string;
  status: SpecificationStatus;
  
  // Core specification sections
  overview: FeatureOverview;
  userExperience: UserExperience;
  technicalBehavior: TechnicalBehavior;
  successCriteria: SuccessCriteria;
  constraints: ConstraintsAndAssumptions;
  
  // Metadata
  metadata: SpecificationMetadata;
  validation: ValidationResult;
  technicalPlan?: TechnicalPlan;
}

// 📊 SPECIFICATION STATUS
export type SpecificationStatus = 
  | 'draft'
  | 'review'
  | 'approved'
  | 'implementing'
  | 'completed'
  | 'deprecated';

// 🎯 FEATURE OVERVIEW
export interface FeatureOverview {
  what: string;           // Descrição em 1-2 frases
  why: string;            // Justificativa business/user value
  who: string[];          // Personas que usarão
  when: string;           // Timeline e dependencies
  priority: Priority;
  complexity: Complexity;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Complexity = 'simple' | 'medium' | 'complex' | 'enterprise';

// 🎨 USER EXPERIENCE
export interface UserExperience {
  userJourney: UserJourneyStep[];
  happyPath: HappyPathScenario;
  edgeCases: EdgeCaseScenario[];
  userPersonas: UserPersona[];
}

export interface UserJourneyStep {
  step: number;
  userAction: string;
  systemResponse: string;
  userResult: string;
  nextActions: string[];
}

export interface HappyPathScenario {
  goal: string;
  expectedOutcome: string;
  userSatisfaction: string;
  successMetrics: string[];
}

export interface EdgeCaseScenario {
  scenario: string;
  condition: string;
  expectedBehavior: string;
  fallbackOptions: string[];
}

export interface UserPersona {
  name: string;
  role: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  needs: string[];
  painPoints: string[];
}

// 🔧 TECHNICAL BEHAVIOR
export interface TechnicalBehavior {
  shouldBehaviors: BehaviorRule[];
  shouldNotBehaviors: AntiBehaviorRule[];
  performanceRequirements: PerformanceRequirement[];
  integrationPoints: IntegrationPoint[];
}

export interface BehaviorRule {
  behavior: string;
  condition: string;
  priority: Priority;
  testable: boolean;
}

export interface AntiBehaviorRule {
  antiBehavior: string;
  condition: string;
  reasoning: string;
  priority: Priority;
}

export interface PerformanceRequirement {
  metric: string;
  target: string;
  measurement: string;
  priority: Priority;
}

export interface IntegrationPoint {
  service: string;
  type: 'api' | 'database' | 'external' | 'internal';
  dependency: boolean;
  requirements: string[];
}

// 📊 SUCCESS CRITERIA
export interface SuccessCriteria {
  functional: FunctionalCriteria[];
  nonFunctional: NonFunctionalCriteria[];
  businessMetrics: BusinessMetric[];
  userSatisfaction: UserSatisfactionMetric[];
}

export interface FunctionalCriteria {
  outcome: string;
  measurable: boolean;
  testable: boolean;
  acceptance: string;
}

export interface NonFunctionalCriteria {
  type: 'performance' | 'accessibility' | 'security' | 'usability' | 'reliability';
  requirement: string;
  target: string;
  measurement: string;
}

export interface BusinessMetric {
  metric: string;
  baseline: string;
  target: string;
  timeline: string;
}

export interface UserSatisfactionMetric {
  metric: string;
  method: string;
  target: string;
  frequency: string;
}

// 🚨 CONSTRAINTS & ASSUMPTIONS
export interface ConstraintsAndAssumptions {
  technicalConstraints: TechnicalConstraint[];
  businessConstraints: BusinessConstraint[];
  assumptions: Assumption[];
  dependencies: Dependency[];
}

export interface TechnicalConstraint {
  constraint: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
  workarounds: string[];
}

export interface BusinessConstraint {
  constraint: string;
  type: 'budget' | 'timeline' | 'resources' | 'legal' | 'compliance';
  value: string;
  flexibility: 'none' | 'low' | 'medium' | 'high';
}

export interface Assumption {
  assumption: string;
  confidence: 'low' | 'medium' | 'high';
  validation: string;
  impact: string;
}

export interface Dependency {
  name: string;
  type: 'internal' | 'external' | 'team' | 'technology';
  critical: boolean;
  timeline: string;
  owner: string;
}

// 📋 SPECIFICATION METADATA
export interface SpecificationMetadata {
  project: string;
  epic: string;
  sprint?: string;
  labels: string[];
  reviewers: string[];
  stakeholders: string[];
  relatedSpecs: string[];
  changeHistory: ChangeHistoryEntry[];
}

export interface ChangeHistoryEntry {
  version: string;
  date: Date;
  author: string;
  changes: string[];
  reason: string;
}

// ✅ VALIDATION RESULT
export interface ValidationResult {
  isValid: boolean;
  score: number;
  completeness: number;
  clarity: number;
  testability: number;
  issues: ValidationIssue[];
  suggestions: string[];
  lastValidated: Date;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'suggestion';
  section: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  fixable: boolean;
}

// 🔧 TECHNICAL PLAN (Generated from NL Spec)
export interface TechnicalPlan {
  id: string;
  specificationId: string;
  generated: Date;
  version: string;
  
  // Architecture
  architecture: ArchitectureDecision[];
  components: ComponentSpecification[];
  dataModel: DataModelSpecification[];
  
  // Implementation
  implementationSteps: ImplementationStep[];
  timeline: Timeline;
  resources: ResourceRequirement[];
  
  // Quality
  testStrategy: TestStrategy;
  qualityGates: QualityGate[];
  riskAssessment: RiskAssessment;
}

export interface ArchitectureDecision {
  decision: string;
  reasoning: string;
  alternatives: string[];
  tradeoffs: string[];
  impact: 'low' | 'medium' | 'high';
}

export interface ComponentSpecification {
  name: string;
  type: 'component' | 'service' | 'utility' | 'page' | 'hook';
  purpose: string;
  interfaces: InterfaceSpecification[];
  dependencies: string[];
  testRequirements: string[];
}

export interface InterfaceSpecification {
  name: string;
  type: 'props' | 'api' | 'event' | 'data';
  specification: Record<string, any>;
  validation: string[];
}

export interface DataModelSpecification {
  entity: string;
  attributes: AttributeSpecification[];
  relationships: RelationshipSpecification[];
  constraints: string[];
}

export interface AttributeSpecification {
  name: string;
  type: string;
  required: boolean;
  validation: string[];
  description: string;
}

export interface RelationshipSpecification {
  target: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description: string;
}

export interface ImplementationStep {
  step: number;
  title: string;
  description: string;
  deliverables: string[];
  dependencies: string[];
  effort: string;
  assignee?: string;
}

export interface Timeline {
  phases: TimelinePhase[];
  milestones: Milestone[];
  criticalPath: string[];
}

export interface TimelinePhase {
  name: string;
  start: Date;
  end: Date;
  deliverables: string[];
  dependencies: string[];
}

export interface Milestone {
  name: string;
  date: Date;
  criteria: string[];
  deliverables: string[];
}

export interface ResourceRequirement {
  role: string;
  effort: string;
  skills: string[];
  timeline: string;
}

export interface TestStrategy {
  unitTests: TestRequirement[];
  integrationTests: TestRequirement[];
  e2eTests: TestRequirement[];
  performanceTests: TestRequirement[];
}

export interface TestRequirement {
  scenario: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  priority: Priority;
  automation: boolean;
  description: string;
}

export interface QualityGate {
  name: string;
  criteria: string[];
  metrics: QualityMetric[];
  blocking: boolean;
}

export interface QualityMetric {
  metric: string;
  target: string;
  measurement: string;
  tooling: string;
}

export interface RiskAssessment {
  risks: Risk[];
  mitigation: MitigationStrategy[];
  contingencies: ContingencyPlan[];
}

export interface Risk {
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: 'technical' | 'business' | 'resource' | 'external';
}

export interface MitigationStrategy {
  riskId: string;
  strategy: string;
  owner: string;
  timeline: string;
}

export interface ContingencyPlan {
  trigger: string;
  actions: string[];
  resources: string[];
  timeline: string;
}

// 🎯 PROCESSING TYPES
export interface ProcessingContext {
  project: string;
  framework: string;
  designSystem: string;
  team: string;
  preferences: ProcessingPreferences;
}

export interface ProcessingPreferences {
  codeStyle: CodeStylePreferences;
  testingApproach: TestingApproach;
  architecture: ArchitecturePreferences;
  documentation: DocumentationPreferences;
}

export interface CodeStylePreferences {
  language: string;
  framework: string;
  linting: string;
  formatting: string;
  conventions: string[];
}

export interface TestingApproach {
  strategy: 'tdd' | 'bdd' | 'atdd' | 'hybrid';
  coverage: number;
  tools: string[];
  automation: boolean;
}

export interface ArchitecturePreferences {
  patterns: string[];
  principles: string[];
  scalability: 'simple' | 'medium' | 'enterprise';
  performance: 'basic' | 'optimized' | 'high-performance';
}

export interface DocumentationPreferences {
  style: 'minimal' | 'comprehensive' | 'agile';
  formats: string[];
  automation: boolean;
  maintenance: 'manual' | 'automated';
}

// 🚀 EXPORT TYPES
export type {
  NaturalLanguageSpecification as NLSpec,
  TechnicalPlan as TechPlan,
  ValidationResult as ValidationResult,
  ProcessingContext as ProcessingContext
};

// 🎯 UTILITY TYPES
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 📊 CONSTANTS
export const SPECIFICATION_TEMPLATES = {
  COMPONENT: 'component-specification',
  PAGE: 'page-specification', 
  SERVICE: 'service-specification',
  INTEGRATION: 'integration-specification',
  FEATURE: 'feature-specification'
} as const;

export const VALIDATION_THRESHOLDS = {
  MIN_COMPLETENESS: 0.8,
  MIN_CLARITY: 0.7,
  MIN_TESTABILITY: 0.9,
  MIN_OVERALL_SCORE: 0.75
} as const;

export const PROCESSING_TIMEOUTS = {
  VALIDATION: 30000,
  GENERATION: 60000,
  PARSING: 10000
} as const;