
import React, { useState, useCallback } from 'react';
import { UserProfile, UserRole } from '@/types/auth-types';
import { supabase } from '@/integrations/supabase/client';

export interface UseAuthReturn {
  auth: UserProfile | null;
  setAuth: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  checkSession: () => Promise<void>;
  user: UserProfile | null; // Add this for compatibility with existing code
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
}

const useAuth = (): UseAuthReturn => {
  const [auth, setAuth] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        // For now, just use the auth user data directly without querying profiles
        // since we haven't set up the profiles table yet
        setAuth({
          id: data.session.user.id,
          email: data.session.user.email || '',
          role: 'user' as UserRole, // Explicitly cast this as UserRole type
          name: data.session.user.user_metadata?.name || '',
          phone_number: data.session.user.user_metadata?.phone_number || ''
        } as UserProfile);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await checkSession();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    auth,
    setAuth,
    checkSession,
    user: auth, // Alias for compatibility
    loading,
    signIn,
    signUp
  };
};

export default useAuth;
