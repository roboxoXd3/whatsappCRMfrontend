'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MessageCircle,
  Zap
} from 'lucide-react';

interface LeadQualificationData {
  isQualified: boolean;
  confidence: number;
  leadScore: number;
  stage: string;
  businessIntent: string[];
  buyingSignals: string[];
  conversationDepth: number;
  lastAnalysis: string;
}

interface LeadQualificationPanelProps {
  conversation: any;
  onScheduleCall?: () => void;
}

export default function LeadQualificationPanel({ 
  conversation, 
  onScheduleCall 
}: LeadQualificationPanelProps) {
  // Mock data - in real implementation, this would come from the backend
  const leadData: LeadQualificationData = {
    isQualified: conversation?.message_count > 6 && conversation?.last_message_preview?.length > 50,
    confidence: Math.min(85, (conversation?.message_count || 0) * 15),
    leadScore: Math.min(95, (conversation?.message_count || 0) * 20),
    stage: conversation?.message_count > 6 ? 'Qualified' : 
           conversation?.message_count > 3 ? 'Developing' : 'Initial',
    businessIntent: conversation?.message_count > 3 ? [
      'Customer support automation',
      'Enterprise-level solution',
      'Cost reduction inquiries'
    ] : ['General inquiry'],
    buyingSignals: conversation?.message_count > 5 ? [
      'Mentioned enterprise pricing',
      'High inquiry volume (500+/day)',
      'Timeline discussions'
    ] : [],
    conversationDepth: conversation?.message_count || 0,
    lastAnalysis: new Date().toLocaleTimeString()
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Developing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h2 className="font-medium text-gray-900">AI Lead Analysis</h2>
        </div>
      </div>

      {/* Lead Score */}
      <Card className="m-4 border-2 border-dashed border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Lead Qualification Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{leadData.leadScore}/100</span>
              <Badge className={getStageColor(leadData.stage)}>
                {leadData.stage}
              </Badge>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getScoreColor(leadData.leadScore)}`}
                style={{ width: `${leadData.leadScore}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Confidence: {leadData.confidence}%</span>
              <span>Depth: {leadData.conversationDepth} messages</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicator */}
      <div className="mx-4 mb-4">
        {leadData.isQualified ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Ready for Discovery Call</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Strong business intent and enterprise-level requirements detected.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Building Conversation</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Gathering more information before qualifying for sales call.
            </p>
          </div>
        )}
      </div>

      {/* Business Intent */}
      {leadData.businessIntent.length > 0 && (
        <Card className="mx-4 mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>Business Intent Detected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leadData.businessIntent.map((intent, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{intent}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buying Signals */}
      {leadData.buyingSignals.length > 0 && (
        <Card className="mx-4 mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span>Buying Signals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leadData.buyingSignals.map((signal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{signal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Progress */}
      <Card className="mx-4 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-600" />
            <span>Conversation Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stage</span>
              <Badge variant="outline" className={getStageColor(leadData.stage)}>
                {leadData.stage}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Messages</span>
              <span className="text-sm font-medium">{leadData.conversationDepth}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Analysis</span>
              <span className="text-sm text-gray-500">{leadData.lastAnalysis}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {leadData.isQualified ? (
          <Button 
            onClick={onScheduleCall}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Send Calendly Link
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Continue Conversation
          </Button>
        )}
        
        <Button variant="outline" className="w-full">
          <Zap className="h-4 w-4 mr-2" />
          Trigger Manual Analysis
        </Button>
      </div>

      {/* AI Insights Footer */}
      <div className="p-4 bg-gray-50 text-center">
        <p className="text-xs text-gray-500">
          AI analysis updated in real-time based on conversation content and behavior patterns.
        </p>
      </div>
    </div>
  );
}