
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import {
  fetchChannels,
  fetchCommunications,
  subscribeToMessages
} from '@/services/communications-service';
import { fetchActiveEmergencies } from '@/services/emergency-service';
import {
  ChatMessage as ChatMessageType,
  CommunicationChannel,
  EmergencyWithChannel
} from '@/types/communication-types';
import { ResizablePanelGroup, ResizablePanel } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import ChannelList from '@/components/communications/ChannelList';
import ChatInterface from '@/components/communications/ChatInterface';
import CreateChannelDialog from '@/components/communications/CreateChannelDialog';
import { Badge } from '@/components/ui/badge';
import { Emergency } from '@/types/emergency-types';

const CommunicationsPage: React.FC = () => {
  const { auth } = useAuth();
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<CommunicationChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<Emergency[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('channels');
  
  // Load channels
  useEffect(() => {
    const loadChannels = async () => {
      setLoadingChannels(true);
      try {
        const result = await fetchChannels();
        setChannels(result);
        
        // Auto-select first channel if none is selected
        if (result.length > 0 && !activeChannel) {
          handleChannelSelect(result[0]);
        }
      } catch (error) {
        console.error('Error loading channels:', error);
      } finally {
        setLoadingChannels(false);
      }
    };
    
    loadChannels();
    // Also load active emergencies for creating channels
    loadActiveEmergencies();
  }, []);
  
  // Load messages for active channel
  useEffect(() => {
    if (activeChannel) {
      const loadMessages = async () => {
        setLoadingMessages(true);
        try {
          const result = await fetchCommunications(
            activeChannel.emergency_id || undefined
          );
          
          // Format messages with outgoing flag
          const formattedMessages = result.map(msg => ({
            ...msg,
            isOutgoing: msg.sender === auth?.name || msg.sender === 'Dispatcher'
          }));
          
          setMessages(formattedMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setLoadingMessages(false);
        }
      };
      
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeChannel, auth?.name]);
  
  const loadActiveEmergencies = async () => {
    try {
      const emergencies = await fetchActiveEmergencies();
      setActiveEmergencies(emergencies);
    } catch (error) {
      console.error('Error loading active emergencies:', error);
    }
  };
  
  const handleChannelSelect = (channel: CommunicationChannel) => {
    setActiveChannel(channel);
  };
  
  const handleRefresh = async () => {
    setLoadingChannels(true);
    try {
      const result = await fetchChannels();
      setChannels(result);
    } catch (error) {
      console.error('Error refreshing channels:', error);
    } finally {
      setLoadingChannels(false);
    }
    
    loadActiveEmergencies();
  };
  
  const handleNewMessage = (message: ChatMessageType) => {
    // Update the channel's last activity timestamp in the UI
    // This could be more sophisticated with unread counts, etc.
    if (message.emergency_id) {
      setChannels(prev => 
        prev.map(ch => 
          ch.emergency_id === message.emergency_id 
            ? { ...ch, updated_at: new Date().toISOString() } 
            : ch
        )
      );
    }
  };
  
  const handleChannelCreated = (channel: CommunicationChannel) => {
    setChannels(prev => [channel, ...prev]);
    // Auto-select the new channel
    handleChannelSelect(channel);
  };
  
  return (
    <>
      <Helmet>
        <title>Communications | Rapid Response Guardian</title>
      </Helmet>
      
      <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Communications Center</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingChannels}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loadingChannels ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Channel
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="channels" value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-3rem)]">
          <TabsList>
            <TabsTrigger value="channels">
              Communication Channels
              <Badge variant="outline" className="ml-2">
                {channels.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="emergencies">
              Emergency Communications
              <Badge variant="outline" className="ml-2">
                {activeEmergencies.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="h-full mt-4">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <ChannelList 
                  channels={channels}
                  activeChannelId={activeChannel?.id}
                  loading={loadingChannels}
                  onChannelSelect={handleChannelSelect}
                  onCreateChannel={() => setShowCreateDialog(true)}
                />
              </ResizablePanel>
              
              <ResizablePanel defaultSize={75}>
                {activeChannel ? (
                  <ChatInterface 
                    title={activeChannel.name}
                    initialMessages={messages}
                    emergency={activeChannel.emergency_id ? { id: activeChannel.emergency_id } as any : undefined}
                    onNewMessage={handleNewMessage}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p className="text-lg">No channel selected</p>
                    <p className="text-sm">Select a channel from the list to start communicating</p>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
          
          <TabsContent value="emergencies" className="h-full mt-4">
            {activeEmergencies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                {activeEmergencies.slice(0, 3).map((emergency) => (
                  <div key={emergency.id} className="flex flex-col h-64 md:h-full">
                    <div className="bg-red-50 p-2 rounded-t-md border border-red-100">
                      <h3 className="font-medium text-red-800">{emergency.type}</h3>
                      <p className="text-xs text-red-600">{emergency.location}</p>
                    </div>
                    <div className="flex-1 border border-t-0 rounded-b-md overflow-hidden">
                      <ChatInterface
                        emergency={emergency}
                        onNewMessage={handleNewMessage}
                      />
                    </div>
                  </div>
                ))}
                
                {activeEmergencies.length > 3 && (
                  <div className="h-64 md:h-full flex items-center justify-center border rounded-md p-4">
                    <Button onClick={() => setActiveTab('channels')}>
                      View All Emergency Channels
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-lg">No active emergencies</p>
                <p className="text-sm">Active emergencies will appear here when they are reported</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <CreateChannelDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onChannelCreated={handleChannelCreated}
          emergencies={activeEmergencies}
        />
      </div>
    </>
  );
};

export default CommunicationsPage;
