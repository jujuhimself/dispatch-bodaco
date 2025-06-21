
-- Add approval status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT;

-- Create admin approval notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'user_registration',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view notifications
CREATE POLICY "Admins can view all notifications" 
  ON public.admin_notifications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy: System can insert notifications
CREATE POLICY "System can create notifications" 
  ON public.admin_notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Update the handle_new_user function to create admin notification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert user profile with pending status
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
  
  RETURN new;
END;
$$;

-- Function to approve user
CREATE OR REPLACE FUNCTION public.approve_user(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  admin_id UUID := auth.uid();
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;
  
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
  
  RETURN TRUE;
END;
$$;

-- Function to reject user
CREATE OR REPLACE FUNCTION public.reject_user(user_id_param UUID, reason_param TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  admin_id UUID := auth.uid();
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject users';
  END IF;
  
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
  
  RETURN TRUE;
END;
$$;

-- Add trigger to update updated_at on admin_notifications
CREATE TRIGGER update_admin_notifications_updated_at
  BEFORE UPDATE ON public.admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
