// Domain Entities - Clean Architecture
// Entidades principais do domínio do negócio

// User Management Domain
export { User } from './User';
export type { 
  UserProps, 
  UserPreferences, 
  SubscriptionTier, 
  AdminMetadata 
} from './User';

// Script Management Domain
export { Script } from './Script';
export type { 
  ScriptProps, 
  PlatformType, 
  FormatType, 
  ScriptStatus, 
  ScriptMetadata 
} from './Script';

// Template Management Domain
export { Template } from './Template';
export type { 
  TemplateProps, 
  TemplateCategory, 
  TemplateDifficulty, 
  TemplateDuration, 
  TemplateSection, 
  TemplatePlaceholder, 
  PlaceholderType, 
  PlaceholderValidation, 
  TemplateAuthor, 
  TemplateMetadata 
} from './Template';

// Project Management Domain
export { Project } from './Project';
export type { 
  ProjectProps, 
  ProjectStatus, 
  ProjectVisibility, 
  ProjectRole, 
  ProjectCollaborator, 
  CollaboratorStatus, 
  ProjectPermissions, 
  ProjectSettings, 
  ProjectNotificationSettings, 
  ProjectMetadata 
} from './Project'; 