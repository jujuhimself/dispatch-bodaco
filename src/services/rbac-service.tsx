
import React, { createContext, useContext, ReactNode } from 'react';
import { UserRole } from '@/types/auth-types';
import { useAuth } from '@/contexts/AuthContext';

// Define permission structure
export type Permission = 
  | 'view:dashboards'
  | 'view:emergencies'
  | 'create:emergencies'
  | 'update:emergencies'
  | 'delete:emergencies'
  | 'assign:responders'
  | 'view:responders'
  | 'manage:responders'
  | 'view:hospitals'
  | 'manage:hospitals'
  | 'view:reports'
  | 'create:reports'
  | 'manage:users'
  | 'view:analytics'
  | 'manage:settings'
  | 'view:communications'
  | 'send:messages'
  | 'manage:channels'
  | 'view:iot'
  | 'manage:iot';

// Role-based permissions map
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view:dashboards',
    'view:emergencies',
    'create:emergencies',
    'update:emergencies',
    'delete:emergencies',
    'assign:responders',
    'view:responders',
    'manage:responders',
    'view:hospitals',
    'manage:hospitals',
    'view:reports',
    'create:reports',
    'manage:users',
    'view:analytics',
    'manage:settings',
    'view:communications',
    'send:messages',
    'manage:channels',
    'view:iot',
    'manage:iot'
  ],
  dispatcher: [
    'view:dashboards',
    'view:emergencies',
    'create:emergencies',
    'update:emergencies',
    'assign:responders',
    'view:responders',
    'view:hospitals',
    'view:reports',
    'create:reports',
    'view:communications',
    'send:messages',
    'view:iot'
  ],
  responder: [
    'view:emergencies',
    'view:dashboards',
    'view:hospitals',
    'view:communications',
    'send:messages'
  ],
  user: [
    'view:emergencies',
    'create:emergencies',
    'view:communications',
    'send:messages'
  ]
};

// Helper function to check if a role has a permission
export const hasPermission = (role: UserRole | string, permission: Permission): boolean => {
  // Convert string to UserRole type
  const userRole = role as UserRole;
  
  // Check if role exists in our permissions map
  if (!rolePermissions[userRole]) {
    return false;
  }
  
  return rolePermissions[userRole].includes(permission);
};

// Context for RBAC
type RBACContextType = {
  hasAccess: (permission: Permission) => boolean;
  userRole: UserRole | null;
};

const RBACContext = createContext<RBACContextType>({
  hasAccess: () => false,
  userRole: null
});

// Provider component
export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  
  const userRole = auth?.user_metadata?.role as UserRole || null;
  
  const hasAccess = (permission: Permission): boolean => {
    if (!auth || !userRole) return false;
    return hasPermission(userRole, permission);
  };
  
  return (
    <RBACContext.Provider value={{ hasAccess, userRole }}>
      {children}
    </RBACContext.Provider>
  );
};

// Custom hook to use RBAC
export const useRBAC = () => useContext(RBACContext);

// Permission-based component wrapper
interface WithPermissionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  children,
  fallback = null
}) => {
  const { hasAccess } = useRBAC();
  
  return hasAccess(permission) ? <>{children}</> : <>{fallback}</>;
};
