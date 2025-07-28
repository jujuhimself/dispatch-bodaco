-- Fix RLS policies to allow profile creation during registration

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Allow profile creation during registration" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Update the handle_new_user function to ensure it has the right permissions
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
