
import { supabase } from '@/integrations/supabase/client';
import { Emergency, Responder, Hospital } from '@/types/emergency-types';

// Optimized emergency service with caching and batching
class OptimizedEmergencyService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private batchQueue = new Map<string, Promise<any>>();

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCachedData(key: string, data: any, ttl = 30000) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  async getEmergencyStats() {
    const cacheKey = 'emergency-stats';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (this.batchQueue.has(cacheKey)) {
      return this.batchQueue.get(cacheKey);
    }

    const promise = this.fetchEmergencyStats();
    this.batchQueue.set(cacheKey, promise);
    
    try {
      const result = await promise;
      this.setCachedData(cacheKey, result);
      return result;
    } finally {
      this.batchQueue.delete(cacheKey);
    }
  }

  private async fetchEmergencyStats() {
    const [totalRes, activeRes, respondersRes] = await Promise.all([
      supabase.from('emergencies').select('*', { count: 'exact', head: true }),
      supabase.from('emergencies').select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'assigned', 'in_transit', 'on_site']),
      supabase.from('responders').select('*', { count: 'exact', head: true })
        .eq('status', 'available')
    ]);

    return {
      totalEmergencies: totalRes.count || 0,
      activeEmergencies: activeRes.count || 0,
      availableResponders: respondersRes.count || 0,
      avgResponseTime: "4:32"
    };
  }

  async getActiveEmergencies() {
    const cacheKey = 'active-emergencies';
    const cached = this.getCachedData<Emergency[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .in('status', ['pending', 'assigned', 'in_transit', 'on_site'])
      .order('priority', { ascending: true })
      .limit(10);

    if (error) throw error;

    const result = (data.map(item => ({
      ...item,
      coordinates: this.transformCoordinates(item.coordinates)
    })) as unknown) as Emergency[];

    this.setCachedData(cacheKey, result, 15000); // 15s cache
    return result;
  }

  async createEmergency(emergencyData: {
    type: string;
    description: string;
    location: string;
    priority: number;
    coordinates?: { x: number; y: number };
  }) {
    const { data, error } = await supabase
      .from('emergencies')
      .insert({
        type: emergencyData.type,
        description: emergencyData.description,
        location: emergencyData.location,
        priority: emergencyData.priority,
        coordinates: emergencyData.coordinates 
          ? `(${emergencyData.coordinates.x},${emergencyData.coordinates.y})`
          : null
      })
      .select()
      .single();

    if (error) throw error;

    // Invalidate related caches
    this.cache.delete('emergency-stats');
    this.cache.delete('active-emergencies');

    return {
      ...data,
      coordinates: this.transformCoordinates(data.coordinates)
    } as Emergency;
  }

  async assignResponder(emergencyId: string, responderId: string) {
    const { data, error } = await supabase
      .from('emergency_assignments')
      .insert({
        emergency_id: emergencyId,
        responder_id: responderId,
        status: 'assigned'
      })
      .select()
      .single();

    if (error) throw error;

    // Update emergency and responder status in parallel
    await Promise.all([
      supabase.from('emergencies')
        .update({ status: 'assigned', assigned_at: new Date().toISOString() })
        .eq('id', emergencyId),
      supabase.from('responders')
        .update({ status: 'on_call' })
        .eq('id', responderId)
    ]);

    // Invalidate caches
    this.cache.delete('emergency-stats');
    this.cache.delete('active-emergencies');

    return data;
  }

  private transformCoordinates(coordinates: any): { x: number; y: number } | null {
    if (!coordinates) return null;
    if (typeof coordinates === 'string') {
      const match = coordinates.match(/\((-?\d+\.?\d*),(-?\d+\.?\d*)\)/);
      if (match) {
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      }
    }
    return null;
  }
}

export const optimizedEmergencyService = new OptimizedEmergencyService();
