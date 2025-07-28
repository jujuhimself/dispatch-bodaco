import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth-types';

export interface UserVerificationStatus {
  isVerified: boolean;
  isApproved: boolean;
  user: UserProfile | null;
}

/**
 * Check if a user's email is verified and if their account is approved
 * @param userId The user's ID
 * @returns Promise with verification and approval status
 */
export const checkUserVerification = async (userId: string): Promise<UserVerificationStatus> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      return { isVerified: false, isApproved: false, user: null };
    }

    const isVerified = !!profile.email_confirmed_at;
    const isApproved = profile.approval_status === 'approved';

    return {
      isVerified,
      isApproved,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.name || '',
        phone_number: profile.phone_number || '',
        approval_status: profile.approval_status,
      },
    };
  } catch (error) {
    console.error('Error in checkUserVerification:', error);
    return { isVerified: false, isApproved: false, user: null };
  }
};

/**
 * Require the user to have a verified email and approved account
 * @param userId The user's ID
 * @returns Promise with the user's profile if verified and approved
 * @throws Error if user is not verified or approved
 */
export const requireVerifiedUser = async (userId: string): Promise<UserProfile> => {
  const { isVerified, isApproved, user } = await checkUserVerification(userId);
  
  if (!isVerified) {
    throw new Error('Please verify your email address before continuing.');
  }
  
  if (!isApproved) {
    throw new Error('Your account is pending admin approval. Please contact support if this takes more than 24 hours.');
  }
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

/**
 * Check if the current user is an admin
 * @param userId The user's ID
 * @returns Promise<boolean> True if the user is an admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return profile.role === 'admin';
  } catch (error) {
    console.error('Error in isUserAdmin:', error);
    return false;
  }
};
