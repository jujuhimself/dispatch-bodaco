-- Make ceo@bodaco.org an admin user
UPDATE public.profiles 
SET 
  role = 'admin',
  approval_status = 'approved',
  approved_at = now(),
  approved_by = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE email = 'ceo@bodaco.org';

-- If the profile doesn't exist, let's also handle the case where they need to sign up first
-- This will ensure they get admin privileges when they do sign up
INSERT INTO public.profiles (id, email, name, role, approval_status, approved_at)
SELECT 
  gen_random_uuid(),
  'ceo@bodaco.org',
  'CEO Admin',
  'admin',
  'approved',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'ceo@bodaco.org'
);