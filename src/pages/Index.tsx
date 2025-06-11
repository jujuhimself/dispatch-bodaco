
import React, { Suspense, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/dashboard/Dashboard';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LoadingState } from '@/components/ui/loading-state';
import { useNetworkStatus } from '@/services/network/network-status';
import { toast } from "sonner";

const Index = () => {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();
  const { online } = useNetworkStatus();
  
  useEffect(() => {
    // If not loading and not authenticated, redirect to auth
    if (!loading && !auth) {
      navigate('/auth');
    }
  }, [auth, loading, navigate]);

  // Simple network status notification (only show offline warning)
  useEffect(() => {
    if (!online) {
      toast.warning("You are currently offline. Some features may be limited.", { 
        id: 'offline-warning',
        duration: 5000 
      });
    }
  }, [online]);

  // If authenticated, show dashboard immediately
  if (auth) {
    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="p-8 w-full">
            <LoadingState isLoading={true} variant="skeleton">
              <></>
            </LoadingState>
          </div>
        }>
          <Dashboard />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // This shouldn't be reached due to the redirect effect
  return null;
};

export default Index;
