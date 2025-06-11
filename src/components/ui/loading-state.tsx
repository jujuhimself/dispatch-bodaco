
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  variant?: 'spinner' | 'skeleton' | 'blur';
  spinnerSize?: 'sm' | 'md' | 'lg';
  fallback?: React.ReactNode;
  className?: string;
}

export function LoadingState({
  isLoading,
  children,
  variant = 'spinner',
  spinnerSize = 'md',
  fallback,
  className
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn("w-full space-y-3", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (variant === 'blur') {
    return (
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center bg-white/50">
          <Loader className={cn(
            "text-primary",
            spinnerSize === 'sm' ? "h-4 w-4" : 
            spinnerSize === 'lg' ? "h-8 w-8" : 
            "h-6 w-6"
          )} />
        </div>
        <div className="opacity-50">{children}</div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex justify-center items-center p-8", className)}>
      <Loader className={cn(
        "text-primary",
        spinnerSize === 'sm' ? "h-4 w-4" : 
        spinnerSize === 'lg' ? "h-8 w-8" : 
        "h-6 w-6"
      )} />
    </div>
  );
}
