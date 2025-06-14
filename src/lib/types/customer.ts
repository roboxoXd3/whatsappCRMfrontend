// Customer Context Types for CRM-Chat Integration
// Based on the actual Customer Context API response from backend

export interface CustomerDeal {
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expected_close_date: string;
}

export interface CustomerTask {
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CustomerActivity {
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
}

// This matches the actual API response structure
export interface CustomerContextData {
  contact_id: string;
  name: string;
  email?: string;
  company?: string;
  position?: string;
  lead_status: string;
  lead_score: number;
  phone_number: string;
  source?: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  is_new_customer: boolean;
  context_summary: string;
  deals?: CustomerDeal[];
  active_deals?: CustomerDeal[]; // For backward compatibility
  pending_tasks?: CustomerTask[];
  recent_activities?: CustomerActivity[];
  notes?: string;
}

// This is the actual API response structure
export interface CustomerContextResponse {
  status: 'success' | 'error';
  data?: CustomerContextData;
  message?: string;
}

// Legacy interface for backward compatibility
export interface LegacyCustomerContextResponse {
  success: boolean;
  customer_found: boolean;
  customer_context: CustomerContextData | null;
  context_summary: string;
  error?: string;
} 