"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AIInsightsCard from './AIInsightsCard';
import { SendMessageModal } from './SendMessageModal';
import { toast } from 'sonner';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Star, 
  TrendingUp, 
  Briefcase, 
  Activity, 
  Edit, 
  MessageCircle, 
  Calendar, 
  ArrowLeft,
  MapPin,
  Clock,
  Target,
  BarChart3,
  Users,
  DollarSign,
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface UserDetailCardProps {
  user: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone_number: string;
    position?: string;
    lead_status?: string;
    lead_score?: number;
    crm_summary?: string;
    avatar_url?: string;
    tags?: string[];
  };
  stats?: {
    total_messages?: number;
    last_activity?: string;
    avg_response_time?: string;
  };
  activity?: { date: string; description: string }[];
  onBack?: () => void;
}

const getLeadStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'qualified':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'new':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'contacted':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'proposal':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'won':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'lost':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const UserDetailCard: React.FC<UserDetailCardProps> = ({ user, stats, activity, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingName, setIsFetchingName] = useState(false);
  const [contactName, setContactName] = useState(user.name || '');
  const [showFullActivity, setShowFullActivity] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const leadScore = user.lead_score || 0;
  const scorePercentage = Math.min(leadScore, 100);

  const handleSendMessage = () => {
    // Open the message modal instead of navigating
    setIsMessageModalOpen(true);
  };

  const handleFetchName = async () => {
    setIsFetchingName(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE}/api/crm/contact/${user.id}/fetch-name`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setContactName(data.data.name);
        toast.success(`Contact name fetched: ${data.data.name}`, {
          description: data.data.verified_name ? `Verified business: ${data.data.verified_name}` : undefined
        });
        
        // Optionally reload the page to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('Failed to fetch name', {
          description: data.message || 'Unable to get contact name from WhatsApp'
        });
      }
    } catch (error) {
      console.error('Error fetching contact name:', error);
      toast.error('Network error', {
        description: 'Failed to connect to server'
      });
    } finally {
      setIsFetchingName(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to CRM
                </Button>
              )}
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">Lead Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile & Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="h-24 w-24 rounded-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">{contactName || 'Unknown Contact'}</h2>
                    {(!contactName || contactName === 'Unknown Contact') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleFetchName}
                        disabled={isFetchingName}
                        className="h-7 px-2 text-xs hover:bg-blue-50 hover:border-blue-300 transition-all"
                        title="Fetch name from WhatsApp"
                      >
                        {isFetchingName ? (
                          <>
                            <span className="animate-spin mr-1">⏳</span>
                            Fetching...
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Get Name
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1 mb-4">
                    {user.position && (
                      <p className="text-gray-600 flex items-center justify-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {user.position}
                      </p>
                    )}
                    {user.company && (
                      <p className="text-blue-600 font-medium flex items-center justify-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {user.company}
                      </p>
                    )}
                  </div>

                  {/* Status & Score */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    {user.lead_status && (
                      <Badge className={`px-3 py-1 font-medium ${getLeadStatusColor(user.lead_status)}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {user.lead_status}
                      </Badge>
                    )}
                    <Badge className="px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200">
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      Score: {leadScore}
                    </Badge>
                  </div>

                  {/* Lead Score Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Lead Score</span>
                      <span className={`text-sm font-bold ${getScoreColor(leadScore)}`}>
                        {leadScore}/100
                      </span>
                    </div>
                    <Progress value={scorePercentage} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {leadScore >= 80 ? 'High Priority' : leadScore >= 60 ? 'Medium Priority' : 'Low Priority'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{user.phone_number}</p>
                  </div>
                </div>
                {user.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">Not specified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Messages</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {stats?.total_messages !== undefined ? stats.total_messages : (
                          <span className="text-lg text-gray-400">No data</span>
                        )}
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-sm font-medium">Response Time</p>
                      <p className="text-3xl font-bold text-emerald-900">
                        {stats?.avg_response_time || (
                          <span className="text-lg text-gray-400">No data</span>
                        )}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-600 text-sm font-medium">Engagement</p>
                      <p className="text-3xl font-bold text-amber-900">
                        {leadScore >= 60 ? 'High' : leadScore >= 30 ? 'Medium' : leadScore > 0 ? 'Low' : (
                          <span className="text-lg text-gray-400">New</span>
                        )}
                      </p>
                    </div>
                    <Flame className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Card */}
            <AIInsightsCard userId={user.id} />

            {/* CRM Summary */}
            {user.crm_summary && (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Lead Summary
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-gray-700 leading-relaxed">{user.crm_summary}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Activity Timeline
                </h3>
                <Button variant="outline" size="sm">
                  Add Note
                </Button>
              </CardHeader>
              <CardContent>
                {activity && activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.slice(0, showFullActivity ? activity.length : 5).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-sm border border-gray-100">
                        <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="h-2 w-2 bg-indigo-600 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium">{item.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {activity.length > 5 && (
                      <div className="text-center pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowFullActivity(!showFullActivity)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {showFullActivity ? 'Show Less' : `Show ${activity.length - 5} More Activities`}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      This contact hasn't had any recorded activities yet.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Add First Activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        phoneNumber={user.phone_number}
        contactName={contactName || user.name || 'Unknown Contact'}
        userId={user.id}
      />
    </div>
  );
}; 