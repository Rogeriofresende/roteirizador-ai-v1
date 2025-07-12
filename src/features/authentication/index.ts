/**
 * Authentication Feature - Barrel Export
 * IA Beta - Week 5 - Feature-based Organization
 */

// Components
export * from './components/LoginForm';
export * from './components/SignupForm';
export * from './components/ProtectedRoute';
export * from './components/AdminRoute';
export * from './components/RoleGuard';

// Hooks
export * from './hooks/useAuth';
export * from './hooks/useRole';

// Pages
export * from './pages/LoginPage';
export * from './pages/SignupPage';

// Types
export * from './types/auth.types';