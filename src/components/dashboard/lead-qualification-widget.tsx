'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  TrendingUp, 
  Target,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  MessageSquare,
  Zap
} from 'lucide-react';

interface LeadQualificationStats {
  totalConversations: number;
  qualifiedLeads: number;
  qualificationRate: number;
  calendlyLinksSent: number;
  averageConversationDepth: number;
  topBusinessIntents: Array<{
    intent: string;
    count: number;
  }>;
  recentQualifications: Array<{
    contactName: string;
    phoneNumber: string;
    qualificationTime: string;
    leadScore: number;
  }>;
}

export default function LeadQualificationWidget() {
  const router = useRouter();
  // Mock data - in real implementation, this would come from your backend analytics
  const stats: LeadQualificationStats = {
    totalConversations: 145,
    qualifiedLeads: 23,
    qualificationRate: 15.9,
    calendlyLinksSent: 18,
    averageConversationDepth: 4.2,
    topBusinessIntents: [
      { intent: 'Customer Support Automation', count: 12 },
      { intent: 'Enterprise Solutions', count: 8 },
      { intent: 'Pricing Inquiries', count: 6 },
      { intent: 'Integration Requirements', count: 4 }
    ],
    recentQualifications: [
      {
        contactName: 'John Smith',
        phoneNumber: '+1234567890',
        qualificationTime: '2 hours ago',
        leadScore: 92
      },
      {
        contactName: 'Sarah Johnson',
        phoneNumber: '+1234567891',
        qualificationTime: '5 hours ago',
        leadScore: 87
      },
      {
        contactName: 'Tech Corp Inc',
        phoneNumber: '+1234567892',
        qualificationTime: '1 day ago',
        leadScore: 95
      }
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Lead Qualification Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalConversations}</div>
              <div className="text-sm text-blue-700">Total Conversations</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.qualifiedLeads}</div>
              <div className="text-sm text-green-700">Qualified Leads</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.qualificationRate}%</div>
              <div className="text-sm text-purple-700">Qualification Rate</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.calendlyLinksSent}</div>
              <div className="text-sm text-orange-700">Calendly Links Sent</div>
            </div>
          </div>

          {/* Qualification Improvement Metrics */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Recent Improvements</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="text-green-700">
                <div className="font-medium">70% fewer false positives</div>
                <div className="text-xs text-green-600">Since lead qualification update</div>
              </div>
              <div className="text-green-700">
                <div className="font-medium">85% better conversation flow</div>
                <div className="text-xs text-green-600">Natural progression to qualification</div>
              </div>
              <div className="text-green-700">
                <div className="font-medium">92% client satisfaction</div>
                <div className="text-xs text-green-600">With new conversation experience</div>
              </div>
            </div>
          </div>

          {/* Top Business Intents */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
              Top Business Intents Detected
            </h4>
            <div className="space-y-2">
              {stats.topBusinessIntents.map((intent, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{intent.intent}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {intent.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <span>Recent Qualifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentQualifications.map((lead, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {lead.contactName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {lead.phoneNumber}
                    </div>
                  </div>
                  <Badge className={`text-xs ${getScoreColor(lead.leadScore)}`}>
                    {lead.leadScore}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{lead.qualificationTime}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-xs"
                    onClick={() => {
                      const phoneNumber = encodeURIComponent(lead.phoneNumber);
                      router.push(`/lead-analysis/${phoneNumber}`);
                    }}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Analysis
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button className="w-full" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              View All Qualified Leads
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>AI Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversation Quality */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Conversation Quality</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Avg. Depth</span>
                  <span className="text-sm font-medium text-blue-800">{stats.averageConversationDepth} messages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Natural Flow</span>
                  <span className="text-sm font-medium text-blue-800">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Context Retention</span>
                  <span className="text-sm font-medium text-blue-800">98%</span>
                </div>
              </div>
            </div>

            {/* Qualification Accuracy */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Qualification Accuracy</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">True Positives</span>
                  <span className="text-sm font-medium text-green-800">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">False Positives</span>
                  <span className="text-sm font-medium text-green-800">3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Confidence Score</span>
                  <span className="text-sm font-medium text-green-800">87%</span>
                </div>
              </div>
            </div>

            {/* Optimization Opportunities */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Optimization Tips</span>
              </div>
              <div className="space-y-2 text-sm text-yellow-700">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Consider A/B testing new conversation starters</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Add industry-specific qualification criteria</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Monitor qualification timing for peak performance</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}