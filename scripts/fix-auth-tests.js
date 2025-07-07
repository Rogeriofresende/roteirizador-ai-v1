#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script para corrigir testes de auth automaticamente
console.log('🛠️  Corrigindo testes com problemas de AuthContext...\n');

// Criar diretório de mocks se não existir
const mocksDir = path.join(__dirname, '../src/__tests__/mocks');
if (!fs.existsSync(mocksDir)) {
  fs.mkdirSync(mocksDir, { recursive: true });
  console.log('✅ Diretório de mocks criado');
}

// Criar arquivo de mocks para auth
const authMocksContent = `import { ExtendedUser, UserPermissions, AuthContextType } from '../../types/auth';

export const createMockExtendedUser = (overrides?: Partial<ExtendedUser>): ExtendedUser => ({
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  role: 'user',
  permissions: {
    canCreateProjects: true,
    canEditOwnProjects: true,
    canDeleteOwnProjects: true,
    canShareProjects: true,
    canViewAdminDashboard: false,
    canManageUsers: false,
    canViewSystemLogs: false,
    canModifySystemSettings: false,
    canViewAdvancedAnalytics: false,
    canAccessBetaFeatures: false,
    canExportProjects: true,
    canUseAIFeatures: true,
  },
  createdAt: new Date(),
  lastLoginAt: new Date(),
  lastActiveAt: new Date(),
  preferences: {
    theme: 'auto',
    language: 'pt-BR',
    notifications: true,
    analyticsOptIn: true,
  },
  isActive: true,
  isBlocked: false,
  ...overrides
});

export const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
  currentUser: createMockExtendedUser(),
  firebaseUser: null,
  loading: false,
  isFirebaseEnabled: false,
  isAdmin: false,
  isUser: true,
  hasRole: jest.fn(() => false),
  hasPermission: jest.fn(() => false),
  checkPermissions: jest.fn(() => createMockExtendedUser().permissions),
  refreshUserData: jest.fn(),
  updateUserPreferences: jest.fn(),
  ...overrides
});
`;

fs.writeFileSync(path.join(mocksDir, 'authMocks.ts'), authMocksContent);
console.log('✅ Arquivo authMocks.ts criado');

// Lista de arquivos de teste para corrigir
const testFiles = [
  'src/__tests__/GeneratorPage.test.tsx',
  'src/__tests__/Navbar.test.tsx'
];

// Função para corrigir imports e mocks
function fixTestFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Adicionar import do mock helper
  if (!content.includes('createMockAuthContext')) {
    const importLine = "import { createMockAuthContext } from './mocks/authMocks';";
    content = content.replace(
      /import { useAuth } from '\.\.\/contexts\/AuthContext';/,
      `import { useAuth } from '../contexts/AuthContext';\n${importLine}`
    );
  }
  
  // Substituir mocks antigos
  content = content.replace(
    /mockUseAuth\.mockReturnValue\({[\s\S]*?}\);/g,
    'mockUseAuth.mockReturnValue(createMockAuthContext());'
  );
  
  // Remover propriedades inexistentes
  content = content.replace(/signInWithGoogle: jest\.fn\(\),?\s*/g, '');
  content = content.replace(/signInWithEmail: jest\.fn\(\),?\s*/g, '');
  content = content.replace(/signUpWithEmail: jest\.fn\(\),?\s*/g, '');
  content = content.replace(/logout: jest\.fn\(\),?\s*/g, '');
  content = content.replace(/updateUserProfile: jest\.fn\(\),?\s*/g, '');
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Corrigido: ${filePath}`);
}

// Corrigir todos os arquivos
testFiles.forEach(fixTestFile);

console.log('\n✅ Correção de testes concluída!');
console.log('Execute "npm test" para verificar se os testes passam agora.'); 