'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { Loader2, MessageSquare } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, token } = useAuthStore();

  // For SaaS mode, we need proper authentication
  const requiresAuth = true; // Changed from development bypass

  useEffect(() => {
    if (requiresAuth && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, requiresAuth]);

  // Verify token on mount if we have one
  useEffect(() => {
    const verifyToken = async () => {
      if (token && isAuthenticated) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
          const response = await fetch(`${apiUrl}/api/auth/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            // Token is invalid, logout user
            useAuthStore.getState().logout();
            router.push('/auth/login');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Don't logout on network errors, just log the issue
        }
      }
    };

    verifyToken();
  }, [token, isAuthenticated, router]);

  // Show loading screen while checking authentication
  if (requiresAuth && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">WhatsApp CRM</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Verifying authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (requiresAuth && !isAuthenticated) {
    return null;
  }

  // Render protected content when authenticated
  return <>{children}</>;
} 