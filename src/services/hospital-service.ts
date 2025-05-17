
import { supabase } from '@/integrations/supabase/client';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  available_beds: number;
  total_beds: number;
  specialist_available?: boolean;
  coordinates?: any;
  // Add other fields as needed
}

export async function fetchHospitals(): Promise<Hospital[]> {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }
}

export async function fetchHospitalById(id: string): Promise<Hospital | null> {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching hospital with ID ${id}:`, error);
    return null;
  }
}
