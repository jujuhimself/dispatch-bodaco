
// Mock hospital service file to resolve import errors
import { supabase } from "@/integrations/supabase/client";

export interface Hospital {
  id: string;
  name: string;
  location: string;
  total_beds: number;
  available_beds: number;
}

export const fetchHospitals = async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    throw new Error(`Failed to fetch hospitals: ${error.message}`);
  }
  
  return data || [];
};

export const fetchHospitalById = async (id: string) => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw new Error(`Failed to fetch hospital: ${error.message}`);
  }
  
  return data;
};

export const updateHospitalBeds = async (id: string, availableBeds: number) => {
  const { data, error } = await supabase
    .from('hospitals')
    .update({ available_beds: availableBeds })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update hospital: ${error.message}`);
  }
  
  return data;
};
