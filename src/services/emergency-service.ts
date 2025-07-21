import { supabase } from '@/integrations/supabase/client';
import { Emergency, Responder, Hospital, EmergencyAssignment, Communication } from '@/types/emergency-types';
import { toast } from 'sonner';

export interface EmergencyStatistics {
  activeEmergencies: number;
  availableResponders: number;
  avgResponseTime: string;
  hospitalCapacity: number;
  hospitalsAtCapacity?: number;
  totalEmergencies: number;
}

// Helper function to transform coordinates
const transformCoordinates = (coordinates: any): { x: number; y: number } | null => {
  if (!coordinates) return null;
  
  if (typeof coordinates === 'string') {
    try {
      const parsed = JSON.parse(coordinates);
      return { x: parsed.x || parsed.longitude || 0, y: parsed.y || parsed.latitude || 0 };
    } catch {
      return null;
    }
  }
  
  if (typeof coordinates === 'object' && coordinates !== null) {
    return { x: coordinates.x || coordinates.longitude || 0, y: coordinates.y || coordinates.latitude || 0 };
  }
  
  return null;
};

export const fetchActiveEmergencies = async (): Promise<Emergency[]> => {
  try {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .in('status', ['pending', 'assigned', 'in_transit', 'on_site'])
      .order('priority', { ascending: true })
      .order('reported_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(emergency => ({
      ...emergency,
      coordinates: transformCoordinates(emergency.coordinates)
    }));
  } catch (error) {
    console.error('Error fetching active emergencies:', error);
    toast.error('Failed to fetch active emergencies');
    return [];
  }
};

export const fetchAllEmergencies = async (): Promise<Emergency[]> => {
  try {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .order('reported_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(emergency => ({
      ...emergency,
      coordinates: transformCoordinates(emergency.coordinates)
    }));
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    toast.error('Failed to fetch emergencies');
    return [];
  }
};

export const fetchAvailableResponders = async (): Promise<Responder[]> => {
  try {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('status', 'available')
      .order('last_active', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(responder => ({
      ...responder,
      coordinates: transformCoordinates(responder.coordinates)
    }));
  } catch (error) {
    console.error('Error fetching available responders:', error);
    toast.error('Failed to fetch available responders');
    return [];
  }
};

export const fetchResponders = async (): Promise<Responder[]> => {
  try {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .order('name');

    if (error) throw error;
    
    return (data || []).map(responder => ({
      ...responder,
      coordinates: transformCoordinates(responder.coordinates)
    }));
  } catch (error) {
    console.error('Error fetching responders:', error);
    toast.error('Failed to fetch responders');
    return [];
  }
};

export const getEmergencyStatistics = async (): Promise<EmergencyStatistics> => {
  try {
    const [emergenciesResponse, respondersResponse, hospitalsResponse] = await Promise.all([
      supabase.from('emergencies').select('status', { count: 'exact' }),
      supabase.from('responders').select('status', { count: 'exact' }),
      supabase.from('hospitals').select('available_beds, total_beds')
    ]);

    const emergencies = emergenciesResponse.data || [];
    const responders = respondersResponse.data || [];
    const hospitals = hospitalsResponse.data || [];

    const activeEmergencies = emergencies.filter(e => 
      ['pending', 'assigned', 'in_transit', 'on_site'].includes(e.status)
    ).length;
    
    const availableResponders = responders.filter(r => r.status === 'available').length;
    
    const totalBeds = hospitals.reduce((sum, h) => sum + h.total_beds, 0);
    const availableBeds = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
    const hospitalCapacity = totalBeds > 0 ? Math.round((availableBeds / totalBeds) * 100) : 0;

    return {
      activeEmergencies,
      availableResponders,
      avgResponseTime: '7:32', // This could be calculated from actual data
      hospitalCapacity,
      hospitalsAtCapacity: hospitals.filter(h => h.available_beds === 0).length,
      totalEmergencies: emergencies.length
    };
  } catch (error) {
    console.error('Error fetching emergency statistics:', error);
    return {
      activeEmergencies: 0,
      availableResponders: 0,
      avgResponseTime: 'N/A',
      hospitalCapacity: 0,
      hospitalsAtCapacity: 0,
      totalEmergencies: 0
    };
  }
};

export const createEmergency = async (emergencyData: Partial<Emergency>): Promise<Emergency> => {
  try {
    const { data, error } = await supabase
      .from('emergencies')
      .insert({
        type: emergencyData.type,
        description: emergencyData.description,
        location: emergencyData.location,
        coordinates: emergencyData.coordinates ? `(${emergencyData.coordinates.x},${emergencyData.coordinates.y})` : null,
        priority: emergencyData.priority || 3,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    const emergency = {
      ...data,
      coordinates: transformCoordinates(data.coordinates)
    };

    toast.success('Emergency created successfully');
    return emergency;
  } catch (error: any) {
    console.error('Error creating emergency:', error);
    toast.error(error.message || 'Failed to create emergency');
    throw error;
  }
};

export const getEmergencyById = async (id: string): Promise<Emergency | null> => {
  try {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      coordinates: transformCoordinates(data.coordinates)
    };
  } catch (error) {
    console.error('Error fetching emergency by ID:', error);
    return null;
  }
};

export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('name');

    if (error) throw error;
    
    return (data || []).map(hospital => ({
      ...hospital,
      coordinates: transformCoordinates(hospital.coordinates)
    }));
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    toast.error('Failed to fetch hospitals');
    return [];
  }
};

