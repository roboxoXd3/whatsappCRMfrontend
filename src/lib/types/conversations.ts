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
  bot_enabled?: boolean; // Whether bot is active for this conversation
  unread_count?: number; // Number of unread messages
  delivery_stats?: {
    total_sent: number;
    total_delivered: number;
    total_read: number;
    delivery_rate: number;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'human';
  content: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  message_id?: string; // WhatsApp message ID from WASender
  timestamps?: {
    sent_at?: string;
    delivered_at?: string;
    read_at?: string;
  };
  metadata?: {
    is_from_bot?: boolean;
    customer_context_used?: boolean;
    response_time_ms?: number;
  };
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

// New types for enhanced features
export interface BotStatus {
  enabled: boolean;
  last_updated: string;
  updated_by?: string;
}

export interface MessageStatusUpdate {
  message_id: string;
  phone_number: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
}

export interface ConversationStatusSummary {
  total_messages: number;
  unread_messages: number;
  last_message_status: 'sent' | 'delivered' | 'read' | 'failed';
  bot_enabled: boolean;
  response_time_avg: number;
} 