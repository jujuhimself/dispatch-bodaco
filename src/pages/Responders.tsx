
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Search } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { fetchResponders } from '@/services/emergency-service';
import { Responder } from '@/types/emergency-types';
import { Badge } from '@/components/ui/badge';

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
    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = responder.name.toLowerCase().includes(searchLower) || 
                         responder.type.toLowerCase().includes(searchLower) ||
                         (responder.phone && responder.phone.includes(searchTerm)) ||
                         (responder.current_location && responder.current_location.toLowerCase().includes(searchLower));
    
    // Filter by tab
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && responder.status === activeTab;
  }) || [];
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Count responders by status for the tab badges
  const responderCounts = {
    all: data?.length || 0,
    available: data?.filter(r => r.status === 'available').length || 0,
    on_call: data?.filter(r => r.status === 'on_call').length || 0,
    off_duty: data?.filter(r => r.status === 'off_duty').length || 0,
  };
  
  // Format the date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get responder type display
  const getResponderTypeDisplay = (type: string) => {
    switch (type) {
      case 'ambulance':
        return 'Ambulance';
      case 'bajaj':
        return 'Bajaj';
      case 'traffic':
        return 'Traffic Police';
      default:
        return type;
    }
  };
  
  // Get status badge styling
  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'on_call':
        return <Badge className="bg-orange-500">On Call</Badge>;
      case 'off_duty':
        return <Badge className="bg-gray-500">Off Duty</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          <h2>Failed to load responders</h2>
        </div>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Responders</h1>
        
        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search responders..."
            className="pl-8 w-full sm:w-64"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge className="ml-2 bg-gray-500">{responderCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="available">
                Available
                <Badge className="ml-2 bg-green-500">{responderCounts.available}</Badge>
              </TabsTrigger>
              <TabsTrigger value="on_call">
                On Call
                <Badge className="ml-2 bg-orange-500">{responderCounts.on_call}</Badge>
              </TabsTrigger>
              <TabsTrigger value="off_duty">
                Off Duty
                <Badge className="ml-2 bg-gray-500">{responderCounts.off_duty}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden">
            <TabsContent value="all">
              {/* Content rendered in the main component */}
            </TabsContent>
            <TabsContent value="available">
              {/* Content rendered in the main component */}
            </TabsContent>
            <TabsContent value="on_call">
              {/* Content rendered in the main component */}
            </TabsContent>
            <TabsContent value="off_duty">
              {/* Content rendered in the main component */}
            </TabsContent>
          </Tabs>
          
          {filteredResponders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No responders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResponders.map((responder) => (
                    <tr key={responder.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{responder.name}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                        {getResponderTypeDisplay(responder.type)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                        {responder.phone || 'N/A'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {getStatusBadge(responder.status)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                        {responder.current_location || 'Unknown'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(responder.last_active)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Responders;
