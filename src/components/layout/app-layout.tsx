'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from './dashboard-layout';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Routes that should not use the dashboard layout
  const excludedRoutes = [
    '/auth/login',
    '/auth/register',
    '/', // Home page (redirects to dashboard or login)
  ];
  
  // Check if current route should be excluded
  const shouldExclude = excludedRoutes.some(route => 
    pathname === route || pathname.startsWith('/auth/')
  );
  
  // If excluded route, render children without dashboard layout
  if (shouldExclude) {
    return <>{children}</>;
  }
  
  // For all other routes, wrap with protected route and dashboard layout
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
