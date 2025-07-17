-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

-- Create a security definer function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create proper RLS policies using the security definer function
CREATE POLICY "Users can view profiles based on role" ON public.profiles
FOR SELECT USING (
  CASE 
    WHEN public.get_current_user_role() = 'admin' THEN true
    ELSE auth.uid() = id
  END
);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR public.get_current_user_role() = 'admin'
);

CREATE POLICY "Admins can insert profiles" ON public.profiles
FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'admin' OR auth.uid() = id
);

CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE USING (
  public.get_current_user_role() = 'admin'
);