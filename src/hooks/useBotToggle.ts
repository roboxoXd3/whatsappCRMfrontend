import { useCallback } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// Types for bot toggle API
interface BotStatusSummary {
  summary: {
    total_conversations: number;
    bot_enabled: number;
    bot_disabled: number;
    enabled_percentage: number;
  };
  disabled_conversations: Array<{
    conversation_id: string;
    contact: {
      phone_number: string;
      name: string;
    };
  }>;
  timestamp: string;
}

interface BotStatus {
  conversation_id: string;
  bot_enabled: boolean;
  contact: {
    phone_number: string;
    name: string;
  };
  status_text: string;
}

interface BotToggleResponse {
  conversation_id: string;
  previous_status: boolean;
  new_status: boolean;
  action: 'enabled' | 'disabled';
  contact: {
    phone_number: string;
    name: string;
  };
  reason?: string;
  timestamp: string;
}

interface ToggleByPhoneRequest {
  phone_number: string;
  enabled?: boolean;
  reason?: string;
}

interface BulkToggleRequest {
  conversation_ids: string[];
  enabled: boolean;
  reason?: string;
}

// Query keys
export const botToggleKeys = {
  all: ['botToggle'] as const,
  summary: () => [...botToggleKeys.all, 'summary'] as const,
  status: (conversationId: string) => [...botToggleKeys.all, 'status', conversationId] as const,
};

export function useBotToggle() {
  const queryClient = useQueryClient();

  // Get bot status summary
  const getBotStatusSummary = useQuery({
    queryKey: botToggleKeys.summary(),
    queryFn: async (): Promise<BotStatusSummary> => {
      const response = await apiClient.get('/api/bot/status-summary');
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to get bot status');
      }
      
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Get bot status for specific conversation
  const getBotStatus = useCallback(async (conversationId: string): Promise<BotStatus> => {
    const response = await apiClient.get(`/api/bot/status/${conversationId}`);
    
    if (response.status === 'error') {
      throw new Error(response.message || 'Failed to get bot status');
    }
    
    return response.data;
  }, []);

  // Toggle bot by conversation ID
  const toggleBotByConversation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      enabled, 
      reason 
    }: { 
      conversationId: string; 
      enabled?: boolean; 
      reason?: string; 
    }): Promise<BotToggleResponse> => {
      const response = await apiClient.post(`/api/bot/toggle/${conversationId}`, {
        enabled,
        reason
      });
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to toggle bot');
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch bot status queries
      queryClient.invalidateQueries({ queryKey: botToggleKeys.all });
    },
  });

  // Toggle bot by phone number (recommended)
  const toggleBotByPhone = useMutation({
    mutationFn: async (request: ToggleByPhoneRequest): Promise<BotToggleResponse> => {
      const response = await apiClient.post('/api/bot/toggle-by-phone', request);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to toggle bot');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log('🔄 Bot toggle successful, invalidating cache...', data);
      
      // Invalidate all bot toggle queries
      queryClient.invalidateQueries({ queryKey: botToggleKeys.all });
      
      // Also invalidate the specific conversation status if we have the conversation_id
      if (data.conversation_id) {
        queryClient.invalidateQueries({ 
          queryKey: botToggleKeys.status(data.conversation_id) 
        });
        
        // Force refetch the specific conversation status
        queryClient.refetchQueries({ 
          queryKey: botToggleKeys.status(data.conversation_id) 
        });
      }
      
      // Force refetch of bot status summary
      queryClient.refetchQueries({ 
        queryKey: botToggleKeys.summary() 
      });
      
      // Also remove from cache and refetch to force fresh data
      queryClient.removeQueries({ queryKey: botToggleKeys.all });
    },
  });

  // Bulk toggle
  const bulkToggleBot = useMutation({
    mutationFn: async (request: BulkToggleRequest): Promise<{
      conversation_ids: string[];
      new_status: boolean;
      action: 'enabled' | 'disabled';
      updated_count: number;
      reason?: string;
      timestamp: string;
    }> => {
      const response = await apiClient.post('/api/bot/bulk-toggle', request);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to bulk toggle bot');
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch bot status queries
      queryClient.invalidateQueries({ queryKey: botToggleKeys.all });
    },
  });

  return {
    // Queries
    botStatusSummary: getBotStatusSummary,
    getBotStatus,
    
    // Mutations
    toggleBotByConversation,
    toggleBotByPhone,
    bulkToggleBot,
    
    // Loading states
    isToggling: toggleBotByConversation.isPending || toggleBotByPhone.isPending || bulkToggleBot.isPending,
    error: toggleBotByConversation.error || toggleBotByPhone.error || bulkToggleBot.error,
  };
}

// Hook to get bot status for a specific conversation
export function useBotStatus(conversationId: string) {
  return useQuery({
    queryKey: botToggleKeys.status(conversationId),
    queryFn: async (): Promise<BotStatus> => {
      console.log('🔍 Fetching bot status for conversation:', conversationId);
      const response = await apiClient.get(`/api/bot/status/${conversationId}`);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to get bot status');
      }
      
      console.log('✅ Bot status fetched:', response.data);
      return response.data;
    },
    staleTime: 1 * 1000, // 1 second - very fresh data for immediate UI updates
    refetchInterval: 5 * 1000, // 5 seconds - faster polling for real-time updates
    enabled: !!conversationId, // Only run if conversationId exists
  });
} 