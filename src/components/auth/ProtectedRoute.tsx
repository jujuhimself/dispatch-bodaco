
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check user approval status
  if (user.approval_status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Account Pending Approval</h1>
          <p className="text-gray-600 mb-4">
            Your account is currently being reviewed by an administrator.
          </p>
          <p className="text-sm text-gray-500">
            You will receive an email once your account has been approved.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'} 
            className="mt-4"
            variant="outline"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (user.approval_status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Account Rejected</h1>
          <p className="text-gray-600 mb-4">
            Your account application has been rejected.
          </p>
          <p className="text-sm text-gray-500">
            Please contact support for more information.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'} 
            className="mt-4"
            variant="outline"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {requiredRole}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
