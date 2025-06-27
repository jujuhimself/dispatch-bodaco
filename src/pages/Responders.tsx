import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackNavigation } from '@/components/navigation/BackNavigation';
import { User, Phone, MapPin, Clock, Shield, Search } from 'lucide-react';

interface Responder {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'off-duty';
  location: string;
  phone: string;
  lastActive: string;
  emergenciesHandled: number;
}

const mockResponders: Responder[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Paramedic',
    status: 'available',
    location: 'Downtown Station',
    phone: '+1 234 567 8901',
    lastActive: '2 minutes ago',
    emergenciesHandled: 45
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Fire Fighter',
    status: 'busy',
    location: 'Industrial District',
    phone: '+1 234 567 8902',
    lastActive: '15 minutes ago',
    emergenciesHandled: 32
  },
  {
    id: '3',
    name: 'Emily White',
    role: 'Police Officer',
    status: 'available',
    location: 'Uptown Precinct',
    phone: '+1 234 567 8903',
    lastActive: '5 minutes ago',
    emergenciesHandled: 28
  },
  {
    id: '4',
    name: 'David Brown',
    role: 'Coordinator',
    status: 'off-duty',
    location: 'Headquarters',
    phone: '+1 234 567 8904',
    lastActive: '2 hours ago',
    emergenciesHandled: 67
  },
  {
    id: '5',
    name: 'Linda Green',
    role: 'Paramedic',
    status: 'busy',
    location: 'Highway 16',
    phone: '+1 234 567 8905',
    lastActive: '25 minutes ago',
    emergenciesHandled: 41
  },
  {
    id: '6',
    name: 'Michael Blue',
    role: 'Fire Fighter',
    status: 'available',
    location: 'East Side Station',
    phone: '+1 234 567 8906',
    lastActive: '8 minutes ago',
    emergenciesHandled: 39
  },
  {
    id: '7',
    name: 'Jessica Black',
    role: 'Police Officer',
    status: 'off-duty',
    location: 'West Precinct',
    phone: '+1 234 567 8907',
    lastActive: '3 hours ago',
    emergenciesHandled: 55
  },
  {
    id: '8',
    name: 'Kevin Gray',
    role: 'Coordinator',
    status: 'available',
    location: 'Central Command',
    phone: '+1 234 567 8908',
    lastActive: '1 minute ago',
    emergenciesHandled: 72
  }
];

const RespondersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredResponders = mockResponders.filter(responder => {
    const matchesSearch = responder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         responder.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         responder.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || responder.status === statusFilter;
    const matchesRole = roleFilter === 'all' || responder.role.toLowerCase().includes(roleFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-300';
      case 'busy': return 'bg-red-100 text-red-800 border-red-300';
      case 'off-duty': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen">
      <BackNavigation />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Responder Management</h1>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <User className="h-4 w-4 mr-2" />
            Add Responder
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-orange-200 shadow-md">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search responders..."
                  className="pl-10 border-orange-200 focus:border-orange-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="off-duty">Off Duty</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="paramedic">Paramedic</SelectItem>
                  <SelectItem value="fire">Fire Fighter</SelectItem>
                  <SelectItem value="police">Police Officer</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Responders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResponders.map((responder) => (
            <Card key={responder.id} className="border-orange-200 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">{responder.name}</CardTitle>
                  <Badge className={getStatusColor(responder.status)}>
                    {responder.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2 text-orange-600" />
                  <span>{responder.role}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                  <span>{responder.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-orange-600" />
                  <span>{responder.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-orange-600" />
                  <span>Last active: {responder.lastActive}</span>
                </div>
                <div className="pt-2 border-t border-orange-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Emergencies: {responder.emergenciesHandled}
                    </span>
                    <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResponders.length === 0 && (
          <Card className="border-orange-200 shadow-md">
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responders found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RespondersPage;
