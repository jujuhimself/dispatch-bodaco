
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage as ChatMessageType } from '@/types/communication-types';
import { Card, CardContent } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendMessage, subscribeToMessages } from '@/services/communications-service';
import { ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { Emergency, Responder } from '@/types/emergency-types';

interface ChatInterfaceProps {
  emergency?: Emergency;
  responder?: Responder;
  initialMessages?: ChatMessageType[];
  title?: string;
  onNewMessage?: (message: ChatMessageType) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  emergency,
  responder,
  initialMessages = [],
  title,
  onNewMessage
}) => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Update messages when initialMessages changes
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    // Subscribe to new messages
    const subscription = subscribeToMessages((payload) => {
      const newMessage = payload.new as ChatMessageType;
      
      // Only add messages relevant to this chat context
      if (
        (emergency && newMessage.emergency_id === emergency.id) ||
        (responder && newMessage.responder_id === responder.id) ||
        (!emergency && !responder)
      ) {
        setMessages(prev => {
          // Avoid duplicate messages
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          
          // Add new message
          const updatedMessages = [...prev, {
            ...newMessage,
            isOutgoing: newMessage.sender === auth?.name || newMessage.sender === "Dispatcher"
          }];
          
          // Sort by sent_at
          return updatedMessages.sort((a, b) => 
            new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
          );
        });
        
        // Execute callback if provided
        if (onNewMessage) {
          onNewMessage(newMessage);
        }
      }
    });
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [emergency, responder, auth?.name, onNewMessage]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (messageText: string, attachmentUrl?: string) => {
    if (!messageText.trim() && !attachmentUrl) return;
    
    const senderName = auth?.name || "Dispatcher";
    
    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessageType = {
      id: tempId,
      message: messageText,
      sender: senderName,
      type: 'message',
      sent_at: new Date().toISOString(),
      emergency_id: emergency?.id || null,
      responder_id: responder?.id || null,
      parent_id: null,
      read_by_ids: [],
      attachment_url: attachmentUrl || null,
      isOutgoing: true,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      // Send message to server
      const result = await sendMessage({
        message: messageText,
        sender: senderName,
        type: 'message',
        emergency_id: emergency?.id,
        responder_id: responder?.id,
        attachment_url: attachmentUrl
      });
      
      if (result) {
        // Replace temp message with actual message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...result, isOutgoing: true, status: 'sent' } 
              : msg
          )
        );
      } else {
        // Mark as failed if no result
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, status: 'failed' } 
              : msg
          )
        );
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: 'failed' } 
            : msg
        )
      );
    }
  };
  
  return (
    <Card className="flex flex-col h-full">
      {title && (
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          {loading && <ReloadIcon className="animate-spin h-4 w-4" />}
        </div>
      )}
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation</p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
    </Card>
  );
};

export default ChatInterface;
