"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Zap, Target, TrendingUp, MessageSquare } from "lucide-react";

interface AIInsight {
  id: string;
  timestamp: string;
  operation_type: string;
  execution_time_ms: number;
  model_used?: string;
  tokens_processed?: number;
  status: string;
  journey_stage?: string;
  engagement_level?: string;
  response_type?: string;
  rag_docs_retrieved?: number;
  personalization_level?: string;
}

interface CurrentContext {
  journey_stage?: string;
  engagement_level?: string;
  lead_status?: string;
  lead_score?: number;
}

interface AIInsightsData {
  insights: AIInsight[];
  current_context: CurrentContext;
}

interface AIInsightsCardProps {
  userId: string;
}

export default function AIInsightsCard({ userId }: AIInsightsCardProps) {
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${API_BASE}/api/crm/user/${userId}/ai-insights`);
        const data = await response.json();
        
        if (response.ok) {
          setInsightsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAIInsights();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insightsData || insightsData.insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No AI insights available yet. Insights will appear after AI interactions.</p>
        </CardContent>
      </Card>
    );
  }

  const { insights, current_context } = insightsData;
  const latestInsight = insights[0];
  
  const getEngagementColor = (level?: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getJourneyColor = (stage?: string) => {
    switch (stage) {
      case 'decision': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'evaluation': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'interest': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'discovery': return 'bg-teal-100 text-teal-800 border-teal-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
          AI Intelligence Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Current Context Section */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Current Customer Context
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Journey Stage</p>
              <Badge className={`${getJourneyColor(current_context.journey_stage)} border font-medium`}>
                {current_context.journey_stage || 'unknown'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Engagement</p>
              <Badge className={`${getEngagementColor(current_context.engagement_level)} border font-medium`}>
                {current_context.engagement_level || 'unknown'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Lead Status</p>
              <Badge variant="outline" className="font-medium">
                {current_context.lead_status || 'new'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Lead Score</p>
              <span className="text-lg font-bold text-indigo-600">
                {current_context.lead_score || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Latest AI Response Section */}
        {latestInsight && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Latest AI Response
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Response Time</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatResponseTime(latestInsight.execution_time_ms)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Model Used</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {latestInsight.model_used || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Tokens Processed</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {latestInsight.tokens_processed || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">RAG Docs</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {latestInsight.rag_docs_retrieved || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Response Type and Personalization */}
            <div className="mt-3 pt-3 border-t border-purple-200 flex gap-2 flex-wrap">
              {latestInsight.response_type && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  {latestInsight.response_type}
                </Badge>
              )}
              {latestInsight.personalization_level && (
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                  {latestInsight.personalization_level} personalization
                </Badge>
              )}
              <Badge className={latestInsight.status === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}>
                {latestInsight.status}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {new Date(latestInsight.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Recent Insights History */}
        {insights.length > 1 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent AI Interactions ({insights.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {insights.slice(1, 5).map((insight) => (
                <div key={insight.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatResponseTime(insight.execution_time_ms)}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {insight.tokens_processed || 0} tokens
                    </span>
                    {insight.status === 'success' && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(insight.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

