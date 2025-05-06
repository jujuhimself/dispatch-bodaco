
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Send } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { fetchRecentCommunications, sendCommunication } from '@/services/emergency-service';
import { Communication as CommunicationType } from '@/types/emergency-types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Communications = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch communications data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['communications'],
    queryFn: () => fetchRecentCommunications(50),
    refetchInterval: 5000 // Refetch every 5 seconds
  });
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);
  
  // Filter communications based on selected channel
  const filteredCommunications = data || [];
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    try {
      await sendCommunication(
        message,
        user.name || user.email,
        undefined, // Emergency ID could be added here in the future
        undefined  // Responder ID could be added here in the future
      );
      setMessage('');
      refetch();
    } catch (error: any) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };
  
  // Format the date
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="flex justify-center items-center gap-2 text-emergency-600">
          <AlertCircle />
          <h2>Failed to load communications</h2>
        </div>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Communications</h1>
        
        <Tabs value={channel} onValueChange={setChannel} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="responders">Responders</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Message Center</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-0">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {filteredCommunications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              filteredCommunications.map((comm) => {
                const isCurrentUser = user && (comm.sender === user.name || comm.sender === user.email);
                
                return (
                  <div 
                    key={comm.id} 
                    className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={isCurrentUser ? 'bg-emergency-100' : 'bg-blue-100'}>
                      <AvatarFallback>
                        {getInitials(comm.sender)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : ''}`}>
                      <div className={`px-3 py-2 rounded-lg ${isCurrentUser ? 
                        'bg-emergency-600 text-white' : 
                        'bg-gray-100'}`}
                      >
                        <p className="text-sm">{comm.message}</p>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                        <span className="font-medium">{comm.sender}</span>
                        <span>{formatMessageDate(comm.sent_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 items-end">
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow resize-none"
              rows={2}
            />
            <Button 
              type="submit" 
              disabled={!message.trim()}
              className="bg-emergency-600 hover:bg-emergency-700"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Communications;
