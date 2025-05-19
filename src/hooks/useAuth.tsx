import React, { useState, useCallback, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/auth-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UseAuthReturn {
  user: UserProfile | null;
  auth: UserProfile | null; // Explicitly include auth as an alias for user
  loading: boolean;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    try {
      // Set loading true before checking session
      setLoading(true);
      
      // Get session from supabase
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        // Get user profile data from profiles table if it exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileData) {
          // Use profile data if available
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            role: (profileData.role as UserRole) || 'user',
            name: profileData.name || '',
            phone_number: profileData.phone_number || '',
            avatar_url: profileData.avatar_url || '',
            created_at: profileData.created_at,
            last_sign_in_at: profileData.last_sign_in_at
          });
        } else {
          // Fallback to auth user data
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            role: (data.session.user.user_metadata?.role as UserRole) || 'user',
            name: data.session.user.user_metadata?.name || '',
            phone_number: data.session.user.user_metadata?.phone_number || ''
          } as UserProfile);
          
          // If profile doesn't exist but should, create it
          if (!profileError) {
            await supabase.from('profiles').insert({
              id: data.session.user.id,
              email: data.session.user.email,
              role: 'user',
              name: data.session.user.user_metadata?.name,
              phone_number: data.session.user.user_metadata?.phone_number
            });
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      // Make sure to set loading to false AFTER all async operations
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up initial loading state
    setLoading(true);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        // Don't make any async calls here directly to prevent deadlocks
        // Just trigger the checkSession function on auth state changes
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          // Use setTimeout to avoid potential deadlocks in the Supabase auth state management
          setTimeout(() => {
            checkSession();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Initial session check
    checkSession();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Session will be handled by the onAuthStateChange listener
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
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
      
      // If user was created successfully but needs email verification
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
    auth: user, // Explicitly set auth as an alias for user
    loading,
    checkSession,
    signIn,
    signUp,
    signOut,
    sendVerificationEmail
  };
};

export default useAuth;
