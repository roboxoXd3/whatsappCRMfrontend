import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsService, CRMContact } from '@/lib/api/conversations';
import { ConversationFilters, ConversationSearchParams } from '@/lib/types/conversations';
import { Conversation, ConversationDetail, SendMessageRequest } from '@/lib/types/api';

// Query keys for React Query caching
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: ConversationFilters) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  search: (params: ConversationSearchParams) => [...conversationKeys.all, 'search', params] as const,
  crmSearch: (query: string) => [...conversationKeys.all, 'crm-search', query] as const,
};

/**
 * Hook to fetch conversations with filters
 */
export function useConversations(filters: ConversationFilters = {}) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => conversationsService.getConversations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds for real-time updates
  });
}

/**
 * Hook to fetch a specific conversation detail
 */
export function useConversationDetail(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId),
    queryFn: () => conversationsService.getConversationDetail(conversationId),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 1000, // 10 seconds for real-time messages
  });
}

/**
 * Hook to search conversations
 */
export function useConversationSearch(searchParams: ConversationSearchParams) {
  return useQuery({
    queryKey: conversationKeys.search(searchParams),
    queryFn: () => conversationsService.searchConversations(searchParams),
    enabled: !!searchParams.q && searchParams.q.length > 2,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search CRM contacts
 */
export function useCRMContactSearch(searchQuery: string, limit: number = 20) {
  return useQuery({
    queryKey: conversationKeys.crmSearch(searchQuery),
    queryFn: () => conversationsService.searchCRMContacts(searchQuery, limit),
    enabled: !!searchQuery && searchQuery.length > 2,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData: SendMessageRequest) => 
      conversationsService.sendMessage(messageData),
    onSuccess: () => {
      // Invalidate conversations to refresh the list
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

/**
 * Hook to update conversation status
 */
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, status }: { 
      conversationId: string; 
      status: 'active' | 'closed' | 'pending' 
    }) => conversationsService.updateConversationStatus(conversationId, status),
    onSuccess: (data, variables) => {
      // Invalidate and refetch affected queries
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * Hook to start AI conversation
 */
export function useStartAIConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phoneNumber, initialMessage }: { 
      phoneNumber: string; 
      initialMessage?: string 
    }) => conversationsService.startAIConversation(phoneNumber, initialMessage),
    onSuccess: () => {
      // Refresh conversations list
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
} 