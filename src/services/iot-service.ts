
import { supabase } from '@/integrations/supabase/client';
import { transformCoordinates, formatCoordinatesForPostgres } from '@/services/emergency-service';

export interface IoTDevice {
  id: string;
  device_id: string;
  name: string;
  type: string;
  vehicle_id?: string;
  owner_id?: string;
  status?: string;
  last_heartbeat?: string;
  location?: { x: number; y: number } | null;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceAlert {
  id: string;
  device_id: string;
  alert_type: string;
  severity: number;
  location: { x: number; y: number } | null;
  data: any;
  processed?: boolean;
  emergency_id?: string;
  created_at?: string;
  processed_at?: string;
}

export interface AlertEscalation {
  id: string;
  alert_id: string;
  level: 'normal' | 'elevated' | 'critical' | 'emergency';
  reason: string;
  resolved: boolean;
  resolved_at?: string;
  created_at?: string;
}

// IoT Devices
export const fetchIoTDevices = async (): Promise<IoTDevice[]> => {
  const { data, error } = await supabase
    .from('iot_devices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching IoT devices:', error);
    throw new Error('Failed to fetch IoT devices');
  }

  return data.map((item: any) => ({
    ...item,
    location: transformCoordinates(item.location)
  })) as IoTDevice[];
};

export const createIoTDevice = async (deviceData: Partial<IoTDevice>): Promise<IoTDevice> => {
  // Convert coordinates to Postgres point format if provided
  const formattedLocation = deviceData.location 
    ? formatCoordinatesForPostgres(deviceData.location) 
    : null;

  const { data, error } = await supabase
    .from('iot_devices')
    .insert({
      ...deviceData,
      location: formattedLocation
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating IoT device:', error);
    throw new Error('Failed to create IoT device');
  }

  return {
    ...data,
    location: transformCoordinates(data.location)
  } as IoTDevice;
};

export const updateIoTDevice = async (id: string, deviceData: Partial<IoTDevice>): Promise<IoTDevice> => {
  // Convert coordinates to Postgres point format if provided
  const formattedLocation = deviceData.location 
    ? formatCoordinatesForPostgres(deviceData.location) 
    : undefined;

  const { data, error } = await supabase
    .from('iot_devices')
    .update({
      ...deviceData,
      location: formattedLocation,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating IoT device:', error);
    throw new Error('Failed to update IoT device');
  }

  return {
    ...data,
    location: transformCoordinates(data.location)
  } as IoTDevice;
};

export const deleteIoTDevice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('iot_devices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting IoT device:', error);
    throw new Error('Failed to delete IoT device');
  }
};

// Device Alerts
export const fetchDeviceAlerts = async (processed?: boolean): Promise<DeviceAlert[]> => {
  let query = supabase
    .from('device_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (processed !== undefined) {
    query = query.eq('processed', processed);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching device alerts:', error);
    throw new Error('Failed to fetch device alerts');
  }

  return data.map((item: any) => ({
    ...item,
    location: transformCoordinates(item.location)
  })) as DeviceAlert[];
};

export const createDeviceAlert = async (alertData: Partial<DeviceAlert>): Promise<DeviceAlert> => {
  // Convert coordinates to Postgres point format
  const formattedLocation = alertData.location 
    ? formatCoordinatesForPostgres(alertData.location) 
    : null;

  if (!formattedLocation) {
    throw new Error('Location is required for device alerts');
  }

  const { data, error } = await supabase
    .from('device_alerts')
    .insert({
      ...alertData,
      location: formattedLocation
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating device alert:', error);
    throw new Error('Failed to create device alert');
  }

  return {
    ...data,
    location: transformCoordinates(data.location)
  } as DeviceAlert;
};

// Alert Escalations
export const fetchAlertEscalations = async (resolved?: boolean): Promise<AlertEscalation[]> => {
  let query = supabase
    .from('alert_escalations')
    .select('*')
    .order('created_at', { ascending: false });

  if (resolved !== undefined) {
    query = query.eq('resolved', resolved);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching alert escalations:', error);
    throw new Error('Failed to fetch alert escalations');
  }

  return data as AlertEscalation[];
};

export const createAlertEscalation = async (escalationData: Partial<AlertEscalation>): Promise<AlertEscalation> => {
  const { data, error } = await supabase
    .from('alert_escalations')
    .insert(escalationData)
    .select()
    .single();

  if (error) {
    console.error('Error creating alert escalation:', error);
    throw new Error('Failed to create alert escalation');
  }

  return data as AlertEscalation;
};

export const resolveAlertEscalation = async (id: string): Promise<AlertEscalation> => {
  const { data, error } = await supabase
    .from('alert_escalations')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error resolving alert escalation:', error);
    throw new Error('Failed to resolve alert escalation');
  }

  return data as AlertEscalation;
};

// Subscription to real-time alerts
export const subscribeToDeviceAlerts = (callback: (alert: DeviceAlert) => void) => {
  return supabase
    .channel('device-alerts-channel')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'device_alerts' 
      },
      (payload) => {
        const alert = {
          ...payload.new,
          location: transformCoordinates(payload.new.location)
        } as DeviceAlert;
        
        callback(alert);
      }
    )
    .subscribe();
};

// Subscription to real-time escalations
export const subscribeToAlertEscalations = (callback: (escalation: AlertEscalation) => void) => {
  return supabase
    .channel('alert-escalations-channel')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'alert_escalations' 
      },
      (payload) => {
        callback(payload.new as AlertEscalation);
      }
    )
    .subscribe();
};