export const assignResponder = async (
  emergencyId: string,
  responderId: string,
  notes?: string
): Promise<void> => {
  try {
    // Create assignment record
    const { error: assignmentError } = await supabase
      .from('emergency_assignments')
      .insert({
        emergency_id: emergencyId,
        responder_id: responderId,
        notes
      });

    if (assignmentError) throw assignmentError;

    // Update emergency status
    const { error: emergencyError } = await supabase
      .from('emergencies')
      .update({ 
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', emergencyId);

    if (emergencyError) throw emergencyError;

    // Update responder status
    const { error: responderError } = await supabase
      .from('responders')
      .update({ status: 'on_call' })
      .eq('id', responderId);

    if (responderError) throw responderError;

    toast.success('Responder assigned successfully');
  } catch (error: any) {
    console.error('Error assigning responder:', error);
    toast.error(error.message || 'Failed to assign responder');
    throw error;
  }
};

export const autoAssignResponder = async (emergencyId: string): Promise<Responder | null> => {
  try {
    const availableResponders = await fetchAvailableResponders();
    if (availableResponders.length === 0) {
      toast.error('No available responders found');
      return null;
    }

    const responder = availableResponders[0]; // Simple auto-assignment logic
    await assignResponder(emergencyId, responder.id, 'Auto-assigned');
    
    return responder;
  } catch (error) {
    console.error('Error auto-assigning responder:', error);
    return null;
  }
};

export const updateEmergencyStatus = async (
  emergencyId: string,
  status: Emergency['status'],
  notes?: string
): Promise<Emergency | null> => {
  try {
    const updateData: any = { status };
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('emergencies')
      .update(updateData)
      .eq('id', emergencyId)
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Emergency status updated');
    return {
      ...data,
      coordinates: transformCoordinates(data.coordinates)
    };
  } catch (error: any) {
    console.error('Error updating emergency status:', error);
    toast.error(error.message || 'Failed to update emergency status');
    return null;
  }
};

// Real-time subscription
export const subscribeToEmergencies = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('emergencies-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'emergencies' 
      }, 
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(subscription)
  };
};

// Communication functions
export const fetchRecentCommunications = async (emergencyId?: string): Promise<Communication[]> => {
  try {
    let query = supabase
      .from('communications')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(50);

    if (emergencyId) {
      query = query.eq('emergency_id', emergencyId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching communications:', error);
    return [];
  }
};

export const sendCommunication = async (
  message: string,
  sender: string,
  type: string = 'message',
  emergencyId?: string,
  responderId?: string
): Promise<Communication> => {
  try {
    const { data, error } = await supabase
      .from('communications')
      .insert({
        message,
        sender,
        type,
        emergency_id: emergencyId || null,
        responder_id: responderId || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error sending communication:', error);
    toast.error('Failed to send message');
    throw error;
  }
};

export const subscribeToMessages = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('communications-changes')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'communications' 
      }, 
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(subscription)
  };
};

// Additional missing functions for compatibility
export const getActiveResponders = async (): Promise<Responder[]> => {
  try {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('status', 'on_call')
      .order('last_active', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(responder => ({
      ...responder,
      coordinates: transformCoordinates(responder.coordinates)
    }));
  } catch (error) {
    console.error('Error fetching active responders:', error);
    return [];
  }
};

export const updateHospitalCapacity = async (
  hospitalId: string, 
  availableBeds: number
): Promise<Hospital | null> => {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .update({ available_beds: availableBeds })
      .eq('id', hospitalId)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      coordinates: transformCoordinates(data.coordinates)
    };
  } catch (error: any) {
    console.error('Error updating hospital capacity:', error);
    toast.error(error.message || 'Failed to update hospital capacity');
    return null;
  }
};

// Re-export types for compatibility
export type { Emergency, Responder, Hospital, Communication, EmergencyAssignment } from '@/types/emergency-types';