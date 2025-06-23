'use client';

import { useState } from 'react';
import { Search, Plus, MessageCircle, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConversations, useConversationSearch, useCRMContactSearch } from '@/hooks/useConversations';
import { Conversation } from '@/lib/types/api';
import { ConversationFilters } from '@/lib/types/conversations';
import { cn } from '@/lib/utils';
import CRMContactList from './crm-contact-list';
import { CRMContact } from '@/lib/api/conversations';

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect?: (conversation: Conversation) => void;
  onNewConversation?: () => void;
}

export function ConversationList({ 
  selectedConversationId, 
  onConversationSelect,
  onNewConversation 
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('conversations');

  const filters: ConversationFilters = {
    limit: 50,
    offset: 0,
  };

  // Use search if there's a query, otherwise use regular conversations
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useConversations(filters);

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useConversationSearch({
    q: searchQuery,
    limit: 50,
    offset: 0,
  });

  // CRM Contact search
  const {
    data: crmSearchData,
    isLoading: isLoadingCRMSearch,
    error: crmSearchError,
  } = useCRMContactSearch(searchQuery, 50);

  // Determine which data to use for conversations
  const isSearchMode = searchQuery.length > 2;
  const data = isSearchMode ? searchData : conversationsData;
  const isLoading = isSearchMode ? isLoadingSearch : isLoadingConversations;
  const error = isSearchMode ? searchError : conversationsError;

  const conversations = data?.data || [];
  const crmContacts = crmSearchData?.data || [];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace('_s_whatsapp_net', '');
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return `+91 ${cleanPhone.slice(2, 7)} ${cleanPhone.slice(7)}`;
    }
    return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  };

  const getContactDisplayName = (contact: any) => {
    if (contact.name && contact.name !== contact.phone_number) {
      return contact.name;
    }
    if (contact.company) {
      return `Contact from ${contact.company}`;
    }
    return contact.display_phone || formatPhoneNumber(contact.phone_number);
  };

  const handleConversationClick = (conversation: Conversation) => {
    onConversationSelect?.(conversation);
  };

  const handleCRMContactStartConversation = (contact: CRMContact) => {
    // Switch to conversations tab after starting a conversation
    setActiveTab('conversations');
    setSearchQuery(''); // Clear search to show all conversations
  };

  const renderConversationsList = () => {
    if (error) {
      return (
        <div className="p-6 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Conversations</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to load conversations'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="p-6 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations</h3>
          <p className="text-gray-600 mb-4">
            {isSearchMode ? 'No conversations match your search.' : 'Start a new conversation to get started.'}
          </p>
          {!isSearchMode && (
            <Button onClick={onNewConversation}>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-100">
        {conversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation.id;
          const displayName = getContactDisplayName(conversation.contact);
          
          return (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className={cn(
                "flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors",
                isSelected && "bg-blue-50 border-r-2 border-blue-500"
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online status indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {displayName}
                  </h4>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(conversation.last_message_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message_role === 'assistant' && '✓ '}
                    {conversation.last_message_preview || 'No messages yet'}
                  </p>
                  
                  {/* Unread count */}
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <Badge className="bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={activeTab === 'conversations' ? "Search conversations..." : "Search CRM contacts..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 border-0 rounded-lg"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-3 mt-2">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            CRM Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="flex-1 flex flex-col mt-0">
          {/* Section Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Recent
              </h3>
              <Button variant="ghost" size="sm" onClick={onNewConversation}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {renderConversationsList()}
          </div>
        </TabsContent>

        <TabsContent value="crm" className="flex-1 flex flex-col mt-0">
          {/* Section Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                CRM Contacts
              </h3>
              <span className="text-xs text-gray-500">
                {searchQuery.length > 2 ? `${crmContacts.length} found` : 'Type to search'}
              </span>
            </div>
          </div>

          {/* CRM Contacts List */}
          <div className="flex-1 overflow-y-auto p-3">
            {searchQuery.length > 2 ? (
              <CRMContactList
                contacts={crmContacts}
                isLoading={isLoadingCRMSearch}
                onStartConversation={handleCRMContactStartConversation}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Type at least 3 characters to search CRM contacts</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 