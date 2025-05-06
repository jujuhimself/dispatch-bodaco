
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PhoneCall, MapPin, Send, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchActiveEmergencies, fetchEmergencyAssignments } from '@/services/emergency-service';
import { formatDistanceToNow } from 'date-fns';

const ActiveEmergencies = () => {
  const { 
    data: emergencies, 
    isLoading: emergenciesLoading, 
    error: emergenciesError 
  } = useQuery({
    queryKey: ['activeEmergencies'],
    queryFn: fetchActiveEmergencies,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { 
    data: assignments, 
    isLoading: assignmentsLoading
  } = useQuery({
    queryKey: ['emergencyAssignments'],
    queryFn: () => fetchEmergencyAssignments(),
    refetchInterval: 30000,
  });

  const getEmergencyAssignments = (emergencyId: string) => {
    return assignments?.filter(a => a.emergency_id === emergencyId) || [];
  };

  const getTimeElapsed = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  if (emergenciesLoading || assignmentsLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Active Emergencies</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (emergenciesError) {
    console.error('Error loading emergencies:', emergenciesError);
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Active Emergencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading emergencies</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Active Emergencies</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emergencies && emergencies.length > 0 ? (
            emergencies.map((emergency) => (
              <div key={emergency.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{emergency.type}</h3>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        emergency.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        emergency.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        emergency.status === 'in_transit' ? 'bg-indigo-100 text-indigo-800' :
                        emergency.status === 'on_site' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {emergency.status.charAt(0).toUpperCase() + emergency.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {emergency.location}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {getTimeElapsed(emergency.reported_at)}
                  </span>
                </div>
                
                {getEmergencyAssignments(emergency.id).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Assigned Responders:</p>
                    {getEmergencyAssignments(emergency.id).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between bg-gray-50 p-1 px-2 rounded text-xs">
                        <span className="font-medium">{assignment.responders?.name || 'Unknown Responder'}</span>
                        <span className="text-green-600">{assignment.eta || 'Unknown ETA'}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex mt-3 space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" /> View on Map
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Send className="h-3 w-3 mr-1" /> Assign
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-emergency-600 hover:text-emergency-700 hover:bg-emergency-50">
                    <PhoneCall className="h-3 w-3 mr-1" /> Call
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No active emergencies at the moment
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveEmergencies;
