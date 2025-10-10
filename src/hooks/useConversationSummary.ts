import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/lib/types/api';

// Types for conversation summary
export interface ConversationSummaryData {
  summary: string;
  message_count: number;
  generated_at: string | null;
  has_conversations: boolean;
  ai_enabled?: boolean;
  raw_insights?: any;
}

/**
 * Hook to fetch the existing conversation summary for a contact
 */
export function useConversationSummary(userId: string) {
  return useQuery({
    queryKey: ['conversation-summary', userId],
    queryFn: async (): Promise<ConversationSummaryData | null> => {
      try {
        // First get the user data which includes conversation_summary
        const response = await apiClient.get<any>(`/api/crm/user/${userId}`);
        
        console.log('📊 Summary response:', response);
        
        // Handle both direct data and wrapped data
        const userData = response.data || response;
        
        console.log('📊 User data:', userData);
        console.log('📊 Has summary:', !!userData.conversation_summary);
        
        if (userData && userData.conversation_summary) {
          const summaryData = {
            summary: userData.conversation_summary,
            message_count: userData.summary_message_count || 0,
            generated_at: userData.summary_generated_at,
            has_conversations: true,
            ai_enabled: true,
          };
          console.log('📊 Returning summary data:', summaryData);
          return summaryData;
        }
        
        // No summary exists yet
        console.log('📊 No summary found');
        return null;
      } catch (error) {
        console.error('Error fetching conversation summary:', error);
        return null;
      }
    },
    staleTime: 1 * 1000, // 1 second - very short for testing
    enabled: !!userId, // Only run if userId is provided
    refetchOnMount: true, // Always refetch when component mounts
  });
}

/**
 * Hook to generate or regenerate the conversation summary
 */
export function useGenerateConversationSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<ApiResponse<ConversationSummaryData>> => {
      try {
        console.log('🔄 Generating summary for user:', userId);
        const response = await apiClient.post<ConversationSummaryData>(
          `/api/crm/contact/${userId}/generate-summary`,
          {}
        );
        console.log('✅ Summary generated:', response);
        return response;
      } catch (error) {
        console.error('❌ Error generating conversation summary:', error);
        throw error;
      }
    },
    onSuccess: (data, userId) => {
      console.log('✅ Invalidating queries for user:', userId);
      // Invalidate the summary query to refetch with new data
      queryClient.invalidateQueries({ queryKey: ['conversation-summary', userId] });
      
      // Also invalidate the user detail query
      queryClient.invalidateQueries({ queryKey: ['crm-user', userId] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['conversation-summary', userId] });
    },
  });
}

/**
 * Hook to check if summary needs refresh (older than 24 hours)
 */
export function useSummaryNeedsRefresh(generatedAt: string | null | undefined): boolean {
  if (!generatedAt) return true;
  
  try {
    const generated = new Date(generatedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - generated.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff > 24; // Refresh if older than 24 hours
  } catch (error) {
    return true;
  }
}

