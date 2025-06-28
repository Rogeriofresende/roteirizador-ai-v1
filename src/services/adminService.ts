/**
 * 🔐 ADMIN SERVICE
 * Gerenciamento de acesso administrativo e role-based access control
 */

import { config } from '../config/environment';
import { createLogger } from '../utils/logger';

const logger = createLogger('AdminService');

export interface UserRole {
  email: string;
  role: 'admin' | 'user';
  permissions: string[];
  lastAccess?: Date;
}

export interface AdminPermissions {
  canAccessSystemDashboard: boolean;
  canViewDocumentation: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canAccessCoordination: boolean;
  canModifySettings: boolean;
}

export class AdminService {
  private static instance: AdminService;
  private currentUser: string | null = null;
  private userRole: UserRole | null = null;

  private constructor() {
    logger.info('AdminService initialized', {
      adminConfigured: !!config.admin.adminEmail,
      systemDashboardEnabled: config.admin.systemDashboardEnabled,
      documentationAccess: config.admin.documentationAccess,
    });
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Define o usuário atual para verificação de permissões
   */
  public setCurrentUser(userEmail: string | null): void {
    this.currentUser = userEmail;
    this.userRole = this.determineUserRole(userEmail);
    
    if (userEmail) {
      logger.info('User role determined', {
        email: userEmail,
        role: this.userRole?.role,
        isAdmin: this.isAdmin(),
      });
    } else {
      logger.debug('User logged out, clearing role');
    }
  }

  /**
   * Determina o role do usuário baseado no email
   */
  private determineUserRole(userEmail: string | null): UserRole | null {
    if (!userEmail) return null;

    const isAdmin = this.isUserAdmin(userEmail);
    
    return {
      email: userEmail,
      role: isAdmin ? 'admin' : 'user',
      permissions: this.getPermissionsForRole(isAdmin ? 'admin' : 'user'),
      lastAccess: new Date(),
    };
  }

  /**
   * Verifica se um email é de administrador
   */
  private isUserAdmin(userEmail: string): boolean {
    if (!config.admin.adminEmail) {
      logger.warn('Admin email not configured in environment');
      return false;
    }

    const isAdmin = userEmail.toLowerCase() === config.admin.adminEmail.toLowerCase();
    
    if (isAdmin) {
      logger.info('Admin user detected', { email: userEmail });
    }
    
    return isAdmin;
  }

  /**
   * Obtém permissões baseadas no role
   */
  private getPermissionsForRole(role: 'admin' | 'user'): string[] {
    const adminPermissions = [
      'system:dashboard:access',
      'documentation:view',
      'users:manage',
      'analytics:view',
      'coordination:access',
      'settings:modify',
      'projects:view_all',
      'logs:access',
    ];

    const userPermissions = [
      'projects:own',
      'generator:access',
      'dashboard:user',
    ];

    return role === 'admin' ? adminPermissions : userPermissions;
  }

  /**
   * Verifica se o usuário atual é admin
   */
  public isAdmin(): boolean {
    return this.userRole?.role === 'admin';
  }

  /**
   * Verifica se o usuário atual é user regular
   */
  public isUser(): boolean {
    return this.userRole?.role === 'user';
  }

  /**
   * Obtém permissões detalhadas do usuário atual
   */
  public getPermissions(): AdminPermissions {
    const isAdmin = this.isAdmin();
    
    return {
      canAccessSystemDashboard: isAdmin && config.admin.systemDashboardEnabled,
      canViewDocumentation: isAdmin && config.admin.documentationAccess,
      canManageUsers: isAdmin,
      canViewAnalytics: isAdmin,
      canAccessCoordination: isAdmin && config.admin.multiAiCoordinationEnabled,
      canModifySettings: isAdmin,
    };
  }

  /**
   * Verifica permissão específica
   */
  public hasPermission(permission: string): boolean {
    if (!this.userRole) return false;
    return this.userRole.permissions.includes(permission);
  }

  /**
   * Obtém role do usuário atual
   */
  public getCurrentRole(): UserRole | null {
    return this.userRole;
  }

  /**
   * Verifica se pode acessar SystemDashboard
   */
  public canAccessSystemDashboard(): boolean {
    return this.getPermissions().canAccessSystemDashboard;
  }

  /**
   * Verifica se pode acessar documentação
   */
  public canViewDocumentation(): boolean {
    return this.getPermissions().canViewDocumentation;
  }

  /**
   * Verifica se pode acessar coordenação multi-AI
   */
  public canAccessCoordination(): boolean {
    return this.getPermissions().canAccessCoordination;
  }

  /**
   * Log de acesso para auditoria
   */
  public logAccess(resource: string, action: 'granted' | 'denied'): void {
    logger.info('Access control event', {
      user: this.currentUser,
      role: this.userRole?.role,
      resource,
      action,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Obtém estatísticas de acesso
   */
  public getAccessStats(): {
    isConfigured: boolean;
    hasAdminEmail: boolean;
    systemDashboardEnabled: boolean;
    currentUserRole: string | null;
    permissionsCount: number;
  } {
    return {
      isConfigured: !!config.admin.adminEmail,
      hasAdminEmail: !!config.admin.adminEmail,
      systemDashboardEnabled: config.admin.systemDashboardEnabled,
      currentUserRole: this.userRole?.role || null,
      permissionsCount: this.userRole?.permissions.length || 0,
    };
  }
}

// Export singleton instance
export const adminService = AdminService.getInstance();

export default adminService; 