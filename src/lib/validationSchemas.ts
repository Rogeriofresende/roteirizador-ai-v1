/**
 * 📋 VALIDATION SCHEMAS
 * Comprehensive Zod schemas for all form validations
 */

import { z } from 'zod';

// =============================================================================
// COMMON VALIDATORS
// =============================================================================

export const commonValidators = {
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('Formato de e-mail inválido')
    .max(254, 'E-mail muito longo'),

  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),

  url: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),

  phoneNumber: z
    .string()
    .regex(
      /^(?:\+55\s?)?(?:\(\d{2}\)\s?|\d{2}\s?)(?:9\s?)?\d{4}-?\d{4}$/,
      'Número de telefone inválido'
    )
    .optional(),

  nonEmptyString: (fieldName: string, minLength = 1, maxLength = 500) =>
    z
      .string()
      .min(minLength, `${fieldName} é obrigatório`)
      .max(maxLength, `${fieldName} muito longo`)
      .trim(),

  positiveNumber: z
    .number()
    .positive('Deve ser um número positivo')
    .finite('Deve ser um número válido'),

  apiKey: z
    .string()
    .min(10, 'API key deve ter pelo menos 10 caracteres')
    .max(200, 'API key muito longa')
    .regex(/^[A-Za-z0-9_-]+$/, 'API key contém caracteres inválidos'),
};

// =============================================================================
// USER AUTHENTICATION SCHEMAS
// =============================================================================

export const authSchemas = {
  login: z.object({
    email: commonValidators.email,
    password: z
      .string()
      .min(1, 'Senha é obrigatória'),
    rememberMe: z.boolean().optional(),
  }),

  signup: z.object({
    name: commonValidators.nonEmptyString('Nome', 2, 100),
    email: commonValidators.email,
    password: commonValidators.password,
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'Você deve aceitar os termos de uso'),
  }).refine(
    data => data.password === data.confirmPassword,
    {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    }
  ),

  forgotPassword: z.object({
    email: commonValidators.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: commonValidators.password,
    confirmPassword: z.string(),
  }).refine(
    data => data.password === data.confirmPassword,
    {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    }
  ),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: commonValidators.password,
    confirmNewPassword: z.string(),
  }).refine(
    data => data.newPassword === data.confirmNewPassword,
    {
      message: 'As senhas não coincidem',
      path: ['confirmNewPassword'],
    }
  ),
};

// =============================================================================
// SCRIPT GENERATION SCHEMAS
// =============================================================================

export const platformEnum = z.enum([
  'youtube',
  'instagram',
  'tiktok',
  'linkedin',
  'twitter',
  'facebook',
  'podcast',
  'blog',
  'website',
  'outros'
]);

export const categoryEnum = z.enum([
  'educacional',
  'entretenimento',
  'negocio',
  'tecnologia',
  'saude',
  'lifestyle',
  'viagem',
  'culinaria',
  'moda',
  'esporte',
  'musica',
  'arte',
  'outros'
]);

export const toneEnum = z.enum([
  'formal',
  'casual',
  'amigavel',
  'profissional',
  'humoristico',
  'inspirador',
  'educativo',
  'persuasivo',
  'conversacional'
]);

