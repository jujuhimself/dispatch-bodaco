
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Building2, Bed, Users, AlertTriangle, Phone, MapPin } from 'lucide-react';
import { fetchHospitals, updateHospitalCapacity } from '@/services/emergency-service';
import { Hospital } from '@/types/emergency-types';
import { toast } from 'sonner';

export const HospitalIntegration: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: fetchHospitals,
    refetchInterval: 30000,
  });

  const updateCapacityMutation = useMutation({
    mutationFn: ({ hospitalId, availableBeds }: { hospitalId: string; availableBeds: number }) =>
      updateHospitalCapacity(hospitalId, availableBeds),
    onSuccess: () => {
      toast.success('Hospital capacity updated');
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update capacity');
    }
  });

  const getCapacityStatus = (hospital: Hospital) => {
    const occupancyRate = ((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100;
    
    if (occupancyRate >= 95) return { color: 'text-red-600', status: 'Critical' };
    if (occupancyRate >= 80) return { color: 'text-orange-600', status: 'High' };
    if (occupancyRate >= 60) return { color: 'text-yellow-600', status: 'Moderate' };
    return { color: 'text-green-600', status: 'Available' };
  };

  const HospitalCard = ({ hospital }: { hospital: Hospital }) => {
    const capacityStatus = getCapacityStatus(hospital);
    const occupancyRate = ((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              {hospital.name}
            </div>
            <Badge variant={hospital.available_beds === 0 ? "destructive" : "secondary"}>
              {capacityStatus.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {hospital.location}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Bed Occupancy</span>
              <span className={capacityStatus.color}>
                {hospital.total_beds - hospital.available_beds}/{hospital.total_beds}
              </span>
            </div>
            <Progress value={occupancyRate} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-2 text-green-600" />
              <span>Available: {hospital.available_beds}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              <span>Total: {hospital.total_beds}</span>
            </div>
          </div>

          {hospital.specialist_available && (
            <div className="flex items-center text-sm text-green-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Specialist Available
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Transfer Patient
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <Input
              type="number"
              placeholder="Update available beds"
              min="0"
              max={hospital.total_beds}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= hospital.total_beds) {
                  updateCapacityMutation.mutate({
                    hospitalId: hospital.id,
                    availableBeds: value
                  });
                }
              }}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading hospital data...</p>
      </div>
    );
  }

  const totalBeds = hospitals.reduce((sum, h) => sum + h.total_beds, 0);
  const availableBeds = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
  const hospitalsAtCapacity = hospitals.filter(h => h.available_beds === 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{hospitals.length}</div>
            <div className="text-sm text-gray-600">Total Hospitals</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{availableBeds}</div>
            <div className="text-sm text-gray-600">Available Beds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalBeds}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{hospitalsAtCapacity}</div>
            <div className="text-sm text-gray-600">At Capacity</div>
          </CardContent>
        </Card>
      </div>

      {/* Hospital Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <HospitalCard key={hospital.id} hospital={hospital} />
        ))}
      </div>
    </div>
  );
};
