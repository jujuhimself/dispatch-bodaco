-- Create emergency categories table
CREATE TABLE public.emergency_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  priority_level INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create emergency types table
CREATE TABLE public.emergency_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.emergency_categories(id) ON DELETE SET NULL,
  description TEXT,
  default_priority INTEGER NOT NULL DEFAULT 3,
  requires_ambulance BOOLEAN DEFAULT false,
  requires_fire_brigade BOOLEAN DEFAULT false,
  requires_police BOOLEAN DEFAULT false,
  requires_traffic_control BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, category_id)
);

-- Add category_id and type_id to emergencies table
ALTER TABLE public.emergencies 
ADD COLUMN category_id UUID REFERENCES public.emergency_categories(id) ON DELETE SET NULL,
ADD COLUMN type_id UUID REFERENCES public.emergency_types(id) ON DELETE SET NULL;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_emergency_categories_updated_at
BEFORE UPDATE ON public.emergency_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_types_updated_at
BEFORE UPDATE ON public.emergency_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO public.emergency_categories (name, description, priority_level) VALUES
('Medical', 'Medical emergencies requiring immediate attention', 1),
('Fire', 'Fire and hazardous material incidents', 1),
('Crime', 'Criminal activities and public safety threats', 2),
('Accident', 'Vehicle and transportation accidents', 2),
('Hazard', 'Environmental hazards and public safety concerns', 3),
('Disturbance', 'Public disturbances and nuisances', 4),
('Other', 'Other types of emergencies', 5);

-- Insert default emergency types
-- Medical Emergencies
WITH med_cat AS (SELECT id FROM public.emergency_categories WHERE name = 'Medical')
INSERT INTO public.emergency_types (
  name, category_id, description, default_priority, 
  requires_ambulance, requires_fire_brigade, requires_police, requires_traffic_control
) VALUES
('Cardiac Arrest', (SELECT id FROM med_cat), 'Patient is unresponsive with no pulse', 1, true, false, false, true),
('Severe Bleeding', (SELECT id FROM med_cat), 'Uncontrolled bleeding', 1, true, false, false, false),
('Difficulty Breathing', (SELECT id FROM med_cat), 'Severe respiratory distress', 1, true, false, false, false),
('Unconscious Person', (SELECT id FROM med_cat), 'Person is unresponsive', 2, true, false, false, false),
('Seizure', (SELECT id FROM med_cat), 'Active seizure or post-ictal state', 2, true, false, false, false),
('Allergic Reaction', (SELECT id FROM med_cat), 'Severe allergic reaction/anaphylaxis', 2, true, false, false, false);

-- Fire Emergencies
WITH fire_cat AS (SELECT id FROM public.emergency_categories WHERE name = 'Fire')
INSERT INTO public.emergency_types (
  name, category_id, description, default_priority, 
  requires_ambulance, requires_fire_brigade, requires_police, requires_traffic_control
) VALUES
('Structure Fire', (SELECT id FROM fire_cat), 'Building or structure on fire', 1, true, true, true, true),
('Vehicle Fire', (SELECT id FROM fire_cat), 'Vehicle on fire', 1, true, true, true, true),
('Brush Fire', (SELECT id FROM fire_cat), 'Wildfire or brush fire', 2, false, true, false, false),
('Gas Leak', (SELECT id FROM fire_cat), 'Suspected gas leak', 1, false, true, true, true),
('Hazmat Spill', (SELECT id FROM fire_cat), 'Hazardous material spill', 1, true, true, true, true);

-- Crime Emergencies
WITH crime_cat AS (SELECT id FROM public.emergency_categories WHERE name = 'Crime')
INSERT INTO public.emergency_types (
  name, category_id, description, default_priority, 
  requires_ambulance, requires_fire_brigade, requires_police, requires_traffic_control
) VALUES
('Armed Robbery', (SELECT id FROM crime_cat), 'Robbery with weapon involved', 1, true, false, true, true),
('Assault', (SELECT id FROM crime_cat), 'Physical assault in progress', 1, true, false, true, false),
('Burglary', (SELECT id FROM crime_cat), 'Break-in or burglary in progress', 2, false, false, true, false),
('Domestic Violence', (SELECT id FROM crime_cat), 'Domestic disturbance or violence', 1, true, false, true, false),
('Suspicious Activity', (SELECT id FROM crime_cat), 'Suspicious person or activity', 3, false, false, true, false);

-- Accident Emergencies
WITH acc_cat AS (SELECT id FROM public.emergency_categories WHERE name = 'Accident')
INSERT INTO public.emergency_types (
  name, category_id, description, default_priority, 
  requires_ambulance, requires_fire_brigade, requires_police, requires_traffic_control
) VALUES
('Vehicle Collision - Injury', (SELECT id FROM acc_cat), 'Car accident with injuries', 1, true, true, true, true),
('Vehicle Collision - No Injury', (SELECT id FROM acc_cat), 'Car accident, no injuries', 3, false, false, true, true),
('Pedestrian Struck', (SELECT id FROM acc_cat), 'Vehicle hit pedestrian', 1, true, true, true, true),
('Motorcycle Accident', (SELECT id FROM acc_cat), 'Motorcycle collision', 1, true, true, true, true),
('Bicycle Accident', (SELECT id FROM acc_cat), 'Bicycle collision', 2, true, false, true, true);

