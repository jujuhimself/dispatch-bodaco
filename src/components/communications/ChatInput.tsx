
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, X, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, attachmentUrl?: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, placeholder = "Type a message...", disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (message.trim() === '' && !attachment) return;
    
    setIsSending(true);
    try {
      // In a real app, we'd upload the attachment to storage
      // For now, just simulate it with a delay
      let attachmentUrl = undefined;
      if (attachment) {
        setIsUploading(true);
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        attachmentUrl = URL.createObjectURL(attachment);
        setIsUploading(false);
      }
      
      await onSendMessage(message, attachmentUrl);
      setMessage('');
      setAttachment(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className="border-t p-3 bg-background">
      {attachment && (
        <div className="flex items-center mb-2 p-2 bg-muted rounded-md">
          <span className="text-sm truncate flex-1">{attachment.name}</span>
          <Button variant="ghost" size="sm" onClick={removeAttachment} disabled={isUploading || isSending}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none pr-10"
            disabled={disabled || isSending}
          />
          <label htmlFor="file-upload" className="absolute right-3 bottom-3 cursor-pointer text-gray-500 hover:text-gray-700">
            <Paperclip className="h-5 w-5" />
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleAttachment}
              disabled={disabled || isSending || !!attachment}
            />
          </label>
        </div>
        <Button 
          onClick={handleSend} 
          disabled={disabled || isSending || (message.trim() === '' && !attachment)} 
          className="h-10"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
