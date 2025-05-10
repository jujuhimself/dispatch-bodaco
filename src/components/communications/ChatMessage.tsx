
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Phone, MessageCircle, AlertCircle, Paperclip, Check, CheckCheck } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/communication-types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isOutgoing = message.isOutgoing || false;
  const getMessageIcon = () => {
    switch (message.type) {
      case 'message':
        return <MessageSquare className="h-3 w-3" />;
      case 'voice':
        return <Phone className="h-3 w-3" />;
      case 'whatsapp':
        return <MessageCircle className="h-3 w-3" />;
      case 'system':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getMessageStyle = () => {
    switch (message.type) {
      case 'message':
        return 'bg-gray-100 text-gray-600';
      case 'voice':
        return 'bg-blue-100 text-blue-600';
      case 'whatsapp':
        return 'bg-green-100 text-green-600';
      case 'system':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <span className="text-gray-400">•••</span>;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOutgoing ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
        {!isOutgoing && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>{message.sender.charAt(0).toUpperCase()}</AvatarFallback>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.sender}`} />
          </Avatar>
        )}
        
        <div className={`${isOutgoing ? 'mr-2' : 'ml-2'}`}>
          <div className={`flex items-center ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
            {!isOutgoing && <span className="text-xs font-semibold">{message.sender}</span>}
            <span className="text-xs text-gray-400 ml-2">
              {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
            </span>
          </div>
          
          <div className={`mt-1 p-3 rounded-lg ${
            isOutgoing 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            <div className="flex items-start gap-2">
              {!isOutgoing && (
                <span className={`p-1 rounded-full mr-1 ${getMessageStyle()}`}>
                  {getMessageIcon()}
                </span>
              )}
              <div>
                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                {message.attachment_url && (
                  <div className="mt-2 flex items-center text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    <a 
                      href={message.attachment_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate max-w-[150px]"
                    >
                      Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isOutgoing && (
            <div className="flex justify-end mt-1">
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
