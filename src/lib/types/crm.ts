// CRM Types for WhatsApp AI Chatbot
// Based on API documentation v2.1

export interface Contact {
  id: string;
  phone_number: string;
  display_phone?: string; // Formatted phone number for display (e.g., "+91 70330 09600")
  name: string;
  email?: string;
  company?: string;
  position?: string;
  source?: string;
  // API uses lead_status instead of status
  lead_status: 'lead' | 'contacted' | 'customer' | 'converted' | 'inactive';
  lead_score: number;
  tags?: string[];
  created_at: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  notes?: string;
  // Legacy fields for backward compatibility
  status?: 'lead' | 'customer' | 'inactive';
  last_contact?: string;
  total_interactions?: number;
  conversion_probability?: 'low' | 'medium' | 'high';
}

export interface Deal {
  id: string;
  title: string;
  contact_id: string;
  contact_name: string;
  value: number;
  currency: string;
  status: 'open' | 'won' | 'lost' | 'pending';
  stage: 'initial' | 'proposal' | 'negotiation' | 'closing';
  probability: number;
  expected_close_date: string;
  created_at: string;
  last_activity: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  contact_id: string;
  deal_id?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  task_type?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // Nested contact and deal info from API
  contacts?: {
    name?: string;
    phone_number: string;
  };
  deals?: any;
  // Legacy fields for backward compatibility
  contact_name?: string;
  assigned_to?: string;
}

// Filter and pagination types
export interface ContactFilters {
  status?: 'lead' | 'customer' | 'inactive';
  tag?: string;
  search?: string;
}

export interface DealFilters {
  status?: 'open' | 'won' | 'lost' | 'pending';
  stage?: 'initial' | 'proposal' | 'negotiation' | 'closing';
  search?: string;
}

export interface TaskFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
  overdue?: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// API Request/Response types
export interface ContactsResponse {
  status: 'success' | 'error';
  data: Contact[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface DealsResponse {
  status: 'success' | 'error';
  data: Deal[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface TasksResponse {
  status: 'success' | 'error';
  data: Task[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Create/Update request types
export interface CreateContactRequest {
  phone_number: string;
  name: string;
  email?: string;
  company?: string;
  position?: string;
  source?: string;
  lead_status?: 'lead' | 'contacted' | 'customer' | 'converted' | 'inactive';
  tags?: string[];
  notes?: string;
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  company?: string;
  position?: string;
  source?: string;
  lead_status?: 'lead' | 'contacted' | 'customer' | 'converted' | 'inactive';
  tags?: string[];
  notes?: string;
}

export interface CreateDealRequest {
  title: string;
  contact_id: string;
  value: number;
  currency?: string;
  stage?: 'initial' | 'proposal' | 'negotiation' | 'closing';
  probability?: number;
  expected_close_date?: string;
  notes?: string;
}

export interface UpdateDealRequest {
  title?: string;
  value?: number;
  currency?: string;
  status?: 'open' | 'won' | 'lost' | 'pending';
  stage?: 'initial' | 'proposal' | 'negotiation' | 'closing';
  probability?: number;
  expected_close_date?: string;
  notes?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  contact_id: string;
  due_date: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// CRM Statistics
export interface CRMStats {
  total_contacts: number;
  total_leads: number;
  total_customers: number;
  total_deals: number;
  total_deal_value: number;
  won_deals: number;
  pending_tasks: number;
  overdue_tasks: number;
  conversion_rate: number;
  avg_deal_size: number;
} 