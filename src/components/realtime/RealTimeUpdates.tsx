
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealTimeEvent {
  id: string;
  type: 'emergency' | 'responder' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

export const RealTimeUpdates = () => {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // Set up real-time subscriptions
    const emergencyChannel = supabase
      .channel('emergency-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'emergencies'
      }, (payload) => {
        const emergencyData = payload.new as any;
        const emergencyType = emergencyData?.type || 'Unknown';
        const emergencyPriority = emergencyData?.priority || 3;
        
        const newEvent: RealTimeEvent = {
          id: `emergency-${Date.now()}`,
          type: 'emergency',
          title: 'Emergency Update',
          description: `Emergency ${payload.eventType}: ${emergencyType}`,
          timestamp: new Date(),
          priority: emergencyPriority > 3 ? 'critical' : 'high',
          data: payload
        };
        
        setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
        
        if (payload.eventType === 'INSERT') {
          toast.error(`New Emergency: ${emergencyType}`, {
            description: `Location: ${emergencyData?.location || 'Unknown location'}`
          });
        }
      })
      .subscribe((status) => {
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'connecting');
        setIsConnected(status === 'SUBSCRIBED');
      });

    const responderChannel = supabase
      .channel('responder-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'responders'
      }, (payload) => {
        const responderData = payload.new as any;
        const responderName = responderData?.name || 'Unknown';
        const responderStatus = responderData?.status || 'unknown';
        
        const newEvent: RealTimeEvent = {
          id: `responder-${Date.now()}`,
          type: 'responder',
          title: 'Responder Update',
          description: `Responder ${responderName} status: ${responderStatus}`,
          timestamp: new Date(),
          priority: 'medium',
          data: payload
        };
        
        setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      })
      .subscribe();

    // Simulate system events
    const systemInterval = setInterval(() => {
      const systemEvent: RealTimeEvent = {
        id: `system-${Date.now()}`,
        type: 'system',
        title: 'System Health Check',
        description: 'All systems operational',
        timestamp: new Date(),
        priority: 'low'
      };
      
      setEvents(prev => [systemEvent, ...prev.slice(0, 19)]);
    }, 30000);

    return () => {
      emergencyChannel.unsubscribe();
      responderChannel.unsubscribe();
      clearInterval(systemInterval);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'responder': return <Users className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Real-Time Updates</CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {connectionStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent updates</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{event.title}</h4>
                    <Badge variant={getPriorityColor(event.priority)} className="text-xs">
                      {event.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
