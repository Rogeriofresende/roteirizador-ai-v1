import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RouteProtectionProps, UserRole, UserPermissions } from '../../types/auth';
import { createLogger } from '../../utils/logger';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

const logger = createLogger('AdminRoute');

interface AdminRouteProps extends Omit<RouteProtectionProps, 'requireAuth'> {
  children: React.ReactElement;
  requiredRole?: UserRole;
  requiredPermissions?: (keyof UserPermissions)[];
  fallback?: React.ReactElement;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredRole = 'admin',
  requiredPermissions = [],
  fallback,
  redirectTo = '/login',
  showAccessDenied = true
}) => {
  const { currentUser, loading, isFirebaseEnabled, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Verificando Permissões
          </h3>
          <p className="text-muted-foreground">
            Aguarde enquanto validamos seu acesso...
          </p>
        </Card>
      </div>
    );
  }

  // === FIREBASE NOT CONFIGURED ===
  if (!isFirebaseEnabled) {
    logger.warn('AdminRoute accessed but Firebase not configured', {
      path: location.pathname,
      requiredRole
    });

    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="p-8 text-center max-w-md mx-4 border-yellow-200">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sistema em Modo Demonstração
            </h3>
            <p className="text-muted-foreground mb-4">
              O Firebase não está configurado. Funcionalidades administrativas não estão disponíveis no modo demonstração.
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </Card>
        </div>
      );
    }

    return fallback || <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // === USER NOT AUTHENTICATED ===
  if (!currentUser) {
    logger.warn('AdminRoute accessed by unauthenticated user', {
      path: location.pathname,
      requiredRole
    });

    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // === ROLE VERIFICATION ===
  const hasRequiredRole = hasRole(requiredRole);
  
  if (!hasRequiredRole) {
    logger.warn('AdminRoute access denied - insufficient role', {
      userRole: currentUser.role,
      requiredRole,
      userEmail: currentUser.email,
      path: location.pathname
    });

    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="p-8 text-center max-w-md mx-4 border-red-200">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Acesso Negado
            </h3>
            <p className="text-muted-foreground mb-4">
              Você não possui permissões de <strong>{requiredRole}</strong> para acessar esta área.
            </p>
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Seu nível:</strong> {currentUser.role}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Necessário:</strong> {requiredRole}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                Voltar
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Ir para Início
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return fallback || <Navigate to="/" replace />;
  }

  // === PERMISSION VERIFICATION ===
  if (requiredPermissions.length > 0) {
    const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));
    
    if (missingPermissions.length > 0) {
      logger.warn('AdminRoute access denied - insufficient permissions', {
        userRole: currentUser.role,
        requiredPermissions,
        missingPermissions,
        userEmail: currentUser.email,
        path: location.pathname
      });

      if (showAccessDenied) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="p-8 text-center max-w-md mx-4 border-orange-200">
              <Lock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Permissões Insuficientes
              </h3>
              <p className="text-muted-foreground mb-4">
                Você não possui todas as permissões necessárias para acessar esta funcionalidade.
              </p>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg mb-4 text-left">
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                  Permissões em falta:
                </p>
                <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                  {missingPermissions.map(permission => (
                    <li key={permission} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Voltar
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Ir para Início
                </Button>
              </div>
            </Card>
          </div>
        );
      }

      return fallback || <Navigate to="/" replace />;
    }
  }

  // === SUCCESS - ACCESS GRANTED ===
  logger.info('AdminRoute access granted', {
    userRole: currentUser.role,
    requiredRole,
    userEmail: currentUser.email,
    path: location.pathname,
    permissionsChecked: requiredPermissions.length
  });

  return children;
};

// === CONVENIENCE COMPONENTS ===

/**
 * Proteção específica para dashboard administrativo
 */
export const AdminDashboardRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <AdminRoute
    requiredRole="admin"
    requiredPermissions={['canViewAdminDashboard']}
  >
    {children}
  </AdminRoute>
);

/**
 * Proteção para gestão de usuários
 */
export const UserManagementRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <AdminRoute
    requiredRole="admin"
    requiredPermissions={['canManageUsers']}
  >
    {children}
  </AdminRoute>
);

/**
 * Proteção para configurações do sistema
 */
export const SystemSettingsRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <AdminRoute
    requiredRole="admin"
    requiredPermissions={['canModifySystemSettings']}
  >
    {children}
  </AdminRoute>
);

/**
 * Proteção para visualização de logs
 */
export const SystemLogsRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <AdminRoute
    requiredRole="admin"
    requiredPermissions={['canViewSystemLogs']}
  >
    {children}
  </AdminRoute>
);

export default AdminRoute; 