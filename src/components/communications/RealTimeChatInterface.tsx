import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  MessageSquare, 
  Users, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCommunications, sendMessage, subscribeToMessages } from '@/services/communications-service';
import { Communication } from '@/types/communication-types';
import { Emergency, Responder } from '@/types/emergency-types';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  emergency?: Emergency;
  responder?: Responder;
  channelId?: string;
  title?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  emergency,
  responder,
  channelId,
  title
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<Communication[]>([]);

  // Fetch communications
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications', emergency?.id, responder?.id, channelId],
    queryFn: () => fetchCommunications(emergency?.id, responder?.id),
    refetchInterval: 5000 // Fallback polling
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessage('');
      setOptimisticMessages([]);
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
    onError: (error: any) => {
      setOptimisticMessages([]);
      toast.error(error.message || 'Failed to send message');
    }
  });

  // Real-time subscription
  useEffect(() => {
    const subscription = subscribeToMessages((payload) => {
      console.log('Real-time message received:', payload);
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [queryClient]);

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    const optimisticMessage: Communication = {
      id: `temp-${Date.now()}`,
      sender: user.name || user.email || 'User',
      message: message.trim(),
      type: 'message',
      sent_at: new Date().toISOString(),
      emergency_id: emergency?.id || null,
      responder_id: responder?.id || null,
      parent_id: null,
      read_by_ids: [],
      attachment_url: null,
      status: 'sending'
    };

    setOptimisticMessages([optimisticMessage]);

    sendMessageMutation.mutate({
      sender: user.name || user.email || 'User',
      message: message.trim(),
      type: 'message',
      emergency_id: emergency?.id,
      responder_id: responder?.id
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const allMessages = [...communications, ...optimisticMessages].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
  );

  const getMessageStatus = (msg: Communication) => {
    if (msg.status === 'sending') return <Clock className="h-3 w-3 text-gray-400" />;
    if (msg.status === 'failed') return <AlertCircle className="h-3 w-3 text-red-500" />;
    return <CheckCircle2 className="h-3 w-3 text-green-500" />;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title || 'Emergency Communications'}
          </div>
          <div className="flex items-center gap-2">
            {emergency && (
              <Badge variant="destructive">
                Priority {emergency.priority}
              </Badge>
            )}
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {allMessages.length}
            </Badge>
          </div>
        </CardTitle>
        {emergency && (
          <p className="text-sm text-muted-foreground">
            {emergency.type} - {emergency.location}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs">Start the conversation</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {allMessages.map((msg) => {
                const isOwnMessage = msg.sender === (user?.name || user?.email);
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {msg.sender.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.sent_at).toLocaleTimeString()}
                        </span>
                        {isOwnMessage && getMessageStatus(msg)}
                      </div>
                      
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        } ${msg.status === 'sending' ? 'opacity-70' : ''}`}
                      >
                        {msg.message}
                      </div>
                      
                      {msg.type !== 'message' && (
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

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;