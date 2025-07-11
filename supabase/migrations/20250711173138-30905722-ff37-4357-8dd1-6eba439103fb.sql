-- Clean up existing data and fix the profile creation issue

-- Clear audit logs first to avoid foreign key constraints
DELETE FROM public.enhanced_audit_logs;
DELETE FROM public.admin_notifications;

-- Now delete all existing users
DELETE FROM auth.users;

-- Update the handle_new_user function to ensure profile creation works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Special case: auto-approve ivogerald@bodaco.org as admin
  IF new.email = 'ivogerald@bodaco.org' THEN
    INSERT INTO public.profiles (id, email, name, phone_number, role, approval_status, approved_at)
    VALUES (
      new.id, 
      new.email,
      COALESCE(new.raw_user_meta_data ->> 'name', 'Admin User'),
      new.raw_user_meta_data ->> 'phone_number',
      'admin',
      'approved',
      now()
    );
  ELSE
    -- Regular user registration flow - force role to be non-admin
    INSERT INTO public.profiles (id, email, name, phone_number, role, approval_status)
    VALUES (
      new.id, 
      new.email,
      COALESCE(new.raw_user_meta_data ->> 'name', 'User'),
      new.raw_user_meta_data ->> 'phone_number',
      CASE 
        WHEN new.raw_user_meta_data ->> 'role' = 'admin' THEN 'user'
        ELSE COALESCE(new.raw_user_meta_data ->> 'role', 'user')
      END,
      'pending'
    );
    
    -- Create admin notification for new user registration
    INSERT INTO public.admin_notifications (user_id, message)
    VALUES (
      new.id,
      'New user ' || COALESCE(new.raw_user_meta_data ->> 'name', new.email) || ' has registered and requires approval'
    );
  END IF;
  
  RETURN new;
END;
$function$;