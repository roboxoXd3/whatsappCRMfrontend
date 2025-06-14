'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Phone, 
  Mail, 
  Building, 
  Clock, 
  MessageCircle, 
  Star,
  Tag,
  MoreHorizontal,
  Edit,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BotToggle } from './bot-toggle';
import { ConversationDetail } from '@/lib/types/api';
import { useUpdateConversationStatus } from '@/hooks/useConversations';
import { cn } from '@/lib/utils';

interface ContactInfoPanelProps {
  conversation: ConversationDetail;
  className?: string;
}

export function ContactInfoPanel({ conversation, className }: ContactInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateStatusMutation = useUpdateConversationStatus();
  
  const { contact, metadata } = conversation;
  
  // Provide default metadata if not available
  const defaultMetadata = {
    total_messages: 0,
    avg_response_time: 'Unknown',
    last_activity: conversation.last_message_at || conversation.created_at,
    sentiment: 'neutral',
    lead_score: 50,
  };
  
  const meta = metadata || defaultMetadata;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('91') && phone.length > 10) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  const handleStatusChange = async (newStatus: 'active' | 'closed' | 'pending') => {
    try {
      await updateStatusMutation.mutateAsync({
        conversationId: conversation.id,
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className={cn("bg-white border-l border-gray-200", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Contact Info</h3>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Contact Name & Status */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {contact.name || 'Unknown Contact'}
          </h2>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatPhoneNumber(contact.phone_number)}
            </span>
          </div>

          {contact.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{contact.email}</span>
            </div>
          )}

          {contact.company && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{contact.company}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bot Toggle Section */}
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900 mb-3">Response Mode</h4>
        <BotToggle
          conversationId={conversation.id}
          phoneNumber={contact.phone_number}
          contactName={contact.name}
          variant="full"
        />
      </div>

      {/* Conversation Metrics */}
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900 mb-3">Conversation Stats</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Total Messages</span>
            </div>
            <span className="text-sm font-medium">{meta.total_messages}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Avg Response</span>
            </div>
            <span className="text-sm font-medium">{meta.avg_response_time}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last Activity</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(meta.last_activity), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Sentiment & Lead Score */}
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900 mb-3">Analysis</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Sentiment</span>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getSentimentColor(meta.sentiment))}
            >
              {meta.sentiment}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lead Score</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary"
                className={cn("text-xs", getLeadScoreColor(meta.lead_score))}
              >
                {meta.lead_score}/100
              </Badge>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(meta.lead_score / 20)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => handleStatusChange('closed')}
            disabled={updateStatusMutation.isPending}
          >
            <Archive className="h-4 w-4 mr-2" />
            Close Conversation
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Contact
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Tag className="h-4 w-4 mr-2" />
            Add Tags
          </Button>
        </div>
      </div>
    </div>
  );
} 