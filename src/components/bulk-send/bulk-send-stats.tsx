'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, MessageSquare, Clock, CheckCircle, BarChart3, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth';

interface Stats {
  overview: {
    total_campaigns: number;
    total_messages_sent: number;
    successful_sends: number;
    failed_sends: number;
    success_rate: number;
    active_jobs: number;
    total_contacts: number;
  };
  daily_trends: Array<{
    date: string;
    sent: number;
    failed: number;
    campaigns: number;
  }>;
  performance: {
    success_rate: number;
    average_campaign_size: number;
    total_cost: number;
    cost_per_message: number;
    peak_hour: string;
    best_day: string;
    average_completion_time: string;
  };
  today: {
    campaigns: number;
    messages_sent: number;
    successful: number;
    failed: number;
  };
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

export function BulkSendStats() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/statistics?days=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching bulk send statistics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">Error loading statistics: {error}</p>
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Period Selector and Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <Button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                variant={selectedPeriod === days ? "default" : "outline"}
                size="sm"
              >
                Last {days} days
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Messages Sent</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.total_messages_sent.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="text-green-600">{stats.overview.successful_sends.toLocaleString()} successful</span>
                {stats.overview.failed_sends > 0 && (
                  <span className="text-red-600 ml-2">{stats.overview.failed_sends} failed</span>
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.success_rate}%</p>
              <p className="text-sm text-gray-600 mt-1">
                <CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />
                {stats.overview.success_rate >= 90 ? 'Excellent' : stats.overview.success_rate >= 75 ? 'Good' : 'Needs improvement'}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.total_contacts.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">
                <Users className="h-4 w-4 inline mr-1" />
                In your database
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.total_campaigns}</p>
              <p className="text-sm text-gray-500 mt-1">
                <Clock className="h-4 w-4 inline mr-1 text-orange-600" />
                {stats.overview.active_jobs} currently running
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900">${stats.performance.total_cost.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                ${stats.performance.cost_per_message.toFixed(3)} per message
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Messages</p>
              <p className="text-3xl font-bold text-gray-900">{stats.today.messages_sent}</p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="text-green-600">{stats.today.successful} sent</span>
                {stats.today.failed > 0 && (
                  <span className="text-red-600 ml-2">{stats.today.failed} failed</span>
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Daily Message Trends</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Last 7 days</Badge>
            </div>
          </div>
          
          {stats.daily_trends.length > 0 ? (
            <div className="space-y-4">
              {stats.daily_trends.map((day, index) => {
                const maxSent = Math.max(...stats.daily_trends.map(d => d.sent), 1);
                return (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium">{formatDate(day.date)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{day.sent} sent</div>
                        {day.failed > 0 && (
                          <div className="text-xs text-red-500">{day.failed} failed</div>
                        )}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(day.sent / maxSent) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>No data available for this period</p>
            </div>
          )}
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Performance Insights</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Success Rate</p>
                  <p className="text-xs text-gray-500">Messages delivered successfully</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">{stats.performance.success_rate}%</p>
                <p className="text-xs text-gray-500">
                  {stats.performance.success_rate >= 90 ? 'Excellent' : stats.performance.success_rate >= 75 ? 'Good' : 'Fair'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Avg. Campaign Size</p>
                  <p className="text-xs text-gray-500">Contacts per campaign</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{Math.round(stats.performance.average_campaign_size)}</p>
                <p className="text-xs text-gray-500">contacts</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Peak Hour</p>
                  <p className="text-xs text-gray-500">Most active sending time</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-600">{stats.performance.peak_hour}</p>
                <p className="text-xs text-gray-500">Best time</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Best Day</p>
                  <p className="text-xs text-gray-500">Highest success rate</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-orange-600">{stats.performance.best_day}</p>
                <p className="text-xs text-gray-500">Optimal day</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Avg. Completion Time</p>
                  <p className="text-xs text-gray-500">Time to complete campaigns</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-600">{stats.performance.average_completion_time}</p>
                <p className="text-xs text-gray-500">duration</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.performance.peak_hour !== 'N/A' && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Optimize Timing</span>
              </div>
              <p className="text-sm text-blue-800">
                Send messages around {stats.performance.peak_hour} for highest engagement based on your data.
              </p>
            </div>
          )}
          
          {stats.performance.success_rate >= 90 ? (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Excellent Performance</span>
              </div>
              <p className="text-sm text-green-800">
                Your {stats.performance.success_rate}% success rate is excellent. Keep up the good work!
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Room for Improvement</span>
              </div>
              <p className="text-sm text-yellow-800">
                Consider reviewing failed messages to identify patterns and improve success rates.
              </p>
            </div>
          )}

          {stats.performance.best_day !== 'N/A' && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Best Day Strategy</span>
              </div>
              <p className="text-sm text-purple-800">
                {stats.performance.best_day} shows the best results. Consider scheduling more campaigns on this day.
              </p>
            </div>
          )}

          {stats.overview.total_contacts > stats.overview.total_messages_sent && (
            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">Untapped Contacts</span>
              </div>
              <p className="text-sm text-indigo-800">
                You have {stats.overview.total_contacts - stats.overview.total_messages_sent} contacts that haven't been reached yet.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 