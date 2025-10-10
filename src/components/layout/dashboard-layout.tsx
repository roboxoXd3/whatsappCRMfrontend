'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import MobileNav from './mobile-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 lg:pb-0">
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