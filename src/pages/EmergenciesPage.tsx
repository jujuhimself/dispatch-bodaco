
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Clock,
  User,
  Eye
} from 'lucide-react';
import { fetchAllEmergencies, Emergency } from '@/services/emergency-service';
import { LoadingState } from '@/components/ui/loading-state';
import { formatDistanceToNow } from 'date-fns';

const EmergenciesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const { data: emergencies, isLoading, error, refetch } = useQuery({
    queryKey: ['emergencies'],
    queryFn: fetchAllEmergencies,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: Emergency['status']) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on_site': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'canceled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-500 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      default: return 'Low';
    }
  };

  const filterEmergencies = (data: Emergency[]) => {
    if (!data) return [];
    
    return data.filter(emergency => {
      const matchesSearch = emergency.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emergency.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emergency.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || emergency.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || emergency.priority.toString() === priorityFilter;
      
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && ['pending', 'assigned', 'in_transit', 'on_site'].includes(emergency.status)) ||
                        (activeTab === 'resolved' && emergency.status === 'resolved');
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTab;
    });
  };

  const filteredEmergencies = filterEmergencies(emergencies);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Emergency Management</h1>
        </div>
        <LoadingState isLoading={true} variant="skeleton">
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </LoadingState>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Emergencies</h2>
          <p className="text-gray-600 mb-4">There was an error loading the emergency data.</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emergency Management</h1>
          <p className="text-gray-600">Monitor and manage all emergency situations</p>
        </div>
        <Link to="/emergency/create">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Emergency
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search emergencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="on_site">On Site</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="1">Critical</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Emergencies</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredEmergencies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Emergencies Found</h3>
                <p className="text-gray-600">No emergencies match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEmergencies.map((emergency) => (
                <Card key={emergency.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center space-x-3">
                          <Badge className={getPriorityColor(emergency.priority)}>
                            P{emergency.priority} - {getPriorityLabel(emergency.priority)}
                          </Badge>
                          <Badge className={getStatusColor(emergency.status)}>
                            {emergency.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        {/* Emergency Type and Description */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                            {emergency.type}
                          </h3>
                          {emergency.description && (
                            <p className="text-gray-600 mt-1 line-clamp-2">{emergency.description}</p>
                          )}
                        </div>

                        {/* Location and Time Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {emergency.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Reported {formatDistanceToNow(new Date(emergency.reported_at), { addSuffix: true })}
                          </div>
                          {emergency.assigned_at && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              Assigned {formatDistanceToNow(new Date(emergency.assigned_at), { addSuffix: true })}
                            </div>
                          )}
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>ID: {emergency.id.split('-')[1]}</span>
                          {emergency.coordinates && (
                            <span>Coordinates: {emergency.coordinates.y.toFixed(4)}, {emergency.coordinates.x.toFixed(4)}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Link to={`/emergency/${emergency.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        
                        {emergency.status === 'pending' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Assign
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergenciesPage;
