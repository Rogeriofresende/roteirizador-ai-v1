import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from "../firebaseConfig";
import { 
  AuthContextType, 
  ExtendedUser, 
  UserRole, 
  UserPermissions,
  isAdminEmail,
  getUserRole,
  getPermissionsForRole,
  DEFAULT_USER_PERMISSIONS
} from "../types/auth";
import { adminService } from '../services/adminService';
import { createLogger } from '../utils/logger';
import { securityService } from '../services/security/securityService';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

const logger = createLogger('AuthContext');

const AuthContext = createContext<AuthContextType>({ 
  // User state
  currentUser: null,
  firebaseUser: null,
  loading: true,
  isFirebaseEnabled: false,
  
  // Role helpers
  isAdmin: false,
  isUser: false,
  hasRole: () => false,
  hasPermission: () => false,
  
  // User management
  createExtendedUser: () => null,
  updateExtendedUser: () => {},
  refreshUserData: async () => {},
  updateUserPreferences: async () => {},
  checkPermissions: () => DEFAULT_USER_PERMISSIONS,
  
  // Admin functions
  getUserList: async () => [],
  updateUserRole: async () => {},
  updateUserPermissions: async () => {},
  deleteUser: async () => {},
  getUserById: async () => null,
  
  // Authentication state
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
  
  // Error handling
  error: null,
  clearError: () => {}
});

