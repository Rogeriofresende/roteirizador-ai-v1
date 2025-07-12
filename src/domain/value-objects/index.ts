// Domain Value Objects - Clean Architecture
// Value Objects imutáveis para regras de negócio

// Script Content Value Object
export { ScriptContent } from './ScriptContent';
export type { 
  ScriptContentProps, 
  ScriptSection, 
  ValidationResult, 
  PlatformConstraints, 
  SensitiveContentCheck, 
  SensitiveContentFinding, 
  SensitiveContentType 
} from './ScriptContent';

// User Credentials Value Object
export { UserCredentials } from './UserCredentials';
export type { 
  UserCredentialsProps, 
  AuthProvider, 
  AuthenticationCheck, 
  SecurityScore, 
  SecurityLevel, 
  CredentialSummary 
} from './UserCredentials';

// Template Metadata Value Object
export { TemplateMetadata } from './TemplateMetadata';
export type { 
  TemplateMetadataProps, 
  SkillLevel, 
  TemplateRequirements, 
  CompatibilityScore, 
  CompatibilityLevel, 
  QualityAssessment, 
  QualityLevel, 
  OptimizationType 
} from './TemplateMetadata'; 