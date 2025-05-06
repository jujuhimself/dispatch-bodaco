
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole, AuthContextType } from '@/types/auth-types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          const { id, email, user_metadata } = currentSession.user;
          
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(() => {
            setUser({
              id,
              email: email || '',
              role: (user_metadata?.role as UserRole) || 'dispatcher',
              name: user_metadata?.name || '',
              avatar_url: user_metadata?.avatar_url || '',
              phone_number: user_metadata?.phone_number || '',
              created_at: currentSession.user.created_at,
              last_sign_in_at: currentSession.user.last_sign_in_at
            });
          }, 0);
        } else {
          setUser(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const { id, email, user_metadata } = currentSession.user;
        
        setUser({
          id,
          email: email || '',
          role: (user_metadata?.role as UserRole) || 'dispatcher',
          name: user_metadata?.name || '',
          avatar_url: user_metadata?.avatar_url || '',
          phone_number: user_metadata?.phone_number || '',
          created_at: currentSession.user.created_at,
          last_sign_in_at: currentSession.user.last_sign_in_at
        });
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate('/');
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Error during sign in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      
      toast.success('Registration successful! Please check your email for verification.');
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Error during sign up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Error during sign out');
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
