
-- Create email templates table for custom email management
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create enhanced audit logs table for compliance tracking
CREATE TABLE public.enhanced_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create permissions table for granular RBAC
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role permissions junction table
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(role, permission_id)
);

-- Create validation rules table for server-side validation
CREATE TABLE public.validation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'required', 'email', 'min_length', 'max_length', 'regex', 'custom'
  rule_value TEXT,
  error_message TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email templates (admin only)
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for audit logs (admin read only)
CREATE POLICY "Admins can read audit logs" ON public.enhanced_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for permissions (admin only)
CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create RLS policies for validation rules (admin only)
CREATE POLICY "Admins can manage validation rules" ON public.validation_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create function for server-side validation
CREATE OR REPLACE FUNCTION public.validate_user_data(
  email_param TEXT,
  name_param TEXT,
  phone_param TEXT DEFAULT NULL,
  role_param TEXT DEFAULT 'user'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  validation_errors JSONB := '[]'::JSONB;
  error_item JSONB;
BEGIN
  -- Email validation
  IF email_param IS NULL OR email_param = '' THEN
    validation_errors := validation_errors || '["Email is required"]'::JSONB;
  ELSIF NOT email_param ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    validation_errors := validation_errors || '["Invalid email format"]'::JSONB;
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = email_param) THEN
    validation_errors := validation_errors || '["Email already registered"]'::JSONB;
  END IF;
  
  -- Name validation
  IF name_param IS NULL OR name_param = '' THEN
    validation_errors := validation_errors || '["Name is required"]'::JSONB;
  ELSIF LENGTH(name_param) < 2 THEN
    validation_errors := validation_errors || '["Name must be at least 2 characters"]'::JSONB;
  ELSIF LENGTH(name_param) > 100 THEN
    validation_errors := validation_errors || '["Name must be less than 100 characters"]'::JSONB;
  END IF;
  
  -- Phone validation (if provided)
  IF phone_param IS NOT NULL AND phone_param != '' THEN
    IF NOT phone_param ~* '^\+?[\d\s\-\(\)]+$' THEN
      validation_errors := validation_errors || '["Invalid phone number format"]'::JSONB;
    END IF;
  END IF;
  
  -- Role validation
  IF role_param NOT IN ('admin', 'dispatcher', 'responder', 'user') THEN
    validation_errors := validation_errors || '["Invalid role specified"]'::JSONB;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', jsonb_array_length(validation_errors) = 0,
    'errors', validation_errors
  );
END;
$$;

