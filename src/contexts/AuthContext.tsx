
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Session } from '@supabase/supabase-js';
import { markPerformance } from '@/services/performance/metrics-collector';

interface AuthContextType {
  auth: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUserData: (data: any) => Promise<void>;
  // Added these properties to match usage in other components
  user: User | null;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
}

const initialValue: AuthContextType = {
  auth: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  checkSession: async () => {},
  refreshAuth: async () => {},
  updateUserData: async () => {},
  // Added these properties to match usage in other components
  user: null,
  signUp: async () => {},
};

export const AuthContext = createContext<AuthContextType>(initialValue);

// Create a hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const checkSession = useCallback(async () => {
    try {
      markPerformance('auth-check-start');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        throw error;
      }
      
      if (data?.session) {
        setSession(data.session);
        setAuth(data.session.user);
      } else {
        setSession(null);
        setAuth(null);
      }
      
      markPerformance('auth-check-complete');
    } catch (error) {
      console.error('Session check failed:', error);
      setSession(null);
      setAuth(null);
    } finally {
      // Ensure loading state is updated regardless of success/failure
      setLoading(false);
    }
  }, []);
  
  const refreshAuth = useCallback(async () => {
    setLoading(true);
    await checkSession();
  }, [checkSession]);
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setSession(data.session);
      setAuth(data.user);
      toast.success('Signed in successfully');
    } catch (error: any) {
      toast.error(`Sign in failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Add signUp function to match usage in Auth.tsx
  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        }
      });
      
      if (error) throw error;
      
      toast.success('Signed up successfully. Please check your email to verify your account.');
    } catch (error: any) {
      toast.error(`Sign up failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setAuth(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(`Sign out failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserData = async (userData: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser(userData);
      
      if (error) throw error;
      
      setAuth(data.user);
      toast.success('User data updated successfully');
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
      throw error;
    }
  };
  
  useEffect(() => {
    // Set up authentication subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuth(session?.user || null);
        setLoading(false);
      }
    );
    
    // Initial session check
    checkSession();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);
  
  const value: AuthContextType = {
    auth,
    session,
    loading,
    signIn,
    signOut,
    checkSession,
    refreshAuth,
    updateUserData,
    // Add these properties to match usage in other components
    user: auth,
    signUp,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
