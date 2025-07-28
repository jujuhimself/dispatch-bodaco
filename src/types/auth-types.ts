
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
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  
  // Email verification status - derived from auth.users.email_confirmed_at
  email_confirmed: boolean;
  
  // Admin approval
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_at?: string | null;
  approved_by?: string | null;
  rejection_reason?: string | null;
  
  // Metadata fields that might be present in the database
  [key: string]: any;
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
  email_verified?: boolean;
  provider?: string;
  [key: string]: any; // Allow for additional metadata
}
