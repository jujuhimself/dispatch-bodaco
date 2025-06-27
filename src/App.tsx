
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import RequireAuth from '@/components/auth/RequireAuth';
import Auth from '@/pages/Auth';
import AdminDashboard from '@/pages/AdminDashboard';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Default route redirects to auth */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
              
              {/* Auth page for login/signup */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected admin dashboard */}
              <Route 
                path="/admin" 
                element={
                  <RequireAuth>
                    <AdminDashboard />
                  </RequireAuth>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
