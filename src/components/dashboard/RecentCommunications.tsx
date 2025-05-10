
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Send, Phone, MessageSquare, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchRecentCommunications, subscribeToMessages } from '@/services/emergency-service';
import { Communication } from '@/types/emergency-types';
import { formatDistanceToNow } from 'date-fns';

const RecentCommunications = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCommunications = async () => {
      try {
        const data = await fetchRecentCommunications(4);
        setCommunications(data);
      } catch (error) {
        console.error("Error fetching communications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunications();
    
    // Subscribe to new messages
    const subscription = subscribeToMessages((payload) => {
      const newMessage = payload.new as Communication;
      setCommunications((prev) => {
        // Avoid duplicate messages
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }

        // Add to the beginning and limit to 4 entries
        return [newMessage, ...prev].slice(0, 4);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-3 w-3" />;
      case 'voice':
        return <Phone className="h-3 w-3" />;
      case 'whatsapp':
        return <MessageCircle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getCommunicationStyle = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-gray-100 text-gray-600';
      case 'voice':
        return 'bg-blue-100 text-blue-600';
      case 'whatsapp':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Recent Communications</CardTitle>
        <Link to="/communications">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : communications.length > 0 ? (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <span className={`p-1 rounded-full mr-2 ${getCommunicationStyle(comm.type)}`}>
                      {getCommunicationIcon(comm.type)}
                    </span>
                    <span className="font-medium text-sm">{comm.sender}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(comm.sent_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 pl-6">{comm.message}</p>
                <div className="flex justify-end mt-2">
                  <Link to="/communications">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      <Send className="h-3 w-3 mr-1" /> Reply
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
            <p>No recent communications</p>
            <p className="text-sm">Messages will appear here when they are received</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentCommunications;