-- Hazard Emergencies
WITH haz_cat AS (SELECT id FROM public.emergency_categories WHERE name = 'Hazard')
INSERT INTO public.emergency_types (
  name, category_id, description, default_priority, 
  requires_ambulance, requires_fire_brigade, requires_police, requires_traffic_control
) VALUES
('Downed Power Lines', (SELECT id FROM haz_cat), 'Live wires down', 1, false, true, true, true),
('Flooding', (SELECT id FROM haz_cat), 'Severe water accumulation', 2, false, true, true, true),
('Tree Down', (SELECT id FROM haz_cat), 'Large tree blocking road or structure', 3, false, true, false, true),
('Road Hazard', (SELECT id FROM haz_cat), 'Debris or hazard on roadway', 3, false, false, false, true),
('Animal Hazard', (SELECT id FROM haz_cat), 'Dangerous animal situation', 3, false, false, true, false);

-- Disturbance Emergencies
WITH dist_cat AS (SELECT id FROM public.emergency_categories WHERE name = 'Disturbance')
INSERT INTO public.emergency_types (
  name, category_id, description, default_priority, 
  requires_ambulance, requires_fire_brigade, requires_police, requires_traffic_control
) VALUES
('Noise Complaint', (SELECT id FROM dist_cat), 'Excessive noise disturbance', 4, false, false, true, false),
('Public Nuisance', (SELECT id FROM dist_cat), 'Disruptive public behavior', 4, false, false, true, false),
('Trespassing', (SELECT id FROM dist_cat), 'Unauthorized person on property', 3, false, false, true, false),
('Parking Violation', (SELECT id FROM dist_cat), 'Illegally parked vehicle', 5, false, false, true, false);

-- Other Emergencies
WITH other_cat AS (SELECT id FROM public.emergency_categories WHERE name = 'Other')
INSERT INTO public.emergency_types (
  name, category_id, description, default_priority, 
  requires_ambulance, requires_fire_brigade, requires_police, requires_traffic_control
) VALUES
('Unspecified Emergency', (SELECT id FROM other_cat), 'Emergency type not specified', 3, false, false, false, false);

-- Update existing emergencies to use the 'Unspecified Emergency' type
UPDATE public.emergencies
SET type_id = (SELECT id FROM public.emergency_types WHERE name = 'Unspecified Emergency')
WHERE type_id IS NULL;

-- Create a view for emergency details with category and type information
CREATE OR REPLACE VIEW public.emergency_details AS
SELECT 
  e.*,
  ec.name as category_name,
  et.name as type_name,
  et.default_priority as type_default_priority,
  et.requires_ambulance,
  et.requires_fire_brigade,
  et.requires_police,
  et.requires_traffic_control
FROM public.emergencies e
LEFT JOIN public.emergency_types et ON e.type_id = et.id
LEFT JOIN public.emergency_categories ec ON e.category_id = ec.id OR et.category_id = ec.id;

-- Create RLS policies for the new tables
ALTER TABLE public.emergency_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and types
CREATE POLICY "Public read access to emergency categories"
ON public.emergency_categories
FOR SELECT
USING (true);

CREATE POLICY "Public read access to emergency types"
ON public.emergency_types
FOR SELECT
USING (true);

-- Allow admins full access to manage categories and types
CREATE POLICY "Admins can manage emergency categories"
ON public.emergency_categories
FOR ALL
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admins can manage emergency types"
ON public.emergency_types
FOR ALL
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Create function to get recommended responder types for an emergency
CREATE OR REPLACE FUNCTION public.get_recommended_responders(emergency_id_param UUID)
RETURNS TABLE (
  responder_type TEXT,
  required BOOLEAN,
  recommended_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.type,
    CASE 
      WHEN rt.type = 'ambulance' THEN et.requires_ambulance
      WHEN rt.type = 'fire' THEN et.requires_fire_brigade
      WHEN rt.type = 'police' THEN et.requires_police
      WHEN rt.type = 'traffic' THEN et.requires_traffic_control
      ELSE false
    END as required,
    CASE 
      WHEN rt.type = 'ambulance' AND et.requires_ambulance THEN 1
      WHEN rt.type = 'fire' AND et.requires_fire_brigade THEN 1
      WHEN rt.type = 'police' AND et.requires_police THEN 1
      WHEN rt.type = 'traffic' AND et.requires_traffic_control THEN 1
      ELSE 0
    END as recommended_count
  FROM 
    public.emergencies e
    JOIN public.emergency_types et ON e.type_id = et.id,
    (SELECT unnest(ARRAY['ambulance', 'fire', 'police', 'traffic']) as type) rt
  WHERE 
    e.id = emergency_id_param;
END;
$$ LANGUAGE plpgsql;
