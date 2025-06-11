
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Bed, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Hospital {
  id: string;
  name: string;
  location: string;
  total_beds: number;
  available_beds: number;
  specialist_available: boolean;
}

export const HospitalCapacity = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('hospital-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hospitals'
        },
        () => {
          fetchHospitals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospital data');
    } finally {
      setLoading(false);
    }
  };

  const updateBedCount = async (hospitalId: string, newAvailableBeds: number) => {
    setUpdating(hospitalId);
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({ available_beds: newAvailableBeds })
        .eq('id', hospitalId);

      if (error) throw error;

      setHospitals(prev => prev.map(hospital =>
        hospital.id === hospitalId
          ? { ...hospital, available_beds: newAvailableBeds }
          : hospital
      ));

      toast.success('Bed count updated');
    } catch (error) {
      console.error('Error updating bed count:', error);
      toast.error('Failed to update bed count');
    } finally {
      setUpdating(null);
    }
  };

  const getCapacityStatus = (hospital: Hospital) => {
    const occupancyRate = ((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100;
    
    if (occupancyRate >= 95) return { status: 'critical', color: 'bg-red-500', label: 'Critical' };
    if (occupancyRate >= 85) return { status: 'high', color: 'bg-orange-500', label: 'High' };
    if (occupancyRate >= 70) return { status: 'moderate', color: 'bg-yellow-500', label: 'Moderate' };
    return { status: 'low', color: 'bg-green-500', label: 'Normal' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Hospital Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Hospital Capacity
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHospitals}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hospitals.map((hospital) => {
          const capacity = getCapacityStatus(hospital);
          const occupancyRate = ((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100;
          
          return (
            <div key={hospital.id} className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{hospital.name}</h4>
                  <p className="text-sm text-gray-600">{hospital.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${capacity.color} text-white`}>
                    {capacity.label}
                  </Badge>
                  {hospital.specialist_available && (
                    <Badge variant="outline">Specialist</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    <span>Available: {hospital.available_beds}/{hospital.total_beds}</span>
                  </div>
                  <span>{occupancyRate.toFixed(1)}% occupied</span>
                </div>
                <Progress value={occupancyRate} className="h-2" />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor={`beds-${hospital.id}`} className="text-sm">
                  Update available beds:
                </Label>
                <Input
                  id={`beds-${hospital.id}`}
                  type="number"
                  min="0"
                  max={hospital.total_beds}
                  defaultValue={hospital.available_beds}
                  className="w-20 h-8"
                  onBlur={(e) => {
                    const newValue = parseInt(e.target.value);
                    if (newValue !== hospital.available_beds && newValue >= 0 && newValue <= hospital.total_beds) {
                      updateBedCount(hospital.id, newValue);
                    }
                  }}
                />
                {updating === hospital.id && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
              </div>

              {hospital.available_beds === 0 && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No beds available</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
