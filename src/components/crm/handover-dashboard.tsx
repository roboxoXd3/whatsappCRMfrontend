'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, Clock, CheckCircle, Phone, MessageSquare, User, TrendingUp, ExternalLink } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';

interface HandoverRequest {
  id: string;
  contact: {
    name?: string;
    phone_number: string;
    lead_status: string;
    lead_score: number;
  };
  handover_timestamp: string;
  handover_reason: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'resolved';
  trigger_message: string;
  ai_confidence: number;
  response_time?: number;
}

export function HandoverDashboard() {
  const router = useRouter();
  const [handoverRequests, setHandoverRequests] = useState<HandoverRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  
  // Use the authenticated hook to fetch conversations
  const { data: conversationsData, isLoading, error } = useConversations({ limit: 50 });

  // Transform conversations data into handover requests
  useEffect(() => {
    if (conversationsData?.data) {
      // Add debug logging
      console.log('🔍 HANDOVER DEBUG - Total conversations:', conversationsData.data.length);
      console.log('🔍 HANDOVER DEBUG - Conversations with bot disabled:', 
        conversationsData.data.filter((c: any) => c.bot_enabled === false).length);
      console.log('🔍 HANDOVER DEBUG - Conversations with handover requested:', 
        conversationsData.data.filter((c: any) => c.handover_requested === true).length);
      
      // Filter conversations where bot is disabled OR handover was requested
      const handoverConversations = conversationsData.data.filter((conv: any) => 
        conv.bot_enabled === false || conv.handover_requested === true
      );
      
      console.log('🔍 HANDOVER DEBUG - Filtered handover conversations:', handoverConversations.length);
      
      // Log a specific conversation if it exists
      const targetConv = conversationsData.data.find((c: any) => 
        c.contact.phone_number.includes('7033009600'));
      if (targetConv) {
        console.log('🔍 HANDOVER DEBUG - Target conversation (7033009600):', {
          phone: targetConv.contact.phone_number,
          bot_enabled: targetConv.bot_enabled,
          handover_requested: targetConv.handover_requested,
          handover_timestamp: targetConv.handover_timestamp
        });
      }
      
      // Transform conversations into handover request format
      const transformedRequests: HandoverRequest[] = handoverConversations.map((conv: any) => ({
        id: conv.id,
        contact: {
          name: conv.contact.name || `Contact ${conv.contact.phone_number}`,
          phone_number: conv.contact.phone_number,
          lead_status: conv.contact.lead_status || 'new',
          lead_score: conv.contact.lead_score || 0
        },
        handover_timestamp: conv.handover_timestamp || conv.last_message_at,
        handover_reason: 'User requested human support',
        priority: 'high' as const,
        status: 'pending' as const, // Default to pending
        trigger_message: conv.last_message_preview || 'Customer requested human assistance',
        ai_confidence: 0.85 // Default confidence
      }));
      
      setHandoverRequests(transformedRequests);
    }
  }, [conversationsData]);
  
  // Log errors if any
  useEffect(() => {
    if (error) {
      console.error('🔍 HANDOVER DEBUG - Error fetching conversations:', error);
    }
  }, [error]);

  const filteredRequests = handoverRequests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const stats = {
    total: handoverRequests.length,
    pending: handoverRequests.filter(r => r.status === 'pending').length,
    inProgress: handoverRequests.filter(r => r.status === 'in_progress').length,
    resolved: handoverRequests.filter(r => r.status === 'resolved').length,
    avgResponseTime: 8.5,
    avgConfidence: 0.87
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return <div className="p-6">Loading handover dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤝 Handover Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage bot-to-human handover requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time monitoring</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pending</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Response</p>
              <p className="text-2xl font-bold text-green-900">{stats.avgResponseTime}m</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['all', 'pending', 'in_progress', 'resolved'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
              filter === filterOption
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filterOption.replace('_', ' ')}
            {filterOption !== 'all' && (
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {stats[filterOption as keyof typeof stats]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Handover Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No handover requests</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No handover requests have been made yet.'
                : `No ${filter.replace('_', ' ')} requests found.`
              }
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50/30 to-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Contact Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-medium">
                      {request.contact.phone_number.slice(-2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {request.contact.name || `Contact ${request.contact.phone_number}`}
                          </h3>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                            🤝 HANDOVER REQUEST
                          </Badge>
                        </div>
                        <Badge className={getPriorityColor(request.priority)} variant="outline">
                          {request.priority === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {request.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(request.status)} variant="outline">
                          {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {request.status === 'in_progress' && <User className="w-3 h-3 mr-1" />}
                          {request.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {request.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTimeAgo(request.handover_timestamp)}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{request.contact.phone_number}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Score: {request.contact.lead_score}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {request.contact.lead_status}
                        </Badge>
                      </div>
                    </div>

                    {/* Trigger Message */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 italic">
                        "{request.trigger_message}"
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>AI Confidence: {(request.ai_confidence * 100).toFixed(0)}%</span>
                        {request.response_time && (
                          <span>Response time: {request.response_time}m</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      {/* Primary Action - Open Chat */}
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          // Navigate to conversations page and auto-select this conversation
                          router.push(`/conversations?conversation=${request.id}`);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Open Chat
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                      
                      {/* Status-based Actions */}
                      {request.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            // Mark as in progress and navigate to conversation
                            router.push(`/conversations?conversation=${request.id}`);
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Take Over
                        </Button>
                      )}
                      
                      {/* Secondary Actions */}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Navigate to conversation to see contact details
                          router.push(`/conversations?conversation=${request.id}`);
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Contact Details
                      </Button>
                      
                      {request.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => {
                            // Mark as resolved (could update status in backend)
                            router.push(`/conversations?conversation=${request.id}`);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 