-- Create enhanced audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_param TEXT,
  resource_param TEXT,
  resource_id_param UUID DEFAULT NULL,
  old_values_param JSONB DEFAULT NULL,
  new_values_param JSONB DEFAULT NULL,
  metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.enhanced_audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    action_param,
    resource_param,
    resource_id_param,
    old_values_param,
    new_values_param,
    metadata_param
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Enhanced approve user function with validation and audit logging
CREATE OR REPLACE FUNCTION public.approve_user_enhanced(user_id_param UUID, notes_param TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID := auth.uid();
  user_record RECORD;
  log_id UUID;
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can approve users');
  END IF;
  
  -- Get user record for audit logging
  SELECT * INTO user_record FROM public.profiles WHERE id = user_id_param;
  
  IF user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Log the action
  SELECT public.log_admin_action(
    'user_approval',
    'profiles',
    user_id_param,
    jsonb_build_object('approval_status', user_record.approval_status),
    jsonb_build_object('approval_status', 'approved'),
    jsonb_build_object('notes', notes_param, 'approved_by_email', (SELECT email FROM public.profiles WHERE id = admin_id))
  ) INTO log_id;
  
  -- Update user approval status
  UPDATE public.profiles 
  SET 
    approval_status = 'approved',
    approved_by = admin_id,
    approved_at = now()
  WHERE id = user_id_param;
  
  -- Mark related notifications as read
  UPDATE public.admin_notifications 
  SET read = TRUE 
  WHERE user_id = user_id_param AND notification_type = 'user_registration';
  
  RETURN jsonb_build_object('success', true, 'audit_log_id', log_id);
END;
$$;

-- Enhanced reject user function with validation and audit logging
CREATE OR REPLACE FUNCTION public.reject_user_enhanced(
  user_id_param UUID, 
  reason_param TEXT DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID := auth.uid();
  user_record RECORD;
  log_id UUID;
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can reject users');
  END IF;
  
  -- Get user record for audit logging
  SELECT * INTO user_record FROM public.profiles WHERE id = user_id_param;
  
  IF user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Log the action
  SELECT public.log_admin_action(
    'user_rejection',
    'profiles',
    user_id_param,
    jsonb_build_object('approval_status', user_record.approval_status),
    jsonb_build_object('approval_status', 'rejected', 'rejection_reason', reason_param),
    jsonb_build_object('notes', notes_param, 'rejected_by_email', (SELECT email FROM public.profiles WHERE id = admin_id))
  ) INTO log_id;
  
  -- Update user approval status
  UPDATE public.profiles 
  SET 
    approval_status = 'rejected',
    approved_by = admin_id,
    approved_at = now(),
    rejection_reason = reason_param
  WHERE id = user_id_param;
  
  -- Mark related notifications as read
  UPDATE public.admin_notifications 
  SET read = TRUE 
  WHERE user_id = user_id_param AND notification_type = 'user_registration';
  
  RETURN jsonb_build_object('success', true, 'audit_log_id', log_id);
END;
$$;

-- Insert default permissions for RBAC
INSERT INTO public.permissions (name, description, resource, action) VALUES
('view_dashboard', 'View main dashboard', 'dashboard', 'read'),
('manage_users', 'Manage user accounts', 'users', 'write'),
('approve_users', 'Approve/reject user registrations', 'users', 'approve'),
('view_audit_logs', 'View system audit logs', 'audit', 'read'),
('manage_emergencies', 'Create and manage emergencies', 'emergencies', 'write'),
('assign_responders', 'Assign responders to emergencies', 'emergencies', 'assign'),
('view_responders', 'View responder information', 'responders', 'read'),
('manage_responders', 'Manage responder accounts', 'responders', 'write'),
('view_communications', 'View communication channels', 'communications', 'read'),
('send_messages', 'Send messages in channels', 'communications', 'write'),
('manage_hospitals', 'Manage hospital information', 'hospitals', 'write'),
('view_analytics', 'View system analytics', 'analytics', 'read'),
('manage_settings', 'Manage system settings', 'settings', 'write');

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'admin', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'dispatcher', id FROM public.permissions 
WHERE name IN ('view_dashboard', 'manage_emergencies', 'assign_responders', 'view_responders', 'view_communications', 'send_messages', 'view_analytics');

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'responder', id FROM public.permissions 
WHERE name IN ('view_dashboard', 'view_communications', 'send_messages');

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'user', id FROM public.permissions 
WHERE name IN ('view_dashboard', 'view_communications');

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, text_content, variables) VALUES
('user_verification', 'Welcome to Boda & Co - Verify Your Email', 
'<h1>Welcome to Boda & Co Emergency Response Platform</h1><p>Hello {{name}},</p><p>Thank you for registering with our emergency response platform. Please verify your email address by clicking the link below:</p><a href="{{verification_link}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email Address</a><p>If you did not create this account, please ignore this email.</p><p>Best regards,<br>Boda & Co Emergency Response Team</p>',
'Welcome to Boda & Co Emergency Response Platform\n\nHello {{name}},\n\nThank you for registering with our emergency response platform. Please verify your email address by visiting: {{verification_link}}\n\nIf you did not create this account, please ignore this email.\n\nBest regards,\nBoda & Co Emergency Response Team',
'{"name": "User name", "verification_link": "Email verification URL"}'::JSONB),

('user_approved', 'Account Approved - Welcome to Boda & Co', 
'<h1>Account Approved!</h1><p>Hello {{name}},</p><p>Great news! Your account has been approved by our admin team. You can now access the Boda & Co Emergency Response Platform.</p><a href="{{login_link}}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Login to Platform</a><p>Your role: <strong>{{role}}</strong></p><p>If you have any questions, please contact our support team.</p><p>Best regards,<br>Boda & Co Emergency Response Team</p>',
'Account Approved!\n\nHello {{name}},\n\nGreat news! Your account has been approved by our admin team. You can now access the Boda & Co Emergency Response Platform.\n\nLogin at: {{login_link}}\n\nYour role: {{role}}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nBoda & Co Emergency Response Team',
'{"name": "User name", "role": "User role", "login_link": "Login page URL"}'::JSONB),

('user_rejected', 'Account Registration Update', 
'<h1>Account Registration Update</h1><p>Hello {{name}},</p><p>Thank you for your interest in the Boda & Co Emergency Response Platform. Unfortunately, we are unable to approve your account at this time.</p><p><strong>Reason:</strong> {{reason}}</p><p>If you believe this is an error or have questions about this decision, please contact our support team.</p><p>Best regards,<br>Boda & Co Emergency Response Team</p>',
'Account Registration Update\n\nHello {{name}},\n\nThank you for your interest in the Boda & Co Emergency Response Platform. Unfortunately, we are unable to approve your account at this time.\n\nReason: {{reason}}\n\nIf you believe this is an error or have questions about this decision, please contact our support team.\n\nBest regards,\nBoda & Co Emergency Response Team',
'{"name": "User name", "reason": "Rejection reason"}'::JSONB);

-- Insert default validation rules
INSERT INTO public.validation_rules (field_name, rule_type, rule_value, error_message) VALUES
('email', 'required', NULL, 'Email address is required'),
('email', 'email', NULL, 'Please enter a valid email address'),
('name', 'required', NULL, 'Full name is required'),
('name', 'min_length', '2', 'Name must be at least 2 characters long'),
('name', 'max_length', '100', 'Name must be less than 100 characters'),
('password', 'required', NULL, 'Password is required'),
('password', 'min_length', '8', 'Password must be at least 8 characters long'),
('phone_number', 'regex', '^\+?[\d\s\-\(\)]+$', 'Please enter a valid phone number'),
('role', 'required', NULL, 'Role selection is required');
