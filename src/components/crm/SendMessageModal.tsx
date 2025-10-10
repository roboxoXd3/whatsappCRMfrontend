"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSendMessage } from '@/hooks/useConversations';
import { useConversationSummary, useGenerateConversationSummary, useSummaryNeedsRefresh } from '@/hooks/useConversationSummary';
import { useMessageSuggestions, useRefreshSuggestions, useEnhanceMessage } from '@/hooks/useMessageSuggestions';
import { toast } from 'sonner';
import { Send, Loader2, MessageCircle, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  contactName: string;
  userId: string;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  contactName,
  userId,
}) => {
  const [message, setMessage] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const sendMessageMutation = useSendMessage();
  
  // Fetch conversation summary
  const { data: summaryData, isLoading: isLoadingSummary, error: summaryError } = useConversationSummary(userId);
  const generateSummaryMutation = useGenerateConversationSummary();
  const needsRefresh = useSummaryNeedsRefresh(summaryData?.generated_at);
  
  // AI Message Suggestions
  // TODO: Get tenant_id from auth context - for now using undefined
  const tenantId = undefined; // Replace with actual tenant_id from your auth context
  const { 
    data: suggestionsData, 
    isLoading: loadingSuggestions,
    error: suggestionsError 
  } = useMessageSuggestions(userId, tenantId, { enabled: isOpen });
  const refreshSuggestionsMutation = useRefreshSuggestions();
  const enhanceMessageMutation = useEnhanceMessage();

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const response = await sendMessageMutation.mutateAsync({
        phone_number: phoneNumber,
        message: message.trim(),
      });

      if (response.status === 'success') {
        toast.success('Message sent successfully!', {
          description: `Your message was sent to ${contactName}`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        setMessage(''); // Clear the message
        onClose(); // Close the modal
      } else {
        toast.error('Failed to send message', {
          description: response.message || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Network error. Please try again.',
      });
    }
  };

  const handleClose = () => {
    setMessage('');
    setShowContext(false);
    setShowSuggestions(true);
    onClose();
  };

  const handleRefreshSummary = async () => {
    try {
      await generateSummaryMutation.mutateAsync(userId);
      toast.success('Summary refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh summary');
    }
  };

  const handleUseSuggestion = (suggestionMessage: string) => {
    setMessage(suggestionMessage);
    setShowSuggestions(false);
    toast.success('Suggestion applied!', {
      description: 'You can edit the message before sending',
      icon: <Sparkles className="h-4 w-4 text-purple-500" />,
    });
  };

  const handleRefreshSuggestions = async () => {
    try {
      await refreshSuggestionsMutation.mutateAsync({ userId, tenantId, limit: 3 });
      toast.success('Suggestions refreshed!', {
        icon: <Sparkles className="h-4 w-4 text-purple-500" />,
      });
    } catch (error) {
      toast.error('Failed to refresh suggestions');
    }
  };

  const handleEnhanceMessage = async () => {
    if (!message.trim()) {
      toast.error('Please type a message first');
      return;
    }

    try {
      const result = await enhanceMessageMutation.mutateAsync({
        userId,
        message: message.trim(),
        tenantId,
      });

      if (result.enhanced_message && result.enhanced_message !== message) {
        setMessage(result.enhanced_message);
        
        // Show what was enhanced
        const enhancements = [];
        if (result.enhancements.added_personalization) enhancements.push('personalization');
        if (result.enhancements.added_context) enhancements.push('context');
        if (result.enhancements.used_rag_knowledge) enhancements.push('knowledge base');
        
        const enhancementText = enhancements.length > 0 
          ? `Added: ${enhancements.join(', ')}`
          : 'Message enhanced';

        toast.success('Message enhanced!', {
          description: enhancementText,
          icon: <Sparkles className="h-4 w-4 text-purple-500" />,
        });
      } else {
        toast.info('Message looks good as is!', {
          description: 'No enhancements needed',
        });
      }
    } catch (error) {
      toast.error('Failed to enhance message');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-0">
        {/* Enhanced Header with gradient */}
        <DialogHeader className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Send Message to {contactName}</h2>
              <p className="text-xs text-gray-600 font-normal mt-0.5 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                WhatsApp: {phoneNumber}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Conversation Context Section */}
          {userId && (
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setShowContext(!showContext)}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm text-blue-900">
                    Conversation Context
                    {(summaryData?.message_count ?? 0) > 0 && (
                      <span className="ml-2 text-xs text-blue-600">
                        ({summaryData?.message_count} messages)
                      </span>
                    )}
                  </span>
                </div>
                {showContext ? (
                  <ChevronUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                )}
              </button>

              {showContext && (
                <div className="p-4 bg-white border-t">
                  {isLoadingSummary ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Loading conversation summary...</span>
                    </div>
                  ) : summaryError ? (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Failed to load summary</span>
                    </div>
                  ) : !summaryData || !summaryData.has_conversations ? (
                    <div className="text-center py-6">
                      <MessageCircle className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">No conversation history available yet.</p>
                      <p className="text-xs text-gray-500 mb-4">Start by sending your first message!</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRefreshSummary}
                        disabled={generateSummaryMutation.isPending}
                        className="mt-2"
                      >
                        {generateSummaryMutation.isPending ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Generating Summary...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Generate Summary
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">AI Summary</span>
                          {needsRefresh && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              Outdated
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleRefreshSummary}
                          disabled={generateSummaryMutation.isPending}
                          className="h-7 px-2 text-xs"
                        >
                          {generateSummaryMutation.isPending ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Refreshing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Refresh
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {summaryData.summary}
                      </div>

                      {summaryData.generated_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Updated: {new Date(summaryData.generated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Suggestions Section - Enhanced UI/UX */}
          {showSuggestions && userId && (
            <div className="border-2 border-purple-200 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              {/* Header with gradient and better spacing */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm border-b-2 border-purple-200/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-purple-900 block">
                      AI-Suggested Messages
                    </span>
                    {suggestionsData?.context_used && (
                      <span className="text-xs text-purple-700 font-medium">
                        ✨ {suggestionsData.context_used.message_count} messages analyzed
                        {suggestionsData.context_used.rag_docs_found > 0 && ` • ${suggestionsData.context_used.rag_docs_found} docs`}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefreshSuggestions}
                  disabled={refreshSuggestionsMutation.isPending}
                  className="h-8 px-3 text-xs font-medium hover:bg-white/80 transition-all duration-200 hover:shadow-sm"
                >
                  {refreshSuggestionsMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 space-y-3">
                {loadingSuggestions ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      <Sparkles className="h-4 w-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium mt-3">Generating AI suggestions...</span>
                    <span className="text-xs text-gray-500 mt-1">Analyzing conversation context</span>
                  </div>
                ) : suggestionsError ? (
                  <div className="text-center py-6 bg-red-50/50 rounded-lg border border-red-100">
                    <AlertCircle className="h-7 w-7 mx-auto text-red-400 mb-2" />
                    <p className="text-sm text-gray-700 font-medium">Unable to load suggestions</p>
                    <p className="text-xs text-gray-500 mt-1">Please try refreshing</p>
                  </div>
                ) : suggestionsData?.suggestions && suggestionsData.suggestions.length > 0 ? (
                  suggestionsData.suggestions.map((suggestion, idx) => {
                    // Determine icon based on suggestion index/type
                    const suggestionIcons = [
                      <MessageCircle key="icon" className="h-4 w-4 text-blue-500" />,
                      <Send key="icon" className="h-4 w-4 text-green-500" />,
                      <CheckCircle2 key="icon" className="h-4 w-4 text-purple-500" />
                    ];
                    
                    return (
                      <div
                        key={idx}
                        className="group relative p-4 bg-white rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                        onClick={() => handleUseSuggestion(suggestion.message)}
                      >
                        {/* Suggestion Type Badge */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-1.5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                            {suggestionIcons[idx] || suggestionIcons[0]}
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed font-medium flex-1">
                            {suggestion.message}
                          </p>
                        </div>
                        
                        {/* Reasoning with better styling */}
                        <div className="flex items-start gap-2 mb-3 pl-11">
                          <div className="flex-1 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <span className="font-medium text-gray-500">Why this works: </span>
                            {suggestion.reasoning}
                          </div>
                        </div>
                        
                        {/* Confidence bar with percentage */}
                        {suggestion.confidence && (
                          <div className="flex items-center gap-3 pl-11">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-500">Confidence</span>
                                <span className="text-xs font-bold text-purple-600">
                                  {Math.round(suggestion.confidence * 100)}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${suggestion.confidence * 100}%` }}
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUseSuggestion(suggestion.message);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 px-4 text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg"
                            >
                              <Send className="h-3 w-3 mr-1.5" />
                              Use This
                            </Button>
                          </div>
                        )}
                        
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/5 group-hover:to-pink-400/5 pointer-events-none transition-all duration-300" />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="relative inline-block mb-3">
                      <Sparkles className="h-10 w-10 mx-auto text-gray-300" />
                      <MessageCircle className="h-5 w-5 text-gray-400 absolute -bottom-1 -right-1" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1">No suggestions available yet</p>
                    <p className="text-xs text-gray-500">
                      AI will generate personalized suggestions based on conversation history
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Input Section - Enhanced UI/UX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="message" className="text-sm font-semibold text-gray-700">
                Your Message
              </label>
              {message.trim() && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  {message.length} characters
                </span>
              )}
            </div>
            <div className="relative group/textarea">
              <Textarea
                id="message"
                placeholder="Type your message here... (Click ✨ to enhance with AI)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none pr-14 border-2 focus:border-purple-300 focus:ring-purple-200 transition-all duration-200"
                disabled={sendMessageMutation.isPending}
              />
              {/* AI Enhancement Button - More Prominent */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Button
                  size="sm"
                  variant={message.trim() ? "default" : "ghost"}
                  className={`h-9 w-9 p-0 rounded-lg shadow-md transition-all duration-200 ${
                    message.trim() 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-lg hover:scale-110' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleEnhanceMessage}
                  disabled={!message.trim() || enhanceMessageMutation.isPending}
                  title={message.trim() ? "✨ Enhance with AI - Add context & personalization" : "Type a message first to enhance it"}
                >
                  {enhanceMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className={`h-4 w-4 ${message.trim() ? 'animate-pulse' : ''}`} />
                  )}
                </Button>
                {message.trim() && !enhanceMessageMutation.isPending && (
                  <span className="text-[9px] text-center font-bold text-purple-600 leading-none animate-bounce">
                    AI
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Tip: Type a message and click ✨ to enhance it with AI
              </span>
              {!message.trim() && (
                <span className="text-gray-400">Start typing...</span>
              )}
            </div>
          </div>

          {sendMessageMutation.error && (
            <div className="rounded-xl bg-red-50 p-4 border-2 border-red-200 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Failed to send message</p>
                <p className="text-xs text-red-600 mt-1">
                  {sendMessageMutation.error instanceof Error 
                    ? sendMessageMutation.error.message 
                    : 'An error occurred. Please try again.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 px-6 py-4 border-t-2 bg-gray-50/50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={sendMessageMutation.isPending}
            className="flex-1 h-11 font-medium hover:bg-gray-50 transition-all duration-200 border-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="flex-1 h-11 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMessageMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

