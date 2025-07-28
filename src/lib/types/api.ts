// API Response Types
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error_code?: string;
  details?: unknown;
  timestamp?: string;
  pagination?: Pagination;
  metadata?: unknown;
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
  next_offset?: number;
  prev_offset?: number;
}

// Dashboard Types
export interface DashboardStats {
  total_contacts: number;
  total_conversations: number;
  messages_today: number;
  active_campaigns: number;
  conversion_rate: number;
  avg_response_time: string;
  top_keywords: string[];
  recent_activity: RecentActivity[];
}

export interface RecentActivity {
  type: string;
  contact: string;
  time: string;
}

export interface SystemStatus {
  api_status: string;
  database_status: string;
  whatsapp_status: string;
  ai_status: string;
  last_updated: string;
  uptime: string;
}

// Message Types
export interface Message {
  id?: string; // Sometimes not included in API response
  role: 'user' | 'assistant' | 'human';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed'; // Sometimes not included
}

export interface SendMessageRequest {
  phone_number: string;
  message: string;
}

export interface SendMessageResponse {
  status: string;
  message: string;
  recipient: string;
  message_id: string;
  timestamp: string;
}

// Conversation Types
export interface Contact {
  phone_number: string;
  name: string;
  email?: string;
  company?: string;
  created_at: string;
  // New CRM enrichment fields from enhanced API
  lead_status?: string;
  lead_score?: number;
  position?: string;
  crm_summary?: string;
  // New WASender fields for contact sync
  verified_name?: string;
  profile_image_url?: string;
  whatsapp_status?: string;
  is_business_account?: boolean;
  wasender_sync_status?: 'not_synced' | 'syncing' | 'synced' | 'error';
  display_phone?: string; // Formatted phone number for display
}

export interface Conversation {
  id: string;
  contact: Contact;
  last_message_at: string;
  created_at: string;
  message_count: number;
  last_message_preview: string;
  last_message_role: 'user' | 'assistant' | 'human';
  status: 'active' | 'closed' | 'pending';
  tags: string[];
  unread_count?: number; // For WhatsApp-style unread message badges
  bot_enabled?: boolean; // Whether bot auto-responses are enabled for this conversation
  handover_requested?: boolean; // Whether user requested human support
  handover_timestamp?: string; // When handover was requested
  handover_reason?: string; // Trigger message for handover
}

export interface ConversationDetail {
  id: string;
  contact: Contact & {
    email?: string;
    company?: string;
  };
  messages: Message[];
  created_at: string;
  last_message_at: string;
  metadata?: {
    created_at: string;
    last_activity: string;
    total_messages: number;
    avg_response_time: string;
    sentiment: string;
    lead_score: number;
  };
}

// CRM Types
export interface CrmContact {
  id: string;
  phone_number: string;
  name: string;
  email?: string;
  company?: string;
  status: 'lead' | 'customer' | 'inactive';
  lead_score: number;
  tags: string[];
  created_at: string;
  last_contact: string;
  total_interactions: number;
  conversion_probability: 'high' | 'medium' | 'low';
}

export interface Deal {
  id: string;
  title: string;
  contact_id: string;
  contact_name: string;
  value: number;
  currency: string;
  status: 'open' | 'won' | 'lost' | 'pending';
  stage: string;
  probability: number;
  expected_close_date: string;
  created_at: string;
  last_activity: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  contact_id: string;
  contact_name: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
  assigned_to: string;
  created_at: string;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  message: string;
  status: 'active' | 'completed' | 'scheduled' | 'failed';
  total_recipients: number;
  messages_sent: number;
  messages_delivered: number;
  messages_failed: number;
  click_through_rate: number;
  response_rate: number;
  created_at: string;
  completed_at?: string;
  tags: string[];
}

export interface CampaignDetail extends Campaign {
  metrics: {
    delivery_rate: number;
    response_rate: number;
    click_through_rate: number;
  };
  timeline: Array<{
    event: string;
    timestamp: string;
  }>;
  top_responses: string[];
}

export interface BulkMessageRequest {
  campaign_name: string;
  message: string;
  contacts: Array<{
    phone: string;
    name: string;
  }>;
  schedule_time?: string;
  tags: string[];
} 