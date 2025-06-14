'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bot, User } from 'lucide-react';
import { Message } from '@/lib/types/api';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className={cn("flex gap-3 max-w-4xl", className)}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
        isUser ? "bg-blue-500" : "bg-green-500"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'Customer' : 'AI Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {message.status && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              message.status === 'delivered' ? "bg-green-100 text-green-700" :
              message.status === 'sent' ? "bg-blue-100 text-blue-700" :
              message.status === 'read' ? "bg-purple-100 text-purple-700" :
              message.status === 'failed' ? "bg-red-100 text-red-700" :
              "bg-gray-100 text-gray-700"
            )}>
              {message.status}
            </span>
          )}
        </div>
        
        <div className={cn(
          "rounded-lg px-4 py-3 max-w-2xl",
          isUser 
            ? "bg-blue-500 text-white ml-0" 
            : "bg-gray-100 text-gray-900"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
} 