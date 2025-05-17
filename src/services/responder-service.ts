
// Mock responder service file to resolve import errors
import { supabase } from "@/integrations/supabase/client";

export interface Responder {
  id: string;
  name: string;
  type: string;
  status: string;
  current_location?: string;
  availability_status?: string;
}

export const fetchResponders = async () => {
  const { data, error } = await supabase
    .from('responders')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    throw new Error(`Failed to fetch responders: ${error.message}`);
  }
  
  return data || [];
};

export const fetchResponderById = async (id: string) => {
  const { data, error } = await supabase
    .from('responders')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw new Error(`Failed to fetch responder: ${error.message}`);
  }
  
  return data;
};

export const updateResponderStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('responders')
    .update({ availability_status: status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update responder: ${error.message}`);
  }
  
  return data;
};
