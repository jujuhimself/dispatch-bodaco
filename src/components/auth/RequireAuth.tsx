
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to the auth page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the protected component
  return <>{children}</>;
};

export default RequireAuth;
