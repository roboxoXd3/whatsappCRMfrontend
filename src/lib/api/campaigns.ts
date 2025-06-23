import { apiClient } from './client';
import { ApiResponse } from '@/lib/types/api';

export interface Campaign {
  id: string;
  name: string;
  message_content: string;
  status: 'active' | 'completed' | 'scheduled' | 'failed';
  total_contacts: number;
  successful_sends: number;
  failed_sends: number;
  success_rate: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface CampaignsParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export class CampaignsAPI {
  // Get campaigns with optional filters
  static async getCampaigns(params: CampaignsParams = {}): Promise<ApiResponse<Campaign[]>> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.status) searchParams.append('status', params.status);

    return apiClient.get<Campaign[]>(`/api/campaigns?${searchParams.toString()}`);
  }

  // Get single campaign by ID
  static async getCampaign(campaignId: string): Promise<ApiResponse<Campaign>> {
    return apiClient.get<Campaign>(`/api/campaign/${campaignId}`);
  }
}

// Export for easier imports
export const campaignsApi = CampaignsAPI; 