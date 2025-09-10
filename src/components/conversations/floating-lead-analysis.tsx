'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { leadAnalysisApi } from '@/lib/api/lead-analysis';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  X,
  MessageSquare,
  Zap
} from 'lucide-react';

interface FloatingLeadAnalysisProps {
  conversation: any;
  onClose: () => void;
  onScheduleCall?: () => void;
}

export default function FloatingLeadAnalysis({ 
  conversation, 
  onClose,
  onScheduleCall 
}: FloatingLeadAnalysisProps) {
  const router = useRouter();
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Extract phone number from conversation
  const phoneNumber = conversation?.contact?.phone_number || conversation?.phone_number;

  // Fetch real lead analysis data
  useEffect(() => {
    const fetchLeadData = async () => {
      if (!phoneNumber) return;
      
      try {
        setLoading(true);
        const data = await leadAnalysisApi.getLeadAnalysis(phoneNumber);
        setLeadData(data);
      } catch (error) {
        console.error('Error fetching lead data for floating card:', error);
        // Fallback to basic calculation based on conversation
        setLeadData({
          overallScore: Math.min(95, (conversation?.message_count || 0) * 15),
          qualificationStatus: (conversation?.message_count || 0) > 6 ? 'qualified' : 'potential',
          businessIntent: {
            score: (conversation?.message_count || 0) > 3 ? 70 : 30,
            indicators: ['Conversation engagement'],
            confidence: 60
          },
          conversationAnalysis: {
            totalMessages: conversation?.message_count || 0,
            engagementLevel: Math.min(100, (conversation?.message_count || 0) * 10)
          },
          identifiedNeeds: {
            primary: ['General inquiry'],
            painPoints: []
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [phoneNumber, conversation?.message_count]);

  // Use real data or fallback to basic calculation
  const isQualifiedLead = leadData?.qualificationStatus === 'qualified' || conversation?.message_count > 6;
  const leadScore = leadData?.overallScore || Math.min(95, (conversation?.message_count || 0) * 15);
  const hasBusinessIntent = leadData?.businessIntent?.score > 50 || conversation?.message_count > 3;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div 
      className="fixed top-20 right-4 z-[9999] w-80 animate-in slide-in-from-right duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="shadow-2xl border-2 border-purple-200 bg-white relative pointer-events-auto">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              <div className="p-1 bg-purple-100 rounded-full">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-purple-800">AI Lead Analysis</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Close button clicked');
                onClose();
              }}
              className="h-6 w-6 text-gray-500 hover:text-gray-700 relative z-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {/* Lead Score */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Lead Score</span>
              <span className="text-lg font-bold text-gray-900">{leadScore}/100</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(leadScore)}`}
                style={{ width: `${leadScore}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Messages: {conversation?.message_count || 0}</span>
              <Badge 
                className={isQualifiedLead ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
              >
                {isQualifiedLead ? 'Qualified' : 'Developing'}
              </Badge>
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            {isQualifiedLead ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Ready for Discovery Call</span>
                </div>
                <p className="text-xs text-green-700">
                  Strong business intent detected with enterprise-level requirements.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Building Context</span>
                </div>
                <p className="text-xs text-blue-700">
                  Gathering more information before qualification.
                </p>
              </div>
            )}
          </div>

          {/* Quick Insights */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Quick Insights
            </h4>
            <div className="space-y-1 text-xs">
              {hasBusinessIntent && (
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Business intent detected</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Active conversation</span>
              </div>
              {conversation?.message_count > 5 && (
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">High engagement level</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {isQualifiedLead ? (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Calendly button clicked for qualified lead');
                  onScheduleCall?.();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-sm relative z-10"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Send Calendly Link
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full text-sm relative z-10" 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Continue conversation clicked');
                  alert('This would continue the conversation flow!');
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Continue Conversation
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full text-sm relative z-10"
              onClick={(e) => {
                e.stopPropagation();
                console.log('View full analysis clicked');
                const analysisPhoneNumber = encodeURIComponent(conversation?.contact?.phone_number || conversation?.phone_number || 'unknown');
                router.push(`/lead-analysis/${analysisPhoneNumber}`);
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              View Full Analysis
            </Button>
          </div>

          {/* Powered by AI notice */}
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Powered by AI • Updated in real-time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}