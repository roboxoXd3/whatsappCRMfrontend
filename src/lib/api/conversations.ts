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
  BotStatus,
  MessageStatusUpdate,
  ConversationStatusSummary,
} from '@/lib/types/conversations';

// Add CRM Contact interface
export interface CRMContact {
  id: string;
  phone_number: string;
  display_phone: string;
  name: string;
  email?: string;
  company?: string;
  position?: string;
  lead_status: string;
  lead_score: number;
  source?: string;
  notes?: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  created_at: string;
}

export interface ConversationsParams {
  limit?: number;
  offset?: number;
  status?: string;
}

// Enhanced send message response with message ID
export interface EnhancedSendMessageResponse {
  status: string;
  message: string;
  recipient: string;
  message_id: string; // Keep required like original
  timestamp: string;
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  whatsapp_message_id?: string; // Additional field for WASender message ID
}

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
   * Fetch detailed conversation with full message history and enhanced status data
   */
  async getConversationDetail(conversationId: string): Promise<ApiResponse<ConversationDetail>> {
    return apiClient.get<ConversationDetail>(`/api/conversation/${conversationId}`);
  }

  /**
   * Get conversation status summary including delivery stats
   */
  async getConversationStatusSummary(conversationId: string): Promise<ApiResponse<ConversationStatusSummary>> {
    return apiClient.get<ConversationStatusSummary>(`/api/conversation/${conversationId}/status`);
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
   * Search CRM contacts by name, phone number, company, or email
   */
  async searchCRMContacts(searchQuery: string, limit: number = 20, offset: number = 0): Promise<ApiResponse<CRMContact[]>> {
    const params = new URLSearchParams();
    params.append('q', searchQuery);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return apiClient.get<CRMContact[]>('/api/crm/contacts/search', Object.fromEntries(params));
  }

  /**
   * Send a message to a specific phone number with enhanced response
   */
  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<EnhancedSendMessageResponse>> {
    return apiClient.post<EnhancedSendMessageResponse>('/send-message', messageData);
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

  // ========================================================================
  // NEW ENHANCED FEATURES FROM PHASE 1
  // ========================================================================

  /**
   * Get bot status for a specific conversation
   */
  async getBotStatus(conversationId: string): Promise<ApiResponse<BotStatus>> {
    return apiClient.get<BotStatus>(`/api/conversation/${conversationId}/bot-status`);
  }

  /**
   * Toggle bot status for a conversation
   */
  async toggleBotStatus(conversationId: string, enabled: boolean): Promise<ApiResponse<BotStatus>> {
    return apiClient.patch<BotStatus>(`/api/conversation/${conversationId}/bot-status`, { 
      enabled 
    });
  }

  /**
   * Get message status updates for a conversation
   */
  async getMessageStatusUpdates(conversationId: string, since?: string): Promise<ApiResponse<MessageStatusUpdate[]>> {
    const params = new URLSearchParams();
    if (since) params.append('since', since);
    
    return apiClient.get<MessageStatusUpdate[]>(
      `/api/conversation/${conversationId}/message-status${params.toString() ? '?' + params.toString() : ''}`
    );
  }

  /**
   * Update message status manually (for testing or admin purposes)
   */
  async updateMessageStatus(
    conversationId: string, 
    messageId: string, 
    status: 'sent' | 'delivered' | 'read'
  ): Promise<ApiResponse<any>> {
    return apiClient.patch(`/api/conversation/${conversationId}/message/${messageId}/status`, {
      status
    });
  }

  /**
   * Get webhook events for debugging
   */
  async getWebhookEvents(conversationId: string, limit: number = 50): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/api/conversation/${conversationId}/webhook-events?limit=${limit}`);
  }

  /**
   * Retry failed message
   */
  async retryFailedMessage(conversationId: string, messageId: string): Promise<ApiResponse<EnhancedSendMessageResponse>> {
    return apiClient.post<EnhancedSendMessageResponse>(`/api/conversation/${conversationId}/message/${messageId}/retry`);
  }

  /**
   * Get delivery statistics for a conversation
   */
  async getDeliveryStats(conversationId: string): Promise<ApiResponse<{
    total_sent: number;
    total_delivered: number;
    total_read: number;
    delivery_rate: number;
    read_rate: number;
  }>> {
    return apiClient.get(`/api/conversation/${conversationId}/delivery-stats`);
  }
}

// Export singleton instance
export const conversationsService = new ConversationsService();

// Static API class for hooks
export class ConversationsAPI {
  // Get conversations with optional filters
  static async getConversations(params: ConversationsParams = {}): Promise<ApiResponse<Conversation[]>> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.status) searchParams.append('status', params.status);

    return apiClient.get<Conversation[]>(`/api/conversations/unique?${searchParams.toString()}`);
  }

  // Get single conversation by ID
  static async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.get<Conversation>(`/api/conversation/${conversationId}`);
  }

  // Get detailed conversation with full message history
  static async getConversationDetail(conversationId: string): Promise<ApiResponse<ConversationDetail>> {
    return apiClient.get<ConversationDetail>(`/api/conversation/${conversationId}`);
  }
}

// Export for easier imports
export const conversationsApi = ConversationsAPI; 