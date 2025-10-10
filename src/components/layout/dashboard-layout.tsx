'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import MobileNav from './mobile-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  
  // Pages that handle their own scrolling and don't need the main container to scroll
  const fullHeightPages = ['/conversations'];
  const isFullHeightPage = fullHeightPages.some(page => pathname.startsWith(page));
  
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content */}
        <main className={`flex-1 bg-gray-50 ${
          isFullHeightPage 
            ? 'overflow-hidden' 
            : 'overflow-y-auto pb-16 lg:pb-0'
        }`}>
          {children}
        </main>
        
        {/* Mobile Navigation - Only visible on mobile */}
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
} 