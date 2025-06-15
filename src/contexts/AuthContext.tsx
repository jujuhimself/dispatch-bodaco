
import React, { createContext, useContext } from 'react';
import useAuthHook from '@/hooks/useAuth';
import type { UseAuthReturn } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/loading-state';

// Create a context with the same shape as our hook
export const AuthContext = createContext<UseAuthReturn | null>(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Provider component that uses our useAuth hook internally
export const AuthProvider = ({ children }: AuthProviderProps) => {
  try {
    const auth = useAuthHook();
    
    // Show loading state while initializing auth
    if (auth.loading && auth.user === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    return (
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('Auth provider error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication system error</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
};
