import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading, isFirebaseEnabled } = useAuth();

  if (loading) {
    // Optionally, return a loading spinner here
    return <div>Carregando...</div>;
  }

  // Se Firebase não estiver configurado, permitir acesso (modo demonstração)
  if (!isFirebaseEnabled) {
    return children;
  }

  // Se Firebase está configurado mas usuário não está logado
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute; 