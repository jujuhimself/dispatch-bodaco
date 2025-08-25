-- Fix admin users auto-approval and create bootstrap function
-- First, let's ensure the first admin can bootstrap themselves

-- Create a function to bootstrap the first admin (one-time use)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Check if we already have any approved admin users
  SELECT COUNT(*) INTO admin_count 
  FROM public.profiles 
  WHERE role = 'admin' AND approval_status = 'approved';
  
  -- Only allow bootstrapping if no approved admins exist
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin users already exist. Use normal approval process.';
  END IF;
  
  -- Update the user to be an approved admin
  UPDATE public.profiles 
  SET 
    role = 'admin',
    approval_status = 'approved',
    approved_at = now(),
    approved_by = id  -- Self-approved for bootstrap
  WHERE email = admin_email;
  
  -- Check if the update was successful
  GET DIAGNOSTICS admin_count = ROW_COUNT;
  
  RETURN admin_count > 0;
END;
$$;

-- Update the handle_new_user function to auto-approve admin users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_role text := 'user';
  approval_status text := 'pending';
BEGIN
  -- Check if this email should be an admin (you can modify this logic)
  -- For now, we'll check if they registered with admin metadata
  IF new.raw_user_meta_data ->> 'role' = 'admin' THEN
    user_role := 'admin';
    approval_status := 'approved';
  END IF;

  -- Create profile with appropriate role and status
  INSERT INTO public.profiles (id, email, name, phone_number, role, approval_status, approved_at, approved_by)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', 'User'),
    new.raw_user_meta_data ->> 'phone_number',
    user_role,
    approval_status,
    CASE WHEN user_role = 'admin' THEN now() ELSE NULL END,
    CASE WHEN user_role = 'admin' THEN new.id ELSE NULL END
  );

  -- Create admin notification only for non-admin users
  IF user_role != 'admin' THEN
    INSERT INTO public.admin_notifications (user_id, message)
    VALUES (
      new.id,
      'New user ' || COALESCE(new.raw_user_meta_data ->> 'name', new.email) || ' has registered and requires approval'
    );
  END IF;

  RETURN new;
END;
$$;