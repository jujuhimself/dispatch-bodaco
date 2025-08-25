import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MailCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Permission, hasPermission } from '@/types/rbac-types';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Minimum required role to access this route
   * @default 'user'
   */
  requiredRole?: 'admin' | 'dispatcher' | 'responder' | 'user';
  /**
   * Specific permissions required to access this route
   * User must have ALL specified permissions
   */
  requiredPermissions?: Permission[];
  /**
   * Any of the specified permissions will grant access
   * User needs at least ONE of the specified permissions
   */
  anyPermissions?: Permission[];
  /**
   * Whether email verification is required
   * @default true
   */
  requireVerifiedEmail?: boolean;
  /**
   * Whether admin approval is required
   * @default true
   */
  requireApprovedAccount?: boolean;
  /**
   * Custom unauthorized component to render when access is denied
   */
  unauthorizedComponent?: ReactNode;
}

// Role hierarchy - each role inherits permissions from roles to the right
const ROLE_HIERARCHY: Record<string, number> = {
  admin: 4,
  dispatcher: 3,
  responder: 2,
  user: 1
};

const ProtectedRoute = ({ 
  children, 
  requiredRole = 'user',
  requiredPermissions = [],
  anyPermissions = [],
  requireVerifiedEmail = true,
  requireApprovedAccount = true,
  unauthorizedComponent
}: ProtectedRouteProps) => {
  const { user, loading, signOut } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine dashboard path based on user role
  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'dispatcher':
        return '/dispatcher-dashboard';
      case 'responder':
        return '/responder-dashboard';
      default:
        return '/user-dashboard';
    }
  };
  
  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    try {
      setIsVerifying(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`
        }
      });
      
      if (error) throw error;
      
      setIsVerificationSent(true);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Redirect to appropriate dashboard if already authenticated and trying to access auth page
  if (location.pathname === '/auth' && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // Redirect to appropriate dashboard if trying to access root path
  if (location.pathname === '/' && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // Check if account is rejected
  if (user.approval_status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Account Rejected</h2>
          <p className="text-gray-600">
            Your account application has been rejected.
          </p>
          <p className="text-sm text-gray-500">
            Please contact support for more information.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'} 
            variant="outline"
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Check if account needs approval (skip for admins)
  const needsApproval = requireApprovedAccount && 
    user && 
    user.role !== 'admin' && 
    user.approval_status !== 'approved';

  if (needsApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Account Pending Approval</h2>
            <p className="mt-2 text-gray-600">
              Thank you for registering! Your account is currently under review by our team.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              You'll receive an email notification once your account has been approved.
              This usually takes 24-48 hours.
            </p>
            
            <div className="mt-6">
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
              
              <p className="mt-4 text-sm text-gray-500">
                Need help?{' '}
                <a 
                  href="mailto:support@boda-co.com" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if email needs verification (skip for admins)
  const needsVerification =
    requireVerifiedEmail && user && user.role !== 'admin' && !user.email_confirmed;

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <MailCheck className="h-12 w-12 mx-auto text-blue-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="mt-2 text-gray-600">
              We've sent a verification link to <span className="font-medium">{user.email}</span>.
              Please check your inbox and click the link to verify your email address.
            </p>
            
            <div className="mt-6">
              <Button
                onClick={handleResendVerification}
                disabled={isVerifying || isVerificationSent}
                className="w-full justify-center"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : isVerificationSent ? (
                  'Email Sent!'
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              <button
                onClick={() => signOut()}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign out and return to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has the required role based on hierarchy
  const hasRequiredRole = !requiredRole || 
    (user && ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole]);

  // Check if user has all required permissions
  const hasAllRequiredPerms = requiredPermissions.length === 0 || 
    (user && requiredPermissions.every(perm => hasPermission(user.role, perm)));

  // Check if user has any of the required permissions
  const hasAnyRequiredPerms = anyPermissions.length === 0 ||
    (user && anyPermissions.some(perm => hasPermission(user.role, perm)));

  // Check if user is authorized
  const isAuthorized = hasRequiredRole && hasAllRequiredPerms && hasAnyRequiredPerms;
  
  // If not authorized, show unauthorized message or redirect
  if (!isAuthorized) {
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
          {requiredRole && (
            <p className="text-sm text-gray-500">
              Required role: {requiredRole}
            </p>
          )}
          <div className="pt-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mr-2"
            >
              Go Back
            </Button>
            <Button onClick={() => navigate(getDashboardPath(user.role))}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;