'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Phone, Clock, Tag, Bot, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useBotStatus } from '@/hooks/useBotToggle';
// No longer needed - using enriched data directly from API
import { Conversation } from '@/lib/types/api';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected?: boolean;
  onClick?: (conversation: Conversation) => void;
}

export function ConversationItem({ 
  conversation, 
  isSelected = false,
  onClick 
}: ConversationItemProps) {
  const { contact, last_message_at, message_count, last_message_preview, status, tags } = conversation;
  
  // Get bot status for this conversation
  const { data: botStatus } = useBotStatus(conversation.id);
  
  // Use enriched contact data directly from the API (no need for separate customer context call)
  const hasEnrichedData = contact.company || contact.lead_status;
  
  // Format the enriched contact data for display
  const getDisplayName = () => {
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
    <Card 
      className={cn(
        "p-3 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
        isSelected 
          ? "border-l-blue-500 bg-blue-50 border-blue-200" 
          : "border-l-transparent hover:border-l-blue-200"
      )}
      onClick={() => onClick?.(conversation)}
    >
      {/* Header with contact info and status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-2">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {getDisplayName()}
            </h3>
            <div className="flex items-center gap-1 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getStatusColor(status))}
              >
                {status}
              </Badge>
              
              {/* Customer Lead Status from enriched API */}
              {contact.lead_status && (
                <Badge 
                  variant="outline"
                  className={cn("text-xs", getLeadStatusColor(contact.lead_status))}
                >
                  {contact.lead_status}
                </Badge>
              )}
              
              {/* Lead Score from enriched API */}
              {contact.lead_score !== undefined && contact.lead_score > 0 && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  ⭐ {contact.lead_score}
                </Badge>
              )}
              
              {/* Bot Status Indicator */}
              {botStatus && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs flex items-center gap-1",
                    botStatus.bot_enabled 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                >
                  {botStatus.bot_enabled ? (
                    <Bot className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">
                    {botStatus.bot_enabled ? 'Bot' : 'Human'}
                  </span>
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            {/* Company/Position Info from enriched API */}
            {getSubtitle() && (
              <div className="text-xs text-blue-600 font-medium">
                {getSubtitle()}
              </div>
            )}
            
            {/* Phone Number */}
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatPhoneNumber(contact.phone_number)}</span>
            </div>
            
            {/* CRM Summary from enriched API */}
            {hasEnrichedData && contact.crm_summary && (
              <div className="text-xs text-gray-500">
                {contact.crm_summary}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="whitespace-nowrap">{formatTimeAgo(last_message_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>{message_count}</span>
          </div>
        </div>
      </div>

      {/* Last message preview */}
      <div className="mb-2">
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {last_message_preview || 'No messages yet'}
        </p>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="text-xs bg-gray-50 text-gray-600 border-gray-200"
            >
              <Tag className="h-2 w-2 mr-1" />
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
} 