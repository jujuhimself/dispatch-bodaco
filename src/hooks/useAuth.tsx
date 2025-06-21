
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
  approvalStatus: string | null;
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    if (initialized) return;
    
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        // Fetch user profile with approval status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
          setApprovalStatus(null);
          return;
        }

        if (profile) {
          const basicProfile: UserProfile = {
            id: profile.id,
            email: profile.email || data.session.user.email || '',
            role: (profile.role as UserRole) || 'user',
            name: profile.name || '',
            phone_number: profile.phone_number || '',
            approval_status: profile.approval_status
          };
          
          setUser(basicProfile);
          setApprovalStatus(profile.approval_status);

          // Check if user is not approved
          if (profile.approval_status !== 'approved') {
            if (profile.approval_status === 'rejected') {
              toast.error(`Account access denied. ${profile.rejection_reason || 'Please contact administrator.'}`);
            } else if (profile.approval_status === 'pending') {
              toast.info('Your account is pending admin approval. Please wait for approval before accessing the system.');
            }
          }
        }
      } else {
        setUser(null);
        setApprovalStatus(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
      setApprovalStatus(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setApprovalStatus(null);
        } else if (['SIGNED_IN', 'TOKEN_REFRESHED'].includes(event) && session?.user) {
          // Fetch profile with approval status
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const basicProfile: UserProfile = {
              id: profile.id,
              email: profile.email || session.user.email || '',
              role: (profile.role as UserRole) || 'user',
              name: profile.name || '',
              phone_number: profile.phone_number || '',
              approval_status: profile.approval_status
            };
            setUser(basicProfile);
            setApprovalStatus(profile.approval_status);
          }
        }
        setLoading(false);
      }
    );

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
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
      
      if (data?.user && !data.session) {
        toast.info('Please check your email to verify your account before logging in.');
      } else if (data?.user) {
        toast.success('Account created! Your registration is pending admin approval.');
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
      setApprovalStatus(null);
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
          emailRedirectTo: `${window.location.origin}/auth`
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
    sendVerificationEmail,
    approvalStatus
  };
};

export default useAuth;
