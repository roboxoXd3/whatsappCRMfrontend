import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  Phone,
  UserPlus,
  Calendar,
  Target,
  TrendingUp,
  Bell,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export const mainNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics',
  },
  {
    name: 'Conversations',
    href: '/conversations',
    icon: MessageSquare,
    description: 'Chat history and active conversations',
  },
  {
    name: 'CRM',
    href: '/crm',
    icon: Users,
    description: 'Customer relationship management',
    children: [
      {
        name: 'Contacts',
        href: '/crm/contacts',
        icon: Users,
        description: 'Manage customer contacts',
      },
      {
        name: 'Deals',
        href: '/crm/deals',
        icon: Target,
        description: 'Sales opportunities and pipeline',
      },
      {
        name: 'Tasks',
        href: '/crm/tasks',
        icon: Calendar,
        description: 'Follow-ups and reminders',
      },
    ],
  },
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    description: 'Bulk messaging and automation',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Reports and insights',
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'System alerts and updates',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application preferences',
  },
];

export const quickActions: NavigationItem[] = [
  {
    name: 'Send Message',
    href: '/conversations/new',
    icon: Phone,
    description: 'Start a new conversation',
  },
  {
    name: 'Add Contact',
    href: '/crm/contacts/new',
    icon: UserPlus,
    description: 'Create new contact',
  },
  {
    name: 'New Campaign',
    href: '/campaigns/new',
    icon: Megaphone,
    description: 'Launch bulk messaging campaign',
  },
  {
    name: 'View Reports',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Check performance metrics',
  },
];

// Breadcrumb configuration
export const breadcrumbLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  conversations: 'Conversations',
  crm: 'CRM',
  contacts: 'Contacts',
  deals: 'Deals',
  tasks: 'Tasks',
  campaigns: 'Campaigns',
  analytics: 'Analytics',
  settings: 'Settings',
  notifications: 'Notifications',
  new: 'New',
  edit: 'Edit',
}; 