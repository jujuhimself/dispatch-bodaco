
import React, { Suspense, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui/loader';
import Dashboard from '@/components/dashboard/Dashboard';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LoadingState } from '@/components/ui/loading-state';
import { markPerformance, measurePerformance } from '@/services/performance/metrics-collector';
import { useNetworkStatus } from '@/services/network/network-status';
import { toast } from "sonner";

const Index = () => {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();
  const { online } = useNetworkStatus();
  
  // Performance tracking
  useEffect(() => {
    markPerformance('index-page-mount');
    
    return () => {
      const loadTime = measurePerformance('index-page-render', 'index-page-mount', 'index-page-complete');
      if (loadTime) {
        console.log(`Index page rendered in ${loadTime.toFixed(2)}ms`);
      }
    };
  }, []);
  
  // Mark when the component completes initial render
  useEffect(() => {
    if (!loading) {
      markPerformance('index-page-complete');
    }
  }, [loading]);
  
  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !auth) {
      navigate('/login');
    }
  }, [auth, loading, navigate]);

  // Notify user when network status changes
  useEffect(() => {
    if (!online) {
      toast.warning("You are currently offline. Some features may be limited.");
    } else {
      toast.success("You are back online!");
    }
  }, [online]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
        <div className="flex flex-col items-center">
          <Loader className="h-12 w-12 text-emergency-600 mb-4" />
          <p className="text-emergency-700">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            {!online && "Working in offline mode"}
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard
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
