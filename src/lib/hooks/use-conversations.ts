import { useQuery } from '@tanstack/react-query';
import { ConversationsAPI, type ConversationsParams } from '@/lib/api/conversations';
import { type Conversation } from '@/lib/types/api';

export function useConversations(params: ConversationsParams = {}) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => ConversationsAPI.getConversations(params),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => ConversationsAPI.getConversation(conversationId),
    enabled: !!conversationId,
    refetchInterval: 30000,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
}

// Re-export types for convenience
export type { Conversation, ConversationsParams }; 