import React, { useState, useEffect } from 'react';
import { Plus, Minus, Activity, Bed, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { fetchHospitals, updateHospitalCapacity } from '@/services/emergency-service';
import { Hospital } from '@/types/emergency-types';

export const HospitalCapacityManager: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const data = await fetchHospitals();
      setHospitals(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCapacityUpdate = async (hospitalId: string, change: number) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) return;

    const newAvailable = Math.max(0, Math.min(hospital.total_beds, hospital.available_beds + change));
    
    const updatedHospital = await updateHospitalCapacity(hospitalId, newAvailable);
    if (updatedHospital) {
      setHospitals(prev => prev.map(h => h.id === hospitalId ? updatedHospital : h));
    }
  };

  const getCapacityStatus = (hospital: Hospital) => {
    const percentage = (hospital.available_beds / hospital.total_beds) * 100;
    if (percentage === 0) return { label: 'Full', color: 'destructive' };
    if (percentage < 20) return { label: 'Critical', color: 'destructive' };
    if (percentage < 50) return { label: 'Limited', color: 'secondary' };
    return { label: 'Available', color: 'default' };
  };

  if (loading) return <div>Loading hospitals...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hospitals.map((hospital) => {
        const capacityStatus = getCapacityStatus(hospital);
        const occupancyRate = ((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100;

        return (
          <Card key={hospital.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{hospital.name}</CardTitle>
                <Badge variant={capacityStatus.color as any}>
                  {capacityStatus.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{hospital.location}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Available: {hospital.available_beds}</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Total: {hospital.total_beds}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Occupancy</span>
                  <span>{Math.round(occupancyRate)}%</span>
                </div>
                <Progress value={occupancyRate} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCapacityUpdate(hospital.id, -1)}
                    disabled={hospital.available_beds === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium">Beds</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCapacityUpdate(hospital.id, 1)}
                    disabled={hospital.available_beds >= hospital.total_beds}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {hospital.specialist_available && (
                  <Badge variant="outline" className="text-xs">
                    Specialist Available
                  </Badge>
                )}
              </div>

              {hospital.available_beds === 0 && (
                <div className="flex items-center text-red-600 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Hospital at full capacity
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};