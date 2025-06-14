// Conversation-specific types
export interface Conversation {
  id: string;
  contact: {
    phone_number: string;
    name: string;
    email?: string;
    company?: string;
    created_at: string;
  };
  last_message_at: string;
  message_count: number;
  last_message_preview: string;
  last_message_role: 'user' | 'assistant';
  status: 'active' | 'closed' | 'pending';
  tags: string[];
}

export interface ConversationDetail {
  id: string;
  contact: {
    phone_number: string;
    name: string;
    email?: string;
    company?: string;
  };
  messages: Message[];
  metadata: {
    created_at: string;
    last_activity: string;
    total_messages: number;
    avg_response_time: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    lead_score: number;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

// Conversation-specific filter and search types
// (Core conversation types are in api.ts to avoid duplication)

export interface ConversationFilters {
  status?: 'active' | 'closed' | 'pending';
  limit?: number;
  offset?: number;
}

export interface ConversationSearchParams {
  q: string;
  limit?: number;
  offset?: number;
}

export interface SendMessageRequest {
  phone_number: string;
  message: string;
}

export interface SendMessageResponse {
  status: 'success' | 'error';
  message: string;
  recipient: string;
  message_id: string;
  timestamp: string;
} 