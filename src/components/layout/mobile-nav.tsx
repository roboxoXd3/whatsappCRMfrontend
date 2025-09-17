'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Calendar,
  Settings,
  Home
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
      active: pathname === '/conversations'
    },
    {
      name: 'Contacts',
      href: '/crm',
      icon: Users,
      active: pathname === '/crm'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      active: pathname === '/analytics'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings'
    }
  ];

  return (
    <nav className="mobile-nav safe-area-bottom">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`mobile-nav-item touch-target mobile-touch ${
                item.active 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
