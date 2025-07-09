
// Emergency Service - Mock implementation for development
// Replace with actual API calls when backend is ready

export interface Emergency {
  id: string;
  type: string;
  description: string;
  location: string;
  coordinates?: { x: number; y: number };
  priority: number;
  status: 'pending' | 'assigned' | 'in_transit' | 'on_site' | 'resolved' | 'canceled';
  reported_at: string;
  assigned_at?: string;
  resolved_at?: string;
  notes?: string;
}

export interface Responder {
  id: string;
  name: string;
  type: 'ambulance' | 'bajaj' | 'traffic' | 'fire' | 'police';
  status: 'available' | 'on_call' | 'off_duty';
  phone: string | null;
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

export interface Communication {
  id: string;
  sender: string;
  message: string;
  type: string;
  sent_at: string;
  emergency_id: string | null;
  responder_id: string | null;
}

export interface EmergencyStatistics {
  activeEmergencies: number;
  availableResponders: number;
  avgResponseTime: string;
  hospitalCapacity: number;
  hospitalsAtCapacity?: number;
  totalEmergencies: number;
}

// Mock data
const mockEmergencies: Emergency[] = [
  {
    id: 'emer-001',
    type: 'Medical Emergency',
    description: 'Heart attack patient at office building',
    location: 'Bole Road, near Commercial Bank',
    coordinates: { x: 38.7578, y: 9.0192 },
    priority: 1,
    status: 'assigned',
    reported_at: new Date(Date.now() - 600000).toISOString(),
    assigned_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'emer-002',
    type: 'Vehicle Crash',
    description: 'Multi-vehicle collision on main road',
    location: 'Mexico Square intersection',
    coordinates: { x: 38.7614, y: 9.0084 },
    priority: 2,
    status: 'in_transit',
    reported_at: new Date(Date.now() - 900000).toISOString(),
    assigned_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'emer-003',
    type: 'Fire Emergency',
    description: 'Kitchen fire in restaurant',
    location: 'Piazza area, Italian restaurant',
    coordinates: { x: 38.7369, y: 9.0437 },
    priority: 1,
    status: 'pending',
    reported_at: new Date(Date.now() - 180000).toISOString(),
  }
];

const mockResponders: Responder[] = [
  {
    id: 'resp-001',
    name: 'Ambulance Unit 001',
    type: 'ambulance',
    status: 'on_call',
    phone: '+251911123456',
    current_location: 'En route to Bole Road',
    coordinates: { x: 38.7578, y: 9.0192 },
    last_active: new Date().toISOString(),
    notes: null,
  },
  {
    id: 'resp-002',
    name: 'Traffic Police Unit 12',
    type: 'traffic',
    status: 'available',
    phone: '+251911654321',
    current_location: 'Meskel Square Station',
    coordinates: { x: 38.7614, y: 9.0084 },
    last_active: new Date(Date.now() - 300000).toISOString(),
    notes: null,
  },
  {
    id: 'resp-003',
    name: 'Fire Brigade Unit A',
    type: 'ambulance', // Changed from 'fire' to match types
    status: 'available',
    phone: '+251911789012',
    current_location: 'Fire Station - Merkato',
    coordinates: { x: 38.7369, y: 9.0437 },
    last_active: new Date(Date.now() - 120000).toISOString(),
    notes: 'Fire department unit',
  },
  {
    id: 'resp-004',
    name: 'Bajaj Emergency Response',
    type: 'bajaj',
    status: 'available',
    phone: '+251911345678',
    current_location: 'Arat Kilo area',
    coordinates: { x: 38.7500, y: 9.0300 },
    last_active: new Date(Date.now() - 600000).toISOString(),
    notes: null,
  }
];

const mockHospitals: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'Black Lion Hospital',
    location: 'Addis Ababa University, Lideta',
    coordinates: { x: 38.7578, y: 9.0192 },
    total_beds: 500,
    available_beds: 120,
    specialist_available: true,
    notes: 'Trauma center available',
  },
  {
    id: 'hosp-002',
    name: 'St. Paul Hospital',
    location: 'Gulele, near Millennium Hall',
    coordinates: { x: 38.7614, y: 9.0284 },
    total_beds: 400,
    available_beds: 85,
    specialist_available: true,
    notes: 'Cardiac surgery unit',
  },
  {
    id: 'hosp-003',
    name: 'Yekatit 12 Hospital',
    location: 'Piazza, downtown',
    coordinates: { x: 38.7369, y: 9.0437 },
    total_beds: 300,
    available_beds: 45,
    specialist_available: false,
    notes: 'General medical care',
  }
];

