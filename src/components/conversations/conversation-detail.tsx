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
  onOpenContactInfo?: () => void;
  onCloseContactInfo?: () => void;
  showContactInfo?: boolean;
  onToggleLeadAnalysis?: () => void;
  showLeadAnalysis?: boolean;
  className?: string;
}

export function ConversationDetail({ 
  conversation, 
  onBack,
  onOpenContactInfo,
  onCloseContactInfo,
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
  
  // Debug: Log contact information
  console.log('🔍 Conversation contact:', contact);
  
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
      // IMPORTANT: Use the exact phone number format from the contact in this conversation
      // Do NOT normalize or modify it - the backend will handle routing correctly
      const phoneNumber = contact.phone_number
        .replace('@s.whatsapp.net', '')
        .replace('_s_whatsapp_net', '')
        .replace('@c.us', '')
        .trim();
      
      console.log('📤 Sending message');
      console.log('   Conversation ID:', conversation.id);
      console.log('   Phone number:', phoneNumber);
      console.log('   Message:', message);
      
      const response = await sendMessageMutation.mutateAsync({
        phone_number: phoneNumber,
        message: message.trim(),
      });
      
      if (response.status === 'success') {
        // Clear input
        setMessage('');
        
        // Show success message
        console.log('Message sent successfully:', response);
        
        // Small delay to ensure database consistency before refetching
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Wait for refetch to complete before scrolling
        await refetch();
        
        // Auto-scroll to bottom after messages have loaded
        setTimeout(() => scrollToBottom(true), 300);
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
    <div 
      className={cn("relative flex h-full bg-white overflow-hidden", className)}
      onClick={(e) => {
        // Prevent any stray clicks from propagating
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
    >
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

      {/* Main Chat Area - Width adjusts when contact info is shown on desktop */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-out",
        showContactInfo && !showLeadAnalysis && "lg:mr-[400px] xl:mr-[420px]"
      )}>
        {/* Chat Header - Enhanced mobile responsiveness */}
        <div className="bg-[#f0f2f5] border-b border-gray-200 px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-3">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
            {onBack && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 hover:bg-gray-200 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            )}
            <div 
              className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 cursor-pointer hover:bg-[#f5f6f6] -mx-2 px-2 py-1 rounded-lg transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Contact name clicked - opening contact info');
                onOpenContactInfo?.();
              }}
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm sm:text-lg font-medium text-gray-600 overflow-hidden flex-shrink-0">
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
              <div className="min-w-0 flex-1">
                <h2 className="font-medium text-[#111b21] truncate text-sm sm:text-base lg:text-sm">
                  {contact.verified_name || contact.name || 'Unknown Contact'}
                  {contact.is_business_account && (
                    <span className="ml-1 sm:ml-2 text-xs bg-green-100 text-green-700 px-1 sm:px-1.5 py-0.5 rounded">
                      Business
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-xs text-[#667781]">
                  <span className="truncate">{formatPhoneNumber(contact.phone_number)}</span>
                  {contact.company && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate hidden sm:inline">{contact.company}</span>
                    </>
                  )}
                  {contact.lead_status && (
                    <>
                      <span className="hidden md:inline">•</span>
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200 hidden md:inline-flex">
                        {contact.lead_status}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
                      <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 flex-shrink-0">
              <BotToggle 
                conversationId={conversation.id}
                variant="compact"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 sm:h-10 sm:w-10 text-[#54656f] hover:bg-[#f5f6f6] transition-all duration-200 ${
                  showLeadAnalysis 
                    ? 'bg-purple-100 text-purple-600 border-2 border-purple-300 shadow-md' 
                    : 'hover:bg-purple-50'
                }`}
                title="AI Lead Analysis"
                onClick={onToggleLeadAnalysis}
              >
                <Brain className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${showLeadAnalysis ? 'animate-pulse' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative h-8 w-8 sm:h-10 sm:w-10 text-[#54656f] hover:bg-[#f5f6f6] ${hasNewMessages ? 'bg-green-100 text-green-600' : ''}`}
                title={hasNewMessages ? "New messages available - Click to refresh" : "Refresh Messages"}
                onClick={() => {
                  refetch();
                  setHasNewMessages(false);
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${isLoading ? 'animate-spin' : ''}`} />
                {hasNewMessages && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 sm:h-10 sm:w-10 text-[#54656f] hover:bg-[#f5f6f6]" 
                title="Delivery Statistics"
                onClick={() => setShowDeliveryStats(!showDeliveryStats)}
              >
                <BarChart3 className="h-3 w-3 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]" title="Call">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]" title="Video Call">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex h-10 w-10 text-[#54656f] hover:bg-[#f5f6f6]" title="More">
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

        {/* Messages Area - Enhanced mobile responsiveness */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 px-2 py-2 sm:px-4 sm:py-4 lg:p-4 overflow-y-auto overflow-x-hidden bg-[#efeae2] scrollbar-thin" 
          style={{backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJhIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDEyKSI+CiAgICAgIDxwYXRoIGQ9Im0wIDBoMzAwdjMwMGgtMzAweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDIiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPgo8L3N2Zz4=')"}}>
          <div className="w-full max-w-[calc(100vw-1rem)] sm:max-w-4xl lg:max-w-4xl lg:mx-auto space-y-2 sm:space-y-3 lg:space-y-2">
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
                      status: msg.status || 'sent'
                    }}
                    className=""
                    showDetailedStatus={false}
                  />
                ))}
                {/* Invisible div for scroll targeting */}
                <div ref={messagesEndRef} className="h-1" />
                
                {/* Scroll to bottom button when new messages arrive - Mobile optimized */}
                {hasNewMessages && isUserScrolling && (
                  <div className="absolute bottom-16 sm:bottom-20 right-2 sm:right-4 z-10">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white shadow-lg text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      onClick={() => {
                        scrollToBottom(true);
                        setHasNewMessages(false);
                      }}
                    >
                      <span className="hidden sm:inline">New messages ↓</span>
                      <span className="sm:hidden">↓</span>
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

        {/* Message Input - Enhanced mobile responsiveness */}
        <div className="bg-[#f0f2f5] px-2 py-2.5 sm:px-3 sm:py-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 w-full max-w-full">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 sm:h-10 sm:w-10 lg:h-10 lg:w-10 text-[#54656f] hover:bg-[#f5f6f6] flex-shrink-0 rounded-full"
            >
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5" />
            </Button>
            
            <div className="flex-1 flex items-center bg-white rounded-2xl border border-gray-200 min-h-[40px] sm:min-h-[44px] lg:min-h-[40px] overflow-hidden min-w-0">
              <Input
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm sm:text-base lg:text-sm h-9 sm:h-11 lg:h-9 px-3 sm:px-4 min-w-0"
                disabled={sendMessageMutation.isPending}
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 sm:h-9 sm:w-9 lg:h-8 lg:w-8 text-[#54656f] hover:bg-[#f5f6f6] flex-shrink-0 rounded-full mr-1 sm:mr-1.5"
              >
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 lg:h-10 lg:w-10 bg-[#00a884] hover:bg-[#00a884]/90 text-white flex-shrink-0 rounded-full"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4" />
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

      {/* Contact Info Sidebar - Slides in from right (WhatsApp style) */}
      {showContactInfo && !showLeadAnalysis && (
        <>
          {/* Mobile Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Mobile backdrop clicked - closing');
              onCloseContactInfo?.();
            }}
          />
          
          {/* Contact Info Panel - Fixed positioning to avoid parent overflow clipping */}
          <div 
            className={cn(
              // Use fixed positioning for both mobile and desktop to avoid overflow-hidden clipping
              "fixed top-0 right-0 bottom-0 z-50",
              // Width: Full on mobile, fixed on desktop
              "w-full lg:w-[400px] xl:w-[420px]",
              // Styling
              "bg-white shadow-2xl",
              // Animation - slide in from right
              "transition-transform duration-300 ease-out",
              showContactInfo ? "translate-x-0" : "translate-x-full"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Contact panel clicked - preventing propagation');
            }}
          >
            <ContactInfoPanel 
              conversation={conversation}
              onClose={() => {
                console.log('Close button clicked - closing contact info');
                onCloseContactInfo?.();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
} 
// update