import { apiClient } from './client';
import { 
  ApiResponse, 
  Conversation, 
  ConversationDetail, 
  SendMessageRequest, 
  SendMessageResponse 
} from '@/lib/types/api';
import {
  ConversationFilters,
  ConversationSearchParams,
} from '@/lib/types/conversations';

/**
 * Conversations API Service
 * Handles all conversation-related API calls
 */
export class ConversationsService {
  
  /**
   * Fetch all conversations with optional filters
   */
  async getConversations(filters: ConversationFilters = {}): Promise<ApiResponse<Conversation[]>> {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.status) params.append('status', filters.status);
    
    // Use the unique endpoint to eliminate duplicate phone numbers
    return apiClient.get<Conversation[]>('/api/conversations/unique', Object.fromEntries(params));
  }

  /**
   * Fetch detailed conversation with full message history
   */
  async getConversationDetail(conversationId: string): Promise<ApiResponse<ConversationDetail>> {
    return apiClient.get<ConversationDetail>(`/api/conversation/${conversationId}`);
  }

  /**
   * Search conversations by content, contact name, or phone number
   */
  async searchConversations(searchParams: ConversationSearchParams): Promise<ApiResponse<Conversation[]>> {
    const params = new URLSearchParams();
    params.append('q', searchParams.q);
    
    if (searchParams.limit) params.append('limit', searchParams.limit.toString());
    if (searchParams.offset) params.append('offset', searchParams.offset.toString());
    
    return apiClient.get<Conversation[]>('/api/conversation/search', Object.fromEntries(params));
  }

  /**
   * Send a message to a specific phone number
   */
  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<SendMessageResponse>> {
    return apiClient.post<SendMessageResponse>('/send-message', messageData);
  }

  /**
   * Send bulk messages to multiple contacts
   */
  async sendBulkMessage(bulkData: any): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/send-bulk-message', bulkData);
  }

  /**
   * Start an AI conversation with a contact
   */
  async startAIConversation(phoneNumber: string, initialMessage?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/start-conversation', {
      phone_number: phoneNumber,
      initial_message: initialMessage || 'Hello! How can I help you today?',
      persona: 'general',
    });
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(conversationId: string, status: 'active' | 'closed' | 'pending'): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/conversation/${conversationId}`, { status });
  }

  /**
   * Add tags to a conversation
   */
  async addConversationTags(conversationId: string, tags: string[]): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/conversation/${conversationId}/tags`, { tags });
  }
}

// Export singleton instance
export const conversationsService = new ConversationsService();

export const conversationsApi = {
  // Get conversation details with messages
  getConversationDetail: async (conversationId: string): Promise<ConversationDetail> => {
    try {
      console.log(`🔍 Fetching conversation details for: ${conversationId}`);
      
      const response = await apiClient.get<ConversationDetail>(
        `/api/conversation/${conversationId}`
      );
      
      console.log('📊 Conversation Detail Response:', response);
      
      if (response.status === 'success' && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch conversation details');
      }
    } catch (error: any) {
      console.error('❌ Error fetching conversation details:', error);
      throw error;
    }
  },

  // Get all conversations (existing functionality)
  getConversations: async (params?: { limit?: number; offset?: number; status?: string }) => {
    try {
      // Use the unique endpoint to eliminate duplicate phone numbers
      const response = await apiClient.get('/api/conversations/unique', params);
      
      if (response.status === 'success' && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch conversations');
      }
    } catch (error: any) {
      console.error('❌ Error fetching conversations:', error);
      throw error;
    }
  }
}; 