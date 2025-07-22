'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Calendar,
  Clock,
  Users,
  Search,
  RefreshCw,
  Trash2,
  Send,
  Repeat,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  MessageSquare,
  X
} from 'lucide-react';

interface ScheduledMessage {
  id: string;
  message_content: string;
  message_type: string;
  target_groups: string[];
  scheduled_at: string;
  next_send_at?: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  recurring_pattern?: 'daily' | 'weekly' | 'monthly';
  recurring_interval?: number;
  total_sent: number;
  total_failed: number;
  campaign_name?: string;
  created_at: string;
  executed_at?: string;
  error_message?: string;
}

interface ScheduledMessagesResponse {
  success: boolean;
  data: {
    scheduled_messages: ScheduledMessage[];
    total: number;
  };
  error?: string;
}

interface CancelResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default function ScheduledMessagesPage() {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ScheduledMessage | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // API base URL from environment
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Load scheduled messages
  const loadScheduledMessages = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_BASE}/api/group-messaging/scheduled-messages?${params}`);
      const data: ScheduledMessagesResponse = await response.json();

      if (data.success) {
        setScheduledMessages(data.data.scheduled_messages);
      } else {
        toast.error('Failed to load scheduled messages');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel scheduled message
  const cancelScheduledMessage = async (messageId: string) => {
    setIsCancelling(messageId);
    try {
      const response = await fetch(`${API_BASE}/api/group-messaging/scheduled-messages/${messageId}`, {
        method: 'DELETE',
      });

      const data: CancelResponse = await response.json();

      if (data.success) {
        toast.success('Scheduled message cancelled successfully');
        loadScheduledMessages(); // Reload the list
      } else {
        toast.error(data.error || 'Failed to cancel scheduled message');
      }
    } catch (error) {
      toast.error('Failed to cancel scheduled message');
    } finally {
      setIsCancelling(null);
    }
  };

  // Filter messages based on search term
  const filteredMessages = scheduledMessages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.message_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Loader2;
      case 'sent': return CheckCircle;
      case 'failed': return AlertCircle;
      case 'cancelled': return Trash2;
      default: return Clock;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate time until scheduled
  const getTimeUntilScheduled = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffMs = scheduled.getTime() - now.getTime();

    if (diffMs <= 0) return 'Overdue';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  // Load initial data
  useEffect(() => {
    loadScheduledMessages();
  }, [statusFilter]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Messages</h1>
        <p className="text-gray-600">View, track, and manage your scheduled WhatsApp messages</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search messages or campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="min-w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={loadScheduledMessages}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Messages ({filteredMessages.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading scheduled messages...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No scheduled messages found</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Schedule your first message from the Group Creation page'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => {
                const StatusIcon = getStatusIcon(message.status);
                const canCancel = message.status === 'pending';

                return (
                  <div
                    key={message.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusIcon 
                            className={`h-5 w-5 ${
                              message.status === 'processing' ? 'animate-spin' : ''
                            }`} 
                          />
                          <Badge variant={getStatusVariant(message.status)}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {message.campaign_name || 'Scheduled Message'}
                            </h3>
                            {message.recurring_pattern && (
                              <Badge variant="outline" className="text-xs">
                                <Repeat className="h-3 w-3 mr-1" />
                                {message.recurring_pattern}
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {message.message_content}
                          </p>

                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Scheduled: {formatDate(message.scheduled_at)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{message.target_groups.length} group{message.target_groups.length !== 1 ? 's' : ''}</span>
                            </div>

                            {message.status === 'pending' && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>In {getTimeUntilScheduled(message.scheduled_at)}</span>
                              </div>
                            )}

                            {(message.total_sent > 0 || message.total_failed > 0) && (
                              <div className="flex items-center gap-1">
                                <Send className="h-3 w-3" />
                                <span>
                                  Sent: {message.total_sent}, Failed: {message.total_failed}
                                </span>
                              </div>
                            )}
                          </div>

                          {message.error_message && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              {message.error_message}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        {canCancel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelScheduledMessage(message.id)}
                            disabled={isCancelling === message.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {isCancelling === message.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Details
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <p className="text-gray-900">{selectedMessage.campaign_name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="whitespace-pre-wrap">{selectedMessage.message_content}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Badge variant={getStatusVariant(selectedMessage.status)}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Groups
                  </label>
                  <p className="text-gray-900">{selectedMessage.target_groups.length} groups</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled At
                  </label>
                  <p className="text-gray-900">{formatDate(selectedMessage.scheduled_at)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created At
                  </label>
                  <p className="text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                </div>
              </div>

              {selectedMessage.recurring_pattern && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurring Pattern
                  </label>
                  <Badge variant="outline">
                    <Repeat className="h-3 w-3 mr-1" />
                    {selectedMessage.recurring_pattern}
                  </Badge>
                </div>
              )}

              {(selectedMessage.total_sent > 0 || selectedMessage.total_failed > 0) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Statistics
                  </label>
                  <div className="flex gap-4">
                    <div className="text-green-600">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Sent: {selectedMessage.total_sent}
                    </div>
                    <div className="text-red-600">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Failed: {selectedMessage.total_failed}
                    </div>
                  </div>
                </div>
              )}

              {selectedMessage.error_message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error Message
                  </label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
                    {selectedMessage.error_message}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 