export const scriptSchemas = {
  generation: z.object({
    // Basic Information
    title: commonValidators.nonEmptyString('Título', 5, 200),
    description: commonValidators.nonEmptyString('Descrição', 10, 1000),
    platform: platformEnum,
    category: categoryEnum,
    
    // Content Details
    duration: z
      .number()
      .min(15, 'Duração mínima é 15 segundos')
      .max(3600, 'Duração máxima é 1 hora')
      .int('Duração deve ser um número inteiro'),
    
    targetAudience: commonValidators.nonEmptyString('Público-alvo', 5, 200),
    tone: toneEnum,
    
    // Optional Fields
    keywords: z
      .array(z.string().min(1).max(50))
      .max(10, 'Máximo 10 palavras-chave')
      .optional(),
    
    references: z
      .array(commonValidators.url)
      .max(5, 'Máximo 5 referências')
      .optional(),
    
    // Advanced Options
    includeIntro: z.boolean().default(true),
    includeOutro: z.boolean().default(true),
    includeCTA: z.boolean().default(true),
    
    // Custom Requirements
    specificRequirements: z
      .string()
      .max(500, 'Requisitos específicos muito longos')
      .optional(),
  }),

  save: z.object({
    scriptId: z.string().optional(),
    title: commonValidators.nonEmptyString('Título', 1, 200),
    content: commonValidators.nonEmptyString('Conteúdo', 10, 10000),
    metadata: z.object({
      platform: platformEnum,
      category: categoryEnum,
      duration: z.number().positive(),
      wordCount: z.number().positive(),
      characterCount: z.number().positive(),
      createdAt: z.string().datetime().optional(),
      updatedAt: z.string().datetime().optional(),
    }),
    tags: z
      .array(z.string().min(1).max(30))
      .max(20, 'Máximo 20 tags')
      .optional(),
  }),

  edit: z.object({
    scriptId: z.string().min(1, 'ID do script é obrigatório'),
    title: commonValidators.nonEmptyString('Título', 1, 200),
    content: commonValidators.nonEmptyString('Conteúdo', 10, 10000),
    tags: z
      .array(z.string().min(1).max(30))
      .max(20, 'Máximo 20 tags')
      .optional(),
  }),
};

// =============================================================================
// USER PROFILE SCHEMAS
// =============================================================================

export const profileSchemas = {
  update: z.object({
    name: commonValidators.nonEmptyString('Nome', 2, 100),
    email: commonValidators.email,
    bio: z
      .string()
      .max(500, 'Bio muito longa')
      .optional(),
    website: commonValidators.url,
    phone: commonValidators.phoneNumber,
    location: z
      .string()
      .max(100, 'Localização muito longa')
      .optional(),
    avatar: z
      .string()
      .url('URL do avatar inválida')
      .optional(),
  }),

  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(['pt', 'en', 'es']).default('pt'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      marketing: z.boolean().default(false),
    }),
    defaultPlatform: platformEnum.optional(),
    defaultCategory: categoryEnum.optional(),
    defaultTone: toneEnum.optional(),
  }),
};

// =============================================================================
// API & INTEGRATION SCHEMAS
// =============================================================================

export const integrationSchemas = {
  geminiApiKey: z.object({
    apiKey: commonValidators.apiKey,
    testConnection: z.boolean().default(false),
  }),

  webhookUrl: z.object({
    url: z
      .string()
      .url('URL do webhook inválida')
      .startsWith('https://', 'Webhook deve usar HTTPS'),
    events: z
      .array(z.enum(['script.created', 'script.updated', 'script.deleted']))
      .min(1, 'Selecione pelo menos um evento'),
    secret: z
      .string()
      .min(16, 'Secret deve ter pelo menos 16 caracteres')
      .optional(),
  }),

  exportConfig: z.object({
    format: z.enum(['json', 'csv', 'docx', 'pdf']),
    includeMetadata: z.boolean().default(true),
    dateRange: z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    }).optional(),
    scriptIds: z
      .array(z.string())
      .optional(),
  }),
};

// =============================================================================
// FEEDBACK & SUPPORT SCHEMAS
// =============================================================================

export const supportSchemas = {
  feedback: z.object({
    type: z.enum(['bug', 'feature', 'improvement', 'other']),
    title: commonValidators.nonEmptyString('Título', 5, 100),
    description: commonValidators.nonEmptyString('Descrição', 10, 2000),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    category: z.enum(['ui', 'performance', 'functionality', 'content', 'other']),
    steps: z
      .string()
      .max(1000, 'Passos muito longos')
      .optional(),
    expected: z
      .string()
      .max(500, 'Resultado esperado muito longo')
      .optional(),
    actual: z
      .string()
      .max(500, 'Resultado atual muito longo')
      .optional(),
    browserInfo: z.object({
      userAgent: z.string(),
      url: z.string().url(),
      timestamp: z.string().datetime(),
    }).optional(),
  }),

  contactSupport: z.object({
    name: commonValidators.nonEmptyString('Nome', 2, 100),
    email: commonValidators.email,
    subject: commonValidators.nonEmptyString('Assunto', 5, 200),
    message: commonValidators.nonEmptyString('Mensagem', 20, 3000),
    urgency: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    attachments: z
      .array(z.object({
        name: z.string(),
        size: z.number().max(10 * 1024 * 1024, 'Arquivo muito grande (máximo 10MB)'),
        type: z.string(),
      }))
      .max(3, 'Máximo 3 anexos')
      .optional(),
  }),
};

