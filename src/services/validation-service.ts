
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule {
  id: string;
  field_name: string;
  rule_type: string;
  rule_value: string | null;
  error_message: string;
  active: boolean;
}

class ValidationService {
  private validationRules: ValidationRule[] = [];
  
  async initialize() {
    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      this.validationRules = data || [];
    } catch (error) {
      console.error('Failed to initialize validation service:', error);
    }
  }

  // Client-side validation for immediate feedback
  validateField(fieldName: string, value: any): ValidationResult {
    const rules = this.validationRules.filter(rule => rule.field_name === fieldName);
    const errors: string[] = [];

    rules.forEach(rule => {
      switch (rule.rule_type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(rule.error_message);
          }
          break;
        case 'email':
          if (value && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
            errors.push(rule.error_message);
          }
          break;
        case 'min_length':
          if (value && value.length < parseInt(rule.rule_value || '0')) {
            errors.push(rule.error_message);
          }
          break;
        case 'max_length':
          if (value && value.length > parseInt(rule.rule_value || '0')) {
            errors.push(rule.error_message);
          }
          break;
        case 'regex':
          if (value && rule.rule_value && !new RegExp(rule.rule_value).test(value)) {
            errors.push(rule.error_message);
          }
          break;
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Server-side validation for registration
  async validateUserData(userData: {
    email: string;
    name: string;
    phone_number?: string;
    role: string;
  }): Promise<ValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_user_data', {
        email_param: userData.email,
        name_param: userData.name,
        phone_param: userData.phone_number || null,
        role_param: userData.role
      });

      if (error) throw error;

      return {
        valid: data.valid,
        errors: data.errors || []
      };
    } catch (error) {
      console.error('Server validation failed:', error);
      return {
        valid: false,
        errors: ['Validation service unavailable. Please try again.']
      };
    }
  }
}

export const validationService = new ValidationService();
