
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth-types';

export interface SecurityAudit {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

class SecurityService {
  private defaultPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  };

  // Password validation
  validatePassword(password: string, policy: PasswordPolicy = this.defaultPasswordPolicy): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Session management
  async logSecurityEvent(action: string, resource: string, userId?: string) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          performed_by: userId || null,
          action,
          resource,
          performed_at: new Date().toISOString(),
          table_name: 'security_events',
          record_id: crypto.randomUUID()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Rate limiting for sensitive operations
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.rateLimitCache.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (record.count >= maxAttempts) {
      return true;
    }

    record.count++;
    return false;
  }

  // Two-factor authentication helpers
  generateTOTPSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS chars
      .substring(0, 1000); // Limit length
  }

  // GDPR compliance helpers
  async requestDataExport(userId: string) {
    try {
      const userData: Record<string, any> = {};

      // Export profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (profilesError) throw profilesError;
      userData.profiles = profiles;

      // Export emergencies data (where user is involved)
      const { data: emergencies, error: emergenciesError } = await supabase
        .from('emergencies')
        .select('*')
        .eq('resolved_by', userId);

      if (emergenciesError) throw emergenciesError;
      userData.emergencies = emergencies;

      // Export communications data
      const { data: communications, error: communicationsError } = await supabase
        .from('communications')
        .select('*')
        .eq('responder_id', userId);

      if (communicationsError) throw communicationsError;
      userData.communications = communications;

      // Export audit logs
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('performed_by', userId);

      if (auditError) throw auditError;
      userData.audit_logs = auditLogs;

      return userData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  async requestDataDeletion(userId: string) {
    try {
      // Log the deletion request for compliance
      await this.logSecurityEvent('data_deletion_request', 'user_data', userId);
      
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw error;
    }
  }
}

export const securityService = new SecurityService();