// =============================================================================
// SEARCH & FILTER SCHEMAS
// =============================================================================

export const searchSchemas = {
  scripts: z.object({
    query: z
      .string()
      .max(200, 'Consulta muito longa')
      .optional(),
    platform: platformEnum.optional(),
    category: categoryEnum.optional(),
    dateFrom: z
      .string()
      .datetime()
      .optional(),
    dateTo: z
      .string()
      .datetime()
      .optional(),
    sortBy: z
      .enum(['title', 'createdAt', 'updatedAt', 'platform', 'category'])
      .default('updatedAt'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .default('desc'),
    page: z
      .number()
      .int()
      .positive()
      .default(1),
    limit: z
      .number()
      .int()
      .min(5)
      .max(100)
      .default(20),
  }),

  tags: z.object({
    query: z
      .string()
      .min(1, 'Digite pelo menos 1 caractere')
      .max(50, 'Consulta muito longa'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10),
  }),
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validates data against a schema and returns either the validated data or errors
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

/**
 * Safe parse that returns null for invalid data
 */
export function safeParseData<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Validates partial data for progressive form validation
 */
export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: Partial<T>
): { [K in keyof T]?: string[] } {
  const errors: { [K in keyof T]?: string[] } = {};
  
  try {
    schema.partial().parse(data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      error.issues.forEach(issue => {
        const field = issue.path[0] as keyof T;
        if (field) {
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field]!.push(issue.message);
        }
      });
    }
  }
  
  return errors;
}

/**
 * Creates a type-safe form validation hook
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validateData(schema, data),
    safeParse: (data: unknown) => safeParseData(schema, data),
    validatePartial: (data: Partial<T>) => validatePartial(schema, data),
  };
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type AuthLoginData = z.infer<typeof authSchemas.login>;
export type AuthSignupData = z.infer<typeof authSchemas.signup>;
export type ScriptGenerationData = z.infer<typeof scriptSchemas.generation>;
export type ScriptSaveData = z.infer<typeof scriptSchemas.save>;
export type ProfileUpdateData = z.infer<typeof profileSchemas.update>;
export type FeedbackData = z.infer<typeof supportSchemas.feedback>;
export type SearchScriptsData = z.infer<typeof searchSchemas.scripts>;

// Pre-built validators for common use cases
export const validators = {
  auth: {
    login: createValidator(authSchemas.login),
    signup: createValidator(authSchemas.signup),
    forgotPassword: createValidator(authSchemas.forgotPassword),
    resetPassword: createValidator(authSchemas.resetPassword),
    changePassword: createValidator(authSchemas.changePassword),
  },
  script: {
    generation: createValidator(scriptSchemas.generation),
    save: createValidator(scriptSchemas.save),
    edit: createValidator(scriptSchemas.edit),
  },
  profile: {
    update: createValidator(profileSchemas.update),
    preferences: createValidator(profileSchemas.preferences),
  },
  integration: {
    geminiApiKey: createValidator(integrationSchemas.geminiApiKey),
    webhookUrl: createValidator(integrationSchemas.webhookUrl),
    exportConfig: createValidator(integrationSchemas.exportConfig),
  },
  support: {
    feedback: createValidator(supportSchemas.feedback),
    contactSupport: createValidator(supportSchemas.contactSupport),
  },
  search: {
    scripts: createValidator(searchSchemas.scripts),
    tags: createValidator(searchSchemas.tags),
  },
}; 