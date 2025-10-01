import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUserRole } from '../../utils/auth';
import Layout from '../Layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const token = getToken();
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} replace />;
  }

  return <Layout role={userRole || 'USER'}>{children}</Layout>;
};

export default ProtectedRoute;