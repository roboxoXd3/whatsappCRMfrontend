import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { DashboardStats, SystemStatus } from '@/lib/types/api';

// Dashboard statistics hook
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}

// System status hook
export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: () => dashboardApi.getSystemStatus(),
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}

// Health check hook
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: () => dashboardApi.getHealthCheck(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1, // Only retry once for health checks
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
  });
} 