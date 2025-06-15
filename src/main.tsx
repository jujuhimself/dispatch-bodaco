
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import App from './App.tsx';
import './index.css';

// Optimized React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML template.');
}

const root = createRoot(rootElement);

// Ensure proper React initialization with correct provider order
root.render(
  <React.StrictMode>
    <ProductionErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ProductionErrorBoundary>
  </React.StrictMode>
);

// Background service worker registration
setTimeout(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(error => console.log('SW registration failed:', error));
  }
}, 3000);
