
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FilePlus, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEmergencies } from '@/services/emergency-service';
import EmergencyList from '@/components/emergencies/EmergencyList';
import EmergencyFilters from '@/components/emergencies/EmergencyFilters';
import { toast } from 'sonner';

const EmergenciesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    data: emergencies,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['emergencies'],
    queryFn: fetchEmergencies
  });

  const filteredEmergencies = emergencies?.filter(emergency => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'assigned', 'in_transit', 'on_site'].includes(emergency.status);
    }
    if (activeTab === 'pending') return emergency.status === 'pending';
    if (activeTab === 'resolved') return emergency.status === 'resolved';
    return true;
  }) || [];
  
  const handleRefresh = () => {
    refetch();
    toast.success("Emergency list refreshed");
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Emergency Management</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
          
          <Link to="/emergency/create">
            <Button
              variant="default"
              size="sm"
              className="bg-emergency-600 hover:bg-emergency-700 text-white"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              New Emergency
            </Button>
          </Link>
        </div>
      </div>
      
      {showFilters && <EmergencyFilters />}
      
      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Emergencies</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-emergency-500 mb-2" />
              <h3 className="text-lg font-medium">Error loading emergencies</h3>
              <p className="text-sm text-gray-500 mb-4">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : (
            <EmergencyList emergencies={filteredEmergencies} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergenciesPage;
