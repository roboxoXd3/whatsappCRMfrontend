'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Bot, 
  Clock, 
  TrendingUp,
  Brain,
  Target,
  BarChart3,
  Eye,
  Heart,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Download,
  Share2
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'human';
  timestamp: string;
  message_type?: string;
  handler_used?: string;
  processing_time?: number;
  sentiment_score?: number;
  intent?: string;
  confidence?: number;
  ai_analysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    intent: string;
    confidence: number;
    business_relevance: number;
    urgency_level: 'low' | 'medium' | 'high';
    key_topics: string[];
  };
}

interface ConversationAnalysis {
  total_messages: number;
  user_messages: number;
  bot_messages: number;
  human_messages: number;
  conversation_flow: {
    engagement_score: number;
    response_quality: number;
    handover_points: number;
    resolution_rate: number;
  };
  sentiment_journey: {
    start_sentiment: number;
    end_sentiment: number;
    sentiment_trend: 'improving' | 'declining' | 'stable';
    emotional_peaks: Array<{
      timestamp: string;
      sentiment: number;
      trigger: string;
    }>;
  };
  key_insights: {
    dominant_intents: string[];
    business_indicators: string[];
    pain_points: string[];
    opportunities: string[];
  };
  ai_performance: {
    avg_response_time: number;
    accuracy_score: number;
    user_satisfaction: number;
    handover_triggered: boolean;
  };
}

interface MessageAnalysisData {
  contact: {
    phone_number: string;
    name: string;
    email?: string;
    company?: string;
  };
  messages: Message[];
  analysis: ConversationAnalysis;
  conversation_metadata: {
    started_at: string;
    last_activity: string;
    duration_hours: number;
    total_sessions: number;
    total_conversations?: number;
    conversation_ids?: string[];
    complete_thread?: boolean;
  };
  ai_insights?: {
    user_journey_evolution?: any;
    business_profile_intent?: any;
    conversation_insights?: any;
    strategic_recommendations?: any;
    predictive_insights?: any;
    analysis_metadata?: {
      generated_at: string;
      messages_analyzed: number;
      total_messages: number;
      analysis_type: string;
      model_used: string;
    };
  };
}

