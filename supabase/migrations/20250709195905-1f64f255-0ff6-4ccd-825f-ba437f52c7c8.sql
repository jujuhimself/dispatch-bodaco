-- Update the handle_new_user function to automatically approve the first admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Check if this is the first user with 'admin' role
  IF new.raw_user_meta_data ->> 'role' = 'admin' AND 
     NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin' AND approval_status = 'approved') THEN
    
    -- Auto-approve the first admin user
    INSERT INTO public.profiles (id, email, name, phone_number, role, approval_status, approved_at)
    VALUES (
      new.id, 
      new.email,
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'phone_number',
      'admin',
      'approved',
      now()
    );
  ELSE
    -- Regular user registration flow
    INSERT INTO public.profiles (id, email, name, phone_number, role, approval_status)
    VALUES (
      new.id, 
      new.email,
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'phone_number',
      COALESCE(new.raw_user_meta_data ->> 'role', 'user'),
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