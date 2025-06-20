
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML template.');
}

const root = createRoot(rootElement);

// Simplified React initialization without duplicate providers
root.render(
  <React.StrictMode>
    <ProductionErrorBoundary>
      <App />
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
