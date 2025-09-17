'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/stores/app';
import { useAuthStore } from '@/lib/stores/auth';
import { mainNavigation, secondaryNavigation } from '@/constants/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center p-4 border-b border-gray-200 transition-all duration-300",
            sidebarOpen ? "justify-between" : "lg:justify-center lg:flex-col lg:space-y-2"
          )}>
            {/* Expanded Header */}
            <div className={cn(
              "flex items-center space-x-3 transition-all duration-300",
              sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden lg:h-0"
            )}>
              <MessageSquare className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap">WhatsApp CRM</span>
            </div>
            
            {/* Collapsed Logo for Desktop */}
            <div className={cn(
              "items-center justify-center transition-all duration-300 hidden lg:flex group relative",
              sidebarOpen ? "lg:opacity-0 lg:w-0 lg:overflow-hidden lg:h-0" : "lg:opacity-100"
            )}>
              <MessageSquare className="h-8 w-8 text-blue-600" />
              {/* Tooltip for collapsed logo */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                WhatsApp CRM
              </div>
            </div>
            
            {/* Toggle Button */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="w-8 h-8 hover:bg-gray-100 flex-shrink-0"
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              {/* Tooltip for toggle button when collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden lg:block">
                  Expand sidebar
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 py-6 space-y-8 overflow-y-auto transition-all duration-300",
            sidebarOpen ? "px-4" : "lg:px-2"
          )}>
            {/* Main Navigation */}
            <div>
              <h3 className={cn(
                "px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 transition-all duration-300",
                sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:h-0 lg:mb-0 lg:overflow-hidden"
              )}>
                Main
              </h3>
              <ul className="space-y-1">
                {mainNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <li key={item.name} className="relative group">
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActive
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                          !sidebarOpen && "lg:justify-center lg:px-2"
                        )}
                      >
                        <Icon className={cn(
                          "flex-shrink-0 h-5 w-5",
                          sidebarOpen ? "-ml-1 mr-3" : "lg:mr-0",
                          isActive 
                            ? "text-blue-600" 
                            : "text-gray-400 group-hover:text-gray-500"
                        )} />
                        <span className={cn(
                          "truncate transition-all duration-300",
                          sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                        )}>
                          {item.name}
                        </span>
                        {item.badge && sidebarOpen && (
                          <Badge 
                            variant="secondary" 
                            className="ml-auto"
                            size="sm"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.children && sidebarOpen && (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        )}
                      </Link>
                      
                      {/* Tooltip for collapsed state */}
                      {!sidebarOpen && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden lg:block">
                          {item.name}
                        </div>
                      )}

                      {/* Sub-navigation */}
                      {item.children && isActive && (
                        <ul className="mt-1 space-y-1 pl-8">
                          {item.children.map((child) => {
                            const childIsActive = pathname === child.href;
                            const ChildIcon = child.icon;

                            return (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "group flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                                    childIsActive
                                      ? "bg-blue-100 text-blue-700"
                                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                  )}
                                >
                                  <ChildIcon className="flex-shrink-0 mr-3 h-4 w-4" />
                                  <span className="truncate">{child.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Secondary Navigation */}
            <div>
              <h3 className={cn(
                "px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 transition-all duration-300",
                sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:h-0 lg:mb-0 lg:overflow-hidden"
              )}>
                Settings
              </h3>
              <ul className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name} className="relative group">
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                          !sidebarOpen && "lg:justify-center lg:px-2"
                        )}
                      >
                        <Icon className={cn(
                          "flex-shrink-0 h-5 w-5",
                          sidebarOpen ? "-ml-1 mr-3" : "lg:mr-0",
                          isActive 
                            ? "text-blue-600" 
                            : "text-gray-400 group-hover:text-gray-500"
                        )} />
                        <span className={cn(
                          "truncate transition-all duration-300",
                          sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                        )}>
                          {item.name}
                        </span>
                      </Link>
                      
                      {/* Tooltip for collapsed state */}
                      {!sidebarOpen && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden lg:block">
                          {item.name}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className={cn(
              "flex items-center relative group",
              sidebarOpen ? "space-x-3" : "lg:justify-center"
            )}>
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Tooltip for collapsed state */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden lg:block">
                  Admin User
                </div>
              )}
              <div className={cn(
                "flex-1 min-w-0 transition-all duration-300",
                sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
              )}>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@rianinfotech.com'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className={cn(
                  "flex-shrink-0 transition-all duration-300",
                  sidebarOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                )}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 