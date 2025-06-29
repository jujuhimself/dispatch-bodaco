
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Bed, AlertCircle, Users } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { useNavigate } from 'react-router-dom';

// Mock service - replace with actual service
const fetchHospitalStatus = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    {
      id: '1',
      name: 'Addis Ababa Medical Center',
      available_beds: 15,
      total_beds: 50,
      specialist_available: true,
      location: 'Bole, Addis Ababa',
      distance: '2.3 km'
    },
    {
      id: '2',
      name: 'St. Paul Hospital',
      available_beds: 8,
      total_beds: 40,
      specialist_available: false,
      location: 'Gulele, Addis Ababa',
      distance: '4.1 km'
    },
    {
      id: '3',
      name: 'Black Lion Hospital',
      available_beds: 0,
      total_beds: 60,
      specialist_available: true,
      location: 'Lideta, Addis Ababa',
      distance: '5.7 km'
    }
  ];
};

const HospitalStatus = () => {
  const navigate = useNavigate();
  const { data: hospitals, isLoading, error } = useQuery({
    queryKey: ['hospital-status'],
    queryFn: fetchHospitalStatus,
    refetchInterval: 60000, // Refresh every minute
  });

  const getCapacityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage < 25) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (percentage < 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getCapacityStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return 'Full';
    if (percentage < 25) return 'Critical';
    if (percentage < 50) return 'Limited';
    return 'Available';
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
          <LoadingState isLoading={true} variant="skeleton">
            <div></div>
          </LoadingState>
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
            Failed to load hospital status. Please try again.
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
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{hospital.name}</h4>
                  <Badge className={getCapacityColor(hospital.available_beds, hospital.total_beds)}>
                    {getCapacityStatus(hospital.available_beds, hospital.total_beds)}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>Beds: {hospital.available_beds}/{hospital.total_beds}</span>
                    </div>
                    <div className="flex items-center">
                      {hospital.specialist_available ? (
                        <Users className="h-4 w-4 mr-1 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                      )}
                      <span className="text-xs">
                        {hospital.specialist_available ? 'Specialist Available' : 'No Specialist'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {hospital.location} • {hospital.distance}
                  </div>
                </div>
              </div>
            ))}
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
