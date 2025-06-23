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
  const { isAuthenticated, isLoading } = useAuthStore();

  // Temporarily bypass authentication in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDevelopment && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, isDevelopment]);

  // Show loading screen while checking authentication (only in production)
  if (!isDevelopment && isLoading) {
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

  // If not authenticated and not in development, don't render children (redirect will happen)
  if (!isDevelopment && !isAuthenticated) {
    return null;
  }

  // Render protected content (always in development, or when authenticated in production)
  return <>{children}</>;
} 