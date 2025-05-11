
import React, { createContext, useContext } from 'react';
import { UserProfile } from '@/types/auth-types';
import useAuthHook, { UseAuthReturn } from '@/hooks/useAuth';

// Create the auth context
export const AuthContext = createContext<UseAuthReturn>({
  auth: null,
  setAuth: () => {},
  checkSession: async () => {},
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  sendVerificationEmail: async () => {}
});

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the original hook for backward compatibility
export { default as useAuthHook } from '@/hooks/useAuth';
