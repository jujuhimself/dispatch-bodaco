
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ApprovalGuard from './ApprovalGuard';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wrap with approval guard to check approval status
  return (
    <ApprovalGuard>
      {children}
    </ApprovalGuard>
  );
};

export default RequireAuth;
