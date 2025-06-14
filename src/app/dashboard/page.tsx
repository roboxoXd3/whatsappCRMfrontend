'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { useDashboardStats, useSystemStatus } from '@/lib/hooks/use-dashboard-data';
import { formatTimeAgo } from '@/lib/utils';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Megaphone,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: statusData, isLoading: statusLoading } = useSystemStatus();

  const stats = statsData?.data;
  const systemStatus = statusData?.data;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'down':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your WhatsApp CRM.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.api_status)}
                <div>
                  <p className="text-sm font-medium">API</p>
                  <Badge variant={getStatusBadgeVariant(systemStatus.api_status) as any}>
                    {systemStatus.api_status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.database_status)}
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <Badge variant={getStatusBadgeVariant(systemStatus.database_status) as any}>
                    {systemStatus.database_status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.whatsapp_status)}
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <Badge variant={getStatusBadgeVariant(systemStatus.whatsapp_status) as any}>
                    {systemStatus.whatsapp_status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.ai_status)}
                <div>
                  <p className="text-sm font-medium">AI Service</p>
                  <Badge variant={getStatusBadgeVariant(systemStatus.ai_status) as any}>
                    {systemStatus.ai_status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Last updated: {systemStatus.last_updated ? formatTimeAgo(systemStatus.last_updated) : 'Unknown'} • 
              Uptime: {systemStatus.uptime || 'N/A'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Conversations"
          value={stats?.total_conversations || 0}
          change="+12%"
          trend="up"
          icon={<MessageSquare />}
          description="from last month"
          loading={statsLoading}
        />
        <StatsCard
          title="Total Contacts"
          value={stats?.total_contacts || 0}
          change="+8%"
          trend="up"
          icon={<Users />}
          description="from last month"
          loading={statsLoading}
        />
        <StatsCard
          title="Messages Today"
          value={stats?.messages_today || 0}
          change="+23%"
          trend="up"
          icon={<TrendingUp />}
          description="from yesterday"
          loading={statsLoading}
        />
        <StatsCard
          title="Active Campaigns"
          value={stats?.active_campaigns || 0}
          change="0%"
          trend="neutral"
          icon={<Megaphone />}
          description="currently running"
          loading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_activity?.length ? (
              <div className="space-y-4">
                {stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.contact}</span>
                        {activity.type === 'new_contact' && ' joined as a new contact'}
                        {activity.type === 'new_message' && ' sent a new message'}
                        {activity.type === 'campaign_sent' && ' received a campaign message'}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full justify-between">
                  View all activity
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-sm font-medium">
                  {stats?.avg_response_time || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium">
                  {stats?.conversion_rate ? `${stats.conversion_rate}%` : 'N/A'}
                </span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Top Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {stats?.top_keywords?.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {statsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">
                Failed to load dashboard data. Please check your connection and try again.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 