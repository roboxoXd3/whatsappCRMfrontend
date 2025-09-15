"use client"

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Zap,
  BarChart3,
  Users,
  DollarSign,
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
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
  const [showFullActivity, setShowFullActivity] = useState(false);
  const leadScore = user.lead_score || 0;
  const scorePercentage = Math.min(leadScore, 100);

  const handleSendMessage = () => {
    // TODO: Implement send message functionality
    console.log('Send message to:', user.phone_number);
  };

  const handleCall = () => {
    // TODO: Implement call functionality
    window.open(`tel:${user.phone_number}`, '_self');
  };

  const handleSchedule = () => {
    // TODO: Implement schedule functionality
    console.log('Schedule meeting with:', user.name);
  };

  const handleViewChat = () => {
    // TODO: Navigate to chat view
    console.log('View chat for:', user.id);
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name || 'Unknown Contact'}</h2>
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
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Messages</p>
                      <p className="text-3xl font-bold text-blue-900">{stats?.total_messages || 22}</p>
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
                      <p className="text-3xl font-bold text-emerald-900">{stats?.avg_response_time || '2 hours'}</p>
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
                      <p className="text-3xl font-bold text-amber-900">High</p>
                    </div>
                    <Flame className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

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
                <div className="space-y-4">
                  {/* Recent Activities */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Discovery Call Invitation</p>
                        <p className="text-sm text-gray-600">Calendly invitation sent</p>
                        <p className="text-xs text-gray-500 mt-1">2025-09-13T06:12:39.967968+00:00</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Sent</Badge>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Lead Qualification: Qualified</p>
                        <p className="text-sm text-gray-600">Lead - Discovery Call Invited</p>
                        <p className="text-xs text-gray-500 mt-1">2025-09-13T06:12:38.360702+00:00</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">Qualified</Badge>
                    </div>
                  </div>

                  {/* Additional Activity Items */}
                  {activity && activity.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      {activity.slice(0, showFullActivity ? activity.length : 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-sm">
                          <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-gray-400 rounded-full" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{item.description}</p>
                            <p className="text-xs text-gray-500">{item.date}</p>
                          </div>
                        </div>
                      ))}
                      {activity.length > 3 && (
                        <div className="text-center pt-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowFullActivity(!showFullActivity)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {showFullActivity ? 'Show Less' : `Show ${activity.length - 3} More Activities`}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleSendMessage}
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 hover:shadow-md"
                  >
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Send Message</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCall}
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-200 transition-all duration-200 hover:shadow-md"
                  >
                    <Phone className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Call</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSchedule}
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 hover:shadow-md"
                  >
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Schedule</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleViewChat}
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-200 transition-all duration-200 hover:shadow-md"
                  >
                    <ExternalLink className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">View Chat</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}; 