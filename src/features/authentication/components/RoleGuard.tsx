import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, UserPermissions } from '../../types/auth';
import { createLogger } from '../../utils/logger';

const logger = createLogger('RoleGuard');

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: (keyof UserPermissions)[];
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  inverse?: boolean; // Se true, mostra apenas quando NÃO tem permissão
  requireAll?: boolean; // Se true, requer TODAS as permissões (default: true)
  logAccess?: boolean; // Se true, loga tentativas de acesso
}

/**
 * RoleGuard - Componente para proteção granular de elementos da UI
 * 
 * Permite mostrar/esconder elementos baseado em roles e permissões
 * Diferente do AdminRoute, este componente não redireciona, apenas 
 * controla a visibilidade de elementos
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  allowedRoles = [],
  fallback = null,
  inverse = false,
  requireAll = true,
  logAccess = false
}) => {
  const { currentUser, isFirebaseEnabled, hasRole, hasPermission } = useAuth();

  // === FIREBASE NOT CONFIGURED ===
  if (!isFirebaseEnabled) {
    // No modo demo, não mostrar elementos administrativos
    if (requiredRole === 'admin' || requiredPermissions.some(p => p.includes('Admin'))) {
      return inverse ? <>{children}</> : <>{fallback}</>;
    }
    // Para outros elementos, mostrar normalmente
    return inverse ? <>{fallback}</> : <>{children}</>;
  }

  // === USER NOT AUTHENTICATED ===
  if (!currentUser) {
    if (logAccess) {
      logger.debug('RoleGuard: User not authenticated', {
        requiredRole,
        requiredPermissions
      });
    }
    return inverse ? <>{children}</> : <>{fallback}</>;
  }

  // === ROLE VERIFICATION ===
  let hasRequiredRole = true;

  if (requiredRole) {
    hasRequiredRole = hasRole(requiredRole);
  } else if (allowedRoles.length > 0) {
    hasRequiredRole = allowedRoles.some(role => hasRole(role));
  }

  // === PERMISSION VERIFICATION ===
  let hasRequiredPermissions = true;

  if (requiredPermissions.length > 0) {
    if (requireAll) {
      // Requer TODAS as permissões
      hasRequiredPermissions = requiredPermissions.every(permission => hasPermission(permission));
    } else {
      // Requer PELO MENOS UMA permissão
      hasRequiredPermissions = requiredPermissions.some(permission => hasPermission(permission));
    }
  }

  // === ACCESS DECISION ===
  const hasAccess = hasRequiredRole && hasRequiredPermissions;

  // === LOGGING ===
  if (logAccess) {
    logger.debug('RoleGuard access decision', {
      userRole: currentUser.role,
      hasAccess,
      hasRequiredRole,
      hasRequiredPermissions,
      requiredRole,
      requiredPermissions,
      inverse
    });
  }

  // === RENDER DECISION ===
  if (inverse) {
    // Modo inverso: mostra quando NÃO tem acesso
    return hasAccess ? <>{fallback}</> : <>{children}</>;
  } else {
    // Modo normal: mostra quando TEM acesso
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }
};

// === CONVENIENCE COMPONENTS ===

/**
 * Mostra conteúdo apenas para administradores
 */
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard requiredRole="admin" fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Mostra conteúdo apenas para usuários comuns (não admins)
 */
export const UserOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard requiredRole="user" fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Mostra conteúdo apenas para usuários autenticados
 */
export const AuthenticatedOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <>{fallback}</>;
};

/**
 * Mostra conteúdo apenas para usuários NÃO autenticados
 */
export const UnauthenticatedOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const { currentUser } = useAuth();
  return !currentUser ? <>{children}</> : <>{fallback}</>;
};

/**
 * Mostra conteúdo baseado em permissões específicas
 */
export const PermissionGuard: React.FC<{
  children: React.ReactNode;
  permissions: (keyof UserPermissions)[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}> = ({ children, permissions, requireAll = true, fallback }) => (
  <RoleGuard 
    requiredPermissions={permissions} 
    requireAll={requireAll}
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

/**
 * Proteção para funcionalidades beta
 */
export const BetaFeatureGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard 
    requiredPermissions={['canAccessBetaFeatures']} 
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

/**
 * Proteção para dashboard administrativo
 */
export const AdminDashboardGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard 
    requiredPermissions={['canViewAdminDashboard']} 
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

/**
 * Proteção para gestão de usuários
 */
export const UserManagementGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard 
    requiredPermissions={['canManageUsers']} 
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

/**
 * Proteção para logs do sistema
 */
export const SystemLogsGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard 
    requiredPermissions={['canViewSystemLogs']} 
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

/**
 * Proteção para configurações do sistema
 */
export const SystemSettingsGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RoleGuard 
    requiredPermissions={['canModifySystemSettings']} 
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

// === HOOK PARA VERIFICAÇÃO CONDICIONAL ===

/**
 * Hook para verificar permissões de forma condicional
 */
export const useRoleGuard = () => {
  const { currentUser, hasRole, hasPermission } = useAuth();

  const checkAccess = ({
    requiredRole,
    requiredPermissions = [],
    allowedRoles = [],
    requireAll = true
  }: {
    requiredRole?: UserRole;
    requiredPermissions?: (keyof UserPermissions)[];
    allowedRoles?: UserRole[];
    requireAll?: boolean;
  }): boolean => {
    if (!currentUser) return false;

    // Verificar role
    let hasRequiredRole = true;
    if (requiredRole) {
      hasRequiredRole = hasRole(requiredRole);
    } else if (allowedRoles.length > 0) {
      hasRequiredRole = allowedRoles.some(role => hasRole(role));
    }

    // Verificar permissões
    let hasRequiredPermissions = true;
    if (requiredPermissions.length > 0) {
      if (requireAll) {
        hasRequiredPermissions = requiredPermissions.every(permission => hasPermission(permission));
      } else {
        hasRequiredPermissions = requiredPermissions.some(permission => hasPermission(permission));
      }
    }

    return hasRequiredRole && hasRequiredPermissions;
  };

  const isAdmin = () => hasRole('admin');
  const isUser = () => hasRole('user');
  const canViewAdminDashboard = () => hasPermission('canViewAdminDashboard');
  const canManageUsers = () => hasPermission('canManageUsers');
  const canViewSystemLogs = () => hasPermission('canViewSystemLogs');
  const canModifySystemSettings = () => hasPermission('canModifySystemSettings');
  const canAccessBetaFeatures = () => hasPermission('canAccessBetaFeatures');

  return {
    checkAccess,
    isAdmin,
    isUser,
    canViewAdminDashboard,
    canManageUsers,
    canViewSystemLogs,
    canModifySystemSettings,
    canAccessBetaFeatures,
    currentUserRole: currentUser?.role,
    isAuthenticated: !!currentUser
  };
};

export default RoleGuard; 