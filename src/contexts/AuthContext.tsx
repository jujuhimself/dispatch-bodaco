
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
  const auth = useAuthHook();
  
  // Show loading state while initializing auth
  if (auth.loading && auth.user === null) {
    return <LoadingState isLoading={true} className="min-h-screen" />;
  }
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
