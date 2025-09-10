'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { leadAnalysisApi, type LeadAnalysisData } from '@/lib/api/lead-analysis';
import { 
  ArrowLeft, 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Target, 
  Star,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Share2,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// LeadAnalysisData interface is now imported from the API file

export default function FullLeadAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const phoneNumber = params.phoneNumber as string;
  
  const [analysisData, setAnalysisData] = useState<LeadAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data from API
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const data = await leadAnalysisApi.getLeadAnalysis(decodeURIComponent(phoneNumber));
        setAnalysisData(data);
      } catch (error) {
        console.error('Error fetching lead analysis:', error);
        // Fallback to null which will show error state
        setAnalysisData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [phoneNumber]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Analyzing lead data...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Lead analysis not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Lead Analysis
              </h1>
              <p className="text-gray-600">
                {analysisData.contactName} • {analysisData.phoneNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant={analysisData.qualificationStatus === 'qualified' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {analysisData.qualificationStatus.charAt(0).toUpperCase() + analysisData.qualificationStatus.slice(1)} Lead
            </Badge>
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
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analysisData.overallScore)}`}>
                    {analysisData.overallScore}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analysisData.overallScore >= 80 ? 'High Quality Lead' : 
                     analysisData.overallScore >= 60 ? 'Medium Quality' : 'Low Quality'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getScoreBgColor(analysisData.overallScore)}`}>
                  <Target className={`h-6 w-6 ${getScoreColor(analysisData.overallScore)}`} />
                </div>
              </div>
              <Progress value={analysisData.overallScore} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Business Intent</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analysisData.businessIntent.score)}`}>
                    {analysisData.businessIntent.score}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analysisData.businessIntent.confidence}% confidence
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getScoreBgColor(analysisData.businessIntent.score)}`}>
                  <TrendingUp className={`h-6 w-6 ${getScoreColor(analysisData.businessIntent.score)}`} />
                </div>
              </div>
              <Progress value={analysisData.businessIntent.score} className="mt-4" />
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group"
            onClick={() => {
              const phoneNumber = encodeURIComponent(params.phoneNumber as string);
              router.push(`/message-analysis/${phoneNumber}`);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Messages</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analysisData.conversationAnalysis.totalMessages}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analysisData.conversationAnalysis.engagementLevel}% engagement
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>User: {analysisData.conversationAnalysis.userMessages || Math.floor(analysisData.conversationAnalysis.totalMessages * 0.6)}</span>
                  <span>Bot: {analysisData.conversationAnalysis.botMessages || Math.floor(analysisData.conversationAnalysis.totalMessages * 0.4)}</span>
                </div>
                <div className="mt-2 text-xs text-blue-600 group-hover:text-blue-700 font-medium">
                  Click to view detailed message analysis →
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Est. Value</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${analysisData.predictiveInsights.estimatedValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analysisData.predictiveInsights.conversionProbability}% conversion prob.
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <Progress value={analysisData.predictiveInsights.conversionProbability} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        {(analysisData.conversationMetrics || analysisData.aiPerformance) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {analysisData.conversationMetrics && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Key Indicators</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Business Intent</span>
                      <Badge variant={analysisData.conversationMetrics.businessIntentDetected ? 'default' : 'secondary'}>
                        {analysisData.conversationMetrics.businessIntentDetected ? 'Detected' : 'None'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pricing Interest</span>
                      <Badge variant={analysisData.conversationMetrics.pricingDiscussed ? 'default' : 'secondary'}>
                        {analysisData.conversationMetrics.pricingDiscussed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Demo Request</span>
                      <Badge variant={analysisData.conversationMetrics.demoRequested ? 'default' : 'secondary'}>
                        {analysisData.conversationMetrics.demoRequested ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {analysisData.aiPerformance && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">AI Performance</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">RAG Queries</span>
                      <span className="font-medium">{analysisData.aiPerformance.ragQueriesUsed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Processing</span>
                      <span className="font-medium">{analysisData.aiPerformance.avgProcessingTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Personalization</span>
                      <Badge variant="outline" className="text-xs">
                        {analysisData.aiPerformance.personalizationLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Response Time</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {analysisData.conversationAnalysis.avgResponseTime}min
                    </p>
                    <p className="text-sm text-gray-600">Average response time</p>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline" className="w-full justify-center">
                      {analysisData.predictiveInsights.bestContactTime}
                    </Badge>
                    <p className="text-xs text-gray-500 text-center mt-1">Best contact time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="signals">Buying Signals</TabsTrigger>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="ai-analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="qualification">Qualification</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="recommendations">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Intent Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>Business Intent Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence Level</span>
                      <Badge variant="outline">{analysisData.businessIntent.confidence}%</Badge>
                    </div>
                    <Progress value={analysisData.businessIntent.confidence} />
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Key Indicators:</p>
                      {analysisData.businessIntent.indicators.map((indicator, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Identified Needs */}
              <Card>
                <CardHeader>
                  <CardTitle>Identified Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Primary Needs</p>
                      <div className="space-y-1">
                        {analysisData.identifiedNeeds.primary.map((need, index) => (
                          <Badge key={index} variant="default" className="mr-2 mb-1">
                            {need}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Pain Points</p>
                      <div className="space-y-1">
                        {analysisData.identifiedNeeds.painPoints.map((pain, index) => (
                          <Badge key={index} variant="destructive" className="mr-2 mb-1">
                            {pain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Conversation Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span>Conversation Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold">{analysisData.conversationAnalysis.totalMessages}</p>
                      <p className="text-xs text-gray-500">
                        User: {analysisData.conversationAnalysis.userMessages || 0} | 
                        Bot: {analysisData.conversationAnalysis.botMessages || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Engagement</p>
                      <p className="text-2xl font-bold text-green-600">{analysisData.conversationAnalysis.engagementLevel}%</p>
                      <Progress value={analysisData.conversationAnalysis.engagementLevel} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Journey Stage</p>
                      <Badge variant="outline" className="text-sm">
                        {analysisData.conversationAnalysis.journeyStage || 'Discovery'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sentiment</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={analysisData.conversationAnalysis.sentiment === 'positive' ? 'default' : 
                                  analysisData.conversationAnalysis.sentiment === 'neutral' ? 'secondary' : 'destructive'}
                        >
                          {analysisData.conversationAnalysis.sentiment}
                        </Badge>
                        {analysisData.conversationAnalysis.sentimentScore && (
                          <span className="text-xs text-gray-500">
                            ({(analysisData.conversationAnalysis.sentimentScore * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Response</p>
                      <p className="text-2xl font-bold">{analysisData.conversationAnalysis.avgResponseTime}min</p>
                    </div>
                    {analysisData.conversationAnalysis.sessionDuration && (
                      <div>
                        <p className="text-sm text-gray-600">Session Duration</p>
                        <p className="text-2xl font-bold">{Math.round(analysisData.conversationAnalysis.sessionDuration / 60)}min</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <span>Predictive Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Best Contact Time</span>
                        <Badge variant="outline">{analysisData.predictiveInsights.bestContactTime}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recommended Approach</p>
                      <p className="text-sm font-medium">{analysisData.predictiveInsights.recommendedApproach}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buying Signals Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.buyingSignals.signals.map((signal, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge 
                              variant={signal.strength === 'high' ? 'default' : signal.strength === 'medium' ? 'secondary' : 'outline'}
                            >
                              {signal.type}
                            </Badge>
                            <Badge 
                              variant={signal.strength === 'high' ? 'destructive' : signal.strength === 'medium' ? 'secondary' : 'outline'}
                            >
                              {signal.strength} strength
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">"{signal.message}"</p>
                          <p className="text-xs text-gray-500">
                            {new Date(signal.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.conversationAnalysis.topics.map((topic, index) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Engagement Level</span>
                        <span className="text-sm font-medium">{analysisData.conversationAnalysis.engagementLevel}%</span>
                      </div>
                      <Progress value={analysisData.conversationAnalysis.engagementLevel} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{analysisData.conversationAnalysis.totalMessages}</p>
                        <p className="text-sm text-gray-600">Messages</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{analysisData.conversationAnalysis.avgResponseTime}min</p>
                        <p className="text-sm text-gray-600">Avg Response</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Conversation Metrics */}
              {analysisData.conversationMetrics && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Advanced Conversation Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisData.conversationMetrics.sessionsCount}
                        </div>
                        <p className="text-sm text-gray-600">Sessions</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${analysisData.conversationMetrics.businessIntentDetected ? 'text-green-600' : 'text-gray-400'}`}>
                          {analysisData.conversationMetrics.businessIntentDetected ? '✓' : '✗'}
                        </div>
                        <p className="text-sm text-gray-600">Business Intent</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${analysisData.conversationMetrics.pricingDiscussed ? 'text-blue-600' : 'text-gray-400'}`}>
                          {analysisData.conversationMetrics.pricingDiscussed ? '✓' : '✗'}
                        </div>
                        <p className="text-sm text-gray-600">Pricing Discussed</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${analysisData.conversationMetrics.demoRequested ? 'text-orange-600' : 'text-gray-400'}`}>
                          {analysisData.conversationMetrics.demoRequested ? '✓' : '✗'}
                        </div>
                        <p className="text-sm text-gray-600">Demo Requested</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai-analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Performance Metrics */}
              {analysisData.aiPerformance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span>AI Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">RAG Queries</p>
                          <p className="text-2xl font-bold text-purple-600">{analysisData.aiPerformance.ragQueriesUsed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Enhanced Responses</p>
                          <p className="text-2xl font-bold text-blue-600">{analysisData.aiPerformance.enhancedResponsesCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Processing</p>
                          <p className="text-2xl font-bold text-green-600">{analysisData.aiPerformance.avgProcessingTime}ms</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Personalization</p>
                          <Badge variant="outline">{analysisData.aiPerformance.personalizationLevel}</Badge>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Tokens</span>
                          <span className="font-medium">{analysisData.aiPerformance.totalTokensUsed?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Est. Cost</span>
                          <span className="font-medium">${analysisData.aiPerformance.costEstimate?.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <span>Message Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisData.messageAnalytics && analysisData.messageAnalytics.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {analysisData.messageAnalytics.slice(0, 5).map((msg, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                              {msg.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Handler: </span>
                              <Badge variant="outline" className="text-xs">{msg.aiHandlerUsed}</Badge>
                            </div>
                            <div>
                              <span className="text-gray-600">Processing: </span>
                              <span className="font-medium">{msg.processingTimeMs}ms</span>
                            </div>
                            {msg.ragDocumentsRetrieved > 0 && (
                              <div>
                                <span className="text-gray-600">RAG Docs: </span>
                                <span className="font-medium">{msg.ragDocumentsRetrieved}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Category: </span>
                              <Badge variant="outline" className="text-xs">{msg.businessCategory}</Badge>
                            </div>
                          </div>
                          {msg.detectedIntents && msg.detectedIntents.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 mb-1">Intents:</p>
                              <div className="flex flex-wrap gap-1">
                                {msg.detectedIntents.map((intent, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {intent}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No detailed message analytics available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="qualification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Lead Qualification History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisData.leadQualificationLogs && analysisData.leadQualificationLogs.length > 0 ? (
                  <div className="space-y-4">
                    {analysisData.leadQualificationLogs.map((log, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={log.leadScore >= 80 ? 'default' : log.leadScore >= 60 ? 'secondary' : 'outline'}
                            >
                              Score: {log.leadScore}
                            </Badge>
                            <Badge variant="outline">
                              Confidence: {(log.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Reason:</strong> {log.reason}
                        </p>
                        
                        {log.messageAnalyzed && (
                          <div className="bg-gray-50 rounded p-2 mb-3">
                            <p className="text-xs text-gray-600 mb-1">Message Analyzed:</p>
                            <p className="text-sm italic">"{log.messageAnalyzed}"</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {log.businessIndicators && log.businessIndicators.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Business Indicators:</p>
                              <div className="flex flex-wrap gap-1">
                                {log.businessIndicators.map((indicator, idx) => (
                                  <Badge key={idx} variant="default" className="text-xs">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {log.buyingSignals && log.buyingSignals.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Buying Signals:</p>
                              <div className="flex flex-wrap gap-1">
                                {log.buyingSignals.map((signal, idx) => (
                                  <Badge key={idx} variant="destructive" className="text-xs">
                                    {signal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Recommended Action:</span>
                            <Badge variant="outline" className="text-xs">
                              {log.recommendedAction.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No lead qualification logs available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>Lead Qualification Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        event.type === 'qualification' ? 'bg-green-500' : 
                        event.type === 'action' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{event.event}</p>
                          {event.score && (
                            <Badge variant="outline">Score: {event.score}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Immediate Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.immediate.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Send Calendly Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Follow-up Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.followUp.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Schedule Follow-up
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Long-term Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.recommendations.longTerm.map((action, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Add to CRM Pipeline
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}