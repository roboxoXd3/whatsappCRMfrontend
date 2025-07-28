'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Phone, Clock, Tag, Bot, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/lib/types/api';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BotToggle } from '@/components/conversations/bot-toggle';
import { useBotStatus } from '@/hooks/useBotToggle';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected?: boolean;
  onClick?: (conversation: Conversation) => void;
  className?: string;
  showBotStatus?: boolean;
  lastMessage?: { content: string };
  unreadCount?: number;
}

export function ConversationItem({ 
  conversation, 
  isSelected = false,
  onClick,
  className,
  showBotStatus,
  lastMessage,
  unreadCount
}: ConversationItemProps) {
  const { contact, last_message_at, message_count, last_message_preview, status, tags } = conversation;
  
  // Get bot status for this conversation
  const { data: botStatus } = useBotStatus(conversation.id);
  
  // Use enriched contact data directly from the API (no need for separate customer context call)
  const hasEnrichedData = contact.company || contact.lead_status;
  
  // Format the enriched contact data for display
  const getDisplayName = () => {
    // Priority: verified_name > name > company > formatted phone
    if (contact.verified_name) {
      return contact.verified_name;
    }
    if (contact.name && contact.name !== contact.phone_number) {
      return contact.name;
    }
    return 'Unknown Contact';
  };
  
  const getSubtitle = () => {
    if (contact.company) {
      return contact.company;
    }
    if (contact.lead_status) {
      return `Lead Status: ${contact.lead_status}`;
    }
    return null;
  };
  
  const getLeadStatusColor = (leadStatus: string) => {
    switch (leadStatus) {
      case 'customer':
      case 'converted':
        return "bg-green-50 text-green-700 border-green-200";
      case 'contacted':
      case 'qualified':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'new':
      case 'lead':
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone formatting - can be enhanced based on requirements
    if (phone.startsWith('91') && phone.length > 10) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <div
      className={cn(
        'relative flex items-center space-x-3 px-6 py-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors',
        {
          'bg-blue-50 border-blue-200': isSelected,
          'bg-red-50 border-red-200': conversation.handover_requested, // Highlight handover requests
        },
        className
      )}
             onClick={() => onClick?.(conversation)}
    >
      {/* Handover Priority Indicator */}
      {conversation.handover_requested && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
      
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={cn(
            "bg-gray-100 text-gray-600",
            conversation.handover_requested && "bg-red-100 text-red-600"
          )}>
            {contact?.name ? contact.name.charAt(0).toUpperCase() : 
             contact?.phone_number ? contact.phone_number.slice(-2) : '?'}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className={cn(
              "text-sm font-medium text-gray-900 truncate",
              conversation.handover_requested && "text-red-900"
            )}>
              {contact?.name || contact?.phone_number || 'Unknown Contact'}
            </p>
            {conversation.handover_requested && (
              <Badge variant="destructive" className="text-xs">
                Human Support Requested
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {showBotStatus && (
              <BotToggle 
                conversationId={conversation.id} 
                                 variant="compact"
                className="scale-75"
              />
            )}
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(conversation.last_message_at || conversation.created_at), { 
                addSuffix: true 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className={cn(
            "text-sm text-gray-600 truncate",
            conversation.handover_requested && "text-red-700 font-medium"
          )}>
            {lastMessage?.content || 'No messages yet'}
          </p>
          
          <div className="flex items-center space-x-2">
                         {(unreadCount ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount}
              </Badge>
            )}
            
            {/* Priority indicators */}
            {conversation.handover_requested && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-red-600 font-medium">🔔 HIGH PRIORITY</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 