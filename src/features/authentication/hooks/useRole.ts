/**
 * Hook useRole - Verificação de Roles e Permissões
 * Roteirar IA - Melhorias UX/UI Fase 1
 */

import { useAuth } from '../contexts/AuthContext';
import { UserRole, UserPermissions } from '../types/auth';
import { createLogger } from '../utils/logger';

const logger = createLogger('useRole');

interface RoleCheckOptions {
  requiredRole?: UserRole;
  requiredPermissions?: (keyof UserPermissions)[];
  allowedRoles?: UserRole[];
  requireAll?: boolean;
  logCheck?: boolean;
}

interface UseRoleReturn {
  // Current user info
  currentUserRole: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  
  // Permission checkers
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllPermissions: (permissions: (keyof UserPermissions)[]) => boolean;
  hasAnyPermission: (permissions: (keyof UserPermissions)[]) => boolean;
  
  // Complex access checks
  checkAccess: (options: RoleCheckOptions) => boolean;
  checkMultipleAccess: (optionsList: RoleCheckOptions[]) => boolean[];
  
  // Convenience permission checkers
  canCreateProjects: boolean;
  canEditOwnProjects: boolean;
  canDeleteOwnProjects: boolean;
  canShareProjects: boolean;
  canViewAdminDashboard: boolean;
  canManageUsers: boolean;
  canViewSystemLogs: boolean;
  canModifySystemSettings: boolean;
  canViewAdvancedAnalytics: boolean;
  canAccessBetaFeatures: boolean;
  canExportProjects: boolean;
  canUseAIFeatures: boolean;
  
  // Grouped permission checkers
  hasProjectPermissions: boolean;
  hasAdminPermissions: boolean;
  hasAnyAdminPermission: boolean;
  
  // Advanced utilities
  getPermissionsList: () => (keyof UserPermissions)[];
  getMissingPermissions: (required: (keyof UserPermissions)[]) => (keyof UserPermissions)[];
  getPermissionLevel: () => 'none' | 'basic' | 'admin' | 'full';
}

/**
 * Hook principal para verificação de roles e permissões
 */
