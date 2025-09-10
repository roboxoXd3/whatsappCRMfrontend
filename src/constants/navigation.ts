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
  Key,
  Send,
  UsersRound,
  UserCog,
  Smartphone,
  BookOpen,
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
    name: 'Handover',
    href: '/handover',
    icon: UserCog,
    description: 'Bot-to-human handover management',
    badge: 'New',
  },
  {
    name: 'Knowledge Base',
    href: '/knowledge-base',
    icon: BookOpen,
    description: 'Manage AI assistant knowledge and training data',
    badge: 'AI',
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
    name: 'Bulk Send',
    href: '/bulk-send',
    icon: Send,
    description: 'Send messages to multiple contacts',
  },
  {
    name: 'Group Creation',
    href: '/group-creation',
    icon: UsersRound,
    description: 'Create WhatsApp groups from contacts',
  },
  {
    name: 'Scheduled Messages',
    href: '/scheduled-messages',
    icon: Calendar,
    description: 'View and manage scheduled messages',
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
    name: 'WhatsApp Connect',
    href: '/whatsapp-connect',
    icon: Smartphone,
    description: 'Connect your WhatsApp account',
    badge: 'New',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application preferences',
    children: [
      {
        name: 'API Keys',
        href: '/settings/api-keys',
        icon: Key,
        description: 'Manage OpenAI and WhatsApp API keys',
      },
    ],
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
  'bulk-send': 'Bulk Send',
  'group-creation': 'Group Creation',
  'scheduled-messages': 'Scheduled Messages',
  analytics: 'Analytics',
  settings: 'Settings',
  'api-keys': 'API Keys',
  notifications: 'Notifications',
  handover: 'Handover Dashboard',
  'whatsapp-connect': 'WhatsApp Connect',
  'knowledge-base': 'Knowledge Base',
  new: 'New',
  edit: 'Edit',
}; 