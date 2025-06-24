
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AuditLogCreate {
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
}

class EnhancedAuditService {
  async logAction(auditData: AuditLogCreate): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_admin_action', {
        action_param: auditData.action,
        resource_param: auditData.resource,
        resource_id_param: auditData.resource_id || null,
        old_values_param: auditData.old_values || null,
        new_values_param: auditData.new_values || null,
        metadata_param: auditData.metadata || {}
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return null;
    }
  }

  async getAuditLogs(filters?: {
    action?: string;
    resource?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('enhanced_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.resource) {
        query = query.eq('resource', filters.resource);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: AuditLog[] = (data || []).map(row => ({
        id: row.id,
        user_id: row.user_id,
        action: row.action,
        resource: row.resource,
        resource_id: row.resource_id,
        old_values: row.old_values as Record<string, any> | undefined,
        new_values: row.new_values as Record<string, any> | undefined,
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        metadata: (row.metadata as Record<string, any>) || {},
        created_at: row.created_at
      }));

      return transformedData;
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  async logUserAction(action: string, details?: Record<string, any>) {
    return this.logAction({
      action,
      resource: 'user_action',
      metadata: {
        timestamp: new Date().toISOString(),
        ...details
      }
    });
  }

  async logSecurityEvent(event: string, details?: Record<string, any>) {
    return this.logAction({
      action: 'security_event',
      resource: 'security',
      metadata: {
        event,
        timestamp: new Date().toISOString(),
        ...details
      }
    });
  }
}

export const enhancedAuditService = new EnhancedAuditService();
