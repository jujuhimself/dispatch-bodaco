-- Fix critical RLS security issues
-- Enable RLS on tables that are missing it and add basic policies

-- Alert processors table
ALTER TABLE public.alert_processors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage alert processors" 
ON public.alert_processors 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "System can access alert processors" 
ON public.alert_processors 
FOR SELECT 
USING (true);

-- Communication channels table
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view channels" 
ON public.communication_channels 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage channels" 
ON public.communication_channels 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Channel members table
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their channel memberships" 
ON public.channel_members 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage channel memberships" 
ON public.channel_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Shifts table
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responders can view their shifts" 
ON public.shifts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.responders 
  WHERE id = responder_id AND auth.uid() IS NOT NULL
));

CREATE POLICY "Admins can manage shifts" 
ON public.shifts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Alert escalations table
ALTER TABLE public.alert_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view escalations" 
ON public.alert_escalations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage escalations" 
ON public.alert_escalations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Responder skills table
ALTER TABLE public.responder_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view responder skills" 
ON public.responder_skills 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage responder skills" 
ON public.responder_skills 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Emergency agencies table
ALTER TABLE public.emergency_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view emergency agencies" 
ON public.emergency_agencies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage emergency agencies" 
ON public.emergency_agencies 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Agencies table
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agencies" 
ON public.agencies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage agencies" 
ON public.agencies 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));