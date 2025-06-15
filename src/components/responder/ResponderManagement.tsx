
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MapPin, Phone, Clock, Activity, Search, Filter } from 'lucide-react';
import { fetchResponders, getActiveResponders } from '@/services/emergency-service';
import { Responder } from '@/types/emergency-types';
import { formatDistanceToNow } from 'date-fns';

export const ResponderManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: allResponders = [], isLoading: loadingAll } = useQuery({
    queryKey: ['responders'],
    queryFn: fetchResponders,
    refetchInterval: 30000,
  });

  const { data: activeResponders = [], isLoading: loadingActive } = useQuery({
    queryKey: ['active-responders'],
    queryFn: getActiveResponders,
    refetchInterval: 15000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on_call': return 'bg-orange-100 text-orange-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ambulance': return 'bg-red-100 text-red-800';
      case 'bajaj': return 'bg-green-100 text-green-800';
      case 'traffic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterResponders = (responders: Responder[]) => {
    return responders.filter(responder => {
      const matchesSearch = responder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           responder.current_location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || responder.status === statusFilter;
      const matchesType = typeFilter === 'all' || responder.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const ResponderCard = ({ responder }: { responder: Responder }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium">{responder.name}</h4>
            <p className="text-sm text-gray-600">{responder.phone}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(responder.status)}>
              {responder.status.replace('_', ' ')}
            </Badge>
            <Badge className={getTypeColor(responder.type)}>
              {responder.type}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          {responder.current_location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              {responder.current_location}
            </div>
          )}
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            Last active: {formatDistanceToNow(new Date(responder.last_active), { addSuffix: true })}
          </div>
          
          {responder.status === 'available' && (
            <div className="flex items-center text-green-600">
              <Activity className="h-4 w-4 mr-2" />
              Ready for assignment
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Track
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ResponderList = ({ responders, loading }: { responders: Responder[]; loading: boolean }) => {
    const filteredResponders = filterResponders(responders);
    
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading responders...</p>
        </div>
      );
    }
    
    if (filteredResponders.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No responders found matching your criteria</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResponders.map((responder) => (
          <ResponderCard key={responder.id} responder={responder} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Responder Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search responders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on_call">On Call</SelectItem>
                <SelectItem value="off_duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ambulance">Ambulance</SelectItem>
                <SelectItem value="bajaj">Bajaj</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Responder Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Responders</TabsTrigger>
          <TabsTrigger value="all">All Responders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <ResponderList responders={activeResponders} loading={loadingActive} />
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <ResponderList responders={allResponders} loading={loadingAll} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
