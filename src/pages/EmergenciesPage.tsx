
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FilePlus, Filter, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEmergencies } from '@/services/emergency-service';
import EmergencyList from '@/components/emergencies/EmergencyList';
import EmergencyFilters from '@/components/emergencies/EmergencyFilters';
import { BackNavigation } from '@/components/navigation/BackNavigation';
import { toast } from 'sonner';
import { Emergency } from '@/types/emergency-types';

const EmergenciesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const { 
    data: emergencies,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['emergencies'],
    queryFn: fetchEmergencies,
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const filterEmergencies = useCallback((data: Emergency[] | undefined): Emergency[] => {
    if (!data) return [];
    
    return data.filter(emergency => {
      // First apply active tab filter
      if (activeTab === 'all') {
        // Continue with other filters
      } else if (activeTab === 'active') {
        if (!['pending', 'assigned', 'in_transit', 'on_site'].includes(emergency.status)) {
          return false;
        }
      } else if (activeTab === 'pending') {
        if (emergency.status !== 'pending') return false;
      } else if (activeTab === 'resolved') {
        if (emergency.status !== 'resolved') return false;
      }
      
      // Search query filter
      if (searchQuery && !emergency.type.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !emergency.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(emergency.description?.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && !emergency.type.toLowerCase().includes(typeFilter.toLowerCase())) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && emergency.priority !== parseInt(priorityFilter)) {
        return false;
      }
      
      return true;
    });
  }, [activeTab, searchQuery, typeFilter, priorityFilter]);
  
  const filteredEmergencies = filterEmergencies(emergencies);
  
  const handleApplyFilters = () => {
    toast.success("Filters applied");
  };
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setPriorityFilter('all');
    toast.success("Filters reset");
  };
  
  const handleRefresh = () => {
    refetch();
    toast.success("Emergency list refreshed");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <BackNavigation title="Emergency Management" />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Management</h1>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-orange-200 hover:bg-orange-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="border-orange-200 hover:bg-orange-50"
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline-block">Refresh</span>
            </Button>
            
            <Link to="/emergency/create">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <FilePlus className="h-4 w-4 mr-2" />
                New Emergency
              </Button>
            </Link>
          </div>
        </div>
        
        {showFilters && (
          <EmergencyFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            applyFilters={handleApplyFilters}
            resetFilters={handleResetFilters}
          />
        )}
        
        <Card className="border-orange-200 shadow-md">
          <CardHeader className="pb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 bg-orange-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Active</TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Pending</TabsTrigger>
                <TabsTrigger value="resolved" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Resolved</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <h3 className="text-lg font-medium">Error loading emergencies</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {error instanceof Error ? error.message : 'An unknown error occurred'}
                </p>
                <Button onClick={() => refetch()} className="bg-orange-600 hover:bg-orange-700">Try Again</Button>
              </div>
            ) : filteredEmergencies.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p className="mb-4">No emergencies found matching your criteria</p>
                {(searchQuery || typeFilter !== 'all' || priorityFilter !== 'all') && (
                  <Button variant="outline" onClick={handleResetFilters} className="border-orange-200 hover:bg-orange-50">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <EmergencyList emergencies={filteredEmergencies} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergenciesPage;
