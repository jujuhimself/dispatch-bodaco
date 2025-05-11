
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth-types';

// Define permissions for each role
export interface RolePermissions {
  canManageEmergencies: boolean;
  canAssignResponders: boolean;
  canManageHospitals: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canConfigureSystem: boolean;
  canManageDevices: boolean;
  canSendCommunications: boolean;
}

// Define permission maps for each role
const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  admin: {
    canManageEmergencies: true,
    canAssignResponders: true,
    canManageHospitals: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canConfigureSystem: true,
    canManageDevices: true,
    canSendCommunications: true,
  },
  dispatcher: {
    canManageEmergencies: true,
    canAssignResponders: true,
    canManageHospitals: false,
    canViewAnalytics: true,
    canManageUsers: false,
    canConfigureSystem: false,
    canManageDevices: true,
    canSendCommunications: true,
  },
  responder: {
    canManageEmergencies: false,
    canAssignResponders: false,
    canManageHospitals: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canConfigureSystem: false,
    canManageDevices: false,
    canSendCommunications: true,
  },
  user: {
    canManageEmergencies: false,
    canAssignResponders: false,
    canManageHospitals: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canConfigureSystem: false,
    canManageDevices: false,
    canSendCommunications: false,
  },
};

// Custom hook to check permissions
export const usePermissions = () => {
  const { auth } = useAuth();
  const userRole = auth?.role || 'user';
  
  return {
    ...rolePermissionsMap[userRole],
    
    // Helper function to check if user has specific permission
    hasPermission: (permission: keyof RolePermissions) => {
      return rolePermissionsMap[userRole][permission];
    },
    
    // Helper function to check if user has specific role
    hasRole: (role: UserRole | UserRole[]) => {
      if (Array.isArray(role)) {
        return role.includes(userRole);
      }
      return userRole === role;
    },
  };
};

// Create RBAC context
interface RBACContextType {
  permissions: RolePermissions & {
    hasPermission: (permission: keyof RolePermissions) => boolean;
    hasRole: (role: UserRole | UserRole[]) => boolean;
  };
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

// Provider component
export const RBACProvider = ({ children }: { children: ReactNode }) => {
  const permissions = usePermissions();
  
  return (
    <RBACContext.Provider value={{ permissions }}>
      {children}
    </RBACContext.Provider>
  );
};

// Hook to use RBAC context
export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
};

// Higher-order component for permission-based access control
export const withPermission = (
  Component: React.ComponentType,
  requiredPermission: keyof RolePermissions
) => {
  return (props: any) => {
    const { permissions } = useRBAC();
    
    if (!permissions.hasPermission(requiredPermission)) {
      return null; // Or a fallback component like <AccessDenied />
    }
    
    return <Component {...props} />;
  };
};