export default function MessageAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const phoneNumber = params.phoneNumber as string;
  
  const [analysisData, setAnalysisData] = useState<MessageAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('messages');

  useEffect(() => {
    const fetchMessageAnalysis = async () => {
      if (!phoneNumber) return;
      
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/message-analysis/${encodeURIComponent(phoneNumber)}`);
        setAnalysisData(response.data);
      } catch (error: any) {
        console.error('Error fetching message analysis:', error);
        setError(error.response?.data?.message || 'Failed to load message analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchMessageAnalysis();
  }, [phoneNumber]);

  const getSentimentColor = (sentiment: string | number) => {
    if (typeof sentiment === 'number') {
      if (sentiment > 0.3) return 'text-green-600 bg-green-50';
      if (sentiment < -0.3) return 'text-red-600 bg-red-50';
      return 'text-yellow-600 bg-yellow-50';
    }
    
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analysis Unavailable</h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisData) return null;

  const { contact, messages, analysis, conversation_metadata } = analysisData;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Message Analysis</h1>
            <p className="text-gray-600">
              {contact.name} • {phoneNumber}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{analysis.total_messages}</p>
                <p className="text-xs text-gray-500">
                  User: {analysis.user_messages} • Bot: {analysis.bot_messages}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                <p className="text-2xl font-bold">{Math.round(analysis.conversation_flow.engagement_score)}%</p>
                <p className="text-xs text-gray-500">
                  {analysis.sentiment_journey.sentiment_trend === 'improving' ? '↗️ Improving' : 
                   analysis.sentiment_journey.sentiment_trend === 'declining' ? '↘️ Declining' : '→ Stable'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-2xl font-bold">{formatDuration(conversation_metadata.duration_hours)}</p>
                <p className="text-xs text-gray-500">
                  {conversation_metadata.total_sessions} session(s)
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Performance</p>
                <p className="text-2xl font-bold">{Math.round(analysis.ai_performance.accuracy_score)}%</p>
                <p className="text-xs text-gray-500">
                  Avg {analysis.ai_performance.avg_response_time}ms
                </p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="flow">Conversation Flow</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Complete Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] overflow-y-auto pr-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className="group">
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-3`}>
                        {message.role !== 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : message.role === 'assistant'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-green-100 text-green-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{formatTime(message.timestamp)}</span>
                            <div className="flex items-center space-x-2">
                              {message.ai_analysis && (
                                <>
                                  <Badge variant="outline" className={getSentimentColor(message.ai_analysis.sentiment)}>
                                    {message.ai_analysis.sentiment}
                                  </Badge>
                                  {message.ai_analysis.urgency_level === 'high' && (
                                    <Badge className={getUrgencyColor(message.ai_analysis.urgency_level)}>
                                      High Priority
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {message.ai_analysis && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <div className="flex justify-between items-center">
                                <span><strong>Intent:</strong> {message.ai_analysis.intent}</span>
                                <span><strong>Confidence:</strong> {Math.round(message.ai_analysis.confidence * 100)}%</span>
                              </div>
                              {message.ai_analysis.key_topics.length > 0 && (
                                <div className="mt-1">
                                  <span><strong>Topics:</strong> {message.ai_analysis.key_topics.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {/* AI Insights Section - New Hybrid Analysis */}
          {analysisData?.ai_insights && (
            <div className="mb-6">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600" />
                    🤖 AI-Powered Deep Analysis
                    <Badge variant="secondary" className="ml-2">
                      {analysisData.ai_insights.analysis_metadata?.model_used || 'AI'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Generated: {analysisData.ai_insights.analysis_metadata?.generated_at ? 
                      new Date(analysisData.ai_insights.analysis_metadata.generated_at).toLocaleString() : 'N/A'}
                    {' • '}
                    Sample: {analysisData.ai_insights.analysis_metadata?.messages_analyzed || 0} of {analysisData.ai_insights.analysis_metadata?.total_messages || 0} messages
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Business Profile */}
                    {analysisData.ai_insights.business_profile_intent && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-700">Business Profile</h4>
                        <div className="text-sm space-y-1">
                          <div>Intent Level: <span className="font-medium">{analysisData.ai_insights.business_profile_intent.overall_business_intent_level || 'N/A'}/10</span></div>
                          <div>Authority: <span className="font-medium">{analysisData.ai_insights.business_profile_intent.decision_making_authority_level || 'N/A'}</span></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Predictive Insights */}
                    {analysisData.ai_insights.predictive_insights && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-700">Predictions</h4>
                        <div className="text-sm space-y-1">
                          <div>Conversion: <span className="font-medium">{analysisData.ai_insights.predictive_insights.likelihood_to_convert || 'N/A'}/10</span></div>
                          <div>Timeline: <span className="font-medium">{analysisData.ai_insights.predictive_insights.estimated_timeline_to_decision || 'N/A'}</span></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Strategic Recommendations */}
                    {analysisData.ai_insights.strategic_recommendations && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-purple-700">Strategy</h4>
                        <div className="text-sm">
                          <div className="truncate">{analysisData.ai_insights.strategic_recommendations.optimal_next_engagement_strategy || 'No strategy available'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Dominant Intents</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_insights.dominant_intents.map((intent, index) => (
                      <Badge key={index} variant="secondary">{intent}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Business Indicators</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_insights.business_indicators.map((indicator, index) => (
                      <Badge key={index} className="bg-green-100 text-green-700">{indicator}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pain Points</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_insights.pain_points.map((pain, index) => (
                      <Badge key={index} className="bg-red-100 text-red-700">{pain}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Opportunities</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_insights.opportunities.map((opportunity, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-700">{opportunity}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Conversation Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <span className="text-sm">{Math.round(analysis.conversation_flow.engagement_score)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.conversation_flow.engagement_score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Response Quality</span>
                      <span className="text-sm">{Math.round(analysis.conversation_flow.response_quality)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.conversation_flow.response_quality}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Resolution Rate</span>
                      <span className="text-sm">{Math.round(analysis.conversation_flow.resolution_rate)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.conversation_flow.resolution_rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Sentiment Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {Math.round(analysis.sentiment_journey.start_sentiment * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Starting Sentiment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {Math.round(analysis.sentiment_journey.end_sentiment * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Ending Sentiment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1 capitalize">
                    {analysis.sentiment_journey.sentiment_trend}
                  </div>
                  <div className="text-sm text-gray-600">Overall Trend</div>
                </div>
              </div>

              {analysis.sentiment_journey.emotional_peaks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Emotional Peaks</h4>
                  <div className="space-y-3">
                    {analysis.sentiment_journey.emotional_peaks.map((peak, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{peak.trigger}</div>
                          <div className="text-sm text-gray-600">{formatTime(peak.timestamp)}</div>
                        </div>
                        <Badge className={getSentimentColor(peak.sentiment)}>
                          {Math.round(peak.sentiment * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Conversation Flow Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Flow Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Handover Points</span>
                      <Badge variant="outline">{analysis.conversation_flow.handover_points}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Sessions</span>
                      <Badge variant="outline">{conversation_metadata.total_sessions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Started</span>
                      <span className="text-sm text-gray-600">{formatTime(conversation_metadata.started_at)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Last Activity</span>
                      <span className="text-sm text-gray-600">{formatTime(conversation_metadata.last_activity)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Message Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        User Messages
                      </span>
                      <Badge className="bg-blue-100 text-blue-700">{analysis.user_messages}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Bot className="h-4 w-4 mr-2" />
                        Bot Messages
                      </span>
                      <Badge className="bg-gray-100 text-gray-700">{analysis.bot_messages}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Human Messages
                      </span>
                      <Badge className="bg-green-100 text-green-700">{analysis.human_messages}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                AI Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Accuracy Score</span>
                        <span className="text-sm">{Math.round(analysis.ai_performance.accuracy_score)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysis.ai_performance.accuracy_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">User Satisfaction</span>
                        <span className="text-sm">{Math.round(analysis.ai_performance.user_satisfaction)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysis.ai_performance.user_satisfaction}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Response Times</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Average Response Time</span>
                      <Badge variant="outline">{analysis.ai_performance.avg_response_time}ms</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Handover Triggered</span>
                      <Badge className={analysis.ai_performance.handover_triggered ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                        {analysis.ai_performance.handover_triggered ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
