
// User roles for the application
export type UserRole = 'admin' | 'dispatcher' | 'responder' | 'user';

// Extended User profile
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone_number?: string;
  avatar_url?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

// User settings interface
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  density: 'compact' | 'normal' | 'comfortable';
}

// Modified AuthSession type to match our needs
export interface AuthSession {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Define UserMetadata type to match Supabase expectations
export interface UserMetadata {
  name?: string;
  phone_number?: string;
  role?: UserRole;
}
