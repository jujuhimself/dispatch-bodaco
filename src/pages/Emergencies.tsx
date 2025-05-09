
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Plus, Search } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { fetchEmergencies } from '@/services/emergency-service';
import { Emergency } from '@/types/emergency-types';
import { useAuth } from '@/hooks/useAuth';
import EmergencyList from '@/components/emergencies/EmergencyList';
import EmergencyMap from '@/components/dashboard/EmergencyMap';

const Emergencies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  
  // Fetch emergencies data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['emergencies'],
    queryFn: fetchEmergencies,
  });
  
  // Filter emergencies based on search term
  const filteredEmergencies = data?.filter((emergency: Emergency) => {
    const searchLower = searchTerm.toLowerCase();
    return emergency.type.toLowerCase().includes(searchLower) ||
           emergency.location.toLowerCase().includes(searchLower) ||
           (emergency.description && emergency.description.toLowerCase().includes(searchLower));
  }) || [];
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const canCreateEmergency = user?.role === 'dispatcher' || user?.role === 'admin';
  
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
          <h2>Failed to load emergencies</h2>
        </div>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Emergencies</h1>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search emergencies..."
              className="pl-8 w-full sm:w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {canCreateEmergency && (
            <Button
              onClick={() => navigate('/emergencies/create')}
              className="bg-emergency-600 hover:bg-emergency-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="list" className="mt-0">
              <EmergencyList emergencies={filteredEmergencies} />
            </TabsContent>
            
            <TabsContent value="map" className="mt-0">
              <div className="h-[500px] rounded-md overflow-hidden bg-muted/20">
                <EmergencyMap />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Emergencies;
