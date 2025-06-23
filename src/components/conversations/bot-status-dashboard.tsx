'use client';

import { Bot, User, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBotToggle } from '@/hooks/useBotToggle';

interface BotStatusDashboardProps {
  className?: string;
}

export function BotStatusDashboard({ className }: BotStatusDashboardProps) {
  const { botStatusSummary } = useBotToggle();

  if (botStatusSummary.isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Bot Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading bot status...</div>
        </CardContent>
      </Card>
    );
  }

  if (botStatusSummary.error || !botStatusSummary.data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Bot Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Failed to load bot status</div>
        </CardContent>
      </Card>
    );
  }

  const { summary, disabled_conversations } = botStatusSummary.data;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Bot Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summary.total_conversations}
            </div>
            <div className="text-sm text-gray-600">Total Conversations</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.bot_enabled}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Bot className="h-3 w-3" />
              Bot Enabled
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {summary.bot_disabled}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <User className="h-3 w-3" />
              Human Handling
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {summary.enabled_percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Automation Rate
            </div>
          </div>
        </div>

        {/* Automation Rate Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Automation Coverage</span>
            <span className="font-medium">{summary.enabled_percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${summary.enabled_percentage}%` }}
            />
          </div>
        </div>

        {/* Conversations with Human Agents */}
        {disabled_conversations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Conversations with Human Agents ({disabled_conversations.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {disabled_conversations.map((conv) => (
                <div 
                  key={conv.conversation_id} 
                  className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {conv.contact.name || 'Unknown Contact'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {conv.contact.phone_number.replace('_s_whatsapp_net', '')}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    Human
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Automated Message */}
        {disabled_conversations.length === 0 && summary.total_conversations > 0 && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Bot className="h-5 w-5" />
              <span className="font-medium">All conversations are automated!</span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              The AI bot is handling all {summary.total_conversations} conversations
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 