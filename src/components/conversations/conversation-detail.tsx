'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Send,
  Paperclip,
  Smile,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { CustomerContextCard } from './customer-context-card';
import { BotToggle } from './bot-toggle';
import { MessageBubble } from './message-bubble';
import { useConversationDetail } from '@/hooks/useConversationDetail';
import { useSendMessage } from '@/hooks/useConversations';
import { Conversation } from '@/lib/types/api';
import { cn } from '@/lib/utils';

interface ConversationDetailProps {
  conversation: Conversation;
  onBack?: () => void;
  className?: string;
}

export function ConversationDetail({ 
  conversation, 
  onBack,
  className 
}: ConversationDetailProps) {
  const [message, setMessage] = useState('');
  const [showCustomerInfo, setShowCustomerInfo] = useState(true);

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
    <div className={cn("flex h-full bg-gray-50", className)}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <Card className="rounded-none border-x-0 border-t-0 shadow-sm bg-white">
          <CardHeader className="py-5 px-8 border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-6 min-w-0">
              {onBack && (
                <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-5 min-w-0">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center shadow text-2xl font-bold text-blue-700">
                  {contact.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-xl text-gray-900 truncate">{contact.name || 'Unknown Contact'}</h2>
                  <div className="flex items-center gap-3 flex-wrap mt-1">
                    <span className="text-gray-500 text-sm truncate">{formatPhoneNumber(contact.phone_number)}</span>
                    {contact.company && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-blue-700 font-medium text-sm truncate">{contact.company}</span>
                      </>
                    )}
                    {contact.lead_status && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border-blue-200">
                        {contact.lead_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BotToggle 
                conversationId={conversation.id}
                phoneNumber={contact.phone_number}
                contactName={contact.name}
                variant="compact"
              />
              <Button variant="ghost" size="icon" title="Call">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Video Call">
                <Video className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                title="Show Customer Info"
                onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              >
                <Info className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" title="More">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
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
            ) : conversationDetail?.messages && conversationDetail.messages.length > 0 ? (
              <>
                {conversationDetail.messages.map((msg, index) => (
                  <MessageBubble 
                    key={`${msg.timestamp}-${index}`} 
                    message={msg}
                    className="mb-4"
                  />
                ))}
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
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                size="sm"
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
          </CardContent>
        </Card>
      </div>

      {/* Customer Info Sidebar */}
      {showCustomerInfo && (
        <>
          <div className="w-px bg-gray-200"></div>
          <aside className="bg-gray-50 border-l flex flex-col overflow-y-auto items-center py-10 px-6 pr-12" style={{ minWidth: 320, maxWidth: 420 }}>
            <div className="w-full flex flex-col items-center gap-8">
              <CustomerContextCard 
                phoneNumber={contact.phone_number}
                enrichedContact={contact}
                className="border-0 shadow-lg mb-10 max-w-[380px] w-full mx-auto rounded-2xl bg-white py-8 px-8"
              />
              <Card className="bg-white rounded-2xl shadow-lg border-0 w-full max-w-[380px] mx-auto mb-10 py-8 px-8">
                <CardHeader className="pb-2 px-0">
                  <h3 className="font-bold text-lg text-gray-800">Conversation Stats</h3>
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-500">Total Messages</span>
                    <span className="font-semibold text-gray-900">
                      {conversationDetail?.messages?.length || conversation.message_count}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-500">Status</span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 rounded">
                      {conversation.status}
                    </Badge>
                  </div>
                  {conversationDetail?.last_message_at && (
                    <div className="flex justify-between text-base">
                      <span className="text-gray-500">Last Activity</span>
                      <span className="font-medium text-xs text-gray-700">
                        {new Date(conversationDetail.last_message_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base">
                    <span className="text-gray-500">Last Activity</span>
                    <span className="text-xs text-gray-400">
                      {new Date(conversation.last_message_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
              {conversation.tags && conversation.tags.length > 0 && (
                <Card className="bg-white rounded-2xl shadow-lg border-0 w-full max-w-[380px] mx-auto py-8 px-8">
                  <CardHeader className="pb-2 px-0">
                    <h3 className="font-bold text-lg text-gray-800">Tags</h3>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="flex flex-wrap gap-2">
                      {conversation.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 rounded">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
} 