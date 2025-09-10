import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';

/**
 * Hook to initialize authentication state on app startup
 * This ensures auth state is properly restored from cookies/localStorage
 */
export function useAuthInit() {
  const { initializeAuth, isHydrated } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the component mounts
    initializeAuth();
  }, [initializeAuth]);

  return { isHydrated };
}
