
export interface Emergency {
  id: string;
  type: string;
  description: string | null;
  location: string;
  coordinates: { x: number; y: number } | null;
  status: 'pending' | 'assigned' | 'in_transit' | 'on_site' | 'resolved' | 'canceled';
  priority: number;
  reported_at: string;
  assigned_at: string | null;
  resolved_at: string | null;
  notes: string | null;
}

export interface Responder {
  id: string;
  name: string;
  phone: string | null;
  type: 'ambulance' | 'bajaj' | 'traffic';
  status: 'available' | 'on_call' | 'off_duty';
  current_location: string | null;
  coordinates: { x: number; y: number } | null;
  last_active: string;
  notes: string | null;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  coordinates: { x: number; y: number } | null;
  total_beds: number;
  available_beds: number;
  specialist_available: boolean;
  notes: string | null;
}

export interface EmergencyAssignment {
  id: string;
  emergency_id: string;
  responder_id: string;
  assigned_at: string;
  eta: string | null;
  status: string | null;
  notes: string | null;
  responders?: Responder;
}

export interface Communication {
  id: string;
  sender: string;
  message: string;
  type: string;
  sent_at: string;
  emergency_id: string | null;
  responder_id: string | null;
}
