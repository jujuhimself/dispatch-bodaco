
import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: Record<string, string>;
  active: boolean;
}

export interface EmailData {
  to: string;
  template: string;
  variables: Record<string, any>;
}

class EnhancedEmailService {
  private templates: Map<string, EmailTemplate> = new Map();

  async initialize() {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      this.templates.clear();
      data?.forEach(row => {
        const template: EmailTemplate = {
          id: row.id,
          name: row.name,
          subject: row.subject,
          html_content: row.html_content,
          text_content: row.text_content,
          variables: (row.variables as Record<string, string>) || {},
          active: row.active
        };
        this.templates.set(template.name, template);
      });
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, String(value || ''));
    });
    return result;
  }

  async sendTemplatedEmail(emailData: EmailData): Promise<boolean> {
    try {
      const template = this.templates.get(emailData.template);
      if (!template) {
        console.error(`Template ${emailData.template} not found`);
        return false;
      }

      const subject = this.replaceVariables(template.subject, emailData.variables);
      const htmlContent = this.replaceVariables(template.html_content, emailData.variables);
      const textContent = template.text_content 
        ? this.replaceVariables(template.text_content, emailData.variables)
        : null;

      // Call edge function to send email
      const { data, error } = await supabase.functions.invoke('send-templated-email', {
        body: {
          to: emailData.to,
          subject,
          html: htmlContent,
          text: textContent,
          template_name: emailData.template
        }
      });

      if (error) throw error;
      return data?.success || false;
    } catch (error) {
      console.error('Failed to send templated email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, name: string, verificationLink: string) {
    return this.sendTemplatedEmail({
      to: email,
      template: 'user_verification',
      variables: {
        name,
        verification_link: verificationLink
      }
    });
  }

  async sendApprovalEmail(email: string, name: string, role: string, loginLink: string) {
    return this.sendTemplatedEmail({
      to: email,
      template: 'user_approved',
      variables: {
        name,
        role,
        login_link: loginLink
      }
    });
  }

  async sendRejectionEmail(email: string, name: string, reason: string) {
    return this.sendTemplatedEmail({
      to: email,
      template: 'user_rejected',
      variables: {
        name,
        reason
      }
    });
  }
}

export const enhancedEmailService = new EnhancedEmailService();
