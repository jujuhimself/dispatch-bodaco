
import { useState, useCallback } from 'react';
import { UserProfile } from '@/types/auth-types';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [auth, setAuth] = useState<UserProfile | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { id, email, user_metadata } = data.session.user;
        
        // Set basic user profile
        setAuth({
          id,
          email: email || '',
          role: user_metadata?.role || 'dispatcher',
          name: user_metadata?.name || '',
          avatar_url: user_metadata?.avatar_url || '',
          phone_number: user_metadata?.phone_number || '',
          created_at: data.session.user.created_at,
          last_sign_in_at: data.session.user.last_sign_in_at
        });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setAuth(null);
    }
  }, []);

  return { auth, setAuth, checkSession };
}
