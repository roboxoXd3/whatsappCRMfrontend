'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/conversations/conversation-list';
import { ConversationDetail } from '@/components/conversations/conversation-detail';
import { NewConversationModal } from '@/components/conversations/new-conversation-modal';
import { Conversation } from '@/lib/types/api';
import { useConversations } from '@/hooks/useConversations';

function ConversationsContent() {
  const searchParams = useSearchParams();
  const targetConversationId = searchParams.get('conversation');
  const targetPhone = searchParams.get('phone');
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showLeadAnalysis, setShowLeadAnalysis] = useState(false);
  
  // Fetch conversations to enable auto-selection
  const { data: conversationsData } = useConversations();
  
  // Auto-select conversation from URL parameter (by ID or phone number)
  useEffect(() => {
    if (conversationsData?.data && !selectedConversation) {
      let targetConversation = null;
      
      // Try to find by conversation ID first
      if (targetConversationId) {
        targetConversation = conversationsData.data.find(
          (conv: Conversation) => conv.id === targetConversationId
        );
      }
      
      // If not found, try to find by phone number
      if (!targetConversation && targetPhone) {
        targetConversation = conversationsData.data.find(
          (conv: Conversation) => {
            const contactPhone = conv.contact?.phone_number || '';
            // Remove any non-numeric characters for comparison
            const normalizedContactPhone = contactPhone.replace(/\D/g, '');
            const normalizedTargetPhone = targetPhone.replace(/\D/g, '');
            return normalizedContactPhone.includes(normalizedTargetPhone) || 
                   normalizedTargetPhone.includes(normalizedContactPhone);
          }
        );
      }
      
      if (targetConversation) {
        setSelectedConversation(targetConversation);
      }
    }
  }, [targetConversationId, targetPhone, conversationsData, selectedConversation]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    setIsNewConversationModalOpen(true);
  };

  const handleCloseNewConversationModal = () => {
    setIsNewConversationModalOpen(false);
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsNewConversationModalOpen(false);
  };

  // Separate functions for better control
  const openContactInfo = () => {
    console.log('openContactInfo called');
    if (showLeadAnalysis) {
      setShowLeadAnalysis(false);
    }
    setShowContactInfo(true);
  };

  const closeContactInfo = () => {
    console.log('closeContactInfo called');
    setShowContactInfo(false);
  };

  const toggleContactInfo = () => {
    console.log('toggleContactInfo called, current state:', showContactInfo);
    if (showContactInfo) {
      closeContactInfo();
    } else {
      openContactInfo();
    }
  };

  const toggleLeadAnalysis = () => {
    if (showContactInfo) {
      // If contact info is open, close it and open lead analysis
      setShowContactInfo(false);
      setShowLeadAnalysis(true);
    } else {
      // Otherwise just toggle lead analysis
      setShowLeadAnalysis(!showLeadAnalysis);
    }
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
      {/* Mobile: Full screen conversation list or chat */}
      {/* Desktop: Side-by-side layout */}
      
      {/* Left Panel - Conversations List */}
      <div className={`
        ${selectedConversation ? 'hidden lg:flex' : 'flex'} 
        w-full lg:w-[420px] xl:w-[450px] 2xl:w-[480px]
        bg-white 
        flex-col
        transition-all duration-200 ease-out
      `}>
        {/* WhatsApp-style Header */}
        <div className="bg-[#008069] text-white px-6 py-5 flex items-center justify-between border-b border-[#006d5b]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#008069]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.690"/>
              </svg>
            </div>
            <h1 className="text-[19px] font-semibold">Conversations</h1>
          </div>
        </div>
        
        <ConversationList
          selectedConversationId={selectedConversation?.id}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Center Panel - Chat Area */}
      <div className={`
        ${selectedConversation ? 'flex' : 'hidden lg:flex'} 
        flex-1 
        flex-col 
        bg-[#efeae2]
      `}>
        {selectedConversation ? (
          <ConversationDetail
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            onOpenContactInfo={openContactInfo}
            onCloseContactInfo={closeContactInfo}
            showContactInfo={showContactInfo}
            onToggleLeadAnalysis={toggleLeadAnalysis}
            showLeadAnalysis={showLeadAnalysis}
          />
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-[440px] px-8">
              {/* Illustration */}
              <div className="w-80 h-80 mx-auto mb-10 opacity-10">
                <svg viewBox="0 0 303 172" className="w-full h-full">
                  <g fill="none" fillRule="evenodd">
                    <g transform="translate(61.000000, 24.000000)">
                      <rect width="182" height="124" fill="#d1d7db" rx="27"/>
                      <rect width="158" height="93" x="12" y="15" fill="#FFF" rx="12"/>
                      <rect width="136" height="4" x="23" y="30" fill="#b3b3b3" rx="2"/>
                      <rect width="136" height="4" x="23" y="39" fill="#b3b3b3" rx="2"/>
                      <rect width="97" height="4" x="23" y="48" fill="#b3b3b3" rx="2"/>
                      <rect width="124" height="4" x="23" y="66" fill="#b3b3b3" rx="2"/>
                      <rect width="136" height="4" x="23" y="75" fill="#b3b3b3" rx="2"/>
                      <rect width="65" height="4" x="23" y="84" fill="#b3b3b3" rx="2"/>
                    </g>
                    <g transform="translate(0.000000, 0.000000)">
                      <rect width="182" height="124" fill="#d1d7db" rx="27"/>
                      <rect width="158" height="93" x="12" y="15" fill="#FFF" rx="12"/>
                      <rect width="136" height="4" x="23" y="30" fill="#b3b3b3" rx="2"/>
                      <rect width="136" height="4" x="23" y="39" fill="#b3b3b3" rx="2"/>
                      <rect width="97" height="4" x="23" y="48" fill="#b3b3b3" rx="2"/>
                      <rect width="124" height="4" x="23" y="66" fill="#b3b3b3" rx="2"/>
                      <rect width="136" height="4" x="23" y="75" fill="#b3b3b3" rx="2"/>
                      <rect width="65" height="4" x="23" y="84" fill="#b3b3b3" rx="2"/>
                    </g>
                    <g transform="translate(121.000000, 48.000000)">
                      <rect width="182" height="124" fill="#d1d7db" rx="27"/>
                      <rect width="158" height="93" x="12" y="15" fill="#FFF" rx="12"/>
                      <rect width="136" height="4" x="23" y="30" fill="#b3b3b3" rx="2"/>
                      <rect width="136" height="4" x="23" y="39" fill="#b3b3b3" rx="2"/>
                      <rect width="97" height="4" x="23" y="48" fill="#b3b3b3" rx="2"/>
                      <rect width="124" height="4" x="23" y="66" fill="#b3b3b3" rx="2"/>
                      <rect width="136" height="4" x="23" y="75" fill="#b3b3b3" rx="2"/>
                      <rect width="65" height="4" x="23" y="84" fill="#b3b3b3" rx="2"/>
                    </g>
                  </g>
                </svg>
              </div>
              
              <h3 className="text-[32px] font-light text-[#41525d] mb-4">
                WhatsApp CRM
              </h3>
              
              <p className="text-[#667781] text-[14px] leading-[20px] mb-8">
                Send and receive messages without keeping your phone online.<br />
                Select a conversation to start chatting.
              </p>
              
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#fff9ef] border border-[#e3d3bf] rounded-lg text-[13px] text-[#54656f]">
                <svg viewBox="0 0 10 12" className="w-3 h-3 fill-current flex-shrink-0">
                  <path d="M5 0C3.346 0 2 1.346 2 3v1H1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8V3c0-1.654-1.346-3-3-3zM5 1c1.103 0 2 .897 2 2v1H3V3c0-1.103.897-2 2-2z"/>
                </svg>
                <span>Your messages are end-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={handleCloseNewConversationModal}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
        <div className="w-[420px] bg-white flex flex-col">
          <div className="bg-[#008069] text-white px-6 py-5 flex items-center gap-4 border-b border-[#006d5b]">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#008069]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.690"/>
              </svg>
            </div>
            <h1 className="text-[19px] font-semibold">Loading...</h1>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069] mx-auto mb-4"></div>
              <p className="text-[#667781] text-sm">Loading conversations...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#efeae2]">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 opacity-20">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-[#54656f]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.690"/>
              </svg>
            </div>
            <p className="text-[#667781] text-sm">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    }>
      <ConversationsContent />
    </Suspense>
  );
} 