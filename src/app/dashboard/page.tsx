'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search,
  Plus,
  MessageSquare,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  FileText,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

// Import hooks for real data
import { useDashboardStats, useHealthCheck } from '@/lib/hooks/use-dashboard-data';
import { useConversations, type Conversation } from '@/lib/hooks/use-conversations';
import { useCampaigns, type Campaign } from '@/lib/hooks/use-campaigns';
import { useTasks } from '@/hooks/useCRM';
import LeadQualificationWidget from '@/components/dashboard/lead-qualification-widget';

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');

  // Fetch real data using hooks
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: healthData, isLoading: healthLoading } = useHealthCheck();
  const { data: conversationsData } = useConversations({ limit: 5 });
  const { data: campaignsData } = useCampaigns({ limit: 5 });
  const { data: tasksData } = useTasks({ limit: 5, status: 'pending' });

  // Extract real data or use defaults
  const stats = dashboardStats?.data || {};
  const health = healthData?.data || {};
  const conversations = conversationsData?.data || [];
  const campaigns = campaignsData?.data || [];
  const tasks = tasksData?.data || [];

  // Calculate conversion rate from lead breakdown
  const leadBreakdown = (stats as any).lead_breakdown || {};
  const totalLeads = Object.values(leadBreakdown).reduce((sum: number, count: any) => sum + (count || 0), 0);
  const convertedLeads = (leadBreakdown.contacted || 0) + (leadBreakdown.qualified || 0);
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // System status based on health check
  const statusItems = [
    { 
      name: 'WhatsApp API', 
      status: (health as any).wasender_configured ? 'active' : 'inactive', 
      color: (health as any).wasender_configured ? 'bg-green-500' : 'bg-red-500' 
    },
    { 
      name: 'AI Engine', 
      status: (health as any).openai_configured ? 'active' : 'inactive', 
      color: (health as any).openai_configured ? 'bg-green-500' : 'bg-red-500' 
    },
    { 
      name: 'Database', 
      status: (health as any).supabase_connected ? 'active' : 'inactive', 
      color: (health as any).supabase_connected ? 'bg-green-500' : 'bg-red-500' 
    },
    { 
      name: 'Campaign Scheduler', 
      status: 'active', 
      color: 'bg-green-500' 
    },
  ];

  // Metrics with real data
  const metrics = [
    {
      title: 'Total Conversations',
      value: (stats as any).total_conversations?.toString() || '0',
      change: '+12.5%', // Could be calculated from historical data
      trend: 'up',
      period: 'vs last week',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Messages Today',
      value: (stats as any).messages_today?.toString() || '0',
      change: '+8.3%',
      trend: (stats as any).messages_today > 0 ? 'up' : 'neutral',
      period: 'vs yesterday',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Campaigns',
      value: (stats as any).total_campaigns?.toString() || '0',
      change: campaigns.filter((c: Campaign) => c.status === 'active').length > 0 ? 'Active now' : 'None active',
      trend: 'neutral',
      period: '',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: '-2.1%', // Could be calculated from historical data
      trend: 'down',
      period: 'vs last month',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  // Recent activity from real data
  const recentActivity = [
    // Add new contacts
    ...conversations.slice(0, 2).map((conv: Conversation) => ({
      type: 'contact',
      title: `New contact ${conv.contact?.name || conv.contact?.phone_number} added`,
      time: getTimeAgo(conv.last_message_at),
      icon: Users,
      color: 'text-blue-600'
    })),
    // Add campaign activity
    ...campaigns.slice(0, 1).map((campaign: Campaign) => ({
      type: 'campaign',
      title: `Campaign ${campaign.name} ${campaign.status}`,
      time: getTimeAgo(campaign.created_at),
      icon: BarChart3,
      color: 'text-purple-600'
    })),
    // Add task activity
    ...tasks.slice(0, 1).map((task: any) => ({
      type: 'task',
      title: `Task "${task.title}" ${task.status}`,
      time: getTimeAgo(task.created_at),
      icon: Clock,
      color: 'text-orange-600'
    })),
    // Add message activity
    ...conversations.slice(0, 1).map((conv: Conversation) => ({
      type: 'message',
      title: `${conv.last_message_role === 'user' ? 'Received' : 'Sent'} message from ${conv.contact?.name || conv.contact?.phone_number}`,
      time: getTimeAgo(conv.last_message_at),
      icon: MessageSquare,
      color: 'text-green-600'
    }))
  ].slice(0, 5); // Limit to 5 items

  // Recent conversations with real data
  const recentConversations = conversations.slice(0, 5).map((conv: Conversation) => ({
    name: conv.contact?.name || conv.contact?.phone_number || 'Unknown',
    message: conv.last_message_preview || 'No messages yet',
    time: getTimeAgo(conv.last_message_at),
    avatar: getInitials(conv.contact?.name || conv.contact?.phone_number || 'U'),
    unread: conv.unread_count || 0
  }));

  const quickActions = [
    { title: 'New Message', icon: MessageSquare, color: 'bg-blue-500' },
    { title: 'Add Contact', icon: UserPlus, color: 'bg-green-500' },
    { title: 'New Campaign', icon: BarChart3, color: 'bg-purple-500' },
    { title: 'View Reports', icon: FileText, color: 'bg-orange-500' }
  ];

  // Upcoming tasks with real data
  const upcomingTasks = tasks.slice(0, 5).map((task: any) => ({
    title: task.title,
    completed: task.status === 'completed',
    priority: task.priority,
    dueDate: task.due_date
  }));

  // Active campaigns with real data
  const activeCampaigns = campaigns.map((campaign: Campaign) => ({
    name: campaign.name,
    status: campaign.status === 'completed' ? 'Completed' : 
            campaign.status === 'active' ? 'Active' : 'Scheduled',
    recipients: campaign.total_contacts || 0,
    delivered: `${campaign.successful_sends || 0} (${campaign.success_rate?.toFixed(1) || 0}%)`,
    responseRate: '0%', // Would need response tracking from backend
    created: formatDate(campaign.created_at),
    statusColor: campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                campaign.status === 'active' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
  }));

  // Helper functions
  function getTimeAgo(dateString: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  function getInitials(name: string): string {
    if (!name) return 'U';
    if (name.startsWith('+')) {
      // For phone numbers, use first two digits after country code
      const digits = name.replace(/\D/g, '');
      return digits.slice(-2);
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Loading state
  if (statsLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-slate-800 flex flex-col items-center py-4 space-y-4">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col space-y-3 text-gray-400">
          <div className="w-8 h-8 flex items-center justify-center hover:text-white cursor-pointer">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center hover:text-white cursor-pointer">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center hover:text-white cursor-pointer">
            <Users className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center hover:text-white cursor-pointer">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 flex items-center justify-center hover:text-white cursor-pointer">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-16 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome back! Here's your WhatsApp activity overview.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-64"
              />
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-6 mb-6">
          {statusItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    {metric.change && (
                      <div className="flex items-center mt-1">
                        {metric.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                        {metric.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                        <span className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.change} {metric.period}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversation Trends Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Conversation Trends</CardTitle>
                <div className="flex space-x-2">
                  {['Day', 'Week', 'Month'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Showing {(stats as any).total_conversations || 0} total conversations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Campaigns */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Campaigns</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Campaign</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Recipients</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Delivery</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCampaigns.length > 0 ? activeCampaigns.map((campaign: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">
                            <div>
                              <p className="font-medium text-gray-900">{campaign.name}</p>
                              <p className="text-sm text-gray-500">{campaign.created}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge className={campaign.statusColor}>
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-gray-900">{campaign.recipients}</td>
                          <td className="py-3 text-gray-900">{campaign.delivered}</td>
                          <td className="py-3 text-gray-900">{campaign.responseRate}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No campaigns found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentConversations.length > 0 ? recentConversations.map((conversation, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {conversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{conversation.time}</span>
                            {conversation.unread > 0 && (
                              <div className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unread}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conversation.message}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No conversations yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Tasks</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.length > 0 ? upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          task.priority === 'high' ? 'border-red-200 text-red-700' :
                          task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-gray-200 text-gray-700'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No upcoming tasks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lead Qualification Analytics */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Lead Qualification Analytics</h2>
          <LeadQualificationWidget />
        </div>
      </div>
    </div>
  );
} 