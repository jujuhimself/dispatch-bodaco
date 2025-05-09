import { supabase } from '@/integrations/supabase/client';
import { Emergency, Responder, Hospital, Communication, EmergencyAssignment } from '@/types/emergency-types';

// Helper function to transform coordinates from Postgres point type
export const transformCoordinates = (coordinates: any): { x: number; y: number } | null => {
  if (!coordinates) return null;
  // If we get a string like "(x,y)" from the database
  if (typeof coordinates === 'string') {
    const match = coordinates.match(/\((-?\d+\.?\d*),(-?\d+\.?\d*)\)/);
    if (match) {
      return {
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      };
    }
  } 
  // If we get an object with x,y properties
  else if (typeof coordinates === 'object' && coordinates !== null) {
    if ('x' in coordinates && 'y' in coordinates) {
      return {
        x: parseFloat(coordinates.x),
        y: parseFloat(coordinates.y)
      };
    }
  }
  return null;
};

// Helper function to convert our coordinates for Postgres
export const formatCoordinatesForPostgres = (coordinates: { x: number; y: number }) => {
  return `(${coordinates.x},${coordinates.y})`;
};

export const fetchEmergencies = async (): Promise<Emergency[]> => {
  const { data, error } = await supabase
    .from('emergencies')
    .select('*')
    .order('priority', { ascending: true })
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching emergencies:', error);
    throw new Error('Failed to fetch emergencies');
  }

  return data.map((item: any) => ({
    ...item,
    coordinates: transformCoordinates(item.coordinates)
  })) as Emergency[];
};

export const fetchActiveEmergencies = async (): Promise<Emergency[]> => {
  const { data, error } = await supabase
    .from('emergencies')
    .select('*')
    .in('status', ['pending', 'assigned', 'in_transit', 'on_site'])
    .order('priority', { ascending: true })
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching active emergencies:', error);
    throw new Error('Failed to fetch active emergencies');
  }

  return data.map((item: any) => ({
    ...item,
    coordinates: transformCoordinates(item.coordinates)
  })) as Emergency[];
};

export const createEmergency = async (emergencyData: {
  type: string;
  description: string;
  location: string;
  priority: number;
  coordinates: { x: number; y: number };
}): Promise<Emergency> => {
  // Convert coordinates to Postgres point format if provided
  const formattedCoordinates = emergencyData.coordinates 
    ? formatCoordinatesForPostgres(emergencyData.coordinates) 
    : null;
  
  const { data, error } = await supabase
    .from('emergencies')
    .insert({
      type: emergencyData.type,
      description: emergencyData.description,
      location: emergencyData.location,
      priority: emergencyData.priority,
      coordinates: formattedCoordinates
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating emergency:', error);
    throw new Error('Failed to create emergency');
  }

  return {
    ...data,
    coordinates: transformCoordinates(data.coordinates)
  } as Emergency;
};

export const fetchResponders = async (): Promise<Responder[]> => {
  const { data, error } = await supabase
    .from('responders')
    .select('*')
    .order('status', { ascending: true })
    .order('last_active', { ascending: false });

  if (error) {
    console.error('Error fetching responders:', error);
    throw new Error('Failed to fetch responders');
  }

  return data.map((item: any) => ({
    ...item,
    coordinates: transformCoordinates(item.coordinates)
  })) as Responder[];
};

export const fetchAvailableResponders = async (): Promise<Responder[]> => {
  const { data, error } = await supabase
    .from('responders')
    .select('*')
    .eq('status', 'available')
    .order('last_active', { ascending: false });

  if (error) {
    console.error('Error fetching available responders:', error);
    throw new Error('Failed to fetch available responders');
  }

  return data.map((item: any) => ({
    ...item,
    coordinates: transformCoordinates(item.coordinates)
  })) as Responder[];
};

export const getActiveResponders = async () => {
  try {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .not('status', 'eq', 'off_duty');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active responders:', error);
    return [];
  }
};

export const fetchHospitals = async (): Promise<Hospital[]> => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('available_beds', { ascending: false });

  if (error) {
    console.error('Error fetching hospitals:', error);
    throw new Error('Failed to fetch hospitals');
  }

  return data.map((item: any) => ({
    ...item,
    coordinates: transformCoordinates(item.coordinates)
  })) as Hospital[];
};

export const assignResponder = async (emergencyId: string, responderId: string, notes?: string): Promise<EmergencyAssignment> => {
  const { data, error } = await supabase
    .from('emergency_assignments')
    .insert({
      emergency_id: emergencyId,
      responder_id: responderId,
      notes: notes || null,
      status: 'assigned'
    })
    .select()
    .single();

  if (error) {
    console.error('Error assigning responder:', error);
    throw new Error('Failed to assign responder');
  }

  // Update the emergency status
  await supabase
    .from('emergencies')
    .update({ status: 'assigned', assigned_at: new Date().toISOString() })
    .eq('id', emergencyId);

  // Update the responder status
  await supabase
    .from('responders')
    .update({ status: 'on_call' })
    .eq('id', responderId);

  return data as EmergencyAssignment;
};

