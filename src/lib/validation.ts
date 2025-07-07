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

  nonEmptyString: (fieldName: string, minLength = 1, maxLength = 500) =>
    z
      .string()
      .min(minLength, `${fieldName} é obrigatório`)
      .max(maxLength, `${fieldName} muito longo`)
      .trim(),

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
    password: z.string().min(1, 'Senha é obrigatória'),
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
  'outros'
]);

export const categoryEnum = z.enum([
  'educacional',
  'entretenimento', 
  'negocio',
  'tecnologia',
  'saude',
  'lifestyle',
  'outros'
]);

export const scriptSchemas = {
  generation: z.object({
    title: commonValidators.nonEmptyString('Título', 5, 200),
    description: commonValidators.nonEmptyString('Descrição', 10, 1000),
    platform: platformEnum,
    category: categoryEnum,
    duration: z
      .number()
      .min(15, 'Duração mínima é 15 segundos')
      .max(3600, 'Duração máxima é 1 hora')
      .int('Duração deve ser um número inteiro'),
    targetAudience: commonValidators.nonEmptyString('Público-alvo', 5, 200),
  }),

  save: z.object({
    title: commonValidators.nonEmptyString('Título', 1, 200),
    content: commonValidators.nonEmptyString('Conteúdo', 10, 10000),
    platform: platformEnum,
    category: categoryEnum,
  }),
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validateData(schema, data),
    safeParse: (data: unknown) => {
      try {
        return schema.parse(data);
      } catch {
        return null;
      }
    },
  };
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type AuthLoginData = z.infer<typeof authSchemas.login>;
export type AuthSignupData = z.infer<typeof authSchemas.signup>;
export type ScriptGenerationData = z.infer<typeof scriptSchemas.generation>;
export type ScriptSaveData = z.infer<typeof scriptSchemas.save>;

// Pre-built validators
export const validators = {
  auth: {
    login: createValidator(authSchemas.login),
    signup: createValidator(authSchemas.signup),
  },
  script: {
    generation: createValidator(scriptSchemas.generation),
    save: createValidator(scriptSchemas.save),
  },
}; 