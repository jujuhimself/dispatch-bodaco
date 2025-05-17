
import React, { createContext, useContext } from 'react';
import useAuthHook from '@/hooks/useAuth';
import type { UseAuthReturn } from '@/hooks/useAuth';

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
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
