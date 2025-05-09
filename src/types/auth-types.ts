
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'dispatcher' | 'responder' | 'admin';

export interface UserProfile {
  id?: string;
  email: string;
  name?: string;
  phone_number?: string;
  role: UserRole;
  created_at?: string;
  avatar_url?: string;
  last_sign_in_at?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}
