
import { supabase } from '@/integrations/supabase/client';

export interface Responder {
  id: string;
  name: string;
  type: string;
  status: string;
  current_location?: string;
  availability_status?: string;
  coordinates?: any;
  // Add other fields as needed
}

export async function fetchResponders(): Promise<Responder[]> {
  try {
    const { data, error } = await supabase
      .from('responders')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching responders:', error);
    return [];
  }
}

export async function fetchAvailableResponders(): Promise<Responder[]> {
  try {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('availability_status', 'available');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching available responders:', error);
    return [];
  }
}
