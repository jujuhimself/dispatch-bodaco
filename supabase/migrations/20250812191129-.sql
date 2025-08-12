-- Phase 1: Tighten RLS and remove public data exposure
-- 1) Profiles: restrict inserts to self only (still compatible with registration trigger)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.profiles;
CREATE POLICY "Allow profile creation during registration"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2) Remove public SELECT on sensitive tables
DROP POLICY IF EXISTS "Allow public to view hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Allow public to view responders" ON public.responders;
DROP POLICY IF EXISTS "Allow public to view emergencies" ON public.emergencies;
DROP POLICY IF EXISTS "Allow public to view communications" ON public.communications;
DROP POLICY IF EXISTS "Allow public to view emergency_assignments" ON public.emergency_assignments;

-- Phase 2: Audit logs RLS + allow inserts from triggers/functions, restrict reads to admins
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "System can write audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;

CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "System can write audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Enhanced audit logs: ensure inserts permitted for authenticated contexts (RPC)
ALTER TABLE public.enhanced_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow inserts via function" ON public.enhanced_audit_logs;
CREATE POLICY "Allow inserts via function"
ON public.enhanced_audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Phase 3: Replace JWT-claim-based admin checks with profiles-based checks
DROP POLICY IF EXISTS "Allow admin to manage alerts" ON public.device_alerts;
CREATE POLICY "Admins can manage alerts"
ON public.device_alerts
FOR ALL
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Allow admin to manage devices" ON public.iot_devices;
CREATE POLICY "Admins can manage devices"
ON public.iot_devices
FOR ALL
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Phase 4: Remove hardcoded auto-approve/admin backdoor in handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Regular user registration flow - always non-admin, pending approval
  INSERT INTO public.profiles (id, email, name, phone_number, role, approval_status)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', 'User'),
    new.raw_user_meta_data ->> 'phone_number',
    'user',
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
$function$;