import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building2, Mail, Phone, Star, TrendingUp, Briefcase, Activity, Edit, MessageCircle, Calendar, ArrowLeft } from 'lucide-react';

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

export const UserDetailCard: React.FC<UserDetailCardProps> = ({ user, stats, activity, onBack }) => {
  return (
    <Card className="max-w-2xl mx-auto mt-8 shadow-xl rounded-2xl border-0 bg-white">
      <CardHeader className="flex flex-col items-center pt-8 pb-4 px-8">
        <div className="w-full flex items-center justify-between mb-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          )}
          <div className="flex-1 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center shadow text-5xl font-bold text-blue-700">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-blue-600" />
              )}
            </div>
          </div>
          <Button variant="outline" size="icon" className="ml-auto">
            <Edit className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        <h2 className="font-bold text-2xl text-gray-900 text-center mb-1">{user.name}</h2>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          {user.company && (
            <span className="flex items-center gap-1 text-blue-700 font-medium text-base">
              <Building2 className="h-4 w-4 text-blue-400" />
              {user.company}
            </span>
          )}
          {user.position && (
            <span className="flex items-center gap-1 text-gray-600 text-base">
              <Briefcase className="h-4 w-4 text-gray-400" />
              {user.position}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          {user.lead_status && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              {user.lead_status}
            </Badge>
          )}
          {user.lead_score !== undefined && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 font-bold">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {user.lead_score}
            </Badge>
          )}
          {user.tags && user.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">{tag}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
          <span className="flex items-center gap-1 text-gray-900 font-bold">
            <Phone className="h-4 w-4 text-gray-400" />
            {user.phone_number}
          </span>
          {user.email && (
            <span className="flex items-center gap-1 text-gray-700">
              <Mail className="h-4 w-4 text-gray-400" />
              {user.email}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {user.crm_summary && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-gray-800">CRM Summary</span>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 rounded p-3 w-full">
              {user.crm_summary}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-400" /> Stats
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Total Messages: <span className="font-bold">{stats?.total_messages ?? '-'}</span></li>
              <li>Last Activity: <span className="font-bold">{stats?.last_activity ?? '-'}</span></li>
              <li>Avg Response: <span className="font-bold">{stats?.avg_response_time ?? '-'}</span></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" /> Activity Timeline
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              {activity && activity.length > 0 ? activity.map((item, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-xs text-gray-400 min-w-[70px]">{item.date}</span>
                  <span>{item.description}</span>
                </li>
              )) : <li className="text-gray-400">No recent activity</li>}
            </ul>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary">Add Note</Button>
          <Button variant="default">Send Message</Button>
        </div>
      </CardContent>
    </Card>
  );
}; 