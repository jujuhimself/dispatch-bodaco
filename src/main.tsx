
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { RBACProvider } from '@/services/rbac-service';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { Toaster } from '@/components/ui/use-toast';
import { pwaService } from '@/services/pwa-service';
import App from './App.tsx';
import './index.css';

// Production-optimized React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Enhanced error reporting
const reportError = (error: Error, errorInfo?: any) => {
  console.error('Application Error:', error);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }
};

// Global error handlers
window.addEventListener('error', (event) => {
  reportError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  reportError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
    reason: event.reason
  });
});

// Initialize PWA service
pwaService;

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML template.');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ProductionErrorBoundary onError={reportError}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RBACProvider>
            <App />
            <Toaster />
          </RBACProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ProductionErrorBoundary>
  </React.StrictMode>
);
