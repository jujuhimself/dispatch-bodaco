
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Types for IoT devices and alerts
export interface IoTDevice {
  id?: string;
  name: string;
  device_id: string;
  type: string;
  status?: string;
  location?: { x: number, y: number };
  last_heartbeat?: string;
  vehicle_id?: string;
  owner_id?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceAlert {
  id?: string;
  device_id: string;
  alert_type: string;
  severity: number;
  location?: { x: number, y: number };
  data: any;
  processed?: boolean;
  emergency_id?: string;
  created_at?: string;
  processed_at?: string;
}

export interface AlertEscalation {
  id?: string;
  alert_id: string;
  level: 'normal' | 'elevated' | 'critical' | 'emergency';
  reason: string;
  resolved?: boolean;
  created_at?: string;
  resolved_at?: string;
}

export interface AlertProcessor {
  id?: string;
  alert_id: string;
  processor_type: string;
  status: string;
  details?: any;
  created_at?: string;
  updated_at?: string;
}

// Functions to fetch and manage IoT devices
export async function fetchIoTDevices(): Promise<IoTDevice[]> {
  const { data, error } = await supabase
    .from('iot_devices')
    .select('*');
  
  if (error) {
    console.error('Error fetching IoT devices:', error);
    throw error;
  }
  
  return data.map(device => ({
    ...device,
    location: device.location ? {
      x: parseFloat(device.location.toString().split('(')[1].split(',')[0]),
      y: parseFloat(device.location.toString().split(',')[1].split(')')[0])
    } : undefined
  }));
}

export async function addIoTDevice(device: Partial<IoTDevice>): Promise<IoTDevice> {
  // Ensure required fields are present
  if (!device.name || !device.device_id || !device.type) {
    throw new Error('Device name, device_id, and type are required');
  }

  // Format the location for PostGIS if it exists
  let locationValue = null;
  if (device.location) {
    locationValue = `(${device.location.x},${device.location.y})`;
  }

  const { data, error } = await supabase
    .from('iot_devices')
    .insert({
      name: device.name,
      device_id: device.device_id,
      type: device.type,
      status: device.status || 'active',
      location: locationValue,
      vehicle_id: device.vehicle_id,
      owner_id: device.owner_id,
      metadata: device.metadata || {},
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding IoT device:', error);
    throw error;
  }
  
  return {
    ...data,
    location: data.location ? {
      x: parseFloat(data.location.toString().split('(')[1].split(',')[0]),
      y: parseFloat(data.location.toString().split(',')[1].split(')')[0])
    } : undefined
  };
}

export async function updateIoTDevice(id: string, device: Partial<IoTDevice>): Promise<IoTDevice> {
  // Format the location for PostGIS if it exists
  const updates: any = { ...device };
  
  if (device.location) {
    updates.location = `(${device.location.x},${device.location.y})`;
  }
  
  delete updates.id; // Remove id from updates object
  
  const { data, error } = await supabase
    .from('iot_devices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating IoT device:', error);
    throw error;
  }
  
  return {
    ...data,
    location: data.location ? {
      x: parseFloat(data.location.toString().split('(')[1].split(',')[0]),
      y: parseFloat(data.location.toString().split(',')[1].split(')')[0])
    } : undefined
  };
}

// Functions to fetch and manage device alerts
export async function fetchDeviceAlerts(processed?: boolean): Promise<DeviceAlert[]> {
  let query = supabase
    .from('device_alerts')
    .select('*');
  
  if (processed !== undefined) {
    query = query.eq('processed', processed);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching device alerts:', error);
    throw error;
  }
  
  return data.map(alert => ({
    ...alert,
    location: alert.location ? {
      x: parseFloat(alert.location.toString().split('(')[1].split(',')[0]),
      y: parseFloat(alert.location.toString().split(',')[1].split(')')[0])
    } : undefined
  }));
}

export async function createDeviceAlert(alert: Partial<DeviceAlert>): Promise<DeviceAlert> {
  // Ensure required fields are present
  if (!alert.device_id || !alert.alert_type || alert.severity === undefined || !alert.data) {
    throw new Error('Device ID, alert type, severity, and data are required');
  }

  // Format the location for PostGIS if it exists
  let locationValue = null;
  if (alert.location) {
    locationValue = `(${alert.location.x},${alert.location.y})`;
  }

  const { data, error } = await supabase
    .from('device_alerts')
    .insert({
      device_id: alert.device_id,
      alert_type: alert.alert_type,
      severity: alert.severity,
      location: locationValue,
      data: alert.data,
      processed: alert.processed || false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating device alert:', error);
    throw error;
  }
  
  return {
    ...data,
    location: data.location ? {
      x: parseFloat(data.location.toString().split('(')[1].split(',')[0]),
      y: parseFloat(data.location.toString().split(',')[1].split(')')[0])
    } : undefined
  };
}

// Functions for alert escalations
export async function createAlertEscalation(escalation: Partial<AlertEscalation>): Promise<AlertEscalation> {
  // Ensure required fields are present
  if (!escalation.alert_id || !escalation.level || !escalation.reason) {
    throw new Error('Alert ID, level, and reason are required');
  }

  const { data, error } = await supabase
    .from('alert_escalations')
    .insert({
      alert_id: escalation.alert_id,
      level: escalation.level,
      reason: escalation.reason,
      resolved: escalation.resolved || false
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating alert escalation:', error);
    throw error;
  }
  
  return data;
}

// Functions for alert processors
export async function createAlertProcessor(processor: AlertProcessor): Promise<AlertProcessor> {
  const { data, error } = await supabase
    .from('alert_processors')
    .insert(processor)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating alert processor:', error);
    throw error;
  }
  
  return data;
}
