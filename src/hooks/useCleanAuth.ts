// Presentation Layer - Clean Architecture Auth Hook
// Modern hook integrating with FirebaseAuthAdapter and UserRepository

import { useState, useEffect, useCallback } from 'react';
import { FirebaseAuthAdapter, UserRepository } from '../infrastructure/adapters';
import { getEnvironmentConfig } from '../infrastructure/config/EnvironmentConfig';
import { createLogger } from '../utils/logger';

const logger = createLogger('useCleanAuth');

interface AuthUser {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  subscription: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

interface AuthActions {
  signIn: (credentials: SignInCredentials) => Promise<AuthUser>;
  signUp: (data: SignUpData) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
}

// Singleton instances for efficiency
let authAdapter: FirebaseAuthAdapter | null = null;
let userRepository: UserRepository | null = null;

/**
 * Initialize adapters if not already initialized
 */
function initializeAdapters() {
  if (!authAdapter || !userRepository) {
    try {
      const envConfig = getEnvironmentConfig();
      const authConfig = envConfig.getAuthConfig();
      
      authAdapter = new FirebaseAuthAdapter(authConfig);
      userRepository = new UserRepository();
    } catch (error) {
      logger.error('Failed to initialize adapters:', error);
      throw error;
    }
  }
  
  return { authAdapter: authAdapter!, userRepository: userRepository! };
}

/**
 * Map Firebase user to AuthUser
 */
function mapToAuthUser(firebaseUser: any, userEntity: any): AuthUser {
  return {
    id: userEntity.id,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || userEntity.displayName,
    photoURL: firebaseUser.photoURL || userEntity.photoURL,
    emailVerified: firebaseUser.emailVerified,
    role: userEntity.role,
    subscription: userEntity.subscription,
    isActive: userEntity.metadata.isActive,
    createdAt: userEntity.metadata.createdAt.toDate(),
    lastActivity: userEntity.usage.lastActivity.toDate()
  };
}

/**
 * Clean Architecture Authentication Hook
 */
export function useCleanAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isInitialized: false
  });

  /**
   * Update auth state
   */
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    updateState({ error, loading: false });
  }, [updateState]);

  /**
   * Load user from repository
   */
  const loadUser = useCallback(async (firebaseUser: any): Promise<AuthUser | null> => {
    try {
      const { userRepository } = initializeAdapters();
      
      let userEntity = await userRepository.findByUid(firebaseUser.uid);
      
      // Create user if doesn't exist
      if (!userEntity) {
        userEntity = await userRepository.createFromAuth({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        // Update last login
        await userRepository.updateLastLogin(userEntity.id!);
      }
      
      return mapToAuthUser(firebaseUser, userEntity);
    } catch (error) {
      logger.error('Error loading user:', error);
      throw error;
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (credentials: SignInCredentials): Promise<AuthUser> => {
    try {
      updateState({ loading: true, error: null });
      
      const { authAdapter } = initializeAdapters();
      const firebaseUser = await authAdapter.signIn(credentials);
      const user = await loadUser(firebaseUser);
      
      if (!user) {
        throw new Error('Failed to load user data');
      }
      
      updateState({
        user,
        loading: false,
        isAuthenticated: true,
        error: null
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      throw error;
    }
  }, [loadUser, updateState, setError]);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (data: SignUpData): Promise<AuthUser> => {
    try {
      updateState({ loading: true, error: null });
      
      const { authAdapter } = initializeAdapters();
      const firebaseUser = await authAdapter.signUp(data);
      const user = await loadUser(firebaseUser);
      
      if (!user) {
        throw new Error('Failed to load user data');
      }
      
      updateState({
        user,
        loading: false,
        isAuthenticated: true,
        error: null
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      throw error;
    }
  }, [loadUser, updateState, setError]);

  /**
   * Sign out
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      updateState({ loading: true, error: null });
      
      const { authAdapter } = initializeAdapters();
      await authAdapter.signOut();
      
      updateState({
        user: null,
        loading: false,
        isAuthenticated: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setError(errorMessage);
      throw error;
    }
  }, [updateState, setError]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates: { displayName?: string; photoURL?: string }): Promise<AuthUser> => {
    try {
      if (!state.user) {
        throw new Error('No user logged in');
      }
      
      updateState({ loading: true, error: null });
      
      const { authAdapter, userRepository } = initializeAdapters();
      
      // Update Firebase profile
      await authAdapter.updateProfile(updates);
      
      // Update user repository
      const updatedEntity = await userRepository.update(state.user.id, {
        displayName: updates.displayName,
        photoURL: updates.photoURL
      });
      
      // Get updated Firebase user
      const firebaseUser = await authAdapter.getCurrentUser();
      if (!firebaseUser) {
        throw new Error('Failed to get updated user');
      }
      
      const user = mapToAuthUser(firebaseUser, updatedEntity);
      
      updateState({
        user,
        loading: false,
        error: null
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    }
  }, [state.user, updateState, setError]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const { authAdapter } = initializeAdapters();
      const firebaseUser = await authAdapter.getCurrentUser();
      
      if (!firebaseUser) {
        updateState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
        return null;
      }
      
      const user = await loadUser(firebaseUser);
      
      updateState({
        user,
        isAuthenticated: !!user,
        loading: false
      });
      
      return user;
    } catch (error) {
      logger.error('Error refreshing user:', error);
      setError('Failed to refresh user data');
      return null;
    }
  }, [loadUser, updateState, setError]);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      updateState({ loading: true, error: null });
      
      const { authAdapter } = initializeAdapters();
      await authAdapter.resetPassword(email);
      
      updateState({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    }
  }, [updateState, setError]);

  /**
   * Verify email
   */
  const verifyEmail = useCallback(async (): Promise<void> => {
    try {
      updateState({ loading: true, error: null });
      
      const { authAdapter } = initializeAdapters();
      await authAdapter.verifyEmail();
      
      updateState({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setError(errorMessage);
      throw error;
    }
  }, [updateState, setError]);

  /**
   * Initialize auth state listener
   */
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initializeAuth = async () => {
      try {
        const { authAdapter } = initializeAdapters();
        
        // Set up auth state listener
        unsubscribe = authAdapter.onAuthStateChanged(async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const user = await loadUser(firebaseUser);
              updateState({
                user,
                isAuthenticated: !!user,
                loading: false,
                isInitialized: true
              });
            } else {
              updateState({
                user: null,
                isAuthenticated: false,
                loading: false,
                isInitialized: true
              });
            }
          } catch (error) {
            logger.error('Error in auth state change:', error);
            updateState({
              user: null,
              isAuthenticated: false,
              loading: false,
              isInitialized: true,
              error: 'Authentication error'
            });
          }
        });
      } catch (error) {
        logger.error('Error initializing auth:', error);
        updateState({
          loading: false,
          isInitialized: true,
          error: 'Failed to initialize authentication'
        });
      }
    };
    
    initializeAuth();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadUser, updateState]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    resetPassword,
    verifyEmail
  };
} 