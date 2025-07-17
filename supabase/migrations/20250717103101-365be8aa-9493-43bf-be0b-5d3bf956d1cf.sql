-- Create the first admin user account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@emergency.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Emergency Admin", "role": "admin"}'
);

-- Fix RLS policies to allow proper data access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Allow users to view profiles based on their role
CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT USING (
  CASE 
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN true
    ELSE auth.uid() = id
  END
);

-- Allow users to update their own profile, admins can update any
CREATE POLICY "Users can update profiles" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage profiles" ON public.profiles
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Fix emergency table policies
CREATE POLICY "Allow authenticated users to create emergencies" ON public.emergencies
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update emergencies" ON public.emergencies
FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Fix responder policies
CREATE POLICY "Allow authenticated users to manage responders" ON public.responders
FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix hospital policies
CREATE POLICY "Allow authenticated users to manage hospitals" ON public.hospitals
FOR ALL USING (auth.uid() IS NOT NULL);

-- Add sample data for testing
INSERT INTO public.responders (name, type, phone, current_location, coordinates) VALUES
('Emergency Unit 1', 'ambulance', '+1234567890', 'Downtown Station', POINT(-73.935242, 40.730610)),
('Traffic Unit A', 'traffic', '+1234567891', 'Main Street', POINT(-73.925242, 40.735610)),
('Medical Team 2', 'ambulance', '+1234567892', 'Hospital District', POINT(-73.945242, 40.725610));

INSERT INTO public.hospitals (name, location, total_beds, available_beds, coordinates) VALUES
('Central Emergency Hospital', '123 Main St, Downtown', 150, 45, POINT(-73.935242, 40.730610)),
('Metro Medical Center', '456 Oak Ave, Midtown', 200, 67, POINT(-73.925242, 40.735610)),
('Community Hospital', '789 Pine St, Uptown', 100, 23, POINT(-73.945242, 40.725610));

INSERT INTO public.emergencies (type, description, location, priority, coordinates, status) VALUES
('Medical Emergency', 'Heart attack reported at office building', '100 Business Plaza', 1, POINT(-73.935242, 40.730610), 'pending'),
('Vehicle Crash', 'Multi-car accident on highway', 'Highway 95 Mile Marker 23', 2, POINT(-73.925242, 40.735610), 'assigned'),
('Fire Emergency', 'Smoke reported in residential building', '456 Residential Ave', 1, POINT(-73.945242, 40.725610), 'pending');