
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { RBACProvider } from '@/services/rbac-service';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { Toaster } from '@/components/ui/use-toast';
import App from './App.tsx';
import './index.css';

// Optimized React Query client for faster startup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Initialize PWA service in background (non-blocking)
setTimeout(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(error => console.log('SW registration failed:', error));
  }
}, 2000);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML template.');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ProductionErrorBoundary>
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
