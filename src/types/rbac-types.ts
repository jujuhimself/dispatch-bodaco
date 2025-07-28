import { UserRole } from './auth-types';

export type Permission = 
  // Dashboard & General Access
  | 'view_dashboard'
  
  // User Management
  | 'manage_users'
  
  // Emergency Management
  | 'manage_emergencies'
  | 'view_emergencies'
  | 'view_emergency_details'
  | 'create_emergency'
  | 'respond_to_emergencies'
  
  // Reports
  | 'view_reports'
  
  // System Settings
  | 'manage_system_settings'
  
  // Communications
  | 'access_communications'
  
  // Admin Panel
  | 'access_admin_panel'
  
  // Emergency Operations Center
  | 'access_eoc'
  
  // Responder Management
  | 'manage_responders';

type RolePermissions = {
  [key in UserRole]: Permission[];
};

// Define permissions for each role
const rolePermissions: RolePermissions = {
  admin: [
    'view_dashboard',
    'manage_users',
    'manage_emergencies',
    'respond_to_emergencies',
    'view_reports',
    'manage_system_settings'
  ],
  dispatcher: [
    'view_dashboard',
    'manage_emergencies',
    'view_reports'
  ],
  responder: [
    'view_dashboard',
    'respond_to_emergencies',
    'view_reports'
  ],
  user: [
    'view_dashboard'
  ]
};

/**
 * Check if a user has the required permission
 * @param userRole - The user's role
 * @param requiredPermission - The permission to check
 * @returns boolean - Whether the user has the required permission
 */
export const hasPermission = (
  userRole: UserRole,
  requiredPermission: Permission
): boolean => {
  if (!userRole) return false;
  return rolePermissions[userRole]?.includes(requiredPermission) || false;
};

/**
 * Check if a user has all required permissions
 * @param userRole - The user's role
 * @param requiredPermissions - Array of permissions to check
 * @returns boolean - Whether the user has all required permissions
 */
export const hasAllPermissions = (
  userRole: UserRole,
  requiredPermissions: Permission[]
): boolean => {
  if (!userRole || !requiredPermissions.length) return false;
  return requiredPermissions.every(permission => 
    hasPermission(userRole, permission)
  );
};

/**
 * Check if a user has any of the required permissions
 * @param userRole - The user's role
 * @param requiredPermissions - Array of permissions to check
 * @returns boolean - Whether the user has any of the required permissions
 */
export const hasAnyPermission = (
  userRole: UserRole,
  requiredPermissions: Permission[]
): boolean => {
  if (!userRole || !requiredPermissions.length) return false;
  return requiredPermissions.some(permission => 
    hasPermission(userRole, permission)
  );
};
