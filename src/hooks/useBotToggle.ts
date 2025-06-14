import { useState, useCallback } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';

const API_BASE = 'https://whatsapp-ai-chatbot-production-bc92.up.railway.app';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get bot status summary
  const getBotStatusSummary = useQuery({
    queryKey: botToggleKeys.summary(),
    queryFn: async (): Promise<BotStatusSummary> => {
      const response = await fetch(`${API_BASE}/api/bot/status-summary`);
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Get bot status for specific conversation
  const getBotStatus = useCallback(async (conversationId: string): Promise<BotStatus> => {
    const response = await fetch(`${API_BASE}/api/bot/status/${conversationId}`);
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }
    
    return data.data;
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
      const response = await fetch(`${API_BASE}/api/bot/toggle/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          reason
        })
      });

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch bot status queries
      queryClient.invalidateQueries({ queryKey: botToggleKeys.all });
    },
  });

  // Toggle bot by phone number (recommended)
  const toggleBotByPhone = useMutation({
    mutationFn: async (request: ToggleByPhoneRequest): Promise<BotToggleResponse> => {
      const response = await fetch(`${API_BASE}/api/bot/toggle-by-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch bot status queries
      queryClient.invalidateQueries({ queryKey: botToggleKeys.all });
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
      const response = await fetch(`${API_BASE}/api/bot/bulk-toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
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
      const response = await fetch(`${API_BASE}/api/bot/status/${conversationId}`);
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      return data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
} 