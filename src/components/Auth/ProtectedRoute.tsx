import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'owner';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();


  // If still loading authentication state, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and the user doesn't have that role, redirect appropriately
  if (requiredRole && currentUser.role !== requiredRole) {
    if (requiredRole === 'customer') {
      return <Navigate to="/login" replace />;
    } else if (requiredRole === 'owner') {
      return <Navigate to="/login" replace />;
    }
  }

  // If user is authenticated and has the required role (if specified), render the children
  return <>{children}</>;
};

export default ProtectedRoute;
