'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Conversation } from '@/lib/types/api';
import { cn } from '@/lib/utils';
import { 
  Bot, 
  User, 
  AlertTriangle, 
  Clock, 
  MessageCircle, 
  Phone,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface EnhancedConversationItemProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
  isSelected?: boolean;
  className?: string;
}

export function EnhancedConversationItem({ 
  conversation, 
  onClick, 
  isSelected = false,
  className 
}: EnhancedConversationItemProps) {
  const { 
    contact, 
    last_message_preview, 
    last_message_at, 
    unread_count, 
    bot_enabled,
    handover_requested,
    handover_timestamp,
    last_message_role
  } = conversation;

  // Determine conversation status
  const getConversationStatus = () => {
    if (handover_requested && !bot_enabled) {
      return {
        type: 'handover_active',
        label: 'Human Agent Active',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: User,
        description: 'Customer is speaking with human agent'
      };
    }
    if (handover_requested && bot_enabled) {
      return {
        type: 'handover_pending',
        label: 'Handover Requested',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: AlertTriangle,
        description: 'Customer requested human support'
      };
    }
    if (bot_enabled) {
      return {
        type: 'bot_active',
        label: 'AI Assistant',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Bot,
        description: 'Handled by AI assistant'
      };
    }
    return {
      type: 'human_only',
      label: 'Human Only',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: User,
      description: 'Human-only conversation'
    };
  };

  const status = getConversationStatus();
  const StatusIcon = status.icon;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };

  const getUrgencyLevel = () => {
    if (handover_requested) {
      const handoverTime = handover_timestamp ? new Date(handover_timestamp) : new Date();
      const minutesSinceHandover = Math.floor((new Date().getTime() - handoverTime.getTime()) / 60000);
      
      if (minutesSinceHandover > 60) return 'critical';
      if (minutesSinceHandover > 30) return 'high';
      if (minutesSinceHandover > 10) return 'medium';
      return 'normal';
    }
    return 'normal';
  };

  const urgency = getUrgencyLevel();

  return (
    <Card
      className={cn(
        'relative cursor-pointer border transition-all duration-200 hover:shadow-md',
        {
          'ring-2 ring-blue-500 border-blue-200 bg-blue-50': isSelected,
          'border-red-200 bg-red-50': urgency === 'critical',
          'border-orange-200 bg-orange-50': urgency === 'high',
          'border-yellow-200 bg-yellow-50': urgency === 'medium',
          'hover:bg-gray-50': urgency === 'normal' && !isSelected,
        },
        className
      )}
      onClick={() => onClick?.(conversation)}
    >
      {/* Urgency Indicator */}
      {urgency !== 'normal' && (
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          {
            'bg-red-500': urgency === 'critical',
            'bg-orange-500': urgency === 'high',
            'bg-yellow-500': urgency === 'medium',
          }
        )} />
      )}

      {/* Handover Alert Banner */}
      {handover_requested && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-t-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Customer Requested Human Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{handover_timestamp ? formatTimeAgo(handover_timestamp) : 'Just now'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Contact Avatar */}
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                  {contact.name?.charAt(0) || contact.phone_number.slice(-2)}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <div className={cn(
                'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center',
                status.color
              )}>
                <StatusIcon className="w-3 h-3" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {contact.name || 'Unknown Contact'}
                </h3>
                <Badge className={status.color} variant="outline" size="sm">
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{contact.phone_number}</span>
                {contact.lead_score && (
                  <>
                    <span>•</span>
                    <span>Score: {contact.lead_score}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Time & Unread */}
          <div className="flex items-center space-x-2">
            {unread_count && unread_count > 0 && (
              <Badge className="bg-red-500 text-white" variant="default">
                {unread_count}
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {formatTimeAgo(last_message_at)}
            </span>
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className={cn(
              'w-2 h-2 rounded-full mt-2 flex-shrink-0',
              {
                'bg-blue-500': last_message_role === 'user',
                'bg-green-500': last_message_role === 'assistant',
                'bg-orange-500': last_message_role === 'human',
              }
            )} />
            <p className="text-sm text-gray-700 line-clamp-2 flex-1">
              {last_message_preview || 'No messages yet'}
            </p>
          </div>
        </div>

        {/* Action Indicators */}
        {handover_requested && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>Urgent response required</span>
            </div>
            <div className="flex items-center space-x-1">
              {bot_enabled ? (
                <>
                  <span className="text-xs text-orange-600">Pending handover</span>
                  <ArrowRight className="w-3 h-3 text-orange-600" />
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">Agent active</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 pt-2">
          {handover_requested && bot_enabled && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Take Over
            </Button>
          )}
          <Button size="sm" variant="outline">
            <MessageCircle className="w-3 h-3 mr-1" />
            View Chat
          </Button>
          {!bot_enabled && (
            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
              <Bot className="w-3 h-3 mr-1" />
              Enable Bot
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
} 