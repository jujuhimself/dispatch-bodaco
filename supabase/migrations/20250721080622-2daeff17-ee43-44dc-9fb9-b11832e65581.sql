-- Enable RLS policies for emergency assignments
CREATE POLICY "Allow authenticated users to view emergency assignments" 
ON public.emergency_assignments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to create emergency assignments" 
ON public.emergency_assignments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update emergency assignments" 
ON public.emergency_assignments 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Enable RLS policies for communications
CREATE POLICY "Allow authenticated users to create communications" 
ON public.communications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update communications" 
ON public.communications 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Enable realtime for tables
ALTER TABLE public.emergencies REPLICA IDENTITY FULL;
ALTER TABLE public.communications REPLICA IDENTITY FULL;
ALTER TABLE public.emergency_assignments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.emergencies;
ALTER publication supabase_realtime ADD TABLE public.communications;
ALTER publication supabase_realtime ADD TABLE public.emergency_assignments;