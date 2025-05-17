
import React, { createContext, useState, useEffect, useCallback } from 'react';
import useAuth, { UseAuthReturn } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Create a context with the same shape as our hook
export const AuthContext = createContext<UseAuthReturn | null>(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = React.useContext(AuthContext);
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
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
