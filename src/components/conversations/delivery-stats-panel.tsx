'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, MessageCircle, CheckCheck, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { conversationsService } from '@/lib/api/conversations';
import { cn } from '@/lib/utils';

interface DeliveryStatsPanelProps {
  conversationId: string;
  className?: string;
  variant?: 'compact' | 'detailed';
}

interface DeliveryStats {
  total_sent: number;
  total_delivered: number;
  total_read: number;
  delivery_rate: number;
  read_rate: number;
}

export function DeliveryStatsPanel({ 
  conversationId, 
  className,
  variant = 'detailed' 
}: DeliveryStatsPanelProps) {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await conversationsService.getDeliveryStats(conversationId);
      
      if (response.status === 'success' && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load delivery statistics');
      }
    } catch (err) {
      setError('Failed to load delivery statistics');
      console.error('Error fetching delivery stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [conversationId]);

  const getDeliveryRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getReadRateColor = (rate: number) => {
    if (rate >= 80) return 'text-blue-600 bg-blue-50';
    if (rate >= 60) return 'text-purple-600 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={cn("text-center py-4", className)}>
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-2">{error || 'No delivery data'}</p>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          Retry
        </Button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3 text-gray-500" />
          <span>{stats.total_sent}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCheck className="h-3 w-3 text-green-500" />
          <span>{stats.total_delivered}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3 text-blue-500" />
          <span>{stats.total_read}</span>
        </div>
        <Badge variant="outline" className={getDeliveryRateColor(stats.delivery_rate)}>
          {stats.delivery_rate.toFixed(0)}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Delivery Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Message counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Sent</span>
            </div>
            <div className="text-lg font-semibold">{stats.total_sent}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCheck className="h-4 w-4 text-green-500" />
              <span className="text-xs text-gray-500">Delivered</span>
            </div>
            <div className="text-lg font-semibold text-green-600">{stats.total_delivered}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500">Read</span>
            </div>
            <div className="text-lg font-semibold text-blue-600">{stats.total_read}</div>
          </div>
        </div>

        {/* Rates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Delivery Rate</span>
            <Badge className={getDeliveryRateColor(stats.delivery_rate)}>
              {stats.delivery_rate.toFixed(1)}%
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Read Rate</span>
            <Badge className={getReadRateColor(stats.read_rate)}>
              {stats.read_rate.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Delivery</span>
              <span>{stats.delivery_rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats.delivery_rate, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Read</span>
              <span>{stats.read_rate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats.read_rate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 