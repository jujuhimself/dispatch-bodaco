
import React, { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui/loader';
import Dashboard from '@/components/dashboard/Dashboard';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !auth) {
      navigate('/login');
    }
  }, [auth, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100">
        <div className="flex flex-col items-center">
          <Loader className="h-12 w-12 text-emergency-600 mb-4" />
          <p className="text-emergency-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard
  if (auth) {
    return (
      <Suspense fallback={
        <div className="p-8 w-full">
          <Skeleton className="h-[400px] w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      }>
        <Dashboard />
      </Suspense>
    );
  }

  // This shouldn't be reached due to the redirect effect
  return null;
};

export default Index;
