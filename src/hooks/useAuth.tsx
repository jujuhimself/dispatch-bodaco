
import { useState, useCallback, useEffect } from 'react';
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
  const [loading, setLoading] = useState<boolean>(false); // Changed to false by default
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        
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
        } else {
          setUser(null);
          setApprovalStatus(null);
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
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    // Initial session check
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setApprovalStatus(null);
          setLoading(false);
        } else if (session?.user) {
          // Use setTimeout to prevent recursive calls
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            
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
            setLoading(false);
          }, 0);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast.success('Signed in successfully!');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Error signing in');
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
        toast.success('Registration successful! Please check your email to verify your account.');
      } else if (data?.user) {
        toast.success('Registration successful! Your account is pending admin approval.');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error during registration');
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
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
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
      toast.error('Error sending verification email');
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