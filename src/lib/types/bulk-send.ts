/**
 * Bulk Send API Types
 */

export interface BulkSendPayload {
  contacts: Array<{
    phone_number?: string;
    phone?: string;
    name?: string;
    company?: string;
    email?: string;
  }>;
  message: string;
  campaign_name?: string;
  use_ai_personalization?: boolean;
  personalize_per_contact?: boolean;
  with_retry?: boolean;
  media_type?: 'image' | 'video';    // NEW: Media type
  media_url?: string;                 // NEW: Media URL from Wasender
  media_size?: number;                // NEW: Media size in bytes
}

export interface BulkSendResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    job_id: string;
    campaign_id: string;
    total_contacts: number;
    status: string;
  };
}

export interface Campaign {
  id: string;
  name: string;
  message_content: string;
  total_contacts: number;
  successful_sends: number;
  failed_sends: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  tenant_id: string;
  media_type?: 'image' | 'video' | null;  // NEW: Media type
  media_url?: string | null;               // NEW: Media URL
  media_size?: number | null;              // NEW: Media size
}

export interface CampaignProgress {
  campaign_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'unknown';
  progress: {
    current: number;
    total: number;
    successful: number;
    failed: number;
    success_rate: number;
  };
  estimated_time_remaining: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  message_content: string;
  campaign_name: string;
  media_type?: 'image' | 'video' | null;  // NEW
  media_url?: string | null;               // NEW
}

export type MediaType = 'image' | 'video';