const mockCommunications: Communication[] = [
  {
    id: 'comm-001',
    sender: 'Dispatch Center',
    message: 'Emergency reported at Bole Road',
    type: 'dispatch',
    sent_at: new Date(Date.now() - 300000).toISOString(),
    emergency_id: 'emer-001',
    responder_id: null,
  },
  {
    id: 'comm-002',
    sender: 'Ambulance Unit 001',
    message: 'En route to location, ETA 5 minutes',
    type: 'status_update',
    sent_at: new Date(Date.now() - 180000).toISOString(),
    emergency_id: 'emer-001',
    responder_id: 'resp-001',
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchActiveEmergencies = async (): Promise<Emergency[]> => {
  await delay(800);
  return mockEmergencies.filter(e => ['pending', 'assigned', 'in_transit', 'on_site'].includes(e.status));
};

export const fetchAllEmergencies = async (): Promise<Emergency[]> => {
  await delay(1000);
  return mockEmergencies;
};

export const fetchAvailableResponders = async (): Promise<Responder[]> => {
  await delay(600);
  return mockResponders.filter(r => r.status === 'available');
};

export const fetchResponders = async (): Promise<Responder[]> => {
  await delay(800);
  return mockResponders;
};

export const getEmergencyStatistics = async (): Promise<EmergencyStatistics> => {
  await delay(500);
  const activeCount = mockEmergencies.filter(e => 
    ['pending', 'assigned', 'in_transit', 'on_site'].includes(e.status)
  ).length;
  
  const availableCount = mockResponders.filter(r => r.status === 'available').length;
  
  return {
    activeEmergencies: activeCount,
    availableResponders: availableCount,
    avgResponseTime: '7:32',
    hospitalCapacity: 78,
    hospitalsAtCapacity: 2,
    totalEmergencies: mockEmergencies.length
  };
};

export const createEmergency = async (emergencyData: Partial<Emergency>): Promise<Emergency> => {
  await delay(1200);
  
  const newEmergency: Emergency = {
    id: `emer-${Date.now()}`,
    type: emergencyData.type || '',
    description: emergencyData.description || '',
    location: emergencyData.location || '',
    coordinates: emergencyData.coordinates,
    priority: emergencyData.priority || 3,
    status: 'pending',
    reported_at: new Date().toISOString(),
  };
  
  // In real implementation, this would make an API call
  mockEmergencies.unshift(newEmergency);
  
  return newEmergency;
};

export const getEmergencyById = async (id: string): Promise<Emergency | null> => {
  await delay(400);
  return mockEmergencies.find(e => e.id === id) || null;
};

// Additional missing functions
export const getActiveResponders = async (): Promise<Responder[]> => {
  await delay(600);
  return mockResponders.filter(r => r.status === 'on_call');
};

export const fetchHospitals = async (): Promise<Hospital[]> => {
  await delay(500);
  return mockHospitals;
};

export const updateHospitalCapacity = async (
  hospitalId: string, 
  availableBeds: number
): Promise<Hospital> => {
  await delay(300);
  const hospital = mockHospitals.find(h => h.id === hospitalId);
  if (hospital) {
    hospital.available_beds = availableBeds;
  }
  return hospital!;
};

export const fetchRecentCommunications = async (emergencyId?: string): Promise<Communication[]> => {
  await delay(400);
  return emergencyId 
    ? mockCommunications.filter(c => c.emergency_id === emergencyId)
    : mockCommunications;
};

export const sendCommunication = async (
  message: string,
  type: string,
  emergencyId?: string,
  responderId?: string
): Promise<Communication> => {
  await delay(200);
  const newComm: Communication = {
    id: `comm-${Date.now()}`,
    sender: 'System',
    message,
    type,
    sent_at: new Date().toISOString(),
    emergency_id: emergencyId || null,
    responder_id: responderId || null,
  };
  mockCommunications.unshift(newComm);
  return newComm;
};

export const subscribeToMessages = (callback: (message: Communication) => void) => {
  // Mock real-time subscription
  return {
    unsubscribe: () => {}
  };
};

export const assignResponder = async (
  emergencyId: string,
  responderId: string,
  notes?: string
): Promise<void> => {
  await delay(500);
  const emergency = mockEmergencies.find(e => e.id === emergencyId);
  const responder = mockResponders.find(r => r.id === responderId);
  
  if (emergency && responder) {
    emergency.status = 'assigned';
    emergency.assigned_at = new Date().toISOString();
    responder.status = 'on_call';
  }
};

export const autoAssignResponder = async (emergencyId: string): Promise<Responder | null> => {
  await delay(600);
  const availableResponders = mockResponders.filter(r => r.status === 'available');
  if (availableResponders.length > 0) {
    const responder = availableResponders[0];
    await assignResponder(emergencyId, responder.id);
    return responder;
  }
  return null;
};

export const updateEmergencyStatus = async (
  emergencyId: string,
  status: Emergency['status'],
  notes?: string
): Promise<Emergency | null> => {
  await delay(300);
  const emergency = mockEmergencies.find(e => e.id === emergencyId);
  if (emergency) {
    emergency.status = status;
    if (status === 'resolved') {
      emergency.resolved_at = new Date().toISOString();
    }
    if (notes) {
      emergency.notes = notes;
    }
  }
  return emergency || null;
};
