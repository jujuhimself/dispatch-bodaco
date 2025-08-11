
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Emergency, EmergencyAssignment } from '@/types/emergency-types';
import { format, parseISO } from 'date-fns';
import { Ambulance, Clock, MapPin, MessageCircle, User, AlertTriangle, Phone, CheckCircle2 } from 'lucide-react';

interface EmergencyTimelineProps {
  emergency: Emergency;
  assignments?: EmergencyAssignment[];
  communications?: any[]; // Using any for now, could define a proper type
}

const EmergencyTimeline: React.FC<EmergencyTimelineProps> = ({
  emergency,
  assignments = [],
  communications = []
}) => {
  // Create a combined timeline of events
  const createTimeline = () => {
    const timeline = [];
    
    // Add emergency creation
    timeline.push({
      id: 'emergency-created',
      type: 'emergency-reported',
      title: 'Emergency Reported',
      description: `${emergency.type} emergency reported`,
      timestamp: emergency.reported_at,
      icon: AlertTriangle,
      iconColor: 'text-emergency-600',
      location: emergency.location
    });
    
    // Add assignments
    assignments.forEach(assignment => {
      timeline.push({
        id: `assignment-${assignment.id}`,
        type: 'responder-assigned',
        title: 'Responder Assigned',
        description: assignment.responder ? `${assignment.responder.name} assigned` : 'Responder assigned',
        timestamp: assignment.assigned_at,
        icon: Ambulance,
        iconColor: 'text-blue-600',
        responder: assignment.responder?.name,
        notes: assignment.notes
      });
    });
    
    // Add communications
    communications.forEach(comm => {
      timeline.push({
        id: `comm-${comm.id}`,
        type: 'communication',
        title: 'Communication',
        description: comm.message,
        timestamp: comm.sent_at,
        icon: MessageCircle,
        iconColor: 'text-green-600',
        sender: comm.sender
      });
    });
    
    // Add status changes
    if (emergency.assigned_at) {
      timeline.push({
        id: 'status-assigned',
        type: 'status-change',
        title: 'Status Updated',
        description: 'Emergency status changed to Assigned',
        timestamp: emergency.assigned_at,
        icon: User,
        iconColor: 'text-yellow-600'
      });
    }
    
    if (emergency.resolved_at) {
      timeline.push({
        id: 'status-resolved',
        type: 'status-change',
        title: 'Emergency Resolved',
        description: 'Emergency has been resolved',
        timestamp: emergency.resolved_at,
        icon: CheckCircle2,
        iconColor: 'text-green-600'
      });
    }
    
    // Sort by timestamp
    return timeline.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  };

  const timeline = createTimeline();

  const formatTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'MMM d, h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (type: string) => {
    switch(type) {
      case 'emergency-reported':
        return <Badge className="bg-emergency-600">Reported</Badge>;
      case 'responder-assigned':
        return <Badge className="bg-blue-600">Assignment</Badge>;
      case 'communication':
        return <Badge className="bg-green-600">Communication</Badge>;
      case 'status-change':
        return <Badge className="bg-yellow-600">Status Update</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Emergency Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {timeline.length > 0 ? (
            timeline.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline connector */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
                )}
                
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                    <event.icon className={`h-4 w-4 ${event.iconColor}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-muted/30 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        {getStatusBadge(event.type)}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(event.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-sm">{event.description}</p>
                    
                    {/* Extra details */}
                    <div className="mt-2 flex flex-col space-y-1">
                      {event.location && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.responder && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          {event.responder}
                        </div>
                      )}
                      
                      {event.sender && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          {event.sender}
                        </div>
                      )}
                      
                      {event.notes && (
                        <div className="bg-muted/50 p-2 rounded-sm text-xs mt-2">
                          {event.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              <p>No timeline events available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyTimeline;
