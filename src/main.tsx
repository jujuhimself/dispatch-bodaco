
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { RBACProvider } from '@/services/rbac-service';
import { registerServiceWorker } from '@/services/service-worker-registration';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Create a React Query client with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000, // 5 minutes
      networkMode: 'online',
    },
  },
});

// Register service worker for offline capabilities
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    registerServiceWorker().catch(error => {
      console.error('Service worker registration failed:', error);
    });
  });
}

// Add global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Here you could send to a monitoring service
});

// Add global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Here you could send to a monitoring service
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RBACProvider>
            <App />
          </RBACProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
