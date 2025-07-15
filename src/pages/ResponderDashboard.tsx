import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation, Clock, CheckCircle, AlertTriangle, MapPin, Radio } from 'lucide-react';

const ResponderDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Responder Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Available
          </Badge>
          <Button>
            <Radio className="h-4 w-4 mr-2" />
            Check In
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Active Assignments</h3>
            <p className="text-2xl font-bold text-destructive">2</p>
            <p className="text-sm text-muted-foreground">Current incidents</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">On Duty Time</h3>
            <p className="text-2xl font-bold text-orange-600">6h 23m</p>
            <p className="text-sm text-muted-foreground">Today's shift</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Completed</h3>
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Navigation className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Response Time</h3>
            <p className="text-2xl font-bold text-primary">3.8m</p>
            <p className="text-sm text-muted-foreground">Average this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Current Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="destructive">High Priority</Badge>
                <span className="text-sm text-muted-foreground">Assigned 12 min ago</span>
              </div>
              <h4 className="font-semibold mb-1">Vehicle Accident - I-95 Northbound</h4>
              <p className="text-sm text-muted-foreground mb-3">Mile marker 147, multiple vehicles involved</p>
              <div className="flex gap-2">
                <Button size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
                <Button size="sm" variant="outline">Update Status</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Medium Priority</Badge>
                <span className="text-sm text-muted-foreground">Assigned 28 min ago</span>
              </div>
              <h4 className="font-semibold mb-1">Medical Emergency - Residential</h4>
              <p className="text-sm text-muted-foreground mb-3">1247 Oak Street, chest pain reported</p>
              <div className="flex gap-2">
                <Button size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
                <Button size="sm" variant="outline">Update Status</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Mark Available</h3>
            <p className="text-sm text-muted-foreground">Signal ready for new assignments</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Request Backup</h3>
            <p className="text-sm text-muted-foreground">Call for additional assistance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Radio className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Emergency Call</h3>
            <p className="text-sm text-muted-foreground">Direct line to dispatch</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponderDashboard;