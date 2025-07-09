
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Users } from 'lucide-react';
import { fetchRecentCommunications, sendCommunication, subscribeToMessages } from '@/services/emergency-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const RealTimeChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['recent-communications'],
    queryFn: () => fetchRecentCommunications(),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) => 
      sendCommunication(messageText, user?.name || user?.email || 'Unknown User'),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['recent-communications'] });
      // Scroll to bottom after sending
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = subscribeToMessages((payload) => {
      console.log('New message received:', payload);
      setIsConnected(true);
      queryClient.invalidateQueries({ queryKey: ['recent-communications'] });
    });

    // Set connection status
    setIsConnected(true);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [queryClient]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Emergency Communications
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {messages.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {messages.map((msg) => {
                const isCurrentUser = msg.sender === (user?.name || user?.email);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {msg.sender}
                        </span>
                        <span className={`text-xs ${
                          isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.type && msg.type !== 'message' && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {msg.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending || !user}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sendMessageMutation.isPending || !message.trim() || !user}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {!user && (
            <p className="text-xs text-gray-500 mt-1">
              Please sign in to send messages
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
