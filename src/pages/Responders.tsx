
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { BackNavigation } from '@/components/navigation/BackNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, Users, MapPin, Phone, Clock, Filter, Plus } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { fetchResponders } from '@/services/emergency-service';
import { Responder } from '@/types/emergency-types';
import { formatDistanceToNow } from 'date-fns';

const Responders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch responders data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['responders'],
    queryFn: fetchResponders,
  });
  
  // Filter responders based on search term and active tab
  const filteredResponders = data?.filter((responder: Responder) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = responder.name.toLowerCase().includes(searchLower) || 
                         responder.type.toLowerCase().includes(searchLower) ||
                         (responder.phone && responder.phone.includes(searchTerm)) ||
                         (responder.current_location && responder.current_location.toLowerCase().includes(searchLower));
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && responder.status === activeTab;
  }) || [];
  
  // Count responders by status for the tab badges
  const responderCounts = {
    all: data?.length || 0,
    available: data?.filter(r => r.status === 'available').length || 0,
    on_call: data?.filter(r => r.status === 'on_call').length || 0,
    off_duty: data?.filter(r => r.status === 'off_duty').length || 0,
  };
  
  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500 text-white">Available</Badge>;
      case 'on_call':
        return <Badge className="bg-orange-500 text-white">On Call</Badge>;
      case 'off_duty':
        return <Badge className="bg-gray-500 text-white">Off Duty</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ambulance':
        return <Badge className="bg-red-100 text-red-800">Ambulance</Badge>;
      case 'bajaj':
        return <Badge className="bg-blue-100 text-blue-800">Bajaj</Badge>;
      case 'traffic':
        return <Badge className="bg-orange-100 text-orange-800">Traffic Police</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <AppHeader />
        <MobileNavigation />
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
          <Loader />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <AppHeader />
        <MobileNavigation />
        <div className="container mx-auto p-4 text-center">
          <div className="flex justify-center items-center gap-2 text-red-600">
            <AlertCircle />
            <h2>Failed to load responders</h2>
          </div>
          <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <AppHeader />
      <MobileNavigation />
      
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Back Navigation */}
        <BackNavigation title="Responders Management" />
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-orange-600" />
              Responders Management
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage emergency responders in real-time</p>
          </div>
          
          <div className="flex gap-2">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Responder
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by name, type, location..."
                  className="pl-8 border-orange-200 focus:border-orange-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Responders List */}
        <Card className="border-orange-200">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-fit bg-orange-50">
                <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  All
                  <Badge variant="secondary" className="bg-orange-200">{responderCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="available" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Available
                  <Badge className="bg-green-500">{responderCounts.available}</Badge>
                </TabsTrigger>
                <TabsTrigger value="on_call" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  On Call
                  <Badge className="bg-orange-500">{responderCounts.on_call}</Badge>
                </TabsTrigger>
                <TabsTrigger value="off_duty" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Off Duty
                  <Badge className="bg-gray-500">{responderCounts.off_duty}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredResponders.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-600 mb-2">No responders found</p>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResponders.map((responder) => (
                  <Card key={responder.id} className="hover:shadow-md transition-shadow border-orange-100 hover:border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{responder.name}</h3>
                          <div className="flex gap-2 mt-1">
                            {getTypeBadge(responder.type)}
                            {getStatusBadge(responder.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {responder.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-orange-500" />
                            <span>{responder.phone}</span>
                          </div>
                        )}
                        
                        {responder.current_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-orange-500" />
                            <span>{responder.current_location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>
                            Last active: {formatDistanceToNow(new Date(responder.last_active), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-orange-100 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-orange-200 hover:bg-orange-50">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-orange-200 hover:bg-orange-50">
                          <MapPin className="h-4 w-4 mr-1"  />
                          Track
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Responders;
