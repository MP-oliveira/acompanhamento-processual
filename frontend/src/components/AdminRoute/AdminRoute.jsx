import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente para proteger rotas que só administradores podem acessar
 */
const AdminRoute = ({ children, user }) => {
  // Se não há usuário logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não é admin, redireciona para dashboard
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Se é admin, renderiza o componente
  return children;
};

export default AdminRoute;
