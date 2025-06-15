
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Paperclip, 
  Send, 
  X, 
  Loader2, 
  Smile, 
  Image,
  FileText,
  Mic
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedChatInputProps {
  onSendMessage: (message: string, attachmentUrl?: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
  allowVoiceMessages?: boolean;
}

export const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({ 
  onSendMessage, 
  placeholder = "Type a message...", 
  disabled = false,
  allowAttachments = true,
  allowVoiceMessages = false
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (message.trim() === '' && attachments.length === 0) return;
    
    setIsSending(true);
    try {
      // In a real app, we'd upload attachments to storage
      let attachmentUrls: string[] = [];
      if (attachments.length > 0) {
        setIsUploading(true);
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        attachmentUrls = attachments.map(file => URL.createObjectURL(file));
        setIsUploading(false);
      }
      
      await onSendMessage(message, attachmentUrls[0]);
      setMessage('');
      setAttachments([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max size is 10MB.`);
          return false;
        }
        return true;
      });
      
      setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const commonEmojis = ['😊', '👍', '❤️', '😢', '😮', '😡', '🚨', '🚑', '🔥', '⚠️'];

  return (
    <div className="border-t p-3 bg-background">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {attachments.map((file, index) => (
            <Card key={index} className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(file)}
                  <span className="text-sm truncate max-w-48">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeAttachment(index)}
                  disabled={isUploading || isSending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Quick Emoji Bar */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto">
        {commonEmojis.map((emoji, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-base hover:bg-muted"
            onClick={() => insertEmoji(emoji)}
            disabled={disabled || isSending}
          >
            {emoji}
          </Button>
        ))}
      </div>
      
      {/* Message Input */}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[120px] resize-none pr-20"
            disabled={disabled || isSending}
          />
          
          {/* Action Buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {allowAttachments && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.txt,.doc,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={disabled || isSending || attachments.length >= 5}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isSending || attachments.length >= 5}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {allowVoiceMessages && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isRecording ? 'text-red-500' : ''}`}
                onClick={() => setIsRecording(!isRecording)}
                disabled={disabled || isSending}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleSend} 
          disabled={disabled || isSending || (message.trim() === '' && attachments.length === 0)} 
          className="h-12 px-4"
        >
          {isSending || isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Status Messages */}
      {isUploading && (
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading attachments...
        </div>
      )}
      
      {isRecording && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Recording voice message...
        </div>
      )}
    </div>
  );
};
