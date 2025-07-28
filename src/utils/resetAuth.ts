import { supabase } from '@/integrations/supabase/client';

/**
 * Completely resets the authentication state by:
 * 1. Clearing all auth-related data from localStorage and sessionStorage
 * 2. Signing out from Supabase
 * 3. Removing any auth tokens
 */
export const resetAuthState = async (): Promise<boolean> => {
  try {
    // Clear all auth-related data from localStorage
    if (typeof window !== 'undefined') {
      console.log('Clearing auth data...');
      
      // Clear all Supabase-related keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.startsWith('supabase.') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('Removing from storage:', key);
        localStorage.removeItem(key);
      });
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear cookies by setting expiration to the past
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }
    
    // Sign out from Supabase without triggering redirects
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.warn('Error during sign out (non-critical):', err);
    }
    
    // Clear any remaining session
    try {
      await supabase.auth.setSession(null);
    } catch (err) {
      console.log('No session to clear or error clearing session:', err);
    }
    
    console.log('Auth state has been completely reset');
    return true;
  } catch (error) {
    console.error('Error resetting auth state:', error);
    return false;
  }
};
