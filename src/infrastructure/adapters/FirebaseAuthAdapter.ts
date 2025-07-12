// Infrastructure Layer - Firebase Auth Adapter
// External service adapter for Firebase Authentication

import { 
  getAuth, 
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  UserCredential,
  AuthError
} from 'firebase/auth';

import { createLogger } from '../../utils/logger';

const logger = createLogger('FirebaseAuthAdapter');

export interface AuthConfig {
  enableLogging?: boolean;
  enablePersistence?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: Array<{
    providerId: string;
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  }>;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthStateListener = (state: AuthState) => void;

export class FirebaseAuthAdapter {
  private auth: Auth;
  private config: AuthConfig;
  private logger = createLogger('FirebaseAuthAdapter');
  private listeners: AuthStateListener[] = [];
  private currentState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  };

  constructor(config: AuthConfig = {}) {
    this.config = {
      enableLogging: true,
      enablePersistence: true,
      ...config
    };

    this.auth = getAuth();
    this.initialize();
  }

  /**
   * Initialize the auth adapter
   */
  private initialize(): void {
    try {
      // Set up auth state listener
      onAuthStateChanged(this.auth, (user) => {
        this.handleAuthStateChange(user);
      });

      if (this.config.enableLogging) {
        this.logger.info('Firebase Auth adapter initialized');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Auth:', error);
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication'
      });
    }
  }

  /**
   * Handle auth state changes
   */
  private handleAuthStateChange(user: User | null): void {
    const userProfile: UserProfile | null = user ? this.mapUserToProfile(user) : null;
    
    this.updateState({
      user: userProfile,
      isAuthenticated: !!user,
      isLoading: false,
      error: null
    });

    if (this.config.enableLogging) {
      this.logger.info(`Auth state changed: ${user ? 'signed in' : 'signed out'}`);
    }
  }

  /**
   * Map Firebase User to UserProfile
   */
  private mapUserToProfile(user: User): UserProfile {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      },
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        uid: provider.uid,
        email: provider.email,
        displayName: provider.displayName,
        photoURL: provider.photoURL
      }))
    };
  }

  /**
   * Update internal state and notify listeners
   */
  private updateState(newState: AuthState): void {
    this.currentState = newState;
    this.notifyListeners();
  }

  /**
   * Notify all state listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        this.logger.error('Error in auth state listener:', error);
      }
    });
  }

  /**
   * Add auth state listener
   */
  addStateListener(listener: AuthStateListener): () => void {
    this.listeners.push(listener);
    
    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current auth state
   */
  getCurrentState(): AuthState {
    return { ...this.currentState };
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserProfile | null {
    return this.currentState.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentState.isAuthenticated;
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInCredentials): Promise<UserProfile> {
    try {
      this.updateState({ ...this.currentState, isLoading: true, error: null });

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth, 
        credentials.email, 
        credentials.password
      );

      const userProfile = this.mapUserToProfile(userCredential.user);

      if (this.config.enableLogging) {
        this.logger.info(`User signed in: ${userProfile.email}`);
      }

      return userProfile;
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      this.updateState({ 
        ...this.currentState, 
        isLoading: false, 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<UserProfile> {
    try {
      this.updateState({ ...this.currentState, isLoading: true, error: null });

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        this.auth, 
        data.email, 
        data.password
      );

      // Update display name if provided
      if (data.displayName) {
        await updateProfile(userCredential.user, {
          displayName: data.displayName
        });
      }

      // Send email verification
      await sendEmailVerification(userCredential.user);

      const userProfile = this.mapUserToProfile(userCredential.user);

      if (this.config.enableLogging) {
        this.logger.info(`User signed up: ${userProfile.email}`);
      }

      return userProfile;
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      this.updateState({ 
        ...this.currentState, 
        isLoading: false, 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      
      if (this.config.enableLogging) {
        this.logger.info('User signed out');
      }
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      this.logger.error('Sign out error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      
      if (this.config.enableLogging) {
        this.logger.info(`Password reset email sent to: ${email}`);
      }
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<UserProfile> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      await updateProfile(currentUser, updates);

      const updatedProfile = this.mapUserToProfile(currentUser);

      if (this.config.enableLogging) {
        this.logger.info('User profile updated');
      }

      return updatedProfile;
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Reauthenticate user with password
   */
  async reauthenticate(password: string): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No user is currently signed in');
      }

      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      if (this.config.enableLogging) {
        this.logger.info('User reauthenticated');
      }
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete current user account
   */
  async deleteAccount(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      await deleteUser(currentUser);

      if (this.config.enableLogging) {
        this.logger.info('User account deleted');
      }
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      await sendEmailVerification(currentUser);

      if (this.config.enableLogging) {
        this.logger.info('Email verification sent');
      }
    } catch (error) {
      const errorMessage = this.handleAuthError(error as AuthError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Handle Firebase Auth errors
   */
  private handleAuthError(error: AuthError): string {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado. Verifique o email informado.';
      case 'auth/wrong-password':
        return 'Senha incorreta. Tente novamente.';
      case 'auth/email-already-in-use':
        return 'Este email já está em uso por outra conta.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Email inválido. Verifique o formato do email.';
      case 'auth/user-disabled':
        return 'Esta conta foi desabilitada. Entre em contato com o suporte.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      case 'auth/requires-recent-login':
        return 'Esta operação requer autenticação recente. Faça login novamente.';
      default:
        this.logger.error('Auth error:', error);
        return `Erro de autenticação: ${error.message}`;
    }
  }

  /**
   * Get adapter health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    isInitialized: boolean;
    currentUser: boolean;
    error?: string;
  }> {
    try {
      return {
        status: 'healthy',
        isInitialized: !!this.auth,
        currentUser: !!this.auth.currentUser,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        isInitialized: false,
        currentUser: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.listeners = [];
    this.logger.info('Firebase Auth adapter disposed');
  }
} 