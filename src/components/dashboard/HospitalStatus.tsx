
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building2, Bed, MapPin, AlertCircle } from 'lucide-react';
import { fetchHospitals } from '@/services/emergency-service';
import { LoadingState } from '@/components/ui/loading-state';
import { useNavigate } from 'react-router-dom';

const HospitalStatus = () => {
  const navigate = useNavigate();
  const { data: hospitals, isLoading, error } = useQuery({
    queryKey: ['hospitals-status'],
    queryFn: fetchHospitals,
    refetchInterval: 60000, // Refresh every minute
  });

  const getCapacityStatus = (availableBeds: number, totalBeds: number) => {
    const percentage = (availableBeds / totalBeds) * 100;
    if (percentage > 50) return { color: 'text-green-600', status: 'Available' };
    if (percentage > 20) return { color: 'text-orange-600', status: 'Limited' };
    return { color: 'text-red-600', status: 'Critical' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Hospital Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState isLoading={true} variant="skeleton" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Hospital Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-4">
            Failed to load hospital data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Hospital Status
          </div>
          <Badge variant="secondary">{hospitals?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hospitals || hospitals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hospital data available</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {hospitals.slice(0, 5).map((hospital) => {
              const capacityStatus = getCapacityStatus(hospital.available_beds, hospital.total_beds);
              const occupancyPercentage = ((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100;
              
              return (
                <div
                  key={hospital.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{hospital.name}</h4>
                    <div className="flex items-center gap-1">
                      {hospital.specialist_available && (
                        <Badge variant="outline" className="text-xs">
                          Specialist
                        </Badge>
                      )}
                      <Badge className={`text-xs ${capacityStatus.color} bg-transparent border-current`}>
                        {capacityStatus.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {hospital.location}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        <span>{hospital.available_beds}/{hospital.total_beds} beds</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(occupancyPercentage)}% occupied
                      </span>
                    </div>
                    
                    <Progress 
                      value={occupancyPercentage} 
                      className="h-2"
                      indicatorClassName={
                        occupancyPercentage > 80 ? 'bg-red-500' :
                        occupancyPercentage > 60 ? 'bg-orange-500' : 'bg-green-500'
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/hospitals')}
          >
            View All Hospitals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalStatus;
