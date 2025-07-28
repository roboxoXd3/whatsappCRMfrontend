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
    staleTime: 10 * 1000, // 10 seconds - shorter for faster updates
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
    refetchOnWindowFocus: true, // Refetch when user focuses the window
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
} 