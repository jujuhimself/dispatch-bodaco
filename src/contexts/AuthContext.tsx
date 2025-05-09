
import React, { createContext } from 'react';
import { UserProfile } from '@/types/auth-types';

interface AuthContextType {
  auth: UserProfile | null;
  setAuth: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: () => {},
});
