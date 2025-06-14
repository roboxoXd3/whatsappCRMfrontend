import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations';

// Query Keys
export const CONVERSATION_QUERY_KEYS = {
  detail: (conversationId: string) => ['conversation', 'detail', conversationId] as const,
  allDetails: ['conversation', 'detail'] as const,
};

// Hook to get conversation details with messages
export function useConversationDetail(conversationId: string | undefined) {
  return useQuery({
    queryKey: CONVERSATION_QUERY_KEYS.detail(conversationId || ''),
    queryFn: () => conversationsApi.getConversationDetail(conversationId!),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
} 