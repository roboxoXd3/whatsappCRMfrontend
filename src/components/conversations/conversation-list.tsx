'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search, Plus, MessageCircle, X, Filter, SortAsc, Bot, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useConversations, useConversationSearch } from '@/hooks/useConversations';
import { Conversation } from '@/lib/types/api';
import { ConversationFilters } from '@/lib/types/conversations';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useBotToggle } from '@/hooks/useBotToggle';
import { BulkBotToggleDialog } from './bulk-bot-toggle-dialog';
import { useToast } from '@/hooks/use-toast';

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect?: (conversation: Conversation) => void;
  onNewConversation?: () => void;
}

type SortOption = 'recent' | 'name' | 'unread';
type FilterOption = 'all' | 'unread' | 'active' | 'bot' | 'human';

export function ConversationList({ 
  selectedConversationId, 
  onConversationSelect,
  onNewConversation 
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkToggleDialog, setShowBulkToggleDialog] = useState(false);
  const [bulkToggleAction, setBulkToggleAction] = useState<'enable' | 'disable'>('enable');

  // Toast notifications
  const { toast } = useToast();

  // Bot toggle hook
  const { bulkToggleBot, isToggling } = useBotToggle();

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filters: ConversationFilters = {
    limit: 100, // Increased limit for better scrolling experience
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
    q: debouncedSearchQuery,
    limit: 100,
    offset: 0,
  });

  // Determine which data to use for conversations
  const isSearchMode = debouncedSearchQuery.length > 2;
  const data = isSearchMode ? searchData : conversationsData;
  const isLoading = isSearchMode ? isLoadingSearch : isLoadingConversations;
  const error = isSearchMode ? searchError : conversationsError;

  const rawConversations = useMemo(() => data?.data || [], [data?.data]);

  // Helper functions
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const getInitials = useCallback((name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const formatPhoneNumber = useCallback((phone: string) => {
    const cleanPhone = phone.replace('_s_whatsapp_net', '');
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return `+91 ${cleanPhone.slice(2, 7)} ${cleanPhone.slice(7)}`;
    }
    return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  }, []);

  const getContactDisplayName = useCallback((contact: Conversation['contact']) => {
    // Priority: verified_name > name > company > formatted phone
    if (contact.verified_name) {
      return contact.verified_name;
    }
    if (contact.name && contact.name !== contact.phone_number) {
      return contact.name;
    }
    if (contact.company) {
      return `Contact from ${contact.company}`;
    }
    return contact.display_phone || formatPhoneNumber(contact.phone_number);
  }, [formatPhoneNumber]);

  // Enhanced filtering and sorting
  const filteredAndSortedConversations = useMemo(() => {
    let filtered = [...rawConversations];

    // Apply filters
    switch (filterBy) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unread_count && conv.unread_count > 0);
        break;
      case 'active':
        filtered = filtered.filter(conv => conv.status === 'active');
        break;
      case 'bot':
        filtered = filtered.filter(conv => conv.last_message_role === 'assistant');
        break;
      case 'human':
        filtered = filtered.filter(conv => conv.last_message_role === 'human');
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => {
          const nameA = getContactDisplayName(a.contact).toLowerCase();
          const nameB = getContactDisplayName(b.contact).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'unread':
        filtered.sort((a, b) => (b.unread_count || 0) - (a.unread_count || 0));
        break;
    }

    return filtered;
  }, [rawConversations, filterBy, sortBy, getContactDisplayName]);

  const conversations = filteredAndSortedConversations;

  const handleConversationClick = useCallback((conversation: Conversation) => {
    onConversationSelect?.(conversation);
  }, [onConversationSelect]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const getFilteredCount = useCallback((filter: FilterOption) => {
    switch (filter) {
      case 'unread':
        return rawConversations.filter(conv => conv.unread_count && conv.unread_count > 0).length;
      case 'active':
        return rawConversations.filter(conv => conv.status === 'active').length;
      case 'bot':
        return rawConversations.filter(conv => conv.last_message_role === 'assistant').length;
      case 'human':
        return rawConversations.filter(conv => conv.last_message_role === 'human').length;
      default:
        return rawConversations.length;
    }
  }, [rawConversations]);

  // Bulk toggle handlers
  const handleBulkEnableBot = useCallback(() => {
    if (conversations.length === 0) {
      toast({
        title: 'No conversations',
        description: 'There are no conversations to enable bot for.',
        variant: 'destructive',
      });
      return;
    }
    setBulkToggleAction('enable');
    setShowBulkToggleDialog(true);
  }, [conversations.length, toast]);

  const handleBulkDisableBot = useCallback(() => {
    if (conversations.length === 0) {
      toast({
        title: 'No conversations',
        description: 'There are no conversations to disable bot for.',
        variant: 'destructive',
      });
      return;
    }
    setBulkToggleAction('disable');
    setShowBulkToggleDialog(true);
  }, [conversations.length, toast]);

  const handleBulkToggleConfirm = useCallback(async () => {
    const conversationIds = conversations.map(conv => conv.id);
    const enabled = bulkToggleAction === 'enable';

    try {
      const result = await bulkToggleBot.mutateAsync({
        conversation_ids: conversationIds,
        enabled,
        reason: `Bulk ${enabled ? 'enable' : 'disable'} by admin from conversation list`,
      });

      // Show success toast
      toast({
        title: 'Success',
        description: `Bot ${enabled ? 'enabled' : 'disabled'} for ${result.updated_count} conversation${result.updated_count !== 1 ? 's' : ''}${result.failed_count > 0 ? ` (${result.failed_count} failed)` : ''}`,
      });
    } catch (error) {
      // Error toast is shown by the dialog
      throw error;
    }
  }, [conversations, bulkToggleAction, bulkToggleBot, toast]);

  const renderConversationItem = useCallback((conversation: Conversation, index: number) => {
    const isSelected = selectedConversationId === conversation.id;
    const displayName = getContactDisplayName(conversation.contact);
    
    return (
      <div
        key={conversation.id}
        onClick={() => handleConversationClick(conversation)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer transition-colors duration-150 border-b border-[#e9edef]",
          isSelected && "bg-[#f0f2f5]"
        )}
        style={{
          transform: `translateY(${index * 0.5}px)`,
          animationDelay: `${index * 50}ms`
        }}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-[49px] h-[49px]">
            {conversation.contact.profile_image_url ? (
              <img 
                src={conversation.contact.profile_image_url} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <AvatarFallback className="bg-[#dfe5e7] text-[#54656f] font-normal text-base">
                {getInitials(displayName)}
              </AvatarFallback>
            )}
          </Avatar>
          
          {/* Message type indicator */}
          {conversation.last_message_role === 'assistant' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#25d366] rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-[10px]">✓</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-baseline justify-between mb-0.5">
            <h4 className="font-medium text-[#111b21] truncate text-[16px]">
              {displayName}
            </h4>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[12px] text-[#667781] flex-shrink-0">
                {formatTime(conversation.last_message_at)}
              </span>
              {conversation.bot_enabled === false && (
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" title="Bot disabled" />
              )}
              {conversation.handover_requested && (
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse flex-shrink-0" title="Human support requested" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {conversation.last_message_role === 'assistant' && (
                <svg viewBox="0 0 16 15" className="w-4 h-4 text-[#53bdeb] flex-shrink-0" fill="currentColor">
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                </svg>
              )}
              <p className="text-[14px] text-[#667781] truncate">
                {conversation.last_message_preview || 'No messages yet'}
              </p>
            </div>
            
            {conversation.unread_count && conversation.unread_count > 0 && (
              <div className="bg-[#25d366] text-white text-[12px] font-medium rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                {conversation.unread_count}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [selectedConversationId, getContactDisplayName, handleConversationClick, formatTime, getInitials]);

  const renderConversationsList = useCallback(() => {
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
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="p-6 text-center">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isSearchMode ? 'No matching conversations' : 'No conversations yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isSearchMode 
              ? 'Try adjusting your search or filters.' 
              : 'Start a new conversation to get started.'
            }
          </p>
          {!isSearchMode && (
            <Button onClick={onNewConversation} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white">
        {conversations.map((conversation, index) => renderConversationItem(conversation, index))}
      </div>
    );
  }, [error, isLoading, conversations, isSearchMode, onNewConversation, renderConversationItem]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search Bar */}
      <div className="p-3 bg-[#f0f2f5]">
        <div className="space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 bg-white border-0 rounded-lg shadow-sm h-[38px] text-[14px] placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#008069] focus-visible:ring-offset-0"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters and Sort - Mobile Optimized */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 lg:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600 hover:text-gray-900 h-9 lg:h-8 px-3 lg:px-2"
              >
                <Filter className="h-4 w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Filter</span>
                {filterBy !== 'all' && (
                  <Badge variant="secondary" className="ml-1 lg:ml-2 h-5 text-xs">
                    {getFilteredCount(filterBy)}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy(sortBy === 'recent' ? 'name' : sortBy === 'name' ? 'unread' : 'recent')}
                className="text-gray-600 hover:text-gray-900 h-9 lg:h-8 px-3 lg:px-2"
              >
                <SortAsc className="h-4 w-4 mr-1 lg:mr-2" />
                <span className="text-xs lg:text-sm">
                  {sortBy === 'recent' ? 'Recent' : sortBy === 'name' ? 'Name' : 'Unread'}
                </span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk Bot Toggle Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEnableBot}
                disabled={conversations.length === 0 || isToggling}
                className="h-8 px-2 bg-green-50 border-green-200 hover:bg-green-100 text-green-700 hidden sm:flex"
                title="Enable bot for all conversations"
              >
                <Bot className="h-4 w-4 mr-1" />
                <span className="text-xs">Enable All</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDisableBot}
                disabled={conversations.length === 0 || isToggling}
                className="h-8 px-2 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hidden sm:flex"
                title="Disable bot for all conversations"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="text-xs">Disable All</span>
              </Button>

              <span className="text-xs text-gray-500 hidden sm:inline">
                {conversations.length} of {rawConversations.length}
              </span>
              <Button variant="ghost" size="sm" onClick={onNewConversation} className="h-9 lg:h-8 w-9 lg:w-8 p-0">
                <Plus className="h-5 w-5 lg:h-4 lg:w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {(['all', 'unread', 'active', 'bot', 'human'] as FilterOption[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterBy(filter)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    filterBy === filter
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {filter === 'all' ? 'All' : 
                   filter === 'unread' ? 'Unread' :
                   filter === 'active' ? 'Active' :
                   filter === 'bot' ? 'Bot' : 'Human'}
                  {filter !== 'all' && (
                    <span className="ml-1 opacity-70">
                      ({getFilteredCount(filter)})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Results Summary */}
      {(isSearchMode || filterBy !== 'all') && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {isSearchMode && filterBy !== 'all' 
                ? `Found ${conversations.length} conversations matching "${debouncedSearchQuery}" with filter "${filterBy}"`
                : isSearchMode 
                  ? `Found ${conversations.length} conversations matching "${debouncedSearchQuery}"`
                  : `Showing ${conversations.length} ${filterBy} conversations`
              }
            </span>
            {(isSearchMode || filterBy !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterBy('all');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-20 lg:pb-0">
        {renderConversationsList()}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total: {rawConversations.length} conversations</span>
          <div className="flex items-center gap-4">
            <span>Unread: {getFilteredCount('unread')}</span>
            <span>Active: {getFilteredCount('active')}</span>
          </div>
        </div>
      </div>

      {/* Bulk Bot Toggle Dialog */}
      <BulkBotToggleDialog
        isOpen={showBulkToggleDialog}
        onClose={() => setShowBulkToggleDialog(false)}
        action={bulkToggleAction}
        conversations={conversations}
        onConfirm={handleBulkToggleConfirm}
        isLoading={isToggling}
      />
    </div>
  );
} 