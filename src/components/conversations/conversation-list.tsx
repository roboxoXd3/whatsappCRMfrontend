'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Loader2, AlertCircle, MessageCircle, Bot, User, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ConversationItem } from './conversation-item';
// import { ConversationBulkActions } from './conversation-bulk-actions';
import { useConversations, useConversationSearch } from '@/hooks/useConversations';
import { useBotToggle } from '@/hooks/useBotToggle';
import { Conversation } from '@/lib/types/api';
import { ConversationFilters } from '@/lib/types/conversations';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect?: (conversation: Conversation) => void;
  onNewConversation?: () => void;
}

const statusFilters = [
  { value: 'all', label: 'All', count: 0 },
  { value: 'active', label: 'Active', count: 0 },
  { value: 'pending', label: 'Pending', count: 0 },
  { value: 'closed', label: 'Closed', count: 0 },
] as const;

export function ConversationList({ 
  selectedConversationId, 
  onConversationSelect,
  onNewConversation 
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending' | 'closed'>('all');
  const [page, setPage] = useState(0);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const { bulkToggleBot, isToggling } = useBotToggle();
  
  const filters: ConversationFilters = {
    status: activeFilter === 'all' ? undefined : activeFilter,
    limit: 20,
    offset: page * 20,
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
    limit: 20,
    offset: page * 20,
  });

  // Determine which data to use
  const isSearchMode = searchQuery.length > 2;
  const data = isSearchMode ? searchData : conversationsData;
  const isLoading = isSearchMode ? isLoadingSearch : isLoadingConversations;
  const error = isSearchMode ? searchError : conversationsError;

  const conversations = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  const hasMore = data?.pagination?.has_more || false;

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    setPage(0); // Reset pagination
  };

  const handleConversationClick = (conversation: Conversation) => {
    if (isSelectionMode) {
      handleConversationSelect(conversation.id);
    } else {
      onConversationSelect?.(conversation);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(conversations.map(conv => conv.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedConversations(new Set());
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedConversations(new Set());
    }
  };

  const getSelectedConversations = () => {
    return conversations.filter(conv => selectedConversations.has(conv.id));
  };

  const handleBulkBotToggle = async (enabled: boolean) => {
    const selectedIds = Array.from(selectedConversations);
    const action = enabled ? 'enable' : 'disable';
    const reason = `Bulk ${action}d bot for ${selectedIds.length} conversations from conversation list`;

    try {
      await bulkToggleBot.mutateAsync({
        conversation_ids: selectedIds,
        enabled,
        reason
      });

      // Clear selection after successful action
      handleClearSelection();
      
      // Show success feedback
      alert(`Successfully ${action}d bot for ${selectedIds.length} conversations!`);
    } catch (error: any) {
      alert(`Failed to ${action} bot: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Conversations
              {totalCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalCount}
                </Badge>
              )}
            </h2>
            
            {isSelectionMode && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedConversations.size === conversations.length && conversations.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  {selectedConversations.size > 0 ? `${selectedConversations.size} selected` : 'Select all'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant={isSelectionMode ? "default" : "outline"} 
              size="sm"
              onClick={toggleSelectionMode}
            >
              {isSelectionMode ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Exit
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Select
                </>
              )}
            </Button>
            
            <Button onClick={onNewConversation} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(filter.value)}
              className="whitespace-nowrap flex-shrink-0"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading && conversations.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isSearchMode ? 'No matching conversations' : 'No conversations yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isSearchMode 
                ? 'Try adjusting your search terms' 
                : 'Start a new conversation to see it here'
              }
            </p>
            {!isSearchMode && (
              <Button onClick={onNewConversation}>
                <Plus className="h-4 w-4 mr-1" />
                Start New Conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Bulk Actions Bar - Fixed at top when active */}
            {isSelectionMode && selectedConversations.size > 0 && (
              <div className="p-3 border-b bg-blue-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      {selectedConversations.size} selected
                    </Badge>
                    
                    {isToggling && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="hidden sm:inline">Updating...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkBotToggle(true)}
                      disabled={isToggling}
                      className="text-green-700 border-green-200 hover:bg-green-50 text-xs px-2 py-1 h-7"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{isToggling ? 'Updating...' : 'Bot'}</span>
                      <span className="sm:hidden">🤖</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkBotToggle(false)}
                      disabled={isToggling}
                      className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs px-2 py-1 h-7"
                    >
                      <User className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{isToggling ? 'Updating...' : 'Human'}</span>
                      <span className="sm:hidden">👤</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                      className="text-gray-600 text-xs px-2 py-1 h-7"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Conversations List - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-3 space-y-2">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className={cn(
                    "flex items-start gap-3 group",
                    isSelectionMode && "pl-1"
                  )}>
                    {isSelectionMode && (
                      <div className="flex-shrink-0 pt-2">
                        <Checkbox
                          checked={selectedConversations.has(conversation.id)}
                          onCheckedChange={() => handleConversationSelect(conversation.id)}
                          className="h-4 w-4"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <ConversationItem
                        conversation={conversation}
                        isSelected={conversation.id === selectedConversationId}
                        onClick={handleConversationClick}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 