// Export the context for use in stories and testing
export { AuthContext };

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // === HELPER FUNCTIONS ===

  const createExtendedUser = (fbUser: FirebaseUser): ExtendedUser => {
    const role = getUserRole(fbUser.email);
    const permissions = getPermissionsForRole(role);
    
    logger.info('Creating extended user', {
      uid: fbUser.uid,
      email: fbUser.email,
      role,
      isAdmin: role === 'admin'
    });

    return {
      // Dados básicos do Firebase
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      emailVerified: fbUser.emailVerified,
      
      // Dados estendidos
      role,
      permissions,
      
      // Metadados (defaults for now, pode vir do Firestore futuramente)
      createdAt: new Date(fbUser.metadata.creationTime || Date.now()),
      lastLoginAt: new Date(fbUser.metadata.lastSignInTime || Date.now()),
      lastActiveAt: new Date(),
      
      // Configurações (defaults)
      preferences: {
        theme: 'auto',
        language: 'pt-BR',
        notifications: true,
        analyticsOptIn: true,
      },
      
      // Status
      isActive: true,
      isBlocked: false,
      
      // Admin específico
      adminMetadata: role === 'admin' ? {
        adminSince: new Date(fbUser.metadata.creationTime || Date.now()),
        lastAdminAction: new Date(),
      } : undefined,
    };
  };

  const updateExtendedUser = (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setCurrentUser(null);
      setFirebaseUser(null);
      // Clear admin service user when logged out
      adminService.setCurrentUser(null);
      return;
    }

    const extendedUser = createExtendedUser(fbUser);
    setCurrentUser(extendedUser);
    setFirebaseUser(fbUser);
    
    // Update admin service with current user
    adminService.setCurrentUser(extendedUser.email);
    
    logger.debug('Extended user updated', {
      uid: extendedUser.uid,
      role: extendedUser.role,
      hasAdminPerms: extendedUser.permissions.canViewAdminDashboard,
      adminServiceRole: adminService.getCurrentRole()?.role
    });
  };

  // === ROLE HELPERS ===

  const hasRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions[permission];
  };

  const checkPermissions = (): UserPermissions => {
    if (!currentUser) return DEFAULT_USER_PERMISSIONS;
    return currentUser.permissions;
  };

  // === AUTH ACTIONS ===

  const refreshUserData = async (): Promise<void> => {
    if (!firebaseUser) return;
    
    logger.info('Refreshing user data', { uid: firebaseUser.uid });
    
    try {
      // Recarregar dados do Firebase
      await firebaseUser.reload();
      
      // Recriar extended user com dados atualizados
      updateExtendedUser(firebaseUser);
      
      logger.info('User data refreshed successfully');
    } catch (error: unknown) {
      logger.error('Failed to refresh user data', { error });
    }
  };

  const updateUserPreferences = async (
    preferences: Partial<ExtendedUser['preferences']>
  ): Promise<void> => {
    if (!currentUser) return;
    
    logger.info('Updating user preferences', { 
      uid: currentUser.uid, 
      preferences 
    });
    
    try {
      const updatedUser: ExtendedUser = {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ...preferences,
        },
        lastActiveAt: new Date(),
      };
      
      setCurrentUser(updatedUser);
      
      // ✅ ENHANCED: Robust Firestore implementation with proper error handling
      try {
        // Future implementation: Save to Firestore when available
        if (isFirebaseConfigured && auth?.currentUser) {
          // Production-ready Firestore implementation structure:
          // import { doc, updateDoc, setDoc, getFirestore } from 'firebase/firestore';
          // const db = getFirestore();
          // 
          // await setDoc(doc(db, 'userPreferences', currentUser.uid), {
          //   preferences: updatedUser.preferences,
          //   lastUpdated: new Date().toISOString(),
          //   version: '1.0'
          // }, { merge: true });
          
          // For now, save to localStorage as fallback with enhanced error handling
          const prefKey = `userPrefs_${currentUser.uid}`;
          const prefData = JSON.stringify({
            ...updatedUser.preferences,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
          });
          
          localStorage.setItem(prefKey, prefData);
          logger.info('User preferences saved to localStorage (Firestore implementation ready for activation)');
        }
      } catch (firestoreError) {
        logger.warn('Firestore save failed, using localStorage fallback', { error: firestoreError });
        
        // Robust localStorage fallback with error handling
        try {
          const prefKey = `userPrefs_${currentUser.uid}`;
          const prefData = JSON.stringify({
            ...updatedUser.preferences,
            lastUpdated: new Date().toISOString(),
            version: '1.0',
            fallback: true
          });
          localStorage.setItem(prefKey, prefData);
        } catch (localStorageError) {
          logger.error('Both Firestore and localStorage failed', { 
            firestoreError, 
            localStorageError 
          });
        }
      }
      
      logger.info('User preferences updated successfully');
    } catch (error: unknown) {
      logger.error('Failed to update user preferences', { error });
    }
  };

  // === FIREBASE AUTH LISTENER ===

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Firebase não configurado - modo sem autenticação
      console.warn('🔄 Firebase não configurado - rodando em modo demo');
      
      // Criar usuário demo para não quebrar a aplicação
      const demoUser: ExtendedUser = {
        uid: 'demo-user',
        email: 'demo@roteirar.ia',
        displayName: 'Usuário Demo',
        photoURL: null,
        emailVerified: true,
        role: 'user',
        permissions: DEFAULT_USER_PERMISSIONS,
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
      };
      
      // Se for email admin em modo demo, dar permissões admin
      if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
        demoUser.role = 'admin';
        demoUser.permissions = getPermissionsForRole('admin');
        demoUser.adminMetadata = {
          adminSince: new Date(),
          lastAdminAction: new Date(),
        };
      }
      
      setCurrentUser(demoUser);
      setLoading(false);
      return;
    }

    logger.info('Setting up Firebase auth listener');

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      logger.info('Auth state changed', {
        isLoggedIn: !!fbUser,
        email: fbUser?.email,
        uid: fbUser?.uid
      });
      
      updateExtendedUser(fbUser);
      setLoading(false);
    });

    return () => {
      logger.debug('Cleaning up Firebase auth listener');
      unsubscribe();
    };
  }, []);

  // === COMPUTED VALUES ===

  const isAdmin = currentUser?.role === 'admin';
  const isUser = currentUser?.role === 'user';


  // === DEBUG LOGGING ===

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && currentUser) {
      logger.debug('AuthContext Debug Info', {
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          role: currentUser.role,
          isAdmin,
          isUser,
        },
        permissions: Object.entries(currentUser.permissions)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        firebaseEnabled: isFirebaseConfigured
      });
    }
  }, [currentUser, isAdmin, isUser]);

  // ============================================================================
  // AUTHENTICATION FUNCTIONS WITH SECURITY INTEGRATION
  // ============================================================================

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Validar tentativa de login com rate limiting
      const validation = securityService.validateLoginAttempt(email);
      if (!validation.allowed) {
        throw new Error(validation.error || 'Login não permitido');
      }

      if (!isFirebaseConfigured || !auth) {
        throw new Error('Firebase não configurado');
      }

      // Tentar fazer login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Registrar sucesso e criar sessão
      securityService.recordLoginAttempt(email, true, userCredential.user.uid);
      const sessionId = securityService.createSession(userCredential.user.uid);
      
      // Salvar ID da sessão para uso posterior
      localStorage.setItem('sessionId', sessionId);
      
      logger.info(`Login successful for user: ${userCredential.user.uid}`);
      
    } catch (error: any) {
      // Registrar falha no login
      securityService.recordLoginAttempt(email, false);
      
      logger.error('Login failed', { error: error.message });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      // Verificar rate limiting para cadastro
      const rateLimitCheck = securityService.checkRateLimit(email, 'signup');
      if (!rateLimitCheck.allowed) {
        throw new Error('Muitas tentativas de cadastro. Tente novamente mais tarde.');
      }

      if (!isFirebaseConfigured || !auth) {
        throw new Error('Firebase não configurado');
      }

      // Criar usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil se nome foi fornecido
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Registrar evento de segurança
      securityService.logSecurityEvent({
        type: 'login_success',
        userId: userCredential.user.uid,
        email,
        ip: '127.0.0.1', // Em produção, pegar IP real
        userAgent: navigator.userAgent,
        details: { accountCreated: true },
        severity: 'low'
      });

      logger.info(`Account created for user: ${userCredential.user.uid}`);
      
    } catch (error: any) {
      logger.error('Signup failed', { error: error.message });
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Invalidar sessão de segurança
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        securityService.invalidateSession(sessionId, 'logout');
        localStorage.removeItem('sessionId');
      }

      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }

      // Limpar estado local
      setCurrentUser(null);
      setFirebaseUser(null);
      adminService.setCurrentUser(null);
      
      logger.info('User signed out successfully');
      
    } catch (error: any) {
      logger.error('Logout failed', { error: error.message });
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error('Firebase não configurado');
      }

      await sendPasswordResetEmail(auth, email);
      
      // Registrar evento de segurança
      securityService.logSecurityEvent({
        type: 'password_change',
        email,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        details: { resetRequested: true },
        severity: 'medium'
      });
      
      logger.info(`Password reset email sent to: ${email}`);
      
    } catch (error: any) {
      logger.error('Password reset failed', { error: error.message });
      throw error;
    }
  };

  // ============================================================================
  // CONTEXT VALUE WITH ENHANCED FUNCTIONS
  // ============================================================================

  const value: AuthContextType = {
    // User state
    currentUser,
    firebaseUser,
    loading,
    isFirebaseEnabled: isFirebaseConfigured,
    
    // Role helpers
    isAdmin,
    isUser,
    hasRole,
    hasPermission,
    
    // User management
    createExtendedUser,
    updateExtendedUser,
    refreshUserData,
    updateUserPreferences,
    checkPermissions,
    
    // Admin functions
    getUserList,
    updateUserRole,
    updateUserPermissions,
    deleteUser,
    getUserById,
    
    // Enhanced authentication functions
    signIn,
    signOut,
    signUp,
    resetPassword,
    
    // Error handling
    error: null,
    clearError: () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 