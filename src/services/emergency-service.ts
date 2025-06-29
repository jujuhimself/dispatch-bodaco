
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
  phone?: string;
  current_location?: string;
  coordinates?: { x: number; y: number };
  last_active: string;
  notes?: string;
}

export interface EmergencyStatistics {
  activeEmergencies: number;
  availableResponders: number;
  avgResponseTime: string;
  hospitalCapacity: number;
  hospitalsAtCapacity?: number;
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
    last_active: new Date().toISOString(),
  },
  {
    id: 'resp-002',
    name: 'Traffic Police Unit 12',
    type: 'traffic',
    status: 'available',
    phone: '+251911654321',
    current_location: 'Meskel Square Station',
    last_active: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'resp-003',
    name: 'Fire Brigade Unit A',
    type: 'fire',
    status: 'available',
    phone: '+251911789012',
    current_location: 'Fire Station - Merkato',
    last_active: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'resp-004',
    name: 'Bajaj Emergency Response',
    type: 'bajaj',
    status: 'available',
    phone: '+251911345678',
    current_location: 'Arat Kilo area',
    last_active: new Date(Date.now() - 600000).toISOString(),
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
    hospitalsAtCapacity: 2
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
