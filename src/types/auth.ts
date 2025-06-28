/**
 * Tipos de Autenticação - Sistema de Roles
 * Roteirar IA - Melhorias UX/UI Fase 1
 */

import type { User as FirebaseUser } from 'firebase/auth';

// === ROLES E PERMISSÕES ===

export type UserRole = 'user' | 'admin';

export interface UserPermissions {
  // Permissões de projetos
  canCreateProjects: boolean;
  canEditOwnProjects: boolean;
  canDeleteOwnProjects: boolean;
  canShareProjects: boolean;
  
  // Permissões administrativas
  canViewAdminDashboard: boolean;
  canManageUsers: boolean;
  canViewSystemLogs: boolean;
  canModifySystemSettings: boolean;
  canViewAdvancedAnalytics: boolean;
  
  // Permissões especiais
  canAccessBetaFeatures: boolean;
  canExportProjects: boolean;
  canUseAIFeatures: boolean;
}

// === USER INTERFACE ESTENDIDA ===

export interface ExtendedUser {
  // Dados básicos do Firebase
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  
  // Dados estendidos
  role: UserRole;
  permissions: UserPermissions;
  
  // Metadados
  createdAt: Date;
  lastLoginAt: Date;
  lastActiveAt: Date;
  
  // Configurações
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    analyticsOptIn: boolean;
  };
  
  // Status
  isActive: boolean;
  isBlocked: boolean;
  
  // Admin específico
  adminMetadata?: {
    adminSince: Date;
    lastAdminAction: Date;
    adminNotes?: string;
  };
}

// === AUTH CONTEXT TYPE ===

export interface AuthContextType {
  // User state
  currentUser: ExtendedUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isFirebaseEnabled: boolean;
  
  // Role helpers
  isAdmin: boolean;
  isUser: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  
  // Auth actions
  checkPermissions: () => UserPermissions;
  refreshUserData: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<ExtendedUser['preferences']>) => Promise<void>;
}

// === ROLE CONFIGURATION ===

export interface RoleConfig {
  admins: string[]; // Lista de emails de administradores
  defaultPermissions: Record<UserRole, UserPermissions>;
  permissionGroups: Record<string, Partial<UserPermissions>>;
}

// === ADMIN USERS CONFIGURATION ===
// Lista de emails que têm permissão de administrador
export const ADMIN_EMAILS: string[] = [
  'admin@roteirar-ia.com',
  'rogerio@roteirar-ia.com',
  // Adicione outros emails de admin aqui
];

// === DEFAULT PERMISSIONS ===

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  // Projetos
  canCreateProjects: true,
  canEditOwnProjects: true,
  canDeleteOwnProjects: true,
  canShareProjects: true,
  
  // Admin (negado para users)
  canViewAdminDashboard: false,
  canManageUsers: false,
  canViewSystemLogs: false,
  canModifySystemSettings: false,
  canViewAdvancedAnalytics: false,
  
  // Especiais
  canAccessBetaFeatures: false,
  canExportProjects: true,
  canUseAIFeatures: true,
};

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  // Projetos (admin tem todas)
  canCreateProjects: true,
  canEditOwnProjects: true,
  canDeleteOwnProjects: true,
  canShareProjects: true,
  
  // Admin (todas liberadas)
  canViewAdminDashboard: true,
  canManageUsers: true,
  canViewSystemLogs: true,
  canModifySystemSettings: true,
  canViewAdvancedAnalytics: true,
  
  // Especiais (admin tem acesso a tudo)
  canAccessBetaFeatures: true,
  canExportProjects: true,
  canUseAIFeatures: true,
};

// === ROLE DETECTION HELPERS ===

export const isAdminEmail = (email: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const getUserRole = (email: string | null): UserRole => {
  return isAdminEmail(email) ? 'admin' : 'user';
};

export const getPermissionsForRole = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return DEFAULT_ADMIN_PERMISSIONS;
    case 'user':
    default:
      return DEFAULT_USER_PERMISSIONS;
  }
};

// === ROUTE PROTECTION TYPES ===

export interface RouteProtectionProps {
  children: React.ReactElement;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermissions?: (keyof UserPermissions)[];
  fallback?: React.ReactElement;
  redirectTo?: string;
}

// === ADMIN DASHBOARD TYPES ===

export interface AdminDashboardData {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    adminUsers: number;
  };
  
  systemStats: {
    uptime: string;
    responseTime: number;
    errorRate: number;
    lastDeployment: Date;
  };
  
  projectStats: {
    totalProjects: number;
    projectsToday: number;
    averageProjectsPerUser: number;
    mostUsedPlatforms: Record<string, number>;
  };
  
  performanceMetrics: {
    avgLoadTime: number;
    avgApiResponseTime: number;
    errorLogs: number;
    activeConnections: number;
  };
}

// === USER MANAGEMENT TYPES ===

export interface UserManagementItem {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  projectCount: number;
  
  // Admin actions
  actions: {
    canBlock: boolean;
    canUnblock: boolean;
    canMakeAdmin: boolean;
    canRemoveAdmin: boolean;
    canDelete: boolean;
  };
}

export interface UserManagementFilters {
  search?: string;
  role?: UserRole | 'all';
  status?: 'active' | 'blocked' | 'all';
  sortBy: 'email' | 'createdAt' | 'lastLoginAt' | 'projectCount';
  sortOrder: 'asc' | 'desc';
  limit: number;
  offset: number;
}

// === SYSTEM LOGS TYPES ===

export interface SystemLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'auth' | 'api' | 'database' | 'system' | 'user_action';
  message: string;
  details?: any;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
}

export interface SystemLogFilters {
  level?: SystemLogEntry['level'][];
  category?: SystemLogEntry['category'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  userId?: string;
  limit: number;
  offset: number;
}

// === NOTIFICATION TYPES ===

export interface AdminNotification {
  id: string;
  type: 'user_registered' | 'system_error' | 'security_alert' | 'performance_issue';
  title: string;
  message: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  actionRequired?: boolean;
  actionUrl?: string;
}

// === EXPORT TYPES ===

export type {
  FirebaseUser,
};

export default {
  ADMIN_EMAILS,
  DEFAULT_USER_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  isAdminEmail,
  getUserRole,
  getPermissionsForRole,
}; 