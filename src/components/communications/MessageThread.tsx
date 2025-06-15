
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Reply, Users, Clock } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/communication-types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { fetchCommunications, sendMessage } from '@/services/communications-service';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  parentMessage: ChatMessageType;
  onClose: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ parentMessage, onClose }) => {
  const { auth } = useAuth();
  const [replies, setReplies] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReplies = async () => {
      try {
        const threadReplies = await fetchCommunications(
          parentMessage.emergency_id || undefined,
          parentMessage.responder_id || undefined,
          parentMessage.id
        );
        setReplies(threadReplies);
      } catch (error) {
        console.error('Error loading thread replies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReplies();
  }, [parentMessage.id, parentMessage.emergency_id, parentMessage.responder_id]);

  const handleSendReply = async (messageText: string, attachmentUrl?: string) => {
    const senderName = auth?.name || "Dispatcher";
    
    try {
      const result = await sendMessage({
        message: messageText,
        sender: senderName,
        type: 'message',
        emergency_id: parentMessage.emergency_id,
        responder_id: parentMessage.responder_id,
        parent_id: parentMessage.id,
        attachment_url: attachmentUrl
      });
      
      if (result) {
        setReplies(prev => [...prev, { ...result, isOutgoing: true }]);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Reply className="h-5 w-5" />
            Thread
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Original Message */}
        <div className="px-4 py-3 bg-muted/50 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Original Message</Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(parentMessage.sent_at), { addSuffix: true })}
            </span>
          </div>
          <div className="bg-background p-3 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{parentMessage.sender}</span>
            </div>
            <p className="text-sm">{parentMessage.message}</p>
          </div>
        </div>
        
        {/* Thread Replies */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No replies yet</p>
              <p className="text-sm">Start the conversation</p>
            </div>
          ) : (
            replies.map(reply => (
              <ChatMessage key={reply.id} message={reply} />
            ))
          )}
        </div>
        
        {/* Reply Input */}
        <ChatInput 
          onSendMessage={handleSendReply}
          placeholder="Reply to this thread..."
          disabled={loading}
        />
      </CardContent>
    </Card>
  );
};
