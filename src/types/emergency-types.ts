
export interface Coordinates {
  x: number;
  y: number;
  latitude?: number; // Alias for y
  longitude?: number; // Alias for x
}

export interface EmergencyCategory {
  id: string;
  name: string;
  description: string | null;
  priority_level: number;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyType {
  id: string;
  name: string;
  category_id: string;
  description: string | null;
  default_priority: number;
  estimated_duration: number | null; // in minutes
  required_responders: number;
  required_equipment: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Base emergency interface that matches the database schema
export interface EmergencyBase {
  id: string;
  type: string; // Keeping for backward compatibility
  type_id: string | null;
  category_id: string | null;
  description: string;
  location: string;
  coordinates: Coordinates | null;
  priority: number;
  status: 'pending' | 'assigned' | 'in_transit' | 'on_site' | 'resolved' | 'canceled';
  reported_by?: string | null;
  assigned_to?: string | null;
  reported_at: string;
  assigned_at?: string | null;
  resolved_at?: string | null;
  notes?: string | null;
  device_alert_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Extended emergency interface with relationships
// This matches the emergency_details view in the database
export interface Emergency extends EmergencyBase {
  // Joined fields from emergency_details view
  category_name?: string | null;
  category_description?: string | null;
  category_priority?: number | null;
  type_name?: string | null;
  type_description?: string | null;
  type_priority?: number | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  assigned_responder_name?: string | null;
  assigned_responder_phone?: string | null;
  assigned_responder_status?: ResponderStatus | null;
  
  // Relationships
  category?: EmergencyCategory | null;
  emergency_type?: EmergencyType | null;
  assignments?: EmergencyAssignment[];
  communications?: Communication[];
}

// Status types for responders
export type ResponderStatus = 'available' | 'on_call' | 'on_break' | 'off_duty' | 'unavailable';

export interface Responder {
  id: string;
  agency_id?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  status: ResponderStatus;
  type: string; // e.g., 'ambulance', 'police', 'traffic', 'bajaj'
  current_location?: string | null;
  notes?: string | null;
  availability_status?: string | null;
  coordinates: Coordinates | null;
  last_active?: string | null;
  last_status_change?: string | null;
}


export interface Hospital {
  id: string;
  name: string;
  location: string;
  coordinates: Coordinates | null;
  available_beds: number;
  total_beds: number;
  specialist_available?: boolean | null;
  notes?: string | null;
}

// Emergency Category - For categorizing emergency types
export interface EmergencyCategory {
  id: string;
  name: string;
  description: string | null;
  priority_level: number;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  types?: EmergencyType[];
}

// Emergency Type - Specific types of emergencies
export interface EmergencyType {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  default_priority: number;
  estimated_duration: number | null; // in minutes
  required_responders: number;
  required_equipment: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  category?: EmergencyCategory | null;
}

// Status types for emergency assignments
export type AssignmentStatus = 'pending' | 'accepted' | 'in_transit' | 'on_site' | 'completed' | 'canceled';

export interface EmergencyAssignment {
  id: string;
  emergency_id: string;
  responder_id: string;
  assigned_at: string;
  eta?: string | null;
  status: AssignmentStatus;
  notes?: string | null;
  accepted_at?: string | null;
  arrived_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  
  // Relationships
  emergency?: Emergency;
  responder?: Responder;
}

// Types of communications
export type CommunicationType = 'message' | 'status_update' | 'alert' | 'system' | 'assignment';

export interface Communication {
  id: string;
  emergency_id: string | null;
  responder_id: string | null;
  user_id: string | null;
  sender: string;
  message: string;
  type: CommunicationType;
  metadata: Record<string, any> | null;
  sent_at: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  emergency?: Emergency | null;
  responder?: Responder | null;
  user?: UserProfile | null;
}

// IoT Device status types
export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';

export interface IoTDevice {
  id: string;
  device_id: string;
  name: string;
  type: string;
  vehicle_id?: string | null;
  owner_id?: string | null;
  status?: DeviceStatus;
  last_heartbeat?: string | null;
  location?: Coordinates | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  
  // Relationships
  owner?: UserProfile | null;
}

// Alert severity levels
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DeviceAlert {
  id: string;
  device_id: string;
  device?: IoTDevice | null;
  alert_type: string;
  severity: number | AlertSeverity;
  location: Coordinates | null;
  data: Record<string, any>;
  processed: boolean;
  emergency_id?: string | null;
  emergency?: Emergency | null;
  created_at: string;
  processed_at?: string | null;
}

// Escalation levels
export type EscalationLevel = 'normal' | 'elevated' | 'critical' | 'emergency';

export interface AlertEscalation {
  id: string;
  alert_id: string;
  alert?: DeviceAlert | null;
  level: EscalationLevel;
  reason: string;
  resolved: boolean;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  
  // Relationships
  handled_by?: string | null;
  handled_by_user?: UserProfile | null;
}

// User role types
export type UserRole = 'admin' | 'dispatcher' | 'responder' | 'user';

// User profile type for relationships
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

// Emergency status types
export type EmergencyStatus = 'pending' | 'assigned' | 'in_transit' | 'on_site' | 'resolved' | 'canceled';
