
import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserProfile } from '@/types/auth-types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  auth: UserProfile | null;
  setAuth: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => {},
});

// Create a useAuth hook to easily access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the hook from the custom hook file to maintain backward compatibility
export { useAuth as default } from '@/hooks/useAuth';
