
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth-types';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  permission?: Permission;
  granted_at: string;
  granted_by: string;
}

class EnhancedRBACService {
  private rolePermissions: Map<string, Set<string>> = new Map();
  private permissions: Map<string, Permission> = new Map();

  async initialize() {
    try {
      // Load all permissions
      const { data: permissionsData, error: permError } = await supabase
        .from('permissions')
        .select('*');

      if (permError) throw permError;

      this.permissions.clear();
      permissionsData?.forEach(permission => {
        this.permissions.set(permission.name, permission);
      });

      // Load role permissions
      const { data: rolePermData, error: roleError } = await supabase
        .from('role_permissions')
        .select(`
          role,
          permission_id,
          permissions (
            name
          )
        `);

      if (roleError) throw roleError;

      this.rolePermissions.clear();
      rolePermData?.forEach(rp => {
        const role = rp.role;
        const permissionName = (rp.permissions as any)?.name;
        
        if (!this.rolePermissions.has(role)) {
          this.rolePermissions.set(role, new Set());
        }
        
        if (permissionName) {
          this.rolePermissions.get(role)?.add(permissionName);
        }
      });
    } catch (error) {
      console.error('Failed to initialize RBAC service:', error);
    }
  }

  hasPermission(userRole: UserRole, permissionName: string): boolean {
    const rolePermissions = this.rolePermissions.get(userRole);
    return rolePermissions?.has(permissionName) || false;
  }

  hasAnyPermission(userRole: UserRole, permissionNames: string[]): boolean {
    return permissionNames.some(permission => this.hasPermission(userRole, permission));
  }

  hasAllPermissions(userRole: UserRole, permissionNames: string[]): boolean {
    return permissionNames.every(permission => this.hasPermission(userRole, permission));
  }

  getUserPermissions(userRole: UserRole): string[] {
    const rolePermissions = this.rolePermissions.get(userRole);
    return rolePermissions ? Array.from(rolePermissions) : [];
  }

  async grantPermission(role: string, permissionName: string): Promise<boolean> {
    try {
      const permission = this.permissions.get(permissionName);
      if (!permission) {
        console.error(`Permission ${permissionName} not found`);
        return false;
      }

      const { error } = await supabase
        .from('role_permissions')
        .upsert({
          role,
          permission_id: permission.id,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      // Update local cache
      if (!this.rolePermissions.has(role)) {
        this.rolePermissions.set(role, new Set());
      }
      this.rolePermissions.get(role)?.add(permissionName);

      return true;
    } catch (error) {
      console.error('Failed to grant permission:', error);
      return false;
    }
  }

  async revokePermission(role: string, permissionName: string): Promise<boolean> {
    try {
      const permission = this.permissions.get(permissionName);
      if (!permission) {
        console.error(`Permission ${permissionName} not found`);
        return false;
      }

      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role)
        .eq('permission_id', permission.id);

      if (error) throw error;

      // Update local cache
      this.rolePermissions.get(role)?.delete(permissionName);

      return true;
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      return false;
    }
  }

  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  getPermissionsByResource(resource: string): Permission[] {
    return Array.from(this.permissions.values()).filter(p => p.resource === resource);
  }
}

export const enhancedRBACService = new EnhancedRBACService();
