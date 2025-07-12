// Domain Services - Clean Architecture
// Services que implementam lógica de negócio complexa

// Script Generation Domain Service
export { ScriptGenerationService } from './ScriptGenerationService';
export type { 
  ScriptGenerationRequest,
  AIGenerationRequest,
  GenerationResult,
  GenerationMetadata,
  GenerationSuggestion,
  SuggestionType,
  QualityCheck,
  IAIProvider,
  AIGenerationResult,
  IQualityAssessmentService,
  QualityAssessmentResult,
  EnhancementType
} from './ScriptGenerationService';

// User Management Domain Service
export { UserManagementService } from './UserManagementService';
export type { 
  UserRegistrationRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
  UserValidationResult,
  SecurityAuditResult,
  SecurityVulnerability,
  VulnerabilityType,
  SecurityRecommendation,
  SessionData,
  IPasswordHasher,
  IEmailService,
  IAuditLogger,
  UserEvent,
  SecurityEvent,
  AdminAction
} from './UserManagementService'; 