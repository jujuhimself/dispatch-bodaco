
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui/loader';
import { UserRole } from '@/types/auth-types';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // We can use this to log authentication attempts for security monitoring
    if (!loading && !user) {
      console.log('Unauthenticated access attempt to', location.pathname);
    }
  }, [loading, user, location.pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-100">
        <Loader />
      </div>
    );
  }

  if (!user) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-100 p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          Sorry, you don't have permission to access this page.
          You need to have one of these roles: {roles.join(', ')}.
        </p>
        <a href="/" className="text-emergency-600 hover:underline">
          Return to Dashboard
        </a>
      </div>
    );
  }

  // If the user is authenticated and has the required role, render the protected component
  return <>{children}</>;
};

export default RequireAuth;
