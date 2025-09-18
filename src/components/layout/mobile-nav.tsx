'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, 
  Users, 
  Calendar,
  Home,
  UserCog,
  BookOpen,
  Send,
  UsersRound,
  Bell,
  Smartphone
} from 'lucide-react';
import { mainNavigation, secondaryNavigation } from '@/constants/navigation';

const MobileNav = () => {
  const pathname = usePathname();

  // Combine main navigation with secondary navigation for mobile
  const allNavItems = [
    ...mainNavigation, // Include all main navigation items
    ...secondaryNavigation
  ];

  // Create mobile-friendly nav items with proper naming and active states
  const navItems = allNavItems.map(item => ({
    name: item.name === 'Knowledge Base' ? 'Knowledge' : 
          item.name === 'Group Creation' ? 'Groups' :
          item.name === 'Scheduled Messages' ? 'Scheduled' :
          item.name === 'WhatsApp Connect' ? 'Connect' :
          item.name === 'Conversations' ? 'Messages' : 
          item.name,
    href: item.href,
    icon: item.icon,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`)
  }));

  return (
    <nav className="mobile-nav safe-area-bottom">
      <div className="flex items-center overflow-x-auto scrollbar-hide px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`mobile-nav-item touch-target mobile-touch flex-shrink-0 ${
                item.active 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
