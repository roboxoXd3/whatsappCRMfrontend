'use client';

import { useState } from 'react';
import { TrendingUp, Users, MessageSquare, Clock, CheckCircle, AlertCircle, Calendar, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BulkSendStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const stats = {
    overview: {
      totalJobs: 45,
      totalMessagesSent: 1250,
      averageSuccessRate: 94.2,
      totalContacts: 320,
      activeJobs: 2,
      averageResponseTime: '2.3s'
    },
    trends: {
      dailyMessages: [
        { date: '2024-01-11', sent: 45, failed: 2 },
        { date: '2024-01-12', sent: 67, failed: 3 },
        { date: '2024-01-13', sent: 89, failed: 1 },
        { date: '2024-01-14', sent: 123, failed: 5 },
        { date: '2024-01-15', sent: 156, failed: 4 },
        { date: '2024-01-16', sent: 134, failed: 2 },
        { date: '2024-01-17', sent: 178, failed: 6 }
      ]
    },
    performance: {
      successRate: 94.2,
      averageDeliveryTime: '1.8s',
      peakHour: '2:00 PM',
      bestDay: 'Tuesday',
      totalCost: 12.50,
      costPerMessage: 0.01
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Messages Sent</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalMessagesSent.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                +12% from last week
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
              <p className="text-3xl font-bold text-gray-900">{stats.overview.averageSuccessRate}%</p>
              <p className="text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                +2.1% from last week
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
              <p className="text-3xl font-bold text-gray-900">{stats.overview.totalContacts}</p>
              <p className="text-sm text-blue-600 mt-1">
                <Users className="h-4 w-4 inline mr-1" />
                +8 new this week
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
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.activeJobs}</p>
              <p className="text-sm text-gray-500 mt-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Currently running
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900">${stats.performance.totalCost}</p>
              <p className="text-sm text-gray-500 mt-1">
                ${stats.performance.costPerMessage} per message
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
              <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overview.averageResponseTime}</p>
              <p className="text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                15% faster
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
          
          <div className="space-y-4">
            {stats.trends.dailyMessages.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">{formatDate(day.date)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{day.sent} sent</div>
                    <div className="text-xs text-red-500">{day.failed} failed</div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(day.sent / 200) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <p className="text-lg font-bold text-green-600">{stats.performance.successRate}%</p>
                <p className="text-xs text-gray-500">Excellent</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Avg. Delivery Time</p>
                  <p className="text-xs text-gray-500">Time to deliver messages</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{stats.performance.averageDeliveryTime}</p>
                <p className="text-xs text-gray-500">Very fast</p>
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
                <p className="text-lg font-bold text-purple-600">{stats.performance.peakHour}</p>
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
                <p className="text-lg font-bold text-orange-600">{stats.performance.bestDay}</p>
                <p className="text-xs text-gray-500">Optimal day</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Optimize Timing</span>
            </div>
            <p className="text-sm text-blue-800">
              Send messages around 2:00 PM for highest success rates based on your data.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Great Performance</span>
            </div>
            <p className="text-sm text-green-800">
              Your 94.2% success rate is excellent. Keep up the good work!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 