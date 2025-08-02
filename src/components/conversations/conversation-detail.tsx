'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Send,
  Paperclip,
  Smile,
  Loader2,
  BarChart3,
  User,
  Bot,
  RefreshCw,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { BotToggle } from './bot-toggle';
import { MessageBubble } from './message-bubble';
import { DeliveryStatsPanel } from './delivery-stats-panel';
import { useConversationDetail } from '@/hooks/useConversationDetail';
import { useSendMessage } from '@/hooks/useConversations';
import { Conversation } from '@/lib/types/api';
import { cn } from '@/lib/utils';
import { ContactInfoPanel } from './contact-info-panel';
import LeadQualificationPanel from './lead-qualification-panel';
import FloatingLeadAnalysis from './floating-lead-analysis';

interface ConversationDetailProps {
  conversation: Conversation;
  onBack?: () => void;
  onToggleContactInfo?: () => void;
  showContactInfo?: boolean;
  onToggleLeadAnalysis?: () => void;
  showLeadAnalysis?: boolean;
  className?: string;
}

export function ConversationDetail({ 
  conversation, 
  onBack,
  onToggleContactInfo,
  showContactInfo,
  onToggleLeadAnalysis,
  showLeadAnalysis,
  className 
}: ConversationDetailProps) {
  const [message, setMessage] = useState('');
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showDeliveryStats, setShowDeliveryStats] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { contact } = conversation;
  
  // Fetch conversation details with messages
  const { 
    data: conversationDetail, 
    isLoading, 
    error,
    refetch 
  } = useConversationDetail(conversation.id);

  // Message sending mutation
  const sendMessageMutation = useSendMessage();

  // Scroll management functions
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'instant',
        block: 'end' 
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if user is near the bottom (within 100px)
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Update scrolling state
    setIsUserScrolling(!isNearBottom);
  };

  // Auto-scroll effects
  useEffect(() => {
    // Scroll to bottom when conversation changes or messages load
    if (conversationDetail?.data?.messages && conversationDetail.data.messages.length > 0) {
      // Use timeout to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom(!isUserScrolling); // Smooth scroll only if user isn't manually scrolling
      }, 100);
    }
  }, [conversationDetail?.data?.messages?.length, conversation.id]);

  useEffect(() => {
    // Detect new messages and handle scrolling
    if (conversationDetail?.data?.messages) {
      const currentMessageCount = conversationDetail.data.messages.length;
      
      // Check if we have new messages
      if (lastMessageCount > 0 && currentMessageCount > lastMessageCount) {
        setHasNewMessages(true);
        
        // Auto-scroll to bottom if user is not scrolling and is near bottom
        if (!isUserScrolling) {
          scrollToBottom(true);
          setHasNewMessages(false); // Clear indicator since we're scrolling to new messages
        }
      }
      
      setLastMessageCount(currentMessageCount);
    }
  }, [conversationDetail?.data?.messages, isUserScrolling, lastMessageCount]);

  const handleSendMessage = async () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    try {
      // Clean phone number format for API
      const cleanPhone = contact.phone_number.replace('_s_whatsapp_net', '');
      
      console.log('Sending message to:', cleanPhone);
      console.log('Message content:', message);
      
      const response = await sendMessageMutation.mutateAsync({
        phone_number: cleanPhone,
        message: message.trim(),
      });
      
      if (response.status === 'success') {
        // Clear input and refresh conversation
        setMessage('');
        refetch();
        
        // Auto-scroll to bottom after sending message
        setTimeout(() => scrollToBottom(true), 200);
        
        // Show success message
        console.log('Message sent successfully:', response);
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error message will be shown by the mutation error state
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('91') && phone.length > 10) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className={cn("flex h-full bg-white", className)}>
      {/* Floating Lead Analysis - Fixed positioning for better UX */}
      {showLeadAnalysis && (
        <FloatingLeadAnalysis
          conversation={conversation}
          onClose={() => {
            console.log('Floating lead analysis closed');
            onToggleLeadAnalysis?.();
          }}
          onScheduleCall={() => {
            console.log('Sending Calendly link to qualified lead');
            alert('Calendly link would be sent to qualified lead!');
          }}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600 overflow-hidden">
                {contact.profile_image_url ? (
                  <img 
                    src={contact.profile_image_url} 
                    alt={contact.verified_name || contact.name || 'Contact'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(contact.verified_name || contact.name)?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-medium text-[#111b21] truncate">
                  {contact.verified_name || contact.name || 'Unknown Contact'}
                  {contact.is_business_account && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      Business
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#667781]">
                  <span className="truncate">{formatPhoneNumber(contact.phone_number)}</span>
                  {contact.company && (
                    <>
                      <span>•</span>
                      <span className="truncate">{contact.company}</span>
                    </>
                  )}
                  {contact.lead_status && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                        {contact.lead_status}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
                      <div className="flex items-center gap-2">
              <BotToggle 
                conversationId={conversation.id}
                variant="compact"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6] transition-all duration-200 ${
                  showLeadAnalysis 
                    ? 'bg-purple-100 text-purple-600 border-2 border-purple-300 shadow-md' 
                    : 'hover:bg-purple-50'
                }`}
                title="AI Lead Analysis"
                onClick={onToggleLeadAnalysis}
              >
                <Brain className={`h-5 w-5 ${showLeadAnalysis ? 'animate-pulse' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6] ${hasNewMessages ? 'bg-green-100 text-green-600' : ''}`}
                title={hasNewMessages ? "New messages available - Click to refresh" : "Refresh Messages"}
                onClick={() => {
                  refetch();
                  setHasNewMessages(false);
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                {hasNewMessages && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]" 
                title="Delivery Statistics"
                onClick={() => setShowDeliveryStats(!showDeliveryStats)}
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]" title="Call">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]" title="Video Call">
              <Video className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]"
              title="Show Customer Info"
              onClick={onToggleContactInfo}
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]" title="More">
              <MoreVertical className="h-5 w-5" />
                          </Button>
            </div>
          </div>
          
          {/* Human Mode Indicator */}
          {conversation.bot_enabled === false && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Human Mode Active
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto h-6 px-2 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/bot/return-to-bot/${conversation.id}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            reason: 'Admin returned conversation to bot via UI',
                            send_notification: true
                          })
                        });
                        
                        if (response.ok) {
                          // Refresh the conversation to update bot status
                          refetch();
                        }
                      } catch (error) {
                        console.error('Failed to return to bot:', error);
                      }
                    }}
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Return to Bot
                  </Button>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Bot responses are disabled. A team member will respond shortly.
                </p>
              </div>
            </div>
          )}

          {/* Delivery Stats Panel (collapsible) */}
          {showDeliveryStats && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <DeliveryStatsPanel 
                conversationId={conversation.id}
                variant="compact"
                className="bg-white rounded-lg p-3 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 p-4 overflow-y-auto bg-[#efeae2] scrollbar-thin" 
          style={{backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJhIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDEyKSI+CiAgICAgIDxwYXRoIGQ9Im0wIDBoMzAwdjMwMGgtMzAweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDIiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPgo8L3N2Zz4=')"}}>
          <div className="max-w-4xl mx-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">Failed to load messages</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : conversationDetail?.data?.messages && conversationDetail.data.messages.length > 0 ? (
              <>
                {/* Debug: Log messages to console */}
                {console.log('📨 Conversation messages:', conversationDetail.data.messages)}
                {conversationDetail.data.messages.map((msg, index) => (
                  <MessageBubble 
                    key={msg.id || `${msg.timestamp}-${index}`} 
                    message={{
                      ...msg,
                      id: msg.id || `${msg.timestamp}-${index}`,
                      status: msg.status || 'sent',
                      message_id: undefined,
                      timestamps: undefined,
                      metadata: undefined
                    }}
                    className="mb-4"
                    showDetailedStatus={false}
                  />
                ))}
                {/* Invisible div for scroll targeting */}
                <div ref={messagesEndRef} className="h-1" />
                
                {/* Scroll to bottom button when new messages arrive */}
                {hasNewMessages && isUserScrolling && (
                  <div className="absolute bottom-20 right-4 z-10">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
                      onClick={() => {
                        scrollToBottom(true);
                        setHasNewMessages(false);
                      }}
                    >
                      New messages ↓
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No messages yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Start the conversation by sending a message
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-[#f0f2f5] p-4 border-t border-gray-200">
          {/* Quick Action: Request Human Support */}
          {conversation.bot_enabled !== false && (
            <div className="mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                onClick={() => setMessage("I need to talk to a human")}
              >
                <User className="h-3 w-3 mr-1" />
                Request Human Support
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]">
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 flex items-center bg-white rounded-lg border border-gray-200">
              <Input
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                disabled={sendMessageMutation.isPending}
              />
              
              <Button variant="ghost" size="icon" className="h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="icon"
              className="h-10 w-10 bg-[#00a884] hover:bg-[#00a884]/90 text-white"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Error message */}
          {sendMessageMutation.error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {sendMessageMutation.error instanceof Error 
                ? sendMessageMutation.error.message 
                : 'Failed to send message. Please try again.'
              }
            </div>
          )}
        </div>
      </div>

      {/* Contact Info Sidebar - Only show if Lead Analysis is not active */}
      {showContactInfo && !showLeadAnalysis && (
        <>
          <div className="w-px bg-gray-200"></div>
          <ContactInfoPanel 
            conversation={conversation}
            onClose={() => onToggleContactInfo?.()}
          />
        </>
      )}
    </div>
  );
} 