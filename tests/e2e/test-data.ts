// Dados de teste para testes E2E
export const testUsers = {
  valid: {
    email: 'teste.e2e@roteirizar.com',
    password: 'TestPass123!',
    name: 'Usuário E2E Teste'
  },
  invalid: {
    email: 'invalid-email',
    password: '123',
    name: ''
  },
  existing: {
    email: 'usuario.existente@roteirizar.com',
    password: 'ExistingPass123!',
    name: 'Usuário Existente'
  }
};

export const scriptData = {
  youtube: {
    topic: 'Como criar conteúdo viral no YouTube',
    duration: '60 segundos',
    style: 'Tutorial',
    audience: 'Criadores de conteúdo',
    expectedKeywords: ['viral', 'YouTube', 'conteúdo']
  },
  instagram: {
    topic: 'Dicas de fotografia para Instagram',
    duration: '30 segundos',
    style: 'Informativo',
    audience: 'Fotógrafos iniciantes',
    expectedKeywords: ['fotografia', 'Instagram', 'dicas']
  },
  tiktok: {
    topic: 'Trend de dança para TikTok',
    duration: '15 segundos',
    style: 'Entretenimento',
    audience: 'Jovens',
    expectedKeywords: ['dança', 'TikTok', 'trend']
  },
  linkedin: {
    topic: 'Networking profissional eficaz',
    duration: '90 segundos',
    style: 'Profissional',
    audience: 'Profissionais',
    expectedKeywords: ['networking', 'profissional', 'carreira']
  },
  twitter: {
    topic: 'Thread sobre produtividade',
    duration: '5 tweets',
    style: 'Informativo',
    audience: 'Empreendedores',
    expectedKeywords: ['produtividade', 'thread', 'dicas']
  }
};

export const platforms = [
  'youtube',
  'instagram', 
  'tiktok',
  'linkedin',
  'twitter'
] as const;

export type Platform = typeof platforms[number];

export const errorMessages = {
  requiredField: 'Este campo é obrigatório',
  invalidEmail: 'Email inválido',
  weakPassword: 'Senha deve ter pelo menos 6 caracteres',
  userNotFound: 'Usuário não encontrado',
  wrongPassword: 'Senha incorreta',
  apiError: 'Erro na geração do roteiro. Tente novamente.'
}; 