'use client';

import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusIndicatorProps {
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
  className?: string;
  showTooltip?: boolean;
}

export function MessageStatusIndicator({ 
  status, 
  timestamp, 
  className,
  showTooltip = true 
}: MessageStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-600" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      case 'failed':
        return 'Failed to send';
      default:
        return '';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs",
      className
    )}>
      {showTooltip ? (
        <div 
          className="flex items-center gap-1"
          title={`${getStatusText()}${timestamp ? ` at ${formatTimestamp(timestamp)}` : ''}`}
        >
          {getStatusIcon()}
          {timestamp && (
            <span className="text-gray-500">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
      ) : (
        <>
          {getStatusIcon()}
          {timestamp && (
            <span className="text-gray-500">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Enhanced status indicator with all timestamps
interface DetailedMessageStatusProps {
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamps?: {
    sent_at?: string;
    delivered_at?: string;
    read_at?: string;
  };
  className?: string;
}

export function DetailedMessageStatus({ 
  status, 
  timestamps, 
  className 
}: DetailedMessageStatusProps) {
  const getRelevantTimestamp = () => {
    switch (status) {
      case 'read':
        return timestamps?.read_at;
      case 'delivered':
        return timestamps?.delivered_at;
      case 'sent':
        return timestamps?.sent_at;
      default:
        return undefined;
    }
  };

  return (
    <MessageStatusIndicator 
      status={status}
      timestamp={getRelevantTimestamp()}
      className={className}
      showTooltip={true}
    />
  );
} 