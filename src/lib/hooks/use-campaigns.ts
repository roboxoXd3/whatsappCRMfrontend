import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
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

export function useCampaigns(params: CampaignsParams = {}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async (): Promise<ApiResponse<Campaign[]>> => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.status) searchParams.append('status', params.status);

      return apiClient.get<Campaign[]>(`/api/campaigns?${searchParams.toString()}`);
    },
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}

export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', campaignId],
    queryFn: async (): Promise<ApiResponse<Campaign>> => {
      return apiClient.get<Campaign>(`/api/campaign/${campaignId}`);
    },
    enabled: !!campaignId,
    refetchInterval: 60000,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
}

// Types are already exported above 