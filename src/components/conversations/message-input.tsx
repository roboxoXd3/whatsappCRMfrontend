'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, Smile, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/hooks/useConversations';
import { cleanPhoneForAPI } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  recipientPhone: string;
  onMessageSent?: (sentMessage: string) => void;
  onMessageFailed?: () => void;
  disabled?: boolean;
}

export function MessageInput({ 
  recipientPhone, 
  onMessageSent,
  onMessageFailed,
  disabled = false 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessageMutation = useSendMessage();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sendMessageMutation.isPending) return;

    try {
      // Clean phone number format for API
      const cleanPhone = cleanPhoneForAPI(recipientPhone);
      
      console.log('Original phone:', recipientPhone);
      console.log('Cleaned phone:', cleanPhone);
      console.log('Sending message:', trimmedMessage);
      
      // Call onMessageSent immediately for optimistic update
      onMessageSent?.(trimmedMessage);
      
      await sendMessageMutation.mutateAsync({
        phone_number: cleanPhone,
        message: trimmedMessage,
      });
      
      setMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds
      
      // Focus back to input
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      console.error('Error details:', error);
      
      // Call onMessageFailed if the API call fails
      onMessageFailed?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isLoading = sendMessageMutation.isPending;
  const canSend = message.trim().length > 0 && !isLoading && !disabled;

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex items-end gap-3">
        {/* Attachment button (future enhancement) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Conversation is closed" : "Type a message..."}
            disabled={disabled || isLoading}
            className={cn(
              "w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 resize-none",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "placeholder:text-gray-400 text-gray-900 text-sm leading-relaxed",
              "min-h-[44px] max-h-[120px] bg-white",
              disabled && "bg-gray-50 cursor-not-allowed text-gray-500",
              isLoading && "opacity-50"
            )}
            rows={1}
          />
          
          {/* Emoji button (future enhancement) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          type="submit"
          size="sm"
          disabled={!canSend}
          className={cn(
            "flex-shrink-0 rounded-full w-10 h-10 p-0",
            canSend 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Message sent successfully!
        </div>
      )}

      {/* Error message */}
      {sendMessageMutation.error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {sendMessageMutation.error instanceof Error 
            ? sendMessageMutation.error.message 
            : 'Failed to send message. Please try again.'
          }
        </div>
      )}

      {/* Character count (optional) */}
      {message.length > 500 && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          {message.length}/1000 characters
        </div>
      )}
    </form>
  );
} 