-- Add columns for email verification and admin approval
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles (approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON public.profiles (email_confirmed_at);

-- Update the RLS policies to handle the new columns
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles
  USING (auth.jwt() ->> 'role' = 'admin');

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.created_at,
    NEW.updated_at,
    'pending' -- Default status is pending
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
