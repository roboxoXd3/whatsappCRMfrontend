import { apiClient } from './client';
import { DashboardStats, SystemStatus, ApiResponse } from '@/lib/types/api';

export class DashboardAPI {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/api/dashboard-stats');
  }

  // Get system health status
  static async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
    return apiClient.get<SystemStatus>('/api/system-status');
  }

  // Get health check
  static async getHealthCheck(): Promise<ApiResponse<any>> {
    return apiClient.get('/health');
  }
}

// Export for easier imports
export const dashboardApi = DashboardAPI; 