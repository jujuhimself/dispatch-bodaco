import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, UserRole } from '@/types/auth-types';
import { Session, User } from '@supabase/supabase-js';
import { supabase, resetAuthState } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UseAuthReturn {
  user: UserProfile | null;
  auth: UserProfile | null;
  loading: boolean;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  resetPasswordConfirm: (token: string, newPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  approvalStatus: string | null;
}

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start with true to handle initial load
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const refreshTokenTimer = useRef<NodeJS.Timeout>();

  // Helper to clear auth state
  const clearAuthState = useCallback(() => {
    setUser(null);
    setApprovalStatus(null);
    if (refreshTokenTimer.current) {
      clearTimeout(refreshTokenTimer.current);
    }
  }, []);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    if (refreshTokenTimer.current) {
      clearTimeout(refreshTokenTimer.current);
    }
    
    // Refresh token 1 minute before it expires
    const refreshTime = (expiresIn - 60) * 1000; // Convert to milliseconds
    
    refreshTokenTimer.current = setTimeout(async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        clearAuthState();
      } else if (data?.session) {
        scheduleTokenRefresh(data.session.expires_in || 3600);
      }
    }, refreshTime);
  }, []);

  // Fetch user profile from the database, creating it if it doesn't exist
  const fetchUserProfile = useCallback(async (authUser: User): Promise<UserProfile | null> => {
    try {
      if (!authUser) {
        console.error('No authenticated user provided');
        return null;
      }
      
      // Get the auth user data with fresh session
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        console.error('Error fetching auth user:', authError);
        return null;
      }

      // First try to get the existing profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, role, phone_number, avatar_url, created_at, approval_status, approved_at, approved_by, rejection_reason')
        .eq('id', currentUser.id)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!profile && !profileError) {
        console.log('Profile not found, creating new profile for user:', currentUser.id);
        
        const newProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
          phone_number: currentUser.user_metadata?.phone_number || '',
          role: 'user',
          approval_status: 'pending',
          email_confirmed: currentUser.email_confirmed_at !== null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Try one more time with upsert
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(newProfile, { onConflict: 'id' });

          if (upsertError) {
            console.error('Error upserting profile:', upsertError);
            throw new Error('Failed to create user profile');
          }
        }

        // Refetch the profile
        const { data: refetchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        profile = refetchedProfile;
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Ensure required fields have defaults
      const email = currentUser.email || '';
      const name = profile.name || email.split('@')[0] || 'User';
      
      // For admin users, we'll treat them as confirmed and approved
      const isAdmin = profile.role === 'admin';
      const emailConfirmed = isAdmin || currentUser.email_confirmed_at !== null;
      
      // If this is an admin and somehow not confirmed, update their status
      if (isAdmin && !currentUser.email_confirmed_at) {
        console.log('Admin user detected without confirmed email, updating...');
        await supabase.auth.updateUser({
          data: { email_confirmed_at: new Date().toISOString() }
        });
      }
      
      // Handle approval status with type safety
      let approvalStatus: 'pending' | 'approved' | 'rejected' = 'pending';
      if (profile.approval_status === 'approved' || profile.approval_status === 'rejected') {
        approvalStatus = profile.approval_status;
      } else if (isAdmin) {
        // Auto-approve admin users
        approvalStatus = 'approved';
      }

      // Create the user profile object with proper typing
      const userProfile: UserProfile = {
        id: currentUser.id,
        email: email,
        role: (['admin', 'dispatcher', 'responder', 'user'].includes(profile.role) 
          ? profile.role as UserRole 
          : 'user'),
        name: name,
        phone_number: profile.phone_number || '',
        avatar_url: profile.avatar_url,
        created_at: profile.created_at || new Date().toISOString(),
        last_sign_in_at: currentUser.last_sign_in_at,
        email_confirmed: emailConfirmed,
        approval_status: approvalStatus,
        approved_at: profile.approved_at || null,
        approved_by: profile.approved_by || null,
        rejection_reason: profile.rejection_reason || null
      };

      console.log('Fetched user profile:', {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        email_confirmed: userProfile.email_confirmed,
        approval_status: userProfile.approval_status
      });

      return userProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Handle auth state changes
  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      clearAuthState();
      return;
    }

    if (session?.user) {
      const profile = await fetchUserProfile(session.user);
      if (profile) {
        setUser(profile);
        setApprovalStatus(profile.approval_status);
        if (session.expires_in) {
          scheduleTokenRefresh(session.expires_in);
        }
      } else {
        clearAuthState();
      }
    } else {
      clearAuthState();
    }
  }, [fetchUserProfile, clearAuthState, scheduleTokenRefresh]);

  // Check the current session and update user state
  const checkSession = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        clearAuthState();
        return;
      }
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        if (profile) {
          setUser(profile);
          setApprovalStatus(profile.approval_status);
          if (session.expires_in) {
            scheduleTokenRefresh(session.expires_in);
          }
        } else {
          clearAuthState();
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

  // Handle authentication state changes
  useEffect(() => {
    // Initial session check
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Cleanup function
    return () => {
      if (refreshTokenTimer.current) {
        clearTimeout(refreshTokenTimer.current);
      }
      subscription?.unsubscribe();
    };
  }, [checkSession, handleAuthChange]);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Starting sign in process...');
      setLoading(true);
      
      // Completely reset auth state first
      console.log('Resetting auth state...');
      await resetAuthState();
      
      console.log('Attempting to sign in with:', { email: email.trim() });
      
      // First check if this is an admin user
      const { data: userData } = await supabase
        .from('profiles')
        .select('role, approval_status')
        .eq('email', email.trim())
        .single();
      
      const isAdmin = userData?.role === 'admin';
      
      // For admin users, bypass email verification
      if (isAdmin) {
        console.log('Admin user detected, bypassing email verification');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (error) throw error;
        if (!data?.session) throw new Error('Authentication failed. No session was created.');
        
        // Force update the email_confirmed_at for admin users
        await supabase.auth.updateUser({
          data: { email_confirmed_at: new Date().toISOString() }
        });
        
        console.log('Admin authentication successful, fetching user profile...');
        const profile = await fetchUserProfile(data.session.user);
        if (!profile) throw new Error('Failed to fetch admin profile');
        
        setUser(profile);
        setApprovalStatus(profile.approval_status);
        return;
      }
      
      // For non-admin users, proceed with normal sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Authentication error details:', {
          name: error.name,
          message: error.message,
          status: error.status,
          // Some errors might have a status code that indicates the specific issue
          ...(error.status ? { statusCode: error.status } : {})
        });
        
        // Provide more specific error messages based on the error status
        let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email before signing in.';
        } else if (error.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      if (!data?.session) {
        console.error('No session returned after sign in attempt');
        throw new Error('Authentication failed. No session was created.');
      }

      console.log('Authentication successful, fetching user profile...');
      const profile = await fetchUserProfile(data.session.user);
      if (!profile) {
        console.error('Failed to fetch user profile after successful authentication');
        await supabase.auth.signOut();
        throw new Error('Your account was authenticated, but we could not load your profile. Please contact support.');
      }

      console.log('User profile loaded successfully:', { 
        id: profile.id,
        email: profile.email,
        role: profile.role,
        approval_status: profile.approval_status
      });
      
      setUser(profile);
      setApprovalStatus(profile.approval_status);
      
      // Schedule token refresh
      if (data.session.expires_in) {
        console.log('Scheduling token refresh in', data.session.expires_in - 60, 'seconds');
        scheduleTokenRefresh(data.session.expires_in);
      }
    } catch (error: any) {
      console.error('Error in signIn:', error);
      toast.error(error.message || 'Error signing in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create or update user profile
  const upsertProfile = async (userId: string, email: string, userData: Partial<UserProfile>) => {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!email) throw new Error('Email is required');

      const isAdmin = userData.role === 'admin';
      
      // Only include fields that exist in the profiles table
      const profileData = {
        id: userId,
        email: email,
        name: userData.name?.trim() || email.split('@')[0] || 'User',
        phone_number: userData.phone_number?.trim() || null,
        role: isAdmin ? 'admin' : 'user',
        approval_status: isAdmin ? 'approved' : 'pending',
        approved_at: isAdmin ? new Date().toISOString() : null,
        approved_by: isAdmin ? userId : null,
        created_at: new Date().toISOString()
      };
      
      console.log('Profile data to upsert:', profileData);
      
      // For admin users, ensure their email is marked as confirmed
      if (isAdmin) {
        console.log('Admin user detected, ensuring email is confirmed');
        await supabase.auth.updateUser({
          data: { email_confirmed_at: new Date().toISOString() }
        });
      }

      console.log('Attempting to create/update profile:', { userId, email });

      // First try to insert the profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);

      // If insert fails with unique violation, try update
      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          console.log('Profile already exists, updating instead');
          const { error: updateError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating profile:', updateError);
            throw new Error(`Failed to update profile: ${updateError.message}`);
          }
        } else {
          console.error('Error inserting profile:', insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
      }

      console.log('Profile created/updated successfully');
      return profileData;
    } catch (error) {
      console.error('Error in upsertProfile:', error);
      throw error instanceof Error ? error : new Error('Unknown error creating profile');
    }
  };

  // Sign up a new user
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>): Promise<void> => {
    try {
      setLoading(true);
      
      // For admin users, we'll auto-confirm their email
      const isAdmin = userData.role === 'admin';
      
      // First, create the user in auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: userData.name?.trim() || '',
            phone_number: userData.phone_number?.trim() || '',
            email_confirmed_at: isAdmin ? new Date().toISOString() : null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        throw new Error(signUpError.message || 'Error creating user');
      }

      if (!authData.user) {
        throw new Error('No user data returned from sign up');
      }

      // Create the user profile in the database
      await upsertProfile(authData.user.id, authData.user.email || email, userData);

      // Try to fetch the user profile to verify it was created
      let userProfile = await fetchUserProfile(authData.user);
      
      // If profile fetch fails, try to create it again (race condition protection)
      if (!userProfile) {
        console.warn('Profile not found after creation, retrying...');
        await upsertProfile(authData.user.id, authData.user.email || email, userData);
        userProfile = await fetchUserProfile(authData.user);
      }

      if (authData.session) {
        if (userProfile) {
          setUser(userProfile);
          setApprovalStatus(userProfile.approval_status);
          scheduleTokenRefresh(authData.session.expires_in);
        }
      } else {
        toast.success('Registration successful! Your account is pending approval. You will receive an email once approved.');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error during registration');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Clear any pending token refresh
      if (refreshTokenTimer.current) {
        clearTimeout(refreshTokenTimer.current);
        refreshTokenTimer.current = undefined;
      }
      
      // Clear local state first to prevent any race conditions
      clearAuthState();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      // Clear all auth-related data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('supabase.')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear any remaining auth state
      await supabase.auth.setSession(null);
      
      // Force a hard reset of the auth state
      setUser(null);
      setLoading(false);
      
      // Redirect to login page
      window.location.href = '/';
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send a password reset email
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      // Don't reveal if the email exists or not for security
      toast.success('If an account exists with this email, you will receive a password reset link.');
      console.error('Password reset error details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Confirm password reset with a token and set a new password
  const resetPasswordConfirm = async (token: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      
      // First verify the token
      const { data: { user }, error: tokenError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });
      
      if (tokenError || !user) {
        throw new Error('Invalid or expired reset token');
      }
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) throw updateError;
      
      toast.success('Password has been reset successfully. You can now sign in with your new password.');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password. The link may have expired.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update the current user's password
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!user?.email) {
        throw new Error('No user is currently signed in');
      }
      
      // First, reauthenticate the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error('Current password is incorrect');
      }
      
      // Then update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send a verification email to the user
  const sendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if the user exists by attempting to sign in
      try {
        // First try to get the user's auth info
        const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: 'temporary-password-123!' // This will fail but we'll handle the error
        });

        if (user?.email_confirmed_at) {
          toast.success('This email has already been verified. You can now sign in.');
          return true;
        }
      } catch (error: any) {
        // If we get an invalid login error, it means the user exists but the password is wrong
        if (error.status === 400 && error.message.includes('Invalid login credentials')) {
          // The user exists, now check if their email is confirmed
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) throw userError;
          
          if (user?.email_confirmed_at) {
            toast.success('This email has already been verified. You can now sign in.');
            return true;
          }
          
          // If we get here, the user exists but email is not confirmed
          // Continue to send verification email
        } else {
          // Some other error occurred
          throw error;
        }
      }

      // Send the verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`
        }
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent! Please check your inbox.');
      return true;
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      
      // Handle specific error cases
      if (error.message.includes('not found')) {
        toast.error('No account found with this email. Please sign up first.');
      } else if (error.message.includes('rate limit')) {
        toast.error('Please wait a few minutes before requesting another verification email.');
      } else {
        toast.error('Error sending verification email. Please try again.');
      }
      
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
    resetPassword,
    resetPasswordConfirm,
    updatePassword,
    approvalStatus,
  };
};

export default useAuth;
