import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Your emergency response portal</p>
        </div>
        <Link to="/emergency/create">
          <Button className="w-full sm:w-auto">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Emergency
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Emergency Alert</h3>
            <p className="text-sm text-muted-foreground mb-4">Report a new emergency incident</p>
            <Link to="/emergency/create">
              <Button size="sm" className="w-full">Report Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Emergency Contacts</h3>
            <p className="text-sm text-muted-foreground mb-4">Access emergency phone numbers</p>
            <Button size="sm" variant="outline" className="w-full">View Contacts</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Find Services</h3>
            <p className="text-sm text-muted-foreground mb-4">Locate nearby hospitals and services</p>
            <Button size="sm" variant="outline" className="w-full">View Map</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Recent Reports</h3>
            <p className="text-sm text-muted-foreground mb-4">View your emergency reports</p>
            <Button size="sm" variant="outline" className="w-full">View History</Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-destructive">🚨 Life-Threatening Emergency</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Call 911 immediately</li>
                <li>• Provide exact location</li>
                <li>• Stay on the line with dispatcher</li>
                <li>• Follow given instructions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-orange-600">⚠️ Non-Emergency Incidents</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use the "Report Emergency" button</li>
                <li>• Provide detailed description</li>
                <li>• Include photos if safe to do so</li>
                <li>• Monitor for response updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;