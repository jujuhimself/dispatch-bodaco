
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Search, Bed, Phone } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { fetchHospitals, updateHospitalCapacity } from '@/services/emergency-service';
import { Hospital } from '@/types/emergency-types';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Hospitals = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch hospitals data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hospitals'],
    queryFn: fetchHospitals,
  });
  
  // Filter hospitals based on search term
  const filteredHospitals = data?.filter((hospital: Hospital) => {
    const searchLower = searchTerm.toLowerCase();
    return hospital.name.toLowerCase().includes(searchLower) ||
           hospital.location.toLowerCase().includes(searchLower) ||
           (hospital.notes && hospital.notes.toLowerCase().includes(searchLower));
  }) || [];
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Calculate capacity percentage
  const getCapacityPercentage = (available: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((available / total) * 100);
  };
  
  // Get capacity color
  const getCapacityColor = (percentage: number) => {
    if (percentage < 10) return 'bg-red-500';
    if (percentage < 30) return 'bg-orange-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="flex justify-center items-center gap-2 text-emergency-600">
          <AlertCircle />
          <h2>Failed to load hospitals</h2>
        </div>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Hospital Capacity</h1>
        
        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search hospitals..."
            className="pl-8 w-full sm:w-64"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => {
          const capacityPerc = getCapacityPercentage(hospital.available_beds, hospital.total_beds);
          const capacityColor = getCapacityColor(capacityPerc);
          
          return (
            <Card key={hospital.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="font-bold text-lg">{hospital.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{hospital.location}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Available Beds</span>
                    <span className="text-sm font-medium">
                      {hospital.available_beds}/{hospital.total_beds}
                    </span>
                  </div>
                  <Progress className="h-2" value={capacityPerc} indicatorClassName={capacityColor} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">
                      {hospital.available_beds === 0 ? (
                        <Badge className="bg-red-500">No beds available</Badge>
                      ) : (
                        <span className="text-green-600 font-medium">{hospital.available_beds} beds available</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    {hospital.specialist_available ? (
                      <Badge className="bg-blue-500">Specialists Available</Badge>
                    ) : (
                      <Badge variant="outline">No Specialists</Badge>
                    )}
                  </div>
                </div>
                
                {hospital.notes && (
                  <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                    <p>{hospital.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredHospitals.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No hospitals found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;
