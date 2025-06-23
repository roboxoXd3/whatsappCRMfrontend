'use client';

import React from 'react';
import { CRMContact } from '@/lib/api/conversations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Building, User, MessageCircle } from 'lucide-react';
import { useStartAIConversation } from '@/hooks/useConversations';
import { toast } from '@/components/ui/use-toast';

interface CRMContactListProps {
  contacts: CRMContact[];
  isLoading?: boolean;
  onStartConversation?: (contact: CRMContact) => void;
}

const CRMContactList: React.FC<CRMContactListProps> = ({
  contacts,
  isLoading = false,
  onStartConversation
}) => {
  const startConversationMutation = useStartAIConversation();

  const handleStartConversation = async (contact: CRMContact) => {
    try {
      await startConversationMutation.mutateAsync({
        phoneNumber: contact.phone_number,
        initialMessage: `Hello ${contact.name}! I hope you're doing well.`
      });
      
      toast({
        title: "Conversation Started",
        description: `Started a new conversation with ${contact.name}`,
      });
      
      if (onStartConversation) {
        onStartConversation(contact);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLeadStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'interested':
        return 'bg-yellow-100 text-yellow-800';
      case 'new':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p>No CRM contacts found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Header with name and lead status */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">
                  {contact.name}
                </h3>
                <Badge className={getLeadStatusColor(contact.lead_status)}>
                  {contact.lead_status}
                </Badge>
              </div>

              {/* Contact details */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{contact.display_phone}</span>
                </div>
                
                {contact.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{contact.email}</span>
                  </div>
                )}
                
                {contact.company && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    <span>
                      {contact.company}
                      {contact.position && ` • ${contact.position}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Lead score and notes */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Lead Score: <span className="font-semibold">{contact.lead_score}</span>
                </div>
                {contact.notes && (
                  <div className="text-xs text-gray-400 max-w-xs truncate">
                    {contact.notes}
                  </div>
                )}
              </div>

              {/* Last contacted info */}
              {contact.last_contacted_at && (
                <div className="text-xs text-gray-400">
                  Last contacted: {new Date(contact.last_contacted_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="ml-4">
              <Button
                onClick={() => handleStartConversation(contact)}
                disabled={startConversationMutation.isPending}
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {startConversationMutation.isPending ? 'Starting...' : 'Start Chat'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CRMContactList; 