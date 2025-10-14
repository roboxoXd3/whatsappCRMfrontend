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
  Loader2,
  Sparkles,
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';

// Import hooks for real data
import { useDashboardStats, useHealthCheck } from '@/lib/hooks/use-dashboard-data';
import { useConversations, type Conversation } from '@/lib/hooks/use-conversations';
import { useCampaigns, type Campaign } from '@/lib/hooks/use-campaigns';
import { useTasks } from '@/hooks/useCRM';
import LeadQualificationWidget from '@/components/dashboard/lead-qualification-widget';
import { dashboardApi } from '@/lib/api/dashboard';

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');

  // Fetch real data using hooks
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth, isFetching: isRefreshingHealth } = useHealthCheck();
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

  // Handle manual status refresh
  const handleRefreshStatus = async () => {
    // Force live verification when user manually clicks refresh
    await dashboardApi.getHealthCheck(true);
    // Refetch to update React Query cache with fresh data
    await refetchHealth();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Main Content */}
      <div className="p-4 lg:p-6 pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <div className="hidden lg:block w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-sm lg:text-base font-medium">
              Welcome back! Here's your WhatsApp activity overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search conversations, contacts..." 
                className="pl-10 w-full sm:w-64 lg:w-80 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg focus:shadow-xl transition-all duration-200"
              />
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Message</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                System Status
              </h3>
              <div className="flex items-center mt-2 space-x-2">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs text-gray-500 font-medium">
                  Status auto-refreshes every 30s. Click refresh for instant update.
                </p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <Button
              onClick={handleRefreshStatus}
              disabled={isRefreshingHealth}
              variant="outline"
              size="sm"
              className="ml-4 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 hover:shadow-md transition-all duration-200 group"
            >
              <RefreshCw 
                className={`w-4 h-4 mr-2 transition-all duration-500 ${
                  isRefreshingHealth ? 'animate-spin text-blue-600' : 'text-gray-600 group-hover:text-blue-600 group-hover:rotate-180'
                }`} 
              />
              <span className="text-sm font-medium">
                {isRefreshingHealth ? 'Updating...' : 'Refresh'}
              </span>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 lg:flex lg:items-center lg:space-x-8 gap-4 lg:gap-0">
            {statusItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${item.color} shadow-lg`}></div>
                  <div className={`absolute inset-0 w-3 h-3 rounded-full ${item.color} animate-ping opacity-30`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-600 mb-1 truncate">{metric.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                    {metric.change && (
                      <div className="flex items-center">
                        {metric.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />}
                        {metric.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />}
                        <span className={`text-xs font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.change}
                        </span>
                        {metric.period && (
                          <span className="text-xs text-gray-500 ml-1">{metric.period}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`relative p-3 lg:p-4 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <metric.icon className={`w-6 h-6 lg:w-7 lg:h-7 ${metric.color}`} />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversation Trends Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Conversation Trends
                </CardTitle>
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  {['Day', 'Week', 'Month'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                      className={`transition-all duration-200 ${
                        selectedPeriod === period 
                          ? 'bg-white shadow-md text-gray-900' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 lg:h-80 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <BarChart3 className="w-16 h-16 mx-auto text-gray-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">Chart visualization would go here</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Showing <span className="font-semibold text-blue-600">{(stats as any).total_conversations || 0}</span> total conversations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="relative mb-4">
                        <Clock className="w-12 h-12 mx-auto text-gray-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200/20 to-gray-300/20 rounded-full blur-xl"></div>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">No recent activity</p>
                      <p className="text-sm text-gray-500 mt-1">Activity will appear here as you use the system</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Campaigns */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Active Campaigns
                </CardTitle>
                <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {activeCampaigns.length > 0 ? (
                    <div className="hidden lg:block">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 text-sm font-semibold text-gray-700">Campaign</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-700">Recipients</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-700">Delivery</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-700">Response</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeCampaigns.map((campaign: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                              <td className="py-4">
                                <div>
                                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{campaign.name}</p>
                                  <p className="text-sm text-gray-500 font-medium">{campaign.created}</p>
                                </div>
                              </td>
                              <td className="py-4">
                                <Badge className={`${campaign.statusColor} font-medium shadow-sm`}>
                                  {campaign.status}
                                </Badge>
                              </td>
                              <td className="py-4 text-gray-900 font-medium">{campaign.recipients}</td>
                              <td className="py-4 text-gray-900 font-medium">{campaign.delivered}</td>
                              <td className="py-4 text-gray-900 font-medium">{campaign.responseRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="relative mb-4">
                        <BarChart3 className="w-12 h-12 mx-auto text-gray-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-xl"></div>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">No campaigns found</p>
                      <p className="text-sm text-gray-500 mt-1">Create your first campaign to get started</p>
                    </div>
                  )}
                  
                  {/* Mobile view for campaigns */}
                  {activeCampaigns.length > 0 && (
                    <div className="lg:hidden space-y-4">
                      {activeCampaigns.map((campaign: any, index: number) => (
                        <div key={index} className="bg-gray-50/80 rounded-xl p-4 space-y-3 hover:bg-gray-100/80 transition-colors">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                            <Badge className={`${campaign.statusColor} font-medium shadow-sm`}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-medium">Recipients</p>
                              <p className="text-gray-900 font-semibold">{campaign.recipients}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">Delivery</p>
                              <p className="text-gray-900 font-semibold">{campaign.delivered}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">{campaign.created}</span>
                            <span className="text-gray-900 font-semibold">Response: {campaign.responseRate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Conversations */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                  {recentConversations.length > 0 ? recentConversations.map((conversation, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer border border-transparent hover:border-blue-200/50">
                      <Avatar className="h-12 w-12 shadow-md group-hover:scale-110 transition-transform duration-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-semibold">
                          {conversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {conversation.name}
                          </p>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-xs text-gray-500 font-medium">{conversation.time}</span>
                            {conversation.unread > 0 && (
                              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md animate-pulse">
                                {conversation.unread}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate font-medium">{conversation.message}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="relative mb-4">
                        <MessageSquare className="w-12 h-12 mx-auto text-gray-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-xl"></div>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">No conversations yet</p>
                      <p className="text-sm text-gray-500 mt-1">Start a conversation to see it here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-3 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group"
                    >
                      <div className={`relative p-3 rounded-xl ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="w-5 h-5 text-white" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Upcoming Tasks
                </CardTitle>
                <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                  {upcomingTasks.length > 0 ? upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group cursor-pointer border border-transparent hover:border-indigo-200/50">
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-md group-hover:border-indigo-400 transition-colors duration-200"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 group-hover:text-indigo-600'} transition-colors`}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 font-medium mt-1">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`font-medium shadow-sm ${
                          task.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                          task.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                          'border-gray-200 text-gray-700 bg-gray-50'
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="relative mb-4">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-xl"></div>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">No upcoming tasks</p>
                      <p className="text-sm text-gray-500 mt-1">Add tasks to stay organized</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lead Qualification Analytics */}
        <div className="mt-12">
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 flex items-center">
              <Sparkles className="w-6 h-6 lg:w-7 lg:h-7 mr-3 text-purple-600" />
              AI Lead Qualification Analytics
            </h2>
            <p className="text-gray-600 font-medium">Advanced insights powered by artificial intelligence</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/20">
            <LeadQualificationWidget />
          </div>
        </div>
      </div>
    </div>
  );
} 