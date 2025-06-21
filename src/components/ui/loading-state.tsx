
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading: boolean;
  children?: React.ReactNode;
  variant?: 'spinner' | 'skeleton' | 'blur';
  spinnerSize?: 'sm' | 'md' | 'lg';
  fallback?: React.ReactNode;
  className?: string;
}

// Lightweight spinner component
const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div
    className={cn(
      "animate-spin rounded-full border-2 border-gray-300 border-t-orange-500",
      size === 'sm' ? "h-4 w-4" : 
      size === 'lg' ? "h-8 w-8" : 
      "h-6 w-6"
    )}
  />
);

// Simple skeleton component
const SimpleSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

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
        <SimpleSkeleton className="h-4 w-full" />
        <SimpleSkeleton className="h-4 w-3/4" />
        <SimpleSkeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (variant === 'blur' && children) {
    return (
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center bg-white/50">
          <Spinner size={spinnerSize} />
        </div>
        <div className="opacity-50">{children}</div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex justify-center items-center p-8", className)}>
      <Spinner size={spinnerSize} />
    </div>
  );
}