export const useRole = (): UseRoleReturn => {
  const { 
    currentUser, 
    hasRole: authHasRole, 
    hasPermission: authHasPermission,
    isAdmin: authIsAdmin,
    isUser: authIsUser
  } = useAuth();

  // === BASIC GETTERS ===
  
  const currentUserRole = currentUser?.role || null;
  const isAuthenticated = !!currentUser;
  const isAdmin = authIsAdmin;
  const isUser = authIsUser;

  // === ROLE CHECKERS ===
  
  const hasRole = (role: UserRole): boolean => {
    return authHasRole(role);
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return authHasPermission(permission);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllPermissions = (permissions: (keyof UserPermissions)[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const hasAnyPermission = (permissions: (keyof UserPermissions)[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // === COMPLEX ACCESS CHECKS ===

  const checkAccess = ({
    requiredRole,
    requiredPermissions = [],
    allowedRoles = [],
    requireAll = true,
    logCheck = false
  }: RoleCheckOptions): boolean => {
    if (!currentUser) {
      if (logCheck) {
        logger.debug('Access check failed: user not authenticated');
      }
      return false;
    }

    // Verificar role
    let hasRequiredRole = true;
    if (requiredRole) {
      hasRequiredRole = hasRole(requiredRole);
    } else if (allowedRoles.length > 0) {
      hasRequiredRole = hasAnyRole(allowedRoles);
    }

    // Verificar permissões
    let hasRequiredPermissions = true;
    if (requiredPermissions.length > 0) {
      if (requireAll) {
        hasRequiredPermissions = hasAllPermissions(requiredPermissions);
      } else {
        hasRequiredPermissions = hasAnyPermission(requiredPermissions);
      }
    }

    const accessGranted = hasRequiredRole && hasRequiredPermissions;

    if (logCheck) {
      logger.debug('Access check result', {
        userRole: currentUserRole,
        accessGranted,
        hasRequiredRole,
        hasRequiredPermissions,
        requiredRole,
        requiredPermissions,
        allowedRoles
      });
    }

    return accessGranted;
  };

  const checkMultipleAccess = (optionsList: RoleCheckOptions[]): boolean[] => {
    return optionsList.map(options => checkAccess(options));
  };

  // === CONVENIENCE PERMISSION CHECKERS ===

  const canCreateProjects = hasPermission('canCreateProjects');
  const canEditOwnProjects = hasPermission('canEditOwnProjects');
  const canDeleteOwnProjects = hasPermission('canDeleteOwnProjects');
  const canShareProjects = hasPermission('canShareProjects');
  const canViewAdminDashboard = hasPermission('canViewAdminDashboard');
  const canManageUsers = hasPermission('canManageUsers');
  const canViewSystemLogs = hasPermission('canViewSystemLogs');
  const canModifySystemSettings = hasPermission('canModifySystemSettings');
  const canViewAdvancedAnalytics = hasPermission('canViewAdvancedAnalytics');
  const canAccessBetaFeatures = hasPermission('canAccessBetaFeatures');
  const canExportProjects = hasPermission('canExportProjects');
  const canUseAIFeatures = hasPermission('canUseAIFeatures');

  // === GROUPED PERMISSION CHECKERS ===

  const projectPermissions: (keyof UserPermissions)[] = [
    'canCreateProjects',
    'canEditOwnProjects',
    'canDeleteOwnProjects',
    'canShareProjects'
  ];

  const adminPermissions: (keyof UserPermissions)[] = [
    'canViewAdminDashboard',
    'canManageUsers',
    'canViewSystemLogs',
    'canModifySystemSettings',
    'canViewAdvancedAnalytics'
  ];

  const hasProjectPermissions = hasAllPermissions(projectPermissions);
  const hasAdminPermissions = hasAllPermissions(adminPermissions);
  const hasAnyAdminPermission = hasAnyPermission(adminPermissions);

  // === ADVANCED UTILITIES ===

  const getPermissionsList = (): (keyof UserPermissions)[] => {
    if (!currentUser) return [];
    
    return Object.entries(currentUser.permissions)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permission]) => permission as keyof UserPermissions);
  };

  const getMissingPermissions = (
    required: (keyof UserPermissions)[]
  ): (keyof UserPermissions)[] => {
    return required.filter(permission => !hasPermission(permission));
  };

  const getPermissionLevel = (): 'none' | 'basic' | 'admin' | 'full' => {
    if (!currentUser) return 'none';
    
    if (hasAdminPermissions) return 'full';
    if (hasAnyAdminPermission) return 'admin';
    if (hasProjectPermissions) return 'basic';
    return 'none';
  };

  return {
    // Current user info
    currentUserRole,
    isAuthenticated,
    isAdmin,
    isUser,
    
    // Permission checkers
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    
    // Complex access checks
    checkAccess,
    checkMultipleAccess,
    
    // Convenience permission checkers
    canCreateProjects,
    canEditOwnProjects,
    canDeleteOwnProjects,
    canShareProjects,
    canViewAdminDashboard,
    canManageUsers,
    canViewSystemLogs,
    canModifySystemSettings,
    canViewAdvancedAnalytics,
    canAccessBetaFeatures,
    canExportProjects,
    canUseAIFeatures,
    
    // Grouped permission checkers
    hasProjectPermissions,
    hasAdminPermissions,
    hasAnyAdminPermission,
    
    // Advanced utilities
    getPermissionsList,
    getMissingPermissions,
    getPermissionLevel,
  };
};

// === SPECIALIZED HOOKS ===

/**
 * Hook específico para funcionalidades administrativas
 */
export const useAdminRole = () => {
  const {
    isAdmin,
    canViewAdminDashboard,
    canManageUsers,
    canViewSystemLogs,
    canModifySystemSettings,
    canViewAdvancedAnalytics,
    hasAdminPermissions,
    hasAnyAdminPermission
  } = useRole();

  return {
    isAdmin,
    canViewAdminDashboard,
    canManageUsers,
    canViewSystemLogs,
    canModifySystemSettings,
    canViewAdvancedAnalytics,
    hasFullAdminAccess: hasAdminPermissions,
    hasPartialAdminAccess: hasAnyAdminPermission,
    hasNoAdminAccess: !hasAnyAdminPermission
  };
};

/**
 * Hook específico para funcionalidades de projeto
 */
export const useProjectRole = () => {
  const {
    canCreateProjects,
    canEditOwnProjects,
    canDeleteOwnProjects,
    canShareProjects,
    canExportProjects,
    hasProjectPermissions
  } = useRole();

  return {
    canCreateProjects,
    canEditOwnProjects,
    canDeleteOwnProjects,
    canShareProjects,
    canExportProjects,
    hasFullProjectAccess: hasProjectPermissions,
    canManageOwnProjects: canEditOwnProjects && canDeleteOwnProjects,
    canWorkWithProjects: canCreateProjects || canEditOwnProjects
  };
};

/**
 * Hook para verificar se pode acessar uma funcionalidade beta
 */
export const useBetaFeatures = () => {
  const { canAccessBetaFeatures, isAdmin } = useRole();

  return {
    canAccessBetaFeatures: canAccessBetaFeatures || isAdmin,
    isBetaTester: canAccessBetaFeatures,
    isAdminWithBetaAccess: isAdmin
  };
};

export default useRole; 