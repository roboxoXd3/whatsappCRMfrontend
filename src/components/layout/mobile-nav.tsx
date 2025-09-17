'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, 
  Users, 
  Calendar,
  Settings,
  Home,
  UserCog,
  BookOpen,
  Send,
  UsersRound
} from 'lucide-react';

const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      active: pathname === '/dashboard'
    },
    {
      name: 'Messages',
      href: '/conversations',
      icon: MessageSquare,
      active: pathname === '/conversations' || pathname.startsWith('/conversations/')
    },
    {
      name: 'CRM',
      href: '/crm',
      icon: Users,
      active: pathname === '/crm' || pathname.startsWith('/crm/')
    },
    {
      name: 'Handover',
      href: '/handover',
      icon: UserCog,
      active: pathname === '/handover'
    },
    {
      name: 'Knowledge',
      href: '/knowledge-base',
      icon: BookOpen,
      active: pathname === '/knowledge-base' || pathname.startsWith('/knowledge-base/')
    },
    {
      name: 'Bulk Send',
      href: '/bulk-send',
      icon: Send,
      active: pathname === '/bulk-send'
    },
    {
      name: 'Groups',
      href: '/group-creation',
      icon: UsersRound,
      active: pathname === '/group-creation'
    },
    {
      name: 'Scheduled',
      href: '/scheduled-messages',
      icon: Calendar,
      active: pathname === '/scheduled-messages'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings' || pathname.startsWith('/settings/')
    }
  ];

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
