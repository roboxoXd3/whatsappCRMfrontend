'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Component to initialize authentication state on app startup
 * This ensures auth state is properly restored from cookies/localStorage
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const { initializeAuth, isHydrated } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the app starts
    initializeAuth();
  }, [initializeAuth]);

  // Show children immediately - the auth state will be restored in the background
  // Individual protected routes will handle loading states
  return <>{children}</>;
}
