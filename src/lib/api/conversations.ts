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