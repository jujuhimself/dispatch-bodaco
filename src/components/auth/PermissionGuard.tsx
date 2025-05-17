
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { usePermissions, Permission } from '@/services/rbac-service';
import { UserRole } from '@/types/auth-types';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole | UserRole[];
  fallback?: ReactNode; // Optional fallback component
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallback
}) => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();

  // First, check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let hasAccess = true;

  // Check permission if specified
  if (requiredPermission) {
    hasAccess = permissions.hasPermission(requiredPermission);
  }

  // Check role if specified
  if (requiredRole && hasAccess) {
    hasAccess = permissions.hasRole(requiredRole);
  }

  // If no access, show fallback or navigate to dashboard
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default fallback is an access denied message
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <div className="mt-4">
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  // If user has access, render the protected component
  return <>{children}</>;
};

export default PermissionGuard;
