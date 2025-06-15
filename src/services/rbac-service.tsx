
import React, { createContext, useContext, ReactNode } from 'react';
import { UserRole } from '@/types/auth-types';
import useAuthHook from '@/hooks/useAuth';

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

// Role-based permissions type
export type RolePermissions = Record<UserRole, Permission[]>;

// Role-based permissions map
const rolePermissions: RolePermissions = {
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
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
};

const RBACContext = createContext<RBACContextType>({
  hasAccess: () => false,
  userRole: null,
  hasPermission: () => false,
  hasRole: () => false
});

// Provider component - FIXED: Use auth hook directly to avoid circular dependency
export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthHook();
  
  const userRole = user?.role as UserRole || null;
  
  const hasAccess = (permission: Permission): boolean => {
    if (!user || !userRole) return false;
    return hasPermission(userRole, permission);
  };

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user || !userRole) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  };
  
  return (
    <RBACContext.Provider value={{ 
      hasAccess, 
      userRole, 
      hasPermission: hasAccess,
      hasRole 
    }}>
      {children}
    </RBACContext.Provider>
  );
};

// Custom hook to use RBAC
export const useRBAC = () => useContext(RBACContext);

// Export the hook with the necessary permission checks
export const usePermissions = () => {
  const rbacContext = useContext(RBACContext);
  return {
    hasPermission: rbacContext.hasPermission,
    hasRole: rbacContext.hasRole,
    userRole: rbacContext.userRole
  };
};

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
