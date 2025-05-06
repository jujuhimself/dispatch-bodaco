
export type UserRole = 'admin' | 'dispatcher' | 'responder';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export interface AuthState {
  user: UserProfile | null;
  session: any;
  loading: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}
