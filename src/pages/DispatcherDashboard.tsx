import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, Clock, Map, Phone, Activity } from 'lucide-react';
import EmergencyStats from '@/components/dashboard/EmergencyStats';
import ActiveEmergencies from '@/components/dashboard/ActiveEmergencies';
import AvailableResponders from '@/components/dashboard/AvailableResponders';
import EmergencyMap from '@/components/dashboard/EmergencyMap';

const DispatcherDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dispatch Center</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Online
          </Badge>
          <Button>
            <Phone className="h-4 w-4 mr-2" />
            Emergency Line
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <EmergencyStats />

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Active Incidents</h3>
            <p className="text-2xl font-bold text-destructive">12</p>
            <p className="text-sm text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Available Units</h3>
            <p className="text-2xl font-bold text-primary">24</p>
            <p className="text-sm text-muted-foreground">Ready for dispatch</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Avg Response</h3>
            <p className="text-2xl font-bold text-orange-600">4.2m</p>
            <p className="text-sm text-muted-foreground">Current average time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Map className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Coverage Areas</h3>
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-sm text-muted-foreground">Zones monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Emergencies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Active Emergencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveEmergencies />
          </CardContent>
        </Card>

        {/* Available Responders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvailableResponders />
          </CardContent>
        </Card>
      </div>

      {/* Emergency Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Live Emergency Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmergencyMap />
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatcherDashboard;