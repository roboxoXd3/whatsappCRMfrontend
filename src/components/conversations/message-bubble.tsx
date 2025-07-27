'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bot, User, Zap } from 'lucide-react';
import { Message } from '@/lib/types/conversations';
import { cn } from '@/lib/utils';
import { DetailedMessageStatus } from './message-status-indicator';

interface MessageBubbleProps {
  message: Message;
  className?: string;
  showDetailedStatus?: boolean;
}

export function MessageBubble({ 
  message, 
  className,
  showDetailedStatus = true 
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isHuman = message.role === 'human';
  const isBot = message.metadata?.is_from_bot ?? (message.role === 'assistant');
  
  // Detect handover confirmation messages
  const isHandoverMessage = isBot && (
    message.content.includes('Bot mode: OFF') ||
    message.content.includes('Human mode: ON')
  );

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getAbsoluteTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl group",
      (isUser || isHuman) ? "flex-row-reverse" : "flex-row",
      className
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
        isUser ? "bg-blue-500" : isHuman ? "bg-purple-500" : "bg-green-500"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isHuman ? (
          <Zap className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        (isUser || isHuman) ? "items-end" : "items-start"
      )}>
        {/* Header with sender info and timestamp */}
        <div className={cn(
          "flex items-center gap-2 mb-1",
          (isUser || isHuman) ? "justify-end" : "justify-start"
        )}>
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'Customer' : isHuman ? 'Human Agent' : 'AI Assistant'}
          </span>
          <span 
            className="text-xs text-gray-500 cursor-help"
            title={getAbsoluteTime(message.timestamp)}
          >
            {formatTime(message.timestamp)}
          </span>
          
          {/* Context indicators */}
          {message.metadata?.customer_context_used && (
            <span 
              className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded"
              title="Response used customer context"
            >
              Personalized
            </span>
          )}
          
          {message.metadata?.response_time_ms && (
            <span 
              className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              title={`Response time: ${message.metadata.response_time_ms}ms`}
            >
              {message.metadata.response_time_ms < 1000 ? 'Fast' : 'Normal'}
            </span>
          )}
        </div>
        
        {/* Message bubble */}
        <div className={cn(
          "rounded-lg px-4 py-3 max-w-2xl relative",
          isUser 
            ? "bg-blue-500 text-white ml-auto" 
            : isHuman
            ? "bg-purple-500 text-white ml-auto"
            : isHandoverMessage
            ? "bg-amber-50 text-amber-800 border border-amber-200 mr-auto"
            : "bg-gray-100 text-gray-900 mr-auto"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Message status for sent messages */}
          {!isUser && showDetailedStatus && (
            <div className="flex items-center justify-end mt-2 pt-1 border-t border-gray-200">
              <DetailedMessageStatus 
                status={message.status}
                timestamps={message.timestamps}
                className="opacity-70"
              />
            </div>
          )}
        </div>
        
        {/* External status indicator for user messages */}
        {!isUser && showDetailedStatus && (
          <div className={cn(
            "flex mt-1 text-xs",
            (isUser || isHuman) ? "justify-end mr-2" : "justify-start ml-2"
          )}>
            <DetailedMessageStatus 
              status={message.status}
              timestamps={message.timestamps}
            />
          </div>
        )}
        
        {/* Message ID for debugging (only in development) */}
        {process.env.NODE_ENV === 'development' && message.message_id && (
          <div className="text-xs text-gray-400 mt-1 font-mono">
            ID: {message.message_id}
          </div>
        )}
      </div>
    </div>
  );
} 