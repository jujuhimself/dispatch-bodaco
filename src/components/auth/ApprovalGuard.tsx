
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, XCircle } from 'lucide-react';

interface ApprovalGuardProps {
  children: React.ReactNode;
}

const ApprovalGuard: React.FC<ApprovalGuardProps> = ({ children }) => {
  const { user, approvalStatus, signOut } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is approved, render the protected component
  if (approvalStatus === 'approved') {
    return <>{children}</>;
  }

  // Handle pending approval
  if (approvalStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-yellow-100 p-3 rounded-full mb-4">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-slate-800">Account Pending Approval</CardTitle>
            <CardDescription>
              Your account registration is being reviewed by our administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Thank you for registering with Boda & Co Emergency Response Platform. 
              Your account is currently pending approval from our admin team.
            </p>
            <p className="text-sm text-slate-500">
              You will receive an email notification once your account has been approved.
            </p>
            <Button 
              onClick={signOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle rejected approval
  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full shadow-xl border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 p-3 rounded-full mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Account Access Denied</CardTitle>
            <CardDescription>
              Your account registration has been declined.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Your access to the Emergency Response Platform has been denied.
              </p>
            </div>
            <p className="text-slate-600">
              If you believe this is an error, please contact your system administrator.
            </p>
            <Button 
              onClick={signOut}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default fallback
  return <Navigate to="/auth" replace />;
};

export default ApprovalGuard;
