
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Radio, AlertCircle } from 'lucide-react';
import { RealTimeChat } from './RealTimeChat';
import ChatInterface from '../communications/ChatInterface';
import { useQuery } from '@tanstack/react-query';
import { fetchChannels, createChannel } from '@/services/communications-service';
import { Emergency, Responder } from '@/types/emergency-types';

interface CommunicationHubProps {
  emergency?: Emergency;
  responder?: Responder;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  emergency,
  responder
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [newChannelName, setNewChannelName] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['communication-channels', emergency?.id],
    queryFn: () => fetchChannels('emergency', emergency?.id),
  });

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    
    try {
      await createChannel({
        name: newChannelName,
        type: 'emergency',
        emergency_id: emergency?.id,
        description: `Channel for ${emergency ? emergency.type : 'general'} communication`
      });
      setNewChannelName('');
      setShowCreateChannel(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Communication Hub
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Radio className="h-3 w-3" />
              Live
            </Badge>
            {emergency && (
              <Badge variant="outline">
                {emergency.type}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="px-6 pb-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="responder">Responder</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="px-6 mt-4">
            <RealTimeChat />
          </TabsContent>

          <TabsContent value="emergency" className="px-6 mt-4">
            {emergency ? (
              <ChatInterface
                emergency={emergency}
                title={`Emergency: ${emergency.type}`}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an emergency to view communications</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="responder" className="px-6 mt-4">
            {responder ? (
              <ChatInterface
                responder={responder}
                title={`Responder: ${responder.name}`}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a responder to view communications</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quick Actions</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Broadcast Alert
              </Button>
              <Button size="sm" variant="outline">
                Emergency Call
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
