import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/lib/types/api';

// ============================================================================
// TYPES
// ============================================================================

export interface MessageSuggestion {
  message: string;
  reasoning: string;
  confidence: number;
}

export interface SuggestionsContextMetadata {
  has_summary: boolean;
  message_count: number;
  rag_docs_found: number;
  last_message_at: string | null;
}

export interface SuggestionsData {
  suggestions: MessageSuggestion[];
  context_used: SuggestionsContextMetadata;
}

export interface EnhancementData {
  original_message: string;
  enhanced_message: string;
  enhancements: {
    added_personalization: boolean;
    added_context: boolean;
    used_rag_knowledge: boolean;
  };
}

export interface SuggestMessagesRequest {
  tenant_id?: string;
  limit?: number;
}

export interface EnhanceMessageRequest {
  message: string;
  tenant_id?: string;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const messageSuggestionKeys = {
  all: ['message-suggestions'] as const,
  contact: (userId: string) => [...messageSuggestionKeys.all, userId] as const,
  contactWithTenant: (userId: string, tenantId: string) => 
    [...messageSuggestionKeys.all, userId, tenantId] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch AI-powered message suggestions for a contact
 * 
 * @param userId - The contact's user ID
 * @param tenantId - Optional tenant ID for RAG context
 * @param options - Additional query options
 * @returns Query result with suggestions data
 */
export function useMessageSuggestions(
  userId: string,
  tenantId?: string,
  options: {
    enabled?: boolean;
    limit?: number;
  } = {}
) {
  const { enabled = true, limit = 3 } = options;

  return useQuery({
    queryKey: tenantId 
      ? messageSuggestionKeys.contactWithTenant(userId, tenantId)
      : messageSuggestionKeys.contact(userId),
    queryFn: async (): Promise<SuggestionsData> => {
      try {
        const requestData: SuggestMessagesRequest = {
          limit,
        };

        if (tenantId) {
          requestData.tenant_id = tenantId;
        }

        const response = await apiClient.post<SuggestionsData>(
          `/api/crm/contact/${userId}/suggest-messages`,
          requestData
        );

        if (!response.data) {
          throw new Error('No suggestions data received');
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching message suggestions:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - suggestions can be reused for a bit
    enabled: enabled && !!userId, // Only run if userId is provided and enabled
  });
}

/**
 * Hook to refresh message suggestions
 * This mutation can be used to manually trigger a refresh of suggestions
 * 
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useRefreshSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      tenantId, 
      limit = 3 
    }: { 
      userId: string; 
      tenantId?: string; 
      limit?: number;
    }): Promise<ApiResponse<SuggestionsData>> => {
      try {
        const requestData: SuggestMessagesRequest = {
          limit,
        };

        if (tenantId) {
          requestData.tenant_id = tenantId;
        }

        const response = await apiClient.post<SuggestionsData>(
          `/api/crm/contact/${userId}/suggest-messages`,
          requestData
        );

        if (!response.data) {
          throw new Error('No suggestions data received');
        }

        return response;
      } catch (error) {
        console.error('Error refreshing message suggestions:', error);
        throw error;
      }
    },
    onSuccess: (response, variables) => {
      // Update the cache with new suggestions
      const queryKey = variables.tenantId
        ? messageSuggestionKeys.contactWithTenant(variables.userId, variables.tenantId)
        : messageSuggestionKeys.contact(variables.userId);
      
      if (response.data) {
        queryClient.setQueryData(queryKey, response.data);
      }
    },
  });
}

/**
 * Hook to enhance a user's typed message with AI
 * 
 * @returns Mutation object with mutate/mutateAsync functions
 */
export function useEnhanceMessage() {
  return useMutation({
    mutationFn: async ({ 
      userId, 
      message, 
      tenantId 
    }: { 
      userId: string; 
      message: string; 
      tenantId?: string;
    }): Promise<EnhancementData> => {
      try {
        if (!message || !message.trim()) {
          throw new Error('Message cannot be empty');
        }

        const requestData: EnhanceMessageRequest = {
          message: message.trim(),
        };

        if (tenantId) {
          requestData.tenant_id = tenantId;
        }

        const response = await apiClient.post<EnhancementData>(
          `/api/crm/contact/${userId}/enhance-message`,
          requestData
        );

        if (!response.data) {
          throw new Error('No enhancement data received');
        }

        return response.data;
      } catch (error) {
        console.error('Error enhancing message:', error);
        throw error;
      }
    },
  });
}

/**
 * Hook to check if suggestions are available for a contact
 * This is a lightweight check that doesn't fetch the actual suggestions
 * 
 * @param userId - The contact's user ID
 * @returns Boolean indicating if suggestions are likely available
 */
export function useSuggestionsAvailable(userId: string): boolean {
  const queryClient = useQueryClient();
  
  // Check if we have cached suggestions
  const cachedData = queryClient.getQueryData(
    messageSuggestionKeys.contact(userId)
  ) as SuggestionsData | undefined;

  return !!(cachedData?.suggestions && cachedData.suggestions.length > 0);
}

/**
 * Hook to invalidate suggestions cache
 * Useful when the conversation context changes significantly
 * 
 * @returns Function to invalidate suggestions
 */
export function useInvalidateSuggestions() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.invalidateQueries({
      queryKey: messageSuggestionKeys.contact(userId),
    });
  };
}

