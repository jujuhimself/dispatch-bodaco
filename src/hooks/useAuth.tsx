
import React, { useState, useCallback, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/auth-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UseAuthReturn {
  user: UserProfile | null;
  auth: UserProfile | null;
  loading: boolean;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState(false);

  const checkSession = useCallback(async () => {
    if (initialized) return;
    
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        const basicProfile: UserProfile = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          role: (data.session.user.user_metadata?.role as UserRole) || 'user',
          name: data.session.user.user_metadata?.name || '',
          phone_number: data.session.user.user_metadata?.phone_number || ''
        };
        
        setUser(basicProfile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (['SIGNED_IN', 'TOKEN_REFRESHED'].includes(event) && session?.user) {
          const basicProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as UserRole) || 'user',
            name: session.user.user_metadata?.name || '',
            phone_number: session.user.user_metadata?.phone_number || ''
          };
          setUser(basicProfile);
        }
        setLoading(false);
      }
    );

    // Check session immediately without blocking
    if (!initialized) {
      checkSession();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, initialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      
      if (data?.user && !data.session) {
        toast.info('Please check your email to verify your account before logging in.');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    auth: user,
    loading,
    checkSession,
    signIn,
    signUp,
    signOut,
    sendVerificationEmail
  };
};

export default useAuth;
