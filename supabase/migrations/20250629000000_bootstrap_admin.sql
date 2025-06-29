
-- Function to check if any admin users exist
CREATE OR REPLACE FUNCTION public.has_admin_users()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE role = 'admin' AND approval_status = 'approved'
  );
END;
$$;

-- Update the handle_new_user function to auto-approve first admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_approval_status TEXT := 'pending';
BEGIN
  -- Auto-approve the first admin user to bootstrap the system
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'user') = 'admin' AND NOT public.has_admin_users() THEN
    user_approval_status := 'approved';
  END IF;

  -- Insert user profile
  INSERT INTO public.profiles (id, email, name, phone_number, role, approval_status)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone_number',
    COALESCE(new.raw_user_meta_data ->> 'role', 'user'),
    user_approval_status
  );
  
  -- Create admin notification only if user needs approval
  IF user_approval_status = 'pending' THEN
    INSERT INTO public.admin_notifications (user_id, message)
    VALUES (
      new.id,
      'New user ' || COALESCE(new.raw_user_meta_data ->> 'name', new.email) || ' has registered and requires approval'
    );
  END IF;
  
  RETURN new;
END;
$$;
