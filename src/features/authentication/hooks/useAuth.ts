/**
 * useAuth Hook - Modern Authentication
 * IA Beta - Week 5 - Feature-based Organization
 */

import { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import type { AuthContextType, LoginCredentials, SignupCredentials } from '../types/auth.types';

/**
 * Modern useAuth hook with TypeScript and DI integration
 * Provides centralized authentication state and actions
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Helper hook for auth-specific operations
 */
export function useAuthActions() {
  const { login, signup, logout, updateProfile } = useAuth();
  
  return {
    login,
    signup, 
    logout,
    updateProfile
  };
}

/**
 * Helper hook for auth state
 */
export function useAuthState() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isGuest: user?.role === 'guest' || !user
  };
} 