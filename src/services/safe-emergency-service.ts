
import { supabase } from '@/integrations/supabase/client';
import { Emergency, Responder, Hospital, Communication, EmergencyAssignment } from '@/types/emergency-types';
import { toast } from 'sonner';

// Safe wrapper for emergency service calls with proper error handling
export class SafeEmergencyService {
  // Helper function to transform coordinates with error handling
  static transformCoordinates(coordinates: any): { x: number; y: number } | null {
    try {
      if (!coordinates) return null;
      
      if (typeof coordinates === 'string') {
        const match = coordinates.match(/\((-?\d+\.?\d*),(-?\d+\.?\d*)\)/);
        if (match) {
          return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
          };
        }
      } else if (typeof coordinates === 'object' && coordinates !== null) {
        if ('x' in coordinates && 'y' in coordinates) {
          return {
            x: parseFloat(coordinates.x),
            y: parseFloat(coordinates.y)
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error transforming coordinates:', error);
      return null;
    }
  }

  static async fetchEmergencies(): Promise<Emergency[]> {
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .select('*')
        .order('priority', { ascending: true })
        .order('reported_at', { ascending: false });

      if (error) {
        console.error('Error fetching emergencies:', error);
        toast.error('Failed to fetch emergencies');
        return [];
      }

      return data.map((item: any) => ({
        ...item,
        coordinates: this.transformCoordinates(item.coordinates)
      })) as Emergency[];
    } catch (error) {
      console.error('Unexpected error fetching emergencies:', error);
      toast.error('Unexpected error occurred');
      return [];
    }
  }

  static async fetchEmergencyById(id: string): Promise<{ emergency: Emergency; deviceAlert?: any } | null> {
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .select(`
          *,
          device_alerts(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching emergency with device alert:', error);
        if (error.code === 'PGRST116') {
          toast.error('Emergency not found');
        } else {
          toast.error('Failed to fetch emergency details');
        }
        return null;
      }

      const emergency = {
        ...data,
        coordinates: this.transformCoordinates(data.coordinates)
      } as Emergency;
      
      const deviceAlert = data.device_alerts ? {
        ...data.device_alerts,
        location: this.transformCoordinates(data.device_alerts.location)
      } : undefined;

      return { emergency, deviceAlert };
    } catch (error) {
      console.error('Unexpected error fetching emergency:', error);
      toast.error('Unexpected error occurred');
      return null;
    }
  }

  static async fetchEmergencyAssignments(emergencyId?: string): Promise<EmergencyAssignment[]> {
    try {
      let query = supabase.from('emergency_assignments').select('*, responders(*)');
      
      if (emergencyId) {
        query = query.eq('emergency_id', emergencyId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching emergency assignments:', error);
        toast.error('Failed to fetch emergency assignments');
        return [];
      }

      return data.map((item: any) => {
        const responders = item.responders ? {
          ...item.responders,
          coordinates: this.transformCoordinates(item.responders.coordinates)
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
    } catch (error) {
      console.error('Unexpected error fetching assignments:', error);
      toast.error('Unexpected error occurred');
      return [];
    }
  }

  static async updateEmergencyStatus(emergencyId: string, status: Emergency['status']): Promise<Emergency | null> {
    try {
      const updateData: any = { status };
      
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('emergencies')
        .update(updateData)
        .eq('id', emergencyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating emergency status:', error);
        toast.error('Failed to update emergency status');
        return null;
      }

      return {
        ...data,
        coordinates: this.transformCoordinates(data.coordinates)
      } as Emergency;
    } catch (error) {
      console.error('Unexpected error updating emergency:', error);
      toast.error('Unexpected error occurred');
      return null;
    }
  }
}