export const fetchEmergencyAssignments = async (emergencyId?: string): Promise<EmergencyAssignment[]> => {
  let query = supabase.from('emergency_assignments').select('*, responders(*)');
  
  if (emergencyId) {
    query = query.eq('emergency_id', emergencyId);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching emergency assignments:', error);
    throw new Error('Failed to fetch emergency assignments');
  }

  // Transform the returned data to match our EmergencyAssignment type
  return data.map((item: any) => {
    // If responders data exists, transform its coordinates
    const responders = item.responders ? {
      ...item.responders,
      coordinates: transformCoordinates(item.responders.coordinates)
    } : undefined;

    return {
      id: item.id,
      emergency_id: item.emergency_id,
      responder_id: item.responder_id,
      assigned_at: item.assigned_at,
      eta: item.eta,
      status: item.status,
      notes: item.notes,
      responders
    };
  }) as EmergencyAssignment[];
};

export const fetchEmergencyWithDeviceAlert = async (emergencyId: string): Promise<{ emergency: Emergency; deviceAlert?: any }> => {
  const { data, error } = await supabase
    .from('emergencies')
    .select(`
      *,
      device_alerts(*)
    `)
    .eq('id', emergencyId)
    .single();

  if (error) {
    console.error('Error fetching emergency with device alert:', error);
    throw new Error('Failed to fetch emergency with device alert');
  }

  const emergency = {
    ...data,
    coordinates: transformCoordinates(data.coordinates)
  } as Emergency;
  
  const deviceAlert = data.device_alerts ? {
    ...data.device_alerts,
    location: transformCoordinates(data.device_alerts.location)
  } : undefined;

  return { emergency, deviceAlert };
};

export const autoAssignResponder = async (emergencyId: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('auto-assign-responder', {
    body: { emergency_id: emergencyId }
  });

  if (error) {
    console.error('Error auto-assigning responder:', error);
    throw new Error('Failed to auto-assign responder');
  }

  return data;
};

export const fetchRecentCommunications = async (limit = 5): Promise<Communication[]> => {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching communications:', error);
    throw new Error('Failed to fetch communications');
  }

  return data || [];
};

export const sendCommunication = async (message: string, sender: string, emergencyId?: string, responderId?: string): Promise<Communication> => {
  const { data, error } = await supabase
    .from('communications')
    .insert({
      message,
      sender,
      type: 'message',
      emergency_id: emergencyId || null,
      responder_id: responderId || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending communication:', error);
    throw new Error('Failed to send communication');
  }

  return data as Communication;
};

export const updateHospitalCapacity = async (hospitalId: string, availableBeds: number): Promise<void> => {
  const { error } = await supabase
    .from('hospitals')
    .update({ available_beds: availableBeds })
    .eq('id', hospitalId);

  if (error) {
    console.error('Error updating hospital capacity:', error);
    throw new Error('Failed to update hospital capacity');
  }
};

export const getEmergencyStatistics = async () => {
  // Get count of total emergencies
  const { count: totalCount, error: totalError } = await supabase
    .from('emergencies')
    .select('*', { count: 'exact', head: true });

  // Get count of active emergencies
  const { count: activeCount, error: activeError } = await supabase
    .from('emergencies')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'assigned', 'in_transit', 'on_site']);

  // Get count of available responders
  const { count: availableRespondersCount, error: respondersError } = await supabase
    .from('responders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available');

  // Get count of alerts from devices
  const { count: alertsCount, error: alertsError } = await supabase
    .from('device_alerts')
    .select('*', { count: 'exact', head: true });

  // Get count of unresolved escalations
  const { count: escalationsCount, error: escalationsError } = await supabase
    .from('alert_escalations')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false);

  if (totalError || activeError || respondersError || alertsError || escalationsError) {
    console.error('Error fetching statistics:', { totalError, activeError, respondersError, alertsError, escalationsError });
    throw new Error('Failed to fetch emergency statistics');
  }

  // Calculate average response time (for demo purposes, we'll use a placeholder)
  const avgResponseTime = "4:32"; // In a real app, this would be calculated from actual data

  // Fetch hospital data for capacity calculations
  const { data: hospitalData, error: hospitalError } = await supabase
    .from('hospitals')
    .select('total_beds, available_beds');
    
  if (hospitalError) {
    console.error('Error fetching hospital data:', hospitalError);
  }
  
  // Calculate hospital capacity
  const totalBeds = hospitalData?.reduce((sum, hospital) => sum + hospital.total_beds, 0) || 0;
  const availableBeds = hospitalData?.reduce((sum, hospital) => sum + hospital.available_beds, 0) || 0;
  const capacityPercentage = totalBeds > 0 ? Math.round((1 - (availableBeds / totalBeds)) * 100) : 0;
  
  // Calculate hospitals at capacity
  const hospitalsAtCapacity = hospitalData?.filter(h => h.available_beds === 0).length || 0;

  return {
    totalEmergencies: totalCount || 0,
    activeEmergencies: activeCount || 0,
    availableResponders: availableRespondersCount || 0,
    avgResponseTime,
    hospitalCapacity: capacityPercentage,
    hospitalsAtCapacity,
    availableBeds,
    totalBeds,
    deviceAlerts: alertsCount || 0,
    pendingEscalations: escalationsCount || 0
  };
};

export const fetchHospitalData = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*');
  
  if (error) {
    console.error('Error fetching hospital data:', error);
    throw error;
  }

  return data.map(hospital => ({
    ...hospital,
    coordinates: hospital.coordinates ? {
      x: parseFloat(hospital.coordinates.toString().split('(')[1].split(',')[0]),
      y: parseFloat(hospital.coordinates.toString().split(',')[1].split(')')[0])
    } : undefined
  }));
};
