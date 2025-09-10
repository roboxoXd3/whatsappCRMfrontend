import { apiClient } from './client';

export interface LeadAnalysisData {
  phoneNumber: string;
  contactName: string;
  overallScore: number;
  qualificationStatus: 'qualified' | 'potential' | 'unqualified';
  businessIntent: {
    score: number;
    indicators: string[];
    confidence: number;
  };
  buyingSignals: {
    score: number;
    signals: Array<{
      type: string;
      strength: 'high' | 'medium' | 'low';
      message: string;
      timestamp: string;
    }>;
  };
  conversationAnalysis: {
    totalMessages: number;
    userMessages: number;
    botMessages: number;
    avgResponseTime: number;
    engagementLevel: number;
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore?: number;
    journeyStage: string;
    sessionDuration?: number;
  };
  identifiedNeeds: {
    primary: string[];
    secondary: string[];
    painPoints: string[];
  };
  timeline: Array<{
    date: string;
    event: string;
    type: 'message' | 'qualification' | 'action' | 'journey_update' | 'ai_analysis';
    score?: number;
    details?: string;
  }>;
  recommendations: {
    immediate: string[];
    followUp: string[];
    longTerm: string[];
  };
  predictiveInsights: {
    conversionProbability: number;
    bestContactTime: string;
    recommendedApproach: string;
    estimatedValue: number;
  };
  // Enhanced analytics from backend
  aiPerformance?: {
    ragQueriesUsed: number;
    enhancedResponsesCount: number;
    personalizationLevel: string;
    avgProcessingTime: number;
    totalTokensUsed: number;
    costEstimate: number;
  };
  messageAnalytics?: Array<{
    messageId: string;
    role: 'user' | 'assistant';
    length: number;
    aiHandlerUsed: string;
    processingTimeMs: number;
    ragDocumentsRetrieved: number;
    detectedIntents: string[];
    businessCategory: string;
    urgencyLevel: string;
    sentimentScore: number;
    timestamp: string;
  }>;
  leadQualificationLogs?: Array<{
    timestamp: string;
    leadScore: number;
    confidence: number;
    reason: string;
    businessIndicators: string[];
    buyingSignals: string[];
    recommendedAction: string;
    messageAnalyzed: string;
  }>;
  conversationMetrics?: {
    sessionsCount: number;
    businessIntentDetected: boolean;
    pricingDiscussed: boolean;
    demoRequested: boolean;
    leadScore: number;
    engagementScore: number;
  };
}

export interface ConversationSummary {
  phoneNumber: string;
  contactName: string;
  messageCount: number;
  lastMessageAt: string;
  leadScore?: number;
  leadStatus?: string;
  isQualifiedLead?: boolean;
  hasBusinessIntent?: boolean;
}

export const leadAnalysisApi = {
  /**
   * Get comprehensive lead analysis for a phone number
   */
  async getLeadAnalysis(phoneNumber: string): Promise<LeadAnalysisData> {
    const response = await apiClient.get(`/api/lead-analysis/${encodeURIComponent(phoneNumber)}`);
    return response.data;
  },

  /**
   * Get basic lead qualification status for multiple conversations
   */
  async getLeadQualificationSummary(): Promise<ConversationSummary[]> {
    const response = await apiClient.get('/api/conversations/lead-summary');
    return response.data;
  },

  /**
   * Get lead qualification logs for analytics
   */
  async getLeadQualificationLogs(filters?: {
    minScore?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.minScore) params.append('min_score', filters.minScore.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.startDate) params.append('start_date', filters.startDate);
    if (filters?.endDate) params.append('end_date', filters.endDate);
    
    const response = await apiClient.get(`/api/analytics/lead-qualification?${params}`);
    return response.data;
  },

  /**
   * Trigger manual lead analysis for a conversation
   */
  async triggerLeadAnalysis(phoneNumber: string) {
    const response = await apiClient.post(`/api/lead-analysis/${encodeURIComponent(phoneNumber)}/analyze`);
    return response.data;
  }
};